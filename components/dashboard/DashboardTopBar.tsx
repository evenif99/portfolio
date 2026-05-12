"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Bell, AlertTriangle, LogOut, Sun, Moon, Monitor, KeyRound, User,
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, RotateCcw,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/datetime";

// ── 트랜잭션 타입 메타 ──────────────────────────────────────────────────────
const TX_META = {
  INBOUND:    { label: "입고", Icon: ArrowDownToLine,  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40",  sign: "+"  },
  OUTBOUND:   { label: "출고", Icon: ArrowUpFromLine,  color: "text-red-500",     bg: "bg-red-50 dark:bg-red-950/40",          sign: "-"  },
  ADJUSTMENT: { label: "조정", Icon: RefreshCw,        color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/40",    sign: ""   },
  RETURN:     { label: "반품", Icon: RotateCcw,        color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40",      sign: "+"  },
} as const;

type TxType = keyof typeof TX_META;

interface TxItem {
  id:        number;
  type:      string;
  quantity:  number;
  reference: string | null;
  notes:     string | null;
  createdAt: Date;
  item: { sku: string; modelName: string };
  user: { name: string | null };
}

interface DashboardTopBarProps {
  alertCount:         number;
  recentTransactions: TxItem[];
  todayTxCount:       number;
  userName:           string;
  userEmail?:         string;
}

export function DashboardTopBar({
  alertCount,
  recentTransactions,
  todayTxCount,
  userName,
  userEmail,
}: DashboardTopBarProps) {
  const initial   = userName.charAt(0).toUpperCase();
  const hasAlerts = alertCount > 0;
  const hasTx     = recentTransactions.length > 0;

  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex h-12 flex-shrink-0 items-center justify-end bg-card px-4 gap-1">

      {/* 재고 상태 배지 */}
      {hasAlerts ? (
        <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 mr-1">
          <AlertTriangle className="h-3 w-3" />
          재고 부족 {alertCount}건
        </div>
      ) : (
        <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mr-1">
          재고 정상
        </div>
      )}

      {/* Bell 드롭다운 */}
      <div className="relative" ref={bellRef}>
        <button
          onClick={() => { setBellOpen((v) => !v); setUserOpen(false); }}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />
          {todayTxCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white tabular-nums">
              {todayTxCount > 99 ? "99+" : todayTxCount}
            </span>
          )}
        </button>

        {bellOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-80 rounded-lg border border-border bg-card shadow-lg z-50">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-foreground">입출고 이력</span>
                {todayTxCount > 0 && (
                  <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums leading-none">
                    오늘 {todayTxCount}건
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/transactions"
                onClick={() => setBellOpen(false)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                전체 보기 →
              </Link>
            </div>

            {/* 목록 */}
            <div className="max-h-[360px] overflow-y-auto">
              {!hasTx ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-[12px] font-semibold text-foreground">입출고 이력 없음</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">아직 처리된 재고 변동이 없습니다</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {recentTransactions.map((tx) => {
                    const type = (TX_META[tx.type as TxType] ? tx.type : "ADJUSTMENT") as TxType;
                    const meta = TX_META[type];
                    const Icon = meta.Icon;
                    const isNeg = tx.type === "OUTBOUND" || (tx.type === "ADJUSTMENT" && tx.quantity < 0);
                    const qtyDisplay = tx.type === "ADJUSTMENT"
                      ? (tx.quantity >= 0 ? `+${tx.quantity}` : String(tx.quantity))
                      : `${isNeg ? "-" : "+"}${Math.abs(tx.quantity)}`;

                    return (
                      <li key={tx.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                        {/* 타입 아이콘 */}
                        <div className={cn(
                          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md mt-0.5",
                          meta.bg,
                        )}>
                          <Icon className={cn("h-3.5 w-3.5", meta.color)} />
                        </div>

                        {/* 내용 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[12px] font-semibold text-foreground truncate leading-tight">
                              {tx.item.modelName}
                            </p>
                            <span className={cn(
                              "flex-shrink-0 text-[13px] font-bold tabular-nums",
                              isNeg ? "text-red-500" : "text-emerald-600",
                              tx.type === "ADJUSTMENT" && tx.quantity === 0 && "text-muted-foreground",
                            )}>
                              {qtyDisplay}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={cn("text-[10px] font-semibold", meta.color)}>{meta.label}</span>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[80px]">
                              {tx.item.sku}
                            </span>
                            {tx.reference && (
                              <>
                                <span className="text-muted-foreground/40">·</span>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{tx.reference}</span>
                              </>
                            )}
                            <span className="text-muted-foreground/40">·</span>
                            <span className="text-[10px] text-muted-foreground">{tx.user.name ?? "—"}</span>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(tx.createdAt)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="mx-1 h-5 w-px bg-border" />

      {/* 유저 드롭다운 */}
      <div className="relative" ref={userRef}>
        <button
          onClick={() => { setUserOpen((v) => !v); setBellOpen(false); }}
          className="flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-muted transition-colors"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            {initial}
          </div>
          <span className="hidden sm:block text-[12px] font-medium text-foreground ml-1">{userName}</span>
        </button>

        {userOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg border border-border bg-card shadow-lg z-50">
            {/* 프로필 */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[12px] font-bold text-white">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{userName}</p>
                  {userEmail && <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>}
                </div>
              </div>
            </div>

            {/* 테마 */}
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 px-1">테마</p>
              <div className="flex gap-1">
                {([
                  { value: "light",  icon: Sun,     label: "라이트" },
                  { value: "dark",   icon: Moon,    label: "다크"   },
                  { value: "system", icon: Monitor, label: "시스템" },
                ] as const).map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors",
                      theme === value
                        ? "bg-blue-600 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 메뉴 */}
            <div className="py-1">
              <Link
                href="/dashboard/settings"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                설정
              </Link>
              <Link
                href="/dashboard/settings#password"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
              >
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                비밀번호 변경
              </Link>
            </div>

            {/* 로그아웃 */}
            <div className="border-t border-border py-1">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
