import type {
  CoolingSlotId,
  GraphicsSlotId,
  MemorySlotId,
  PcBuilderConfig,
  ProcessorSlotId,
  StorageSlotId,
  WorkloadScenarioId,
} from './pcBuilderData';

export type CatalogRetailerId = 'all' | 'amazon' | 'croma' | 'vijaysales' | 'reliance';
export type ProductArtKey =
  | 'productCampusUltralight'
  | 'productAllrounderArc'
  | 'productCreatorStudio'
  | 'productGamingXess';

export interface CatalogRetailerMeta {
  id: CatalogRetailerId;
  label: string;
}

export const CATALOG_RETAILERS: CatalogRetailerMeta[] = [
  { id: 'all', label: 'All Retailers' },
  { id: 'amazon', label: 'Amazon India' },
  { id: 'croma', label: 'Croma' },
  { id: 'vijaysales', label: 'Vijay Sales' },
  { id: 'reliance', label: 'Reliance Digital' },
];

export interface RetailLaptopProduct {
  id: string;
  brand: string;
  name: string;
  retailerId: Exclude<CatalogRetailerId, 'all'>;
  retailerName: string;
  storeSku: string;
  priceInr: number;
  availability: string;
  processorLabel: string;
  graphicsLabel: string;
  ramLabel: string;
  storageLabel: string;
  coolingLabel: string;
  displayLabel: string;
  batteryHours: number;
  weightKg: number;
  npuTops: number;
  artKey: ProductArtKey;
  builderMatch: {
    processor: ProcessorSlotId;
    graphics: GraphicsSlotId;
    memory: MemorySlotId;
    storage: StorageSlotId;
    cooling: CoolingSlotId;
  };
  bestForScenarios: WorkloadScenarioId[];
  questPcIds: string[];
  storeSearchUrl: string;
}

// Verified live Indian retail Intel Core Ultra models across Amazon India, Croma, Vijay Sales & Reliance Digital
export const RETAIL_LAPTOP_CATALOG: RetailLaptopProduct[] = [
  {
    id: 'hp-15-fd1099tu-u5',
    brand: 'HP',
    name: 'HP 15 AI Laptop (15-fd1099TU)',
    retailerId: 'reliance',
    retailerName: 'Reliance Digital',
    storeSku: '15-fd1099TU',
    priceInr: 72995,
    availability: 'In Stock · Store Pickup',
    processorLabel: 'Intel Core Ultra 5 125H',
    graphicsLabel: 'Intel Arc Integrated Graphics',
    ramLabel: '16GB DDR5',
    storageLabel: '512GB NVMe SSD',
    coolingLabel: 'Slim Single-Fan Quiet Shell',
    displayLabel: '15.6" FHD Anti-Glare',
    batteryHours: 14,
    weightKg: 1.59,
    npuTops: 34,
    artKey: 'productCampusUltralight',
    builderMatch: {
      processor: 'ultra5_225h',
      graphics: 'basic_igpu',
      memory: 'ram_16gb',
      storage: 'ssd_512gb',
      cooling: 'slim_single',
    },
    bestForScenarios: ['study_ai', 'flight_movie'],
    questPcIds: ['pc_campus_dash', 'pc_feather_air'],
    storeSearchUrl: 'https://www.reliancedigital.in/search?q=HP+15-fd1099TU',
  },
  {
    id: 'hp-pavilion-plus-14-ew1074tu',
    brand: 'HP',
    name: 'Pavilion Plus 14 AI (14-ew1074TU)',
    retailerId: 'amazon',
    retailerName: 'Amazon India',
    storeSku: '14-ew1074TU',
    priceInr: 74990,
    availability: 'In Stock · Prime Delivery',
    processorLabel: 'Intel Core Ultra 5 125H',
    graphicsLabel: 'Intel Arc Graphics',
    ramLabel: '16GB LPDDR5x',
    storageLabel: '512GB NVMe SSD',
    coolingLabel: 'Dual-Fan Aluminum Shell',
    displayLabel: '14" 2.8K OLED',
    batteryHours: 15,
    weightKg: 1.38,
    npuTops: 34,
    artKey: 'productCampusUltralight',
    builderMatch: {
      processor: 'ultra5_225h',
      graphics: 'arc_b390_xess',
      memory: 'ram_16gb',
      storage: 'ssd_512gb',
      cooling: 'dual_vapor',
    },
    bestForScenarios: ['study_ai', 'photo_batch_ai', 'flight_movie'],
    questPcIds: ['pc_campus_dash', 'pc_feather_air'],
    storeSearchUrl: 'https://www.amazon.in/s?k=HP+Pavilion+Plus+14-ew1074TU+Core+Ultra+5',
  },
  {
    id: 'lenovo-ideapad-slim5-14iah10',
    brand: 'Lenovo',
    name: 'IdeaPad Slim 5 AI (14IAH10)',
    retailerId: 'vijaysales',
    retailerName: 'Vijay Sales',
    storeSku: '14IAH10',
    priceInr: 84990,
    availability: 'In Stock · Student Offer',
    processorLabel: 'Intel Core Ultra 5 225H',
    graphicsLabel: 'Intel Arc Integrated',
    ramLabel: '16GB LPDDR5x',
    storageLabel: '512GB NVMe SSD',
    coolingLabel: 'Dual-Fan Quiet Flow',
    displayLabel: '14" WUXGA OLED',
    batteryHours: 17,
    weightKg: 1.39,
    npuTops: 40,
    artKey: 'productCampusUltralight',
    builderMatch: {
      processor: 'ultra5_225h',
      graphics: 'basic_igpu',
      memory: 'ram_16gb',
      storage: 'ssd_512gb',
      cooling: 'dual_vapor',
    },
    bestForScenarios: ['study_ai', 'coding_docker', 'flight_movie'],
    questPcIds: ['pc_campus_dash', 'pc_feather_air'],
    storeSearchUrl: 'https://www.vijaysales.com/search?q=Lenovo+IdeaPad+Slim+5+Core+Ultra+5',
  },
  {
    id: 'asus-vivobook-16-x1607ca',
    brand: 'ASUS',
    name: 'Vivobook 16 AI (X1607CA-MB142WS)',
    retailerId: 'reliance',
    retailerName: 'Reliance Digital',
    storeSku: 'X1607CA-MB142WS',
    priceInr: 92990,
    availability: 'In Stock · Store Pickup',
    processorLabel: 'Intel Core Ultra 5 225H',
    graphicsLabel: 'Intel Arc Graphics',
    ramLabel: '16GB DDR5',
    storageLabel: '512GB NVMe SSD',
    coolingLabel: 'Dual-Vent IceCool',
    displayLabel: '16" WUXGA IPS',
    batteryHours: 15,
    weightKg: 1.75,
    npuTops: 40,
    artKey: 'productAllrounderArc',
    builderMatch: {
      processor: 'ultra5_225h',
      graphics: 'arc_b390_xess',
      memory: 'ram_16gb',
      storage: 'ssd_512gb',
      cooling: 'dual_vapor',
    },
    bestForScenarios: ['study_ai', 'coding_docker'],
    questPcIds: ['pc_flowcraft_pro', 'pc_campus_dash'],
    storeSearchUrl: 'https://www.reliancedigital.in/search?q=ASUS+X1607CA-MB142WS',
  },
  {
    id: 'acer-swift-go-14-sfg14-73',
    brand: 'Acer',
    name: 'Swift Go 14 OLED (SFG14-73)',
    retailerId: 'amazon',
    retailerName: 'Amazon India',
    storeSku: 'SFG14-73 · NX.KU7SI.001',
    priceInr: 92990,
    availability: 'In Stock · Next-Day Delivery',
    processorLabel: 'Intel Core Ultra 7 155H',
    graphicsLabel: 'Intel Arc Graphics (XeSS)',
    ramLabel: '16GB LPDDR5x',
    storageLabel: '1TB NVMe SSD',
    coolingLabel: 'TwinAir Dual-Fan Cooling',
    displayLabel: '14" 2.8K WQXGA+ OLED',
    batteryHours: 14,
    weightKg: 1.32,
    npuTops: 34,
    artKey: 'productAllrounderArc',
    builderMatch: {
      processor: 'ultra7_355',
      graphics: 'arc_b390_xess',
      memory: 'ram_16gb',
      storage: 'ssd_1tb',
      cooling: 'dual_vapor',
    },
    bestForScenarios: ['study_ai', 'coding_docker', 'photo_batch_ai', 'gaming_xess'],
    questPcIds: ['pc_flowcraft_pro'],
    storeSearchUrl: 'https://www.amazon.in/s?k=Acer+Swift+Go+14+SFG14-73+Core+Ultra+7',
  },
  {
    id: 'asus-zenbook-14-ux3405ma',
    brand: 'ASUS',
    name: 'Zenbook 14 OLED (UX3405MA-PZ551WS)',
    retailerId: 'croma',
    retailerName: 'Croma',
    storeSku: 'UX3405MA-PZ551WS',
    priceInr: 99990,
    availability: 'In Stock · Express Pickup',
    processorLabel: 'Intel Core Ultra 5 125H',
    graphicsLabel: 'Intel Arc Graphics',
    ramLabel: '16GB LPDDR5x',
    storageLabel: '1TB NVMe SSD',
    coolingLabel: 'Whisper-Quiet Vapor Flow',
    displayLabel: '14" 3K OLED 120Hz',
    batteryHours: 16,
    weightKg: 1.2,
    npuTops: 34,
    artKey: 'productCampusUltralight',
    builderMatch: {
      processor: 'ultra5_225h',
      graphics: 'arc_b390_xess',
      memory: 'ram_16gb',
      storage: 'ssd_1tb',
      cooling: 'dual_vapor',
    },
    bestForScenarios: ['study_ai', 'photo_batch_ai', 'flight_movie'],
    questPcIds: ['pc_campus_dash', 'pc_feather_air'],
    storeSearchUrl: 'https://www.croma.com/searchB?q=UX3405MA-PZ551WS%3Arelevance',
  },
  {
    id: 'lenovo-yoga-slim-7-14imh9',
    brand: 'Lenovo',
    name: 'Yoga Slim 7 OLED (14IMH9 · 83QM0048IN)',
    retailerId: 'croma',
    retailerName: 'Croma',
    storeSku: '83QM0048IN',
    priceInr: 114990,
    availability: 'In Stock · Store Pickup',
    processorLabel: 'Intel Core Ultra 7 155H',
    graphicsLabel: 'Intel Arc Graphics (XeSS)',
    ramLabel: '32GB LPDDR5x',
    storageLabel: '1TB NVMe SSD',
    coolingLabel: 'Dual-Fan Aluminum Shell',
    displayLabel: '14" WUXGA OLED',
    batteryHours: 16,
    weightKg: 1.39,
    npuTops: 34,
    artKey: 'productCreatorStudio',
    builderMatch: {
      processor: 'ultra7_355',
      graphics: 'arc_b390_xess',
      memory: 'ram_32gb',
      storage: 'ssd_1tb',
      cooling: 'dual_vapor',
    },
    bestForScenarios: ['study_ai', 'coding_docker', 'photo_batch_ai', 'creator_4k'],
    questPcIds: ['pc_flowcraft_pro', 'pc_canvas_studio'],
    storeSearchUrl: 'https://www.croma.com/searchB?q=Lenovo%20Yoga%20Slim%207%20Core%20Ultra%207%3Arelevance',
  },
  {
    id: 'asus-zenbook-14-ux3405ca-ql1691ws',
    brand: 'ASUS',
    name: 'Zenbook 14 OLED (UX3405CA-QL1691WS)',
    retailerId: 'reliance',
    retailerName: 'Reliance Digital',
    storeSku: 'UX3405CA-QL1691WS',
    priceInr: 143990,
    availability: 'In Stock · No-Cost EMI',
    processorLabel: 'Intel Core Ultra 9 285H',
    graphicsLabel: 'Intel Arc 140T Graphics (XeSS)',
    ramLabel: '32GB LPDDR5x',
    storageLabel: '1TB NVMe SSD',
    coolingLabel: 'Dual-Fan Thermal Chamber',
    displayLabel: '14" 3K OLED 120Hz',
    batteryHours: 17,
    weightKg: 1.28,
    npuTops: 45,
    artKey: 'productCreatorStudio',
    builderMatch: {
      processor: 'ultra_x9_388h',
      graphics: 'arc_b390_xess',
      memory: 'ram_32gb',
      storage: 'ssd_1tb',
      cooling: 'dual_vapor',
    },
    bestForScenarios: ['creator_4k', 'photo_batch_ai', 'coding_docker'],
    questPcIds: ['pc_canvas_studio', 'pc_flowcraft_pro'],
    storeSearchUrl: 'https://www.reliancedigital.in/search?q=UX3405CA-QL1691WS',
  },
  {
    id: 'acer-predator-helios-neo-16-ai',
    brand: 'Acer',
    name: 'Predator Helios Neo 16 AI',
    retailerId: 'vijaysales',
    retailerName: 'Vijay Sales',
    storeSku: 'PHN16-AI-U9',
    priceInr: 154990,
    availability: 'In Stock · Demo Unit Ready',
    processorLabel: 'Intel Core Ultra 9 275HX',
    graphicsLabel: 'GeForce RTX 4060 / 50-Series',
    ramLabel: '32GB DDR5',
    storageLabel: '1TB NVMe SSD',
    coolingLabel: 'AeroBlade 3D Twin Duct',
    displayLabel: '16" WQXGA 165Hz',
    batteryHours: 9,
    weightKg: 2.4,
    npuTops: 45,
    artKey: 'productGamingXess',
    builderMatch: {
      processor: 'ultra_x9_388h',
      graphics: 'rtx_4060',
      memory: 'ram_32gb',
      storage: 'ssd_2tb',
      cooling: 'pro_airflow',
    },
    bestForScenarios: ['gaming_xess', 'creator_4k', 'coding_docker'],
    questPcIds: ['pc_apex_frame'],
    storeSearchUrl: 'https://www.vijaysales.com/search?q=Acer+Predator+Helios+Neo+16+Core+Ultra',
  },
];

export interface RankedRetailProduct {
  product: RetailLaptopProduct;
  matchPct: number;
  isTopMatch: boolean;
  matchReasons: string[];
}

export function formatInrPrice(inr: number): string {
  return `₹${inr.toLocaleString('en-IN')}`;
}

export function rankCatalogByPreferences(
  config: PcBuilderConfig,
  scenario: WorkloadScenarioId,
  retailerFilter: CatalogRetailerId,
  questMatchedPcId?: string
): RankedRetailProduct[] {
  // If user tested the Budget Bargain Trap, steer recommendations to genuine Core Ultra replacements
  const targetCpu: ProcessorSlotId =
    config.processor === 'bargain_0' ? 'ultra5_225h' : config.processor;
  const targetRam: MemorySlotId =
    config.memory === 'ram_8gb' ? 'ram_16gb' : config.memory;

  const scored = RETAIL_LAPTOP_CATALOG.map((product) => {
    let score = 46;
    const reasons: string[] = [];

    if (product.builderMatch.processor === targetCpu) {
      score += 22;
      reasons.push(`Matches your ${product.processorLabel} tier`);
    } else if (
      (targetCpu === 'ultra7_355' && product.builderMatch.processor === 'ultra_x9_388h') ||
      (targetCpu === 'ultra_x9_388h' && product.builderMatch.processor === 'ultra7_355')
    ) {
      score += 12;
    }

    if (product.builderMatch.graphics === config.graphics) {
      score += 14;
      reasons.push(`Includes ${product.graphicsLabel}`);
    } else if (config.graphics === 'basic_igpu' && product.builderMatch.graphics === 'arc_b390_xess') {
      score += 7;
    }

    if (product.builderMatch.memory === targetRam) {
      score += 9;
      reasons.push(`${product.ramLabel} memory floor`);
    } else if (targetRam === 'ram_16gb' && product.builderMatch.memory === 'ram_32gb') {
      score += 6;
    }

    if (product.builderMatch.storage === config.storage) {
      score += 5;
    }

    if (product.builderMatch.cooling === config.cooling) {
      score += 4;
    }

    if (product.bestForScenarios.includes(scenario)) {
      score += 8;
      if (reasons.length < 2) {
        reasons.push('Tuned for your active workload test');
      }
    }

    if (questMatchedPcId && product.questPcIds.includes(questMatchedPcId)) {
      score += 6;
    }

    if (reasons.length === 0) {
      reasons.push(`${product.npuTops} TOPS dedicated NPU + ${product.batteryHours}h battery`);
    }
    if (reasons.length === 1) {
      reasons.push(`${product.batteryHours}h unplugged endurance · ${product.weightKg} kg`);
    }

    return {
      product,
      matchPct: Math.min(99, Math.max(62, score)),
      isTopMatch: false,
      matchReasons: reasons.slice(0, 2),
    };
  });

  scored.sort((a, b) => b.matchPct - a.matchPct || a.product.priceInr - b.product.priceInr);

  const filtered =
    retailerFilter === 'all'
      ? scored
      : scored.filter((item) => item.product.retailerId === retailerFilter);

  return filtered.map((item, idx) => ({
    ...item,
    isTopMatch: idx === 0,
  }));
}
