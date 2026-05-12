import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") ?? "";

  const txList = await prisma.stockTransaction.findMany({
    where: type ? { type: type as any } : {},
    orderBy: { createdAt: "desc" },
    include: {
      item: { select: { sku: true, modelName: true } },
      user: { select: { name: true } },
    },
  });

  const header = ["유형", "품목명", "SKU", "수량", "참조번호", "처리자", "비고", "일시"];
  const rows = txList.map((tx) => [
    tx.type,
    tx.item.modelName,
    tx.item.sku,
    tx.quantity,
    tx.reference ?? "",
    tx.user.name,
    tx.notes ?? "",
    tx.createdAt.toISOString().slice(0, 16).replace("T", " "),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
