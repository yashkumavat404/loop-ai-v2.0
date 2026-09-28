"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserRound,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

type TopbarUser = {
  name?: string | null;
  email?: string | null;
  role?: "ADMIN" | "ANALYST" | "VIEWER";
};

export function Topbar({
  user,
  onMenuOpen,
}: {
  user: TopbarUser;
  onMenuOpen: () => void;
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-[#e7edf4] bg-white/95 px-4 backdrop-blur sm:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuOpen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden max-w-[650px] flex-1 items-center gap-3 rounded-xl border border-[#e2e9f1] bg-[#f7f9fc] px-4 py-2.5 md:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">
            Search feedback, themes or ask a question...
          </span>
          <span className="ml-auto hidden rounded-md border border-[#dbe3ec] bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400 lg:inline">
            /
          </span>
        </div>

        <div className="hidden xl:block">
          <p className="text-sm font-semibold text-[#16263a]">
            Customer Feedback Intelligence
          </p>
          <p className="text-[11px] text-slate-400">
            Understand what your customers are saying
          </p>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2e9f1] bg-white text-slate-500 transition hover:bg-slate-50"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((v) => !v);
              setAccountOpen(false);
            }}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2e9f1] bg-white text-slate-500 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-72 rounded-xl border border-line bg-white p-3 shadow-xl">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <div className="mt-3 rounded-lg bg-surface p-3">
                <p className="text-xs font-medium text-ink">You're all caught up</p>
                <p className="mt-1 text-xs text-muted">No new notifications right now.</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setAccountOpen((v) => !v);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#e2e9f1] bg-white px-2 py-1.5 transition hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f6fed] text-sm font-bold text-white">
              {initial}
            </div>
            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-xs font-semibold text-[#16263a]">{displayName}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{user.role || "USER"}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {accountOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-line bg-white p-2 shadow-xl">
              <div className="border-b border-line px-3 py-2">
                <p className="text-sm font-semibold text-ink">{displayName}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted">
                  <UserRound className="h-4 w-4" />
                  <span>{user.role || "USER"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
