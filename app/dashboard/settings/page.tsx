import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAdmin } from "@/lib/rbac";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();
  if (!canAdmin(session?.user?.role)) redirect("/dashboard");

  const warehouses = await prisma.warehouse.findMany({
    orderBy: { name: "asc" },
    include: { items: { select: { quantity: true } } },
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="설정"
        subtitle="시스템 및 운영 설정을 관리합니다"
      />

      <div className="p-6 space-y-5 max-w-2xl">

        <SectionCard title="일반 설정">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-foreground mb-1.5">시스템 이름</label>
              <input
                type="text"
                defaultValue="PartsFlow"
                readOnly
                className="w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-foreground mb-1.5">기본 통화</label>
              <input
                type="text"
                defaultValue="KRW (₩)"
                readOnly
                className="w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-foreground mb-1.5">타임존</label>
              <input
                type="text"
                defaultValue="Asia/Seoul (UTC+9)"
                readOnly
                className="w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="창고 설정" subtitle="등록된 창고 목록">
          <ul className="space-y-3">
            {warehouses.map((w) => {
              const totalQty = w.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <li key={w.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{w.name}</p>
                    <p className="text-[11px] text-muted-foreground">{w.location}{w.zone ? ` · 구역 ${w.zone}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold tabular-nums text-foreground">{totalQty}</p>
                    <p className="text-[10px] text-muted-foreground">units</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title="사용자 관리" subtitle="계정 및 역할을 관리합니다 (ADMIN 전용)">
          <Link
            href="/dashboard/settings/users"
            className="flex items-center gap-3 rounded-md border border-border px-4 py-3 hover:bg-muted/40 transition-colors"
          >
            <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-foreground">사용자 목록 및 역할 관리</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">계정 생성·수정·삭제, ADMIN / OPERATOR / VIEWER 역할 부여</p>
            </div>
            <span className="text-[11px] text-muted-foreground">→</span>
          </Link>
        </SectionCard>

        <div id="password">
          <SectionCard title="계정 설정" subtitle="비밀번호를 변경합니다">
            <ChangePasswordForm />
          </SectionCard>
        </div>

        <SectionCard title="알림 설정">
          <div className="space-y-3">
            {[
              { label: "안전재고 미만 알림",       enabled: true  },
              { label: "출고 지연 알림",            enabled: true  },
              { label: "긴급 출고 요청 알림",       enabled: true  },
              { label: "일일 재고 현황 리포트",     enabled: false },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <p className="text-[13px] font-semibold text-foreground">{setting.label}</p>
                <div className={`h-5 w-9 rounded-full transition-colors ${setting.enabled ? "bg-blue-600" : "bg-muted"}`}>
                  <div className={`m-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${setting.enabled ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
