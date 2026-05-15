import Image from "next/image";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { StockLevelBar } from "@/components/inventory/StockLevelBar";
import { InventoryFilterBar } from "@/components/inventory/InventoryFilterBar";
import { ItemFormModal } from "@/components/inventory/ItemFormModal";
import { Pagination } from "@/components/common/Pagination";
import { ExportCsvButton } from "@/components/common/ExportCsvButton";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string; categoryId?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const { search = "", status = "", page: pageStr = "1", categoryId = "" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const categoryIdNum = categoryId ? parseInt(categoryId, 10) || 0 : 0;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { sku: { contains: search, mode: "insensitive" as const } },
              { name: { contains: search, mode: "insensitive" as const } },
              { modelName: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      status ? { status: status as any } : {},
      categoryIdNum > 0 ? { categoryId: categoryIdNum } : {},
    ],
  };

  const [totalCount, filteredCount, items, categories, brands, suppliers, warehouses] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.count({ where }),
    prisma.inventoryItem.findMany({
      where,
      orderBy: { sku: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        warehouse: { select: { name: true } },
      },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.warehouse.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const refData = { categories, brands, suppliers, warehouses };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="재고 관리"
        subtitle={`전체 ${totalCount.toLocaleString()}개 SKU`}
        action={
          <div className="flex items-center gap-2">
            <ExportCsvButton href={`/api/export/inventory?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`} />
            <a
              href={`/api/export/inventory/excel?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Excel Export
            </a>
            <ItemFormModal
              mode="create"
              refData={refData}
              trigger={
                <button className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  신규 품목
                </button>
              }
            />
          </div>
        }
      />

      <InventoryFilterBar totalCount={totalCount} filteredCount={filteredCount} />

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">검색 결과가 없습니다</p>
            <p className="text-[12px] text-muted-foreground mt-1">검색어 또는 필터를 변경해 보세요.</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-3 py-3 w-14"></th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">SKU</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">품목명</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">카테고리</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">브랜드</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">재고 수준</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">안전재고</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">창고</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">상태</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">단가</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2">
                        <Link href={`/dashboard/inventory/${item.id}`} className="block">
                          <div className="relative h-10 w-10 rounded-md border border-border bg-muted/40 overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.name} fill sizes="40px" className="object-contain p-0.5" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/inventory/${item.id}`} className="font-mono text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                          {item.sku}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/inventory/${item.id}`} className="font-semibold text-foreground hover:text-blue-600 transition-colors">
                          {item.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.category.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.brand.name}</td>
                      <td className="px-4 py-3 w-40">
                        <StockLevelBar quantity={item.quantity} safetyStock={item.safetyStock} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{item.safetyStock}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.warehouse.name}</td>
                      <td className="px-4 py-3">
                        <InventoryStatusBadge status={item.status as any} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                        {item.unitPrice != null ? `₩${item.unitPrice.toLocaleString()}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {filteredCount.toLocaleString()}개 중 {(page - 1) * PAGE_SIZE + 1}~{Math.min(page * PAGE_SIZE, filteredCount)}
              </p>
              <Pagination total={filteredCount} page={page} pageSize={PAGE_SIZE} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
