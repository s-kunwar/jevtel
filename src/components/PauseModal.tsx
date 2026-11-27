import { useEffect } from 'react';
import { TINY_SWORDS_UI } from '../game/assets';

interface PauseModalProps {
  muted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
  onExitArcade?: () => void;
}

export function PauseModal({
  muted,
  onResume,
  onRestart,
  onToggleMute,
  onExitArcade,
}: PauseModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        e.preventDefault();
        onRestart();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onResume, onRestart]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#070D1A]/80 p-3 sm:p-4">
      <div className="ts-wood-panel max-h-[85dvh] w-full max-w-md overflow-y-auto">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="ts-ribbon ts-ribbon-Blue font-display text-xs font-bold sm:text-sm">
            QUEST PAUSED
          </div>
          <span className="font-mono-tabular text-xs font-bold text-[#FDE68A]">Jevtel</span>
        </div>

        <div className="ts-paper-panel">
          {/* Mobile Touch Controls Summary */}
          <div className="mb-3 space-y-1.5 rounded border-2 border-[#a88a5d] bg-[#dfd0ac] p-3 text-xs font-semibold text-[#2B1B12] sm:hidden">
            <div className="flex justify-between gap-2">
              <span>Left Pad</span>
              <span className="font-mono-tabular text-[#00559B]">Drag Thumbstick to Move</span>
            </div>
            <div className="flex justify-between gap-2">
              <span>Right Arc</span>
              <span className="font-mono-tabular text-[#00559B]">Slash · NPU · Dash · Talk</span>
            </div>
            <div className="flex justify-between gap-2">
              <span>Direct Tap</span>
              <span className="font-mono-tabular text-[#9A3412]">Tap NPCs &amp; Intel Hardware</span>
            </div>
          </div>

          {/* Desktop Keyboard Legend */}
          <div className="mb-4 hidden space-y-2 rounded border-2 border-[#a88a5d] bg-[#dfd0ac] p-3.5 text-sm font-semibold text-[#2B1B12] sm:block">
            <div className="flex justify-between">
              <span>Move Hero</span>
              <kbd className="font-mono-tabular text-[#00559B]">WASD / Arrows</kbd>
            </div>
            <div className="flex justify-between">
              <span>Warrior Blade Slash</span>
              <kbd className="font-mono-tabular text-[#00559B]">O / Z</kbd>
            </div>
            <div className="flex justify-between">
              <span>NPU Heal / XeSS Surge</span>
              <kbd className="font-mono-tabular text-[#9A3412]">P / X</kbd>
            </div>
            <div className="flex justify-between">
              <span>Guard Dash (Dodge)</span>
              <kbd className="font-mono-tabular text-[#00559B]">Space</kbd>
            </div>
            <div className="flex justify-between">
              <span>Speak / Rescue Task</span>
              <kbd className="font-mono-tabular text-[#00559B]">E / Enter</kbd>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onResume}
              className="ts-btn-blue flex min-h-[44px] w-full items-center justify-center gap-2 font-display text-sm font-bold text-white whitespace-nowrap shrink-0"
            >
              <img src={TINY_SWORDS_UI.icons.play} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
              <span>Resume Quest</span>
              <span className="hidden sm:inline">[Esc / Enter]</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className="ts-btn-blue flex min-h-[44px] w-full items-center justify-center gap-2 font-display text-sm font-bold text-white whitespace-nowrap shrink-0"
            >
              <img
                src={muted ? TINY_SWORDS_UI.icons.close : TINY_SWORDS_UI.icons.music}
                alt=""
                referrerPolicy="no-referrer"
                className="pixelated h-4 w-4"
              />
              <span>{muted ? 'Unmute Audio' : 'Mute Audio'}</span>
              <span className="hidden sm:inline">[M]</span>
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="ts-btn-red flex min-h-[44px] w-full items-center justify-center gap-2 font-display text-sm font-bold text-white whitespace-nowrap shrink-0"
            >
              <img src={TINY_SWORDS_UI.icons.back} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
              <span>Restart Experience</span>
              <span className="hidden sm:inline">[R]</span>
            </button>

            {onExitArcade && (
              <button
                type="button"
                onClick={onExitArcade}
                className="ts-btn-blue flex min-h-[44px] w-full items-center justify-center gap-2 font-display text-sm font-bold text-white whitespace-nowrap shrink-0"
              >
                <img src={TINY_SWORDS_UI.icons.close} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                <span>Exit Arcade to Page</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
