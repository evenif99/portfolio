import Link from "next/link";
import { Plus, ShoppingCart, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/common/SectionCard";
import { POStatusBadge } from "@/components/purchase-orders/POStatusBadge";
import { kstDateString } from "@/lib/datetime";

export default async function PurchaseOrdersPage() {
  const [orders, lowStockItems] = await Promise.all([
    prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        supplier: { select: { name: true } },
        createdBy: { select: { name: true } },
        items: { select: { quantity: true, unitPrice: true } },
      },
    }),
    prisma.inventoryItem.findMany({
      where: {
        status: { in: ["LOW_STOCK", "OUT_OF_STOCK"] },
        supplierId: { not: null },
      },
      include: {
        supplier:      { select: { id: true, name: true, leadTimeDays: true } },
        supplierPrices: { select: { unitPrice: true, moq: true } },
        category:      { select: { name: true } },
      },
      orderBy: [{ status: "asc" }, { quantity: "asc" }],
    }),
  ]);

  const statusCount = {
    DRAFT:     orders.filter((o) => o.status === "DRAFT").length,
    ORDERED:   orders.filter((o) => o.status === "ORDERED").length,
    RECEIVED:  orders.filter((o) => o.status === "RECEIVED").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">발주 관리</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            발주서 생성, 확정, 입고 처리를 관리합니다
          </p>
        </div>
        <Link
          href="/dashboard/purchase-orders/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          발주서 작성
        </Link>
      </div>

      <div className="p-6 space-y-5">

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "초안",     value: statusCount.DRAFT,     icon: FileText,      color: "text-slate-600",   bg: "bg-slate-50 dark:bg-slate-950/30"    },
            { label: "발주 중",  value: statusCount.ORDERED,   icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30"    },
            { label: "입고 완료",value: statusCount.RECEIVED,  icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "취소됨",   value: statusCount.CANCELLED, icon: XCircle,       color: "text-red-500",     bg: "bg-red-50 dark:bg-red-950/30"        },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-lg border border-border p-4 ${bg}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* 재고 부족 추천 */}
        {lowStockItems.length > 0 && (
          <SectionCard
            title="발주 추천"
            subtitle={`안전재고 미만 ${lowStockItems.length}종 — 발주서 작성 시 자동으로 불러올 수 있습니다`}
            action={
              <Link
                href="/dashboard/purchase-orders/new?recommend=1"
                className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-amber-600 transition-colors"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                추천 발주서 생성
              </Link>
            }
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">품목</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">공급업체</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">현재고</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">안전재고</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">추천 발주량</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">단가 (₩)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lowStockItems.map((item) => {
                    const recommended = Math.max(
                      item.safetyStock * 2 - item.quantity,
                      item.supplierPrices[0]?.moq ?? 1,
                    );
                    const price = item.supplierPrices[0]?.unitPrice ?? null;
                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/dashboard/inventory/${item.id}`}
                            className="font-semibold text-foreground hover:text-blue-600 transition-colors"
                          >
                            {item.modelName}
                          </Link>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.sku}</p>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {item.supplier?.name ?? "—"}
                          {item.supplier?.leadTimeDays && (
                            <span className="ml-1 text-[10px] text-muted-foreground/60">
                              ({item.supplier.leadTimeDays}일)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`font-bold tabular-nums ${item.quantity === 0 ? "text-red-600" : "text-amber-600"}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{item.safetyStock}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-semibold text-blue-600 tabular-nums">{recommended}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                          {price ? `₩${price.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* 발주서 목록 */}
        <SectionCard
          title="발주서 목록"
          subtitle={`전체 ${orders.length}건`}
          noPadding
        >
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-[13px] font-semibold text-foreground">발주서 없음</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                발주서 작성 버튼으로 첫 발주서를 만들어보세요
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">발주번호</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">공급업체</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">품목 수</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">총액 (₩)</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">상태</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">작성일</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">작성자</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((po) => {
                    const total = po.items.reduce(
                      (s, it) => s + (it.unitPrice ?? 0) * it.quantity, 0,
                    );
                    return (
                      <tr key={po.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/dashboard/purchase-orders/${po.id}`}
                            className="font-mono font-semibold text-blue-600 hover:underline"
                          >
                            {po.orderNo}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-foreground">{po.supplier.name}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{po.items.length}종</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {total > 0 ? `₩${total.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-2.5"><POStatusBadge status={po.status} /></td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                          {kstDateString(po.createdAt)}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{po.createdBy.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
}
