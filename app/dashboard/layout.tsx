import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <DashboardShell
      sidebar={<DashboardSidebar role={session.user.role} />}
      topbar={
        <DashboardTopBar
          userName={session.user.name ?? "사용자"}
          userEmail={session.user.email ?? undefined}
        />
      }
    >
      {children}
    </DashboardShell>
  )
}
