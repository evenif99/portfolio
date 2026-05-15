"use client";

import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { PwaBootstrap } from "@/components/pwa/PwaBootstrap";
import { MobileQuickActions } from "@/components/pwa/MobileQuickActions";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PwaBootstrap />
      {children}
      <MobileQuickActions />
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  );
}
