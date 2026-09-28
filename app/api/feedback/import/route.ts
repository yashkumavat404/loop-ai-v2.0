import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { classifyFeedback } from "@/lib/ai";
import { createFeedbackEmbedding } from "@/lib/ai/embedding-store";
import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";

const rowSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  channel: z.enum([
    "WEB",
    "CSV",
    "EMAIL",
    "SUPPORT",
    "APP_STORE",
    "SURVEY",
  ]),
  customer_label: z.string().trim().max(200).optional(),
  created_at: z.coerce.date().optional(),
});

type ImportedFeedback = {
  content: string;
  channel:
    | "WEB"
    | "CSV"
    | "EMAIL"
    | "SUPPORT"
    | "APP_STORE"
    | "SURVEY";
  customerLabel?: string;
  createdAt?: Date;
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i];

    if (character === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());

  return values;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    requireRole(user, ["ADMIN", "ANALYST"]);

    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: "CSV file is required" },
        { status: 400 },
      );
    }

    if (!uploadedFile.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 },
      );
    }

    const text = await uploadedFile.text();

    const lines = text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      return NextResponse.json(
        {
          error: "CSV must contain a header and at least one data row",
        },
        { status: 400 },
      );
    }

    const headers = parseCsvLine(lines[0]).map((header) =>
      header.trim().toLowerCase(),
    );

    const requiredHeaders = [
      "content",
      "channel",
      "customer_label",
      "created_at",
    ];

    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header),
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Missing CSV columns: ${missingHeaders.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const imported: ImportedFeedback[] = [];

    const failures: Array<{
      row: number;
      error: string;
    }> = [];

    /*
     * Step 1:
     * Validate every CSV row before sending anything
     * to the database.
     */
    for (let index = 1; index < lines.length; index += 1) {
      const rowNumber = index + 1;
      const values = parseCsvLine(lines[index]);

      const rawRow = Object.fromEntries(
        headers.map((header, headerIndex) => [
          header,
          values[headerIndex] ?? "",
        ]),
      );

      const parsed = rowSchema.safeParse({
        content: rawRow.content,
        channel: rawRow.channel,
        customer_label: rawRow.customer_label || undefined,
        created_at: rawRow.created_at || undefined,
      });

      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];

        failures.push({
          row: rowNumber,
          error: firstIssue?.message ?? "Invalid row",
        });

        continue;
      }

      imported.push({
        content: parsed.data.content,
        channel: parsed.data.channel,
        customerLabel: parsed.data.customer_label,
        createdAt: parsed.data.created_at,
      });
    }

    /*
     * Step 2:
     * Classify each valid feedback item through the
     * provider-independent AI abstraction.
     */
    let aiFailures = 0;

    for (let index = 0; index < imported.length; index += 1) {
      const item = imported[index];
      const rowNumber = index + 2;

      try {
        const classification = await classifyFeedback(
          item.content,
          user.workspaceId,
        );

        /*
         * Find existing themes inside the authenticated workspace.
         *
         * This maintains multi-tenant isolation.
         */
        const existingThemes = await db.theme.findMany({
          where: {
            workspaceId: user.workspaceId,
            name: {
              in: classification.themes,
            },
          },
          select: {
            id: true,
            name: true,
          },
        });

        /*
         * Create the feedback record first so we have
         * its database ID for the embedding record.
         */
        const feedback = await db.feedback.create({
          data: {
            workspaceId: user.workspaceId,
            content: item.content,
            channel: item.channel,
            customerLabel: item.customerLabel,
            createdAt: item.createdAt,
            sentiment: classification.sentiment,
            sentimentScore: classification.sentimentScore,
            featureArea: classification.featureArea,
            status: "NEW",

            themes: {
              create: existingThemes.map((theme) => ({
                themeId: theme.id,
              })),
            },
          },
        });

        /*
         * Generate and store the semantic embedding.
         *
         * This allows Ask LOOP to later retrieve this
         * feedback using pgvector similarity search.
         */
        await createFeedbackEmbedding(
          feedback.id,
          feedback.content,
        );
      } catch (error) {
        aiFailures += 1;

        console.error(
          `Failed to classify/import CSV row ${rowNumber}:`,
          error,
        );

        failures.push({
          row: rowNumber,
          error: "AI classification or embedding failed",
        });
      }
    }

    return NextResponse.json({
      data: {
        imported: imported.length - aiFailures,
        failed: failures.length,
        failures,
      },
    });
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

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    console.error("Failed to import feedback CSV:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}