"use client";

import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const COLORS = [
  "#3b82f6", "#10b981", "#8b5cf6",
  "#f59e0b", "#ef4444", "#ec4899",
  "#06b6d4", "#84cc16",
];

export interface PiePoint {
  name:  string;
  value: number;
}

export function CategoryPieChart({ data }: { data: PiePoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (!mounted) return <div className="h-[220px]" />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
          }}
          formatter={(value: number, name: string) => [
            `${value.toLocaleString()} units (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
            name,
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => {
            const point = data.find((d) => d.name === value);
            return `${value}  ${point?.value?.toLocaleString() ?? ""}`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
