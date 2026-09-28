import type {
  ExistingTheme,
  FeedbackClassification,
} from "../schemas";

export interface AIProvider {
  classifyFeedback(
    content: string,
    existingThemes: ExistingTheme[],
  ): Promise<FeedbackClassification>;
}