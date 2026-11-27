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
  kind: 'chip' | 'aiPc' | 'booth' | 'trapLaptop';
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
}

type EnemyClass = 'red_warrior' | 'red_archer' | 'red_pawn' | 'purple_lancer' | 'black_warrior' | 'black_archer';

interface EnemyEntity {
  id: number;
  unitClass: EnemyClass;
  faction: FactionColor;
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

interface BossEntity {
  active: boolean;
  wx: number;
  wy: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  phase: 1 | 2 | 3;
  state: 'IDLE' | 'WINDUP_SLAM' | 'WINDUP_FAN' | 'WINDUP_RING' | 'STUNNED' | 'COOLDOWN';
  stateTimer: number;
  hitFlash: number;
  attackCombo: number;
  towerTimer: number;
  decoys: { wx: number; wy: number; life: number }[];
}

interface NpcEntity {
  id: string;
  name: string;
  kind: 'ecore' | 'npu' | 'arc' | 'trap_gate' | 'boss_gate';
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
  private mapW = 64;
  private mapH = 48;

  private buildings: BuildingLandmark[] = [];
  private props: PropItem[] = [];
  private intelProps: IntelHardwareProp[] = [];
  private waterDecos: WaterDeco[] = [];
  private sheep: SheepEntity[] = [];
  private villagers: EcosystemVillager[] = [];
  private clouds: CloudEntity[] = [];
  private signposts: { wx: number; wy: number; label: string; color: string }[] = [];

  private player = {
    wx: 9.5,
    wy: 41.5,
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
    wx: 32,
    wy: 8.5,
    hp: 360,
    maxHp: 360,
    shield: 70,
    maxShield: 70,
    phase: 1,
    state: 'IDLE',
    stateTimer: 1.2,
    hitFlash: 0,
    attackCombo: 0,
    towerTimer: 2.8,
    decoys: [],
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
  private blurCanvas: HTMLCanvasElement | null = null;
  private blurCtx: CanvasRenderingContext2D | null = null;

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
    this.clouds = Array.from({ length: 10 }, (_, i) => ({
      wx: -6 + ((i * 7.8) % 74),
      wy: 3 + ((i * 6.4) % 41),
      speed: 0.34 + (i % 4) * 0.13,
      variant: i % 8,
      scale: 1.15 + (i % 3) * 0.24,
    }));
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
    } else {
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
    this.player.wx = 9.5;
    this.player.wy = 42.0;
    this.player.heroForm = 'pawn';
    this.player.hp = 100;
    this.player.battery = 90;
    this.player.npuCharge = 0;
    this.player.goldCount = 0;
    this.player.woodCount = 0;
    this.player.hasNpuPulse = false;
    this.player.hasXessSurge = false;
    this.player.xessBuffTimer = 0;

    this.centerCameraInstant();
    this.phase = 'DIALOGUE';
    gameAudio.setMusicMode('trap');
    this.objectiveText = 'Walk north to the Task Gate on Bargain Trap Island';
    this.showBanner('ISLAND 1 · BARGAIN TRAP ALLEY (BLUE PAWN)', 2.8);
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
      this.player.wx = 23.0;
      this.player.wy = 39.5;
      this.spawnSpriteFx('healEffect', this.player.wx, this.player.wy, 160, 0.8);
      this.spawnSpriteFx('explosion2', this.player.wx, this.player.wy, 130, 0.55);
      this.spawnSpriteFx('waterSplash', 18.5, 39.5, 110, 0.55);
      this.spawnFloatingText(this.player.wx, this.player.wy - 0.8, 'UPGRADED: BLUE WARRIOR!', '#38BDF8');
      gameAudio.playUnlock();
      gameAudio.setMusicMode('city');
      this.showBanner('BLUE WARRIOR UNLOCKED · E-CORE EFFICIENCY PARK', 2.9);
    }

    this.emitHud();
  }

  private openBossGate(): void {
    this.bossGateOpen = true;
    for (let y = 0; y < this.mapH; y++) {
      for (let x = 0; x < this.mapW; x++) {
        if (this.map[y][x] === 9) {
          this.map[y][x] = 3;
        }
      }
    }
    this.spawnSpriteFx('explosion2', 32.0, 16.5, 160, 0.65);
    this.npcs = this.npcs.filter((n) => n.kind !== 'boss_gate');
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

  private handleCanvasClick = (e: MouseEvent): void => {
    if (this.phase !== 'PLAYING' && this.phase !== 'EXPO_PARK') return;
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const vw = rect.width || this.viewW;
    const vh = rect.height || this.viewH;
    const wx = ((sx - vw / 2) / this.camZoom + this.camX) / TILE_SIZE;
    const wy = ((sy - vh / 2) / this.camZoom + this.camY) / TILE_SIZE;

    for (const ip of this.intelProps) {
      const hitW = ip.kind === 'booth' ? 1.55 : 0.95;
      const hitH = ip.kind === 'booth' ? 1.45 : 1.05;
      if (Math.abs(wx - ip.wx) <= hitW && wy >= ip.wy - hitH && wy <= ip.wy + 0.55) {
        this.heldKeys.clear();
        this.phase = 'DIALOGUE';
        gameAudio.playPickup();
        this.callbacks.onInspectHardware(ip.hardwareKey);
        return;
      }
    }
  };

  private handleResize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = this.canvas.parentElement;
    const w = Math.max(320, parent?.clientWidth || window.innerWidth);
    const h = Math.max(240, parent?.clientHeight || window.innerHeight);
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
    this.mapW = 64;
    this.mapH = 48;
    // Ocean water surrounds every island!
    const m: GroundKind[][] = Array.from({ length: 48 }, () => Array<GroundKind>(64).fill(0));

    const fillRect = (x0: number, y0: number, x1: number, y1: number, kind: GroundKind) => {
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          if (y >= 0 && y < 48 && x >= 0 && x < 64) m[y][x] = kind;
        }
      }
    };

    // Island 1: Bargain Trap Island (SW)
    fillRect(3, 33, 17, 45, 1);
    // Island 2: E-Core Efficiency Park (SE)
    fillRect(20, 32, 44, 45, 2);
    fillRect(29, 32, 34, 44, 3);
    // Bridge: Trap -> E-Core
    fillRect(17, 38, 20, 41, 3);
    // Island 3: Copper Bus Plaza (Center)
    fillRect(21, 17, 43, 31, 3);
    // Island 4: NPU Offline Study Monastery (NW)
    fillRect(3, 15, 19, 31, 4);
    fillRect(19, 22, 21, 25, 3); // West bridge
    // Island 5: Arc XeSS Archery Island (NE)
    fillRect(45, 15, 60, 31, 5);
    fillRect(43, 22, 45, 25, 3); // East bridge
    // Island 6: Overclocked Colosseum (North)
    fillRect(22, 3, 42, 15, 6);
    fillRect(30, 15, 33, 17, 3); // North bridge
    m[16][30] = 9;
    m[16][31] = 9;
    m[16][32] = 9;
    m[16][33] = 9;

    this.map = m;

    // Showcase ALL 5 Tiny Swords factions & building classes!
    this.buildings = [
      { id: 'b_trap', name: 'GlitterBook RGB Shop', subtitle: '₹39,999 Bargain Trap', faction: 'Red', kind: 'barracks', tx: 4, ty: 34, tw: 4, th: 3, accent: '#EF4444' },
      { id: 'b_trap_h', name: 'Red Sentry House', subtitle: 'Budget Bloatware', faction: 'Red', kind: 'house1', tx: 14, ty: 34, tw: 3, th: 2, accent: '#EF4444' },
      { id: 'b_ecore', name: 'E-Core Blue Castle', subtitle: 'Hybrid Power Keep', faction: 'Blue', kind: 'castle', tx: 36, ty: 34, tw: 5, th: 3, accent: '#00C7FD' },
      { id: 'b_ecore_h', name: 'Low-Power Cottage', subtitle: '20H Battery Hub', faction: 'Blue', kind: 'house2', tx: 22, ty: 34, tw: 3, th: 2, accent: '#10B981' },
      { id: 'b_library', name: 'Offline Study Monastery', subtitle: '300+ Local AI Apps', faction: 'Purple', kind: 'monastery', tx: 4, ty: 16, tw: 4, th: 3, accent: '#A855F7' },
      { id: 'b_npu_dome', name: 'NPU Blue Sanctuary', subtitle: 'Intel AI Boost Core', faction: 'Blue', kind: 'monastery', tx: 14, ty: 16, tw: 4, th: 3, accent: '#00C7FD' },
      { id: 'b_arc_arcade', name: 'Arc XeSS Archery', subtitle: '120 FPS AI Upscaling', faction: 'Yellow', kind: 'archery', tx: 51, ty: 16, tw: 4, th: 3, accent: '#F59E0B' },
      { id: 'b_arc_tower', name: 'XeSS Watchtower', subtitle: 'XMX Frame Engine', faction: 'Yellow', kind: 'tower', tx: 56, ty: 17, tw: 2, th: 3, accent: '#F59E0B' },
      { id: 'b_boss_castle', name: 'Obsidian Lag Citadel', subtitle: 'Overclocked Boss Keep', faction: 'Black', kind: 'castle', tx: 29, ty: 3, tw: 6, th: 3, accent: '#94A3B8' },
      { id: 'b_boss_tl', name: 'West Throttle Tower', subtitle: 'Thermal Barrier', faction: 'Black', kind: 'tower', tx: 23, ty: 4, tw: 2, th: 3, accent: '#EF4444' },
      { id: 'b_boss_tr', name: 'East Throttle Tower', subtitle: 'Thermal Barrier', faction: 'Black', kind: 'tower', tx: 39, ty: 4, tw: 2, th: 3, accent: '#EF4444' },
    ];

    for (const b of this.buildings) {
      for (let y = b.ty; y < b.ty + b.th; y++) {
        for (let x = b.tx; x < b.tx + b.tw; x++) {
          m[y][x] = 8;
        }
      }
    }

    // Organized Island Ecology: Structured Woodland Belts, Bridge Avenues & Courtyard Gardens
    this.props = [
      // Island 1: Bargain Trap Island — West cliff forest & sentry courtyard
      { kind: 'tree', wx: 3.8, wy: 38.4, variant: 0 },
      { kind: 'tree', wx: 3.8, wy: 41.2, variant: 2 },
      { kind: 'tree', wx: 4.0, wy: 43.9, variant: 3 },
      { kind: 'tree', wx: 6.4, wy: 44.3, variant: 1 },
      { kind: 'tree', wx: 9.0, wy: 44.3, variant: 0 },
      { kind: 'tree', wx: 11.8, wy: 44.3, variant: 2 },
      { kind: 'tree', wx: 14.4, wy: 44.1, variant: 3 },
      { kind: 'tree', wx: 16.3, wy: 43.4, variant: 1 },
      { kind: 'tree', wx: 16.3, wy: 36.8, variant: 0 },
      { kind: 'tree', wx: 11.0, wy: 34.0, variant: 3 },
      { kind: 'stump', wx: 5.4, wy: 42.6, variant: 0 },
      { kind: 'stump', wx: 15.2, wy: 42.4, variant: 1 },
      { kind: 'bush', wx: 5.2, wy: 37.8, variant: 0 },
      { kind: 'bush', wx: 15.0, wy: 37.8, variant: 2 },
      { kind: 'rock', wx: 15.8, wy: 35.8, variant: 0 },

      // Island 2: E-Core Park — Bridge avenue, Castle garden & SE Meadow Pasture
      { kind: 'tree', wx: 21.0, wy: 33.6, variant: 0 },
      { kind: 'tree', wx: 25.8, wy: 33.5, variant: 1 },
      { kind: 'tree', wx: 28.0, wy: 34.0, variant: 2 },
      { kind: 'tree', wx: 21.2, wy: 37.0, variant: 3 },
      { kind: 'tree', wx: 21.2, wy: 42.4, variant: 1 },
      { kind: 'tree', wx: 23.4, wy: 44.1, variant: 0 },
      { kind: 'tree', wx: 25.8, wy: 44.2, variant: 2 },
      { kind: 'tree', wx: 28.2, wy: 44.0, variant: 3 },
      { kind: 'tree', wx: 35.4, wy: 33.4, variant: 0 },
      { kind: 'tree', wx: 41.8, wy: 33.6, variant: 1 },
      { kind: 'tree', wx: 42.8, wy: 36.2, variant: 2 },
      { kind: 'tree', wx: 43.0, wy: 38.8, variant: 3 },
      { kind: 'tree', wx: 43.0, wy: 41.4, variant: 0 },
      { kind: 'tree', wx: 42.2, wy: 43.8, variant: 1 },
      { kind: 'tree', wx: 39.8, wy: 44.1, variant: 2 },
      { kind: 'tree', wx: 37.2, wy: 44.2, variant: 3 },
      { kind: 'tree', wx: 35.0, wy: 44.0, variant: 0 },
      // E-Core Castle courtyard bushes & mine clearing
      { kind: 'bush', wx: 35.2, wy: 36.8, variant: 1 },
      { kind: 'bush', wx: 41.4, wy: 37.4, variant: 3 },
      { kind: 'bush', wx: 22.8, wy: 36.8, variant: 0 },
      { kind: 'bush', wx: 26.2, wy: 42.6, variant: 2 },
      { kind: 'bush', wx: 36.4, wy: 42.6, variant: 1 },
      { kind: 'bush', wx: 40.6, wy: 42.4, variant: 3 },
      { kind: 'stump', wx: 34.4, wy: 42.2, variant: 0 },
      { kind: 'gold_stone', wx: 24.4, wy: 42.0, variant: 1 },

      // Island 3: Copper Bus Plaza — Symmetrical Corner Groves & Avenue Framing
      { kind: 'tree', wx: 22.0, wy: 18.2, variant: 1 },
      { kind: 'tree', wx: 24.4, wy: 18.0, variant: 0 },
      { kind: 'tree', wx: 26.8, wy: 18.2, variant: 3 },
      { kind: 'tree', wx: 22.0, wy: 20.6, variant: 2 },
      { kind: 'tree', wx: 42.0, wy: 18.2, variant: 2 },
      { kind: 'tree', wx: 39.6, wy: 18.0, variant: 3 },
      { kind: 'tree', wx: 37.2, wy: 18.2, variant: 0 },
      { kind: 'tree', wx: 42.0, wy: 20.6, variant: 1 },
      { kind: 'tree', wx: 22.0, wy: 27.6, variant: 3 },
      { kind: 'tree', wx: 22.2, wy: 30.0, variant: 0 },
      { kind: 'tree', wx: 24.6, wy: 30.2, variant: 1 },
      { kind: 'tree', wx: 27.0, wy: 30.0, variant: 2 },
      { kind: 'tree', wx: 42.0, wy: 27.6, variant: 0 },
      { kind: 'tree', wx: 41.8, wy: 30.0, variant: 1 },
      { kind: 'tree', wx: 39.4, wy: 30.2, variant: 2 },
      { kind: 'tree', wx: 37.0, wy: 30.0, variant: 3 },
      { kind: 'bush', wx: 23.6, wy: 19.6, variant: 1 },
      { kind: 'bush', wx: 40.4, wy: 19.6, variant: 3 },
      { kind: 'bush', wx: 23.6, wy: 28.6, variant: 0 },
      { kind: 'bush', wx: 40.4, wy: 28.6, variant: 2 },
      { kind: 'gold_stone', wx: 25.0, wy: 20.6, variant: 0 },
      { kind: 'gold_stone', wx: 39.0, wy: 20.6, variant: 2 },

      // Island 4: NPU Study Monastery — Sanctuary Grove & Southern Gold Quarry
      { kind: 'tree', wx: 9.2, wy: 16.4, variant: 0 },
      { kind: 'tree', wx: 12.2, wy: 16.4, variant: 2 },
      { kind: 'tree', wx: 18.2, wy: 17.6, variant: 1 },
      { kind: 'tree', wx: 18.2, wy: 20.4, variant: 3 },
      { kind: 'tree', wx: 3.8, wy: 20.8, variant: 1 },
      { kind: 'tree', wx: 3.8, wy: 23.8, variant: 0 },
      { kind: 'tree', wx: 3.8, wy: 26.8, variant: 2 },
      { kind: 'tree', wx: 4.2, wy: 29.8, variant: 3 },
      { kind: 'tree', wx: 6.6, wy: 30.2, variant: 0 },
      { kind: 'tree', wx: 9.4, wy: 30.1, variant: 1 },
      { kind: 'tree', wx: 12.2, wy: 30.2, variant: 2 },
      { kind: 'tree', wx: 15.0, wy: 30.1, variant: 3 },
      { kind: 'tree', wx: 17.8, wy: 29.8, variant: 0 },
      { kind: 'tree', wx: 18.0, wy: 27.2, variant: 1 },
      { kind: 'stump', wx: 5.6, wy: 21.8, variant: 0 },
      { kind: 'bush', wx: 5.5, wy: 23.2, variant: 3 },
      { kind: 'bush', wx: 16.5, wy: 21.8, variant: 1 },
      { kind: 'gold_stone', wx: 13.4, wy: 28.8, variant: 4 },

      // Island 5: Arc XeSS Archery — Perimeter Range Woods
      { kind: 'tree', wx: 46.2, wy: 16.5, variant: 2 },
      { kind: 'tree', wx: 48.8, wy: 16.5, variant: 0 },
      { kind: 'tree', wx: 46.2, wy: 19.6, variant: 3 },
      { kind: 'tree', wx: 59.0, wy: 16.8, variant: 1 },
      { kind: 'tree', wx: 59.2, wy: 20.0, variant: 0 },
      { kind: 'tree', wx: 59.2, wy: 23.2, variant: 2 },
      { kind: 'tree', wx: 59.0, wy: 26.4, variant: 3 },
      { kind: 'tree', wx: 58.8, wy: 29.8, variant: 1 },
      { kind: 'tree', wx: 56.0, wy: 30.1, variant: 0 },
      { kind: 'tree', wx: 52.8, wy: 30.1, variant: 2 },
      { kind: 'tree', wx: 49.6, wy: 30.2, variant: 3 },
      { kind: 'tree', wx: 46.5, wy: 29.8, variant: 1 },
      { kind: 'tree', wx: 46.2, wy: 27.2, variant: 0 },
      { kind: 'stump', wx: 55.6, wy: 21.2, variant: 1 },
      { kind: 'bush', wx: 48.0, wy: 20.5, variant: 0 },
      { kind: 'bush', wx: 57.5, wy: 28.0, variant: 2 },
      { kind: 'gold_stone', wx: 47.6, wy: 28.6, variant: 5 },

      // Island 6: Overclocked Colosseum — Symmetrical Fortress Sentinels
      { kind: 'tree', wx: 22.8, wy: 8.4, variant: 3 },
      { kind: 'tree', wx: 22.8, wy: 11.4, variant: 2 },
      { kind: 'tree', wx: 23.6, wy: 13.8, variant: 0 },
      { kind: 'tree', wx: 26.4, wy: 14.0, variant: 1 },
      { kind: 'tree', wx: 41.2, wy: 8.4, variant: 2 },
      { kind: 'tree', wx: 41.2, wy: 11.4, variant: 3 },
      { kind: 'tree', wx: 40.4, wy: 13.8, variant: 1 },
      { kind: 'tree', wx: 37.6, wy: 14.0, variant: 0 },
      { kind: 'rock', wx: 24.8, wy: 12.6, variant: 1 },
      { kind: 'rock', wx: 39.2, wy: 12.6, variant: 2 },
    ];

    const denseFill: PropItem[] = [
      // Bridge Framing Avenues & Building Flanking Gardens (curated positions)
      { kind: 'tree', wx: 23.2, wy: 37.2, variant: 2 },
      { kind: 'tree', wx: 23.2, wy: 41.4, variant: 0 },
      { kind: 'tree', wx: 40.6, wy: 39.2, variant: 2 },
      { kind: 'tree', wx: 5.4, wy: 28.2, variant: 2 },
      { kind: 'tree', wx: 8.2, wy: 28.6, variant: 0 },
      { kind: 'tree', wx: 55.2, wy: 28.6, variant: 0 },
      { kind: 'tree', wx: 57.6, wy: 26.8, variant: 2 },
      { kind: 'bush', wx: 28.2, wy: 19.2, variant: 2 },
      { kind: 'bush', wx: 35.8, wy: 19.2, variant: 0 },
      { kind: 'bush', wx: 28.2, wy: 29.4, variant: 3 },
      { kind: 'bush', wx: 35.8, wy: 29.4, variant: 1 },
    ];

    // Interactive Intel AI PC Hardware Landmarks across Silicon City!
    this.intelProps = [
      { id: 'hw_trap', hardwareKey: 'trap_glitterbook', kind: 'trapLaptop', wx: 8.2, wy: 36.6, label: 'GLITTERBOOK · NO NPU [E]', accent: '#EF4444' },
      { id: 'hw_ecore_booth', hardwareKey: 'ecore_booth', kind: 'booth', wx: 32.0, wy: 35.8, label: 'INTEL AI PC PAVILION [E]', accent: '#00C7FD' },
      { id: 'hw_ecore_chip', hardwareKey: 'core_ultra_battery', kind: 'chip', wx: 27.0, wy: 39.2, label: 'CORE ULTRA · 20H+ [E]', accent: '#10B981' },
      { id: 'hw_plaza_hub', hardwareKey: 'core_ultra_hub', kind: 'chip', wx: 32.0, wy: 24.0, label: 'CORE ULTRA 3-ENGINE [E]', accent: '#00C7FD' },
      { id: 'hw_plaza_apps', hardwareKey: 'ai_pc_apps', kind: 'aiPc', wx: 28.6, wy: 24.0, label: 'AI PC · 300+ APPS [E]', accent: '#38BDF8' },
      { id: 'hw_plaza_xess', hardwareKey: 'ai_pc_xess', kind: 'aiPc', wx: 35.4, wy: 24.0, label: 'ARC XeSS GAMING [E]', accent: '#F59E0B' },
      { id: 'hw_npu_chip', hardwareKey: 'npu_ai_boost', kind: 'chip', wx: 9.2, wy: 20.0, label: 'INTEL AI BOOST NPU [E]', accent: '#A855F7' },
      { id: 'hw_arc_rig', hardwareKey: 'arc_xess_rig', kind: 'aiPc', wx: 53.8, wy: 20.2, label: 'XeSS 120 FPS RIG [E]', accent: '#F59E0B' },
    ];

    // Water Rocks & Rubber Ducks in the surrounding ocean!
    this.waterDecos = [
      { kind: 'duck', wx: 18.5, wy: 35.5, variant: 0, phase: 0.4 },
      { kind: 'duck', wx: 19.5, wy: 27.5, variant: 0, phase: 1.9 },
      { kind: 'duck', wx: 44.2, wy: 28.2, variant: 0, phase: 2.7 },
      { kind: 'duck', wx: 28.0, wy: 16.0, variant: 0, phase: 0.9 },
      { kind: 'duck', wx: 14.0, wy: 32.2, variant: 0, phase: 1.4 },
      { kind: 'duck', wx: 48.0, wy: 34.0, variant: 0, phase: 2.2 },
      { kind: 'water_rock', wx: 18.5, wy: 43.2, variant: 0, phase: 0 },
      { kind: 'water_rock', wx: 20.0, wy: 19.2, variant: 1, phase: 1.2 },
      { kind: 'water_rock', wx: 44.0, wy: 18.8, variant: 2, phase: 2.1 },
      { kind: 'water_rock', wx: 35.5, wy: 16.0, variant: 3, phase: 0.7 },
      { kind: 'water_rock', wx: 11.5, wy: 32.0, variant: 1, phase: 1.5 },
      { kind: 'water_rock', wx: 52.0, wy: 32.5, variant: 2, phase: 2.8 },
    ];

    const mkSheep = (wx: number, wy: number, wps: { wx: number; wy: number }[], state: 'IDLE' | 'GRASS' | 'MOVE' = 'GRASS'): SheepEntity => ({
      wx, wy, vx: 0, vy: 0, state, timer: 1.6, pauseTimer: 0, flipCooldown: 0, flipX: false, waypoints: wps, wpIdx: 0,
    });

    // Pasture Sheep with calm grazing waypoints inside island meadows
    this.sheep = [
      mkSheep(37.6, 40.6, [{ wx: 37.6, wy: 40.6 }, { wx: 39.2, wy: 40.8 }, { wx: 38.5, wy: 42.0 }], 'GRASS'),
      mkSheep(39.4, 41.8, [{ wx: 39.4, wy: 41.8 }, { wx: 37.2, wy: 41.8 }, { wx: 38.2, wy: 40.2 }], 'IDLE'),
      mkSheep(25.2, 41.2, [{ wx: 25.2, wy: 41.2 }, { wx: 27.0, wy: 41.5 }, { wx: 26.2, wy: 40.0 }], 'MOVE'),
      mkSheep(28.0, 41.8, [{ wx: 28.0, wy: 41.8 }, { wx: 26.4, wy: 42.2 }, { wx: 27.6, wy: 40.5 }], 'GRASS'),
      mkSheep(6.6, 23.0, [{ wx: 6.6, wy: 23.0 }, { wx: 8.2, wy: 23.4 }, { wx: 7.4, wy: 22.0 }], 'GRASS'),
      mkSheep(13.2, 26.4, [{ wx: 13.2, wy: 26.4 }, { wx: 15.0, wy: 26.4 }, { wx: 14.0, wy: 27.4 }], 'IDLE'),
      mkSheep(26.6, 21.8, [{ wx: 26.6, wy: 21.8 }, { wx: 28.0, wy: 21.8 }, { wx: 27.2, wy: 22.6 }], 'GRASS'),
      mkSheep(37.4, 21.8, [{ wx: 37.4, wy: 21.8 }, { wx: 36.0, wy: 21.8 }, { wx: 36.8, wy: 22.6 }], 'MOVE'),
      mkSheep(54.8, 26.6, [{ wx: 54.8, wy: 26.6 }, { wx: 56.2, wy: 26.6 }, { wx: 55.4, wy: 27.6 }], 'GRASS'),
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

    // Living Multi-Faction Citizens with Purposeful Work & Patrol Routes!
    this.villagers = [
      // Bargain Trap Island: Red workers patrolling between Sentry House and Barracks
      mkVillager(1, 'Red', 'pawn', 6.4, 39.2, [{ wx: 6.4, wy: 39.2 }, { wx: 9.8, wy: 39.2 }, { wx: 9.8, wy: 41.0 }, { wx: 6.4, wy: 41.0 }], 'ACTION'),
      mkVillager(2, 'Red', 'pawn_gold', 14.4, 38.2, [{ wx: 14.4, wy: 38.2 }, { wx: 11.4, wy: 38.2 }, { wx: 14.4, wy: 40.4 }], 'MOVE'),

      // E-Core Park: Blue Pawns hauling gold between Mine & Castle, Monk tending Cottage courtyard
      mkVillager(3, 'Blue', 'pawn_gold', 24.4, 40.4, [{ wx: 24.4, wy: 40.4 }, { wx: 35.8, wy: 38.6 }, { wx: 35.8, wy: 37.6 }, { wx: 26.0, wy: 38.2 }], 'MOVE'),
      mkVillager(4, 'Blue', 'pawn', 36.8, 38.0, [{ wx: 36.8, wy: 38.0 }, { wx: 39.6, wy: 38.0 }, { wx: 38.2, wy: 39.6 }], 'ACTION'),
      mkVillager(5, 'Blue', 'monk', 23.6, 36.6, [{ wx: 23.6, wy: 36.6 }, { wx: 26.2, wy: 36.6 }], 'ACTION'),
      mkVillager(6, 'Blue', 'pawn_gold', 30.5, 38.8, [{ wx: 30.5, wy: 38.8 }, { wx: 33.5, wy: 38.8 }, { wx: 32.0, wy: 41.0 }], 'MOVE'),

      // Copper Plaza: Cross-faction stewards patrolling the 3-Engine Hub
      mkVillager(7, 'Blue', 'pawn', 27.6, 26.2, [{ wx: 27.6, wy: 26.2 }, { wx: 36.4, wy: 26.2 }, { wx: 36.4, wy: 22.0 }, { wx: 27.6, wy: 22.0 }], 'MOVE'),
      mkVillager(8, 'Yellow', 'lancer', 35.2, 22.4, [{ wx: 35.2, wy: 22.4 }, { wx: 28.8, wy: 22.4 }], 'IDLE'),

      // NPU Monastery Island: Monks tending shrines & Purple Pawn hauling from Gold Quarry
      mkVillager(9, 'Purple', 'monk', 7.4, 20.4, [{ wx: 7.4, wy: 20.4 }, { wx: 10.6, wy: 20.4 }], 'ACTION'),
      mkVillager(10, 'Purple', 'monk', 15.8, 20.6, [{ wx: 15.8, wy: 20.6 }, { wx: 15.8, wy: 23.4 }], 'ACTION'),
      mkVillager(11, 'Purple', 'pawn_gold', 13.0, 27.4, [{ wx: 13.0, wy: 27.4 }, { wx: 6.8, wy: 20.6 }, { wx: 11.4, wy: 24.4 }], 'MOVE'),

      // Arc Archery Island: Yellow Archers patrolling the firing range & worker hauling
      mkVillager(12, 'Yellow', 'archer', 49.4, 21.8, [{ wx: 49.4, wy: 21.8 }, { wx: 56.4, wy: 21.8 }], 'MOVE'),
      mkVillager(13, 'Yellow', 'archer', 56.4, 25.4, [{ wx: 56.4, wy: 25.4 }, { wx: 49.6, wy: 25.4 }], 'IDLE'),
      mkVillager(14, 'Yellow', 'pawn_gold', 48.2, 27.4, [{ wx: 48.2, wy: 27.4 }, { wx: 52.8, wy: 20.8 }], 'MOVE'),
    ];

    this.signposts = [
      { wx: 24.5, wy: 24.0, label: '← NPU STUDY MONASTERY', color: '#00C7FD' },
      { wx: 39.5, wy: 24.0, label: 'ARC XeSS ARCHERY →', color: '#F59E0B' },
      { wx: 32.0, wy: 18.2, label: '▲ BLACK COLOSSEUM (BOSS)', color: '#EF4444' },
    ];

    this.npcs = [
      { id: 'trap_gate', name: 'Overloaded Task Gate', kind: 'trap_gate', wx: 12.5, wy: 35.5, dialogueId: 'trap_meltdown', interacted: false },
      { id: 'npc_ecore', name: 'E-Core Steward', kind: 'ecore', wx: 34.5, wy: 38.2, dialogueId: 'ecore_greeting', interacted: false },
      { id: 'npc_npu', name: 'NPU Monk Sentinel', kind: 'npu', wx: 11.5, wy: 21.5, dialogueId: 'npu_intro', interacted: false },
      { id: 'npc_arc', name: 'Arc Archer Warden', kind: 'arc', wx: 51.5, wy: 21.5, dialogueId: 'arc_intro', interacted: false },
      { id: 'npc_boss_gate', name: 'Colosseum Bridge Gate', kind: 'boss_gate', wx: 32.0, wy: 16.5, dialogueId: '', interacted: false },
    ];

    this.tasks = [
      { id: 'task_study', label: 'Offline Lecture AI', wx: 7.5, wy: 25.5, rescued: false, variant: 0 },
      { id: 'task_privacy', label: 'Private PDF Tutor', wx: 15.5, wy: 27.5, rescued: false, variant: 1 },
      { id: 'task_xess', label: 'Esports 120 FPS Rig', wx: 49.0, wy: 27.5, rescued: false, variant: 2 },
      { id: 'task_stream', label: 'Creator Stream Deck', wx: 56.5, wy: 23.5, rescued: false, variant: 3 },
    ];

    // Red Units in early zones, Purple & Black Units on northern approaches!
    this.enemies = [
      this.makeEnemy('red_pawn', 10.5, 25.5),
      this.makeEnemy('red_archer', 14.5, 24.5),
      this.makeEnemy('red_warrior', 27.5, 26.5),
      this.makeEnemy('red_warrior', 36.5, 26.5),
      this.makeEnemy('purple_lancer', 51.0, 26.5),
      this.makeEnemy('black_archer', 55.0, 24.0),
      this.makeEnemy('black_warrior', 47.5, 23.5),
    ];

    this.pickups = [
      { id: this.nextEntityId++, kind: 'meat', wx: 26.0, wy: 38.5, bobOffset: 0 },
      { id: this.nextEntityId++, kind: 'gold', wx: 8.5, wy: 22.5, bobOffset: 1.1 },
      { id: this.nextEntityId++, kind: 'wood', wx: 32.0, wy: 27.5, bobOffset: 2.0 },
      { id: this.nextEntityId++, kind: 'gold', wx: 53.5, wy: 27.5, bobOffset: 2.7 },
    ];

    this.projectiles = [];
    this.telegraphs = [];
    this.slashes = [];
    this.spriteVfx = [];
    this.particles = [];
    this.floatingTexts = [];
    this.boss = {
      active: false,
      wx: 32,
      wy: 9.2,
      hp: 360,
      maxHp: 360,
      shield: 70,
      maxShield: 70,
      phase: 1,
      state: 'IDLE',
      stateTimer: 1.2,
      hitFlash: 0,
      attackCombo: 0,
      towerTimer: 2.8,
      decoys: [],
    };
    this.bossGateOpen = attractMode;
    this.addSafeProps(denseFill);
    if (attractMode) {
      this.player.heroForm = 'warrior';
      this.player.wx = 32;
      this.player.wy = 26;
    }
  }

  private buildExpoParkMap(): void {
    this.zone = 'EXPO_PARK';
    this.mapW = 36;
    this.mapH = 28;
    const m: GroundKind[][] = Array.from({ length: 28 }, () => Array<GroundKind>(36).fill(0));

    for (let y = 2; y <= 25; y++) {
      for (let x = 2; x <= 33; x++) {
        if (x >= 7 && x <= 28 && y >= 6 && y <= 21) m[y][x] = 7;
        else m[y][x] = 2;
      }
    }

    this.map = m;
    // 5 Expo Park Booths using all 5 Tiny Swords factions!
    this.buildings = [
      { id: 'ex_1', name: 'Blue Keep · Ultra 5', subtitle: 'Campus Dash', faction: 'Blue', kind: 'castle', tx: 6, ty: 5, tw: 5, th: 3, accent: '#00C7FD' },
      { id: 'ex_2', name: 'Yellow Guild · Ultra 7', subtitle: 'FlowCraft Pro', faction: 'Yellow', kind: 'monastery', tx: 16, ty: 4, tw: 4, th: 3, accent: '#F59E0B' },
      { id: 'ex_3', name: 'Red Arena · Ultra 9', subtitle: 'Apex Frame', faction: 'Red', kind: 'archery', tx: 25, ty: 5, tw: 4, th: 3, accent: '#EF4444' },
      { id: 'ex_4', name: 'Purple Abbey · Ultra 5', subtitle: 'FeatherAir', faction: 'Purple', kind: 'house1', tx: 9, ty: 14, tw: 3, th: 2, accent: '#A855F7' },
      { id: 'ex_5', name: 'Black Forge · Ultra 7', subtitle: 'Canvas Studio', faction: 'Black', kind: 'barracks', tx: 23, ty: 14, tw: 4, th: 3, accent: '#94A3B8' },
    ];
    for (const b of this.buildings) {
      for (let y = b.ty; y < b.ty + b.th; y++) {
        for (let x = b.tx; x < b.tx + b.tw; x++) {
          m[y][x] = 8;
        }
      }
    }

    // Expo Park Organized Woodland Border & Courtyard Symmetry
    this.props = [
      { kind: 'tree', wx: 3.5, wy: 4.2, variant: 0 },
      { kind: 'tree', wx: 3.5, wy: 7.4, variant: 2 },
      { kind: 'tree', wx: 3.5, wy: 10.6, variant: 1 },
      { kind: 'tree', wx: 3.5, wy: 13.8, variant: 3 },
      { kind: 'tree', wx: 3.5, wy: 17.4, variant: 0 },
      { kind: 'tree', wx: 3.6, wy: 20.6, variant: 2 },
      { kind: 'tree', wx: 4.2, wy: 23.6, variant: 1 },
      { kind: 'tree', wx: 32.2, wy: 4.2, variant: 3 },
      { kind: 'tree', wx: 32.2, wy: 7.4, variant: 1 },
      { kind: 'tree', wx: 32.2, wy: 10.6, variant: 2 },
      { kind: 'tree', wx: 32.2, wy: 13.8, variant: 0 },
      { kind: 'tree', wx: 32.2, wy: 17.4, variant: 3 },
      { kind: 'tree', wx: 32.0, wy: 20.6, variant: 1 },
      { kind: 'tree', wx: 31.4, wy: 23.6, variant: 2 },
      { kind: 'tree', wx: 13.0, wy: 4.2, variant: 1 },
      { kind: 'tree', wx: 22.8, wy: 4.2, variant: 0 },
      { kind: 'tree', wx: 7.2, wy: 23.8, variant: 0 },
      { kind: 'tree', wx: 10.6, wy: 23.8, variant: 2 },
      { kind: 'tree', wx: 25.4, wy: 23.8, variant: 1 },
      { kind: 'tree', wx: 28.8, wy: 23.8, variant: 3 },
      { kind: 'bush', wx: 5.6, wy: 21.5, variant: 2 },
      { kind: 'bush', wx: 30.2, wy: 21.5, variant: 3 },
      { kind: 'bush', wx: 5.4, wy: 10.2, variant: 0 },
      { kind: 'bush', wx: 30.4, wy: 10.2, variant: 1 },
      { kind: 'bush', wx: 15.2, wy: 12.6, variant: 2 },
      { kind: 'bush', wx: 20.8, wy: 12.6, variant: 3 },
      { kind: 'gold_stone', wx: 14.4, wy: 11.2, variant: 1 },
      { kind: 'gold_stone', wx: 21.6, wy: 11.2, variant: 3 },
    ];

    const expoDense: PropItem[] = [
      { kind: 'tree', wx: 5.0, wy: 6.0, variant: 1 },
      { kind: 'tree', wx: 5.0, wy: 12.4, variant: 0 },
      { kind: 'tree', wx: 5.0, wy: 18.6, variant: 2 },
      { kind: 'tree', wx: 30.6, wy: 6.0, variant: 2 },
      { kind: 'tree', wx: 30.6, wy: 12.4, variant: 3 },
      { kind: 'tree', wx: 30.6, wy: 18.6, variant: 1 },
      { kind: 'stump', wx: 6.0, wy: 17.4, variant: 0 },
      { kind: 'stump', wx: 29.6, wy: 17.4, variant: 1 },
    ];

    this.intelProps = [
      { id: 'ex_hub', hardwareKey: 'core_ultra_hub', kind: 'chip', wx: 18.0, wy: 14.0, label: 'CORE ULTRA HUB [E]', accent: '#00C7FD' },
      { id: 'ex_st_a', hardwareKey: 'expo_station_a', kind: 'booth', wx: 12.2, wy: 7.6, label: 'STATION A · ULTRA 5 [E]', accent: '#00C7FD' },
      { id: 'ex_st_c', hardwareKey: 'expo_station_c', kind: 'booth', wx: 21.6, wy: 7.2, label: 'STATION C · ULTRA 7 [E]', accent: '#F59E0B' },
      { id: 'ex_st_b', hardwareKey: 'expo_station_b', kind: 'booth', wx: 27.0, wy: 13.0, label: 'STATION B · ULTRA 9 [E]', accent: '#EF4444' },
      { id: 'ex_ai_apps', hardwareKey: 'ai_pc_apps', kind: 'aiPc', wx: 10.2, wy: 17.6, label: 'FEATHERAIR · 300+ APPS [E]', accent: '#A855F7' },
      { id: 'ex_ai_xess', hardwareKey: 'ai_pc_xess', kind: 'aiPc', wx: 25.8, wy: 17.6, label: 'CANVAS STUDIO · ARC [E]', accent: '#94A3B8' },
    ];

    this.waterDecos = [
      { kind: 'duck', wx: 18, wy: 1.0, variant: 0, phase: 0.3 },
      { kind: 'duck', wx: 1, wy: 14, variant: 0, phase: 1.4 },
      { kind: 'duck', wx: 34.5, wy: 15, variant: 0, phase: 2.6 },
      { kind: 'duck', wx: 10, wy: 26.5, variant: 0, phase: 0.9 },
      { kind: 'water_rock', wx: 8, wy: 26.6, variant: 0, phase: 0 },
      { kind: 'water_rock', wx: 27, wy: 26.6, variant: 2, phase: 1.1 },
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
      mkSheep(6.0, 14.6, [{ wx: 6.0, wy: 14.6 }, { wx: 6.2, wy: 16.0 }], 'GRASS'),
      mkSheep(29.8, 14.6, [{ wx: 29.8, wy: 14.6 }, { wx: 29.6, wy: 16.0 }], 'IDLE'),
      mkSheep(8.6, 20.8, [{ wx: 8.6, wy: 20.8 }, { wx: 10.0, wy: 20.8 }], 'MOVE'),
      mkSheep(27.4, 20.8, [{ wx: 27.4, wy: 20.8 }, { wx: 26.0, wy: 20.8 }], 'GRASS'),
    ];

    this.villagers = [
      mkVillager(21, 'Blue', 'pawn_gold', 13.6, 12.6, [{ wx: 13.6, wy: 12.6 }, { wx: 16.6, wy: 12.6 }], 'MOVE'),
      mkVillager(22, 'Yellow', 'monk', 22.4, 12.6, [{ wx: 22.4, wy: 12.6 }, { wx: 19.4, wy: 12.6 }], 'ACTION'),
      mkVillager(23, 'Purple', 'pawn', 14.6, 19.8, [{ wx: 14.6, wy: 19.8 }, { wx: 16.8, wy: 17.8 }], 'MOVE'),
      mkVillager(24, 'Red', 'archer', 21.4, 19.8, [{ wx: 21.4, wy: 19.8 }, { wx: 19.2, wy: 17.8 }], 'IDLE'),
      mkVillager(25, 'Blue', 'monk', 18.0, 16.4, [{ wx: 18.0, wy: 16.4 }, { wx: 16.2, wy: 16.4 }, { wx: 19.8, wy: 16.4 }], 'MOVE'),
    ];

    this.signposts = [
      { wx: 18, wy: 23.2, label: 'WATCH CHAMPIONS SPAR · PRESS [E] AT BOOTHS · [C] STORE GUIDE', color: '#F59E0B' },
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
    this.player.wx = 18;
    this.player.wy = 21;
    this.player.hp = 100;
    this.player.battery = 100;
    this.matchedPcId = getMatchedExpoPcId(this.profile);
    this.addSafeProps(expoDense);
    this.centerCameraInstant();
  }

  private addSafeProps(candidates: PropItem[]): void {
    const blockedZones: { wx: number; wy: number; r: number }[] = [
      { wx: 9.5, wy: 42.0, r: 1.8 },
      { wx: 23.0, wy: 39.5, r: 1.8 },
      { wx: 18.0, wy: 21.0, r: 1.8 },
      { wx: 32.0, wy: 26.0, r: 1.8 },
    ];
    for (const n of this.npcs) blockedZones.push({ wx: n.wx, wy: n.wy, r: 1.7 });
    for (const t of this.tasks) blockedZones.push({ wx: t.wx, wy: t.wy, r: 1.6 });
    for (const e of this.enemies) blockedZones.push({ wx: e.wx, wy: e.wy, r: 1.5 });
    for (const pk of this.pickups) blockedZones.push({ wx: pk.wx, wy: pk.wy, r: 1.2 });
    for (const sp of this.signposts) blockedZones.push({ wx: sp.wx, wy: sp.wy, r: 1.3 });
    for (const ip of this.intelProps) blockedZones.push({ wx: ip.wx, wy: ip.wy, r: ip.kind === 'booth' ? 1.8 : 1.3 });
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
        ((tx >= 16 && tx <= 21 && ty >= 37 && ty <= 42) ||
          (tx >= 18 && tx <= 22 && ty >= 21 && ty <= 26) ||
          (tx >= 42 && tx <= 46 && ty >= 21 && ty <= 26) ||
          (tx >= 29 && tx <= 34 && ty >= 14 && ty <= 18) ||
          (tx >= 29 && tx <= 34 && ty >= 30 && ty <= 34))
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

  private makeEnemy(unitClass: EnemyClass, wx: number, wy: number): EnemyEntity {
    const faction: FactionColor =
      unitClass.startsWith('red') ? 'Red' : unitClass.startsWith('purple') ? 'Purple' : 'Black';
    const maxHp =
      unitClass === 'black_warrior' || unitClass === 'purple_lancer'
        ? 52
        : unitClass.includes('archer')
          ? 40
          : 34;
    return {
      id: this.nextEntityId++,
      unitClass,
      faction,
      wx,
      wy,
      vx: 0,
      vy: 0,
      hp: maxHp,
      maxHp,
      state: 'PATROL',
      stateTimer: 0.7 + Math.random(),
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

    // Collide with Intel AI PC booths, chips, and laptops
    for (const ip of this.intelProps) {
      if (ip.kind === 'booth') {
        if (Math.abs(wx - ip.wx) < 0.85 + radius && Math.abs(wy - (ip.wy - 0.15)) < 0.5 + radius) {
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
        if (n === ignore || n.kind === 'trap_gate' || n.kind === 'boss_gate') continue;
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
    if (wx < 19 && wy >= 32) return 'TRAP_ALLEY';
    if (wy >= 32) return 'ECORE_PARK';
    if (wx < 21) return 'NPU_LIBRARY';
    if (wx > 43) return 'ARC_ARENA';
    if (wy < 16) return 'BOSS_COLOSSEUM';
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
    const fitScale = Math.min(1, Math.max(0.68, Math.min(this.viewW / 1040, this.viewH / 580)));
    const baseZoom = dist === 'BOSS_COLOSSEUM' ? 0.85 : this.zone === 'EXPO_PARK' ? 1.0 : 0.96;
    this.targetZoom = baseZoom * fitScale;

    if (dist !== this.prevDistrict) {
      this.prevDistrict = dist;
      const titles: Record<DistrictId, string> = {
        TRAP_ALLEY: 'ISLAND 1 · BARGAIN TRAP ALLEY',
        ECORE_PARK: 'ISLAND 2 · E-CORE EFFICIENCY PARK',
        COPPER_PLAZA: 'ISLAND 3 · COPPER BUS PLAZA',
        NPU_LIBRARY: 'ISLAND 4 · NPU OFFLINE MONASTERY',
        ARC_ARENA: 'ISLAND 5 · ARC XeSS ARCHERY ARENA',
        BOSS_COLOSSEUM: 'OVERCLOCKED COLOSSEUM · BLACK CITADEL',
        EXPO_PARK: 'INTEL AI PC EXPO PARK',
      };
      this.showBanner(titles[dist], 2.4);
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
    const tx = 32 + Math.cos(this.attractTimer * 0.55) * 7.5;
    const ty = 24.5 + Math.sin(this.attractTimer * 0.75) * 4.5;
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
    const fitScale = Math.min(1, Math.max(0.68, Math.min(this.viewW / 1040, this.viewH / 580)));
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
        if (nearNpc.kind === 'boss_gate') {
          this.showBanner('Unlock NPU Monastery (West) & Arc Archery (East) first!', 2.6);
          gameAudio.playBossTelegraph();
          return;
        }
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
      this.player.attackTimer = 0.2;
      this.player.attackCooldown = buff ? 0.2 : 0.28;
      this.player.attackAlt = !this.player.attackAlt;
      gameAudio.playSlash();

      const radius = buff ? 2.4 : 1.95;
      const dmg = buff ? 32 : 24;
      this.slashes.push({
        wx: this.player.wx,
        wy: this.player.wy,
        angle: this.player.facingAngle,
        timer: 0.16,
        maxTimer: 0.16,
        color: buff ? '#22D3EE' : '#00C7FD',
        radius,
      });
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
      if (this.boss.active && Math.hypot(this.boss.wx - this.player.wx, this.boss.wy - this.player.wy) <= 5.0) {
        this.damageBoss(40, true);
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
    if (this.boss.active && Math.hypot(this.boss.wx - cx, this.boss.wy - cy) <= radius * 1.15) {
      this.damageBoss(damage, false);
    }
    if (this.boss.active) {
      this.boss.decoys = this.boss.decoys.filter((d) => Math.hypot(d.wx - cx, d.wy - cy) > radius * 0.95);
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

  private damageBoss(dmg: number, fromNpu: boolean): void {
    if (!this.boss.active) return;

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
    if (this.boss.phase === 1 && ratio <= 0.66 && this.boss.hp > 0) {
      this.boss.phase = 2;
      this.boss.state = 'STUNNED';
      this.boss.stateTimer = 1.05;
      gameAudio.playBossPhase();
      this.triggerShake(0.36, 8);
      this.spawnSpriteFx('fire2', 26, 9, 90, 0.9);
      this.spawnSpriteFx('fire2', 38, 9, 90, 0.9);
      this.showBanner('PHASE 2 · BLACK TOWER VOLLEY & ARCHERS!', 2.6);
      this.enemies.push(this.makeEnemy('black_archer', 26, 9.5));
      this.enemies.push(this.makeEnemy('black_archer', 38, 9.5));
    } else if (this.boss.phase === 2 && ratio <= 0.33 && this.boss.hp > 0) {
      this.boss.phase = 3;
      this.boss.state = 'STUNNED';
      this.boss.stateTimer = 1.0;
      gameAudio.playBossPhase();
      this.triggerShake(0.4, 9);
      this.spawnSpriteFx('explosion2', this.boss.wx, this.boss.wy, 180, 0.6);
      this.showBanner('PHASE 3 · SINGLE-LANE PANIC OVERLOAD!', 2.6);
      this.boss.decoys = [
        { wx: 26, wy: 8.5, life: 12 },
        { wx: 38, wy: 8.5, life: 12 },
      ];
    }

    if (this.boss.hp <= 0) {
      this.boss.active = false;
      this.telegraphs = [];
      this.projectiles = [];
      this.enemies = [];
      this.hitstopTimer = 0.085;
      this.triggerShake(0.6, 12);
      this.spawnSpriteFx('explosion2', this.boss.wx, this.boss.wy, 240, 0.8);
      this.spawnSpriteFx('healEffect', this.player.wx, this.player.wy, 180, 0.85);
      this.spawnBurstWorld(this.boss.wx, this.boss.wy, '#00C7FD', 40);
      gameAudio.playVictory();
      gameAudio.playTransform();
      this.phase = 'EXPO_TRANSFORM';
      this.transformTimer = 2.4;
      this.matchedPcId = getMatchedExpoPcId(this.profile);
      this.showBanner('LAG TITAN DEFEATED · TRANSFORMING INTO EXPO PARK!', 3.2);
      this.emitHud();
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
      const gate = this.npcs.find((n) => n.kind === 'trap_gate');
      if (gate && Math.hypot(gate.wx - this.player.wx, gate.wy - this.player.wy) < 1.8) {
        gameAudio.playCrash();
        this.triggerShake(0.42, 8);
        this.spawnSpriteFx('explosion1', gate.wx, gate.wy, 120, 0.5);
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

    if (this.bossGateOpen && !this.bossTriggered && this.player.wy < 13.8) {
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
      const dx = this.player.wx - e.wx;
      const dy = this.player.wy - e.wy;
      const dist = Math.hypot(dx, dy);
      e.flipX = dx < 0;
      e.stateTimer -= dt;

      if (e.unitClass.includes('archer')) {
        if (dist < 8.2 && e.shootTimer <= 0) {
          e.shootTimer = 2.2;
          const len = Math.max(0.1, dist);
          this.projectiles.push({
            wx: e.wx,
            wy: e.wy,
            vx: (dx / len) * 5.2,
            vy: (dy / len) * 5.2,
            life: 2.2,
            color: e.faction === 'Red' ? '#EF4444' : '#94A3B8',
            radius: 0.25,
            arrowFaction: e.faction,
          });
        } else {
          e.shootTimer -= dt;
        }
      }

      if (e.state === 'PATROL') {
        if (dist < 5.6) {
          e.state = 'WINDUP';
          e.stateTimer = 0.5;
        }
      } else if (e.state === 'WINDUP') {
        if (e.stateTimer <= 0) {
          e.state = 'LUNGE';
          e.stateTimer = 0.36;
          const len = Math.max(0.1, dist);
          const spd = e.unitClass.includes('archer') ? 3.5 : 6.0;
          e.vx = (dx / len) * spd;
          e.vy = (dy / len) * spd;
        }
      } else if (e.state === 'LUNGE') {
        this.moveWithCollision(e, e.vx * dt, e.vy * dt, 0.25);
        if (dist < 0.85) this.damagePlayer(12);
        if (e.stateTimer <= 0) {
          e.state = 'COOLDOWN';
          e.stateTimer = 0.65;
        }
      } else if (e.state === 'COOLDOWN') {
        if (e.stateTimer <= 0) e.state = 'PATROL';
      }
    }
  }

  private updateBoss(dt: number): void {
    const b = this.boss;
    if (b.hitFlash > 0) b.hitFlash -= dt;

    for (let i = b.decoys.length - 1; i >= 0; i--) {
      b.decoys[i].life -= dt;
      if (b.decoys[i].life <= 0) b.decoys.splice(i, 1);
    }

    // Flanking Black Towers fire arrows periodically!
    b.towerTimer -= dt;
    if (b.towerTimer <= 0) {
      b.towerTimer = b.phase === 3 ? 2.2 : 3.2;
      const towers = [
        { wx: 24.0, wy: 6.8 },
        { wx: 40.0, wy: 6.8 },
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
          arrowFaction: 'Black',
        });
      }
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
        const spd = b.phase === 3 ? 2.5 : 1.7;
        this.moveWithCollision(b, (dx / dist) * spd * dt, (dy / dist) * spd * dt, 0.55);
      }
      if (b.stateTimer <= 0) {
        b.attackCombo = (b.attackCombo + 1) % 2;
        const roll = Math.random();
        if (roll < 0.42) {
          b.state = 'WINDUP_SLAM';
          b.stateTimer = b.phase === 3 ? 0.68 : 0.88;
          gameAudio.playBossTelegraph();
          this.telegraphs.push({
            wx: this.player.wx,
            wy: this.player.wy,
            radius: 2.2,
            timer: b.stateTimer,
            maxTimer: b.stateTimer,
            damage: 18,
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
            damage: 16,
          });
        }
      }
    } else if (b.state === 'WINDUP_SLAM' || b.state === 'WINDUP_RING') {
      if (b.stateTimer <= 0) {
        b.state = 'COOLDOWN';
        b.stateTimer = b.phase === 3 ? 0.6 : 0.9;
      }
    } else if (b.state === 'WINDUP_FAN') {
      if (b.stateTimer <= 0) {
        const count = b.phase === 3 ? 7 : 5;
        const base = Math.atan2(dy, dx);
        for (let k = 0; k < count; k++) {
          const ang = base + (k - (count - 1) / 2) * 0.26;
          this.projectiles.push({
            wx: b.wx,
            wy: b.wy,
            vx: Math.cos(ang) * (b.phase === 3 ? 6.0 : 5.0),
            vy: Math.sin(ang) * (b.phase === 3 ? 6.0 : 5.0),
            life: 2.8,
            color: k % 2 === 0 ? '#EC4899' : '#EF4444',
            radius: 0.3,
          });
        }
        gameAudio.playHit(false);
        b.state = 'COOLDOWN';
        b.stateTimer = b.phase === 3 ? 0.65 : 1.0;
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
        this.damagePlayer(11);
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
        nearbyPrompt =
          nearNpc.kind === 'boss_gate' ? '[E] Inspect Colosseum Gate' : `[E] Talk to ${nearNpc.name}`;
      } else if (nearTask) {
        nearbyPrompt = `[E / O] Rescue ${nearTask.label}`;
      } else if (nearHw) {
        nearbyPrompt = `[E / Click] Inspect ${INTEL_HARDWARE_SPECS[nearHw.hardwareKey].title}`;
      }
    }

    const districtNames: Record<DistrictId, string> = {
      TRAP_ALLEY: 'Bargain Trap Island',
      ECORE_PARK: 'E-Core Efficiency Park',
      COPPER_PLAZA: 'Copper Bus Plaza',
      NPU_LIBRARY: 'NPU Study Monastery',
      ARC_ARENA: 'Arc XeSS Archery Arena',
      BOSS_COLOSSEUM: 'Overclocked Colosseum',
      EXPO_PARK: 'Intel AI PC Expo Park',
    };

    const fpsDisplay =
      dist === 'TRAP_ALLEY' && !this.trapCompleted
        ? 11 + Math.floor(Math.sin(this.elapsed * 9) * 3)
        : this.player.xessBuffTimer > 0
          ? 120
          : 60;

    const phaseLabels: Record<1 | 2 | 3, string> = {
      1: 'Phase 1 · Black Guard & RGB Shield',
      2: 'Phase 2 · Black Tower Archery Volley',
      3: 'Phase 3 · Single-Lane Panic Overload',
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
      bossName: 'Black Warlord · Lag Titan',
      bossPhaseLabel: phaseLabels[this.boss.phase],
      bossHp: Math.round(this.boss.hp),
      bossMaxHp: this.boss.maxHp,
      bossShield: Math.round(this.boss.shield),
      bossMaxShield: this.boss.maxShield,
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

    // 2B. Cloud Ground Shadows (cast diagonally south-east onto terrain & ocean BELOW tall props/actors)
    for (const c of this.clouds) {
      const img = atlas.clouds[c.variant % atlas.clouds.length];
      const shadowImg = this.getCloudShadowCanvas(c.variant, img);
      const dw = 460 * c.scale * 0.72;
      const dh = (img.height / img.width) * dw;
      const sx = c.wx * TILE_SIZE + 145;
      const sy = c.wy * TILE_SIZE + 180;
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.drawImage(shadowImg, sx - dw / 2, sy - dh / 2, dw, dh);
      ctx.restore();
    }

    // 3. Signposts
    for (const sp of this.signposts) {
      const px = sp.wx * TILE_SIZE;
      const py = sp.wy * TILE_SIZE;
      ctx.save();
      ctx.font = '700 11px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      const w = ctx.measureText(sp.label).width + 24;
      ctx.fillStyle = '#5c3a25';
      ctx.strokeStyle = '#d7b887';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(px - w / 2, py - 34, w, 24, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = sp.color;
      ctx.fillText(sp.label, px, py - 18);
      ctx.restore();
    }

    // 4. Boss Floor Telegraphs
    for (const t of this.telegraphs) {
      const px = t.wx * TILE_SIZE;
      const py = t.wy * TILE_SIZE;
      const r = t.radius * TILE_SIZE;
      const pct = 1 - t.timer / t.maxTimer;
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(239, 68, 68, ${0.2 + pct * 0.3})`;
      ctx.fill();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py, r * pct, 0, Math.PI * 2);
      ctx.strokeStyle = '#FCA5A5';
      ctx.lineWidth = 2;
      ctx.stroke();
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

    // Roaming Animated Sheep
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
          this.drawTinyShadow(ctx, atlas, px, py + 4, 42);
          this.drawSquareStrip(ctx, sheet, px, py + 10, 74, {
            fps: s.state === 'MOVE' ? 10 : 8,
            flipX: s.flipX,
            seed: Math.round(s.wx * 3),
          });
        },
      });
    }

    // Living Ecosystem Villagers (Pawns, Monks, Archers, Lancers)
    for (const v of this.villagers) {
      drawList.push({
        sortY: v.wy * TILE_SIZE,
        draw: () => {
          const px = v.wx * TILE_SIZE;
          const py = v.wy * TILE_SIZE;
          const u = atlas.units[v.faction];
          this.drawTinyShadow(ctx, atlas, px, py + 4, 48);
          let strip = u.pawnIdle;
          let sizePx = 108;
          let yOff = 15;
          if (v.role === 'pawn_gold') {
            strip = v.state === 'MOVE' ? u.pawnRunGold : u.pawnIdleGold;
          } else if (v.role === 'monk') {
            strip = v.state === 'MOVE' ? u.monkRun : v.state === 'ACTION' ? u.monkHeal : u.monkIdle;
          } else if (v.role === 'archer') {
            strip = v.state === 'MOVE' ? u.archerRun : u.archerIdle;
          } else if (v.role === 'lancer') {
            strip = v.state === 'MOVE' ? u.lancerRun : u.lancerIdle;
            sizePx = 148;
            yOff = 23;
          } else {
            strip = v.state === 'MOVE' ? u.pawnRun : v.state === 'ACTION' ? u.pawnInteractHammer : u.pawnIdle;
          }
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
          this.drawSquareStrip(ctx, atlas.units.Blue.warriorGuard, g.wx * TILE_SIZE, g.wy * TILE_SIZE + 14, 118, {
            fps: 10,
            flipX: g.flipX,
            alpha: g.alpha * 0.65,
          });
        },
      });
    }

    // Trapped AI Tasks -> Rescued Intel AI PCs!
    for (const t of this.tasks) {
      drawList.push({
        sortY: t.wy * TILE_SIZE,
        draw: () => {
          const px = t.wx * TILE_SIZE;
          const py = t.wy * TILE_SIZE;
          const bob = Math.sin(this.elapsed * 4 + t.wx) * 2.5;
          ctx.save();
          ctx.strokeStyle = t.rescued ? 'rgba(0, 199, 253, 0.9)' : 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(px, py + 4, 24, 10, 0, 0, Math.PI * 2);
          ctx.stroke();

          if (t.rescued) {
            ctx.drawImage(atlas.intelHardware.aiPc, px - 26, py - 46 + bob * 0.6, 52, 52);
          } else {
            const hl = atlas.goldHighlights[t.variant % atlas.goldHighlights.length];
            this.drawSquareStrip(ctx, hl, px, py + 12 + bob, 68, { fps: 10, seed: t.variant * 5 });
            ctx.drawImage(atlas.intelHardware.trapLaptop, px + 4, py - 34 + bob, 30, 30);
          }
          ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = INK;
          ctx.fillText(t.rescued ? `${t.label} · AI PC ✓` : t.label, px + 1, py - 46 + bob);
          ctx.fillStyle = t.rescued ? '#38BDF8' : '#FCA5A5';
          ctx.fillText(t.rescued ? `${t.label} · AI PC ✓` : t.label, px, py - 47 + bob);
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
          ctx.font = '700 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = pk.kind === 'meat' ? '#34D399' : pk.kind === 'gold' ? '#FCD34D' : '#BAE6FD';
          ctx.fillText(pk.kind === 'meat' ? '+BAT' : pk.kind === 'gold' ? '+GOLD' : '+WOOD', px, py - 36 + bob);
          ctx.restore();
        },
      });
    }

    // Story Mentors & Gates
    for (const n of this.npcs) {
      drawList.push({
        sortY: n.wy * TILE_SIZE,
        draw: () => {
          const px = n.wx * TILE_SIZE;
          const py = n.wy * TILE_SIZE;
          if (n.kind === 'trap_gate' || n.kind === 'boss_gate') {
            const towerImg =
              n.kind === 'trap_gate' ? atlas.buildings.Red.tower : atlas.buildings.Black.tower;
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            this.drawTinyShadow(ctx, atlas, px, py + 6, 80);
            ctx.drawImage(towerImg, px - 42, py - 120, 84, 130);
            ctx.font = '700 12px "Chakra Petch", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = INK;
            ctx.fillText(n.name, px + 1, py - 125);
            ctx.fillStyle = '#FCA5A5';
            ctx.fillText(n.name, px, py - 126);
            ctx.restore();
            return;
          }

          this.drawTinyShadow(ctx, atlas, px, py + 5, 56);
          const flipX = this.player.wx < n.wx;
          if (n.kind === 'npu') {
            this.drawSquareStrip(ctx, atlas.units.Purple.monkHeal, px, py + 16, 118, {
              fps: 10,
              flipX,
            });
          } else if (n.kind === 'arc') {
            this.drawSquareStrip(ctx, atlas.units.Yellow.archerIdle, px, py + 16, 116, {
              fps: 10,
              flipX,
            });
          } else {
            this.drawSquareStrip(ctx, atlas.units.Blue.monkIdle, px, py + 16, 116, {
              fps: 10,
              flipX,
            });
          }

          const near = Math.hypot(n.wx - this.player.wx, n.wy - this.player.wy) < 2.4;
          ctx.save();
          ctx.font = '700 12px "Chakra Petch", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = INK;
          ctx.fillText(near ? `[E] ${n.name}` : n.name, px + 1, py - 69);
          ctx.fillStyle = near ? '#F59E0B' : '#FFFFFF';
          ctx.fillText(near ? `[E] ${n.name}` : n.name, px, py - 70);
          ctx.restore();
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
              ctx.ellipse(px, py + 6, 48, 18, 0, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.restore();

            // Left sparring Warrior + Right sparring Lancer clashing with Fire FX!
            const cycle = (this.elapsed * 1.55 + pc.wx * 0.7) % 2.2;
            const wStrip =
              cycle < 0.85 ? fUnits.warriorAttack1 : cycle < 1.35 ? fUnits.warriorGuard : fUnits.warriorIdle;
            this.drawTinyShadow(ctx, atlas, px - 22, py + 6, 52);
            this.drawSquareStrip(ctx, wStrip, px - 22, py + 14, 112, { fps: 10, flipX: false });

            const lStrip =
              cycle >= 0.45 && cycle < 1.35 ? fUnits.lancerRightAttack : fUnits.lancerIdle;
            this.drawTinyShadow(ctx, atlas, px + 24, py + 6, 56);
            this.drawSquareStrip(ctx, lStrip, px + 24, py + 24, 156, { fps: 10, flipX: true });

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
              ctx.drawImage(fireSheet, fIdx * fh, 0, fh, fh, Math.round(px - 28), Math.round(py - 56), 56, 56);
              ctx.restore();
            }

            if (isMatch) {
              this.drawGoldenCrown(ctx, px - 22, py - 68);
              ctx.save();
              ctx.font = '700 12px "Chakra Petch", sans-serif';
              ctx.textAlign = 'center';
              ctx.fillStyle = INK;
              ctx.fillText('★ YOUR BEST MATCH', px + 1, py - 83);
              ctx.fillStyle = '#FCD34D';
              ctx.fillText('★ YOUR BEST MATCH', px, py - 84);
              ctx.restore();
            }

            ctx.save();
            ctx.font = '700 12px "Chakra Petch", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = INK;
            ctx.fillText(near ? `[E] ${pc.name}` : isTagged ? `${pc.name} ★` : pc.name, px + 1, py + 31);
            ctx.fillStyle = near ? '#F59E0B' : isTagged ? '#34D399' : '#FFFFFF';
            ctx.fillText(near ? `[E] ${pc.name}` : isTagged ? `${pc.name} ★` : pc.name, px, py + 30);
            ctx.restore();
          },
        });
      }
    }

    // Faction Enemies (Red / Purple / Black Units)
    for (const e of this.enemies) {
      drawList.push({
        sortY: e.wy * TILE_SIZE,
        draw: () => {
          const px = e.wx * TILE_SIZE;
          const py = e.wy * TILE_SIZE;
          const u = atlas.units[e.faction];
          this.drawTinyShadow(ctx, atlas, px, py + 5, 52);

          let strip = u.warriorIdle;
          let sizePx = 114;
          let yOff = 15;
          if (e.unitClass === 'red_pawn') {
            strip = e.state === 'LUNGE' ? u.pawnRun : e.state === 'WINDUP' ? u.pawnInteractHammer : u.pawnIdle;
          } else if (e.unitClass.includes('archer')) {
            strip = e.shootTimer > 1.85 ? u.archerShoot : e.state === 'LUNGE' ? u.archerRun : u.archerIdle;
          } else if (e.unitClass === 'purple_lancer') {
            strip = e.state === 'LUNGE' ? u.lancerRightAttack : u.lancerIdle;
            sizePx = 160;
            yOff = 24;
          } else {
            strip =
              e.state === 'LUNGE'
                ? u.warriorAttack1
                : e.state === 'WINDUP'
                  ? u.warriorGuard
                  : u.warriorIdle;
          }

          this.drawSquareStrip(ctx, strip, px, py + yOff, sizePx, {
            fps: 11,
            flipX: e.flipX,
            hitFlash: e.hitFlash > 0,
            seed: e.id * 3,
          });

          if (e.state === 'WINDUP') {
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(px, py - 24, 26, 0, Math.PI * 2);
            ctx.stroke();
          }
          if (e.hp < e.maxHp) {
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(px - 18, py - 56, 36, 5);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(px - 18, py - 56, Math.max(0, (e.hp / e.maxHp) * 36), 5);
          }
        },
      });
    }

    // Giant Black Warrior Lag Titan Boss
    if (this.zone === 'SILICON_CITY' && this.boss.hp > 0) {
      for (const d of this.boss.decoys) {
        drawList.push({
          sortY: d.wy * TILE_SIZE,
          draw: () => {
            this.drawSquareStrip(ctx, atlas.units.Black.warriorIdle, d.wx * TILE_SIZE, d.wy * TILE_SIZE + 20, 180, {
              fps: 10,
              alpha: 0.45,
            });
          },
        });
      }
      drawList.push({
        sortY: this.boss.wy * TILE_SIZE,
        draw: () => {
          const px = this.boss.wx * TILE_SIZE;
          const py = this.boss.wy * TILE_SIZE;
          const bu = atlas.units.Black;
          this.drawTinyShadow(ctx, atlas, px, py + 12, 130);

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

          this.drawSquareStrip(ctx, strip, px, py + 34, 240, {
            fps: 11,
            flipX: this.player.wx < this.boss.wx,
            hitFlash: this.boss.hitFlash > 0,
          });

          if (this.boss.shield > 0) {
            const hue = Math.floor(this.elapsed * 180) % 360;
            ctx.strokeStyle = `hsla(${hue}, 95%, 60%, 0.85)`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(px, py - 50, 82, 0, Math.PI * 2);
            ctx.stroke();
          }
        },
      });
    }

    // Byte Hero (Blue Pawn in Act I -> Blue Warrior in Silicon City & Expo Park!)
    drawList.push({
      sortY: this.player.wy * TILE_SIZE,
      draw: () => {
        const px = this.player.wx * TILE_SIZE;
        const py = this.player.wy * TILE_SIZE;

        // Ground stagelight pool beneath Byte (broad, ultra-soft wash)
        ctx.save();
        ctx.translate(px, py + 4);
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

        this.drawTinyShadow(ctx, atlas, px, py + 5, 56);
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

        this.drawSquareStrip(ctx, strip, px, py + 16, 118, {
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
          ctx.ellipse(px, py + 4, 32, 13, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      },
    });

    drawList.sort((a, b) => a.sortY - b.sortY);
    for (const item of drawList) item.draw();

    // 6. Slashes, Arrows/Projectiles, Tiny Swords Sprite FX, Particles & Floating Text
    for (const sl of this.slashes) {
      const px = sl.wx * TILE_SIZE;
      const py = sl.wy * TILE_SIZE - 22;
      const pct = sl.timer / sl.maxTimer;
      ctx.save();
      ctx.strokeStyle = sl.color;
      ctx.globalAlpha = pct;
      ctx.lineWidth = 10 * pct + 3;
      ctx.beginPath();
      ctx.arc(px, py, sl.radius * 32, sl.angle - 1.05, sl.angle + 1.05);
      ctx.stroke();
      ctx.restore();
    }

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

    // 7. Large Camera-Near Overhead Clouds (closer to the top-down eye with subtle parallax!)
    for (const c of this.clouds) {
      const img = atlas.clouds[c.variant % atlas.clouds.length];
      const baseX = c.wx * TILE_SIZE;
      const baseY = c.wy * TILE_SIZE;
      const cx = baseX + (baseX - this.camX) * 0.16;
      const cy = baseY + (baseY - this.camY) * 0.16;
      const dw = 480 * c.scale;
      const dh = (img.height / img.width) * dw;
      ctx.save();
      ctx.globalAlpha = 0.78;
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

    // 1. Wide, ultra-smooth peripheral depth blur (keeps a broad clear field around Byte)
    const bw = Math.max(180, Math.round(vw * 0.3));
    const bh = Math.max(100, Math.round(vh * 0.3));
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
      bctx.filter = 'blur(2px)';
      bctx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, bw, bh);
      bctx.filter = 'none';

      // Smooth wide diagonal fade so blur stretches gently toward outer corners
      bctx.globalCompositeOperation = 'destination-out';
      const sx = heroSx * (bw / vw);
      const sy = heroSy * (bh / vh);
      const bDiag = Math.hypot(bw, bh);
      const clearR = bDiag * 0.27;
      const blurFullR = bDiag * 0.9;
      const eraseGrad = bctx.createRadialGradient(sx, sy, clearR, sx, sy, blurFullR);
      eraseGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      eraseGrad.addColorStop(0.18, 'rgba(0, 0, 0, 0.94)');
      eraseGrad.addColorStop(0.38, 'rgba(0, 0, 0, 0.78)');
      eraseGrad.addColorStop(0.58, 'rgba(0, 0, 0, 0.54)');
      eraseGrad.addColorStop(0.78, 'rgba(0, 0, 0, 0.28)');
      eraseGrad.addColorStop(0.92, 'rgba(0, 0, 0, 0.09)');
      eraseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bctx.fillStyle = eraseGrad;
      bctx.fillRect(0, 0, bw, bh);
      bctx.restore();

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.blurCanvas, 0, 0, bw, bh, 0, 0, vw, vh);
      ctx.restore();
    }

    const vDiag = Math.hypot(vw, vh);

    // 2. Wide, ultra-soft ambient stagelight wash across the arena (no concentrated spotlight disc)
    const spotRadius = vDiag * 0.52;
    const spotGlow = ctx.createRadialGradient(heroSx, heroSy, 28, heroSx, heroSy, spotRadius);
    spotGlow.addColorStop(0, 'rgba(255, 250, 232, 0.065)');
    spotGlow.addColorStop(0.35, 'rgba(224, 242, 254, 0.032)');
    spotGlow.addColorStop(0.72, 'rgba(186, 230, 253, 0.01)');
    spotGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGlow;
    ctx.fillRect(0, 0, vw, vh);

    // 3. Single unified, broad, gradual vignette extending cleanly past the screen corners
    const isTrap = dist === 'TRAP_ALLEY' && !this.trapCompleted;
    const isBoss = dist === 'BOSS_COLOSSEUM';
    const rInner = vDiag * 0.22;
    const rOuter = vDiag * 0.92;
    const darkVig = ctx.createRadialGradient(heroSx, heroSy, rInner, heroSx, heroSy, rOuter);
    darkVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    darkVig.addColorStop(0.18, isTrap ? 'rgba(42, 8, 14, 0.04)' : 'rgba(6, 10, 22, 0.03)');
    darkVig.addColorStop(0.38, isTrap ? 'rgba(46, 9, 16, 0.12)' : 'rgba(5, 8, 20, 0.09)');
    darkVig.addColorStop(0.58, isTrap ? 'rgba(42, 7, 14, 0.24)' : 'rgba(4, 7, 18, 0.20)');
    darkVig.addColorStop(0.78, isTrap ? 'rgba(32, 5, 11, 0.40)' : 'rgba(3, 6, 16, 0.35)');
    darkVig.addColorStop(0.92, isTrap ? 'rgba(24, 4, 9, 0.54)' : 'rgba(2, 5, 14, 0.48)');
    darkVig.addColorStop(
      1,
      isTrap ? 'rgba(18, 3, 7, 0.64)' : isBoss ? 'rgba(2, 5, 14, 0.66)' : 'rgba(2, 5, 14, 0.58)'
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

        // Copper Bus silicon circuit traces connecting islands
        if (
          this.zone === 'SILICON_CITY' &&
          (g === 3 || g === 2 || g === 4 || g === 5) &&
          ((tx === 32 && ty >= 17 && ty <= 38) || (ty === 24 && tx >= 18 && tx <= 46))
        ) {
          ctx.fillStyle = 'rgba(0, 199, 253, 0.24)';
          if (tx === 32) ctx.fillRect(px + TILE_SIZE / 2 - 2, py, 4, TILE_SIZE);
          if (ty === 24) ctx.fillRect(px, py + TILE_SIZE / 2 - 2, TILE_SIZE, 4);
        }

        // Subtle district glaze on Trap Alley & Colosseum
        if (g === 1) {
          ctx.fillStyle = 'rgba(153, 27, 27, 0.16)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (g === 6) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (g === 9) {
          const pulse = 0.32 + Math.sin(this.elapsed * 5) * 0.14;
          ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#FCA5A5';
          ctx.fillRect(px + 2, py + TILE_SIZE / 2 - 3, TILE_SIZE - 4, 6);
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

  private drawIntelHardwareProp(
    ctx: CanvasRenderingContext2D,
    atlas: TinySwordsAtlas,
    ip: IntelHardwareProp
  ): void {
    const px = ip.wx * TILE_SIZE;
    const py = ip.wy * TILE_SIZE;
    const near = Math.hypot(ip.wx - this.player.wx, ip.wy - this.player.wy) < 2.35;
    const bob = ip.kind === 'booth' ? 0 : Math.sin(this.elapsed * 2.6 + ip.wx) * 1.5;
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (near) {
      ctx.strokeStyle = ip.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(px, py + 5, ip.kind === 'booth' ? 54 : 30, ip.kind === 'booth' ? 18 : 11, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (ip.kind === 'booth') {
      const img = atlas.intelHardware.booth;
      const w = 136;
      const h = Math.round((img.height / img.width) * w);
      this.drawTinyShadow(ctx, atlas, px, py + 7, 126);
      ctx.drawImage(img, Math.round(px - w / 2), Math.round(py - h + 16), w, h);
    } else if (ip.kind === 'chip') {
      const img = atlas.intelHardware.chip;
      this.drawTinyShadow(ctx, atlas, px, py + 6, 52);
      ctx.drawImage(img, Math.round(px - 27), Math.round(py - 46 + bob), 54, 54);
    } else if (ip.kind === 'aiPc') {
      const img = atlas.intelHardware.aiPc;
      this.drawTinyShadow(ctx, atlas, px, py + 6, 52);
      ctx.drawImage(img, Math.round(px - 28), Math.round(py - 46 + bob), 56, 56);
    } else {
      const img = atlas.intelHardware.trapLaptop;
      this.drawTinyShadow(ctx, atlas, px, py + 6, 52);
      ctx.drawImage(img, Math.round(px - 28), Math.round(py - 46 + bob), 56, 56);
    }

    // Crisp Intel hardware interactive nameplate
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const lw = ctx.measureText(ip.label).width + 14;
    const labelY = py + 13;
    ctx.fillStyle = near ? 'rgba(0, 85, 155, 0.96)' : 'rgba(11, 17, 32, 0.88)';
    ctx.strokeStyle = near ? '#FDE68A' : ip.accent;
    ctx.lineWidth = near ? 2 : 1.5;
    ctx.beginPath();
    ctx.roundRect(px - lw / 2, labelY, lw, 17, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = near ? '#FEF3C7' : '#F8FAFC';
    ctx.fillText(ip.label, px, labelY + 12);
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

    // Subtle wooden nameplate below building
    ctx.font = '700 11px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    const labelW = Math.max(122, ctx.measureText(b.name).width + 20);
    ctx.fillStyle = 'rgba(43, 27, 18, 0.9)';
    ctx.strokeStyle = b.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - labelW / 2, bottomY + 8, labelW, 21, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FDF6E3';
    ctx.fillText(b.name, cx, bottomY + 22);
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
      // Tree1/2 = 1536x256 (8 frames of 192x256), Tree3/4 = 1536x192 (8 frames of 192x192)
      const frames = 8;
      const cellW = sheet.width / frames;
      const cellH = sheet.height;
      const seed = Math.abs(Math.round(p.wx * 7 + p.wy * 11)) + p.variant * 3;
      const frame = Math.floor(this.elapsed * 7 + seed) % frames;
      this.drawTinyShadow(ctx, atlas, px, py + 6, 88);
      ctx.drawImage(sheet, frame * cellW, 0, cellW, cellH, px - 68, py - 118, 136, (cellH / cellW) * 136);
    } else if (p.kind === 'stump') {
      const img = atlas.stumps[p.variant % atlas.stumps.length];
      ctx.drawImage(img, px - 36, py - 68, 72, (img.height / img.width) * 72);
    } else if (p.kind === 'bush') {
      const sheet = atlas.bushes[p.variant % atlas.bushes.length];
      const seed = Math.abs(Math.round(p.wx * 5 + p.wy * 9)) + p.variant * 4;
      this.drawSquareStrip(ctx, sheet, px, py + 12, 68, { fps: 7, seed });
    } else if (p.kind === 'rock') {
      const img = atlas.rocks[p.variant % atlas.rocks.length];
      this.drawTinyShadow(ctx, atlas, px, py + 4, 42);
      ctx.drawImage(img, px - 26, py - 38, 52, 52);
    } else if (p.kind === 'gold_stone') {
      const img = atlas.goldStones[p.variant % atlas.goldStones.length];
      this.drawTinyShadow(ctx, atlas, px, py + 4, 52);
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

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (opts.alpha !== undefined && opts.alpha < 1) ctx.globalAlpha = opts.alpha;
    if (opts.hitFlash) ctx.filter = 'brightness(2.3)';
    ctx.translate(Math.round(px), Math.round(bottomY));
    ctx.scale(opts.flipX ? -1 : 1, 1);
    ctx.drawImage(
      strip,
      frameIdx * fh,
      0,
      fh,
      fh,
      -Math.round(targetHeight / 2),
      -Math.round(targetHeight),
      Math.round(targetHeight),
      Math.round(targetHeight)
    );
    ctx.restore();
  }

  private drawTinyShadow(
    ctx: CanvasRenderingContext2D,
    atlas: TinySwordsAtlas,
    px: number,
    py: number,
    width: number
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.drawImage(atlas.shadow, 0, 0, 192, 192, px - width / 2, py - width * 0.46, width, width);
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
