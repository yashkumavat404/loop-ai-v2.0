import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { classifyFeedback } from "@/lib/ai";
import { createFeedbackEmbedding } from "@/lib/ai/embedding-store";
import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";

const simulatedFeedback = [
  "I've been waiting several minutes for the checkout page to load.",
  "The support team resolved my issue quickly and professionally.",
  "I cannot find where to update my billing information.",
  "The mobile app became unresponsive while I was placing an order.",
  "It would be helpful to receive an email when my support ticket is updated.",
];

export async function POST() {
  try {
    const user = await getAuthenticatedUser();

    requireRole(user, ["ADMIN", "ANALYST"]);

    const content =
      simulatedFeedback[
        Math.floor(Math.random() * simulatedFeedback.length)
      ];

    /*
     * Classify the simulated feedback through the same
     * provider-independent AI layer used by other ingestion paths.
     */
    const classification = await classifyFeedback(
      content,
      user.workspaceId,
    );

    /*
     * Only use themes that already belong to the
     * authenticated user's workspace.
     */
    const existingThemes = await db.theme.findMany({
      where: {
        workspaceId: user.workspaceId,
        name: {
          in: classification.themes,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    /*
     * Create the feedback record first so we have
     * its ID for the embedding record.
     */
    const feedback = await db.feedback.create({
      data: {
        workspaceId: user.workspaceId,
        content,
        channel: "SUPPORT",
        sourceRef: `SIM-${Date.now()}`,
        customerLabel: "Simulated Customer",
        status: "NEW",
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        featureArea: classification.featureArea,

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

    /*
     * Generate and store the semantic embedding.
     *
     * Ask LOOP will later use this vector to retrieve
     * semantically relevant feedback.
     */
    await createFeedbackEmbedding(
      feedback.id,
      feedback.content,
    );

    return NextResponse.json(
      {
        data: feedback,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    console.error("Failed to simulate feedback:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}