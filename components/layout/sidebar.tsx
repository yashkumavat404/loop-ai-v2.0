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
    <div className="flex h-full flex-col bg-[#0d1b2a] text-white">
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className="flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f6fed] text-sm font-bold shadow-[0_8px_24px_rgba(47,111,237,0.28)]">
            L
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1b2a]" />
          </div>
          <div>
            <p className="text-[17px] font-bold tracking-tight">LOOP</p>
            <p className="text-[10px] font-medium text-white/55">
              Customer Intelligence
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={onMobileClose}
          className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={19} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-7">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
          Workspace
        </p>

        <div className="space-y-1.5">
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
                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#2f6fed] text-white shadow-[0_8px_24px_rgba(47,111,237,0.24)]"
                    : "text-white/62 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={active ? "text-white" : "text-white/55 group-hover:text-white"}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mx-4 mb-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18304a]">
            <Sparkles size={15} className="text-[#75a8ff]" />
          </div>
          Ask LOOP
        </div>
        <p className="mt-3 text-xs leading-5 text-white/50">
          Ask questions about real customer feedback and trace every answer to
          its sources.
        </p>
        <Link
          href="/ask"
          onClick={onMobileClose}
          className="mt-3 inline-flex text-xs font-semibold text-[#8db8ff] hover:text-white"
        >
          Open insights →
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[268px] shrink-0 bg-[#0d1b2a] lg:block">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={onMobileClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close navigation"
          />
          <aside className="relative h-full w-[280px] max-w-[85vw] shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
