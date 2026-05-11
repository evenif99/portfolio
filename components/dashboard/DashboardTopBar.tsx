"use client";

import { Search, Bell, AlertTriangle, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function DashboardTopBar() {
  return (
    <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 gap-4">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 w-64 cursor-pointer hover:border-blue-400 transition-colors">
        <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-[12px] text-muted-foreground flex-1">SKU, 부품명, 모델명 검색...</span>
        <kbd className="text-[9px] font-mono text-muted-foreground border border-border rounded px-1 py-0.5">⌘K</kbd>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Alert badge */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            7
          </span>
        </button>

        {/* Low stock indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          재고 부족 7건
        </div>

        {/* Separator */}
        <div className="mx-1 h-5 w-px bg-border" />

        {/* User */}
        <div className="flex items-center gap-1 rounded-md border border-border px-2 py-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            A
          </div>
          <span className="hidden sm:block text-[12px] font-medium text-foreground ml-1">Admin</span>
          <form action={logout}>
            <button
              type="submit"
              className="ml-1.5 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="로그아웃"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
