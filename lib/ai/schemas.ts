import { z } from "zod";

export const feedbackClassificationSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string().trim().min(1)).max(5),
  featureArea: z.string().trim().min(1).max(200),
});

export type FeedbackClassification = z.infer<
  typeof feedbackClassificationSchema
>;

export type ExistingTheme = {
  id: string;
  name: string;
};