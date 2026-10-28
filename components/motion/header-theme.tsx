"use client";

// reduced-motion 에서도 비활성화하지 않음: 색의 즉시 전환은 모션이 아니라 상태 변경이기 때문.
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const DEFAULT_THEME = "light";

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

    const triggers: ScrollTrigger[] = [];

    // 생성 루프 중 onRefresh 가 불완전한 triggers 로 apply() 하지 않도록 하는 가드
    let ready = false;

    // 활성 구간이 있으면 그 섹션 테마, 없으면 start 가 scrollY 이하인 마지막 섹션(없으면 첫 섹션).
    // trigger.start 는 refresh 후 최신 스크롤 px 값이며 헤더 절반 오프셋이 이미 반영돼 있어 그대로 비교한다.
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
        start: () => `top ${header.offsetHeight / 2}px`,
        end: () => `bottom ${header.offsetHeight / 2}px`,
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

  return null;
}
