"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  total:    number;
  page:     number;
  pageSize: number;
}

export function Pagination({ total, page, pageSize }: PaginationProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) params.delete("page");
    else         params.set("page", String(p));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  // 페이지 번호 목록 생성 (최대 5개 노출)
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4)           pages.push("…");
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i);
    if (page < totalPages - 3) pages.push("…");
    pages.push(totalPages);
  }

  const btnBase = "flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-semibold transition-colors";

  return (
    <div className={cn("flex items-center gap-1", isPending && "opacity-60 pointer-events-none")}>
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className={cn(btnBase, "border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed")}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className={cn(btnBase, "text-muted-foreground cursor-default")}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={cn(
              btnBase,
              p === page
                ? "bg-blue-600 text-white"
                : "border border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className={cn(btnBase, "border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed")}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
