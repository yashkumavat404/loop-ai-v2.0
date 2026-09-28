"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/types";

export function VolumeChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-[#f7f9fc]">
        <p className="text-sm text-[#8491a3]">No feedback volume data available yet.</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 4 }}>
          <defs>
            <linearGradient id="volumeArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f6fed" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#2f6fed" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e8edf3" />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#8a96a7" }}
            dy={8}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#8a96a7" }}
          />

          <Tooltip
            cursor={{ stroke: "#b9c8db", strokeDasharray: "4 4" }}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 24px rgba(24,45,75,0.08)",
              fontSize: "11px",
            }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#2f6fed"
            strokeWidth={2.5}
            dot={{ r: 2.5, strokeWidth: 2, fill: "var(--surface)", stroke: "#2f6fed" }}
            activeDot={{ r: 5, strokeWidth: 2, fill: "var(--surface)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
