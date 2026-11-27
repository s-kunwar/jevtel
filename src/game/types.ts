import type { FactionColor } from './assets';

export type GamePhase =
  | 'TITLE'
  | 'PLAYING'
  | 'DIALOGUE'
  | 'PAUSED'
  | 'EXPO_TRANSFORM'
  | 'EXPO_PARK'
  | 'GAME_OVER';

export type WorldZoneId = 'SILICON_CITY' | 'EXPO_PARK';

export type DistrictId =
  | 'TRAP_ALLEY'
  | 'ECORE_PARK'
  | 'COPPER_PLAZA'
  | 'NPU_LIBRARY'
  | 'ARC_ARENA'
  | 'BOSS_COLOSSEUM'
  | 'EXPO_PARK';

export type PrimaryNeed = 'learning' | 'gaming' | 'multitask';

export type HeroForm = 'pawn' | 'warrior';

export type PortraitId =
  | 'agent'
  | 'pawn_worker'
  | 'npu_sentinel'
  | 'arc_warden'
  | 'ecore_steward'
  | 'lag_titan'
  | 'trap_laptop'
  | 'laptop_mascot';

export interface DialogueChoice {
  label: string;
  nextNodeId?: string;
  effect?: {
    setNeed?: PrimaryNeed;
    unlockNpuPulse?: boolean;
    unlockXessSurge?: boolean;
    restoreBattery?: number;
    restoreHp?: number;
    warpToPark?: boolean;
    questLabel?: string;
    startBossFight?: boolean;
    tagPcId?: string;
    openStoreChecklist?: boolean;
    triggerPcDemo?: string;
  };
}

export interface DialogueStep {
  id: string;
  speaker: string;
  role: string;
  portrait: PortraitId;
  avatarIdx?: number;
  factionColor?: FactionColor;
  text: string;
  nextId?: string;
  choices?: DialogueChoice[];
  onCompleteEffect?: DialogueChoice['effect'];
}

export interface PlayerProfile {
  primaryNeed: PrimaryNeed;
  tasksRescued: number;
  totalTasks: number;
  enemiesDefeated: number;
  npuUses: number;
  xessUses: number;
  dashesUsed: number;
  batteryRemaining: number;
  hpRemaining: number;
  damageTaken: number;
  elapsedSeconds: number;
}

export interface CatalogPcCharacter {
  id: string;
  name: string;
  tierName: string;
  persona: string;
  tagline: string;
  wx: number;
  wy: number;
  accentColor: string;
  factionColor: FactionColor;
  avatarIdx: number;
  accessory: 'grad_cap' | 'headphones' | 'visor' | 'wings' | 'stylus';
  demoType: 'offline_ai' | 'multitask' | 'xess_fps' | 'battery_air' | 'creator_gen';
  stationId: 'A' | 'B' | 'C';
  highlights: string[];
  chatText: string;
  demoBurstLabel: string;
}

export interface HudSnapshot {
  zone: WorldZoneId;
  district: DistrictId;
  districtTitle: string;
  pcLabel: string;
  heroForm: HeroForm;
  hp: number;
  maxHp: number;
  battery: number;
  npuCharge: number;
  goldCount: number;
  woodCount: number;
  fpsDisplay: number;
  hasNpuPulse: boolean;
  hasXessSurge: boolean;
  dashReadyPct: number;
  specialReadyPct: number;
  tasksRescued: number;
  totalTasks: number;
  objectiveText: string;
  nearbyPrompt: string | null;
  bossActive: boolean;
  bossName: string;
  bossPhaseLabel: string;
  bossHp: number;
  bossMaxHp: number;
  bossShield: number;
  bossMaxShield: number;
  twinBosses?: { name: string; hp: number; maxHp: number }[];
  bannerText: string | null;
  inExpoPark: boolean;
  matchedPcId: string;
  taggedPcIds: string[];
  inspectedPcCount: number;
  totalExpoPcs: number;
}

export interface StoreStation {
  id: 'A' | 'B' | 'C';
  name: string;
  subtitle: string;
  positionLabel: string;
}

export interface RecommendationResult {
  matchedPcId: string;
  tierName: string;
  archetypeTitle: string;
  tagline: string;
  matchReason: string;
  highlights: { label: string; detail: string }[];
  station: StoreStation;
  checklist: { id: string; title: string; howToTest: string }[];
}

export type IntelHardwareKey =
  | 'trap_glitterbook'
  | 'ecore_booth'
  | 'core_ultra_battery'
  | 'core_ultra_hub'
  | 'ai_pc_apps'
  | 'ai_pc_xess'
  | 'npu_ai_boost'
  | 'arc_xess_rig'
  | 'expo_station_a'
  | 'expo_station_b'
  | 'expo_station_c';

export interface IntelHardwareSpec {
  key: IntelHardwareKey;
  title: string;
  subtitle: string;
  category: string;
  factionColor: FactionColor;
  accentColor: string;
  studioPhotoKey: 'processor' | 'aiPcLaptop' | 'arcXess' | 'expoStation';
  pixelSpriteKey: 'chip' | 'aiPc' | 'booth' | 'trapLaptop';
  summary: string;
  whyItMatters: string;
  engines: { label: string; title: string; detail: string }[];
  specs: { label: string; value: string }[];
  officialUrl: string;
  officialLabel: string;
}

