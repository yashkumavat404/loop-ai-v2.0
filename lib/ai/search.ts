import { Prisma } from "@/lib/generated/prisma/client";

import { db } from "@/lib/db";
import { generateEmbedding } from "./embeddings";

export type RetrievedFeedback = {
  id: string;
  content: string;
  channel: string;
  sentiment: string | null;
  createdAt: Date;
  similarity: number;
};

const vectorToSql = (vector: number[]) =>
  `[${vector.join(",")}]`;

export async function searchRelevantFeedback(
  question: string,
  workspaceId: string,
  limit = 8,
  dateFrom?: Date,
  dateTo?: Date,
): Promise<RetrievedFeedback[]> {
  const embedding = await generateEmbedding(
    question,
    "RETRIEVAL_QUERY",
  );

  const vector = vectorToSql(embedding);

  const dateFilter =
    dateFrom && dateTo
      ? Prisma.sql`AND f."createdAt" >= ${dateFrom} AND f."createdAt" < ${dateTo}`
      : Prisma.empty;

  const results = await db.$queryRaw<RetrievedFeedback[]>`
    SELECT
      f."id",
      f."content",
      f."channel",
      f."sentiment",
      f."createdAt",
      1 - (e."vector" <=> ${vector}::vector) AS "similarity"
    FROM "Feedback" f
    INNER JOIN "Embedding" e
      ON e."feedbackId" = f."id"
    WHERE f."workspaceId" = ${workspaceId}
      ${dateFilter}
    ORDER BY e."vector" <=> ${vector}::vector
    LIMIT ${limit}
  `;

  return results;
}
