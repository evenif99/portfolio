"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kstDateString } from "@/lib/datetime";
import { canOperate } from "@/lib/rbac";

// ─── Types ────────────────────────────────────────────────────────────────────

export type POFormState =
  | { errors?: Partial<Record<string, string[]>>; message?: string }
  | { success: true; orderId?: number }
  | undefined;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateOrderNo(): Promise<string> {
  // KST 기준 날짜 사용 (UTC 기준 toISOString은 KST와 최대 1일 차이 발생)
  const ymd = kstDateString().replace(/-/g, "");
  const count = await prisma.purchaseOrder.count({
    where: { orderNo: { startsWith: `PO-${ymd}` } },
  });
  return `PO-${ymd}-${String(count + 1).padStart(3, "0")}`;
}

// ─── createPurchaseOrder ──────────────────────────────────────────────────────

const ItemLineSchema = z.object({
  itemId:    z.number().int().positive(),
  quantity:  z.number().int().min(1, "수량은 1 이상이어야 합니다."),
  unitPrice: z.number().positive().optional(),
});

const CreatePOSchema = z.object({
  supplierId: z.number().int().positive("공급업체를 선택하세요."),
  notes:      z.string().trim().optional(),
  items:      z.array(ItemLineSchema).min(1, "품목을 1개 이상 추가하세요."),
});

export async function createPurchaseOrder(
  _state: POFormState,
  formData: FormData,
): Promise<POFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canOperate(session.user.role)) return { message: "권한이 없습니다. (ADMIN/OPERATOR 전용)" };

  const supplierId = Number(formData.get("supplierId"));
  const notes      = (formData.get("notes") as string) || undefined;

  // 품목 라인 파싱 (itemId_0, quantity_0, unitPrice_0 …)
  const items: Array<{ itemId: number; quantity: number; unitPrice?: number }> = [];
  let i = 0;
  while (formData.has(`itemId_${i}`)) {
    const itemId    = Number(formData.get(`itemId_${i}`));
    const quantity  = Number(formData.get(`quantity_${i}`));
    const priceRaw  = formData.get(`unitPrice_${i}`) as string;
    const unitPrice = priceRaw ? Number(priceRaw) : undefined;
    // 품목이 선택되지 않은 빈 라인은 건너뜀
    if (itemId > 0 && quantity > 0) {
      items.push({ itemId, quantity, unitPrice });
    }
    i++;
  }

  const parsed = CreatePOSchema.safeParse({ supplierId, notes, items });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const orderNo    = await generateOrderNo();
  const userId     = Number(session.user.id); // session.user.id는 string이므로 명시적 변환

  const po = await prisma.purchaseOrder.create({
    data: {
      orderNo,
      supplierId:  parsed.data.supplierId,
      createdById: userId,
      notes:       parsed.data.notes || null,
      status:      "DRAFT",
      items: {
        create: parsed.data.items.map((it) => ({
          itemId:    it.itemId,
          quantity:  it.quantity,
          unitPrice: it.unitPrice ?? null,
        })),
      },
    },
  });

  revalidatePath("/dashboard/purchase-orders");
  return { success: true, orderId: po.id };
}

// ─── confirmPurchaseOrder (DRAFT → ORDERED) ───────────────────────────────────

export async function confirmPurchaseOrder(
  _state: POFormState,
  formData: FormData,
): Promise<POFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canOperate(session.user.role)) return { message: "권한이 없습니다. (ADMIN/OPERATOR 전용)" };

  const orderId = Number(formData.get("orderId"));
  if (!orderId) return { message: "잘못된 요청입니다." };

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: orderId },
    include: { supplier: { select: { leadTimeDays: true } } },
  });
  if (!po)                   return { message: "존재하지 않는 발주서입니다." };
  if (po.status !== "DRAFT") return { message: "초안 상태의 발주서만 확정할 수 있습니다." };

  const orderedAt  = new Date();
  const expectedAt = po.supplier.leadTimeDays
    ? new Date(orderedAt.getTime() + po.supplier.leadTimeDays * 86_400_000)
    : null;

  await prisma.purchaseOrder.update({
    where: { id: orderId },
    data:  { status: "ORDERED", orderedAt, expectedAt },
  });

  revalidatePath("/dashboard/purchase-orders");
  revalidatePath(`/dashboard/purchase-orders/${orderId}`);
  return { success: true, orderId };
}

// ─── receivePurchaseOrder (ORDERED → RECEIVED) ────────────────────────────────

export async function receivePurchaseOrder(
  _state: POFormState,
  formData: FormData,
): Promise<POFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canOperate(session.user.role)) return { message: "권한이 없습니다. (ADMIN/OPERATOR 전용)" };

  const orderId = Number(formData.get("orderId"));
  if (!orderId) return { message: "잘못된 요청입니다." };

  const po = await prisma.purchaseOrder.findUnique({
    where:   { id: orderId },
    include: { items: true },
  });
  if (!po)                    return { message: "존재하지 않는 발주서입니다." };
  if (po.status !== "ORDERED") return { message: "발주 완료 상태의 발주서만 입고 처리할 수 있습니다." };

  // 품목별 실제 입고 수량 파싱
  const received: Array<{ poItemId: number; itemId: number; qty: number }> = [];
  for (const line of po.items) {
    const qty = Number(formData.get(`receivedQty_${line.id}`));
    if (qty > 0) received.push({ poItemId: line.id, itemId: line.itemId, qty });
  }
  if (received.length === 0) return { message: "입고 수량을 1개 이상 입력하세요." };

  const userId = Number(session.user.id);

  await prisma.$transaction(async (tx) => {
    await tx.purchaseOrder.update({
      where: { id: orderId },
      data:  { status: "RECEIVED", receivedAt: new Date() },
    });

    for (const r of received) {
      await tx.purchaseOrderItem.update({
        where: { id: r.poItemId },
        data:  { receivedQty: r.qty },
      });

      // 재고 증가 후 즉시 반환값으로 상태 계산 (findUnique 쿼리 제거)
      const updatedItem = await tx.inventoryItem.update({
        where:  { id: r.itemId },
        data:   { quantity: { increment: r.qty } },
        select: { quantity: true, safetyStock: true },
      });

      await tx.stockTransaction.create({
        data: {
          type:      "INBOUND",
          itemId:    r.itemId,
          quantity:  r.qty,
          userId,
          reference: po.orderNo,
          notes:     `발주서 ${po.orderNo} 입고 처리`,
        },
      });

      const newStatus =
        updatedItem.quantity === 0                            ? "OUT_OF_STOCK"
        : updatedItem.quantity < updatedItem.safetyStock     ? "LOW_STOCK"
        : "IN_STOCK";

      await tx.inventoryItem.update({
        where: { id: r.itemId },
        data:  { status: newStatus },
      });

      if (newStatus === "IN_STOCK") {
        await tx.lowStockAlert.updateMany({
          where: { itemId: r.itemId, resolved: false },
          data:  { resolved: true },
        });
      }
    }
  });

  revalidatePath("/dashboard/purchase-orders");
  revalidatePath(`/dashboard/purchase-orders/${orderId}`);
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  return { success: true, orderId };
}

// ─── cancelPurchaseOrder ──────────────────────────────────────────────────────

export async function cancelPurchaseOrder(
  _state: POFormState,
  formData: FormData,
): Promise<POFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canOperate(session.user.role)) return { message: "권한이 없습니다. (ADMIN/OPERATOR 전용)" };

  const orderId = Number(formData.get("orderId"));
  if (!orderId) return { message: "잘못된 요청입니다." };

  const po = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
  if (!po)                      return { message: "존재하지 않는 발주서입니다." };
  if (po.status === "RECEIVED") return { message: "입고 완료된 발주서는 취소할 수 없습니다." };

  await prisma.purchaseOrder.update({
    where: { id: orderId },
    data:  { status: "CANCELLED" },
  });

  revalidatePath("/dashboard/purchase-orders");
  revalidatePath(`/dashboard/purchase-orders/${orderId}`);
  return { success: true };
}

// ─── deletePurchaseOrder (DRAFT / CANCELLED 만) ────────────────────────────────

export async function deletePurchaseOrder(
  _state: POFormState,
  formData: FormData,
): Promise<POFormState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canOperate(session.user.role)) return { message: "권한이 없습니다. (ADMIN/OPERATOR 전용)" };

  const orderId = Number(formData.get("orderId"));
  if (!orderId) return { message: "잘못된 요청입니다." };

  const po = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
  if (!po) return { message: "존재하지 않는 발주서입니다." };
  if (po.status === "ORDERED" || po.status === "RECEIVED")
    return { message: "발주 확정 또는 입고 완료된 발주서는 삭제할 수 없습니다." };

  await prisma.purchaseOrder.delete({ where: { id: orderId } });

  revalidatePath("/dashboard/purchase-orders");
  return { success: true };
}
