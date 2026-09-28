import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.$queryRaw<{ now: Date }[]>`
      SELECT NOW() AS now
    `;

    return NextResponse.json({
      ok: true,
      database: "connected",
      serverTime: result[0]?.now ?? null,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}