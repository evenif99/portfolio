import Link from "next/link"
import { cn } from "@/lib/utils"
import { StatusBadge, type ProjectStatus } from "./StatusBadge"

export interface ProjectRecord {
  id: string
  title: string
  description?: string
  status: ProjectStatus | string
  updatedAt: string
  priority?: "high" | "medium" | "low"
  tags?: string[]
}

const priorityStyles: Record<string, string> = {
  high:   "text-red-500",
  medium: "text-amber-500",
  low:    "text-zinc-400",
}

const priorityLabels: Record<string, string> = {
  high: "HIGH", medium: "MED", low: "LOW",
}

interface ProjectQueueTableProps {
  projects: ProjectRecord[]
  showLink?: boolean
  className?: string
}

export function ProjectQueueTable({ projects, showLink = false, className }: ProjectQueueTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="w-20 px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
            <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">Title</th>
            <th className="w-28 px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="w-20 px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
            <th className="w-36 px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
            {showLink && <th className="w-16 px-4 py-2.5" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{p.id}</td>
              <td className="px-4 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">{p.title}</span>
                  {p.description && (
                    <span className="truncate max-w-xs text-muted-foreground">{p.description}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-4 py-2.5">
                {p.priority ? (
                  <span className={cn("font-bold font-mono", priorityStyles[p.priority])}>
                    {priorityLabels[p.priority]}
                  </span>
                ) : (
                  <span className="text-zinc-300">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{p.updatedAt}</td>
              {showLink && (
                <td className="px-4 py-2.5 text-right">
                  <Link href={`/projects/${p.id}`} className="text-primary hover:underline font-medium">
                    View
                  </Link>
                </td>
              )}
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={showLink ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                No items in queue.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
