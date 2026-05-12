import { PageHeader } from "@/components/common/PageHeader";
import { ShipmentStatusBadge, PriorityBadge } from "@/components/shipments/ShipmentStatusBadge";
import { ShipmentStatusChanger } from "@/components/shipments/ShipmentStatusChanger";
import { ShipmentFilterTabs } from "@/components/shipments/ShipmentFilterTabs";
import { CreateShipmentModal } from "@/components/shipments/CreateShipmentModal";
import { Pagination } from "@/components/common/Pagination";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/types";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function ShipmentsPage({ searchParams }: PageProps) {
  const { status = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const where = status ? { status: status as ShipmentStatus } : {};

  const [statusGroups, totalCount, filteredCount, filtered, inventoryItems] = await Promise.all([
    prisma.shipment.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.shipment.count(),
    prisma.shipment.count({ where }),
    prisma.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      include: {
        items: { include: { item: { select: { modelName: true } } } },
        user:  { select: { name: true } },
      },
    }),
    prisma.inventoryItem.findMany({
      where: { status: { not: "DISCONTINUED" } },
      select: { id: true, sku: true, modelName: true, quantity: true },
      orderBy: { sku: "asc" },
    }),
  ]);

  // 탭별 건수 집계
  const counts: Partial<Record<ShipmentStatus | "all", number>> = { all: totalCount };
  for (const g of statusGroups) {
    counts[g.status as ShipmentStatus] = g._count.id;
  }

  const active = statusGroups
    .filter((g) => !["COMPLETED", "CANCELLED"].includes(g.status))
    .reduce((s, g) => s + g._count.id, 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="출고 요청"
        subtitle={`전체 ${totalCount}건 · 진행 중 ${active}건`}
        action={<CreateShipmentModal items={inventoryItems} />}
      />

      <ShipmentFilterTabs counts={counts} />

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-semibold text-foreground">해당 상태의 출고 요청이 없습니다</p>
            <p className="text-[12px] text-muted-foreground mt-1">다른 탭을 선택해 보세요</p>
          </div>
        ) : (
          <>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">출고번호</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">요청처</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">부서</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">현재 상태</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">상태 변경</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">우선순위</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">품목</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">담당자</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">납기</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className={cn(
                    "hover:bg-muted/20 transition-colors",
                    s.status === "DELAYED" && "bg-red-50/30 dark:bg-red-950/10",
                  )}>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-blue-600">{s.shipmentNo}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground max-w-[140px]">
                      <span className="truncate block">{s.requester}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.department ?? "—"}</td>
                    <td className="px-4 py-3"><ShipmentStatusBadge status={s.status as any} /></td>
                    <td className="px-4 py-3">
                      <ShipmentStatusChanger shipmentId={s.id} currentStatus={s.status as ShipmentStatus} />
                    </td>
                    <td className="px-4 py-3"><PriorityBadge priority={s.priority as any} /></td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="space-y-0.5">
                        {s.items.slice(0, 2).map((si) => (
                          <p key={si.id} className="truncate max-w-[160px]">{si.item.modelName} ×{si.quantity}</p>
                        ))}
                        {s.items.length > 2 && (
                          <p className="text-[10px] text-muted-foreground/70">+{s.items.length - 2}종 더보기</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.user.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn(s.status === "DELAYED" ? "text-red-600 font-semibold" : "text-muted-foreground")}>
                        {s.dueDate ? s.dueDate.toISOString().slice(0, 10) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px]">
                      <span className="truncate block">{s.notes || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {filteredCount}건 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCount)}번째
              </p>
              <Pagination total={filteredCount} page={page} pageSize={PAGE_SIZE} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
