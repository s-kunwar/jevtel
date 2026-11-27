import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowDown, Gamepad2 } from 'lucide-react';
import { HeroArcade3DStage } from './HeroArcade3DStage';
import { HeroParallaxBackdrop } from './HeroParallaxBackdrop';
import { HandUnderline, HeroCurvedArrow } from './SketchDoodles';

interface HeroGatewayProps {
  onLaunchArcade: () => void;
  hasCompletedQuest: boolean;
  introReady: boolean;
  arcadeOpen: boolean;
  darkMode: boolean;
  globalMuted: boolean;
  onToggleGlobalMute: () => void;
  onVideoReady?: () => void;
  onCabinetArtReady?: () => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function HeroGateway({
  onLaunchArcade,
  hasCompletedQuest,
  introReady,
  arcadeOpen,
  darkMode,
  globalMuted,
  onToggleGlobalMute,
  onVideoReady,
  onCabinetArtReady,
}: HeroGatewayProps) {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const [launchNonce, setLaunchNonce] = useState(0);
  const [isMdUp, setIsMdUp] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true
  );
  const [safetyReveal, setSafetyReveal] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isCopyInView = useInView(copyRef, { once: true, amount: 0.05 });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setIsMdUp(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    const timer = window.setTimeout(() => setSafetyReveal(true), 2800);
    return () => {
      mq.removeEventListener?.('change', sync);
      window.clearTimeout(timer);
    };
  }, []);

  const showCopy = Boolean(
    prefersReducedMotion || (introReady && (isMdUp || isCopyInView || safetyReveal))
  );

  const handleRequestCabinetLaunch = () => {
    setLaunchNonce((n) => n + 1);
  };

  return (
    <section
      id="top-gateway"
      ref={heroSectionRef}
      className="relative overflow-hidden bg-[#F8FAFC] py-8 text-slate-900 transition-colors duration-200 dark:bg-[#0A0C0B] dark:text-[#F8FAFC] sm:py-12 md:py-16 lg:py-20"
    >
      <HeroParallaxBackdrop containerRef={heroSectionRef} darkMode={darkMode} />

      {/* Subtle Architectural Blueprint Corner Ticks */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-10 mx-auto hidden max-w-[1200px] px-6 md:px-10 lg:block"
      >
        <div className="flex items-center justify-between font-mono-tabular text-[11px] font-medium text-slate-500 dark:text-[#9CA3AF]">
          <span>+ Jevtel Studio Showcase</span>
          <span>+ Built-In AI · Graphics · All-Day Power</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-1 max-w-[1200px] px-4 sm:mt-3 sm:px-6 md:px-10">
        <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-8 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* Editorial Copy & CTAs (First on Desktop/PC >=768px, Second on Mobile with Scroll Reveal) */}
          <div
            ref={copyRef}
            className="order-2 relative flex flex-col justify-center md:order-1 md:col-span-6"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={showCopy ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.45, delay: 0.04, ease: EASE_OUT_EXPO }}
              className="text-sm font-bold tracking-wide text-[#0068B5] dark:text-[#38BDF8]"
            >
              Intel Core Ultra
            </motion.div>

            <h1
              className="font-editorial mt-2 text-[clamp(2rem,8.4vw,3.85rem)] font-bold leading-[1.06] tracking-tight text-slate-900 dark:text-[#F8FAFC] sm:mt-2.5 md:text-[clamp(2.2rem,4.1vw,3.85rem)]"
              style={{ textWrap: 'balance' }}
            >
              <span className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={prefersReducedMotion ? false : { y: '108%' }}
                  animate={showCopy ? { y: '0%' } : { y: '108%' }}
                  transition={{ duration: 0.62, delay: 0.08, ease: EASE_OUT_EXPO }}
                >
                  Don&apos;t Buy a Pretty
                </motion.span>
              </span>

              <span className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={prefersReducedMotion ? false : { y: '108%' }}
                  animate={showCopy ? { y: '0%' } : { y: '108%' }}
                  transition={{ duration: 0.62, delay: 0.16, ease: EASE_OUT_EXPO }}
                >
                  Laptop That{' '}
                  <span className="font-hand-display relative inline-block text-[1.14em] leading-[0.95] text-[#0068B5] dark:text-[#38BDF8]">
                    Chokes in 6 Months.
                    <motion.span
                      className="block"
                      initial={prefersReducedMotion ? false : { scaleX: 0 }}
                      animate={showCopy ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: 0.55, delay: 0.32, ease: EASE_OUT_EXPO }}
                      style={{ transformOrigin: 'left center' }}
                    >
                      <HandUnderline className="-mt-1" />
                    </motion.span>
                  </span>
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={showCopy ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.55, delay: 0.22, ease: EASE_OUT_EXPO }}
              className="mt-3.5 max-w-[52ch] text-sm leading-relaxed text-slate-600 dark:text-[#D1D5DB] sm:mt-5 sm:text-base md:text-lg"
            >
              Flashy stickers hide budget chips that heat up fast and drain your battery.
              <span className="hidden sm:inline">
                {' '}
                Jump into Byte&apos;s short adventure to feel built-in AI speed, all-day battery, and
                smooth graphics—or test your own laptop setup below.
              </span>
            </motion.p>

            {/* Primary & Secondary Actions */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={showCopy ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.55, delay: 0.28, ease: EASE_OUT_EXPO }}
              className="mt-5 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              <button
                type="button"
                data-arcade-launch="true"
                onClick={handleRequestCabinetLaunch}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-lg border-2 border-[#111827] bg-[#0068B5] px-6 py-3.5 text-sm font-bold text-white shadow-[3px_3px_0px_#111827] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#005291] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068B5] dark:border-[#38BDF8] dark:shadow-[3px_3px_0px_#020617] dark:focus-visible:outline-[#38BDF8] sm:w-auto whitespace-nowrap shrink-0"
              >
                <Gamepad2 className="h-5 w-5 shrink-0" />
                <span>
                  {hasCompletedQuest
                    ? 'Replay: Byte Needs You!'
                    : 'Get Over Here, Byte needs you!'}
                </span>
              </button>

              <a
                href="#pc-builder"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-900 bg-white/90 px-5 py-3.5 text-sm font-bold text-slate-900 shadow-[3px_3px_0px_#0F172A] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068B5] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F3F4F6] dark:shadow-[3px_3px_0px_#020617] dark:hover:bg-[#1E293B] dark:focus-visible:outline-[#38BDF8] sm:w-auto whitespace-nowrap shrink-0"
              >
                <span>Build &amp; Benchmark Live</span>
                <ArrowDown className="h-4 w-4 shrink-0 text-slate-500 dark:text-[#9CA3AF]" />
              </a>
            </motion.div>

            {/* Clean Directional Pointer & Kinetic Scroll Cue (Hidden clutter on phones) */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={showCopy ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.34, ease: EASE_OUT_EXPO }}
              className="mt-7 hidden items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-[#1F2937] sm:mt-8 sm:flex"
            >
              <a
                href="#recommended-products"
                className="inline-flex min-h-[44px] items-center text-sm font-bold text-[#0068B5] underline decoration-wavy underline-offset-4 hover:text-[#005291] dark:text-[#38BDF8] dark:hover:text-[#7DD3FC]"
              >
                Skip straight to Matched Laptops
              </a>

              <div className="hidden items-center gap-2 lg:flex">
                <span className="font-hand-display -rotate-3 text-2xl font-bold text-[#0068B5] dark:text-[#38BDF8]">
                  Spin or click screen!
                </span>
                <HeroCurvedArrow className="h-10 w-24" />
              </div>
            </motion.div>
          </div>

          {/* 3D Intel Silicon Forge Arcade Machine (First on Mobile, Right Column on PC >=768px) */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
            animate={
              introReady ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.97 }
            }
            transition={{ duration: 0.65, delay: 0.14, ease: EASE_OUT_EXPO }}
            className="order-1 relative z-10 md:order-2 md:col-span-6"
          >
            <HeroArcade3DStage
              launchNonce={launchNonce}
              paused={arcadeOpen}
              darkMode={darkMode}
              globalMuted={globalMuted}
              onToggleGlobalMute={onToggleGlobalMute}
              onLaunchComplete={onLaunchArcade}
              onRequestLaunch={handleRequestCabinetLaunch}
              onVideoReady={onVideoReady}
              onCabinetArtReady={onCabinetArtReady}
            />
          </motion.div>
        </div>
      </div>

      {/* Seamless 120px Bottom Gradient Fade Into Next Section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[120px] bg-gradient-to-b from-transparent to-[#FAF8F5] transition-colors duration-200 dark:to-[#0B1120]"
      />
    </section>
  );
}
