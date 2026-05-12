import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { TransactionFilterTabs } from "@/components/transactions/TransactionFilterTabs";
import { Pagination } from "@/components/common/Pagination";
import { ExportCsvButton } from "@/components/common/ExportCsvButton";
import { prisma } from "@/lib/prisma";
import { TX_TYPE_LABEL, TX_TYPE_COLOR } from "@/lib/constants";
import { kstDateTimeString } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

const TX_ICON = {
  INBOUND:    ArrowDownToLine,
  OUTBOUND:   ArrowUpFromLine,
  ADJUSTMENT: RefreshCw,
  RETURN:     RotateCcw,
} as const;

const PAGE_SIZE = 30;

interface PageProps {
  searchParams: Promise<{ type?: string; page?: string }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const { type = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const where = type ? { type: type as TransactionType } : {};

  const [txGroups, totalTxCount, filteredCount, filtered] = await Promise.all([
    prisma.stockTransaction.groupBy({ by: ["type"], _count: { id: true } }),
    prisma.stockTransaction.count(),
    prisma.stockTransaction.count({ where }),
    prisma.stockTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      include: {
        item: { select: { sku: true, modelName: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  // 탭별 건수 집계
  const counts: Partial<Record<TransactionType | "all", number>> = { all: totalTxCount };
  for (const g of txGroups) {
    counts[g.type as TransactionType] = g._count.id;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="입출고 이력"
        subtitle={`전체 ${totalTxCount}건 · 입고 / 출고 / 조정 / 반품`}
        action={<ExportCsvButton href={`/api/export/transactions?type=${encodeURIComponent(type)}`} />}
      />

      <TransactionFilterTabs counts={counts} />

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-semibold text-foreground">해당 유형의 이력이 없습니다</p>
            <p className="text-[12px] text-muted-foreground mt-1">다른 탭을 선택해 보세요</p>
          </div>
        ) : (
          <>
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
                  {filtered.map((tx) => {
                    const txType = tx.type as TransactionType;
                    const Icon = TX_ICON[txType];
                    const isNeg = txType === "OUTBOUND" || (txType === "ADJUSTMENT" && tx.quantity < 0);
                    return (
                      <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                            TX_TYPE_COLOR[txType],
                          )}>
                            <Icon className="h-3 w-3" />
                            {TX_TYPE_LABEL[txType]}
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
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{kstDateTimeString(tx.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {filteredCount}건 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCount)}번째
              </p>
              <Pagination total={filteredCount} page={page} pageSize={PAGE_SIZE} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
