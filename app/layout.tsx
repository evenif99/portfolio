import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsConsole — Operations Management Portal",
  description: "Internal operations dashboard for project queue management, delivery tracking, and system monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          {process.env.NODE_ENV === "production" && <Analytics />}
        </Providers>
      </body>
    </html>
  );
}
