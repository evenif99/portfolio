"use client";

import { gsap, useGSAP } from "@/lib/gsap";

// 이동 속도(px/s)와 지속 시간 상/하한(초). ease 는 기존 모션(reveal)과 동일.
const SPEED = 2000;
const MIN_DURATION = 0.6;
const MAX_DURATION = 1.4;
const EASE = "power2.out";

// 사용자가 스크롤에 개입했다고 보는 입력
const INTERRUPT_EVENTS = [
  "wheel",
  "touchstart",
  "pointerdown",
  "keydown",
] as const;

// keydown 중 스크롤을 일으키는 키만 개입으로 취급
const SCROLL_KEYS: ReadonlySet<string> = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

export default function AnchorScroll() {
  useGSAP(() => {
    const nav = document.querySelector<HTMLElement>("[data-site-header] nav");
    if (nav === null) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let tween: gsap.core.Tween | null = null;

      // 이동 중에는 CSS 스냅이 매 프레임 scrollTo 를 가로채지 않도록 인라인으로 해제하고,
      // 종료 경로(완료, 트윈 중단, 사용자 개입, 정리)는 모두 stopWatching 을 거쳐 복원한다.
      const stopWatching = () => {
        INTERRUPT_EVENTS.forEach((type) =>
          window.removeEventListener(type, handleInterrupt),
        );
        document.documentElement.style.removeProperty("scroll-snap-type");
      };

      function handleInterrupt(event: Event) {
        if (event instanceof KeyboardEvent && !SCROLL_KEYS.has(event.key)) {
          return;
        }
        tween?.kill();
        stopWatching();
      }

      const handleClick = (event: MouseEvent) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
        if (link === null || !nav.contains(link)) return;

        const hash = link.getAttribute("href") ?? "";
        if (hash.length <= 1) return;
        let id: string;
        try {
          id = decodeURIComponent(hash.slice(1));
        } catch {
          return;
        }
        const target = document.getElementById(id);
        if (target === null) return;

        event.preventDefault();

        const header = document.querySelector<HTMLElement>("[data-site-header]");
        // 스냅 정지 위치와 같도록 섹션의 scroll-margin-top(scroll-mt-16 = 64px)을 오프셋으로 쓴다.
        const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop);
        const offset = margin > 0 ? margin : (header?.offsetHeight ?? 0);
        const top = Math.max(
          0,
          target.getBoundingClientRect().top + window.scrollY - offset,
        );
        const distance = Math.abs(top - window.scrollY);
        const duration = gsap.utils.clamp(
          MIN_DURATION,
          MAX_DURATION,
          distance / SPEED,
        );

        tween?.kill();
        stopWatching();

        if (window.location.hash !== hash) {
          history.pushState(null, "", hash);
        }

        INTERRUPT_EVENTS.forEach((type) =>
          window.addEventListener(type, handleInterrupt, { passive: true }),
        );
        // 스냅이 꺼진 환경(모바일, 터치, 낮은 화면)에서는 건드리지 않는다.
        // 이전 이동의 인라인 해제는 위의 stopWatching 에서 이미 복원된 뒤라 계산값이 정확하다.
        const root = document.documentElement;
        if (getComputedStyle(root).scrollSnapType !== "none") {
          root.style.scrollSnapType = "none";
        }

        tween = gsap.to(window, {
          scrollTo: { y: top, autoKill: false },
          duration,
          ease: EASE,
          onComplete: () => {
            stopWatching();
            if (!target.hasAttribute("tabindex")) {
              target.setAttribute("tabindex", "-1");
            }
            target.focus({ preventScroll: true });
          },
          onInterrupt: stopWatching,
        });
      };

      nav.addEventListener("click", handleClick);

      return () => {
        nav.removeEventListener("click", handleClick);
        stopWatching();
        tween?.kill();
      };
    });
  });

  return null;
}
