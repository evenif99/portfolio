-- CreateTable
CREATE TABLE "SupplierItemPrice" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "moq" INTEGER,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierItemPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierItemPrice_supplierId_itemId_key" ON "SupplierItemPrice"("supplierId", "itemId");

-- AddForeignKey
ALTER TABLE "SupplierItemPrice" ADD CONSTRAINT "SupplierItemPrice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierItemPrice" ADD CONSTRAINT "SupplierItemPrice_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
