"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function MobileQuickActions() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    navigator.serviceWorker?.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushEnabled(Boolean(sub)))
      .catch(() => setPushEnabled(false));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installPwa = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const togglePush = async () => {
    if (busy || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();

      if (existing) {
        await fetch("/api/push/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        });
        await existing.unsubscribe();
        setPushEnabled(false);
        return;
      }

      const keyRes = await fetch("/api/push/vapid-public-key", { cache: "no-store" });
      if (!keyRes.ok) return;
      const { key } = (await keyRes.json()) as { key?: string };
      if (!key) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });

      await fetch("/api/push/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      setPushEnabled(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-40 flex flex-col gap-2 md:hidden">
      {deferredPrompt && (
        <button
          type="button"
          onClick={installPwa}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg"
        >
          <Download className="h-4 w-4" />
          앱 설치
        </button>
      )}

      <button
        type="button"
        onClick={togglePush}
        disabled={busy}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg disabled:opacity-60"
      >
        {pushEnabled ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {pushEnabled ? "알림 해제" : "알림 받기"}
      </button>
    </div>
  );
}

