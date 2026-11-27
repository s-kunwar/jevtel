import { EDITORIAL_ART_URLS } from '../game/assets';
import { LandingRoamingTrack, type RoamingTrackVariant } from './LandingRoamingTrack';

export function HandUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 18"
      fill="none"
      className={`pointer-events-none block h-3.5 w-full ${className}`}
      preserveAspectRatio="none"
    >
      <path
        d="M4 11.5C58 5.2 142 3.8 255 9.2"
        stroke="#0068B5"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M18 14.8C86 10.2 174 9.5 244 13.4"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 5"
      />
    </svg>
  );
}

export function HeroCurvedArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 140 66"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      <path
        d="M8 46C34 16 84 10 124 34"
        stroke="#0068B5"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="6 5"
      />
      <path
        d="M113 21L127 35L110 41"
        stroke="#0068B5"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 18L24 23M19 21L27 20"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M72 8L74 13M69 11L77 10"
        stroke="#0068B5"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChipSketchDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 96"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      <rect
        x="24"
        y="24"
        width="48"
        height="48"
        rx="6"
        stroke="#1F2937"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect
        x="33"
        y="33"
        width="30"
        height="30"
        rx="3"
        fill="#DBEAFE"
        stroke="#0068B5"
        strokeWidth="1.8"
      />
      <path
        d="M36 14V24M48 12V24M60 14V24M36 72V82M48 72V84M60 72V82M14 36H24M12 48H24M14 60H24M72 36H82M72 48H84M72 60H82"
        stroke="#1F2937"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M42 48L47 41V47H54L49 55V49H42Z"
        fill="#F59E0B"
        stroke="#1F2937"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SwordShieldDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 110 90"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      <path
        d="M22 72L66 20L74 14L70 25L28 76Z"
        fill="#E0F2FE"
        stroke="#1F2937"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M17 64L34 78"
        stroke="#B45309"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M54 36C54 36 72 32 86 38C86 58 76 72 68 79C60 72 52 58 54 36Z"
        fill="#FEF3C7"
        stroke="#1F2937"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M69 44V66M60 54H78"
        stroke="#0068B5"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BatteryLanternDoodle({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 96"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      <rect
        x="26"
        y="24"
        width="44"
        height="56"
        rx="7"
        fill="#ECFDF5"
        stroke="#1F2937"
        strokeWidth="2.2"
      />
      <rect
        x="38"
        y="16"
        width="20"
        height="8"
        rx="2"
        fill="#D1FAE5"
        stroke="#1F2937"
        strokeWidth="2"
      />
      <path
        d="M34 66H62M34 55H62M34 44H56"
        stroke="#047857"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M78 24L83 20M80 35H87M12 34L19 37M14 54L20 52"
        stroke="#F59E0B"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SketchSectionDivider({ label }: { label?: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex max-w-[1200px] items-center justify-center gap-4 px-6 py-2 md:px-10"
    >
      <svg viewBox="0 0 380 22" fill="none" className="h-5 flex-1">
        <path
          d="M2 12C68 7 148 16 226 10C284 6 332 14 378 10"
          stroke="#CBD5E1"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="7 6"
        />
      </svg>
      <div className="flex items-center gap-2 text-[#0068B5]">
        <svg viewBox="0 0 28 28" fill="none" className="h-5 w-5 shrink-0">
          <rect x="6" y="6" width="16" height="16" rx="3" stroke="#0068B5" strokeWidth="1.8" />
          <path d="M10 2V6M18 2V6M10 22V26M18 22V26M2 10H6M2 18H6M22 10H26M22 18H26" stroke="#1F2937" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {label && (
          <span className="font-hand-display text-lg font-bold tracking-wide text-[#4B5563] dark:text-[#9CA3AF]">
            {label}
          </span>
        )}
      </div>
      <svg viewBox="0 0 380 22" fill="none" className="h-5 flex-1">
        <path
          d="M2 10C78 15 162 6 244 12C302 16 340 8 378 11"
          stroke="#CBD5E1"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="7 6"
        />
      </svg>
    </div>
  );
}

export function NotebookSpotArt({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <img
        src={EDITORIAL_ART_URLS.notebookDoodle}
        alt=""
        referrerPolicy="no-referrer"
        className="h-full w-full object-contain mix-blend-multiply opacity-90 dark:mix-blend-normal dark:opacity-80"
      />
    </div>
  );
}

/**
 * Minimal architectural Intel silicon blueprint seal & PCB trace bus
 * placed gently inside whitespace dividers between landing sections.
 */
export function IntelBlueprintDivider({
  label,
  roamingVariant,
  className = '',
}: {
  label?: string;
  roamingVariant?: RoamingTrackVariant;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative mx-auto flex max-w-[1200px] items-center justify-center gap-2.5 px-3 select-none sm:gap-4 sm:px-6 md:px-10 ${
        roamingVariant ? 'pt-7 pb-2.5 sm:pt-9 sm:pb-3' : 'py-3'
      } ${className}`}
    >
      {roamingVariant && <LandingRoamingTrack variant={roamingVariant} />}
      {/* Left PCB Trace Bus */}
      <svg
        viewBox="0 0 420 34"
        fill="none"
        className="h-6 flex-1 text-[#0068B5] opacity-30 dark:text-[#38BDF8] dark:opacity-25 sm:h-7"
        preserveAspectRatio="none"
      >
        <path
          d="M0 17H280L294 9H420"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M48 25H312L326 17H420"
          stroke="#94A3B8"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <circle cx="48" cy="25" r="2.2" fill="currentColor" />
        <circle cx="176" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <circle cx="294" cy="9" r="2.4" fill="currentColor" />
      </svg>

      {/* Center Minimal Intel Silicon Wafer Cross-Section Seal */}
      <div className="relative flex items-center gap-2 px-1 opacity-70 dark:opacity-60 sm:gap-3 sm:px-2">
        <svg viewBox="0 0 56 56" fill="none" className="h-8 w-8 shrink-0 sm:h-10 sm:w-10">
          {/* Outer octagonal wafer ring */}
          <polygon
            points="18,4 38,4 52,18 52,38 38,52 18,52 4,38 4,18"
            className="stroke-[#0068B5] dark:stroke-[#38BDF8]"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          <rect
            x="14"
            y="14"
            width="28"
            height="28"
            rx="4"
            className="stroke-[#1E293B] dark:stroke-[#94A3B8]"
            strokeWidth="1.3"
          />
          {/* Compute / Arc / NPU die subdivisions */}
          <rect
            x="18.5"
            y="18.5"
            width="9.5"
            height="9.5"
            rx="1.5"
            className="fill-[#0068B5]/15 stroke-[#0068B5] dark:fill-[#38BDF8]/15 dark:stroke-[#38BDF8]"
            strokeWidth="1.1"
          />
          <rect
            x="30"
            y="18.5"
            width="7.5"
            height="9.5"
            rx="1.5"
            className="stroke-[#64748B] dark:stroke-[#94A3B8]"
            strokeWidth="1"
          />
          <rect
            x="18.5"
            y="30"
            width="19"
            height="7.5"
            rx="1.5"
            className="fill-[#0068B5]/20 stroke-[#0068B5] dark:fill-[#38BDF8]/20 dark:stroke-[#38BDF8]"
            strokeWidth="1.1"
          />
          {/* Perimeter pin ticks */}
          <path
            d="M21 9V14M28 9V14M35 9V14M21 42V47M28 42V47M35 42V47M9 21H14M9 28H14M9 35H14M42 21H47M42 28H47M42 35H47"
            className="stroke-[#64748B] dark:stroke-[#64748B]"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>

        <div className="flex flex-col leading-none">
          <span className="font-mono-tabular text-[9px] font-bold tracking-[0.16em] text-[#0068B5] dark:text-[#38BDF8] sm:text-[10px] sm:tracking-[0.22em]">
            intel · CORE ULTRA
          </span>
          {label && (
            <span className="mt-1 font-mono-tabular text-[8px] font-medium tracking-wider text-[#64748B] dark:text-[#94A3B8] sm:text-[9px]">
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Right PCB Trace Bus */}
      <svg
        viewBox="0 0 420 34"
        fill="none"
        className="h-7 flex-1 text-[#0068B5] opacity-30 dark:text-[#38BDF8] dark:opacity-25"
        preserveAspectRatio="none"
      >
        <path
          d="M0 9H126L140 17H420"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0 17H94L108 25H372"
          stroke="#94A3B8"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <circle cx="126" cy="9" r="2.4" fill="currentColor" />
        <circle cx="244" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <circle cx="372" cy="25" r="2.2" fill="currentColor" />
      </svg>
    </div>
  );
}

/**
 * Restrained architectural corner silicon stamp for section outer whitespace.
 */
export function IntelMarginSeal({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 180"
      fill="none"
      className={`pointer-events-none select-none text-[#0068B5] opacity-[0.075] dark:text-[#38BDF8] dark:opacity-[0.08] ${className}`}
    >
      <circle cx="90" cy="90" r="76" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 4" />
      <circle cx="90" cy="90" r="58" stroke="currentColor" strokeWidth="1" />
      <rect x="60" y="60" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="68" y="68" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.2" />
      <rect x="92" y="68" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.2" />
      <rect x="68" y="92" width="44" height="20" rx="3" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M72 48V60M90 48V60M108 48V60M72 120V132M90 120V132M108 120V132M48 72H60M48 90H60M48 108H60M120 72H132M120 90H132M120 108H132"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <text
        x="90"
        y="156"
        textAnchor="middle"
        fill="currentColor"
        fontSize="10"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="700"
        letterSpacing="2"
      >
        SILICON ARCHIVE
      </text>
    </svg>
  );
}
