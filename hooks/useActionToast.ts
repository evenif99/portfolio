"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionState =
  | { success: true; [key: string]: unknown }
  | { message?: string; errors?: unknown }
  | undefined;

interface ToastOptions {
  success?: string;
  error?: string;
}

/**
 * 서버 액션 useActionState 결과를 감지해 자동으로 toast를 표시한다.
 * state가 바뀔 때마다 실행되며, 초기 undefined는 무시한다.
 */
export function useActionToast(state: ActionState, options?: ToastOptions) {
  const prevRef = useRef<ActionState>(undefined);

  useEffect(() => {
    if (state === undefined || state === prevRef.current) return;
    prevRef.current = state;

    if ("success" in state) {
      toast.success(options?.success ?? "처리되었습니다.", {
        duration: 3000,
      });
    } else if ("message" in state && state.message) {
      toast.error(options?.error ?? state.message, {
        description: options?.error ? state.message : undefined,
        duration: 4000,
      });
    }
  }, [state, options?.success, options?.error]);
}
