import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const themes = await db.theme.findMany({
      where: {
        workspaceId: user.workspaceId,
      },
      select: {
        id: true,
        name: true,
        feedback: {
          select: {
            feedbackId: true,
          },
        },
      },
    });

    const topThemes = themes
      .map((theme) => ({
        id: theme.id,
        name: theme.name,
        count: theme.feedback.length,
      }))
      .filter((theme) => theme.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    return NextResponse.json(topThemes);
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

    console.error("Failed to fetch top themes:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}