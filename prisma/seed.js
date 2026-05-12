/* eslint-disable */
"use strict";

require("dotenv").config();

const { PrismaClient } = require("../generated/prisma/client/index.js");
const { PrismaPg }     = require("@prisma/adapter-pg");
const { Pool }         = require("pg");
const { hash }         = require("bcryptjs");

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding PartsFlow...");

  // ── Clear ─────────────────────────────────────────────────────────────────
  await prisma.lowStockAlert.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ─────────────────────────────────────────────────────────────────
  const pw = await hash("partsflow123!", 12);
  const [u1, u2] = await Promise.all([
    prisma.user.create({ data: { name: "김운영", email: "ops@partsflow.kr",       password: pw, role: "ADMIN"    } }),
    prisma.user.create({ data: { name: "이창고", email: "warehouse@partsflow.kr", password: pw, role: "OPERATOR" } }),
  ]);

  // ── Categories ────────────────────────────────────────────────────────────
  const [cGpu, cCpu, cRam, cSsd, cHdd, cMb, cPsu, cCase, cCool] = await Promise.all([
    prisma.category.create({ data: { name: "그래픽카드 (GPU)", slug: "gpu",       icon: "Gpu"          } }),
    prisma.category.create({ data: { name: "프로세서 (CPU)",   slug: "cpu",       icon: "Cpu"          } }),
    prisma.category.create({ data: { name: "메모리 (RAM)",     slug: "ram",       icon: "MemoryStick"  } }),
    prisma.category.create({ data: { name: "SSD",             slug: "ssd",       icon: "HardDrive"    } }),
    prisma.category.create({ data: { name: "HDD",             slug: "hdd",       icon: "HardDrive"    } }),
    prisma.category.create({ data: { name: "메인보드",         slug: "mainboard", icon: "CircuitBoard" } }),
    prisma.category.create({ data: { name: "파워서플라이",      slug: "psu",       icon: "Zap"          } }),
    prisma.category.create({ data: { name: "케이스",           slug: "case",      icon: "Box"          } }),
    prisma.category.create({ data: { name: "쿨러/팬",          slug: "cooler",    icon: "Wind"         } }),
  ]);

  // ── Brands ────────────────────────────────────────────────────────────────
  const [bNv,bAmd,bIntel,bSam,bSkh,bSea,bAsus,bMsi,bGiga,bCor,bGsk,bSeas,bBeq,bNoc,bFrd] =
    await Promise.all([
      prisma.brand.create({ data: { name: "NVIDIA"         } }),
      prisma.brand.create({ data: { name: "AMD"            } }),
      prisma.brand.create({ data: { name: "Intel"          } }),
      prisma.brand.create({ data: { name: "Samsung"        } }),
      prisma.brand.create({ data: { name: "SK hynix"       } }),
      prisma.brand.create({ data: { name: "Seagate"        } }),
      prisma.brand.create({ data: { name: "ASUS"           } }),
      prisma.brand.create({ data: { name: "MSI"            } }),
      prisma.brand.create({ data: { name: "Gigabyte"       } }),
      prisma.brand.create({ data: { name: "Corsair"        } }),
      prisma.brand.create({ data: { name: "G.Skill"        } }),
      prisma.brand.create({ data: { name: "Seasonic"       } }),
      prisma.brand.create({ data: { name: "be quiet!"      } }),
      prisma.brand.create({ data: { name: "Noctua"         } }),
      prisma.brand.create({ data: { name: "Fractal Design" } }),
    ]);

  // ── Suppliers ─────────────────────────────────────────────────────────────
  const [s1, s2, s3, s4, s5] = await Promise.all([
    prisma.supplier.create({ data: { name: "대한IT유통",   contact: "김대한", email: "sales@daehanit.co.kr",    phone: "02-1234-5678",  address: "서울 용산구 한강대로 23"       } }),
    prisma.supplier.create({ data: { name: "하이텍코리아", contact: "이하이", email: "order@hitech-kr.com",     phone: "031-987-6543",  address: "경기 성남시 분당구 판교로 12" } }),
    prisma.supplier.create({ data: { name: "픽시부품유통", contact: "박픽시", email: "supply@pixiparts.kr",     phone: "032-456-7890",  address: "인천 서구 청라국제도시로 44" } }),
    prisma.supplier.create({ data: { name: "넥스트레벨IT", contact: "최넥스", email: "b2b@nextlevelit.kr",      phone: "02-5678-1234",  address: "서울 강남구 테헤란로 518"     } }),
    prisma.supplier.create({ data: { name: "코어하드웨어", contact: "정코어", email: "wholesale@corehw.co.kr",  phone: "051-321-6547",  address: "부산 해운대구 센텀북대로 60" } }),
  ]);

  // ── Warehouses ────────────────────────────────────────────────────────────
  const [w1, w2, w3] = await Promise.all([
    prisma.warehouse.create({ data: { name: "인천 A동",    location: "인천 서구 원창동",    zone: "A"    } }),
    prisma.warehouse.create({ data: { name: "인천 B동",    location: "인천 서구 원창동",    zone: "B"    } }),
    prisma.warehouse.create({ data: { name: "서울 직배송",  location: "서울 강서구 양천로", zone: "서울" } }),
  ]);

  // ── Inventory Items ───────────────────────────────────────────────────────
  const itemDefs = [
    // GPU
    // GPU
    { sku:"GPU-NV-4060TI-001",  name:"NVIDIA GeForce RTX 4060 Ti 8GB",            modelName:"RTX 4060 Ti",          cId:cGpu.id,bId:bNv.id,   sId:s1.id,wId:w1.id,qty:34,saf:15,price:489000,  status:"IN_STOCK",     imageUrl:"/images/products/gpu-nv-4060ti.jpg",      specs:{메모리:"8GB GDDR6",   인터페이스:"PCIe 4.0 x16",TDP:"165W",포트:"HDMI 2.1 x1, DP 1.4a x3"} },
    { sku:"GPU-NV-4070S-001",   name:"NVIDIA GeForce RTX 4070 SUPER 12GB",         modelName:"RTX 4070 SUPER",       cId:cGpu.id,bId:bNv.id,   sId:s1.id,wId:w1.id,qty:8, saf:10,price:689000,  status:"LOW_STOCK",    imageUrl:"/images/products/gpu-nv-4070s.jpg",      specs:{메모리:"12GB GDDR6X", 인터페이스:"PCIe 4.0 x16",TDP:"220W",포트:"HDMI 2.1 x1, DP 1.4a x3"} },
    { sku:"GPU-NV-4080S-001",   name:"NVIDIA GeForce RTX 4080 SUPER 16GB",         modelName:"RTX 4080 SUPER",       cId:cGpu.id,bId:bNv.id,   sId:s2.id,wId:w1.id,qty:0, saf:8, price:1089000, status:"OUT_OF_STOCK", imageUrl:"/images/products/gpu-nv-4080s.jpg",      specs:{메모리:"16GB GDDR6X", 인터페이스:"PCIe 4.0 x16",TDP:"320W",포트:"HDMI 2.1 x1, DP 1.4a x3"} },
    { sku:"GPU-AMD-7600-001",   name:"AMD Radeon RX 7600 8GB",                     modelName:"RX 7600",              cId:cGpu.id,bId:bAmd.id,  sId:s1.id,wId:w1.id,qty:21,saf:12,price:319000,  status:"IN_STOCK",     imageUrl:"/images/products/gpu-amd-rx7600.jpg",    specs:{메모리:"8GB GDDR6",   인터페이스:"PCIe 4.0 x8", TDP:"165W",포트:"HDMI 2.1 x1, DP 2.1 x3"} },
    { sku:"GPU-AMD-7800XT-001", name:"AMD Radeon RX 7800 XT 16GB",                 modelName:"RX 7800 XT",           cId:cGpu.id,bId:bAmd.id,  sId:s2.id,wId:w1.id,qty:5, saf:8, price:519000,  status:"LOW_STOCK",    imageUrl:"/images/products/gpu-amd-rx7800xt.jpg",  specs:{메모리:"16GB GDDR6",  인터페이스:"PCIe 4.0 x16",TDP:"263W",포트:"HDMI 2.1 x1, DP 2.1 x2"} },
    // CPU
    { sku:"CPU-INT-13400F-001", name:"Intel Core i5-13400F",                       modelName:"Core i5-13400F",       cId:cCpu.id,bId:bIntel.id,sId:s1.id,wId:w1.id,qty:42,saf:20,price:179000,  status:"IN_STOCK",     imageUrl:"/images/products/cpu-int-i5-13400f.jpg", specs:{코어:"10C/16T",클럭:"2.5GHz / 4.6GHz",소켓:"LGA1700",TDP:"65W"} },
    { sku:"CPU-INT-13700K-001", name:"Intel Core i7-13700K",                       modelName:"Core i7-13700K",       cId:cCpu.id,bId:bIntel.id,sId:s1.id,wId:w1.id,qty:18,saf:10,price:339000,  status:"IN_STOCK",     imageUrl:"/images/products/cpu-int-i7-13700k.jpg", specs:{코어:"16C/24T",클럭:"3.4GHz / 5.4GHz",소켓:"LGA1700",TDP:"125W"} },
    { sku:"CPU-AMD-7600X-001",  name:"AMD Ryzen 5 7600X",                          modelName:"Ryzen 5 7600X",        cId:cCpu.id,bId:bAmd.id,  sId:s2.id,wId:w2.id,qty:3, saf:10,price:259000,  status:"LOW_STOCK",    imageUrl:"/images/products/cpu-amd-r5-7600x.jpg",  specs:{코어:"6C/12T", 클럭:"4.7GHz / 5.3GHz",소켓:"AM5",   TDP:"105W"} },
    { sku:"CPU-AMD-7700X-001",  name:"AMD Ryzen 7 7700X",                          modelName:"Ryzen 7 7700X",        cId:cCpu.id,bId:bAmd.id,  sId:s2.id,wId:w2.id,qty:14,saf:8, price:329000,  status:"IN_STOCK",     imageUrl:"/images/products/cpu-amd-r7-7700x.jpg",  specs:{코어:"8C/16T", 클럭:"4.5GHz / 5.4GHz",소켓:"AM5",   TDP:"105W"} },
    { sku:"CPU-AMD-9900X-001",  name:"AMD Ryzen 9 9900X",                          modelName:"Ryzen 9 9900X",        cId:cCpu.id,bId:bAmd.id,  sId:s4.id,wId:w2.id,qty:9, saf:6, price:529000,  status:"IN_STOCK",     imageUrl:"/images/products/cpu-amd-r9-9900x.png",  specs:{코어:"12C/24T",클럭:"4.4GHz / 5.6GHz",소켓:"AM5",   TDP:"120W"} },
    // RAM
    { sku:"RAM-SAM-DDR5-32-001",  name:"Samsung DDR5 32GB Kit",                   modelName:"M323R2GA3BB0",         cId:cRam.id,bId:bSam.id,  sId:s5.id,wId:w2.id,qty:35,saf:15,price:129000,  status:"IN_STOCK",     imageUrl:"/images/products/ram-sam-ddr5-32.jpg",   specs:{용량:"16GB×2",속도:"DDR5-4800",레이턴시:"CL40",전압:"1.1V"} },
    { sku:"RAM-GSK-TZ5-32-001",   name:"G.Skill Trident Z5 DDR5 32GB Kit",        modelName:"F5-6400J3239G16GX2",  cId:cRam.id,bId:bGsk.id,  sId:s3.id,wId:w2.id,qty:11,saf:8, price:159000,  status:"IN_STOCK",     imageUrl:"/images/products/ram-gsk-tz5-32.png",    specs:{용량:"16GB×2",속도:"DDR5-6400",레이턴시:"CL32",전압:"1.4V"} },
    { sku:"RAM-COR-DDR5-64-001",  name:"Corsair Vengeance DDR5 64GB Kit",         modelName:"CMK64GX5M2B5200C40",  cId:cRam.id,bId:bCor.id,  sId:s3.id,wId:w2.id,qty:7, saf:8, price:219000,  status:"LOW_STOCK",    imageUrl:"/images/products/ram-cor-ddr5-64.webp",  specs:{용량:"32GB×2",속도:"DDR5-5200",레이턴시:"CL40",전압:"1.25V"} },
    { sku:"RAM-SKH-DDR5-32-001",  name:"SK hynix Platinum HX DDR5 32GB Kit",     modelName:"HMCG78AEBSA095N",     cId:cRam.id,bId:bSkh.id,  sId:s5.id,wId:w2.id,qty:20,saf:10,price:139000,  status:"IN_STOCK",     imageUrl:null,                                     specs:{용량:"16GB×2",속도:"DDR5-5600",레이턴시:"CL36",전압:"1.25V"} },
    // SSD
    { sku:"SSD-SAM-990P-1T-001",  name:"Samsung 990 Pro NVMe SSD 1TB",           modelName:"MZ-V9P1T0BW",         cId:cSsd.id,bId:bSam.id,  sId:s5.id,wId:w1.id,qty:48,saf:20,price:149000,  status:"IN_STOCK",     imageUrl:"/images/products/ssd-sam-990pro-1t.jpg", specs:{용량:"1TB",인터페이스:"NVMe M.2",읽기:"7450MB/s",쓰기:"6900MB/s"} },
    { sku:"SSD-SKH-P41-1T-001",   name:"SK hynix Platinum P41 NVMe 1TB",         modelName:"SHPP41-1000GM-2",     cId:cSsd.id,bId:bSkh.id,  sId:s4.id,wId:w1.id,qty:31,saf:15,price:139000,  status:"IN_STOCK",     imageUrl:"/images/products/ssd-skh-p41-1t.jpg",   specs:{용량:"1TB",인터페이스:"NVMe M.2",읽기:"7000MB/s",쓰기:"6500MB/s"} },
    { sku:"SSD-SAM-870EVO-2T-001",name:"Samsung 870 EVO SATA SSD 2TB",           modelName:"MZ-77E2T0B/KR",       cId:cSsd.id,bId:bSam.id,  sId:s5.id,wId:w1.id,qty:0, saf:15,price:169000,  status:"OUT_OF_STOCK", imageUrl:"/images/products/ssd-sam-870evo-2t.jpg", specs:{용량:"2TB",인터페이스:"SATA 6Gb/s",읽기:"560MB/s",쓰기:"530MB/s"} },
    { sku:"SSD-SAM-990-2T-001",   name:"Samsung 990 EVO NVMe SSD 2TB",           modelName:"MZ-V9E2T0BW",         cId:cSsd.id,bId:bSam.id,  sId:s5.id,wId:w1.id,qty:22,saf:10,price:219000,  status:"IN_STOCK",     imageUrl:"/images/products/ssd-sam-990evo-2t.jpg", specs:{용량:"2TB",인터페이스:"NVMe M.2",읽기:"5000MB/s",쓰기:"4200MB/s"} },
    // Mainboard
    { sku:"MB-ASUS-B650E-001",    name:"ASUS ROG STRIX B650E-F Gaming WiFi",     modelName:"ROG STRIX B650E-F",   cId:cMb.id, bId:bAsus.id, sId:s1.id,wId:w2.id,qty:11,saf:6, price:389000,  status:"IN_STOCK",     imageUrl:"/images/products/mb-asus-b650e.png",     specs:{소켓:"AM5",    칩셋:"AMD B650E",   폼팩터:"ATX",메모리슬롯:"DDR5 ×4"} },
    { sku:"MB-MSI-Z790-001",      name:"MSI PRO Z790-A WiFi DDR5",               modelName:"PRO Z790-A WiFi",     cId:cMb.id, bId:bMsi.id,  sId:s1.id,wId:w2.id,qty:4, saf:8, price:329000,  status:"LOW_STOCK",    imageUrl:"/images/products/mb-msi-z790.jpg",       specs:{소켓:"LGA1700",칩셋:"Intel Z790", 폼팩터:"ATX",메모리슬롯:"DDR5 ×4"} },
    // PSU
    { sku:"PSU-SEA-850G-001",     name:"Seasonic FOCUS GX-850 골드",              modelName:"FOCUS-GX-850",        cId:cPsu.id,bId:bSeas.id, sId:s2.id,wId:w3.id,qty:16,saf:8, price:179000,  status:"IN_STOCK",     imageUrl:"/images/products/psu-seasonic-850g.jpg", specs:{출력:"850W", 등급:"80+ Gold",    모듈방식:"완전모듈",팬크기:"120mm"} },
    { sku:"PSU-BEQ-1000P-001",    name:"be quiet! Dark Power 13 1000W 플래티넘",  modelName:"BN332",               cId:cPsu.id,bId:bBeq.id,  sId:s2.id,wId:w3.id,qty:6, saf:5, price:289000,  status:"IN_STOCK",     imageUrl:"/images/products/psu-bequiet-1000p.jpg", specs:{출력:"1000W",등급:"80+ Platinum",모듈방식:"완전모듈",팬크기:"135mm"} },
    // Case
    { sku:"CASE-FRD-NR400-001",   name:"Fractal Design North Charcoal Black",    modelName:"FD-C-NOR1C-02",       cId:cCase.id,bId:bFrd.id, sId:s3.id,wId:w3.id,qty:9, saf:5, price:159000,  status:"IN_STOCK",     imageUrl:"/images/products/case-fractal-north.jpg",specs:{폼팩터:"ATX Mid Tower",재질:"메쉬+우드",드라이브베이:'2×3.5", 2×2.5"',쿨링:"최대 9개 팬"} },
    // Cooler
    { sku:"COOL-NOC-NHD15-001",   name:"Noctua NH-D15 크롬맥스 CPU 쿨러",         modelName:"NH-D15 chromax.black",cId:cCool.id,bId:bNoc.id, sId:s4.id,wId:w3.id,qty:12,saf:5, price:129000,  status:"IN_STOCK",     imageUrl:"/images/products/cool-noctua-nhd15.jpg", specs:{높이:"165mm",팬:"NF-A15 ×2",소켓지원:"LGA1700, AM5, AM4",TDP:"250W+"} },
    // HDD
    { sku:"HDD-SEA-4T-001",       name:"Seagate BarraCuda 4TB HDD",              modelName:"ST4000DM004",         cId:cHdd.id,bId:bSea.id,  sId:s5.id,wId:w2.id,qty:8, saf:6, price:99000,   status:"IN_STOCK",     imageUrl:"/images/products/hdd-sea-4t.jpg",        specs:{용량:"4TB",속도:"5400RPM",인터페이스:"SATA 6Gb/s",캐시:"256MB"} },
    { sku:"HDD-SEA-2T-001",       name:"Seagate BarraCuda 2TB HDD",              modelName:"ST2000DM008",         cId:cHdd.id,bId:bSea.id,  sId:s5.id,wId:w2.id,qty:9, saf:6, price:69000,   status:"IN_STOCK",     imageUrl:"/images/products/hdd-sea-2t.jpg",        specs:{용량:"2TB",속도:"7200RPM",인터페이스:"SATA 6Gb/s",캐시:"256MB"} },
  ];

  const items = await Promise.all(
    itemDefs.map(({ cId, bId, sId, wId, qty, saf, price, status, specs, ...rest }) =>
      prisma.inventoryItem.create({
        data: { ...rest, categoryId: cId, brandId: bId, supplierId: sId, warehouseId: wId,
                quantity: qty, safetyStock: saf, unitPrice: price, status, specs },
      })
    )
  );

  const bySkuId = Object.fromEntries(items.map((i) => [i.sku, i.id]));

  // ── Transactions ──────────────────────────────────────────────────────────
  await prisma.stockTransaction.createMany({ data: [
    { type:"INBOUND",    itemId:bySkuId["GPU-NV-4060TI-001"],  quantity: 20, userId:u1.id, reference:"PO-2025-0501",  notes:"정기 입고",       createdAt:new Date("2025-05-11T09:00:00") },
    { type:"OUTBOUND",   itemId:bySkuId["GPU-NV-4070S-001"],   quantity:  5, userId:u1.id, reference:"SHP-2025-0047", notes:"출고 처리",        createdAt:new Date("2025-05-11T09:30:00") },
    { type:"INBOUND",    itemId:bySkuId["SSD-SAM-990P-1T-001"],quantity: 30, userId:u2.id, reference:"PO-2025-0502",  notes:"삼성 정기 입고",   createdAt:new Date("2025-05-11T10:15:00") },
    { type:"OUTBOUND",   itemId:bySkuId["CPU-INT-13400F-001"],  quantity: 10, userId:u1.id, reference:"SHP-2025-0048", notes:"",                 createdAt:new Date("2025-05-11T11:00:00") },
    { type:"ADJUSTMENT", itemId:bySkuId["GPU-AMD-7800XT-001"],  quantity: -2, userId:u2.id, reference:"ADJ-2025-0023", notes:"불량 처리",        createdAt:new Date("2025-05-10T16:00:00") },
    { type:"INBOUND",    itemId:bySkuId["RAM-SAM-DDR5-32-001"], quantity: 25, userId:u1.id, reference:"PO-2025-0499",  notes:"주간 입고",        createdAt:new Date("2025-05-10T14:30:00") },
    { type:"OUTBOUND",   itemId:bySkuId["MB-ASUS-B650E-001"],   quantity:  3, userId:u1.id, reference:"SHP-2025-0046", notes:"",                 createdAt:new Date("2025-05-10T13:00:00") },
    { type:"RETURN",     itemId:bySkuId["GPU-AMD-7600-001"],     quantity:  2, userId:u2.id, reference:"RTN-2025-0008", notes:"반품 입고",        createdAt:new Date("2025-05-10T10:00:00") },
    { type:"INBOUND",    itemId:bySkuId["PSU-SEA-850G-001"],     quantity: 15, userId:u1.id, reference:"PO-2025-0498",  notes:"시즌 입고",        createdAt:new Date("2025-05-09T15:00:00") },
    { type:"OUTBOUND",   itemId:bySkuId["SSD-SKH-P41-1T-001"],  quantity:  8, userId:u1.id, reference:"SHP-2025-0045", notes:"",                 createdAt:new Date("2025-05-09T11:30:00") },
    { type:"INBOUND",    itemId:bySkuId["CPU-INT-13700K-001"],   quantity: 12, userId:u2.id, reference:"PO-2025-0497",  notes:"인텔 입고",        createdAt:new Date("2025-05-09T09:00:00") },
    { type:"ADJUSTMENT", itemId:bySkuId["SSD-SAM-870EVO-2T-001"],quantity:-5, userId:u2.id, reference:"ADJ-2025-0022", notes:"재고 실사 보정",   createdAt:new Date("2025-05-08T17:00:00") },
  ]});

  // ── Shipments ─────────────────────────────────────────────────────────────
  const shipmentDefs = [
    { shipmentNo:"SHP-2025-0048", status:"PICKING",   priority:"URGENT", requester:"테크스타 유통(주)", department:"구매팀",   dueDate:"2025-05-12", userId:u1.id, notes:"납기 준수 필수 — 고객사 요청", createdAt:"2025-05-11T08:00:00", updatedAt:"2025-05-11T11:00:00",
      items:[{sku:"CPU-INT-13400F-001",qty:10},{sku:"RAM-SAM-DDR5-32-001",qty:10}] },
    { shipmentNo:"SHP-2025-0047", status:"PACKED",    priority:"HIGH",   requester:"하이컴퓨터 인천점", department:"영업팀",   dueDate:"2025-05-13", userId:u1.id, notes:"",                            createdAt:"2025-05-10T14:00:00", updatedAt:"2025-05-11T09:30:00",
      items:[{sku:"GPU-NV-4070S-001",qty:5}] },
    { shipmentNo:"SHP-2025-0046", status:"SHIPPED",   priority:"NORMAL", requester:"디지털플라자 강남",  department:null,      dueDate:"2025-05-11", userId:u1.id, notes:"",                            createdAt:"2025-05-09T10:00:00", updatedAt:"2025-05-11T07:00:00",
      items:[{sku:"MB-ASUS-B650E-001",qty:3}], shippedAt:"2025-05-11T07:00:00" },
    { shipmentNo:"SHP-2025-0045", status:"DELAYED",   priority:"HIGH",   requester:"코어시스템 부산",    department:"IT팀",    dueDate:"2025-05-10", userId:u2.id, notes:"재고 부족으로 출고 지연 — 긴급 발주 진행 중", createdAt:"2025-05-08T09:00:00", updatedAt:"2025-05-11T10:00:00",
      items:[{sku:"SSD-SKH-P41-1T-001",qty:8},{sku:"CPU-INT-13700K-001",qty:5}] },
    { shipmentNo:"SHP-2025-0044", status:"COMPLETED", priority:"NORMAL", requester:"하이텍솔루션",        department:null,      dueDate:"2025-05-09", userId:u1.id, notes:"",                            createdAt:"2025-05-07T13:00:00", updatedAt:"2025-05-09T08:30:00",
      items:[{sku:"GPU-NV-4060TI-001",qty:8},{sku:"SSD-SAM-990P-1T-001",qty:8}], shippedAt:"2025-05-09T08:30:00" },
    { shipmentNo:"SHP-2025-0043", status:"PENDING",   priority:"LOW",    requester:"넥스트레벨IT",        department:"구매팀",   dueDate:"2025-05-16", userId:u1.id, notes:"주말 후 처리 예정",            createdAt:"2025-05-11T11:00:00", updatedAt:"2025-05-11T11:00:00",
      items:[{sku:"PSU-SEA-850G-001",qty:5},{sku:"CASE-FRD-NR400-001",qty:5}] },
    { shipmentNo:"SHP-2025-0042", status:"APPROVED",  priority:"NORMAL", requester:"GS네오텍",            department:"인프라팀",  dueDate:"2025-05-14", userId:u2.id, notes:"",                            createdAt:"2025-05-10T16:00:00", updatedAt:"2025-05-11T09:00:00",
      items:[{sku:"CPU-AMD-7700X-001",qty:6},{sku:"RAM-GSK-TZ5-32-001",qty:6}] },
  ];

  for (const { items: shipItems, shippedAt, ...sh } of shipmentDefs) {
    await prisma.shipment.create({
      data: {
        ...sh,
        dueDate:   sh.dueDate   ? new Date(sh.dueDate)   : undefined,
        shippedAt: shippedAt    ? new Date(shippedAt)     : undefined,
        createdAt: new Date(sh.createdAt),
        updatedAt: new Date(sh.updatedAt),
        items: { createMany: { data: shipItems.map(({ sku, qty }) => ({ itemId: bySkuId[sku], quantity: qty })) } },
      },
    });
  }

  // ── Alerts ────────────────────────────────────────────────────────────────
  await prisma.lowStockAlert.createMany({ data: [
    { itemId:bySkuId["GPU-NV-4070S-001"],      threshold:10, resolved:false, createdAt:new Date("2025-05-11T06:00:00") },
    { itemId:bySkuId["GPU-NV-4080S-001"],      threshold: 8, resolved:false, createdAt:new Date("2025-05-09T06:00:00") },
    { itemId:bySkuId["GPU-AMD-7800XT-001"],    threshold: 8, resolved:false, createdAt:new Date("2025-05-11T06:00:00") },
    { itemId:bySkuId["CPU-AMD-7600X-001"],     threshold:10, resolved:false, createdAt:new Date("2025-05-11T06:00:00") },
    { itemId:bySkuId["RAM-COR-DDR5-64-001"],   threshold: 8, resolved:false, createdAt:new Date("2025-05-11T06:00:00") },
    { itemId:bySkuId["SSD-SAM-870EVO-2T-001"], threshold:15, resolved:false, createdAt:new Date("2025-05-08T06:00:00") },
    { itemId:bySkuId["MB-MSI-Z790-001"],       threshold: 8, resolved:false, createdAt:new Date("2025-05-11T06:00:00") },
  ]});

  console.log("✅ Seeded: 2 users · 9 categories · 15 brands · 5 suppliers · 3 warehouses · 26 items · 12 transactions · 7 shipments · 7 alerts");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
