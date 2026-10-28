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

      const stopWatching = () => {
        INTERRUPT_EVENTS.forEach((type) =>
          window.removeEventListener(type, handleInterrupt),
        );
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
        const offset = header?.offsetHeight ?? 0;
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
