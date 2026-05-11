import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { prisma } from "@/lib/prisma";
import { TX_TYPE_LABEL, TX_TYPE_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

const TX_ICON = {
  INBOUND:    ArrowDownToLine,
  OUTBOUND:   ArrowUpFromLine,
  ADJUSTMENT: RefreshCw,
  RETURN:     RotateCcw,
} as const;

function fmtDateTime(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default async function TransactionsPage() {
  const transactions = await prisma.stockTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      item: { select: { sku: true, modelName: true } },
      user: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="입출고 이력"
        subtitle={`총 ${transactions.length}건 · 입고 / 출고 / 조정 / 반품`}
      />

      {/* Type filter tabs */}
      <div className="flex items-center gap-0 border-b border-border bg-card overflow-x-auto">
        {(["전체", "입고", "출고", "조정", "반품"] as const).map((tab, i) => (
          <button
            key={tab}
            className={`flex-shrink-0 px-5 py-2.5 text-[12px] font-semibold border-b-2 transition-colors ${
              i === 0
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">유형</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">품목명</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">SKU</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">수량</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">참조번호</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">처리자</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">비고</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => {
                const type = tx.type as TransactionType;
                const Icon = TX_ICON[type];
                const isNeg = type === "OUTBOUND" || (type === "ADJUSTMENT" && tx.quantity < 0);
                return (
                  <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                        TX_TYPE_COLOR[type],
                      )}>
                        <Icon className="h-3 w-3" />
                        {TX_TYPE_LABEL[type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground max-w-[180px]">
                      <span className="truncate block">{tx.item.modelName}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{tx.item.sku}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("font-bold tabular-nums text-[13px]", isNeg ? "text-red-500" : "text-emerald-600")}>
                        {isNeg ? "-" : "+"}{Math.abs(tx.quantity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{tx.reference ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tx.user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[140px]">
                      <span className="truncate block">{tx.notes || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDateTime(tx.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
