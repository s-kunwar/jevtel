import { useState } from 'react';
import {
  Gamepad2,
  Menu,
  MessageSquareText,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { triggerHaptic } from '../game/haptics';

export type AppMode = 'fast' | 'pro';

interface LandingHeaderProps {
  appMode: AppMode;
  onChangeMode: (next: AppMode) => void;
  onPlayQuest: () => void;
  onOpenNova: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export function LandingHeader({
  appMode,
  onChangeMode,
  onPlayQuest,
  onOpenNova,
  darkMode,
  onToggleDarkMode,
  muted,
  onToggleMute,
}: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (targetId: string) => {
    setMobileMenuOpen(false);
    triggerHaptic(8, muted);
    const el = document.querySelector(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSwitchMode = (next: AppMode) => {
    if (next === appMode) return;
    triggerHaptic(10, muted);
    setMobileMenuOpen(false);
    onChangeMode(next);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-[#FAF8F5]/95 backdrop-blur-md transition-colors duration-200 dark:border-[#1F2937] dark:bg-[#0B1120]/95">
      <div className="mx-auto flex h-12 max-w-[1240px] items-center justify-between gap-1.5 px-2.5 sm:h-14 sm:gap-4 sm:px-5 md:h-auto md:gap-6 md:px-10 md:py-3">
        {/* Zone 1: Brand Wordmark + Prominent Fast Mode | Pro Builder Pill Toggle */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-4">
          <a
            href={appMode === 'fast' ? '#day-taps' : '#top-gateway'}
            className="font-editorial text-base font-bold tracking-tight text-[#111827] dark:text-[#F3F4F6] sm:text-lg md:text-xl whitespace-nowrap shrink-0"
          >
            Jevtel
          </a>

          <div
            role="group"
            aria-label="Experience mode"
            className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-white p-0.5 shadow-2xs dark:border-[#334155] dark:bg-[#111827] shrink-0"
          >
            <button
              type="button"
              onClick={() => handleSwitchMode('fast')}
              aria-pressed={appMode === 'fast'}
              className={`min-h-[30px] rounded-full px-2 py-0.5 text-[10.5px] font-bold transition-colors sm:min-h-[34px] sm:px-3.5 sm:py-1 sm:text-xs whitespace-nowrap shrink-0 ${
                appMode === 'fast'
                  ? 'bg-[#0068B5] text-white shadow-xs dark:bg-[#0284C7]'
                  : 'text-[#4B5563] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Fast Mode
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('pro')}
              aria-pressed={appMode === 'pro'}
              className={`min-h-[30px] rounded-full px-2 py-0.5 text-[10.5px] font-bold transition-colors sm:min-h-[34px] sm:px-3.5 sm:py-1 sm:text-xs whitespace-nowrap shrink-0 ${
                appMode === 'pro'
                  ? 'bg-[#0068B5] text-white shadow-xs dark:bg-[#0284C7]'
                  : 'text-[#4B5563] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Pro Builder
            </button>
          </div>
        </div>

        {/* Zone 2: Minimal smooth-scroll links (Desktop / Tablet) */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 text-sm font-semibold text-[#374151] dark:text-[#D1D5DB] lg:flex"
        >
          {appMode === 'fast' ? (
            <>
              <a
                href="#day-taps"
                className="transition-colors hover:text-[#0068B5] hover:underline hover:decoration-wavy hover:underline-offset-4 dark:hover:text-[#38BDF8] whitespace-nowrap shrink-0"
              >
                Your Day
              </a>
              <a
                href="#store-showdown"
                className="transition-colors hover:text-[#0068B5] hover:underline hover:decoration-wavy hover:underline-offset-4 dark:hover:text-[#38BDF8] whitespace-nowrap shrink-0"
              >
                60s Showdown
              </a>
              <a
                href="#store-quote"
                className="transition-colors hover:text-[#0068B5] hover:underline hover:decoration-wavy hover:underline-offset-4 dark:hover:text-[#38BDF8] whitespace-nowrap shrink-0"
              >
                Store Quote
              </a>
            </>
          ) : (
            <>
              <a
                href="#pc-builder"
                className="transition-colors hover:text-[#0068B5] hover:underline hover:decoration-wavy hover:underline-offset-4 dark:hover:text-[#38BDF8] whitespace-nowrap shrink-0"
              >
                PC Builder
              </a>
              <a
                href="#store-guide"
                className="transition-colors hover:text-[#0068B5] hover:underline hover:decoration-wavy hover:underline-offset-4 dark:hover:text-[#38BDF8] whitespace-nowrap shrink-0"
              >
                Find Your Match
              </a>
              <a
                href="#recommended-products"
                className="transition-colors hover:text-[#0068B5] hover:underline hover:decoration-wavy hover:underline-offset-4 dark:hover:text-[#38BDF8] whitespace-nowrap shrink-0"
              >
                Laptops
              </a>
            </>
          )}
        </nav>

        {/* Zone 3: Compact Icons on Phone -> Full Actions on Larger Screens + Expanding Menu */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8, muted);
              onToggleMute();
            }}
            aria-label={muted ? 'Unmute site and game audio' : 'Mute site and game audio'}
            title={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] dark:border-[#334155] dark:bg-[#111827] dark:text-[#E2E8F0] dark:hover:border-[#38BDF8] dark:hover:text-[#38BDF8] sm:h-9 sm:w-9 shrink-0"
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5 text-[#EF4444] dark:text-[#F87171] sm:h-4 sm:w-4" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(8, muted);
              onToggleDarkMode();
            }}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#0068B5]/35 bg-white text-[#0068B5] shadow-[0_0_10px_rgba(0,104,181,0.2)] transition-all duration-200 hover:border-[#0068B5] hover:shadow-[0_0_16px_rgba(0,104,181,0.38)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068B5] dark:border-[#38BDF8]/50 dark:bg-[#0F172A] dark:text-[#38BDF8] dark:shadow-[0_0_12px_rgba(56,189,248,0.34)] dark:hover:border-[#38BDF8] dark:hover:shadow-[0_0_20px_rgba(56,189,248,0.55)] dark:focus-visible:outline-[#38BDF8] sm:h-9 sm:w-9 shrink-0"
          >
            <Gamepad2 className="h-3.5 w-3.5 drop-shadow-[0_0_6px_rgba(0,104,181,0.45)] dark:drop-shadow-[0_0_8px_rgba(56,189,248,0.75)] sm:h-[18px] sm:w-[18px]" />
          </button>

          {appMode === 'pro' && (
            <>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(14, muted);
                  onPlayQuest();
                }}
                className="hidden h-9 items-center gap-1.5 rounded-lg bg-[#0068B5] px-3 text-xs font-bold text-white transition-colors hover:bg-[#005291] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068B5] sm:inline-flex md:hidden whitespace-nowrap shrink-0"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(14, muted);
                  onPlayQuest();
                }}
                className="hidden rounded-lg bg-[#0068B5] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#005291] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068B5] md:inline-flex whitespace-nowrap shrink-0"
              >
                Get Over Here, Byte needs you!
              </button>
            </>
          )}

          {/* Mobile Expanding Menu Drawer Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8, muted);
              setMobileMenuOpen((prev) => !prev);
            }}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111827] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F3F4F6] sm:h-9 sm:w-9 lg:hidden shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            ) : (
              <Menu className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            )}
          </button>
        </div>
      </div>

      {/* Compact Slide-Down Mobile Menu Drawer (holds overflow items cleanly on phones) */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E5E7EB] bg-[#FAF8F5] px-4 py-3 shadow-lg dark:border-[#1F2937] dark:bg-[#0B1120] lg:hidden">
          <nav aria-label="Mobile menu" className="flex flex-col gap-1.5">
            {appMode === 'fast' ? (
              <>
                <a
                  href="#day-taps"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileNavClick('#day-taps');
                  }}
                  className="flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-semibold text-[#111827] transition-colors hover:bg-white dark:text-[#F3F4F6] dark:hover:bg-[#111827]"
                >
                  <span>01. Your Day in 3 Taps</span>
                  <span className="font-mono-tabular text-xs text-[#0068B5] dark:text-[#38BDF8]">
                    Step 1
                  </span>
                </a>
                <a
                  href="#store-showdown"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileNavClick('#store-showdown');
                  }}
                  className="flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-semibold text-[#111827] transition-colors hover:bg-white dark:text-[#F3F4F6] dark:hover:bg-[#111827]"
                >
                  <span>02. 60-Second Store Showdown</span>
                  <span className="font-mono-tabular text-xs text-[#0068B5] dark:text-[#38BDF8]">
                    Step 2
                  </span>
                </a>
                <a
                  href="#store-quote"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileNavClick('#store-quote');
                  }}
                  className="flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-semibold text-[#111827] transition-colors hover:bg-white dark:text-[#F3F4F6] dark:hover:bg-[#111827]"
                >
                  <span>03. Store Quote &amp; In-Store Check</span>
                  <span className="font-mono-tabular text-xs text-[#0068B5] dark:text-[#38BDF8]">
                    Step 3
                  </span>
                </a>
              </>
            ) : (
              <>
                <a
                  href="#pc-builder"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileNavClick('#pc-builder');
                  }}
                  className="flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-semibold text-[#111827] transition-colors hover:bg-white dark:text-[#F3F4F6] dark:hover:bg-[#111827]"
                >
                  <span>PC Builder &amp; Benchmarks</span>
                  <span className="font-mono-tabular text-xs text-[#0068B5] dark:text-[#38BDF8]">01</span>
                </a>
                <a
                  href="#store-guide"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileNavClick('#store-guide');
                  }}
                  className="flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-semibold text-[#111827] transition-colors hover:bg-white dark:text-[#F3F4F6] dark:hover:bg-[#111827]"
                >
                  <span>Store Floor Match &amp; Checklist</span>
                  <span className="font-mono-tabular text-xs text-[#0068B5] dark:text-[#38BDF8]">02</span>
                </a>
                <a
                  href="#recommended-products"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileNavClick('#recommended-products');
                  }}
                  className="flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-semibold text-[#111827] transition-colors hover:bg-white dark:text-[#F3F4F6] dark:hover:bg-[#111827]"
                >
                  <span>Matched Store Laptops</span>
                  <span className="font-mono-tabular text-xs text-[#0068B5] dark:text-[#38BDF8]">03</span>
                </a>
              </>
            )}

            <div className="mt-2 grid grid-cols-1 gap-2 border-t border-[#E5E7EB] pt-3 dark:border-[#1F2937]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerHaptic(10, muted);
                  onOpenNova();
                }}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-xs font-bold text-[#111827] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F3F4F6]"
              >
                <MessageSquareText className="h-4 w-4 text-[#0068B5] dark:text-[#38BDF8]" />
                <span>Ask NOVA PC Advisor</span>
              </button>

              {appMode === 'pro' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerHaptic(14, muted);
                    onPlayQuest();
                  }}
                  className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#0068B5] px-4 text-xs font-bold text-white"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>Get Over Here, Byte needs you!</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSwitchMode('pro')}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#0068B5] bg-[#0068B5] px-4 text-xs font-bold text-white"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>Switch to Pro Builder &amp; Arcade</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
