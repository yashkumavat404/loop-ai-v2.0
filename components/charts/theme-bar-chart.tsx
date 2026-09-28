"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Theme } from "@/lib/types";

export function ThemeBarChart({ data }: { data: Theme[] }) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-[#f7f9fc] dark:bg-[#151e2a]">
        <p className="text-sm text-[#8491a3] dark:text-[#8d9aad]">
          No themes available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="var(--border)"
          />

          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          />

          <YAxis
            dataKey="name"
            type="category"
            width={135}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
          />

          <Tooltip
            cursor={{ fill: "var(--surface-soft)" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "var(--surface)", boxShadow: "0 8px 30px rgba(0,0,0,0.24)",
              fontSize: "12px",
            }}
          />

          <Bar
            dataKey="count"
            radius={[0, 6, 6, 0]}
            fill="#6366f1"
            barSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
