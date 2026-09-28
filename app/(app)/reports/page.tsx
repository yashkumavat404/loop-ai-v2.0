"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Sparkles,
} from "lucide-react";

import { api } from "@/lib/api";
import type { Report } from "@/lib/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [start, setStart] = useState("2026-09-01");
  const [end, setEnd] = useState("2026-09-23");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    api
      .getReports()
      .then(setReports)
      .catch(() => {
        setMessage("Failed to load reports.");
      })
      .finally(() => {
        setLoadingReports(false);
      });
  }, []);

  async function generate(e: FormEvent) {
    e.preventDefault();

    if (!start || !end) {
      setMessage("Select both start and end dates.");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const report = await api.createReport(start, end);

      setReports((current) => [report, ...current]);
      setMessage("Report generated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to generate report.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <Sparkles size={15} />
          Voice of Customer
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          Customer insight reports
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Generate leadership-ready summaries from actual customer
          feedback data.
        </p>
      </div>

      {/* Generate */}
      <section className="card overflow-hidden">
        <div className="border-b border-line bg-surface-soft px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="font-bold text-ink">
                Generate a report
              </h2>

              <p className="mt-1 text-xs text-muted">
                Choose the period you want LOOP to analyze.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <form
            onSubmit={generate}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                From
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  className="input pl-10"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                To
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  className="input pl-10"
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary self-end gap-2"
              disabled={loading}
            >
              <Sparkles size={16} />

              {loading
                ? "Generating..."
                : "Generate report"}
            </button>
          </form>

          {loading && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-surface-soft px-4 py-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />

              <p className="text-xs text-muted">
                LOOP is analyzing feedback and preparing your report...
              </p>
            </div>
          )}

          {message && !loading && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm text-ink">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-brand"
              />

              <span>{message}</span>
            </div>
          )}
        </div>
      </section>

      {/* Reports */}
      <div className="mt-7">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Saved reports
            </p>

            <h2 className="mt-1 text-lg font-bold text-ink">
              Generated insights
            </h2>
          </div>

          {!loadingReports && (
            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
              {reports.length}{" "}
              {reports.length === 1 ? "report" : "reports"}
            </span>
          )}
        </div>

        {loadingReports ? (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="card h-48 animate-pulse bg-surface-soft"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <section className="card p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-muted">
              <FileText size={22} />
            </div>

            <h3 className="mt-4 font-semibold text-ink">
              No reports yet
            </h3>

            <p className="mt-1 text-sm text-muted">
              Generate your first Voice of Customer report above.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <article
                key={report.id}
                className="card overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-5 px-6 py-5 sm:px-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <FileText size={20} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-bold text-ink">
                          {report.title}
                        </h2>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                          <span>
                            {report.periodStart}
                          </span>

                          <span aria-hidden="true">
                            →
                          </span>

                          <span>
                            {report.periodEnd}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-secondary shrink-0 gap-2"
                      onClick={() => {
                        window.open(
                          `/api/reports/export?id=${report.id}`,
                          "_blank",
                        );
                      }}
                    >
                      <Download size={16} />
                      Export PDF
                    </button>
                  </div>

                  <div className="rounded-2xl border border-line bg-surface-soft px-5 py-4">
                    <p className="text-sm leading-7 text-ink">
                      {report.summary}
                    </p>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                      Top themes
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {report.topThemes.length ? (
                        report.topThemes.map((theme) => (
                          <span
                            key={theme.name}
                            className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink"
                          >
                            {theme.name}
                            <span className="ml-1.5 text-muted">
                              · {theme.count}
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted">
                          No themes available.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
