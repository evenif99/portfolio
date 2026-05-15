"use client";

import { useState } from "react";
import { BellRing, Loader2 } from "lucide-react";

export function PushTestCard() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendTest = async () => {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; count?: number; message?: string };

      if (!res.ok) {
        setMessage(data.message || "푸시 테스트 전송에 실패했습니다.");
        return;
      }

      setMessage(`테스트 알림 전송 완료 (${data.count ?? 0}건)`);
    } catch {
      setMessage("네트워크 상태를 확인해주세요.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm font-semibold text-foreground">모바일 푸시 테스트</p>
      <p className="mt-1 text-[12px] text-muted-foreground">알림 받기 구독 후 테스트 전송으로 동작을 확인하세요.</p>

      <button
        type="button"
        onClick={sendTest}
        disabled={pending}
        className="mt-3 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
        테스트 알림 보내기
      </button>

      {message && <p className="mt-2 text-[12px] text-muted-foreground">{message}</p>}
    </div>
  );
}
