"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("Demo Workspace");
  const [saved, setSaved] = useState(false);

  const handleWorkspaceChange = (
    value: string,
  ) => {
    setWorkspaceName(value);
    setSaved(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Configuration
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Manage your workspace information and view your current
          access level.
        </p>
      </div>

      {/* Workspace */}
      <section className="card overflow-hidden">
        <div className="border-b border-line bg-surface-soft px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Building2 size={19} />
            </div>

            <div>
              <h2 className="font-bold text-ink">
                Workspace
              </h2>

              <p className="mt-1 text-xs text-muted">
                Workspace-level information.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <label
            htmlFor="workspace-name"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-muted"
          >
            Workspace name
          </label>

          <input
            id="workspace-name"
            className="input"
            value={workspaceName}
            onChange={(e) =>
              handleWorkspaceChange(e.target.value)
            }
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setSaved(true)}
            >
              Save changes
            </button>

            {saved && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Check size={16} />
                Changes saved
              </div>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-muted">
            Workspace name changes are currently reflected in the
            interface only.
          </p>
        </div>
      </section>

      {/* Account / Role */}
      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-line bg-surface-soft px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <UserRound size={19} />
            </div>

            <div>
              <h2 className="font-bold text-ink">
                Your role
              </h2>

              <p className="mt-1 text-xs text-muted">
                Your permissions are enforced server-side.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  Access level
                </p>

                <p className="mt-1 text-lg font-bold text-ink">
                  ADMIN
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              Full workspace access
            </span>
          </div>

          <p className="mt-4 text-xs leading-5 text-muted">
            This role display is currently based on the frontend
            demo state. Server-side role enforcement remains the
            source of truth.
          </p>
        </div>
      </section>
    </div>
  );
}
