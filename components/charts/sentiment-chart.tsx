"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SentimentPoint } from "@/lib/types";

const colors = {
  negative: "#2f5f9f",
  neutral: "#a9bdd7",
  positive: "#62a8f2",
};

export function SentimentChart({ data }: { data: SentimentPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-[#f7f9fc]">
        <p className="text-sm text-[#8491a3]">No sentiment data available yet.</p>
      </div>
    );
  }

  const totals = data.reduce(
    (acc, item) => ({
      positive: acc.positive + (item.positive ?? 0),
      neutral: acc.neutral + (item.neutral ?? 0),
      negative: acc.negative + (item.negative ?? 0),
    }),
    { positive: 0, neutral: 0, negative: 0 },
  );

  const chartData = [
    { name: "Negative", value: totals.negative, color: colors.negative },
    { name: "Neutral", value: totals.neutral, color: colors.neutral },
    { name: "Positive", value: totals.positive, color: colors.positive },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-72 w-full">
      <div className="flex h-full items-center gap-3">
        <div className="relative h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={78}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={3}
              >
                {chartData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e9f1",
                  boxShadow: "0 8px 24px rgba(24,45,75,0.08)",
                  fontSize: "11px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#17263a]">{total}</span>
            <span className="text-[10px] text-[#8793a4]">Total Feedback</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          {chartData.map((item) => {
            const percent = total ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-[#4d5d72]">
                    {item.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#34455b]">
                    {item.value} <span className="ml-1 text-[#8a96a7]">{percent}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#edf1f5]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
