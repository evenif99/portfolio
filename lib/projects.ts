import { PLACEHOLDER, type Project } from "./types";

// image는 값이 확정되면 추가
export const projects: readonly Project[] = [
  {
    name: "서울30",
    summary: "위치 기반 공공시설 추천 PWA",
    role: "기획, 설계, 구현 전담 (1인 개발). 점수 산정 엔진, API 캐싱, 테스트 작성",
    period: PLACEHOLDER,
    stack: [PLACEHOLDER],
    links: {
      deploy: "https://seoul-30-webapp.vercel.app/",
      github: "https://github.com/evenif99/seoul-30",
    },
  },
  {
    name: "말해부엉",
    summary: "AI 갈등 조정·판결 서비스",
    role: "PM. 인증, 마이페이지, 챗봇 기능 구현. ERD 설계와 요구사항 문서 작성 참여 (5인 팀)",
    period: PLACEHOLDER,
    stack: ["Next.js", "Supabase", "Gemini API"],
    links: {
      deploy: "https://talky-owl-iota.vercel.app/",
      github: "https://github.com/I5-Project/TALKY-OWL",
    },
  },
];
