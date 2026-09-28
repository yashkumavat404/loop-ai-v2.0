import { db } from "@/lib/db";

import type {
  FeedbackClassification,
  ExistingTheme,
} from "./schemas";

import { developmentProvider } from "./providers/development";
import geminiProvider from "./providers/gemini";

import type { AIProvider } from "./providers/types";

const providers: Record<string, AIProvider> = {
  development: developmentProvider,
  gemini: geminiProvider,
};

const activeProviderName =
  process.env.AI_PROVIDER || "development";

const activeProvider =
  providers[activeProviderName] || developmentProvider;

export async function classifyFeedback(
  content: string,
  workspaceId: string
): Promise<FeedbackClassification> {
  const existingThemes: ExistingTheme[] =
    await db.theme.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
      },
    });

  return activeProvider.classifyFeedback(
    content,
    existingThemes
  );
}