import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TINY_SWORDS_AVATARS } from '../game/assets';

interface IntroPreloaderProps {
  spritesReady: boolean;
  cabinetArtReady: boolean;
  videoReady: boolean;
  assetProgress: number;
  onFinish: () => void;
}

const CYBERPUNK_PRELOADER_ART = '/assets/aistudio/cyberpunk_preloader.webp';

export function IntroPreloader({
  spritesReady,
  cabinetArtReady,
  videoReady,
  assetProgress,
  onFinish,
}: IntroPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  const allReady = (spritesReady && cabinetArtReady && videoReady) || timedOut;
  const targetPct = allReady
    ? 100
    : Math.min(
        97,
        Math.round(assetProgress * 0.72 + (cabinetArtReady ? 14 : 2) + (videoReady ? 14 : 4))
      );

  useEffect(() => {
    const safetyTimer = window.setTimeout(() => {
      setTimedOut(true);
    }, 25000);
    return () => window.clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    let rafId = 0;
    const step = () => {
      setProgress((prev) => {
        if (prev >= targetPct) return prev;
        const delta = Math.max(1, Math.ceil((targetPct - prev) * 0.22));
        return Math.min(targetPct, prev + delta);
      });
      rafId = window.requestAnimationFrame(step);
    };
    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [targetPct]);

  useEffect(() => {
    if (!allReady || progress < 100) return;
    const finishTimer = window.setTimeout(() => {
      onFinish();
    }, 240);
    return () => window.clearTimeout(finishTimer);
  }, [allReady, progress, onFinish]);

  const statusLine = !spritesReady
    ? 'Loading landing artwork, fonts & game sprites…'
    : !cabinetArtReady && !timedOut
      ? 'Painting 3D arcade cabinet & WebGL stage…'
      : !videoReady && !timedOut
        ? 'Buffering arcade CRT video showcase…'
        : 'All artwork & game sprites ready!';

  return (
    <motion.div
      role="region"
      aria-label="Jevtel loading sequence"
      initial={{ y: 0 }}
      exit={{
        y: '-100%',
        transition: { duration: 0.68, ease: [0.16, 1, 0.3, 1] },
      }}
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col justify-between overflow-hidden border-b border-[#38BDF8]/35 bg-[#040712] px-4 py-5 text-[#F8FAFC] safe-pt safe-pb sm:px-6 sm:py-6 md:px-12 md:py-9"
    >
      {/* Full-Bleed Cyberpunk City Artwork + Seamless Directional Atmospheric Scrims */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#040712]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(234,179,8,0.18)_0%,rgba(56,189,248,0.16)_38%,rgba(4,7,18,0.98)_82%)]" />
        <motion.img
          src={CYBERPUNK_PRELOADER_ART}
          alt="Cyberpunk Silicon City avenue"
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="sync"
          initial={{ scale: 1.07, opacity: 0.94 }}
          animate={{ scale: 1.01, opacity: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full object-cover object-center"
        />

        {/* Seamless Edge-Only Scrims (keeps the neon billboard unobstructed while anchoring left-side typography) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040712]/90 via-[#040712]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040712]/96 via-[#040712]/42 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#040712]/78 to-transparent" />

        {/* Subtle Cyberpunk Scanline Texture */}
        <div
          className="absolute inset-0 opacity-35 [background-image:repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,rgba(56,189,248,0.05)_3px,transparent_4px)]"
        />
      </div>

      {/* Top Strip — Integrated Directly Over the Skyline */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 drop-shadow-[0_2px_10px_rgba(2,6,23,0.95)] sm:gap-3">
          <span className="font-display text-lg font-bold tracking-wider uppercase text-white sm:text-xl">
            Jevtel
          </span>
          <span aria-hidden="true" className="hidden text-[#38BDF8]/60 sm:inline">
            /
          </span>
          <span className="truncate font-mono-tabular text-[11px] font-medium tracking-wide text-[#7DD3FC] sm:text-xs">
            Intel Core Ultra Showcase
          </span>
        </div>
      </div>

      {/* Main Content — Box-Free Asymmetric Cyberpunk Lockup Integrated Over Lower-Left Street Scene */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-end pb-4 sm:pb-8 md:pb-12">
        <div className="max-w-[560px]">
          {/* Inline Byte Emblem + Neon Signal Line */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3"
          >
            <img
              src={TINY_SWORDS_AVATARS[0]}
              alt="Byte Warrior"
              referrerPolicy="no-referrer"
              className="pixelated h-10 w-10 shrink-0 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.65)] sm:h-11 sm:w-11"
            />
            <div className="flex items-center gap-2 font-mono-tabular text-[11px] font-bold tracking-[0.14em] uppercase text-[#FACC15] drop-shadow-[0_2px_8px_rgba(2,6,23,0.95)] sm:text-xs sm:tracking-[0.18em]">
              <span className="inline-block h-[2px] w-5 bg-gradient-to-r from-[#38BDF8] to-[#FACC15] sm:w-7" />
              <span>Sector 01 · Core Ultra Grid</span>
            </div>
          </motion.div>

          {/* Box-Free Kinetic Display Headline */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2rem,8vw,4.1rem)] font-bold uppercase leading-[0.98] tracking-tight text-white drop-shadow-[0_6px_26px_rgba(2,6,23,0.95)]"
              style={{ textWrap: 'balance' }}
            >
              Entering{' '}
              <span className="bg-gradient-to-r from-[#38BDF8] via-[#7DD3FC] to-[#FACC15] bg-clip-text text-transparent">
                Silicon City
              </span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2.5 max-w-[44ch] text-xs font-medium leading-relaxed text-[#E2E8F0] drop-shadow-[0_2px_12px_rgba(2,6,23,0.95)] sm:mt-3 sm:text-sm md:text-base"
          >
            {statusLine}
          </motion.p>

          {/* Integrated Cyberpunk HUD Progress Line */}
          <div className="mt-4 w-full max-w-[430px] sm:mt-6">
            <div className="mb-1.5 flex items-baseline justify-between font-mono-tabular text-xs font-bold drop-shadow-[0_2px_8px_rgba(2,6,23,0.95)] sm:mb-2">
              <span className="tracking-wider uppercase text-[#38BDF8]">Jevtel Engine</span>
              <span className="text-base text-[#FACC15] sm:text-lg">
                {String(progress).padStart(2, '0')}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden bg-white/15">
              <div
                className="h-full origin-left bg-gradient-to-r from-[#0068B5] via-[#38BDF8] to-[#FACC15] shadow-[0_0_14px_rgba(56,189,248,0.85)] transition-transform duration-75"
                style={{ transform: `scaleX(${progress / 100})` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Corner Ticks — Anchored Directly Over Wet Asphalt Reflection */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between gap-2 font-mono-tabular text-[10px] font-medium text-[#CBD5E1] drop-shadow-[0_2px_8px_rgba(2,6,23,0.95)] sm:text-[11px]">
        <span>
          {spritesReady && cabinetArtReady
            ? '+ Artwork & 3D Cabinet Ready'
            : '+ Decoding Artwork & Sprites…'}
        </span>
        <span>{videoReady ? '+ CRT Video Ready' : '+ Warming CRT Video…'}</span>
      </div>
    </motion.div>
  );
}
