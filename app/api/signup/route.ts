import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  workspaceName: z.string().trim().min(2).max(100),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid signup details",
        },
        { status: 400 },
      );
    }

    const { name, password, workspaceName } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "ADMIN",
          workspaceId: workspace.id,
        },
      });

      return {
        userId: user.id,
        workspaceId: workspace.id,
      };
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup failed:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "An account with this email already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to create your account right now. Please try again.",
      },
      { status: 500 },
    );
  }
}