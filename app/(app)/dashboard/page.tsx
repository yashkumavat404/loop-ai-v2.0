"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  MessageCircle,
  MessageSquare,
  TrendingDown,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { VolumeChart } from "@/components/charts/volume-chart";
import { SentimentChart } from "@/components/charts/sentiment-chart";
import { ThemeBarChart } from "@/components/charts/theme-bar-chart";
import { api } from "@/lib/api";
import type {
  DashboardStats,
  SentimentPoint,
  Theme,
  TrendPoint,
} from "@/lib/types";

function DashboardStat({
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
  tone: "indigo" | "rose" | "amber";
}) {
  const tones = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
      glow: "from-indigo-500/10",
    },
    rose: {
      icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
      glow: "from-rose-500/10",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      glow: "from-amber-500/10",
    },
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-[#0f141d]">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tones[tone].glow} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
            {value}
          </p>

          <p className="mt-1.5 text-xs text-muted">{helper}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone].icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  badge,
  children,
  className = "",
}: {
  title: string;
  description: string;
  icon: typeof MessageCircle;
  iconClassName: string;
  badge: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 hover:shadow-lg dark:bg-[#0f141d] ${className}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-ink">
              {title}
            </h2>

            <p className="mt-1 text-xs text-muted">
              {description}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
          {badge}
        </span>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [volume, setVolume] = useState<TrendPoint[]>([]);
  const [sentiment, setSentiment] = useState<SentimentPoint[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [
          dashboardStats,
          volumeData,
          sentimentData,
          themeData,
        ] = await Promise.all([
          api.getDashboardStats(),
          api.getVolumeTrend(),
          api.getSentimentTrend(),
          api.getTopThemes(),
        ]);

        setStats(dashboardStats);
        setVolume(volumeData);
        setSentiment(sentimentData as unknown as SentimentPoint[]);
        setThemes(themeData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <PageHeader
        title="Dashboard"
        description="A quick view of what customers are saying across your workspace."
      />

      <div className="mb-6 flex items-center gap-2 text-xs text-muted">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span>Workspace intelligence</span>
        <ArrowUpRight className="h-3.5 w-3.5" />
        <span>Live data</span>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          Unable to load dashboard data: {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardStat
          label="Total feedback"
          value={loading ? "—" : stats?.totalFeedback ?? 0}
          helper="Across all channels"
          icon={MessageSquare}
          tone="indigo"
        />

        <DashboardStat
          label="Negative feedback"
          value={loading ? "—" : `${stats?.negativePercent ?? 0}%`}
          helper="Of current feedback"
          icon={TrendingDown}
          tone="rose"
        />

        <DashboardStat
          label="New this week"
          value={loading ? "—" : stats?.newThisWeek ?? 0}
          helper="Needs review"
          icon={MessageCircle}
          tone="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Feedback volume"
          description="Incoming feedback over time"
          icon={MessageCircle}
          iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          badge="30 days"
        >
          <VolumeChart data={volume} />
        </ChartCard>

        <ChartCard
          title="Sentiment breakdown"
          description="Positive, neutral and negative feedback"
          icon={TrendingDown}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          badge="Current"
        >
          <SentimentChart data={sentiment} />
        </ChartCard>

        <ChartCard
          title="Top themes"
          description="Most frequently mentioned customer themes"
          icon={BarChart3}
          iconClassName="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
          badge="Top 7"
          className="xl:col-span-2"
        >
          <ThemeBarChart data={themes} />
        </ChartCard>
      </div>
    </div>
  );
}
