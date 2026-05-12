"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AlertActionState =
  | { message?: string }
  | { success: true }
  | undefined;

export async function resolveAlert(
  _state: AlertActionState,
  formData: FormData
): Promise<AlertActionState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };

  const alertId = Number(formData.get("alertId"));
  if (!alertId || isNaN(alertId)) return { message: "잘못된 요청입니다." };

  const alert = await prisma.lowStockAlert.findUnique({ where: { id: alertId } });
  if (!alert) return { message: "존재하지 않는 알림입니다." };
  if (alert.resolved) return { message: "이미 해제된 알림입니다." };

  await prisma.lowStockAlert.update({
    where: { id: alertId },
    data: { resolved: true },
  });

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/inventory");

  return { success: true };
}

export async function resolveAllAlerts(
  _state: AlertActionState,
  _formData: FormData
): Promise<AlertActionState> {
  const session = await auth();
  if (!session?.user?.id) return { message: "로그인이 필요합니다." };

  await prisma.lowStockAlert.updateMany({
    where: { resolved: false },
    data: { resolved: true },
  });

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/inventory");

  return { success: true };
}
