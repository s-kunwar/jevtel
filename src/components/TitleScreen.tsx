import { useEffect, useState } from 'react';
import {
  INTEL_HARDWARE_URLS,
  TINY_SWORDS_AVATARS,
  TINY_SWORDS_UI,
  loadTinySwordsAtlas,
} from '../game/assets';

interface TitleScreenProps {
  muted: boolean;
  onStart: () => void;
  onToggleMute: () => void;
  onExitArcade?: () => void;
}

export function TitleScreen({ muted, onStart, onToggleMute, onExitArcade }: TitleScreenProps) {
  const [, setSpritesReady] = useState(false);

  useEffect(() => {
    let active = true;
    void loadTinySwordsAtlas().then(() => {
      if (active) setSpritesReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) return;
      if (e.code === 'Escape' && onExitArcade) {
        e.preventDefault();
        onExitArcade();
        return;
      }
      if (e.code === 'KeyM') {
        onToggleMute();
        return;
      }
      e.preventDefault();
      onStart();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStart, onToggleMute, onExitArcade]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-gradient-to-b from-[#0b1524]/88 via-[#0b1524]/70 to-[#0b1524]/85 md:bg-gradient-to-r md:from-[#0b1524]/85 md:via-[#0b1524]/55 md:to-transparent">
      {/* Top Perimeter Strip */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-3 pt-3 sm:px-6 sm:pt-5 md:px-10">
        <div className="ts-ribbon ts-ribbon-Blue inline-flex items-center gap-1.5 font-display text-[11px] font-bold tracking-wider sm:gap-2 sm:text-xs md:text-sm">
          <img
            src={INTEL_HARDWARE_URLS.chip}
            alt="Intel Core Ultra"
            referrerPolicy="no-referrer"
            className="pixelated h-4 w-4 sm:h-5 sm:w-5"
          />
          <span>INTEL AI PC · SILICON CITY</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="ts-btn-blue inline-flex min-h-[40px] items-center gap-1.5 font-display text-xs font-bold text-white sm:gap-2 whitespace-nowrap shrink-0"
          >
            <img
              src={muted ? TINY_SWORDS_UI.icons.close : TINY_SWORDS_UI.icons.music}
              alt=""
              referrerPolicy="no-referrer"
              className="pixelated h-4 w-4"
            />
            <span>{muted ? 'Muted' : 'Audio'}</span>
            <span className="hidden sm:inline">[M]</span>
          </button>
          {onExitArcade && (
            <button
              type="button"
              onClick={onExitArcade}
              className="ts-btn-red hidden min-h-[40px] items-center gap-2 font-display text-xs font-bold text-white sm:inline-flex whitespace-nowrap shrink-0"
            >
              <span>Exit Cabinet</span>
            </button>
          )}
        </div>
      </div>

      {/* Tiny Swords Tabletop Title Lockup */}
      <div className="relative z-10 my-auto w-full max-w-2xl px-3 py-3 sm:px-6 md:px-12">
        <div className="ts-wood-panel">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 px-1 sm:mb-3">
            <div className="ts-ribbon ts-ribbon-Yellow font-display text-[11px] font-bold sm:text-xs">
              1:47 AM DEADLINE · BEFORE SUNRISE
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <img src={TINY_SWORDS_AVATARS[1]} alt="Byte" referrerPolicy="no-referrer" className="pixelated h-6 w-6 sm:h-8 sm:w-8" />
              <img src={TINY_SWORDS_AVATARS[0]} alt="Blue Knight" referrerPolicy="no-referrer" className="pixelated h-6 w-6 sm:h-8 sm:w-8" />
              <img src={INTEL_HARDWARE_URLS.chip} alt="Core Ultra NPU" referrerPolicy="no-referrer" className="pixelated h-6 w-6 sm:h-8 sm:w-8" />
              <img src={INTEL_HARDWARE_URLS.aiPc} alt="Intel AI PC" referrerPolicy="no-referrer" className="pixelated h-6 w-6 sm:h-8 sm:w-8" />
            </div>
          </div>

          <div className="ts-paper-panel">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-[#2B1B12] sm:text-4xl md:text-5xl" style={{ textWrap: 'balance' }}>
                  BEFORE SUNRISE
                </h1>
                <div className="mt-1 font-display text-sm font-bold tracking-wider text-[#00559B] sm:text-lg sm:tracking-widest md:text-xl">
                  SILICON CITY · CORE ULTRA QUEST
                </div>
              </div>
              <div className="hidden shrink-0 items-center gap-2 rounded border-2 border-[#b89a6d] bg-[#e9d9b8] p-2 sm:flex">
                <img src={INTEL_HARDWARE_URLS.aiPc} alt="Intel AI PC" referrerPolicy="no-referrer" className="pixelated h-14 w-14 object-contain" />
                <img src={INTEL_HARDWARE_URLS.chip} alt="Core Ultra NPU" referrerPolicy="no-referrer" className="pixelated h-12 w-12 object-contain" />
              </div>
            </div>

            <p className="mt-3 max-w-lg text-xs font-medium leading-relaxed text-[#3E271A] sm:mt-4 sm:text-sm md:text-base" style={{ textWrap: 'balance' }}>
              1:47 AM. One final project left, a warm mug of tea beside the desk, and a bargain laptop your family
              saved months to buy—freezing at 12% battery. Guide Byte across five islands to defeat Burnout and reach
              morning light inside the Intel Festival Courtyard.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-6 sm:gap-4">
              <button
                type="button"
                onClick={onStart}
                className="ts-btn-blue animate-subtle-float inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 font-display text-sm font-bold tracking-wide text-white sm:w-auto sm:gap-3 sm:text-base whitespace-nowrap shrink-0"
              >
                <img src={TINY_SWORDS_UI.icons.sword} alt="" referrerPolicy="no-referrer" className="pixelated h-5 w-5" />
                <span className="sm:hidden">Tap to Start Quest</span>
                <span className="hidden sm:inline">Press ANY KEY to Start</span>
                <span className="hidden font-mono-tabular text-xs text-[#FDE68A] sm:inline">[ENTER]</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Hint Bar */}
      <div className="relative z-10 px-3 pb-3 sm:px-6 sm:pb-4 md:px-10">
        <div className="ts-wood-compact flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#FEF3C7] sm:gap-4 sm:text-xs">
          <span className="font-mono-tabular font-semibold sm:hidden">
            Thumbstick Move · Slash / NPU / Dash / Talk · Tap Props to Inspect
          </span>
          <span className="hidden font-mono-tabular font-semibold sm:inline">
            WASD / Arrows Move · O / Z Slash · P / X NPU &amp; XeSS · Space Guard Dash · E Interact · Esc Pause
          </span>
          <span className="font-semibold text-[#FDE68A]">
            <span className="sm:hidden">Touch Playable · Offline Ready</span>
            <span className="hidden sm:inline">Keyboard Playable · Offline Ready</span>
          </span>
        </div>
      </div>
    </div>
  );
}
