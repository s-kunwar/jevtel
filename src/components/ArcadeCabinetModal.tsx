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
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#060B16]/82 p-1 sm:p-2'
          : 'pointer-events-none fixed -left-[9999px] top-0 h-[720px] w-[1280px] opacity-0'
      }
    >
      {/* Minimal Distraction-Free Game Frame */}
      <div
        className={`${
          open ? 'animate-arcade-expand' : ''
        } relative flex h-[96vh] max-h-[1020px] w-[98vw] max-w-[1640px] flex-col overflow-hidden rounded-xl border border-[#1E293B] bg-[#0B1220] text-[#F8FAFC] shadow-2xl`}
      >
        {/* Minimal Slim Perimeter Bar */}
        <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-[#1E293B] bg-[#0F172A] px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-xs bg-[#00C7FD]" />
            <span className="truncate font-display text-xs font-bold tracking-wider text-[#F8FAFC] uppercase sm:text-sm">
              Silicon Quest · Core Ultra
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              title={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#334155] bg-[#1E293B] px-2.5 text-xs font-semibold text-[#E2E8F0] transition-colors hover:border-[#00C7FD] hover:text-white whitespace-nowrap shrink-0"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{muted ? 'Muted' : 'Audio'}</span>
            </button>

            <button
              type="button"
              onClick={onResetQuest}
              title="Restart Quest"
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#334155] bg-[#1E293B] px-2.5 text-xs font-semibold text-[#E2E8F0] transition-colors hover:border-[#00C7FD] hover:text-white whitespace-nowrap shrink-0"
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
              className="inline-flex h-7 items-center gap-1 rounded-md bg-[#DC2626] px-3 text-xs font-extrabold text-white transition-colors hover:bg-[#B91C1C] whitespace-nowrap shrink-0"
            >
              <X className="h-3.5 w-3.5" />
              <span>Exit Game</span>
            </button>
          </div>
        </div>

        {/* Full-Focus Game Viewport */}
        <div className="relative min-h-0 flex-1 bg-[#0B1524]">
          {children}
        </div>

        {/* Compact Touch / Key Controls Footer */}
        <div className="shrink-0 border-t border-[#1E293B] bg-[#0F172A] px-3 py-1.5 sm:px-4">
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

            <div className="hidden font-mono-tabular text-[11px] text-[#94A3B8] md:block">
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
                <span className="hidden sm:inline">Dash</span>
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
