import { TrendingUp, TrendingDown, Package, Truck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const [
    totalSkus,
    totalQtyResult,
    lowStockCount,
    categories,
    topItems,
    lowItems,
    txCounts,
  ] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.aggregate({ _sum: { quantity: true } }),
    prisma.lowStockAlert.count({ where: { resolved: false } }),
    prisma.category.findMany({
      include: { items: { select: { quantity: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.inventoryItem.findMany({
      take: 5,
      orderBy: { quantity: "desc" },
      select: { id: true, modelName: true, quantity: true, safetyStock: true, brand: { select: { name: true } } },
    }),
    prisma.inventoryItem.findMany({
      where: { status: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } },
      orderBy: { quantity: "asc" },
      select: { id: true, modelName: true, quantity: true, safetyStock: true, status: true, brand: { select: { name: true } } },
    }),
    prisma.stockTransaction.groupBy({
      by: ["type"],
      _count: { id: true },
    }),
  ]);

  const totalQuantity = totalQtyResult._sum.quantity ?? 0;
  const txTotal = txCounts.reduce((s, t) => s + t._count.id, 0);
  const txByType = Object.fromEntries(txCounts.map((t) => [t.type, t._count.id]));

  const catData = categories.map((c) => ({
    name: c.name.split(" ")[0],
    qty:  c.items.reduce((s, i) => s + i.quantity, 0),
  }));
  const maxCat = Math.max(...catData.map((c) => c.qty), 1);
  const maxTopQty = topItems[0]?.quantity ?? 1;

  const txRows = [
    { label: "입고", type: "INBOUND",    color: "bg-emerald-500" },
    { label: "출고", type: "OUTBOUND",   color: "bg-blue-500"    },
    { label: "조정", type: "ADJUSTMENT", color: "bg-violet-500"  },
    { label: "반품", type: "RETURN",     color: "bg-amber-500"   },
  ] as const;

  return (
    <div className="flex flex-col">
      <PageHeader title="분석" subtitle="재고 현황, 입출고 흐름, 품목 회전율 요약" />

      <div className="p-6 space-y-5">

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Package,      label: "총 SKU",    value: totalSkus,                   color: "text-blue-600",   sub: "관리 중인 품목"    },
            { icon: TrendingUp,   label: "입고 건수",  value: txByType["INBOUND"]   ?? 0,  color: "text-emerald-600", sub: "최근 이력 기준"   },
            { icon: TrendingDown, label: "출고 건수",  value: txByType["OUTBOUND"]  ?? 0,  color: "text-blue-600",   sub: "최근 이력 기준"    },
            { icon: Truck,        label: "부족 재고",  value: lowStockCount,               color: "text-amber-600",  sub: "안전재고 미만 품목" },
          ].map(({ icon: Icon, label, value, color, sub }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Category distribution */}
          <SectionCard title="카테고리별 재고 분포" subtitle="전체 보유 수량 기준">
            <ul className="space-y-3">
              {catData.map((c) => (
                <li key={c.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-semibold text-foreground">{c.name}</span>
                    <span className="text-[12px] font-bold tabular-nums text-foreground">{c.qty} units</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.round((c.qty / maxCat) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Top items */}
          <SectionCard title="최대 보유 품목 TOP 5" subtitle="현재 재고 수량 기준">
            <ul className="space-y-3">
              {topItems.map((item, i) => (
                <li key={item.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground w-4 flex-shrink-0">#{i+1}</span>
                      <span className="text-[12px] font-semibold text-foreground truncate">{item.modelName}</span>
                    </div>
                    <span className="text-[12px] font-bold tabular-nums text-emerald-600 flex-shrink-0 ml-2">{item.quantity}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((item.quantity / maxTopQty) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Low stock priority */}
          <SectionCard title="부족 재고 우선순위" subtitle="즉시 발주가 필요한 품목" noPadding>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">품목</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">현재</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">안전</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-foreground">{item.modelName}</p>
                      <p className="text-[10px] text-muted-foreground">{item.brand.name}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-bold tabular-nums ${item.quantity === 0 ? "text-red-600" : "text-amber-600"}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{item.safetyStock}</td>
                    <td className="px-4 py-2.5"><InventoryStatusBadge status={item.status as any} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          {/* Transaction breakdown */}
          <SectionCard title="이력 유형별 분포" subtitle={`전체 ${txTotal}건 트랜잭션`}>
            <ul className="space-y-4">
              {txRows.map(({ label, type, color }) => {
                const count = txByType[type] ?? 0;
                const pct = txTotal > 0 ? Math.round((count / txTotal) * 100) : 0;
                return (
                  <li key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-semibold text-foreground">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold tabular-nums text-foreground">{count}건</span>
                        <span className="text-[10px] text-muted-foreground">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>

      </div>
    </div>
  );
}
