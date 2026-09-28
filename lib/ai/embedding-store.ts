import { db } from "@/lib/db";
import { generateEmbedding } from "./embeddings";

const vectorToSql = (vector: number[]) =>
  `[${vector.join(",")}]`;

export async function createFeedbackEmbedding(
  feedbackId: string,
  content: string,
) {
  const embedding = await generateEmbedding(
    content,
    "RETRIEVAL_DOCUMENT",
  );

  const vector = vectorToSql(embedding);

  await db.$executeRaw`
    INSERT INTO "Embedding" (
      "id",
      "feedbackId",
      "vector",
      "createdAt"
    )
    VALUES (
      ${crypto.randomUUID()},
      ${feedbackId},
      ${vector}::vector,
      NOW()
    )
    ON CONFLICT ("feedbackId")
    DO UPDATE SET
      "vector" = EXCLUDED."vector"
  `;
}