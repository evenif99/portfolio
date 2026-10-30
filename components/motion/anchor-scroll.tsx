"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { SLIDE_QUERY } from "@/lib/slide-query";

// 이동 속도(px/s)와 지속 시간 상/하한(초). ease 는 기존 모션(reveal)과 동일.
const SPEED = 2000;
const MIN_DURATION = 0.6;
const MAX_DURATION = 1.4;
const EASE = "power2.out";

// 책 탭 전용(홈 헤더 nav 상수와 별개). 책 모드에서만 적용, duration = clamp(0.9, 1.6, 거리 / 2000).
const BOOK_SPEED = 2000;
const BOOK_MIN_DURATION = 0.9;
const BOOK_MAX_DURATION = 1.6;
const BOOK_EASE = "power2.inOut";
// 이미 해당 펼침이라고 보는 스크롤 위치 오차(px)
const BOOK_SAME_TOLERANCE = 2;
// 이동 중 aria-current 를 도착 대상으로 고정하기 위한 표식과 종료 알림 이벤트(BookScroll 이 읽는다)
const BOOK_TRAVEL_ATTR = "data-book-travel";
const BOOK_TRAVEL_END = "book-travel-end";

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
    // 홈 헤더 nav 와 책 라우트 탭(data-book-tabs) 모두 지원. 홈에는 책 탭이 없어 nav 1개로 기존과 동일.
    const navs = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-site-header] nav, [data-book-tabs]",
      ),
    );
    if (navs.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let tween: gsap.core.Tween | null = null;
      let travelNav: HTMLElement | null = null;

      // 이동 중에는 CSS 스냅이 매 프레임 scrollTo 를 가로채지 않도록 인라인으로 해제하고,
      // 종료 경로(완료, 트윈 중단, 사용자 개입, 정리)는 모두 stopWatching 을 거쳐 복원한다.
      const stopWatching = () => {
        INTERRUPT_EVENTS.forEach((type) =>
          window.removeEventListener(type, handleInterrupt),
        );
        document.documentElement.style.removeProperty("scroll-snap-type");
        if (travelNav !== null) {
          const done = travelNav;
          travelNav = null;
          done.removeAttribute(BOOK_TRAVEL_ATTR);
          done.dispatchEvent(new Event(BOOK_TRAVEL_END));
        }
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
        const nav = event.currentTarget;
        if (
          link === null ||
          !(nav instanceof HTMLElement) ||
          !nav.contains(link)
        ) {
          return;
        }
        // 책 탭은 책 모드(SLIDE_QUERY)에서만 트윈으로 이동하고, 그 외(좁은 화면 등)는 즉시 이동한다.
        const isBookTab = nav.hasAttribute("data-book-tabs");
        const bookTravel = isBookTab && window.matchMedia(SLIDE_QUERY).matches;

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
        // 이미 해당 펼침이면 이동하지 않는다(기본 해시 이동은 위에서 막았다).
        if (bookTravel && distance <= BOOK_SAME_TOLERANCE) return;
        let duration: number;
        if (bookTravel) {
          duration = gsap.utils.clamp(
            BOOK_MIN_DURATION,
            BOOK_MAX_DURATION,
            distance / BOOK_SPEED,
          );
        } else if (isBookTab) {
          duration = 0;
        } else {
          duration = gsap.utils.clamp(MIN_DURATION, MAX_DURATION, distance / SPEED);
        }

        tween?.kill();
        stopWatching();
        if (bookTravel) {
          travelNav = nav;
          nav.setAttribute(BOOK_TRAVEL_ATTR, hash);
        }

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
          ease: bookTravel ? BOOK_EASE : EASE,
          onComplete: () => {
            stopWatching();
            // aria-hidden 요소(책 스냅 앵커)에는 포커스를 두지 않는다.
            if (target.getAttribute("aria-hidden") === "true") return;
            if (!target.hasAttribute("tabindex")) {
              target.setAttribute("tabindex", "-1");
            }
            target.focus({ preventScroll: true });
          },
          onInterrupt: stopWatching,
        });
      };

      navs.forEach((nav) => nav.addEventListener("click", handleClick));

      return () => {
        navs.forEach((nav) => nav.removeEventListener("click", handleClick));
        stopWatching();
        tween?.kill();
      };
    });
  });

  return null;
}
