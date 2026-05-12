"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { Plus, X, Trash2, AlertCircle } from "lucide-react";
import { createItem, updateItem } from "@/app/actions/items";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RefData {
  categories: { id: number; name: string }[];
  brands:     { id: number; name: string }[];
  suppliers:  { id: number; name: string }[];
  warehouses: { id: number; name: string }[];
}

export interface EditableItem {
  id:          number;
  sku:         string;
  name:        string;
  modelName:   string;
  categoryId:  number;
  brandId:     number;
  supplierId:  number | null;
  warehouseId: number;
  quantity:    number;
  safetyStock: number;
  unitPrice:   number | null;
  imageUrl:    string | null;
  notes:       string | null;
  specs:       Record<string, string> | null;
}

interface ItemFormModalProps {
  mode:     "create" | "edit";
  item?:    EditableItem;
  refData:  RefData;
  trigger:  React.ReactNode;
}

// ─── Field helpers ────────────────────────────────────────────────────────────

const labelCls = "block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide";
const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";
const selectCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

// ─── Component ────────────────────────────────────────────────────────────────

export function ItemFormModal({ mode, item, refData, trigger }: ItemFormModalProps) {
  const [isOpen, setIsOpen]   = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [specs, setSpecs]     = useState<{ key: string; val: string }[]>(
    item?.specs ? Object.entries(item.specs).map(([key, val]) => ({ key, val })) : [],
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  const action = mode === "create" ? createItem : updateItem;
  const [state, formAction, isPending] = useActionState(action, undefined);

  const errorMsg   = state && "message" in state ? state.message : undefined;
  const fieldErrors = state && "errors"  in state ? state.errors  : undefined;

  // 성공 시 모달 닫기 + 폼 초기화
  useEffect(() => {
    if (state && "success" in state) {
      setIsOpen(false);
      setFormKey((k) => k + 1);
      setSpecs(item?.specs ? Object.entries(item.specs).map(([k, v]) => ({ key: k, val: v })) : []);
    }
  }, [state]);

  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  // 오버레이 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function addSpec() { setSpecs((s) => [...s, { key: "", val: "" }]); }
  function removeSpec(i: number) { setSpecs((s) => s.filter((_, idx) => idx !== i)); }
  function updateSpec(i: number, field: "key" | "val", val: string) {
    setSpecs((s) => s.map((sp, idx) => idx === i ? { ...sp, [field]: val } : sp));
  }

  return (
    <>
      {/* Trigger */}
      <span onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </span>

      {/* Modal overlay */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10 px-4"
          onClick={(e) => { if (e.target === overlayRef.current) setIsOpen(false); }}
        >
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {mode === "create" ? "신규 품목 등록" : "품목 정보 수정"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {mode === "create"
                    ? "새 재고 품목을 등록합니다."
                    : `${item?.sku} · 수량은 입출고 등록으로만 변경됩니다.`}
                </p>
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
              {mode === "edit" && (
                <input type="hidden" name="itemId" value={item!.id} />
              )}

              {/* Row 1: SKU / 품목명 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>SKU <span className="text-red-500 normal-case">*</span></label>
                  <input name="sku" defaultValue={item?.sku} placeholder="예: CPU-AMD-7800X-001"
                    className={cn(inputCls, fieldErrors?.sku && "border-red-400 focus:ring-red-400")} />
                  {fieldErrors?.sku && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.sku[0]}</p>}
                </div>
                <div>
                  <label className={labelCls}>품목명 <span className="text-red-500 normal-case">*</span></label>
                  <input name="name" defaultValue={item?.name} placeholder="예: AMD 라이젠 7 7800X3D"
                    className={cn(inputCls, fieldErrors?.name && "border-red-400 focus:ring-red-400")} />
                  {fieldErrors?.name && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.name[0]}</p>}
                </div>
              </div>

              {/* Row 2: 모델명 */}
              <div>
                <label className={labelCls}>모델명 <span className="text-red-500 normal-case">*</span></label>
                <input name="modelName" defaultValue={item?.modelName} placeholder="예: Ryzen 7 7800X3D"
                  className={cn(inputCls, fieldErrors?.modelName && "border-red-400 focus:ring-red-400")} />
                {fieldErrors?.modelName && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.modelName[0]}</p>}
              </div>

              {/* Row 3: 카테고리 / 브랜드 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>카테고리 <span className="text-red-500 normal-case">*</span></label>
                  <select name="categoryId" defaultValue={item?.categoryId ?? ""} className={cn(selectCls, fieldErrors?.categoryId && "border-red-400")}>
                    <option value="">선택하세요</option>
                    {refData.categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {fieldErrors?.categoryId && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.categoryId[0]}</p>}
                </div>
                <div>
                  <label className={labelCls}>브랜드 <span className="text-red-500 normal-case">*</span></label>
                  <select name="brandId" defaultValue={item?.brandId ?? ""} className={cn(selectCls, fieldErrors?.brandId && "border-red-400")}>
                    <option value="">선택하세요</option>
                    {refData.brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {fieldErrors?.brandId && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.brandId[0]}</p>}
                </div>
              </div>

              {/* Row 4: 공급업체 / 창고 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>공급업체 <span className="text-muted-foreground normal-case font-normal">(선택)</span></label>
                  <select name="supplierId" defaultValue={item?.supplierId ?? ""} className={selectCls}>
                    <option value="">없음</option>
                    {refData.suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>창고 <span className="text-red-500 normal-case">*</span></label>
                  <select name="warehouseId" defaultValue={item?.warehouseId ?? ""} className={cn(selectCls, fieldErrors?.warehouseId && "border-red-400")}>
                    <option value="">선택하세요</option>
                    {refData.warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  {fieldErrors?.warehouseId && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.warehouseId[0]}</p>}
                </div>
              </div>

              {/* Row 5: 초기수량(등록시) / 안전재고 / 단가 */}
              <div className="grid grid-cols-3 gap-4">
                {mode === "create" && (
                  <div>
                    <label className={labelCls}>초기 수량</label>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" name="quantity"
                      defaultValue={0}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        e.target.value = digits === "" ? "0" : String(parseInt(digits, 10));
                      }}
                      className={inputCls} />
                    <p className="mt-0.5 text-[10px] text-muted-foreground">이력 없이 직접 설정</p>
                  </div>
                )}
                <div>
                  <label className={labelCls}>안전재고</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" name="safetyStock"
                    defaultValue={item?.safetyStock ?? 10}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      e.target.value = digits === "" ? "0" : String(parseInt(digits, 10));
                    }}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>단가 (₩) <span className="text-muted-foreground normal-case font-normal">(선택)</span></label>
                  <input type="text" inputMode="numeric" name="unitPrice"
                    defaultValue={item?.unitPrice ?? ""}
                    placeholder="0"
                    className={cn(inputCls, fieldErrors?.unitPrice && "border-red-400")} />
                  {fieldErrors?.unitPrice && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.unitPrice[0]}</p>}
                </div>
              </div>

              {/* Row 6: 이미지 URL */}
              <div>
                <label className={labelCls}>이미지 URL <span className="text-muted-foreground normal-case font-normal">(선택)</span></label>
                <input name="imageUrl" defaultValue={item?.imageUrl ?? ""} placeholder="https://example.com/image.jpg"
                  className={cn(inputCls, fieldErrors?.imageUrl && "border-red-400 focus:ring-red-400")} />
                {fieldErrors?.imageUrl && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.imageUrl[0]}</p>}
              </div>

              {/* Row 7: 스펙 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls + " mb-0"}>
                    스펙 <span className="text-muted-foreground normal-case font-normal">(선택)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3 w-3" /> 항목 추가
                  </button>
                </div>
                {specs.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">스펙 항목이 없습니다. 항목 추가 버튼으로 추가하세요.</p>
                )}
                <div className="space-y-2">
                  {specs.map((sp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        name={`specKey_${i}`}
                        value={sp.key}
                        onChange={(e) => updateSpec(i, "key", e.target.value)}
                        placeholder="항목명 (예: 소켓)"
                        className={cn(inputCls, "flex-1")}
                      />
                      <input
                        name={`specVal_${i}`}
                        value={sp.val}
                        onChange={(e) => updateSpec(i, "val", e.target.value)}
                        placeholder="값 (예: AM5)"
                        className={cn(inputCls, "flex-1")}
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        className="flex-shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 8: 비고 */}
              <div>
                <label className={labelCls}>비고 <span className="text-muted-foreground normal-case font-normal">(선택)</span></label>
                <textarea name="notes" rows={2} defaultValue={item?.notes ?? ""}
                  placeholder="품목 관련 메모"
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
                  {isPending ? "처리 중..." : mode === "create" ? "등록" : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
