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

    const rows = await db.$queryRaw<
      Array<{ day: Date; value: bigint }>
    >`
      SELECT
        DATE_TRUNC('day', "createdAt") AS day,
        COUNT(*)::bigint AS value
      FROM "Feedback"
      WHERE
        "workspaceId" = ${user.workspaceId}
        AND "createdAt" >= CURRENT_DATE - ${days - 1} * INTERVAL '1 day'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day ASC
    `;

    return NextResponse.json(
      rows.map((row) => ({
        label: row.day.toISOString().slice(5, 10),
        value: Number(row.value),
      })),
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

    console.error("Failed to fetch feedback volume:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}