"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteSupplier } from "@/app/actions/suppliers";
import type { SupplierFormState } from "@/app/actions/suppliers";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/hooks/useActionToast";

interface DeleteSupplierButtonProps {
  supplierId:   number;
  supplierName: string;
  hasItems:     boolean;
  redirectTo?:  string;
}

export function DeleteSupplierButton({
  supplierId,
  supplierName,
  hasItems,
  redirectTo,
}: DeleteSupplierButtonProps) {
  const router   = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<SupplierFormState, FormData>(deleteSupplier, undefined);

  useActionToast(state, { success: "공급업체가 삭제되었습니다." });

  useEffect(() => {
    if (state && "success" in state) {
      if (redirectTo) router.push(redirectTo);
      else setIsOpen(false);
    }
  }, [state, redirectTo, router]);

  const errorMsg = state && "message" in state ? state.message : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={hasItems}
        title={hasItems ? "연결된 품목이 있어 삭제 불가" : "공급업체 삭제"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-colors",
          hasItems
            ? "border-border text-muted-foreground/40 cursor-not-allowed"
            : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30",
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
        삭제
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <p className="text-sm font-bold text-foreground">공급업체 삭제</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-foreground">
                <span className="font-bold">{supplierName}</span>을 삭제하시겠습니까?
              </p>
              <p className="text-[12px] text-muted-foreground">
                삭제된 공급업체는 복구할 수 없습니다.
              </p>

              {errorMsg && (
                <p className="text-[12px] text-red-500 font-semibold">{errorMsg}</p>
              )}

              <form action={formAction} className="flex items-center justify-end gap-3 pt-1">
                <input type="hidden" name="supplierId" value={supplierId} />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors",
                    isPending ? "opacity-60 cursor-not-allowed bg-red-400" : "bg-red-600 hover:bg-red-700",
                  )}
                >
                  {isPending ? "삭제 중..." : "삭제 확인"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
