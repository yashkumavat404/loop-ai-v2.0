import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";
import { sendSignupOtpEmail } from "@/lib/email";
import {
  canResend,
  createPendingSignup,
  getResendWaitSeconds,
  readPendingSignup,
} from "@/lib/signup-verification";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  workspaceName: z.string().trim().min(2).max(100),
});

const COOKIE_NAME = "loop_signup_pending";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid signup details." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const existingPending = request.headers
      .get("cookie")
      ?.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`))?.[1];

    if (existingPending) {
      try {
        const pending = readPendingSignup(decodeURIComponent(existingPending));

        if (!canResend(pending) && pending.email === email) {
          return NextResponse.json(
            {
              error: `Please wait ${getResendWaitSeconds(pending)} seconds before requesting another code.`,
            },
            { status: 429 },
          );
        }
      } catch {
        // Expired or invalid pending state can be replaced.
      }
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const { otp, token } = createPendingSignup({
      name: parsed.data.name,
      workspaceName: parsed.data.workspaceName,
      email,
      passwordHash,
    });

    await sendSignupOtpEmail(email, otp);

    const response = NextResponse.json({
      success: true,
      message: "Verification code sent.",
      expiresInSeconds: 600,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    response.cookies.set("loop_signup_verified", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Signup OTP request failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send verification code.",
      },
      { status: 500 },
    );
  }
}
