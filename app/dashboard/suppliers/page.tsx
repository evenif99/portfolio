import { PageHeader } from "@/components/common/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: {
      items: {
        select: { modelName: true, quantity: true, safetyStock: true, status: true },
        orderBy: { quantity: "desc" },
      },
    },
  });

  return (
    <div className="flex flex-col">
      <PageHeader title="공급업체" subtitle={`${suppliers.length}개 공급업체 관리 중`} />

      <div className="p-6 space-y-4">
        {suppliers.map((sup) => {
          const totalQty = sup.items.reduce((s, i) => s + i.quantity, 0);

          return (
            <div key={sup.id} className="rounded-lg border border-border bg-card p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{sup.name}</p>
                    <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {sup.items.length}종
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{sup.address ?? ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold tabular-nums text-foreground">{totalQty}</p>
                  <p className="text-[10px] text-muted-foreground">총 보유 units</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
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

              {sup.items.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">취급 품목</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sup.items.map((item, i) => (
                      <span key={i} className="rounded-md bg-muted/60 px-2 py-1 text-[11px] font-semibold text-foreground">
                        {item.modelName}
                        <span className={`ml-1.5 ${
                          item.quantity === 0 ? "text-red-500"
                          : item.quantity < item.safetyStock ? "text-amber-500"
                          : "text-emerald-600"
                        }`}>{item.quantity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
