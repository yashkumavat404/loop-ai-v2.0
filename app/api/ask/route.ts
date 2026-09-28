import { NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { searchRelevantFeedback } from "@/lib/ai/search";

const requestSchema = z.object({
  question: z.string().trim().min(3).max(1000),
});

const answerSchema = z.object({
  answer: z.string().min(1),
  sourceIds: z.array(z.string()).max(8),
});

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
};

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid question." },
        { status: 400 },
      );
    }

    const { question } = parsed.data;

    const results = await searchRelevantFeedback(
      question,
      user.workspaceId,
      8,
    );

    if (!results.length) {
      return NextResponse.json({
        answer:
          "I could not find enough relevant feedback in your workspace to answer this question.",
        sources: [],
      });
    }

    const context = results
      .map(
        (item) => `
SOURCE_ID: ${item.id}
CONTENT: ${item.content}
CHANNEL: ${item.channel}
SENTIMENT: ${item.sentiment ?? "UNKNOWN"}
DATE: ${item.createdAt.toISOString()}
`,
      )
      .join("\n---\n");

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `
You are Ask LOOP, a customer-feedback intelligence assistant.

Answer the user's question using ONLY the feedback provided below.

Rules:
- Do not invent feedback, customers, statistics, or facts.
- Do not use outside knowledge.
- If the feedback does not contain enough evidence, say so clearly.
- Keep the answer concise and useful.
- Select the source IDs that directly support your answer.
- Return valid JSON only.

USER QUESTION:
${question}

FEEDBACK:
${context}
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            answer: {
              type: "string",
            },
            sourceIds: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: ["answer", "sourceIds"],
        },
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsedAnswer = answerSchema.safeParse(
      JSON.parse(rawText),
    );

    if (!parsedAnswer.success) {
      throw new Error("Invalid AI response.");
    }

    const validSourceIds = new Set(
      results.map((item) => item.id),
    );

    const sources = results
      .filter(
        (item) =>
          parsedAnswer.data.sourceIds.includes(item.id) &&
          validSourceIds.has(item.id),
      )
      .map((item) => ({
        id: item.id,
        text: item.content,
        channel: item.channel,
        sentiment: item.sentiment,
        createdAt: item.createdAt,
      }));

    return NextResponse.json({
      answer: parsedAnswer.data.answer,
      sources,
    });
  } catch (error) {
    console.error("Ask LOOP error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error.";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { message: "Failed to process Ask LOOP request." },
      { status: 500 },
    );
  }
}