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
      <div className="flex h-72 items-center justify-center rounded-xl bg-muted">
        <p className="text-sm text-muted-foreground">
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
            stroke="#e2e8f0"
          />

          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />

          <YAxis
            dataKey="name"
            type="category"
            width={135}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />

          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
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
