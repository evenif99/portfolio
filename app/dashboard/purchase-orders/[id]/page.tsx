import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarClock, PackageCheck, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/common/SectionCard";
import { POStatusBadge } from "@/components/purchase-orders/POStatusBadge";
import { POActions } from "@/components/purchase-orders/POActions";
import { ExportCsvButton } from "@/components/common/ExportCsvButton";
import { kstDateTimeString, kstDateString } from "@/lib/datetime";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);

  const po = await prisma.purchaseOrder.findUnique({
    where:   { id: orderId },
    include: {
      supplier:  { select: { name: true, contact: true, phone: true, leadTimeDays: true } },
      createdBy: { select: { name: true } },
      items: {
        include: { item: { select: { modelName: true, sku: true, quantity: true } } },
      },
    },
  });

  if (!po) notFound();

  const total = po.items.reduce(
    (s, it) => s + (it.unitPrice ?? 0) * it.quantity, 0,
  );

  const poItems = po.items.map((it) => ({
    id:        it.id,
    itemId:    it.itemId,
    modelName: it.item.modelName,
    sku:       it.item.sku,
    quantity:  it.quantity,
    unitPrice: it.unitPrice,
    receivedQty: it.receivedQty,
    currentStock: it.item.quantity,
  }));

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="border-b border-border bg-card px-6 py-4 print:hidden">
        <Link
          href="/dashboard/purchase-orders"
          className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> 발주 목록으로
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-mono text-foreground">{po.orderNo}</h1>
              <POStatusBadge status={po.status} />
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {po.supplier.name} · 작성 {kstDateTimeString(po.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ExportCsvButton
              href={`/api/purchase-orders/${po.id}/csv`}
              label="CSV 내보내기"
            />
            <POActions
              orderId={po.id}
              status={po.status}
              items={poItems}
            />
          </div>
        </div>
      </div>

      {/* 인쇄용 헤더 */}
      <div className="hidden print:block px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold">발주서 {po.orderNo}</h1>
        <p className="text-sm text-gray-500 mt-1">작성일: {kstDateString(po.createdAt)}</p>
      </div>

      <div className="p-6 space-y-5 print:p-4 print:space-y-4">

        {/* 발주 정보 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Building2,
              label: "공급업체",
              value: po.supplier.name,
              sub:   po.supplier.phone ?? po.supplier.contact ?? undefined,
              color: "text-blue-600",
            },
            {
              icon: CalendarClock,
              label: "입고 예정일",
              value: po.expectedAt ? kstDateString(po.expectedAt) : "미정",
              sub:   po.orderedAt ? `발주일: ${kstDateString(po.orderedAt)}` : "발주 확정 후 결정",
              color: "text-violet-600",
            },
            {
              icon: User,
              label: "작성자",
              value: po.createdBy.name,
              sub:   po.receivedAt ? `입고 완료: ${kstDateString(po.receivedAt)}` : undefined,
              color: "text-emerald-600",
            },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              </div>
              <p className="text-[13px] font-bold text-foreground">{value}</p>
              {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>

        {/* 품목 목록 */}
        <SectionCard
          title="발주 품목"
          subtitle={`${po.items.length}종 · 총액 ${total > 0 ? `₩${total.toLocaleString()}` : "단가 미입력"}`}
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">품목</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">발주량</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">단가 (₩)</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">금액 (₩)</th>
                  {po.status === "RECEIVED" && (
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">실입고량</th>
                  )}
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">현재고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {poItems.map((item) => {
                  const lineTotal = (item.unitPrice ?? 0) * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/dashboard/inventory/${item.itemId}`}
                          className="font-semibold text-foreground hover:text-blue-600 transition-colors"
                        >
                          {item.modelName}
                        </Link>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.sku}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                        {item.unitPrice ? `₩${item.unitPrice.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {lineTotal > 0 ? (
                          <span className="font-semibold text-foreground">₩{lineTotal.toLocaleString()}</span>
                        ) : "—"}
                      </td>
                      {po.status === "RECEIVED" && (
                        <td className="px-4 py-2.5 text-right">
                          <span className={`font-bold tabular-nums ${item.receivedQty < item.quantity ? "text-amber-600" : "text-emerald-600"}`}>
                            +{item.receivedQty}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                        {item.currentStock}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {total > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/20">
                    {/*
                      컬럼 수: RECEIVED=6(품목+발주량+단가+금액+실입고량+현재고),
                               non-RECEIVED=5(품목+발주량+단가+금액+현재고)
                      합계 레이블이 마지막 컬럼(현재고) 바로 앞까지 span
                    */}
                    <td colSpan={po.status === "RECEIVED" ? 5 : 4} className="px-4 py-2.5 text-right text-[12px] font-bold text-muted-foreground">
                      합계
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="font-bold text-[13px] text-blue-600">₩{total.toLocaleString()}</span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </SectionCard>

        {/* 비고 */}
        {po.notes && (
          <SectionCard title="비고">
            <p className="text-[13px] text-foreground whitespace-pre-wrap">{po.notes}</p>
          </SectionCard>
        )}

        {/* 입고 완료 알림 */}
        {po.status === "RECEIVED" && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 px-5 py-4">
            <PackageCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">입고 완료</p>
              <p className="text-[12px] text-emerald-600/80 dark:text-emerald-500 mt-0.5">
                {po.receivedAt && kstDateTimeString(po.receivedAt)} — 재고에 자동 반영되었습니다
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
