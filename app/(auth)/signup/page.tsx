"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type Step = 1 | 2 | 3;

async function parseResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  function validateDetails() {
    const normalizedName = name.trim();
    const normalizedWorkspace = workspace.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      setError("Please enter your name.");
      return false;
    }

    if (normalizedWorkspace.length < 2) {
      setError("Please enter a workspace name.");
      return false;
    }

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }

    return true;
  }

  async function sendOtp() {
    if (loading || !validateDetails()) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/signup/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          name: name.trim(),
          workspaceName: workspace.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Unable to send the verification code.",
        );
        return;
      }

      setOtp("");
      setResendSeconds(60);
      setStep(2);
    } catch {
      setError("Unable to send the verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (loading) return;

    const normalizedOtp = otp.replace(/\D/g, "");

    if (normalizedOtp.length !== 4) {
      setError("Enter the 4-digit verification code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/signup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ otp: normalizedOtp }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "The verification code is incorrect.",
        );
        return;
      }

      setStep(3);
    } catch {
      setError("Unable to verify the code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function createWorkspace() {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Unable to create your workspace.",
        );
        return;
      }

      window.location.href = `/login?created=1&email=${encodeURIComponent(
        email.trim().toLowerCase(),
      )}`;
    } catch {
      setError("Unable to create your workspace. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (loading || resendSeconds > 0) return;

    await sendOtp();
  }

  function changeEmailDetails() {
    setError("");
    setStep(1);
  }

  const stepTitle =
    step === 1
      ? "Create your account"
      : step === 2
        ? "Verify your email"
        : "Create your workspace";

  const stepDescription =
    step === 1
      ? "Enter your details to get started."
      : step === 2
        ? `We sent a 4-digit code to ${email.trim().toLowerCase()}.`
        : "Your email is verified. Create your workspace to finish signup.";

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
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-[#dfe6ef] bg-white/80 px-4 py-3 text-xs font-semibold shadow-sm backdrop-blur dark:border-[#273447] dark:bg-[#111923]/80"
              >
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
              {stepTitle}
            </h1>
            <p className="mt-2 text-sm text-[#718096] dark:text-[#9aa8ba]">
              {stepDescription}
            </p>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`h-1.5 rounded-full transition-colors duration-200 ${
                  item <= step
                    ? "bg-[#2f6fed]"
                    : "bg-[#dfe6ef] dark:bg-[#273447]"
                }`}
              />
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#dfe6ef] bg-white shadow-[0_12px_35px_rgba(24,45,75,0.07)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_14px_40px_rgba(0,0,0,0.25)]">
            <div className="border-b border-[#edf1f5] bg-[#fafbfd] px-6 py-5 dark:border-[#273447] dark:bg-[#0d141e]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#2f6fed] dark:bg-[#162644]">
                  {step === 1 ? (
                    <UserRound size={19} />
                  ) : step === 2 ? (
                    <ShieldCheck size={19} />
                  ) : (
                    <Building2 size={19} />
                  )}
                </div>
                <div>
                  <h2 className="font-bold">
                    {step === 1
                      ? "Account details"
                      : step === 2
                        ? "Email verification"
                        : "Workspace ready"}
                  </h2>
                  <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">
                    Step {step} of 3
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              {step === 1 && (
                <>
                  <div>
                    <label htmlFor="name" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">
                      Your name
                    </label>
                    <div className="relative">
                      <UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                      <input id="name" className="input pl-10" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your full name" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="workspace" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">
                      Workspace name
                    </label>
                    <div className="relative">
                      <Building2 size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                      <input id="workspace" className="input pl-10" value={workspace} onChange={(e) => setWorkspace(e.target.value)} placeholder="Your company or team" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                      <input id="email" className="input pl-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">
                      Password
                    </label>
                    <div className="relative">
                      <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8491a3] dark:text-[#8292a8]" />
                      <input id="password" className="input pl-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
                    </div>
                    <p className="mt-2 text-[11px] text-[#8491a3] dark:text-[#8292a8]">
                      Use at least 8 characters for your password.
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void sendOtp()}
                    className="btn-primary group w-full gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending code...
                      </>
                    ) : (
                      <>
                        Send verification code
                        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="rounded-xl border border-[#dfe6ef] bg-[#f8faff] px-4 py-4 text-sm dark:border-[#273447] dark:bg-[#0d141e]">
                    <p className="font-semibold">Check your inbox</p>
                    <p className="mt-1 text-xs leading-5 text-[#718096] dark:text-[#9aa8ba]">
                      Enter the 4-digit code we sent to{" "}
                      <span className="font-semibold text-[#17263a] dark:text-[#eef3f9]">
                        {email.trim().toLowerCase()}
                      </span>
                      .
                    </p>
                  </div>

                  <div>
                    <label htmlFor="otp" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">
                      Verification code
                    </label>
                    <input
                      id="otp"
                      className="input h-14 text-center text-2xl font-bold tracking-[0.55em]"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 4));
                        setError("");
                      }}
                      placeholder="0000"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading || otp.length !== 4}
                    onClick={() => void verifyOtp()}
                    className="btn-primary w-full gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify email"}
                    {!loading && <CheckCircle2 size={16} />}
                  </button>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <button
                      type="button"
                      onClick={changeEmailDetails}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#64748b] hover:text-[#2f6fed] dark:text-[#94a3b8]"
                    >
                      <ArrowLeft size={14} />
                      Change details
                    </button>

                    <button
                      type="button"
                      disabled={loading || resendSeconds > 0}
                      onClick={() => void resendOtp()}
                      className="font-semibold text-[#2f6fed] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resendSeconds > 0
                        ? `Resend in ${resendSeconds}s`
                        : "Resend code"}
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" size={19} />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                          Email verified
                        </p>
                        <p className="mt-1 text-xs leading-5 text-emerald-700/80 dark:text-emerald-400/80">
                          {email.trim().toLowerCase()} is verified. Your account will be the workspace administrator.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#dfe6ef] bg-[#f8faff] px-4 py-4 dark:border-[#273447] dark:bg-[#0d141e]">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">
                      Workspace
                    </p>
                    <p className="mt-1 text-lg font-bold">{workspace.trim()}</p>
                    <p className="mt-1 text-xs text-[#718096] dark:text-[#9aa8ba]">
                      Administrator: {name.trim()}
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void createWorkspace()}
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
                </>
              )}

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e5eaf0] dark:bg-[#293647]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8491a3] dark:text-[#8292a8]">
                  LOOP
                </span>
                <div className="h-px flex-1 bg-[#e5eaf0] dark:bg-[#293647]" />
              </div>

              <p className="text-center text-sm text-[#718096] dark:text-[#9aa8ba]">
                Already have an account?{" "}
                <Link
                  className="font-semibold text-[#2f6fed] hover:text-[#245bd0]"
                  href="/login"
                >
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
