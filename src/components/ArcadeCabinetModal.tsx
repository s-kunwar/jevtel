import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Hand,
  RotateCcw,
  Sparkles,
  Store,
  Swords,
  Volume2,
  VolumeX,
  Wind,
  X,
} from 'lucide-react';
import { gameAudio } from '../game/audio';
import { MOBILE_DECK_ART_URLS } from '../game/assets';
import { triggerHaptic } from '../game/haptics';
import type { GamePhase, HudSnapshot, IntelHardwareKey } from '../game/types';

interface ArcadeCabinetModalProps {
  open: boolean;
  muted: boolean;
  phase?: GamePhase;
  hud?: HudSnapshot;
  onToggleMute: () => void;
  onResetQuest: () => void;
  onExitArcade: () => void;
  onJumpToChecklist: () => void;
  onInspectAdHardware?: (key: IntelHardwareKey) => void;
  onVirtualMove: (dx: number, dy: number) => void;
  onVirtualAction: (action: 'attack' | 'special' | 'dash' | 'interact') => void;
  children: ReactNode;
}

interface FloatingStickState {
  active: boolean;
  ox: number;
  oy: number;
  dx: number;
  dy: number;
}

const STICK_MAX_RADIUS = 44;

export function ArcadeCabinetModal({
  open,
  muted,
  phase = 'PLAYING',
  hud,
  onToggleMute,
  onResetQuest,
  onExitArcade,
  onJumpToChecklist,
  onVirtualMove,
  onVirtualAction,
  children,
}: ArcadeCabinetModalProps) {
  const [heldCodes, setHeldCodes] = useState<Set<string>>(() => new Set());
  const [pointerDir, setPointerDir] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pointerBtn, setPointerBtn] = useState<string | null>(null);
  const [stickState, setStickState] = useState<FloatingStickState>({
    active: false,
    ox: 0,
    oy: 0,
    dx: 0,
    dy: 0,
  });

  const stickPointerIdRef = useRef<number | null>(null);
  const stickOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) {
      setHeldCodes(new Set());
      setPointerDir({ x: 0, y: 0 });
      setPointerBtn(null);
      stickPointerIdRef.current = null;
      setStickState({ active: false, ox: 0, oy: 0, dx: 0, dy: 0 });
      onVirtualMove(0, 0);
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      setHeldCodes((prev) => {
        if (prev.has(e.code)) return prev;
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      setHeldCodes((prev) => {
        if (!prev.has(e.code)) return prev;
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    const onBlur = () => {
      setHeldCodes(new Set());
      stickPointerIdRef.current = null;
      setStickState({ active: false, ox: 0, oy: 0, dx: 0, dy: 0 });
      onVirtualMove(0, 0);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [open, onVirtualMove]);

  let jx = pointerDir.x;
  let jy = pointerDir.y;
  if (heldCodes.has('KeyA') || heldCodes.has('ArrowLeft')) jx -= 1;
  if (heldCodes.has('KeyD') || heldCodes.has('ArrowRight')) jx += 1;
  if (heldCodes.has('KeyW') || heldCodes.has('ArrowUp')) jy -= 1;
  if (heldCodes.has('KeyS') || heldCodes.has('ArrowDown')) jy += 1;
  jx = Math.max(-1, Math.min(1, jx));
  jy = Math.max(-1, Math.min(1, jy));

  const attackPressed =
    pointerBtn === 'attack' || heldCodes.has('KeyO') || heldCodes.has('KeyZ');
  const specialPressed =
    pointerBtn === 'special' || heldCodes.has('KeyP') || heldCodes.has('KeyX');
  const dashPressed =
    pointerBtn === 'dash' ||
    heldCodes.has('Space') ||
    heldCodes.has('ShiftLeft') ||
    heldCodes.has('ShiftRight');
  const interactPressed =
    pointerBtn === 'interact' || heldCodes.has('KeyE') || heldCodes.has('Enter');

  const handleTouchMove = (dx: number, dy: number) => {
    if (dx !== 0 || dy !== 0) {
      gameAudio.playArcadeClick();
    }
    setPointerDir({ x: dx, y: dy });
    onVirtualMove(dx, dy);
  };

  const handleArcadeButton = (action: 'attack' | 'special' | 'dash' | 'interact') => {
    gameAudio.playArcadeClick();
    triggerHaptic(action === 'special' ? [12, 18, 12] : 12, muted);
    setPointerBtn(action);
    onVirtualAction(action);
    window.setTimeout(() => {
      setPointerBtn((curr) => (curr === action ? null : curr));
    }, 150);
  };

  const handleStickPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (stickPointerIdRef.current !== null) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = Math.max(34, Math.min(rect.width - 34, e.clientX - rect.left));
    const localY = Math.max(34, Math.min(rect.height - 34, e.clientY - rect.top));
    stickPointerIdRef.current = e.pointerId;
    stickOriginRef.current = { x: localX, y: localY };
    e.currentTarget.setPointerCapture(e.pointerId);
    triggerHaptic(6, muted);
    setStickState({ active: true, ox: localX, oy: localY, dx: 0, dy: 0 });
    onVirtualMove(0, 0);
  };

  const handleStickPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (stickPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const rawDx = px - stickOriginRef.current.x;
    const rawDy = py - stickOriginRef.current.y;
    const dist = Math.hypot(rawDx, rawDy);
    const clampedDist = Math.min(STICK_MAX_RADIUS, dist);
    const angle = dist > 0.001 ? Math.atan2(rawDy, rawDx) : 0;
    const dx = Math.cos(angle) * clampedDist;
    const dy = Math.sin(angle) * clampedDist;

    setStickState({
      active: true,
      ox: stickOriginRef.current.x,
      oy: stickOriginRef.current.y,
      dx,
      dy,
    });

    const norm = clampedDist / STICK_MAX_RADIUS;
    if (norm < 0.14) {
      onVirtualMove(0, 0);
    } else {
      onVirtualMove(dx / STICK_MAX_RADIUS, dy / STICK_MAX_RADIUS);
    }
  };

  const handleStickPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (stickPointerIdRef.current !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    stickPointerIdRef.current = null;
    setStickState({ active: false, ox: 0, oy: 0, dx: 0, dy: 0 });
    onVirtualMove(0, 0);
  };

  const showMobileDeck = phase !== 'TITLE' && phase !== 'GAME_OVER';
  const npuReady = Boolean(hud?.hasNpuPulse && (hud?.npuCharge ?? 0) >= 35);
  const specialLabel = hud?.hasXessSurge ? 'XeSS' : 'NPU';
  const interactHighlighted = Boolean(hud?.nearbyPrompt);

  return (
    <div
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      inert={!open}
      aria-label="Jevtel Arcade Quest"
      className={
        open
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#060B16]/90 md:p-2'
          : 'pointer-events-none fixed -left-[9999px] top-0 h-[720px] w-[1280px] opacity-0'
      }
    >
      {/* Responsive Handheld (Mobile) / Arcade Perimeter (Desktop) Frame */}
      <div
        className={`${
          open ? 'animate-arcade-expand' : ''
        } relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0B1220] text-[#F8FAFC] shadow-2xl md:h-[96vh] md:max-h-[1020px] md:w-[98vw] md:max-w-[1640px] md:rounded-xl md:border md:border-[#1E293B]`}
      >
        {/* Slim Intel Perimeter Bar */}
        <div className="safe-pt flex shrink-0 items-center justify-between gap-2 border-b border-[#1E293B] bg-[#0F172A] px-2.5 py-1.5 sm:px-4 md:h-11 md:py-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-xs bg-[#00C7FD]" />
            <span className="truncate font-display text-[11px] font-bold tracking-wider text-[#F8FAFC] uppercase sm:text-sm">
              Silicon Quest · Core Ultra
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              title={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
              aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#334155] bg-[#1E293B] text-xs font-semibold text-[#E2E8F0] transition-colors hover:border-[#00C7FD] hover:text-white md:h-7 md:w-auto md:gap-1.5 md:px-2.5 whitespace-nowrap shrink-0"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{muted ? 'Muted' : 'Audio'}</span>
            </button>

            <button
              type="button"
              onClick={onResetQuest}
              title="Restart Quest"
              aria-label="Restart Quest"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#334155] bg-[#1E293B] text-xs font-semibold text-[#E2E8F0] transition-colors hover:border-[#00C7FD] hover:text-white md:h-7 md:w-auto md:gap-1.5 md:px-2.5 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Restart</span>
            </button>

            <button
              type="button"
              onClick={onJumpToChecklist}
              title="Find Your Match"
              className="hidden h-7 items-center gap-1.5 rounded-md border border-[#334155] bg-[#1E293B] px-2.5 text-xs font-semibold text-[#E2E8F0] transition-colors hover:border-[#00C7FD] hover:text-white sm:inline-flex whitespace-nowrap shrink-0"
            >
              <Store className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Store Match</span>
            </button>

            <button
              type="button"
              onClick={onExitArcade}
              title="Close Game"
              className="inline-flex h-8 items-center gap-1 rounded-md bg-[#DC2626] px-2.5 text-xs font-extrabold text-white transition-colors hover:bg-[#B91C1C] md:h-7 md:px-3 whitespace-nowrap shrink-0"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sm:hidden">Exit</span>
              <span className="hidden sm:inline">Exit Game</span>
            </button>
          </div>
        </div>

        {/* Full-Focus Game Viewport */}
        <div className="relative min-h-0 flex-1 bg-[#0B1524]">
          {children}
        </div>

        {/* MOBILE HANDHELD ARCADE DECK (< md): Sculpted Custom Baseplate + Bigger Tactile Medallion Buttons */}
        {showMobileDeck && (
          <div className="safe-pb relative shrink-0 overflow-hidden border-t-2 border-[#4B3221] bg-[#18120E] px-2 pt-2 md:hidden">
            {/* Custom Carved Wood & Gunmetal Forged Faceplate Artwork */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[#18120E]">
              <img
                src={MOBILE_DECK_ART_URLS.baseplate}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full scale-[1.18] object-cover object-center opacity-95 brightness-[0.88] contrast-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#070D19]/35 via-transparent to-[#050811]/60" />
            </div>

            <div className="relative z-10 flex h-[156px] items-stretch gap-1.5">
              {/* Left Half: Oversized Dynamic Analog Thumbstick Socket */}
              <div
                role="application"
                aria-label="Analog movement stick. Touch and drag anywhere here to move Byte."
                onPointerDown={handleStickPointerDown}
                onPointerMove={handleStickPointerMove}
                onPointerUp={handleStickPointerEnd}
                onPointerCancel={handleStickPointerEnd}
                className="relative flex-1 touch-none select-none overflow-hidden rounded-xl"
              >
                {!stickState.active ? (
                  <div className="pointer-events-none flex h-full flex-col items-center justify-center gap-1.5">
                    <div className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full border-2 border-[#38BDF8]/50 bg-[#070D19]/55 shadow-[inset_0_3px_12px_rgba(0,0,0,0.8)]">
                      {/* Directional Indicator Ticks */}
                      <span className="absolute top-1.5 text-[8px] font-bold text-[#7DD3FC]/70">▲</span>
                      <span className="absolute bottom-1.5 text-[8px] font-bold text-[#7DD3FC]/70">▼</span>
                      <span className="absolute left-2 text-[8px] font-bold text-[#7DD3FC]/70">◀</span>
                      <span className="absolute right-2 text-[8px] font-bold text-[#7DD3FC]/70">▶</span>

                      {/* Custom Cobalt Medallion Ball-Top Cap */}
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#7DD3FC]/85 shadow-[0_4px_12px_rgba(0,0,0,0.65),0_0_12px_rgba(56,189,248,0.45)]">
                        <img
                          src={MOBILE_DECK_ART_URLS.cobaltButton}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-full w-full scale-[1.36] object-cover"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_45%,rgba(5,10,22,0.35)_100%)]" />
                      </div>
                    </div>
                    <span className="rounded bg-[#070D19]/85 px-2.5 py-0.5 font-display text-[10px] font-bold tracking-wider text-[#F8FAFC] uppercase shadow-xs">
                      Drag to Move
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Floating Socket Ring at Anchor */}
                    <div
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#38BDF8]/80 bg-[#0068B5]/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.65)]"
                      style={{
                        left: stickState.ox,
                        top: stickState.oy,
                        width: STICK_MAX_RADIUS * 2,
                        height: STICK_MAX_RADIUS * 2,
                      }}
                    />
                    {/* Custom Cobalt Medallion Puck */}
                    <div
                      className="pointer-events-none absolute h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-[#BAE6FD] shadow-[0_0_18px_rgba(0,199,253,0.85)]"
                      style={{
                        left: stickState.ox + stickState.dx,
                        top: stickState.oy + stickState.dy,
                      }}
                    >
                      <img
                        src={MOBILE_DECK_ART_URLS.cobaltButton}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-full w-full scale-[1.36] object-cover"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Right Half: Oversized Ergonomic 4-Button Bespoke Gem Medallions */}
              <div className="relative w-[198px] shrink-0 touch-none select-none">
                {/* 1. Primary SLASH Medallion (70x70, Bottom-Left Anchor) */}
                <button
                  type="button"
                  aria-label="Blade Slash Attack"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleArcadeButton('attack');
                  }}
                  onClick={(e) => {
                    if (e.detail === 0) handleArcadeButton('attack');
                  }}
                  className={`group absolute bottom-[8px] left-[4px] flex h-[70px] w-[70px] flex-col items-center justify-center overflow-hidden rounded-full border-2 shadow-[0_6px_14px_rgba(0,0,0,0.7)] transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7DD3FC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] active:translate-y-[2px] active:scale-95 ${
                    attackPressed
                      ? 'translate-y-[2px] scale-95 border-[#BAE6FD] shadow-[0_0_20px_rgba(0,199,253,0.9)]'
                      : 'border-[#7DD3FC]/75'
                  }`}
                >
                  <img
                    src={MOBILE_DECK_ART_URLS.cobaltButton}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className="pointer-events-none absolute inset-0 h-full w-full scale-[1.36] object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(4,10,24,0.62)_0%,rgba(4,10,24,0.22)_72%,transparent_100%)]"
                  />
                  <Swords className="relative z-10 h-6 w-6 text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]" />
                  <span className="relative z-10 mt-0.5 font-display text-[11px] font-extrabold tracking-wide leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                    SLASH
                  </span>
                </button>

                {/* 2. NPU / XeSS Special Medallion (58x58, Upper-Mid) */}
                <button
                  type="button"
                  aria-label={`Activate ${specialLabel} Special (${npuReady ? 'Ready' : 'Charging'})`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleArcadeButton('special');
                  }}
                  onClick={(e) => {
                    if (e.detail === 0) handleArcadeButton('special');
                  }}
                  className={`group absolute top-[6px] left-[54px] flex h-[58px] w-[58px] flex-col items-center justify-center overflow-hidden rounded-full border-2 shadow-[0_6px_14px_rgba(0,0,0,0.7)] transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7DD3FC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] active:translate-y-[2px] active:scale-95 ${
                    specialPressed
                      ? 'translate-y-[2px] scale-95 border-[#BAE6FD] shadow-[0_0_20px_rgba(56,189,248,0.9)]'
                      : npuReady
                        ? 'border-[#38BDF8] shadow-[0_0_16px_rgba(56,189,248,0.85)]'
                        : 'border-[#64748B]/75'
                  }`}
                >
                  <img
                    src={MOBILE_DECK_ART_URLS.cobaltButton}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className={`pointer-events-none absolute inset-0 h-full w-full scale-[1.36] object-cover transition-all ${
                      npuReady ? 'brightness-110' : 'grayscale-[0.65] brightness-[0.65]'
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(4,10,24,0.65)_0%,rgba(4,10,24,0.28)_75%,transparent_100%)]"
                  />
                  <Sparkles
                    className={`relative z-10 h-[18px] w-[18px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] ${
                      npuReady ? 'text-[#BAE6FD]' : 'text-[#CBD5E1]'
                    }`}
                  />
                  <span className="relative z-10 mt-0.5 font-display text-[10px] font-extrabold leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                    {npuReady ? specialLabel : hud?.hasNpuPulse ? `${Math.round(hud.npuCharge)}%` : specialLabel}
                  </span>
                </button>

                {/* 3. Guard DASH Medallion (58x58, Upper-Right) */}
                <button
                  type="button"
                  aria-label="Guard Dash Evade"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleArcadeButton('dash');
                  }}
                  onClick={(e) => {
                    if (e.detail === 0) handleArcadeButton('dash');
                  }}
                  className={`group absolute top-[12px] right-[4px] flex h-[58px] w-[58px] flex-col items-center justify-center overflow-hidden rounded-full border-2 shadow-[0_6px_14px_rgba(0,0,0,0.7)] transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] active:translate-y-[2px] active:scale-95 ${
                    dashPressed
                      ? 'translate-y-[2px] scale-95 border-[#A7F3D0] shadow-[0_0_18px_rgba(16,185,129,0.9)]'
                      : 'border-[#6EE7B7]/75'
                  }`}
                >
                  <img
                    src={MOBILE_DECK_ART_URLS.emeraldButton}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className="pointer-events-none absolute inset-0 h-full w-full scale-[1.36] object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(4,20,14,0.62)_0%,rgba(4,20,14,0.22)_74%,transparent_100%)]"
                  />
                  <Wind className="relative z-10 h-[18px] w-[18px] text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]" />
                  <span className="relative z-10 mt-0.5 font-display text-[10px] font-extrabold leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                    DASH
                  </span>
                </button>

                {/* 4. Interact / TALK / ACT Medallion (56x56, Bottom-Right) */}
                <button
                  type="button"
                  aria-label={interactHighlighted ? 'Interact with nearby character or station' : 'Talk or Interact'}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleArcadeButton('interact');
                  }}
                  onClick={(e) => {
                    if (e.detail === 0) handleArcadeButton('interact');
                  }}
                  className={`group absolute right-[8px] bottom-[8px] flex h-[56px] w-[56px] flex-col items-center justify-center overflow-hidden rounded-full border-2 shadow-[0_6px_14px_rgba(0,0,0,0.7)] transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FDE68A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] active:translate-y-[2px] active:scale-95 ${
                    interactPressed
                      ? 'translate-y-[2px] scale-95 border-[#FEF3C7] shadow-[0_0_20px_rgba(251,191,36,0.95)]'
                      : interactHighlighted
                        ? 'animate-pulse border-[#FDE68A] shadow-[0_0_18px_rgba(251,191,36,0.85)]'
                        : 'border-[#FCD34D]/65'
                  }`}
                >
                  <img
                    src={MOBILE_DECK_ART_URLS.amberButton}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className={`pointer-events-none absolute inset-0 h-full w-full scale-[1.36] object-cover ${
                      interactHighlighted ? 'brightness-110' : 'brightness-90'
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(28,16,4,0.62)_0%,rgba(28,16,4,0.22)_74%,transparent_100%)]"
                  />
                  <Hand className="relative z-10 h-[18px] w-[18px] text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]" />
                  <span className="relative z-10 mt-0.5 font-display text-[10px] font-extrabold leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                    {interactHighlighted ? 'ACT!' : 'TALK'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP & TABLET COMPACT KEYBOARD FOOTER (md+) */}
        <div className="hidden shrink-0 border-t border-[#1E293B] bg-[#0F172A] px-4 py-1.5 md:block">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#334155] bg-[#0B1220]"
              >
                <div
                  className="h-3.5 w-3.5 rounded-full bg-[#0068B5] transition-transform duration-75"
                  style={{
                    transform: `translate(${jx * 4}px, ${jy * 4}px)`,
                  }}
                />
              </div>

              <div className="flex items-center gap-1 touch-none">
                <button
                  type="button"
                  aria-label="Move Left"
                  onPointerDown={() => handleTouchMove(-1, 0)}
                  onPointerUp={() => handleTouchMove(0, 0)}
                  onPointerLeave={() => handleTouchMove(0, 0)}
                  onPointerCancel={() => handleTouchMove(0, 0)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-[#334155] bg-[#1E293B] text-[#E2E8F0] active:bg-[#0068B5]"
                >
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  aria-label="Move Up"
                  onPointerDown={() => handleTouchMove(0, -1)}
                  onPointerUp={() => handleTouchMove(0, 0)}
                  onPointerLeave={() => handleTouchMove(0, 0)}
                  onPointerCancel={() => handleTouchMove(0, 0)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-[#334155] bg-[#1E293B] text-[#E2E8F0] active:bg-[#0068B5]"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  aria-label="Move Down"
                  onPointerDown={() => handleTouchMove(0, 1)}
                  onPointerUp={() => handleTouchMove(0, 0)}
                  onPointerLeave={() => handleTouchMove(0, 0)}
                  onPointerCancel={() => handleTouchMove(0, 0)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-[#334155] bg-[#1E293B] text-[#E2E8F0] active:bg-[#0068B5]"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  aria-label="Move Right"
                  onPointerDown={() => handleTouchMove(1, 0)}
                  onPointerUp={() => handleTouchMove(0, 0)}
                  onPointerLeave={() => handleTouchMove(0, 0)}
                  onPointerCancel={() => handleTouchMove(0, 0)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-[#334155] bg-[#1E293B] text-[#E2E8F0] active:bg-[#0068B5]"
                >
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="font-mono-tabular text-[11px] text-[#94A3B8]">
              WASD / Arrows: Move · Esc: Pause
            </div>

            <div className="flex items-center gap-1.5 touch-none">
              <button
                type="button"
                onClick={() => handleArcadeButton('attack')}
                className={`inline-flex h-7 items-center gap-1 rounded border px-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  attackPressed
                    ? 'border-[#00C7FD] bg-[#005291] text-white'
                    : 'border-[#0068B5] bg-[#0068B5]/90 text-white hover:bg-[#0068B5]'
                }`}
              >
                <span className="font-mono-tabular text-[#BAE6FD]">O</span>
                <span>Attack</span>
              </button>

              <button
                type="button"
                onClick={() => handleArcadeButton('special')}
                className={`inline-flex h-7 items-center gap-1 rounded border px-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  specialPressed
                    ? 'border-[#38BDF8] bg-[#0284C7] text-white'
                    : 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] hover:border-[#00C7FD]'
                }`}
              >
                <span className="font-mono-tabular text-[#38BDF8]">P</span>
                <span>Boost</span>
              </button>

              <button
                type="button"
                onClick={() => handleArcadeButton('dash')}
                className={`inline-flex h-7 items-center gap-1 rounded border px-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  dashPressed
                    ? 'border-[#34D399] bg-[#059669] text-white'
                    : 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] hover:border-[#34D399]'
                }`}
              >
                <span className="font-mono-tabular text-[#6EE7B7]">Space</span>
                <span>Dash</span>
              </button>

              <button
                type="button"
                onClick={() => handleArcadeButton('interact')}
                className={`inline-flex h-7 items-center gap-1 rounded border px-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  interactPressed
                    ? 'border-[#F8FAFC] bg-[#334155] text-white'
                    : 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] hover:border-[#94A3B8]'
                }`}
              >
                <span className="font-mono-tabular text-[#CBD5E1]">E</span>
                <span>Talk</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
