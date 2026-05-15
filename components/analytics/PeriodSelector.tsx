import Link from "next/link";
import { cn } from "@/lib/utils";

interface PeriodSelectorProps {
  current: "14d" | "12w";
}

export function PeriodSelector({ current }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-0.5">
      {(["14d", "12w"] as const).map((p) => (
        <Link
          key={p}
          href={p === "14d" ? "/dashboard/analytics" : `/dashboard/analytics?period=${p}`}
          className={cn(
            "rounded px-2.5 py-1 text-[11px] font-semibold transition-colors",
            current === p
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p === "14d" ? "14일" : "12주"}
        </Link>
      ))}
    </div>
  );
}
