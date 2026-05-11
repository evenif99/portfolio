// ─── Enums (mirror Prisma enums for client-side use) ──────────────────────────

export type ItemStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";
export type TransactionType = "INBOUND" | "OUTBOUND" | "ADJUSTMENT" | "RETURN";
export type ShipmentStatus = "PENDING" | "APPROVED" | "PICKING" | "PACKED" | "SHIPPED" | "DELAYED" | "COMPLETED" | "CANCELLED";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type UserRole = "ADMIN" | "OPERATOR" | "VIEWER";

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  itemCount?: number;
}

export interface Brand {
  id: number;
  name: string;
  itemCount?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  itemCount?: number;
  createdAt: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  zone?: string;
  itemCount?: number;
  totalQuantity?: number;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  modelName: string;
  category: Category;
  brand: Brand;
  supplier?: Supplier;
  warehouse: Warehouse;
  quantity: number;
  safetyStock: number;
  unitPrice?: number;
  status: ItemStatus;
  specs?: Record<string, string>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: number;
  type: TransactionType;
  item: Pick<InventoryItem, "id" | "sku" | "name" | "modelName">;
  quantity: number;
  user: { id: number; name: string };
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface ShipmentItem {
  id: number;
  item: Pick<InventoryItem, "id" | "sku" | "name" | "modelName">;
  quantity: number;
}

export interface Shipment {
  id: number;
  shipmentNo: string;
  status: ShipmentStatus;
  priority: Priority;
  requester: string;
  department?: string;
  dueDate?: string;
  shippedAt?: string;
  user: { id: number; name: string };
  items: ShipmentItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LowStockAlert {
  id: number;
  item: Pick<InventoryItem, "id" | "sku" | "name" | "modelName" | "quantity" | "safetyStock">;
  threshold: number;
  resolved: boolean;
  createdAt: string;
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface DashboardKpis {
  totalSkus: number;
  totalQuantity: number;
  todayInbound: number;
  todayOutbound: number;
  lowStockCount: number;
  urgentShipments: number;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}
