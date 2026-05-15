"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAdmin } from "@/lib/rbac";

// ─── Schema ───────────────────────────────────────────────────────────────────

const SupplierSchema = z.object({
  name:         z.string().trim().min(1, "업체명을 입력하세요."),
  contact:      z.string().trim().optional(),
  email:        z.string().email("올바른 이메일을 입력하세요.").optional().or(z.literal("")),
  phone:        z.string().trim().optional(),
  address:      z.string().trim().optional(),
  leadTimeDays: z.number().int().min(1, "1일 이상 입력하세요.").max(365, "365일 이하로 입력하세요.").optional(),
  notes:        z.string().trim().optional(),
});

export type SupplierFormState =
  | { errors?: Partial<Record<string, string[]>>; message?: string }
  | { success: true; supplierId?: number }
  | undefined;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFormData(formData: FormData) {
  const leadTimeDays = formData.get("leadTimeDays") as string;
  return {
    name:         formData.get("name") as string,
    contact:      (formData.get("contact") as string) || undefined,
    email:        (formData.get("email") as string) || undefined,
    phone:        (formData.get("phone") as string) || undefined,
    address:      (formData.get("address") as string) || undefined,
    leadTimeDays: leadTimeDays ? Number(leadTimeDays) : undefined,
    notes:        (formData.get("notes") as string) || undefined,
  };
}

// ─── createSupplier ───────────────────────────────────────────────────────────

export async function createSupplier(
  _state: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const raw = parseFormData(formData);
  const parsed = SupplierSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { name, contact, email, phone, address, leadTimeDays, notes } = parsed.data;

  const existing = await prisma.supplier.findFirst({ where: { name } });
  if (existing) return { message: `'${name}'은 이미 등록된 업체명입니다.` };

  const supplier = await prisma.supplier.create({
    data: {
      name,
      contact:      contact      || null,
      email:        email        || null,
      phone:        phone        || null,
      address:      address      || null,
      leadTimeDays: leadTimeDays ?? null,
      notes:        notes        || null,
    },
  });

  revalidatePath("/dashboard/suppliers");
  return { success: true, supplierId: supplier.id };
}

// ─── updateSupplier ───────────────────────────────────────────────────────────

export async function updateSupplier(
  _state: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const supplierId = Number(formData.get("supplierId"));
  if (!supplierId) return { message: "잘못된 요청입니다." };

  const raw = parseFormData(formData);
  const parsed = SupplierSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) return { message: "존재하지 않는 공급업체입니다." };

  const { name, contact, email, phone, address, leadTimeDays, notes } = parsed.data;

  if (name !== supplier.name) {
    const dup = await prisma.supplier.findFirst({ where: { name } });
    if (dup) return { message: `'${name}'은 이미 등록된 업체명입니다.` };
  }

  await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      name,
      contact:      contact      || null,
      email:        email        || null,
      phone:        phone        || null,
      address:      address      || null,
      leadTimeDays: leadTimeDays ?? null,
      notes:        notes        || null,
    },
  });

  revalidatePath("/dashboard/suppliers");
  revalidatePath(`/dashboard/suppliers/${supplierId}`);
  return { success: true, supplierId };
}

// ─── deleteSupplier ───────────────────────────────────────────────────────────

export async function deleteSupplier(
  _state: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const supplierId = Number(formData.get("supplierId"));
  if (!supplierId) return { message: "잘못된 요청입니다." };

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: { _count: { select: { items: true } } },
  });
  if (!supplier) return { message: "존재하지 않는 공급업체입니다." };
  if (supplier._count.items > 0)
    return { message: `연결된 품목 ${supplier._count.items}종이 있어 삭제할 수 없습니다. 품목의 공급업체를 먼저 변경하세요.` };

  await prisma.supplier.delete({ where: { id: supplierId } });

  revalidatePath("/dashboard/suppliers");
  return { success: true };
}
