"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const created = searchParams.get("created") === "1";
  const createdEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(createdEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Unable to sign in. Please try again.");
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

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-[1fr_420px] lg:px-8">
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
            Understand the voice behind every piece of feedback.
          </p>

          <p className="mt-6 max-w-lg text-base leading-7 text-[#718096] dark:text-[#9aa8ba]">
            Bring customer feedback into one workspace, surface the themes
            that matter, and turn raw comments into clear product insight.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {[
              ["Feedback", "Capture customer voice"],
              ["Themes", "Find recurring patterns"],
              ["Insights", "Act on what matters"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-xl border border-[#dfe6ef] bg-white/80 px-4 py-4 shadow-sm backdrop-blur dark:border-[#273447] dark:bg-[#111923]/80"
              >
                <div className="mb-3 h-1.5 w-10 rounded-full bg-[#2f6fed]" />
                <p className="text-xs font-bold">{title}</p>
                <p className="mt-1 text-[10px] leading-4 text-[#8491a3] dark:text-[#8292a8]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
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

          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8da3] dark:text-[#8292a8]">
              Workspace access
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[#718096] dark:text-[#9aa8ba]">
              Sign in to continue to your feedback workspace.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="overflow-hidden rounded-2xl border border-[#dfe6ef] bg-white shadow-[0_12px_35px_rgba(24,45,75,0.07)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_14px_40px_rgba(0,0,0,0.25)]"
          >
            <div className="border-b border-[#edf1f5] bg-[#fafbfd] px-6 py-5 dark:border-[#273447] dark:bg-[#0d141e]">
              <h2 className="font-bold">Sign in to your workspace</h2>
              <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">
                Enter your account credentials to continue.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {created && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400">
                  Workspace created successfully. Sign in to continue.
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">
                  Email
                </label>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                  <input id="email" className="input pl-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@company.com" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                  <input id="password" className="input pl-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary group w-full gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
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
                Don&apos;t have an account?{" "}
                <Link className="font-semibold text-[#2f6fed] hover:text-[#245bd0]" href="/signup">
                  Create one
                </Link>
              </p>
            </div>
          </form>

          <p className="mt-5 text-center text-[10px] text-[#8491a3] dark:text-[#8292a8]">
            LOOP · AI-powered customer feedback intelligence
          </p>
        </section>
      </div>
    </main>
  );
}
