"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { SLIDE_QUERY } from "@/lib/slide-query";

// 진행도 0~0.5 표지 넘김(트랙 500svh, 스크롤 거리 400svh, 단계당 200svh) + 책 중앙 이동, 0.5~1 두 번째 장 넘김. 스냅 앵커는 0 / 0.5 / 1.
const CURRENT_FROM_INTRO = 0.25;
const CURRENT_FROM_SKILLS = 0.75;

export default function BookScroll() {
  useGSAP(() => {
    const track = document.querySelector<HTMLElement>("[data-book-track]");
    const book = document.querySelector<HTMLElement>("[data-book-body]");
    const cover = document.querySelector<HTMLElement>('[data-book-leaf="cover"]');
    const second = document.querySelector<HTMLElement>('[data-book-leaf="second"]');
    const bar = document.querySelector<HTMLElement>("[data-book-bar]");
    const progress = document.querySelector<HTMLElement>("[data-book-progress]");
    const tabs = document.querySelector<HTMLElement>("[data-book-tabs]");
    if (
      track === null ||
      book === null ||
      cover === null ||
      second === null ||
      bar === null ||
      progress === null ||
      tabs === null
    ) {
      return;
    }
    const coverShade = cover.querySelector<HTMLElement>("[data-book-shade]");
    const secondShade = second.querySelector<HTMLElement>("[data-book-shade]");
    const introTab = tabs.querySelector<HTMLAnchorElement>('a[href="#book-intro"]');
    const skillsTab = tabs.querySelector<HTMLAnchorElement>('a[href="#book-skills"]');
    const animated = [book, cover, second, bar];

    // slide 조건에 prefers-reduced-motion: no-preference 가 포함돼 있으므로
    // reduced-motion 이면 이 콜백이 실행되지 않아 타임라인이 만들어지지 않는다(별도 분기 불필요).
    const mm = gsap.matchMedia();
    mm.add(SLIDE_QUERY, () => {
      let now = -1;
      let current: HTMLAnchorElement | null = null;
      let latest = 0;

      // 상태 표시는 React state 없이 DOM 속성으로 직접 갱신한다.
      const sync = (ratio: number) => {
        latest = ratio;
        const value = Math.round(ratio * 100);
        if (value !== now) {
          now = value;
          progress.setAttribute("aria-valuenow", String(value));
        }
        // 탭 이동 중에는 중간 탭을 거치지 않도록 도착 대상으로 고정한다(AnchorScroll 이 표식을 건다).
        const travel = tabs.getAttribute("data-book-travel");
        const next =
          travel === "#book-skills"
            ? skillsTab
            : travel === "#book-intro"
              ? introTab
              : ratio >= CURRENT_FROM_SKILLS
                ? skillsTab
                : ratio >= CURRENT_FROM_INTRO
                  ? introTab
                  : null;
        if (next === current) return;
        current?.removeAttribute("aria-current");
        next?.setAttribute("aria-current", "location");
        current = next;
      };

      const setWillChange = (on: boolean) => {
        animated.forEach((element) => {
          if (on) element.style.willChange = "transform";
          else element.style.removeProperty("will-change");
        });
      };

      // scrub 은 트랙 진행도를 읽기만 한다(pin, snap 옵션 없음).
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onToggle: (self) => setWillChange(self.isActive),
          onUpdate: (self) => sync(self.progress),
        },
      });
      const flip = { rotationY: -180, duration: 1, ease: "power1.inOut" };
      timeline
        .fromTo(book, { xPercent: -25, x: 0 }, { xPercent: 0, x: 0, duration: 1 }, 0)
        .fromTo(cover, { rotationY: 0 }, flip, 0)
        .fromTo(second, { rotationY: 0 }, flip, 1)
        .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 2 }, 0);
      // 그림자 변화는 별도 레이어의 opacity 로만 처리
      if (coverShade !== null) {
        timeline.fromTo(coverShade, { opacity: 1 }, { opacity: 0, duration: 1 }, 0);
      }
      if (secondShade !== null) {
        timeline.fromTo(secondShade, { opacity: 1 }, { opacity: 0, duration: 1 }, 1);
      }
      sync(timeline.scrollTrigger?.progress ?? 0);

      // 이동이 끝나거나 중단되면 실제 진행도로 다시 맞춘다.
      const resync = () => sync(latest);
      tabs.addEventListener("book-travel-end", resync);

      return () => {
        tabs.removeEventListener("book-travel-end", resync);
        setWillChange(false);
        current?.removeAttribute("aria-current");
        progress.setAttribute("aria-valuenow", "0");
      };
    });

    return () => mm.revert();
  });

  return null;
}
