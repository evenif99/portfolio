import Link from "next/link";
import { ArrowRight, ShieldCheck, LayoutDashboard } from "lucide-react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { FeatureCards } from "@/components/home/FeatureModal";
import { CategoryBrowser, type CategoryData } from "@/components/home/CategoryBrowser";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CATEGORY_META: Record<string, { name: string; desc: string; sub: string }> = {
  gpu:       { name: "GPU",    desc: "그래픽 카드",            sub: "NVIDIA RTX / AMD Radeon"  },
  cpu:       { name: "CPU",    desc: "프로세서",                sub: "Intel Core / AMD Ryzen"   },
  ram:       { name: "RAM",    desc: "메모리",                  sub: "DDR4 / DDR5"              },
  ssd:       { name: "SSD",    desc: "솔리드 스테이트 드라이브", sub: "NVMe PCIe 4.0 / SATA"    },
  hdd:       { name: "HDD",    desc: "하드 디스크 드라이브",     sub: 'SATA 3.5"'               },
  mainboard: { name: "메인보드", desc: "마더보드",               sub: "AM5 / LGA1700"            },
  psu:       { name: "PSU",    desc: "파워 서플라이",            sub: "80+ Gold / Platinum"      },
  case:      { name: "케이스",  desc: "컴퓨터 케이스",           sub: "ATX / mATX"               },
  cooler:    { name: "쿨러",    desc: "CPU 쿨러",               sub: "공랭 / 수랭"               },
};

const SLUG_ORDER = ["gpu", "cpu", "ram", "ssd", "hdd", "mainboard", "psu", "case", "cooler"];

function buildSpec(specs: unknown): string {
  if (!specs || typeof specs !== "object") return "";
  return Object.values(specs as Record<string, string>).slice(0, 3).join(" · ");
}


export default async function HomePage() {
  const [session, rawCategories] = await Promise.all([
    auth(),
    prisma.category.findMany({
      include: {
        items: {
          select: { id: true, name: true, imageUrl: true, specs: true, quantity: true, safetyStock: true, status: true },
          orderBy: [{ imageUrl: "asc" }, { name: "asc" }],
        },
      },
    }),
  ]);

  const isLoggedIn = !!session?.user;
  const userName = session?.user?.name;
  const initial = userName?.charAt(0).toUpperCase();

  const categoriesData: CategoryData[] = SLUG_ORDER
    .map((slug) => {
      const cat = rawCategories.find((c) => c.slug === slug);
      const meta = CATEGORY_META[slug];
      if (!cat || !meta) return null;
      return {
        slug,
        name: meta.name,
        desc: meta.desc,
        sub: meta.sub,
        products: cat.items.map((item) => ({
          id: item.id,
          name: item.name,
          spec: buildSpec(item.specs),
          img: item.imageUrl,
        })),
      };
    })
    .filter((c) => c !== null) as CategoryData[];

  const allItems = rawCategories.flatMap((c) => c.items);
  const totalSku = allItems.length;
  const totalQty = allItems.reduce((s, i) => s + i.quantity, 0);
  const lowStockCount = allItems.filter((i) => i.quantity > 0 && i.quantity <= i.safetyStock).length;
  const outOfStockCount = allItems.filter((i) => i.status === "OUT_OF_STOCK").length;

  const metrics = [
    { label: "관리 SKU",  value: String(totalSku),                  sub: "품목"  },
    { label: "총 재고",   value: totalQty.toLocaleString("ko-KR"),   sub: "units" },
    { label: "품절 품목", value: String(outOfStockCount),            sub: "건"    },
    { label: "부족 재고", value: String(lowStockCount),              sub: "품목", alert: true },
  ];

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
            {isLoggedIn ? (
              <>
                {/* 로그인 상태 */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {initial}
                  </div>
                  <span>{userName}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  대시보드
                </Link>
              </>
            ) : (
              <>
                {/* 미로그인 상태 */}
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  로그인
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  대시보드
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-screen-xl px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left: text */}
            <div className="max-w-xl">
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
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    대시보드로 이동
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      대시보드 시작하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      로그인
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right: slider */}
            <div className="w-full">
              <HeroSlider />
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
          <h2 className="mt-1.5 mb-2 text-xl font-bold text-foreground">재고 운영에 필요한 모든 것</h2>
          <p className="mb-8 text-sm text-muted-foreground">각 기능 카드를 클릭하면 상세 설명을 확인할 수 있습니다.</p>
          <FeatureCards />
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-screen-xl px-6 py-14">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">취급 품목</p>
          <h2 className="mt-1.5 mb-2 text-xl font-bold text-foreground">PC 부품 전 카테고리 관리</h2>
          <p className="mb-8 text-sm text-muted-foreground">탭을 선택해 카테고리별 취급 부품과 상세 스펙을 확인하세요.</p>
          <CategoryBrowser categories={categoriesData} />
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-screen-xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 p-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-bold text-foreground">
                  {isLoggedIn ? `${userName}님, 환영합니다` : "지금 바로 시작하세요"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoggedIn
                  ? "대시보드에서 실시간 재고 현황과 출고 요청을 확인하세요."
                  : "창고 재고부터 출고 요청까지, 모든 부품 흐름을 단일 시스템으로 통합하세요."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  대시보드로 이동
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                    무료로 시작하기
                  </Link>
                  <Link href="/dashboard" className="rounded-md border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                    데모 보기
                  </Link>
                </>
              )}
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
