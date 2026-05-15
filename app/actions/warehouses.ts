"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canOperate } from "@/lib/rbac";

const WarehouseSchema = z.object({
  name: z.string().trim().min(1, "Please enter warehouse name."),
  location: z.string().trim().min(1, "Please enter location."),
  zone: z.string().trim().optional(),
  capacity: z.number().int().positive("Capacity must be 1 or greater."),
});

const TransferSchema = z.object({
  itemId: z.number().int().positive(),
  toWarehouseId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  reference: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type WarehouseFormState =
  | { errors?: Partial<Record<string, string[]>>; message?: string }
  | { success: true }
  | undefined;

export type TransferFormState =
  | { errors?: Partial<Record<string, string[]>>; message?: string }
  | { success: true }
  | undefined;

export async function createWarehouse(
  _state: WarehouseFormState,
  formData: FormData,
): Promise<WarehouseFormState> {
  const session = await auth();
  if (!canOperate(session?.user?.role)) return { message: "Permission denied." };

  const parsed = WarehouseSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    zone: formData.get("zone") || undefined,
    capacity: Number(formData.get("capacity")),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { name, location, zone, capacity } = parsed.data;
  await prisma.warehouse.create({ data: { name, location, zone: zone || null, capacity } });

  revalidatePath("/dashboard/warehouses");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateWarehouse(
  _state: WarehouseFormState,
  formData: FormData,
): Promise<WarehouseFormState> {
  const session = await auth();
  if (!canOperate(session?.user?.role)) return { message: "Permission denied." };

  const warehouseId = Number(formData.get("warehouseId"));
  if (!warehouseId) return { message: "Invalid request." };

  const parsed = WarehouseSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    zone: formData.get("zone") || undefined,
    capacity: Number(formData.get("capacity")),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { name, location, zone, capacity } = parsed.data;
  await prisma.warehouse.update({
    where: { id: warehouseId },
    data: { name, location, zone: zone || null, capacity },
  });

  revalidatePath("/dashboard/warehouses");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

function calcStatus(quantity: number, safetyStock: number) {
  if (quantity === 0) return "OUT_OF_STOCK" as const;
  if (quantity < safetyStock) return "LOW_STOCK" as const;
  return "IN_STOCK" as const;
}

export async function transferWarehouseStock(
  _state: TransferFormState,
  formData: FormData,
): Promise<TransferFormState> {
  const session = await auth();
  if (!session?.user?.id || !canOperate(session.user.role)) {
    return { message: "Permission denied." };
  }

  const parsed = TransferSchema.safeParse({
    itemId: Number(formData.get("itemId")),
    toWarehouseId: Number(formData.get("toWarehouseId")),
    quantity: Number(formData.get("quantity")),
    reference: formData.get("reference") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { itemId, toWarehouseId, quantity, reference, notes } = parsed.data;
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      sku: true,
      name: true,
      modelName: true,
      categoryId: true,
      brandId: true,
      supplierId: true,
      warehouseId: true,
      quantity: true,
      safetyStock: true,
      unitPrice: true,
      imageUrl: true,
      specs: true,
      notes: true,
    },
  });

  if (!item) return { message: "Item not found." };
  if (item.warehouseId === toWarehouseId) return { message: "Source and destination are the same." };
  if (quantity > item.quantity) return { message: "Transfer quantity exceeds stock." };

  await prisma.$transaction(async (tx) => {
    const sourceQty = item.quantity - quantity;
    const sourceStatus = calcStatus(sourceQty, item.safetyStock);

    const target = await tx.inventoryItem.findFirst({
      where: { sku: item.sku, warehouseId: toWarehouseId },
      select: { id: true, quantity: true, safetyStock: true },
    });

    if (target) {
      const targetQty = target.quantity + quantity;
      await tx.inventoryItem.update({
        where: { id: target.id },
        data: {
          quantity: targetQty,
          status: calcStatus(targetQty, target.safetyStock),
        },
      });
    } else {
      await tx.inventoryItem.create({
        data: {
          sku: item.sku,
          name: item.name,
          modelName: item.modelName,
          categoryId: item.categoryId,
          brandId: item.brandId,
          supplierId: item.supplierId,
          warehouseId: toWarehouseId,
          quantity,
          safetyStock: item.safetyStock,
          unitPrice: item.unitPrice,
          imageUrl: item.imageUrl,
          specs: item.specs ?? undefined,
          notes: item.notes,
          status: calcStatus(quantity, item.safetyStock),
        },
      });
    }

    await tx.inventoryItem.update({
      where: { id: itemId },
      data: { quantity: sourceQty, status: sourceStatus },
    });

    await tx.stockTransaction.create({
      data: {
        type: "TRANSFER",
        itemId,
        quantity,
        userId: Number(session.user.id),
        transferFromId: item.warehouseId,
        transferToId: toWarehouseId,
        reference,
        notes: notes || `Transfer ${item.sku} (${quantity})`,
      },
    });

    await tx.lowStockAlert.updateMany({
      where: { itemId, resolved: false },
      data: { resolved: sourceQty >= item.safetyStock },
    });

    if (sourceQty > 0 && sourceQty < item.safetyStock) {
      const openAlert = await tx.lowStockAlert.findFirst({ where: { itemId, resolved: false } });
      if (!openAlert) {
        await tx.lowStockAlert.create({ data: { itemId, threshold: item.safetyStock } });
      }
    }
  });

  revalidatePath("/dashboard/warehouses");
  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/inventory/${itemId}`);
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}
