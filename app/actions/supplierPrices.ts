"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAdmin } from "@/lib/rbac";

// ─── Schema ───────────────────────────────────────────────────────────────────

const PriceSchema = z.object({
  supplierId: z.number().int().positive(),
  itemId:     z.number().int().positive(),
  unitPrice:  z.number().positive("단가는 0보다 커야 합니다."),
  moq:        z.number().int().min(1).optional(),
  notes:      z.string().trim().optional(),
});

export type SupplierPriceFormState =
  | { errors?: Partial<Record<string, string[]>>; message?: string }
  | { success: true }
  | undefined;

// ─── upsertSupplierItemPrice ──────────────────────────────────────────────────

export async function upsertSupplierItemPrice(
  _state: SupplierPriceFormState,
  formData: FormData,
): Promise<SupplierPriceFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const moqRaw = formData.get("moq") as string;
  const raw = {
    supplierId: Number(formData.get("supplierId")),
    itemId:     Number(formData.get("itemId")),
    unitPrice:  Number(formData.get("unitPrice")),
    moq:        moqRaw ? Number(moqRaw) : undefined,
    notes:      (formData.get("notes") as string) || undefined,
  };

  const parsed = PriceSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { supplierId, itemId, unitPrice, moq, notes } = parsed.data;

  const [supplier, item] = await Promise.all([
    prisma.supplier.findUnique({ where: { id: supplierId } }),
    prisma.inventoryItem.findUnique({ where: { id: itemId } }),
  ]);
  if (!supplier) return { message: "존재하지 않는 공급업체입니다." };
  if (!item)     return { message: "존재하지 않는 품목입니다." };

  await prisma.supplierItemPrice.upsert({
    where:  { supplierId_itemId: { supplierId, itemId } },
    create: { supplierId, itemId, unitPrice, moq: moq ?? null, notes: notes || null },
    update: { unitPrice, moq: moq ?? null, notes: notes || null },
  });

  revalidatePath(`/dashboard/suppliers/${supplierId}`);
  return { success: true };
}

// ─── deleteSupplierItemPrice ──────────────────────────────────────────────────

export async function deleteSupplierItemPrice(
  _state: SupplierPriceFormState,
  formData: FormData,
): Promise<SupplierPriceFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const priceId    = Number(formData.get("priceId"));
  const supplierId = Number(formData.get("supplierId"));
  if (!priceId || !supplierId) return { message: "잘못된 요청입니다." };

  await prisma.supplierItemPrice.delete({ where: { id: priceId } });

  revalidatePath(`/dashboard/suppliers/${supplierId}`);
  return { success: true };
}
