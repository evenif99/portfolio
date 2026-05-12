"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TransactionSchema = z.object({
  itemId:    z.number().int().positive(),
  type:      z.enum(["INBOUND", "OUTBOUND", "ADJUSTMENT", "RETURN"]),
  quantity:  z.number().int().refine((v) => v !== 0, { message: "수량은 0이 될 수 없습니다." }),
  reference: z.string().trim().optional(),
  notes:     z.string().trim().optional(),
});

export type TransactionFormState =
  | { errors?: { itemId?: string[]; type?: string[]; quantity?: string[]; reference?: string[]; notes?: string[] }; message?: string }
  | { success: true }
  | undefined;

export async function createTransaction(
  _state: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };

  const parsed = TransactionSchema.safeParse({
    itemId:    Number(formData.get("itemId")),
    type:      formData.get("type"),
    quantity:  Number(formData.get("quantity")),
    reference: formData.get("reference") || undefined,
    notes:     formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { itemId, type, quantity, reference, notes } = parsed.data;

  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) return { message: "존재하지 않는 품목입니다." };

  // 실제 수량 변화 계산
  const delta =
    type === "INBOUND"  ? quantity
    : type === "OUTBOUND" ? -Math.abs(quantity)
    : type === "RETURN"   ? Math.abs(quantity)
    : quantity; // ADJUSTMENT: 부호 포함한 값 그대로

  const newQty = item.quantity + delta;
  if (newQty < 0) return { message: `재고 부족: 현재 ${item.quantity}개, 출고 요청 ${Math.abs(delta)}개` };

  // 트랜잭션 생성 + 재고 수량 업데이트 + 상태 재산정 (atomic)
  const newStatus =
    newQty === 0                ? "OUT_OF_STOCK"
    : newQty < item.safetyStock ? "LOW_STOCK"
    : "IN_STOCK";

  await prisma.$transaction([
    prisma.stockTransaction.create({
      data: {
        type,
        itemId,
        quantity: delta,
        userId: Number(session.user.id),
        reference,
        notes,
      },
    }),
    prisma.inventoryItem.update({
      where: { id: itemId },
      data: { quantity: newQty, status: newStatus },
    }),
  ]);

  // 재고 부족 알림 자동 생성/해제
  const existingAlert = await prisma.lowStockAlert.findFirst({
    where: { itemId, resolved: false },
  });

  if (newQty < item.safetyStock && !existingAlert) {
    await prisma.lowStockAlert.create({
      data: { itemId, threshold: item.safetyStock },
    });
  } else if (newQty >= item.safetyStock && existingAlert) {
    await prisma.lowStockAlert.update({
      where: { id: existingAlert.id },
      data: { resolved: true },
    });
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/inventory/${itemId}`);
  revalidatePath("/dashboard/transactions");

  return { success: true };
}
