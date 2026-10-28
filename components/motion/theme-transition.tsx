"use client";

import { gsap, useGSAP } from "@/lib/gsap";

const SCRUB_START = "top bottom";
const SCRUB_END = "top 60%";
const TEXT_SWITCH_PROGRESS = 0.5;
const DEFAULT_THEME = "light";

export default function ThemeTransition() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const sections = gsap.utils.toArray<HTMLElement>("main > section");
      const targets: { layer: HTMLElement; content: HTMLElement }[] = [];

      sections.forEach((section, index) => {
        if (index === 0) return;
        const prevSection = sections[index - 1];
        const own = section.dataset.theme ?? DEFAULT_THEME;
        const prev = prevSection.dataset.theme ?? DEFAULT_THEME;
        if (own === prev) return;

        const layer = section.querySelector<HTMLElement>("[data-theme-layer]");
        const content = section.querySelector<HTMLElement>(
          "[data-theme-content]",
        );
        if (layer === null || content === null) return;

        targets.push({ layer, content });
        layer.dataset.theme = prev;

        let showingPrev: boolean | null = null;
        const applyText = (progress: number) => {
          const wantPrev = progress < TEXT_SWITCH_PROGRESS;
          if (wantPrev === showingPrev) return;
          showingPrev = wantPrev;
          if (wantPrev) {
            content.dataset.theme = prev;
          } else {
            content.removeAttribute("data-theme");
          }
        };

        gsap.fromTo(
          layer,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: SCRUB_START,
              end: `clamp(${SCRUB_END})`,
              scrub: true,
              onUpdate: (self) => applyText(self.progress),
              onRefresh: (self) => applyText(self.progress),
            },
          },
        );
      });

      return () => {
        targets.forEach(({ layer, content }) => {
          layer.removeAttribute("data-theme");
          content.removeAttribute("data-theme");
          gsap.set(layer, { clearProps: "opacity" });
        });
      };
    });

    return () => mm.revert();
  });

  return null;
}
