import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: LucideIcon;
  iconClassName?: string;
}

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  iconClassName = "bg-indigo-50 text-indigo-600",
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 dark:bg-[#0f141d] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
            {value}
          </p>

          {helper && (
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {helper}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
          >
            <Icon size={19} strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-indigo-50/40 blur-2xl transition duration-300 group-hover:bg-indigo-100/50" />
    </div>
  );
}

