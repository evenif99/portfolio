-- Add transfer enum value
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'TRANSFER';

-- Add warehouse capacity
ALTER TABLE "Warehouse"
ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 5000;

-- Add transfer warehouse relation columns to stock transactions
ALTER TABLE "StockTransaction"
ADD COLUMN "transferFromId" INTEGER,
ADD COLUMN "transferToId" INTEGER;

ALTER TABLE "StockTransaction"
ADD CONSTRAINT "StockTransaction_transferFromId_fkey"
FOREIGN KEY ("transferFromId") REFERENCES "Warehouse"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StockTransaction"
ADD CONSTRAINT "StockTransaction_transferToId_fkey"
FOREIGN KEY ("transferToId") REFERENCES "Warehouse"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
