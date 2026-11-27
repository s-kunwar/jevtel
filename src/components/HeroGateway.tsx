import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Gamepad2 } from 'lucide-react';
import { HeroArcade3DStage } from './HeroArcade3DStage';
import { HandUnderline, HeroCurvedArrow } from './SketchDoodles';

interface HeroGatewayProps {
  onLaunchArcade: () => void;
  hasCompletedQuest: boolean;
  introReady: boolean;
  arcadeOpen: boolean;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function HeroGateway({
  onLaunchArcade,
  hasCompletedQuest,
  introReady,
  arcadeOpen,
}: HeroGatewayProps) {
  const [launchNonce, setLaunchNonce] = useState(0);

  const handleRequestCabinetLaunch = () => {
    setLaunchNonce((n) => n + 1);
  };

  return (
    <section
      id="top-gateway"
      className="relative overflow-hidden bg-[#FAF8F5] py-12 md:py-16 lg:py-20"
    >
      {/* Subtle Architectural Blueprint Corner Ticks */}
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto hidden max-w-[1200px] px-6 md:px-10 lg:block"
      >
        <div className="flex items-center justify-between font-mono-tabular text-[11px] font-medium text-[#9CA3AF]">
          <span>+ Jevtel Studio Showcase</span>
          <span>+ Built-In AI · Graphics · All-Day Power</span>
        </div>
      </div>

      <div className="relative mx-auto mt-3 max-w-[1200px] px-6 md:px-10">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Odama-Style Masked Staggered Kinetic Typography */}
          <div className="relative flex flex-col justify-center lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.45, delay: 0.04, ease: EASE_OUT_EXPO }}
              className="text-sm font-bold tracking-wide text-[#0068B5]"
            >
              Intel Core Ultra
            </motion.div>

            <h1
              className="font-editorial mt-2.5 text-[clamp(2.4rem,4.5vw,3.9rem)] font-bold leading-[1.05] tracking-tight text-[#111827]"
              style={{ textWrap: 'balance' }}
            >
              <span className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: '108%' }}
                  animate={introReady ? { y: '0%' } : { y: '108%' }}
                  transition={{ duration: 0.62, delay: 0.08, ease: EASE_OUT_EXPO }}
                >
                  Don&apos;t Buy a Pretty
                </motion.span>
              </span>

              <span className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: '108%' }}
                  animate={introReady ? { y: '0%' } : { y: '108%' }}
                  transition={{ duration: 0.62, delay: 0.16, ease: EASE_OUT_EXPO }}
                >
                  Laptop That{' '}
                  <span className="font-hand-display relative inline-block text-[1.16em] leading-[0.95] text-[#0068B5]">
                    Chokes in 6 Months.
                    <motion.span
                      className="block"
                      initial={{ scaleX: 0 }}
                      animate={introReady ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: 0.55, delay: 0.36, ease: EASE_OUT_EXPO }}
                      style={{ transformOrigin: 'left center' }}
                    >
                      <HandUnderline className="-mt-1" />
                    </motion.span>
                  </span>
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.55, delay: 0.28, ease: EASE_OUT_EXPO }}
              className="mt-5 max-w-[52ch] text-base leading-relaxed text-[#374151] md:text-lg"
            >
              Flashy stickers hide budget chips that heat up fast and drain your battery under
              college work, editing, and AI tools. Jump into Byte&apos;s short adventure to feel
              built-in AI speed, all-day battery, and smooth graphics—or test your own laptop setup
              below.
            </motion.p>

            {/* Primary & Secondary Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.55, delay: 0.36, ease: EASE_OUT_EXPO }}
              className="mt-7 flex flex-wrap items-center gap-4"
            >
              <button
                type="button"
                onClick={handleRequestCabinetLaunch}
                className="inline-flex items-center gap-2.5 rounded-lg border-2 border-[#111827] bg-[#0068B5] px-6 py-3.5 text-sm font-bold text-white shadow-[3px_3px_0px_#111827] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#005291] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068B5] whitespace-nowrap shrink-0"
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
                className="inline-flex items-center gap-2 rounded-lg border-2 border-[#111827] bg-white px-5 py-3.5 text-sm font-bold text-[#111827] shadow-[3px_3px_0px_#CBD5E1] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#F8F9FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068B5] whitespace-nowrap shrink-0"
              >
                <span>Build &amp; Benchmark Live</span>
                <ArrowDown className="h-4 w-4 shrink-0 text-[#4B5563]" />
              </a>
            </motion.div>

            {/* Clean Directional Pointer & Kinetic Scroll Cue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={introReady ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.48, ease: EASE_OUT_EXPO }}
              className="mt-8 flex items-center justify-between gap-4 border-t border-[#E5E7EB] pt-5"
            >
              <a
                href="#store-guide"
                className="text-sm font-bold text-[#0068B5] underline decoration-wavy underline-offset-4 hover:text-[#004B87]"
              >
                Skip straight to your Store Match
              </a>

              <div className="hidden items-center gap-2 lg:flex">
                <span className="font-hand-display -rotate-3 text-2xl font-bold text-[#0068B5]">
                  Spin or click screen!
                </span>
                <HeroCurvedArrow className="h-10 w-24" />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Rotatable 3D Warm-Parchment Jevtel Arcade Machine */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={
              introReady ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.97 }
            }
            transition={{ duration: 0.7, delay: 0.22, ease: EASE_OUT_EXPO }}
            className="relative lg:col-span-6"
          >
            <HeroArcade3DStage
              launchNonce={launchNonce}
              paused={arcadeOpen}
              onLaunchComplete={onLaunchArcade}
              onRequestLaunch={handleRequestCabinetLaunch}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
