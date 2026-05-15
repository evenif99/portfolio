"use client";

import { useState, useActionState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { createUser } from "@/app/actions/users";
import { ROLE_LABELS } from "@/lib/rbac";
import { useActionToast } from "@/hooks/useActionToast";

export function UserCreateModal() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createUser, undefined);

  useActionToast(state, { success: "사용자가 추가되었습니다." });

  useEffect(() => {
    if (state && "success" in state) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        <UserPlus className="h-3.5 w-3.5" />
        사용자 추가
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-bold text-foreground">사용자 추가</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form action={action} className="p-5 space-y-4">
              {state && "message" in state && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-[12px] text-destructive">{state.message}</p>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">이름 *</label>
                <input
                  name="name"
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state && "errors" in state && state.errors?.name && (
                  <p className="mt-1 text-[11px] text-destructive">{state.errors.name[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">이메일 *</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state && "errors" in state && state.errors?.email && (
                  <p className="mt-1 text-[11px] text-destructive">{state.errors.email[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">비밀번호 * (8자 이상)</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state && "errors" in state && state.errors?.password && (
                  <p className="mt-1 text-[11px] text-destructive">{state.errors.password[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">역할 *</label>
                <select
                  name="role"
                  defaultValue="OPERATOR"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Object.entries(ROLE_LABELS) as [string, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-border px-4 py-2 text-[12px] font-semibold text-foreground hover:bg-muted/40 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {pending ? "추가 중…" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
