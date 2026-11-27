import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { AiPcForgeSection } from './components/AiPcForgeSection';
import { ArcadeCabinetModal } from './components/ArcadeCabinetModal';
import { DialogueModal } from './components/DialogueModal';
import { ExpoPcModal } from './components/ExpoPcModal';
import { GameHud } from './components/GameHud';
import { HardwareDetailModal } from './components/HardwareDetailModal';
import { HeroGateway } from './components/HeroGateway';
import { IntroPreloader } from './components/IntroPreloader';
import { LandingHeader } from './components/LandingHeader';
import { PauseModal } from './components/PauseModal';
import { RetailActionSection } from './components/RetailActionSection';
import { TitleScreen } from './components/TitleScreen';
import { VictorySummary } from './components/VictorySummary';
import { initTinySwordsUiSkins } from './game/assets';
import { gameAudio } from './game/audio';
import { INTEL_HARDWARE_SPECS } from './game/intelHardwareData';
import {
  DEFAULT_BUILDER_CONFIG,
  mapQuestPcToBuilderConfig,
  type PcBuilderConfig,
  type WorkloadScenarioId,
} from './game/pcBuilderData';
import { STORY_DIALOGUES } from './game/storyData';
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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SiliconWorldEngine | null>(null);

  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('TITLE');
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [dialogueId, setDialogueId] = useState<string | null>(null);
  const [activeExpoPc, setActiveExpoPc] = useState<CatalogPcCharacter | null>(null);
  const [inspectedHardwareKey, setInspectedHardwareKey] = useState<IntelHardwareKey | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [finalProfile, setFinalProfile] = useState<PlayerProfile | null>(null);
  const [muted, setMuted] = useState(false);
  const [introDone, setIntroDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  const [builderConfig, setBuilderConfig] = useState<PcBuilderConfig>(DEFAULT_BUILDER_CONFIG);
  const [workloadScenario, setWorkloadScenario] = useState<WorkloadScenarioId>('study_ai');
  const [xessEnabled, setXessEnabled] = useState(true);
  const [matchSource, setMatchSource] = useState<'builder' | 'quest'>('builder');
  const [questMatchedPcId, setQuestMatchedPcId] = useState<string | undefined>(undefined);
  const [hasCompletedQuest, setHasCompletedQuest] = useState(false);

  const phaseRef = useRef<GamePhase>('TITLE');
  phaseRef.current = phase;
  const inExpoRef = useRef(false);
  inExpoRef.current = hud.inExpoPark;
  const arcadeOpenRef = useRef(false);
  arcadeOpenRef.current = arcadeOpen;

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

  useEffect(() => {
    void initTinySwordsUiSkins();
  }, []);

  useEffect(() => {
    if (arcadeOpen) {
      document.body.classList.add('arcade-scroll-lock');
    } else {
      document.body.classList.remove('arcade-scroll-lock');
    }
    engineRef.current?.setArcadeActive(arcadeOpen);
    return () => {
      document.body.classList.remove('arcade-scroll-lock');
    };
  }, [arcadeOpen]);

  useEffect(() => {
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
  }, [handleToggleMute, handleTogglePause]);

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

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FAF8F5] text-[#111827]">
        <AnimatePresence>
          {!introDone && (
            <IntroPreloader
              onFinish={() => setIntroDone(true)}
              onStartGame={() => {
                setIntroDone(true);
                handleLaunchArcade();
              }}
            />
          )}
        </AnimatePresence>

        <div className="landing-sketch-root">
          <LandingHeader onPlayQuest={handleLaunchArcade} />

          <main>
            <HeroGateway
              onLaunchArcade={handleLaunchArcade}
              hasCompletedQuest={hasCompletedQuest}
              introReady={introDone}
              arcadeOpen={arcadeOpen}
            />
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
          <RetailActionSection
            builderConfig={builderConfig}
            matchSource={matchSource}
            questMatchedPcId={questMatchedPcId}
            onLaunchArcade={handleLaunchArcade}
            onResetSession={handleResetSession}
          />
        </main>
      </div>

      {/* Expanding Full-Screen Intel Core Ultra Arcade Machine */}
      <ArcadeCabinetModal
        open={arcadeOpen}
        muted={muted}
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
          />
        )}
      </ArcadeCabinetModal>
      </div>
    </MotionConfig>
  );
}
