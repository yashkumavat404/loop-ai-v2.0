import {
  feedbackClassificationSchema,
  type ExistingTheme,
  type FeedbackClassification,
} from "../schemas";
import type { AIProvider } from "./types";

const classificationKeywords = [
  {
    theme: "Checkout & Payments",
    featureArea: "Checkout",
    keywords: [
      "checkout",
      "payment",
      "pay",
      "card",
      "transaction",
      "order",
      "purchase",
    ],
  },
  {
    theme: "Mobile Experience",
    featureArea: "Mobile App",
    keywords: [
      "mobile",
      "app",
      "android",
      "ios",
      "phone",
      "unresponsive",
    ],
  },
  {
    theme: "Customer Support",
    featureArea: "Support",
    keywords: [
      "support",
      "ticket",
      "agent",
      "help",
      "customer service",
      "resolved",
    ],
  },
  {
    theme: "Billing",
    featureArea: "Billing",
    keywords: [
      "billing",
      "invoice",
      "subscription",
      "charge",
      "refund",
    ],
  },
  {
    theme: "Search & Discovery",
    featureArea: "Search",
    keywords: [
      "search",
      "find",
      "filter",
      "discovery",
      "result",
    ],
  },
  {
    theme: "Dashboard & Analytics",
    featureArea: "Dashboard",
    keywords: [
      "dashboard",
      "analytics",
      "chart",
      "report",
      "metric",
      "kpi",
    ],
  },
  {
    theme: "Customization",
    featureArea: "Customization",
    keywords: [
      "customize",
      "customization",
      "settings",
      "theme",
      "personalize",
    ],
  },
];

const positiveWords = [
  "love",
  "great",
  "excellent",
  "easy",
  "helpful",
  "fast",
  "quickly",
  "professional",
  "resolved",
  "good",
  "happy",
  "amazing",
];

const negativeWords = [
  "slow",
  "broken",
  "cannot",
  "can't",
  "unable",
  "failed",
  "failure",
  "problem",
  "issue",
  "error",
  "crash",
  "unresponsive",
  "waiting",
  "difficult",
  "bad",
];

function calculateSentiment(content: string) {
  const normalized = content.toLowerCase();

  const positiveCount = positiveWords.filter((word) =>
    normalized.includes(word),
  ).length;

  const negativeCount = negativeWords.filter((word) =>
    normalized.includes(word),
  ).length;

  if (positiveCount > negativeCount) {
    return {
      sentiment: "POSITIVE" as const,
      sentimentScore: Math.min(0.95, 0.35 + positiveCount * 0.12),
    };
  }

  if (negativeCount > positiveCount) {
    return {
      sentiment: "NEGATIVE" as const,
      sentimentScore: Math.max(
        -0.95,
        -(0.35 + negativeCount * 0.12),
      ),
    };
  }

  return {
    sentiment: "NEUTRAL" as const,
    sentimentScore: 0,
  };
}

export const developmentProvider: AIProvider = {
  async classifyFeedback(
    content: string,
    existingThemes: ExistingTheme[],
  ): Promise<FeedbackClassification> {
    const sentiment = calculateSentiment(content);
    const normalized = content.toLowerCase();

    const matchedThemes = classificationKeywords
      .filter((item) =>
        item.keywords.some((keyword) =>
          normalized.includes(keyword),
        ),
      )
      .map((item) => item.theme)
      .filter((themeName) =>
        existingThemes.some(
          (theme) => theme.name === themeName,
        ),
      )
      .slice(0, 3);

    const featureMatch = classificationKeywords.find((item) =>
      item.keywords.some((keyword) =>
        normalized.includes(keyword),
      ),
    );

    const classification = {
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.sentimentScore,
      themes:
        matchedThemes.length > 0
          ? matchedThemes
          : ["General Feedback"],
      featureArea: featureMatch?.featureArea ?? "General",
    };

    return feedbackClassificationSchema.parse(classification);
  },
};