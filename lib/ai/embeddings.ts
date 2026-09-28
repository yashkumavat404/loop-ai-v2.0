import "dotenv/config";

import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = "gemini-embedding-001";

export type EmbeddingTask =
  | "RETRIEVAL_DOCUMENT"
  | "RETRIEVAL_QUERY";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({
    apiKey,
  });
};

export async function generateEmbedding(
  text: string,
  taskType: EmbeddingTask,
): Promise<number[]> {
  const content = text.trim();

  if (!content) {
    throw new Error(
      "Cannot generate an embedding for empty text",
    );
  }

  const ai = getGeminiClient();

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: content,
    config: {
      taskType,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding?.length) {
    throw new Error(
      "Gemini returned an empty embedding",
    );
  }

  return embedding;
}