import { cn } from "@/lib/utils";

type POStatus = "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";

const config: Record<POStatus, { label: string; cls: string }> = {
  DRAFT:     { label: "초안",      cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"        },
  ORDERED:   { label: "발주 중",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"     },
  RECEIVED:  { label: "입고 완료", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  CANCELLED: { label: "취소",      cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"             },
};

export function POStatusBadge({ status }: { status: POStatus }) {
  const { label, cls } = config[status] ?? config.DRAFT;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", cls)}>
      {label}
    </span>
  );
}
