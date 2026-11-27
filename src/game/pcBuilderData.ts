import { STORE_FLOOR_CHECKLIST, type RetailerProfile } from './landingData';

export type ProcessorSlotId = 'bargain_0' | 'ultra5_225h' | 'ultra7_355' | 'ultra_x9_388h';
export type GraphicsSlotId = 'basic_igpu' | 'arc_b390_xess' | 'rtx_4060';
export type MemorySlotId = 'ram_8gb' | 'ram_16gb' | 'ram_32gb';
export type StorageSlotId = 'ssd_512gb' | 'ssd_1tb' | 'ssd_2tb';
export type CoolingSlotId = 'slim_single' | 'dual_vapor' | 'pro_airflow';

export type WorkloadScenarioId =
  | 'study_ai'
  | 'gaming_xess'
  | 'creator_4k'
  | 'coding_docker'
  | 'photo_batch_ai'
  | 'flight_movie';

export type CutawayArtKey =
  | 'bargainTrap'
  | 'ultra5Ultrabook'
  | 'ultra7Arc'
  | 'ultraX9Pro'
  | 'rtx4060Dual';

export interface PcBuilderConfig {
  processor: ProcessorSlotId;
  graphics: GraphicsSlotId;
  memory: MemorySlotId;
  storage: StorageSlotId;
  cooling: CoolingSlotId;
}

export type PartArtKey =
  | 'procCoreUltra5'
  | 'procCoreUltra7'
  | 'procCoreUltraX9'
  | 'slotGpuHerald'
  | 'slotMemoryScrolls'
  | 'slotStorageVault'
  | 'slotCoolingVapor'
  | 'slotCoolingAirflow';

export interface SlotOption<T extends string> {
  id: T;
  label: string;
  shortTag: string;
  tierHint: string;
  isBargain?: boolean;
  artKey?: PartArtKey;
}

export const PROCESSOR_OPTIONS: SlotOption<ProcessorSlotId>[] = [
  {
    id: 'bargain_0',
    label: 'Budget Bargain Chip (No Built-in AI)',
    shortTag: 'Heats up fast under heavy multitasking',
    tierHint: 'Entry Trap',
    isBargain: true,
  },
  {
    id: 'ultra5_225h',
    label: 'Intel Core Ultra 5 225H',
    shortTag: 'Everyday AI PC · Light study & office speed',
    tierHint: 'Everyday',
    artKey: 'procCoreUltra5',
  },
  {
    id: 'ultra7_355',
    label: 'Intel Core Ultra 7 355 (Series 3)',
    shortTag: 'All-rounder · Built-in AI + all-day battery',
    tierHint: 'Sweet Spot',
    artKey: 'procCoreUltra7',
  },
  {
    id: 'ultra_x9_388h',
    label: 'Intel Core Ultra X9 388H (Series 3)',
    shortTag: 'Flagship power · Heavy creative & coding speed',
    tierHint: 'Flagship',
    artKey: 'procCoreUltraX9',
  },
];

export const GRAPHICS_OPTIONS: SlotOption<GraphicsSlotId>[] = [
  {
    id: 'basic_igpu',
    label: 'Basic Integrated Graphics',
    shortTag: 'Fine for slides & web; choppy in 3D games',
    tierHint: 'Basic',
    isBargain: true,
  },
  {
    id: 'arc_b390_xess',
    label: 'Intel Arc B390 Graphics (with XeSS)',
    shortTag: 'Thin-laptop power · Crisp 1080p gaming & video',
    tierHint: 'Balanced',
    artKey: 'slotGpuHerald',
  },
  {
    id: 'rtx_4060',
    label: 'NVIDIA GeForce RTX 4060 Laptop GPU',
    shortTag: 'Dedicated high-FPS gaming & 3D rendering chip',
    tierHint: 'Max 3D',
    artKey: 'slotGpuHerald',
  },
];

export const MEMORY_OPTIONS: SlotOption<MemorySlotId>[] = [
  {
    id: 'ram_8gb',
    label: '8GB Memory',
    shortTag: 'Slows down past 12 browser tabs or heavy apps',
    tierHint: 'Tight',
    isBargain: true,
  },
  {
    id: 'ram_16gb',
    label: '16GB Dual-Channel Memory',
    shortTag: 'Smooth everyday study, coding & photo work',
    tierHint: 'Standard',
    artKey: 'slotMemoryScrolls',
  },
  {
    id: 'ram_32gb',
    label: '32GB High-Speed Memory',
    shortTag: 'Effortless containers, 4K edits & AI models',
    tierHint: 'Pro',
    artKey: 'slotMemoryScrolls',
  },
];

export const STORAGE_OPTIONS: SlotOption<StorageSlotId>[] = [
  {
    id: 'ssd_512gb',
    label: '512GB NVMe SSD',
    shortTag: 'Fits classes & apps; fills quickly with games',
    tierHint: 'Starter',
  },
  {
    id: 'ssd_1tb',
    label: '1TB Fast NVMe SSD',
    shortTag: 'Fast file reads + room for projects & games',
    tierHint: 'Balanced',
    artKey: 'slotStorageVault',
  },
  {
    id: 'ssd_2tb',
    label: '2TB Pro NVMe SSD',
    shortTag: 'Instant 4K scratch cache & full media library',
    tierHint: 'Creator',
    artKey: 'slotStorageVault',
  },
];

export const COOLING_OPTIONS: SlotOption<CoolingSlotId>[] = [
  {
    id: 'slim_single',
    label: 'Slim Single-Fan Shell',
    shortTag: 'Light backpack weight; warms during long loads',
    tierHint: 'Ultralight',
    isBargain: true,
  },
  {
    id: 'dual_vapor',
    label: 'Dual-Fan Vapor Chamber',
    shortTag: 'Quiet, steady heat spread without loud fans',
    tierHint: 'Quiet Cool',
    artKey: 'slotCoolingVapor',
  },
  {
    id: 'pro_airflow',
    label: 'Pro Max-Airflow Chassis',
    shortTag: 'Twin exhaust ducts built for sustained 3D & renders',
    tierHint: 'Max Cool',
    artKey: 'slotCoolingAirflow',
  },
];

export interface WorkloadScenarioMeta {
  id: WorkloadScenarioId;
  label: string;
  shortLabel: string;
  subtitle: string;
  supportsXessToggle: boolean;
}

export const WORKLOAD_SCENARIOS: WorkloadScenarioMeta[] = [
  {
    id: 'study_ai',
    label: 'Offline Study + Local AI + 25 Tabs',
    shortLabel: 'Study + Local AI',
    subtitle: 'Summarizing lecture PDFs offline, blurring webcam video, and juggling 25 tabs unplugged.',
    supportsXessToggle: false,
  },
  {
    id: 'gaming_xess',
    label: '1080p Gaming + Discord Stream',
    shortLabel: '1080p Gaming',
    subtitle: 'High-FPS 1080p gameplay with voice cleanup and optional Intel XeSS frame boost.',
    supportsXessToggle: true,
  },
  {
    id: 'creator_4k',
    label: '4K Video Export + Background Removal',
    shortLabel: '4K Video Export',
    subtitle: 'Exporting crisp 4K timelines while removing video backgrounds offline.',
    supportsXessToggle: false,
  },
  {
    id: 'coding_docker',
    label: 'Coding + 4 Docker Containers',
    shortLabel: 'Coding + Containers',
    subtitle: 'Running an IDE, local server, database containers, and browser docs side by side.',
    supportsXessToggle: false,
  },
  {
    id: 'photo_batch_ai',
    label: 'Photo Batch AI Enhance (100 RAW)',
    shortLabel: 'Photo Batch AI',
    subtitle: 'Denoising and upscaling 100 high-resolution camera photos locally off the SSD.',
    supportsXessToggle: false,
  },
  {
    id: 'flight_movie',
    label: '8-Hour Flight Movie & Notes',
    shortLabel: '8-Hr Flight Test',
    subtitle: 'Streaming stored video, offline note-taking, and zero power outlets all trip long.',
    supportsXessToggle: false,
  },
];

export const DEFAULT_BUILDER_CONFIG: PcBuilderConfig = {
  processor: 'ultra7_355',
  graphics: 'arc_b390_xess',
  memory: 'ram_32gb',
  storage: 'ssd_1tb',
  cooling: 'dual_vapor',
};

export function resolveCutawayArtKey(config: PcBuilderConfig): CutawayArtKey {
  if (config.processor === 'bargain_0') {
    return 'bargainTrap';
  }
  if (config.graphics === 'rtx_4060') {
    return 'rtx4060Dual';
  }
  if (config.processor === 'ultra_x9_388h' || config.cooling === 'pro_airflow') {
    return 'ultraX9Pro';
  }
  if (config.processor === 'ultra5_225h' && config.graphics === 'basic_igpu') {
    return 'ultra5Ultrabook';
  }
  return 'ultra7Arc';
}

export interface PcBenchmarkResult {
  tokensPerSec: number;
  tokensMax: number;
  fps: number;
  fpsMax: number;
  batteryAfter4HrPct: number;
  storageSpeedPct: number;
  storageSpeedLabel: string;
  x86CompatibilityPct: number;
  thermalState: 'cool' | 'warm' | 'throttled';
  thermalLabel: string;
  fanSpeedPct: number;
  fanLabel: string;
  airflowLabel: string;
  chassisTempC: number;
  activeTiles: {
    cpu: boolean;
    gpu: boolean;
    npu: boolean;
    cooling: 'strained' | 'steady' | 'maximum';
    storageTier: '512GB' | '1TB' | '2TB';
  };
  energyRouteNote: string;
  isBargainStressed: boolean;
}

export function simulatePcBenchmark(
  config: PcBuilderConfig,
  scenario: WorkloadScenarioId,
  xessEnabled: boolean
): PcBenchmarkResult {
  const isBargainCpu = config.processor === 'bargain_0';
  const isU5 = config.processor === 'ultra5_225h';
  const isU7 = config.processor === 'ultra7_355';
  const isX9 = config.processor === 'ultra_x9_388h';

  const hasBasicGpu = config.graphics === 'basic_igpu';
  const hasArcB390 = config.graphics === 'arc_b390_xess';
  const hasRtx4060 = config.graphics === 'rtx_4060';

  const ramFactor = config.memory === 'ram_8gb' ? 0.62 : config.memory === 'ram_16gb' ? 0.88 : 1;
  const ssdFactor = config.storage === 'ssd_512gb' ? 0.72 : config.storage === 'ssd_1tb' ? 0.9 : 1;
  const coolingBonus =
    config.cooling === 'slim_single' ? -0.1 : config.cooling === 'dual_vapor' ? 0.04 : 0.1;

  // Base AI throughput (answers/sec)
  let tokensPerSec = isBargainCpu ? 5 : isU5 ? 29 : isU7 ? 42 : 49;
  if (hasRtx4060 && !isBargainCpu && (scenario === 'photo_batch_ai' || scenario === 'creator_4k')) {
    tokensPerSec += 5;
  }
  tokensPerSec = Math.max(2, Math.round(tokensPerSec * ramFactor * (isBargainCpu ? 0.85 : 1 + coolingBonus * 0.4)));

  // FPS / Smoothness per scenario
  let fps = 30;
  if (scenario === 'gaming_xess') {
    if (hasRtx4060) {
      fps = isBargainCpu ? 62 : isX9 ? 142 : isU7 ? 128 : 112;
      if (xessEnabled) fps = Math.round(fps * 1.12);
    } else if (hasArcB390) {
      const base = isBargainCpu ? 38 : isX9 ? 90 : isU7 ? 80 : 68;
      fps = xessEnabled ? Math.round(base * 1.48) : base;
    } else {
      fps = isBargainCpu ? 21 : isX9 ? 54 : isU7 ? 48 : 40;
    }
    fps = Math.round(fps * (config.memory === 'ram_8gb' ? 0.78 : config.memory === 'ram_16gb' ? 0.94 : 1));
  } else if (scenario === 'creator_4k') {
    fps = hasRtx4060
      ? isBargainCpu
        ? 58
        : isX9
          ? 132
          : 118
      : hasArcB390
        ? isBargainCpu
          ? 34
          : isX9
            ? 106
            : 94
        : isBargainCpu
          ? 18
          : 46;
    fps = Math.round(fps * ramFactor * (0.85 + ssdFactor * 0.15));
  } else if (scenario === 'photo_batch_ai') {
    fps = hasRtx4060 ? 116 : hasArcB390 ? 96 : isBargainCpu ? 24 : 58;
    fps = Math.round(fps * ramFactor * ssdFactor);
  } else if (scenario === 'coding_docker') {
    fps = isBargainCpu ? 28 : isX9 ? 132 : isU7 ? 116 : 94;
    fps = Math.round(fps * (config.memory === 'ram_8gb' ? 0.48 : config.memory === 'ram_16gb' ? 0.84 : 1));
  } else if (scenario === 'flight_movie') {
    fps = isBargainCpu ? 48 : 120;
  } else {
    fps = isBargainCpu ? 34 : hasArcB390 || hasRtx4060 ? 114 : 74;
    if (config.memory === 'ram_8gb') fps = Math.round(fps * 0.72);
  }
  fps = Math.max(14, Math.min(155, fps));

  // Battery after 4 Hours (%)
  let batteryBase = isBargainCpu ? 32 : isU5 ? 84 : isU7 ? 80 : 72;
  if (scenario === 'gaming_xess') batteryBase -= 22;
  if (scenario === 'creator_4k') batteryBase -= 16;
  if (scenario === 'coding_docker') batteryBase -= 11;
  if (scenario === 'photo_batch_ai') batteryBase -= 12;
  if (scenario === 'flight_movie') batteryBase += 8;

  if (hasRtx4060) batteryBase -= scenario === 'flight_movie' ? 10 : 19;
  else if (hasArcB390 && scenario === 'gaming_xess') batteryBase -= 4;

  if (config.memory === 'ram_8gb') batteryBase -= 10;
  if (config.cooling === 'slim_single' && (isBargainCpu || hasRtx4060)) batteryBase -= 7;
  const batteryAfter4HrPct = Math.max(8, Math.min(94, Math.round(batteryBase)));

  // Storage & project load speed
  let storageSpeedPct = config.storage === 'ssd_512gb' ? 66 : config.storage === 'ssd_1tb' ? 84 : 97;
  if (config.memory === 'ram_8gb') storageSpeedPct -= 14;
  if (isBargainCpu) storageSpeedPct -= 12;
  storageSpeedPct = Math.max(38, Math.min(99, storageSpeedPct));
  const storageSpeedLabel =
    storageSpeedPct >= 88
      ? 'Instant Load'
      : storageSpeedPct >= 70
        ? 'Fast Load'
        : 'Slower Swap';

  // Thermal state & Fan telemetry
  const heavyWorkload =
    scenario === 'gaming_xess' || scenario === 'creator_4k' || scenario === 'coding_docker' || scenario === 'photo_batch_ai';

  let heatScore = isBargainCpu ? 3 : isU5 ? 0 : isU7 ? 0.3 : 0.8;
  if (hasRtx4060 && heavyWorkload) heatScore += 1.1;
  if (config.memory === 'ram_8gb' && heavyWorkload) heatScore += 0.6;
  if (config.cooling === 'slim_single') heatScore += 1.25;
  else if (config.cooling === 'dual_vapor') heatScore -= 0.45;
  else if (config.cooling === 'pro_airflow') heatScore -= 0.9;

  const thermalState: 'cool' | 'warm' | 'throttled' =
    isBargainCpu || heatScore >= 2.2 ? 'throttled' : heatScore >= 1.1 ? 'warm' : 'cool';

  const chassisTempC =
    thermalState === 'throttled'
      ? Math.min(96, Math.round(86 + heatScore * 2.5))
      : thermalState === 'warm'
        ? Math.round(69 + heatScore * 3.5)
        : Math.max(51, Math.round(58 + heatScore * 2));

  const fanSpeedPct =
    thermalState === 'throttled'
      ? 96
      : thermalState === 'warm'
        ? 64
        : config.cooling === 'pro_airflow'
          ? 34
          : 28;

  const thermalLabel =
    thermalState === 'throttled'
      ? 'Thermal Throttling'
      : thermalState === 'warm'
        ? 'Moderate Warmth'
        : 'Cool & Quiet';

  const fanLabel =
    thermalState === 'throttled'
      ? 'Loud Fan Strain'
      : thermalState === 'warm'
        ? 'Audible Cooling'
        : 'Whisper Quiet';

  const airflowLabel =
    config.cooling === 'slim_single'
      ? thermalState === 'throttled'
        ? 'Heat Bottleneck (Single Vent)'
        : 'Compact Single-Fan Flow'
      : config.cooling === 'dual_vapor'
        ? 'Balanced Vapor-Chamber Flow'
        : 'Twin-Duct High Airflow';

  const activeTiles = {
    cpu: true,
    gpu: !hasBasicGpu && (scenario === 'gaming_xess' || scenario === 'creator_4k' || scenario === 'photo_batch_ai'),
    npu: !isBargainCpu,
    cooling: (thermalState === 'throttled'
      ? 'strained'
      : config.cooling === 'pro_airflow'
        ? 'maximum'
        : 'steady') as 'strained' | 'steady' | 'maximum',
    storageTier: (config.storage === 'ssd_512gb'
      ? '512GB'
      : config.storage === 'ssd_1tb'
        ? '1TB'
        : '2TB') as '512GB' | '1TB' | '2TB',
  };

  let energyRouteNote = '';
  if (isBargainCpu) {
    energyRouteNote =
      'Budget chip lacks a built-in AI engine, forcing the main processor to shoulder everything—causing high heat, fan strain, and rapid battery drop.';
  } else if (config.cooling === 'slim_single' && hasRtx4060) {
    energyRouteNote =
      'GeForce RTX 4060 delivers high 3D frame rates, but a slim single-fan chassis warms up fast under sustained rendering—upgrade cooling for steady speeds.';
  } else if (config.memory === 'ram_8gb') {
    energyRouteNote =
      'Core Ultra silicon stays cool, yet 8GB memory forces constant SSD swapping during Docker builds, photo batches, or 25+ tabs. Step up to 16GB or 32GB.';
  } else if (scenario === 'coding_docker') {
    energyRouteNote =
      'Multi-core Core Ultra performance + fast NVMe storage keeps containers responsive while built-in AI handles local code suggestions silently.';
  } else if (scenario === 'photo_batch_ai') {
    energyRouteNote =
      '100 RAW photos stream cleanly off your NVMe SSD across the graphics and AI engines without stalling your editing app.';
  } else if (scenario === 'flight_movie') {
    energyRouteNote = hasRtx4060
      ? 'Core Ultra efficiency stretches trip battery well past the budget laptop, though Intel Arc integrated builds last longest away from wall outlets.'
      : 'Low-power efficiency cores sip battery for movies and offline notes, leaving plenty of charge after 4 hours in the air.';
  } else if (scenario === 'gaming_xess') {
    energyRouteNote = hasRtx4060
      ? 'Dedicated RTX 4060 graphics drive smooth 1080p frame rates while Core Ultra built-in AI cleans up Discord mic audio.'
      : hasArcB390
        ? xessEnabled
          ? 'Intel Arc B390 with XeSS boosts smooth frame rates in thin chassis without heavy power bricks.'
          : 'Running native 1080p on Intel Arc B390. Toggle XeSS ON above to multiply frame rate.'
        : 'Basic graphics work for casual titles, while Intel Arc B390 or RTX 4060 unlocks smooth high-detail 1080p gaming.';
  } else if (scenario === 'creator_4k') {
    energyRouteNote =
      'Dedicated graphics accelerate 4K exports while built-in AI strips video backgrounds locally with cool vapor-chamber airflow.';
  } else {
    energyRouteNote =
      'Built-in AI handles offline lecture notes and camera blur quietly while all-day memory & battery keep over 75% charge after 4 hours.';
  }

  return {
    tokensPerSec,
    tokensMax: 56,
    fps,
    fpsMax: 155,
    batteryAfter4HrPct,
    storageSpeedPct,
    storageSpeedLabel,
    x86CompatibilityPct: 100,
    thermalState,
    thermalLabel,
    fanSpeedPct,
    fanLabel,
    airflowLabel,
    chassisTempC,
    activeTiles,
    energyRouteNote,
    isBargainStressed: isBargainCpu || thermalState === 'throttled',
  };
}

export interface BuilderStoreMatch {
  recommendedTier: string;
  badgeLabel: string;
  specSummary: string;
  reason: string;
  warningIfBargain: string | null;
  askScript: string;
  copyPayload: string;
}

export function solveBuilderStoreMatch(
  config: PcBuilderConfig,
  retailer: RetailerProfile,
  matchSource: 'builder' | 'quest',
  questPcId?: string
): BuilderStoreMatch {
  const isBargain = config.processor === 'bargain_0';
  const wantsX9 = config.processor === 'ultra_x9_388h' || questPcId === 'pc_apex_frame';
  const wantsU5 = config.processor === 'ultra5_225h' && !wantsX9;

  const recommendedTier = wantsX9
    ? 'Intel Core Ultra X9 388H (Series 3)'
    : wantsU5
      ? 'Intel Core Ultra 5 225H'
      : 'Intel Core Ultra 7 355 (Series 3)';

  const badgeLabel = wantsX9
    ? 'Flagship Creator & Gaming Tier'
    : wantsU5
      ? 'Everyday Student & Portability Tier'
      : 'All-Rounder AI PC Tier';

  const gpuLabel =
    config.graphics === 'rtx_4060'
      ? 'NVIDIA GeForce RTX 4060 GPU'
      : config.graphics === 'arc_b390_xess' || wantsX9
        ? 'Intel Arc B390 Graphics'
        : 'Intel Graphics';

  const ramFloor = config.memory === 'ram_32gb' ? '32GB Memory' : '16GB Memory';
  const ssdFloor =
    config.storage === 'ssd_2tb'
      ? '2TB NVMe SSD'
      : config.storage === 'ssd_1tb'
        ? '1TB NVMe SSD'
        : '512GB NVMe SSD';

  const coolingNote =
    config.cooling === 'pro_airflow'
      ? 'Max-Airflow Dual Cooling'
      : config.cooling === 'dual_vapor'
        ? 'Dual-Fan Vapor Cooling'
        : 'Thin-and-Light Cooling';

  const specSummary = `${ramFloor} · ${ssdFloor} · ${gpuLabel}`;

  let warningIfBargain: string | null = null;
  if (isBargain) {
    warningIfBargain =
      'Your test build uses a budget non-AI chip that slows down and heats up quickly. Ask the store specialist for the Intel Core Ultra model below instead.';
  } else if (config.memory === 'ram_8gb') {
    warningIfBargain =
      'Skip 8GB memory models on the shelf—request 16GB or 32GB so heavy tabs, coding, and AI tools never stutter.';
  } else if (config.cooling === 'slim_single' && config.graphics === 'rtx_4060') {
    warningIfBargain =
      'Pairing a GeForce RTX 4060 with a single-fan shell increases heat—look for Dual-Fan Vapor or Max-Airflow cooling in the store.';
  }

  const reason =
    matchSource === 'quest'
      ? `Synced from Byte's adventure: ${recommendedTier} with ${ramFloor}, ${ssdFloor}, and ${gpuLabel} handles everyday apps, offline AI, and smooth gaming.`
      : wantsX9
        ? `Built for sustained heavy multitasking with ${gpuLabel}, ${ssdFloor}, and ${coolingNote}.`
        : wantsU5
          ? `Tailored for unplugged classes, fast travel days, and crisp daily speed with ${ssdFloor}.`
          : `Balanced everyday sweet spot combining ${gpuLabel}, ${ramFloor}, ${ssdFloor}, and ${coolingNote}.`;

  const askScript = `Hi! At ${retailer.name}, please show me laptops with ${recommendedTier}, ${gpuLabel}, at least ${ramFloor}, and a ${ssdFloor} (${coolingNote}).`;

  const checklistLines = STORE_FLOOR_CHECKLIST.map(
    (item, idx) => `${idx + 1}. [ ] ${item.title} — ${item.badgeCheck}`
  ).join('\n');

  const copyPayload = `${retailer.name} Store Ask-Card (${recommendedTier})\n"${askScript}"\n\nTarget Specs: ${specSummary}\n\nFloor Verification Checklist:\n${checklistLines}`;

  return {
    recommendedTier,
    badgeLabel,
    specSummary,
    reason,
    warningIfBargain,
    askScript,
    copyPayload,
  };
}

export function mapQuestPcToBuilderConfig(matchedPcId: string): PcBuilderConfig {
  if (matchedPcId === 'pc_apex_frame') {
    return {
      processor: 'ultra_x9_388h',
      graphics: 'rtx_4060',
      memory: 'ram_32gb',
      storage: 'ssd_2tb',
      cooling: 'pro_airflow',
    };
  }
  if (matchedPcId === 'pc_canvas_studio') {
    return {
      processor: 'ultra_x9_388h',
      graphics: 'arc_b390_xess',
      memory: 'ram_32gb',
      storage: 'ssd_2tb',
      cooling: 'dual_vapor',
    };
  }
  return {
    processor: 'ultra7_355',
    graphics: 'arc_b390_xess',
    memory: 'ram_16gb',
    storage: 'ssd_1tb',
    cooling: 'dual_vapor',
  };
}
