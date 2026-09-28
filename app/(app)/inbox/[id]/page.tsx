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

const statusOrder: FeedbackStatus[] = ["NEW", "REVIEWED", "ACTIONED"];

const formatLabel = (value: string) =>
  value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function FeedbackDetailPage({ params }: { params: { id: string } }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  const [reclassifyMessage, setReclassifyMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    api.getFeedbackById(params.id)
      .then(setFeedback)
      .catch(() => setFeedback(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function updateStatus(status: FeedbackStatus) {
    if (!feedback || feedback.status === status) return;
    try {
      setSaving(true);
      setFeedback(await api.updateFeedback(feedback.id, { status }));
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
      const response = await fetch(`/api/feedback/${feedback.id}/reclassify`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "AI reclassification failed.");
      setFeedback(await api.getFeedbackById(feedback.id));
      setReclassifyMessage("Feedback was successfully reclassified by AI.");
    } catch (error) {
      setReclassifyMessage(error instanceof Error ? error.message : "AI reclassification failed.");
    } finally {
      setReclassifying(false);
    }
  }

  const backLink = (
    <Link
      href="/inbox"
      className="inline-flex items-center gap-2 text-xs font-semibold text-[#6f8095] transition-colors hover:text-[#2f6fed] dark:text-[#8d9aad] dark:hover:text-[#76a9ff]"
    >
      <ArrowLeft size={15} />
      Back to inbox
    </Link>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        {backLink}
        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e9f1] bg-white shadow-[0_4px_18px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          <div className="animate-pulse p-6 sm:p-8">
            <div className="h-3 w-28 rounded bg-[#edf1f5] dark:bg-[#1b2736]" />
            <div className="mt-4 h-8 w-64 rounded bg-[#edf1f5] dark:bg-[#1b2736]" />
            <div className="mt-8 h-28 rounded-xl bg-[#f3f6fa] dark:bg-[#17212e]" />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-24 rounded-xl bg-[#f3f6fa] dark:bg-[#17212e]" />)}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="mx-auto max-w-6xl">
        {backLink}
        <section className="mt-5 rounded-2xl border border-[#e2e9f1] bg-white p-12 text-center shadow-[0_4px_18px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#8290a3] dark:bg-[#182230] dark:text-[#8d9aad]">
            <MessageSquareText size={22} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-[#17263a] dark:text-[#eef3f9]">Feedback not found</h1>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#8491a3] dark:text-[#8d9aad]">
            This feedback item may have been removed or is no longer available.
          </p>
          <Link href="/inbox" className="btn-primary mt-5">Return to inbox</Link>
        </section>
      </div>
    );
  }

  const themes = (feedback.themes || []).map((theme) => typeof theme === "string" ? theme : theme.name);
  const currentStatusIndex = statusOrder.indexOf(feedback.status);
  const sentimentTone = feedback.sentiment === "NEGATIVE" ? "negative" : feedback.sentiment === "POSITIVE" ? "positive" : "neutral";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5">{backLink}</div>

      <div className="mb-6">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8da3] dark:text-[#8292a8]">FEEDBACK DETAIL</p>
        <h1 className="text-[28px] font-bold tracking-tight text-[#17263a] dark:text-[#f3f6fb]">Customer feedback</h1>
        <p className="mt-1 text-sm text-[#718096] dark:text-[#9aa8ba]">Review classification, themes and workflow status.</p>
      </div>

      <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-[#e2e9f1] bg-white shadow-[0_4px_18px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          <div className="border-b border-[#edf1f5] bg-[#fafbfd] px-5 py-5 dark:border-[#273447] dark:bg-[#0d141e] sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]">
                  <UserRound size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7c8da3] dark:text-[#8292a8]">Customer</p>
                  <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-[#17263a] dark:text-[#f3f6fb]">
                    {feedback.customerName || "Anonymous customer"}
                  </h2>
                  {feedback.customerEmail && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8491a3] dark:text-[#8d9aad]">
                      <Mail size={13} /> {feedback.customerEmail}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Badge>{formatLabel(feedback.channel)}</Badge>
                <Badge>{formatLabel(feedback.status)}</Badge>
                <Badge tone={sentimentTone}>{formatLabel(feedback.sentiment || "UNCLASSIFIED")}</Badge>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7c8da3] dark:text-[#8292a8]">
              <MessageSquareText size={14} /> Feedback
            </div>
            <blockquote className="mt-4 rounded-xl border border-[#e2e9f1] bg-[#f7f9fc] px-5 py-5 text-base leading-7 text-[#25364b] dark:border-[#2b394b] dark:bg-[#151e2a] dark:text-[#dbe4ef] sm:px-6">
              “{feedback.text}”
            </blockquote>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#8491a3] dark:text-[#8d9aad]">
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{formatDate(feedback.createdAt)}</span>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {[
            {
              icon: CircleDot,
              label: "Sentiment",
              value: formatLabel(feedback.sentiment || "UNCLASSIFIED"),
              sub: feedback.sentimentScore !== null && feedback.sentimentScore !== undefined ? `AI score · ${feedback.sentimentScore.toFixed(2)}` : "AI classification",
            },
            { icon: Tag, label: "Feature area", value: feedback.featureArea || "Not classified", sub: "Detected product area" },
            { icon: Clock3, label: "Channel", value: formatLabel(feedback.channel), sub: "Feedback source" },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="rounded-2xl border border-[#e2e9f1] bg-white p-5 shadow-[0_4px_18px_rgba(24,45,75,0.035)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7c8da3] dark:text-[#8292a8]">
                <Icon size={14} /> {label}
              </div>
              <p className="mt-4 text-lg font-bold text-[#17263a] dark:text-[#eef3f9]">{value}</p>
              <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">{sub}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-[#e2e9f1] bg-white p-6 shadow-[0_4px_18px_rgba(24,45,75,0.035)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_28px_rgba(0,0,0,0.18)] sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7c8da3] dark:text-[#8292a8]">AI THEMES</p>
          <h2 className="mt-1 text-lg font-bold text-[#17263a] dark:text-[#eef3f9]">Related themes</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {themes.length ? themes.map((theme) => <Badge key={theme}>{theme}</Badge>) : <p className="text-sm text-[#8491a3] dark:text-[#8d9aad]">No themes assigned yet.</p>}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e2e9f1] bg-white shadow-[0_4px_18px_rgba(24,45,75,0.035)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
          <div className="border-b border-[#edf1f5] px-6 py-5 dark:border-[#273447] sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]"><Sparkles size={18} /></div>
              <div>
                <h2 className="font-bold text-[#17263a] dark:text-[#eef3f9]">AI classification</h2>
                <p className="text-xs text-[#8491a3] dark:text-[#8d9aad]">Re-run classification using the configured AI provider.</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 sm:px-7">
            {reclassifyMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#dce7fb] bg-[#f1f6ff] px-4 py-3 text-sm text-[#355f9e] dark:border-[#263b60] dark:bg-[#101b30] dark:text-[#a9c8ff]">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" /><span>{reclassifyMessage}</span>
              </div>
            )}
            <button type="button" disabled={reclassifying} className="btn-primary gap-2" onClick={reclassifyWithAI}>
              <Sparkles size={16} />{reclassifying ? "Reclassifying..." : "Reclassify with AI"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e2e9f1] bg-white p-6 shadow-[0_4px_18px_rgba(24,45,75,0.035)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_28px_rgba(0,0,0,0.18)] sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7c8da3] dark:text-[#8292a8]">WORKFLOW</p>
          <h2 className="mt-1 text-lg font-bold text-[#17263a] dark:text-[#eef3f9]">Feedback status</h2>
          <p className="mt-1 text-sm text-[#8491a3] dark:text-[#8d9aad]">Move this feedback through the review workflow.</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {statusOrder.map((status, index) => {
              const isCurrent = feedback.status === status;
              const isCompleted = index < currentStatusIndex;
              return (
                <button
                  key={status}
                  type="button"
                  disabled={saving || index < currentStatusIndex || index > currentStatusIndex + 1}
                  onClick={() => updateStatus(status)}
                  className={[
                    "rounded-xl border px-4 py-3 text-left transition-all duration-200",
                    isCurrent
                      ? "border-[#2f6fed] bg-[#eef4ff] dark:border-[#3f7ff0] dark:bg-[#162b4a]"
                      : "border-[#e2e9f1] bg-[#fafbfd] hover:border-[#9bbcf7] hover:bg-[#f5f8fd] dark:border-[#2b394b] dark:bg-[#151e2a] dark:hover:border-[#34558a] dark:hover:bg-[#18263a]",
                    saving ? "cursor-wait opacity-70" : "",
                    index < currentStatusIndex ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={isCurrent ? "text-sm font-bold text-[#2f6fed] dark:text-[#8db8ff]" : "text-sm font-semibold text-[#25364b] dark:text-[#dbe4ef]"}>
                      {formatLabel(status)}
                    </span>
                    {isCurrent || isCompleted ? <CheckCircle2 size={17} className="text-[#2f6fed] dark:text-[#76a9ff]" /> : <CircleDot size={17} className="text-[#8491a3] dark:text-[#8d9aad]" />}
                  </div>
                  <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">
                    {status === "NEW" ? "Awaiting review" : status === "REVIEWED" ? "Reviewed by the team" : "Action completed"}
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