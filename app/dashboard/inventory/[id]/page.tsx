import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, RefreshCw, RotateCcw, Package, Pencil } from "lucide-react";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { StockLevelBar } from "@/components/inventory/StockLevelBar";
import { TransactionForm } from "@/components/inventory/TransactionForm";
import { ItemFormModal } from "@/components/inventory/ItemFormModal";
import { DeleteItemButton } from "@/components/inventory/DeleteItemButton";
import { SectionCard } from "@/components/common/SectionCard";
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

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [item, itemTx, categories, brands, suppliers, warehouses] = await Promise.all([
    prisma.inventoryItem.findUnique({
      where: { id: Number(id) },
      include: {
        category:  true,
        brand:     true,
        supplier:  true,
        warehouse: true,
        _count:    { select: { transactions: true, shipmentItems: true } },
      },
    }),
    prisma.stockTransaction.findMany({
      where: { itemId: Number(id) },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.warehouse.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!item) notFound();

  const refData = { categories, brands, suppliers, warehouses };
  const editableItem = {
    id:          item.id,
    sku:         item.sku,
    name:        item.name,
    modelName:   item.modelName,
    categoryId:  item.categoryId,
    brandId:     item.brandId,
    supplierId:  item.supplierId ?? null,
    warehouseId: item.warehouseId,
    quantity:    item.quantity,
    safetyStock: item.safetyStock,
    unitPrice:   item.unitPrice ?? null,
    imageUrl:    item.imageUrl ?? null,
    notes:       item.notes ?? null,
    specs:       item.specs as Record<string, string> | null,
  };

  const specs = item.specs as Record<string, string> | null;

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card px-6 py-4">
        <Link
          href="/dashboard/inventory"
          className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> 재고 목록으로
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 rounded-lg border border-border bg-muted/40 overflow-hidden">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div>
              <p className="font-mono text-[11px] text-muted-foreground mb-0.5">{item.sku}</p>
              <h1 className="text-lg font-bold text-foreground">{item.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{item.modelName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InventoryStatusBadge status={item.status as any} />
            <ItemFormModal
              mode="edit"
              item={editableItem}
              refData={refData}
              trigger={
                <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                  수정
                </button>
              }
            />
            <DeleteItemButton
              itemId={item.id}
              itemName={item.name}
              hasTx={item._count.transactions > 0}
              hasShipments={item._count.shipmentItems > 0}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">

          {/* Stock summary */}
          <SectionCard title="재고 현황">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">현재 재고</p>
                <p className={cn(
                  "text-3xl font-bold tabular-nums",
                  item.quantity === 0 ? "text-red-600"
                  : item.quantity < item.safetyStock ? "text-amber-600"
                  : "text-foreground",
                )}>
                  {item.quantity}
                  <span className="text-base font-normal text-muted-foreground ml-1">units</span>
                </p>
              </div>
              <StockLevelBar quantity={item.quantity} safetyStock={item.safetyStock} showLabel={false} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/40 px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground">안전재고</p>
                  <p className="text-base font-bold tabular-nums text-foreground mt-0.5">{item.safetyStock}</p>
                </div>
                <div className="rounded-md bg-muted/40 px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground">단가</p>
                  <p className="text-base font-bold tabular-nums text-foreground mt-0.5">
                    {item.unitPrice != null ? `₩${item.unitPrice.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Location */}
          <SectionCard title="위치 정보">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">창고</p>
                <p className="text-sm font-semibold text-foreground">{item.warehouse.name}</p>
                <p className="text-[11px] text-muted-foreground">{item.warehouse.location}</p>
              </div>
              {item.supplier && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">공급업체</p>
                  <p className="text-sm font-semibold text-foreground">{item.supplier.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.supplier.email ?? ""}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">카테고리 / 브랜드</p>
                <p className="text-sm text-foreground">{item.category.name} · {item.brand.name}</p>
              </div>
            </div>
          </SectionCard>

          {/* Specs */}
          <SectionCard title="제품 스펙">
            <dl className="space-y-2.5">
              {specs
                ? Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between gap-4">
                      <dt className="text-[11px] text-muted-foreground flex-shrink-0">{key}</dt>
                      <dd className="text-[12px] font-semibold text-foreground text-right">{val}</dd>
                    </div>
                  ))
                : <p className="text-[12px] text-muted-foreground">스펙 정보 없음</p>
              }
            </dl>
          </SectionCard>

          {/* 입출고 등록 폼 */}
          <TransactionForm
            itemId={item.id}
            currentQty={item.quantity}
            safetyStock={item.safetyStock}
          />
        </div>

        {/* Transaction History */}
        <SectionCard
          title="입출고 이력"
          subtitle={`해당 품목 관련 트랜잭션 ${itemTx.length}건`}
          noPadding
        >
          {itemTx.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">이력이 없습니다.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">유형</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">수량</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">참조번호</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">처리자</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">비고</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {itemTx.map((tx) => {
                  const type = tx.type as TransactionType;
                  const Icon = TX_ICON[type];
                  const isNeg = type === "OUTBOUND" || (type === "ADJUSTMENT" && tx.quantity < 0);
                  return (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                          TX_TYPE_COLOR[type],
                        )}>
                          <Icon className="h-3 w-3" />
                          {TX_TYPE_LABEL[type]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={cn("font-bold tabular-nums text-[13px]", isNeg ? "text-red-500" : "text-emerald-600")}>
                          {isNeg ? "-" : "+"}{Math.abs(tx.quantity)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{tx.reference ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{tx.user.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{tx.notes || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{kstDateTimeString(tx.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
