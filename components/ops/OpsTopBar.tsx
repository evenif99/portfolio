"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface OpsTopBarProps {
  systemId?: string
  className?: string
  showAdminLink?: boolean
}

export function OpsTopBar({ systemId = "OPS-01", className, showAdminLink = true }: OpsTopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-11 items-center justify-between border-b border-border bg-card px-4 text-xs",
        className
      )}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded bg-primary flex items-center justify-center">
            <span className="text-[9px] font-black text-primary-foreground leading-none">OC</span>
          </div>
          <span className="font-semibold text-foreground tracking-tight">OpsConsole</span>
        </div>
        <span className="text-border">|</span>
        <span className="font-mono text-[11px] text-muted-foreground">{systemId}</span>
        <span className="rounded-sm bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 ring-1 ring-inset ring-teal-200">
          Public
        </span>
      </div>

      {/* Right: Nav */}
      <nav className="flex items-center gap-4">
        <span className="hidden text-muted-foreground sm:inline">Operations Portal</span>
        {showAdminLink && (
          <Link
            href="/login"
            className="rounded bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Admin Login
          </Link>
        )}
      </nav>
    </header>
  )
}
