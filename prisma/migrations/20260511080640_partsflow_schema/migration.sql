/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'RETURN');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'APPROVED', 'PICKING', 'PACKED', 'SHIPPED', 'DELAYED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR', 'VIEWER');

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Project";

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "zone" TEXT,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "brandId" INTEGER NOT NULL,
    "supplierId" INTEGER,
    "warehouseId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "safetyStock" INTEGER NOT NULL DEFAULT 10,
    "unitPrice" DOUBLE PRECISION,
    "status" "ItemStatus" NOT NULL DEFAULT 'IN_STOCK',
    "specs" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransaction" (
    "id" SERIAL NOT NULL,
    "type" "TransactionType" NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "shipmentNo" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "requester" TEXT NOT NULL,
    "department" TEXT,
    "dueDate" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentItem" (
    "id" SERIAL NOT NULL,
    "shipmentId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ShipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LowStockAlert" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LowStockAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "InventoryItem"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shipmentNo_key" ON "Shipment"("shipmentNo");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LowStockAlert" ADD CONSTRAINT "LowStockAlert_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
