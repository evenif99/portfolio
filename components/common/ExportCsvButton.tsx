"use client";

import { Download } from "lucide-react";

interface ExportCsvButtonProps {
  href: string;
  label?: string;
}

export function ExportCsvButton({ href, label = "CSV 내보내기" }: ExportCsvButtonProps) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}
