import { Gamepad2, MessageSquareText, Volume2, VolumeX } from 'lucide-react';

interface LandingHeaderProps {
  onPlayQuest: () => void;
  onOpenNova: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export function LandingHeader({
  onPlayQuest,
  onOpenNova,
  darkMode,
  onToggleDarkMode,
  muted,
  onToggleMute,
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-[#FAF8F5]/95 backdrop-blur-xs transition-colors duration-200 dark:border-[#1F2937] dark:bg-[#0B1120]/95">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-3 md:px-10">
        {/* Zone 1: Single clean wordmark */}
        <a
          href="#top-gateway"
          className="font-editorial text-xl font-bold tracking-tight text-[#111827] dark:text-[#F3F4F6] whitespace-nowrap shrink-0"
        >
          Jevtel
        </a>

        {/* Zone 2: Minimal smooth-scroll links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 text-sm font-semibold text-[#374151] dark:text-[#D1D5DB] md:flex"
        >
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
        </nav>

        {/* Zone 3: Sound Mute Toggle + Theme Toggle + Ask NOVA + Single Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenNova}
            title="Ask NOVA Retail PC Advisor"
            className="hidden items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#111827] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] dark:border-[#334155] dark:bg-[#111827] dark:text-[#F3F4F6] dark:hover:border-[#38BDF8] dark:hover:text-[#38BDF8] sm:inline-flex whitespace-nowrap shrink-0"
          >
            <MessageSquareText className="h-3.5 w-3.5 text-[#0068B5] dark:text-[#38BDF8]" />
            <span>Ask NOVA</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute site and game audio' : 'Mute site and game audio'}
            title={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] dark:border-[#334155] dark:bg-[#111827] dark:text-[#E2E8F0] dark:hover:border-[#38BDF8] dark:hover:text-[#38BDF8] shrink-0"
          >
            {muted ? (
              <VolumeX className="h-4 w-4 text-[#EF4444] dark:text-[#F87171]" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0068B5]/35 bg-white text-[#0068B5] shadow-[0_0_12px_rgba(0,104,181,0.22)] transition-all duration-200 hover:border-[#0068B5] hover:shadow-[0_0_16px_rgba(0,104,181,0.38)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068B5] dark:border-[#38BDF8]/50 dark:bg-[#0F172A] dark:text-[#38BDF8] dark:shadow-[0_0_14px_rgba(56,189,248,0.36)] dark:hover:border-[#38BDF8] dark:hover:shadow-[0_0_20px_rgba(56,189,248,0.55)] dark:focus-visible:outline-[#38BDF8] shrink-0"
          >
            <Gamepad2 className="h-[18px] w-[18px] drop-shadow-[0_0_6px_rgba(0,104,181,0.45)] dark:drop-shadow-[0_0_8px_rgba(56,189,248,0.75)]" />
          </button>

          <button
            type="button"
            onClick={onPlayQuest}
            className="rounded-lg bg-[#0068B5] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#005291] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068B5] whitespace-nowrap shrink-0"
          >
            Get Over Here, Byte needs you!
          </button>
        </div>
      </div>
    </header>
  );
}
