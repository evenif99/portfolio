import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.subset.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "백종우 | 풀스택 개발자 포트폴리오";
const SITE_DESCRIPTION =
  "프론트엔드를 기반으로 API 연동과 서비스 구현까지 직접 다루는 풀스택 개발자 백종우. React, Next.js, TypeScript로 만든 프로젝트를 소개합니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-rho-snowy-63.vercel.app"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${pretendard.variable} h-full antialiased tablet:slide:snap-y tablet:slide:snap-mandatory`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
