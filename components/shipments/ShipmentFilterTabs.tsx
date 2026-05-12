"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/types";

const TABS: { label: string; value: ShipmentStatus | "" }[] = [
  { label: "전체",  value: ""          },
  { label: "대기",  value: "PENDING"   },
  { label: "승인",  value: "APPROVED"  },
  { label: "피킹",  value: "PICKING"   },
  { label: "패킹",  value: "PACKED"    },
  { label: "출하",  value: "SHIPPED"   },
  { label: "지연",  value: "DELAYED"   },
  { label: "완료",  value: "COMPLETED" },
  { label: "취소",  value: "CANCELLED" },
];

interface ShipmentFilterTabsProps {
  counts: Partial<Record<ShipmentStatus | "all", number>>;
}

export function ShipmentFilterTabs({ counts }: ShipmentFilterTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get("status") ?? "";

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className={cn("flex items-center gap-0 border-b border-border bg-card overflow-x-auto", isPending && "opacity-70")}>
      {TABS.map(({ label, value }) => {
        const isActive = current === value;
        const count = value === "" ? counts["all"] : counts[value as ShipmentStatus];
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
