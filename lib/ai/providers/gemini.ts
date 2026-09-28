import { GoogleGenAI } from "@google/genai";

import {
  feedbackClassificationSchema,
  type ExistingTheme,
  type FeedbackClassification,
} from "../schemas";

import type { AIProvider } from "./types";

const GEMINI_MODEL = "gemini-3.6-flash";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({
    apiKey,
  });
};

const buildThemeContext = (existingThemes: ExistingTheme[]) => {
  if (!existingThemes.length) {
    return "There are currently no existing themes.";
  }

  return existingThemes
    .map((theme) => `- ${theme.name}`)
    .join("\n");
};

const geminiProvider: AIProvider = {
  classifyFeedback: async (
    content: string,
    existingThemes: ExistingTheme[]
  ): Promise<FeedbackClassification> => {
    const ai = getGeminiClient();

    const prompt = `
You are the AI classification engine for LOOP, a customer-feedback
intelligence platform.

Classify the following customer feedback.

Return ONLY valid JSON matching the required schema.

Rules:

1. sentiment must be exactly one of:
   POSITIVE
   NEUTRAL
   NEGATIVE

2. sentimentScore must be a number between -1 and 1.
   -1 means extremely negative.
    0 means neutral.
    1 means extremely positive.

3. themes must contain one or more concise themes.
   Prefer existing themes when they are relevant.
   Do not invent a new theme when an existing theme clearly matches.

4. featureArea should be a short product area such as:
   Billing, Checkout, Support, Mobile App, Performance,
   Notifications, Account, or similar.

Existing themes:
${buildThemeContext(existingThemes)}

Customer feedback:
"""
${content}
"""

Classify the feedback accurately and return only the JSON object.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
            },
            sentimentScore: {
              type: "number",
            },
            themes: {
              type: "array",
              items: {
                type: "string",
              },
            },
            featureArea: {
              type: "string",
            },
          },
          required: [
            "sentiment",
            "sentimentScore",
            "themes",
            "featureArea",
          ],
        },
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error("Gemini returned an empty response");
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error("Gemini returned invalid JSON");
    }

    return feedbackClassificationSchema.parse(parsed);
  },
};

export default geminiProvider;