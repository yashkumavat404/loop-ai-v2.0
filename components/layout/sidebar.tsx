"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Inbox,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Feedback Inbox", icon: Inbox },
  { href: "/trends", label: "Trends & Themes", icon: BarChart3 },
  { href: "/ask", label: "Ask LOOP", icon: MessageSquareText },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col bg-white dark:bg-[#0f141d]">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className="flex items-center gap-3"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
            L
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#0f141d]" />
          </div>

          <div>
            <p className="font-bold tracking-tight text-ink">LOOP</p>
            <p className="text-[10px] font-medium text-muted">
              Customer intelligence
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={onMobileClose}
          className="rounded-lg p-2 text-muted transition-all hover:bg-surface hover:text-ink lg:hidden"
          aria-label="Close menu"
        >
          <X size={19} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          Workspace
        </p>

        {links.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}

              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.9}
                className={
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-muted transition-colors group-hover:text-ink"
                }
              />

              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-slate-50 p-4 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-slate-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-neutral-800">
            <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          AI insights
        </div>

        <p className="mt-3 text-xs leading-5 text-muted">
          Ask questions about real customer feedback and trace answers back to
          sources.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-line bg-white dark:bg-[#0f141d] lg:block">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={onMobileClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            aria-label="Close navigation"
          />

          <aside className="relative h-full w-[280px] max-w-[85vw] border-r border-line bg-white shadow-2xl dark:bg-[#0f141d]">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

