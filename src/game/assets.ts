import type { PortraitId } from './types';
import coreUltraChipRaw from '../assets/images/pixel_core_ultra_chip_shadowed_1795721325711.jpg';
import intelAiPcRaw from '../assets/images/pixel_intel_ai_pc_shadowed_1795721326810.jpg';
import aiPcBoothRaw from '../assets/images/pixel_ai_pc_booth_shadowed_1795721327111.jpg';
import trapLaptopRaw from '../assets/images/pixel_trap_laptop_shadowed_1795721327696.jpg';
import realProcessorPhoto from '../assets/images/real_core_ultra_processor_1795721328321.jpg';
import realAiPcPhoto from '../assets/images/real_intel_ai_pc_laptop_1795721328784.jpg';
import realArcXessPhoto from '../assets/images/real_intel_arc_xess_showcase_1795721329488.jpg';
import realExpoStationPhoto from '../assets/images/real_intel_expo_station_1795721329704.jpg';
import heroGatewayArt from '../assets/images/hero_ink_battle_banner_1795759347447.jpg';
import pillarNpuArt from '../assets/images/pillar_npu_forge_1795755336368.jpg';
import pillarBatteryArt from '../assets/images/pillar_battery_lantern_1795755336424.jpg';
import pillarX86ArcArt from '../assets/images/pillar_x86_arc_bridge_1795755337853.jpg';
import arcadeMarqueeArt from '../assets/images/arcade_parchment_marquee_1795759348203.jpg';
import arcadeSideLeftArt from '../assets/images/arcade_side_panel_left_1795757180045.jpg';
import arcadeSideRightArt from '../assets/images/arcade_side_panel_right_1795757180647.jpg';
import doodleNotebookArt from '../assets/images/doodle_notebook_corners_1795757181165.jpg';
import xrayCoreUltraArt from '../assets/images/xray_core_ultra_series3_1795758713524.jpg';
import xrayBargainTrapArt from '../assets/images/xray_bargain_thermal_trap_1795758712656.jpg';
import xrayCoreUltra5Art from '../assets/images/xray_core_ultra5_ultrabook_1795760440166.jpg';
import xrayRtx4060Art from '../assets/images/xray_rtx4060_dual_fan_1795760440887.jpg';
import xrayCoreUltraX9Art from '../assets/images/xray_core_ultra_x9_pro_1795760440441.jpg';
import procCoreUltra5Art from '../assets/images/proc_core_ultra5_1795763756648.jpg';
import procCoreUltra7Art from '../assets/images/proc_core_ultra7_1795763756412.jpg';
import procCoreUltraX9Art from '../assets/images/proc_core_ultra_x9_1795763758963.jpg';
import slotGpuHeraldArt from '../assets/images/slot_gpu_herald_1795763757139.jpg';
import slotMemoryScrollsArt from '../assets/images/slot_memory_scrolls_1795763759633.jpg';
import slotStorageVaultArt from '../assets/images/slot_storage_vault_1795763760468.jpg';
import slotCoolingVaporArt from '../assets/images/slot_cooling_vapor_1795763759423.jpg';
import slotCoolingAirflowArt from '../assets/images/slot_cooling_airflow_1795763761105.jpg';

export type FactionColor = 'Blue' | 'Red' | 'Yellow' | 'Purple' | 'Black';

export const INTEL_HARDWARE_URLS = {
  chip: coreUltraChipRaw,
  aiPc: intelAiPcRaw,
  booth: aiPcBoothRaw,
  trapLaptop: trapLaptopRaw,
};

export const INTEL_REAL_PHOTO_URLS = {
  processor: realProcessorPhoto,
  aiPcLaptop: realAiPcPhoto,
  arcXess: realArcXessPhoto,
  expoStation: realExpoStationPhoto,
};

export const EDITORIAL_ART_URLS = {
  heroGateway: heroGatewayArt,
  pillarNpu: pillarNpuArt,
  pillarBattery: pillarBatteryArt,
  pillarX86Arc: pillarX86ArcArt,
  notebookDoodle: doodleNotebookArt,
  xrayCoreUltra: xrayCoreUltraArt,
  xrayBargainTrap: xrayBargainTrapArt,
  xrayCoreUltra5: xrayCoreUltra5Art,
  xrayRtx4060: xrayRtx4060Art,
  xrayCoreUltraX9: xrayCoreUltraX9Art,
  procCoreUltra5: procCoreUltra5Art,
  procCoreUltra7: procCoreUltra7Art,
  procCoreUltraX9: procCoreUltraX9Art,
  slotGpuHerald: slotGpuHeraldArt,
  slotMemoryScrolls: slotMemoryScrollsArt,
  slotStorageVault: slotStorageVaultArt,
  slotCoolingVapor: slotCoolingVaporArt,
  slotCoolingAirflow: slotCoolingAirflowArt,
};

export const ARCADE_CABINET_ART_URLS = {
  marquee: arcadeMarqueeArt,
  leftPanel: arcadeSideLeftArt,
  rightPanel: arcadeSideRightArt,
};

const TS_BASE = '/assets/tiny_swords';

function enc(path: string): string {
  return `${TS_BASE}/${path
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')}`;
}

export const TINY_SWORDS_AVATARS: string[] = Array.from({ length: 25 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return enc(`UI Elements/UI Elements/Human Avatars/Avatars_${num}.png`);
});

export const PORTRAIT_AVATAR_MAP: Record<
  PortraitId,
  { avatarIdx: number; ribbonColor: FactionColor; label: string }
> = {
  agent: { avatarIdx: 1, ribbonColor: 'Blue', label: 'Blue Hero' },
  pawn_worker: { avatarIdx: 2, ribbonColor: 'Blue', label: 'Blue Pawn' },
  ecore_steward: { avatarIdx: 4, ribbonColor: 'Blue', label: 'E-Core Steward' },
  npu_sentinel: { avatarIdx: 5, ribbonColor: 'Purple', label: 'NPU Monk Sentinel' },
  arc_warden: { avatarIdx: 13, ribbonColor: 'Yellow', label: 'Arc Archer Warden' },
  trap_laptop: { avatarIdx: 7, ribbonColor: 'Red', label: 'GlitterBook Trap' },
  lag_titan: { avatarIdx: 21, ribbonColor: 'Black', label: 'Black Lag Titan' },
  laptop_mascot: { avatarIdx: 1, ribbonColor: 'Blue', label: 'AI PC Champion' },
};

export const TINY_SWORDS_UI = {
  woodTable: enc('UI Elements/UI Elements/Wood Table/WoodTable.png'),
  woodTableSlots: enc('UI Elements/UI Elements/Wood Table/WoodTable_Slots.png'),
  regularPaper: enc('UI Elements/UI Elements/Papers/RegularPaper.png'),
  specialPaper: enc('UI Elements/UI Elements/Papers/SpecialPaper.png'),
  banner: enc('UI Elements/UI Elements/Banners/Banner.png'),
  bannerSlots: enc('UI Elements/UI Elements/Banners/Banner_Slots.png'),
  bigBarBase: enc('UI Elements/UI Elements/Bars/BigBar_Base.png'),
  bigBarFill: enc('UI Elements/UI Elements/Bars/BigBar_Fill.png'),
  smallBarBase: enc('UI Elements/UI Elements/Bars/SmallBar_Base.png'),
  smallBarFill: enc('UI Elements/UI Elements/Bars/SmallBar_Fill.png'),
  bigBlueBtnReg: enc('UI Elements/UI Elements/Buttons/BigBlueButton_Regular.png'),
  bigBlueBtnPressed: enc('UI Elements/UI Elements/Buttons/BigBlueButton_Pressed.png'),
  bigRedBtnReg: enc('UI Elements/UI Elements/Buttons/BigRedButton_Regular.png'),
  bigRedBtnPressed: enc('UI Elements/UI Elements/Buttons/BigRedButton_Pressed.png'),
  smallBlueRoundReg: enc('UI Elements/UI Elements/Buttons/SmallBlueRoundButton_Regular.png'),
  smallRedRoundReg: enc('UI Elements/UI Elements/Buttons/SmallRedRoundButton_Regular.png'),
  tinyRoundBlue: enc('UI Elements/UI Elements/Buttons/TinyRoundBlueButton.png'),
  tinyRoundRed: enc('UI Elements/UI Elements/Buttons/TinyRoundRedButton.png'),
  bigRibbons: enc('UI Elements/UI Elements/Ribbons/BigRibbons.png'),
  smallRibbons: enc('UI Elements/UI Elements/Ribbons/SmallRibbons.png'),
  swords: enc('UI Elements/UI Elements/Swords/Swords.png'),
  cursors: {
    default: enc('UI Elements/UI Elements/Cursors/Cursor_01.png'),
    pointer: enc('UI Elements/UI Elements/Cursors/Cursor_02.png'),
    grab: enc('UI Elements/UI Elements/Cursors/Cursor_03.png'),
    target: enc('UI Elements/UI Elements/Cursors/Cursor_04.png'),
  },
  icons: {
    hammer: enc('UI Elements/UI Elements/Icons/Icon_01.png'),
    wood: enc('UI Elements/UI Elements/Icons/Icon_02.png'),
    gold: enc('UI Elements/UI Elements/Icons/Icon_03.png'),
    meat: enc('UI Elements/UI Elements/Icons/Icon_04.png'),
    sword: enc('UI Elements/UI Elements/Icons/Icon_05.png'),
    shield: enc('UI Elements/UI Elements/Icons/Icon_06.png'),
    play: enc('UI Elements/UI Elements/Icons/Icon_07.png'),
    back: enc('UI Elements/UI Elements/Icons/Icon_08.png'),
    close: enc('UI Elements/UI Elements/Icons/Icon_09.png'),
    gear: enc('UI Elements/UI Elements/Icons/Icon_10.png'),
    info: enc('UI Elements/UI Elements/Icons/Icon_11.png'),
    music: enc('UI Elements/UI Elements/Icons/Icon_12.png'),
  },
};

export interface FactionBuildingSet {
  castle: HTMLImageElement;
  monastery: HTMLImageElement;
  archery: HTMLImageElement;
  barracks: HTMLImageElement;
  tower: HTMLImageElement;
  house1: HTMLImageElement;
  house2: HTMLImageElement;
  house3: HTMLImageElement;
}

export interface FactionUnitSet {
  warriorIdle: HTMLImageElement;
  warriorRun: HTMLImageElement;
  warriorAttack1: HTMLImageElement;
  warriorAttack2: HTMLImageElement;
  warriorGuard: HTMLImageElement;
  archerIdle: HTMLImageElement;
  archerRun: HTMLImageElement;
  archerShoot: HTMLImageElement;
  arrow: HTMLImageElement;
  lancerIdle: HTMLImageElement;
  lancerRun: HTMLImageElement;
  lancerRightAttack: HTMLImageElement;
  lancerRightDefence: HTMLImageElement;
  monkIdle: HTMLImageElement;
  monkRun: HTMLImageElement;
  monkHeal: HTMLImageElement;
  monkHealEffect: HTMLImageElement;
  pawnIdle: HTMLImageElement;
  pawnRun: HTMLImageElement;
  pawnInteractHammer: HTMLImageElement;
  pawnIdleGold: HTMLImageElement;
  pawnRunGold: HTMLImageElement;
}

export interface TinySwordsAtlas {
  tilemaps: HTMLImageElement[]; // color1 .. color5
  waterBg: HTMLImageElement;
  waterFoam: HTMLImageElement;
  waterFoamMasked: HTMLCanvasElement;
  shadow: HTMLImageElement;
  buildings: Record<FactionColor, FactionBuildingSet>;
  units: Record<FactionColor, FactionUnitSet>;
  trees: HTMLImageElement[]; // Tree1..4
  stumps: HTMLImageElement[]; // Stump 1..4
  bushes: HTMLImageElement[]; // Bushe1..4
  rocks: HTMLImageElement[]; // Rock1..4
  waterRocks: HTMLImageElement[]; // Water Rocks_01..04
  clouds: HTMLImageElement[]; // Clouds_01..08
  rubberDuck: HTMLImageElement;
  sheepIdle: HTMLImageElement;
  sheepMove: HTMLImageElement;
  sheepGrass: HTMLImageElement;
  goldStones: HTMLImageElement[]; // Gold Stone 1..6
  goldHighlights: HTMLImageElement[]; // Gold Stone 1_Highlight..6_Highlight
  goldResource: HTMLImageElement;
  woodResource: HTMLImageElement;
  meatResource: HTMLImageElement;
  tools: HTMLImageElement[]; // Tool_01..04
  fx: {
    dust1: HTMLImageElement;
    dust2: HTMLImageElement;
    explosion1: HTMLImageElement;
    explosion2: HTMLImageElement;
    fire1: HTMLImageElement;
    fire2: HTMLImageElement;
    fire3: HTMLImageElement;
    waterSplash: HTMLImageElement;
  };
  intelHardware: {
    chip: HTMLCanvasElement;
    aiPc: HTMLCanvasElement;
    booth: HTMLCanvasElement;
    trapLaptop: HTMLCanvasElement;
  };
  titleBanner: HTMLImageElement;
}

function makeFallbackImage(): HTMLImageElement {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const img = new Image();
  img.src = c.toDataURL();
  return img;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`Tiny Swords sprite failed to load, using fallback: ${src}`);
      resolve(makeFallbackImage());
    };
    img.src = src;
  });
}

function stripWhiteBackground(img: HTMLImageElement, maxDim = 320): HTMLCanvasElement {
  const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
  const w = Math.max(1, Math.round((img.width || 64) * scale));
  const h = Math.max(1, Math.round((img.height || 64) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const isNearWhite = (idx: number) => {
    const o = idx * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    return r >= 225 && g >= 225 && b >= 225 && maxC - minC <= 28;
  };

  const pushIfWhite = (x: number, y: number) => {
    const idx = y * w + x;
    if (visited[idx]) return;
    if (isNearWhite(idx)) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    pushIfWhite(x, 0);
    pushIfWhite(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushIfWhite(0, y);
    pushIfWhite(w - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    data[idx * 4 + 3] = 0;
    const x = idx % w;
    const y = (idx - x) / w;
    if (x > 0) pushIfWhite(x - 1, y);
    if (x + 1 < w) pushIfWhite(x + 1, y);
    if (y > 0) pushIfWhite(x, y - 1);
    if (y + 1 < h) pushIfWhite(x, y + 1);
  }

  // Soften 1px anti-aliased fringe adjacent to transparent background
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (visited[idx]) continue;
      const o = idx * 4;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const isEdgeLight = r >= 185 && g >= 185 && b >= 185 && Math.max(r, g, b) - Math.min(r, g, b) <= 26;
      if (!isEdgeLight) continue;
      const adjTransparent =
        visited[idx - 1] || visited[idx + 1] || visited[idx - w] || visited[idx + w];
      if (adjTransparent) {
        data[o + 3] = Math.round(data[o + 3] * 0.25);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function maskWaterFoamSheet(img: HTMLImageElement): HTMLCanvasElement {
  const w = img.width || 3072;
  const h = img.height || 192;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.drawImage(img, 0, 0, w, h);
  const frames = Math.max(1, Math.round(w / h));
  for (let i = 0; i < frames; i++) {
    const fx = i * h;
    // Strip the opaque pale-teal inner square (centered [58..134] in 192x192) so only animated foam rings remain
    ctx.clearRect(fx + Math.round(h * 0.3), Math.round(h * 0.3), Math.round(h * 0.4), Math.round(h * 0.4));
  }
  return canvas;
}

async function loadFactionBuildings(color: FactionColor): Promise<FactionBuildingSet> {
  const dir = `Buildings/${color} Buildings`;
  const [castle, monastery, archery, barracks, tower, house1, house2, house3] = await Promise.all([
    loadImage(enc(`${dir}/Castle.png`)),
    loadImage(enc(`${dir}/Monastery.png`)),
    loadImage(enc(`${dir}/Archery.png`)),
    loadImage(enc(`${dir}/Barracks.png`)),
    loadImage(enc(`${dir}/Tower.png`)),
    loadImage(enc(`${dir}/House1.png`)),
    loadImage(enc(`${dir}/House2.png`)),
    loadImage(enc(`${dir}/House3.png`)),
  ]);
  return { castle, monastery, archery, barracks, tower, house1, house2, house3 };
}

async function loadFactionUnits(color: FactionColor): Promise<FactionUnitSet> {
  const dir = `Units/${color} Units`;
  const [
    warriorIdle,
    warriorRun,
    warriorAttack1,
    warriorAttack2,
    warriorGuard,
    archerIdle,
    archerRun,
    archerShoot,
    arrow,
    lancerIdle,
    lancerRun,
    lancerRightAttack,
    lancerRightDefence,
    monkIdle,
    monkRun,
    monkHeal,
    monkHealEffect,
    pawnIdle,
    pawnRun,
    pawnInteractHammer,
    pawnIdleGold,
    pawnRunGold,
  ] = await Promise.all([
    loadImage(enc(`${dir}/Warrior/Warrior_Idle.png`)),
    loadImage(enc(`${dir}/Warrior/Warrior_Run.png`)),
    loadImage(enc(`${dir}/Warrior/Warrior_Attack1.png`)),
    loadImage(enc(`${dir}/Warrior/Warrior_Attack2.png`)),
    loadImage(enc(`${dir}/Warrior/Warrior_Guard.png`)),
    loadImage(enc(`${dir}/Archer/Archer_Idle.png`)),
    loadImage(enc(`${dir}/Archer/Archer_Run.png`)),
    loadImage(enc(`${dir}/Archer/Archer_Shoot.png`)),
    loadImage(enc(`${dir}/Archer/Arrow.png`)),
    loadImage(enc(`${dir}/Lancer/Lancer_Idle.png`)),
    loadImage(enc(`${dir}/Lancer/Lancer_Run.png`)),
    loadImage(enc(`${dir}/Lancer/Lancer_Right_Attack.png`)),
    loadImage(enc(`${dir}/Lancer/Lancer_Right_Defence.png`)),
    loadImage(enc(`${dir}/Monk/Idle.png`)),
    loadImage(enc(`${dir}/Monk/Run.png`)),
    loadImage(enc(`${dir}/Monk/Heal.png`)),
    loadImage(enc(`${dir}/Monk/Heal_Effect.png`)),
    loadImage(enc(`${dir}/Pawn/Pawn_Idle.png`)),
    loadImage(enc(`${dir}/Pawn/Pawn_Run.png`)),
    loadImage(enc(`${dir}/Pawn/Pawn_Interact Hammer.png`)),
    loadImage(enc(`${dir}/Pawn/Pawn_Idle Gold.png`)),
    loadImage(enc(`${dir}/Pawn/Pawn_Run Gold.png`)),
  ]);
  return {
    warriorIdle,
    warriorRun,
    warriorAttack1,
    warriorAttack2,
    warriorGuard,
    archerIdle,
    archerRun,
    archerShoot,
    arrow,
    lancerIdle,
    lancerRun,
    lancerRightAttack,
    lancerRightDefence,
    monkIdle,
    monkRun,
    monkHeal,
    monkHealEffect,
    pawnIdle,
    pawnRun,
    pawnInteractHammer,
    pawnIdleGold,
    pawnRunGold,
  };
}

let cachedAtlasPromise: Promise<TinySwordsAtlas> | null = null;

export function loadTinySwordsAtlas(): Promise<TinySwordsAtlas> {
  if (cachedAtlasPromise) return cachedAtlasPromise;
  cachedAtlasPromise = (async () => {
    const [
      tilemaps,
      waterBg,
      waterFoam,
      shadow,
      blueB,
      redB,
      yellowB,
      purpleB,
      blackB,
      blueU,
      redU,
      yellowU,
      purpleU,
      blackU,
      trees,
      stumps,
      bushes,
      rocks,
      waterRocks,
      clouds,
      rubberDuck,
      sheepIdle,
      sheepMove,
      sheepGrass,
      goldStones,
      goldHighlights,
      goldResource,
      woodResource,
      meatResource,
      tools,
      dust1,
      dust2,
      explosion1,
      explosion2,
      fire1,
      fire2,
      fire3,
      waterSplash,
      titleBanner,
      chipRawImg,
      aiPcRawImg,
      boothRawImg,
      trapLaptopRawImg,
    ] = await Promise.all([
      Promise.all([1, 2, 3, 4, 5].map((n) => loadImage(enc(`Terrain/Tileset/Tilemap_color${n}.png`)))),
      loadImage(enc('Terrain/Tileset/Water Background color.png')),
      loadImage(enc('Terrain/Tileset/Water Foam.png')),
      loadImage(enc('Terrain/Tileset/Shadow.png')),
      loadFactionBuildings('Blue'),
      loadFactionBuildings('Red'),
      loadFactionBuildings('Yellow'),
      loadFactionBuildings('Purple'),
      loadFactionBuildings('Black'),
      loadFactionUnits('Blue'),
      loadFactionUnits('Red'),
      loadFactionUnits('Yellow'),
      loadFactionUnits('Purple'),
      loadFactionUnits('Black'),
      Promise.all([1, 2, 3, 4].map((n) => loadImage(enc(`Terrain/Resources/Wood/Trees/Tree${n}.png`)))),
      Promise.all([1, 2, 3, 4].map((n) => loadImage(enc(`Terrain/Resources/Wood/Trees/Stump ${n}.png`)))),
      Promise.all([1, 2, 3, 4].map((n) => loadImage(enc(`Terrain/Decorations/Bushes/Bushe${n}.png`)))),
      Promise.all([1, 2, 3, 4].map((n) => loadImage(enc(`Terrain/Decorations/Rocks/Rock${n}.png`)))),
      Promise.all(
        [1, 2, 3, 4].map((n) =>
          loadImage(enc(`Terrain/Decorations/Rocks in the Water/Water Rocks_0${n}.png`))
        )
      ),
      Promise.all(
        [1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
          loadImage(enc(`Terrain/Decorations/Clouds/Clouds_0${n}.png`))
        )
      ),
      loadImage(enc('Terrain/Decorations/Rubber Duck/Rubber duck.png')),
      loadImage(enc('Terrain/Resources/Meat/Sheep/Sheep_Idle.png')),
      loadImage(enc('Terrain/Resources/Meat/Sheep/Sheep_Move.png')),
      loadImage(enc('Terrain/Resources/Meat/Sheep/Sheep_Grass.png')),
      Promise.all(
        [1, 2, 3, 4, 5, 6].map((n) =>
          loadImage(enc(`Terrain/Resources/Gold/Gold Stones/Gold Stone ${n}.png`))
        )
      ),
      Promise.all(
        [1, 2, 3, 4, 5, 6].map((n) =>
          loadImage(enc(`Terrain/Resources/Gold/Gold Stones/Gold Stone ${n}_Highlight.png`))
        )
      ),
      loadImage(enc('Terrain/Resources/Gold/Gold Resource/Gold_Resource.png')),
      loadImage(enc('Terrain/Resources/Wood/Wood Resource/Wood Resource.png')),
      loadImage(enc('Terrain/Resources/Meat/Meat Resource/Meat Resource.png')),
      Promise.all([1, 2, 3, 4].map((n) => loadImage(enc(`Terrain/Resources/Tools/Tool_0${n}.png`)))),
      loadImage(enc('Particle FX/Dust_01.png')),
      loadImage(enc('Particle FX/Dust_02.png')),
      loadImage(enc('Particle FX/Explosion_01.png')),
      loadImage(enc('Particle FX/Explosion_02.png')),
      loadImage(enc('Particle FX/Fire_01.png')),
      loadImage(enc('Particle FX/Fire_02.png')),
      loadImage(enc('Particle FX/Fire_03.png')),
      loadImage(enc('Particle FX/Water Splash.png')),
      loadImage(TINY_SWORDS_UI.banner),
      loadImage(coreUltraChipRaw),
      loadImage(intelAiPcRaw),
      loadImage(aiPcBoothRaw),
      loadImage(trapLaptopRaw),
    ]);

    const chipCanvas = stripWhiteBackground(chipRawImg, 256);
    const aiPcCanvas = stripWhiteBackground(aiPcRawImg, 280);
    const boothCanvas = stripWhiteBackground(boothRawImg, 360);
    const trapLaptopCanvas = stripWhiteBackground(trapLaptopRawImg, 280);

    try {
      INTEL_HARDWARE_URLS.chip = chipCanvas.toDataURL('image/png');
      INTEL_HARDWARE_URLS.aiPc = aiPcCanvas.toDataURL('image/png');
      INTEL_HARDWARE_URLS.booth = boothCanvas.toDataURL('image/png');
      INTEL_HARDWARE_URLS.trapLaptop = trapLaptopCanvas.toDataURL('image/png');
    } catch {
      // Keep raw URLs if canvas export unavailable
    }

    return {
      tilemaps,
      waterBg,
      waterFoam,
      waterFoamMasked: maskWaterFoamSheet(waterFoam),
      shadow,
      buildings: {
        Blue: blueB,
        Red: redB,
        Yellow: yellowB,
        Purple: purpleB,
        Black: blackB,
      },
      units: {
        Blue: blueU,
        Red: redU,
        Yellow: yellowU,
        Purple: purpleU,
        Black: blackU,
      },
      trees,
      stumps,
      bushes,
      rocks,
      waterRocks,
      clouds,
      rubberDuck,
      sheepIdle,
      sheepMove,
      sheepGrass,
      goldStones,
      goldHighlights,
      goldResource,
      woodResource,
      meatResource,
      tools,
      fx: {
        dust1,
        dust2,
        explosion1,
        explosion2,
        fire1,
        fire2,
        fire3,
        waterSplash,
      },
      intelHardware: {
        chip: chipCanvas,
        aiPc: aiPcCanvas,
        booth: boothCanvas,
        trapLaptop: trapLaptopCanvas,
      },
      titleBanner,
    };
  })();
  return cachedAtlasPromise;
}

// --- Runtime Contiguous 9-Slice, 3-Slice Ribbon & Cursor Assembler ---

type Span = [number, number];

function packNineSlice(
  img: HTMLImageElement,
  xs: [Span, Span, Span],
  ys: [Span, Span, Span]
): string {
  const widths = xs.map(([a, b]) => b - a + 1);
  const heights = ys.map(([a, b]) => b - a + 1);
  const canvas = document.createElement('canvas');
  canvas.width = widths[0] + widths[1] + widths[2];
  canvas.height = heights[0] + heights[1] + heights[2];
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;

  let dy = 0;
  for (let r = 0; r < 3; r++) {
    let dx = 0;
    const sy = ys[r][0];
    const sh = heights[r];
    for (let c = 0; c < 3; c++) {
      const sx = xs[c][0];
      const sw = widths[c];
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh);
      dx += sw;
    }
    dy += sh;
  }
  return canvas.toDataURL('image/png');
}

function packThreeSliceRow(
  img: HTMLImageElement,
  xs: [Span, Span, Span],
  ySpan: Span
): string {
  const widths = xs.map(([a, b]) => b - a + 1);
  const sh = ySpan[1] - ySpan[0] + 1;
  const canvas = document.createElement('canvas');
  canvas.width = widths[0] + widths[1] + widths[2];
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;
  let dx = 0;
  for (let c = 0; c < 3; c++) {
    const sx = xs[c][0];
    const sw = widths[c];
    ctx.drawImage(img, sx, ySpan[0], sw, sh, dx, 0, sw, sh);
    dx += sw;
  }
  return canvas.toDataURL('image/png');
}

function resizeCursorDataUrl(img: HTMLImageElement, size = 32): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, size, size);
  return canvas.toDataURL('image/png');
}

let uiSkinsInitialized = false;

export async function initTinySwordsUiSkins(): Promise<void> {
  if (uiSkinsInitialized || typeof document === 'undefined') return;
  uiSkinsInitialized = true;
  try {
    const [
      woodImg,
      regPaperImg,
      specPaperImg,
      bannerImg,
      blueBtnImg,
      blueBtnPrImg,
      redBtnImg,
      redBtnPrImg,
      bigBarBaseImg,
      bigRibbonsImg,
      cursor1Img,
      cursor2Img,
    ] = await Promise.all([
      loadImage(TINY_SWORDS_UI.woodTable),
      loadImage(TINY_SWORDS_UI.regularPaper),
      loadImage(TINY_SWORDS_UI.specialPaper),
      loadImage(TINY_SWORDS_UI.banner),
      loadImage(TINY_SWORDS_UI.bigBlueBtnReg),
      loadImage(TINY_SWORDS_UI.bigBlueBtnPressed),
      loadImage(TINY_SWORDS_UI.bigRedBtnReg),
      loadImage(TINY_SWORDS_UI.bigRedBtnPressed),
      loadImage(TINY_SWORDS_UI.bigBarBase),
      loadImage(TINY_SWORDS_UI.bigRibbons),
      loadImage(TINY_SWORDS_UI.cursors.default),
      loadImage(TINY_SWORDS_UI.cursors.pointer),
    ]);

    const root = document.documentElement.style;

    const woodUrl = packNineSlice(
      woodImg,
      [[44, 127], [192, 255], [320, 403]],
      [[43, 127], [192, 255], [320, 422]]
    );
    const paperUrl = packNineSlice(
      regPaperImg,
      [[12, 63], [128, 191], [256, 307]],
      [[20, 63], [128, 191], [256, 300]]
    );
    const specialUrl = packNineSlice(
      specPaperImg,
      [[9, 63], [128, 191], [256, 310]],
      [[20, 63], [128, 191], [256, 298]]
    );
    const bannerUrl = packNineSlice(
      bannerImg,
      [[28, 127], [192, 255], [320, 403]],
      [[60, 127], [192, 255], [320, 430]]
    );
    const btnXs: [Span, Span, Span] = [[19, 63], [128, 191], [256, 300]];
    const btnYs: [Span, Span, Span] = [[17, 63], [128, 191], [256, 302]];
    const blueBtnUrl = packNineSlice(blueBtnImg, btnXs, btnYs);
    const blueBtnPrUrl = packNineSlice(blueBtnPrImg, btnXs, btnYs);
    const redBtnUrl = packNineSlice(redBtnImg, btnXs, btnYs);
    const redBtnPrUrl = packNineSlice(redBtnPrImg, btnXs, btnYs);
    const barBaseUrl = packThreeSliceRow(bigBarBaseImg, [[40, 63], [128, 191], [256, 279]], [9, 59]);

    const ribXs: [Span, Span, Span] = [[30, 127], [192, 255], [320, 416]];
    const ribBlue = packThreeSliceRow(bigRibbonsImg, ribXs, [20, 122]);
    const ribRed = packThreeSliceRow(bigRibbonsImg, ribXs, [148, 250]);
    const ribYellow = packThreeSliceRow(bigRibbonsImg, ribXs, [276, 378]);
    const ribPurple = packThreeSliceRow(bigRibbonsImg, ribXs, [404, 506]);
    const ribBlack = packThreeSliceRow(bigRibbonsImg, ribXs, [532, 634]);

    const cur1 = resizeCursorDataUrl(cursor1Img, 32);
    const cur2 = resizeCursorDataUrl(cursor2Img, 32);

    root.setProperty('--ts-wood-9', `url("${woodUrl}")`);
    root.setProperty('--ts-paper-9', `url("${paperUrl}")`);
    root.setProperty('--ts-special-9', `url("${specialUrl}")`);
    root.setProperty('--ts-banner-9', `url("${bannerUrl}")`);
    root.setProperty('--ts-btn-blue-9', `url("${blueBtnUrl}")`);
    root.setProperty('--ts-btn-blue-pr-9', `url("${blueBtnPrUrl}")`);
    root.setProperty('--ts-btn-red-9', `url("${redBtnUrl}")`);
    root.setProperty('--ts-btn-red-pr-9', `url("${redBtnPrUrl}")`);
    root.setProperty('--ts-bar-base-3', `url("${barBaseUrl}")`);
    root.setProperty('--ts-ribbon-blue', `url("${ribBlue}")`);
    root.setProperty('--ts-ribbon-red', `url("${ribRed}")`);
    root.setProperty('--ts-ribbon-yellow', `url("${ribYellow}")`);
    root.setProperty('--ts-ribbon-purple', `url("${ribPurple}")`);
    root.setProperty('--ts-ribbon-black', `url("${ribBlack}")`);
    root.setProperty('--ts-cursor-default', `url("${cur1}") 11 8, auto`);
    root.setProperty('--ts-cursor-pointer', `url("${cur2}") 11 8, pointer`);
  } catch {
    // Non-fatal: CSS fallback frames still render cleanly
  }
}
