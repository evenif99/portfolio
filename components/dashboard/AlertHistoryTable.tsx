import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { kstDateTimeString } from "@/lib/datetime";

interface HistoryAlert {
  id:        number;
  threshold: number;
  resolved:  boolean;
  createdAt: Date;
  item: { sku: string; modelName: string };
}

interface AlertHistoryTableProps {
  alerts: HistoryAlert[];
}

export function AlertHistoryTable({ alerts }: AlertHistoryTableProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-[12px] font-semibold text-foreground">해제된 알림 없음</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">처리된 알림 내역이 여기 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">품목</th>
            <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">임계값</th>
            <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">발생 시각</th>
            <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {alerts.map((a) => (
            <tr key={a.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-2.5">
                <p className="font-semibold text-foreground">{a.item.modelName}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{a.item.sku}</p>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{a.threshold}</td>
              <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{kstDateTimeString(a.createdAt)}</td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  해제됨
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
