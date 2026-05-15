"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { createTransaction } from "@/app/actions/inventory";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";
import { useActionToast } from "@/hooks/useActionToast";

const TYPES: { value: TransactionType; label: string; icon: React.ElementType; color: string; activeColor: string; desc: string }[] = [
  {
    value: "INBOUND",
    label: "입고",
    icon: ArrowDownToLine,
    color: "text-emerald-600",
    activeColor: "bg-emerald-600 text-white border-emerald-600",
    desc: "재고를 늘립니다",
  },
  {
    value: "OUTBOUND",
    label: "출고",
    icon: ArrowUpFromLine,
    color: "text-blue-600",
    activeColor: "bg-blue-600 text-white border-blue-600",
    desc: "재고를 차감합니다",
  },
  {
    value: "ADJUSTMENT",
    label: "조정",
    icon: RefreshCw,
    color: "text-violet-600",
    activeColor: "bg-violet-600 text-white border-violet-600",
    desc: "실사 후 수량 보정",
  },
  {
    value: "RETURN",
    label: "반품",
    icon: RotateCcw,
    color: "text-amber-600",
    activeColor: "bg-amber-600 text-white border-amber-600",
    desc: "반품 입고 처리",
  },
];

interface TransactionFormProps {
  itemId: number;
  currentQty: number;
  safetyStock: number;
  itemSku?: string;
}

type BarcodeDetectorLike = {
  detect: (input: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike;
  }
}

export function TransactionForm({ itemId, currentQty, safetyStock, itemSku }: TransactionFormProps) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(createTransaction, undefined);
  const [selectedType, setSelectedType] = useState<TransactionType>("INBOUND");
  const [qtyStr, setQtyStr] = useState("1");
  const qty = Math.max(0, parseInt(qtyStr, 10) || 0);
  const [adjSign, setAdjSign] = useState<1 | -1>(1);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const isSuccess = state && "success" in state;
  const errorMsg = state && "message" in state ? state.message : undefined;
  const fieldErrors = state && "errors" in state ? state.errors : undefined;

  useActionToast(state, { success: "재고 이력이 등록되었습니다." });

  const adjustedQty = selectedType === "ADJUSTMENT" ? qty * adjSign : qty;
  const [formKey, setFormKey] = useState(0);

  function handleSuccess() {
    setFormKey((k) => k + 1);
    setQtyStr("1");
    setAdjSign(1);
  }

  const stopScanner = () => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setScanOpen(false);
  };

  useEffect(() => {
    if (state && "success" in state) {
      handleSuccess();
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => () => stopScanner(), []);

  const startScanner = async () => {
    if (!window.BarcodeDetector || !navigator.mediaDevices?.getUserMedia) {
      setScanMessage("이 브라우저는 바코드 스캔을 지원하지 않습니다.");
      return;
    }

    try {
      const detector = new window.BarcodeDetector({
        formats: ["code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e", "qr_code"],
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      mediaStreamRef.current = stream;
      setScanOpen(true);
      setScanMessage("카메라를 바코드에 맞춰주세요.");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const [first] = await detector.detect(videoRef.current);
          const rawValue = first?.rawValue?.trim();
          if (!rawValue) return;

          setScannedCode(rawValue);
          setScanMessage("바코드를 인식했습니다.");
          stopScanner();
        } catch {
          // keep scanning
        }
      }, 500);
    } catch {
      stopScanner();
      setScanMessage("카메라 접근 권한을 확인해주세요.");
    }
  };

  const scanFromImageFile = async (file: File) => {
    setScanMessage("이미지에서 바코드를 분석 중입니다...");
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const imageUrl = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = imageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("이미지 로드 실패"));
      });

      const result = await reader.decodeFromImageElement(img);
      URL.revokeObjectURL(imageUrl);
      const text = result.getText()?.trim();

      if (!text) {
        setScanMessage("바코드를 찾지 못했습니다. 선명한 이미지를 다시 업로드해주세요.");
        return;
      }

      setScannedCode(text);
      setScanMessage("이미지에서 바코드를 인식했습니다.");
    } catch {
      setScanMessage("iOS 업로드 스캔 실패: 다른 각도의 이미지로 다시 시도해주세요.");
    }
  };

  const previewQty = Math.max(
    0,
    currentQty + (selectedType === "OUTBOUND" ? -qty : selectedType === "ADJUSTMENT" ? qty * adjSign : qty),
  );

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">입출고 등록</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            현재 재고: {" "}
            <span
              className={cn(
                "font-bold",
                currentQty === 0 ? "text-red-600" : currentQty < safetyStock ? "text-amber-600" : "text-emerald-600",
              )}
            >
              {currentQty}
            </span>{" "}
            units
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">유형 선택</p>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(({ value, label, icon: Icon, activeColor, desc }) => {
              const isActive = selectedType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSelectedType(value);
                    setAdjSign(1);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-all",
                    isActive
                      ? activeColor + " shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/40",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[11px] font-bold">{label}</span>
                  <span className={cn("text-[9px] leading-tight", isActive ? "text-white/80" : "text-muted-foreground/70")}>{desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form key={formKey} action={action} className="space-y-4">
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="type" value={selectedType} />
          <input type="hidden" name="quantity" value={adjustedQty} />

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              수량
              {selectedType === "ADJUSTMENT" && (
                <span className="ml-2 normal-case text-violet-600">(조정값: 양수=증가 / 음수=감소)</span>
              )}
            </label>
            <div className="flex items-center gap-3">
              {selectedType === "ADJUSTMENT" && (
                <div className="flex rounded-md border border-border overflow-hidden flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setAdjSign(1)}
                    className={cn(
                      "px-3 py-2 text-sm font-bold transition-colors",
                      adjSign === 1 ? "bg-emerald-600 text-white" : "bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjSign(-1)}
                    className={cn(
                      "px-3 py-2 text-sm font-bold transition-colors",
                      adjSign === -1 ? "bg-red-600 text-white" : "bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    -
                  </button>
                </div>
              )}

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qtyStr}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setQtyStr(digits === "" ? "0" : String(parseInt(digits, 10)));
                }}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
              />
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>변경 후 예상 재고:</span>
              <span
                className={cn(
                  "font-bold tabular-nums",
                  previewQty <= 0 ? "text-red-600" : previewQty < safetyStock ? "text-amber-600" : "text-emerald-600",
                )}
              >
                {currentQty} → {previewQty}
              </span>
              {selectedType === "OUTBOUND" && currentQty - qty < 0 && (
                <span className="text-red-500 font-semibold">현재 재고를 초과했습니다</span>
              )}
            </div>

            {fieldErrors?.quantity && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.quantity[0]}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              참조번호 <span className="normal-case font-normal">(선택)</span>
            </label>
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={startScanner}
                className="rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
              >
                바코드 스캔
              </button>
              <label className="rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer">
                iOS 이미지 업로드
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void scanFromImageFile(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              {scannedCode && <span className="text-[11px] text-emerald-600 font-semibold truncate">{scannedCode}</span>}
            </div>
            <input
              type="text"
              name="reference"
              defaultValue={scannedCode ?? ""}
              placeholder={itemSku ? `예: ${itemSku}, PO-2025-0512` : "예: PO-2025-0512, SHP-2025-0099"}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            {scanMessage && <p className="mt-1 text-[11px] text-muted-foreground">{scanMessage}</p>}
            {scanOpen && (
              <div className="mt-2 rounded-md border border-border p-2">
                <video ref={videoRef} className="h-36 w-full rounded object-cover bg-black" playsInline muted />
                <button
                  type="button"
                  onClick={stopScanner}
                  className="mt-2 w-full rounded-md border border-border px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                >
                  스캔 종료
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              비고 <span className="normal-case font-normal">(선택)</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="비고 사항을 입력하세요"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-600 dark:text-red-400">{errorMsg}</p>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <p className="text-[12px] text-emerald-700 dark:text-emerald-400 font-semibold">등록이 완료되었습니다</p>
              <button
                type="button"
                onClick={handleSuccess}
                className="ml-auto text-[11px] text-emerald-600 hover:underline font-semibold"
              >
                다시 등록
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full rounded-md py-2.5 text-sm font-semibold text-white transition-colors",
              isPending ? "opacity-60 cursor-not-allowed" : "",
              selectedType === "INBOUND"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : selectedType === "OUTBOUND"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : selectedType === "ADJUSTMENT"
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "bg-amber-600 hover:bg-amber-700",
            )}
          >
            {isPending ? "처리 중..." : `${TYPES.find((t) => t.value === selectedType)?.label} 등록`}
          </button>
        </form>
      </div>
    </div>
  );
}
