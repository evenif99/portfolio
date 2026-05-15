"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── SVG Illustrations ─────────────────────────────────────────────────── */

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background */}
      <rect width="480" height="280" rx="12" fill="#F8FAFC"/>
      {/* Top bar */}
      <rect width="480" height="42" rx="12" fill="#1E293B"/>
      <rect x="0" y="30" width="480" height="12" fill="#1E293B"/>
      <rect x="14" y="11" width="20" height="20" rx="4" fill="#2563EB"/>
      <text x="40" y="25" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif">PartsFlow Dashboard</text>
      <circle cx="450" cy="21" r="7" fill="#2563EB" fillOpacity="0.3"/>
      <circle cx="432" cy="21" r="7" fill="#374151"/>
      {/* KPI row */}
      {[
        { x: 14,  label: "관리 SKU",  val: "22",  color: "#1E293B", bg: "#FFFFFF", border: "#E2E8F0" },
        { x: 134, label: "총 재고",   val: "597", color: "#1E293B", bg: "#FFFFFF", border: "#E2E8F0" },
        { x: 254, label: "오늘 출고", val: "15",  color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
        { x: 374, label: "부족 재고", val: "7",   color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
      ].map((k) => (
        <g key={k.label}>
          <rect x={k.x} y="54" width="106" height="56" rx="8" fill={k.bg} stroke={k.border} strokeWidth="1"/>
          <text x={k.x + 10} y="72" fill="#94A3B8" fontSize="8.5" fontFamily="system-ui, sans-serif">{k.label}</text>
          <text x={k.x + 10} y="95" fill={k.color} fontSize="22" fontWeight="800" fontFamily="system-ui, sans-serif">{k.val}</text>
        </g>
      ))}
      {/* Chart area */}
      <rect x="14" y="122" width="452" height="144" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
      <text x="24" y="140" fill="#94A3B8" fontSize="8.5" fontFamily="system-ui, sans-serif">카테고리별 재고 현황</text>
      {/* Chart bars */}
      {[
        { x: 32,  h: 72, label: "GPU",    fill: "#2563EB" },
        { x: 96,  h: 58, label: "CPU",    fill: "#3B82F6" },
        { x: 160, h: 44, label: "RAM",    fill: "#60A5FA" },
        { x: 224, h: 52, label: "SSD",    fill: "#2563EB" },
        { x: 288, h: 30, label: "HDD",    fill: "#93C5FD" },
        { x: 352, h: 48, label: "MB",     fill: "#3B82F6" },
        { x: 416, h: 22, label: "PSU",    fill: "#BFDBFE" },
      ].map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={248 - b.h} width="40" height={b.h} rx="4" fill={b.fill} fillOpacity="0.2"/>
          <rect x={b.x} y={248 - b.h * 0.45} width="40" height={b.h * 0.45} rx="4" fill={b.fill}/>
          <text x={b.x + 20} y="262" fill="#94A3B8" fontSize="8" textAnchor="middle" fontFamily="system-ui, sans-serif">{b.label}</text>
        </g>
      ))}
      {/* Grid lines */}
      {[150, 180, 210, 240].map((y) => (
        <line key={y} x1="24" y1={y} x2="456" y2={y} stroke="#F1F5F9" strokeWidth="1"/>
      ))}
    </svg>
  );
}

function WarehouseIllustration() {
  return (
    <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="280" rx="12" fill="#F0F9FF"/>
      {/* Roof */}
      <polygon points="240,20 30,90 450,90" fill="#1E293B"/>
      <polygon points="240,20 30,90 450,90" fill="#1E293B"/>
      <rect x="30" y="88" width="420" height="4" fill="#0F172A"/>
      {/* Building walls */}
      <rect x="30" y="90" width="420" height="168" rx="0" fill="#F8FAFC"/>
      <rect x="30" y="90" width="420" height="168" stroke="#E2E8F0" strokeWidth="1.5"/>
      {/* Door */}
      <rect x="200" y="188" width="80" height="70" rx="4" fill="#CBD5E1"/>
      <rect x="200" y="188" width="80" height="70" rx="4" stroke="#94A3B8" strokeWidth="1"/>
      <circle cx="272" cy="224" r="4" fill="#64748B"/>
      {/* Shelves */}
      {[110, 148, 186].map((y) => (
        <g key={y}>
          <rect x="55" y={y} width="120" height="3" rx="1" fill="#94A3B8"/>
          <rect x="315" y={y} width="120" height="3" rx="1" fill="#94A3B8"/>
          {/* Boxes on left shelf */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={60 + i * 36} y={y - 28} width="28" height="26" rx="3" fill={["#DBEAFE","#EFF6FF","#BFDBFE"][i]} stroke={["#93C5FD","#BFDBFE","#60A5FA"][i]} strokeWidth="1"/>
              <line x1={60 + i * 36 + 4} y1={y - 20} x2={60 + i * 36 + 24} y2={y - 20} stroke={["#60A5FA","#93C5FD","#3B82F6"][i]} strokeWidth="1.5"/>
            </g>
          ))}
          {/* Boxes on right shelf */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={320 + i * 36} y={y - 28} width="28" height="26" rx="3" fill={["#EFF6FF","#DBEAFE","#EFF6FF"][i]} stroke={["#BFDBFE","#93C5FD","#BFDBFE"][i]} strokeWidth="1"/>
              <line x1={320 + i * 36 + 4} y1={y - 20} x2={320 + i * 36 + 24} y2={y - 20} stroke={["#93C5FD","#60A5FA","#93C5FD"][i]} strokeWidth="1.5"/>
            </g>
          ))}
          {/* Support poles */}
          <rect x="55" y={y} width="3" height="68" fill="#CBD5E1"/>
          <rect x="172" y={y} width="3" height="68" fill="#CBD5E1"/>
          <rect x="315" y={y} width="3" height="68" fill="#CBD5E1"/>
          <rect x="432" y={y} width="3" height="68" fill="#CBD5E1"/>
        </g>
      ))}
      {/* IN / OUT arrows */}
      <g>
        <rect x="0" y="185" width="36" height="22" rx="4" fill="#DCFCE7"/>
        <text x="18" y="200" fill="#16A34A" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">IN</text>
        <path d="M36 196 L52 196" stroke="#16A34A" strokeWidth="2" strokeDasharray="3 2"/>
        <polygon points="50,192 56,196 50,200" fill="#16A34A"/>
      </g>
      <g>
        <path d="M428 196 L444 196" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 2"/>
        <polygon points="442,192 448,196 442,200" fill="#EF4444"/>
        <rect x="444" y="185" width="36" height="22" rx="4" fill="#FEE2E2"/>
        <text x="462" y="200" fill="#DC2626" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">OUT</text>
      </g>
      {/* "PARTSFLOW WAREHOUSE" label */}
      <rect x="160" y="96" width="160" height="18" rx="3" fill="#1E293B"/>
      <text x="240" y="108" fill="#94A3B8" fontSize="8" fontWeight="600" textAnchor="middle" letterSpacing="2" fontFamily="system-ui, sans-serif">PARTSFLOW WAREHOUSE</text>
    </svg>
  );
}

function ShipmentIllustration() {
  const steps = [
    { label: "요청", sub: "Pending",   x: 48,  done: true  },
    { label: "피킹", sub: "Picking",   x: 160, done: true  },
    { label: "포장", sub: "Packed",    x: 272, active: true },
    { label: "출고", sub: "Shipped",   x: 384, done: false },
  ];
  return (
    <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="280" rx="12" fill="#F8FAFC"/>
      {/* Header */}
      <rect width="480" height="42" rx="12" fill="#1E293B"/>
      <rect x="0" y="30" width="480" height="12" fill="#1E293B"/>
      <text x="24" y="25" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif">출고 요청 추적</text>
      <rect x="380" y="12" width="84" height="18" rx="4" fill="#16A34A" fillOpacity="0.2"/>
      <text x="422" y="24" fill="#4ADE80" fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">● LIVE</text>
      {/* Shipment info card */}
      <rect x="14" y="54" width="452" height="52" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
      <text x="24" y="72" fill="#94A3B8" fontSize="8" fontFamily="system-ui, sans-serif">출고번호</text>
      <text x="24" y="88" fill="#1E293B" fontSize="11" fontWeight="700" fontFamily="monospace, sans-serif">SHP-2025-0047</text>
      <text x="160" y="72" fill="#94A3B8" fontSize="8" fontFamily="system-ui, sans-serif">요청처</text>
      <text x="160" y="88" fill="#1E293B" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">서울 물류센터</text>
      <text x="300" y="72" fill="#94A3B8" fontSize="8" fontFamily="system-ui, sans-serif">우선순위</text>
      <rect x="300" y="78" width="44" height="16" rx="3" fill="#FEF3C7"/>
      <text x="322" y="89" fill="#D97706" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">URGENT</text>
      <text x="380" y="72" fill="#94A3B8" fontSize="8" fontFamily="system-ui, sans-serif">납기</text>
      <text x="380" y="88" fill="#1E293B" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">2025-05-16</text>
      {/* Flow steps */}
      {steps.map((s, i) => (
        <g key={s.label}>
          {/* Connector line */}
          {i < steps.length - 1 && (
            <line
              x1={s.x + 36} y1={130}
              x2={steps[i + 1].x - 36} y2={130}
              stroke={s.done ? "#2563EB" : "#E2E8F0"}
              strokeWidth="2"
              strokeDasharray={s.done ? undefined : "4 3"}
            />
          )}
          {/* Circle */}
          <circle cx={s.x} cy={130} r={s.active ? 22 : 18}
            fill={s.done ? "#2563EB" : s.active ? "#EFF6FF" : "#F1F5F9"}
            stroke={s.done ? "#1D4ED8" : s.active ? "#2563EB" : "#E2E8F0"}
            strokeWidth={s.active ? 2 : 1}
          />
          {s.done ? (
            <path d={`M${s.x - 7},${130} L${s.x - 2},${130 + 6} L${s.x + 8},${130 - 6}`}
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          ) : s.active ? (
            <circle cx={s.x} cy={130} r={6} fill="#2563EB"/>
          ) : (
            <circle cx={s.x} cy={130} r={5} fill="#CBD5E1"/>
          )}
          <text x={s.x} y={165} fill={s.done || s.active ? "#1E293B" : "#94A3B8"}
            fontSize="10" fontWeight={s.active ? "700" : "600"} textAnchor="middle" fontFamily="system-ui, sans-serif">{s.label}</text>
          <text x={s.x} y={178} fill={s.active ? "#2563EB" : "#CBD5E1"}
            fontSize="8" textAnchor="middle" fontFamily="system-ui, sans-serif">{s.sub}</text>
        </g>
      ))}
      {/* Items list */}
      <rect x="14" y="196" width="452" height="72" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
      <text x="24" y="212" fill="#94A3B8" fontSize="8" fontFamily="system-ui, sans-serif">출고 품목</text>
      {[
        { name: "NVIDIA RTX 4070 Super",  qty: "× 2", sku: "GPU-NV-4070S"  },
        { name: "Samsung DDR5 32GB",      qty: "× 4", sku: "RAM-SAM-DDR5"  },
        { name: "SK Hynix P41 1TB NVMe",  qty: "× 2", sku: "SSD-SKH-P41-1T" },
      ].map((item, i) => (
        <g key={item.sku}>
          <text x="24"  y={226 + i * 14} fill="#1E293B" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">{item.name}</text>
          <text x="260" y={226 + i * 14} fill="#94A3B8" fontSize="8" fontFamily="monospace, sans-serif">{item.sku}</text>
          <text x="440" y={226 + i * 14} fill="#2563EB" fontSize="9" fontWeight="700" textAnchor="end" fontFamily="system-ui, sans-serif">{item.qty}</text>
        </g>
      ))}
    </svg>
  );
}

function AlertIllustration() {
  return (
    <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="280" rx="12" fill="#F8FAFC"/>
      {/* Header */}
      <rect width="480" height="42" rx="12" fill="#1E293B"/>
      <rect x="0" y="30" width="480" height="12" fill="#1E293B"/>
      <text x="24" y="25" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif">재고 알림 & 분석</text>
      <rect x="390" y="10" width="76" height="22" rx="4" fill="#EF4444" fillOpacity="0.2"/>
      <text x="428" y="24" fill="#FCA5A5" fontSize="8.5" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">⚠ 7건 알림</text>
      {/* Left: Alert list */}
      <rect x="14" y="54" width="230" height="212" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
      <text x="24" y="72" fill="#94A3B8" fontSize="8.5" fontFamily="system-ui, sans-serif">부족 재고 알림</text>
      {[
        { name: "RTX 4060 Ti",  qty: "2",  max: "10", color: "#EF4444", bg: "#FEF2F2", tag: "품절 임박" },
        { name: "DDR5 32GB",    qty: "1",  max: "8",  color: "#EF4444", bg: "#FEF2F2", tag: "품절 임박" },
        { name: "R9 9900X",     qty: "3",  max: "12", color: "#F59E0B", bg: "#FFFBEB", tag: "부족"     },
        { name: "Z790 Tomahawk", qty: "4", max: "15", color: "#F59E0B", bg: "#FFFBEB", tag: "부족"     },
        { name: "RX 7600",      qty: "5",  max: "18", color: "#F59E0B", bg: "#FFFBEB", tag: "부족"     },
      ].map((a, i) => (
        <g key={a.name}>
          <rect x="20" y={82 + i * 36} width="218" height="30" rx="5" fill={a.bg}/>
          <text x="30" y={100 + i * 36} fill="#1E293B" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">{a.name}</text>
          <rect x="168" y={86 + i * 36} width="40" height="14" rx="3" fill={a.color} fillOpacity="0.15"/>
          <text x="188" y={96 + i * 36} fill={a.color} fontSize="7.5" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">{a.tag}</text>
          <text x="30" y={108 + i * 36} fill="#94A3B8" fontSize="7.5" fontFamily="system-ui, sans-serif">잔여 {a.qty}개 / 안전재고 {a.max}개</text>
        </g>
      ))}
      {/* Right top: Push notification card */}
      <rect x="256" y="54" width="210" height="80" rx="8" fill="#1E293B" stroke="#334155" strokeWidth="1"/>
      <circle cx="276" cy="82" r="12" fill="#2563EB"/>
      <text x="276" y="86" fill="white" fontSize="12" textAnchor="middle" fontFamily="system-ui, sans-serif">🔔</text>
      <text x="296" y="76" fill="white" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">PartsFlow 알림</text>
      <text x="296" y="90" fill="#94A3B8" fontSize="8" fontFamily="system-ui, sans-serif">RTX 4060 Ti 재고 부족</text>
      <text x="296" y="103" fill="#64748B" fontSize="7.5" fontFamily="system-ui, sans-serif">안전재고 미만 — 발주 필요</text>
      <text x="448" y="70" fill="#64748B" fontSize="7.5" textAnchor="end" fontFamily="system-ui, sans-serif">방금</text>
      {/* Right bottom: mini donut / stat */}
      <rect x="256" y="146" width="210" height="120" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
      <text x="266" y="164" fill="#94A3B8" fontSize="8.5" fontFamily="system-ui, sans-serif">재고 상태 분포</text>
      <circle cx="330" cy="210" r="46" fill="none" stroke="#E2E8F0" strokeWidth="18"/>
      <circle cx="330" cy="210" r="46" fill="none" stroke="#2563EB" strokeWidth="18"
        strokeDasharray="144 145" strokeDashoffset="36" strokeLinecap="round"/>
      <circle cx="330" cy="210" r="46" fill="none" stroke="#F59E0B" strokeWidth="18"
        strokeDasharray="50 239" strokeDashoffset="-108" strokeLinecap="round"/>
      <circle cx="330" cy="210" r="46" fill="none" stroke="#EF4444" strokeWidth="18"
        strokeDasharray="35 254" strokeDashoffset="-158" strokeLinecap="round"/>
      <text x="330" y="205" fill="#1E293B" fontSize="14" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">86%</text>
      <text x="330" y="219" fill="#94A3B8" fontSize="7.5" textAnchor="middle" fontFamily="system-ui, sans-serif">정상</text>
      {[
        { color: "#2563EB", label: "정상", x: 392 },
        { color: "#F59E0B", label: "부족", x: 392 },
        { color: "#EF4444", label: "품절", x: 392 },
      ].map((leg, i) => (
        <g key={leg.label}>
          <circle cx={leg.x} cy={180 + i * 16} r={4} fill={leg.color}/>
          <text x={leg.x + 8} y={184 + i * 16} fill="#64748B" fontSize="8" fontFamily="system-ui, sans-serif">{leg.label}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Slide data ─────────────────────────────────────────────────────────── */
const slides = [
  {
    title: "실시간 재고 현황 대시보드",
    subtitle: "모든 SKU·수량·카테고리를 한눈에 파악",
    illustration: <DashboardIllustration />,
  },
  {
    title: "스마트 창고 관리",
    subtitle: "입고·보관·출고 전 과정을 체계적으로 추적",
    illustration: <WarehouseIllustration />,
  },
  {
    title: "출고 요청 워크플로우",
    subtitle: "요청부터 배송까지 5단계 상태를 실시간 추적",
    illustration: <ShipmentIllustration />,
  },
  {
    title: "재고 알림 & 분석 시스템",
    subtitle: "부족 재고 자동 감지 및 푸시 알림으로 즉각 대응",
    illustration: <AlertIllustration />,
  },
];

/* ── Component ──────────────────────────────────────────────────────────── */
export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide frame */}
      <div className="relative overflow-hidden rounded-xl border border-border shadow-md bg-card">
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.title} className="min-w-full p-3 sm:p-4">
              <div className="overflow-hidden rounded-lg">{slide.illustration}</div>
            </div>
          ))}
        </div>

        {/* Prev / Next */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 border border-border shadow-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors backdrop-blur-sm"
          aria-label="이전"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 border border-border shadow-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors backdrop-blur-sm"
          aria-label="다음"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Caption + dots */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{slides[current].title}</p>
          <p className="text-xs text-muted-foreground truncate">{slides[current].subtitle}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5 ml-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current
                  ? "w-5 h-2 bg-blue-600"
                  : "w-2 h-2 bg-border hover:bg-muted-foreground"
              )}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
