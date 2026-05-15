"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductItem = {
  id: number;
  name: string;
  spec: string;
  img: string | null;
};

export type CategoryData = {
  slug: string;
  name: string;
  desc: string;
  sub: string;
  products: ProductItem[];
};

export function CategoryBrowser({ categories }: { categories: CategoryData[] }) {
  const [active, setActive] = useState(0);
  const cat = categories[active];

  if (!cat) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-border scrollbar-none">
        {categories.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => setActive(i)}
            className={cn(
              "flex-shrink-0 px-4 py-3 text-[12px] font-semibold transition-colors border-b-2 whitespace-nowrap",
              i === active
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {c.name}
            <span className="ml-1.5 text-[10px] font-normal opacity-60">{c.products.length}종</span>
          </button>
        ))}
      </div>

      {/* Category header */}
      <div className="px-5 py-4 border-b border-border bg-muted/20">
        <p className="text-base font-bold text-foreground">{cat.desc}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{cat.sub} · {cat.products.length}개 품목 관리 중</p>
      </div>

      {/* Product grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {cat.products.map((p) => (
            <div
              key={p.id}
              className="group rounded-lg border border-border bg-card overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
                {p.img ? (
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                    <Package className="h-8 w-8" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-3 border-t border-border">
                <p className="text-[11px] font-semibold text-foreground leading-snug line-clamp-2">{p.name}</p>
                <p className="mt-1 text-[10px] text-muted-foreground leading-snug line-clamp-2">{p.spec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
