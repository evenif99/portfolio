import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { StockLevelBar } from "@/components/inventory/StockLevelBar";
import { prisma } from "@/lib/prisma";

export default async function InventoryPage() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { sku: "asc" },
    include: {
      category:  { select: { name: true } },
      brand:     { select: { name: true } },
      warehouse: { select: { name: true } },
    },
  });

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="재고 관리"
        subtitle={`전체 ${items.length}개 SKU · 총 ${totalQty.toLocaleString()} units`}
      />

      {/* Filters */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 w-56 flex-shrink-0">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-[12px] text-muted-foreground">SKU, 품목명 검색...</span>
        </div>
        {(["전체", "재고 있음", "재고 부족", "재고 없음"] as const).map((f, i) => (
          <button
            key={f}
            className={`flex-shrink-0 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              i === 0
                ? "bg-blue-600 text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">SKU</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">품목명</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">카테고리</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">브랜드</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">재고 현황</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">안전재고</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">창고</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">상태</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">단가</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/inventory/${item.id}`}
                      className="font-mono text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {item.sku}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/inventory/${item.id}`}
                      className="font-semibold text-foreground hover:text-blue-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.brand.name}</td>
                  <td className="px-4 py-3 w-40">
                    <StockLevelBar quantity={item.quantity} safetyStock={item.safetyStock} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{item.safetyStock}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.warehouse.name}</td>
                  <td className="px-4 py-3">
                    <InventoryStatusBadge status={item.status as any} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                    {item.unitPrice != null ? `₩${item.unitPrice.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
