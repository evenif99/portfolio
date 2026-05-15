"use client";

import { useActionState } from "react";
import { X, CheckCheck, AlertTriangle, Loader2 } from "lucide-react";
import { resolveAlert, resolveAllAlerts } from "@/app/actions/alerts";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/hooks/useActionToast";

interface AlertItem {
  id: number;
  item: {
    sku: string;
    modelName: string;
    quantity: number;
    safetyStock: number;
  };
}

interface AlertPanelProps {
  alerts: AlertItem[];
}

function ResolveOneButton({ alertId }: { alertId: number }) {
  const [state, action, isPending] = useActionState(resolveAlert, undefined);
  useActionToast(state, { success: "알림이 해제되었습니다." });
  return (
    <form action={action}>
      <input type="hidden" name="alertId" value={alertId} />
      <button
        type="submit"
        disabled={isPending}
        title="알림 해제"
        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
      </button>
    </form>
  );
}

function ResolveAllButton() {
  const [state, action, isPending] = useActionState(resolveAllAlerts, undefined);
  useActionToast(state, { success: "모든 알림이 해제되었습니다." });
  return (
    <form action={action}>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-40"
      >
        {isPending
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <CheckCheck className="h-3 w-3" />}
        전체 해제
      </button>
    </form>
  );
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 mb-3">
          <CheckCheck className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="text-[12px] font-semibold text-foreground">부족 재고 없음</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">모든 품목이 안전재고 이상입니다</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {alerts.map((a) => {
        const pct = a.item.safetyStock > 0
          ? Math.round((a.item.quantity / a.item.safetyStock) * 100)
          : 0;
        const isOut = a.item.quantity === 0;
        return (
          <li key={a.id} className="px-4 py-3 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertTriangle className={cn(
                  "h-3 w-3 flex-shrink-0",
                  isOut ? "text-red-500" : "text-amber-500"
                )} />
                <p className="text-[12px] font-semibold text-foreground leading-tight line-clamp-1">
                  {a.item.modelName}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={cn(
                  "text-[10px] font-bold tabular-nums",
                  isOut ? "text-red-600" : "text-amber-600",
                )}>
                  {isOut ? "품절" : `${a.item.quantity}/${a.item.safetyStock}`}
                </span>
                <ResolveOneButton alertId={a.id} />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mb-1.5 truncate pl-5">{a.item.sku}</p>
            <div className="pl-5">
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", isOut ? "bg-red-500" : "bg-amber-500")}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// 헤더용 "전체 해제" 액션 export
export { ResolveAllButton };
