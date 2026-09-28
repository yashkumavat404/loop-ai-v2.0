import "dotenv/config";

import { db } from "@/lib/db";
import { createFeedbackEmbedding } from "@/lib/ai/embedding-store";

async function main() {
  const feedback = await db.feedback.findMany({
    select: {
      id: true,
      content: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(`Found ${feedback.length} feedback records.`);

  for (let i = 0; i < feedback.length; i++) {
    const item = feedback[i];

    console.log(
      `[${i + 1}/${feedback.length}] Embedding ${item.id}`,
    );

    await createFeedbackEmbedding(
      item.id,
      item.content,
    );
  }

  console.log("Embedding backfill completed.");
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });