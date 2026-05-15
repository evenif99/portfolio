"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ArrowLeftRight, Truck,
  Tag, Building2, Handshake, BarChart3, Settings, ExternalLink, ShoppingCart, BellRing,
} from "lucide-react";
import { canAdmin } from "@/lib/rbac";

export function DashboardSidebar({ role }: { role?: string }) {
  const pathname = usePathname();

  const navGroups = [
    {
      label: "운영",
      items: [
        { href: "/dashboard",                  label: "대시보드",    icon: LayoutDashboard },
        { href: "/dashboard/inventory",        label: "재고 관리",   icon: Package         },
        { href: "/dashboard/transactions",     label: "입출고 이력", icon: ArrowLeftRight  },
        { href: "/dashboard/shipments",        label: "출고 요청",   icon: Truck           },
        { href: "/dashboard/purchase-orders",  label: "발주 관리",   icon: ShoppingCart    },
        { href: "/dashboard/alerts",           label: "재고 알림",   icon: BellRing        },
      ],
    },
    {
      label: "분류",
      items: [
        { href: "/dashboard/categories", label: "카테고리",  icon: Tag       },
        { href: "/dashboard/brands",     label: "브랜드",    icon: Building2 },
        { href: "/dashboard/suppliers",  label: "공급업체",  icon: Handshake },
      ],
    },
    {
      label: "분석 / 설정",
      items: [
        { href: "/dashboard/analytics", label: "분석",        icon: BarChart3    },
        ...(canAdmin(role) ? [{ href: "/dashboard/settings", label: "설정", icon: Settings }] : []),
        { href: "/",                    label: "공개 페이지", icon: ExternalLink },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0">
      {/* Brand */}
      <div className="flex h-12 flex-shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
          <span className="text-[9px] font-black tracking-tight text-white">PF</span>
        </div>
        <div className="leading-none">
          <p className="text-[13px] font-bold tracking-tight text-sidebar-foreground">PartsFlow</p>
          <p className="text-[9px] font-medium text-sidebar-foreground/40 uppercase tracking-widest">재고 관리</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="mb-1 mt-3 first:mt-1 px-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/35">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors mb-0.5",
                    active
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[10px] text-sidebar-foreground/35">PartsFlow v1.0.0</p>
      </div>
    </aside>
  );
}
