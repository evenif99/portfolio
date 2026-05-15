"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
      return;
    }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search/global?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = (await res.json()) as SearchResult;
      setResult(data);
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  const hasAny = useMemo(
    () => result.items.length + result.suppliers.length + result.orders.length > 0,
    [result],
  );

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
      >
        Search
        <span className="rounded border border-border px-1.5 py-0.5 text-[10px]">Cmd+K</span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Global Search" description="Search items, suppliers, and purchase orders">
        <CommandInput value={query} onValueChange={setQuery} placeholder="Search SKU, supplier, or order number..." />
        <CommandList>
          <CommandEmpty>{query.trim() ? "No result" : "Type to search"}</CommandEmpty>

          {result.items.length > 0 && (
            <CommandGroup heading="Items">
              {result.items.map((item) => (
                <CommandItem key={`item-${item.id}`} onSelect={() => go(`/dashboard/inventory/${item.id}`)}>
                  {item.modelName} ({item.sku})
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {result.suppliers.length > 0 && (
            <CommandGroup heading="Suppliers">
              {result.suppliers.map((supplier) => (
                <CommandItem key={`supplier-${supplier.id}`} onSelect={() => go(`/dashboard/suppliers/${supplier.id}`)}>
                  {supplier.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {result.orders.length > 0 && (
            <CommandGroup heading="Purchase Orders">
              {result.orders.map((po) => (
                <CommandItem key={`po-${po.id}`} onSelect={() => go(`/dashboard/purchase-orders/${po.id}`)}>
                  {po.orderNo} · {po.supplier.name} · {po.status}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!hasAny && query.trim().length > 0 && <CommandEmpty>No result</CommandEmpty>}
        </CommandList>
      </CommandDialog>
    </>
  );
}
