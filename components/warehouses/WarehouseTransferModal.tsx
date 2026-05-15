"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { transferWarehouseStock, type TransferFormState } from "@/app/actions/warehouses";
import { useActionToast } from "@/hooks/useActionToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WarehouseOption {
  id: number;
  name: string;
}

interface TransferItem {
  id: number;
  sku: string;
  modelName: string;
  quantity: number;
  warehouseId: number;
}

interface WarehouseTransferModalProps {
  item: TransferItem;
  warehouses: WarehouseOption[];
  trigger: React.ReactNode;
}

export function WarehouseTransferModal({ item, warehouses, trigger }: WarehouseTransferModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<TransferFormState, FormData>(
    transferWarehouseStock,
    undefined,
  );

  const targetOptions = useMemo(
    () => warehouses.filter((w) => w.id !== item.warehouseId),
    [warehouses, item.warehouseId],
  );

  useActionToast(state, { success: "Transfer completed." });

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
          <DialogTitle>Warehouse Transfer</DialogTitle>
          <DialogDescription>Move stock between warehouses with a quantity.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="itemId" value={item.id} />

          <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-[12px]">
            <p className="font-semibold text-foreground">{item.modelName}</p>
            <p className="mt-0.5 text-muted-foreground">
              {item.sku} · Current stock {item.quantity.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Destination Warehouse</label>
            <select
              name="toWarehouseId"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              defaultValue={targetOptions[0]?.id ?? ""}
            >
              {targetOptions.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {fieldErrors?.toWarehouseId && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.toWarehouseId[0]}</p>}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Transfer Quantity</label>
            <input
              name="quantity"
              type="number"
              min={1}
              max={item.quantity}
              defaultValue={item.quantity}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Maximum transferable: {item.quantity.toLocaleString()}
            </p>
            {fieldErrors?.quantity && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.quantity[0]}</p>}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Reference</label>
            <input
              name="reference"
              placeholder="e.g. TRF-2026-0012"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Notes</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
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
              disabled={isPending || targetOptions.length === 0}
              className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
            >
              {isPending ? "Processing..." : "Run Transfer"}
            </button>
          </div>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
