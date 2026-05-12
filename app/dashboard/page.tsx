import Link from "next/link";
import {
  Package, Truck, AlertTriangle,
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, RotateCcw, ChevronRight,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ShipmentStatusBadge, PriorityBadge } from "@/components/shipments/ShipmentStatusBadge";
import { AlertPanel, ResolveAllButton } from "@/components/dashboard/AlertPanel";
import { SectionCard } from "@/components/common/SectionCard";
import { PageHeader } from "@/components/common/PageHeader";
import { prisma } from "@/lib/prisma";
import { kstStartOfToday } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

const TX_ICON = {
  INBOUND:    ArrowDownToLine,
  OUTBOUND:   ArrowUpFromLine,
  ADJUSTMENT: RefreshCw,
  RETURN:     RotateCcw,
} as const;

const TX_BG: Record<TransactionType, string> = {
  INBOUND:    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
  OUTBOUND:   "bg-blue-50 text-blue-600 dark:bg-blue-950/40",
  ADJUSTMENT: "bg-violet-50 text-violet-600 dark:bg-violet-950/40",
  RETURN:     "bg-amber-50 text-amber-600 dark:bg-amber-950/40",
};

function fmtTime(d: Date) {
  return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default async function DashboardPage() {
  const [
    totalSkus,
    totalQtyResult,
    lowStockAlerts,
    urgentShipments,
    recentShipments,
    recentTx,
    categoryDist,
    todayTx,
  ] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.aggregate({ _sum: { quantity: true } }),
    prisma.lowStockAlert.findMany({
      where: { resolved: false },
      include: { item: { select: { sku: true, modelName: true, quantity: true, safetyStock: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shipment.count({ where: { priority: "URGENT", status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
    prisma.shipment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.stockTransaction.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { item: { select: { modelName: true } }, user: { select: { name: true } } },
    }),
    prisma.category.findMany({
      include: { items: { select: { quantity: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.stockTransaction.findMany({
      where: { createdAt: { gte: kstStartOfToday() } },
    }),
  ]);

  const totalQuantity = totalQtyResult._sum.quantity ?? 0;
  const todayInbound  = todayTx.filter((t) => t.type === "INBOUND").reduce((s, t) => s + t.quantity, 0);
  const todayOutbound = todayTx.filter((t) => t.type === "OUTBOUND").reduce((s, t) => s + Math.abs(t.quantity), 0);

  const maxCatCount = Math.max(...categoryDist.map((c) => c.items.reduce((s, i) => s + i.quantity, 0)), 1);

  return (
    <div className="flex flex-col">
      <PageHeader title="대시보드" subtitle="실시간 재고 현황" />

      <div className="p-6 space-y-5">

        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="총 SKU"    value={totalSkus}                    sub="관리 품목" icon={Package}         accent />
          <KpiCard label="총 재고"   value={totalQuantity.toLocaleString()} sub="units"   icon={Package}         trend="up" trendValue={`+${todayInbound}`} />
          <KpiCard label="오늘 입고" value={todayInbound}                  sub="units"   icon={ArrowDownToLine} trend="up" trendValue="오늘" />
          <KpiCard label="오늘 출고" value={todayOutbound}                 sub="건"      icon={ArrowUpFromLine} trend="neutral" trendValue="오늘" />
          <KpiCard label="부족 재고" value={lowStockAlerts.length}         sub="품목"    icon={AlertTriangle}   alert />
          <KpiCard label="긴급 출고" value={urgentShipments}               sub="건"      icon={Truck}           alert />
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* Shipments table */}
          <SectionCard
            className="lg:col-span-2"
            title="최근 출고 요청"
            subtitle="진행 중인 출고 상태를 확인하세요"
            action={
              <Link href="/dashboard/shipments" className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                전체 보기 <ChevronRight className="h-3 w-3" />
              </Link>
            }
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">출고번호</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">요청처</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">상태</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">우선순위</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">납기</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">품목</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href="/dashboard/shipments" className="font-mono font-semibold text-blue-600 hover:text-blue-700">
                          {s.shipmentNo}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-foreground max-w-[120px]">
                        <span className="truncate block">{s.requester}</span>
                      </td>
                      <td className="px-4 py-2.5"><ShipmentStatusBadge status={s.status as any} /></td>
                      <td className="px-4 py-2.5"><PriorityBadge priority={s.priority as any} /></td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                        {s.dueDate ? s.dueDate.toISOString().slice(0, 10) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{s.items.length}종</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Low Stock Alerts */}
          <SectionCard
            title="재고 부족 알림"
            subtitle={`안전재고 미만 ${lowStockAlerts.length}건`}
            action={
              <div className="flex items-center gap-3">
                <ResolveAllButton />
                <Link href="/dashboard/inventory" className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                  전체 <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            }
            noPadding
          >
            <AlertPanel alerts={lowStockAlerts} />
          </SectionCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* Recent Transactions */}
          <SectionCard
            className="lg:col-span-2"
            title="최근 입출고 이력"
            subtitle="오늘 및 최근 처리된 이력"
            action={
              <Link href="/dashboard/transactions" className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                전체 보기 <ChevronRight className="h-3 w-3" />
              </Link>
            }
            noPadding
          >
            <ul className="divide-y divide-border">
              {recentTx.map((tx) => {
                const type = tx.type as TransactionType;
                const Icon = TX_ICON[type];
                const isNeg = type === "OUTBOUND" || (type === "ADJUSTMENT" && tx.quantity < 0);
                return (
                  <li key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md", TX_BG[type])}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground truncate">{tx.item.modelName}</p>
                      <p className="text-[10px] text-muted-foreground">{tx.reference ?? ""} · {tx.user.name}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={cn("text-[13px] font-bold tabular-nums", isNeg ? "text-red-500" : "text-emerald-600")}>
                        {isNeg ? "-" : "+"}{Math.abs(tx.quantity)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{fmtTime(tx.createdAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          {/* Category Distribution */}
          <SectionCard
            title="카테고리별 재고"
            subtitle="전체 보유 수량 기준"
            action={
              <Link href="/dashboard/inventory" className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                상세 <ChevronRight className="h-3 w-3" />
              </Link>
            }
          >
            <ul className="space-y-3">
              {categoryDist.map((c) => {
                const qty = c.items.reduce((s, i) => s + i.quantity, 0);
                const pct = Math.round((qty / maxCatCount) * 100);
                return (
                  <li key={c.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-foreground">{c.name.split(" ")[0]}</span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        <span className="font-bold text-foreground">{qty}</span> units
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
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
