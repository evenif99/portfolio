"use client";

import { useActionState, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Plus, Trash2, AlertCircle, ShoppingCart } from "lucide-react";
import { createPurchaseOrder } from "@/app/actions/purchaseOrders";
import type { POFormState } from "@/app/actions/purchaseOrders";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SupplierOption {
  id:           number;
  name:         string;
  leadTimeDays: number | null;
}

export interface ItemOption {
  id:        number;
  modelName: string;
  sku:       string;
  supplierId: number | null;
  quantity:  number;
  safetyStock: number;
  prices:    Array<{ supplierId: number; unitPrice: number; moq: number | null }>;
}

interface LineItem {
  key:       number;
  itemId:    string;
  quantity:  string;
  unitPrice: string;
}

const labelCls = "block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide";
const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

// ─── PONewForm ────────────────────────────────────────────────────────────────

export function PONewForm({
  suppliers,
  allItems,
  recommendedItems,
}: {
  suppliers:        SupplierOption[];
  allItems:         ItemOption[];
  recommendedItems: ItemOption[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<POFormState, FormData>(
    createPurchaseOrder,
    undefined,
  );

  const [supplierId, setSupplierId] = useState<string>("");
  const [lines, setLines]           = useState<LineItem[]>([{ key: 0, itemId: "", quantity: "1", unitPrice: "" }]);
  const [nextKey, setNextKey]       = useState(1);

  const errorMsg = state && "message" in state ? state.message : undefined;

  // 발주서 생성 성공 시 상세 페이지로 이동
  useEffect(() => {
    if (state && "success" in state && state.orderId) {
      router.push(`/dashboard/purchase-orders/${state.orderId}`);
    }
  }, [state, router]);

  // 공급업체 선택 시 해당 공급업체의 품목만 필터
  const supplierItems = supplierId
    ? allItems.filter((it) => it.supplierId === Number(supplierId))
    : allItems;

  const getPrice = useCallback(
    (itemId: string, sid: string) => {
      if (!itemId || !sid) return "";
      const item = allItems.find((it) => it.id === Number(itemId));
      if (!item) return "";
      const priceRow = item.prices.find((p) => p.supplierId === Number(sid));
      return priceRow ? String(priceRow.unitPrice) : "";
    },
    [allItems],
  );

  const handleSupplierChange = (sid: string) => {
    setSupplierId(sid);
    // 이미 선택된 품목 라인의 단가 자동 갱신
    setLines((prev) =>
      prev.map((l) => ({
        ...l,
        unitPrice: getPrice(l.itemId, sid),
      })),
    );
  };

  const handleItemChange = (key: number, itemId: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.key === key
          ? { ...l, itemId, unitPrice: getPrice(itemId, supplierId) }
          : l,
      ),
    );
  };

  const addLine = () => {
    setLines((prev) => [...prev, { key: nextKey, itemId: "", quantity: "1", unitPrice: "" }]);
    setNextKey((k) => k + 1);
  };

  const removeLine = (key: number) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  };

  // 추천 품목 일괄 적재
  const loadRecommended = () => {
    if (!supplierId) return;
    const rec = recommendedItems.filter(
      (it) => it.supplierId === Number(supplierId),
    );
    if (rec.length === 0) return;

    const newLines = rec.map((it, idx) => {
      const recommended = Math.max(
        it.safetyStock * 2 - it.quantity,
        it.prices[0]?.moq ?? 1,
      );
      return {
        key:       nextKey + idx,
        itemId:    String(it.id),
        quantity:  String(recommended),
        unitPrice: getPrice(String(it.id), supplierId),
      };
    });
    setLines(newLines);
    setNextKey((k) => k + rec.length);
  };

  const selectedSupplier = suppliers.find((s) => s.id === Number(supplierId));

  // 총액 계산
  const total = lines.reduce((s, l) => {
    const qty   = Number(l.quantity)  || 0;
    const price = Number(l.unitPrice) || 0;
    return s + qty * price;
  }, 0);

  return (
    <form action={formAction} className="p-6 space-y-5 max-w-3xl">

      {/* 공급업체 선택 */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-bold text-foreground">공급업체</p>

        <div>
          <label htmlFor="supplierId" className={labelCls}>
            공급업체 <span className="text-red-500 normal-case">*</span>
          </label>
          <select
            id="supplierId"
            name="supplierId"
            value={supplierId}
            onChange={(e) => handleSupplierChange(e.target.value)}
            className={inputCls}
          >
            <option value="">공급업체를 선택하세요</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.leadTimeDays ? ` (리드타임 ${s.leadTimeDays}일)` : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedSupplier?.leadTimeDays && (
          <p className="text-[11px] text-muted-foreground">
            입고 예정일 기준: 발주 확정 후{" "}
            <span className="font-semibold text-violet-600">{selectedSupplier.leadTimeDays}일</span> 후
          </p>
        )}
      </div>

      {/* 품목 라인 */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">발주 품목</p>
          <div className="flex items-center gap-2">
            {recommendedItems.some((it) => it.supplierId === Number(supplierId)) && (
              <button
                type="button"
                onClick={loadRecommended}
                disabled={!supplierId}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 text-[12px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors disabled:opacity-40"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                추천 품목 불러오기
              </button>
            )}
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              품목 추가
            </button>
          </div>
        </div>

        {/* 헤더 */}
        <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-1">
          <div className="col-span-5">품목</div>
          <div className="col-span-3 text-right">수량</div>
          <div className="col-span-3 text-right">단가 (₩)</div>
          <div className="col-span-1" />
        </div>

        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={line.key} className="grid grid-cols-12 gap-2 items-center">
              {/* hidden fields */}
              <input type="hidden" name={`itemId_${idx}`}    value={line.itemId}    />
              <input type="hidden" name={`quantity_${idx}`}  value={line.quantity}  />
              <input type="hidden" name={`unitPrice_${idx}`} value={line.unitPrice} />

              {/* 품목 선택 */}
              <div className="col-span-5">
                <select
                  value={line.itemId}
                  onChange={(e) => handleItemChange(line.key, e.target.value)}
                  className={cn(inputCls, "text-[12px]")}
                >
                  <option value="">품목 선택</option>
                  {(supplierId ? supplierItems : allItems).map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.modelName} ({it.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* 수량 */}
              <div className="col-span-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={line.quantity}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setLines((prev) =>
                      prev.map((l) => l.key === line.key ? { ...l, quantity: v } : l),
                    );
                  }}
                  className={cn(inputCls, "text-[12px] text-right")}
                  placeholder="0"
                />
              </div>

              {/* 단가 */}
              <div className="col-span-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={line.unitPrice}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d.]/g, "");
                    setLines((prev) =>
                      prev.map((l) => l.key === line.key ? { ...l, unitPrice: v } : l),
                    );
                  }}
                  className={cn(inputCls, "text-[12px] text-right")}
                  placeholder="0"
                />
              </div>

              {/* 삭제 */}
              <div className="col-span-1 flex justify-center">
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 총액 */}
        {total > 0 && (
          <div className="flex justify-end pt-2 border-t border-border">
            <p className="text-[13px] font-bold text-foreground">
              총액 <span className="text-blue-600 ml-2">₩{total.toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>

      {/* 비고 */}
      <div className="rounded-lg border border-border bg-card p-5">
        <label htmlFor="notes" className={labelCls}>비고</label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="발주 관련 메모 (선택)"
          className={cn(inputCls, "resize-none")}
        />
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-600 dark:text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* 액션 */}
      <div className="flex items-center justify-end gap-3">
        <a
          href="/dashboard/purchase-orders"
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          취소
        </a>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "rounded-md px-6 py-2 text-sm font-semibold text-white transition-colors",
            isPending ? "opacity-60 cursor-not-allowed bg-blue-500" : "bg-blue-600 hover:bg-blue-700",
          )}
        >
          {isPending ? "저장 중..." : "초안 저장"}
        </button>
      </div>
    </form>
  );
}
