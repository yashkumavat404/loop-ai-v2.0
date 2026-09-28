import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(
      startOfWeek.getDate() - startOfWeek.getDay(),
    );

    const [totalFeedback, negativeFeedback, newThisWeek] =
      await Promise.all([
        db.feedback.count({
          where: {
            workspaceId: user.workspaceId,
          },
        }),

        db.feedback.count({
          where: {
            workspaceId: user.workspaceId,
            sentiment: "NEGATIVE",
          },
        }),

        db.feedback.count({
          where: {
            workspaceId: user.workspaceId,
            createdAt: {
              gte: startOfWeek,
            },
          },
        }),
      ]);

    const negativePercent =
      totalFeedback === 0
        ? 0
        : Math.round(
            (negativeFeedback / totalFeedback) * 100,
          );

    return NextResponse.json({
      totalFeedback,
      negativePercent,
      newThisWeek,
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

    console.error(
      "Failed to fetch dashboard summary:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
