import Link from "next/link";
import { TrendingUp, TrendingDown, Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { PageHeader }          from "@/components/common/PageHeader";
import { SectionCard }         from "@/components/common/SectionCard";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { TrendChart }          from "@/components/analytics/TrendChart";
import { CategoryPieChart }    from "@/components/analytics/CategoryPieChart";
import { prisma }              from "@/lib/prisma";
import { kstStartOfToday, kstDateString } from "@/lib/datetime";

// ── 상수 ──────────────────────────────────────────────────────────────────────
const DAY_MS      = 24 * 60 * 60 * 1000;
const TREND_DAYS  = 14;

export default async function AnalyticsPage() {
  const today      = kstStartOfToday();
  const trendStart = new Date(today.getTime() - (TREND_DAYS - 1) * DAY_MS);
  const monthStart = new Date(today.getTime() - 29 * DAY_MS); // 최근 30일

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
  ] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.aggregate({ _sum: { quantity: true } }),
    prisma.lowStockAlert.count({ where: { resolved: false } }),

    // 카테고리별 재고 (파이차트)
    prisma.category.findMany({
      include: { items: { select: { quantity: true } } },
      orderBy: { name: "asc" },
    }),

    // 재고 상위 5개 (바 차트)
    prisma.inventoryItem.findMany({
      take:    5,
      orderBy: { quantity: "desc" },
      select:  {
        id: true, modelName: true, quantity: true, safetyStock: true,
        brand: { select: { name: true } },
      },
    }),

    // 부족 재고 목록
    prisma.inventoryItem.findMany({
      where:   { status: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } },
      orderBy: { quantity: "asc" },
      take:    10,
      select:  {
        id: true, modelName: true, quantity: true, safetyStock: true, status: true,
        brand: { select: { name: true } },
      },
    }),

    // 이력 유형별 전체 건수
    prisma.stockTransaction.groupBy({
      by:     ["type"],
      _count: { id: true },
    }),

    // 14일 트렌드용 원시 데이터 (입고/출고만)
    prisma.stockTransaction.findMany({
      where: {
        createdAt: { gte: trendStart },
        type:      { in: ["INBOUND", "OUTBOUND"] },
      },
      select: { type: true, quantity: true, createdAt: true },
    }),

    // 30일 입고 총량
    prisma.stockTransaction.aggregate({
      where:  { type: "INBOUND",  createdAt: { gte: monthStart } },
      _sum:   { quantity: true },
    }),

    // 30일 출고 총량 (quantity는 음수로 저장됨)
    prisma.stockTransaction.aggregate({
      where:  { type: "OUTBOUND", createdAt: { gte: monthStart } },
      _sum:   { quantity: true },
    }),
  ]);

  // ── 트렌드 데이터 가공 ──────────────────────────────────────────────────────
  const trendData = Array.from({ length: TREND_DAYS }, (_, i) => {
    const dayStart = new Date(trendStart.getTime() + i * DAY_MS);
    const dayEnd   = new Date(dayStart.getTime() + DAY_MS);
    const label    = kstDateString(dayStart).slice(5); // MM-DD

    const dayTx = trendRaw.filter(
      (t) => t.createdAt >= dayStart && t.createdAt < dayEnd,
    );

    return {
      date: label,
      입고: dayTx.filter((t) => t.type === "INBOUND").reduce((s, t) => s + t.quantity, 0),
      출고: dayTx.filter((t) => t.type === "OUTBOUND").reduce((s, t) => s + Math.abs(t.quantity), 0),
    };
  });

  // ── 파이 데이터 ──────────────────────────────────────────────────────────────
  const pieData = categories
    .map((c) => ({
      name:  c.name.split(" ")[0],
      value: c.items.reduce((s, i) => s + i.quantity, 0),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  // ── 파생 수치 ────────────────────────────────────────────────────────────────
  const totalQty      = totalQtyResult._sum.quantity ?? 0;
  const inbound30d    = monthInbound._sum.quantity ?? 0;
  const outbound30d   = Math.abs(monthOutbound._sum.quantity ?? 0);
  const txTotal       = txCounts.reduce((s, t) => s + t._count.id, 0);
  const txByType      = Object.fromEntries(txCounts.map((t) => [t.type, t._count.id]));
  const maxTopQty     = topItems[0]?.quantity ?? 1;

  const txRows = [
    { label: "입고", type: "INBOUND",    color: "bg-emerald-500" },
    { label: "출고", type: "OUTBOUND",   color: "bg-blue-500"    },
    { label: "조정", type: "ADJUSTMENT", color: "bg-violet-500"  },
    { label: "반품", type: "RETURN",     color: "bg-amber-500"   },
  ] as const;

  return (
    <div className="flex flex-col">
      <PageHeader title="분석" subtitle="재고 현황 및 입출고 흐름 요약" />

      <div className="p-6 space-y-5">

        {/* ── KPI ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { icon: Package,        label: "총 SKU",     value: totalSkus.toLocaleString(),        sub: "관리 품목",     color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30"    },
            { icon: TrendingUp,     label: "총 재고",    value: totalQty.toLocaleString(),          sub: "units",         color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { icon: ArrowDownToLine,label: "30일 입고",  value: inbound30d.toLocaleString(),        sub: "units",         color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { icon: ArrowUpFromLine,label: "30일 출고",  value: outbound30d.toLocaleString(),       sub: "units",         color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30"    },
            { icon: AlertTriangle,  label: "부족 재고",  value: lowStockCount.toLocaleString(),     sub: "안전재고 미만", color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30"  },
            { icon: TrendingDown,   label: "전체 이력",  value: txTotal.toLocaleString(),           sub: "총 트랜잭션",   color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/30"},
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

        {/* ── 14일 입출고 트렌드 ── */}
        <SectionCard
          title="최근 14일 입출고 추이"
          subtitle="일별 입고(초록) · 출고(파랑) 수량"
        >
          <TrendChart data={trendData} />
        </SectionCard>

        {/* ── 카테고리 파이 + TOP 5 ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          <SectionCard title="카테고리별 재고 분포" subtitle="전체 보유 수량 기준">
            {pieData.length > 0 ? (
              <CategoryPieChart data={pieData} />
            ) : (
              <p className="py-10 text-center text-[12px] text-muted-foreground">데이터 없음</p>
            )}
          </SectionCard>

          <SectionCard title="재고 상위 5개 품목" subtitle="현재 수량 기준">
            {topItems.length === 0 ? (
              <p className="py-10 text-center text-[12px] text-muted-foreground">등록된 품목이 없습니다</p>
            ) : (
            <ul className="space-y-3">
              {topItems.map((item, i) => (
                <li key={item.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground w-4 flex-shrink-0">#{i + 1}</span>
                      <Link
                        href={`/dashboard/inventory/${item.id}`}
                        className="text-[12px] font-semibold text-foreground truncate hover:text-blue-600 transition-colors"
                      >
                        {item.modelName}
                      </Link>
                    </div>
                    <span className="text-[12px] font-bold tabular-nums text-emerald-600 flex-shrink-0 ml-2">
                      {item.quantity.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.round((item.quantity / maxTopQty) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 pl-6">{item.brand.name}</p>
                </li>
              ))}
            </ul>
            )}
          </SectionCard>
        </div>

        {/* ── 부족 재고 + 이력 분포 ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          <SectionCard title="부족 재고 우선순위" subtitle="즉시 보충이 필요한 품목" noPadding>
            {lowItems.length === 0 ? (
              <p className="py-10 text-center text-[12px] text-muted-foreground">부족 재고 없음 — 모든 품목이 안전재고 이상입니다</p>
            ) : (
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
                          <Link
                            href={`/dashboard/inventory/${item.id}`}
                            className="font-semibold text-foreground hover:text-blue-600 transition-colors"
                          >
                            {item.modelName}
                          </Link>
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
              </div>
            )}
          </SectionCard>

          <SectionCard title="이력 유형별 분포" subtitle={`전체 ${txTotal.toLocaleString()}건`}>
            <ul className="space-y-4">
              {txRows.map(({ label, type, color }) => {
                const count = txByType[type] ?? 0;
                const pct   = txTotal > 0 ? Math.round((count / txTotal) * 100) : 0;
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

      </div>
    </div>
  );
}
