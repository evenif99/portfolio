import { cn } from "@/lib/utils";

interface StockLevelBarProps {
  quantity: number;
  safetyStock: number;
  maxDisplay?: number;
  showLabel?: boolean;
}

export function StockLevelBar({ quantity, safetyStock, maxDisplay, showLabel = true }: StockLevelBarProps) {
  const max = maxDisplay ?? Math.max(safetyStock * 3, quantity + 5);
  const pct = Math.min(100, Math.round((quantity / max) * 100));
  const isOut = quantity === 0;
  const isLow = quantity > 0 && quantity < safetyStock;

  return (
    <div className="flex items-center gap-2 min-w-0">
      {showLabel && (
        <span className={cn(
          "w-8 text-right text-xs font-semibold tabular-nums flex-shrink-0",
          isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-foreground",
        )}>
          {quantity}
        </span>
      )}
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[40px]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isOut ? "bg-red-400" : isLow ? "bg-amber-400" : "bg-emerald-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
