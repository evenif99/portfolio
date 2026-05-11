import { cn } from "@/lib/utils";
import {
  SHIPMENT_STATUS_COLOR, SHIPMENT_STATUS_LABEL,
  PRIORITY_COLOR, PRIORITY_LABEL,
} from "@/lib/constants";
import type { ShipmentStatus, Priority } from "@/lib/types";

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
      SHIPMENT_STATUS_COLOR[status],
    )}>
      {SHIPMENT_STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset",
      PRIORITY_COLOR[priority],
    )}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
