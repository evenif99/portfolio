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

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── ConfirmButton ────────────────────────────────────────────────────────────

function ConfirmButton({ orderId }: { orderId: number }) {
  const [state, formAction, isPending] = useActionState<POFormState, FormData>(
    confirmPurchaseOrder, undefined,
  );
  const errorMsg = state && "message" in state ? state.message : undefined;

  useActionToast(state, { success: "발주가 확정되었습니다." });

  return (
    <div className="space-y-1">
      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={isPending}
          onClick={(e) => {
            if (!confirm("발주를 확정하면 품목/수량을 수정할 수 없습니다. 확정하시겠습니까?")) e.preventDefault();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors",
            isPending ? "opacity-60 cursor-not-allowed bg-amber-400" : "bg-amber-500 hover:bg-amber-600",
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isPending ? "처리 중..." : "발주 확정"}
        </button>
      </form>
      {errorMsg && <p className="text-[11px] text-red-500">{errorMsg}</p>}
    </div>
  );
}

// ─── CancelButton ─────────────────────────────────────────────────────────────

function CancelButton({ orderId }: { orderId: number }) {
  const [state, formAction, isPending] = useActionState<POFormState, FormData>(
    cancelPurchaseOrder, undefined,
  );
  const errorMsg = state && "message" in state ? state.message : undefined;

  useActionToast(state, { success: "발주가 취소되었습니다." });

  return (
    <div className="space-y-1">
      <form action={formAction}>
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={isPending}
          onClick={(e) => {
            if (!confirm("발주서를 취소하시겠습니까?")) e.preventDefault();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors",
            isPending ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30",
          )}
        >
          <XCircle className="h-4 w-4" />
          {isPending ? "처리 중..." : "취소"}
        </button>
      </form>
      {errorMsg && <p className="text-[11px] text-red-500">{errorMsg}</p>}
    </div>
  );
}

// ─── DeleteButton ─────────────────────────────────────────────────────────────

function DeleteButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<POFormState, FormData>(
    deletePurchaseOrder, undefined,
  );
  const errorMsg = state && "message" in state ? state.message : undefined;

  useActionToast(state, { success: "발주서가 삭제되었습니다." });

  // 삭제 성공 후 목록으로 이동
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
            if (!confirm("발주서를 삭제하시겠습니까? 되돌릴 수 없습니다.")) e.preventDefault();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-red-600 transition-colors",
            isPending ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/30",
          )}
        >
          <XCircle className="h-4 w-4" />
          {isPending ? "처리 중..." : "삭제"}
        </button>
      </form>
      {errorMsg && <p className="text-[11px] text-red-500">{errorMsg}</p>}
    </div>
  );
}

// ─── ReceiveModal ─────────────────────────────────────────────────────────────

function ReceiveModal({ orderId, items, onClose }: {
  orderId: number;
  items:   POItemRow[];
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<POFormState, FormData>(
    receivePurchaseOrder, undefined,
  );
  const errorMsg = state && "message" in state ? state.message : undefined;

  useActionToast(state, { success: "입고 처리가 완료되었습니다. 재고가 반영되었습니다." });

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
            <p className="text-sm font-bold text-foreground">입고 처리</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              실제 입고 수량을 입력하세요 (발주 수량과 다를 수 있습니다)
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
                    발주 {item.quantity}
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
              취소
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
              {isPending ? "처리 중..." : "입고 확정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── POActions ────────────────────────────────────────────────────────────────

export function POActions({ orderId, status, items }: {
  orderId: number;
  status:  POStatus;
  items:   POItemRow[];
}) {
  const [receiveOpen, setReceiveOpen] = useState(false);

  // useCallback으로 메모이제이션 — ReceiveModal useEffect 불필요한 재실행 방지
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
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          인쇄
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
              입고 처리
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
