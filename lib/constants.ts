import type { ItemStatus, TransactionType, ShipmentStatus, Priority } from "./types";

// ─── Item Status ──────────────────────────────────────────────────────────────

export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  IN_STOCK:     "재고 있음",
  LOW_STOCK:    "재고 부족",
  OUT_OF_STOCK: "재고 없음",
  DISCONTINUED: "단종",
};

export const ITEM_STATUS_COLOR: Record<ItemStatus, string> = {
  IN_STOCK:     "bg-emerald-50 text-emerald-700 ring-emerald-200",
  LOW_STOCK:    "bg-amber-50 text-amber-700 ring-amber-200",
  OUT_OF_STOCK: "bg-red-50 text-red-600 ring-red-200",
  DISCONTINUED: "bg-zinc-100 text-zinc-500 ring-zinc-200",
};

export const ITEM_STATUS_DOT: Record<ItemStatus, string> = {
  IN_STOCK:     "bg-emerald-500",
  LOW_STOCK:    "bg-amber-500",
  OUT_OF_STOCK: "bg-red-500",
  DISCONTINUED: "bg-zinc-400",
};

// ─── Transaction Type ─────────────────────────────────────────────────────────

export const TX_TYPE_LABEL: Record<TransactionType, string> = {
  INBOUND:    "입고",
  OUTBOUND:   "출고",
  ADJUSTMENT: "조정",
  RETURN:     "반품",
};

export const TX_TYPE_COLOR: Record<TransactionType, string> = {
  INBOUND:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OUTBOUND:   "bg-blue-50 text-blue-700 ring-blue-200",
  ADJUSTMENT: "bg-violet-50 text-violet-700 ring-violet-200",
  RETURN:     "bg-amber-50 text-amber-700 ring-amber-200",
};

export const TX_TYPE_SIGN: Record<TransactionType, string> = {
  INBOUND:    "+",
  OUTBOUND:   "-",
  ADJUSTMENT: "±",
  RETURN:     "+",
};

// ─── Shipment Status ──────────────────────────────────────────────────────────

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  PENDING:   "대기",
  APPROVED:  "승인",
  PICKING:   "피킹",
  PACKED:    "패킹",
  SHIPPED:   "출하",
  DELAYED:   "지연",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

export const SHIPMENT_STATUS_COLOR: Record<ShipmentStatus, string> = {
  PENDING:   "bg-zinc-100 text-zinc-600 ring-zinc-200",
  APPROVED:  "bg-blue-50 text-blue-700 ring-blue-200",
  PICKING:   "bg-indigo-50 text-indigo-700 ring-indigo-200",
  PACKED:    "bg-violet-50 text-violet-700 ring-violet-200",
  SHIPPED:   "bg-teal-50 text-teal-700 ring-teal-200",
  DELAYED:   "bg-red-50 text-red-600 ring-red-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-zinc-100 text-zinc-500 ring-zinc-200",
};

// ─── Priority ─────────────────────────────────────────────────────────────────

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW:    "낮음",
  NORMAL: "보통",
  HIGH:   "높음",
  URGENT: "긴급",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  LOW:    "bg-zinc-100 text-zinc-500 ring-zinc-200",
  NORMAL: "bg-blue-50 text-blue-600 ring-blue-200",
  HIGH:   "bg-amber-50 text-amber-700 ring-amber-200",
  URGENT: "bg-red-50 text-red-600 ring-red-200",
};

// ─── Category Slugs ───────────────────────────────────────────────────────────

export const CATEGORY_SLUGS = {
  GPU:   "gpu",
  CPU:   "cpu",
  RAM:   "ram",
  SSD:   "ssd",
  HDD:   "hdd",
  MB:    "mainboard",
  PSU:   "psu",
  CASE:  "case",
  COOL:  "cooler",
} as const;
