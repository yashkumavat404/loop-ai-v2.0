import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    console.error("Failed to load authenticated user:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}