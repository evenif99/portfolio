"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canOperate } from "@/lib/rbac";

// ─── createShipment ───────────────────────────────────────────────────────────

const CreateShipmentSchema = z.object({
  requester:  z.string().trim().min(1, "요청처를 입력하세요."),
  department: z.string().trim().optional(),
  priority:   z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  dueDate:    z.string().optional(),
  notes:      z.string().trim().optional(),
});

export type CreateShipmentState =
  | { errors?: Partial<Record<string, string[]>>; message?: string }
  | { success: true; shipmentId?: number }
  | undefined;

export async function createShipment(
  _state: CreateShipmentState,
  formData: FormData,
): Promise<CreateShipmentState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canOperate(session.user.role)) return { message: "권한이 없습니다. (ADMIN/OPERATOR 전용)" };

  const parsed = CreateShipmentSchema.safeParse({
    requester:  formData.get("requester"),
    department: formData.get("department") || undefined,
    priority:   formData.get("priority"),
    dueDate:    formData.get("dueDate") || undefined,
    notes:      formData.get("notes") || undefined,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  // 품목 행 파싱: itemId_0, qty_0, itemId_1, qty_1, ...
  const lines: { itemId: number; quantity: number }[] = [];
  let i = 0;
  while (formData.has(`itemId_${i}`)) {
    const itemId  = Number(formData.get(`itemId_${i}`));
    const qty     = Number(formData.get(`qty_${i}`));
    if (itemId > 0 && qty > 0) lines.push({ itemId, quantity: qty });
    i++;
  }
  if (lines.length === 0) return { message: "품목을 1개 이상 추가하세요." };

  // 출고번호 자동 생성: SHP-YYYYMMDD-NNNN
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const count = await prisma.shipment.count();
  const shipmentNo = `SHP-${dateStr}-${String(count + 1).padStart(4, "0")}`;

  const { requester, department, priority, dueDate, notes } = parsed.data;

  const shipment = await prisma.shipment.create({
    data: {
      shipmentNo,
      requester,
      department: department || null,
      priority,
      dueDate:  dueDate ? new Date(dueDate) : null,
      notes:    notes   || null,
      userId:   Number(session.user.id),
      items: {
        create: lines.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/shipments");
  return { success: true, shipmentId: shipment.id };
}

// ─── updateShipmentStatus ─────────────────────────────────────────────────────

const VALID_STATUSES = ["PENDING", "APPROVED", "PICKING", "PACKED", "SHIPPED", "DELAYED", "COMPLETED", "CANCELLED"] as const;

const UpdateStatusSchema = z.object({
  shipmentId: z.number().int().positive(),
  status:     z.enum(VALID_STATUSES),
});

export type ShipmentActionState =
  | { message?: string }
  | { success: true }
  | undefined;

export async function updateShipmentStatus(
  _state: ShipmentActionState,
  formData: FormData
): Promise<ShipmentActionState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };
  if (!canOperate(session.user.role)) return { message: "권한이 없습니다. (ADMIN/OPERATOR 전용)" };

  const parsed = UpdateStatusSchema.safeParse({
    shipmentId: Number(formData.get("shipmentId")),
    status:     formData.get("status"),
  });

  if (!parsed.success) return { message: "잘못된 요청입니다." };

  const { shipmentId, status } = parsed.data;

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      items: {
        include: { item: { select: { id: true, quantity: true, safetyStock: true } } },
      },
    },
  });
  if (!shipment) return { message: "존재하지 않는 출고 요청입니다." };

  const isFirstShip = status === "SHIPPED" && !shipment.shippedAt;
  const shippedAt   = isFirstShip ? new Date() : undefined;

  // SHIPPED 최초 전환 시 재고 자동 차감 (atomic — 인터랙티브 트랜잭션)
  if (isFirstShip && shipment.items.length > 0) {
    const userId = Number(session.user.id);

    await prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id: shipmentId },
        data: { status, shippedAt },
      });

      for (const si of shipment.items) {
        const newQty    = Math.max(0, si.item.quantity - si.quantity);
        const newStatus =
          newQty === 0                 ? "OUT_OF_STOCK" :
          newQty < si.item.safetyStock ? "LOW_STOCK"    : "IN_STOCK";

        await tx.stockTransaction.create({
          data: {
            type:      "OUTBOUND",
            itemId:    si.itemId,
            quantity:  -si.quantity,
            userId,
            reference: shipment.shipmentNo,
            notes:     "출고 요청 자동 차감",
          },
        });

        await tx.inventoryItem.update({
          where: { id: si.itemId },
          data:  { quantity: newQty, status: newStatus },
        });
      }
    });

    // 알림 처리 (트랜잭션 밖 — 조건부 upsert)
    for (const si of shipment.items) {
      const newQty      = Math.max(0, si.item.quantity - si.quantity);
      const existAlert  = await prisma.lowStockAlert.findFirst({
        where: { itemId: si.itemId, resolved: false },
      });
      if (newQty < si.item.safetyStock && !existAlert) {
        await prisma.lowStockAlert.create({
          data: { itemId: si.itemId, threshold: si.item.safetyStock },
        });
      } else if (newQty >= si.item.safetyStock && existAlert) {
        await prisma.lowStockAlert.update({
          where: { id: existAlert.id },
          data:  { resolved: true },
        });
      }
    }
  } else {
    // 일반 상태 변경 (SHIPPED 외)
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        ...(shippedAt ? { shippedAt } : {}),
      },
    });
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/shipments");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/transactions");

  return { success: true };
}
