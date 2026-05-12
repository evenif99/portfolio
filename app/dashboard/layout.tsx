import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { prisma } from "@/lib/prisma"
import { kstStartOfToday } from "@/lib/datetime"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [alertCount, recentTransactions, todayTxCount] = await Promise.all([
    prisma.lowStockAlert.count({ where: { resolved: false } }),
    prisma.stockTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take:    10,
      include: {
        item: { select: { sku: true, modelName: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.stockTransaction.count({
      where: { createdAt: { gte: kstStartOfToday() } },
    }),
  ])

  return (
    <DashboardShell
      sidebar={<DashboardSidebar />}
      topbar={
        <DashboardTopBar
          alertCount={alertCount}
          recentTransactions={recentTransactions}
          todayTxCount={todayTxCount}
          userName={session.user.name ?? "사용자"}
          userEmail={session.user.email ?? undefined}
        />
      }
    >
      {children}
    </DashboardShell>
  )
}
