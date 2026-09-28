"use client";

import { useEffect, useState } from "react";
import { Building2, Check, ShieldCheck, UserRound } from "lucide-react";

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("Demo Workspace");
  const [saved, setSaved] = useState(false);

  const handleWorkspaceChange = (value: string) => {
    setWorkspaceName(value);
    setSaved(false);
  };

  const [displayName, setDisplayName] = useState("User");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((response) => response.json())
      .then((session) => {
        const user = session?.user;
        if (user) {
          setDisplayName(user.name || user.email?.split("@")[0] || "User");
          setEmail(user.email || "");
          setRole(user.role || "USER");
        }
      })
      .catch(() => undefined);
  }, []);

  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=2f6fed&fontFamily=Arial&fontWeight=700&fontSize=42`;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8da3] dark:text-[#8292a8]">
          Configuration
        </p>
        <h1 className="mt-2 text-[30px] font-bold tracking-tight text-[#17263a] dark:text-[#f3f6fb]">
          Settings
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#718096] dark:text-[#9aa8ba]">
          Manage your workspace information and review your account access.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e2e9f1] bg-white shadow-[0_4px_18px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#edf1f5] bg-[#fafbfd] px-6 py-5 dark:border-[#273447] dark:bg-[#0d141e] sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]">
              <Building2 size={19} />
            </div>
            <div>
              <h2 className="font-bold text-[#17263a] dark:text-[#eef3f9]">Workspace</h2>
              <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">Workspace-level information.</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <label htmlFor="workspace-name" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">
            Workspace name
          </label>
          <input id="workspace-name" className="input" value={workspaceName} onChange={(e) => handleWorkspaceChange(e.target.value)} />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" className="btn-primary" onClick={() => setSaved(true)}>
              Save changes
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Check size={16} /> Changes saved
              </div>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-[#8491a3] dark:text-[#8d9aad]">
            Workspace name changes are currently reflected in the interface only.
          </p>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e9f1] bg-white shadow-[0_4px_18px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#edf1f5] bg-[#fafbfd] px-6 py-5 dark:border-[#273447] dark:bg-[#0d141e] sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]">
              <UserRound size={19} />
            </div>
            <div>
              <h2 className="font-bold text-[#17263a] dark:text-[#eef3f9]">Your profile</h2>
              <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">Your profile image is generated automatically from your name.</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 rounded-2xl border border-[#e2e9f1] bg-[#fafbfd] p-5 dark:border-[#2b394b] dark:bg-[#151e2a] sm:flex-row sm:items-center">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#2f6fed] shadow-[0_8px_24px_rgba(47,111,237,0.22)]">
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7c8da3] dark:text-[#8292a8]">Profile image</p>
              <p className="mt-1 text-lg font-bold text-[#17263a] dark:text-[#eef3f9]">{displayName}</p>
              <p className="mt-1 text-sm text-[#8491a3] dark:text-[#8d9aad]">{email || "Signed-in account"}</p>
              <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">
                A unique avatar is shown automatically for each signed-in user.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e2e9f1] bg-white shadow-[0_4px_18px_rgba(24,45,75,0.045)] dark:border-[#273447] dark:bg-[#111923] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#edf1f5] bg-[#fafbfd] px-6 py-5 dark:border-[#273447] dark:bg-[#0d141e] sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2f6fed] dark:bg-[#162b4a] dark:text-[#76a9ff]">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2 className="font-bold text-[#17263a] dark:text-[#eef3f9]">Access & security</h2>
              <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">Your permissions are enforced server-side.</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 rounded-2xl border border-[#e2e9f1] bg-[#fafbfd] p-5 dark:border-[#2b394b] dark:bg-[#151e2a] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f6fed] text-white"><ShieldCheck size={20} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c8da3] dark:text-[#8292a8]">Access level</p>
                <p className="mt-1 text-lg font-bold text-[#17263a] dark:text-[#eef3f9]">{role}</p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              Full workspace access
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}