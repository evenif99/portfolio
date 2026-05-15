"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { createWarehouse, updateWarehouse, type WarehouseFormState } from "@/app/actions/warehouses";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/hooks/useActionToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface EditableWarehouse {
  id: number;
  name: string;
  location: string;
  zone: string | null;
  capacity: number;
}

interface WarehouseFormModalProps {
  mode: "create" | "edit";
  warehouse?: EditableWarehouse;
  trigger: React.ReactNode;
}

export function WarehouseFormModal({ mode, warehouse, trigger }: WarehouseFormModalProps) {
  const [open, setOpen] = useState(false);
  const action = mode === "create" ? createWarehouse : updateWarehouse;
  const [state, formAction, isPending] = useActionState<WarehouseFormState, FormData>(action, undefined);

  useActionToast(state, {
    success: mode === "create" ? "창고가 등록되었습니다." : "창고 정보가 수정되었습니다.",
  });

  useEffect(() => {
    if (!(state && "success" in state)) return;
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [state]);

  const fieldErrors = state && "errors" in state ? state.errors : undefined;
  const errorMsg = state && "message" in state ? state.message : undefined;

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-flex">
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "창고 등록" : "창고 수정"}</DialogTitle>
          <DialogDescription>
            창고 위치와 용량을 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-3">
          {mode === "edit" && <input type="hidden" name="warehouseId" value={warehouse?.id} />}

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">창고명</label>
            <input
              name="name"
              defaultValue={warehouse?.name ?? ""}
              className={cn(
                "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                fieldErrors?.name && "border-red-400",
              )}
            />
            {fieldErrors?.name && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.name[0]}</p>}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">위치</label>
            <input
              name="location"
              defaultValue={warehouse?.location ?? ""}
              className={cn(
                "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                fieldErrors?.location && "border-red-400",
              )}
            />
            {fieldErrors?.location && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.location[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">구역</label>
              <input
                name="zone"
                defaultValue={warehouse?.zone ?? ""}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">용량</label>
              <input
                name="capacity"
                type="number"
                min={1}
                defaultValue={warehouse?.capacity ?? 5000}
                className={cn(
                  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                  fieldErrors?.capacity && "border-red-400",
                )}
              />
              {fieldErrors?.capacity && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.capacity[0]}</p>}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-red-500" />
              <p className="text-[12px] text-red-600">{errorMsg}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? "처리 중..." : mode === "create" ? "등록" : "수정"}
            </button>
          </div>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
