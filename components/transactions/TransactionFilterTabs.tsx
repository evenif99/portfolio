"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

const TABS: { label: string; value: TransactionType | "" }[] = [
  { label: "전체", value: ""           },
  { label: "입고", value: "INBOUND"    },
  { label: "출고", value: "OUTBOUND"   },
  { label: "조정", value: "ADJUSTMENT" },
  { label: "반품", value: "RETURN"     },
];

interface TransactionFilterTabsProps {
  counts: Partial<Record<TransactionType | "all", number>>;
}

export function TransactionFilterTabs({ counts }: TransactionFilterTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get("type") ?? "";

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("type", value);
    else params.delete("type");
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className={cn("flex items-center gap-0 border-b border-border bg-card overflow-x-auto", isPending && "opacity-70")}>
      {TABS.map(({ label, value }) => {
        const isActive = current === value;
        const count = value === "" ? counts["all"] : counts[value as TransactionType];
        return (
          <button
            key={label}
            onClick={() => handleClick(value)}
            disabled={isPending}
            className={cn(
              "flex flex-shrink-0 items-center gap-1.5 px-5 py-2.5 text-[12px] font-semibold border-b-2 transition-colors whitespace-nowrap",
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {count !== undefined && (
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
