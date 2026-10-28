"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

// 뷰포트 높이 대비 시작 비율 (scrollTrigger start 와 초기 가시성 판정이 공유)
const START_RATIO = 0.85;

export default function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (el === null) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 이미 뷰포트 안이면 정적 상태 유지 (초기 숨김 적용 안 함)
        if (el.getBoundingClientRect().top < window.innerHeight * START_RATIO) {
          return;
        }

        const tween = gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: `top ${START_RATIO * 100}%`,
            once: true,
          },
        });

        // 숨겨진 상태에서 키보드 포커스가 들어오면 즉시 표시
        const handleFocusIn = () => {
          tween.progress(1);
          // 완료된 트윈은 유지하고 ScrollTrigger만 제거
          tween.scrollTrigger?.kill(false, true);
        };
        el.addEventListener("focusin", handleFocusIn);

        return () => {
          el.removeEventListener("focusin", handleFocusIn);
        };
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
