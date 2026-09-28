"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  MessageCircle,
  MessageSquare,
  Smile,
  Sparkles,
  ThumbsDown,
} from "lucide-react";

import { VolumeChart } from "@/components/charts/volume-chart";
import { SentimentChart } from "@/components/charts/sentiment-chart";
import { ThemeBarChart } from "@/components/charts/theme-bar-chart";
import { api } from "@/lib/api";
import type {
  DashboardStats,
  Feedback,
  SentimentPoint,
  Theme,
  TrendPoint,
} from "@/lib/types";

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof MessageSquare;
  tone: "blue" | "red" | "amber";
}) {
  const styles = {
    blue: {
      icon: "bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]",
      mini: "from-[#2f6fed]/5",
    },
    red: {
      icon: "bg-[#fff1f1] text-[#e05252] dark:bg-[#3a1c24] dark:text-[#ff8b96]",
      mini: "from-[#e05252]/5",
    },
    amber: {
      icon: "bg-[#fff8e8] text-[#e6a62d] dark:bg-[#3b2d12] dark:text-[#f6c85f]",
      mini: "from-[#e6a62d]/5",
    },
  }[tone];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#e5ebf2] bg-white p-5 shadow-[0_3px_16px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_8px_28px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#718096] dark:text-[#8d9aad]">
            {label}
          </p>
          <p className="mt-2 text-[32px] font-bold leading-none tracking-tight text-[#142238] dark:text-[#f2f6fb]">
            {value}
          </p>
          <p className="mt-2 text-[11px] font-medium text-[#8390a3] dark:text-[#8d9aad]">{helper}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.icon}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className={`pointer-events-none absolute bottom-0 right-0 h-16 w-40 bg-gradient-to-tl ${styles.mini} to-transparent`} />
      <div className="absolute bottom-4 right-5 flex items-end gap-1 opacity-60">
        {[8, 14, 20, 12, 24, 17, 22].map((height, index) => (
          <span
            key={index}
            className="w-1.5 rounded-full bg-[#cdd8e6] dark:bg-[#344357]"
            style={{ height }}
          />
        ))}
      </div>
    </section>
  );
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  icon: typeof MessageCircle;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-[#e5ebf2] bg-white shadow-[0_3px_16px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_8px_28px_rgba(0,0,0,0.24)] ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-[#edf1f5] dark:border-[#273447] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f5ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]">
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-bold text-[#17263a] dark:text-[#eef3f9]">{title}</h2>
            <p className="mt-0.5 text-[11px] text-[#8491a3] dark:text-[#8d9aad]">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function SentimentIcon({ sentiment }: { sentiment: Feedback["sentiment"] }) {
  if (sentiment === "NEGATIVE") {
    return <ThumbsDown size={15} className="text-[#e05252]" />;
  }
  if (sentiment === "POSITIVE") {
    return <Smile size={15} className="text-[#2f9d70]" />;
  }
  return <MessageCircle size={15} className="text-[#6d7b8d]" />;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [volume, setVolume] = useState<TrendPoint[]>([]);
  const [sentiment, setSentiment] = useState<SentimentPoint[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [recent, setRecent] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: "1",
          pageSize: "5",
        });

        const [dashboardStats, volumeData, sentimentData, themeData, feedback] =
          await Promise.all([
            api.getDashboardStats(),
            api.getVolumeTrend(),
            api.getSentimentTrend(),
            api.getTopThemes(),
            api.getFeedback(params),
          ]);

        setStats(dashboardStats);
        setVolume(volumeData);
        setSentiment(sentimentData as unknown as SentimentPoint[]);
        setThemes(themeData);
        setRecent(feedback.items);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8090a4] dark:text-[#8d9aad]">
            Workspace overview
          </p>
          <h1 className="text-[32px] font-bold tracking-tight text-[#142238] dark:text-[#f2f6fb] sm:text-[38px]">
            Good afternoon, <span className="text-[#2f6fed]">Admin</span>
          </h1>
          <p className="mt-1.5 text-[15px] text-[#64748b] dark:text-[#9aa8ba]">
            Here&apos;s what your customers are saying across your workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-[#e2e9f1] bg-white px-3 py-2.5 text-xs font-medium text-[#66758a] shadow-sm dark:border-[#2b394b] dark:bg-[#111923] dark:text-[#9aa8ba] sm:flex">
            <CalendarDays size={15} className="text-[#2f6fed]" />
            Last 30 days
            <span className="text-[#b0bac7]">•</span>
            {today}
          </div>

          <a
            href="/ask"
            className="group flex items-center gap-3 rounded-xl border border-[#dce7fb] bg-[#f1f6ff] px-4 py-2.5 transition hover:border-[#c9dafa] hover:bg-[#eaf2ff] dark:border-[#263b60] dark:bg-[#101b30] dark:hover:border-[#34558a] dark:hover:bg-[#14243d]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#2f6fed] shadow-sm dark:bg-[#182a46] dark:text-[#76a9ff]">
              <Sparkles size={16} />
            </span>
            <span className="text-left">
              <span className="block text-xs font-bold text-[#17263a] dark:text-[#eef3f9]">Ask LOOP</span>
              <span className="block text-[10px] text-[#718096] dark:text-[#8d9aad]">Get instant insights</span>
            </span>
            <ArrowRight size={16} className="text-[#2f6fed] transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          Unable to load dashboard data: {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total feedback"
          value={loading ? "—" : stats?.totalFeedback ?? 0}
          helper="Across all channels"
          icon={MessageSquare}
          tone="blue"
        />
        <StatCard
          label="Negative feedback"
          value={loading ? "—" : `${stats?.negativePercent ?? 0}%`}
          helper="Of current feedback"
          icon={ThumbsDown}
          tone="red"
        />
        <StatCard
          label="New this week"
          value={loading ? "—" : stats?.newThisWeek ?? 0}
          helper="Needs review"
          icon={MessageCircle}
          tone="amber"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <Panel
          title="Feedback volume"
          subtitle="Incoming feedback over time"
          icon={MessageCircle}
          action={
            <span className="rounded-lg border border-[#e2e9f1] dark:border-[#2b394b] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#69788c] dark:text-[#9aa8ba]">
              Last 30 days
            </span>
          }
        >
          <VolumeChart data={volume} />
        </Panel>

        <Panel
          title="Sentiment breakdown"
          subtitle="Positive, neutral and negative feedback"
          icon={BarChart3}
          action={
            <span className="rounded-lg border border-[#e2e9f1] dark:border-[#2b394b] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#69788c] dark:text-[#9aa8ba]">
              Current
            </span>
          }
        >
          <SentimentChart data={sentiment} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <Panel
          title="Top themes"
          subtitle="Most frequently mentioned customer themes"
          icon={BarChart3}
          action={
            <span className="rounded-lg border border-[#e2e9f1] dark:border-[#2b394b] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#69788c] dark:text-[#9aa8ba]">
              Top {Math.min(themes.length, 7)}
            </span>
          }
        >
          <ThemeBarChart data={themes.slice(0, 7)} />
        </Panel>

        <Panel
          title="Recent feedback"
          subtitle="Latest customer feedback across all channels"
          icon={MessageSquare}
          action={
            <a href="/inbox" className="text-[11px] font-bold text-[#2f6fed] hover:underline">
              View all
            </a>
          }
        >
          <div className="divide-y divide-[#edf1f5] dark:divide-[#273447]">
            {loading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-12 animate-pulse rounded-lg bg-[#f3f6fa] dark:bg-[#182230]" />
                ))}
              </div>
            ) : recent.length ? (
              recent.map((item) => (
                <a
                  key={item.id}
                  href={`/inbox/${item.id}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] dark:bg-[#1a2532]">
                    <SentimentIcon sentiment={item.sentiment} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#25354a] dark:text-[#e5ebf2]">
                      {item.text}
                    </p>
                    <p className="mt-1 text-[10px] text-[#8a96a7] dark:text-[#8d9aad]">
                      {item.channel.replace("_", " ")} • {formatDate(item.createdAt)}
                    </p>
                  </div>
                  {item.themes?.[0] && typeof item.themes[0] !== "string" && (
                    <span className="hidden max-w-[130px] truncate rounded-full bg-[#eef4ff] dark:bg-[#162b4a] px-2.5 py-1 text-[9px] font-semibold text-[#356dc7] dark:text-[#8db8ff] sm:block">
                      {item.themes[0].name}
                    </span>
                  )}
                </a>
              ))            ) : (
              <div className="py-10 text-center text-sm text-[#8491a3] dark:text-[#8d9aad]">
                No feedback yet.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
