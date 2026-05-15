"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client/index.js";
import { canAdmin } from "@/lib/rbac";

// ─── Schema ───────────────────────────────────────────────────────────────────

const ItemSchema = z.object({
  sku:         z.string().trim().min(1, "SKU를 입력하세요."),
  name:        z.string().trim().min(1, "품목명을 입력하세요."),
  modelName:   z.string().trim().min(1, "모델명을 입력하세요."),
  categoryId:  z.number().int().positive("카테고리를 선택하세요."),
  brandId:     z.number().int().positive("브랜드를 선택하세요."),
  supplierId:  z.number().int().positive().optional(),
  warehouseId: z.number().int().positive("창고를 선택하세요."),
  quantity:    z.number().int().min(0),
  safetyStock: z.number().int().min(0),
  unitPrice:   z.number().positive().optional(),
  imageUrl:    z.string().url("올바른 URL을 입력하세요.").optional().or(z.literal("")),
  notes:       z.string().trim().optional(),
});

export type ItemFormState =
  | { errors?: Partial<Record<string, string[]>>; message?: string }
  | { success: true; itemId?: number }
  | undefined;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSpecs(formData: FormData): Record<string, string> | undefined {
  const specs: Record<string, string> = {};
  let i = 0;
  while (formData.has(`specKey_${i}`)) {
    const key = (formData.get(`specKey_${i}`) as string).trim();
    const val = (formData.get(`specVal_${i}`) as string).trim();
    if (key && val) specs[key] = val;
    i++;
  }
  return Object.keys(specs).length > 0 ? specs : undefined;
}

function parseFormData(formData: FormData) {
  const supplierId = formData.get("supplierId");
  const unitPrice  = formData.get("unitPrice");
  const imageUrl   = formData.get("imageUrl") as string;
  return {
    sku:         formData.get("sku") as string,
    name:        formData.get("name") as string,
    modelName:   formData.get("modelName") as string,
    categoryId:  Number(formData.get("categoryId")),
    brandId:     Number(formData.get("brandId")),
    supplierId:  supplierId ? Number(supplierId) : undefined,
    warehouseId: Number(formData.get("warehouseId")),
    quantity:    Number(formData.get("quantity")) || 0,
    safetyStock: Number(formData.get("safetyStock")) || 10,
    unitPrice:   unitPrice ? Number(unitPrice) : undefined,
    imageUrl:    imageUrl || "",
    notes:       (formData.get("notes") as string) || undefined,
  };
}

function calcStatus(qty: number, safetyStock: number) {
  if (qty === 0)            return "OUT_OF_STOCK" as const;
  if (qty < safetyStock)    return "LOW_STOCK"    as const;
  return                           "IN_STOCK"     as const;
}

// ─── createItem ───────────────────────────────────────────────────────────────

export async function createItem(
  _state: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const raw = parseFormData(formData);
  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { sku, name, modelName, categoryId, brandId, supplierId, warehouseId,
          quantity, safetyStock, unitPrice, imageUrl, notes } = parsed.data;

  const existing = await prisma.inventoryItem.findUnique({ where: { sku } });
  if (existing) return { message: `SKU '${sku}'는 이미 사용 중입니다.` };

  const specs = parseSpecs(formData);

  const item = await prisma.inventoryItem.create({
    data: {
      sku, name, modelName,
      categoryId, brandId, supplierId: supplierId ?? null, warehouseId,
      quantity, safetyStock,
      unitPrice: unitPrice ?? null,
      imageUrl:  imageUrl  || null,
      notes:     notes     || null,
      specs:     specs     ?? undefined,
      status:    calcStatus(quantity, safetyStock),
    },
  });

  if (quantity > 0 && quantity < safetyStock) {
    await prisma.lowStockAlert.create({ data: { itemId: item.id, threshold: safetyStock } });
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/inventory");
  return { success: true, itemId: item.id };
}

// ─── updateItem ───────────────────────────────────────────────────────────────

export async function updateItem(
  _state: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const itemId = Number(formData.get("itemId"));
  if (!itemId) return { message: "잘못된 요청입니다." };

  const raw = parseFormData(formData);
  // quantity 필드는 updateItem에서 무시 (트랜잭션으로만 변경)
  const parsed = ItemSchema.omit({ quantity: true }).safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) return { message: "존재하지 않는 품목입니다." };

  const { sku, name, modelName, categoryId, brandId, supplierId, warehouseId,
          safetyStock, unitPrice, imageUrl, notes } = parsed.data;

  // SKU 중복 확인 (자신 제외)
  if (sku !== item.sku) {
    const dup = await prisma.inventoryItem.findUnique({ where: { sku } });
    if (dup) return { message: `SKU '${sku}'는 이미 사용 중입니다.` };
  }

  const specs = parseSpecs(formData);

  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      sku, name, modelName,
      categoryId, brandId, supplierId: supplierId ?? null, warehouseId,
      safetyStock,
      unitPrice: unitPrice ?? null,
      imageUrl:  imageUrl  || null,
      notes:     notes     || null,
      specs:     specs ?? Prisma.DbNull,   // 스펙 전체 삭제 시 DB null 클리어
      status:    calcStatus(item.quantity, safetyStock),
    },
  });

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/inventory/${itemId}`);
  return { success: true, itemId };
}

// ─── deleteItem ───────────────────────────────────────────────────────────────

export async function deleteItem(
  _state: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canAdmin(session.user.role)) return { message: "권한이 없습니다. (ADMIN 전용)" };

  const itemId = Number(formData.get("itemId"));
  if (!itemId) return { message: "잘못된 요청입니다." };

  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: { _count: { select: { transactions: true, shipmentItems: true } } },
  });
  if (!item) return { message: "존재하지 않는 품목입니다." };
  if (item._count.transactions > 0)
    return { message: "입출고 이력이 있는 품목은 삭제할 수 없습니다." };
  if (item._count.shipmentItems > 0)
    return { message: "출고 요청에 포함된 품목은 삭제할 수 없습니다." };

  await prisma.$transaction([
    prisma.lowStockAlert.deleteMany({ where: { itemId } }),
    prisma.inventoryItem.delete({ where: { id: itemId } }),
  ]);

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/inventory");
  return { success: true };
}
