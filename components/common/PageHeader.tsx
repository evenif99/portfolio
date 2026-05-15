import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumb?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, action, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn("border-b border-border bg-card px-4 py-4 sm:px-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          {breadcrumb && (
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {breadcrumb}
            </p>
          )}
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-shrink-0 items-center gap-2 flex-wrap">{action}</div>}
      </div>
    </div>
  );
}
