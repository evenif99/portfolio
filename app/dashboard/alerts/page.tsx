import { Suspense } from "react";
import { AlertTriangle, CheckCheck, Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { AlertPanel, ResolveAllButton } from "@/components/dashboard/AlertPanel";
import { AlertHistoryTable } from "@/components/dashboard/AlertHistoryTable";
import { kstDateTimeString } from "@/lib/datetime";

export default async function AlertsPage() {
  const [unresolved, recentResolved, totalResolved] = await Promise.all([
    prisma.lowStockAlert.findMany({
      where:   { resolved: false },
      orderBy: { createdAt: "desc" },
      include: {
        item: { select: { sku: true, modelName: true, quantity: true, safetyStock: true } },
      },
    }),
    prisma.lowStockAlert.findMany({
      where:   { resolved: true },
      orderBy: { createdAt: "desc" },
      take:    30,
      include: {
        item: { select: { sku: true, modelName: true } },
      },
    }),
    prisma.lowStockAlert.count({ where: { resolved: true } }),
  ]);

  const total = unresolved.length + totalResolved;
  const resolvedRate = total > 0 ? Math.round((totalResolved / total) * 100) : 100;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="재고 알림 센터"
        subtitle="재고 부족 알림을 확인하고 관리합니다"
        action={
          unresolved.length > 0 ? (
            <div className="flex items-center gap-2">
              <ResolveAllButton />
            </div>
          ) : undefined
        }
      />

      <div className="p-6 space-y-5">

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-3.5 w-3.5 text-amber-500" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">미해제 알림</p>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${unresolved.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {unresolved.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">현재 조치 필요</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">해제 완료</p>
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{totalResolved.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">누적 처리 건수</p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-blue-500" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">해제율</p>
            </div>
            <p className="text-2xl font-bold tabular-nums text-blue-600">{resolvedRate}%</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${resolvedRate}%` }} />
            </div>
          </div>
        </div>

        {/* 미해제 알림 목록 */}
        <SectionCard
          title="미해제 알림"
          subtitle={`${unresolved.length}건 — 안전재고 미만 품목`}
          action={
            unresolved.length > 0 ? (
              <ResolveAllButton />
            ) : undefined
          }
          noPadding
        >
          <AlertPanel alerts={unresolved} />
        </SectionCard>

        {/* 해제된 알림 이력 */}
        <SectionCard
          title="알림 이력"
          subtitle={`최근 ${recentResolved.length}건 (전체 ${totalResolved.toLocaleString()}건)`}
          noPadding
        >
          <AlertHistoryTable alerts={recentResolved} />
        </SectionCard>

      </div>
    </div>
  );
}
