import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, ArrowRight } from 'lucide-react';
import { TINY_SWORDS_AVATARS } from '../game/assets';

interface IntroPreloaderProps {
  onFinish: () => void;
  onStartGame: () => void;
}

export function IntroPreloader({ onFinish, onStartGame }: IntroPreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let finishTimer = 0;
    const durationMs = 1150;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      // Smooth easeOutQuart curve for crisp Odama-style counter pacing
      const eased = 1 - Math.pow(1 - t, 4);
      setProgress(Math.min(100, Math.round(eased * 100)));

      if (t < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        finishTimer = window.setTimeout(() => {
          onFinish();
        }, 280);
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
        transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] },
      }}
      className="landing-sketch-root fixed inset-0 z-50 flex flex-col justify-between border-b-2 border-[#111827] bg-[#FAF8F5] px-6 py-6 md:px-12 md:py-9"
    >
      {/* Top Blueprint Header Strip */}
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-editorial text-xl font-bold tracking-tight text-[#111827]">
            Jevtel
          </span>
          <span aria-hidden="true" className="text-[#CBD5E1]">
            ·
          </span>
          <span className="font-mono-tabular text-xs font-medium text-[#6B7280]">
            Intel Core Ultra Showcase
          </span>
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4B5563] transition-colors hover:text-[#111827] whitespace-nowrap shrink-0"
        >
          <span>Skip intro</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Center Kinetic Counter & Direct Game Launch */}
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#111827] bg-white shadow-[4px_4px_0px_#111827]"
        >
          <img
            src={TINY_SWORDS_AVATARS[0]}
            alt="Byte Warrior"
            referrerPolicy="no-referrer"
            className="pixelated h-12 w-12 object-contain"
          />
        </motion.div>

        <div className="overflow-hidden">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-editorial text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-none tracking-tight text-[#111827]"
          >
            Entering Silicon City
          </motion.div>
        </div>

        <p className="mt-2.5 text-sm font-medium text-[#4B5563]">
          Preparing Byte&apos;s adventure and live hardware benchmarks
        </p>

        {/* Crisp Architectural Progress Hairline + Tabular Counter */}
        <div className="mt-7 w-full max-w-md">
          <div className="mb-2 flex items-baseline justify-between font-mono-tabular text-xs font-bold">
            <span className="text-[#0068B5]">Jevtel Engine</span>
            <span className="text-lg text-[#111827]">
              {String(progress).padStart(2, '0')}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full border border-[#111827]/20 bg-white">
            <div
              className="h-full rounded-full bg-[#0068B5] transition-transform duration-75 origin-left"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
        </div>

        {/* Immediate Direct Launch Action into Jevtel Game */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <button
            type="button"
            onClick={onStartGame}
            className="inline-flex items-center gap-2.5 rounded-lg border-2 border-[#111827] bg-[#0068B5] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_#111827] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#005291] whitespace-nowrap shrink-0"
          >
            <Gamepad2 className="h-4 w-4 shrink-0" />
            <span>Get Over Here, Byte needs you!</span>
          </button>
        </motion.div>
      </div>

      {/* Bottom Corner Ticks */}
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between font-mono-tabular text-[11px] font-medium text-[#6B7280]">
        <span>+ Byte Quest Ready</span>
        <span>+ 5-Slot PC Builder Ready</span>
      </div>
    </motion.div>
  );
}
