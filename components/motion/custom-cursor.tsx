"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const HOVER_SCALE = 2;
const SCALE_DURATION = 0.2;
const FADE_DURATION = 0.2;
const INTERACTIVE_SELECTOR =
  "a[href], button:not(:disabled), [role='button'], summary, label, [data-cursor]";

export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (el === null) return;

      const mm = gsap.matchMedia();
      mm.add(
        "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (forced-colors: none)",
        () => {
          gsap.set(el, { xPercent: -50, yPercent: -50 });
          const quickX = gsap.quickTo(el, "x", { duration: 0.2, ease: "power3" });
          const quickY = gsap.quickTo(el, "y", { duration: 0.2, ease: "power3" });

          let placed = false;

          const fade = (opacity: number) => {
            gsap.to(el, {
              opacity,
              duration: FADE_DURATION,
              ease: "power2.out",
              overwrite: "auto",
            });
          };

          const handleMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            if (!placed) {
              placed = true;
              gsap.set(el, { x: event.clientX, y: event.clientY });
              fade(1);
              return;
            }
            quickX(event.clientX);
            quickY(event.clientY);
          };

          const handleOver = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            const target = event.target;
            const interactive =
              target instanceof Element &&
              target.closest(INTERACTIVE_SELECTOR) !== null;
            gsap.to(el, {
              scale: interactive ? HOVER_SCALE : 1,
              duration: SCALE_DURATION,
              ease: "power2.out",
              overwrite: "auto",
            });
          };

          const root = document.documentElement;

          const handleLeave = () => {
            if (placed) fade(0);
          };

          const handleEnter = (event: PointerEvent) => {
            if (!placed) return;
            gsap.set(el, { x: event.clientX, y: event.clientY });
            fade(1);
          };

          window.addEventListener("pointermove", handleMove, { passive: true });
          window.addEventListener("pointerover", handleOver, { passive: true });
          root.addEventListener("pointerleave", handleLeave);
          root.addEventListener("pointerenter", handleEnter);

          return () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerover", handleOver);
            root.removeEventListener("pointerleave", handleLeave);
            root.removeEventListener("pointerenter", handleEnter);
            placed = false;
            gsap.killTweensOf(el);
            gsap.set(el, { clearProps: "transform,opacity" });
          };
        },
      );
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 size-8 rounded-full bg-white opacity-0 mix-blend-difference"
    />
  );
}
