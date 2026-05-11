import { cn } from "@/lib/utils"

export interface KpiItem {
  label: string
  value: string | number
  sub?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  accent?: boolean
}

interface KpiStripProps {
  items: KpiItem[]
  className?: string
}

export function KpiStrip({ items, className }: KpiStripProps) {
  return (
    <div className={cn("grid gap-px bg-border", `grid-cols-${items.length}`, className)}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col gap-1 bg-card px-5 py-4",
            item.accent && "border-l-2 border-l-primary"
          )}
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {item.label}
          </span>
          <div className="flex items-end gap-2">
            <span className={cn("text-2xl font-bold tabular-nums text-foreground", item.accent && "text-primary")}>
              {item.value}
            </span>
            {item.trendValue && (
              <span
                className={cn(
                  "mb-0.5 text-[11px] font-semibold",
                  item.trend === "up" && "text-emerald-600",
                  item.trend === "down" && "text-red-500",
                  item.trend === "neutral" && "text-muted-foreground"
                )}
              >
                {item.trendValue}
              </span>
            )}
          </div>
          {item.sub && (
            <span className="text-xs text-muted-foreground">{item.sub}</span>
          )}
        </div>
      ))}
    </div>
  )
}
