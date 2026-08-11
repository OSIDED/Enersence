"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

type UsagePoint = { day: string; kwh: number };

export default function UsageChart({ data }: { data: UsagePoint[] }) {
  // Find the max value's day so we can highlight it like the reference design
  const maxValue = Math.max(...data.map((d) => d.kwh));

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="28%">
          <XAxis
            dataKey="day"
            axisLine={{ stroke: "#1D4ED8" }}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 13 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 13 }}
            ticks={[0, 10, 20, 30]}
            domain={[0, 30]}
          />
          <Bar dataKey="kwh" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.kwh === maxValue ? "#3B82F6" : "#BFDBFE"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
