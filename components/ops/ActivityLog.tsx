import { cn } from "@/lib/utils"

export interface ActivityEntry {
  id: string
  actor: string
  action: string
  target: string
  ts: string
  type?: "create" | "update" | "delete" | "publish" | "review" | "system"
}

const typeStyles: Record<NonNullable<ActivityEntry["type"]>, string> = {
  create:  "bg-teal-500",
  update:  "bg-blue-400",
  delete:  "bg-red-400",
  publish: "bg-emerald-500",
  review:  "bg-amber-400",
  system:  "bg-zinc-400",
}

interface ActivityLogProps {
  entries: ActivityEntry[]
  className?: string
  maxRows?: number
}

export function ActivityLog({ entries, className, maxRows = 8 }: ActivityLogProps) {
  const rows = entries.slice(0, maxRows)
  return (
    <div className={cn("divide-y divide-border", className)}>
      {rows.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors">
          <div className="mt-1.5 flex-shrink-0">
            <span
              className={cn(
                "block h-1.5 w-1.5 rounded-full",
                typeStyles[entry.type ?? "system"]
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-foreground">
              <span className="font-medium">{entry.actor}</span>{" "}
              <span className="text-muted-foreground">{entry.action}</span>{" "}
              <span className="font-medium">{entry.target}</span>
            </p>
          </div>
          <time className="flex-shrink-0 text-[11px] tabular-nums text-muted-foreground">{entry.ts}</time>
        </div>
      ))}
    </div>
  )
}
