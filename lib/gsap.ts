// 클라이언트 컴포넌트에서만 import 할 것 (서버 컴포넌트 import 금지)
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

// 폰트 swap 으로 레이아웃이 바뀐 뒤 트리거 위치를 다시 계산 (모듈 로드 시 1회)
if (typeof window !== "undefined" && "fonts" in document) {
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, useGSAP };
