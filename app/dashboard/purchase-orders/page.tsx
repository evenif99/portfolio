import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/common/SectionCard";
import { POStatusBadge } from "@/components/purchase-orders/POStatusBadge";
import { POAdvancedFilters } from "@/components/purchase-orders/POAdvancedFilters";
import { kstDateString } from "@/lib/datetime";

const STATUS_SET = new Set(["DRAFT", "ORDERED", "RECEIVED", "CANCELLED"] as const);

type POStatus = "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    statuses?: string;
    from?: string;
    to?: string;
    minAmount?: string;
    maxAmount?: string;
  }>;
}

export default async function PurchaseOrdersPage({ searchParams }: PageProps) {
  const { q = "", statuses = "", from = "", to = "", minAmount = "", maxAmount = "" } = await searchParams;

  const statusList = statuses
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is POStatus => STATUS_SET.has(s as POStatus));

  const minAmountNum = Number(minAmount || 0);
  const maxAmountNum = Number(maxAmount || 0);

  const where: any = {
    AND: [
      q
        ? {
            OR: [
              { orderNo: { contains: q, mode: "insensitive" } },
              { supplier: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {},
      statusList.length > 0 ? { status: { in: statusList } } : {},
      from ? { createdAt: { gte: new Date(`${from}T00:00:00`) } } : {},
      to ? { createdAt: { lte: new Date(`${to}T23:59:59`) } } : {},
    ],
  };

  const [ordersRaw, lowStockItems] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
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
        supplier: { select: { id: true, name: true, leadTimeDays: true } },
        supplierPrices: { select: { unitPrice: true, moq: true } },
      },
      orderBy: [{ status: "asc" }, { quantity: "asc" }],
      take: 8,
    }),
  ]);

  const orders = ordersRaw
    .map((po) => ({
      ...po,
      totalAmount: po.items.reduce((s, it) => s + (it.unitPrice ?? 0) * it.quantity, 0),
    }))
    .filter((po) => {
      if (minAmount && po.totalAmount < minAmountNum) return false;
      if (maxAmount && po.totalAmount > maxAmountNum) return false;
      return true;
    });

  const statusCount = {
    DRAFT: orders.filter((o) => o.status === "DRAFT").length,
    ORDERED: orders.filter((o) => o.status === "ORDERED").length,
    RECEIVED: orders.filter((o) => o.status === "RECEIVED").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">발주 관리</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">발주 생성, 확정, 입고 처리까지 한 화면에서 관리합니다.</p>
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
        <POAdvancedFilters />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["DRAFT", "ORDERED", "RECEIVED", "CANCELLED"].map((s) => (
            <div key={s} className="rounded-lg border border-border bg-card p-4">
              <p className="text-[11px] font-semibold text-muted-foreground">{s}</p>
              <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{statusCount[s as keyof typeof statusCount]}</p>
            </div>
          ))}
        </div>

        {lowStockItems.length > 0 && (
          <SectionCard title="발주 추천" subtitle="안전재고 미만 품목 기준" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">품목</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">공급업체</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">현재</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">안전</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">추천 발주</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lowStockItems.map((item) => {
                    const recommended = Math.max(item.safetyStock * 2 - item.quantity, item.supplierPrices[0]?.moq ?? 1);
                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5">
                          <Link href={`/dashboard/inventory/${item.id}`} className="font-semibold text-foreground hover:text-blue-600 transition-colors">{item.modelName}</Link>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.sku}</p>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{item.supplier?.name ?? "-"}</td>
                        <td className="px-4 py-2.5 text-right font-bold tabular-nums">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{item.safetyStock}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-blue-600 tabular-nums">{recommended}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        <SectionCard title="발주서 목록" subtitle={`검색 결과 ${orders.length}건`} noPadding>
          {orders.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 발주서가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">발주번호</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">공급업체</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">품목 수</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">총액</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">상태</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">작성일</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">작성자</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((po) => (
                    <tr key={po.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href={`/dashboard/purchase-orders/${po.id}`} className="font-mono font-semibold text-blue-600 hover:underline">
                          {po.orderNo}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-foreground">{po.supplier.name}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{po.items.length}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{po.totalAmount > 0 ? `₩${po.totalAmount.toLocaleString()}` : "-"}</td>
                      <td className="px-4 py-2.5"><POStatusBadge status={po.status} /></td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{kstDateString(po.createdAt)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{po.createdBy.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
