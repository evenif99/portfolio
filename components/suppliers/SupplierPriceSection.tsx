"use client";

import { useActionState, useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, AlertCircle, Tag } from "lucide-react";
import {
  upsertSupplierItemPrice,
  deleteSupplierItemPrice,
} from "@/app/actions/supplierPrices";
import type { SupplierPriceFormState } from "@/app/actions/supplierPrices";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/hooks/useActionToast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PriceRow {
  id:        number;
  itemId:    number;
  modelName: string;
  sku:       string;
  unitPrice: number;
  moq:       number | null;
  notes:     string | null;
}

export interface ItemOption {
  id:        number;
  modelName: string;
  sku:       string;
}

interface SupplierPriceSectionProps {
  supplierId:  number;
  prices:      PriceRow[];
  itemOptions: ItemOption[];
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelCls = "block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide";
const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

// ─── UpsertModal ──────────────────────────────────────────────────────────────

function UpsertModal({
  supplierId,
  itemOptions,
  editing,
  onClose,
}: {
  supplierId:  number;
  itemOptions: ItemOption[];
  editing:     PriceRow | null;
  onClose:     () => void;
}) {
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, isPending] = useActionState<SupplierPriceFormState, FormData>(
    upsertSupplierItemPrice,
    undefined,
  );

  const errorMsg    = state && "message" in state ? state.message : undefined;
  const fieldErrors = state && "errors"  in state ? state.errors  : undefined;

  useActionToast(state, { success: "단가가 저장되었습니다." });

  useEffect(() => {
    if (state && "success" in state) {
      onClose();
      setFormKey((k) => k + 1);
    }
  }, [state, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10 px-4"
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">

        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-sm font-bold text-foreground">
              {editing ? "단가 수정" : "단가 등록"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {editing ? `${editing.modelName}` : "품목별 공급 단가를 등록합니다"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form key={formKey} action={formAction} className="p-6 space-y-4">
          <input type="hidden" name="supplierId" value={supplierId} />
          {editing && <input type="hidden" name="itemId" value={editing.itemId} />}

          {/* 품목 선택 (신규만) */}
          {!editing && (
            <div>
              <label htmlFor="sp-item" className={labelCls}>
                품목 <span className="text-red-500 normal-case">*</span>
              </label>
              <select
                id="sp-item"
                name="itemId"
                defaultValue=""
                className={cn(inputCls, fieldErrors?.itemId && "border-red-400 focus:ring-red-400")}
              >
                <option value="" disabled>품목을 선택하세요</option>
                {itemOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.modelName} ({opt.sku})
                  </option>
                ))}
              </select>
              {fieldErrors?.itemId && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.itemId[0]}</p>
              )}
            </div>
          )}

          {/* 단가 / MOQ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sp-price" className={labelCls}>
                단가 (₩) <span className="text-red-500 normal-case">*</span>
              </label>
              <input
                id="sp-price"
                name="unitPrice"
                type="text"
                inputMode="decimal"
                defaultValue={editing?.unitPrice ?? ""}
                placeholder="예: 45000"
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d.]/g, "");
                  e.target.value = v;
                }}
                className={cn(inputCls, fieldErrors?.unitPrice && "border-red-400 focus:ring-red-400")}
              />
              {fieldErrors?.unitPrice && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.unitPrice[0]}</p>
              )}
            </div>
            <div>
              <label htmlFor="sp-moq" className={labelCls}>
                MOQ <span className="text-muted-foreground normal-case font-normal">(최소 주문)</span>
              </label>
              <input
                id="sp-moq"
                name="moq"
                type="text"
                inputMode="numeric"
                defaultValue={editing?.moq ?? ""}
                placeholder="예: 10"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  e.target.value = digits;
                }}
                className={inputCls}
              />
            </div>
          </div>

          {/* 비고 */}
          <div>
            <label htmlFor="sp-notes" className={labelCls}>비고</label>
            <textarea
              id="sp-notes"
              name="notes"
              rows={2}
              defaultValue={editing?.notes ?? ""}
              placeholder="단가 관련 메모 (선택)"
              className={cn(inputCls, "resize-none")}
            />
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
                "rounded-md px-5 py-2 text-sm font-semibold text-white transition-colors",
                isPending ? "opacity-60 cursor-not-allowed bg-blue-500" : "bg-blue-600 hover:bg-blue-700",
              )}
            >
              {isPending ? "처리 중..." : editing ? "저장" : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DeleteButton ─────────────────────────────────────────────────────────────

function DeleteButton({ priceId, supplierId }: { priceId: number; supplierId: number }) {
  const [state, formAction, isPending] = useActionState<SupplierPriceFormState, FormData>(
    deleteSupplierItemPrice,
    undefined,
  );

  useActionToast(state, { success: "단가가 삭제되었습니다." });

  return (
    <form action={formAction}>
      <input type="hidden" name="priceId"    value={priceId}    />
      <input type="hidden" name="supplierId" value={supplierId} />
      <button
        type="submit"
        disabled={isPending}
        onClick={(e) => {
          if (!confirm("이 단가 정보를 삭제할까요?")) e.preventDefault();
        }}
        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-3 w-3" />
        삭제
      </button>
    </form>
  );
}

// ─── SupplierPriceSection ─────────────────────────────────────────────────────

export function SupplierPriceSection({
  supplierId,
  prices,
  itemOptions,
}: SupplierPriceSectionProps) {
  const [modal, setModal] = useState<"closed" | "create" | PriceRow>("closed");

  const editingRow = modal !== "closed" && modal !== "create" ? modal : null;
  const isOpen     = modal !== "closed";

  // 이미 등록된 품목은 신규 등록 목록에서 제외
  const registeredItemIds = new Set(prices.map((p) => p.itemId));
  const availableItems    = itemOptions.filter((o) => !registeredItemIds.has(o.id));

  return (
    <>
      {/* 모달 */}
      {isOpen && (
        <UpsertModal
          supplierId={supplierId}
          itemOptions={editingRow ? [] : availableItems}
          editing={editingRow}
          onClose={() => setModal("closed")}
        />
      )}

      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-bold text-foreground">단가 관리</span>
          {prices.length > 0 && (
            <span className="rounded-full bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
              {prices.length}종
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={availableItems.length === 0}
          onClick={() => setModal("create")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
            availableItems.length === 0
              ? "cursor-not-allowed text-muted-foreground/50"
              : "bg-blue-600 text-white hover:bg-blue-700",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          단가 등록
        </button>
      </div>

      {/* 테이블 or 빈 상태 */}
      {prices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Tag className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-[12px] font-semibold text-foreground">등록된 단가 없음</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {availableItems.length > 0
              ? "단가 등록 버튼으로 공급 단가를 추가하세요"
              : "취급 품목이 없습니다"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">품목</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">단가 (₩)</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">MOQ</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">비고</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {prices.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-foreground">{row.modelName}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{row.sku}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="font-bold tabular-nums text-emerald-600">
                      ₩{row.unitPrice.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {row.moq ? `${row.moq.toLocaleString()}개` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground max-w-[200px] truncate">
                    {row.notes ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setModal(row)}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        수정
                      </button>
                      <DeleteButton priceId={row.id} supplierId={supplierId} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
