import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateStatusSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]),
});

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const user = await getAuthenticatedUser();

    const { id } = await context.params;

    const feedback = await db.feedback.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId,
      },
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: feedback,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    console.error("Failed to fetch feedback:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const user = await getAuthenticatedUser();

    requireRole(user, ["ADMIN", "ANALYST"]);

    const { id } = await context.params;

    const body: unknown = await request.json();

    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid status",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { status: newStatus } = parsed.data;

    const feedback = await db.feedback.findFirst({
      where: {
        id,
        workspaceId: user.workspaceId,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    const currentStatus = feedback.status;

    const validTransition =
      currentStatus === newStatus ||
      (currentStatus === "NEW" && newStatus === "REVIEWED") ||
      (currentStatus === "REVIEWED" && newStatus === "ACTIONED");

    if (!validTransition) {
      return NextResponse.json(
        {
          error: `Invalid status transition: ${currentStatus} → ${newStatus}`,
        },
        { status: 400 },
      );
    }

    const updatedFeedback = await db.feedback.update({
      where: {
        id: feedback.id,
      },
      data: {
        status: newStatus,
      },
    });

    return NextResponse.json({
      data: updatedFeedback,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    console.error("Failed to update feedback status:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}