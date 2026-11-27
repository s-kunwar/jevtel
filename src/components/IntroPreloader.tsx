import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Gamepad2 } from 'lucide-react';
import { TINY_SWORDS_AVATARS } from '../game/assets';

interface IntroPreloaderProps {
  onFinish: () => void;
  onStartGame: () => void;
}

const CYBERPUNK_PRELOADER_ART = '/assets/aistudio/cyberpunk_preloader.webp';

export function IntroPreloader({ onFinish, onStartGame }: IntroPreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let finishTimer = 0;
    const durationMs = 2000;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 4);
      setProgress(Math.min(100, Math.round(eased * 100)));

      if (t < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        finishTimer = window.setTimeout(() => {
          onFinish();
        }, 360);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (finishTimer) window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <motion.div
      role="region"
      aria-label="Jevtel loading sequence"
      initial={{ y: 0 }}
      exit={{
        y: '-100%',
        transition: { duration: 0.68, ease: [0.16, 1, 0.3, 1] },
      }}
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden border-b border-[#38BDF8]/35 bg-[#040712] px-6 py-6 text-[#F8FAFC] md:px-12 md:py-9"
    >
      {/* Full-Bleed Cyberpunk City Artwork + Seamless Directional Atmospheric Scrims */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#040712]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(234,179,8,0.18)_0%,rgba(56,189,248,0.16)_38%,rgba(4,7,18,0.98)_82%)]" />
        <motion.img
          src={CYBERPUNK_PRELOADER_ART}
          alt="Cyberpunk Silicon City avenue"
          referrerPolicy="no-referrer"
          initial={{ scale: 1.07, opacity: 0.94 }}
          animate={{ scale: 1.01, opacity: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full object-cover object-center"
        />

        {/* Seamless Edge-Only Scrims (keeps the neon billboard unobstructed while anchoring left-side typography) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040712]/90 via-[#040712]/48 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040712]/94 via-[#040712]/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#040712]/78 to-transparent" />

        {/* Subtle Cyberpunk Scanline Texture */}
        <div
          className="absolute inset-0 opacity-35 [background-image:repeating-linear-gradient(to_bottom,transparent_0px,transparent_2px,rgba(56,189,248,0.05)_3px,transparent_4px)]"
        />
      </div>

      {/* Top Strip — Integrated Directly Over the Skyline */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4">
        <div className="flex items-center gap-3 drop-shadow-[0_2px_10px_rgba(2,6,23,0.95)]">
          <span className="font-display text-xl font-bold tracking-wider uppercase text-white">
            Jevtel
          </span>
          <span aria-hidden="true" className="text-[#38BDF8]/60">
            /
          </span>
          <span className="font-mono-tabular text-xs font-medium tracking-wide text-[#7DD3FC]">
            Intel Core Ultra Showcase
          </span>
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#E2E8F0] drop-shadow-[0_2px_10px_rgba(2,6,23,0.95)] transition-colors hover:text-[#FACC15] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#38BDF8] whitespace-nowrap shrink-0"
        >
          <span>Skip intro</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#38BDF8]" />
        </button>
      </div>

      {/* Main Content — Box-Free Asymmetric Cyberpunk Lockup Integrated Over Lower-Left Street Scene */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-end pb-8 md:pb-12">
        <div className="max-w-[560px]">
          {/* Inline Byte Emblem + Neon Signal Line */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 flex items-center gap-3"
          >
            <img
              src={TINY_SWORDS_AVATARS[0]}
              alt="Byte Warrior"
              referrerPolicy="no-referrer"
              className="pixelated h-11 w-11 shrink-0 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.65)]"
            />
            <div className="flex items-center gap-2 font-mono-tabular text-xs font-bold tracking-[0.18em] uppercase text-[#FACC15] drop-shadow-[0_2px_8px_rgba(2,6,23,0.95)]">
              <span className="inline-block h-[2px] w-7 bg-gradient-to-r from-[#38BDF8] to-[#FACC15]" />
              <span>Sector 01 · Core Ultra Grid</span>
            </div>
          </motion.div>

          {/* Box-Free Kinetic Display Headline */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.35rem,5.2vw,4.1rem)] font-bold uppercase leading-[0.98] tracking-tight text-white drop-shadow-[0_6px_26px_rgba(2,6,23,0.95)]"
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
            className="mt-3 max-w-[44ch] text-sm font-medium leading-relaxed text-[#E2E8F0] drop-shadow-[0_2px_12px_rgba(2,6,23,0.95)] md:text-base"
          >
            Preparing Byte&apos;s adventure and live Intel Core Ultra hardware benchmarks
          </motion.p>

          {/* Integrated Cyberpunk HUD Progress Line */}
          <div className="mt-6 w-full max-w-[430px]">
            <div className="mb-2 flex items-baseline justify-between font-mono-tabular text-xs font-bold drop-shadow-[0_2px_8px_rgba(2,6,23,0.95)]">
              <span className="tracking-wider uppercase text-[#38BDF8]">Jevtel Engine</span>
              <span className="text-lg text-[#FACC15]">
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

          {/* Direct Cyberpunk Angled Launch Action */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={onStartGame}
              className="inline-flex items-center gap-2.5 border border-[#FACC15]/85 bg-gradient-to-r from-[#0068B5] via-[#0284C7] to-[#005291] px-6 py-3.5 font-display text-sm font-bold tracking-wide uppercase text-white shadow-[0_0_28px_rgba(56,189,248,0.45)] transition-all duration-150 [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))] hover:-translate-y-0.5 hover:border-[#FACC15] hover:shadow-[0_0_34px_rgba(250,204,21,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FACC15] whitespace-nowrap shrink-0"
            >
              <Gamepad2 className="h-4 w-4 shrink-0 text-[#FACC15]" />
              <span>Get Over Here, Byte needs you!</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Corner Ticks — Anchored Directly Over Wet Asphalt Reflection */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between font-mono-tabular text-[11px] font-medium text-[#CBD5E1] drop-shadow-[0_2px_8px_rgba(2,6,23,0.95)]">
        <span>+ Byte Quest Ready</span>
        <span>+ 5-Slot PC Builder Ready</span>
      </div>
    </motion.div>
  );
}
