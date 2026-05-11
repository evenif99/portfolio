import type {
  Category, Brand, Supplier, Warehouse,
  InventoryItem, StockTransaction, Shipment, LowStockAlert,
  DashboardKpis,
} from "./types";

// ─── Categories ───────────────────────────────────────────────────────────────

export const mockCategories: Category[] = [
  { id: 1, name: "그래픽카드 (GPU)", slug: "gpu",       icon: "Gpu",     itemCount: 6 },
  { id: 2, name: "프로세서 (CPU)",   slug: "cpu",       icon: "Cpu",     itemCount: 5 },
  { id: 3, name: "메모리 (RAM)",     slug: "ram",       icon: "MemoryStick", itemCount: 4 },
  { id: 4, name: "SSD",             slug: "ssd",       icon: "HardDrive", itemCount: 4 },
  { id: 5, name: "HDD",             slug: "hdd",       icon: "HardDrive", itemCount: 2 },
  { id: 6, name: "메인보드",         slug: "mainboard", icon: "CircuitBoard", itemCount: 4 },
  { id: 7, name: "파워서플라이",      slug: "psu",       icon: "Zap",     itemCount: 3 },
  { id: 8, name: "케이스",           slug: "case",      icon: "Box",     itemCount: 2 },
  { id: 9, name: "쿨러/팬",          slug: "cooler",    icon: "Wind",    itemCount: 2 },
];

// ─── Brands ───────────────────────────────────────────────────────────────────

export const mockBrands: Brand[] = [
  { id: 1,  name: "NVIDIA",          itemCount: 4 },
  { id: 2,  name: "AMD",             itemCount: 5 },
  { id: 3,  name: "Intel",           itemCount: 3 },
  { id: 4,  name: "Samsung",         itemCount: 3 },
  { id: 5,  name: "SK hynix",        itemCount: 2 },
  { id: 6,  name: "Seagate",         itemCount: 2 },
  { id: 7,  name: "ASUS",            itemCount: 3 },
  { id: 8,  name: "MSI",             itemCount: 2 },
  { id: 9,  name: "Gigabyte",        itemCount: 2 },
  { id: 10, name: "Corsair",         itemCount: 2 },
  { id: 11, name: "G.Skill",         itemCount: 2 },
  { id: 12, name: "Seasonic",        itemCount: 2 },
  { id: 13, name: "be quiet!",       itemCount: 1 },
  { id: 14, name: "Noctua",          itemCount: 1 },
  { id: 15, name: "Fractal Design",  itemCount: 1 },
];

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const mockSuppliers: Supplier[] = [
  { id: 1, name: "대한IT유통",       contact: "김대한", email: "sales@daehanit.co.kr",   phone: "02-1234-5678", address: "서울 용산구 한강대로 23", itemCount: 8,  createdAt: "2024-01-10" },
  { id: 2, name: "하이텍코리아",     contact: "이하이", email: "order@hitech-kr.com",     phone: "031-987-6543", address: "경기 성남시 분당구 판교로 12", itemCount: 6, createdAt: "2024-02-15" },
  { id: 3, name: "픽시부품유통",     contact: "박픽시", email: "supply@pixiparts.kr",     phone: "032-456-7890", address: "인천 서구 청라국제도시로 44", itemCount: 5, createdAt: "2024-03-20" },
  { id: 4, name: "넥스트레벨IT",     contact: "최넥스", email: "b2b@nextlevelit.kr",      phone: "02-5678-1234", address: "서울 강남구 테헤란로 518", itemCount: 4, createdAt: "2024-04-01" },
  { id: 5, name: "코어하드웨어",     contact: "정코어", email: "wholesale@corehw.co.kr",  phone: "051-321-6547", address: "부산 해운대구 센텀북대로 60", itemCount: 9, createdAt: "2024-01-25" },
];

// ─── Warehouses ───────────────────────────────────────────────────────────────

export const mockWarehouses: Warehouse[] = [
  { id: 1, name: "인천 A동",    location: "인천 서구 원창동", zone: "A",    itemCount: 14, totalQuantity: 312 },
  { id: 2, name: "인천 B동",    location: "인천 서구 원창동", zone: "B",    itemCount: 10, totalQuantity: 198 },
  { id: 3, name: "서울 직배송",  location: "서울 강서구 양천로", zone: "서울", itemCount: 8,  totalQuantity: 87  },
];

// ─── Inventory Items ──────────────────────────────────────────────────────────

export const mockInventory: InventoryItem[] = [
  // GPU
  {
    id: 1, sku: "GPU-NV-4060TI-001", name: "NVIDIA GeForce RTX 4060 Ti 8GB", modelName: "RTX 4060 Ti",
    category: mockCategories[0], brand: mockBrands[0], supplier: mockSuppliers[0], warehouse: mockWarehouses[0],
    quantity: 34, safetyStock: 15, unitPrice: 489000, status: "IN_STOCK",
    specs: { 메모리: "8GB GDDR6", 인터페이스: "PCIe 4.0 x16", TDP: "165W", 포트: "HDMI 2.1 x1, DP 1.4a x3" },
    createdAt: "2024-03-01", updatedAt: "2025-05-10",
  },
  {
    id: 2, sku: "GPU-NV-4070S-001", name: "NVIDIA GeForce RTX 4070 SUPER 12GB", modelName: "RTX 4070 SUPER",
    category: mockCategories[0], brand: mockBrands[0], supplier: mockSuppliers[0], warehouse: mockWarehouses[0],
    quantity: 8, safetyStock: 10, unitPrice: 689000, status: "LOW_STOCK",
    specs: { 메모리: "12GB GDDR6X", 인터페이스: "PCIe 4.0 x16", TDP: "220W", 포트: "HDMI 2.1 x1, DP 1.4a x3" },
    createdAt: "2024-03-01", updatedAt: "2025-05-11",
  },
  {
    id: 3, sku: "GPU-NV-4080S-001", name: "NVIDIA GeForce RTX 4080 SUPER 16GB", modelName: "RTX 4080 SUPER",
    category: mockCategories[0], brand: mockBrands[0], supplier: mockSuppliers[1], warehouse: mockWarehouses[0],
    quantity: 0, safetyStock: 8, unitPrice: 1089000, status: "OUT_OF_STOCK",
    specs: { 메모리: "16GB GDDR6X", 인터페이스: "PCIe 4.0 x16", TDP: "320W", 포트: "HDMI 2.1 x1, DP 1.4a x3" },
    createdAt: "2024-03-15", updatedAt: "2025-05-09",
  },
  {
    id: 4, sku: "GPU-AMD-7600-001", name: "AMD Radeon RX 7600 8GB", modelName: "RX 7600",
    category: mockCategories[0], brand: mockBrands[1], supplier: mockSuppliers[2], warehouse: mockWarehouses[1],
    quantity: 22, safetyStock: 12, unitPrice: 329000, status: "IN_STOCK",
    specs: { 메모리: "8GB GDDR6", 인터페이스: "PCIe 4.0 x8", TDP: "165W", 포트: "HDMI 2.1 x1, DP 2.1 x3" },
    createdAt: "2024-04-01", updatedAt: "2025-05-10",
  },
  {
    id: 5, sku: "GPU-AMD-7800XT-001", name: "AMD Radeon RX 7800 XT 16GB", modelName: "RX 7800 XT",
    category: mockCategories[0], brand: mockBrands[1], supplier: mockSuppliers[2], warehouse: mockWarehouses[1],
    quantity: 5, safetyStock: 8, unitPrice: 579000, status: "LOW_STOCK",
    specs: { 메모리: "16GB GDDR6", 인터페이스: "PCIe 4.0 x16", TDP: "263W", 포트: "HDMI 2.1 x1, DP 2.1 x3" },
    createdAt: "2024-04-01", updatedAt: "2025-05-11",
  },
  // CPU
  {
    id: 6, sku: "CPU-INT-13400F-001", name: "Intel Core i5-13400F", modelName: "Core i5-13400F",
    category: mockCategories[1], brand: mockBrands[2], supplier: mockSuppliers[0], warehouse: mockWarehouses[0],
    quantity: 47, safetyStock: 20, unitPrice: 219000, status: "IN_STOCK",
    specs: { 코어: "10C (6P+4E)", 스레드: "16T", 기본클럭: "2.5GHz", 부스트클럭: "4.6GHz", TDP: "65W", 소켓: "LGA1700" },
    createdAt: "2024-02-01", updatedAt: "2025-05-10",
  },
  {
    id: 7, sku: "CPU-INT-13700K-001", name: "Intel Core i7-13700K", modelName: "Core i7-13700K",
    category: mockCategories[1], brand: mockBrands[2], supplier: mockSuppliers[0], warehouse: mockWarehouses[0],
    quantity: 19, safetyStock: 15, unitPrice: 389000, status: "IN_STOCK",
    specs: { 코어: "16C (8P+8E)", 스레드: "24T", 기본클럭: "3.4GHz", 부스트클럭: "5.4GHz", TDP: "125W", 소켓: "LGA1700" },
    createdAt: "2024-02-01", updatedAt: "2025-05-10",
  },
  {
    id: 8, sku: "CPU-AMD-7600X-001", name: "AMD Ryzen 5 7600X", modelName: "Ryzen 5 7600X",
    category: mockCategories[1], brand: mockBrands[1], supplier: mockSuppliers[4], warehouse: mockWarehouses[1],
    quantity: 3, safetyStock: 10, unitPrice: 279000, status: "LOW_STOCK",
    specs: { 코어: "6C/12T", 기본클럭: "4.7GHz", 부스트클럭: "5.3GHz", TDP: "105W", 소켓: "AM5" },
    createdAt: "2024-03-01", updatedAt: "2025-05-11",
  },
  {
    id: 9, sku: "CPU-AMD-7700X-001", name: "AMD Ryzen 7 7700X", modelName: "Ryzen 7 7700X",
    category: mockCategories[1], brand: mockBrands[1], supplier: mockSuppliers[4], warehouse: mockWarehouses[1],
    quantity: 28, safetyStock: 12, unitPrice: 369000, status: "IN_STOCK",
    specs: { 코어: "8C/16T", 기본클럭: "4.5GHz", 부스트클럭: "5.4GHz", TDP: "105W", 소켓: "AM5" },
    createdAt: "2024-03-01", updatedAt: "2025-05-10",
  },
  // RAM
  {
    id: 10, sku: "RAM-SAM-DDR5-32-001", name: "Samsung DDR5 32GB Kit (2×16GB) 5600MHz", modelName: "M323R2GA3BB0",
    category: mockCategories[2], brand: mockBrands[3], supplier: mockSuppliers[3], warehouse: mockWarehouses[0],
    quantity: 52, safetyStock: 20, unitPrice: 139000, status: "IN_STOCK",
    specs: { 용량: "32GB (2×16GB)", 규격: "DDR5", 클럭: "5600MHz", 레이턴시: "CL36", 전압: "1.1V" },
    createdAt: "2024-02-15", updatedAt: "2025-05-10",
  },
  {
    id: 11, sku: "RAM-GSK-TZ5-32-001", name: "G.Skill Trident Z5 DDR5 32GB Kit 6400MHz", modelName: "F5-6400J3239G16GX2-TZ5K",
    category: mockCategories[2], brand: mockBrands[10], supplier: mockSuppliers[3], warehouse: mockWarehouses[0],
    quantity: 14, safetyStock: 10, unitPrice: 189000, status: "IN_STOCK",
    specs: { 용량: "32GB (2×16GB)", 규격: "DDR5", 클럭: "6400MHz", 레이턴시: "CL32", 전압: "1.4V" },
    createdAt: "2024-04-01", updatedAt: "2025-05-10",
  },
  {
    id: 12, sku: "RAM-COR-DDR5-64-001", name: "Corsair Vengeance DDR5 64GB Kit 5200MHz", modelName: "CMK64GX5M2B5200C40",
    category: mockCategories[2], brand: mockBrands[9], supplier: mockSuppliers[1], warehouse: mockWarehouses[2],
    quantity: 7, safetyStock: 8, unitPrice: 259000, status: "LOW_STOCK",
    specs: { 용량: "64GB (2×32GB)", 규격: "DDR5", 클럭: "5200MHz", 레이턴시: "CL40", 전압: "1.25V" },
    createdAt: "2024-04-15", updatedAt: "2025-05-11",
  },
  // SSD
  {
    id: 13, sku: "SSD-SAM-990P-1T-001", name: "Samsung 990 Pro NVMe SSD 1TB", modelName: "MZ-V9P1T0BW",
    category: mockCategories[3], brand: mockBrands[3], supplier: mockSuppliers[0], warehouse: mockWarehouses[0],
    quantity: 63, safetyStock: 25, unitPrice: 139000, status: "IN_STOCK",
    specs: { 용량: "1TB", 인터페이스: "PCIe 4.0 x4 NVMe", 순차읽기: "7450 MB/s", 순차쓰기: "6900 MB/s", 폼팩터: "M.2 2280" },
    createdAt: "2024-01-20", updatedAt: "2025-05-10",
  },
  {
    id: 14, sku: "SSD-SKH-P41-1T-001", name: "SK hynix Platinum P41 NVMe 1TB", modelName: "SHPP41-1000GM-2",
    category: mockCategories[3], brand: mockBrands[4], supplier: mockSuppliers[4], warehouse: mockWarehouses[0],
    quantity: 39, safetyStock: 20, unitPrice: 119000, status: "IN_STOCK",
    specs: { 용량: "1TB", 인터페이스: "PCIe 4.0 x4 NVMe", 순차읽기: "7000 MB/s", 순차쓰기: "6500 MB/s", 폼팩터: "M.2 2280" },
    createdAt: "2024-01-20", updatedAt: "2025-05-10",
  },
  {
    id: 15, sku: "SSD-SAM-870EVO-2T-001", name: "Samsung 870 EVO SATA SSD 2TB", modelName: "MZ-77E2T0B/KR",
    category: mockCategories[3], brand: mockBrands[3], supplier: mockSuppliers[0], warehouse: mockWarehouses[1],
    quantity: 0, safetyStock: 15, unitPrice: 229000, status: "OUT_OF_STOCK",
    specs: { 용량: "2TB", 인터페이스: "SATA III 6Gb/s", 순차읽기: "560 MB/s", 순차쓰기: "530 MB/s", 폼팩터: "2.5인치" },
    createdAt: "2024-02-10", updatedAt: "2025-05-08",
  },
  // HDD
  {
    id: 16, sku: "HDD-SEA-8T-001", name: "Seagate IronWolf NAS HDD 8TB", modelName: "ST8000VN004",
    category: mockCategories[4], brand: mockBrands[5], supplier: mockSuppliers[2], warehouse: mockWarehouses[1],
    quantity: 17, safetyStock: 8, unitPrice: 299000, status: "IN_STOCK",
    specs: { 용량: "8TB", RPM: "7200", 캐시: "256MB", 인터페이스: "SATA III", 폼팩터: "3.5인치" },
    createdAt: "2024-03-10", updatedAt: "2025-05-10",
  },
  // Mainboard
  {
    id: 17, sku: "MB-ASUS-B650E-001", name: "ASUS ROG STRIX B650E-F Gaming WiFi", modelName: "ROG STRIX B650E-F",
    category: mockCategories[5], brand: mockBrands[6], supplier: mockSuppliers[1], warehouse: mockWarehouses[0],
    quantity: 11, safetyStock: 8, unitPrice: 389000, status: "IN_STOCK",
    specs: { 소켓: "AM5", 폼팩터: "ATX", 메모리슬롯: "4x DDR5", M2슬롯: "4개", WiFi: "6E" },
    createdAt: "2024-03-15", updatedAt: "2025-05-10",
  },
  {
    id: 18, sku: "MB-MSI-Z790-001", name: "MSI PRO Z790-A WiFi DDR5", modelName: "PRO Z790-A WiFi",
    category: mockCategories[5], brand: mockBrands[7], supplier: mockSuppliers[3], warehouse: mockWarehouses[0],
    quantity: 4, safetyStock: 8, unitPrice: 319000, status: "LOW_STOCK",
    specs: { 소켓: "LGA1700", 폼팩터: "ATX", 메모리슬롯: "4x DDR5", M2슬롯: "3개", WiFi: "6E" },
    createdAt: "2024-03-15", updatedAt: "2025-05-11",
  },
  // PSU
  {
    id: 19, sku: "PSU-SEA-850G-001", name: "Seasonic FOCUS GX-850 골드", modelName: "FOCUS-GX-850",
    category: mockCategories[6], brand: mockBrands[11], supplier: mockSuppliers[4], warehouse: mockWarehouses[2],
    quantity: 23, safetyStock: 10, unitPrice: 179000, status: "IN_STOCK",
    specs: { 출력: "850W", 등급: "80+ Gold", 모듈방식: "완전모듈", 팬크기: "120mm", 인증: "80+ Gold" },
    createdAt: "2024-02-20", updatedAt: "2025-05-10",
  },
  {
    id: 20, sku: "PSU-BEQ-1000P-001", name: "be quiet! Dark Power 13 1000W 플래티넘", modelName: "BN332",
    category: mockCategories[6], brand: mockBrands[12], supplier: mockSuppliers[1], warehouse: mockWarehouses[2],
    quantity: 6, safetyStock: 5, unitPrice: 289000, status: "IN_STOCK",
    specs: { 출력: "1000W", 등급: "80+ Platinum", 모듈방식: "완전모듈", 팬크기: "135mm", 인증: "80+ Platinum" },
    createdAt: "2024-04-10", updatedAt: "2025-05-10",
  },
  // Case
  {
    id: 21, sku: "CASE-FRD-NR400-001", name: "Fractal Design North Charcoal Black", modelName: "FD-C-NOR1C-02",
    category: mockCategories[7], brand: mockBrands[14], supplier: mockSuppliers[2], warehouse: mockWarehouses[2],
    quantity: 9, safetyStock: 5, unitPrice: 159000, status: "IN_STOCK",
    specs: { 폼팩터: "ATX Mid Tower", 재질: "메쉬+우드", 드라이브베이: "2×3.5\", 2×2.5\"", 쿨링: "최대 9개 팬" },
    createdAt: "2024-04-20", updatedAt: "2025-05-10",
  },
  // Cooler
  {
    id: 22, sku: "COOL-NOC-NHD15-001", name: "Noctua NH-D15 크롬맥스 CPU 쿨러", modelName: "NH-D15 chromax.black",
    category: mockCategories[8], brand: mockBrands[13], supplier: mockSuppliers[3], warehouse: mockWarehouses[2],
    quantity: 12, safetyStock: 5, unitPrice: 129000, status: "IN_STOCK",
    specs: { 높이: "165mm", 팬: "NF-A15 ×2", 소켓지원: "LGA1700, AM5, AM4", TDP: "250W+" },
    createdAt: "2024-05-01", updatedAt: "2025-05-10",
  },
];

// ─── Transactions ─────────────────────────────────────────────────────────────

export const mockTransactions: StockTransaction[] = [
  { id: 1,  type: "INBOUND",    item: { id: 1,  sku: "GPU-NV-4060TI-001", name: "NVIDIA GeForce RTX 4060 Ti 8GB",      modelName: "RTX 4060 Ti"     }, quantity: 20, user: { id: 1, name: "김운영" }, reference: "PO-2025-0501", notes: "정기 입고",      createdAt: "2025-05-11T09:00:00" },
  { id: 2,  type: "OUTBOUND",   item: { id: 2,  sku: "GPU-NV-4070S-001",  name: "NVIDIA GeForce RTX 4070 SUPER 12GB", modelName: "RTX 4070 SUPER"  }, quantity: 5,  user: { id: 1, name: "김운영" }, reference: "SHP-2025-0047", notes: "출고 처리",     createdAt: "2025-05-11T09:30:00" },
  { id: 3,  type: "INBOUND",    item: { id: 13, sku: "SSD-SAM-990P-1T-001", name: "Samsung 990 Pro NVMe SSD 1TB",     modelName: "MZ-V9P1T0BW"    }, quantity: 30, user: { id: 2, name: "이창고" }, reference: "PO-2025-0502", notes: "삼성 정기 입고", createdAt: "2025-05-11T10:15:00" },
  { id: 4,  type: "OUTBOUND",   item: { id: 6,  sku: "CPU-INT-13400F-001", name: "Intel Core i5-13400F",             modelName: "Core i5-13400F" }, quantity: 10, user: { id: 1, name: "김운영" }, reference: "SHP-2025-0048", notes: "",              createdAt: "2025-05-11T11:00:00" },
  { id: 5,  type: "ADJUSTMENT", item: { id: 5,  sku: "GPU-AMD-7800XT-001", name: "AMD Radeon RX 7800 XT 16GB",       modelName: "RX 7800 XT"     }, quantity: -2, user: { id: 2, name: "이창고" }, reference: "ADJ-2025-0023", notes: "불량 처리",     createdAt: "2025-05-10T16:00:00" },
  { id: 6,  type: "INBOUND",    item: { id: 10, sku: "RAM-SAM-DDR5-32-001", name: "Samsung DDR5 32GB Kit",           modelName: "M323R2GA3BB0"   }, quantity: 25, user: { id: 1, name: "김운영" }, reference: "PO-2025-0499", notes: "주간 입고",     createdAt: "2025-05-10T14:30:00" },
  { id: 7,  type: "OUTBOUND",   item: { id: 17, sku: "MB-ASUS-B650E-001",  name: "ASUS ROG STRIX B650E-F Gaming WiFi", modelName: "ROG STRIX B650E-F" }, quantity: 3, user: { id: 1, name: "김운영" }, reference: "SHP-2025-0046", notes: "",           createdAt: "2025-05-10T13:00:00" },
  { id: 8,  type: "RETURN",     item: { id: 4,  sku: "GPU-AMD-7600-001",   name: "AMD Radeon RX 7600 8GB",           modelName: "RX 7600"        }, quantity: 2,  user: { id: 2, name: "이창고" }, reference: "RTN-2025-0008", notes: "반품 입고",     createdAt: "2025-05-10T10:00:00" },
  { id: 9,  type: "INBOUND",    item: { id: 19, sku: "PSU-SEA-850G-001",   name: "Seasonic FOCUS GX-850 골드",       modelName: "FOCUS-GX-850"   }, quantity: 15, user: { id: 1, name: "김운영" }, reference: "PO-2025-0498", notes: "시즌 입고",     createdAt: "2025-05-09T15:00:00" },
  { id: 10, type: "OUTBOUND",   item: { id: 14, sku: "SSD-SKH-P41-1T-001", name: "SK hynix Platinum P41 NVMe 1TB",  modelName: "SHPP41-1000GM-2" }, quantity: 8,  user: { id: 1, name: "김운영" }, reference: "SHP-2025-0045", notes: "",              createdAt: "2025-05-09T11:30:00" },
  { id: 11, type: "INBOUND",    item: { id: 7,  sku: "CPU-INT-13700K-001", name: "Intel Core i7-13700K",             modelName: "Core i7-13700K" }, quantity: 12, user: { id: 2, name: "이창고" }, reference: "PO-2025-0497", notes: "인텔 입고",     createdAt: "2025-05-09T09:00:00" },
  { id: 12, type: "ADJUSTMENT", item: { id: 15, sku: "SSD-SAM-870EVO-2T-001", name: "Samsung 870 EVO SATA SSD 2TB", modelName: "MZ-77E2T0B/KR"  }, quantity: -5, user: { id: 2, name: "이창고" }, reference: "ADJ-2025-0022", notes: "재고 실사 보정", createdAt: "2025-05-08T17:00:00" },
];

// ─── Shipments ────────────────────────────────────────────────────────────────

export const mockShipments: Shipment[] = [
  {
    id: 1, shipmentNo: "SHP-2025-0048", status: "PICKING", priority: "URGENT",
    requester: "테크스타 유통(주)", department: "구매팀", dueDate: "2025-05-12", user: { id: 1, name: "김운영" },
    items: [
      { id: 1, item: { id: 6,  sku: "CPU-INT-13400F-001", name: "Intel Core i5-13400F",      modelName: "Core i5-13400F"  }, quantity: 10 },
      { id: 2, item: { id: 10, sku: "RAM-SAM-DDR5-32-001", name: "Samsung DDR5 32GB Kit",    modelName: "M323R2GA3BB0"   }, quantity: 10 },
    ],
    notes: "납기 준수 필수 — 고객사 요청", createdAt: "2025-05-11T08:00:00", updatedAt: "2025-05-11T11:00:00",
  },
  {
    id: 2, shipmentNo: "SHP-2025-0047", status: "PACKED", priority: "HIGH",
    requester: "하이컴퓨터 인천점", department: "영업팀", dueDate: "2025-05-13", user: { id: 1, name: "김운영" },
    items: [
      { id: 3, item: { id: 2, sku: "GPU-NV-4070S-001", name: "NVIDIA GeForce RTX 4070 SUPER 12GB", modelName: "RTX 4070 SUPER" }, quantity: 5 },
    ],
    notes: "", createdAt: "2025-05-10T14:00:00", updatedAt: "2025-05-11T09:30:00",
  },
  {
    id: 3, shipmentNo: "SHP-2025-0046", status: "SHIPPED", priority: "NORMAL",
    requester: "디지털플라자 강남", dueDate: "2025-05-11", shippedAt: "2025-05-11T07:00:00", user: { id: 1, name: "김운영" },
    items: [
      { id: 4, item: { id: 17, sku: "MB-ASUS-B650E-001", name: "ASUS ROG STRIX B650E-F Gaming WiFi", modelName: "ROG STRIX B650E-F" }, quantity: 3 },
    ],
    notes: "", createdAt: "2025-05-09T10:00:00", updatedAt: "2025-05-11T07:00:00",
  },
  {
    id: 4, shipmentNo: "SHP-2025-0045", status: "DELAYED", priority: "HIGH",
    requester: "코어시스템 부산", department: "IT팀", dueDate: "2025-05-10", user: { id: 2, name: "이창고" },
    items: [
      { id: 5, item: { id: 14, sku: "SSD-SKH-P41-1T-001", name: "SK hynix Platinum P41 NVMe 1TB", modelName: "SHPP41-1000GM-2" }, quantity: 8 },
      { id: 6, item: { id: 7,  sku: "CPU-INT-13700K-001", name: "Intel Core i7-13700K",           modelName: "Core i7-13700K"  }, quantity: 5 },
    ],
    notes: "재고 부족으로 출고 지연 — 긴급 발주 진행 중", createdAt: "2025-05-08T09:00:00", updatedAt: "2025-05-11T10:00:00",
  },
  {
    id: 5, shipmentNo: "SHP-2025-0044", status: "COMPLETED", priority: "NORMAL",
    requester: "하이텍솔루션", dueDate: "2025-05-09", shippedAt: "2025-05-09T08:30:00", user: { id: 1, name: "김운영" },
    items: [
      { id: 7, item: { id: 1, sku: "GPU-NV-4060TI-001", name: "NVIDIA GeForce RTX 4060 Ti 8GB", modelName: "RTX 4060 Ti" }, quantity: 8 },
      { id: 8, item: { id: 13, sku: "SSD-SAM-990P-1T-001", name: "Samsung 990 Pro NVMe SSD 1TB", modelName: "MZ-V9P1T0BW" }, quantity: 8 },
    ],
    notes: "", createdAt: "2025-05-07T13:00:00", updatedAt: "2025-05-09T08:30:00",
  },
  {
    id: 6, shipmentNo: "SHP-2025-0043", status: "PENDING", priority: "LOW",
    requester: "넥스트레벨IT", department: "구매팀", dueDate: "2025-05-16", user: { id: 1, name: "김운영" },
    items: [
      { id: 9, item: { id: 19, sku: "PSU-SEA-850G-001", name: "Seasonic FOCUS GX-850 골드", modelName: "FOCUS-GX-850" }, quantity: 5 },
      { id: 10, item: { id: 21, sku: "CASE-FRD-NR400-001", name: "Fractal Design North", modelName: "FD-C-NOR1C-02" }, quantity: 5 },
    ],
    notes: "주말 후 처리 예정", createdAt: "2025-05-11T11:00:00", updatedAt: "2025-05-11T11:00:00",
  },
  {
    id: 7, shipmentNo: "SHP-2025-0042", status: "APPROVED", priority: "NORMAL",
    requester: "GS네오텍", department: "인프라팀", dueDate: "2025-05-14", user: { id: 2, name: "이창고" },
    items: [
      { id: 11, item: { id: 9, sku: "CPU-AMD-7700X-001", name: "AMD Ryzen 7 7700X", modelName: "Ryzen 7 7700X" }, quantity: 6 },
      { id: 12, item: { id: 11, sku: "RAM-GSK-TZ5-32-001", name: "G.Skill Trident Z5 DDR5 32GB Kit", modelName: "F5-6400J3239G16GX2-TZ5K" }, quantity: 6 },
    ],
    notes: "", createdAt: "2025-05-10T16:00:00", updatedAt: "2025-05-11T09:00:00",
  },
];

// ─── Low Stock Alerts ─────────────────────────────────────────────────────────

export const mockAlerts: LowStockAlert[] = [
  { id: 1, item: { id: 2,  sku: "GPU-NV-4070S-001",    name: "NVIDIA GeForce RTX 4070 SUPER 12GB",  modelName: "RTX 4070 SUPER",    quantity: 8,  safetyStock: 10 }, threshold: 10, resolved: false, createdAt: "2025-05-11T06:00:00" },
  { id: 2, item: { id: 3,  sku: "GPU-NV-4080S-001",    name: "NVIDIA GeForce RTX 4080 SUPER 16GB",  modelName: "RTX 4080 SUPER",    quantity: 0,  safetyStock: 8  }, threshold: 8,  resolved: false, createdAt: "2025-05-09T06:00:00" },
  { id: 3, item: { id: 5,  sku: "GPU-AMD-7800XT-001",  name: "AMD Radeon RX 7800 XT 16GB",          modelName: "RX 7800 XT",        quantity: 5,  safetyStock: 8  }, threshold: 8,  resolved: false, createdAt: "2025-05-11T06:00:00" },
  { id: 4, item: { id: 8,  sku: "CPU-AMD-7600X-001",   name: "AMD Ryzen 5 7600X",                   modelName: "Ryzen 5 7600X",     quantity: 3,  safetyStock: 10 }, threshold: 10, resolved: false, createdAt: "2025-05-11T06:00:00" },
  { id: 5, item: { id: 12, sku: "RAM-COR-DDR5-64-001", name: "Corsair Vengeance DDR5 64GB Kit",     modelName: "CMK64GX5M2B5200C40", quantity: 7, safetyStock: 8  }, threshold: 8,  resolved: false, createdAt: "2025-05-11T06:00:00" },
  { id: 6, item: { id: 15, sku: "SSD-SAM-870EVO-2T-001", name: "Samsung 870 EVO SATA SSD 2TB",      modelName: "MZ-77E2T0B/KR",     quantity: 0,  safetyStock: 15 }, threshold: 15, resolved: false, createdAt: "2025-05-08T06:00:00" },
  { id: 7, item: { id: 18, sku: "MB-MSI-Z790-001",     name: "MSI PRO Z790-A WiFi DDR5",            modelName: "PRO Z790-A WiFi",   quantity: 4,  safetyStock: 8  }, threshold: 8,  resolved: false, createdAt: "2025-05-11T06:00:00" },
];

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export const mockKpis: DashboardKpis = {
  totalSkus:        22,
  totalQuantity:    597,
  todayInbound:     65,   // items received today
  todayOutbound:    15,   // items shipped today
  lowStockCount:    7,
  urgentShipments:  2,
};

// ─── Category Distribution (for charts) ──────────────────────────────────────

export const mockCategoryDistribution = [
  { category: "GPU",        count: 69,  value: 6 },
  { category: "CPU",        count: 97,  value: 5 },
  { category: "RAM",        count: 73,  value: 4 },
  { category: "SSD",        count: 102, value: 4 },
  { category: "HDD",        count: 17,  value: 2 },
  { category: "메인보드",   count: 15,  value: 4 },
  { category: "PSU",        count: 29,  value: 3 },
  { category: "케이스",     count: 9,   value: 2 },
  { category: "쿨러",       count: 12,  value: 2 },
];
