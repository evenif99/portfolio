"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import Link from "next/link";
import { Package, BarChart3, Truck, ShieldCheck } from "lucide-react";

const highlights = [
  { icon: Package,    text: "22개 SKU, 597 units 통합 관리" },
  { icon: Truck,      text: "출고 요청부터 배송 완료까지 추적" },
  { icon: BarChart3,  text: "입출고 이력 및 재고 회전율 분석" },
  { icon: ShieldCheck, text: "안전재고 임계값 자동 알림 시스템" },
];

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-border bg-card p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <span className="text-[10px] font-black text-white">PF</span>
          </div>
          <span className="text-base font-bold text-foreground">PartsFlow</span>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">PC 부품 재고 관리 플랫폼</p>
          <h2 className="text-2xl font-bold text-foreground leading-snug">
            입고부터 출고까지,<br />모든 흐름을<br />한 시스템으로.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            GPU, CPU, RAM 등 PC 부품 전 품목의 재고 현황을 실시간으로 파악하고
            출고 흐름을 체계적으로 관리하세요.
          </p>
          <div className="mt-6 space-y-3">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.text} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs text-muted-foreground">{h.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">PartsFlow · PC 부품 재고 관리 시스템</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
              <span className="text-[9px] font-black text-white">PF</span>
            </div>
            <span className="text-sm font-bold text-foreground">PartsFlow</span>
          </div>

          <h1 className="text-xl font-bold text-foreground">계정 만들기</h1>
          <p className="mt-1 text-sm text-muted-foreground">지금 바로 재고 관리를 시작하세요.</p>

          <form action={action} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-foreground mb-1.5">이름</label>
              <input
                id="name" name="name" type="text" required autoComplete="name"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="홍길동"
              />
              {state?.errors?.name && <p className="mt-1 text-xs text-red-500">{state.errors.name[0]}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1.5">이메일</label>
              <input
                id="email" name="email" type="email" required autoComplete="email"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@partsflow.kr"
              />
              {state?.errors?.email && <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-1.5">비밀번호</label>
              <input
                id="password" name="password" type="password" required autoComplete="new-password"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="8자 이상"
              />
              {state?.errors?.password && <p className="mt-1 text-xs text-red-500">{state.errors.password[0]}</p>}
            </div>

            {state?.message && (
              <div className="rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-3 py-2">
                <p className="text-xs text-red-600 dark:text-red-400">{state.message}</p>
              </div>
            )}

            <button
              type="submit" disabled={isPending}
              className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "처리 중..." : "회원가입"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
