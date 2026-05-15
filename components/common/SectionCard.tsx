import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({ title, subtitle, action, children, className, noPadding }: SectionCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
            {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-4 sm:p-5"}>{children}</div>
    </div>
  );
}
