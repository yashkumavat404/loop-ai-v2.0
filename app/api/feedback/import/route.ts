import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { classifyFeedback } from "@/lib/ai";
import { generateFeedbackEmbedding, storeFeedbackEmbedding } from "@/lib/ai/embedding-store";
import { getAuthenticatedUser, requireRole } from "@/lib/auth-helpers";
import type { FeedbackClassification } from "@/lib/ai/schemas";
import { resolveWorkspaceThemes } from "@/lib/ai/theme-store";

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
  rowNumber: number;
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

type ImportResult = {
  imported: number;
  skipped: number;
  fallbackClassified: boolean;
  error?: string;
};

function normalizeChannel(value: string) {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/^["']|["']$/g, "");

  const aliases: Record<string, ImportedFeedback["channel"]> = {
    WEB: "WEB",
    WEBSITE: "WEB",
    SITE: "WEB",
    ONLINE: "WEB",
    CSV: "CSV",
    FILE: "CSV",
    UPLOAD: "CSV",
    EMAIL: "EMAIL",
    E_MAIL: "EMAIL",
    MAIL: "EMAIL",
    SUPPORT: "SUPPORT",
    CUSTOMER_SUPPORT: "SUPPORT",
    HELP_DESK: "SUPPORT",
    APP: "APP_STORE",
    APPSTORE: "APP_STORE",
    APP_STORE: "APP_STORE",
    MOBILE_APP: "APP_STORE",
    PLAY_STORE: "APP_STORE",
    SURVEY: "SURVEY",
    FORM: "SURVEY",
    QUESTIONNAIRE: "SURVEY",
  };

  return aliases[normalized] ?? normalized;
}

function parseCsvRecords(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const character = text[i];

    if (character === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      record.push(current.trim());
      current = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && text[i + 1] === "\n") i += 1;
      record.push(current.trim());
      current = "";

      if (record.some((value) => value.length > 0)) {
        records.push(record);
      }

      record = [];
      continue;
    }

    current += character;
  }

  record.push(current.trim());

  if (record.some((value) => value.length > 0)) {
    records.push(record);
  }

  return records;
}

function fallbackClassification(content: string): FeedbackClassification {
  const text = content.toLowerCase();

  const negativeWords = [
    "error",
    "slow",
    "confusing",
    "difficult",
    "trouble",
    "problem",
    "issue",
    "could not",
    "cannot",
    "wrong",
    "failed",
    "failure",
    "long",
  ];

  const positiveWords = [
    "fast",
    "faster",
    "smooth",
    "easy",
    "excellent",
    "useful",
    "professional",
    "reliably",
    "works perfectly",
    "cleaner",
    "accurate",
    "quickly",
    "great",
  ];

  const negativeHits = negativeWords.filter((word) => text.includes(word)).length;
  const positiveHits = positiveWords.filter((word) => text.includes(word)).length;

  const sentiment =
    positiveHits > negativeHits
      ? "POSITIVE"
      : negativeHits > positiveHits
        ? "NEGATIVE"
        : "NEUTRAL";

  const sentimentScore =
    sentiment === "POSITIVE"
      ? Math.min(0.8, 0.25 + positiveHits * 0.1)
      : sentiment === "NEGATIVE"
        ? Math.max(-0.8, -0.25 - negativeHits * 0.1)
        : 0;

  let featureArea = "General";
  if (/search|filter|inbox|pagination/.test(text)) featureArea = "Search";
  else if (/dashboard|chart|metric|trend/.test(text)) featureArea = "Dashboard";
  else if (/upload|csv|import|spreadsheet/.test(text)) featureArea = "Data Import";
  else if (/login|onboarding|account|verification/.test(text)) featureArea = "Account";
  else if (/report|pdf|summary/.test(text)) featureArea = "Reporting";
  else if (/ai|classification|theme|ask loop/.test(text)) featureArea = "AI";
  else if (/support|notification/.test(text)) featureArea = "Support";
  else if (/mobile|screen size|dark mode|interface|navigation/.test(text)) featureArea = "UI/UX";
  else if (/load|performance|slow|fast|faster/.test(text)) featureArea = "Performance";

  return {
    sentiment,
    sentimentScore,
    themes: [featureArea],async function processRow(
  item: ImportedFeedback,
  workspaceId: string,
): Promise<ImportResult> {
  const duplicateWhere = {
    workspaceId,
    content: item.content,
    ...(item.customerLabel ? { customerLabel: item.customerLabel } : {}),
    ...(item.createdAt ? { createdAt: item.createdAt } : {}),
  };

  const existingFeedback = await db.feedback.findFirst({
    where: duplicateWhere,
    select: { id: true },
  });

  if (existingFeedback) {
    return {
      imported: 0,
      skipped: 1,
      fallbackClassified: false,
    };
  }

  // Classification and embedding do not depend on each other.
  // Run both AI operations at the same time to remove one full network
  // round-trip from every imported row.
  const [classificationResult, embeddingResult] = await Promise.all([
    classifyFeedback(item.content, workspaceId)
      .then((classification) => ({
        classification,
        fallbackClassified: false,
      }))
      .catch((error) => {
        console.error("CSV AI classification failed; using fallback:", error);
        return {
          classification: fallbackClassification(item.content),
          fallbackClassified: true,
        };
      }),
    createEmbeddingSafely(item.content),
  ]);

  const existingThemes = await resolveWorkspaceThemes(
    workspaceId,
    classificationResult.classification.themes,
  );

  const feedback = await db.feedback.create({
    data: {
      workspaceId,
      content: item.content,
      channel: item.channel,
      customerLabel: item.customerLabel,
      createdAt: item.createdAt,
      sentiment: classificationResult.classification.sentiment,
      sentimentScore: classificationResult.classification.sentimentScore,
      featureArea: classificationResult.classification.featureArea,
      status: "NEW",
      themes: {
        create: existingThemes.map((theme) => ({
          themeId: theme.id,
        })),
      },
    },
  });

  if (embeddingResult) {
    try {
      await storeFeedbackEmbedding(feedback.id, embeddingResult);
    } catch (error) {
      console.error("CSV embedding storage failed; feedback retained:", error);
    }
  }

  return {
    imported: 1,
    skipped: 0,
    fallbackClassified: classificationResult.fallbackClassified,
  };
}

async function createEmbeddingSafely(content: string) {
  try {
    return await generateFeedbackEmbedding(content);
  } catch (error) {
    console.error("CSV embedding generation failed; feedback retained:", error);
    return null;
  }
}
allbackClassified,
  };
}

async function runWithConcurrency<T>(
  items: T[],
  worker: (item: T) => Promise<ImportResult>,
  concurrency = 8,
) {
  const results: ImportResult[] = [];
  let cursor = 0;

  async function runner() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;

      try {
        results[index] = await worker(items[index]);
      } catch (error) {
        console.error("CSV row import failed:", error);
        results[index] = {
          imported: 0,
          skipped: 0,
          fallbackClassified: false,
          error: error instanceof Error ? error.message : "Row processing failed",
        };
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, items.length) },
      () => runner(),
    ),
  );

  return results;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    requireRole(user, ["ADMIN", "ANALYST"]);

    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    if (!uploadedFile.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ error: "Only CSV files are supported" }, { status: 400 });
    }

    const text = (await uploadedFile.text()).replace(/^\uFEFF/, "");
    const records = parseCsvRecords(text);

    if (records.length < 2) {
      return NextResponse.json(
        { error: "CSV must contain a header and at least one data row" },
        { status: 400 },
      );
    }

    const headers = records[0].map((header) =>
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
        { error: `Missing CSV columns: ${missingHeaders.join(", ")}` },
        { status: 400 },
      );
    }

    const imported: ImportedFeedback[] = [];
    const failures: Array<{ row: number; error: string }> = [];

    for (let index = 1; index < records.length; index += 1) {
      const rowNumber = index + 1;
      const values = records[index];

      const rawRow = Object.fromEntries(
        headers.map((header, headerIndex) => [
          header,
          values[headerIndex] ?? "",
        ]),
      );

      const parsed = rowSchema.safeParse({
        content: rawRow.content,
        channel: normalizeChannel(rawRow.channel),
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
        rowNumber,
        content: parsed.data.content,
        channel: parsed.data.channel,
        customerLabel: parsed.data.customer_label,
        createdAt: parsed.data.created_at,
      });
    }

    const results = await runWithConcurrency(
      imported,
      (item) => processRow(item, user.workspaceId),
      8,
    );

    const importedCount = results.reduce(
      (total, result) => total + result.imported,
      0,
    );
    const skippedCount = results.reduce(
      (total, result) => total + (result.skipped ?? 0),
      0,
    );
    const fallbackCount = results.filter(
      (result) => result.fallbackClassified,
    ).length;

    const processingFailures = results
      .map((result, index) =>
        result.error && imported[index]
          ? {
              row: imported[index].rowNumber,
              error: result.error,
            }
          : null,
      )
      .filter(
        (failure): failure is { row: number; error: string } =>
          failure !== null,
      );

    const allFailures = [...failures, ...processingFailures].sort(
      (a, b) => a.row - b.row,
    );

    return NextResponse.json({
      data: {
        imported: importedCount,
        skipped: skippedCount,
        failed: allFailures.length,
        fallbackClassified: fallbackCount,
        failures: allFailures,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.error("Failed to import feedback CSV:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
