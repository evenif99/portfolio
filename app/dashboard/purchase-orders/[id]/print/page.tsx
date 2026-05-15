import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PurchaseOrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: orderId },
    include: {
      supplier: { select: { name: true, contact: true, phone: true, address: true } },
      createdBy: { select: { name: true } },
      items: {
        include: { item: { select: { modelName: true, sku: true } } },
      },
    },
  });

  if (!po) notFound();

  const total = po.items.reduce((sum, line) => sum + line.quantity * (line.unitPrice ?? 0), 0);

  return (
    <div className="mx-auto max-w-[980px] bg-white p-8 text-black print:max-w-none print:p-4">
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">Purchase Order</h1>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <p><span className="font-semibold">Order No:</span> {po.orderNo}</p>
          <p><span className="font-semibold">Status:</span> {po.status}</p>
          <p><span className="font-semibold">Created By:</span> {po.createdBy.name}</p>
          <p><span className="font-semibold">Created At:</span> {po.createdAt.toISOString().slice(0, 10)}</p>
          <p><span className="font-semibold">Ordered At:</span> {po.orderedAt ? po.orderedAt.toISOString().slice(0, 10) : "-"}</p>
          <p><span className="font-semibold">Expected At:</span> {po.expectedAt ? po.expectedAt.toISOString().slice(0, 10) : "-"}</p>
        </div>
      </header>

      <section className="mb-6 rounded border p-4">
        <h2 className="mb-2 text-base font-bold">Supplier</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p><span className="font-semibold">Name:</span> {po.supplier.name}</p>
          <p><span className="font-semibold">Contact:</span> {po.supplier.contact ?? "-"}</p>
          <p><span className="font-semibold">Phone:</span> {po.supplier.phone ?? "-"}</p>
          <p><span className="font-semibold">Address:</span> {po.supplier.address ?? "-"}</p>
        </div>
      </section>

      <section>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border px-2 py-2 text-left">SKU</th>
              <th className="border px-2 py-2 text-left">Model</th>
              <th className="border px-2 py-2 text-right">Qty</th>
              <th className="border px-2 py-2 text-right">Unit Price</th>
              <th className="border px-2 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {po.items.map((line) => {
              const amount = line.quantity * (line.unitPrice ?? 0);
              return (
                <tr key={line.id}>
                  <td className="border px-2 py-2">{line.item.sku}</td>
                  <td className="border px-2 py-2">{line.item.modelName}</td>
                  <td className="border px-2 py-2 text-right">{line.quantity.toLocaleString()}</td>
                  <td className="border px-2 py-2 text-right">{line.unitPrice != null ? line.unitPrice.toLocaleString() : "-"}</td>
                  <td className="border px-2 py-2 text-right">{amount > 0 ? amount.toLocaleString() : "-"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="border px-2 py-2 text-right font-bold" colSpan={4}>Total</td>
              <td className="border px-2 py-2 text-right font-bold">{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {po.notes && (
        <section className="mt-6 rounded border p-4 text-sm">
          <h2 className="mb-2 text-base font-bold">Notes</h2>
          <p className="whitespace-pre-wrap">{po.notes}</p>
        </section>
      )}
    </div>
  );
}

