import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSpreadsheetXml } from "@/lib/export/spreadsheet";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const items = await prisma.inventoryItem.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { sku: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
                { modelName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        status ? { status: status as any } : {},
      ],
    },
    orderBy: { sku: "asc" },
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
      warehouse: { select: { name: true } },
      supplier: { select: { name: true } },
    },
  });

  const rows = [
    ["SKU", "Name", "Model", "Category", "Brand", "Supplier", "Warehouse", "Quantity", "SafetyStock", "UnitPrice", "Value", "Status", "CreatedAt"],
    ...items.map((i) => [
      i.sku,
      i.name,
      i.modelName,
      i.category.name,
      i.brand.name,
      i.supplier?.name ?? "",
      i.warehouse.name,
      i.quantity,
      i.safetyStock,
      i.unitPrice ?? 0,
      i.quantity * (i.unitPrice ?? 0),
      i.status,
      i.createdAt,
    ]),
  ];

  const workbook = buildSpreadsheetXml([
    {
      name: "Inventory",
      columns: [100, 150, 180, 120, 120, 130, 120, 70, 90, 90, 100, 100, 150],
      rows,
    },
  ]);

  const filename = `inventory_${new Date().toISOString().slice(0, 10)}.xls`;

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
