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
    <div className={cn("border-b border-border bg-card px-6 py-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {breadcrumb && (
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {breadcrumb}
            </p>
          )}
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
