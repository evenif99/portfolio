import { cn } from "@/lib/utils"

export type ProjectStatus = "active" | "review" | "published" | "archived" | "draft"

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active:    { label: "Active",     className: "bg-teal-50 text-teal-700 ring-teal-200" },
  review:    { label: "In Review",  className: "bg-amber-50 text-amber-700 ring-amber-200" },
  published: { label: "Published",  className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  archived:  { label: "Archived",   className: "bg-zinc-100 text-zinc-500 ring-zinc-200" },
  draft:     { label: "Draft",      className: "bg-slate-100 text-slate-500 ring-slate-200" },
}

interface StatusBadgeProps {
  status: ProjectStatus | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = (status?.toLowerCase() ?? "draft") as ProjectStatus
  const cfg = statusConfig[key] ?? statusConfig.draft
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  )
}
