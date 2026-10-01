"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileSpreadsheet, Upload, XCircle } from "lucide-react";

type ImportFailure = { row: number; error: string };

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
      const response = await fetch("/api/feedback/import", { method: "POST", body: formData, credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "CSV import failed");
      const imported = result.data.imported;
      const failed = result.data.failed;
      const fallbackClassified = result.data.fallbackClassified ?? 0;
      setMessage(`Import completed: ${imported} record${imported === 1 ? "" : "s"} imported, ${failed} failed${fallbackClassified ? `, ${fallbackClassified} processed with resilient AI fallback` : ""}.`);
      setFailures(result.data.failures ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "CSV import failed.");
      setFailures([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/inbox" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#6f8095] transition-colors hover:text-[#2f6fed] dark:text-[#8d9aad] dark:hover:text-[#76a9ff]">
        <ArrowLeft size={15} /> Back to inbox
      </Link>

      <div className="mb-6">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8da3] dark:text-[#8292a8]">DATA INGESTION</p>
        <h1 className="text-[28px] font-bold tracking-tight text-[#17263a] dark:text-[#f3f6fb]">Import feedback</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#718096] dark:text-[#9aa8ba]">Upload customer feedback in CSV format and LOOP will process each valid record for AI classification.</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e2e9f1] bg-white shadow-[0_4px_18px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#edf1f5] px-6 py-5 dark:border-[#273447] sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]"><FileSpreadsheet size={18} /></div>
            <div>
              <h2 className="font-bold text-[#17263a] dark:text-[#eef3f9]">Upload CSV file</h2>
              <p className="mt-0.5 text-xs text-[#8491a3] dark:text-[#8d9aad]">Select a CSV containing your customer feedback.</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <label className={`group block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-12 ${file ? "border-[#2f6fed] bg-[#eef4ff] dark:border-[#4d88ef] dark:bg-[#162b4a]" : "border-[#dce3eb] bg-[#f8fafc] hover:border-[#8fb1ed] hover:bg-[#f2f6fd] dark:border-[#2b394b] dark:bg-[#151e2a] dark:hover:border-[#34558a] dark:hover:bg-[#18263a]"}`}>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#2f6fed] shadow-sm dark:bg-[#1b2a3d] dark:text-[#76a9ff]">
              {file ? <FileSpreadsheet size={25} /> : <Upload size={25} />}
            </div>
            <p className="mt-5 font-semibold text-[#17263a] dark:text-[#eef3f9]">{file ? "CSV file selected" : "Choose a CSV file to upload"}</p>
            <p className="mt-2 break-all text-sm text-[#8491a3] dark:text-[#8d9aad]">{file ? file.name : "Click here to browse your computer"}</p>
            <div className="mt-4 inline-flex rounded-full border border-[#e2e9f1] bg-white px-3 py-1 text-xs font-medium text-[#718096] dark:border-[#2b394b] dark:bg-[#1b2736] dark:text-[#aebacc]">CSV files only</div>
          </label>

          {file && (
            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-[#e2e9f1] bg-[#fafbfd] px-4 py-3 dark:border-[#2b394b] dark:bg-[#151e2a]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]"><FileSpreadsheet size={17} /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#17263a] dark:text-[#eef3f9]">{file.name}</p>
                  <p className="text-xs text-[#8491a3] dark:text-[#8d9aad]">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-bold text-[#2f6fed] dark:text-[#76a9ff]">Ready</span>
            </div>
          )}

          {message && (
            <div className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-4 text-sm ${failures.length > 0 ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
              {failures.length > 0 ? <XCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
              <p className="leading-6">{message}</p>
            </div>
          )}

          {failures.length > 0 && (
            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="mb-4">
                <h2 className="font-bold text-[#17263a] dark:text-[#eef3f9]">Failed rows</h2>
                <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">These rows could not be imported.</p>
              </div>
              <div className="space-y-2">
                {failures.map((failure) => (
                  <div key={`${failure.row}-${failure.error}`} className="rounded-xl border border-[#e2e9f1] bg-white px-4 py-3 dark:border-[#2b394b] dark:bg-[#151e2a]">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-[#17263a] dark:text-[#eef3f9]">Row {failure.row}</span>
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">Failed</span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-[#718096] dark:text-[#aebacc]">{failure.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-[#edf1f5] pt-5 dark:border-[#273447] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#8491a3] dark:text-[#8d9aad]">Valid rows will be added to your workspace.</p>
            <button type="button" className="btn-primary gap-2" onClick={upload} disabled={loading}>
              <Upload size={16} /> {loading ? "Importing..." : "Import CSV"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}