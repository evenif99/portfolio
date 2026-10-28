"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type ProjectCardMotionProps = {
  children: ReactNode;
  className?: string;
};

const LIFT_Y = -8;
const IMAGE_SCALE = 1.06;
const DURATION = 0.3;
const EASE = "power2.out";

export default function ProjectCardMotion({
  children,
  className,
}: ProjectCardMotionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (el === null) return;

      const mm = gsap.matchMedia();
      mm.add(
        "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
        () => {
          const inner = el.firstElementChild;
          if (!(inner instanceof HTMLElement)) return;
          const image = el.querySelector<HTMLElement>("[data-card-image]");

          let hovered = false;
          let focused = false;

          const move = (y: number, scale: number) => {
            gsap.to(inner, {
              y,
              duration: DURATION,
              ease: EASE,
              overwrite: "auto",
            });
            if (image !== null) {
              gsap.to(image, {
                scale,
                duration: DURATION,
                ease: EASE,
                overwrite: "auto",
              });
            }
          };

          const sync = () => {
            if (hovered || focused) {
              move(LIFT_Y, IMAGE_SCALE);
            } else {
              move(0, 1);
            }
          };

          const handleEnter = () => {
            hovered = true;
            sync();
          };

          const handleLeave = () => {
            hovered = false;
            sync();
          };

          const handleFocusIn = (event: FocusEvent) => {
            const target = event.target;
            if (target instanceof Element && target.matches(":focus-visible")) {
              focused = true;
              sync();
            }
          };

          const handleFocusOut = (event: FocusEvent) => {
            const next = event.relatedTarget;
            if (next instanceof Node && el.contains(next)) return;
            focused = false;
            sync();
          };

          el.addEventListener("mouseenter", handleEnter);
          el.addEventListener("mouseleave", handleLeave);
          el.addEventListener("focusin", handleFocusIn);
          el.addEventListener("focusout", handleFocusOut);

          return () => {
            el.removeEventListener("mouseenter", handleEnter);
            el.removeEventListener("mouseleave", handleLeave);
            el.removeEventListener("focusin", handleFocusIn);
            el.removeEventListener("focusout", handleFocusOut);
            hovered = false;
            focused = false;
            const targets = image !== null ? [inner, image] : [inner];
            gsap.killTweensOf(targets);
            gsap.set(targets, { clearProps: "transform" });
          };
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
