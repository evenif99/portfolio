import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/definitions";
import { authConfig } from "@/lib/auth.config";
import type { UserRole } from "@/lib/rbac";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) return null;

        return { id: String(user.id), name: user.name, email: user.email, role: user.role as UserRole };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id)   session.user.id   = token.id   as string;
      if (token.role) session.user.role = token.role as UserRole;
      return session;
    },
  },
});
