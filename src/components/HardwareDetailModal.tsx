import { useEffect, useState } from 'react';
import { Cpu, ExternalLink, Layers, Sparkles } from 'lucide-react';
import { INTEL_HARDWARE_URLS, INTEL_REAL_PHOTO_URLS, TINY_SWORDS_UI } from '../game/assets';
import type { IntelHardwareSpec } from '../game/types';

interface HardwareDetailModalProps {
  spec: IntelHardwareSpec;
  onClose: () => void;
}

export function HardwareDetailModal({ spec, onClose }: HardwareDetailModalProps) {
  const [photoErr, setPhotoErr] = useState(false);

  useEffect(() => {
    setPhotoErr(false);
  }, [spec.key]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Escape' || e.code === 'KeyE' || e.code === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const photoUrl = INTEL_REAL_PHOTO_URLS[spec.studioPhotoKey];
  const pixelSpriteUrl = INTEL_HARDWARE_URLS[spec.pixelSpriteKey];

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-2.5 backdrop-blur-xs sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hardware-modal-title"
    >
      <div className="ts-wood-panel max-h-[86dvh] w-full max-w-5xl overflow-y-auto">
        {/* Top Wooden Frame Bar: Faction Ribbon + Category Subtitle + Close */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              className={`ts-ribbon ts-ribbon-${spec.factionColor} inline-flex items-center gap-2 font-display text-xs font-bold tracking-wide sm:text-sm md:text-base`}
            >
              <img
                src={pixelSpriteUrl}
                alt={spec.title}
                referrerPolicy="no-referrer"
                className="pixelated h-4 w-4 object-contain sm:h-5 sm:w-5"
              />
              <span>{spec.category}</span>
            </div>
            <span className="font-mono-tabular text-[11px] font-semibold text-[#FDE68A] sm:text-xs">
              {spec.subtitle}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ts-btn-red inline-flex min-h-[44px] items-center gap-1.5 font-display text-xs font-bold text-white sm:min-h-0 sm:gap-2 whitespace-nowrap shrink-0"
          >
            <img
              src={TINY_SWORDS_UI.icons.close}
              alt=""
              referrerPolicy="no-referrer"
              className="pixelated h-4 w-4"
            />
            <span>Close</span>
            <span className="hidden sm:inline">[E / Esc]</span>
          </button>
        </div>

        {/* Parchment Main Content */}
        <div className="ts-paper-panel">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch lg:gap-6">
            {/* Left Column: Studio Product Photo + Pixel Badge + Official Intel.com Redirect */}
            <div className="flex flex-col justify-between gap-4 lg:col-span-5">
              <div className="relative overflow-hidden rounded-lg border-2 border-[#8c6b42] bg-[#0f172a]">
                {!photoErr ? (
                  <img
                    src={photoUrl}
                    alt={`${spec.title} hardware photography`}
                    referrerPolicy="no-referrer"
                    onError={() => setPhotoErr(true)}
                    className="h-44 w-full object-cover sm:h-64 md:h-72"
                  />
                ) : (
                  <div className="flex h-44 w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] p-4 text-center sm:h-64 md:h-72">
                    <Cpu className="h-12 w-12 text-sky-400" />
                    <span className="font-display text-sm font-bold text-slate-100">
                      {spec.title}
                    </span>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent p-3">
                  <div className="flex items-end justify-between gap-3">
                    <div className="text-xs font-medium text-slate-200">
                      Real-World Hardware Reference
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-sky-400/50 bg-slate-900/85 p-1 sm:h-12 sm:w-12">
                      <img
                        src={pixelSpriteUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="pixelated h-full w-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-[#b59463] bg-[#e2d1ae] p-3.5 sm:p-4">
                <div className="font-display text-xs font-bold tracking-wider text-[#5c3a25]">
                  WHY THIS MATTERS
                </div>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#2B1B12] sm:text-sm">
                  {spec.whyItMatters}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={spec.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ts-btn-blue inline-flex min-h-[44px] w-full items-center justify-center gap-2.5 font-display text-xs font-bold text-white sm:text-sm whitespace-nowrap"
                >
                  <span>{spec.officialLabel}</span>
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
                <p className="text-center font-mono-tabular text-[11px] font-medium text-[#5c3a25]">
                  Opens official Intel website in a new browser tab
                </p>
              </div>
            </div>

            {/* Right Column: Detailed Architecture Explanation & Spec Matrix */}
            <div className="flex flex-col justify-between gap-5 lg:col-span-7">
              <div>
                <h2
                  id="hardware-modal-title"
                  className="font-display text-2xl font-bold tracking-tight text-[#2B1B12] md:text-3xl"
                  style={{ textWrap: 'balance' }}
                >
                  {spec.title}
                </h2>
                <p className="mt-2.5 text-sm font-medium leading-relaxed text-[#3E271A] md:text-base">
                  {spec.summary}
                </p>
              </div>

              {/* Three-Engine / Core Architecture Breakdown */}
              <div>
                <div className="mb-2.5 flex items-center gap-2 font-display text-xs font-bold tracking-wider text-[#5c3a25]">
                  <Layers className="h-4 w-4 text-[#00559B]" />
                  <span>SILICON ARCHITECTURE BREAKDOWN</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {spec.engines.map((engine) => (
                    <div
                      key={engine.label}
                      className="flex flex-col justify-between rounded-md border border-[#b59463] bg-[#efe1c3] p-3.5"
                    >
                      <div>
                        <div className="font-mono-tabular text-[11px] font-bold text-[#00559B]">
                          {engine.label}
                        </div>
                        <div className="mt-1 font-display text-sm font-bold text-[#2B1B12]">
                          {engine.title}
                        </div>
                      </div>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-[#4A2E1B]">
                        {engine.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specification Grid */}
              <div>
                <div className="mb-2.5 flex items-center gap-2 font-display text-xs font-bold tracking-wider text-[#5c3a25]">
                  <Sparkles className="h-4 w-4 text-[#00559B]" />
                  <span>TECHNICAL HIGHLIGHTS</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {spec.specs.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 rounded-md border border-[#b59463] bg-[#e5d4b3] px-3.5 py-2.5"
                    >
                      <span className="text-xs font-semibold text-[#5c3a25]">{row.label}</span>
                      <span className="font-mono-tabular text-right text-xs font-bold text-[#2B1B12]">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
