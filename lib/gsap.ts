// 클라이언트 컴포넌트에서만 import 할 것 (서버 컴포넌트 import 금지)
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export { gsap, ScrollTrigger, useGSAP };
