import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSpreadsheetXml } from "@/lib/export/spreadsheet";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const supplierIdParam = req.nextUrl.searchParams.get("supplierId");
  const supplierId = supplierIdParam ? Number(supplierIdParam) : undefined;

  const prices = await prisma.supplierItemPrice.findMany({
    where: supplierId ? { supplierId } : {},
    orderBy: [{ supplier: { name: "asc" } }, { item: { modelName: "asc" } }],
    include: {
      supplier: { select: { name: true } },
      item: { select: { sku: true, modelName: true, category: { select: { name: true } } } },
    },
  });

  const rows = [
    ["Supplier", "SKU", "Model", "Category", "UnitPrice", "MOQ", "Notes", "UpdatedAt"],
    ...prices.map((p) => [
      p.supplier.name,
      p.item.sku,
      p.item.modelName,
      p.item.category.name,
      p.unitPrice,
      p.moq ?? "",
      p.notes ?? "",
      p.updatedAt,
    ]),
  ];

  const workbook = buildSpreadsheetXml([
    {
      name: "SupplierPrices",
      columns: [150, 110, 180, 120, 90, 70, 220, 150],
      rows,
    },
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = supplierId ? `supplier_${supplierId}_price_table_${stamp}.xls` : `supplier_price_table_${stamp}.xls`;

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
