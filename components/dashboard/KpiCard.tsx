import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent?: boolean;
  alert?: boolean;
  className?: string;
}

export function KpiCard({
  label, value, sub, icon: Icon, trend, trendValue, accent, alert, className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 flex flex-col gap-2",
        accent && "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20",
        alert  && "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
        !accent && !alert && "border-border",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && (
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            accent ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
              : alert ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              : "bg-muted text-muted-foreground",
          )}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <p className={cn(
        "text-2xl font-bold tabular-nums",
        accent ? "text-blue-700 dark:text-blue-300" : alert ? "text-red-600 dark:text-red-400" : "text-foreground",
      )}>
        {value}
      </p>

      <div className="flex items-center justify-between gap-2">
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        {trend && trendValue && (
          <span className={cn(
            "text-[10px] font-semibold",
            trend === "up"      ? "text-emerald-600" :
            trend === "down"    ? "text-red-500" :
            "text-muted-foreground",
          )}>
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "–"} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
