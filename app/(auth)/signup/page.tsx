"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";


export default function SignupPage() {
  const [name, setName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");

    const normalizedName = name.trim();
    const normalizedWorkspace = workspace.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      setError("Please enter your name.");
      return;
    }

    if (normalizedWorkspace.length < 2) {
      setError("Please enter a workspace name.");
      return;
    }

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          workspaceName: normalizedWorkspace,
          email: normalizedEmail,
          password,
        }),
      });

      const responseText = await response.text();
      let data: unknown = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Unable to create your account.";

        setError(message);
        return;
      }

      window.location.href = `/login?created=1&email=${encodeURIComponent(normalizedEmail)}`;
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] text-[#17263a] dark:bg-[#080d14] dark:text-[#eef3f9]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[440px] w-[440px] rounded-full bg-[#2f6fed]/10 blur-3xl dark:bg-[#2f6fed]/12" />
        <div className="absolute -bottom-48 -right-40 h-[500px] w-[500px] rounded-full bg-[#2f6fed]/8 blur-3xl dark:bg-[#2f6fed]/10" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-5 py-8 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="hidden lg:block">
          <div className="mb-9 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f6fed] text-lg font-bold text-white shadow-[0_8px_24px_rgba(47,111,237,0.25)]">
              L
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">LOOP</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8491a3] dark:text-[#8292a8]">
                Customer intelligence
              </p>
            </div>
          </div>

          <p className="max-w-xl text-5xl font-bold leading-[1.05] tracking-[-0.04em]">
            Build one clear view of what your customers are saying.
          </p>

          <p className="mt-6 max-w-lg text-base leading-7 text-[#718096] dark:text-[#9aa8ba]">
            Create a workspace for feedback, themes, sentiment and AI-assisted
            customer insight.
          </p>

          <div className="mt-10 max-w-lg space-y-3">
            {[
              "One workspace for customer voice",
              "AI-assisted classification and themes",
              "Grounded insights from real feedback",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-[#dfe6ef] bg-white/80 px-4 py-3 text-xs font-semibold shadow-sm backdrop-blur dark:border-[#273447] dark:bg-[#111923]/80">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#2f6fed]" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f6fed] text-lg font-bold text-white">
              L
            </div>
            <div>
              <p className="text-sm font-bold">LOOP</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8491a3] dark:text-[#8292a8]">
                Customer intelligence
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8da3] dark:text-[#8292a8]">
              Get started
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Create your workspace
            </h1>
            <p className="mt-2 text-sm text-[#718096] dark:text-[#9aa8ba]">
              Set up your account and start bringing customer feedback together.
            </p>
          </div>

          <div
            className="overflow-hidden rounded-2xl border border-[#dfe6ef] bg-white shadow-[0_12px_35px_rgba(24,45,75,0.07)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_14px_40px_rgba(0,0,0,0.25)]">
            <div className="border-b border-[#edf1f5] bg-[#fafbfd] px-6 py-5 dark:border-[#273447] dark:bg-[#0d141e]">
              <h2 className="font-bold">Create your account</h2>
              <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">
                Your account will become the workspace administrator.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label htmlFor="name" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">Your name</label>
                <div className="relative">
                  <UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                  <input id="name" className="input pl-10" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" placeholder="Your full name" />
                </div>
              </div>

              <div>
                <label htmlFor="workspace" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">Workspace name</label>
                <div className="relative">
                  <Building2 size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                  <input id="workspace" className="input pl-10" value={workspace} onChange={(e) => setWorkspace(e.target.value)} required placeholder="Your company or team" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">Email</label>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                  <input id="email" className="input pl-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@company.com" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">Password</label>
                <div className="relative">
                  <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                  <input id="password" className="input pl-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" placeholder="At least 8 characters" />
                </div>
                <p className="mt-2 text-[11px] text-[#8491a3] dark:text-[#8292a8]">Use at least 8 characters for your password.</p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  void submit();
                }}
                className="btn-primary group w-full gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating workspace...
                  </>
                ) : (
                  <>
                    Create workspace
                    <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e5eaf0] dark:bg-[#293647]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8491a3] dark:text-[#8292a8]">LOOP</span>
                <div className="h-px flex-1 bg-[#e5eaf0] dark:bg-[#293647]" />
              </div>

              <p className="text-center text-sm text-[#718096] dark:text-[#9aa8ba]">
                Already have an account?{" "}
                <Link className="font-semibold text-[#2f6fed] hover:text-[#245bd0]" href="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] text-[#8491a3] dark:text-[#8292a8]">
            LOOP · AI-powered customer feedback intelligence
          </p>
        </section>
      </div>
    </main>
  );
}
