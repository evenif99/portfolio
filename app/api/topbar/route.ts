import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kstStartOfToday } from "@/lib/datetime";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [alertItems, recentTransactions, todayTxCount] = await Promise.all([
    prisma.lowStockAlert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { item: { select: { sku: true, modelName: true, quantity: true, safetyStock: true } } },
    }),
    prisma.stockTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        item: { select: { sku: true, modelName: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.stockTransaction.count({
      where: { createdAt: { gte: kstStartOfToday() } },
    }),
  ]);

  return NextResponse.json({ alertItems, recentTransactions, todayTxCount });
}
