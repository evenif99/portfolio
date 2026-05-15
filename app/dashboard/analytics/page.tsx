import Link from "next/link";
import {
  TrendingUp, TrendingDown, Package, AlertTriangle,
  ArrowDownToLine, ArrowUpFromLine, DollarSign, ShieldCheck, ShoppingCart, Clock,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { TrendChart } from "@/components/analytics/TrendChart";
import { WeeklyTrendChart } from "@/components/analytics/WeeklyTrendChart";
import { CategoryPieChart } from "@/components/analytics/CategoryPieChart";
import { CategoryValuePieChart } from "@/components/analytics/CategoryValuePieChart";
import { PeriodSelector } from "@/components/analytics/PeriodSelector";
import { prisma } from "@/lib/prisma";
import { kstStartOfToday, kstDateString } from "@/lib/datetime";

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET = 9 * 60 * 60 * 1000;
const TREND_DAYS = 14;
const TREND_WEEKS = 12;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const is12w = period === "12w";

  const today = kstStartOfToday();
  const monthStart = new Date(today.getTime() - 29 * DAY_MS);
  const trendStart = is12w
    ? new Date(today.getTime() - (TREND_WEEKS * 7 - 1) * DAY_MS)
    : new Date(today.getTime() - (TREND_DAYS - 1) * DAY_MS);

  const kstToday = new Date(today.getTime() + KST_OFFSET);
  const thisMonthStart = new Date(Date.UTC(kstToday.getUTCFullYear(), kstToday.getUTCMonth(), 1) - KST_OFFSET);

  const [
    totalSkus,
    totalQtyResult,
    lowStockCount,
    categories,
    topItems,
    lowItems,
    txCounts,
    trendRaw,
    monthInbound,
    monthOutbound,
    allItemValues,
    supplierLeadTime,
    allActivePOItems,
    outbound30dByItem,
  ] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.aggregate({ _sum: { quantity: true } }),
    prisma.lowStockAlert.count({ where: { resolved: false } }),
    prisma.category.findMany({ include: { items: { select: { quantity: true, unitPrice: true } } }, orderBy: { name: "asc" } }),
    prisma.inventoryItem.findMany({
      take: 5,
      orderBy: { quantity: "desc" },
      select: { id: true, modelName: true, quantity: true, safetyStock: true, brand: { select: { name: true } } },
    }),
    prisma.inventoryItem.findMany({
      where: { status: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } },
      orderBy: { quantity: "asc" },
      take: 10,
      select: { id: true, modelName: true, quantity: true, safetyStock: true, status: true, brand: { select: { name: true } } },
    }),
    prisma.stockTransaction.groupBy({ by: ["type"], _count: { id: true } }),
    prisma.stockTransaction.findMany({
      where: { createdAt: { gte: trendStart }, type: { in: ["INBOUND", "OUTBOUND"] } },
      select: { type: true, quantity: true, createdAt: true },
    }),
    prisma.stockTransaction.aggregate({ where: { type: "INBOUND", createdAt: { gte: monthStart } }, _sum: { quantity: true } }),
    prisma.stockTransaction.aggregate({ where: { type: "OUTBOUND", createdAt: { gte: monthStart } }, _sum: { quantity: true } }),
    prisma.inventoryItem.findMany({ select: { quantity: true, unitPrice: true, safetyStock: true } }),
    prisma.supplier.aggregate({ where: { leadTimeDays: { not: null } }, _avg: { leadTimeDays: true } }),
    prisma.purchaseOrderItem.findMany({
      where: { purchaseOrder: { status: { in: ["ORDERED", "RECEIVED"] } } },
      select: {
        quantity: true,
        unitPrice: true,
        purchaseOrder: { select: { id: true, orderedAt: true, supplier: { select: { name: true } } } },
      },
    }),
    prisma.stockTransaction.groupBy({ by: ["itemId"], where: { type: "OUTBOUND", createdAt: { gte: monthStart } }, _sum: { quantity: true } }),
  ]);

  const turnoverItemIds = outbound30dByItem.map((r) => r.itemId);
  const turnoverItems = turnoverItemIds.length
    ? await prisma.inventoryItem.findMany({
        where: { id: { in: turnoverItemIds } },
        select: { id: true, modelName: true, quantity: true, brand: { select: { name: true } } },
      })
    : [];

  const trendData = (is12w
    ? Array.from({ length: TREND_WEEKS }, (_, i) => {
        const wStart = new Date(trendStart.getTime() + i * 7 * DAY_MS);
        const wEnd = new Date(wStart.getTime() + 7 * DAY_MS);
        const wTx = trendRaw.filter((t) => t.createdAt >= wStart && t.createdAt < wEnd);
        return {
          date: kstDateString(wStart).slice(5),
          inbound: wTx.filter((t) => t.type === "INBOUND").reduce((s, t) => s + t.quantity, 0),
          outbound: wTx.filter((t) => t.type === "OUTBOUND").reduce((s, t) => s + Math.abs(t.quantity), 0),
        };
      })
    : Array.from({ length: TREND_DAYS }, (_, i) => {
        const dStart = new Date(trendStart.getTime() + i * DAY_MS);
        const dEnd = new Date(dStart.getTime() + DAY_MS);
        const dTx = trendRaw.filter((t) => t.createdAt >= dStart && t.createdAt < dEnd);
        return {
          date: kstDateString(dStart).slice(5),
          inbound: dTx.filter((t) => t.type === "INBOUND").reduce((s, t) => s + t.quantity, 0),
          outbound: dTx.filter((t) => t.type === "OUTBOUND").reduce((s, t) => s + Math.abs(t.quantity), 0),
        };
      })) as Array<{ date: string; inbound: number; outbound: number }>;

  const pieData = categories
    .map((c) => ({ name: c.name.split(" ")[0], value: c.items.reduce((s, i) => s + i.quantity, 0) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const categoryValuePieData = categories
    .map((c) => ({ name: c.name.split(" ")[0], value: c.items.reduce((s, i) => s + i.quantity * (i.unitPrice ?? 0), 0) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalQty = totalQtyResult._sum.quantity ?? 0;
  const inbound30d = monthInbound._sum.quantity ?? 0;
  const outbound30d = Math.abs(monthOutbound._sum.quantity ?? 0);
  const txTotal = txCounts.reduce((s, t) => s + t._count.id, 0);
  const txByType = Object.fromEntries(txCounts.map((t) => [t.type, t._count.id]));
  const maxTopQty = topItems[0]?.quantity ?? 1;

  const totalInventoryValue = allItemValues.reduce((s, i) => s + i.quantity * (i.unitPrice ?? 0), 0);
  const safetyAchieved = allItemValues.filter((i) => i.quantity >= i.safetyStock).length;
  const safetyRate = totalSkus > 0 ? Math.round((safetyAchieved / totalSkus) * 100) : 0;

  const thisMonthPOIds = new Set<number>();
  let thisMonthPOAmount = 0;
  const supplierPOMap = new Map<string, { poIds: Set<number>; totalAmount: number }>();

  for (const item of allActivePOItems) {
    const amount = item.quantity * (item.unitPrice ?? 0);
    const po = item.purchaseOrder;
    if (po.orderedAt && po.orderedAt >= thisMonthStart) {
      thisMonthPOIds.add(po.id);
      thisMonthPOAmount += amount;
    }
    const entry = supplierPOMap.get(po.supplier.name) ?? { poIds: new Set<number>(), totalAmount: 0 };
    entry.poIds.add(po.id);
    entry.totalAmount += amount;
    supplierPOMap.set(po.supplier.name, entry);
  }

  const supplierPOData = Array.from(supplierPOMap.entries())
    .map(([name, d]) => ({ name, poCount: d.poIds.size, totalAmount: d.totalAmount }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 8);

  const turnoverData = outbound30dByItem
    .map((r) => {
      const item = turnoverItems.find((i) => i.id === r.itemId);
      if (!item) return null;
      const outQty = Math.abs(r._sum.quantity ?? 0);
      const rate = item.quantity > 0 ? outQty / item.quantity : 99.99;
      return { ...item, outbound30d: outQty, turnoverRate: rate };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null && r.outbound30d > 0)
    .sort((a, b) => b.turnoverRate - a.turnoverRate)
    .slice(0, 10);

  const txRows = [
    { label: "입고", type: "INBOUND", color: "bg-emerald-500" },
    { label: "출고", type: "OUTBOUND", color: "bg-blue-500" },
    { label: "조정", type: "ADJUSTMENT", color: "bg-violet-500" },
    { label: "반품", type: "RETURN", color: "bg-amber-500" },
  ] as const;

  const formatKRW = (val: number) => (val === 0 ? "-" : `₩${Math.round(val).toLocaleString()}`);
  const avgLeadTime = supplierLeadTime._avg.leadTimeDays;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="분석"
        subtitle="재고 현황 및 입출고 흐름 요약"
        action={
          <a href="/api/export/reports/monthly" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            Monthly Report
          </a>
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { icon: Package, label: "총 SKU", value: totalSkus.toLocaleString(), sub: "관리 품목", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { icon: TrendingUp, label: "총 재고", value: totalQty.toLocaleString(), sub: "units", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { icon: ArrowDownToLine, label: "30일 입고", value: inbound30d.toLocaleString(), sub: "units", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { icon: ArrowUpFromLine, label: "30일 출고", value: outbound30d.toLocaleString(), sub: "units", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { icon: AlertTriangle, label: "부족 재고", value: lowStockCount.toLocaleString(), sub: "안전재고 미만", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
            { icon: TrendingDown, label: "전체 이력", value: txTotal.toLocaleString(), sub: "트랜잭션", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
          ].map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-4">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${bg} mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{label}</p>
              <p className="text-[10px] text-muted-foreground/60">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: DollarSign, label: "재고 가치", value: formatKRW(totalInventoryValue), sub: "현재 평가액", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { icon: ShieldCheck, label: "안전재고 달성률", value: `${safetyRate}%`, sub: `${safetyAchieved}/${totalSkus} 품목`, color: safetyRate >= 80 ? "text-emerald-600" : "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
            { icon: ShoppingCart, label: "이달 발주금액", value: formatKRW(thisMonthPOAmount), sub: `${thisMonthPOIds.size}건`, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { icon: Clock, label: "평균 리드타임", value: avgLeadTime != null ? `${Math.round(avgLeadTime)}일` : "-", sub: "공급업체 평균", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
          ].map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-4">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${bg} mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{label}</p>
              <p className="text-[10px] text-muted-foreground/60">{sub}</p>
            </div>
          ))}
        </div>

        <SectionCard title={is12w ? "최근 12주 입출고 추이" : "최근 14일 입출고 추이"} subtitle="입고(초록), 출고(파랑)" action={<PeriodSelector current={is12w ? "12w" : "14d"} />}>
          {is12w ? <WeeklyTrendChart data={trendData} /> : <TrendChart data={trendData} />}
        </SectionCard>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="카테고리별 재고 분포" subtitle="수량 기준">
            {pieData.length > 0 ? <CategoryPieChart data={pieData} /> : <p className="py-10 text-center text-[12px] text-muted-foreground">데이터 없음</p>}
          </SectionCard>

          <SectionCard title="카테고리별 재고 가치 분포" subtitle="수량 x 단가 기준">
            {categoryValuePieData.length > 0 ? <CategoryValuePieChart data={categoryValuePieData} /> : <p className="py-10 text-center text-[12px] text-muted-foreground">데이터 없음</p>}
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="공급업체별 발주 금액" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">공급업체</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">발주 건수</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">발주 금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {supplierPOData.map((row) => (
                    <tr key={row.name} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-foreground">{row.name}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{row.poCount}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-blue-600">{formatKRW(row.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="회전율 Top 10" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">#</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">품목</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">30일 출고</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">회전율</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {turnoverData.map((row, i) => (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-muted-foreground">#{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <Link href={`/dashboard/inventory/${row.id}`} className="font-semibold text-foreground hover:text-blue-600 transition-colors">{row.modelName}</Link>
                        <p className="text-[10px] text-muted-foreground">{row.brand.name}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{row.outbound30d.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-bold tabular-nums text-blue-600">{row.turnoverRate === 99.99 ? "∞" : `${row.turnoverRate.toFixed(2)}x`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="부족 재고 우선순위" noPadding>
            <div className="overflow-x-auto">
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
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href={`/dashboard/inventory/${item.id}`} className="font-semibold text-foreground hover:text-blue-600 transition-colors">{item.modelName}</Link>
                        <p className="text-[10px] text-muted-foreground">{item.brand.name}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold tabular-nums">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{item.safetyStock}</td>
                      <td className="px-4 py-2.5">
                        <InventoryStatusBadge status={item.status as "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED"} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="이력 유형 비율" subtitle={`전체 ${txTotal.toLocaleString()}건`}>
            <ul className="space-y-4">
              {txRows.map(({ label, type, color }) => {
                const count = txByType[type] ?? 0;
                const pct = txTotal > 0 ? Math.round((count / txTotal) * 100) : 0;
                return (
                  <li key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-semibold text-foreground">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold tabular-nums text-foreground">{count.toLocaleString()}건</span>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>

        <SectionCard title="상위 재고 5개" subtitle="수량 기준">
          <ul className="space-y-3">
            {topItems.map((item, i) => (
              <li key={item.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground w-4 flex-shrink-0">#{i + 1}</span>
                    <Link href={`/dashboard/inventory/${item.id}`} className="text-[12px] font-semibold text-foreground truncate hover:text-blue-600 transition-colors">
                      {item.modelName}
                    </Link>
                  </div>
                  <span className="text-[12px] font-bold tabular-nums text-emerald-600 flex-shrink-0 ml-2">{item.quantity.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round((item.quantity / maxTopQty) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 pl-6">{item.brand.name}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
