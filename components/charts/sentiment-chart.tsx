"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SentimentPoint } from "@/lib/types";

export function SentimentChart({ data }: { data: SentimentPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-muted">
        <p className="text-sm text-muted-foreground">
          No sentiment data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -20, bottom: 4 }}
        >
          <defs>
            <linearGradient id="positiveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#86efac" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#86efac" stopOpacity={0.08} />
            </linearGradient>

            <linearGradient id="neutralFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.65} />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.08} />
            </linearGradient>

            <linearGradient id="negativeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fda4af" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#fda4af" stopOpacity={0.08} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            dy={8}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />

          <Tooltip
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
              fontSize: "12px",
            }}
          />

          <Area
            type="monotone"
            dataKey="positive"
            stackId="1"
            fill="url(#positiveFill)"
            stroke="#16a34a"
            strokeWidth={2}
          />

          <Area
            type="monotone"
            dataKey="neutral"
            stackId="1"
            fill="url(#neutralFill)"
            stroke="#64748b"
            strokeWidth={2}
          />

          <Area
            type="monotone"
            dataKey="negative"
            stackId="1"
            fill="url(#negativeFill)"
            stroke="#e11d48"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
