import type { CSSProperties } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false },
};

const TILE = 512;

function svgUri(filters: string, rectFilterId: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">` +
    `<filter id="${rectFilterId}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">${filters}</filter>` +
    `<rect width="100%" height="100%" filter="url(#${rectFilterId})"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const LIGHT = `<feDistantLight azimuth="225" elevation="55"/>`;

// A. 미세 결 강화
const GRAIN_A = svgUri(
  `<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4" seed="7" stitchTiles="stitch" result="n"/>` +
    `<feDiffuseLighting in="n" lighting-color="#f0dcc8" surfaceScale="4">${LIGHT}</feDiffuseLighting>`,
  "a",
);

// B. 알갱이(페블): 노이즈 R 을 높이(알파)로 옮기고 discrete 로 계단화한 뒤 살짝 블러해서 덩어리 가장자리를 만든다
const GRAIN_B = svgUri(
  `<feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="11" stitchTiles="stitch" result="n"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="h"/>` +
    `<feComponentTransfer in="h" result="steps"><feFuncA type="discrete" tableValues="0.1 0.35 0.6 0.85 1"/></feComponentTransfer>` +
    `<feGaussianBlur in="steps" stdDeviation="0.9" result="soft"/>` +
    `<feDiffuseLighting in="soft" lighting-color="#f0dcc8" surfaceScale="5">${LIGHT}</feDiffuseLighting>`,
  "b",
);

// C. 큰 결(0.03) + 미세 결(0.8) 을 feBlend multiply 로 합친 뒤 lighting
const TO_GRAY = `<feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"`;
const GRAIN_C = svgUri(
  `<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="3" stitchTiles="stitch" result="big0"/>` +
    `${TO_GRAY} in="big0" result="big"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="5" stitchTiles="stitch" result="fine0"/>` +
    `${TO_GRAY} in="fine0" result="fine"/>` +
    `<feBlend in="big" in2="fine" mode="multiply" result="mix"/>` +
    `<feColorMatrix in="mix" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="h"/>` +
    `<feDiffuseLighting in="h" lighting-color="#f0dcc8" surfaceScale="3">${LIGHT}</feDiffuseLighting>`,
  "c",
);

const SWATCHES: ReadonlyArray<{ label: string; grain: string }> = [
  { label: "A", grain: GRAIN_A },
  { label: "B", grain: GRAIN_B },
  { label: "C", grain: GRAIN_C },
];

export default function LeatherSpikePage() {
  return (
    <main className="min-h-svh bg-book-bg px-gutter py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 tablet:grid-cols-3">
        {SWATCHES.map(({ label, grain }) => (
          <figure key={label} className="flex flex-col items-center gap-4">
            <figcaption className="text-xl font-bold text-book-gold">{label}</figcaption>
            <div
              className="leather-swatch flex aspect-[5/7] w-full max-w-sm items-center justify-center px-gutter text-center"
              style={{ "--leather-grain": grain } as CSSProperties}
            >
              <span className="book-emboss text-3xl font-bold tracking-[0.3em] text-book-gold">
                개발일지
              </span>
            </div>
          </figure>
        ))}
      </div>
    </main>
  );
}
