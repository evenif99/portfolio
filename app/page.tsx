import Link from "next/link";
import { Package, BarChart3, Truck, AlertTriangle, ArrowRight, ShieldCheck, Layers, Zap } from "lucide-react";

const features = [
  { icon: Package,       title: "실시간 재고 현황",    desc: "SKU별 수량, 창고 위치, 안전재고 임계값을 한 화면에서 실시간으로 파악합니다." },
  { icon: AlertTriangle, title: "재고 부족 알림",      desc: "안전재고 미만 품목을 자동 감지해 즉각적인 발주 의사결정을 지원합니다." },
  { icon: Truck,         title: "출고 요청 관리",      desc: "Pending → Picking → Packed → Shipped의 전체 출고 흐름을 추적합니다." },
  { icon: BarChart3,     title: "입출고 이력 분석",    desc: "품목별 이동 패턴을 분석해 수요 예측 및 재고 최적화에 활용합니다." },
  { icon: Layers,        title: "카테고리 & 브랜드",   desc: "GPU, CPU, RAM, SSD 등 품목군별로 정밀하게 분류하고 필터링합니다." },
  { icon: Zap,           title: "빠른 입출고 처리",    desc: "SKU 검색 → 수량 입력 → 처리 완료까지 3단계 빠른 워크플로우." },
];

const categories = [
  { name: "GPU",      desc: "NVIDIA RTX / AMD Radeon", count: "6종" },
  { name: "CPU",      desc: "Intel Core / AMD Ryzen",  count: "5종" },
  { name: "RAM",      desc: "DDR4 / DDR5",             count: "4종" },
  { name: "SSD",      desc: "NVMe / SATA",             count: "4종" },
  { name: "HDD",      desc: "SATA 3.5\"",              count: "2종" },
  { name: "메인보드", desc: "AM5 / LGA1700",           count: "4종" },
  { name: "PSU",      desc: "Gold / Platinum",         count: "3종" },
  { name: "케이스",   desc: "ATX / mATX",              count: "2종" },
  { name: "쿨러",     desc: "공랭 / 수랭",             count: "2종" },
];

const metrics = [
  { label: "관리 SKU",  value: "22",  sub: "품목"  },
  { label: "총 재고",   value: "597", sub: "units" },
  { label: "금일 출고", value: "15",  sub: "건"    },
  { label: "부족 재고", value: "7",   sub: "품목", alert: true },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
              <span className="text-[9px] font-black text-white">PF</span>
            </div>
            <span className="text-sm font-bold text-foreground">PartsFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">로그인</Link>
            <Link href="/dashboard" className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              대시보드
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-screen-xl px-6 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              PC 부품 물류 재고 관리 시스템
            </div>
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
              재고 가시성, 출고 흐름,<br />경고 알림을 한 화면에서.
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              GPU, CPU, RAM, SSD 등 PC 부품의 입고·출고·재고 현황을 실시간으로 관리합니다.
              안전재고 임계값 설정부터 출고 요청 승인까지, 물류 전 과정을 단일 시스템에서 처리하세요.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                대시보드 시작하기 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                로그인
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-screen-xl px-6 py-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className={`rounded-lg border bg-card px-4 py-4 ${m.alert ? "border-amber-200 dark:border-amber-900" : "border-border"}`}>
                <p className="text-2xl font-bold tabular-nums text-foreground">{m.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.label}</p>
                <p className={`text-[10px] font-semibold mt-1 ${m.alert ? "text-amber-600" : "text-muted-foreground"}`}>{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-screen-xl px-6 py-14">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">주요 기능</p>
          <h2 className="mt-1.5 mb-8 text-xl font-bold text-foreground">재고 운영에 필요한 모든 것</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-lg border border-border bg-card p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-screen-xl px-6 py-14">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">취급 품목</p>
          <h2 className="mt-1.5 mb-8 text-xl font-bold text-foreground">PC 부품 전 카테고리 관리</h2>
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-5 rounded-lg overflow-hidden border border-border">
            {categories.map((c) => (
              <div key={c.name} className="bg-card px-4 py-4 hover:bg-muted/50 transition-colors">
                <p className="text-sm font-bold text-foreground">{c.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{c.desc}</p>
                <p className="mt-2 text-[10px] font-semibold text-blue-600 dark:text-blue-400">{c.count} 관리 중</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-screen-xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 p-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-bold text-foreground">지금 바로 시작하세요</p>
              </div>
              <p className="text-xs text-muted-foreground">창고 재고부터 출고 요청까지, 모든 부품 흐름을 단일 시스템으로 통합하세요.</p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <Link href="/signup" className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">무료로 시작하기</Link>
              <Link href="/dashboard" className="rounded-md border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">데모 보기</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card px-6 py-5">
        <div className="mx-auto max-w-screen-xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600">
              <span className="text-[7px] font-black text-white">PF</span>
            </div>
            <span className="text-xs font-semibold text-foreground">PartsFlow</span>
          </div>
          <p className="text-[11px] text-muted-foreground">PC 부품 재고 및 출고 관리 시스템 · Built with Next.js + Prisma</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-muted-foreground">시스템 정상</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
