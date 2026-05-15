"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface SearchItem {
  id: number;
  sku: string;
  modelName: string;
}

interface SearchSupplier {
  id: number;
  name: string;
}

interface SearchOrder {
  id: number;
  orderNo: string;
  status: string;
  supplier: { name: string };
}

interface SearchResult {
  items: SearchItem[];
  suppliers: SearchSupplier[];
  orders: SearchOrder[];
}

export function GlobalSearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult>({ items: [], suppliers: [], orders: [] });
  const [loading, setLoading] = useState(false);
  const latestReqRef = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResult({ items: [], suppliers: [], orders: [] });
      setLoading(false);
      return;
    }

    const reqId = ++latestReqRef.current;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search/global?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as SearchResult;
        // Only apply the latest response to prevent stale overwrite.
        if (latestReqRef.current === reqId) {
          setResult(data);
        }
      } catch {
        // ignore aborted/in-flight request errors
      } finally {
        if (latestReqRef.current === reqId) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      {/* 모바일: 아이콘만 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
        aria-label="검색"
      >
        <Search className="h-4 w-4" />
      </button>
      {/* 데스크탑: 텍스트 + 단축키 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        검색
        <span className="rounded border border-border px-1.5 py-0.5 text-[10px]">Cmd+K</span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Global Search" description="Search items, suppliers, and purchase orders">
        <CommandInput value={query} onValueChange={setQuery} placeholder="Search SKU, supplier, or order number..." />
        <CommandList>
          <CommandEmpty>
            {query.trim() ? (loading ? "Searching..." : "No result") : "Type to search"}
          </CommandEmpty>

          {result.items.length > 0 && (
            <CommandGroup heading="Items">
              {result.items.slice(0, 5).map((item) => (
                <CommandItem
                  key={`item-${item.id}`}
                  value={`${item.modelName} ${item.sku}`}
                  onSelect={() => go(`/dashboard/inventory/${item.id}`)}
                >
                  {item.modelName} ({item.sku})
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {result.suppliers.length > 0 && (
            <CommandGroup heading="Suppliers">
              {result.suppliers.map((supplier) => (
                <CommandItem
                  key={`supplier-${supplier.id}`}
                  value={supplier.name}
                  onSelect={() => go(`/dashboard/suppliers/${supplier.id}`)}
                >
                  {supplier.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {result.orders.length > 0 && (
            <CommandGroup heading="Purchase Orders">
              {result.orders.map((po) => (
                <CommandItem
                  key={`po-${po.id}`}
                  value={`${po.orderNo} ${po.supplier.name} ${po.status}`}
                  onSelect={() => go(`/dashboard/purchase-orders/${po.id}`)}
                >
                  {po.orderNo} · {po.supplier.name} · {po.status}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
