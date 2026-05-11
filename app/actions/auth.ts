"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignupSchema, LoginSchema } from "@/lib/definitions";
import type { SignupFormState, LoginFormState } from "@/lib/definitions";

export async function signup(
  _state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "이미 사용 중인 이메일입니다." };
  }

  const hashed = await hash(password, 12);
  await prisma.user.create({ data: { name, email, password: hashed } });

  redirect("/login");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch {
    return { message: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
}
