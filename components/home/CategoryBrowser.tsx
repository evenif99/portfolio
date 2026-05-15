"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const categories = [
  {
    name: "GPU",
    desc: "그래픽 카드",
    sub: "NVIDIA RTX / AMD Radeon",
    products: [
      { name: "NVIDIA GeForce RTX 4060 Ti", spec: "8GB GDDR6 · Ada Lovelace",    img: "/images/products/gpu-nv-4060ti.jpg"   },
      { name: "NVIDIA GeForce RTX 4070 Super", spec: "12GB GDDR6X · Ada Lovelace", img: "/images/products/gpu-nv-4070s.jpg"    },
      { name: "NVIDIA GeForce RTX 4080 Super", spec: "16GB GDDR6X · Ada Lovelace", img: "/images/products/gpu-nv-4080s.jpg"    },
      { name: "AMD Radeon RX 7600",          spec: "8GB GDDR6 · RDNA3",           img: "/images/products/gpu-amd-rx7600.jpg"  },
      { name: "AMD Radeon RX 7800 XT",       spec: "16GB GDDR6 · RDNA3",          img: "/images/products/gpu-amd-rx7800xt.jpg"},
    ],
  },
  {
    name: "CPU",
    desc: "프로세서",
    sub: "Intel Core / AMD Ryzen",
    products: [
      { name: "AMD Ryzen 5 7600X",    spec: "6코어 12스레드 · AM5 · 105W",   img: "/images/products/cpu-amd-r5-7600x.jpg"  },
      { name: "AMD Ryzen 7 7700X",    spec: "8코어 16스레드 · AM5 · 105W",   img: "/images/products/cpu-amd-r7-7700x.jpg"  },
      { name: "AMD Ryzen 9 9900X",    spec: "12코어 24스레드 · AM5 · 120W",  img: "/images/products/cpu-amd-r9-9900x.png"  },
      { name: "Intel Core i5-13400F", spec: "10코어 16스레드 · LGA1700 · 65W", img: "/images/products/cpu-int-i5-13400f.jpg" },
      { name: "Intel Core i7-13700K", spec: "16코어 24스레드 · LGA1700 · 125W", img: "/images/products/cpu-int-i7-13700k.jpg" },
    ],
  },
  {
    name: "RAM",
    desc: "메모리",
    sub: "DDR4 / DDR5",
    products: [
      { name: "Corsair Vengeance DDR5 64GB", spec: "DDR5-6000 · CL30 · 2×32GB",   img: "/images/products/ram-cor-ddr5-64.webp" },
      { name: "G.Skill Trident Z5 DDR5 32GB", spec: "DDR5-6400 · CL32 · 2×16GB", img: "/images/products/ram-gsk-tz5-32.png"   },
      { name: "Samsung DDR5 32GB",           spec: "DDR5-4800 · ECC · 2×16GB",    img: "/images/products/ram-sam-ddr5-32.jpg"  },
    ],
  },
  {
    name: "SSD",
    desc: "솔리드 스테이트 드라이브",
    sub: "NVMe PCIe 4.0 / SATA",
    products: [
      { name: "SK Hynix Platinum P41 1TB",  spec: "NVMe PCIe 4.0 · R:7000 W:6500 MB/s", img: "/images/products/ssd-skh-p41-1t.jpg"    },
      { name: "Samsung 990 EVO 2TB",        spec: "NVMe PCIe 4.0 · R:5000 W:4200 MB/s", img: "/images/products/ssd-sam-990evo-2t.jpg"  },
      { name: "Samsung 990 PRO 1TB",        spec: "NVMe PCIe 4.0 · R:7450 W:6900 MB/s", img: "/images/products/ssd-sam-990pro-1t.jpg"  },
      { name: "Samsung 870 EVO 2TB",        spec: "SATA · R:560 W:530 MB/s",             img: "/images/products/ssd-sam-870evo-2t.jpg"  },
    ],
  },
  {
    name: "HDD",
    desc: "하드 디스크 드라이브",
    sub: "SATA 3.5\"",
    products: [
      { name: "Seagate BarraCuda 2TB", spec: "SATA · 7200 RPM · 256MB 캐시", img: "/images/products/hdd-sea-2t.jpg" },
      { name: "Seagate BarraCuda 4TB", spec: "SATA · 5400 RPM · 256MB 캐시", img: "/images/products/hdd-sea-4t.jpg" },
    ],
  },
  {
    name: "메인보드",
    desc: "마더보드",
    sub: "AM5 / LGA1700",
    products: [
      { name: "ASUS ROG Strix B650E-F",   spec: "AM5 · DDR5 · PCIe 5.0 · ATX",    img: "/images/products/mb-asus-b650e.png" },
      { name: "MSI MAG Z790 Tomahawk",    spec: "LGA1700 · DDR5 · PCIe 5.0 · ATX", img: "/images/products/mb-msi-z790.jpg"   },
    ],
  },
  {
    name: "PSU",
    desc: "파워 서플라이",
    sub: "80+ Gold / Platinum",
    products: [
      { name: "Seasonic Focus GX-850",     spec: "850W · 80+ Gold · 모듈러",   img: "/images/products/psu-seasonic-850g.jpg"   },
      { name: "be quiet! Dark Power 13 1000W", spec: "1000W · 80+ Platinum · 모듈러", img: "/images/products/psu-bequiet-1000p.jpg" },
    ],
  },
  {
    name: "케이스",
    desc: "컴퓨터 케이스",
    sub: "ATX / mATX",
    products: [
      { name: "Fractal Design North", spec: "ATX · Mid-Tower · 원목 패널", img: "/images/products/case-fractal-north.jpg" },
    ],
  },
  {
    name: "쿨러",
    desc: "CPU 쿨러",
    sub: "공랭 / 수랭",
    products: [
      { name: "Noctua NH-D15", spec: "공랭 · 듀얼 타워 · 2×140mm 팬", img: "/images/products/cool-noctua-nhd15.jpg" },
    ],
  },
];

export function CategoryBrowser() {
  const [active, setActive] = useState(0);
  const cat = categories[active];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-border scrollbar-none">
        {categories.map((c, i) => (
          <button
            key={c.name}
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
              key={p.name}
              className="group rounded-lg border border-border bg-card overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-muted/30 overflow-hidden">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
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
