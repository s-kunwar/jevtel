import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
  Store,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { ARCADE_CABINET_ART_URLS, INTEL_HARDWARE_URLS } from '../game/assets';
import { gameAudio } from '../game/audio';
import type { IntelHardwareKey } from '../game/types';

interface ArcadeCabinetModalProps {
  open: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onResetQuest: () => void;
  onExitArcade: () => void;
  onJumpToChecklist: () => void;
  onInspectAdHardware?: (key: IntelHardwareKey) => void;
  onVirtualMove: (dx: number, dy: number) => void;
  onVirtualAction: (action: 'attack' | 'special' | 'dash' | 'interact') => void;
  children: ReactNode;
}

export function ArcadeCabinetModal({
  open,
  muted,
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

  useEffect(() => {
    if (!open) {
      setHeldCodes(new Set());
      setPointerDir({ x: 0, y: 0 });
      setPointerBtn(null);
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
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [open]);

  // Compute live joystick tilt from keyboard OR on-screen D-pad touch
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
    setPointerBtn(action);
    onVirtualAction(action);
    window.setTimeout(() => {
      setPointerBtn((curr) => (curr === action ? null : curr));
    }, 150);
  };

  return (
    <div
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      inert={!open}
      aria-label="Jevtel Arcade Quest"
      className={
        open
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-1.5 backdrop-blur-xs sm:p-3'
          : 'pointer-events-none fixed -left-[9999px] top-0 h-[720px] w-[1280px] opacity-0'
      }
    >
      {/* Nearly Full-Screen Warm Parchment Cabinet with Crisp Ink Borders & Cobalt Blue Accents */}
      <div
        className={`${
          open ? 'animate-arcade-expand' : ''
        } relative flex h-[95vh] max-h-[980px] w-[97vw] max-w-[1560px] flex-col overflow-hidden rounded-2xl border-2 border-[#111827] bg-[#FAF8F5] text-[#111827] shadow-[8px_8px_0px_#111827]`}
      >
        {/* SLIM TOP HEADER WITH CUSTOM PARCHMENT MARQUEE ART */}
        <div className="relative flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#111827] bg-white px-3 py-2 sm:px-4">
          {/* Custom Hand-Drawn Parchment Marquee Strip */}
          <div className="relative flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-lg border-2 border-[#111827] bg-[#FAF8F5] sm:h-11">
            <img
              src={ARCADE_CABINET_ART_URLS.marquee}
              alt="Hand-drawn parchment illustration of Silicon City"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-85"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#FAF8F5]/95 via-[#FAF8F5]/65 to-[#FAF8F5]/30" />
            <div className="relative z-10 flex items-center gap-2.5 px-3">
              <img
                src={INTEL_HARDWARE_URLS.chip}
                alt="Intel Core Ultra"
                referrerPolicy="no-referrer"
                className="pixelated h-7 w-7 shrink-0 rounded border border-[#111827]/20 bg-white p-0.5"
              />
              <div className="min-w-0">
                <div className="truncate font-editorial text-sm font-bold text-[#111827] sm:text-base">
                  Jevtel · Byte vs. The Lag Titan
                </div>
              </div>
            </div>
          </div>

          {/* Slim Perimeter Controls */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              title={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FAF8F5] px-2.5 text-xs font-bold text-[#111827] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] whitespace-nowrap shrink-0"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{muted ? 'Muted' : 'Audio'}</span>
            </button>

            <button
              type="button"
              onClick={onResetQuest}
              title="Restart Quest"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FAF8F5] px-2.5 text-xs font-bold text-[#111827] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Restart</span>
            </button>

            <button
              type="button"
              onClick={onJumpToChecklist}
              title="Find Your Match"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FAF8F5] px-2.5 text-xs font-bold text-[#111827] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] sm:inline-flex whitespace-nowrap shrink-0"
            >
              <Store className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Store Match</span>
            </button>

            <button
              type="button"
              onClick={onExitArcade}
              title="Close Game"
              className="inline-flex h-9 items-center gap-1 rounded-lg border-2 border-[#111827] bg-[#0068B5] px-3 text-xs font-bold text-white transition-colors hover:bg-[#005291] whitespace-nowrap shrink-0"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* FULL-WIDTH GAME VIEWPORT */}
        <div className="min-h-0 flex-1 bg-[#FAF8F5] p-1.5 sm:p-2.5">
          <div className="relative h-full w-full overflow-hidden rounded-xl border-2 border-[#111827] bg-[#0B1524]">
            {children}
          </div>
        </div>

        {/* SLIM WARM PARCHMENT CONTROL BAR */}
        <div className="shrink-0 border-t-2 border-[#111827] bg-white px-3 py-1.5 sm:px-5 sm:py-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* LEFT: Reactive Ink/Cobalt Joystick + Touch D-Pad */}
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#111827] bg-[#FAF8F5]"
              >
                <div
                  className="h-5 w-5 rounded-full border-2 border-[#111827] bg-[#0068B5] transition-transform duration-75"
                  style={{
                    transform: `translate(${jx * 6}px, ${jy * 6}px)`,
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
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#CBD5E1] bg-[#FAF8F5] text-[#111827] active:bg-[#0068B5] active:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move Up"
                  onPointerDown={() => handleTouchMove(0, -1)}
                  onPointerUp={() => handleTouchMove(0, 0)}
                  onPointerLeave={() => handleTouchMove(0, 0)}
                  onPointerCancel={() => handleTouchMove(0, 0)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#CBD5E1] bg-[#FAF8F5] text-[#111827] active:bg-[#0068B5] active:text-white"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move Down"
                  onPointerDown={() => handleTouchMove(0, 1)}
                  onPointerUp={() => handleTouchMove(0, 0)}
                  onPointerLeave={() => handleTouchMove(0, 0)}
                  onPointerCancel={() => handleTouchMove(0, 0)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#CBD5E1] bg-[#FAF8F5] text-[#111827] active:bg-[#0068B5] active:text-white"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move Right"
                  onPointerDown={() => handleTouchMove(1, 0)}
                  onPointerUp={() => handleTouchMove(0, 0)}
                  onPointerLeave={() => handleTouchMove(0, 0)}
                  onPointerCancel={() => handleTouchMove(0, 0)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#CBD5E1] bg-[#FAF8F5] text-[#111827] active:bg-[#0068B5] active:text-white"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* CENTER: Quiet Movement Guide */}
            <div className="hidden text-xs font-medium text-[#4B5563] md:block">
              Move with WASD or Arrow Keys · Press Esc to Pause
            </div>

            {/* RIGHT: Compact Ink-Bordered Action Buttons */}
            <div className="flex items-center gap-2 touch-none sm:gap-2.5">
              <button
                type="button"
                onClick={() => handleArcadeButton('attack')}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-[#111827] px-3 text-xs font-bold transition-transform duration-75 ${
                  attackPressed
                    ? 'translate-y-0.5 bg-[#005291] text-white'
                    : 'bg-[#0068B5] text-white shadow-[2px_2px_0px_#111827]'
                }`}
              >
                <span className="font-mono-tabular">O</span>
                <span>Attack</span>
              </button>

              <button
                type="button"
                onClick={() => handleArcadeButton('special')}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-[#111827] px-3 text-xs font-bold transition-transform duration-75 ${
                  specialPressed
                    ? 'translate-y-0.5 bg-[#D97706] text-white'
                    : 'bg-[#FEF3C7] text-[#111827] shadow-[2px_2px_0px_#111827]'
                }`}
              >
                <span className="font-mono-tabular">P</span>
                <span>Boost</span>
              </button>

              <button
                type="button"
                onClick={() => handleArcadeButton('dash')}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-[#111827] px-3 text-xs font-bold transition-transform duration-75 ${
                  dashPressed
                    ? 'translate-y-0.5 bg-[#059669] text-white'
                    : 'bg-[#ECFDF5] text-[#111827] shadow-[2px_2px_0px_#111827]'
                }`}
              >
                <span className="font-mono-tabular">Space</span>
                <span className="hidden sm:inline">Dash</span>
              </button>

              <button
                type="button"
                onClick={() => handleArcadeButton('interact')}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-[#111827] px-3 text-xs font-bold transition-transform duration-75 ${
                  interactPressed
                    ? 'translate-y-0.5 bg-[#111827] text-white'
                    : 'bg-white text-[#111827] shadow-[2px_2px_0px_#111827]'
                }`}
              >
                <span className="font-mono-tabular">E</span>
                <span>Talk</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
