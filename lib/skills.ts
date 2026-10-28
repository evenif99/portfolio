import type { Skill } from "./types";

export const skills: readonly Skill[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "GSAP"],
  },
  {
    category: "Backend",
    items: ["NextAuth(Kakao OAuth) 기반 인증 구현 경험", "Prisma ORM"],
  },
  {
    category: "DB / Infra",
    items: ["PostgreSQL(Neon, Supabase)", "ERD 설계", "Vercel"],
  },
  {
    category: "협업 도구",
    items: ["Git", "GitHub", "Notion", "Claude Code"],
  },
];
