import { PageHeader } from "@/components/common/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      items: {
        select: { id: true, modelName: true, quantity: true, safetyStock: true, status: true },
        orderBy: { quantity: "desc" },
      },
    },
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="카테고리"
        subtitle={`${categories.length}개 카테고리 · PC 부품 전 품목 분류`}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const totalQty = cat.items.reduce((s, i) => s + i.quantity, 0);
            const lowCount = cat.items.filter((i) => i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK").length;

            return (
              <div
                key={cat.id}
                className="rounded-lg border border-border bg-card p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{cat.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{cat.items.length}개 SKU</p>
                  </div>
                  {lowCount > 0 && (
                    <span className="flex-shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                      부족 {lowCount}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-muted/40 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">총 재고</p>
                    <p className="text-base font-bold tabular-nums text-foreground">{totalQty}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">SKU 수</p>
                    <p className="text-base font-bold tabular-nums text-foreground">{cat.items.length}</p>
                  </div>
                </div>
                {cat.items.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {cat.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground truncate">{item.modelName}</span>
                        <span className={`font-semibold tabular-nums ${
                          item.quantity === 0 ? "text-red-600"
                          : item.quantity < item.safetyStock ? "text-amber-600"
                          : "text-foreground"
                        }`}>{item.quantity}</span>
                      </div>
                    ))}
                    {cat.items.length > 3 && (
                      <p className="text-[10px] text-muted-foreground/60">+{cat.items.length - 3}개 더</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
