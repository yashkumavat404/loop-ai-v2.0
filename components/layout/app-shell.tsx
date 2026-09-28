"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellUser = {
  name?: string | null;
  email?: string | null;
  role?: "ADMIN" | "ANALYST" | "VIEWER";
};

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AppShellUser;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} onMenuOpen={() => setMobileMenuOpen(true)} />
          <main className="w-full flex-1 px-4 py-6 sm:px-7 lg:px-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
