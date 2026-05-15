"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Status = "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";

const STATUS_LIST: Status[] = ["DRAFT", "ORDERED", "RECEIVED", "CANCELLED"];
const STORAGE_KEY = "po_filter_presets_v1";

interface Preset {
  id: string;
  name: string;
  query: string;
}

export function POAdvancedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [refreshKey, setRefreshKey] = useState(0);

  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const selectedStatuses = (params.get("statuses") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as Status[];

  const apply = (mutator: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(searchParams.toString());
    mutator(p);
    p.delete("page");
    router.replace(`${pathname}?${p.toString()}`);
  };

  const toggleStatus = (status: Status) => {
    const next = new Set(selectedStatuses);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    apply((p) => {
      const val = Array.from(next).join(",");
      if (val) p.set("statuses", val);
      else p.delete("statuses");
    });
  };

  const presets: Preset[] = (() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Preset[];
    } catch {
      return [];
    }
  })();

  const savePreset = () => {
    const name = window.prompt("Preset name");
    if (!name) return;

    const query = searchParams.toString();
    const current = presets;
    const next: Preset[] = [{ id: crypto.randomUUID(), name, query }, ...current].slice(0, 12);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setRefreshKey((k) => k + 1);
  };

  const applyPreset = (preset: Preset) => {
    router.replace(`${pathname}?${preset.query}`);
  };

  const deletePreset = (id: string) => {
    const next = presets.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setRefreshKey((k) => k + 1);
  };

  void refreshKey;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5">
        <input
          defaultValue={params.get("q") ?? ""}
          placeholder="Order no / supplier"
          className="rounded-md border border-border px-3 py-2 text-sm"
          onChange={(e) => apply((p) => {
            if (e.target.value.trim()) p.set("q", e.target.value);
            else p.delete("q");
          })}
        />
        <input
          type="date"
          value={params.get("from") ?? ""}
          className="rounded-md border border-border px-3 py-2 text-sm"
          onChange={(e) => apply((p) => {
            if (e.target.value) p.set("from", e.target.value);
            else p.delete("from");
          })}
        />
        <input
          type="date"
          value={params.get("to") ?? ""}
          className="rounded-md border border-border px-3 py-2 text-sm"
          onChange={(e) => apply((p) => {
            if (e.target.value) p.set("to", e.target.value);
            else p.delete("to");
          })}
        />
        <input
          type="number"
          value={params.get("minAmount") ?? ""}
          placeholder="Min amount"
          className="rounded-md border border-border px-3 py-2 text-sm"
          onChange={(e) => apply((p) => {
            if (e.target.value) p.set("minAmount", e.target.value);
            else p.delete("minAmount");
          })}
        />
        <input
          type="number"
          value={params.get("maxAmount") ?? ""}
          placeholder="Max amount"
          className="rounded-md border border-border px-3 py-2 text-sm"
          onChange={(e) => apply((p) => {
            if (e.target.value) p.set("maxAmount", e.target.value);
            else p.delete("maxAmount");
          })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_LIST.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => toggleStatus(status)}
            className={`rounded-full border px-2.5 py-1 text-xs ${selectedStatuses.includes(status) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border text-muted-foreground"}`}
          >
            {status}
          </button>
        ))}

        <button
          type="button"
          onClick={savePreset}
          className="ml-auto rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
        >
          Save preset
        </button>
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((preset) => (
            <div key={preset.id} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1">
              <button type="button" onClick={() => applyPreset(preset)} className="text-xs text-foreground hover:text-blue-600">
                {preset.name}
              </button>
              <button type="button" onClick={() => deletePreset(preset.id)} className="text-[11px] text-muted-foreground">x</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
