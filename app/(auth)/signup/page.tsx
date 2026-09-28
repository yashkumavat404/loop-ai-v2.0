"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Building2,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          workspaceName: workspace,
          email,
          password,
        }),
      });

      const data: unknown = await response.json();

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

      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!loginResult || loginResult.error) {
        setError(
          "Your workspace was created. Please sign in with your new account.",
        );
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-5 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
            L
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            <Sparkles size={13} />
            Customer Intelligence
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Create your LOOP workspace
          </h1>

          <p className="mt-2 text-sm text-muted">
            Start turning customer feedback into actionable insight.
          </p>
        </div>

        <form onSubmit={submit} className="card overflow-hidden">
          <div className="border-b border-line bg-surface-soft px-6 py-5">
            <h2 className="font-bold text-ink">Create your account</h2>
            <p className="mt-1 text-xs text-muted">
              Your account will become the workspace administrator.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-muted"
              >
                Your name
              </label>
              <div className="relative">
                <UserRound
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="name"
                  className="input pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="workspace"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-muted"
              >
                Workspace name
              </label>
              <div className="relative">
                <Building2
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="workspace"
                  className="input pl-10"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  required
                  placeholder="Your company or team"
                />
              </div>
            </div>

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
                  minLength={8}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </div>
              <p className="mt-2 text-[11px] text-muted">
                Use at least 8 characters for your password.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
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
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[11px] font-medium text-muted">LOOP</span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link
                className="font-semibold text-brand transition-colors hover:text-[var(--brand-hover)]"
                href="/login"
              >
                Sign in
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
