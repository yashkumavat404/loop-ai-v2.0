"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName =
    user.name || user.email?.split("@")[0] || "User";

  const initial = displayName.charAt(0).toUpperCase();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur dark:bg-[#0f141d]/95 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-ink">
            Customer Feedback Intelligence
          </p>
          <p className="text-xs text-muted">
            Understand what your customers are saying
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition-all hover:bg-surface hover:text-ink dark:bg-[#111827]"
          aria-label={
            mounted && theme === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
          title={
            mounted && theme === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setAccountOpen(false);
            }}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition-all hover:bg-surface hover:text-ink dark:bg-[#111827]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-72 rounded-xl border border-line bg-white p-3 shadow-card dark:bg-[#111827]">
              <p className="text-sm font-semibold text-ink">
                Notifications
              </p>

              <div className="mt-3 rounded-lg bg-surface p-3">
                <p className="text-xs font-medium text-ink">
                  You're all caught up
                </p>
                <p className="mt-1 text-xs text-muted">
                  No new notifications right now.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Account */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setAccountOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-2 py-1.5 transition-all hover:bg-surface dark:bg-[#111827]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              {initial}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-xs font-semibold text-ink">
                {displayName}
              </p>

              <p className="text-[11px] uppercase tracking-wide text-muted">
                {user.role || "USER"}
              </p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
          </button>

          {accountOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-line bg-white p-2 shadow-card dark:bg-[#111827]">
              <div className="border-b border-line px-3 py-2">
                <p className="text-sm font-semibold text-ink">
                  {displayName}
                </p>

                <p className="mt-0.5 truncate text-xs text-muted">
                  {user.email}
                </p>
              </div>

              <div className="mt-2">
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted">
                  <UserRound className="h-4 w-4" />
                  <span>{user.role || "USER"}</span>
                </div>

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
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
