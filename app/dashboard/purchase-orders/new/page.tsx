import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PONewForm } from "@/components/purchase-orders/PONewForm";

export default async function NewPurchaseOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ recommend?: string }>;
}) {
  const { recommend } = await searchParams;

  const [suppliers, allItems] = await Promise.all([
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
      select:  { id: true, name: true, leadTimeDays: true },
    }),
    prisma.inventoryItem.findMany({
      orderBy: { modelName: "asc" },
      select: {
        id: true, modelName: true, sku: true,
        supplierId: true, quantity: true, safetyStock: true,
        supplierPrices: { select: { supplierId: true, unitPrice: true, moq: true } },
      },
    }),
  ]);

  // PONewForm의 ItemOption 타입에 맞게 supplierPrices → prices로 매핑
  const mappedItems = allItems.map(({ supplierPrices, ...rest }) => ({
    ...rest,
    prices: supplierPrices,
  }));

  const recommendedItems = recommend === "1"
    ? mappedItems.filter(
        (it) => it.supplierId !== null && it.quantity < it.safetyStock,
      )
    : [];

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card px-6 py-4">
        <Link
          href="/dashboard/purchase-orders"
          className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> 발주 목록으로
        </Link>
        <h1 className="text-lg font-bold text-foreground">발주서 작성</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          초안으로 저장한 뒤, 상세 페이지에서 발주 확정할 수 있습니다
        </p>
      </div>

      <PONewForm
        suppliers={suppliers}
        allItems={mappedItems}
        recommendedItems={recommendedItems}
      />
    </div>
  );
}
