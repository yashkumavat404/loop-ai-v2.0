"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, CircleDot } from "lucide-react";

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

function sentimentDot(value?: Feedback["sentiment"]) {
  if (value === "POSITIVE") return "bg-emerald-500";
  if (value === "NEGATIVE") return "bg-rose-500";
  return "bg-slate-400 dark:bg-slate-500";
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
      className="group w-full border-b border-[#edf1f5] px-4 py-4 text-left transition-colors duration-200 last:border-b-0 hover:bg-[#f8faff] dark:border-[#273447] dark:hover:bg-[#131d2a] sm:px-5"
    >
      <div className="flex gap-4">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e2e9f1] bg-[#f7f9fc] text-[#63758c] dark:border-[#2b394b] dark:bg-[#172231] dark:text-[#9aabc0]">
          <CircleDot className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-[#1b2b40] dark:text-[#edf3fa]">
                {feedback.customerName || "Anonymous customer"}
              </span>

              <Badge tone={sentimentTone(feedback.sentiment)}>
                <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${sentimentDot(feedback.sentiment)}`} />
                {feedback.sentiment
                  ? formatLabel(feedback.sentiment)
                  : "Unclassified"}
              </Badge>

              <Badge>{formatLabel(feedback.status)}</Badge>
            </div>

            <time className="text-[10px] font-medium text-[#8996a8] dark:text-[#8291a5]">
              {new Date(feedback.createdAt).toLocaleDateString()}
            </time>
          </div>

          <p className="mt-2 max-w-5xl text-[13px] leading-6 text-[#5e6e83] dark:text-[#b1bdcc] line-clamp-2">
            {feedback.text}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-medium text-[#8491a3] dark:text-[#8493a8]">
            <span className="rounded-md bg-[#f0f4f8] px-2 py-1 text-[#64758b] dark:bg-[#1b2736] dark:text-[#aebacc]">
              {formatLabel(feedback.channel)}
            </span>

            {feedback.featureArea && (
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#2f6fed]" />
                {feedback.featureArea}
              </span>
            )}

            {themeText && (
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#7d8ff2]" />
                {themeText}
              </span>
            )}
          </div>
        </div>

        <span className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e2e9f1] text-[#8390a3] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 dark:border-[#2b394b] dark:text-[#8d9aad] sm:flex">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}
