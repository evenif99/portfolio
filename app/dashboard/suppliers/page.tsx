import Link from "next/link";
import { Clock, Plus, Pencil, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { InventoryStatusBadge } from "@/components/inventory/InventoryStatusBadge";
import { SupplierFormModal } from "@/components/suppliers/SupplierFormModal";
import { DeleteSupplierButton } from "@/components/suppliers/DeleteSupplierButton";
import { prisma } from "@/lib/prisma";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: {
      items: {
        select: { id: true, modelName: true, quantity: true, safetyStock: true, status: true },
        orderBy: { quantity: "desc" },
      },
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="공급업체"
        subtitle={`${suppliers.length}개 공급업체 관리 중`}
        action={
          <SupplierFormModal
            mode="create"
            trigger={
              <button className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4" />
                공급업체 추가
              </button>
            }
          />
        }
      />

      <div className="p-6 space-y-4">
        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-semibold text-foreground">등록된 공급업체가 없습니다</p>
            <p className="text-[12px] text-muted-foreground mt-1">우측 상단 버튼으로 추가하세요</p>
          </div>
        ) : (
          suppliers.map((sup) => {
            const totalQty   = sup.items.reduce((s, i) => s + i.quantity, 0);
            const hasItems   = sup._count.items > 0;
            const editableSupplier = {
              id:           sup.id,
              name:         sup.name,
              contact:      sup.contact,
              email:        sup.email,
              phone:        sup.phone,
              address:      sup.address,
              leadTimeDays: sup.leadTimeDays,
              notes:        sup.notes,
            };

            return (
              <div
                key={sup.id}
                className="rounded-lg border border-border bg-card hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                {/* 헤더 */}
                <div className="flex items-start justify-between gap-4 p-5 pb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/dashboard/suppliers/${sup.id}`}
                          className="text-sm font-bold text-foreground hover:text-blue-600 transition-colors"
                        >
                          {sup.name}
                        </Link>
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {sup._count.items}종
                        </span>
                        {sup.leadTimeDays && (
                          <span className="flex items-center gap-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                            <Clock className="h-2.5 w-2.5" />
                            리드타임 {sup.leadTimeDays}일
                          </span>
                        )}
                      </div>
                      {sup.address && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sup.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right mr-2">
                      <p className="text-lg font-bold tabular-nums text-foreground">{totalQty.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">총 보유 units</p>
                    </div>
                    <SupplierFormModal
                      mode="edit"
                      supplier={editableSupplier}
                      trigger={
                        <button className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[12px] font-semibold text-foreground hover:bg-muted transition-colors">
                          <Pencil className="h-3 w-3" />
                          수정
                        </button>
                      }
                    />
                    <DeleteSupplierButton
                      supplierId={sup.id}
                      supplierName={sup.name}
                      hasItems={hasItems}
                    />
                  </div>
                </div>

                {/* 연락처 정보 */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 px-5 pb-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground">담당자</p>
                    <p className="text-[12px] font-semibold text-foreground mt-0.5">{sup.contact ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">이메일</p>
                    <p className="text-[12px] text-foreground mt-0.5">{sup.email ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">전화</p>
                    <p className="text-[12px] text-foreground mt-0.5">{sup.phone ?? "—"}</p>
                  </div>
                </div>

                {/* 취급 품목 */}
                {sup.items.length > 0 && (
                  <div className="border-t border-border px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">취급 품목</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sup.items.slice(0, 8).map((item) => (
                        <Link
                          key={item.id}
                          href={`/dashboard/inventory/${item.id}`}
                          className="group flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-colors"
                        >
                          <span>{item.modelName}</span>
                          <span className={
                            item.quantity === 0 ? "text-red-500"
                            : item.quantity < item.safetyStock ? "text-amber-500"
                            : "text-emerald-600"
                          }>{item.quantity}</span>
                        </Link>
                      ))}
                      {sup.items.length > 8 && (
                        <Link
                          href={`/dashboard/suppliers/${sup.id}`}
                          className="flex items-center gap-0.5 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          +{sup.items.length - 8}개 더 보기
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* 상세 보기 링크 */}
                <div className="border-t border-border px-5 py-2.5 flex justify-end">
                  <Link
                    href={`/dashboard/suppliers/${sup.id}`}
                    className="flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    납품 이력 보기
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
