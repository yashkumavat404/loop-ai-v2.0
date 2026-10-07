import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  isVerifiedToken,
  readPendingSignup,
} from "@/lib/signup-verification";

const PENDING_COOKIE = "loop_signup_pending";
const VERIFIED_COOKIE = "loop_signup_verified";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const pendingValue = cookieHeader.match(
      new RegExp(`(?:^|; )${PENDING_COOKIE}=([^;]+)`),
    )?.[1];

    const verifiedValue = cookieHeader.match(
      new RegExp(`(?:^|; )${VERIFIED_COOKIE}=([^;]+)`),
    )?.[1];

    if (!pendingValue || !verifiedValue) {
      return NextResponse.json(
        { error: "Please verify your email before creating the workspace." },
        { status: 403 },
      );
    }

    const pendingToken = decodeURIComponent(pendingValue);
    const verifiedToken = decodeURIComponent(verifiedValue);

    if (!isVerifiedToken(pendingToken, verifiedToken)) {
      return NextResponse.json(
        { error: "Email verification is no longer valid. Please verify again." },
        { status: 403 },
      );
    }

    const pending = readPendingSignup(pendingToken);

    const existingUser = await db.user.findUnique({
      where: { email: pending.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const result = await db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: pending.workspaceName,
        },
      });

      const user = await tx.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          passwordHash: pending.passwordHash,
          role: "ADMIN",
          workspaceId: workspace.id,
        },
      });

      return {
        userId: user.id,
        workspaceId: workspace.id,
      };
    });

    const response = NextResponse.json({
      success: true,
      ...result,
    });

    response.cookies.set(PENDING_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set(VERIFIED_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Signup completion failed:", error);

    return NextResponse.json(
      { error: "Unable to create your account right now. Please try again." },
      { status: 500 },
    );
  }
}
