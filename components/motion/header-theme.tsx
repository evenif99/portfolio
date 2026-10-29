"use client";

// reduced-motion 에서도 비활성화하지 않음: 색의 즉시 전환은 모션이 아니라 상태 변경이기 때문.
// (기본 조건은 항상 참이고, 스냅 조건은 기준점만 바꾼다.)
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const DEFAULT_THEME = "light";

// 스냅 모드 조건: tablet 이상 + app/globals.css 의 @custom-variant slide 와 같은 조건.
// 조건을 바꾸면 globals.css 도 함께 수정한다.
const SNAP_QUERY =
  "(min-width: 48rem) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-height: 45rem)";

// 스냅·AnchorScroll 정지 위치(섹션 top 이 scroll-mt-16 = 64px)에서
// 해당 섹션이 활성이 되도록 헤더 하단 기준에 허용 오차를 더한다. 스냅 모드에서만 사용.
const SNAP_TOLERANCE = 2;

export default function HeaderTheme() {
  useGSAP(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const sections = gsap.utils.toArray<HTMLElement>("main > section");
    if (header === null || sections.length === 0) return;

    const themeOf = (section: HTMLElement): string =>
      section.dataset.theme ?? DEFAULT_THEME;

    const setTheme = (theme: string) => {
      if (header.dataset.theme !== theme) header.dataset.theme = theme;
    };

    const mm = gsap.matchMedia();
    mm.add({ snap: SNAP_QUERY, base: "(min-width: 0px)" }, (context) => {
      // 스냅 모드: 헤더 하단 + 허용 오차(약 67px), 그 외: 헤더 높이의 절반(이전 기준)
      const snap = context.conditions?.snap === true;
      const offset = () =>
        snap ? header.offsetHeight + SNAP_TOLERANCE : header.offsetHeight / 2;

      const triggers: ScrollTrigger[] = [];

      // 생성 루프 중 onRefresh 가 불완전한 triggers 로 apply() 하지 않도록 하는 가드
      let ready = false;

      // 활성 구간이 있으면 그 섹션 테마, 없으면 start 가 scrollY 이하인 마지막 섹션(없으면 첫 섹션).
      // trigger.start 는 refresh 후 최신 스크롤 px 값이며 기준점이 이미 반영돼 있어 그대로 비교한다.
      const apply = () => {
        if (!ready) return;
        const index = triggers.findIndex((trigger) => trigger.isActive);
        if (index !== -1) {
          setTheme(themeOf(sections[index]));
          return;
        }
        const scrollY = window.scrollY;
        let fallback = 0;
        triggers.forEach((trigger, i) => {
          if (trigger.start <= scrollY) fallback = i;
        });
        setTheme(themeOf(sections[fallback]));
      };

      sections.forEach((section) => {
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: () => `top ${offset()}px`,
          end: () => `bottom ${offset()}px`,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            if (self.isActive) setTheme(themeOf(section));
          },
          onRefresh: apply,
        });
        triggers.push(trigger);
      });

      ready = true;
      apply();

      return () => {
        header.dataset.theme = DEFAULT_THEME;
      };
    });

    return () => mm.revert();
  });

  return null;
}
