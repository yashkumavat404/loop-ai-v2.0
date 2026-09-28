"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  Mail,
  MessageSquareText,
  Sparkles,
  Tag,
  UserRound,
} from "lucide-react";

import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import type { Feedback, FeedbackStatus } from "@/lib/types";

const statusOrder: FeedbackStatus[] = [
  "NEW",
  "REVIEWED",
  "ACTIONED",
];

const formatLabel = (value: string) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function FeedbackDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  const [reclassifyMessage, setReclassifyMessage] = useState("");

  useEffect(() => {
    setLoading(true);

    api
      .getFeedbackById(params.id)
      .then((result) => {
        setFeedback(result);
      })
      .catch(() => {
        setFeedback(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  async function updateStatus(status: FeedbackStatus) {
    if (!feedback || feedback.status === status) return;

    try {
      setSaving(true);

      const updated = await api.updateFeedback(feedback.id, {
        status,
      });

      setFeedback(updated);
    } catch (error) {
      console.error("Failed to update feedback status:", error);
    } finally {
      setSaving(false);
    }
  }

  async function reclassifyWithAI() {
    if (!feedback) return;

    try {
      setReclassifying(true);
      setReclassifyMessage("");

      const response = await fetch(
        `/api/feedback/${feedback.id}/reclassify`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "AI reclassification failed.",
        );
      }

      const updatedFeedback = await api.getFeedbackById(
        feedback.id,
      );

      setFeedback(updatedFeedback);

      setReclassifyMessage(
        "Feedback was successfully reclassified by AI.",
      );
    } catch (error) {
      setReclassifyMessage(
        error instanceof Error
          ? error.message
          : "AI reclassification failed.",
      );
    } finally {
      setReclassifying(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          href="/inbox"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to inbox
        </Link>

        <section className="card overflow-hidden">
          <div className="animate-pulse p-6 sm:p-8">
            <div className="h-4 w-24 rounded bg-surface-muted" />
            <div className="mt-3 h-8 w-56 rounded bg-surface-muted" />
            <div className="mt-8 h-24 rounded-xl bg-surface-muted" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="h-20 rounded-xl bg-surface-muted" />
              <div className="h-20 rounded-xl bg-surface-muted" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          href="/inbox"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to inbox
        </Link>

        <section className="card p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
            <MessageSquareText size={22} className="text-muted" />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-ink">
            Feedback not found
          </h1>

          <p className="mt-1 text-sm text-muted">
            This feedback item may have been removed or is no longer
            available.
          </p>

          <Link
            href="/inbox"
            className="btn-primary mt-5"
          >
            Return to inbox
          </Link>
        </section>
      </div>
    );
  }

  const themes = (feedback.themes || []).map((theme) =>
    typeof theme === "string" ? theme : theme.name,
  );

  const currentStatusIndex = statusOrder.indexOf(feedback.status);

  const sentimentTone =
    feedback.sentiment === "NEGATIVE"
      ? "negative"
      : feedback.sentiment === "POSITIVE"
        ? "positive"
        : "neutral";

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/inbox"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to inbox
      </Link>

      <div className="space-y-5">
        {/* Header */}
        <section className="card overflow-hidden">
          <div className="border-b border-line bg-surface-soft px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <UserRound size={22} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Customer feedback
                  </p>

                  <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-ink">
                    {feedback.customerName || "Anonymous customer"}
                  </h1>

                  {feedback.customerEmail && (
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                      <Mail size={14} />
                      {feedback.customerEmail}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Badge>{formatLabel(feedback.channel)}</Badge>

                <Badge>{formatLabel(feedback.status)}</Badge>

                <Badge tone={sentimentTone}>
                  {formatLabel(feedback.sentiment || "UNCLASSIFIED")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Feedback content */}
          <div className="px-6 py-7 sm:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              <MessageSquareText size={14} />
              Feedback
            </div>

            <blockquote className="mt-4 rounded-2xl border border-line bg-surface-soft px-5 py-5 text-base leading-7 text-ink sm:px-6 sm:text-lg">
              “{feedback.text}”
            </blockquote>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                {formatDate(feedback.createdAt)}
              </span>


            </div>
          </div>
        </section>

        {/* Classification */}
        <section className="grid gap-5 lg:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              <CircleDot size={14} />
              Sentiment
            </div>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-ink">
                  {formatLabel(feedback.sentiment || "UNCLASSIFIED")}
                </p>

                <p className="mt-1 text-xs text-muted">
                  AI classification
                </p>
              </div>

              {feedback.sentimentScore !== null &&
                feedback.sentimentScore !== undefined && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink">
                      {feedback.sentimentScore.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted">
                      Score
                    </p>
                  </div>
                )}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              <Tag size={14} />
              Feature area
            </div>

            <p className="mt-4 text-lg font-bold text-ink">
              {feedback.featureArea || "Not classified"}
            </p>

            <p className="mt-1 text-xs text-muted">
              Detected product area
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              <Clock3 size={14} />
              Channel
            </div>

            <p className="mt-4 text-lg font-bold text-ink">
              {formatLabel(feedback.channel)}
            </p>

            <p className="mt-1 text-xs text-muted">
              Feedback source
            </p>
          </div>
        </section>

        {/* Themes */}
        <section className="card p-6 sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              AI themes
            </p>

            <h2 className="mt-1 text-lg font-bold text-ink">
              Related themes
            </h2>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {themes.length ? (
              themes.map((theme) => (
                <Badge key={theme}>{theme}</Badge>
              ))
            ) : (
              <p className="text-sm text-muted">
                No themes assigned yet.
              </p>
            )}
          </div>
        </section>

        {/* AI classification */}
        <section className="card overflow-hidden">
          <div className="border-b border-line px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Sparkles size={19} />
              </div>

              <div>
                <h2 className="font-bold text-ink">
                  AI classification
                </h2>

                <p className="text-xs text-muted">
                  Re-run classification using the configured AI provider.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 sm:px-7">
            {reclassifyMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm text-ink">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-brand"
                />
                <span>{reclassifyMessage}</span>
              </div>
            )}

            <button
              type="button"
              disabled={reclassifying}
              className="btn-primary gap-2"
              onClick={reclassifyWithAI}
            >
              <Sparkles size={16} />

              {reclassifying
                ? "Reclassifying..."
                : "Reclassify with AI"}
            </button>
          </div>
        </section>

        {/* Status */}
        <section className="card p-6 sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Workflow
            </p>

            <h2 className="mt-1 text-lg font-bold text-ink">
              Feedback status
            </h2>

            <p className="mt-1 text-sm text-muted">
              Move this feedback through the review workflow.
            </p>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {statusOrder.map((status, index) => {
              const isCurrent = feedback.status === status;
              const isCompleted = index < currentStatusIndex;

              return (
                <button
                  key={status}
                  type="button"
                  disabled={
                    saving ||
                    index < currentStatusIndex ||
                    index > currentStatusIndex + 1
                  }
                  onClick={() => updateStatus(status)}
                  className={[
                    "rounded-xl border px-4 py-3 text-left transition-all duration-200",
                    isCurrent
                      ? "border-brand bg-brand-soft"
                      : "border-line bg-surface hover:border-brand hover:bg-surface-soft",
                    saving ? "cursor-wait opacity-70" : "",
                    index < currentStatusIndex
                      ? "cursor-not-allowed opacity-60"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={
                        isCurrent
                          ? "text-sm font-bold text-brand-text"
                          : "text-sm font-semibold text-ink"
                      }
                    >
                      {formatLabel(status)}
                    </span>

                    {isCurrent || isCompleted ? (
                      <CheckCircle2
                        size={17}
                        className="text-brand"
                      />
                    ) : (
                      <CircleDot
                        size={17}
                        className="text-muted"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted">
                    {status === "NEW"
                      ? "Awaiting review"
                      : status === "REVIEWED"
                        ? "Reviewed by the team"
                        : "Action completed"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

