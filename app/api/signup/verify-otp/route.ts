import { NextResponse } from "next/server";

import {
  getOtpExpirySeconds,
  readPendingSignup,
  signVerifiedToken,
  verifyPendingOtp,
} from "@/lib/signup-verification";

const COOKIE_NAME = "loop_signup_pending";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { otp?: string };
    const otp = body.otp?.trim() || "";

    const cookie = request.headers
      .get("cookie")
      ?.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`))?.[1];

    if (!cookie) {
      return NextResponse.json(
        { error: "Your verification session has expired. Please request a new code." },
        { status: 400 },
      );
    }

    const pendingToken = decodeURIComponent(cookie);
    const pending = readPendingSignup(pendingToken);
    const result = verifyPendingOtp(pendingToken, otp);

    if (!result.verified) {
      const response = NextResponse.json(
        {
          error: "Incorrect verification code.",
          attemptsRemaining: result.attemptsRemaining,
        },
        { status: 400 },
      );

      response.cookies.set(COOKIE_NAME, result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: getOtpExpirySeconds(pending),
      });

      return response;
    }

    const response = NextResponse.json({
      success: true,
      message: "Email verified.",
    });

    response.cookies.set("loop_signup_verified", signVerifiedToken(pendingToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getOtpExpirySeconds(pending),
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "OTP_EXPIRED") {
      return NextResponse.json(
        { error: "This code has expired. Please request a new code." },
        { status: 400 },
      );
    }

    if (message === "OTP_ATTEMPTS_EXCEEDED") {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code." },
        { status: 429 },
      );
    }

    console.error("OTP verification failed:", error);

    return NextResponse.json(
      { error: "Unable to verify the code right now." },
      { status: 500 },
    );
  }
}
