"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * 탭이 보일 때마다 intervalMs(기본 30s) 주기로 router.refresh()를 호출한다.
 * 탭이 숨겨진 동안에는 갱신하지 않아 불필요한 서버 요청을 방지한다.
 */
export function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();

  const refresh = useCallback(() => {
    if (document.visibilityState === "visible") router.refresh();
  }, [router]);

  useEffect(() => {
    const id = setInterval(refresh, intervalMs);

    // 탭이 다시 포커스될 때 즉시 갱신
    document.addEventListener("visibilitychange", refresh);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refresh, intervalMs]);

  return null;
}
