import {
  loadTinySwordsAtlas,
  type FactionColor,
  type TinySwordsAtlas,
} from './assets';
import { gameAudio } from './audio';
import { INTEL_HARDWARE_SPECS } from './intelHardwareData';
import { EXPO_PC_CATALOG, getMatchedExpoPcId } from './storyData';
import type {
  CatalogPcCharacter,
  DialogueChoice,
  DistrictId,
  GamePhase,
  HeroForm,
  HudSnapshot,
  IntelHardwareKey,
  PlayerProfile,
  WorldZoneId,
} from './types';

const TILE_SIZE = 52;
const INK = '#0B1120';

type GroundKind =
  | 0 // Animated Ocean Water (non-walkable)
  | 1 // Bargain Trap Island (Color 5 scorched turf)
  | 2 // E-Core Efficiency Park (Color 1 lush green)
  | 3 // Copper Bus Plaza & Bridges (Color 3 warm cobblestone)
  | 4 // NPU Monastery Island (Color 2 cool teal turf)
  | 5 // Arc Archery Arena Island (Color 4 amber-slate turf)
  | 6 // Overclocked Colosseum Island (Color 5 obsidian fortress)
  | 7 // Expo Park Island (Color 1 + Color 3)
  | 8 // Solid Footprint (Building base / cliff barrier)
  | 9; // Locked Boss Gate

type BuildingKind = 'castle' | 'monastery' | 'archery' | 'barracks' | 'tower' | 'house1' | 'house2' | 'house3';

interface BuildingLandmark {
  id: string;
  name: string;
  subtitle: string;
  faction: FactionColor;
  kind: BuildingKind;
  tx: number;
  ty: number;
  tw: number;
  th: number;
  accent: string;
}

interface PropItem {
  kind: 'tree' | 'stump' | 'bush' | 'rock' | 'gold_stone';
  wx: number;
  wy: number;
  variant: number;
}

interface WaterDeco {
  kind: 'water_rock' | 'duck';
  wx: number;
  wy: number;
  variant: number;
  phase: number;
}

interface SheepEntity {
  wx: number;
  wy: number;
  vx: number;
  vy: number;
  state: 'IDLE' | 'MOVE' | 'GRASS';
  timer: number;
  pauseTimer: number;
  flipCooldown: number;
  flipX: boolean;
  waypoints: { wx: number; wy: number }[];
  wpIdx: number;
}

interface EcosystemVillager {
  id: number;
  faction: FactionColor;
  role: 'pawn' | 'pawn_gold' | 'monk' | 'archer' | 'lancer';
  wx: number;
  wy: number;
  vx: number;
  vy: number;
  state: 'IDLE' | 'MOVE' | 'ACTION';
  timer: number;
  pauseTimer: number;
  flipCooldown: number;
  flipX: boolean;
  waypoints: { wx: number; wy: number }[];
  wpIdx: number;
}

interface IntelHardwareProp {
  id: string;
  hardwareKey: IntelHardwareKey;
  kind: 'chip' | 'aiPc' | 'booth' | 'stallStudent' | 'stallGaming' | 'stallCreator' | 'trapLaptop';
  wx: number;
  wy: number;
  label: string;
  accent: string;
}

interface CloudEntity {
  wx: number;
  wy: number;
  speed: number;
  variant: number;
  scale: number;
  layer: 0 | 1;
}

type EnemyClass =
  | 'red_warrior'
  | 'red_archer'
  | 'red_pawn'
  | 'purple_lancer'
  | 'black_warrior'
  | 'black_archer'
  | 'spectral_knight';

interface EnemyEntity {
  id: number;
  unitClass: EnemyClass;
  faction: FactionColor;
  islandTier: 1 | 2 | 3 | 4;
  damage: number;
  speedMult: number;
  isSpectral?: boolean;
  riseElapsed?: number;
  riseDuration?: number;
  wx: number;
  wy: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  state: 'PATROL' | 'WINDUP' | 'LUNGE' | 'COOLDOWN';
  stateTimer: number;
  hitFlash: number;
  shootTimer: number;
  flipX: boolean;
}

interface TwinBossEntity {
  id: number;
  name: string;
  wx: number;
  wy: number;
  hp: number;
  maxHp: number;
  state: 'IDLE' | 'WINDUP_SLAM' | 'WINDUP_FAN' | 'COOLDOWN';
  stateTimer: number;
  hitFlash: number;
  attackAlt: boolean;
  flipX: boolean;
}

interface DarkPortal {
  wx: number;
  wy: number;
  elapsed: number;
  duration: number;
  spawned: boolean;
}

interface BossEntity {
  active: boolean;
  wx: number;
  wy: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  phase: 1 | 2 | 3;
  splitActive: boolean;
  state: 'IDLE' | 'WINDUP_SLAM' | 'WINDUP_FAN' | 'WINDUP_RING' | 'STUNNED' | 'COOLDOWN';
  stateTimer: number;
  hitFlash: number;
  attackCombo: number;
  towerTimer: number;
  portalCooldown: number;
  portals: DarkPortal[];
  twins: TwinBossEntity[];
}

interface NpcEntity {
  id: string;
  name: string;
  kind: 'ecore' | 'npu' | 'arc';
  wx: number;
  wy: number;
  dialogueId: string;
  interacted: boolean;
}

interface TaskNode {
  id: string;
  label: string;
  wx: number;
  wy: number;
  rescued: boolean;
  variant: number;
}

interface PickupEntity {
  id: number;
  kind: 'gold' | 'meat' | 'wood';
  wx: number;
  wy: number;
  bobOffset: number;
}

interface Projectile {
  wx: number;
  wy: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  radius: number;
  damage?: number;
  arrowFaction?: FactionColor;
}

interface TelegraphZone {
  wx: number;
  wy: number;
  radius: number;
  timer: number;
  maxTimer: number;
  damage: number;
}

interface SlashArc {
  wx: number;
  wy: number;
  angle: number;
  timer: number;
  maxTimer: number;
  color: string;
  radius: number;
}

type SpriteFxKind =
  | 'explosion1'
  | 'explosion2'
  | 'dust1'
  | 'dust2'
  | 'fire1'
  | 'fire2'
  | 'fire3'
  | 'waterSplash'
  | 'healEffect';

interface SpriteVfx {
  kind: SpriteFxKind;
  wx: number;
  wy: number;
  elapsed: number;
  duration: number;
  sizePx: number;
  flipX?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  wx: number;
  wy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface WorldEngineCallbacks {
  onHudUpdate: (hud: HudSnapshot) => void;
  onStartDialogue: (dialogueId: string) => void;
  onEnterExpoPark: (profile: PlayerProfile, matchedPcId: string) => void;
  onInteractExpoPc: (pc: CatalogPcCharacter) => void;
  onInspectHardware: (hardwareKey: IntelHardwareKey) => void;
  onOpenStoreModal: () => void;
  onGameOver: (profile: PlayerProfile) => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
}

export class SiliconWorldEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private atlas: TinySwordsAtlas | null = null;
  private callbacks: WorldEngineCallbacks;

  private rafId: number | null = null;
  private lastTime = 0;
  private elapsed = 0;
  private hudSyncTimer = 0;
  private hitstopTimer = 0;
  private shakeTimer = 0;
  private shakeIntensity = 0;
  private dustStepTimer = 0;

  private phase: GamePhase = 'TITLE';
  private zone: WorldZoneId = 'SILICON_CITY';
  private map: GroundKind[][] = [];
  private mapW = 46;
  private mapH = 35;

  private buildings: BuildingLandmark[] = [];
  private props: PropItem[] = [];
  private intelProps: IntelHardwareProp[] = [];
  private waterDecos: WaterDeco[] = [];
  private sheep: SheepEntity[] = [];
  private villagers: EcosystemVillager[] = [];
  private clouds: CloudEntity[] = [];
  private signposts: { wx: number; wy: number; label: string; color: string }[] = [];

  private player = {
    wx: 6.5,
    wy: 30.2,
    facingAngle: -Math.PI / 2,
    flipX: false,
    moving: false,
    heroForm: 'pawn' as HeroForm,
    hp: 100,
    maxHp: 100,
    battery: 90,
    npuCharge: 100,
    goldCount: 0,
    woodCount: 0,
    hasNpuPulse: false,
    hasXessSurge: false,
    attackTimer: 0,
    attackCooldown: 0,
    attackAlt: false,
    dashTimer: 0,
    dashCooldown: 0,
    specialCooldown: 0,
    invulnTimer: 0,
    hitFlash: 0,
    xessBuffTimer: 0,
    walkAnim: 0,
  };

  private profile: PlayerProfile = {
    primaryNeed: 'learning',
    tasksRescued: 0,
    totalTasks: 4,
    enemiesDefeated: 0,
    npuUses: 0,
    xessUses: 0,
    dashesUsed: 0,
    batteryRemaining: 100,
    hpRemaining: 100,
    damageTaken: 0,
    elapsedSeconds: 0,
  };

  private bossGateOpen = false;
  private trapCompleted = false;
  private bossTriggered = false;
  private objectiveText = 'Explore Silicon City';
  private bannerText: string | null = null;
  private bannerTimer = 0;
  private trapDrainAccum = 0;
  private attractTimer = 0;
  private transformTimer = 0;

  private taggedPcIds = new Set<string>();
  private inspectedPcIds = new Set<string>();
  private matchedPcId = 'pc_campus_dash';

  private npcs: NpcEntity[] = [];
  private tasks: TaskNode[] = [];
  private enemies: EnemyEntity[] = [];
  private pickups: PickupEntity[] = [];
  private projectiles: Projectile[] = [];
  private telegraphs: TelegraphZone[] = [];
  private slashes: SlashArc[] = [];
  private spriteVfx: SpriteVfx[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private dashGhosts: { wx: number; wy: number; alpha: number; flipX: boolean }[] = [];

  private boss: BossEntity = {
    active: false,
    wx: 23.5,
    wy: 6.4,
    hp: 380,
    maxHp: 380,
    shield: 75,
    maxShield: 75,
    phase: 1,
    splitActive: false,
    state: 'IDLE',
    stateTimer: 1.2,
    hitFlash: 0,
    attackCombo: 0,
    towerTimer: 2.8,
    portalCooldown: 4.5,
    portals: [],
    twins: [],
  };

  private nextEntityId = 1;
  private camX = 0;
  private camY = 0;
  private camZoom = 1;
  private targetZoom = 1;
  private lookAheadX = 0;
  private lookAheadY = 0;
  private prevDistrict: DistrictId = 'ECORE_PARK';

  private heldKeys = new Set<string>();
  private virtualMoveX = 0;
  private virtualMoveY = 0;
  private arcadeActive = false;
  private viewW = 1280;
  private viewH = 720;
  private resizeObserver: ResizeObserver | null = null;
  private attackBuffer = 0;
  private dashBuffer = 0;
  private specialBuffer = 0;
  private interactBuffer = 0;
  private cloudShadowCache = new Map<number, HTMLCanvasElement>();
  private stormCloudCache = new Map<number, HTMLCanvasElement>();
  private blurCanvas: HTMLCanvasElement | null = null;
  private blurCtx: CanvasRenderingContext2D | null = null;
  private flashCanvas: HTMLCanvasElement | null = null;
  private flashCtx: CanvasRenderingContext2D | null = null;
  private spectralCanvas: HTMLCanvasElement | null = null;
  private spectralCtx: CanvasRenderingContext2D | null = null;

  private stormIntensity = 0;
  private weatherMix: Record<DistrictId, number> = {
    TRAP_ALLEY: 1,
    ECORE_PARK: 0,
    COPPER_PLAZA: 0,
    NPU_LIBRARY: 0,
    ARC_ARENA: 0,
    BOSS_COLOSSEUM: 0,
    EXPO_PARK: 0,
  };
  private lightningTimer = 3.2;
  private lightningFlash = 0;
  private lightningSeed = 0;
  private rainDrops = Array.from({ length: 64 }, (_, i) => ({
    x: ((i * 73) % 100) / 100,
    y: ((i * 41) % 100) / 100,
    len: 14 + (i % 4) * 6,
    speed: 1.35 + (i % 5) * 0.22,
  }));
  private weatherMotes = Array.from({ length: 42 }, (_, i) => ({
    x: ((i * 61 + 13) % 100) / 100,
    y: ((i * 37 + 7) % 100) / 100,
    size: 2 + (i % 4) * 1.1,
    speed: 0.14 + (i % 6) * 0.05,
    phase: i * 0.77,
  }));

  constructor(canvas: HTMLCanvasElement, callbacks: WorldEngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.callbacks = callbacks;

    this.initClouds();
    this.buildSiliconCityMap(true);
    this.centerCameraInstant();
    this.bindEvents();

    void loadTinySwordsAtlas().then((atlas) => {
      this.atlas = atlas;
    });
  }

  private initClouds(): void {
    // 2x layered clouds with gentle parallax drift speeds across compact 46x35 archipelago
    this.clouds = Array.from({ length: 18 }, (_, i) => {
      const layer: 0 | 1 = i % 2 === 0 ? 0 : 1;
      return {
        wx: -5 + ((i * 3.1 + (layer === 1 ? 1.5 : 0)) % 56),
        wy: 1.8 + ((i * 3.7 + (layer === 1 ? 1.9 : 0)) % 31.5),
        speed: layer === 0 ? 0.24 + (i % 3) * 0.08 : 0.42 + (i % 4) * 0.1,
        variant: i % 8,
        scale: layer === 0 ? 0.9 + (i % 3) * 0.16 : 1.14 + (i % 3) * 0.2,
        layer,
      };
    });
  }

  public startLoop(): void {
    this.lastTime = performance.now();
    const step = (now: number) => {
      const rawDt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);
      this.update(dt);
      this.render();
      this.rafId = window.requestAnimationFrame(step);
    };
    this.rafId = window.requestAnimationFrame(step);
  }

  public destroy(): void {
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener('click', this.handleCanvasClick);
  }

  public setArcadeActive(active: boolean): void {
    this.arcadeActive = active;
    if (!active) {
      this.heldKeys.clear();
      this.virtualMoveX = 0;
      this.virtualMoveY = 0;
      gameAudio.setMusicMode('none');
    } else {
      if (this.phase === 'TITLE') {
        gameAudio.init();
        gameAudio.setMusicMode('title');
      }
      window.requestAnimationFrame(() => this.handleResize());
    }
  }

  public setVirtualMove(dx: number, dy: number): void {
    this.virtualMoveX = dx;
    this.virtualMoveY = dy;
  }

  public triggerVirtualAction(action: 'attack' | 'special' | 'dash' | 'interact'): void {
    if (this.phase !== 'PLAYING' && this.phase !== 'EXPO_PARK') return;
    if (action === 'attack') this.attackBuffer = 0.16;
    else if (action === 'special') this.specialBuffer = 0.16;
    else if (action === 'dash') this.dashBuffer = 0.16;
    else if (action === 'interact') this.interactBuffer = 0.18;
  }

  public forceResize(): void {
    this.handleResize();
  }

  public setPhase(nextPhase: GamePhase): void {
    this.phase = nextPhase;
    if (nextPhase === 'DIALOGUE' || nextPhase === 'PAUSED' || nextPhase === 'TITLE') {
      this.heldKeys.clear();
      this.virtualMoveX = 0;
      this.virtualMoveY = 0;
    }
    if (nextPhase === 'TITLE' && this.arcadeActive) {
      gameAudio.setMusicMode('title');
    }
    this.emitHud();
  }

  public startNewRun(): void {
    gameAudio.init();
    this.profile = {
      primaryNeed: 'learning',
      tasksRescued: 0,
      totalTasks: 4,
      enemiesDefeated: 0,
      npuUses: 0,
      xessUses: 0,
      dashesUsed: 0,
      batteryRemaining: 90,
      hpRemaining: 100,
      damageTaken: 0,
      elapsedSeconds: 0,
    };
    this.bossGateOpen = false;
    this.trapCompleted = false;
    this.bossTriggered = false;
    this.taggedPcIds.clear();
    this.inspectedPcIds.clear();

    this.buildSiliconCityMap(false);
    this.player.wx = 6.5;
    this.player.wy = 30.2;
    this.player.heroForm = 'pawn';
    this.player.hp = 100;
    this.player.battery = 90;
    this.player.npuCharge = 0;
    this.player.goldCount = 0;
    this.player.woodCount = 0;
    this.player.hasNpuPulse = false;
    this.player.hasXessSurge = false;
    this.player.xessBuffTimer = 0;
    this.weatherMix = {
      TRAP_ALLEY: 1,
      ECORE_PARK: 0,
      COPPER_PLAZA: 0,
      NPU_LIBRARY: 0,
      ARC_ARENA: 0,
      BOSS_COLOSSEUM: 0,
      EXPO_PARK: 0,
    };

    this.centerCameraInstant();
    this.phase = 'DIALOGUE';
    gameAudio.setMusicMode('trap');
    this.objectiveText = 'Push north to the Deadline Gate before battery dies';
    this.showBanner('ACT I · 1:47 AM STUDY COVE', 2.8);
    this.callbacks.onStartDialogue('trap_intro');
    this.emitHud();
  }

  public triggerPcDemoEffect(pc: CatalogPcCharacter): void {
    this.inspectedPcIds.add(pc.id);
    if (pc.demoType === 'xess_fps') {
      this.player.xessBuffTimer = 4.0;
      gameAudio.playXessSurge();
    } else if (pc.demoType === 'offline_ai' || pc.demoType === 'creator_gen') {
      gameAudio.playNpuPulse();
    } else {
      gameAudio.playUnlock();
    }
    this.spawnSpriteFx('healEffect', pc.wx, pc.wy, 130, 0.72);
    this.spawnSpriteFx('explosion1', pc.wx, pc.wy - 0.3, 120, 0.52);
    this.spawnBurstWorld(pc.wx, pc.wy, pc.accentColor, 20);
    this.spawnFloatingText(pc.wx, pc.wy - 0.9, pc.demoBurstLabel, pc.accentColor);
    this.emitHud();
  }

  public toggleTagPc(pcId: string): void {
    if (this.taggedPcIds.has(pcId)) {
      this.taggedPcIds.delete(pcId);
    } else {
      this.taggedPcIds.add(pcId);
      gameAudio.playPickup();
      this.spawnSpriteFx('healEffect', this.player.wx, this.player.wy, 96, 0.55);
    }
    this.emitHud();
  }

  public applyDialogueEffect(effect?: DialogueChoice['effect']): void {
    if (!effect) return;
    if (effect.setNeed) {
      this.profile.primaryNeed = effect.setNeed;
      this.showBanner(`ROUTE TUNED: ${effect.setNeed.toUpperCase()}`, 2.2);
    }
    if (effect.unlockNpuPulse) {
      this.player.hasNpuPulse = true;
      this.player.npuCharge = 100;
      gameAudio.playUnlock();
      this.spawnSpriteFx('healEffect', this.player.wx, this.player.wy, 150, 0.75);
      this.spawnBurstWorld(this.player.wx, this.player.wy, '#00C7FD', 22);
      this.spawnFloatingText(this.player.wx, this.player.wy - 0.6, 'NPU PULSE UNLOCKED [P]', '#00C7FD');
      if (this.player.hasXessSurge) {
        this.openBossGate();
        this.objectiveText = 'North Black Colosseum OPEN! Defeat the Lag Titan';
        this.showBanner('ALL CORES SYNCED · COLOSSEUM BRIDGE OPEN!', 3.0);
      } else {
        this.objectiveText = 'East Island: Visit Yellow Arc XeSS Archery [E]';
        this.showBanner('UNLOCKED [P] NPU HEAL PULSE', 2.6);
      }
    }
    if (effect.unlockXessSurge) {
      this.player.hasXessSurge = true;
      this.player.npuCharge = 100;
      gameAudio.playUnlock();
      this.spawnSpriteFx('explosion2', this.player.wx, this.player.wy, 140, 0.58);
      this.spawnBurstWorld(this.player.wx, this.player.wy, '#22D3EE', 22);
      this.spawnFloatingText(this.player.wx, this.player.wy - 0.6, 'XeSS SURGE UNLOCKED [P]', '#22D3EE');
      if (this.player.hasNpuPulse) {
        this.openBossGate();
        this.objectiveText = 'North Black Colosseum OPEN! Defeat the Lag Titan';
        this.showBanner('ALL CORES SYNCED · COLOSSEUM BRIDGE OPEN!', 3.0);
      } else {
        this.objectiveText = 'West Island: Visit NPU Study Monastery [E]';
        this.showBanner('UNLOCKED: XeSS FRAME SURGE', 2.6);
      }
    }
    if (effect.restoreBattery) {
      this.player.battery = Math.min(100, this.player.battery + effect.restoreBattery);
    }
    if (effect.restoreHp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + effect.restoreHp);
    }
    if (effect.questLabel) {
      this.objectiveText = effect.questLabel;
    }
    if (effect.startBossFight) {
      this.boss.active = true;
      this.boss.state = 'IDLE';
      this.boss.stateTimer = 0.85;
      this.boss.towerTimer = 2.6;
      gameAudio.setMusicMode('boss');
      this.spawnSpriteFx('explosion2', this.boss.wx, this.boss.wy, 180, 0.7);
      this.showBanner('BOSS BATTLE · BLACK WARLORD LAG TITAN', 3.0);
    }

    if (this.zone === 'SILICON_CITY' && !this.trapCompleted && effect.restoreBattery === 100) {
      this.trapCompleted = true;
      this.player.heroForm = 'warrior';
      this.player.wx = 18.0;
      this.player.wy = 28.0;
      this.spawnSpriteFx('healEffect', this.player.wx, this.player.wy, 160, 0.8);
      this.spawnSpriteFx('explosion2', this.player.wx, this.player.wy, 130, 0.55);
      this.spawnSpriteFx('waterSplash', 14.5, 28.0, 110, 0.55);
      this.spawnFloatingText(this.player.wx, this.player.wy - 0.8, 'AWAKENED: BLUE KNIGHT!', '#38BDF8');
      gameAudio.playUnlock();
      gameAudio.setMusicMode('city');
      this.showBanner('ACT II · HARBOR OF QUIET HOURS', 2.9);
    }

    this.emitHud();
  }

  private openBossGate(): void {
    this.bossGateOpen = true;
    this.spawnSpriteFx('explosion2', 23.5, 11.2, 160, 0.65);
  }

  private bindEvents(): void {
    this.handleResize();
    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.canvas.parentElement);
    }
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('click', this.handleCanvasClick);
  }

  private computeFitScale(): number {
    if (this.viewW < 640 && this.viewH >= this.viewW * 0.95) {
      return Math.min(0.72, Math.max(0.46, Math.min(this.viewW / 690, this.viewH / 600)));
    }
    return Math.min(1, Math.max(0.68, Math.min(this.viewW / 1040, this.viewH / 580)));
  }

  private handleCanvasClick = (e: MouseEvent): void => {
    if (this.phase !== 'PLAYING' && this.phase !== 'EXPO_PARK') return;
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const vw = rect.width || this.viewW;
    const vh = rect.height || this.viewH;
    const wx = ((sx - vw / 2) / this.camZoom + this.camX) / TILE_SIZE;
    const wy = ((sy - vh / 2) / this.camZoom + this.camY) / TILE_SIZE;

    // 1. Direct tap-to-inspect Intel hardware props anywhere on screen
    for (const ip of this.intelProps) {
      const isStall = ip.kind === 'booth' || ip.kind.startsWith('stall');
      const hitW = isStall ? 1.55 : 0.95;
      const hitH = isStall ? 1.45 : 1.05;
      if (Math.abs(wx - ip.wx) <= hitW && wy >= ip.wy - hitH && wy <= ip.wy + 0.55) {
        this.heldKeys.clear();
        this.phase = 'DIALOGUE';
        gameAudio.playPickup();
        this.callbacks.onInspectHardware(ip.hardwareKey);
        return;
      }
    }

    // 2. Direct tap on Festival Courtyard demo PCs (when in EXPO_PARK)
    if (this.zone === 'EXPO_PARK') {
      for (const pc of EXPO_PC_CATALOG) {
        if (Math.hypot(wx - pc.wx, wy - (pc.wy - 0.35)) <= 1.25) {
          const dist = Math.hypot(pc.wx - this.player.wx, pc.wy - this.player.wy);
          if (dist <= 3.4) {
            this.heldKeys.clear();
            this.targetZoom = 1.16;
            this.phase = 'DIALOGUE';
            this.triggerPcDemoEffect(pc);
            this.callbacks.onInteractExpoPc(pc);
          } else {
            this.spawnFloatingText(pc.wx, pc.wy - 0.85, 'Walk closer to try PC!', '#38BDF8');
          }
          return;
        }
      }
    }

    // 3. Direct tap on story NPCs
    for (const npc of this.npcs) {
      if (Math.hypot(wx - npc.wx, wy - (npc.wy - 0.3)) <= 1.2) {
        const dist = Math.hypot(npc.wx - this.player.wx, npc.wy - this.player.wy);
        if (dist <= 3.4) {
          this.heldKeys.clear();
          npc.interacted = true;
          this.targetZoom = 1.15;
          this.phase = 'DIALOGUE';
          this.callbacks.onStartDialogue(npc.dialogueId);
        } else {
          this.spawnFloatingText(npc.wx, npc.wy - 0.85, 'Walk closer to talk!', '#FDE68A');
        }
        return;
      }
    }

    // 4. Direct tap on unrescued task nodes
    for (const task of this.tasks) {
      if (!task.rescued && Math.hypot(wx - task.wx, wy - (task.wy - 0.2)) <= 1.2) {
        const dist = Math.hypot(task.wx - this.player.wx, task.wy - this.player.wy);
        if (dist <= 3.2) {
          this.rescueTask(task);
        } else {
          this.spawnFloatingText(task.wx, task.wy - 0.85, 'Walk closer to rescue!', '#34D399');
        }
        return;
      }
    }
  };

  private handleResize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = this.canvas.parentElement;
    const w = Math.max(280, parent?.clientWidth || window.innerWidth);
    const h = Math.max(220, parent?.clientHeight || window.innerHeight);
    this.viewW = w;
    this.viewH = h;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private handleBlur = (): void => {
    this.heldKeys.clear();
    this.virtualMoveX = 0;
    this.virtualMoveY = 0;
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.arcadeActive) return;
    const code = e.code;
    if (code === 'KeyM') {
      this.callbacks.onToggleMute();
      return;
    }

    if (this.phase === 'EXPO_PARK' && code === 'KeyC') {
      e.preventDefault();
      this.callbacks.onOpenStoreModal();
      return;
    }

    if (this.phase === 'PLAYING' || this.phase === 'EXPO_PARK' || this.phase === 'PAUSED') {
      if (code === 'Escape') {
        e.preventDefault();
        this.callbacks.onTogglePause();
        return;
      }
    }

    if (this.phase !== 'PLAYING' && this.phase !== 'EXPO_PARK') return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
      e.preventDefault();
    }

    this.heldKeys.add(code);

    if (!e.repeat) {
      if (code === 'KeyO' || code === 'KeyZ') {
        this.attackBuffer = 0.14;
      } else if (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') {
        this.dashBuffer = 0.14;
      } else if (code === 'KeyP' || code === 'KeyX') {
        this.specialBuffer = 0.14;
      } else if (code === 'KeyE' || code === 'Enter') {
        this.interactBuffer = 0.16;
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.heldKeys.delete(e.code);
  };

  // --- ISLAND WORLD BUILDERS ---

  private buildSiliconCityMap(attractMode: boolean): void {
    this.zone = 'SILICON_CITY';
    this.mapW = 46;
    this.mapH = 35;
    // Compact, rich 46x35 island archipelago surrounded by ocean water
    const m: GroundKind[][] = Array.from({ length: 35 }, () => Array<GroundKind>(46).fill(0));

    const fillRect = (x0: number, y0: number, x1: number, y1: number, kind: GroundKind) => {
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          if (y >= 0 && y < 35 && x >= 0 && x < 46) m[y][x] = kind;
        }
      }
    };

    // Island 1: 1:47 AM Study Cove (SW) + paved exit lane
    fillRect(2, 23, 13, 32, 1);
    fillRect(7, 27, 13, 29, 3);
    // Island 2: Harbor of Quiet Hours (SE) + paved avenues
    fillRect(16, 23, 33, 32, 2);
    fillRect(16, 27, 26, 29, 3);
    fillRect(22, 20, 25, 31, 3); // Avenue & bridge north to Copper Plaza
    // Bridge: Study Cove -> E-Core Harbor
    fillRect(13, 27, 16, 29, 3);
    // Island 3: Copper Bus Plaza (Center)
    fillRect(16, 12, 31, 20, 3);
    // Island 4: Library of Unspoken Notes (NW) + courtyard avenue
    fillRect(2, 11, 13, 21, 4);
    fillRect(6, 15, 16, 17, 3); // West bridge & paved lane
    fillRect(6, 14, 10, 16, 3); // Monastery courtyard
    // Island 5: Dawn Horizon Arena (NE) + range avenue
    fillRect(34, 11, 44, 21, 5);
    fillRect(31, 15, 40, 17, 3); // East bridge & paved lane
    fillRect(37, 14, 40, 16, 3); // Archery plaza
    // Island 6: The Burnout Citadel (North) + central causeway
    fillRect(16, 2, 31, 10, 6);
    fillRect(22, 6, 25, 12, 3); // North bridge & causeway

    this.map = m;

    // All 5 Tiny Swords factions & building classes anchored tightly into each district
    this.buildings = [
      { id: 'b_trap', name: 'GlitterBook RGB Shop', subtitle: '₹39,999 Bargain Trap', faction: 'Red', kind: 'barracks', tx: 3, ty: 24, tw: 4, th: 3, accent: '#EF4444' },
      { id: 'b_trap_h', name: 'Red Sentry House', subtitle: 'Budget Bloatware', faction: 'Red', kind: 'house1', tx: 10, ty: 24, tw: 3, th: 2, accent: '#EF4444' },
      { id: 'b_ecore_h', name: 'Low-Power Cottage', subtitle: '20H Battery Hub', faction: 'Blue', kind: 'house2', tx: 17, ty: 24, tw: 3, th: 2, accent: '#10B981' },
      { id: 'b_ecore', name: 'E-Core Blue Castle', subtitle: 'Hybrid Power Keep', faction: 'Blue', kind: 'castle', tx: 27, ty: 24, tw: 5, th: 3, accent: '#00C7FD' },
      { id: 'b_library', name: 'Offline Study Monastery', subtitle: '300+ Local AI Apps', faction: 'Purple', kind: 'monastery', tx: 3, ty: 12, tw: 4, th: 3, accent: '#A855F7' },
      { id: 'b_npu_dome', name: 'NPU Blue Sanctuary', subtitle: 'Intel AI Boost Core', faction: 'Blue', kind: 'monastery', tx: 9, ty: 12, tw: 4, th: 3, accent: '#00C7FD' },
      { id: 'b_arc_arcade', name: 'Arc XeSS Archery', subtitle: '120 FPS AI Upscaling', faction: 'Yellow', kind: 'archery', tx: 36, ty: 12, tw: 4, th: 3, accent: '#F59E0B' },
      { id: 'b_arc_tower', name: 'XeSS Watchtower', subtitle: 'XMX Frame Engine', faction: 'Yellow', kind: 'tower', tx: 41, ty: 12, tw: 2, th: 3, accent: '#F59E0B' },
      { id: 'b_boss_tl', name: 'West Throttle Tower', subtitle: 'Thermal Barrier', faction: 'Black', kind: 'tower', tx: 17, ty: 3, tw: 2, th: 3, accent: '#EF4444' },
      { id: 'b_boss_castle', name: 'Obsidian Lag Citadel', subtitle: 'Overclocked Boss Keep', faction: 'Black', kind: 'castle', tx: 21, ty: 2, tw: 6, th: 3, accent: '#94A3B8' },
      { id: 'b_boss_tr', name: 'East Throttle Tower', subtitle: 'Thermal Barrier', faction: 'Black', kind: 'tower', tx: 29, ty: 3, tw: 2, th: 3, accent: '#EF4444' },
    ];

    for (const b of this.buildings) {
      for (let y = b.ty; y < b.ty + b.th; y++) {
        for (let x = b.tx; x < b.tx + b.tw; x++) {
          m[y][x] = 8;
        }
      }
    }

    // Tightly framed, purposeful island trees, hedges & gold stones
    this.props = [
      // Island 1: Study Cove
      { kind: 'tree', wx: 2.8, wy: 28.0, variant: 0 },
      { kind: 'tree', wx: 2.8, wy: 31.2, variant: 2 },
      { kind: 'tree', wx: 9.8, wy: 31.4, variant: 1 },
      { kind: 'tree', wx: 12.2, wy: 31.2, variant: 0 },
      { kind: 'bush', wx: 4.5, wy: 27.6, variant: 0 },
      { kind: 'bush', wx: 11.6, wy: 26.8, variant: 2 },

      // Island 2: Harbor of Quiet Hours
      { kind: 'tree', wx: 17.0, wy: 31.2, variant: 0 },
      { kind: 'tree', wx: 20.4, wy: 31.3, variant: 2 },
      { kind: 'tree', wx: 27.6, wy: 31.2, variant: 1 },
      { kind: 'tree', wx: 32.0, wy: 31.0, variant: 3 },
      { kind: 'tree', wx: 32.2, wy: 27.8, variant: 0 },
      { kind: 'tree', wx: 21.0, wy: 24.4, variant: 1 },
      { kind: 'tree', wx: 26.0, wy: 24.4, variant: 2 },
      { kind: 'bush', wx: 18.6, wy: 26.8, variant: 0 },
      { kind: 'bush', wx: 28.8, wy: 28.2, variant: 1 },
      { kind: 'gold_stone', wx: 19.6, wy: 30.2, variant: 1 },

      // Island 3: Copper Bus Plaza
      { kind: 'tree', wx: 17.0, wy: 13.0, variant: 1 },
      { kind: 'tree', wx: 30.0, wy: 13.0, variant: 2 },
      { kind: 'tree', wx: 17.2, wy: 19.2, variant: 0 },
      { kind: 'tree', wx: 29.8, wy: 19.2, variant: 3 },
      { kind: 'bush', wx: 19.0, wy: 13.4, variant: 1 },
      { kind: 'bush', wx: 28.0, wy: 13.4, variant: 3 },
      { kind: 'gold_stone', wx: 19.6, wy: 19.2, variant: 0 },
      { kind: 'gold_stone', wx: 27.4, wy: 19.2, variant: 2 },

      // Island 4: Library of Unspoken Notes
      { kind: 'tree', wx: 7.8, wy: 12.8, variant: 0 },
      { kind: 'tree', wx: 2.8, wy: 17.4, variant: 1 },
      { kind: 'tree', wx: 3.0, wy: 20.2, variant: 2 },
      { kind: 'tree', wx: 6.4, wy: 20.4, variant: 0 },
      { kind: 'tree', wx: 12.2, wy: 20.2, variant: 3 },
      { kind: 'bush', wx: 3.6, wy: 15.6, variant: 3 },
      { kind: 'gold_stone', wx: 9.0, wy: 19.8, variant: 4 },

      // Island 5: Dawn Horizon Arena
      { kind: 'tree', wx: 35.0, wy: 12.8, variant: 2 },
      { kind: 'tree', wx: 43.2, wy: 15.4, variant: 0 },
      { kind: 'tree', wx: 43.0, wy: 19.8, variant: 1 },
      { kind: 'tree', wx: 35.2, wy: 20.2, variant: 3 },
      { kind: 'bush', wx: 34.8, wy: 17.8, variant: 0 },
      { kind: 'gold_stone', wx: 41.4, wy: 20.0, variant: 5 },

      // Island 6: Obsidian Colosseum
      { kind: 'tree', wx: 16.8, wy: 7.4, variant: 3 },
      { kind: 'tree', wx: 17.2, wy: 9.4, variant: 2 },
      { kind: 'tree', wx: 30.2, wy: 7.4, variant: 2 },
      { kind: 'tree', wx: 29.8, wy: 9.4, variant: 3 },
    ];

    const denseFill: PropItem[] = [
      { kind: 'bush', wx: 21.4, wy: 14.0, variant: 2 },
      { kind: 'bush', wx: 25.6, wy: 14.0, variant: 0 },
    ];

    // Interactive Intel AI PC Hardware Landmarks across compact Silicon City
    this.intelProps = [
      { id: 'hw_trap', hardwareKey: 'trap_glitterbook', kind: 'trapLaptop', wx: 8.4, wy: 26.2, label: 'GLITTERBOOK · NO NPU [E]', accent: '#EF4444' },
      { id: 'hw_ecore_booth', hardwareKey: 'ecore_booth', kind: 'booth', wx: 23.5, wy: 25.2, label: 'INTEL AI PC PAVILION [E]', accent: '#00C7FD' },
      { id: 'hw_ecore_chip', hardwareKey: 'core_ultra_battery', kind: 'chip', wx: 20.5, wy: 28.0, label: 'CORE ULTRA · 20H+ [E]', accent: '#10B981' },
      { id: 'hw_plaza_hub', hardwareKey: 'core_ultra_hub', kind: 'chip', wx: 23.5, wy: 16.0, label: 'CORE ULTRA 3-ENGINE [E]', accent: '#00C7FD' },
      { id: 'hw_plaza_apps', hardwareKey: 'ai_pc_apps', kind: 'aiPc', wx: 20.4, wy: 16.0, label: 'AI PC · 300+ APPS [E]', accent: '#38BDF8' },
      { id: 'hw_plaza_xess', hardwareKey: 'ai_pc_xess', kind: 'aiPc', wx: 26.6, wy: 16.0, label: 'ARC XeSS GAMING [E]', accent: '#F59E0B' },
      { id: 'hw_npu_chip', hardwareKey: 'npu_ai_boost', kind: 'chip', wx: 5.5, wy: 15.8, label: 'INTEL AI BOOST NPU [E]', accent: '#A855F7' },
      { id: 'hw_arc_rig', hardwareKey: 'arc_xess_rig', kind: 'aiPc', wx: 40.5, wy: 15.5, label: 'XeSS 120 FPS RIG [E]', accent: '#F59E0B' },
    ];

    // Water Rocks & Rubber Ducks in surrounding channels
    this.waterDecos = [
      { kind: 'duck', wx: 14.5, wy: 25.0, variant: 0, phase: 0.4 },
      { kind: 'duck', wx: 14.5, wy: 19.2, variant: 0, phase: 1.9 },
      { kind: 'duck', wx: 32.5, wy: 19.4, variant: 0, phase: 2.7 },
      { kind: 'duck', wx: 19.5, wy: 11.2, variant: 0, phase: 0.9 },
      { kind: 'duck', wx: 9.0, wy: 22.0, variant: 0, phase: 1.4 },
      { kind: 'duck', wx: 37.0, wy: 22.4, variant: 0, phase: 2.2 },
      { kind: 'water_rock', wx: 14.5, wy: 31.2, variant: 0, phase: 0 },
      { kind: 'water_rock', wx: 14.5, wy: 12.8, variant: 1, phase: 1.2 },
      { kind: 'water_rock', wx: 32.5, wy: 12.6, variant: 2, phase: 2.1 },
      { kind: 'water_rock', wx: 27.6, wy: 11.2, variant: 3, phase: 0.7 },
      { kind: 'water_rock', wx: 5.0, wy: 22.0, variant: 1, phase: 1.5 },
      { kind: 'water_rock', wx: 40.5, wy: 22.4, variant: 2, phase: 2.8 },
    ];

    const mkSheep = (wx: number, wy: number, wps: { wx: number; wy: number }[], state: 'IDLE' | 'GRASS' | 'MOVE' = 'GRASS'): SheepEntity => ({
      wx, wy, vx: 0, vy: 0, state, timer: 1.6, pauseTimer: 0, flipCooldown: 0, flipX: false, waypoints: wps, wpIdx: 0,
    });

    this.sheep = [
      mkSheep(28.5, 29.5, [{ wx: 28.5, wy: 29.5 }, { wx: 30.2, wy: 29.8 }, { wx: 29.4, wy: 30.6 }], 'GRASS'),
      mkSheep(30.6, 30.2, [{ wx: 30.6, wy: 30.2 }, { wx: 28.4, wy: 30.4 }, { wx: 29.6, wy: 29.2 }], 'IDLE'),
      mkSheep(18.2, 29.4, [{ wx: 18.2, wy: 29.4 }, { wx: 20.6, wy: 29.6 }, { wx: 19.4, wy: 28.8 }], 'MOVE'),
      mkSheep(4.8, 18.0, [{ wx: 4.8, wy: 18.0 }, { wx: 6.2, wy: 18.4 }, { wx: 5.4, wy: 17.2 }], 'GRASS'),
      mkSheep(18.8, 14.8, [{ wx: 18.8, wy: 14.8 }, { wx: 20.2, wy: 14.8 }, { wx: 19.5, wy: 15.4 }], 'GRASS'),
      mkSheep(28.0, 14.8, [{ wx: 28.0, wy: 14.8 }, { wx: 26.8, wy: 14.8 }, { wx: 27.4, wy: 15.4 }], 'MOVE'),
      mkSheep(38.6, 18.4, [{ wx: 38.6, wy: 18.4 }, { wx: 40.0, wy: 18.4 }, { wx: 39.2, wy: 19.4 }], 'GRASS'),
    ];

    const mkVillager = (
      id: number,
      faction: FactionColor,
      role: EcosystemVillager['role'],
      wx: number,
      wy: number,
      wps: { wx: number; wy: number }[],
      state: EcosystemVillager['state'] = 'MOVE'
    ): EcosystemVillager => ({
      id, faction, role, wx, wy, vx: 0, vy: 0, state, timer: 1.5, pauseTimer: 0, flipCooldown: 0, flipX: false, waypoints: wps, wpIdx: 0,
    });

    this.villagers = [
      mkVillager(1, 'Red', 'pawn', 5.4, 28.2, [{ wx: 5.4, wy: 28.2 }, { wx: 8.8, wy: 28.2 }, { wx: 8.8, wy: 29.8 }, { wx: 5.4, wy: 29.8 }], 'ACTION'),
      mkVillager(2, 'Red', 'pawn_gold', 11.4, 27.2, [{ wx: 11.4, wy: 27.2 }, { wx: 9.2, wy: 27.2 }, { wx: 11.4, wy: 29.0 }], 'MOVE'),
      mkVillager(3, 'Blue', 'pawn_gold', 18.4, 29.4, [{ wx: 18.4, wy: 29.4 }, { wx: 25.8, wy: 28.4 }, { wx: 25.8, wy: 27.2 }, { wx: 21.0, wy: 27.8 }], 'MOVE'),
      mkVillager(4, 'Blue', 'pawn', 27.5, 27.6, [{ wx: 27.5, wy: 27.6 }, { wx: 30.5, wy: 27.6 }, { wx: 29.0, wy: 29.0 }], 'ACTION'),
      mkVillager(5, 'Blue', 'monk', 17.8, 26.4, [{ wx: 17.8, wy: 26.4 }, { wx: 20.6, wy: 26.4 }], 'ACTION'),
      mkVillager(6, 'Blue', 'pawn_gold', 22.8, 28.4, [{ wx: 22.8, wy: 28.4 }, { wx: 25.2, wy: 28.4 }, { wx: 24.0, wy: 30.2 }], 'MOVE'),
      mkVillager(7, 'Blue', 'pawn', 19.6, 17.2, [{ wx: 19.6, wy: 17.2 }, { wx: 27.4, wy: 17.2 }, { wx: 27.4, wy: 14.8 }, { wx: 19.6, wy: 14.8 }], 'MOVE'),
      mkVillager(8, 'Yellow', 'lancer', 26.4, 14.8, [{ wx: 26.4, wy: 14.8 }, { wx: 20.8, wy: 14.8 }], 'IDLE'),
      mkVillager(9, 'Purple', 'monk', 4.6, 15.2, [{ wx: 4.6, wy: 15.2 }, { wx: 7.2, wy: 15.2 }], 'ACTION'),
      mkVillager(10, 'Purple', 'monk', 11.2, 15.6, [{ wx: 11.2, wy: 15.6 }, { wx: 11.2, wy: 17.8 }], 'ACTION'),
      mkVillager(11, 'Purple', 'pawn_gold', 8.6, 18.8, [{ wx: 8.6, wy: 18.8 }, { wx: 4.8, wy: 15.8 }, { wx: 8.0, wy: 17.2 }], 'MOVE'),
      mkVillager(12, 'Yellow', 'archer', 36.2, 15.6, [{ wx: 36.2, wy: 15.6 }, { wx: 42.0, wy: 15.6 }], 'MOVE'),
      mkVillager(13, 'Yellow', 'archer', 42.0, 18.2, [{ wx: 42.0, wy: 18.2 }, { wx: 36.4, wy: 18.2 }], 'IDLE'),
      mkVillager(14, 'Yellow', 'pawn_gold', 37.4, 19.4, [{ wx: 37.4, wy: 19.4 }, { wx: 39.8, wy: 15.6 }], 'MOVE'),
    ];

    this.signposts = [
      { wx: 17.8, wy: 16.0, label: '← LIBRARY OF UNSPOKEN NOTES', color: '#00C7FD' },
      { wx: 29.2, wy: 16.0, label: 'DAWN HORIZON ARENA →', color: '#F59E0B' },
      { wx: 23.5, wy: 13.2, label: '▲ THE BURNOUT CITADEL', color: '#EF4444' },
    ];

    this.npcs = [
      { id: 'npc_ecore', name: 'Harbor Steward', kind: 'ecore', wx: 25.2, wy: 27.5, dialogueId: 'ecore_greeting', interacted: false },
      { id: 'npc_npu', name: 'Keeper of Quiet Notes', kind: 'npu', wx: 8.0, wy: 15.8, dialogueId: 'npu_intro', interacted: false },
      { id: 'npc_arc', name: 'Horizon Captain', kind: 'arc', wx: 38.0, wy: 15.8, dialogueId: 'arc_intro', interacted: false },
    ];

    this.tasks = [
      { id: 'task_study', label: 'Final Thesis Draft', wx: 5.0, wy: 18.5, rescued: false, variant: 0 },
      { id: 'task_privacy', label: 'Quiet Train Notes', wx: 10.8, wy: 19.2, rescued: false, variant: 1 },
      { id: 'task_xess', label: 'Friday Squad Match', wx: 36.5, wy: 19.2, rescued: false, variant: 2 },
      { id: 'task_stream', label: '4K Club Reel Cut', wx: 41.8, wy: 18.0, rescued: false, variant: 3 },
    ];

    // Progressive per-island enemy scaling (Tier 1 West -> Tier 2 Plaza -> Tier 3 East -> Tier 4 Citadel)
    this.enemies = [
      this.makeEnemy('red_pawn', 7.5, 18.5, 1),
      this.makeEnemy('red_archer', 10.5, 17.6, 1),
      this.makeEnemy('red_warrior', 20.2, 18.4, 2),
      this.makeEnemy('red_warrior', 26.8, 18.4, 2),
      this.makeEnemy('black_warrior', 35.8, 17.5, 3),
      this.makeEnemy('purple_lancer', 38.5, 19.2, 3),
      this.makeEnemy('black_archer', 41.5, 16.8, 3),
    ];

    this.pickups = [
      { id: this.nextEntityId++, kind: 'meat', wx: 19.5, wy: 26.5, bobOffset: 0 },
      { id: this.nextEntityId++, kind: 'gold', wx: 4.8, wy: 16.8, bobOffset: 1.1 },
      { id: this.nextEntityId++, kind: 'wood', wx: 23.5, wy: 18.8, bobOffset: 2.0 },
      { id: this.nextEntityId++, kind: 'gold', wx: 40.0, wy: 19.4, bobOffset: 2.7 },
    ];

    this.projectiles = [];
    this.telegraphs = [];
    this.slashes = [];
    this.spriteVfx = [];
    this.particles = [];
    this.floatingTexts = [];
    this.stormIntensity = 0;
    this.lightningTimer = 3.2;
    this.lightningFlash = 0;
    this.boss = {
      active: false,
      wx: 23.5,
      wy: 6.4,
      hp: 380,
      maxHp: 380,
      shield: 75,
      maxShield: 75,
      phase: 1,
      splitActive: false,
      state: 'IDLE',
      stateTimer: 1.2,
      hitFlash: 0,
      attackCombo: 0,
      towerTimer: 2.8,
      portalCooldown: 5.5,
      portals: [],
      twins: [],
    };
    this.bossGateOpen = attractMode;
    this.addSafeProps(denseFill);
    if (attractMode) {
      this.player.heroForm = 'warrior';
      this.player.wx = 23.5;
      this.player.wy = 17.5;
    }
  }

  private buildExpoParkMap(): void {
    this.zone = 'EXPO_PARK';
    this.mapW = 28;
    this.mapH = 22;
    const m: GroundKind[][] = Array.from({ length: 22 }, () => Array<GroundKind>(28).fill(0));

    // Compact, sunlit festival courtyard island surrounded by vibrant garden borders
    for (let y = 2; y <= 19; y++) {
      for (let x = 2; x <= 25; x++) {
        if (x >= 6 && x <= 21 && y >= 5 && y <= 17) m[y][x] = 7;
        else m[y][x] = 2;
      }
    }
    // Southern arrival avenue stone runner
    for (let y = 17; y <= 19; y++) {
      for (let x = 12; x <= 15; x++) {
        m[y][x] = 7;
      }
    }

    this.map = m;
    // 5 Clustered U-Shaped Intel Pavilions framing the central Core Ultra Wafer Plaza!
    this.buildings = [
      { id: 'ex_1', name: 'Blue Keep · Ultra 5', subtitle: 'Campus Dash', faction: 'Blue', kind: 'castle', tx: 4, ty: 3, tw: 4, th: 3, accent: '#00C7FD' },
      { id: 'ex_2', name: 'Yellow Guild · Ultra 7', subtitle: 'FlowCraft Pro', faction: 'Yellow', kind: 'monastery', tx: 12, ty: 2, tw: 4, th: 3, accent: '#F59E0B' },
      { id: 'ex_3', name: 'Red Arena · Ultra 9', subtitle: 'Apex Frame', faction: 'Red', kind: 'archery', tx: 20, ty: 3, tw: 4, th: 3, accent: '#EF4444' },
      { id: 'ex_4', name: 'Purple Abbey · Ultra 5', subtitle: 'FeatherAir', faction: 'Purple', kind: 'house1', tx: 4, ty: 12, tw: 3, th: 2, accent: '#A855F7' },
      { id: 'ex_5', name: 'Black Forge · Ultra 7', subtitle: 'Canvas Studio', faction: 'Black', kind: 'barracks', tx: 20, ty: 12, tw: 4, th: 3, accent: '#94A3B8' },
    ];
    for (const b of this.buildings) {
      for (let y = b.ty; y < b.ty + b.th; y++) {
        for (let x = b.tx; x < b.tx + b.tw; x++) {
          m[y][x] = 8;
        }
      }
    }

    // Symmetrical Festival Garden Perimeter (compact, lush, uncluttered)
    this.props = [
      { kind: 'tree', wx: 3.0, wy: 4.5, variant: 0 },
      { kind: 'tree', wx: 3.0, wy: 8.6, variant: 2 },
      { kind: 'tree', wx: 3.0, wy: 15.8, variant: 1 },
      { kind: 'tree', wx: 3.6, wy: 18.4, variant: 3 },
      { kind: 'tree', wx: 24.8, wy: 4.5, variant: 3 },
      { kind: 'tree', wx: 24.8, wy: 8.6, variant: 1 },
      { kind: 'tree', wx: 24.8, wy: 16.0, variant: 2 },
      { kind: 'tree', wx: 24.2, wy: 18.4, variant: 0 },
      { kind: 'tree', wx: 9.8, wy: 3.4, variant: 1 },
      { kind: 'tree', wx: 18.2, wy: 3.4, variant: 0 },
      { kind: 'tree', wx: 8.8, wy: 18.5, variant: 0 },
      { kind: 'tree', wx: 19.2, wy: 18.5, variant: 2 },
      { kind: 'bush', wx: 5.4, wy: 17.6, variant: 0 },
      { kind: 'bush', wx: 22.6, wy: 17.6, variant: 2 },
      { kind: 'bush', wx: 10.6, wy: 6.2, variant: 1 },
      { kind: 'bush', wx: 17.4, wy: 6.2, variant: 3 },
      { kind: 'gold_stone', wx: 10.6, wy: 16.6, variant: 1 },
      { kind: 'gold_stone', wx: 17.4, wy: 16.6, variant: 3 },
    ];

    this.intelProps = [
      { id: 'ex_hub', hardwareKey: 'core_ultra_hub', kind: 'chip', wx: 14.0, wy: 9.3, label: 'CORE ULTRA WAFER STAGE [E]', accent: '#00C7FD' },
      { id: 'ex_st_a', hardwareKey: 'expo_station_a', kind: 'stallStudent', wx: 9.4, wy: 8.3, label: 'STATION A · STUDENT ULTRA 5 [E]', accent: '#00C7FD' },
      { id: 'ex_st_c', hardwareKey: 'expo_station_c', kind: 'stallCreator', wx: 18.6, wy: 8.3, label: 'STATION C · CREATOR ULTRA 7 [E]', accent: '#F59E0B' },
      { id: 'ex_st_b', hardwareKey: 'expo_station_b', kind: 'stallGaming', wx: 22.0, wy: 10.7, label: 'STATION B · GAMING ULTRA 9 [E]', accent: '#EF4444' },
      { id: 'ex_ai_apps', hardwareKey: 'ai_pc_apps', kind: 'aiPc', wx: 6.0, wy: 10.7, label: 'FEATHERAIR · 300+ APPS [E]', accent: '#A855F7' },
      { id: 'ex_ai_xess', hardwareKey: 'ai_pc_xess', kind: 'aiPc', wx: 14.0, wy: 15.2, label: 'CANVAS STUDIO · ARC [E]', accent: '#94A3B8' },
    ];

    this.waterDecos = [
      { kind: 'duck', wx: 14.0, wy: 0.9, variant: 0, phase: 0.3 },
      { kind: 'duck', wx: 0.9, wy: 11.0, variant: 0, phase: 1.4 },
      { kind: 'duck', wx: 26.8, wy: 11.4, variant: 0, phase: 2.6 },
      { kind: 'duck', wx: 8.5, wy: 20.6, variant: 0, phase: 0.9 },
      { kind: 'water_rock', wx: 6.2, wy: 20.6, variant: 0, phase: 0 },
      { kind: 'water_rock', wx: 21.8, wy: 20.6, variant: 2, phase: 1.1 },
    ];

    const mkSheep = (wx: number, wy: number, wps: { wx: number; wy: number }[], state: 'IDLE' | 'GRASS' | 'MOVE' = 'GRASS'): SheepEntity => ({
      wx, wy, vx: 0, vy: 0, state, timer: 1.6, pauseTimer: 0, flipCooldown: 0, flipX: false, waypoints: wps, wpIdx: 0,
    });
    const mkVillager = (
      id: number,
      faction: FactionColor,
      role: EcosystemVillager['role'],
      wx: number,
      wy: number,
      wps: { wx: number; wy: number }[],
      state: EcosystemVillager['state'] = 'MOVE'
    ): EcosystemVillager => ({
      id, faction, role, wx, wy, vx: 0, vy: 0, state, timer: 1.5, pauseTimer: 0, flipCooldown: 0, flipX: false, waypoints: wps, wpIdx: 0,
    });

    this.sheep = [
      mkSheep(4.8, 16.4, [{ wx: 4.8, wy: 16.4 }, { wx: 5.8, wy: 16.8 }], 'GRASS'),
      mkSheep(23.2, 16.4, [{ wx: 23.2, wy: 16.4 }, { wx: 22.2, wy: 16.8 }], 'IDLE'),
    ];

    this.villagers = [
      mkVillager(21, 'Blue', 'pawn_gold', 10.6, 11.4, [{ wx: 10.6, wy: 11.4 }, { wx: 11.8, wy: 13.4 }], 'MOVE'),
      mkVillager(22, 'Yellow', 'monk', 17.4, 11.4, [{ wx: 17.4, wy: 11.4 }, { wx: 16.2, wy: 13.4 }], 'ACTION'),
      mkVillager(23, 'Purple', 'pawn', 9.2, 15.6, [{ wx: 9.2, wy: 15.6 }, { wx: 11.4, wy: 15.6 }], 'MOVE'),
      mkVillager(24, 'Red', 'archer', 18.8, 15.6, [{ wx: 18.8, wy: 15.6 }, { wx: 16.6, wy: 15.6 }], 'IDLE'),
      mkVillager(25, 'Blue', 'monk', 14.0, 12.6, [{ wx: 14.0, wy: 12.6 }, { wx: 12.4, wy: 12.6 }, { wx: 15.6, wy: 12.6 }], 'MOVE'),
    ];

    this.signposts = [
      { wx: 14.0, wy: 18.3, label: 'INTEL AI PC COURTYARD · [E] MEET CHAMPIONS · [C] STORE GUIDE', color: '#38BDF8' },
    ];
    this.npcs = [];
    this.tasks = [];
    this.enemies = [];
    this.pickups = [];
    this.projectiles = [];
    this.telegraphs = [];
    this.slashes = [];
    this.spriteVfx = [];

    this.player.heroForm = 'warrior';
    this.player.wx = 14.0;
    this.player.wy = 17.2;
    this.player.hp = 100;
    this.player.battery = 100;
    this.matchedPcId = getMatchedExpoPcId(this.profile);
    this.centerCameraInstant();
  }

  private addSafeProps(candidates: PropItem[]): void {
    const blockedZones: { wx: number; wy: number; r: number }[] = [
      { wx: 6.5, wy: 30.2, r: 1.7 },
      { wx: 18.0, wy: 28.0, r: 1.7 },
      { wx: 14.5, wy: 16.0, r: 1.7 },
      { wx: 23.5, wy: 17.5, r: 1.7 },
    ];
    for (const n of this.npcs) blockedZones.push({ wx: n.wx, wy: n.wy, r: 1.6 });
    for (const t of this.tasks) blockedZones.push({ wx: t.wx, wy: t.wy, r: 1.5 });
    for (const e of this.enemies) blockedZones.push({ wx: e.wx, wy: e.wy, r: 1.4 });
    for (const pk of this.pickups) blockedZones.push({ wx: pk.wx, wy: pk.wy, r: 1.1 });
    for (const sp of this.signposts) blockedZones.push({ wx: sp.wx, wy: sp.wy, r: 1.2 });
    for (const ip of this.intelProps) {
      const isStall = ip.kind === 'booth' || ip.kind.startsWith('stall');
      blockedZones.push({ wx: ip.wx, wy: ip.wy, r: isStall ? 1.8 : 1.25 });
    }
    if (this.zone === 'EXPO_PARK') {
      for (const pc of EXPO_PC_CATALOG) blockedZones.push({ wx: pc.wx, wy: pc.wy, r: 2.1 });
    }

    for (const p of candidates) {
      const tx = Math.floor(p.wx);
      const ty = Math.floor(p.wy);
      if (tx < 1 || ty < 1 || tx >= this.mapW - 1 || ty >= this.mapH - 1) continue;
      const g = this.map[ty][tx];
      if (g === 0 || g === 8 || g === 9) continue;
      // Avoid crowding building edges
      if (
        this.map[ty - 1]?.[tx] === 8 ||
        this.map[ty + 1]?.[tx] === 8 ||
        this.map[ty]?.[tx - 1] === 8 ||
        this.map[ty]?.[tx + 1] === 8
      ) {
        continue;
      }
      // Keep bridges clear
      if (
        this.zone === 'SILICON_CITY' &&
        ((tx >= 12 && tx <= 17 && ty >= 26 && ty <= 30) ||
          (tx >= 12 && tx <= 17 && ty >= 14 && ty <= 18) ||
          (tx >= 30 && tx <= 35 && ty >= 14 && ty <= 18) ||
          (tx >= 21 && tx <= 26 && ty >= 9 && ty <= 13) ||
          (tx >= 21 && tx <= 26 && ty >= 19 && ty <= 24))
      ) {
        continue;
      }
      let clear = true;
      for (const bz of blockedZones) {
        if (Math.hypot(p.wx - bz.wx, p.wy - bz.wy) < bz.r) {
          clear = false;
          break;
        }
      }
      if (!clear) continue;
      for (const ex of this.props) {
        if (Math.hypot(p.wx - ex.wx, p.wy - ex.wy) < 1.15) {
          clear = false;
          break;
        }
      }
      if (clear) this.props.push(p);
    }
  }

  private makeEnemy(
    unitClass: EnemyClass,
    wx: number,
    wy: number,
    islandTier: 1 | 2 | 3 | 4 = 1
  ): EnemyEntity {
    const faction: FactionColor =
      unitClass.startsWith('red')
        ? 'Red'
        : unitClass.startsWith('purple')
          ? 'Purple'
          : 'Black';
    const baseHp =
      unitClass === 'black_warrior' || unitClass === 'purple_lancer'
        ? 54
        : unitClass === 'spectral_knight'
          ? 44
          : unitClass === 'red_warrior'
            ? 44
            : unitClass.includes('archer')
              ? 40
              : 34;
    const hpMultByTier: Record<1 | 2 | 3 | 4, number> = {
      1: 1.0,
      2: 1.32,
      3: 1.68,
      4: unitClass === 'spectral_knight' ? 1.25 : 1.95,
    };
    const dmgByTier: Record<1 | 2 | 3 | 4, number> = {
      1: 10,
      2: 13,
      3: 16,
      4: 18,
    };
    const spdByTier: Record<1 | 2 | 3 | 4, number> = {
      1: 1.0,
      2: 1.08,
      3: 1.18,
      4: 1.24,
    };
    const maxHp = Math.round(baseHp * hpMultByTier[islandTier]);
    const isSpectral = unitClass === 'spectral_knight';
    return {
      id: this.nextEntityId++,
      unitClass,
      faction,
      islandTier,
      damage: dmgByTier[islandTier],
      speedMult: spdByTier[islandTier],
      isSpectral,
      riseElapsed: isSpectral ? 0 : undefined,
      riseDuration: isSpectral ? 0.72 : undefined,
      wx,
      wy,
      vx: 0,
      vy: 0,
      hp: maxHp,
      maxHp,
      state: 'PATROL',
      stateTimer: isSpectral ? 0.85 : 0.7 + Math.random(),
      hitFlash: 0,
      shootTimer: 1.4 + Math.random(),
      flipX: false,
    };
  }

  // --- COLLISION & DISTRICTS ---

  private isWalkable(
    wx: number,
    wy: number,
    radius = 0.3,
    opts?: { ignoreEntity?: unknown; skipCreatures?: boolean }
  ): boolean {
    const offsets = [
      [0, 0],
      [radius, 0],
      [-radius, 0],
      [0, radius],
      [0, -radius],
    ];
    for (const [ox, oy] of offsets) {
      const tx = Math.floor(wx + ox);
      const ty = Math.floor(wy + oy);
      if (tx < 0 || ty < 0 || tx >= this.mapW || ty >= this.mapH) return false;
      const t = this.map[ty][tx];
      if (t === 0 || t === 8 || t === 9) return false;
      if (
        this.zone === 'SILICON_CITY' &&
        !this.bossGateOpen &&
        ty <= 11 &&
        tx >= 21 &&
        tx <= 26
      ) {
        return false;
      }
    }

    // Collide with tree trunks, stumps, bushes/grass patches, rocks, and gold stones
    for (const p of this.props) {
      const py = p.kind === 'tree' ? p.wy - 0.08 : p.wy - 0.04;
      const propR =
        p.kind === 'tree'
          ? 0.33
          : p.kind === 'gold_stone'
            ? 0.4
            : p.kind === 'bush'
              ? 0.34
              : p.kind === 'rock'
                ? 0.34
                : 0.28;
      if (Math.hypot(wx - p.wx, wy - py) < radius + propR) {
        return false;
      }
    }

    // Collide with Intel AI PC booths, stalls, chips, and laptops
    for (const ip of this.intelProps) {
      if (ip.kind === 'booth' || ip.kind.startsWith('stall')) {
        if (Math.abs(wx - ip.wx) < 0.88 + radius && Math.abs(wy - (ip.wy - 0.15)) < 0.52 + radius) {
          return false;
        }
      } else if (Math.hypot(wx - ip.wx, wy - ip.wy) < radius + 0.38) {
        return false;
      }
    }

    if (!opts?.skipCreatures) {
      const ignore = opts?.ignoreEntity;
      for (const s of this.sheep) {
        if (s === ignore) continue;
        if (Math.hypot(wx - s.wx, wy - s.wy) < radius + 0.16) return false;
      }
      for (const v of this.villagers) {
        if (v === ignore) continue;
        if (Math.hypot(wx - v.wx, wy - v.wy) < radius + 0.16) return false;
      }
      for (const n of this.npcs) {
        if (n === ignore) continue;
        if (Math.hypot(wx - n.wx, wy - n.wy) < radius + 0.28) return false;
      }
      if (ignore && ignore !== this.player) {
        if (Math.hypot(wx - this.player.wx, wy - this.player.wy) < radius + 0.22) return false;
      }
    }

    return true;
  }

  private moveWithCollision(
    entity: { wx: number; wy: number },
    dx: number,
    dy: number,
    radius = 0.3,
    skipCreatures = false
  ): void {
    if (this.isWalkable(entity.wx + dx, entity.wy, radius, { ignoreEntity: entity, skipCreatures })) {
      entity.wx += dx;
    }
    if (this.isWalkable(entity.wx, entity.wy + dy, radius, { ignoreEntity: entity, skipCreatures })) {
      entity.wy += dy;
    }
  }

  private resolvePlayerCreatureSeparation(): void {
    const p = this.player;
    const pushAway = (cx: number, cy: number, minDist: number) => {
      const dx = p.wx - cx;
      const dy = p.wy - cy;
      const d = Math.hypot(dx, dy);
      if (d > 0.001 && d < minDist) {
        const push = (minDist - d) * 0.28;
        this.moveWithCollision(p, (dx / d) * push, (dy / d) * push, 0.26, true);
      }
    };
    for (const s of this.sheep) pushAway(s.wx, s.wy, 0.42);
    for (const v of this.villagers) pushAway(v.wx, v.wy, 0.42);
  }

  private getCurrentDistrict(): DistrictId {
    if (this.zone === 'EXPO_PARK') return 'EXPO_PARK';
    const { wx, wy } = this.player;
    if (wx < 15 && wy >= 22) return 'TRAP_ALLEY';
    if (wy >= 22) return 'ECORE_PARK';
    if (wx < 15.5) return 'NPU_LIBRARY';
    if (wx > 31.5) return 'ARC_ARENA';
    if (wy < 11) return 'BOSS_COLOSSEUM';
    return 'COPPER_PLAZA';
  }

  private centerCameraInstant(): void {
    this.camX = this.player.wx * TILE_SIZE;
    this.camY = this.player.wy * TILE_SIZE;
    this.lookAheadX = 0;
    this.lookAheadY = 0;
  }

  private showBanner(text: string, duration = 2.6): void {
    this.bannerText = text;
    this.bannerTimer = duration;
  }

  private spawnSpriteFx(
    kind: SpriteFxKind,
    wx: number,
    wy: number,
    sizePx: number,
    duration = 0.48,
    flipX = false
  ): void {
    this.spriteVfx.push({ kind, wx, wy, elapsed: 0, duration, sizePx, flipX });
  }

  // --- SIMULATION LOOP ---

  private update(dt: number): void {
    this.elapsed += dt;
    this.updateClouds(dt);
    this.updateSheep(dt);
    this.updateVillagers(dt);

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.bannerText = null;
    }
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    // Smooth Island-to-Island Weather Transitions (noticeable lighting + ambient particles per district)
    const curDist = this.getCurrentDistrict();
    const keys: DistrictId[] = [
      'TRAP_ALLEY',
      'ECORE_PARK',
      'COPPER_PLAZA',
      'NPU_LIBRARY',
      'ARC_ARENA',
      'BOSS_COLOSSEUM',
      'EXPO_PARK',
    ];
    for (const k of keys) {
      const target = k === curDist ? 1 : 0;
      this.weatherMix[k] += (target - this.weatherMix[k]) * Math.min(1, dt * 2.4);
    }

    const stormTarget =
      this.zone === 'SILICON_CITY' && (curDist === 'BOSS_COLOSSEUM' || this.player.wy < 11.5)
        ? 1
        : 0;
    this.stormIntensity += (stormTarget - this.stormIntensity) * Math.min(1, dt * 2.2);

    if (this.lightningFlash > 0) {
      this.lightningFlash = Math.max(0, this.lightningFlash - dt * 3.1);
    }
    if (this.stormIntensity > 0.35 && this.phase === 'PLAYING') {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = this.boss.splitActive ? 2.2 + Math.random() * 2.2 : 3.2 + Math.random() * 3.4;
        this.lightningFlash = 0.9;
        this.lightningSeed = Math.random() * 100;
      }
    }

    // Animate rain drops for Boss Storm & NPU Twilight Drizzle
    if (this.stormIntensity > 0.08 || this.weatherMix.NPU_LIBRARY > 0.08) {
      const spdScale = this.stormIntensity > 0.2 ? 1.0 : 0.42;
      for (const rd of this.rainDrops) {
        rd.x -= rd.speed * 0.24 * spdScale * dt;
        rd.y += rd.speed * spdScale * dt;
        if (rd.y > 1.05) {
          rd.y = -0.06;
          rd.x = Math.random() * 1.15;
        }
        if (rd.x < -0.08) rd.x += 1.15;
      }
    }

    // Animate district-specific motes (embers, morning pollen, fireflies, sunset wind streaks)
    for (const m of this.weatherMotes) {
      if (this.weatherMix.ARC_ARENA > 0.3) {
        m.x -= m.speed * 1.9 * dt;
        m.y += Math.sin(this.elapsed * 2.4 + m.phase) * 0.05 * dt;
      } else if (this.weatherMix.TRAP_ALLEY > 0.3) {
        m.y -= m.speed * 0.48 * dt;
        m.x += Math.sin(this.elapsed * 1.8 + m.phase) * 0.04 * dt;
      } else {
        m.x += m.speed * 0.45 * dt;
        m.y += Math.sin(this.elapsed * 1.5 + m.phase) * 0.05 * dt;
      }
      if (m.x < -0.05) m.x = 1.05;
      if (m.x > 1.05) m.x = -0.05;
      if (m.y < -0.05) m.y = 1.05;
      if (m.y > 1.05) m.y = -0.05;
    }

    if (this.phase === 'TITLE') {
      this.updateAttractMode(dt);
      return;
    }

    if (this.phase === 'EXPO_TRANSFORM') {
      this.transformTimer -= dt;
      this.updateParticles(dt);
      if (Math.random() < 0.38) {
        this.spawnSpriteFx(
          Math.random() < 0.5 ? 'healEffect' : 'explosion1',
          this.player.wx + (Math.random() - 0.5) * 9,
          this.player.wy + (Math.random() - 0.5) * 6,
          120,
          0.55
        );
      }
      if (this.transformTimer <= 0) {
        this.buildExpoParkMap();
        this.phase = 'EXPO_PARK';
        gameAudio.setMusicMode('expo');
        this.targetZoom = 1.04;
        this.callbacks.onEnterExpoPark({ ...this.profile }, this.matchedPcId);
        this.callbacks.onStartDialogue('expo_welcome');
        this.emitHud();
      }
      return;
    }

    this.camZoom += (this.targetZoom - this.camZoom) * Math.min(1, dt * 6);

    if (this.phase !== 'PLAYING' && this.phase !== 'EXPO_PARK') {
      return;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateParticles(dt * 0.25);
      return;
    }

    if (this.phase === 'PLAYING') {
      this.profile.elapsedSeconds += dt;
    }

    if (this.attackBuffer > 0) this.attackBuffer -= dt;
    if (this.dashBuffer > 0) this.dashBuffer -= dt;
    if (this.specialBuffer > 0) this.specialBuffer -= dt;
    if (this.interactBuffer > 0) this.interactBuffer -= dt;

    if (this.player.attackTimer > 0) this.player.attackTimer -= dt;
    if (this.player.attackCooldown > 0) this.player.attackCooldown -= dt;
    if (this.player.dashTimer > 0) this.player.dashTimer -= dt;
    if (this.player.dashCooldown > 0) this.player.dashCooldown -= dt;
    if (this.player.specialCooldown > 0) this.player.specialCooldown -= dt;
    if (this.player.invulnTimer > 0) this.player.invulnTimer -= dt;
    if (this.player.hitFlash > 0) this.player.hitFlash -= dt;
    if (this.player.xessBuffTimer > 0) this.player.xessBuffTimer -= dt;

    this.updatePlayerMovement(dt);
    this.updatePlayerActions();

    if (this.phase === 'PLAYING') {
      this.updateDistrictEvents(dt);
      this.updateEnemies(dt);
      if (this.boss.active) this.updateBoss(dt);
      this.updateProjectiles(dt);
      this.updateTelegraphs(dt);
      this.updatePickups();
    }

    this.updateParticles(dt);

    const pPx = this.player.wx * TILE_SIZE;
    const pPy = this.player.wy * TILE_SIZE;
    this.camX += (pPx + this.lookAheadX - this.camX) * Math.min(1, dt * 7);
    this.camY += (pPy + this.lookAheadY - this.camY) * Math.min(1, dt * 7);

    const dist = this.getCurrentDistrict();
    const fitScale = this.computeFitScale();
    const baseZoom = dist === 'BOSS_COLOSSEUM' ? 0.85 : this.zone === 'EXPO_PARK' ? 1.06 : 0.96;
    this.targetZoom = baseZoom * fitScale;

    if (dist !== this.prevDistrict) {
      this.prevDistrict = dist;
      const titles: Record<DistrictId, string> = {
        TRAP_ALLEY: 'ACT I · 1:47 AM STUDY COVE',
        ECORE_PARK: 'ACT II · HARBOR OF QUIET HOURS',
        COPPER_PLAZA: 'COPPER BUS CROSSROADS',
        NPU_LIBRARY: 'ACT III · LIBRARY OF UNSPOKEN NOTES',
        ARC_ARENA: 'ACT III · DAWN HORIZON ARENA',
        BOSS_COLOSSEUM: 'ACT IV · THE BURNOUT CITADEL',
        EXPO_PARK: 'ACT V · INTEL AI PC FESTIVAL COURTYARD',
      };
      this.showBanner(titles[dist], 2.4);
    }

    // Dynamic Story Soundtrack Routing (all 8 repository tracks)
    if (this.phase === 'EXPO_PARK') {
      gameAudio.setMusicMode('expo');
    } else if (this.phase === 'PLAYING') {
      if (this.boss.active) {
        gameAudio.setMusicMode(this.boss.phase === 3 ? 'boss_climax' : 'boss');
      } else if (!this.trapCompleted && dist === 'TRAP_ALLEY') {
        gameAudio.setMusicMode('trap');
      } else if (
        dist === 'BOSS_COLOSSEUM' ||
        (this.bossGateOpen && this.player.wy < 13.5 && Math.abs(this.player.wx - 23.5) < 4.5)
      ) {
        gameAudio.setMusicMode('dungeon');
      } else if (
        this.enemies.some(
          (e) =>
            e.state !== 'PATROL' ||
            Math.hypot(e.wx - this.player.wx, e.wy - this.player.wy) < 4.8
        )
      ) {
        gameAudio.setMusicMode('battle');
      } else {
        gameAudio.setMusicMode('city');
      }
    }

    this.profile.batteryRemaining = this.player.battery;
    this.profile.hpRemaining = this.player.hp;

    this.hudSyncTimer += dt;
    if (this.hudSyncTimer >= 0.07) {
      this.hudSyncTimer = 0;
      this.emitHud();
    }
  }

  private updateClouds(dt: number): void {
    for (const c of this.clouds) {
      c.wx += c.speed * dt;
      if (c.wx > this.mapW + 8) {
        c.wx = -8;
      }
    }
  }

  private updateSheep(dt: number): void {
    for (const s of this.sheep) {
      if (s.flipCooldown > 0) s.flipCooldown -= dt;
      if (s.pauseTimer > 0) {
        s.pauseTimer -= dt;
        s.state = 'GRASS';
        continue;
      }
      if (Math.hypot(this.player.wx - s.wx, this.player.wy - s.wy) < 0.54) {
        s.pauseTimer = 0.55;
        s.state = 'IDLE';
        continue;
      }

      s.timer -= dt;
      if (s.state === 'MOVE' && s.waypoints.length > 0) {
        const target = s.waypoints[s.wpIdx % s.waypoints.length];
        const dx = target.wx - s.wx;
        const dy = target.wy - s.wy;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.22) {
          s.wpIdx = (s.wpIdx + 1) % s.waypoints.length;
          s.state = Math.random() < 0.6 ? 'GRASS' : 'IDLE';
          s.timer = 1.6 + Math.random() * 1.4;
        } else {
          const spd = 0.85;
          const stepX = (dx / dist) * spd * dt;
          const stepY = (dy / dist) * spd * dt;
          if (Math.abs(dx) > 0.16 && s.flipCooldown <= 0) {
            s.flipX = dx < 0;
            s.flipCooldown = 0.35;
          }
          if (this.isWalkable(s.wx + stepX, s.wy + stepY, 0.16, { ignoreEntity: s, skipCreatures: true })) {
            s.wx += stepX;
            s.wy += stepY;
          } else {
            s.wpIdx = (s.wpIdx + 1) % s.waypoints.length;
            s.state = 'GRASS';
            s.timer = 1.2;
          }
        }
      } else if (s.timer <= 0) {
        s.state = 'MOVE';
        s.timer = 3.2;
      }
    }
  }

  private updateVillagers(dt: number): void {
    for (const v of this.villagers) {
      if (v.flipCooldown > 0) v.flipCooldown -= dt;
      if (v.pauseTimer > 0) {
        v.pauseTimer -= dt;
        continue;
      }

      // Yield smoothly to the player without 60Hz jitter or bounce-flipping
      const pDist = Math.hypot(this.player.wx - v.wx, this.player.wy - v.wy);
      if (pDist < 0.58) {
        v.pauseTimer = 0.45;
        v.state = 'IDLE';
        if (Math.abs(this.player.wx - v.wx) > 0.14 && v.flipCooldown <= 0) {
          v.flipX = this.player.wx < v.wx;
          v.flipCooldown = 0.45;
        }
        continue;
      }

      v.timer -= dt;
      if (v.state === 'MOVE' && v.waypoints.length > 0) {
        const target = v.waypoints[v.wpIdx % v.waypoints.length];
        const dx = target.wx - v.wx;
        const dy = target.wy - v.wy;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.24) {
          v.wpIdx = (v.wpIdx + 1) % v.waypoints.length;
          v.state = v.role === 'pawn' || v.role === 'monk' ? 'ACTION' : 'IDLE';
          v.timer = 1.4 + Math.random() * 1.2;
        } else {
          const spd = 1.05;
          const stepX = (dx / dist) * spd * dt;
          const stepY = (dy / dist) * spd * dt;
          if (Math.abs(dx) > 0.16 && v.flipCooldown <= 0) {
            v.flipX = dx < 0;
            v.flipCooldown = 0.35;
          }
          if (this.isWalkable(v.wx + stepX, v.wy + stepY, 0.16, { ignoreEntity: v, skipCreatures: true })) {
            v.wx += stepX;
            v.wy += stepY;
          } else {
            // Slide along clear axis or cycle waypoint cleanly without flip jitter
            if (this.isWalkable(v.wx + stepX, v.wy, 0.16, { ignoreEntity: v, skipCreatures: true })) {
              v.wx += stepX;
            } else if (this.isWalkable(v.wx, v.wy + stepY, 0.16, { ignoreEntity: v, skipCreatures: true })) {
              v.wy += stepY;
            } else {
              v.wpIdx = (v.wpIdx + 1) % v.waypoints.length;
              v.state = 'IDLE';
              v.timer = 1.0;
            }
          }
        }
      } else if (v.timer <= 0) {
        v.state = 'MOVE';
        v.timer = 4.5;
      }
    }
  }

  private updateAttractMode(dt: number): void {
    this.attractTimer += dt;
    const tx = 23.5 + Math.cos(this.attractTimer * 0.55) * 4.8;
    const ty = 16.0 + Math.sin(this.attractTimer * 0.75) * 2.8;
    const dx = tx - this.player.wx;
    const dy = ty - this.player.wy;
    const len = Math.hypot(dx, dy);
    if (len > 0.1) {
      this.moveWithCollision(this.player, (dx / len) * 3.0 * dt, (dy / len) * 3.0 * dt);
      if (Math.abs(dx) > 0.05) this.player.flipX = dx < 0;
      this.player.moving = true;
      this.player.walkAnim += dt * 7.5;
    }
    this.camX += (this.player.wx * TILE_SIZE - this.camX) * Math.min(1, dt * 4);
    this.camY += (this.player.wy * TILE_SIZE - this.camY) * Math.min(1, dt * 4);
    const fitScale = this.computeFitScale();
    this.targetZoom = 0.92 * fitScale;
    this.camZoom += (this.targetZoom - this.camZoom) * Math.min(1, dt * 4);
    this.updateParticles(dt);
  }

  private updatePlayerMovement(dt: number): void {
    let ix = this.virtualMoveX;
    let iy = this.virtualMoveY;
    if (this.heldKeys.has('KeyW') || this.heldKeys.has('ArrowUp')) iy -= 1;
    if (this.heldKeys.has('KeyS') || this.heldKeys.has('ArrowDown')) iy += 1;
    if (this.heldKeys.has('KeyA') || this.heldKeys.has('ArrowLeft')) ix -= 1;
    if (this.heldKeys.has('KeyD') || this.heldKeys.has('ArrowRight')) ix += 1;

    const mag = Math.hypot(ix, iy);
    this.player.moving = mag > 0;
    if (mag > 0) {
      ix /= mag;
      iy /= mag;
      this.player.facingAngle = Math.atan2(iy, ix);
      if (Math.abs(ix) > 0.1) this.player.flipX = ix < 0;
      this.lookAheadX += (ix * 68 - this.lookAheadX) * Math.min(1, dt * 4.5);
      this.lookAheadY += (iy * 48 - this.lookAheadY) * Math.min(1, dt * 4.5);
    } else {
      this.lookAheadX += (0 - this.lookAheadX) * Math.min(1, dt * 3);
      this.lookAheadY += (0 - this.lookAheadY) * Math.min(1, dt * 3);
    }

    const inTrap = this.getCurrentDistrict() === 'TRAP_ALLEY' && !this.trapCompleted;
    const speed = inTrap ? 2.8 : this.player.xessBuffTimer > 0 ? 6.8 : 5.2;

    if (this.player.dashTimer > 0) {
      const dashSpd = 12.2;
      this.moveWithCollision(
        this.player,
        Math.cos(this.player.facingAngle) * dashSpd * dt,
        Math.sin(this.player.facingAngle) * dashSpd * dt
      );
      if (Math.random() < 0.7) {
        this.dashGhosts.push({
          wx: this.player.wx,
          wy: this.player.wy,
          alpha: 0.6,
          flipX: this.player.flipX,
        });
      }
    } else if (mag > 0) {
      this.moveWithCollision(this.player, ix * speed * dt, iy * speed * dt);
      this.player.walkAnim += dt * (this.player.xessBuffTimer > 0 ? 12 : 8.5);
      this.dustStepTimer += dt;
      if (this.dustStepTimer > 0.32) {
        this.dustStepTimer = 0;
        this.spawnSpriteFx('dust1', this.player.wx, this.player.wy + 0.1, 44, 0.36, this.player.flipX);
      }
    }

    for (let i = this.dashGhosts.length - 1; i >= 0; i--) {
      this.dashGhosts[i].alpha -= dt * 3.8;
      if (this.dashGhosts[i].alpha <= 0) this.dashGhosts.splice(i, 1);
    }
    this.resolvePlayerCreatureSeparation();
  }

  private updatePlayerActions(): void {
    if (this.interactBuffer > 0) {
      const nearHw = this.findNearestIntelProp(2.35);

      if (this.zone === 'EXPO_PARK') {
        const nearPc = this.findNearestExpoPc(2.2);
        const pcDist = nearPc ? Math.hypot(nearPc.wx - this.player.wx, nearPc.wy - this.player.wy) : 99;
        const hwDist = nearHw ? Math.hypot(nearHw.wx - this.player.wx, nearHw.wy - this.player.wy) : 99;
        if (nearHw && hwDist < pcDist) {
          this.interactBuffer = 0;
          this.heldKeys.clear();
          this.phase = 'DIALOGUE';
          gameAudio.playPickup();
          this.callbacks.onInspectHardware(nearHw.hardwareKey);
          return;
        }
        if (nearPc) {
          this.interactBuffer = 0;
          this.targetZoom = 1.16;
          this.heldKeys.clear();
          this.phase = 'DIALOGUE';
          this.triggerPcDemoEffect(nearPc);
          this.callbacks.onInteractExpoPc(nearPc);
          return;
        }
      }

      const nearNpc = this.findNearestNpc(2.2);
      const nearTask = this.findNearestTask(1.9);
      if (nearNpc) {
        this.interactBuffer = 0;
        nearNpc.interacted = true;
        this.targetZoom = 1.15;
        this.phase = 'DIALOGUE';
        this.heldKeys.clear();
        this.callbacks.onStartDialogue(nearNpc.dialogueId);
        return;
      }

      if (nearTask && !nearTask.rescued) {
        this.interactBuffer = 0;
        this.rescueTask(nearTask);
        return;
      }

      if (nearHw) {
        this.interactBuffer = 0;
        this.heldKeys.clear();
        this.phase = 'DIALOGUE';
        gameAudio.playPickup();
        this.callbacks.onInspectHardware(nearHw.hardwareKey);
        return;
      }
    }

    if (this.dashBuffer > 0 && this.player.dashCooldown <= 0 && (this.trapCompleted || this.zone === 'EXPO_PARK')) {
      this.dashBuffer = 0;
      this.player.dashTimer = 0.16;
      this.player.dashCooldown = 0.52;
      this.player.invulnTimer = 0.28;
      this.profile.dashesUsed++;
      gameAudio.playDash();
      this.spawnSpriteFx('dust2', this.player.wx, this.player.wy + 0.1, 68, 0.42, this.player.flipX);
      this.spawnBurstWorld(this.player.wx, this.player.wy, '#38BDF8', 10);
    }

    if (this.zone === 'EXPO_PARK') return;

    if (this.attackBuffer > 0 && this.player.attackCooldown <= 0 && this.trapCompleted) {
      this.attackBuffer = 0;
      const buff = this.player.xessBuffTimer > 0;
      this.player.attackTimer = 0.22;
      this.player.attackCooldown = buff ? 0.2 : 0.28;
      this.player.attackAlt = !this.player.attackAlt;
      gameAudio.playSlash();

      const radius = buff ? 2.4 : 1.95;
      const dmg = buff ? 32 : 24;
      const fxX = this.player.wx + Math.cos(this.player.facingAngle) * 0.85;
      const fxY = this.player.wy + Math.sin(this.player.facingAngle) * 0.85;
      // Pure sprite slash dust + spark particles (no blocky geometric stroke arc)
      this.spawnSpriteFx(buff ? 'fire3' : 'dust2', fxX, fxY, buff ? 82 : 66, 0.28, this.player.flipX);
      for (let k = -2; k <= 2; k++) {
        const a = this.player.facingAngle + k * 0.28;
        const r = (radius * 0.55) * TILE_SIZE;
        this.particles.push({
          x: this.player.wx * TILE_SIZE + Math.cos(a) * r,
          y: this.player.wy * TILE_SIZE - 18 + Math.sin(a) * r,
          vx: Math.cos(a) * 95,
          vy: Math.sin(a) * 95,
          life: 0.22,
          maxLife: 0.22,
          color: buff ? '#38BDF8' : '#7DD3FC',
          size: 2.8,
        });
      }
      this.performMeleeHit(radius, dmg);
    }

    if (
      this.specialBuffer > 0 &&
      this.player.specialCooldown <= 0 &&
      this.player.hasNpuPulse &&
      this.player.npuCharge >= 35
    ) {
      this.specialBuffer = 0;
      this.player.npuCharge = Math.max(0, this.player.npuCharge - 38);
      this.player.specialCooldown = 1.9;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 12);
      this.profile.npuUses++;

      if (this.player.hasXessSurge) {
        this.profile.xessUses++;
        this.player.xessBuffTimer = 4.8;
        gameAudio.playXessSurge();
        this.spawnSpriteFx('explosion2', this.player.wx, this.player.wy, 165, 0.55);
        this.spawnFloatingText(this.player.wx, this.player.wy - 0.7, 'NPU + XeSS SURGE!', '#22D3EE');
      } else {
        gameAudio.playNpuPulse();
        this.spawnFloatingText(this.player.wx, this.player.wy - 0.7, 'NPU HEAL PULSE!', '#00C7FD');
      }

      this.spawnSpriteFx('healEffect', this.player.wx, this.player.wy, 160, 0.72);
      this.hitstopTimer = 0.045;
      this.triggerShake(0.22, 6);
      this.spawnBurstWorld(this.player.wx, this.player.wy, '#00C7FD', 22);

      for (const task of this.tasks) {
        if (!task.rescued && Math.hypot(task.wx - this.player.wx, task.wy - this.player.wy) <= 4.4) {
          this.rescueTask(task);
        }
      }
      for (const enemy of this.enemies) {
        if (Math.hypot(enemy.wx - this.player.wx, enemy.wy - this.player.wy) <= 4.4) {
          this.damageEnemy(enemy, 42, true);
        }
      }
      if (this.boss.active) {
        if (this.boss.splitActive) {
          for (const twin of this.boss.twins) {
            if (twin.hp > 0 && Math.hypot(twin.wx - this.player.wx, twin.wy - this.player.wy) <= 5.0) {
              this.damageTwinBoss(twin, 38, true);
            }
          }
        } else if (Math.hypot(this.boss.wx - this.player.wx, this.boss.wy - this.player.wy) <= 5.0) {
          this.damageBoss(40, true);
        }
      }
    }
  }

  private performMeleeHit(radius: number, damage: number): void {
    const cx = this.player.wx + Math.cos(this.player.facingAngle) * 0.95;
    const cy = this.player.wy + Math.sin(this.player.facingAngle) * 0.95;

    for (const enemy of this.enemies) {
      if (Math.hypot(enemy.wx - cx, enemy.wy - cy) <= radius * 0.9) {
        this.damageEnemy(enemy, damage, false);
      }
    }
    for (const task of this.tasks) {
      if (!task.rescued && Math.hypot(task.wx - cx, task.wy - cy) <= 1.55) {
        this.rescueTask(task);
      }
    }
    if (this.boss.active) {
      if (this.boss.splitActive) {
        for (const twin of this.boss.twins) {
          if (twin.hp > 0 && Math.hypot(twin.wx - cx, twin.wy - cy) <= radius * 1.05) {
            this.damageTwinBoss(twin, damage, false);
          }
        }
      } else if (Math.hypot(this.boss.wx - cx, this.boss.wy - cy) <= radius * 1.15) {
        this.damageBoss(damage, false);
      }
    }
  }

  private rescueTask(task: TaskNode): void {
    if (task.rescued) return;
    task.rescued = true;
    this.profile.tasksRescued++;
    this.player.goldCount += 15;
    this.player.woodCount += 10;
    this.player.battery = Math.min(100, this.player.battery + 10);
    this.player.npuCharge = Math.min(100, this.player.npuCharge + 30);
    gameAudio.playPickup();
    this.spawnSpriteFx('healEffect', task.wx, task.wy, 130, 0.72);
    this.spawnSpriteFx('explosion1', task.wx, task.wy, 95, 0.42);
    this.spawnBurstWorld(task.wx, task.wy, '#10B981', 16);
    this.spawnFloatingText(task.wx, task.wy - 0.6, `RESCUED: ${task.label}`, '#10B981');
    this.emitHud();
  }

  private damageEnemy(enemy: EnemyEntity, dmg: number, fromNpu: boolean): void {
    enemy.hp -= dmg;
    enemy.hitFlash = 0.14;
    const dx = enemy.wx - this.player.wx;
    const dy = enemy.wy - this.player.wy;
    const len = Math.max(0.1, Math.hypot(dx, dy));
    this.moveWithCollision(enemy, (dx / len) * 0.5, (dy / len) * 0.5);
    this.spawnSpriteFx(fromNpu ? 'explosion1' : 'dust2', enemy.wx, enemy.wy, 74, 0.36);
    this.spawnSpriteFx(fromNpu ? 'fire3' : 'fire1', (enemy.wx + this.player.wx) / 2, (enemy.wy + this.player.wy) / 2, 58, 0.34);
    this.spawnFloatingText(enemy.wx, enemy.wy - 0.6, `-${dmg}`, fromNpu ? '#00C7FD' : '#F8FAFC');
    gameAudio.playHit(fromNpu);
    this.hitstopTimer = 0.035;
    this.triggerShake(0.12, 3.5);

    if (enemy.hp <= 0) {
      this.profile.enemiesDefeated++;
      this.player.goldCount += 8;
      this.player.npuCharge = Math.min(100, this.player.npuCharge + 24);
      this.spawnSpriteFx('explosion1', enemy.wx, enemy.wy, 118, 0.5);
      const roll = Math.random();
      this.pickups.push({
        id: this.nextEntityId++,
        kind: roll < 0.38 ? 'meat' : roll < 0.72 ? 'gold' : 'wood',
        wx: enemy.wx,
        wy: enemy.wy,
        bobOffset: Math.random() * 3,
      });
    }
  }

  private summonSpectralPortal(wx: number, wy: number): void {
    this.boss.portals.push({
      wx,
      wy,
      elapsed: 0,
      duration: 0.85,
      spawned: false,
    });
    this.spawnSpriteFx('dust2', wx, wy, 90, 0.55);
  }

  private triggerBossSplit(): void {
    const b = this.boss;
    b.splitActive = true;
    b.phase = 3;
    const twinMaxHp = Math.max(95, Math.round(b.maxHp * 0.25));
    const twinEachHp = Math.max(70, Math.round(b.hp / 2));
    b.twins = [
      {
        id: 1,
        name: 'Thermal Titan',
        wx: Math.max(18.5, b.wx - 2.2),
        wy: b.wy,
        hp: twinEachHp,
        maxHp: Math.max(twinMaxHp, twinEachHp),
        state: 'IDLE',
        stateTimer: 0.9,
        hitFlash: 0.2,
        attackAlt: false,
        flipX: false,
      },
      {
        id: 2,
        name: 'Throttle Titan',
        wx: Math.min(28.5, b.wx + 2.2),
        wy: b.wy,
        hp: twinEachHp,
        maxHp: Math.max(twinMaxHp, twinEachHp),
        state: 'IDLE',
        stateTimer: 1.25,
        hitFlash: 0.2,
        attackAlt: true,
        flipX: true,
      },
    ];
    b.hp = b.twins.reduce((sum, t) => sum + t.hp, 0);
    gameAudio.playBossPhase();
    gameAudio.setMusicMode('boss_climax');
    this.lightningFlash = 1.0;
    this.hitstopTimer = 0.065;
    this.triggerShake(0.45, 10);
    this.spawnSpriteFx('explosion2', b.wx, b.wy, 210, 0.72);
    this.spawnSpriteFx('fire3', b.twins[0].wx, b.twins[0].wy, 125, 0.65);
    this.spawnSpriteFx('fire3', b.twins[1].wx, b.twins[1].wy, 125, 0.65);
    this.showBanner('50% SPLIT · THERMAL TITAN & THROTTLE TITAN!', 3.2);
    this.summonSpectralPortal(19.2, 7.6);
    this.summonSpectralPortal(27.8, 7.6);
  }

  private completeBossVictory(vx: number, vy: number): void {
    this.boss.active = false;
    this.boss.portals = [];
    this.boss.twins = [];
    this.telegraphs = [];
    this.projectiles = [];
    this.enemies = [];
    this.hitstopTimer = 0.085;
    this.triggerShake(0.6, 12);
    this.spawnSpriteFx('explosion2', vx, vy, 240, 0.8);
    this.spawnSpriteFx('healEffect', this.player.wx, this.player.wy, 180, 0.85);
    this.spawnBurstWorld(vx, vy, '#00C7FD', 40);
    gameAudio.playVictory();
    gameAudio.playTransform();
    this.phase = 'EXPO_TRANSFORM';
    this.transformTimer = 2.4;
    this.matchedPcId = getMatchedExpoPcId(this.profile);
    this.showBanner('LAG TITAN DEFEATED · TRANSFORMING INTO EXPO PARK!', 3.2);
    this.emitHud();
  }

  private damageTwinBoss(twin: TwinBossEntity, dmg: number, fromNpu: boolean): void {
    if (!this.boss.active || !this.boss.splitActive || twin.hp <= 0) return;
    twin.hp = Math.max(0, twin.hp - dmg);
    twin.hitFlash = 0.14;
    this.player.npuCharge = Math.min(100, this.player.npuCharge + 11);
    gameAudio.playHit(fromNpu);
    this.hitstopTimer = 0.036;
    this.triggerShake(0.13, 4.2);
    this.spawnSpriteFx(fromNpu ? 'explosion2' : 'explosion1', twin.wx, twin.wy, 105, 0.42);
    this.spawnFloatingText(twin.wx, twin.wy - 0.9, `-${dmg}`, fromNpu ? '#38BDF8' : '#FBBF24');

    this.boss.hp = this.boss.twins.reduce((sum, t) => sum + Math.max(0, t.hp), 0);
    if (twin.hp <= 0) {
      this.spawnSpriteFx('explosion2', twin.wx, twin.wy, 190, 0.68);
      this.spawnBurstWorld(twin.wx, twin.wy, '#F59E0B', 24);
      if (this.boss.hp > 0) {
        this.showBanner(`${twin.name.toUpperCase()} FALLEN — DEFEAT THE REMAINING TWIN!`, 2.4);
      } else {
        this.completeBossVictory(twin.wx, twin.wy);
      }
    }
  }

  private damageBoss(dmg: number, fromNpu: boolean): void {
    if (!this.boss.active || this.boss.splitActive) return;

    if (this.boss.shield > 0) {
      const sDmg = fromNpu ? dmg * 1.65 : Math.max(9, Math.round(dmg * 0.65));
      this.boss.shield = Math.max(0, this.boss.shield - sDmg);
      this.boss.hitFlash = 0.14;
      gameAudio.playHit(fromNpu);
      this.spawnSpriteFx('dust2', this.boss.wx, this.boss.wy, 110, 0.4);
      this.spawnFloatingText(
        this.boss.wx,
        this.boss.wy - 1.0,
        fromNpu ? `RGB SHIELD -${Math.round(sDmg)}!` : `SHIELD -${Math.round(sDmg)}`,
        '#C084FC'
      );
      if (this.boss.shield <= 0) {
        this.boss.state = 'STUNNED';
        this.boss.stateTimer = 1.6;
        this.hitstopTimer = 0.065;
        this.triggerShake(0.3, 7);
        gameAudio.playShieldShatter();
        this.spawnSpriteFx('explosion2', this.boss.wx, this.boss.wy, 190, 0.62);
        this.spawnFloatingText(this.boss.wx, this.boss.wy - 1.2, 'RGB SHIELD SHATTERED!', '#F59E0B');
      }
      return;
    }

    const finalDmg = this.boss.state === 'STUNNED' ? Math.round(dmg * 1.35) : dmg;
    this.boss.hp = Math.max(0, this.boss.hp - finalDmg);
    this.boss.hitFlash = 0.14;
    this.player.npuCharge = Math.min(100, this.player.npuCharge + 10);
    gameAudio.playHit(fromNpu || this.boss.state === 'STUNNED');
    this.hitstopTimer = 0.04;
    this.triggerShake(0.14, 4.5);
    this.spawnSpriteFx('explosion1', this.boss.wx, this.boss.wy, 120, 0.45);
    this.spawnSpriteFx('fire2', (this.boss.wx + this.player.wx) / 2, (this.boss.wy + this.player.wy) / 2, 68, 0.38);
    this.spawnFloatingText(this.boss.wx, this.boss.wy - 1.0, `-${finalDmg}`, '#FBBF24');

    const ratio = this.boss.hp / this.boss.maxHp;
    if (this.boss.phase === 1 && ratio <= 0.74 && this.boss.hp > 0) {
      this.boss.phase = 2;
      this.boss.state = 'STUNNED';
      this.boss.stateTimer = 1.0;
      gameAudio.playBossPhase();
      this.triggerShake(0.36, 8);
      this.spawnSpriteFx('fire2', 19.2, 6.4, 90, 0.9);
      this.spawnSpriteFx('fire2', 27.8, 6.4, 90, 0.9);
      this.showBanner('PHASE 2 · FALLEN KNIGHTS RISE FROM DARK PORTALS!', 2.6);
      this.summonSpectralPortal(19.4, 7.6);
      this.summonSpectralPortal(27.6, 7.6);
    }

    // At 50% HP, Black Warlord splits into two half-strength Twin Mini-Bosses!
    if (!this.boss.splitActive && ratio <= 0.5 && this.boss.hp > 0) {
      this.triggerBossSplit();
      return;
    }

    if (this.boss.hp <= 0) {
      this.completeBossVictory(this.boss.wx, this.boss.wy);
    }
  }

  private damagePlayer(dmg: number): void {
    if (this.player.invulnTimer > 0 || this.phase !== 'PLAYING') return;
    this.player.hp = Math.max(0, this.player.hp - dmg);
    this.player.battery = Math.max(5, this.player.battery - Math.round(dmg * 0.4));
    this.profile.damageTaken += dmg;
    this.player.invulnTimer = 0.85;
    this.player.hitFlash = 0.2;
    this.triggerShake(0.22, 6);
    gameAudio.playPlayerHurt();
    this.spawnSpriteFx('dust2', this.player.wx, this.player.wy, 74, 0.36);
    this.spawnSpriteFx('fire1', this.player.wx, this.player.wy, 54, 0.32);
    this.spawnFloatingText(this.player.wx, this.player.wy - 0.6, `-${dmg} HP`, '#EF4444');

    if (this.player.hp <= 0) {
      this.phase = 'GAME_OVER';
      gameAudio.playCrash();
      this.emitHud();
      this.callbacks.onGameOver({ ...this.profile });
    }
  }

  private updateDistrictEvents(dt: number): void {
    if (!this.trapCompleted) {
      this.trapDrainAccum += dt;
      if (this.trapDrainAccum > 0.28) {
        this.trapDrainAccum = 0;
        this.player.battery = Math.max(12, this.player.battery - 4);
        if (Math.random() < 0.45) {
          this.spawnFloatingText(this.player.wx, this.player.wy - 0.6, '11 FPS LAG!', '#EF4444');
        }
      }
      if (this.player.wx >= 11.6 && this.player.wy >= 26.5 && this.player.wy <= 30.5) {
        gameAudio.playCrash();
        this.triggerShake(0.42, 8);
        this.spawnSpriteFx('explosion1', this.player.wx, this.player.wy, 120, 0.5);
        this.phase = 'DIALOGUE';
        this.heldKeys.clear();
        this.callbacks.onStartDialogue('trap_meltdown');
      }
      return;
    }

    if (this.player.hasNpuPulse && this.player.npuCharge < 100) {
      this.player.npuCharge = Math.min(100, this.player.npuCharge + dt * 12);
    }
    this.player.battery = Math.max(40, this.player.battery - dt * 0.12);

    if (!this.bossGateOpen && this.player.wy < 12.6 && Math.abs(this.player.wx - 23.5) < 2.6) {
      if (this.bannerTimer <= 0) {
        this.showBanner('Unlock NPU Monastery (West) & Arc Archery (East) first!', 2.2);
      }
    }

    if (this.bossGateOpen && !this.bossTriggered && this.player.wy < 9.5) {
      this.bossTriggered = true;
      this.phase = 'DIALOGUE';
      this.heldKeys.clear();
      this.callbacks.onStartDialogue('boss_intro');
    }
  }

  private updateEnemies(dt: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hp <= 0) {
        this.enemies.splice(i, 1);
        continue;
      }
      if (e.hitFlash > 0) e.hitFlash -= dt;

      // Spectral Fallen Knights smoothly rise from dark portals before engaging
      if (e.isSpectral && e.riseElapsed !== undefined && e.riseDuration !== undefined && e.riseElapsed < e.riseDuration) {
        e.riseElapsed += dt;
        e.flipX = this.player.wx < e.wx;
        continue;
      }

      const dx = this.player.wx - e.wx;
      const dy = this.player.wy - e.wy;
      const dist = Math.hypot(dx, dy);
      e.flipX = dx < 0;
      e.stateTimer -= dt;

      if (e.unitClass.includes('archer')) {
        if (dist < 8.4 && e.shootTimer <= 0) {
          e.shootTimer = Math.max(1.5, 2.3 - (e.islandTier - 1) * 0.22);
          const len = Math.max(0.1, dist);
          const pSpeed = 5.0 + (e.islandTier - 1) * 0.55;
          this.projectiles.push({
            wx: e.wx,
            wy: e.wy,
            vx: (dx / len) * pSpeed,
            vy: (dy / len) * pSpeed,
            life: 2.2,
            color: e.faction === 'Red' ? '#EF4444' : '#94A3B8',
            radius: 0.25,
            damage: Math.max(9, e.damage - 2),
            arrowFaction: e.faction,
          });
        } else {
          e.shootTimer -= dt;
        }
      }

      if (e.state === 'PATROL') {
        const aggroRange = e.isSpectral ? 11.0 : 5.6 + (e.islandTier - 1) * 0.45;
        if (dist < aggroRange) {
          e.state = 'WINDUP';
          e.stateTimer = Math.max(0.36, 0.52 - (e.islandTier - 1) * 0.04);
        }
      } else if (e.state === 'WINDUP') {
        if (e.stateTimer <= 0) {
          e.state = 'LUNGE';
          e.stateTimer = 0.36;
          const len = Math.max(0.1, dist);
          const baseSpd = e.unitClass.includes('archer') ? 3.5 : e.isSpectral ? 6.5 : 6.0;
          const spd = baseSpd * e.speedMult;
          e.vx = (dx / len) * spd;
          e.vy = (dy / len) * spd;
        }
      } else if (e.state === 'LUNGE') {
        this.moveWithCollision(e, e.vx * dt, e.vy * dt, 0.25);
        if (dist < 0.85) this.damagePlayer(e.damage);
        if (e.stateTimer <= 0) {
          e.state = 'COOLDOWN';
          e.stateTimer = Math.max(0.48, 0.68 - (e.islandTier - 1) * 0.05);
        }
      } else if (e.state === 'COOLDOWN') {
        if (e.stateTimer <= 0) e.state = 'PATROL';
      }
    }
  }

  private updateBoss(dt: number): void {
    const b = this.boss;
    if (b.hitFlash > 0) b.hitFlash -= dt;

    // Update active Dark Ground Portals & spawn animated Spectral Fallen Knights when ready
    for (let i = b.portals.length - 1; i >= 0; i--) {
      const pt = b.portals[i];
      pt.elapsed += dt;
      if (!pt.spawned && pt.elapsed >= pt.duration * 0.65) {
        pt.spawned = true;
        if (this.enemies.length < 5) {
          this.enemies.push(this.makeEnemy('spectral_knight', pt.wx, pt.wy, 4));
          this.spawnBurstWorld(pt.wx, pt.wy, '#67E8F9', 14);
        }
      }
      if (pt.elapsed >= pt.duration) {
        b.portals.splice(i, 1);
      }
    }

    // Periodically summon Spectral Fallen Knights during Phase 2+
    if (b.phase >= 2) {
      b.portalCooldown -= dt;
      if (b.portalCooldown <= 0) {
        b.portalCooldown = b.splitActive ? 7.5 : 8.5;
        if (this.enemies.filter((e) => e.isSpectral).length < 2) {
          const sx = this.player.wx < 23.5 ? 27.6 : 19.4;
          const sy = 7.2 + (Math.random() - 0.5) * 1.8;
          this.summonSpectralPortal(sx, sy);
        }
      }
    }

    // Flanking Black Towers fire arrows periodically!
    b.towerTimer -= dt;
    if (b.towerTimer <= 0) {
      b.towerTimer = b.splitActive ? 2.5 : 3.2;
      const towers = [
        { wx: 18.0, wy: 5.5 },
        { wx: 30.0, wy: 5.5 },
      ];
      for (const tw of towers) {
        const dx = this.player.wx - tw.wx;
        const dy = this.player.wy - tw.wy;
        const len = Math.max(0.1, Math.hypot(dx, dy));
        this.projectiles.push({
          wx: tw.wx,
          wy: tw.wy,
          vx: (dx / len) * 5.2,
          vy: (dy / len) * 5.2,
          life: 2.6,
          color: '#F97316',
          radius: 0.28,
          damage: 12,
          arrowFaction: 'Black',
        });
      }
    }

    // Post-50% Split: two half-strength Twin Mini-Bosses attack simultaneously
    if (b.splitActive) {
      for (const twin of b.twins) {
        if (twin.hp <= 0) continue;
        if (twin.hitFlash > 0) twin.hitFlash -= dt;
        const dx = this.player.wx - twin.wx;
        const dy = this.player.wy - twin.wy;
        const dist = Math.hypot(dx, dy);
        twin.flipX = dx < 0;
        twin.stateTimer -= dt;

        if (twin.state === 'IDLE') {
          if (dist > 2.0) {
            const spd = 2.65;
            this.moveWithCollision(twin, (dx / dist) * spd * dt, (dy / dist) * spd * dt, 0.44);
          }
          if (twin.stateTimer <= 0) {
            twin.attackAlt = !twin.attackAlt;
            if (twin.attackAlt) {
              twin.state = 'WINDUP_SLAM';
              twin.stateTimer = 0.72;
              gameAudio.playBossTelegraph();
              this.telegraphs.push({
                wx: this.player.wx + (twin.id === 1 ? -0.45 : 0.45),
                wy: this.player.wy,
                radius: 1.75,
                timer: twin.stateTimer,
                maxTimer: twin.stateTimer,
                damage: 10, // Half-strength compared to Lag Titan
              });
            } else {
              twin.state = 'WINDUP_FAN';
              twin.stateTimer = 0.56;
              gameAudio.playBossTelegraph();
            }
          }
        } else if (twin.state === 'WINDUP_SLAM') {
          if (twin.stateTimer <= 0) {
            twin.state = 'COOLDOWN';
            twin.stateTimer = 0.72;
          }
        } else if (twin.state === 'WINDUP_FAN') {
          if (twin.stateTimer <= 0) {
            const base = Math.atan2(dy, dx);
            for (let k = -1; k <= 1; k++) {
              const ang = base + k * 0.24;
              this.projectiles.push({
                wx: twin.wx,
                wy: twin.wy,
                vx: Math.cos(ang) * 5.6,
                vy: Math.sin(ang) * 5.6,
                life: 2.5,
                color: twin.id === 1 ? '#EF4444' : '#A855F7',
                radius: 0.26,
                damage: 9,
              });
            }
            gameAudio.playHit(false);
            twin.state = 'COOLDOWN';
            twin.stateTimer = 0.78;
          }
        } else if (twin.state === 'COOLDOWN') {
          if (twin.stateTimer <= 0) {
            twin.state = 'IDLE';
            twin.stateTimer = 0.6;
          }
        }
      }
      return;
    }

    const dx = this.player.wx - b.wx;
    const dy = this.player.wy - b.wy;
    const dist = Math.hypot(dx, dy);
    b.stateTimer -= dt;

    if (b.state === 'STUNNED') {
      if (b.stateTimer <= 0) {
        b.state = 'IDLE';
        b.stateTimer = 0.65;
      }
      return;
    }

    if (b.state === 'IDLE') {
      if (dist > 2.4) {
        const spd = b.phase >= 2 ? 2.1 : 1.7;
        this.moveWithCollision(b, (dx / dist) * spd * dt, (dy / dist) * spd * dt, 0.55);
      }
      if (b.stateTimer <= 0) {
        b.attackCombo = (b.attackCombo + 1) % 2;
        const roll = Math.random();
        if (roll < 0.42) {
          b.state = 'WINDUP_SLAM';
          b.stateTimer = b.phase >= 2 ? 0.76 : 0.88;
          gameAudio.playBossTelegraph();
          this.telegraphs.push({
            wx: this.player.wx,
            wy: this.player.wy,
            radius: 2.2,
            timer: b.stateTimer,
            maxTimer: b.stateTimer,
            damage: 19,
          });
        } else if (roll < 0.78) {
          b.state = 'WINDUP_FAN';
          b.stateTimer = 0.62;
          gameAudio.playBossTelegraph();
        } else {
          b.state = 'WINDUP_RING';
          b.stateTimer = 0.82;
          gameAudio.playBossTelegraph();
          this.telegraphs.push({
            wx: b.wx,
            wy: b.wy,
            radius: 3.5,
            timer: b.stateTimer,
            maxTimer: b.stateTimer,
            damage: 17,
          });
        }
      }
    } else if (b.state === 'WINDUP_SLAM' || b.state === 'WINDUP_RING') {
      if (b.stateTimer <= 0) {
        b.state = 'COOLDOWN';
        b.stateTimer = 0.85;
      }
    } else if (b.state === 'WINDUP_FAN') {
      if (b.stateTimer <= 0) {
        const count = b.phase >= 2 ? 6 : 5;
        const base = Math.atan2(dy, dx);
        for (let k = 0; k < count; k++) {
          const ang = base + (k - (count - 1) / 2) * 0.26;
          this.projectiles.push({
            wx: b.wx,
            wy: b.wy,
            vx: Math.cos(ang) * 5.2,
            vy: Math.sin(ang) * 5.2,
            life: 2.8,
            color: k % 2 === 0 ? '#EC4899' : '#EF4444',
            radius: 0.3,
            damage: 13,
          });
        }
        gameAudio.playHit(false);
        b.state = 'COOLDOWN';
        b.stateTimer = 0.92;
      }
    } else if (b.state === 'COOLDOWN') {
      if (b.stateTimer <= 0) {
        b.state = 'IDLE';
        b.stateTimer = 0.6;
      }
    }
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.wx += p.vx * dt;
      p.wy += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0 || !this.isWalkable(p.wx, p.wy, 0.1, { skipCreatures: true })) {
        this.spawnSpriteFx('dust1', p.wx, p.wy, 42, 0.25);
        this.projectiles.splice(i, 1);
        continue;
      }
      if (Math.hypot(p.wx - this.player.wx, p.wy - this.player.wy) < p.radius + 0.36) {
        this.damagePlayer(p.damage ?? 11);
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateTelegraphs(dt: number): void {
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const t = this.telegraphs[i];
      t.timer -= dt;
      if (t.timer <= 0) {
        this.triggerShake(0.22, 5.5);
        this.spawnSpriteFx('explosion2', t.wx, t.wy, 165, 0.52);
        this.spawnSpriteFx('fire1', t.wx, t.wy, 70, 0.55);
        gameAudio.playHit(true);
        if (Math.hypot(this.player.wx - t.wx, this.player.wy - t.wy) <= t.radius) {
          this.damagePlayer(t.damage);
        }
        this.telegraphs.splice(i, 1);
      }
    }
  }

  private updatePickups(): void {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      if (Math.hypot(pk.wx - this.player.wx, pk.wy - this.player.wy) < 0.95) {
        gameAudio.playPickup();
        if (pk.kind === 'meat') {
          this.player.battery = Math.min(100, this.player.battery + 18);
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
          this.spawnFloatingText(pk.wx, pk.wy - 0.4, '+18% BATTERY · +20 HP', '#10B981');
        } else if (pk.kind === 'gold') {
          this.player.goldCount += 12;
          this.player.npuCharge = Math.min(100, this.player.npuCharge + 35);
          this.spawnFloatingText(pk.wx, pk.wy - 0.4, '+12 GOLD · +35 AI', '#FBBF24');
        } else {
          this.player.woodCount += 10;
          this.player.npuCharge = Math.min(100, this.player.npuCharge + 25);
          this.spawnFloatingText(pk.wx, pk.wy - 0.4, '+10 WOOD · +25 AI', '#38BDF8');
        }
        this.spawnSpriteFx('healEffect', pk.wx, pk.wy, 76, 0.45);
        this.pickups.splice(i, 1);
      }
    }
  }

  private updateParticles(dt: number): void {
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      this.slashes[i].timer -= dt;
      if (this.slashes[i].timer <= 0) this.slashes.splice(i, 1);
    }
    for (let i = this.spriteVfx.length - 1; i >= 0; i--) {
      this.spriteVfx[i].elapsed += dt;
      if (this.spriteVfx[i].elapsed >= this.spriteVfx[i].duration) {
        this.spriteVfx.splice(i, 1);
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.wy -= dt * 0.7;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  private spawnBurstWorld(wx: number, wy: number, color: string, count: number): void {
    const px = wx * TILE_SIZE;
    const py = wy * TILE_SIZE;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 45 + Math.random() * 140;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.38 + Math.random() * 0.35,
        maxLife: 0.72,
        color,
        size: 3 + Math.random() * 3.5,
      });
    }
  }

  private spawnFloatingText(wx: number, wy: number, text: string, color: string): void {
    this.floatingTexts.push({ wx, wy, text, color, life: 1.15, maxLife: 1.15 });
  }

  private triggerShake(duration: number, intensity: number): void {
    this.shakeTimer = Math.max(this.shakeTimer, duration);
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  private findNearestNpc(maxDist: number): NpcEntity | null {
    let best: NpcEntity | null = null;
    let bestD = maxDist;
    for (const n of this.npcs) {
      const d = Math.hypot(n.wx - this.player.wx, n.wy - this.player.wy);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    return best;
  }

  private findNearestTask(maxDist: number): TaskNode | null {
    let best: TaskNode | null = null;
    let bestD = maxDist;
    for (const t of this.tasks) {
      if (t.rescued) continue;
      const d = Math.hypot(t.wx - this.player.wx, t.wy - this.player.wy);
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    return best;
  }

  private findNearestExpoPc(maxDist: number): CatalogPcCharacter | null {
    let best: CatalogPcCharacter | null = null;
    let bestD = maxDist;
    for (const pc of EXPO_PC_CATALOG) {
      const d = Math.hypot(pc.wx - this.player.wx, pc.wy - this.player.wy);
      if (d < bestD) {
        bestD = d;
        best = pc;
      }
    }
    return best;
  }

  private findNearestIntelProp(maxDist: number): IntelHardwareProp | null {
    let best: IntelHardwareProp | null = null;
    let bestD = maxDist;
    for (const ip of this.intelProps) {
      const d = Math.hypot(ip.wx - this.player.wx, ip.wy - this.player.wy);
      if (d < bestD) {
        bestD = d;
        best = ip;
      }
    }
    return best;
  }

  private emitHud(): void {
    const dist = this.getCurrentDistrict();
    let nearbyPrompt: string | null = null;
    const nearHw = this.findNearestIntelProp(2.35);

    if (this.zone === 'EXPO_PARK') {
      const nearPc = this.findNearestExpoPc(2.2);
      const pcDist = nearPc ? Math.hypot(nearPc.wx - this.player.wx, nearPc.wy - this.player.wy) : 99;
      const hwDist = nearHw ? Math.hypot(nearHw.wx - this.player.wx, nearHw.wy - this.player.wy) : 99;
      if (nearHw && hwDist < pcDist) {
        nearbyPrompt = `[E / Click] Inspect ${INTEL_HARDWARE_SPECS[nearHw.hardwareKey].title}`;
      } else if (nearPc) {
        nearbyPrompt = `[E] Meet ${nearPc.name}`;
      }
    } else {
      const nearNpc = this.findNearestNpc(2.2);
      const nearTask = this.findNearestTask(1.9);
      if (nearNpc) {
        nearbyPrompt = `[E] Talk to ${nearNpc.name}`;
      } else if (nearTask) {
        nearbyPrompt = `[E / O] Rescue ${nearTask.label}`;
      } else if (nearHw) {
        nearbyPrompt = `[E / Click] Inspect ${INTEL_HARDWARE_SPECS[nearHw.hardwareKey].title}`;
      }
    }

    const districtNames: Record<DistrictId, string> = {
      TRAP_ALLEY: '1:47 AM Study Cove',
      ECORE_PARK: 'Harbor of Quiet Hours',
      COPPER_PLAZA: 'Copper Bus Crossroads',
      NPU_LIBRARY: 'Library of Unspoken Notes',
      ARC_ARENA: 'Dawn Horizon Arena',
      BOSS_COLOSSEUM: 'The Burnout Citadel',
      EXPO_PARK: 'Intel AI PC Courtyard',
    };

    const fpsDisplay =
      dist === 'TRAP_ALLEY' && !this.trapCompleted
        ? 11 + Math.floor(Math.sin(this.elapsed * 9) * 3)
        : this.player.xessBuffTimer > 0
          ? 120
          : 60;

    const phaseLabels: Record<1 | 2 | 3, string> = {
      1: 'Phase 1 · Black Guard & RGB Shield',
      2: 'Phase 2 · Dark Portals & Fallen Knights',
      3: 'Phase 3 · 50% Twin Titans Split',
    };

    this.callbacks.onHudUpdate({
      zone: this.zone,
      district: dist,
      districtTitle: districtNames[dist],
      pcLabel:
        this.player.heroForm === 'pawn'
          ? 'Byte · Blue Pawn'
          : 'Byte · Blue Warrior',
      heroForm: this.player.heroForm,
      hp: Math.round(this.player.hp),
      maxHp: this.player.maxHp,
      battery: Math.round(this.player.battery),
      npuCharge: Math.round(this.player.npuCharge),
      goldCount: this.player.goldCount,
      woodCount: this.player.woodCount,
      fpsDisplay,
      hasNpuPulse: this.player.hasNpuPulse,
      hasXessSurge: this.player.hasXessSurge,
      dashReadyPct: Math.max(0, Math.min(100, Math.round((1 - this.player.dashCooldown / 0.52) * 100))),
      specialReadyPct: Math.max(
        0,
        Math.min(
          100,
          Math.round(
            Math.min(this.player.npuCharge / 35, 1) *
              (1 - Math.max(0, this.player.specialCooldown) / 1.9) *
              100
          )
        )
      ),
      tasksRescued: this.profile.tasksRescued,
      totalTasks: this.profile.totalTasks,
      objectiveText: this.objectiveText,
      nearbyPrompt,
      bossActive: this.boss.active,
      bossName: this.boss.splitActive ? 'Twin Titans · Thermal & Throttle' : 'Black Warlord · Lag Titan',
      bossPhaseLabel: phaseLabels[this.boss.phase],
      bossHp: Math.round(this.boss.hp),
      bossMaxHp: this.boss.maxHp,
      bossShield: Math.round(this.boss.shield),
      bossMaxShield: this.boss.maxShield,
      twinBosses: this.boss.splitActive
        ? this.boss.twins.map((t) => ({ name: t.name, hp: Math.round(t.hp), maxHp: t.maxHp }))
        : undefined,
      bannerText: this.bannerText,
      inExpoPark: this.zone === 'EXPO_PARK',
      matchedPcId: this.matchedPcId,
      taggedPcIds: Array.from(this.taggedPcIds),
      inspectedPcCount: this.inspectedPcIds.size,
      totalExpoPcs: EXPO_PC_CATALOG.length,
    });
  }

  // --- TINY SWORDS FULL WORLD RENDERER ---

  private render(): void {
    const ctx = this.ctx;
    const vw = this.viewW;
    const vh = this.viewH;
    const dist = this.getCurrentDistrict();

    ctx.fillStyle = '#387b8f';
    ctx.fillRect(0, 0, vw, vh);

    if (!this.atlas) {
      ctx.fillStyle = '#1c2f44';
      ctx.fillRect(0, 0, vw, vh);
      ctx.font = '700 18px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#BAE6FD';
      ctx.fillText('Loading Tiny Swords World & Sprites...', vw / 2, vh / 2);
      return;
    }

    const atlas = this.atlas;
    const shakeX = this.shakeTimer > 0 ? (Math.random() - 0.5) * this.shakeIntensity * 2 : 0;
    const shakeY = this.shakeTimer > 0 ? (Math.random() - 0.5) * this.shakeIntensity * 2 : 0;
    const trapJitter =
      dist === 'TRAP_ALLEY' && !this.trapCompleted && Math.sin(this.elapsed * 22) > 0.72
        ? (Math.random() - 0.5) * 5
        : 0;

    ctx.save();
    ctx.translate(vw / 2 + shakeX + trapJitter, vh / 2 + shakeY);
    ctx.scale(this.camZoom, this.camZoom);
    ctx.translate(-Math.round(this.camX), -Math.round(this.camY));

    // 1. Animated Water + 5 Tiny Swords Island Tilemaps + Foam & Cliffs
    this.renderTinySwordsIslands(ctx, atlas, vw, vh);

    // 1B. Custom Ground Architecture: Story Route Lantern Glows (Silicon City) & Hand-Painted Stone Courtyard (Expo Courtyard)
    if (this.zone === 'EXPO_PARK') {
      this.drawExpoCourtyardGround(ctx, atlas);
    } else {
      this.drawStoryRouteLanternGround(ctx);
    }

    // 2. Water Rocks & Bobbing Rubber Ducks
    for (const wd of this.waterDecos) {
      const px = wd.wx * TILE_SIZE;
      const py = wd.wy * TILE_SIZE;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (wd.kind === 'duck') {
        const frame = Math.floor(this.elapsed * 4 + wd.phase) % 3;
        const bob = Math.sin(this.elapsed * 2.5 + wd.phase) * 3;
        ctx.drawImage(atlas.rubberDuck, frame * 32, 0, 32, 32, px - 18, py - 18 + bob, 36, 36);
      } else {
        const sheet = atlas.waterRocks[wd.variant % atlas.waterRocks.length];
        const frames = Math.max(1, Math.round(sheet.width / 64));
        const frame = Math.floor(this.elapsed * 8 + wd.phase * 4) % frames;
        ctx.drawImage(sheet, frame * 64, 0, 64, 64, px - 28, py - 28, 56, 56);
      }
      ctx.restore();
    }

    // 2B. Layered Cloud Ground Shadows (cast gently south-east onto terrain & ocean; denser under Boss Storm)
    for (const c of this.clouds) {
      const img = atlas.clouds[c.variant % atlas.clouds.length];
      const shadowImg = this.getCloudShadowCanvas(c.variant, img);
      const dw = 460 * c.scale * 0.72;
      const dh = (img.height / img.width) * dw;
      const sx = c.wx * TILE_SIZE + (c.layer === 1 ? 165 : 120);
      const sy = c.wy * TILE_SIZE + (c.layer === 1 ? 195 : 155);
      ctx.save();
      ctx.globalAlpha = (c.layer === 1 ? 0.15 : 0.11) + this.stormIntensity * 0.12;
      ctx.drawImage(shadowImg, sx - dw / 2, sy - dh / 2, dw, dh);
      ctx.restore();
    }

    // 3. Signposts (clean minimal labels when nearby)
    for (const sp of this.signposts) {
      const px = sp.wx * TILE_SIZE;
      const py = sp.wy * TILE_SIZE;
      const near = Math.hypot(sp.wx - this.player.wx, sp.wy - this.player.wy) < 4.5;
      ctx.save();
      ctx.fillStyle = '#5c3a25';
      ctx.fillRect(px - 3, py - 24, 6, 24);
      ctx.fillStyle = '#d7b887';
      ctx.fillRect(px - 10, py - 26, 20, 7);
      if (near) {
        ctx.font = '700 11px "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        const w = ctx.measureText(sp.label).width + 20;
        ctx.fillStyle = 'rgba(11, 17, 32, 0.88)';
        ctx.fillRect(px - w / 2, py - 52, w, 20);
        ctx.fillStyle = sp.color;
        ctx.fillText(sp.label, px, py - 38);
      }
      ctx.restore();
    }

    // 4. Boss Floor Telegraphs (soft radial thermal scorch + animated sprite ember markers — no hard geometric ring)
    for (const t of this.telegraphs) {
      const px = t.wx * TILE_SIZE;
      const py = t.wy * TILE_SIZE;
      const r = t.radius * TILE_SIZE;
      const pct = 1 - t.timer / t.maxTimer;
      ctx.save();
      const grad = ctx.createRadialGradient(px, py, 6, px, py, r);
      grad.addColorStop(0, `rgba(239, 68, 68, ${0.14 + pct * 0.24})`);
      grad.addColorStop(0.7, `rgba(249, 115, 22, ${0.12 + pct * 0.2})`);
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      const fireSheet = atlas.fx.fire1;
      const fh = fireSheet.height;
      const totalF = Math.max(1, Math.round(fireSheet.width / fh));
      const fIdx = Math.floor(this.elapsed * 14) % totalF;
      const emberCount = 4;
      for (let k = 0; k < emberCount; k++) {
        const ang = this.elapsed * 3.5 + (k * Math.PI * 2) / emberCount;
        const ex = px + Math.cos(ang) * (r * (1 - pct * 0.45));
        const ey = py + Math.sin(ang) * (r * (1 - pct * 0.45)) * 0.68;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(fireSheet, fIdx * fh, 0, fh, fh, Math.round(ex - 22), Math.round(ey - 30), 44, 44);
      }
      ctx.restore();
    }

    // 4B. Dark Ground Summoning Portals (swirling obsidian/cyan floor rifts for Fallen Knights)
    for (const pt of this.boss.portals) {
      const px = pt.wx * TILE_SIZE;
      const py = pt.wy * TILE_SIZE;
      const pct = Math.min(1, pt.elapsed / pt.duration);
      const openScale = pct < 0.75 ? pct / 0.75 : 1 - (pct - 0.75) / 0.25;
      const r = 42 * Math.max(0.25, openScale);
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1.25, 0.65);
      const pg = ctx.createRadialGradient(0, 0, 4, 0, 0, r);
      pg.addColorStop(0, 'rgba(9, 13, 28, 0.96)');
      pg.addColorStop(0.55, 'rgba(99, 102, 241, 0.65)');
      pg.addColorStop(0.82, 'rgba(56, 189, 248, 0.42)');
      pg.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Y-Sorted World Entities
    const drawList: { sortY: number; draw: () => void }[] = [];

    // Faction Buildings (Castle, Monastery, Archery, Barracks, Tower, Houses)
    for (const b of this.buildings) {
      drawList.push({
        sortY: (b.ty + b.th) * TILE_SIZE,
        draw: () => this.drawTinyBuilding(ctx, atlas, b),
      });
    }

    // Custom Hand-Painted Intel Festival Archways & Courtyard Lanterns in EXPO_PARK
    if (this.zone === 'EXPO_PARK') {
      drawList.push({
        sortY: 5.5 * TILE_SIZE,
        draw: () => this.drawIntelFestivalArch(ctx, atlas, 14.0, 5.5, 4.4, 'INTEL AI PC COURTYARD'),
      });
      drawList.push({
        sortY: 18.0 * TILE_SIZE,
        draw: () => this.drawIntelFestivalArch(ctx, atlas, 14.0, 18.0, 3.8, 'CORE ULTRA PAVILION'),
      });
      const lanterns = [
        [6.3, 6.4],
        [21.7, 6.4],
        [6.3, 16.4],
        [21.7, 16.4],
        [11.2, 16.8],
        [16.8, 16.8],
      ];
      for (const [lx, ly] of lanterns) {
        drawList.push({
          sortY: ly * TILE_SIZE,
          draw: () => this.drawFestivalLantern(ctx, lx, ly),
        });
      }
    }

    // Living World Props (Trees, Bushes, Gold Stones, Rocks)
    for (const p of this.props) {
      drawList.push({
        sortY: p.wy * TILE_SIZE,
        draw: () => this.drawTinyProp(ctx, atlas, p),
      });
    }

    // Pixel-Art Intel AI PC Hardware Booths, Core Ultra Chips & Laptops
    for (const ip of this.intelProps) {
      drawList.push({
        sortY: ip.wy * TILE_SIZE,
        draw: () => this.drawIntelHardwareProp(ctx, atlas, ip),
      });
    }

    // Roaming Animated Sheep (feet grounded at py)
    for (const s of this.sheep) {
      drawList.push({
        sortY: s.wy * TILE_SIZE,
        draw: () => {
          const px = s.wx * TILE_SIZE;
          const py = s.wy * TILE_SIZE;
          const sheet =
            s.state === 'MOVE'
              ? atlas.sheepMove
              : s.state === 'GRASS'
                ? atlas.sheepGrass
                : atlas.sheepIdle;
          this.drawTinyShadow(ctx, atlas, px, py, 36);
          this.drawSquareStrip(ctx, sheet, px, py + 25, 74, {
            fps: s.state === 'MOVE' ? 10 : 8,
            flipX: s.flipX,
            seed: Math.round(s.wx * 3),
          });
        },
      });
    }

    // Living Ecosystem Villagers (Pawns, Monks, Archers, Lancers — feet grounded at py)
    for (const v of this.villagers) {
      drawList.push({
        sortY: v.wy * TILE_SIZE,
        draw: () => {
          const px = v.wx * TILE_SIZE;
          const py = v.wy * TILE_SIZE;
          const u = atlas.units[v.faction];
          let strip = u.pawnIdle;
          let sizePx = 108;
          let yOff = 32;
          let shadowW = 42;
          let shadowXOff = 0;
          if (v.role === 'pawn_gold') {
            strip = v.state === 'MOVE' ? u.pawnRunGold : u.pawnIdleGold;
          } else if (v.role === 'monk') {
            strip = v.state === 'MOVE' ? u.monkRun : v.state === 'ACTION' ? u.monkHeal : u.monkIdle;
          } else if (v.role === 'archer') {
            strip = v.state === 'MOVE' ? u.archerRun : u.archerIdle;
          } else if (v.role === 'lancer') {
            strip = v.state === 'MOVE' ? u.lancerRun : u.lancerIdle;
            sizePx = 148;
            yOff = 56;
            shadowW = 48;
            shadowXOff = v.flipX ? 4 : -4;
          } else {
            strip = v.state === 'MOVE' ? u.pawnRun : v.state === 'ACTION' ? u.pawnInteractHammer : u.pawnIdle;
          }
          this.drawTinyShadow(ctx, atlas, px + shadowXOff, py + 1, shadowW);
          this.drawSquareStrip(ctx, strip, px, py + yOff, sizePx, {
            fps: v.state === 'MOVE' ? 11 : 8,
            flipX: v.flipX,
            seed: v.id * 5,
          });
        },
      });
    }

    // Dash Guard Afterimages
    for (const g of this.dashGhosts) {
      drawList.push({
        sortY: g.wy * TILE_SIZE - 1,
        draw: () => {
          this.drawSquareStrip(ctx, atlas.units.Blue.warriorGuard, g.wx * TILE_SIZE, g.wy * TILE_SIZE + 34, 118, {
            fps: 10,
            flipX: g.flipX,
            alpha: g.alpha * 0.65,
          });
        },
      });
    }

    // Trapped AI Tasks -> Rescued Intel AI PCs (minimal label only when nearby)
    for (const t of this.tasks) {
      drawList.push({
        sortY: t.wy * TILE_SIZE,
        draw: () => {
          const px = t.wx * TILE_SIZE;
          const py = t.wy * TILE_SIZE;
          const bob = Math.sin(this.elapsed * 4 + t.wx) * 2.5;
          const near = Math.hypot(t.wx - this.player.wx, t.wy - this.player.wy) < 3.4;
          ctx.save();
          this.drawTinyShadow(ctx, atlas, px, py + 5, 44);
          if (t.rescued) {
            ctx.drawImage(atlas.intelHardware.aiPc, px - 26, py - 46 + bob * 0.6, 52, 52);
          } else {
            const hl = atlas.goldHighlights[t.variant % atlas.goldHighlights.length];
            this.drawSquareStrip(ctx, hl, px, py + 12 + bob, 68, { fps: 10, seed: t.variant * 5 });
            ctx.drawImage(atlas.intelHardware.trapLaptop, px + 4, py - 34 + bob, 30, 30);
          }
          if (near) {
            ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = INK;
            ctx.fillText(t.rescued ? `${t.label} ✓` : t.label, px + 1, py - 46 + bob);
            ctx.fillStyle = t.rescued ? '#38BDF8' : '#FCA5A5';
            ctx.fillText(t.rescued ? `${t.label} ✓` : t.label, px, py - 47 + bob);
          }
          ctx.restore();
        },
      });
    }

    // Resource Pickups (Gold / Meat / Wood)
    for (const pk of this.pickups) {
      drawList.push({
        sortY: pk.wy * TILE_SIZE,
        draw: () => {
          const px = pk.wx * TILE_SIZE;
          const py = pk.wy * TILE_SIZE;
          const bob = Math.sin(this.elapsed * 5 + pk.bobOffset) * 3.5;
          this.drawTinyShadow(ctx, atlas, px, py + 5, 36);
          const img =
            pk.kind === 'meat'
              ? atlas.meatResource
              : pk.kind === 'gold'
                ? atlas.goldResource
                : atlas.woodResource;
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, px - 22, py - 32 + bob, 44, 44);
          ctx.restore();
        },
      });
    }

    // Story Mentors (clean minimal labels only when nearby)
    for (const n of this.npcs) {
      drawList.push({
        sortY: n.wy * TILE_SIZE,
        draw: () => {
          const px = n.wx * TILE_SIZE;
          const py = n.wy * TILE_SIZE;
          const near = Math.hypot(n.wx - this.player.wx, n.wy - this.player.wy) < 3.4;

          this.drawTinyShadow(ctx, atlas, px, py + 1, 46);
          const flipX = this.player.wx < n.wx;
          if (n.kind === 'npu') {
            this.drawSquareStrip(ctx, atlas.units.Purple.monkHeal, px, py + 34, 118, {
              fps: 10,
              flipX,
            });
          } else if (n.kind === 'arc') {
            this.drawSquareStrip(ctx, atlas.units.Yellow.archerIdle, px, py + 34, 116, {
              fps: 10,
              flipX,
            });
          } else {
            this.drawSquareStrip(ctx, atlas.units.Blue.monkIdle, px, py + 34, 116, {
              fps: 10,
              flipX,
            });
          }

          if (near) {
            ctx.save();
            ctx.font = '700 12px "Chakra Petch", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = INK;
            ctx.fillText(`[E] ${n.name}`, px + 1, py - 51);
            ctx.fillStyle = '#FCD34D';
            ctx.fillText(`[E] ${n.name}`, px, py - 52);
            ctx.restore();
          }
        },
      });
    }

    // Expo Park Sparring Champions (Warrior + Lancer sparring at every booth!)
    if (this.zone === 'EXPO_PARK') {
      for (const pc of EXPO_PC_CATALOG) {
        drawList.push({
          sortY: pc.wy * TILE_SIZE,
          draw: () => {
            const px = pc.wx * TILE_SIZE;
            const py = pc.wy * TILE_SIZE;
            const isMatch = pc.id === this.matchedPcId;
            const isTagged = this.taggedPcIds.has(pc.id);
            const near = Math.hypot(pc.wx - this.player.wx, pc.wy - this.player.wy) < 2.5;
            const fUnits = atlas.units[pc.factionColor];

            ctx.save();
            if (isMatch) {
              ctx.strokeStyle = 'rgba(245, 158, 11, 0.92)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.ellipse(px, py + 2, 48, 18, 0, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.restore();

            // Left sparring Warrior + Right sparring Lancer clashing with Fire FX!
            const cycle = (this.elapsed * 1.55 + pc.wx * 0.7) % 2.2;
            const wStrip =
              cycle < 0.85 ? fUnits.warriorAttack1 : cycle < 1.35 ? fUnits.warriorGuard : fUnits.warriorIdle;
            this.drawTinyShadow(ctx, atlas, px - 22, py + 1, 44);
            this.drawSquareStrip(ctx, wStrip, px - 22, py + 32, 112, { fps: 10, flipX: false });

            const lStrip =
              cycle >= 0.45 && cycle < 1.35 ? fUnits.lancerRightAttack : fUnits.lancerIdle;
            this.drawTinyShadow(ctx, atlas, px + 29, py + 1, 50);
            this.drawSquareStrip(ctx, lStrip, px + 24, py + 59, 156, { fps: 10, flipX: true });

            if (cycle >= 0.48 && cycle < 1.18) {
              const clashPct = (cycle - 0.48) / 0.7;
              const fireSheet =
                pc.factionColor === 'Red' || pc.factionColor === 'Yellow'
                  ? atlas.fx.fire2
                  : pc.factionColor === 'Black'
                    ? atlas.fx.fire3
                    : atlas.fx.fire1;
              const fh = fireSheet.height;
              const totalF = Math.max(1, Math.round(fireSheet.width / fh));
              const fIdx = Math.min(totalF - 1, Math.floor(clashPct * totalF));
              ctx.save();
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(fireSheet, fIdx * fh, 0, fh, fh, Math.round(px - 28), Math.round(py - 46), 56, 56);
              ctx.restore();
            }

            if (isMatch) {
              this.drawGoldenCrown(ctx, px - 22, py - 56);
              ctx.save();
              ctx.font = '700 12px "Chakra Petch", sans-serif';
              ctx.textAlign = 'center';
              ctx.fillStyle = INK;
              ctx.fillText('★ YOUR BEST MATCH', px + 1, py - 71);
              ctx.fillStyle = '#FCD34D';
              ctx.fillText('★ YOUR BEST MATCH', px, py - 72);
              ctx.restore();
            }

            ctx.save();
            ctx.font = '700 12px "Chakra Petch", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = INK;
            ctx.fillText(near ? `[E] ${pc.name}` : isTagged ? `${pc.name} ★` : pc.name, px + 1, py + 23);
            ctx.fillStyle = near ? '#F59E0B' : isTagged ? '#34D399' : '#FFFFFF';
            ctx.fillText(near ? `[E] ${pc.name}` : isTagged ? `${pc.name} ★` : pc.name, px, py + 22);
            ctx.restore();
          },
        });
      }
    }

    // Faction Enemies + Spectral Fallen Knights Rising From Ground Portals
    for (const e of this.enemies) {
      drawList.push({
        sortY: e.wy * TILE_SIZE,
        draw: () => {
          const px = e.wx * TILE_SIZE;
          const py = e.wy * TILE_SIZE;
          const u = atlas.units[e.faction];

          let strip = u.warriorIdle;
          let sizePx = 114;
          let yOff = 33;
          let shadowW = 46;
          let shadowXOff = 0;
          if (e.unitClass === 'red_pawn') {
            strip = e.state === 'LUNGE' ? u.pawnRun : e.state === 'WINDUP' ? u.pawnInteractHammer : u.pawnIdle;
          } else if (e.unitClass.includes('archer')) {
            strip = e.shootTimer > 1.85 ? u.archerShoot : e.state === 'LUNGE' ? u.archerRun : u.archerIdle;
          } else if (e.unitClass === 'purple_lancer') {
            strip = e.state === 'LUNGE' ? u.lancerRightAttack : u.lancerIdle;
            sizePx = 160;
            yOff = 61;
            shadowW = 52;
            shadowXOff = e.flipX ? 5 : -5;
          } else if (e.unitClass === 'spectral_knight') {
            strip =
              e.state === 'LUNGE'
                ? u.warriorAttack2
                : e.state === 'WINDUP'
                  ? u.warriorGuard
                  : e.state === 'PATROL'
                    ? u.warriorRun
                    : u.warriorIdle;
            sizePx = 118;
            yOff = 34;
          } else {
            strip =
              e.state === 'LUNGE'
                ? u.warriorAttack1
                : e.state === 'WINDUP'
                  ? u.warriorGuard
                  : u.warriorIdle;
          }

          if (e.isSpectral) {
            const risePct =
              e.riseElapsed !== undefined && e.riseDuration
                ? Math.min(1, e.riseElapsed / e.riseDuration)
                : 1;
            // Grounded spectral portal shadow ring while knight rises
            ctx.save();
            ctx.translate(px, py + 2);
            ctx.scale(1.2, 0.58);
            const pg = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
            pg.addColorStop(0, 'rgba(15, 23, 42, 0.72)');
            pg.addColorStop(0.65, 'rgba(56, 189, 248, 0.32)');
            pg.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = pg;
            ctx.beginPath();
            ctx.arc(0, 0, 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            if (risePct < 1) {
              ctx.beginPath();
              ctx.rect(px - 70, py - 120, 140, 124);
              ctx.clip();
            }
            const sinkOffset = (1 - risePct) * 64;
            this.drawSpectralStrip(ctx, strip, px, py + yOff + sinkOffset, sizePx, {
              fps: 12,
              flipX: e.flipX,
              hitFlash: e.hitFlash > 0,
              alpha: 0.88,
              seed: e.id * 5,
            });
            ctx.restore();
          } else {
            this.drawTinyShadow(ctx, atlas, px + shadowXOff, py + 1, shadowW);
            this.drawSquareStrip(ctx, strip, px, py + yOff, sizePx, {
              fps: e.state === 'WINDUP' ? 14 : 11,
              flipX: e.flipX,
              hitFlash: e.hitFlash > 0,
              seed: e.id * 3,
            });
          }

          // Pure sprite-based windup glint at weapon side
          if (e.state === 'WINDUP') {
            const sparkSheet = e.isSpectral ? atlas.fx.fire3 : atlas.fx.fire1;
            const fh = sparkSheet.height;
            const totalF = Math.max(1, Math.round(sparkSheet.width / fh));
            const fIdx = Math.floor(this.elapsed * 16 + e.id) % totalF;
            const sparkX = px + (e.flipX ? -22 : 22);
            const sparkY = py - 24;
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.globalAlpha = 0.88;
            ctx.drawImage(sparkSheet, fIdx * fh, 0, fh, fh, Math.round(sparkX - 18), Math.round(sparkY - 18), 36, 36);
            ctx.restore();
          }

          // Slim, borderless micro HP bar only when actively wounded
          if (e.hp < e.maxHp) {
            const pct = Math.max(0, e.hp / e.maxHp);
            ctx.save();
            ctx.fillStyle = 'rgba(11, 17, 32, 0.72)';
            ctx.beginPath();
            ctx.roundRect(px - 15, py - 48, 30, 3.5, 2);
            ctx.fill();
            ctx.fillStyle = e.isSpectral ? '#38BDF8' : '#EF4444';
            ctx.beginPath();
            ctx.roundRect(px - 15, py - 48, 30 * pct, 3.5, 2);
            ctx.fill();
            ctx.restore();
          }
        },
      });
    }

    // Giant Black Warrior Lag Titan Boss -> Splits at 50% HP into Twin Mini-Bosses!
    if (this.zone === 'SILICON_CITY' && this.boss.hp > 0) {
      const bu = atlas.units.Black;
      if (this.boss.splitActive) {
        for (const twin of this.boss.twins) {
          if (twin.hp <= 0) continue;
          drawList.push({
            sortY: twin.wy * TILE_SIZE,
            draw: () => {
              const px = twin.wx * TILE_SIZE;
              const py = twin.wy * TILE_SIZE;
              this.drawTinyShadow(ctx, atlas, px, py + 2, 76);

              const strip =
                twin.state === 'WINDUP_SLAM'
                  ? bu.warriorAttack1
                  : twin.state === 'WINDUP_FAN'
                    ? bu.warriorAttack2
                    : twin.state === 'IDLE'
                      ? bu.warriorRun
                      : bu.warriorGuard;

              this.drawSquareStrip(ctx, strip, px, py + 50, 172, {
                fps: 12,
                flipX: twin.flipX,
                hitFlash: twin.hitFlash > 0,
                seed: twin.id * 7,
              });

              // Compact twin aura fire FX (sprite only)
              const wispSheet = twin.id === 1 ? atlas.fx.fire2 : atlas.fx.fire3;
              const fh = wispSheet.height;
              const totalF = Math.max(1, Math.round(wispSheet.width / fh));
              const fIdx = Math.floor(this.elapsed * 14 + twin.id * 3) % totalF;
              ctx.save();
              ctx.imageSmoothingEnabled = false;
              ctx.globalAlpha = 0.72;
              ctx.drawImage(wispSheet, fIdx * fh, 0, fh, fh, Math.round(px - 22), Math.round(py - 84), 44, 44);
              ctx.restore();
            },
          });
        }
      } else {
        drawList.push({
          sortY: this.boss.wy * TILE_SIZE,
          draw: () => {
            const px = this.boss.wx * TILE_SIZE;
            const py = this.boss.wy * TILE_SIZE;
            this.drawTinyShadow(ctx, atlas, px, py + 2, 108);

            const strip =
              this.boss.shield > 0 && this.boss.state === 'IDLE'
                ? bu.warriorGuard
                : this.boss.state === 'WINDUP_SLAM' || this.boss.state === 'WINDUP_RING'
                  ? this.boss.attackCombo === 0
                    ? bu.warriorAttack1
                    : bu.warriorAttack2
                  : this.boss.state === 'WINDUP_FAN'
                    ? bu.warriorAttack2
                    : bu.warriorIdle;

            this.drawSquareStrip(ctx, strip, px, py + 69, 240, {
              fps: 11,
              flipX: this.player.wx < this.boss.wx,
              hitFlash: this.boss.hitFlash > 0,
            });

            // Orbiting sprite fire3 wisps when RGB Shield is active
            if (this.boss.shield > 0) {
              const wispSheet = atlas.fx.fire3;
              const fh = wispSheet.height;
              const totalF = Math.max(1, Math.round(wispSheet.width / fh));
              const fIdx = Math.floor(this.elapsed * 14) % totalF;
              ctx.save();
              ctx.imageSmoothingEnabled = false;
              ctx.globalAlpha = 0.85;
              for (let k = 0; k < 4; k++) {
                const ang = this.elapsed * 2.8 + (k * Math.PI) / 2;
                const wx = px + Math.cos(ang) * 62;
                const wy = py - 38 + Math.sin(ang) * 32;
                ctx.drawImage(wispSheet, fIdx * fh, 0, fh, fh, Math.round(wx - 22), Math.round(wy - 22), 44, 44);
              }
              ctx.restore();
            }
          },
        });
      }
    }

    // Byte Hero (Blue Pawn in Act I -> Blue Warrior in Silicon City & Expo Park!)
    drawList.push({
      sortY: this.player.wy * TILE_SIZE,
      draw: () => {
        const px = this.player.wx * TILE_SIZE;
        const py = this.player.wy * TILE_SIZE;

        // Ground stagelight pool beneath Byte (broad, ultra-soft wash)
        ctx.save();
        ctx.translate(px, py + 2);
        ctx.scale(1.3, 0.72);
        const poolGrad = ctx.createRadialGradient(0, 0, 18, 0, 0, 155);
        if (this.player.xessBuffTimer > 0) {
          poolGrad.addColorStop(0, 'rgba(186, 230, 253, 0.16)');
          poolGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.06)');
        } else {
          poolGrad.addColorStop(0, 'rgba(255, 248, 224, 0.14)');
          poolGrad.addColorStop(0.5, 'rgba(253, 230, 138, 0.05)');
        }
        poolGrad.addColorStop(1, 'rgba(255, 248, 224, 0)');
        ctx.fillStyle = poolGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 155, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        this.drawTinyShadow(ctx, atlas, px, py + 1, 48);
        const flashAlpha =
          this.player.invulnTimer > 0 && Math.floor(this.elapsed * 18) % 2 === 0 ? 0.5 : 1;

        const blue = atlas.units.Blue;
        let strip = this.player.heroForm === 'pawn' ? blue.pawnIdle : blue.warriorIdle;
        let fps = 10;

        if (this.player.heroForm === 'pawn') {
          if (this.player.moving) {
            strip = blue.pawnRun;
            fps = 12;
          }
        } else {
          if (this.player.dashTimer > 0) {
            strip = blue.warriorGuard;
            fps = 14;
          } else if (this.player.attackTimer > 0) {
            strip = this.player.attackAlt ? blue.warriorAttack1 : blue.warriorAttack2;
            fps = 18;
          } else if (this.player.moving) {
            strip = blue.warriorRun;
            fps = 13;
          }
        }

        this.drawSquareStrip(ctx, strip, px, py + 34, 118, {
          fps,
          flipX: this.player.flipX,
          hitFlash: this.player.hitFlash > 0,
          alpha: flashAlpha,
        });

        // Subtle wide overhead stagelight wash (diffused, no hard edges)
        ctx.save();
        const beamGrad = ctx.createLinearGradient(px - 40, py - 280, px, py + 36);
        beamGrad.addColorStop(0, 'rgba(255, 251, 235, 0)');
        beamGrad.addColorStop(0.5, 'rgba(255, 249, 224, 0.025)');
        beamGrad.addColorStop(1, 'rgba(255, 248, 220, 0.045)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(px - 110, py - 280);
        ctx.lineTo(px + 80, py - 280);
        ctx.lineTo(px + 150, py + 36);
        ctx.lineTo(px - 150, py + 36);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        if (this.player.xessBuffTimer > 0) {
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(px, py + 2, 32, 13, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      },
    });

    drawList.sort((a, b) => a.sortY - b.sortY);
    for (const item of drawList) item.draw();

    // 6. Arrows/Projectiles, Tiny Swords Sprite FX, Particles & Floating Text (zero thick arc shapes)

    for (const p of this.projectiles) {
      const px = p.wx * TILE_SIZE;
      const py = p.wy * TILE_SIZE - 16;
      if (p.arrowFaction) {
        const ang = Math.atan2(p.vy, p.vx);
        const arrowImg = atlas.units[p.arrowFaction].arrow;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(px, py);
        ctx.rotate(ang);
        ctx.drawImage(arrowImg, -22, -22, 44, 44);
        ctx.restore();
      } else {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    this.renderSpriteVfx(ctx, atlas);

    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (ft.life / ft.maxLife) * 1.4);
      ctx.font = '700 13px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = INK;
      ctx.fillText(ft.text, ft.wx * TILE_SIZE + 1.5, ft.wy * TILE_SIZE - 34 + 1.5);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.wx * TILE_SIZE, ft.wy * TILE_SIZE - 34);
      ctx.restore();
    }

    // 7. Doubled Overhead Clouds across 2 gentle parallax drift bands (storm-tinted on Boss Island)
    for (const c of this.clouds) {
      const baseImg = atlas.clouds[c.variant % atlas.clouds.length];
      const img = this.stormIntensity > 0.45 ? this.getStormCloudCanvas(c.variant, baseImg) : baseImg;
      const baseX = c.wx * TILE_SIZE;
      const baseY = c.wy * TILE_SIZE;
      const parallax = c.layer === 1 ? 0.18 : 0.11;
      const cx = baseX + (baseX - this.camX) * parallax;
      const cy = baseY + (baseY - this.camY) * parallax;
      const dw = 480 * c.scale * (1 + this.stormIntensity * 0.14);
      const dh = (img.height / img.width) * dw;
      ctx.save();
      ctx.globalAlpha = (c.layer === 1 ? 0.78 : 0.56) + this.stormIntensity * 0.14;
      ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
      ctx.restore();
    }

    ctx.restore();

    const heroSx =
      (this.player.wx * TILE_SIZE - this.camX) * this.camZoom + vw / 2 + shakeX + trapJitter;
    const heroSy =
      (this.player.wy * TILE_SIZE - 26 - this.camY) * this.camZoom + vh / 2 + shakeY;
    this.renderSpotlightAndBlur(ctx, vw, vh, heroSx, heroSy, dist);
  }

  private renderSpotlightAndBlur(
    ctx: CanvasRenderingContext2D,
    vw: number,
    vh: number,
    heroSx: number,
    heroSy: number,
    dist: DistrictId
  ): void {
    if (vw <= 0 || vh <= 0 || this.canvas.width <= 0 || this.canvas.height <= 0) return;

    const isTrap = dist === 'TRAP_ALLEY' && !this.trapCompleted;
    const isBoss = dist === 'BOSS_COLOSSEUM' || this.stormIntensity > 0.25;

    // Crisp sunlit clarity in Silicon City; restrained edge depth only in Trap / Boss zones
    if (isTrap || isBoss) {
      const bw = Math.max(180, Math.round(vw * 0.28));
      const bh = Math.max(100, Math.round(vh * 0.28));
      if (!this.blurCanvas) {
        this.blurCanvas = document.createElement('canvas');
        this.blurCtx = this.blurCanvas.getContext('2d');
      }
      if (this.blurCanvas.width !== bw || this.blurCanvas.height !== bh) {
        this.blurCanvas.width = bw;
        this.blurCanvas.height = bh;
      }

      const bctx = this.blurCtx;
      if (bctx) {
        bctx.save();
        bctx.globalCompositeOperation = 'source-over';
        bctx.fillStyle = '#070d1a';
        bctx.fillRect(0, 0, bw, bh);
        bctx.filter = 'blur(1.5px)';
        bctx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, bw, bh);
        bctx.filter = 'none';

        bctx.globalCompositeOperation = 'destination-out';
        const sx = heroSx * (bw / vw);
        const sy = heroSy * (bh / vh);
        const bDiag = Math.hypot(bw, bh);
        const eraseGrad = bctx.createRadialGradient(sx, sy, bDiag * 0.34, sx, sy, bDiag * 0.94);
        eraseGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        eraseGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.55)');
        eraseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        bctx.fillStyle = eraseGrad;
        bctx.fillRect(0, 0, bw, bh);
        bctx.restore();

        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.globalAlpha = isTrap ? 1 : Math.max(0.25, this.stormIntensity);
        ctx.drawImage(this.blurCanvas, 0, 0, bw, bh, 0, 0, vw, vh);
        ctx.restore();
      }
    }

    // Distinct Per-Island Weather & Atmospheric Glaze (immediately visible when crossing bridges)
    const wTrap = this.weatherMix.TRAP_ALLEY;
    const wEcore = this.weatherMix.ECORE_PARK;
    const wPlaza = this.weatherMix.COPPER_PLAZA;
    const wNpu = this.weatherMix.NPU_LIBRARY;
    const wArc = this.weatherMix.ARC_ARENA;
    const wBoss = Math.max(this.stormIntensity, this.weatherMix.BOSS_COLOSSEUM);
    const wExpo = this.weatherMix.EXPO_PARK;

    // 1) Study Cove (1:47 AM Dark Midnight Smog + Rising Embers)
    if (wTrap > 0.04) {
      ctx.save();
      ctx.fillStyle = `rgba(18, 11, 28, ${0.34 * wTrap})`;
      ctx.fillRect(0, 0, vw, vh);
      for (let i = 0; i < 24; i++) {
        const m = this.weatherMotes[i];
        const mx = m.x * vw;
        const my = m.y * vh;
        const pulse = 0.45 + 0.55 * Math.sin(this.elapsed * 4 + m.phase);
        ctx.fillStyle = i % 2 === 0 ? `rgba(251, 146, 60, ${0.58 * pulse * wTrap})` : `rgba(248, 113, 113, ${0.5 * pulse * wTrap})`;
        ctx.beginPath();
        ctx.arc(mx, my, m.size * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2) Harbor of Quiet Hours (Crisp Morning Sunbeams + Meadow Mist & Pollen)
    if (wEcore > 0.04) {
      ctx.save();
      const beamGrad = ctx.createLinearGradient(0, 0, vw * 0.65, vh * 0.75);
      beamGrad.addColorStop(0, `rgba(254, 249, 195, ${0.22 * wEcore})`);
      beamGrad.addColorStop(0.55, `rgba(187, 247, 208, ${0.1 * wEcore})`);
      beamGrad.addColorStop(1, 'rgba(254, 249, 195, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, vw, vh);

      for (let i = 0; i < 26; i++) {
        const m = this.weatherMotes[i];
        ctx.fillStyle = `rgba(254, 240, 138, ${0.42 * wEcore})`;
        ctx.beginPath();
        ctx.arc(m.x * vw, m.y * vh, m.size * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3) Copper Bus Plaza (Warm Brisk Midday Breeze + Golden Sparks)
    if (wPlaza > 0.04) {
      ctx.save();
      ctx.fillStyle = `rgba(253, 230, 138, ${0.07 * wPlaza})`;
      ctx.fillRect(0, 0, vw, vh);
      for (let i = 10; i < 32; i++) {
        const m = this.weatherMotes[i];
        ctx.fillStyle = `rgba(251, 191, 36, ${0.44 * wPlaza})`;
        ctx.beginPath();
        ctx.ellipse(m.x * vw, m.y * vh, m.size * 1.4, m.size * 0.55, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 4) Library of Unspoken Notes (Twilight Indigo Overcast + Gentle Drizzle + Glowing Fireflies)
    if (wNpu > 0.04) {
      ctx.save();
      ctx.fillStyle = `rgba(30, 22, 66, ${0.26 * wNpu})`;
      ctx.fillRect(0, 0, vw, vh);

      // Soft twilight drizzle
      ctx.strokeStyle = `rgba(196, 181, 253, ${0.24 * wNpu})`;
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      for (let i = 0; i < this.rainDrops.length; i += 2) {
        const rd = this.rainDrops[i];
        const rx = rd.x * vw;
        const ry = rd.y * vh;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - rd.len * 0.16, ry + rd.len * 0.7);
      }
      ctx.stroke();

      // Glowing lavender/cyan fireflies
      for (let i = 0; i < 24; i++) {
        const m = this.weatherMotes[i];
        const glow = 0.4 + 0.6 * Math.sin(this.elapsed * 3.2 + m.phase);
        const fx = m.x * vw;
        const fy = m.y * vh;
        ctx.fillStyle = i % 2 === 0 ? `rgba(103, 232, 249, ${0.68 * glow * wNpu})` : `rgba(216, 180, 254, ${0.68 * glow * wNpu})`;
        ctx.beginPath();
        ctx.arc(fx, fy, m.size * 0.95, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5) Dawn Horizon Arena (Golden-Orange Sunset Sky + Fast Wind Gust Streaks)
    if (wArc > 0.04) {
      ctx.save();
      const sunsetGrad = ctx.createLinearGradient(vw, 0, 0, vh);
      sunsetGrad.addColorStop(0, `rgba(249, 115, 22, ${0.28 * wArc})`);
      sunsetGrad.addColorStop(0.5, `rgba(245, 158, 11, ${0.14 * wArc})`);
      sunsetGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunsetGrad;
      ctx.fillRect(0, 0, vw, vh);

      ctx.strokeStyle = `rgba(253, 224, 71, ${0.28 * wArc})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < 22; i++) {
        const m = this.weatherMotes[i];
        const wx = m.x * vw;
        const wy = m.y * vh;
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx - 28 - (i % 3) * 14, wy + 4);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 6) Burnout Citadel (Boss Island Storm: Heavy Rain + Dark Storm Pallor + Branching Lightning)
    if (wBoss > 0.04) {
      ctx.save();
      ctx.fillStyle = `rgba(9, 17, 36, ${0.32 * wBoss})`;
      ctx.fillRect(0, 0, vw, vh);

      ctx.strokeStyle = `rgba(186, 230, 253, ${0.34 * wBoss})`;
      ctx.lineWidth = 1.35;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (const rd of this.rainDrops) {
        const rx = rd.x * vw;
        const ry = rd.y * vh;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - rd.len * 0.34, ry + rd.len);
      }
      ctx.stroke();

      if (this.lightningFlash > 0.02) {
        const boltX = vw * (0.2 + ((this.lightningSeed % 60) / 100));
        ctx.strokeStyle = `rgba(224, 242, 254, ${this.lightningFlash * 0.92})`;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(boltX, 0);
        ctx.lineTo(boltX - 18, vh * 0.14);
        ctx.lineTo(boltX + 14, vh * 0.24);
        ctx.lineTo(boltX - 24, vh * 0.42);
        ctx.stroke();

        ctx.fillStyle = `rgba(224, 242, 254, ${this.lightningFlash * 0.26})`;
        ctx.fillRect(0, 0, vw, vh);
      }
      ctx.restore();
    }

    // 7) Post-Boss Festival Courtyard (Clear Radiant Dawn Warmth)
    if (wExpo > 0.04) {
      ctx.save();
      const dawnGrad = ctx.createRadialGradient(vw * 0.5, vh * 0.18, 40, vw * 0.5, vh * 0.5, Math.hypot(vw, vh) * 0.65);
      dawnGrad.addColorStop(0, `rgba(254, 240, 138, ${0.14 * wExpo})`);
      dawnGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = dawnGrad;
      ctx.fillRect(0, 0, vw, vh);
      ctx.restore();
    }

    const vDiag = Math.hypot(vw, vh);

    // Warm sunlit daylight ambient lift around hero
    const spotGlow = ctx.createRadialGradient(heroSx, heroSy, 28, heroSx, heroSy, vDiag * 0.55);
    spotGlow.addColorStop(0, 'rgba(255, 252, 240, 0.07)');
    spotGlow.addColorStop(0.5, 'rgba(224, 242, 254, 0.025)');
    spotGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGlow;
    ctx.fillRect(0, 0, vw, vh);

    // Balanced peripheral framing
    const darkVig = ctx.createRadialGradient(heroSx, heroSy, vDiag * 0.32, heroSx, heroSy, vDiag * 0.96);
    darkVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    darkVig.addColorStop(0.58, isTrap ? 'rgba(42, 7, 14, 0.16)' : 'rgba(6, 12, 24, 0.07)');
    darkVig.addColorStop(
      1,
      isTrap ? 'rgba(18, 3, 7, 0.52)' : isBoss ? 'rgba(2, 5, 14, 0.54)' : 'rgba(6, 14, 28, 0.24)'
    );
    ctx.fillStyle = darkVig;
    ctx.fillRect(0, 0, vw, vh);
  }

  private renderTinySwordsIslands(
    ctx: CanvasRenderingContext2D,
    atlas: TinySwordsAtlas,
    vw: number,
    vh: number
  ): void {
    const halfW = vw / (2 * this.camZoom);
    const halfH = vh / (2 * this.camZoom);
    const tx0 = Math.max(-3, Math.floor((this.camX - halfW) / TILE_SIZE) - 2);
    const tx1 = Math.min(this.mapW + 2, Math.ceil((this.camX + halfW) / TILE_SIZE) + 2);
    const ty0 = Math.max(-3, Math.floor((this.camY - halfH) / TILE_SIZE) - 2);
    const ty1 = Math.min(this.mapH + 2, Math.ceil((this.camY + halfH) / TILE_SIZE) + 2);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const isLand = (x: number, y: number): boolean => {
      if (x < 0 || y < 0 || x >= this.mapW || y >= this.mapH) return false;
      return this.map[y][x] !== 0;
    };

    const getTilemapFor = (g: GroundKind): HTMLImageElement => {
      if (g === 2) return atlas.tilemaps[0]; // E-Core Lush Green
      if (g === 4) return atlas.tilemaps[1]; // NPU Cool Teal
      if (g === 3 || g === 7) return atlas.tilemaps[2]; // Copper Bridges & Expo Plaza
      if (g === 5) return atlas.tilemaps[3]; // Arc Slate/Amber
      return atlas.tilemaps[4]; // Trap Alley & Black Colosseum
    };

    // Pass 1: Animated Water Background + Soft Masked Ocean Foam distributed across open water (shorelines kept clear!)
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const px = tx * TILE_SIZE;
        const py = ty * TILE_SIZE;
        ctx.drawImage(atlas.waterBg, 0, 0, 64, 64, px, py, TILE_SIZE, TILE_SIZE);

        if (!isLand(tx, ty)) {
          const nearShore =
            isLand(tx - 1, ty) ||
            isLand(tx + 1, ty) ||
            isLand(tx, ty - 1) ||
            isLand(tx, ty + 1) ||
            isLand(tx - 1, ty - 1) ||
            isLand(tx + 1, ty - 1) ||
            isLand(tx - 1, ty + 1) ||
            isLand(tx + 1, ty + 1);
          if (!nearShore) {
            const hash = (Math.imul(tx + 17, 73856093) ^ Math.imul(ty + 31, 19349663)) >>> 0;
            if (hash % 5 === 0) {
              const frame = Math.floor(this.elapsed * 7 + (hash % 16)) % 16;
              ctx.save();
              ctx.globalAlpha = 0.36;
              ctx.drawImage(
                atlas.waterFoamMasked,
                frame * 192,
                0,
                192,
                192,
                px - TILE_SIZE * 0.75,
                py - TILE_SIZE * 0.75,
                TILE_SIZE * 2.5,
                TILE_SIZE * 2.5
              );
              ctx.restore();
            }
          }
        }
      }
    }

    // Pass 2: Island Cliff Walls beneath south edges + Island Turf Autotiling (Tilemap_color1..5)
    for (let ty = Math.max(0, ty0); ty <= Math.min(this.mapH - 1, ty1); ty++) {
      for (let tx = Math.max(0, tx0); tx <= Math.min(this.mapW - 1, tx1); tx++) {
        const g = this.map[ty][tx];
        if (g === 0) continue;

        const px = tx * TILE_SIZE;
        const py = ty * TILE_SIZE;
        const effG: GroundKind =
          g === 8 || g === 9 ? (this.zone === 'EXPO_PARK' ? 7 : 3) : g;
        const sheet = getTilemapFor(effG);

        const nL = isLand(tx - 1, ty);
        const nR = isLand(tx + 1, ty);
        const nU = isLand(tx, ty - 1);
        const nD = isLand(tx, ty + 1);

        // Draw Tiny Swords cliff base below south shoreline
        if (!nD) {
          const cliffCol = !nL ? 5 : !nR ? 7 : 6;
          ctx.drawImage(sheet, cliffCol * 64, 4 * 64, 64, 64, px, py + TILE_SIZE * 0.55, TILE_SIZE, TILE_SIZE);
        }

        // Autotile grass/turf 3x3 block (cols 0..2, rows 0..2)
        const col = !nL ? 0 : !nR ? 2 : 1;
        const row = !nU ? 0 : !nD ? 2 : 1;
        ctx.drawImage(sheet, col * 64, row * 64, 64, 64, px, py, TILE_SIZE, TILE_SIZE);

        // Subtle district glaze on Trap Alley & Colosseum
        if (g === 1) {
          ctx.fillStyle = 'rgba(153, 27, 27, 0.16)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (g === 6) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    ctx.restore();
  }

  private getCloudShadowCanvas(variant: number, img: HTMLImageElement): HTMLCanvasElement {
    const existing = this.cloudShadowCache.get(variant);
    if (existing) return existing;
    const c = document.createElement('canvas');
    c.width = Math.max(1, img.width);
    c.height = Math.max(1, img.height);
    const sctx = c.getContext('2d');
    if (sctx) {
      sctx.drawImage(img, 0, 0);
      sctx.globalCompositeOperation = 'source-in';
      sctx.fillStyle = '#091526';
      sctx.fillRect(0, 0, c.width, c.height);
    }
    this.cloudShadowCache.set(variant, c);
    return c;
  }

  private getStormCloudCanvas(variant: number, img: HTMLImageElement): HTMLCanvasElement {
    const existing = this.stormCloudCache.get(variant);
    if (existing) return existing;
    const c = document.createElement('canvas');
    c.width = Math.max(1, img.width);
    c.height = Math.max(1, img.height);
    const sctx = c.getContext('2d');
    if (sctx) {
      sctx.drawImage(img, 0, 0);
      sctx.globalCompositeOperation = 'source-atop';
      sctx.fillStyle = 'rgba(30, 41, 59, 0.56)';
      sctx.fillRect(0, 0, c.width, c.height);
    }
    this.stormCloudCache.set(variant, c);
    return c;
  }

  private drawIntelHardwareProp(
    ctx: CanvasRenderingContext2D,
    atlas: TinySwordsAtlas,
    ip: IntelHardwareProp
  ): void {
    const px = ip.wx * TILE_SIZE;
    const py = ip.wy * TILE_SIZE;
    const near = Math.hypot(ip.wx - this.player.wx, ip.wy - this.player.wy) < 2.65;
    const isCustomStall = ip.kind.startsWith('stall');
    const isBooth = ip.kind === 'booth';
    const bob = isCustomStall || isBooth ? 0 : Math.sin(this.elapsed * 2.6 + ip.wx) * 1.5;
    ctx.save();
    ctx.imageSmoothingEnabled = !isCustomStall;

    if (isCustomStall) {
      const img =
        ip.kind === 'stallStudent'
          ? atlas.courtyard.stallStudent
          : ip.kind === 'stallGaming'
            ? atlas.courtyard.stallGaming
            : atlas.courtyard.stallCreator;
      const w = 158;
      const h = Math.round((img.height / Math.max(1, img.width)) * w);
      this.drawTinyShadow(ctx, atlas, px, py + 8, 134);
      ctx.drawImage(img, Math.round(px - w / 2), Math.round(py - h + 20), w, h);
    } else if (isBooth) {
      const img = atlas.intelHardware.booth;
      const w = 134;
      const h = Math.round((img.height / img.width) * w);
      this.drawTinyShadow(ctx, atlas, px, py + 7, 122);
      ctx.drawImage(img, Math.round(px - w / 2), Math.round(py - h + 14), w, h);
    } else {
      const pw = 66;
      const ph = 20;
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(Math.round(px - pw / 2), Math.round(py - ph / 2 + 5), pw, ph, 7);
      ctx.fill();
      ctx.strokeStyle = this.zone === 'EXPO_PARK' ? '#00C7FD' : ip.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(Math.round(px - pw / 2 + 1), Math.round(py - ph / 2 + 4), pw - 2, ph - 3, 6);
      ctx.stroke();
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(Math.round(px - pw / 2 + 4), Math.round(py - ph / 2 + 3), pw - 8, ph - 6, 5);
      ctx.fill();

      if (ip.kind === 'chip') {
        const img = atlas.intelHardware.chip;
        this.drawTinyShadow(ctx, atlas, px, py + 6, 48);
        ctx.drawImage(img, Math.round(px - 26), Math.round(py - 48 + bob), 52, 52);
      } else if (ip.kind === 'aiPc') {
        const img = atlas.intelHardware.aiPc;
        this.drawTinyShadow(ctx, atlas, px, py + 6, 48);
        ctx.drawImage(img, Math.round(px - 27), Math.round(py - 48 + bob), 54, 54);
      } else {
        const img = atlas.intelHardware.trapLaptop;
        this.drawTinyShadow(ctx, atlas, px, py + 6, 48);
        ctx.drawImage(img, Math.round(px - 27), Math.round(py - 48 + bob), 54, 54);
      }
    }

    // Minimal nameplate shown only when Byte approaches within proximity
    if (near) {
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const lw = ctx.measureText(ip.label).width + 14;
      const labelY = py + 16;
      ctx.fillStyle = 'rgba(0, 85, 155, 0.94)';
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px - lw / 2, labelY, lw, 17, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText(ip.label, px, labelY + 12);
    }
    ctx.restore();
  }

  private drawStoryRouteLanternGround(ctx: CanvasRenderingContext2D): void {
    // Warm guiding lantern pools along bridges & crossroads + quiet midnight study lamp on Study Cove
    const spots: { wx: number; wy: number; color: string; r: number }[] = [
      { wx: 6.5, wy: 29.0, color: 'rgba(251, 191, 36, 0.2)', r: 85 }, // 1:47 AM desk lamp aura
      { wx: 14.5, wy: 28.0, color: 'rgba(56, 189, 248, 0.16)', r: 70 }, // Bridge beacon
      { wx: 23.5, wy: 27.5, color: 'rgba(16, 185, 129, 0.14)', r: 95 }, // Harbor of Quiet Hours
      { wx: 23.5, wy: 16.0, color: 'rgba(0, 199, 253, 0.16)', r: 120 }, // Copper Plaza hub
      { wx: 8.0, wy: 15.8, color: 'rgba(168, 85, 247, 0.15)', r: 90 }, // Library of Unspoken Notes
      { wx: 38.0, wy: 15.8, color: 'rgba(245, 158, 11, 0.15)', r: 90 }, // Dawn Horizon Arena
    ];
    ctx.save();
    for (const s of spots) {
      const px = s.wx * TILE_SIZE;
      const py = s.wy * TILE_SIZE;
      const grad = ctx.createRadialGradient(px, py, 6, px, py, s.r);
      grad.addColorStop(0, s.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawExpoCourtyardGround(ctx: CanvasRenderingContext2D, atlas: TinySwordsAtlas): void {
    const cx = 14.0 * TILE_SIZE;
    const cy = 11.2 * TILE_SIZE;
    const stonePathImg = atlas.courtyard.stonePath;
    const stonePlazaImg = atlas.courtyard.stonePlaza;

    ctx.save();
    ctx.imageSmoothingEnabled = true;

    const drawPathStone = (wx: number, wy: number, w = 86, h = 62) => {
      const px = Math.round(wx * TILE_SIZE - w / 2);
      const py = Math.round(wy * TILE_SIZE - h / 2);
      ctx.drawImage(stonePathImg, px, py, w, h);
    };

    // 1. Hand-painted warm sandstone arrival walkway from Southern Entrance Arch into Central Plaza
    for (let wy = 17.5; wy >= 13.0; wy -= 1.05) {
      drawPathStone(14.0, wy, 92, 66);
    }

    // 2. Stepped stone courtyard paths linking Center Plaza to Student, Creator, Gaming stalls & Champions
    const stoneWalkways: [number, number][] = [
      // West wings toward Student Stall & FeatherAir
      [11.6, 11.2],
      [9.6, 11.0],
      [9.4, 9.6],
      [7.4, 9.4],
      [7.2, 13.6],
      // East wings toward Creator & Gaming Stalls & Canvas Studio
      [16.4, 11.2],
      [18.6, 11.0],
      [18.6, 9.6],
      [20.6, 11.0],
      [20.8, 13.6],
      // North avenue toward FlowCraft Pro
      [14.0, 8.2],
      [14.0, 7.0],
    ];
    for (const [wx, wy] of stoneWalkways) {
      drawPathStone(wx, wy, 82, 58);
    }

    // 3. Central Hand-Painted Octagonal Carved Stone & Cobalt Circuit Plaza Mosaic
    const plazaW = 246;
    const plazaH = Math.round((stonePlazaImg.height / Math.max(1, stonePlazaImg.width)) * plazaW);
    const pulseGrad = ctx.createRadialGradient(cx, cy, 24, cx, cy, 148);
    pulseGrad.addColorStop(0, 'rgba(0, 199, 253, 0.18)');
    pulseGrad.addColorStop(1, 'rgba(0, 199, 253, 0)');
    ctx.fillStyle = pulseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 148, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(
      stonePlazaImg,
      Math.round(cx - plazaW / 2),
      Math.round(cy - plazaH / 2),
      plazaW,
      plazaH
    );

    ctx.restore();
  }

  private drawIntelFestivalArch(
    ctx: CanvasRenderingContext2D,
    atlas: TinySwordsAtlas,
    wx: number,
    wy: number,
    spanTiles: number,
    title: string
  ): void {
    const cx = wx * TILE_SIZE;
    const baseY = wy * TILE_SIZE;
    const archImg = atlas.courtyard.festivalArch;
    const targetW = Math.max(210, Math.round(spanTiles * TILE_SIZE + 54));
    const targetH = Math.round((archImg.height / Math.max(1, archImg.width)) * targetW);

    ctx.save();
    ctx.imageSmoothingEnabled = true;

    // Grounded pier shadows
    this.drawTinyShadow(ctx, atlas, cx - targetW * 0.34, baseY + 3, 56);
    this.drawTinyShadow(ctx, atlas, cx + targetW * 0.34, baseY + 3, 56);

    ctx.drawImage(archImg, Math.round(cx - targetW / 2), Math.round(baseY - targetH + 14), targetW, targetH);

    // Subtle carved wood title plate only when nearby
    if (Math.hypot(wx - this.player.wx, wy - this.player.wy) < 5.8) {
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const lw = ctx.measureText(title).width + 18;
      const py = Math.round(baseY - targetH + 10);
      ctx.fillStyle = 'rgba(24, 16, 12, 0.9)';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(cx - lw / 2, py, lw, 17, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FEF3C7';
      ctx.fillText(title, cx, py + 12);
    }

    ctx.restore();
  }

  private drawFestivalLantern(ctx: CanvasRenderingContext2D, wx: number, wy: number): void {
    const px = wx * TILE_SIZE;
    const py = wy * TILE_SIZE;
    const glow = 0.75 + Math.sin(this.elapsed * 3.5 + wx) * 0.2;

    ctx.save();
    ctx.fillStyle = 'rgba(9, 17, 30, 0.25)';
    ctx.beginPath();
    ctx.ellipse(px, py + 2, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Post
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(px - 3, py - 44, 6, 44);
    ctx.fillStyle = '#0068B5';
    ctx.fillRect(px - 7, py - 46, 14, 4);

    // Warm festival orb
    const g = ctx.createRadialGradient(px, py - 52, 2, px, py - 52, 24);
    g.addColorStop(0, `rgba(253, 224, 71, ${0.55 * glow})`);
    g.addColorStop(0.5, `rgba(0, 199, 253, ${0.22 * glow})`);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py - 52, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(px, py - 52, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawTinyBuilding(
    ctx: CanvasRenderingContext2D,
    atlas: TinySwordsAtlas,
    b: BuildingLandmark
  ): void {
    const cx = (b.tx + b.tw / 2) * TILE_SIZE;
    const bottomY = (b.ty + b.th) * TILE_SIZE;
    const set = atlas.buildings[b.faction];
    const img = set[b.kind];

    const targetW =
      b.kind === 'castle'
        ? Math.max(b.tw * TILE_SIZE + 26, 228)
        : b.kind === 'tower'
          ? 104
          : b.kind.startsWith('house')
            ? 112
            : Math.max(b.tw * TILE_SIZE + 14, 178);
    const targetH = (img.height / img.width) * targetW;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    this.drawTinyShadow(ctx, atlas, cx, bottomY + 4, targetW * 0.92);
    ctx.drawImage(img, Math.round(cx - targetW / 2), Math.round(bottomY - targetH + 8), targetW, targetH);

    // Clean building label shown only when nearby
    const dist = Math.hypot(b.tx + b.tw / 2 - this.player.wx, b.ty + b.th / 2 - this.player.wy);
    if (dist < 4.8) {
      ctx.font = '700 11px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      const labelW = Math.max(118, ctx.measureText(b.name).width + 18);
      ctx.fillStyle = 'rgba(11, 17, 32, 0.86)';
      ctx.strokeStyle = b.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - labelW / 2, bottomY + 8, labelW, 20, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText(b.name, cx, bottomY + 22);
    }
    ctx.restore();
  }

  private drawTinyProp(
    ctx: CanvasRenderingContext2D,
    atlas: TinySwordsAtlas,
    p: PropItem
  ): void {
    const px = p.wx * TILE_SIZE;
    const py = p.wy * TILE_SIZE;
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (p.kind === 'tree') {
      const sheet = atlas.trees[p.variant % atlas.trees.length];
      const frames = 8;
      const cellW = sheet.width / frames;
      const cellH = sheet.height;
      const seed = Math.abs(Math.round(p.wx * 7 + p.wy * 11)) + p.variant * 3;
      const frame = Math.floor(this.elapsed * 7 + seed) % frames;
      this.drawTinyShadow(ctx, atlas, px, py + 6, 84);
      ctx.drawImage(sheet, frame * cellW, 0, cellW, cellH, px - 68, py - 118, 136, (cellH / cellW) * 136);
    } else if (p.kind === 'bush') {
      const sheet = atlas.bushes[p.variant % atlas.bushes.length];
      const seed = Math.abs(Math.round(p.wx * 5 + p.wy * 9)) + p.variant * 4;
      this.drawSquareStrip(ctx, sheet, px, py + 12, 68, { fps: 7, seed });
    } else if (p.kind === 'gold_stone') {
      const img = atlas.goldStones[p.variant % atlas.goldStones.length];
      this.drawTinyShadow(ctx, atlas, px, py + 4, 50);
      ctx.drawImage(img, px - 34, py - 48, 68, 68);
    }
    ctx.restore();
  }

  private renderSpriteVfx(ctx: CanvasRenderingContext2D, atlas: TinySwordsAtlas): void {
    for (const fx of this.spriteVfx) {
      let sheet = atlas.fx.explosion1;
      if (fx.kind === 'explosion2') sheet = atlas.fx.explosion2;
      else if (fx.kind === 'dust1') sheet = atlas.fx.dust1;
      else if (fx.kind === 'dust2') sheet = atlas.fx.dust2;
      else if (fx.kind === 'fire1') sheet = atlas.fx.fire1;
      else if (fx.kind === 'fire2') sheet = atlas.fx.fire2;
      else if (fx.kind === 'fire3') sheet = atlas.fx.fire3;
      else if (fx.kind === 'waterSplash') sheet = atlas.fx.waterSplash;
      else if (fx.kind === 'healEffect') sheet = atlas.units.Blue.monkHealEffect;

      const frameH = sheet.height;
      const totalFrames = Math.max(1, Math.round(sheet.width / frameH));
      const pct = Math.min(0.999, fx.elapsed / fx.duration);
      const frame = Math.floor(pct * totalFrames);

      const px = Math.round(fx.wx * TILE_SIZE);
      const py = Math.round(fx.wy * TILE_SIZE);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(px, py);
      if (fx.flipX) ctx.scale(-1, 1);
      ctx.drawImage(
        sheet,
        frame * frameH,
        0,
        frameH,
        frameH,
        -fx.sizePx / 2,
        -fx.sizePx * 0.72,
        fx.sizePx,
        fx.sizePx
      );
      ctx.restore();
    }
  }

  private drawSquareStrip(
    ctx: CanvasRenderingContext2D,
    strip: HTMLImageElement,
    px: number,
    bottomY: number,
    targetHeight: number,
    opts: { fps?: number; flipX?: boolean; hitFlash?: boolean; alpha?: number; seed?: number } = {}
  ): void {
    const fh = strip.height;
    const totalFrames = Math.max(1, Math.round(strip.width / fh));
    const fps = opts.fps ?? 10;
    const frameIdx = Math.floor(this.elapsed * fps + (opts.seed ?? 0)) % totalFrames;

    const drawW = Math.round(targetHeight);
    const drawH = Math.round(targetHeight);
    const dstX = -Math.round(drawW / 2);
    const dstY = -drawH;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (opts.alpha !== undefined && opts.alpha < 1) ctx.globalAlpha = opts.alpha;
    ctx.translate(Math.round(px), Math.round(bottomY));
    ctx.scale(opts.flipX ? -1 : 1, 1);

    if (opts.hitFlash && fh > 0) {
      // Offscreen silhouette-masked flash so damaged sprites never produce rectangular filter boxes
      if (!this.flashCanvas) {
        this.flashCanvas = document.createElement('canvas');
        this.flashCtx = this.flashCanvas.getContext('2d');
      }
      if (this.flashCanvas.width !== fh || this.flashCanvas.height !== fh) {
        this.flashCanvas.width = fh;
        this.flashCanvas.height = fh;
      }
      const fctx = this.flashCtx;
      if (fctx) {
        fctx.clearRect(0, 0, fh, fh);
        fctx.globalCompositeOperation = 'source-over';
        fctx.drawImage(strip, frameIdx * fh, 0, fh, fh, 0, 0, fh, fh);
        fctx.globalCompositeOperation = 'source-atop';
        fctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        fctx.fillRect(0, 0, fh, fh);
        ctx.drawImage(this.flashCanvas, 0, 0, fh, fh, dstX, dstY, drawW, drawH);
        ctx.restore();
        return;
      }
    }

    ctx.drawImage(strip, frameIdx * fh, 0, fh, fh, dstX, dstY, drawW, drawH);
    ctx.restore();
  }

  private drawSpectralStrip(
    ctx: CanvasRenderingContext2D,
    strip: HTMLImageElement,
    px: number,
    bottomY: number,
    targetHeight: number,
    opts: { fps?: number; flipX?: boolean; hitFlash?: boolean; alpha?: number; seed?: number } = {}
  ): void {
    const fh = strip.height;
    if (fh <= 0) return;
    const totalFrames = Math.max(1, Math.round(strip.width / fh));
    const fps = opts.fps ?? 10;
    const frameIdx = Math.floor(this.elapsed * fps + (opts.seed ?? 0)) % totalFrames;

    if (!this.spectralCanvas) {
      this.spectralCanvas = document.createElement('canvas');
      this.spectralCtx = this.spectralCanvas.getContext('2d');
    }
    if (this.spectralCanvas.width !== fh || this.spectralCanvas.height !== fh) {
      this.spectralCanvas.width = fh;
      this.spectralCanvas.height = fh;
    }
    const sctx = this.spectralCtx;
    if (!sctx) {
      this.drawSquareStrip(ctx, strip, px, bottomY, targetHeight, opts);
      return;
    }
    sctx.clearRect(0, 0, fh, fh);
    sctx.globalCompositeOperation = 'source-over';
    sctx.drawImage(strip, frameIdx * fh, 0, fh, fh, 0, 0, fh, fh);
    sctx.globalCompositeOperation = 'source-atop';
    sctx.fillStyle = opts.hitFlash ? 'rgba(255, 255, 255, 0.85)' : 'rgba(103, 232, 249, 0.56)';
    sctx.fillRect(0, 0, fh, fh);

    const drawW = Math.round(targetHeight);
    const drawH = Math.round(targetHeight);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = opts.alpha ?? 0.88;
    ctx.translate(Math.round(px), Math.round(bottomY));
    ctx.scale(opts.flipX ? -1 : 1, 1);
    ctx.drawImage(this.spectralCanvas, 0, 0, fh, fh, -Math.round(drawW / 2), -drawH, drawW, drawH);
    ctx.restore();
  }

  private drawTinyShadow(
    ctx: CanvasRenderingContext2D,
    _atlas: TinySwordsAtlas,
    px: number,
    py: number,
    width: number
  ): void {
    // Crisp, grounded contact shadow directly beneath sprite feet
    const rx = Math.max(7, width * 0.3);
    const ry = Math.max(3.5, rx * 0.38);
    ctx.save();
    ctx.translate(Math.round(px), Math.round(py));
    ctx.scale(1, ry / rx);
    const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, rx);
    grad.addColorStop(0, 'rgba(9, 17, 30, 0.3)');
    grad.addColorStop(0.62, 'rgba(9, 17, 30, 0.12)');
    grad.addColorStop(1, 'rgba(9, 17, 30, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawGoldenCrown(ctx: CanvasRenderingContext2D, px: number, py: number): void {
    ctx.save();
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(px - 13, py + 7);
    ctx.lineTo(px - 15, py - 7);
    ctx.lineTo(px - 5, py + 1);
    ctx.lineTo(px, py - 11);
    ctx.lineTo(px + 5, py + 1);
    ctx.lineTo(px + 15, py - 7);
    ctx.lineTo(px + 13, py + 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
