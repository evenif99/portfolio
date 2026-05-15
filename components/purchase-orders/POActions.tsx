"use client";

import { useActionState, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, PackageCheck, AlertCircle, Printer } from "lucide-react";
import {
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  receivePurchaseOrder,
  deletePurchaseOrder,
} from "@/app/actions/purchaseOrders";
import type { POFormState } from "@/app/actions/purchaseOrders";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/hooks/useActionToast";

// ??? Types ????????????????????????????????????????????????????????????????????

export interface POItemRow {
  id:          number;
  itemId:      number;
  modelName:   string;
  sku:         string;
  quantity:    number;
  unitPrice:   number | null;
  receivedQty?: number;
}

type POStatus = "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";

// ??? ConfirmButton ????????????????????????????????????????????????????????????

function ConfirmButton({ orderId }: { orderId: number }) {
  const [state, formAction, isPending] = useActionState<POFormState, FormData>(
    confirmPurchaseOrder, undefined,
  );
  const errorMsg = state && "message" in state ? state.message : undefined;

  useActionToast(state, { success: "諛쒖＜媛 ?뺤젙?섏뿀?듬땲??" });

  return (
    <div className="space-y-1">
      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={isPending}
          onClick={(e) => {
            if (!confirm("諛쒖＜瑜??뺤젙?섎㈃ ?덈ぉ/?섎웾???섏젙?????놁뒿?덈떎. ?뺤젙?섏떆寃좎뒿?덇퉴?")) e.preventDefault();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors",
            isPending ? "opacity-60 cursor-not-allowed bg-amber-400" : "bg-amber-500 hover:bg-amber-600",
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isPending ? "泥섎━ 以?.." : "諛쒖＜ ?뺤젙"}
        </button>
      </form>
      {errorMsg && <p className="text-[11px] text-red-500">{errorMsg}</p>}
    </div>
  );
}

// ??? CancelButton ?????????????????????????????????????????????????????????????

function CancelButton({ orderId }: { orderId: number }) {
  const [state, formAction, isPending] = useActionState<POFormState, FormData>(
    cancelPurchaseOrder, undefined,
  );
  const errorMsg = state && "message" in state ? state.message : undefined;

  useActionToast(state, { success: "諛쒖＜媛 痍⑥냼?섏뿀?듬땲??" });

  return (
    <div className="space-y-1">
      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={isPending}
          onClick={(e) => {
            if (!confirm("諛쒖＜?쒕? 痍⑥냼?섏떆寃좎뒿?덇퉴?")) e.preventDefault();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors",
            isPending ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30",
          )}
        >
          <XCircle className="h-4 w-4" />
          {isPending ? "泥섎━ 以?.." : "痍⑥냼"}
        </button>
      </form>
      {errorMsg && <p className="text-[11px] text-red-500">{errorMsg}</p>}
    </div>
  );
}

// ??? DeleteButton ?????????????????????????????????????????????????????????????

function DeleteButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<POFormState, FormData>(
    deletePurchaseOrder, undefined,
  );
  const errorMsg = state && "message" in state ? state.message : undefined;

  useActionToast(state, { success: "諛쒖＜?쒓? ??젣?섏뿀?듬땲??" });

  // ??젣 ?깃났 ??紐⑸줉?쇰줈 ?대룞
  useEffect(() => {
    if (state && "success" in state) {
      router.push("/dashboard/purchase-orders");
    }
  }, [state, router]);

  return (
    <div className="space-y-1">
      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={isPending}
          onClick={(e) => {
            if (!confirm("諛쒖＜?쒕? ??젣?섏떆寃좎뒿?덇퉴? ?섎룎由????놁뒿?덈떎.")) e.preventDefault();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-red-600 transition-colors",
            isPending ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/30",
          )}
        >
          <XCircle className="h-4 w-4" />
          {isPending ? "泥섎━ 以?.." : "??젣"}
        </button>
      </form>
      {errorMsg && <p className="text-[11px] text-red-500">{errorMsg}</p>}
    </div>
  );
}

// ??? ReceiveModal ?????????????????????????????????????????????????????????????

function ReceiveModal({ orderId, items, onClose }: {
  orderId: number;
  items:   POItemRow[];
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<POFormState, FormData>(
    receivePurchaseOrder, undefined,
  );
  const errorMsg = state && "message" in state ? state.message : undefined;

  useActionToast(state, { success: "?낃퀬 泥섎━媛 ?꾨즺?섏뿀?듬땲?? ?ш퀬媛 諛섏쁺?섏뿀?듬땲??" });

  useEffect(() => {
    if (state && "success" in state) onClose();
  }, [state, onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10 px-4"
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-sm font-bold text-foreground">?낃퀬 泥섎━</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ?ㅼ젣 ?낃퀬 ?섎웾???낅젰?섏꽭??(諛쒖＜ ?섎웾怨??ㅻ? ???덉뒿?덈떎)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="p-6 space-y-4">
          <input type="hidden" name="orderId" value={orderId} />

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-foreground truncate">{item.modelName}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{item.sku}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    諛쒖＜ {item.quantity}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name={`receivedQty_${item.id}`}
                    defaultValue={item.quantity}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "");
                    }}
                    className="w-20 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-right text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-600 dark:text-red-400">{errorMsg}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              痍⑥냼
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-5 py-2 text-sm font-semibold text-white transition-colors",
                isPending ? "opacity-60 cursor-not-allowed bg-emerald-500" : "bg-emerald-600 hover:bg-emerald-700",
              )}
            >
              <PackageCheck className="h-4 w-4" />
              {isPending ? "泥섎━ 以?.." : "?낃퀬 ?뺤젙"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ??? POActions ????????????????????????????????????????????????????????????????

export function POActions({ orderId, status, items }: {
  orderId: number;
  status:  POStatus;
  items:   POItemRow[];
}) {
  const [receiveOpen, setReceiveOpen] = useState(false);

  // useCallback?쇰줈 硫붾え?댁젣?댁뀡 ??ReceiveModal useEffect 遺덊븘?뷀븳 ?ъ떎??諛⑹?
  const handleClose = useCallback(() => setReceiveOpen(false), []);

  return (
    <>
      {receiveOpen && (
        <ReceiveModal
          orderId={orderId}
          items={items}
          onClose={handleClose}
        />
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => window.open(`/dashboard/purchase-orders/${orderId}/print`, "_blank", "noopener,noreferrer")}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          ?몄뇙
        </button>

        {status === "DRAFT" && (
          <>
            <ConfirmButton orderId={orderId} />
            <CancelButton  orderId={orderId} />
            <DeleteButton  orderId={orderId} />
          </>
        )}
        {status === "ORDERED" && (
          <>
            <button
              type="button"
              onClick={() => setReceiveOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <PackageCheck className="h-4 w-4" />
              ?낃퀬 泥섎━
            </button>
            <CancelButton orderId={orderId} />
          </>
        )}
        {status === "CANCELLED" && (
          <DeleteButton orderId={orderId} />
        )}
      </div>
    </>
  );
}

