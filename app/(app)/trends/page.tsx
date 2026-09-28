"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Minus,
  TrendingUp,
  Layers3,
  Activity,
} from "lucide-react";

import { ThemeBarChart } from "@/components/charts/theme-bar-chart";
import { VolumeChart } from "@/components/charts/volume-chart";
import { api } from "@/lib/api";
import type { Theme, TrendPoint } from "@/lib/types";

type Period = "7d" | "30d" | "90d";

const periodLabels: Record<Period, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const formatChange = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(1);

export default function TrendsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [volume, setVolume] = useState<TrendPoint[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrends() {
      setLoading(true);
      setError("");

      try {
        const [volumeData, themeData] = await Promise.all([
          api.getVolumeTrend(period),
          api.getThemeTrends(period),
        ]);

        setVolume(volumeData);
        setThemes(themeData);
      } catch (err) {
        console.error("Failed to load trends:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load trends",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTrends();
  }, [period]);

  const totalThemeFeedback = themes.reduce(
    (sum, theme) => sum + theme.count,
    0,
  );

  const growingThemes = themes.filter(
    (theme) => (theme.changePercent ?? 0) > 0,
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <TrendingUp size={15} />
            Analytics
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Trends & Themes
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Understand which customer topics are growing and where
            feedback is changing.
          </p>
        </div>

        <select
          className="input w-full sm:w-auto"
          value={period}
          onChange={(event) =>
            setPeriod(event.target.value as Period)
          }
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Period summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Period
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Activity size={17} />
            </div>
          </div>

          <p className="mt-4 text-xl font-bold text-ink">
            {periodLabels[period]}
          </p>

          <p className="mt-1 text-xs text-muted">
            Active analytics window
          </p>
        </div>

        <div className="card p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Theme feedback
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Layers3 size={17} />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold text-ink">
            {loading ? "—" : totalThemeFeedback}
          </p>

          <p className="mt-1 text-xs text-muted">
            Feedback associated with active themes
          </p>
        </div>

        <div className="card p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Growing themes
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <TrendingUp size={17} />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold text-ink">
            {loading ? "—" : growingThemes}
          </p>

          <p className="mt-1 text-xs text-muted">
            Themes with positive period change
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-700 dark:text-red-300">
          <span className="font-semibold">Unable to load trends.</span>
          <span>{error}</span>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-ink">
                  Feedback volume
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Feedback received during the selected period.
                </p>
              </div>

              <div className="rounded-xl bg-brand-soft p-2 text-brand">
                <Activity size={17} />
              </div>
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="h-72 animate-pulse rounded-2xl bg-surface-soft" />
            ) : volume.length === 0 ? (
              <div className="flex h-72 items-center justify-center rounded-2xl bg-surface-soft">
                <p className="text-sm text-muted">
                  No feedback volume found for this period.
                </p>
              </div>
            ) : (
              <VolumeChart data={volume} />
            )}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-ink">
                  Theme frequency
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Themes ranked by feedback count.
                </p>
              </div>

              <div className="rounded-xl bg-brand-soft p-2 text-brand">
                <Layers3 size={17} />
              </div>
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="h-72 animate-pulse rounded-2xl bg-surface-soft" />
            ) : themes.length === 0 ? (
              <div className="flex h-72 items-center justify-center rounded-2xl bg-surface-soft">
                <p className="text-sm text-muted">
                  No theme activity found for this period.
                </p>
              </div>
            ) : (
              <ThemeBarChart data={themes} />
            )}
          </div>
        </section>
      </div>

      {/* Theme changes */}
      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-line px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <TrendingUp size={18} />
            </div>

            <div>
              <h2 className="font-bold text-ink">
                Theme changes
              </h2>

              <p className="mt-1 text-xs text-muted">
                Comparison with the previous period of the same
                length.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-surface-soft"
              />
            ))}
          </div>
        ) : themes.length === 0 ? (
          <div className="p-10 text-center">
            <Layers3
              size={28}
              className="mx-auto text-muted"
            />

            <p className="mt-3 text-sm font-medium text-ink">
              No theme activity found
            </p>

            <p className="mt-1 text-xs text-muted">
              Try selecting a longer time period.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {themes.map((theme) => {
              const change = theme.changePercent ?? 0;

              return (
                <div
                  key={theme.id}
                  className="group flex items-center justify-between gap-5 px-6 py-4 transition-colors hover:bg-surface-soft"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/inbox?theme=${encodeURIComponent(theme.name)}`}
                      className="inline-flex items-center gap-2 font-semibold text-ink transition-colors hover:text-brand"
                    >
                      {theme.name}
                    </Link>

                    <p className="mt-1 text-xs text-muted">
                      {theme.count} feedback{" "}
                      {theme.count === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div
                    className={[
                      "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold",
                      change > 0
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : change < 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-surface-muted text-muted",
                    ].join(" ")}
                  >
                    {change > 0 ? (
                      <ArrowUp size={14} />
                    ) : change < 0 ? (
                      <ArrowDown size={14} />
                    ) : (
                      <Minus size={14} />
                    )}

                    {change > 0 ? "+" : ""}
                    {formatChange(change)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
