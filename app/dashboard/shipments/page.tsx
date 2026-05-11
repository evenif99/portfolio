import { PageHeader } from "@/components/common/PageHeader";
import { ShipmentStatusBadge, PriorityBadge } from "@/components/shipments/ShipmentStatusBadge";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function ShipmentsPage() {
  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { item: { select: { modelName: true } } },
      },
      user: { select: { name: true } },
    },
  });

  const active = shipments.filter((s) => !["COMPLETED", "CANCELLED"].includes(s.status)).length;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="출고 요청"
        subtitle={`전체 ${shipments.length}건 · 진행 중 ${active}건`}
      />

      {/* Status filter tabs */}
      <div className="flex items-center gap-0 border-b border-border bg-card overflow-x-auto">
        {(["전체", "대기", "승인", "피킹", "패킹", "출하", "지연", "완료"] as const).map((tab, i) => (
          <button
            key={tab}
            className={`flex-shrink-0 px-5 py-2.5 text-[12px] font-semibold border-b-2 transition-colors ${
              i === 0
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">출고번호</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">요청처</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">부서</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">상태</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">우선순위</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">품목</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">담당자</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">납기</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shipments.map((s) => (
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
      </div>
    </div>
  );
}
