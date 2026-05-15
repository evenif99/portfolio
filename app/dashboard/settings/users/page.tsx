import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAdmin, ROLE_LABELS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/common/SectionCard";
import { UserCreateModal } from "@/components/settings/UserCreateModal";
import { UserEditRow } from "@/components/settings/UserEditRow";

export default async function UsersPage() {
  const session = await auth();
  if (!canAdmin(session?.user?.role)) redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { transactions: true, shipments: true, purchaseOrders: true } },
    },
  });

  const currentUserId = Number(session!.user.id);

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card px-6 py-4">
        <Link
          href="/dashboard/settings"
          className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> 설정으로
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">사용자 관리</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">총 {users.length}명</p>
          </div>
          <UserCreateModal />
        </div>
      </div>

      <div className="p-6">
        <SectionCard title="사용자 목록" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">이름 / 이메일</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">역할</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">이력 수</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const total = user._count.transactions + user._count.shipments + user._count.purchaseOrders;
                  const isSelf = user.id === currentUserId;
                  return (
                    <UserEditRow
                      key={user.id}
                      user={{ id: user.id, name: user.name, email: user.email, role: user.role }}
                      totalActivity={total}
                      isSelf={isSelf}
                      roleLabel={ROLE_LABELS[user.role]}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
