-- Support same SKU across multiple warehouses for partial transfer
ALTER TABLE "InventoryItem"
DROP CONSTRAINT IF EXISTS "InventoryItem_sku_key";

CREATE UNIQUE INDEX IF NOT EXISTS "InventoryItem_sku_warehouseId_key"
ON "InventoryItem"("sku", "warehouseId");
