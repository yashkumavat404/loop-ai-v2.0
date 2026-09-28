import { NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

const requestSchema = z.object({
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
});

const reportSchema = z.object({
  summary: z.string().min(1),
  topThemes: z.array(
    z.object({
      name: z.string(),
      count: z.number(),
    }),
  ),
  sentimentShifts: z.array(
    z.object({
      sentiment: z.string(),
      change: z.string(),
    }),
  ),
  quotes: z.array(
    z.object({
      feedbackId: z.string(),
      quote: z.string(),
    }),
  ),
  recommendedActions: z.array(z.string()),
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const reports = await db.report.findMany({
      where: {
        workspaceId: user.workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      reports.map((report) => {
        const content = report.content as {
          summary?: string;
          topThemes?: Array<{
            name: string;
            count: number;
          }>;
        };

        return {
          id: report.id,
          title: report.title,
          periodStart: report.periodStart,
          periodEnd: report.periodEnd,
          summary: content.summary ?? "",
          topThemes: content.topThemes ?? [],
          createdAt: report.createdAt,
        };
      }),
    );
  } catch (error) {
    console.error("Report fetch error:", error);

    const message =
      error instanceof Error ? error.message : "";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { message: "Failed to load reports." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (user.role === "VIEWER") {
      return NextResponse.json(
        { message: "Forbidden." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid report period." },
        { status: 400 },
      );
    }

    const periodStart = new Date(
      `${parsed.data.periodStart}T00:00:00.000`,
    );

    const periodEnd = new Date(
      `${parsed.data.periodEnd}T23:59:59.999`,
    );

    if (periodStart >= periodEnd) {
      return NextResponse.json(
        { message: "Invalid report period." },
        { status: 400 },
      );
    }

    const feedback = await db.feedback.findMany({
      where: {
        workspaceId: user.workspaceId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!feedback.length) {
      return NextResponse.json(
        { message: "No feedback found for this period." },
        { status: 400 },
      );
    }

    const themeCounts = new Map<string, number>();

    for (const item of feedback) {
      for (const relation of item.themes) {
        const name = relation.theme.name;

        themeCounts.set(
          name,
          (themeCounts.get(name) ?? 0) + 1,
        );
      }
    }

    const topThemes = Array.from(themeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count]) => ({
        name,
        count,
      }));

    const sentimentCounts = {
      POSITIVE: 0,
      NEUTRAL: 0,
      NEGATIVE: 0,
    };

    for (const item of feedback) {
      if (item.sentiment) {
        sentimentCounts[item.sentiment]++;
      }
    }

    const quotes = feedback
      .filter((item) => item.content.trim())
      .slice(0, 8)
      .map((item) => ({
        feedbackId: item.id,
        quote: item.content,
      }));

    const context = {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      totalFeedback: feedback.length,
      sentimentCounts,
      topThemes,
      quotes,
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: `
You are generating a Voice of Customer report for LOOP.

Use ONLY the supplied data.

Do not invent statistics, feedback, quotes, themes, or customer statements.

Return JSON only.

DATA:
${JSON.stringify(context, null, 2)}

Generate:
- A concise executive summary.
- The supplied top themes.
- Sentiment shifts based only on the supplied sentiment data.
- Select useful quotes only from the supplied quotes.
- Practical recommended actions grounded in the supplied feedback.

For quotes, use the exact feedbackId provided.
`,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",
          properties: {
            summary: {
              type: "string",
            },

            topThemes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  count: {
                    type: "number",
                  },
                },
                required: ["name", "count"],
              },
            },

            sentimentShifts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sentiment: {
                    type: "string",
                  },
                  change: {
                    type: "string",
                  },
                },
                required: ["sentiment", "change"],
              },
            },

            quotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  feedbackId: {
                    type: "string",
                  },
                  quote: {
                    type: "string",
                  },
                },
                required: ["feedbackId", "quote"],
              },
            },

            recommendedActions: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },

          required: [
            "summary",
            "topThemes",
            "sentimentShifts",
            "quotes",
            "recommendedActions",
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const aiReport = reportSchema.safeParse(
      JSON.parse(response.text),
    );

    if (!aiReport.success) {
      throw new Error("Invalid AI report response.");
    }

    const title =
      `Voice of Customer Report — ` +
      `${periodStart.toLocaleDateString()} to ` +
      `${periodEnd.toLocaleDateString()}`;

    const report = await db.report.create({
      data: {
        workspaceId: user.workspaceId,
        title,
        periodStart,
        periodEnd,
        content: aiReport.data,
      },
    });

    return NextResponse.json({
      id: report.id,
      title: report.title,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      summary: aiReport.data.summary,
      topThemes: aiReport.data.topThemes,
      sentimentShifts: aiReport.data.sentimentShifts,
      quotes: aiReport.data.quotes,
      recommendedActions: aiReport.data.recommendedActions,
      content: report.content,
      createdAt: report.createdAt,
    });
  } catch (error) {
    console.error("Report generation error:", error);

    const message =
      error instanceof Error ? error.message : "";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { message: "Failed to generate report." },
      { status: 500 },
    );
  }
}