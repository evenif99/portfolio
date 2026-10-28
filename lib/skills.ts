import type { Skill } from "./types";

export const skills: readonly Skill[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "GSAP"],
  },
  { category: "Backend", items: ["Supabase 기반 인증 구현 경험"] },
  {
    category: "DB / Infra",
    items: ["PostgreSQL(ERD 설계)", "Supabase", "Vercel"],
  },
  {
    category: "협업 도구",
    items: ["Git", "GitHub", "Notion", "Claude Code"],
  },
];
