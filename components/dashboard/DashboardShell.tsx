"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { AutoRefresh } from "@/components/dashboard/AutoRefresh";
import { GlobalSearchCommand } from "@/components/search/GlobalSearchCommand";

interface DashboardShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({ sidebar, topbar, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* 모바일 닫기 버튼 */}
        <button
          className="absolute top-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="메뉴 닫기"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebar}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center border-b border-border bg-card">
          <button
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center text-muted-foreground hover:bg-muted transition-colors lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="pl-1">
            <GlobalSearchCommand />
          </div>

          <div className="flex-1 min-w-0">{topbar}</div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <AutoRefresh />
          {children}
        </main>
      </div>
    </div>
  );
}
