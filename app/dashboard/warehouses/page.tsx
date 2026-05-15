import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightLeft, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { canOperate } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { WarehouseFormModal } from "@/components/warehouses/WarehouseFormModal";
import { WarehouseTransferModal } from "@/components/warehouses/WarehouseTransferModal";

interface WarehousesPageProps {
  searchParams: Promise<{ warehouseId?: string; categoryId?: string; search?: string }>;
}

export default async function WarehousesPage({ searchParams }: WarehousesPageProps) {
  const session = await auth();
  if (!canOperate(session?.user?.role)) redirect("/dashboard");

  const { warehouseId = "", categoryId = "", search = "" } = await searchParams;
  const warehouseIdNum = Number(warehouseId) || 0;
  const categoryIdNum = Number(categoryId) || 0;

  const where = {
    AND: [
      warehouseIdNum > 0 ? { warehouseId: warehouseIdNum } : {},
      categoryIdNum > 0 ? { categoryId: categoryIdNum } : {},
      search
        ? {
            OR: [
              { sku: { contains: search, mode: "insensitive" as const } },
              { modelName: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
    ],
  };

  const [warehouses, categories, items] = await Promise.all([
    prisma.warehouse.findMany({
      orderBy: { name: "asc" },
      include: {
        items: { select: { quantity: true } },
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.inventoryItem.findMany({
      where,
      orderBy: [{ warehouseId: "asc" }, { modelName: "asc" }],
      include: {
        category: { select: { name: true } },
        warehouse: { select: { id: true, name: true } },
      },
      take: 200,
    }),
  ]);

  const warehouseOptions = warehouses.map((w) => ({ id: w.id, name: w.name }));

  return (
    <div className="flex flex-col">
      <PageHeader
        title="창고 관리"
        subtitle={`창고 ${warehouses.length}개 운영 중`}
        action={
          <WarehouseFormModal
            mode="create"
            trigger={
              <button className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                <Plus className="h-3.5 w-3.5" />
                창고 등록
              </button>
            }
          />
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {warehouses.map((w) => {
            const capacity = w.capacity ?? 0;
            const used = w.items.reduce((sum, item) => sum + item.quantity, 0);
            const pct = capacity > 0 ? Math.min(100, Math.round((used / capacity) * 100)) : 0;
            return (
              <SectionCard key={w.id} title={w.name} subtitle={w.location}>
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    구역 {w.zone ?? "-"} · 용량 {capacity.toLocaleString()}
                  </p>
                  <p className="text-[13px] font-bold text-foreground tabular-nums">
                    {used.toLocaleString()} / {capacity.toLocaleString()} ({pct}%)
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="pt-1">
                    <WarehouseFormModal
                      mode="edit"
                      warehouse={{ id: w.id, name: w.name, location: w.location, zone: w.zone, capacity }}
                      trigger={
                        <button className="rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted">
                          수정
                        </button>
                      }
                    />
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>

        <SectionCard title="창고별 재고 현황" subtitle="창고/카테고리/품목 검색 필터">
          <form className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
            <select
              name="warehouseId"
              defaultValue={warehouseIdNum > 0 ? String(warehouseIdNum) : ""}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">전체 창고</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <select
              name="categoryId"
              defaultValue={categoryIdNum > 0 ? String(categoryIdNum) : ""}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">전체 카테고리</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              name="search"
              defaultValue={search}
              placeholder="SKU/모델명 검색"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              필터 적용
            </button>
          </form>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">창고</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">SKU</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">품목</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">카테고리</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">수량</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">이동</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      조건에 맞는 품목이 없습니다.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-3 py-2.5 text-muted-foreground">{item.warehouse.name}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{item.sku}</td>
                    <td className="px-3 py-2.5">
                      <Link href={`/dashboard/inventory/${item.id}`} className="font-semibold text-foreground hover:text-blue-600">
                        {item.modelName}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{item.category.name}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{item.quantity.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right">
                      <WarehouseTransferModal
                        item={{
                          id: item.id,
                          sku: item.sku,
                          modelName: item.modelName,
                          quantity: item.quantity,
                          warehouseId: item.warehouse.id,
                        }}
                        warehouses={warehouseOptions}
                        trigger={
                          <button className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-cyan-700 hover:bg-cyan-50">
                            <ArrowRightLeft className="h-3 w-3" />
                            이동
                          </button>
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="운영 메모" subtitle="현재 버전 제한 사항">
          <p className="text-[12px] text-muted-foreground">
            현재 데이터 모델은 품목 SKU가 전역 유니크라 창고 간 부분 수량 이동(분할 이동)을 지원하지 않습니다.
            이번 Phase에서는 전체 수량 이동 + TRANSFER 이력 기록 방식으로 운영합니다.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
