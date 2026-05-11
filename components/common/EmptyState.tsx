import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "결과가 없습니다",
  description = "조건에 맞는 항목을 찾을 수 없습니다.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <PackageSearch className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
