import type {
  DashboardStats,
  Feedback,
  Report,
  SentimentPoint,
  Theme,
  TrendPoint
} from "./types";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const demoStats: DashboardStats = {
  totalFeedback: 128,
  negativePercent: 27,
  positivePercent: 54,
  newThisWeek: 31,
  resolvedPercent: 42
};

export const demoVolume: TrendPoint[] = days.map((label, i) => ({
  label,
  value: [14, 21, 16, 28, 19, 12, 18][i]
}));

export const demoSentiment: SentimentPoint[] = days.map((label, i) => ({
  label,
  positive: [8, 12, 9, 16, 11, 7, 10][i],
  neutral: [3, 5, 4, 6, 4, 3, 4][i],
  negative: [3, 4, 3, 6, 4, 2, 4][i]
}));

export const demoThemes: Theme[] = [
  { id: "1", name: "Onboarding", count: 31, changePercent: 18, sentiment: "NEGATIVE" },
  { id: "2", name: "Checkout", count: 24, changePercent: 9, sentiment: "NEGATIVE" },
  { id: "3", name: "Performance", count: 22, changePercent: 26, sentiment: "NEGATIVE" },
  { id: "4", name: "Notifications", count: 17, changePercent: -5, sentiment: "POSITIVE" },
  { id: "5", name: "Mobile App", count: 15, changePercent: 12, sentiment: "NEUTRAL" }
];

export const demoFeedback: Feedback[] = [
  {
    id: "demo-1",
    workspaceId: "demo-workspace",
    text: "The onboarding steps are confusing and I did not know what to do after verification.",
    customerName: "Aarav",
    channel: "WEB",
    status: "NEW",
    sentiment: "NEGATIVE",
    sentimentScore: -0.82,
    featureArea: "Onboarding",
    themes: ["Onboarding", "UX"],
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-2",
    workspaceId: "demo-workspace",
    text: "Checkout was quick today and the payment confirmation was clear.",
    customerName: "Maya",
    channel: "APP_STORE",
    status: "REVIEWED",
    sentiment: "POSITIVE",
    sentimentScore: 0.78,
    featureArea: "Checkout",
    themes: ["Checkout", "Payments"],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "demo-3",
    workspaceId: "demo-workspace",
    text: "The mobile app freezes whenever I open the order history.",
    customerName: "Rohan",
    channel: "SUPPORT",
    status: "NEW",
    sentiment: "NEGATIVE",
    sentimentScore: -0.74,
    featureArea: "Mobile App",
    themes: ["Mobile App", "Performance"],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "demo-4",
    workspaceId: "demo-workspace",
    text: "I like the new notification controls. They make the app less noisy.",
    customerName: "Sara",
    channel: "SURVEY",
    status: "ACTIONED",
    sentiment: "POSITIVE",
    sentimentScore: 0.67,
    featureArea: "Notifications",
    themes: ["Notifications"],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export const demoReports: Report[] = [
  {
    id: "report-1",
    title: "Weekly Voice of Customer — Aug 31 to Sep 6",
    periodStart: "2026-08-31",
    periodEnd: "2026-09-06",
    summary: "Customers are positive about notifications but continue to report friction in onboarding, checkout and mobile performance.",
    topThemes: [
      { name: "Onboarding", count: 31 },
      { name: "Checkout", count: 24 },
      { name: "Performance", count: 22 }
    ],
    createdAt: new Date().toISOString()
  }
];
