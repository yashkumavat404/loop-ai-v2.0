"use client";

import { FormEvent, useState } from "react";
import {
  Bot,
  CheckCircle2,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react";

import { api } from "@/lib/api";
import type { AskResponse } from "@/lib/types";

const suggestions = [
  "What are customers saying about onboarding?",
  "Which themes are becoming more negative?",
  "What should the product team prioritize?",
];

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await api.askLoop(trimmedQuestion);
      setAnswer(result);
    } catch (err) {
      setAnswer(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate an answer right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  function useSuggestion(value: string) {
    setQuestion(value);
    setError("");
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <Sparkles size={15} />
          AI intelligence
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          Ask LOOP
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Ask questions in plain English and get evidence-backed
          answers from customer feedback.
        </p>
      </div>

      {/* Ask card */}
      <section className="card overflow-hidden">
        <div className="border-b border-line bg-surface-soft px-6 py-5 sm:px-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Bot size={22} />
            </div>

            <div>
              <h2 className="font-bold text-ink">
                Ask your feedback intelligence
              </h2>

              <p className="mt-1 text-xs leading-5 text-muted">
                LOOP searches relevant feedback from your workspace
                before generating an answer.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          {/* Grounding notice */}
          <div className="flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-4">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-brand"
            />

            <div>
              <p className="text-sm font-semibold text-brand-text">
                Grounded answers only
              </p>

              <p className="mt-1 text-xs leading-5 text-brand-text/80">
                Answers are generated from retrieved feedback in
                your current workspace and include the source items
                used.
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Try asking
            </p>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="btn-secondary text-left text-xs"
                  onClick={() => useSuggestion(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Question form */}
          <form onSubmit={submit} className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <MessageSquareText
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  className="input h-12 pl-11"
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Ask about customer feedback..."
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn-primary h-12 gap-2 px-6"
                disabled={loading || !question.trim()}
              >
                <Send size={16} />

                {loading ? "Thinking..." : "Ask LOOP"}
              </button>
            </div>
          </form>

          {loading && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-surface-soft px-4 py-3">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand [animation-delay:300ms]" />
              </div>

              <p className="text-xs text-muted">
                Searching relevant feedback and generating an
                evidence-backed answer...
              </p>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Answer */}
      {answer && (
        <section className="card mt-6 overflow-hidden">
          <div className="border-b border-line bg-surface-soft px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Bot size={19} />
              </div>

              <div>
                <h2 className="font-bold text-ink">
                  LOOP answer
                </h2>

                <p className="text-xs text-muted">
                  Generated from retrieved workspace feedback
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <div className="rounded-2xl border border-line bg-surface-soft px-5 py-5 sm:px-6">
              <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
                {answer.answer}
              </p>
            </div>

            {/* Sources */}
            <div className="mt-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    Evidence
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-ink">
                    Source feedback
                  </h3>
                </div>

                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
                  {answer.sources.length}{" "}
                  {answer.sources.length === 1
                    ? "source"
                    : "sources"}
                </span>
              </div>

              {answer.sources.length ? (
                <div className="mt-4 space-y-3">
                  {answer.sources.map((source, index) => (
                    <div
                      key={source.id}
                      className="rounded-2xl border border-line bg-surface p-4 transition-all duration-200 hover:border-brand/40 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm leading-6 text-ink">
                            {source.text}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                            <span>
                              {source.channel}
                            </span>

                            <span aria-hidden="true">
                              ·
                            </span>

                            <span>
                              {new Date(
                                source.createdAt,
                              ).toLocaleDateString("en-IN")}
                            </span>

                            {source.sentiment && (
                              <>
                                <span aria-hidden="true">
                                  ·
                                </span>

                                <span>
                                  {source.sentiment}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-line bg-surface-soft p-6 text-center">
                  <p className="text-sm text-muted">
                    No source feedback was returned.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
