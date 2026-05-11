import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
