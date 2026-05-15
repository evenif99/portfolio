import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Clock, Mail, Phone, MapPin, User,
  ArrowDownToLine, Package, AlertTriangle, Pencil,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { StockLevelBar } from "@/components/inventory/StockLevelBar";
import { SupplierFormModal } from "@/components/suppliers/SupplierFormModal";
import { DeleteSupplierButton } from "@/components/suppliers/DeleteSupplierButton";
import { SupplierPriceSection } from "@/components/suppliers/SupplierPriceSection";
import { prisma } from "@/lib/prisma";
import { kstDateTimeString } from "@/lib/datetime";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplierId = Number(id);

  const [supplier, inboundTx, supplierPrices, allItems] = await Promise.all([
    prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        items: {
          orderBy: { quantity: "asc" },
          select: {
            id: true, sku: true, modelName: true,
            quantity: true, safetyStock: true, status: true,
            category: { select: { name: true } },
            brand:    { select: { name: true } },
          },
        },
      },
    }),
    prisma.stockTransaction.findMany({
      where: {
        type: "INBOUND",
        item: { supplierId: supplierId },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        item: { select: { id: true, modelName: true, sku: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.supplierItemPrice.findMany({
      where: { supplierId },
      orderBy: { updatedAt: "desc" },
      include: { item: { select: { modelName: true, sku: true } } },
    }),
    prisma.inventoryItem.findMany({
      where: { supplierId },
      select: { id: true, modelName: true, sku: true },
      orderBy: { modelName: "asc" },
    }),
  ]);

  if (!supplier) notFound();

  const totalQty   = supplier.items.reduce((s, i) => s + i.quantity, 0);
  const lowCount   = supplier.items.filter((i) => i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK").length;
  const totalInbound = inboundTx.reduce((s, t) => s + t.quantity, 0);

  const editableSupplier = {
    id:           supplier.id,
    name:         supplier.name,
    contact:      supplier.contact,
    email:        supplier.email,
    phone:        supplier.phone,
    address:      supplier.address,
    leadTimeDays: supplier.leadTimeDays,
    notes:        supplier.notes,
  };

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="border-b border-border bg-card px-6 py-4">
        <Link
          href="/dashboard/suppliers"
          className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> 공급업체 목록으로
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">{supplier.name}</h1>
            {supplier.address && (
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" />{supplier.address}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/api/export/suppliers/prices?supplierId=${supplier.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Price Export
            </a>
            <SupplierFormModal
              mode="edit"
              supplier={editableSupplier}
              trigger={
                <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                  수정
                </button>
              }
            />
            <DeleteSupplierButton
              supplierId={supplier.id}
              supplierName={supplier.name}
              hasItems={supplier.items.length > 0}
              redirectTo="/dashboard/suppliers"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "취급 품목",   value: supplier.items.length, sub: "SKU",      color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30"    },
            { label: "총 보유량",   value: totalQty,              sub: "units",    color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "부족 품목",   value: lowCount,              sub: "안전재고 미만", color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30"  },
            { label: "총 납품량",   value: totalInbound,          sub: "INBOUND 누계", color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/30"},
          ].map(({ label, value, sub, color, bg }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-4">
              <p className={`text-xl font-bold tabular-nums ${color}`}>{value.toLocaleString()}</p>
              <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{label}</p>
              <p className="text-[10px] text-muted-foreground/60">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* 연락처 정보 */}
          <SectionCard title="연락처 정보">
            <ul className="space-y-3">
              {[
                { icon: User,  label: "담당자",   value: supplier.contact },
                { icon: Mail,  label: "이메일",   value: supplier.email   },
                { icon: Phone, label: "전화번호", value: supplier.phone   },
              ].map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-muted/50">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-[12px] font-semibold text-foreground mt-0.5">{value ?? "—"}</p>
                  </div>
                </li>
              ))}
              {supplier.leadTimeDays && (
                <li className="flex items-start gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-violet-50 dark:bg-violet-950/30">
                    <Clock className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">리드타임</p>
                    <p className="text-[12px] font-semibold text-violet-600 mt-0.5">{supplier.leadTimeDays}일</p>
                  </div>
                </li>
              )}
              {supplier.notes && (
                <li className="pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground mb-1">비고</p>
                  <p className="text-[12px] text-foreground whitespace-pre-wrap">{supplier.notes}</p>
                </li>
              )}
            </ul>
          </SectionCard>

          {/* 취급 품목 목록 */}
          <SectionCard
            title="취급 품목"
            subtitle={`${supplier.items.length}종 · 총 ${totalQty.toLocaleString()} units`}
            className="lg:col-span-2"
            noPadding
          >
            {supplier.items.length === 0 ? (
              <p className="px-5 py-8 text-center text-[12px] text-muted-foreground">
                연결된 품목이 없습니다
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">품목</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">카테고리</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">재고</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {supplier.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/dashboard/inventory/${item.id}`}
                            className="font-semibold text-foreground hover:text-blue-600 transition-colors"
                          >
                            {item.modelName}
                          </Link>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{item.sku}</p>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {item.category.name.split(" ")[0]}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <span className={`font-bold tabular-nums ${
                              item.quantity === 0 ? "text-red-600"
                              : item.quantity < item.safetyStock ? "text-amber-600"
                              : "text-foreground"
                            }`}>{item.quantity}</span>
                            <div className="flex-1">
                              <StockLevelBar quantity={item.quantity} safetyStock={item.safetyStock} showLabel={false} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <InventoryStatusBadge status={item.status as any} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* 단가 관리 */}
        <SectionCard noPadding>
          <SupplierPriceSection
            supplierId={supplierId}
            prices={supplierPrices.map((p) => ({
              id:        p.id,
              itemId:    p.itemId,
              modelName: p.item.modelName,
              sku:       p.item.sku,
              unitPrice: p.unitPrice,
              moq:       p.moq,
              notes:     p.notes,
            }))}
            itemOptions={allItems}
          />
        </SectionCard>

        {/* 납품 이력 */}
        <SectionCard
          title="납품 이력 (입고)"
          subtitle={`최근 50건 · 총 ${inboundTx.length}건 조회`}
          noPadding
        >
          {inboundTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ArrowDownToLine className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-[12px] font-semibold text-foreground">납품 이력 없음</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">아직 이 공급업체 품목의 입고 이력이 없습니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">품목명</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">SKU</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">입고량</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">참조번호</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">처리자</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inboundTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/dashboard/inventory/${tx.item.id}`}
                          className="font-semibold text-foreground hover:text-blue-600 transition-colors"
                        >
                          {tx.item.modelName}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{tx.item.sku}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-bold tabular-nums text-emerald-600">+{tx.quantity}</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{tx.reference ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{tx.user.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{kstDateTimeString(tx.createdAt)}</td>
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
