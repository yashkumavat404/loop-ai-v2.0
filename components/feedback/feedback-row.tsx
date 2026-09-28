"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Feedback } from "@/lib/types";

function sentimentTone(value?: Feedback["sentiment"]) {
  if (value === "POSITIVE") return "positive" as const;
  if (value === "NEGATIVE") return "negative" as const;
  return "neutral" as const;
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function FeedbackRow({ feedback }: { feedback: Feedback }) {
  const router = useRouter();

  const themeText = (feedback.themes || [])
    .map((theme) => (typeof theme === "string" ? theme : theme.name))
    .slice(0, 2)
    .join(", ");

  return (
    <button
      type="button"
      onClick={() => router.push(`/inbox/${feedback.id}`)}
      className="group w-full border-b border-line px-4 py-4 text-left transition-all duration-200 last:border-b-0 hover:bg-surface sm:px-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink">
              {feedback.customerName || "Anonymous customer"}
            </span>

            <Badge tone={sentimentTone(feedback.sentiment)}>
              {feedback.sentiment
                ? formatLabel(feedback.sentiment)
                : "Unclassified"}
            </Badge>

            <Badge>{formatLabel(feedback.status)}</Badge>
          </div>

          <p className="max-w-4xl text-sm leading-6 text-muted line-clamp-2">
            {feedback.text}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
            <span className="rounded-md bg-surface px-2 py-1 font-medium">
              {formatLabel(feedback.channel)}
            </span>

            {feedback.featureArea && (
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-indigo-400" />
                {feedback.featureArea}
              </span>
            )}

            {themeText && (
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-violet-400" />
                {themeText}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 md:flex-col md:items-end">
          <time className="text-xs text-muted">
            {new Date(feedback.createdAt).toLocaleDateString()}
          </time>

          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

