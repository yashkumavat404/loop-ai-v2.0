"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Upload,
  Radio,
  Inbox,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { FeedbackFilters } from "@/components/feedback/feedback-filters";
import { FeedbackRow } from "@/components/feedback/feedback-row";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { api } from "@/lib/api";
import type { Feedback } from "@/lib/types";

export default function InboxPage() {
  const [items, setItems] = useState<Feedback[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [channel, setChannel] = useState("");
  const [theme, setTheme] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get("theme");

    if (urlTheme) {
      setTheme(urlTheme);
      setPage(1);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFeedback() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });

      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (sentiment) params.set("sentiment", sentiment);
      if (channel) params.set("channel", channel);
      if (theme) params.set("theme", theme);

      try {
        const result = await api.getFeedback(params);

        if (cancelled) return;

        setItems(result.items);
        setTotalPages(result.totalPages);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load feedback:", err);

        setItems([]);
        setTotalPages(1);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load feedback",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFeedback();

    return () => {
      cancelled = true;
    };
  }, [page, search, status, sentiment, channel, theme]);

  async function simulateFeedback() {
    setSimulating(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/feedback/simulate", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to simulate feedback",
        );
      }

      setMessage("Simulated support feedback received.");
      setPage(1);

      const params = new URLSearchParams({
        page: "1",
        pageSize: "20",
      });

      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (sentiment) params.set("sentiment", sentiment);
      if (channel) params.set("channel", channel);
      if (theme) params.set("theme", theme);

      const refreshed = await api.getFeedback(params);

      setItems(refreshed.items);
      setTotalPages(refreshed.totalPages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to simulate feedback",
      );
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <PageHeader
        eyebrow="CUSTOMER FEEDBACK"
        title="Feedback Inbox"
        description="Search, filter and manage customer feedback."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              onClick={simulateFeedback}
              disabled={simulating}
            >
              <Radio size={16} className="mr-2" />
              {simulating ? "Simulating..." : "Simulate feedback"}
            </button>

            <Link href="/inbox/import" className="btn-secondary">
              <Upload size={16} className="mr-2" />
              Import CSV
            </Link>

            <button
              className="btn-primary"
              onClick={() => setShowForm((value) => !value)}
            >
              <Plus size={16} className="mr-2" />
              Add feedback
            </button>
          </div>
        }
      />

      {message && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
            <Sparkles className="h-4 w-4" />
          </div>
          {message}
        </div>
      )}

      {showForm && (
        <section className="mb-5 overflow-hidden rounded-2xl border border-[#e2e9f1] bg-white shadow-[0_4px_18px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-3 border-b border-[#edf1f5] px-5 py-4 dark:border-[#273447]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]">
                <Inbox className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-[#17263a] dark:text-[#eef3f9]">
                  Add customer feedback
                </h2>

                <p className="mt-0.5 text-xs text-[#8491a3] dark:text-[#8d9aad]">
                  Add a feedback item to the current workspace.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <FeedbackForm
              onCreated={() => {
                setShowForm(false);
                setPage(1);
              }}
            />
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e2e9f1] bg-white shadow-[0_4px_18px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#edf1f5] p-4 dark:border-[#273447] sm:p-5">
          <FeedbackFilters
            search={search}
            status={status}
            sentiment={sentiment}
            channel={channel}
            theme={theme}
            onSearch={(value) => {
              setPage(1);
              setSearch(value);
            }}
            onStatus={(value) => {
              setPage(1);
              setStatus(value);
            }}
            onSentiment={(value) => {
              setPage(1);
              setSentiment(value);
            }}
            onChannel={(value) => {
              setPage(1);
              setChannel(value);
            }}
            onTheme={(value) => {
              setPage(1);
              setTheme(value);
            }}
          />
        </div>

        <div className="border-t border-[#edf1f5] dark:border-[#273447]">
          {loading ? (
            <div className="p-14 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-900 dark:border-t-indigo-400" />

              <p className="mt-4 text-sm font-semibold text-ink">
                Loading feedback
              </p>

              <p className="mt-1 text-xs text-muted">
                Fetching the latest customer feedback.
              </p>
            </div>
          ) : error ? (
            <div className="p-14 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <Inbox className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-semibold text-red-600 dark:text-red-400">
                Unable to load feedback
              </p>

              <p className="mx-auto mt-1 max-w-md text-xs text-muted">
                {error}
              </p>
            </div>
          ) : items.length ? (
            <div>
              {items.map((feedback) => (
                <FeedbackRow
                  key={feedback.id}
                  feedback={feedback}
                />
              ))}
            </div>
          ) : (
            <div className="p-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#8290a3] dark:bg-[#182230] dark:text-[#8d9aad]">
                <Inbox className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-semibold text-ink">
                No feedback found
              </p>

              <p className="mt-1 text-xs text-muted">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#edf1f5] bg-[#fafbfd] px-4 py-3 dark:border-[#273447] dark:bg-[#0d141e]">
          <p className="text-xs font-medium text-[#7b899c] dark:text-[#8d9aad]">
            Page <span className="text-[#34455b] dark:text-[#dbe4ef]">{page}</span> of{" "}
            <span className="text-[#34455b] dark:text-[#dbe4ef]">{totalPages}</span>
          </p>

          <div className="flex gap-2">
            <button
              className="btn-secondary !px-3 !py-2"
              disabled={page === 1 || loading}
              onClick={() =>
                setPage((current) => current - 1)
              }
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Previous</span>
            </button>

            <button
              className="btn-secondary !px-3 !py-2"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) => current + 1)
              }
              aria-label="Next page"
            >
              <span className="mr-1 hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
