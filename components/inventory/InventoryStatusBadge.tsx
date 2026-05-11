import { cn } from "@/lib/utils";
import { ITEM_STATUS_COLOR, ITEM_STATUS_LABEL, ITEM_STATUS_DOT } from "@/lib/constants";
import type { ItemStatus } from "@/lib/types";

interface InventoryStatusBadgeProps {
  status: ItemStatus;
  showDot?: boolean;
  size?: "sm" | "md";
}

export function InventoryStatusBadge({ status, showDot = true, size = "md" }: InventoryStatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset font-semibold",
      size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
      ITEM_STATUS_COLOR[status],
    )}>
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", ITEM_STATUS_DOT[status])} />}
      {ITEM_STATUS_LABEL[status]}
    </span>
  );
}
