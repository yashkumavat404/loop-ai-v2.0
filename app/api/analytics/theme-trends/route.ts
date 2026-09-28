import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

const periodSchema = z.enum(["7d", "30d", "90d"]);

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(request.url);

    const parsed = periodSchema.safeParse(
      searchParams.get("period") ?? "30d",
    );

    const period = parsed.success ? parsed.data : "30d";

    const days =
      period === "7d"
        ? 7
        : period === "90d"
          ? 90
          : 30;

    const now = new Date();

    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - days);

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - days);

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
            feedback: {
              select: {
                createdAt: true,
                workspaceId: true,
              },
            },
          },
        },
      },
    });

    const result = themes
      .map((theme) => {
        const currentCount = theme.feedback.filter(
          (item) =>
            item.feedback.workspaceId === user.workspaceId &&
            item.feedback.createdAt >= currentStart &&
            item.feedback.createdAt <= now,
        ).length;

        const previousCount = theme.feedback.filter(
          (item) =>
            item.feedback.workspaceId === user.workspaceId &&
            item.feedback.createdAt >= previousStart &&
            item.feedback.createdAt < currentStart,
        ).length;

        let changePercent = 0;

        if (previousCount === 0) {
          changePercent = currentCount > 0 ? 100 : 0;
        } else {
          changePercent = Math.round(
            ((currentCount - previousCount) / previousCount) * 100,
          );
        }

        return {
          id: theme.id,
          name: theme.name,
          count: currentCount,
          changePercent,
        };
      })
      .filter((theme) => theme.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    return NextResponse.json(result);
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

    console.error("Failed to fetch theme trends:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}