"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  XCircle,
} from "lucide-react";

type ImportFailure = {
  row: number;
  error: string;
};

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [failures, setFailures] = useState<ImportFailure[]>([]);
  const [loading, setLoading] = useState(false);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    setMessage("");
    setFailures([]);
  }

  async function upload() {
    if (!file) {
      setMessage("Choose a CSV file first.");
      setFailures([]);
      return;
    }

    setLoading(true);
    setMessage("");
    setFailures([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/feedback/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "CSV import failed");
      }

      const imported = result.data.imported;
      const failed = result.data.failed;
      const importFailures: ImportFailure[] =
        result.data.failures ?? [];

      setMessage(
        `Import completed: ${imported} record${
          imported === 1 ? "" : "s"
        } imported, ${failed} failed.`,
      );

      setFailures(importFailures);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "CSV import failed.",
      );
      setFailures([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/inbox"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to inbox
      </Link>

      <div className="space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <FileSpreadsheet size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Data ingestion
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
                Import feedback
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Upload customer feedback in CSV format and LOOP will
            process each valid record for AI classification.
          </p>
        </div>

        {/* Upload card */}
        <section className="card overflow-hidden">
          <div className="border-b border-line px-6 py-5 sm:px-7">
            <h2 className="font-semibold text-ink">
              Upload CSV file
            </h2>

            <p className="mt-1 text-xs text-muted">
              Select a CSV containing your customer feedback.
            </p>
          </div>

          <div className="p-6 sm:p-7">
            <label
              className={[
                "group block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-12",
                file
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-surface-soft hover:border-brand hover:bg-brand-soft",
              ].join(" ")}
            >
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFile}
              />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-brand shadow-sm">
                {file ? (
                  <FileSpreadsheet size={25} />
                ) : (
                  <Upload size={25} />
                )}
              </div>

              <p className="mt-5 font-semibold text-ink">
                {file
                  ? "CSV file selected"
                  : "Choose a CSV file to upload"}
              </p>

              <p className="mt-2 break-all text-sm text-muted">
                {file
                  ? file.name
                  : "Click here to browse your computer"}
              </p>

              <div className="mt-4 inline-flex rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
                CSV files only
              </div>
            </label>

            {file && (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-soft px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <FileSpreadsheet size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {file.name}
                    </p>

                    <p className="text-xs text-muted">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-xs font-medium text-brand">
                  Ready
                </span>
              </div>
            )}

            {/* Result */}
            {message && (
              <div
                className={[
                  "mt-5 flex items-start gap-3 rounded-xl border px-4 py-4 text-sm",
                  failures.length > 0
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                ].join(" ")}
              >
                {failures.length > 0 ? (
                  <XCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                )}

                <p className="leading-6">{message}</p>
              </div>
            )}

            {/* Failed rows */}
            {failures.length > 0 && (
              <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="mb-4">
                  <h2 className="font-semibold text-ink">
                    Failed rows
                  </h2>

                  <p className="mt-1 text-xs text-muted">
                    These rows could not be imported.
                  </p>
                </div>

                <div className="space-y-2">
                  {failures.map((failure) => (
                    <div
                      key={`${failure.row}-${failure.error}`}
                      className="rounded-xl border border-line bg-surface px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-ink">
                          Row {failure.row}
                        </span>

                        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          Failed
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-5 text-muted">
                        {failure.error}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                Valid rows will be added to your workspace.
              </p>

              <button
                type="button"
                className="btn-primary gap-2"
                onClick={upload}
                disabled={loading}
              >
                <Upload size={16} />

                {loading ? "Importing..." : "Import CSV"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
