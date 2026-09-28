export type Role = "ADMIN" | "ANALYST" | "VIEWER";

export type FeedbackStatus = "NEW" | "REVIEWED" | "ACTIONED";

export type FeedbackChannel = "WEB" | "CSV" | "EMAIL" | "SUPPORT" | "APP_STORE" | "SURVEY";

export type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Theme {
  id: string;
  name: string;
  count: number;
  changePercent?: number;
  sentiment?: Sentiment;
}

export interface Feedback {
  id: string;
  workspaceId: string;
  text: string;
  customerName?: string | null;
  customerEmail?: string | null;
  channel: FeedbackChannel | string;
  status: FeedbackStatus;
  sentiment?: Sentiment | null;
  sentimentScore?: number | null;
  score?: number | null;
  featureArea?: string | null;
  themes?: Array<{ id?: string; name: string }> | string[];
  createdAt: string;
}

export interface PaginatedFeedback {
  items: Feedback[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  totalFeedback: number;
  negativePercent: number;
  positivePercent: number;
  newThisWeek: number;
  resolvedPercent: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface SentimentPoint {
  label: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface AskSource {
  id: string;
  text: string;
  channel: string;
  sentiment?: Sentiment | null;
  createdAt: string;
}

export interface AskResponse {
  answer: string;
  sources: AskSource[];
}

export interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  topThemes: Array<{ name: string; count: number }>;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}