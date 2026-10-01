import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { classifyFeedback } from "@/lib/ai";
import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import { createFeedbackEmbedding } from "@/lib/ai/embedding-store";
import { resolveWorkspaceThemes } from "@/lib/ai/theme-store";
import type { FeedbackClassification } from "@/lib/ai/schemas";

const createFeedbackSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  channel: z.enum([
    "WEB",
    "CSV",
    "EMAIL",
    "SUPPORT",
    "APP_STORE",
    "SURVEY",
  ]),
  sourceRef: z.string().trim().max(500).optional(),
  customerLabel: z.string().trim().max(200).optional(),
});

function fallbackClassification(content: string): FeedbackClassification {
  const text = content.toLowerCase();

  const negativeWords = [
    "error", "slow", "confusing", "difficult", "trouble", "problem",
    "issue", "could not", "cannot", "wrong", "failed", "failure", "long",
  ];
  const positiveWords = [
    "fast", "faster", "smooth", "easy", "excellent", "useful",
    "professional", "reliably", "works perfectly", "cleaner", "accurate",
    "quickly", "great",
  ];

  const negativeHits = negativeWords.filter((word) => text.includes(word)).length;
  const positiveHits = positiveWords.filter((word) => text.includes(word)).length;

  const sentiment =
    positiveHits > negativeHits
      ? "POSITIVE"
      : negativeHits > positiveHits
        ? "NEGATIVE"
        : "NEUTRAL";

  const sentimentScore =
    sentiment === "POSITIVE"
      ? Math.min(0.8, 0.25 + positiveHits * 0.1)
      : sentiment === "NEGATIVE"
        ? Math.max(-0.8, -0.25 - negativeHits * 0.1)
        : 0;

  let featureArea = "General";
  if (/search|filter|inbox|pagination/.test(text)) featureArea = "Search";
  else if (/dashboard|chart|metric|trend/.test(text)) featureArea = "Dashboard";
  else if (/upload|csv|import|spreadsheet/.test(text)) featureArea = "Data Import";
  else if (/login|onboarding|account|verification/.test(text)) featureArea = "Account";
  else if (/report|pdf|summary/.test(text)) featureArea = "Reporting";
  else if (/ai|classification|theme|ask loop/.test(text)) featureArea = "AI";
  else if (/support|notification/.test(text)) featureArea = "Support";
  else if (/mobile|screen size|dark mode|interface|navigation/.test(text)) featureArea = "UI/UX";
  else if (/load|performance|slow|fast|faster|network/.test(text)) featureArea = "Performance";

  return {
    sentiment,
    sentimentScore,
    themes: [featureArea],
    featureArea,
  };
}

const feedbackQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(200).optional(),

  channel: z
    .enum([
      "WEB",
      "CSV",
      "EMAIL",
      "SUPPORT",
      "APP_STORE",
      "SURVEY",
    ])
    .optional(),

  sentiment: z
    .enum(["POSITIVE", "NEUTRAL", "NEGATIVE"])
    .optional(),

  status: z
    .enum(["NEW", "REVIEWED", "ACTIONED"])
    .optional(),

  theme: z.string().trim().max(200).optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(request.url);

    const parsed = feedbackQuerySchema.safeParse({
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
      search: searchParams.get("search") || undefined,
      channel: searchParams.get("channel") || undefined,
      sentiment: searchParams.get("sentiment") || undefined,
      status: searchParams.get("status") || undefined,
      theme: searchParams.get("theme") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback query parameters",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      page,
      pageSize,
      search,
      channel,
      sentiment,
      status,
      theme,
    } = parsed.data;

    /**
     * Resolve the requested theme inside the authenticated
     * user's workspace.
     *
     * This prevents a user from using a theme name belonging
     * to another workspace.
     */
    let themeId: string | undefined;

    if (theme) {
      const selectedTheme = await db.theme.findFirst({
        where: {
          workspaceId: user.workspaceId,
          name: theme,
        },
        select: {
          id: true,
        },
      });

      /**
       * If the theme does not exist in this workspace,
       * return an empty result instead of falling back
       * to all feedback.
       */
      if (!selectedTheme) {
        return NextResponse.json({
          data: [],
          pagination: {
            page,
            pageSize,
            total: 0,
            totalPages: 0,
          },
        });
      }

      themeId = selectedTheme.id;
    }

    const where = {
      /**
       * Critical multi-tenant isolation.
       *
       * Every feedback query is restricted to the
       * authenticated user's workspace.
       */
      workspaceId: user.workspaceId,

      ...(search
        ? {
            OR: [
              {
                content: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                customerLabel: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                sourceRef: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),

      ...(channel ? { channel } : {}),

      ...(sentiment ? { sentiment } : {}),

      ...(status ? { status } : {}),

      /**
       * Filter through the FeedbackTheme join table
       * using the exact theme ID resolved above.
       */
      ...(themeId
        ? {
            themes: {
              some: {
                themeId,
              },
            },
          }
        : {}),
    };

    const [feedback, total] = await Promise.all([
      db.feedback.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          themes: {
            include: {
              theme: true,
            },
          },
        },
      }),

      db.feedback.count({
        where,
      }),
    ]);

    return NextResponse.json({
      data: feedback,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    console.error("Failed to fetch feedback:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    requireRole(user, ["ADMIN", "ANALYST"]);

    const body: unknown = await request.json();

    const parsed = createFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback data",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      content,
      channel,
      sourceRef,
      customerLabel,
    } = parsed.data;

    let classification: FeedbackClassification;

    try {
      classification = await classifyFeedback(
        content,
        user.workspaceId,
      );
    } catch (error) {
      console.error(
        "Manual AI classification failed; using resilient fallback:",
        error,
      );
      classification = fallbackClassification(content);
    }

    const existingThemes = await resolveWorkspaceThemes(
      user.workspaceId,
      classification.themes,
    );

    const feedback = await db.feedback.create({
      data: {
        workspaceId: user.workspaceId,
        content,
        channel,
        sourceRef,
        customerLabel,
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        featureArea: classification.featureArea,
        status: "NEW",

        themes: {
          create: existingThemes.map((theme) => ({
            themeId: theme.id,
          })),
        },
      },

      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    try {
      await createFeedbackEmbedding(
        feedback.id,
        feedback.content,
      );
    } catch (error) {
      console.error(
        "Manual feedback embedding failed; feedback retained:",
        error,
      );
    }

    return NextResponse.json(
      {
        data: feedback,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    console.error("Failed to create feedback:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}