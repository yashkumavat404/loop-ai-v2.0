"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-5 py-10">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
            L
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            <Sparkles size={13} />
            Customer Intelligence
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Welcome to LOOP
          </h1>

          <p className="mt-2 text-sm text-muted">
            Turn customer feedback into actionable insight.
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={submit}
          className="card overflow-hidden"
        >
          <div className="border-b border-line bg-surface-soft px-6 py-5">
            <h2 className="font-bold text-ink">
              Sign in to your workspace
            </h2>

            <p className="mt-1 text-xs text-muted">
              Enter your account credentials to continue.
            </p>
          </div>

          <div className="space-y-5 p-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-muted"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  id="email"
                  className="input pl-10"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-muted"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  id="password"
                  className="input pl-10"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary group w-full gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[11px] font-medium text-muted">
                LOOP
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <p className="text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link
                className="font-semibold text-brand transition-colors hover:text-[var(--brand-hover)]"
                href="/signup"
              >
                Create one
              </Link>
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted">
          AI-powered customer feedback intelligence platform
        </p>
      </div>
    </main>
  );
}
