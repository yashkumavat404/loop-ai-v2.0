import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const [positive, neutral, negative] = await Promise.all([
      db.feedback.count({
        where: {
          workspaceId: user.workspaceId,
          sentiment: "POSITIVE",
        },
      }),

      db.feedback.count({
        where: {
          workspaceId: user.workspaceId,
          sentiment: "NEUTRAL",
        },
      }),

      db.feedback.count({
        where: {
          workspaceId: user.workspaceId,
          sentiment: "NEGATIVE",
        },
      }),
    ]);

    return NextResponse.json([
      {
        label: "All feedback",
        positive,
        neutral,
        negative,
      },
    ]);
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
      "Failed to fetch sentiment breakdown:",
      error,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}