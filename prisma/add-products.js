/* eslint-disable */
"use strict";

require("dotenv").config();
const { PrismaClient } = require("../generated/prisma/client/index.js");
const { PrismaPg }     = require("@prisma/adapter-pg");
const { Pool }         = require("pg");

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log("📦 Adding new products (non-destructive)...");

  // ── Lookup existing entities ───────────────────────────────────────────────
  const cats      = await prisma.category.findMany();
  const bySlug    = Object.fromEntries(cats.map(c => [c.slug, c]));
  const suppliers = await prisma.supplier.findMany();
  const [s1,s2,s3,s4,s5] = suppliers;
  const warehouses = await prisma.warehouse.findMany();
  const w1 = warehouses.find(w => w.zone === "A");
  const w2 = warehouses.find(w => w.zone === "B");
  const w3 = warehouses.find(w => w.zone === "서울");

  // ── Upsert brands ──────────────────────────────────────────────────────────
  const ub = name => prisma.brand.upsert({ where:{name}, create:{name}, update:{} });
  const [
    bNv,bAmd,bIntel,bSam,bSkh,bSea,bAsus,bMsi,bGiga,bCor,bGsk,bSeas,bBeq,bNoc,bFrd,
    bWD,bCrucial,bKingston,bTeam,bLianLi,bCM,bDeepCool,bASRock,bNZXT,bThermaltake,
    bThermalright,bARCTIC,bPhanteks,bSilverstone,bToshiba,bSapphire,bPowerColor
  ] = await Promise.all([
    ub("NVIDIA"),ub("AMD"),ub("Intel"),ub("Samsung"),ub("SK hynix"),ub("Seagate"),
    ub("ASUS"),ub("MSI"),ub("Gigabyte"),ub("Corsair"),ub("G.Skill"),ub("Seasonic"),
    ub("be quiet!"),ub("Noctua"),ub("Fractal Design"),
    ub("WD"),ub("Crucial"),ub("Kingston"),ub("TeamGroup"),ub("Lian Li"),
    ub("Cooler Master"),ub("DeepCool"),ub("ASRock"),ub("NZXT"),ub("Thermaltake"),
    ub("Thermalright"),ub("ARCTIC"),ub("Phanteks"),ub("SilverStone"),ub("Toshiba"),
    ub("Sapphire"),ub("PowerColor"),
  ]);

  const cGpu=bySlug["gpu"], cCpu=bySlug["cpu"], cRam=bySlug["ram"], cSsd=bySlug["ssd"],
        cHdd=bySlug["hdd"], cMb=bySlug["mainboard"], cPsu=bySlug["psu"],
        cCase=bySlug["case"], cCool=bySlug["cooler"];

  const newItems = [
    // ── GPU +7 (총 12종) ──────────────────────────────────────────────────────
    { sku:"GPU-NV-4060-001",      name:"NVIDIA GeForce RTX 4060 8GB",              modelName:"RTX 4060",            cId:cGpu.id,bId:bNv.id,         sId:s1.id,wId:w1.id,qty:28,saf:15,price:329000, status:"IN_STOCK",  imageUrl:null, specs:{메모리:"8GB GDDR6",   인터페이스:"PCIe 4.0 x8", TDP:"115W",포트:"HDMI 2.1 x1, DP 1.4a x3"} },
    { sku:"GPU-NV-4070TIS-001",   name:"NVIDIA GeForce RTX 4070 Ti SUPER 16GB",    modelName:"RTX 4070 Ti SUPER",   cId:cGpu.id,bId:bNv.id,         sId:s1.id,wId:w1.id,qty:6, saf:6, price:799000, status:"LOW_STOCK", imageUrl:null, specs:{메모리:"16GB GDDR6X", 인터페이스:"PCIe 4.0 x16",TDP:"285W",포트:"HDMI 2.1 x1, DP 1.4a x3"} },
    { sku:"GPU-NV-4090-001",      name:"NVIDIA GeForce RTX 4090 24GB",             modelName:"RTX 4090",            cId:cGpu.id,bId:bNv.id,         sId:s2.id,wId:w1.id,qty:3, saf:4, price:1899000,status:"LOW_STOCK", imageUrl:null, specs:{메모리:"24GB GDDR6X", 인터페이스:"PCIe 4.0 x16",TDP:"450W",포트:"HDMI 2.1 x1, DP 1.4a x3"} },
    { sku:"GPU-NV-5070-001",      name:"NVIDIA GeForce RTX 5070 12GB",             modelName:"RTX 5070",            cId:cGpu.id,bId:bNv.id,         sId:s1.id,wId:w1.id,qty:12,saf:8, price:699000, status:"IN_STOCK",  imageUrl:null, specs:{메모리:"12GB GDDR7",  인터페이스:"PCIe 5.0 x16",TDP:"250W",포트:"HDMI 2.1a x1, DP 2.1 x3"} },
    { sku:"GPU-NV-5080-001",      name:"NVIDIA GeForce RTX 5080 16GB",             modelName:"RTX 5080",            cId:cGpu.id,bId:bNv.id,         sId:s2.id,wId:w1.id,qty:5, saf:5, price:1099000,status:"LOW_STOCK", imageUrl:null, specs:{메모리:"16GB GDDR7",  인터페이스:"PCIe 5.0 x16",TDP:"360W",포트:"HDMI 2.1a x1, DP 2.1 x3"} },
    { sku:"GPU-AMD-9070XT-001",   name:"AMD Radeon RX 9070 XT 16GB",               modelName:"RX 9070 XT",          cId:cGpu.id,bId:bAmd.id,        sId:s1.id,wId:w1.id,qty:9, saf:6, price:649000, status:"IN_STOCK",  imageUrl:null, specs:{메모리:"16GB GDDR6",  인터페이스:"PCIe 5.0 x16",TDP:"304W",포트:"HDMI 2.1a x1, DP 2.1 x3"} },
    { sku:"GPU-AMD-7900GRE-001",  name:"AMD Radeon RX 7900 GRE 16GB",              modelName:"RX 7900 GRE",         cId:cGpu.id,bId:bAmd.id,        sId:s2.id,wId:w1.id,qty:7, saf:5, price:599000, status:"IN_STOCK",  imageUrl:null, specs:{메모리:"16GB GDDR6",  인터페이스:"PCIe 4.0 x16",TDP:"260W",포트:"HDMI 2.1 x1, DP 2.1 x2"} },
    // ── CPU +6 (총 11종) ──────────────────────────────────────────────────────
    { sku:"CPU-INT-14400F-001",   name:"Intel Core i5-14400F",                     modelName:"Core i5-14400F",      cId:cCpu.id,bId:bIntel.id,      sId:s1.id,wId:w1.id,qty:38,saf:20,price:209000, status:"IN_STOCK",  imageUrl:null, specs:{코어:"10C/16T",클럭:"2.5GHz / 4.7GHz",소켓:"LGA1700",TDP:"65W"} },
    { sku:"CPU-INT-14700K-001",   name:"Intel Core i7-14700K",                     modelName:"Core i7-14700K",      cId:cCpu.id,bId:bIntel.id,      sId:s1.id,wId:w1.id,qty:14,saf:8, price:399000, status:"IN_STOCK",  imageUrl:null, specs:{코어:"20C/28T",클럭:"3.4GHz / 5.6GHz",소켓:"LGA1700",TDP:"125W"} },
    { sku:"CPU-INT-14900K-001",   name:"Intel Core i9-14900K",                     modelName:"Core i9-14900K",      cId:cCpu.id,bId:bIntel.id,      sId:s2.id,wId:w1.id,qty:5, saf:4, price:589000, status:"LOW_STOCK", imageUrl:null, specs:{코어:"24C/32T",클럭:"3.2GHz / 6.0GHz",소켓:"LGA1700",TDP:"125W"} },
    { sku:"CPU-AMD-9600X-001",    name:"AMD Ryzen 5 9600X",                        modelName:"Ryzen 5 9600X",       cId:cCpu.id,bId:bAmd.id,        sId:s2.id,wId:w2.id,qty:22,saf:12,price:299000, status:"IN_STOCK",  imageUrl:null, specs:{코어:"6C/12T", 클럭:"3.9GHz / 5.4GHz",소켓:"AM5",   TDP:"65W"} },
    { sku:"CPU-AMD-9700X-001",    name:"AMD Ryzen 7 9700X",                        modelName:"Ryzen 7 9700X",       cId:cCpu.id,bId:bAmd.id,        sId:s2.id,wId:w2.id,qty:16,saf:8, price:389000, status:"IN_STOCK",  imageUrl:null, specs:{코어:"8C/16T", 클럭:"3.8GHz / 5.5GHz",소켓:"AM5",   TDP:"65W"} },
    { sku:"CPU-AMD-9950X-001",    name:"AMD Ryzen 9 9950X",                        modelName:"Ryzen 9 9950X",       cId:cCpu.id,bId:bAmd.id,        sId:s4.id,wId:w2.id,qty:4, saf:4, price:689000, status:"LOW_STOCK", imageUrl:null, specs:{코어:"16C/32T",클럭:"4.3GHz / 5.7GHz",소켓:"AM5",   TDP:"170W"} },
    // ── RAM +7 (총 11종) ──────────────────────────────────────────────────────
    { sku:"RAM-SAM-DDR5-64-001",  name:"Samsung DDR5 64GB Kit",                    modelName:"M323R4GA3BB0-CQK",    cId:cRam.id,bId:bSam.id,        sId:s5.id,wId:w2.id,qty:12,saf:6, price:219000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"32GB×2",속도:"DDR5-4800",레이턴시:"CL40",전압:"1.1V"} },
    { sku:"RAM-GSK-TZ5RGB-001",   name:"G.Skill Trident Z5 RGB DDR5 32GB",         modelName:"F5-6000J3038F16GX2", cId:cRam.id,bId:bGsk.id,        sId:s3.id,wId:w2.id,qty:18,saf:10,price:149000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"16GB×2",속도:"DDR5-6000",레이턴시:"CL30",전압:"1.35V"} },
    { sku:"RAM-COR-DOM-32-001",   name:"Corsair Dominator Platinum DDR5 32GB",     modelName:"CMT32GX5M2B5200C40", cId:cRam.id,bId:bCor.id,        sId:s3.id,wId:w2.id,qty:8, saf:5, price:189000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"16GB×2",속도:"DDR5-5200",레이턴시:"CL40",전압:"1.25V"} },
    { sku:"RAM-KGS-FB-32-001",    name:"Kingston Fury Beast DDR5 32GB",            modelName:"KF556C40BBK2-32",    cId:cRam.id,bId:bKingston.id,   sId:s3.id,wId:w2.id,qty:25,saf:12,price:139000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"16GB×2",속도:"DDR5-5600",레이턴시:"CL40",전압:"1.25V"} },
    { sku:"RAM-CRU-PRO-32-001",   name:"Crucial Pro DDR5 32GB",                    modelName:"CP2K16G56C46U5",     cId:cRam.id,bId:bCrucial.id,   sId:s5.id,wId:w2.id,qty:20,saf:10,price:129000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"16GB×2",속도:"DDR5-5600",레이턴시:"CL46",전압:"1.1V"} },
    { sku:"RAM-TMG-VUL-32-001",   name:"TeamGroup T-Force Vulcan DDR5 32GB",       modelName:"FLVD532G6000HC36",   cId:cRam.id,bId:bTeam.id,       sId:s3.id,wId:w2.id,qty:15,saf:8, price:119000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"16GB×2",속도:"DDR5-6000",레이턴시:"CL36",전압:"1.35V"} },
    { sku:"RAM-SAM-DDR4-32-001",  name:"Samsung DDR4 32GB Kit",                    modelName:"M378A4G43AB2-CWE",   cId:cRam.id,bId:bSam.id,        sId:s5.id,wId:w2.id,qty:30,saf:15,price:79000,  status:"IN_STOCK",  imageUrl:null, specs:{용량:"16GB×2",속도:"DDR4-3200",레이턴시:"CL22",전압:"1.2V"} },
    // ── SSD +8 (총 12종) ──────────────────────────────────────────────────────
    { sku:"SSD-SAM-990P-2T-001",  name:"Samsung 990 Pro NVMe SSD 2TB",             modelName:"MZ-V9P2T0BW",        cId:cSsd.id,bId:bSam.id,        sId:s5.id,wId:w1.id,qty:20,saf:10,price:219000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"2TB",인터페이스:"NVMe PCIe 4.0",읽기:"7450MB/s",쓰기:"6900MB/s"} },
    { sku:"SSD-WD-SN850X-1T-001", name:"WD Black SN850X NVMe 1TB",                modelName:"WDS100T2X0E",        cId:cSsd.id,bId:bWD.id,         sId:s4.id,wId:w1.id,qty:26,saf:12,price:149000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"1TB",인터페이스:"NVMe PCIe 4.0",읽기:"7300MB/s",쓰기:"6600MB/s"} },
    { sku:"SSD-WD-SN850X-2T-001", name:"WD Black SN850X NVMe 2TB",                modelName:"WDS200T2X0E",        cId:cSsd.id,bId:bWD.id,         sId:s4.id,wId:w1.id,qty:14,saf:8, price:239000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"2TB",인터페이스:"NVMe PCIe 4.0",읽기:"7300MB/s",쓰기:"6600MB/s"} },
    { sku:"SSD-CRU-T705-1T-001",  name:"Crucial T705 NVMe 1TB PCIe 5.0",          modelName:"CT1000T705SSD3",     cId:cSsd.id,bId:bCrucial.id,   sId:s4.id,wId:w1.id,qty:10,saf:6, price:169000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"1TB",인터페이스:"NVMe PCIe 5.0",읽기:"14100MB/s",쓰기:"12600MB/s"} },
    { sku:"SSD-SKH-P41-2T-001",   name:"SK hynix Platinum P41 NVMe 2TB",           modelName:"SHPP41-2000GM-2",    cId:cSsd.id,bId:bSkh.id,        sId:s4.id,wId:w1.id,qty:16,saf:8, price:219000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"2TB",인터페이스:"NVMe PCIe 4.0",읽기:"7000MB/s",쓰기:"6500MB/s"} },
    { sku:"SSD-WD-SN580-1T-001",  name:"WD Blue SN580 NVMe 1TB",                  modelName:"WDS100T3B0E",        cId:cSsd.id,bId:bWD.id,         sId:s5.id,wId:w1.id,qty:32,saf:15,price:99000,  status:"IN_STOCK",  imageUrl:null, specs:{용량:"1TB",인터페이스:"NVMe PCIe 4.0",읽기:"4150MB/s",쓰기:"4150MB/s"} },
    { sku:"SSD-SAM-870EVO-1T-001",name:"Samsung 870 EVO SATA 1TB",                modelName:"MZ-77E1T0B/KR",      cId:cSsd.id,bId:bSam.id,        sId:s5.id,wId:w1.id,qty:18,saf:10,price:99000,  status:"IN_STOCK",  imageUrl:null, specs:{용량:"1TB",인터페이스:"SATA 6Gb/s",  읽기:"560MB/s",쓰기:"530MB/s"} },
    { sku:"SSD-KGS-KC3K-2T-001",  name:"Kingston KC3000 NVMe 2TB",                modelName:"SKC3000D/2048G",     cId:cSsd.id,bId:bKingston.id,   sId:s3.id,wId:w1.id,qty:11,saf:6, price:199000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"2TB",인터페이스:"NVMe PCIe 4.0",읽기:"7000MB/s",쓰기:"7000MB/s"} },
    // ── HDD +8 (총 10종) ──────────────────────────────────────────────────────
    { sku:"HDD-SEA-1T-001",       name:"Seagate BarraCuda 1TB HDD",                modelName:"ST1000DM010",        cId:cHdd.id,bId:bSea.id,        sId:s5.id,wId:w2.id,qty:15,saf:8, price:49000,  status:"IN_STOCK",  imageUrl:null, specs:{용량:"1TB",속도:"7200RPM",인터페이스:"SATA 6Gb/s",캐시:"64MB"} },
    { sku:"HDD-SEA-6T-001",       name:"Seagate BarraCuda 6TB HDD",                modelName:"ST6000DM003",        cId:cHdd.id,bId:bSea.id,        sId:s5.id,wId:w2.id,qty:7, saf:4, price:129000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"6TB",속도:"5400RPM",인터페이스:"SATA 6Gb/s",캐시:"256MB"} },
    { sku:"HDD-SEA-8T-001",       name:"Seagate BarraCuda 8TB HDD",                modelName:"ST8000DM004",        cId:cHdd.id,bId:bSea.id,        sId:s5.id,wId:w2.id,qty:5, saf:4, price:169000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"8TB",속도:"5400RPM",인터페이스:"SATA 6Gb/s",캐시:"256MB"} },
    { sku:"HDD-WD-BLUE-2T-001",   name:"WD Blue 2TB HDD",                          modelName:"WD20EZAZ",           cId:cHdd.id,bId:bWD.id,         sId:s3.id,wId:w2.id,qty:12,saf:6, price:75000,  status:"IN_STOCK",  imageUrl:null, specs:{용량:"2TB",속도:"5400RPM",인터페이스:"SATA 6Gb/s",캐시:"256MB"} },
    { sku:"HDD-WD-BLUE-4T-001",   name:"WD Blue 4TB HDD",                          modelName:"WD40EZAX",           cId:cHdd.id,bId:bWD.id,         sId:s3.id,wId:w2.id,qty:9, saf:5, price:109000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"4TB",속도:"5400RPM",인터페이스:"SATA 6Gb/s",캐시:"256MB"} },
    { sku:"HDD-WD-REDP-4T-001",   name:"WD Red Plus 4TB NAS HDD",                  modelName:"WD40EFPX",           cId:cHdd.id,bId:bWD.id,         sId:s3.id,wId:w2.id,qty:6, saf:4, price:139000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"4TB",속도:"5400RPM",인터페이스:"SATA 6Gb/s",캐시:"256MB"} },
    { sku:"HDD-SEA-IW-4T-001",    name:"Seagate IronWolf 4TB NAS HDD",             modelName:"ST4000VN006",        cId:cHdd.id,bId:bSea.id,        sId:s5.id,wId:w2.id,qty:8, saf:4, price:149000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"4TB",속도:"5400RPM",인터페이스:"SATA 6Gb/s",캐시:"64MB"} },
    { sku:"HDD-TOS-MG-6T-001",    name:"Toshiba MG 6TB Enterprise HDD",            modelName:"MG08ADA600E",        cId:cHdd.id,bId:bToshiba.id,    sId:s5.id,wId:w2.id,qty:4, saf:3, price:149000, status:"IN_STOCK",  imageUrl:null, specs:{용량:"6TB",속도:"7200RPM",인터페이스:"SATA 6Gb/s",캐시:"256MB"} },
    // ── Mainboard +9 (총 11종) ────────────────────────────────────────────────
    { sku:"MB-ASUS-B650A-001",    name:"ASUS ROG STRIX B650-A Gaming WiFi",        modelName:"ROG STRIX B650-A",   cId:cMb.id, bId:bAsus.id,       sId:s1.id,wId:w2.id,qty:8, saf:5, price:329000, status:"IN_STOCK",  imageUrl:null, specs:{소켓:"AM5",   칩셋:"AMD B650", 폼팩터:"ATX",  메모리슬롯:"DDR5 ×4"} },
    { sku:"MB-MSI-B650MM-001",    name:"MSI MAG B650M Mortar WiFi",                modelName:"MAG B650M MORTAR",   cId:cMb.id, bId:bMsi.id,        sId:s1.id,wId:w2.id,qty:11,saf:6, price:249000, status:"IN_STOCK",  imageUrl:null, specs:{소켓:"AM5",   칩셋:"AMD B650", 폼팩터:"mATX", 메모리슬롯:"DDR5 ×4"} },
    { sku:"MB-GIGA-B650-001",     name:"Gigabyte B650 AORUS Elite AX",             modelName:"B650 AORUS ELITE AX",cId:cMb.id, bId:bGiga.id,       sId:s2.id,wId:w2.id,qty:9, saf:5, price:299000, status:"IN_STOCK",  imageUrl:null, specs:{소켓:"AM5",   칩셋:"AMD B650", 폼팩터:"ATX",  메모리슬롯:"DDR5 ×4"} },
    { sku:"MB-ASR-B650E-001",     name:"ASRock B650E Steel Legend WiFi",           modelName:"B650E Steel Legend", cId:cMb.id, bId:bASRock.id,     sId:s2.id,wId:w2.id,qty:6, saf:4, price:279000, status:"IN_STOCK",  imageUrl:null, specs:{소켓:"AM5",   칩셋:"AMD B650E",폼팩터:"ATX",  메모리슬롯:"DDR5 ×4"} },
    { sku:"MB-ASUS-B760M-001",    name:"ASUS TUF Gaming B760M-Plus WiFi",          modelName:"TUF B760M-PLUS WIFI",cId:cMb.id, bId:bAsus.id,       sId:s1.id,wId:w2.id,qty:13,saf:6, price:249000, status:"IN_STOCK",  imageUrl:null, specs:{소켓:"LGA1700",칩셋:"B760",  폼팩터:"mATX", 메모리슬롯:"DDR5 ×4"} },
    { sku:"MB-MSI-B760M-001",     name:"MSI PRO B760M-A WiFi DDR5",               modelName:"PRO B760M-A WIFI",   cId:cMb.id, bId:bMsi.id,        sId:s1.id,wId:w2.id,qty:17,saf:8, price:189000, status:"IN_STOCK",  imageUrl:null, specs:{소켓:"LGA1700",칩셋:"B760",  폼팩터:"mATX", 메모리슬롯:"DDR5 ×4"} },
    { sku:"MB-GIGA-Z790-001",     name:"Gigabyte Z790 AORUS Elite AX",             modelName:"Z790 AORUS ELITE AX",cId:cMb.id, bId:bGiga.id,       sId:s2.id,wId:w2.id,qty:5, saf:4, price:379000, status:"LOW_STOCK", imageUrl:null, specs:{소켓:"LGA1700",칩셋:"Z790",  폼팩터:"ATX",  메모리슬롯:"DDR5 ×4"} },
    { sku:"MB-ASR-B760-001",      name:"ASRock B760 Pro RS WiFi",                  modelName:"B760 Pro RS WiFi",   cId:cMb.id, bId:bASRock.id,     sId:s2.id,wId:w2.id,qty:14,saf:6, price:229000, status:"IN_STOCK",  imageUrl:null, specs:{소켓:"LGA1700",칩셋:"B760",  폼팩터:"ATX",  메모리슬롯:"DDR5 ×4"} },
    { sku:"MB-ASUS-Z790H-001",    name:"ASUS ROG MAXIMUS Z790 Hero",               modelName:"ROG MAXIMUS Z790 HERO",cId:cMb.id,bId:bAsus.id,      sId:s1.id,wId:w2.id,qty:2, saf:3, price:699000, status:"LOW_STOCK", imageUrl:null, specs:{소켓:"LGA1700",칩셋:"Z790",  폼팩터:"ATX",  메모리슬롯:"DDR5 ×4"} },
    // ── PSU +10 (총 12종) ─────────────────────────────────────────────────────
    { sku:"PSU-SEA-650G-001",     name:"Seasonic FOCUS GX-650 골드",               modelName:"FOCUS-GX-650",       cId:cPsu.id,bId:bSeas.id,       sId:s2.id,wId:w3.id,qty:20,saf:8, price:139000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"650W", 등급:"80+ Gold",    모듈방식:"완전모듈",팬:"120mm"} },
    { sku:"PSU-SEA-750G-001",     name:"Seasonic FOCUS GX-750 골드",               modelName:"FOCUS-GX-750",       cId:cPsu.id,bId:bSeas.id,       sId:s2.id,wId:w3.id,qty:18,saf:8, price:159000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"750W", 등급:"80+ Gold",    모듈방식:"완전모듈",팬:"120mm"} },
    { sku:"PSU-SEA-1000G-001",    name:"Seasonic FOCUS GX-1000 골드",              modelName:"FOCUS-GX-1000",      cId:cPsu.id,bId:bSeas.id,       sId:s2.id,wId:w3.id,qty:9, saf:5, price:229000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"1000W",등급:"80+ Gold",    모듈방식:"완전모듈",팬:"120mm"} },
    { sku:"PSU-BEQ-750M-001",     name:"be quiet! Pure Power 12M 750W",            modelName:"BN343",              cId:cPsu.id,bId:bBeq.id,        sId:s2.id,wId:w3.id,qty:12,saf:6, price:149000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"750W", 등급:"80+ Gold",    모듈방식:"완전모듈",팬:"120mm"} },
    { sku:"PSU-COR-RM850-001",    name:"Corsair RM850e 골드",                      modelName:"CP-9020264",         cId:cPsu.id,bId:bCor.id,        sId:s3.id,wId:w3.id,qty:14,saf:6, price:189000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"850W", 등급:"80+ Gold",    모듈방식:"완전모듈",팬:"135mm"} },
    { sku:"PSU-COR-RM1000-001",   name:"Corsair RM1000e 골드",                     modelName:"CP-9020266",         cId:cPsu.id,bId:bCor.id,        sId:s3.id,wId:w3.id,qty:8, saf:4, price:239000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"1000W",등급:"80+ Gold",    모듈방식:"완전모듈",팬:"135mm"} },
    { sku:"PSU-TTK-GF3-850-001",  name:"Thermaltake Toughpower GF3 850W 골드",    modelName:"PS-TPD-0850FNFAGE", cId:cPsu.id,bId:bThermaltake.id,sId:s3.id,wId:w3.id,qty:10,saf:5, price:159000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"850W", 등급:"80+ Gold",    모듈방식:"완전모듈",팬:"140mm"} },
    { sku:"PSU-CM-MWE750-001",    name:"Cooler Master MWE Gold 750W V2",           modelName:"MPY-7501-AFAAG",     cId:cPsu.id,bId:bCM.id,         sId:s3.id,wId:w3.id,qty:15,saf:6, price:129000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"750W", 등급:"80+ Gold",    모듈방식:"완전모듈",팬:"120mm"} },
    { sku:"PSU-GIGA-P850-001",    name:"Gigabyte P850GM 플래티넘",                  modelName:"GP-P850GM",          cId:cPsu.id,bId:bGiga.id,       sId:s2.id,wId:w3.id,qty:7, saf:4, price:139000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"850W", 등급:"80+ Platinum",모듈방식:"완전모듈",팬:"120mm"} },
    { sku:"PSU-MSI-A850G-001",    name:"MSI MPG A850G 골드",                       modelName:"MPG A850G PCIE5",    cId:cPsu.id,bId:bMsi.id,        sId:s2.id,wId:w3.id,qty:9, saf:5, price:189000, status:"IN_STOCK",  imageUrl:null, specs:{출력:"850W", 등급:"80+ Gold",    모듈방식:"완전모듈",팬:"135mm"} },
    // ── Case +10 (총 11종) ────────────────────────────────────────────────────
    { sku:"CASE-LL-LC216-001",    name:"Lian Li Lancool 216 RGB",                  modelName:"G99.LAN216RX.00",    cId:cCase.id,bId:bLianLi.id,    sId:s3.id,wId:w3.id,qty:8, saf:5, price:109000, status:"IN_STOCK",  imageUrl:null, specs:{폼팩터:"ATX Mid",재질:"스틸+강화유리",베이:'2×3.5"',쿨링:"최대 6팬"} },
    { sku:"CASE-LL-O11EVO-001",   name:"Lian Li O11 Dynamic EVO",                 modelName:"G99.O11DERGBX.IN",   cId:cCase.id,bId:bLianLi.id,    sId:s3.id,wId:w3.id,qty:5, saf:4, price:189000, status:"LOW_STOCK", imageUrl:null, specs:{폼팩터:"ATX Mid",재질:"알루미늄+강화유리",베이:'2×3.5"',쿨링:"최대 10팬"} },
    { sku:"CASE-CM-HAF500-001",   name:"Cooler Master HAF 500",                    modelName:"H500-KGNN-S00",      cId:cCase.id,bId:bCM.id,        sId:s3.id,wId:w3.id,qty:7, saf:4, price:149000, status:"IN_STOCK",  imageUrl:null, specs:{폼팩터:"ATX Mid",재질:"스틸+강화유리",베이:'2×3.5"',쿨링:"최대 6팬"} },
    { sku:"CASE-FRD-DEF7C-001",   name:"Fractal Design Define 7 Compact",          modelName:"FD-C-DEF7C-01",      cId:cCase.id,bId:bFrd.id,       sId:s3.id,wId:w3.id,qty:4, saf:3, price:139000, status:"LOW_STOCK", imageUrl:null, specs:{폼팩터:"mATX Mid",재질:"스틸+강화유리",베이:'2×3.5"',쿨링:"최대 3팬"} },
    { sku:"CASE-NZXT-H7F-001",    name:"NZXT H7 Flow",                             modelName:"CC-H71FB-01",        cId:cCase.id,bId:bNZXT.id,      sId:s4.id,wId:w3.id,qty:6, saf:4, price:169000, status:"IN_STOCK",  imageUrl:null, specs:{폼팩터:"ATX Mid",재질:"스틸+강화유리",베이:'1×3.5"',쿨링:"최대 7팬"} },
    { sku:"CASE-COR-4000D-001",   name:"Corsair 4000D Airflow",                    modelName:"CC-9011200-WW",      cId:cCase.id,bId:bCor.id,       sId:s3.id,wId:w3.id,qty:9, saf:5, price:129000, status:"IN_STOCK",  imageUrl:null, specs:{폼팩터:"ATX Mid",재질:"스틸+강화유리",베이:'2×3.5"',쿨링:"최대 6팬"} },
    { sku:"CASE-PHK-G500A-001",   name:"Phanteks Eclipse G500A",                   modelName:"PH-EC500ATG_DBK01",  cId:cCase.id,bId:bPhanteks.id,  sId:s4.id,wId:w3.id,qty:5, saf:3, price:109000, status:"LOW_STOCK", imageUrl:null, specs:{폼팩터:"ATX Mid",재질:"스틸+강화유리",베이:'2×3.5"',쿨링:"최대 6팬"} },
    { sku:"CASE-TTK-H200-001",    name:"Thermaltake H200 TG Snow",                 modelName:"CA-1M3-00M6WN-00",   cId:cCase.id,bId:bThermaltake.id,sId:s4.id,wId:w3.id,qty:10,saf:5, price:89000,  status:"IN_STOCK",  imageUrl:null, specs:{폼팩터:"ATX Mid",재질:"스틸+강화유리",베이:'2×3.5"',쿨링:"최대 5팬"} },
    { sku:"CASE-SST-FARAB1-001",  name:"SilverStone FARA B1",                      modelName:"SST-FAB1B",          cId:cCase.id,bId:bSilverstone.id,sId:s4.id,wId:w3.id,qty:7, saf:4, price:79000,  status:"IN_STOCK",  imageUrl:null, specs:{폼팩터:"ATX Mid",재질:"스틸+강화유리",베이:'2×3.5"',쿨링:"최대 6팬"} },
    { sku:"CASE-BEQ-PB500-001",   name:"be quiet! Pure Base 500DX",                modelName:"BGW37",              cId:cCase.id,bId:bBeq.id,       sId:s4.id,wId:w3.id,qty:6, saf:4, price:139000, status:"IN_STOCK",  imageUrl:null, specs:{폼팩터:"ATX Mid",재질:"스틸+강화유리",베이:'2×3.5"',쿨링:"최대 3팬"} },
    // ── Cooler +10 (총 11종) ──────────────────────────────────────────────────
    { sku:"COOL-NOC-U12A-001",    name:"Noctua NH-U12A chromax.black",             modelName:"NH-U12A chromax",    cId:cCool.id,bId:bNoc.id,       sId:s4.id,wId:w3.id,qty:10,saf:5, price:109000, status:"IN_STOCK",  imageUrl:null, specs:{높이:"158mm", 팬:"NF-A12x25 ×2",   소켓:"LGA1700/AM5/AM4",TDP:"200W+"} },
    { sku:"COOL-BEQ-DRP4-001",    name:"be quiet! Dark Rock Pro 4",                modelName:"BK022",              cId:cCool.id,bId:bBeq.id,       sId:s4.id,wId:w3.id,qty:8, saf:4, price:89000,  status:"IN_STOCK",  imageUrl:null, specs:{높이:"162.8mm",팬:"Silent Wings 3 ×2",소켓:"LGA1700/AM5/AM4",TDP:"250W+"} },
    { sku:"COOL-CM-H212B-001",    name:"Cooler Master Hyper 212 Black Edition",    modelName:"RR-212S-20PK-R2",    cId:cCool.id,bId:bCM.id,        sId:s3.id,wId:w3.id,qty:25,saf:10,price:45000,  status:"IN_STOCK",  imageUrl:null, specs:{높이:"158.8mm",팬:"Silencio FP120 ×1",소켓:"LGA1700/AM5/AM4",TDP:"150W+"} },
    { sku:"COOL-DPC-AK620-001",   name:"DeepCool AK620",                           modelName:"R-AK620-BKNNMT-G",  cId:cCool.id,bId:bDeepCool.id,  sId:s3.id,wId:w3.id,qty:18,saf:8, price:69000,  status:"IN_STOCK",  imageUrl:null, specs:{높이:"160mm", 팬:"FK120 ×2",       소켓:"LGA1700/AM5/AM4",TDP:"260W+"} },
    { sku:"COOL-DPC-ASS4-001",    name:"DeepCool ASSASSIN IV",                     modelName:"R-ASN4-BKNNMT-G",   cId:cCool.id,bId:bDeepCool.id,  sId:s3.id,wId:w3.id,qty:6, saf:4, price:99000,  status:"IN_STOCK",  imageUrl:null, specs:{높이:"165mm", 팬:"FT140 ×2",       소켓:"LGA1700/AM5/AM4",TDP:"280W+"} },
    { sku:"COOL-TRG-PA120-001",   name:"Thermalright Peerless Assassin 120 SE",   modelName:"PA120 SE",           cId:cCool.id,bId:bThermalright.id,sId:s3.id,wId:w3.id,qty:22,saf:10,price:55000, status:"IN_STOCK",  imageUrl:null, specs:{높이:"157mm", 팬:"TL-C12 ×2",      소켓:"LGA1700/AM5/AM4",TDP:"220W+"} },
    { sku:"COOL-ARC-LF3360-001",  name:"ARCTIC Liquid Freezer III 360",            modelName:"ACFRE00136A",        cId:cCool.id,bId:bARCTIC.id,    sId:s4.id,wId:w3.id,qty:9, saf:4, price:129000, status:"IN_STOCK",  imageUrl:null, specs:{라디:"360mm",  팬:"P12 MAX ×3",     소켓:"LGA1700/AM5/AM4",TDP:"350W+"} },
    { sku:"COOL-COR-H150I-001",   name:"Corsair iCUE H150i Elite LCD 360",        modelName:"CW-9060075-WW",      cId:cCool.id,bId:bCor.id,       sId:s4.id,wId:w3.id,qty:5, saf:3, price:199000, status:"LOW_STOCK", imageUrl:null, specs:{라디:"360mm",  팬:"QL120 ×3",       소켓:"LGA1700/AM5/AM4",TDP:"350W+"} },
    { sku:"COOL-NZXT-K360-001",   name:"NZXT Kraken 360",                          modelName:"RL-KN360-B1",        cId:cCool.id,bId:bNZXT.id,      sId:s4.id,wId:w3.id,qty:7, saf:4, price:229000, status:"IN_STOCK",  imageUrl:null, specs:{라디:"360mm",  팬:"F120P ×3",       소켓:"LGA1700/AM5/AM4",TDP:"350W+"} },
    { sku:"COOL-BEQ-SL3360-001",  name:"be quiet! Silent Loop 3 360",              modelName:"BW014",              cId:cCool.id,bId:bBeq.id,       sId:s4.id,wId:w3.id,qty:4, saf:3, price:199000, status:"LOW_STOCK", imageUrl:null, specs:{라디:"360mm",  팬:"Silent Wings Pro4 ×3",소켓:"LGA1700/AM5/AM4",TDP:"350W+"} },
  ];

  // createMany with skipDuplicates (unique: sku+warehouseId)
  let created = 0;
  for (const { cId,bId,sId,wId,qty,saf,price,status,specs,...rest } of newItems) {
    try {
      await prisma.inventoryItem.create({
        data: { ...rest, categoryId:cId, brandId:bId, supplierId:sId, warehouseId:wId,
                quantity:qty, safetyStock:saf, unitPrice:price, status, specs },
      });
      created++;
    } catch (e) {
      if (e.code === "P2002") { /* skip duplicate */ }
      else throw e;
    }
  }

  console.log(`✅ Done — ${created} new items added (${newItems.length - created} skipped as duplicates)`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
