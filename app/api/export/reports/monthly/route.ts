import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSpreadsheetXml } from "@/lib/export/spreadsheet";

function monthRange(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));
    return { start, end, label: month };
  }

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const label = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`;
  return { start, end, label };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = req.nextUrl;
  const { start, end, label } = monthRange(searchParams.get("month") ?? undefined);

  const txs = await prisma.stockTransaction.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "asc" },
    include: {
      item: { select: { sku: true, modelName: true, category: { select: { name: true } } } },
      user: { select: { name: true } },
    },
  });

  const inbound = txs.filter((t) => t.type === "INBOUND").reduce((s, t) => s + t.quantity, 0);
  const outbound = Math.abs(txs.filter((t) => t.type === "OUTBOUND").reduce((s, t) => s + t.quantity, 0));

  const dailyMap = new Map<string, { in: number; out: number }>();
  for (const tx of txs) {
    const key = tx.createdAt.toISOString().slice(0, 10);
    const d = dailyMap.get(key) ?? { in: 0, out: 0 };
    if (tx.type === "INBOUND") d.in += tx.quantity;
    if (tx.type === "OUTBOUND") d.out += Math.abs(tx.quantity);
    dailyMap.set(key, d);
  }

  const summaryRows = [
    ["Month", "Inbound Qty", "Outbound Qty", "Net Qty", "Transaction Count"],
    [label, inbound, outbound, inbound - outbound, txs.length],
  ];

  const dailyRows = [
    ["Date", "Inbound Qty", "Outbound Qty", "Net Qty"],
    ...Array.from(dailyMap.entries()).map(([date, v]) => [date, v.in, v.out, v.in - v.out]),
  ];

  const detailRows = [
    ["DateTime", "Type", "SKU", "Model", "Category", "Quantity", "Reference", "User"],
    ...txs.map((tx) => [
      tx.createdAt,
      tx.type,
      tx.item.sku,
      tx.item.modelName,
      tx.item.category.name,
      tx.quantity,
      tx.reference ?? "",
      tx.user.name,
    ]),
  ];

  const workbook = buildSpreadsheetXml([
    { name: "Summary", columns: [100, 100, 100, 90, 110], rows: summaryRows },
    { name: "Daily", columns: [100, 100, 100, 90], rows: dailyRows },
    { name: "Transactions", columns: [150, 90, 110, 180, 120, 80, 130, 100], rows: detailRows },
  ]);

  const filename = `monthly_report_${label}.xls`;

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
