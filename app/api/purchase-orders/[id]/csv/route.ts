import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kstDateString } from "@/lib/datetime";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);

  const po = await prisma.purchaseOrder.findUnique({
    where:   { id: orderId },
    include: {
      supplier:  { select: { name: true } },
      createdBy: { select: { name: true } },
      items: {
        include: { item: { select: { modelName: true, sku: true } } },
      },
    },
  });

  if (!po) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = [
    ["발주번호", "공급업체", "작성일", "상태", "작성자"],
    [
      po.orderNo,
      po.supplier.name,
      kstDateString(po.createdAt),
      po.status,
      po.createdBy.name,
    ],
    [],
    ["품목명", "SKU", "발주수량", "단가(₩)", "금액(₩)", "실입고량"],
    ...po.items.map((it) => [
      it.item.modelName,
      it.item.sku,
      String(it.quantity),
      it.unitPrice != null ? String(it.unitPrice) : "",
      it.unitPrice != null ? String(it.unitPrice * it.quantity) : "",
      String(it.receivedQty),
    ]),
    [],
    [
      "합계",
      "",
      String(po.items.reduce((s, it) => s + it.quantity, 0)),
      "",
      String(po.items.reduce((s, it) => s + (it.unitPrice ?? 0) * it.quantity, 0)),
      String(po.items.reduce((s, it) => s + it.receivedQty, 0)),
    ],
  ];

  const csv =
    "﻿" + // BOM for Excel
    rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${po.orderNo}.csv"`,
    },
  });
}
