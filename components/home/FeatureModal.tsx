"use client";

import { useState, useEffect } from "react";
import {
  Package, AlertTriangle, Truck, BarChart3, Layers, Zap, X,
  CheckCircle2, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Package,
    title: "실시간 재고 현황",
    desc: "SKU별 수량, 창고 위치, 안전재고 임계값을 한 화면에서 실시간으로 파악합니다.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    overview:
      "모든 SKU의 재고 수량, 창고 위치, 안전재고 임계값을 단일 대시보드에서 실시간으로 파악할 수 있습니다. 카테고리·브랜드·창고별 필터링과 강력한 검색 기능으로 수천 개 품목 중에서도 필요한 정보를 즉시 찾아냅니다.",
    highlights: [
      "SKU 기준 수량·창고 위치·상태 일괄 조회",
      "카테고리·브랜드·공급업체별 다중 필터링",
      "안전재고 임계값 품목별 커스텀 설정",
      "CSV / Excel 내보내기 지원",
      "전역 검색(Cmd+K)으로 SKU 즉시 접근",
    ],
    badge: "핵심 기능",
  },
  {
    icon: AlertTriangle,
    title: "재고 부족 알림",
    desc: "안전재고 미만 품목을 자동 감지해 즉각적인 발주 의사결정을 지원합니다.",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    overview:
      "품목의 재고가 설정된 안전재고 임계값 미만으로 떨어지는 순간 자동으로 알림이 생성됩니다. 웹 푸시 알림으로 담당자에게 즉시 전달되며, 대시보드 상단 배지와 알림 센터에서 항상 확인할 수 있습니다.",
    highlights: [
      "안전재고 미만 감지 즉시 알림 자동 생성",
      "웹 푸시 알림으로 실시간 수신 (모바일 포함)",
      "알림 개별 해제 및 일괄 해제 지원",
      "품절(0개) 품목 별도 강조 표시",
      "발주 관리(PO) 생성과 직접 연계 가능",
    ],
    badge: "자동화",
  },
  {
    icon: Truck,
    title: "출고 요청 관리",
    desc: "Pending → Picking → Packed → Shipped의 전체 출고 흐름을 추적합니다.",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    overview:
      "출고 요청 생성부터 최종 배송 완료까지 5단계 상태를 체계적으로 추적·관리합니다. 긴급 출고와 일반 출고를 우선순위로 구분하고, 담당자별 작업 현황을 실시간으로 파악할 수 있습니다.",
    highlights: [
      "5단계 워크플로우: Pending → Picking → Packed → Shipped → Completed",
      "긴급(URGENT) / 일반(NORMAL) 우선순위 구분",
      "요청처·납기일·품목 수량 상세 기록",
      "출고 상태 일괄 업데이트 지원",
      "출고 번호 기반 전체 이력 조회",
    ],
    badge: "워크플로우",
  },
  {
    icon: BarChart3,
    title: "입출고 이력 분석",
    desc: "품목별 이동 패턴을 분석해 수요 예측 및 재고 최적화에 활용합니다.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    overview:
      "모든 입고·출고·조정·반품·이전 이력을 완전한 감사 추적(Audit Trail)으로 보존합니다. 날짜 범위·품목·담당자별 필터링과 월간 분석 리포트로 재고 패턴을 파악하고 최적화 의사결정을 지원합니다.",
    highlights: [
      "5가지 유형 분류: 입고·출고·조정·반품·이전",
      "날짜 범위·품목·담당자·유형 복합 필터",
      "월간 입출고 분석 차트 및 리포트",
      "CSV 내보내기 및 인쇄 기능",
      "담당자·참조번호 기록으로 완전한 추적 가능",
    ],
    badge: "분석",
  },
  {
    icon: Layers,
    title: "카테고리 & 브랜드",
    desc: "GPU, CPU, RAM, SSD 등 품목군별로 정밀하게 분류하고 필터링합니다.",
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    overview:
      "GPU·CPU·RAM·SSD·HDD·메인보드·PSU·케이스·쿨러 9개 카테고리와 브랜드·공급업체 체계로 모든 PC 부품을 정밀하게 분류합니다. 계층적 분류 구조로 품목 탐색 효율을 극대화합니다.",
    highlights: [
      "9개 주요 카테고리 기반 분류 체계",
      "브랜드별, 공급업체별 독립 관리",
      "카테고리·브랜드별 재고 수량 자동 집계",
      "품목 추가 시 카테고리·브랜드 연동",
      "필터 조합으로 원하는 품목 즉시 탐색",
    ],
    badge: "분류 체계",
  },
  {
    icon: Zap,
    title: "빠른 입출고 처리",
    desc: "SKU 검색 → 수량 입력 → 처리 완료까지 3단계 빠른 워크플로우.",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    overview:
      "전역 검색(Cmd+K)으로 SKU를 즉시 찾고, 수량 입력 후 처리까지 3단계 워크플로우로 업무 속도를 극대화합니다. 처리 즉시 재고 수량이 실시간으로 반영되며 모바일과 데스크톱 모두에 최적화되어 있습니다.",
    highlights: [
      "전역 검색(Cmd+K)으로 SKU 즉시 접근",
      "입고·출고·조정·반품 원클릭 처리",
      "참조번호·메모 첨부로 이력 관리",
      "처리 즉시 재고 수량 실시간 반영",
      "모바일·PC 모두 최적화된 터치 친화적 UI",
    ],
    badge: "UX",
  },
];

interface FeatureModalProps {
  open: boolean;
  feature: (typeof features)[number] | null;
  onClose: () => void;
}

function Modal({ open, feature, onClose }: FeatureModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !feature) return null;
  const Icon = feature.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-border p-5">
          <div className={cn("flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg", feature.bg)}>
            <Icon className={cn("h-5 w-5", feature.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", feature.color)}>
                {feature.badge}
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{feature.overview}</p>
          <div>
            <p className="text-xs font-semibold text-foreground mb-2.5">주요 특징</p>
            <ul className="space-y-2">
              {feature.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5">
                  <CheckCircle2 className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", feature.color)} />
                  <span className="text-sm text-foreground">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            닫기
          </button>
          <a
            href="/dashboard"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold text-white transition-colors",
              "bg-blue-600 hover:bg-blue-700"
            )}
          >
            대시보드에서 확인 <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function FeatureCards() {
  const [selected, setSelected] = useState<(typeof features)[number] | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.title}
              onClick={() => setSelected(f)}
              className="group text-left rounded-lg border border-border bg-card p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
            >
              <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-md", f.bg)}>
                <Icon className={cn("h-4 w-4", f.color)} />
              </div>
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              <p className={cn("mt-3 text-[11px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", f.color)}>
                자세히 보기 <ArrowRight className="h-3 w-3" />
              </p>
            </button>
          );
        })}
      </div>

      <Modal open={!!selected} feature={selected} onClose={() => setSelected(null)} />
    </>
  );
}
