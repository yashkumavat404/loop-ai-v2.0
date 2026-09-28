"use client";

import { useEffect, useRef, useState } from "react";
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
  const notificationRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }

      if (accountRef.current && !accountRef.current.contains(target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=2f6fed&fontFamily=Arial&fontWeight=700&fontSize=42`;

  return (
    <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-[#e1e7ef] bg-white/95 px-4 backdrop-blur dark:border-[#263242] dark:bg-[#0b111a]/95 sm:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuOpen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#66758a] hover:bg-[#f0f3f7] dark:text-[#aab6c5] dark:hover:bg-[#182230] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden max-w-[650px] flex-1 items-center gap-3 rounded-xl border border-[#e2e9f1] bg-[#f7f9fc] px-4 py-2.5 dark:border-[#263242] dark:bg-[#141c27] md:flex">
          <Search className="h-4 w-4 text-[#8a96a7] dark:text-[#738197]" />
          <span className="text-sm text-[#8a96a7] dark:text-[#738197]">
            Search feedback, themes or ask a question...
          </span>
          <span className="ml-auto hidden rounded-md border border-[#dbe3ec] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8a96a7] dark:border-[#303d4f] dark:bg-[#0f1722] dark:text-[#738197] lg:inline">
            /
          </span>
        </div>

        <div className="hidden xl:block">
          <p className="text-sm font-semibold text-[#16263a] dark:text-[#eef3f9]">
            Customer Feedback Intelligence
          </p>
          <p className="text-[11px] text-[#8a96a7] dark:text-[#738197]">
            Understand what your customers are saying
          </p>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2e9f1] bg-white text-[#66758a] transition hover:bg-[#f7f9fc] dark:border-[#2b394b] dark:bg-[#141c27] dark:text-[#b8c4d3] dark:hover:bg-[#1a2532]"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((v) => !v);
              setAccountOpen(false);
            }}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2e9f1] bg-white text-[#66758a] hover:bg-[#f7f9fc] dark:border-[#2b394b] dark:bg-[#141c27] dark:text-[#b8c4d3] dark:hover:bg-[#1a2532]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-72 rounded-xl border border-[#e1e7ef] bg-white p-3 shadow-xl dark:border-[#2b394b] dark:bg-[#111923]">
              <p className="text-sm font-semibold text-[#17263a] dark:text-[#eef3f9]">
                Notifications
              </p>
              <div className="mt-3 rounded-lg bg-[#f6f8fb] p-3 dark:bg-[#182230]">
                <p className="text-xs font-medium text-[#25354a] dark:text-[#e5ebf2]">
                  You&apos;re all caught up
                </p>
                <p className="mt-1 text-xs text-[#8491a3] dark:text-[#8d9aad]">
                  No new notifications right now.
                </p>
              </div>
            </div>
          )}
        </div>

        <div ref={accountRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setAccountOpen((v) => !v);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#e2e9f1] bg-white px-2 py-1.5 transition hover:bg-[#f7f9fc] dark:border-[#2b394b] dark:bg-[#141c27] dark:hover:bg-[#1a2532]"
          >
            <div className="h-8 w-8 overflow-hidden rounded-lg bg-[#2f6fed] shadow-sm">
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-xs font-semibold text-[#16263a] dark:text-[#eef3f9]">
                {displayName}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-[#8a96a7] dark:text-[#738197]">
                {user.role || "USER"}
              </p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-[#8a96a7] dark:text-[#738197] sm:block" />
          </button>

          {accountOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-[#e1e7ef] bg-white p-2 shadow-xl dark:border-[#2b394b] dark:bg-[#111923]">
              <div className="border-b border-[#e8edf3] px-3 py-3 dark:border-[#293647]">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-xl bg-[#2f6fed] shadow-sm">
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a96a7] dark:text-[#738197]">Profile</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-[#17263a] dark:text-[#eef3f9]">{displayName}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-[#17263a] dark:text-[#eef3f9]">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#8491a3] dark:text-[#8d9aad]">
                  {user.email}
                </p>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#64748b] dark:text-[#aab6c5]">
                  <UserRound className="h-4 w-4" />
                  <span>{user.role || "USER"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
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
