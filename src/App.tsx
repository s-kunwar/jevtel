import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { AiPcForgeSection } from './components/AiPcForgeSection';
import { ArcadeCabinetModal } from './components/ArcadeCabinetModal';
import { DialogueModal } from './components/DialogueModal';
import { ExpoPcModal } from './components/ExpoPcModal';
import { FastModeExperience } from './components/FastModeExperience';
import { GameHud } from './components/GameHud';
import { HardwareDetailModal } from './components/HardwareDetailModal';
import { preloadYouTubeIframeApi } from './components/HeroArcade3DStage';
import { HeroGateway } from './components/HeroGateway';
import { IntroPreloader } from './components/IntroPreloader';
import { LandingHeader, type AppMode } from './components/LandingHeader';
import { PauseModal } from './components/PauseModal';
import { NovaAdvisorChat, type NovaKioskContext } from './components/NovaAdvisorChat';
import { PreferenceProductsSection } from './components/PreferenceProductsSection';
import { RetailActionSection } from './components/RetailActionSection';
import { IntelBlueprintDivider, IntelMarginSeal } from './components/SketchDoodles';
import { TitleScreen } from './components/TitleScreen';
import { VictorySummary } from './components/VictorySummary';
import { preloadAllProBuilderAssets } from './game/assets';
import { gameAudio } from './game/audio';
import {
  BUDGET_OPTIONS,
  DAILY_LIFE_OPTIONS,
  SHOWDOWN_ROUNDS,
  formatFastInr,
  solveFastModeMatch,
  type FastModeSelection,
  type FastStoreId,
  type ShowdownRoundId,
} from './game/fastModeData';
import { INTEL_HARDWARE_SPECS } from './game/intelHardwareData';
import {
  DEFAULT_BUILDER_CONFIG,
  GRAPHICS_OPTIONS,
  MEMORY_OPTIONS,
  PROCESSOR_OPTIONS,
  STORAGE_OPTIONS,
  WORKLOAD_SCENARIOS,
  mapQuestPcToBuilderConfig,
  type PcBuilderConfig,
  type WorkloadScenarioId,
} from './game/pcBuilderData';
import { computeRecommendation, STORY_DIALOGUES } from './game/storyData';
import type {
  CatalogPcCharacter,
  DialogueChoice,
  GamePhase,
  HudSnapshot,
  IntelHardwareKey,
  PlayerProfile,
} from './game/types';
import { SiliconWorldEngine } from './game/worldEngine';

const INITIAL_HUD: HudSnapshot = {
  zone: 'SILICON_CITY',
  district: 'ECORE_PARK',
  districtTitle: 'E-Core Efficiency Park',
  pcLabel: 'Byte · Blue Pawn',
  heroForm: 'pawn',
  hp: 100,
  maxHp: 100,
  battery: 100,
  npuCharge: 100,
  goldCount: 0,
  woodCount: 0,
  fpsDisplay: 60,
  hasNpuPulse: false,
  hasXessSurge: false,
  dashReadyPct: 100,
  specialReadyPct: 100,
  tasksRescued: 0,
  totalTasks: 4,
  objectiveText: 'Explore Silicon City',
  nearbyPrompt: null,
  bossActive: false,
  bossName: 'Black Warlord · Lag Titan',
  bossPhaseLabel: 'Phase 1 · Black Guard & RGB Shield',
  bossHp: 360,
  bossMaxHp: 360,
  bossShield: 70,
  bossMaxShield: 70,
  bannerText: null,
  inExpoPark: false,
  matchedPcId: 'pc_campus_dash',
  taggedPcIds: [],
  inspectedPcCount: 0,
  totalExpoPcs: 5,
};

const KIOSK_IDLE_TIMEOUT_MS = 180_000;

const DEFAULT_FAST_SELECTION: FastModeSelection = {
  primaryLife: 'college',
  secondaryLife: null,
  priorities: ['ai_tools', 'no_charger', 'four_years'],
  budgetTier: '75k_95k',
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SiliconWorldEngine | null>(null);

  const [appMode, setAppMode] = useState<AppMode>('fast');
  const [fastSelection, setFastSelection] = useState<FastModeSelection>(DEFAULT_FAST_SELECTION);
  const [fastStoreFilter, setFastStoreFilter] = useState<FastStoreId>('all');
  const [fastRound, setFastRound] = useState<ShowdownRoundId>('baseline');

  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('TITLE');
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [dialogueId, setDialogueId] = useState<string | null>(null);
  const [activeExpoPc, setActiveExpoPc] = useState<CatalogPcCharacter | null>(null);
  const [inspectedHardwareKey, setInspectedHardwareKey] = useState<IntelHardwareKey | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [finalProfile, setFinalProfile] = useState<PlayerProfile | null>(null);
  const [muted, setMuted] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('jevtel_theme') === 'dark';
    } catch {
      return false;
    }
  });

  // Fast Mode is instant-start (introDone = true); Pro Builder arms real artwork + sprite + 3D cabinet + CRT video preload
  const [introDone, setIntroDone] = useState<boolean>(true);
  const [spritesReady, setSpritesReady] = useState<boolean>(false);
  const [cabinetArtReady, setCabinetArtReady] = useState<boolean>(false);
  const [assetProgress, setAssetProgress] = useState<number>(0);
  const [videoReady, setVideoReady] = useState<boolean>(false);

  const [builderConfig, setBuilderConfig] = useState<PcBuilderConfig>(DEFAULT_BUILDER_CONFIG);
  const [workloadScenario, setWorkloadScenario] = useState<WorkloadScenarioId>('study_ai');
  const [xessEnabled, setXessEnabled] = useState(true);
  const [matchSource, setMatchSource] = useState<'builder' | 'quest'>('builder');
  const [questMatchedPcId, setQuestMatchedPcId] = useState<string | undefined>(undefined);
  const [hasCompletedQuest, setHasCompletedQuest] = useState(false);
  const [novaOpen, setNovaOpen] = useState(false);
  const [novaSessionNonce, setNovaSessionNonce] = useState(0);
  const [novaQueuedPrompt, setNovaQueuedPrompt] = useState<{ id: number; text: string } | null>(null);

  const phaseRef = useRef<GamePhase>('TITLE');
  phaseRef.current = phase;
  const inExpoRef = useRef(false);
  inExpoRef.current = hud.inExpoPark;
  const arcadeOpenRef = useRef(false);
  arcadeOpenRef.current = arcadeOpen;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      window.localStorage.setItem('jevtel_theme', darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage failure
    }
  }, [darkMode]);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const handleToggleMute = useCallback(() => {
    gameAudio.init();
    const nextMuted = gameAudio.toggleMute();
    setMuted(nextMuted);
  }, []);

  const handleTogglePause = useCallback(() => {
    if (showStoreModal) {
      setShowStoreModal(false);
      return;
    }
    if (phaseRef.current === 'PLAYING' || phaseRef.current === 'EXPO_PARK') {
      setPhase('PAUSED');
      engineRef.current?.setPhase('PAUSED');
    } else if (phaseRef.current === 'PAUSED') {
      const resumePhase: GamePhase = inExpoRef.current ? 'EXPO_PARK' : 'PLAYING';
      setPhase(resumePhase);
      engineRef.current?.setPhase(resumePhase);
    }
  }, [showStoreModal]);

  const handleChangeMode = useCallback((next: AppMode) => {
    if (next === 'fast') {
      setArcadeOpen(false);
      setShowStoreModal(false);
      setIntroDone(true);
      setAppMode('fast');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Switching to Pro Builder: initiate real asset & YT CRT preload behind IntroPreloader
    const reduced =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

    setAppMode('pro');
    setCabinetArtReady(false);
    setVideoReady(false);
    preloadYouTubeIframeApi();
    void preloadAllProBuilderAssets((pct) => setAssetProgress(pct)).then(() => {
      setSpritesReady(true);
      setAssetProgress(100);
    });
    setIntroDone(reduced);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (appMode !== 'pro') return;
    preloadYouTubeIframeApi();
    void preloadAllProBuilderAssets((pct) => setAssetProgress(pct)).then(() => {
      setSpritesReady(true);
      setAssetProgress(100);
    });
  }, [appMode]);

  useEffect(() => {
    if (arcadeOpen && appMode === 'pro') {
      document.body.classList.add('arcade-scroll-lock');
    } else {
      document.body.classList.remove('arcade-scroll-lock');
    }
    engineRef.current?.setArcadeActive(arcadeOpen && appMode === 'pro');
    return () => {
      document.body.classList.remove('arcade-scroll-lock');
    };
  }, [arcadeOpen, appMode]);

  useEffect(() => {
    if (appMode !== 'pro') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new SiliconWorldEngine(canvas, {
      onHudUpdate: (snapshot) => setHud(snapshot),
      onStartDialogue: (id) => {
        setActiveExpoPc(null);
        setInspectedHardwareKey(null);
        setDialogueId(id);
        setPhase('DIALOGUE');
      },
      onEnterExpoPark: (profile) => {
        setFinalProfile(profile);
        setHasCompletedQuest(true);
        setPhase('EXPO_PARK');
      },
      onInteractExpoPc: (pc) => {
        setDialogueId(null);
        setInspectedHardwareKey(null);
        setActiveExpoPc(pc);
        setPhase('DIALOGUE');
      },
      onInspectHardware: (hardwareKey) => {
        setDialogueId(null);
        setActiveExpoPc(null);
        setInspectedHardwareKey(hardwareKey);
        setPhase('DIALOGUE');
      },
      onOpenStoreModal: () => {
        setShowStoreModal((prev) => !prev);
      },
      onGameOver: (profile) => {
        setFinalProfile(profile);
        setPhase('GAME_OVER');
      },
      onTogglePause: handleTogglePause,
      onToggleMute: handleToggleMute,
    });

    engineRef.current = engine;
    engine.setArcadeActive(arcadeOpenRef.current);
    engine.startLoop();

    return () => {
      engine.destroy();
      gameAudio.dispose();
      engineRef.current = null;
    };
  }, [appMode, handleToggleMute, handleTogglePause]);

  const handleStartGame = useCallback(() => {
    setFinalProfile(null);
    setDialogueId(null);
    setActiveExpoPc(null);
    setInspectedHardwareKey(null);
    setShowStoreModal(false);
    engineRef.current?.startNewRun();
  }, []);

  const handleLaunchArcade = useCallback(() => {
    setArcadeOpen(true);
    engineRef.current?.setArcadeActive(true);
    engineRef.current?.forceResize();
    window.requestAnimationFrame(() => engineRef.current?.forceResize());
    window.setTimeout(() => engineRef.current?.forceResize(), 80);
    if (phaseRef.current === 'TITLE' || phaseRef.current === 'GAME_OVER') {
      handleStartGame();
    } else if (phaseRef.current === 'PAUSED') {
      const resumePhase: GamePhase = inExpoRef.current ? 'EXPO_PARK' : 'PLAYING';
      setPhase(resumePhase);
      engineRef.current?.setPhase(resumePhase);
    }
  }, [handleStartGame]);

  const handleExitArcade = useCallback(() => {
    if (phaseRef.current === 'PLAYING' || phaseRef.current === 'EXPO_PARK') {
      setPhase('PAUSED');
      engineRef.current?.setPhase('PAUSED');
    }
    setArcadeOpen(false);
  }, []);

  const handleJumpToChecklist = useCallback(() => {
    handleExitArcade();
    window.requestAnimationFrame(() => {
      document.getElementById('store-guide')?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [handleExitArcade]);

  const handleResetSession = useCallback(() => {
    setAppMode('fast');
    setIntroDone(true);
    setFastSelection(DEFAULT_FAST_SELECTION);
    setFastStoreFilter('all');
    setFastRound('baseline');
    setArcadeOpen(false);
    setFinalProfile(null);
    setDialogueId(null);
    setActiveExpoPc(null);
    setInspectedHardwareKey(null);
    setShowStoreModal(false);
    setPhase('TITLE');
    engineRef.current?.setArcadeActive(false);
    engineRef.current?.setPhase('TITLE');
    setBuilderConfig(DEFAULT_BUILDER_CONFIG);
    setWorkloadScenario('study_ai');
    setXessEnabled(true);
    setMatchSource('builder');
    setQuestMatchedPcId(undefined);
    setHasCompletedQuest(false);
    setNovaOpen(false);
    setNovaQueuedPrompt(null);
    setNovaSessionNonce((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 3-minute retail kiosk idle auto-return safeguard
  useEffect(() => {
    let idleTimer: number | null = null;

    const armTimer = () => {
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        handleResetSession();
      }, KIOSK_IDLE_TIMEOUT_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      'pointerdown',
      'keydown',
      'wheel',
      'touchstart',
    ];
    events.forEach((evt) => window.addEventListener(evt, armTimer, { passive: true }));
    armTimer();

    return () => {
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      events.forEach((evt) => window.removeEventListener(evt, armTimer));
    };
  }, [handleResetSession]);

  const resumeActiveWorld = useCallback(() => {
    const nextPhase: GamePhase = inExpoRef.current ? 'EXPO_PARK' : 'PLAYING';
    setPhase(nextPhase);
    engineRef.current?.setPhase(nextPhase);
  }, []);

  const handleAdvanceDialogue = useCallback(() => {
    if (!dialogueId) return;
    const step = STORY_DIALOGUES[dialogueId];
    if (!step) {
      setDialogueId(null);
      resumeActiveWorld();
      return;
    }

    if (step.onCompleteEffect) {
      engineRef.current?.applyDialogueEffect(step.onCompleteEffect);
    }

    if (step.nextId && STORY_DIALOGUES[step.nextId]) {
      setDialogueId(step.nextId);
    } else {
      setDialogueId(null);
      resumeActiveWorld();
    }
  }, [dialogueId, resumeActiveWorld]);

  const handleSelectChoice = useCallback(
    (choice: DialogueChoice) => {
      if (choice.effect) {
        engineRef.current?.applyDialogueEffect(choice.effect);
      }
      if (choice.nextNodeId && STORY_DIALOGUES[choice.nextNodeId]) {
        setDialogueId(choice.nextNodeId);
      } else {
        setDialogueId(null);
        resumeActiveWorld();
      }
    },
    [resumeActiveWorld]
  );

  const handleCloseExpoPc = useCallback(() => {
    setActiveExpoPc(null);
    resumeActiveWorld();
  }, [resumeActiveWorld]);

  const handleCloseHardwareModal = useCallback(() => {
    setInspectedHardwareKey(null);
    resumeActiveWorld();
  }, [resumeActiveWorld]);

  const handleInspectAdHardware = useCallback((hardwareKey: IntelHardwareKey) => {
    setDialogueId(null);
    setActiveExpoPc(null);
    setInspectedHardwareKey(hardwareKey);
    setPhase('DIALOGUE');
    engineRef.current?.setPhase('DIALOGUE');
  }, []);

  const handleSendQuestMatchToStore = useCallback(
    (profile: PlayerProfile, matchedPcId: string) => {
      const nextBuilder = mapQuestPcToBuilderConfig(matchedPcId);
      setBuilderConfig(nextBuilder);
      if (profile.primaryNeed === 'gaming' || matchedPcId === 'pc_apex_frame') {
        setWorkloadScenario('gaming_xess');
      } else if (matchedPcId === 'pc_canvas_studio') {
        setWorkloadScenario('creator_4k');
      } else {
        setWorkloadScenario('study_ai');
      }
      setQuestMatchedPcId(matchedPcId);
      setMatchSource('quest');
      setHasCompletedQuest(true);
      setShowStoreModal(false);
      setArcadeOpen(false);
      setPhase('PAUSED');
      engineRef.current?.setPhase('PAUSED');
      window.requestAnimationFrame(() => {
        document.getElementById('store-guide')?.scrollIntoView({ behavior: 'smooth' });
      });
    },
    []
  );

  const handleOpenNova = useCallback((promptText?: string) => {
    setNovaOpen(true);
    if (promptText && promptText.trim()) {
      setNovaQueuedPrompt({ id: Date.now(), text: promptText.trim() });
    }
  }, []);

  const handleAskNovaFromQuest = useCallback(
    (profile: PlayerProfile, matchedPcId: string) => {
      handleSendQuestMatchToStore(profile, matchedPcId);
      setNovaOpen(true);
      setNovaQueuedPrompt({
        id: Date.now(),
        text: 'I just finished the Silicon Quest arcade game! Can you help me pick the right Core Ultra tier for my budget and use case?',
      });
    },
    [handleSendQuestMatchToStore]
  );

  const currentDialogue = dialogueId ? STORY_DIALOGUES[dialogueId] : null;
  const effectiveProfile: PlayerProfile = finalProfile ?? {
    primaryNeed: 'learning',
    tasksRescued: hud.tasksRescued,
    totalTasks: hud.totalTasks,
    enemiesDefeated: 0,
    npuUses: 0,
    xessUses: 0,
    dashesUsed: 0,
    batteryRemaining: hud.battery,
    hpRemaining: hud.hp,
    damageTaken: 0,
    elapsedSeconds: 120,
  };

  const questRec = hasCompletedQuest
    ? computeRecommendation(effectiveProfile, questMatchedPcId ?? hud.matchedPcId)
    : null;

  const fastMatch = solveFastModeMatch(fastSelection, fastStoreFilter);
  const fastPrimaryMeta = DAILY_LIFE_OPTIONS.find((d) => d.id === fastSelection.primaryLife);
  const fastSecondaryMeta = fastSelection.secondaryLife
    ? DAILY_LIFE_OPTIONS.find((d) => d.id === fastSelection.secondaryLife)
    : undefined;
  const fastBudgetMeta = BUDGET_OPTIONS.find((b) => b.id === fastSelection.budgetTier);
  const fastRoundMeta = SHOWDOWN_ROUNDS.find((r) => r.id === fastRound);

  const novaKioskContext: NovaKioskContext = {
    appMode,
    hasCompletedQuest,
    matchSource,
    processorLabel:
      PROCESSOR_OPTIONS.find((p) => p.id === builderConfig.processor)?.label ?? '',
    graphicsLabel:
      GRAPHICS_OPTIONS.find((g) => g.id === builderConfig.graphics)?.label ?? '',
    memoryLabel:
      MEMORY_OPTIONS.find((m) => m.id === builderConfig.memory)?.label ?? '',
    storageLabel:
      STORAGE_OPTIONS.find((s) => s.id === builderConfig.storage)?.label ?? '',
    scenarioLabel:
      WORKLOAD_SCENARIOS.find((s) => s.id === workloadScenario)?.label ?? '',
    matchedTierName: questRec?.tierName ?? '',
    fastModeProfile:
      appMode === 'fast'
        ? {
            primaryLife: fastPrimaryMeta?.title ?? 'College & Assignments',
            secondaryLife: fastSecondaryMeta?.title,
            priorities: fastSelection.priorities,
            budgetLabel: fastBudgetMeta?.label ?? '₹75,000 – ₹95,000',
            storeFilter: fastStoreFilter,
            matchedModel: fastMatch.primaryLaptop.name,
            matchedSku: fastMatch.primaryLaptop.storeSku,
            matchedRetailer: fastMatch.primaryLaptop.retailerName,
            matchedPrice: formatFastInr(fastMatch.primaryLaptop.priceInr),
            stretchModel: fastMatch.stretchLaptop
              ? `${fastMatch.stretchLaptop.name} (${formatFastInr(fastMatch.stretchLaptop.priceInr)} at ${fastMatch.stretchLaptop.retailerName})`
              : undefined,
            activeShowdownRound: fastRoundMeta?.buttonLabel ?? 'Fresh Out of Box',
          }
        : undefined,
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FAF8F5] text-[#111827] transition-colors duration-200 dark:bg-[#0B1120] dark:text-[#F3F4F6]">
        <AnimatePresence>
          {appMode === 'pro' && !introDone && (
            <IntroPreloader
              spritesReady={spritesReady}
              cabinetArtReady={cabinetArtReady}
              videoReady={videoReady}
              assetProgress={assetProgress}
              onFinish={() => setIntroDone(true)}
            />
          )}
        </AnimatePresence>

        <div
          className={`${
            appMode === 'fast' ? 'fast-mode-canvas' : 'landing-sketch-root'
          } relative overflow-x-clip`}
        >
          {/* Subtle architectural Intel silicon seal watermark in quiet outer whitespace margins */}
          {appMode === 'pro' && (
            <>
              <IntelMarginSeal className="fixed right-[-44px] top-28 z-0 hidden h-52 w-52 2xl:block" />
              <IntelMarginSeal className="fixed bottom-12 left-[-48px] z-0 hidden h-56 w-56 2xl:block" />
            </>
          )}

          <LandingHeader
            appMode={appMode}
            onChangeMode={handleChangeMode}
            onPlayQuest={handleLaunchArcade}
            onOpenNova={() => handleOpenNova()}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            muted={muted}
            onToggleMute={handleToggleMute}
          />

          <main>
            {appMode === 'fast' ? (
              <FastModeExperience
                selection={fastSelection}
                onChangeSelection={setFastSelection}
                storeFilter={fastStoreFilter}
                onChangeStoreFilter={setFastStoreFilter}
                activeRound={fastRound}
                onChangeRound={setFastRound}
                muted={muted}
                onOpenNova={(prompt) => handleOpenNova(prompt)}
                onSwitchToPro={() => handleChangeMode('pro')}
              />
            ) : (
              <>
                <HeroGateway
                  onLaunchArcade={handleLaunchArcade}
                  hasCompletedQuest={hasCompletedQuest}
                  introReady={introDone}
                  arcadeOpen={arcadeOpen}
                  darkMode={darkMode}
                  globalMuted={muted}
                  onToggleGlobalMute={handleToggleMute}
                  onVideoReady={() => setVideoReady(true)}
                  onCabinetArtReady={() => setCabinetArtReady(true)}
                />
                <IntelBlueprintDivider label="01 · ARCHITECTURE & BENCHMARK" roamingVariant="heroes" />
                <AiPcForgeSection
                  config={builderConfig}
                  onChangeConfig={(next) => {
                    setBuilderConfig(next);
                    setMatchSource('builder');
                  }}
                  scenario={workloadScenario}
                  onChangeScenario={setWorkloadScenario}
                  xessEnabled={xessEnabled}
                  onToggleXess={() => setXessEnabled((prev) => !prev)}
                />
                <IntelBlueprintDivider label="02 · RETAIL VERIFICATION" roamingVariant="sheep" />
                <RetailActionSection
                  builderConfig={builderConfig}
                  matchSource={matchSource}
                  questMatchedPcId={questMatchedPcId}
                  onLaunchArcade={handleLaunchArcade}
                  onAskNova={(prompt) => handleOpenNova(prompt)}
                />
                <IntelBlueprintDivider label="03 · CURATED STORE CATALOG" roamingVariant="boss" />
                <PreferenceProductsSection
                  builderConfig={builderConfig}
                  scenario={workloadScenario}
                  matchSource={matchSource}
                  questMatchedPcId={questMatchedPcId}
                  onApplyProductToBuilder={(next) => {
                    setBuilderConfig(next);
                    setMatchSource('builder');
                  }}
                />
              </>
            )}
          </main>

          {/* Quiet Footer + Kiosk Reset Safeguard */}
          <footer className="border-t border-[#E5E7EB] bg-[#FAF8F5] py-8 transition-colors duration-200 dark:border-[#1F2937] dark:bg-[#0B1120]">
            <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-4 px-5 text-xs text-[#6B7280] dark:text-[#9CA3AF] sm:flex-row sm:items-center md:px-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">Jevtel</span>
                <span aria-hidden="true">·</span>
                <span>
                  {appMode === 'fast'
                    ? 'Croma · Reliance Digital · Vijay Sales Store Guide'
                    : 'Amazon India · Croma · Vijay Sales · Reliance Digital Store Guide'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetSession}
                className="inline-flex min-h-[44px] sm:min-h-0 items-center gap-1.5 font-medium text-[#4B5563] transition-colors hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Session</span>
              </button>
            </div>
          </footer>
        </div>

      {/* Expanding Full-Screen Intel Core Ultra Arcade Machine (Pro Builder) */}
      {appMode === 'pro' && (
        <ArcadeCabinetModal
        open={arcadeOpen}
        muted={muted}
        phase={phase}
        hud={hud}
        onToggleMute={handleToggleMute}
        onResetQuest={handleStartGame}
        onExitArcade={handleExitArcade}
        onJumpToChecklist={handleJumpToChecklist}
        onInspectAdHardware={handleInspectAdHardware}
        onVirtualMove={(dx, dy) => engineRef.current?.setVirtualMove(dx, dy)}
        onVirtualAction={(action) => engineRef.current?.triggerVirtualAction(action)}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />

        {phase === 'TITLE' && (
          <TitleScreen
            muted={muted}
            onStart={handleStartGame}
            onToggleMute={handleToggleMute}
            onExitArcade={handleExitArcade}
          />
        )}

        {(phase === 'PLAYING' ||
          phase === 'DIALOGUE' ||
          phase === 'PAUSED' ||
          phase === 'EXPO_TRANSFORM' ||
          phase === 'EXPO_PARK') && (
          <GameHud
            hud={hud}
            muted={muted}
            onToggleMute={handleToggleMute}
            onPause={handleTogglePause}
            onExitArcade={handleExitArcade}
            onOpenStoreModal={() => setShowStoreModal(true)}
          />
        )}

        {phase === 'DIALOGUE' && currentDialogue && (
          <DialogueModal
            step={currentDialogue}
            onAdvance={handleAdvanceDialogue}
            onSelectChoice={handleSelectChoice}
          />
        )}

        {phase === 'DIALOGUE' && activeExpoPc && (
          <ExpoPcModal
            pc={activeExpoPc}
            isMatched={activeExpoPc.id === hud.matchedPcId}
            isTagged={hud.taggedPcIds.includes(activeExpoPc.id)}
            onTriggerDemo={() => engineRef.current?.triggerPcDemoEffect(activeExpoPc)}
            onToggleTag={() => engineRef.current?.toggleTagPc(activeExpoPc.id)}
            onOpenStoreGuide={() => {
              setActiveExpoPc(null);
              resumeActiveWorld();
              setShowStoreModal(true);
            }}
            onClose={handleCloseExpoPc}
          />
        )}

        {phase === 'DIALOGUE' && inspectedHardwareKey && (
          <HardwareDetailModal
            spec={INTEL_HARDWARE_SPECS[inspectedHardwareKey]}
            onClose={handleCloseHardwareModal}
          />
        )}

        {phase === 'PAUSED' && (
          <PauseModal
            muted={muted}
            onResume={handleTogglePause}
            onRestart={handleStartGame}
            onToggleMute={handleToggleMute}
            onExitArcade={handleExitArcade}
          />
        )}

        {(showStoreModal || phase === 'GAME_OVER') && (
          <VictorySummary
            profile={effectiveProfile}
            overridePcId={hud.taggedPcIds[0] ?? hud.matchedPcId}
            taggedPcIds={hud.taggedPcIds}
            isGameOver={phase === 'GAME_OVER'}
            onCloseModal={() => setShowStoreModal(false)}
            onPlayAgain={handleStartGame}
            onSendToLandingChecklist={handleSendQuestMatchToStore}
            onAskNovaFromQuest={handleAskNovaFromQuest}
          />
        )}
      </ArcadeCabinetModal>
      )}

      <NovaAdvisorChat
        open={novaOpen}
        onOpenChange={setNovaOpen}
        arcadeOpen={arcadeOpen}
        sessionNonce={novaSessionNonce}
        queuedPrompt={novaQueuedPrompt}
        kioskContext={novaKioskContext}
      />
      </div>
    </MotionConfig>
  );
}
