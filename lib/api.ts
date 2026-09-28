import type {
  AskResponse,
  DashboardStats,
  Feedback,
  PaginatedFeedback,
  Report,
  TrendPoint,
} from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = await response.json();

      if (body?.error) {
        message = body.error;
      } else if (body?.message) {
        message = body.message;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

function normalizeFeedback(record: any): Feedback {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    text: record.content,
    customerName: record.customerLabel,
    customerEmail: null,
    channel: record.channel,
    status: record.status,
    sentiment: record.sentiment,
    sentimentScore: record.sentimentScore,
    score: record.sentimentScore,
    featureArea: record.featureArea,
    themes:
      record.themes?.map((item: any) => ({
        id: item.theme?.id ?? item.themeId,
        name: item.theme?.name ?? "",
      })) ?? [],
    createdAt: record.createdAt,
  };
}

export const api = {
  getDashboardStats: () =>
    request<DashboardStats>("/api/analytics/summary"),

  getFeedback: async (
    params: URLSearchParams,
  ): Promise<PaginatedFeedback> => {
    const result = await request<{
      data: any[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/feedback?${params.toString()}`);

    return {
      items: result.data.map(normalizeFeedback),
      page: result.pagination.page,
      pageSize: result.pagination.pageSize,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
    };
  },

  getFeedbackById: async (id: string): Promise<Feedback> => {
    const result = await request<{ data: any }>(
      `/api/feedback/${id}`,
    );

    return normalizeFeedback(result.data);
  },

  updateFeedback: async (
    id: string,
    data: { status: Feedback["status"] },
  ): Promise<Feedback> => {
    const result = await request<{ data: any }>(
      `/api/feedback/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    return normalizeFeedback(result.data);
  },

  getVolumeTrend: (period = "30d") =>
    request<TrendPoint[]>(
      `/api/analytics/volume?period=${period}`,
    ),

  getSentimentTrend: () =>
    request<TrendPoint[]>("/api/analytics/sentiment"),

  getTopThemes: () =>
    request<import("./types").Theme[]>("/api/analytics/themes"),

  getThemeTrends: (period = "30d") =>
    request<import("./types").Theme[]>(
      `/api/analytics/theme-trends?period=${period}`,
    ),

  askLoop: (question: string) =>
    request<AskResponse>("/api/ask", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),

  getReports: () =>
    request<Report[]>("/api/reports"),

  createReport: (periodStart: string, periodEnd: string) =>
    request<Report>("/api/reports", {
      method: "POST",
      body: JSON.stringify({ periodStart, periodEnd }),
    }),

  createFeedback: async (data: {
    text: string;
    customerName?: string;
    customerEmail?: string;
    channel: string;
  }): Promise<Feedback> => {
    const result = await request<{ data: any }>("/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        content: data.text,
        channel: data.channel,
        customerLabel: data.customerName,
      }),
    });

    return normalizeFeedback(result.data);
  },
};