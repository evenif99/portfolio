"use client";

import { useSyncExternalStore } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];
const MAX_SLICES = 6;
const OTHERS_LABEL = "기타";

export interface PiePoint {
  name: string;
  value: number;
}

export function CategoryPieChart({ data }: { data: PiePoint[] }) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const sorted = [...data].filter((row) => row.value > 0).sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, row) => sum + row.value, 0);
  const topRows = sorted.slice(0, 10);

  const chartData =
    sorted.length <= MAX_SLICES
      ? sorted
      : [
          ...sorted.slice(0, MAX_SLICES - 1),
          {
            name: OTHERS_LABEL,
            value: sorted.slice(MAX_SLICES - 1).reduce((sum, row) => sum + row.value, 0),
          },
        ];

  if (!mounted) return <div className="h-[220px]" />;

  return (
    <div className="relative h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={2} startAngle={90} endAngle={-270} stroke="none">
            {chartData.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
            formatter={(value, name) => {
              const numericValue = typeof value === "number" ? value : Number(value ?? 0);
              const ratio = total > 0 ? Math.round((numericValue / total) * 100) : 0;
              return [`${numericValue.toLocaleString()}개 (${ratio}%)`, String(name ?? "")];
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">총 재고 수량</p>
          <p className="text-[13px] font-bold tabular-nums text-foreground">{total.toLocaleString()}개</p>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary" className="absolute right-2 bottom-2 h-7 rounded-full px-3 text-[11px] shadow-sm">
            더보기
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>카테고리별 재고 분포 상세</DialogTitle>
            <DialogDescription>수량 기준 비중과 순위를 확인할 수 있습니다.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {topRows.map((row, i) => {
              const pct = total > 0 ? (row.value / total) * 100 : 0;
              return (
                <div key={row.name} className="rounded-md border border-border p-2.5">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-semibold text-foreground">{i + 1}. {row.name}</p>
                    <p className="shrink-0 text-[12px] font-bold tabular-nums text-blue-600">{row.value.toLocaleString()}개</p>
                  </div>
                  <p className="mb-1 text-[10px] text-muted-foreground">{pct.toFixed(1)}%</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(4, Math.round(pct))}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
