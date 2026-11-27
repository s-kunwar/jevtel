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
    <div className="absolute inset-0 z-20 flex flex-col justify-between overflow-hidden bg-gradient-to-r from-[#0b1524]/85 via-[#0b1524]/55 to-transparent">
      {/* Top Perimeter Strip */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-5 md:px-10">
        <div className="ts-ribbon ts-ribbon-Blue inline-flex items-center gap-2 font-display text-xs font-bold tracking-wider md:text-sm">
          <img
            src={INTEL_HARDWARE_URLS.chip}
            alt="Intel Core Ultra"
            referrerPolicy="no-referrer"
            className="pixelated h-5 w-5"
          />
          <span>INTEL AI PC ZONE · SILICON CITY RPG</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="ts-btn-blue inline-flex items-center gap-2 font-display text-xs font-bold text-white whitespace-nowrap shrink-0"
          >
            <img
              src={muted ? TINY_SWORDS_UI.icons.close : TINY_SWORDS_UI.icons.music}
              alt=""
              referrerPolicy="no-referrer"
              className="pixelated h-4 w-4"
            />
            <span>{muted ? 'Audio Muted [M]' : 'Audio On [M]'}</span>
          </button>
          {onExitArcade && (
            <button
              type="button"
              onClick={onExitArcade}
              className="ts-btn-red inline-flex items-center gap-2 font-display text-xs font-bold text-white whitespace-nowrap shrink-0"
            >
              <span>Exit Cabinet</span>
            </button>
          )}
        </div>
      </div>

      {/* Left-Aligned Tiny Swords Tabletop Title Lockup */}
      <div className="relative z-10 my-auto max-w-2xl px-6 md:px-12">
        <div className="ts-wood-panel">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="ts-ribbon ts-ribbon-Yellow font-display text-xs font-bold">
              PAWN TO WARRIOR · CORE ULTRA QUEST
            </div>
            <div className="flex items-center gap-2">
              <img src={TINY_SWORDS_AVATARS[1]} alt="Blue Pawn" referrerPolicy="no-referrer" className="pixelated h-8 w-8" />
              <img src={TINY_SWORDS_AVATARS[0]} alt="Blue Warrior" referrerPolicy="no-referrer" className="pixelated h-8 w-8" />
              <img src={INTEL_HARDWARE_URLS.chip} alt="Core Ultra NPU" referrerPolicy="no-referrer" className="pixelated h-8 w-8" />
              <img src={INTEL_HARDWARE_URLS.aiPc} alt="Intel AI PC" referrerPolicy="no-referrer" className="pixelated h-8 w-8" />
            </div>
          </div>

          <div className="ts-paper-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-[#2B1B12] md:text-5xl" style={{ textWrap: 'balance' }}>
                  SILICON QUEST
                </h1>
                <div className="mt-1 font-display text-lg font-bold tracking-widest text-[#00559B] md:text-xl">
                  INTEL CORE ULTRA ISLANDS
                </div>
              </div>
              <div className="hidden shrink-0 items-center gap-2 rounded border-2 border-[#b89a6d] bg-[#e9d9b8] p-2 sm:flex">
                <img src={INTEL_HARDWARE_URLS.aiPc} alt="Intel AI PC" referrerPolicy="no-referrer" className="pixelated h-14 w-14 object-contain" />
                <img src={INTEL_HARDWARE_URLS.chip} alt="Core Ultra NPU" referrerPolicy="no-referrer" className="pixelated h-12 w-12 object-contain" />
              </div>
            </div>

            <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-[#3E271A] md:text-base" style={{ textWrap: 'balance' }}>
              A flashy bargain laptop just froze. Start as Byte the Blue Pawn, unlock Intel Core Ultra E-Cores,
              NPU AI Boost &amp; Arc XeSS across five islands, defeat the Lag Titan, and test real AI PCs in Expo Park.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStart}
                className="ts-btn-blue animate-subtle-float inline-flex items-center gap-3 font-display text-base font-bold tracking-wide text-white whitespace-nowrap shrink-0"
              >
                <img src={TINY_SWORDS_UI.icons.sword} alt="" referrerPolicy="no-referrer" className="pixelated h-5 w-5" />
                <span>Press ANY KEY to Start</span>
                <span className="font-mono-tabular text-xs text-[#FDE68A]">[ENTER]</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Hint Bar */}
      <div className="relative z-10 px-6 pb-4 md:px-10">
        <div className="ts-wood-compact flex flex-wrap items-center justify-between gap-4 text-xs text-[#FEF3C7]">
          <span className="font-mono-tabular font-semibold">
            WASD / Arrows Move · O / Z Slash · P / X NPU & XeSS · Space Guard Dash · E Interact · Esc Pause
          </span>
          <span className="font-semibold text-[#FDE68A]">Keyboard Playable · Offline Ready</span>
        </div>
      </div>
    </div>
  );
}
