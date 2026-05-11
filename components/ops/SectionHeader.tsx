import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  mono?: boolean
}

export function SectionHeader({ title, subtitle, action, className, mono }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-card", className)}>
      <div className="flex flex-col gap-0.5">
        <h2 className={cn("text-sm font-semibold text-foreground", mono && "font-mono uppercase tracking-wider text-xs")}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
