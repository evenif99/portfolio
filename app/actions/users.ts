"use server";

import { z } from "zod";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAdmin } from "@/lib/rbac";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserFormState =
  | { errors?: Partial<Record<string, string[]>>; message?: string }
  | { success: true }
  | undefined;

// ─── Schema ───────────────────────────────────────────────────────────────────

const CreateUserSchema = z.object({
  name:     z.string().trim().min(1, "이름을 입력하세요."),
  email:    z.string().email("올바른 이메일을 입력하세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  role:     z.enum(["ADMIN", "OPERATOR", "VIEWER"]),
});

const UpdateUserSchema = z.object({
  userId: z.number().int().positive(),
  name:   z.string().trim().min(1, "이름을 입력하세요."),
  role:   z.enum(["ADMIN", "OPERATOR", "VIEWER"]),
});

// ─── createUser ───────────────────────────────────────────────────────────────

export async function createUser(
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const parsed = CreateUserSchema.safeParse({
    name:     formData.get("name"),
    email:    formData.get("email"),
    password: formData.get("password"),
    role:     formData.get("role"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { message: `'${email}'은 이미 등록된 이메일입니다.` };

  const hashed = await hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashed, role } });

  revalidatePath("/dashboard/settings/users");
  return { success: true };
}

// ─── updateUserRole ───────────────────────────────────────────────────────────

export async function updateUserRole(
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const parsed = UpdateUserSchema.safeParse({
    userId: Number(formData.get("userId")),
    name:   formData.get("name"),
    role:   formData.get("role"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { userId, name, role } = parsed.data;

  if (userId === Number(session.user.id))
    return { message: "자신의 역할은 변경할 수 없습니다." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { message: "존재하지 않는 사용자입니다." };

  await prisma.user.update({ where: { id: userId }, data: { name, role } });

  revalidatePath("/dashboard/settings/users");
  return { success: true };
}

// ─── deleteUser ───────────────────────────────────────────────────────────────

export async function deleteUser(
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const userId = Number(formData.get("userId"));
  if (!userId) return { message: "잘못된 요청입니다." };

  if (userId === Number(session.user.id))
    return { message: "자신의 계정은 삭제할 수 없습니다." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { transactions: true, shipments: true, purchaseOrders: true } } },
  });
  if (!user) return { message: "존재하지 않는 사용자입니다." };

  const total = user._count.transactions + user._count.shipments + user._count.purchaseOrders;
  if (total > 0)
    return { message: "이력이 있는 사용자는 삭제할 수 없습니다. 역할을 VIEWER로 변경하세요." };

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/dashboard/settings/users");
  return { success: true };
}
