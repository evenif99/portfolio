import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const items = await prisma.inventoryItem.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { sku:       { contains: search, mode: "insensitive" } },
            { name:      { contains: search, mode: "insensitive" } },
            { modelName: { contains: search, mode: "insensitive" } },
          ],
        } : {},
        status ? { status: status as any } : {},
      ],
    },
    orderBy: { sku: "asc" },
    include: {
      category:  { select: { name: true } },
      brand:     { select: { name: true } },
      warehouse: { select: { name: true } },
      supplier:  { select: { name: true } },
    },
  });

  const header = ["SKU", "품목명", "모델명", "카테고리", "브랜드", "공급업체", "창고", "재고", "안전재고", "단가", "상태", "등록일"];
  const rows = items.map((i) => [
    i.sku,
    i.name,
    i.modelName,
    i.category.name,
    i.brand.name,
    i.supplier?.name ?? "",
    i.warehouse.name,
    i.quantity,
    i.safetyStock,
    i.unitPrice ?? "",
    i.status,
    i.createdAt.toISOString().slice(0, 10),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const filename = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
