import { PageHeader } from "@/components/common/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      items: {
        select: { modelName: true, quantity: true, category: { select: { name: true } } },
        orderBy: { quantity: "desc" },
      },
    },
  });

  return (
    <div className="flex flex-col">
      <PageHeader title="브랜드" subtitle={`${brands.length}개 브랜드 관리 중`} />

      <div className="p-6">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">브랜드명</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">취급 품목</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">총 재고</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">SKU 수</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">카테고리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brands.map((brand) => {
                const totalQty = brand.items.reduce((s, i) => s + i.quantity, 0);
                const cats = [...new Set(brand.items.map((i) => i.category.name))];
                return (
                  <tr key={brand.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground">{brand.name}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px]">
                      <div className="space-y-0.5">
                        {brand.items.slice(0, 2).map((i, idx) => (
                          <p key={idx} className="truncate">{i.modelName}</p>
                        ))}
                        {brand.items.length > 2 && (
                          <p className="text-[10px] text-muted-foreground/60">+{brand.items.length - 2}개</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-foreground">{totalQty}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{brand.items.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {cats.slice(0, 2).map((c) => (
                          <span key={c} className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {c.split(" ")[0]}
                          </span>
                        ))}
                        {cats.length > 2 && (
                          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground/60">+{cats.length - 2}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
