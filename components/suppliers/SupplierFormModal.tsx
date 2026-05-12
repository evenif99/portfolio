"use client";

import { useActionState, useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { createSupplier, updateSupplier } from "@/app/actions/suppliers";
import type { SupplierFormState } from "@/app/actions/suppliers";
import { cn } from "@/lib/utils";

export interface EditableSupplier {
  id:           number;
  name:         string;
  contact:      string | null;
  email:        string | null;
  phone:        string | null;
  address:      string | null;
  leadTimeDays: number | null;
  notes:        string | null;
}

interface SupplierFormModalProps {
  mode:      "create" | "edit";
  supplier?: EditableSupplier;
  trigger:   React.ReactNode;
}

const labelCls  = "block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide";
const inputCls  = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

export function SupplierFormModal({ mode, supplier, trigger }: SupplierFormModalProps) {
  const [isOpen,   setIsOpen]   = useState(false);
  const [formKey,  setFormKey]  = useState(0);

  const action = mode === "create" ? createSupplier : updateSupplier;
  const [state, formAction, isPending] = useActionState<SupplierFormState, FormData>(action, undefined);

  const errorMsg    = state && "message" in state ? state.message  : undefined;
  const fieldErrors = state && "errors"  in state ? state.errors   : undefined;

  useEffect(() => {
    if (state && "success" in state) {
      setIsOpen(false);
      setFormKey((k) => k + 1);
    }
  }, [state]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <span onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </span>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10 px-4"
          onClick={(e) => { if (e.currentTarget === e.target) setIsOpen(false); }}
        >
          <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {mode === "create" ? "공급업체 등록" : "공급업체 정보 수정"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {mode === "create" ? "새 공급업체를 등록합니다." : supplier?.name}
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

            <form key={formKey} action={formAction} className="p-6 space-y-4">
              {mode === "edit" && (
                <input type="hidden" name="supplierId" value={supplier!.id} />
              )}

              {/* 업체명 */}
              <div>
                <label htmlFor="sup-name" className={labelCls}>
                  업체명 <span className="text-red-500 normal-case">*</span>
                </label>
                <input
                  id="sup-name"
                  name="name"
                  defaultValue={supplier?.name}
                  placeholder="예: (주)테크부품코리아"
                  className={cn(inputCls, fieldErrors?.name && "border-red-400 focus:ring-red-400")}
                />
                {fieldErrors?.name && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.name[0]}</p>}
              </div>

              {/* 담당자 / 전화 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sup-contact" className={labelCls}>담당자</label>
                  <input
                    id="sup-contact"
                    name="contact"
                    defaultValue={supplier?.contact ?? ""}
                    placeholder="예: 홍길동"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="sup-phone" className={labelCls}>전화번호</label>
                  <input
                    id="sup-phone"
                    name="phone"
                    defaultValue={supplier?.phone ?? ""}
                    placeholder="예: 02-1234-5678"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label htmlFor="sup-email" className={labelCls}>이메일</label>
                <input
                  id="sup-email"
                  name="email"
                  type="email"
                  defaultValue={supplier?.email ?? ""}
                  placeholder="예: sales@example.com"
                  className={cn(inputCls, fieldErrors?.email && "border-red-400 focus:ring-red-400")}
                />
                {fieldErrors?.email && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.email[0]}</p>}
              </div>

              {/* 주소 */}
              <div>
                <label htmlFor="sup-address" className={labelCls}>주소</label>
                <input
                  id="sup-address"
                  name="address"
                  defaultValue={supplier?.address ?? ""}
                  placeholder="예: 서울특별시 강남구 테헤란로 123"
                  className={inputCls}
                />
              </div>

              {/* 리드타임 */}
              <div>
                <label htmlFor="sup-lead" className={labelCls}>
                  리드타임 (일) <span className="text-muted-foreground normal-case font-normal">(선택)</span>
                </label>
                <input
                  id="sup-lead"
                  name="leadTimeDays"
                  type="text"
                  inputMode="numeric"
                  defaultValue={supplier?.leadTimeDays ?? ""}
                  placeholder="예: 7"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    e.target.value = digits;
                  }}
                  className={cn(inputCls, fieldErrors?.leadTimeDays && "border-red-400 focus:ring-red-400")}
                />
                <p className="mt-0.5 text-[10px] text-muted-foreground">발주 후 입고까지 예상 소요 일수</p>
                {fieldErrors?.leadTimeDays && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.leadTimeDays[0]}</p>}
              </div>

              {/* 비고 */}
              <div>
                <label htmlFor="sup-notes" className={labelCls}>비고</label>
                <textarea
                  id="sup-notes"
                  name="notes"
                  rows={2}
                  defaultValue={supplier?.notes ?? ""}
                  placeholder="공급업체 관련 메모"
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
