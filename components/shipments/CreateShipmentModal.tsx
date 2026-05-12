"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { Plus, X, Trash2, AlertCircle } from "lucide-react";
import { createShipment } from "@/app/actions/shipments";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShipmentItem {
  itemId:    number;
  sku:       string;
  modelName: string;
  quantity:  number;
  stock:     number; // 현재 재고
}

export interface InventoryOption {
  id:        number;
  sku:       string;
  modelName: string;
  quantity:  number;
}

interface CreateShipmentModalProps {
  items: InventoryOption[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const labelCls   = "block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide";
const inputCls   = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";
const selectCls  = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateShipmentModal({ items }: CreateShipmentModalProps) {
  const [isOpen, setIsOpen]   = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [lines, setLines]     = useState<ShipmentItem[]>([]);
  const overlayRef            = useRef<HTMLDivElement>(null);

  const [state, formAction, isPending] = useActionState(createShipment, undefined);

  const errorMsg    = state && "message" in state ? state.message    : undefined;
  const fieldErrors = state && "errors"  in state ? state.errors     : undefined;

  // 성공 시 모달 닫기
  useEffect(() => {
    if (state && "success" in state) {
      setIsOpen(false);
      setFormKey((k) => k + 1);
      setLines([]);
    }
  }, [state]);

  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  // 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function addLine() {
    const first = items.find((it) => !lines.some((l) => l.itemId === it.id));
    if (!first) return;
    setLines((prev) => [...prev, { itemId: first.id, sku: first.sku, modelName: first.modelName, quantity: 1, stock: first.quantity }]);
  }

  function removeLine(i: number) { setLines((prev) => prev.filter((_, idx) => idx !== i)); }

  function updateLineItem(i: number, itemId: number) {
    const found = items.find((it) => it.id === itemId);
    if (!found) return;
    setLines((prev) => prev.map((l, idx) =>
      idx === i ? { ...l, itemId: found.id, sku: found.sku, modelName: found.modelName, stock: found.quantity } : l
    ));
  }

  function updateLineQty(i: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    const qty = digits === "" ? 0 : parseInt(digits, 10);
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, quantity: qty } : l));
  }

  // 이미 선택된 품목 ID 목록 (중복 방지)
  const selectedIds = new Set(lines.map((l) => l.itemId));

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        신규 출고 요청
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10 px-4"
          onClick={(e) => { if (e.target === overlayRef.current) setIsOpen(false); }}
        >
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <p className="text-sm font-bold text-foreground">신규 출고 요청</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">출고 요청서를 작성합니다. 출고번호는 자동 생성됩니다.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form key={formKey} action={formAction} className="p-6 space-y-5">

              {/* Row 1: 요청처 / 부서 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>요청처 <span className="text-red-500 normal-case">*</span></label>
                  <input name="requester" placeholder="예: 서버팀 김민준"
                    className={cn(inputCls, fieldErrors?.requester && "border-red-400")} />
                  {fieldErrors?.requester && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.requester[0]}</p>}
                </div>
                <div>
                  <label className={labelCls}>부서 <span className="text-muted-foreground normal-case font-normal">(선택)</span></label>
                  <input name="department" placeholder="예: 인프라팀" className={inputCls} />
                </div>
              </div>

              {/* Row 2: 우선순위 / 납기 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>우선순위</label>
                  <select name="priority" defaultValue="NORMAL" className={selectCls}>
                    <option value="LOW">낮음</option>
                    <option value="NORMAL">보통</option>
                    <option value="HIGH">높음</option>
                    <option value="URGENT">긴급</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>납기 <span className="text-muted-foreground normal-case font-normal">(선택)</span></label>
                  <input type="date" name="dueDate" className={inputCls} />
                </div>
              </div>

              {/* Row 3: 품목 목록 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls + " mb-0"}>
                    품목 <span className="text-red-500 normal-case">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addLine}
                    disabled={items.length === 0}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" /> 품목 추가
                  </button>
                </div>

                {lines.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border py-6 text-center">
                    <p className="text-[12px] text-muted-foreground">품목 추가 버튼으로 품목을 추가하세요.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* 헤더 */}
                    <div className="grid grid-cols-[1fr_120px_80px_32px] gap-2 px-1">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">품목</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">수량</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">현재 재고</p>
                      <span />
                    </div>

                    {lines.map((line, i) => (
                      <div key={i} className="grid grid-cols-[1fr_120px_80px_32px] gap-2 items-center">
                        {/* 품목 select */}
                        <select
                          name={`itemId_${i}`}
                          value={line.itemId}
                          onChange={(e) => updateLineItem(i, Number(e.target.value))}
                          className={selectCls}
                        >
                          {items.map((it) => (
                            <option
                              key={it.id}
                              value={it.id}
                              disabled={selectedIds.has(it.id) && it.id !== line.itemId}
                            >
                              {it.sku} · {it.modelName}
                            </option>
                          ))}
                        </select>

                        {/* 수량 */}
                        <div className="relative">
                          <input
                            name={`qty_${i}`}
                            type="text"
                            inputMode="numeric"
                            value={line.quantity === 0 ? "" : line.quantity}
                            placeholder="0"
                            onChange={(e) => updateLineQty(i, e.target.value)}
                            className={cn(
                              inputCls,
                              line.quantity > line.stock && "border-amber-400 focus:ring-amber-400",
                            )}
                          />
                          {line.quantity > line.stock && (
                            <p className="absolute top-full left-0 mt-0.5 text-[10px] text-amber-600 whitespace-nowrap">재고 초과</p>
                          )}
                        </div>

                        {/* 현재 재고 */}
                        <p className={cn(
                          "text-center text-sm font-bold tabular-nums",
                          line.stock === 0 ? "text-red-500" : line.stock < 10 ? "text-amber-600" : "text-emerald-600",
                        )}>
                          {line.stock}
                        </p>

                        {/* 삭제 */}
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          className="flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 4: 비고 */}
              <div>
                <label className={labelCls}>비고 <span className="text-muted-foreground normal-case font-normal">(선택)</span></label>
                <textarea name="notes" rows={2} placeholder="출고 요청 관련 메모"
                  className={cn(inputCls, "resize-none")} />
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-600 dark:text-red-400">{errorMsg}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1 border-t border-border">
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
                    "rounded-md px-5 py-2 text-sm font-semibold text-white transition-colors",
                    isPending ? "opacity-60 cursor-not-allowed bg-blue-500" : "bg-blue-600 hover:bg-blue-700",
                  )}
                >
                  {isPending ? "처리 중..." : "출고 요청 등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
