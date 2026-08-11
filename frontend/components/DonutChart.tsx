"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Slice = { name: string; value: number; color: string };

export default function DonutChart({
  data,
  centerValue,
  centerLabel,
}: {
  data: Slice[];
  centerValue: string;
  centerLabel: string;
}) {
  return (
    <div className="relative w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={75}
            outerRadius={110}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((slice, i) => (
              <Cell key={i} fill={slice.color} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{centerValue}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">{centerLabel}</span>
      </div>
    </div>
  );
}
