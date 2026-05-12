"use server";

import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력하세요."),
    newPassword:     z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다."),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력하세요."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "새 비밀번호와 확인이 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type ChangePasswordState =
  | { errors?: Partial<Record<string, string[]>>; message?: string }
  | { success: true }
  | undefined;

export async function changePassword(
  _state: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword:     formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
  if (!user) return { message: "사용자를 찾을 수 없습니다." };

  const match = await compare(parsed.data.currentPassword, user.password);
  if (!match) return { errors: { currentPassword: ["현재 비밀번호가 올바르지 않습니다."] } };

  const hashed = await hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return { success: true };
}
