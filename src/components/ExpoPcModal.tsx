import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { INTEL_HARDWARE_URLS, TINY_SWORDS_AVATARS, TINY_SWORDS_UI } from '../game/assets';
import type { CatalogPcCharacter } from '../game/types';

interface ExpoPcModalProps {
  pc: CatalogPcCharacter;
  isMatched: boolean;
  isTagged: boolean;
  onTriggerDemo: () => void;
  onToggleTag: () => void;
  onOpenStoreGuide: () => void;
  onClose: () => void;
}

export function ExpoPcModal({
  pc,
  isMatched,
  isTagged,
  onTriggerDemo,
  onToggleTag,
  onOpenStoreGuide,
  onClose,
}: ExpoPcModalProps) {
  const [imgErr, setImgErr] = useState(false);
  const avatarUrl = TINY_SWORDS_AVATARS[Math.max(0, Math.min(24, pc.avatarIdx - 1))];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Escape' || e.code === 'KeyE' || e.code === 'Enter') {
        e.preventDefault();
        onClose();
      } else if (e.code === 'Digit1') {
        e.preventDefault();
        onTriggerDemo();
      } else if (e.code === 'Digit2') {
        e.preventDefault();
        onToggleTag();
      } else if (e.code === 'Digit3' || e.code === 'KeyC') {
        e.preventDefault();
        onOpenStoreGuide();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onOpenStoreGuide, onToggleTag, onTriggerDemo]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-2.5 sm:inset-x-0 sm:top-auto sm:bottom-0 sm:items-end sm:bg-transparent md:p-5">
      <div className="ts-wood-panel max-h-[82dvh] w-full max-w-4xl overflow-y-auto">
        {/* Faction Color Ribbon + Station Tag */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`ts-ribbon ts-ribbon-${pc.factionColor} inline-flex items-center gap-2 font-display text-xs font-bold tracking-wide sm:text-sm md:text-base`}>
              <img src={INTEL_HARDWARE_URLS.chip} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4 sm:h-5 sm:w-5" />
              <span>{pc.name}</span>
            </div>
            <span className="font-display text-[11px] font-bold text-[#FDE68A] sm:text-xs">
              {pc.persona}
              {isMatched ? ' · ★ YOUR BEST MATCH' : ''}
            </span>
          </div>

          <span className="font-mono-tabular text-[11px] font-bold text-[#FDE68A] sm:text-xs">
            {pc.tierName} · Station {pc.stationId}
          </span>
        </div>

        <div className="ts-paper-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            {/* Avatar + Pixel Intel AI PC Hardware Stack */}
            <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
              <div className="ts-special-panel relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden sm:h-24 sm:w-24">
                {!imgErr ? (
                  <img
                    src={avatarUrl}
                    alt={pc.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImgErr(true)}
                    className="pixelated h-full w-full object-contain"
                  />
                ) : (
                  <Shield className="h-8 w-8 text-sky-300 sm:h-10 sm:w-10" />
                )}
              </div>
              <div className="flex h-16 w-20 items-center justify-center rounded border-2 border-[#a88a5d] bg-[#dfd0ac] p-1.5 sm:h-20 sm:w-24">
                <img
                  src={INTEL_HARDWARE_URLS.aiPc}
                  alt={pc.tierName}
                  referrerPolicy="no-referrer"
                  className="pixelated h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-relaxed text-[#2B1B12] sm:text-sm">{pc.chatText}</p>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {pc.highlights.map((h) => (
                  <div
                    key={h}
                    className="rounded border-2 border-[#a88a5d] bg-[#dfd0ac] px-3 py-2 text-xs font-medium text-[#2B1B12]"
                  >
                    {h}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onTriggerDemo}
                    className="ts-btn-blue inline-flex min-h-[44px] items-center gap-1.5 font-display text-xs font-bold text-white sm:min-h-0 sm:gap-2 whitespace-nowrap shrink-0"
                  >
                    <img src={TINY_SWORDS_UI.icons.sword} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                    <span>Power Burst</span>
                    <span className="hidden sm:inline">[1]</span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleTag}
                    className="ts-btn-blue inline-flex min-h-[44px] items-center gap-1.5 font-display text-xs font-bold text-white sm:min-h-0 sm:gap-2 whitespace-nowrap shrink-0"
                  >
                    <img src={TINY_SWORDS_UI.icons.gold} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                    <span>{isTagged ? 'Saved Pick' : 'Save Pick'}</span>
                    <span className="hidden sm:inline">[2]</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenStoreGuide}
                    className="ts-btn-blue inline-flex min-h-[44px] items-center gap-1.5 font-display text-xs font-bold text-white sm:min-h-0 sm:gap-2 whitespace-nowrap shrink-0"
                  >
                    <img src={TINY_SWORDS_UI.icons.info} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                    <span>Checklist</span>
                    <span className="hidden sm:inline">[3]</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="ts-btn-red inline-flex min-h-[44px] items-center gap-1.5 font-display text-xs font-bold text-white sm:min-h-0 sm:gap-2 whitespace-nowrap shrink-0"
                >
                  <img src={TINY_SWORDS_UI.icons.back} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                  <span>Explore</span>
                  <span className="hidden sm:inline">[E / Esc]</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
