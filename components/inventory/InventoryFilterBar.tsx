"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "전체",      value: ""            },
  { label: "재고 있음", value: "IN_STOCK"    },
  { label: "재고 부족", value: "LOW_STOCK"   },
  { label: "재고 없음", value: "OUT_OF_STOCK"},
] as const;

export function InventoryFilterBar({ totalCount, filteredCount }: { totalCount: number; filteredCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = searchParams.get("status") ?? "";

  // 제어 컴포넌트로 관리 — URL과 input 값 동기화
  const [inputValue, setInputValue] = useState(currentSearch);

  useEffect(() => {
    setInputValue(currentSearch);
  }, [currentSearch]);

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [searchParams, pathname, router]);

  function handleSearchChange(val: string) {
    setInputValue(val);
    clearTimeout((window as any).__invSearchTimer);
    (window as any).__invSearchTimer = setTimeout(() => updateParams({ search: val, page: "" }), 300);
  }

  function handleClear() {
    setInputValue("");
    updateParams({ search: "", page: "" });
  }

  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-2.5 overflow-x-auto">
      {/* Search input */}
      <div className={cn(
        "flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 w-60 flex-shrink-0 transition-colors",
        isPending ? "opacity-60" : "border-border",
        inputValue ? "border-blue-400" : ""
      )}>
        <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="SKU, 품목명 검색..."
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Status filter buttons */}
      {STATUS_FILTERS.map(({ label, value }) => {
        const isActive = currentStatus === value;
        return (
          <button
            key={label}
            onClick={() => updateParams({ status: value, page: "" })}
            disabled={isPending}
            className={cn(
              "flex-shrink-0 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors whitespace-nowrap",
              isActive
                ? "bg-blue-600 text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-blue-300"
            )}
          >
            {label}
          </button>
        );
      })}

      {/* Result count */}
      <span className="ml-auto flex-shrink-0 text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
        {filteredCount === totalCount
          ? `${totalCount}개 SKU`
          : `${totalCount}개 중 ${filteredCount}개`}
      </span>
    </div>
  );
}
