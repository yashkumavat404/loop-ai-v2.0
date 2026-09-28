import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { classifyFeedback } from "@/lib/ai";
import { createFeedbackEmbedding } from "@/lib/ai/embedding-store";
import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getAuthenticatedUser();

    requireRole(user, ["ADMIN", "ANALYST"]);

    const { id } = await context.params;

    /*
     * Find the feedback only inside the authenticated workspace.
     */
    const feedback = await db.feedback.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    /*
     * Run the feedback through the active AI provider.
     */
    const classification = await classifyFeedback(
      feedback.content,
      user.workspaceId,
    );

    /*
     * Resolve only themes belonging to the authenticated workspace.
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
     * Update the classification and replace the old theme
     * relationships in one database transaction.
     */
    const updatedFeedback = await db.$transaction(
      async (transaction) => {
        await transaction.feedbackTheme.deleteMany({
          where: {
            feedbackId: feedback.id,
          },
        });

        return transaction.feedback.update({
          where: {
            id: feedback.id,
          },
          data: {
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
      },
    );

    /*
     * Regenerate the semantic embedding for this feedback.
     *
     * The feedback content is unchanged during reclassification,
     * but regenerating the vector keeps the embedding record
     * synchronized with the current feedback record.
     *
     * createFeedbackEmbedding() also uses ON CONFLICT to update
     * an existing embedding instead of creating a duplicate.
     */
    await createFeedbackEmbedding(
      updatedFeedback.id,
      updatedFeedback.content,
    );

    return NextResponse.json({
      data: updatedFeedback,
    });
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

    console.error("Failed to reclassify feedback:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}