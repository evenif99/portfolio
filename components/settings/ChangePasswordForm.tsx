"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/app/actions/profile";
import type { ChangePasswordState } from "@/app/actions/profile";

export function ChangePasswordForm() {
  const [state, action, isPending] = useActionState<ChangePasswordState, FormData>(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  const fieldError = (field: string) =>
    state && "errors" in state ? state.errors?.[field]?.[0] : undefined;

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state && "message" in state && state.message && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {state.message}
        </p>
      )}
      {state && "success" in state && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
          비밀번호가 변경되었습니다.
        </p>
      )}

      <div>
        <label htmlFor="currentPassword" className="block text-[12px] font-semibold text-foreground mb-1.5">현재 비밀번호</label>
        <input
          id="currentPassword"
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldError("currentPassword") && (
          <p className="mt-1 text-[11px] text-red-500">{fieldError("currentPassword")}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-[12px] font-semibold text-foreground mb-1.5">새 비밀번호</label>
        <input
          id="newPassword"
          type="password"
          name="newPassword"
          autoComplete="new-password"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldError("newPassword") && (
          <p className="mt-1 text-[11px] text-red-500">{fieldError("newPassword")}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-[12px] font-semibold text-foreground mb-1.5">새 비밀번호 확인</label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldError("confirmPassword") && (
          <p className="mt-1 text-[11px] text-red-500">{fieldError("confirmPassword")}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {isPending ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
