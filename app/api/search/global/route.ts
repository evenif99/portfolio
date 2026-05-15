import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 1) return NextResponse.json({ items: [], suppliers: [], orders: [] });

  const [items, suppliers, orders] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: {
        OR: [
          { sku: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { modelName: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, sku: true, modelName: true },
    }),
    prisma.supplier.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: { id: true, name: true },
    }),
    prisma.purchaseOrder.findMany({
      where: {
        OR: [
          { orderNo: { contains: q, mode: "insensitive" } },
          { supplier: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, orderNo: true, supplier: { select: { name: true } }, status: true },
    }),
  ]);

  return NextResponse.json({ items, suppliers, orders });
}
