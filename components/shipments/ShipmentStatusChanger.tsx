"use client";

import { useActionState, useRef } from "react";
import { ChevronDown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { updateShipmentStatus } from "@/app/actions/shipments";
import { SHIPMENT_STATUS_LABEL, SHIPMENT_STATUS_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/types";
import { useActionToast } from "@/hooks/useActionToast";

// 현재 상태에서 전환 가능한 다음 상태 목록
const NEXT_STATUS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING:   ["APPROVED", "CANCELLED"],
  APPROVED:  ["PICKING", "CANCELLED"],
  PICKING:   ["PACKED", "DELAYED", "CANCELLED"],
  PACKED:    ["SHIPPED", "DELAYED", "CANCELLED"],
  SHIPPED:   ["COMPLETED", "DELAYED"],
  DELAYED:   ["PICKING", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

interface ShipmentStatusChangerProps {
  shipmentId: number;
  currentStatus: ShipmentStatus;
}

export function ShipmentStatusChanger({ shipmentId, currentStatus }: ShipmentStatusChangerProps) {
  const [state, action, isPending] = useActionState(updateShipmentStatus, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useActionToast(state, { success: "출고 상태가 변경되었습니다." });

  const nextOptions = NEXT_STATUS[currentStatus];
  const isTerminal = nextOptions.length === 0;

  const isSuccess = state && "success" in state;
  const errorMsg = state && "message" in state ? state.message : undefined;

  if (isTerminal) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        SHIPMENT_STATUS_COLOR[currentStatus],
      )}>
        {SHIPMENT_STATUS_LABEL[currentStatus]}
      </span>
    );
  }

  function handleChange() {
    formRef.current?.requestSubmit();
  }

  return (
    <div className="flex flex-col gap-1">
      <form ref={formRef} action={action} className="flex items-center gap-1.5">
        <input type="hidden" name="shipmentId" value={shipmentId} />

        <div className="relative">
          <select
            ref={selectRef}
            name="status"
            disabled={isPending}
            onChange={handleChange}
            defaultValue=""
            className={cn(
              "appearance-none rounded-md border bg-background pl-2.5 pr-7 py-1 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer",
              isPending ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400",
              SHIPMENT_STATUS_COLOR[currentStatus],
            )}
          >
            <option value="" disabled>{SHIPMENT_STATUS_LABEL[currentStatus]}</option>
            {nextOptions.map((s) => (
              <option key={s} value={s} className="bg-background text-foreground">
                → {SHIPMENT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
            {isPending
              ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              : <ChevronDown className="h-3 w-3 text-muted-foreground" />
            }
          </div>
        </div>
      </form>

      {/* inline feedback */}
      {isSuccess && (
        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
          <CheckCircle2 className="h-3 w-3" /> 변경 완료
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-1 text-[10px] text-red-500 font-semibold">
          <AlertCircle className="h-3 w-3" /> {errorMsg}
        </div>
      )}
    </div>
  );
}
