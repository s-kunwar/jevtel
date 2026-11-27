import { EDITORIAL_ART_URLS } from '../game/assets';

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
          <span className="font-hand-display text-lg font-bold tracking-wide text-[#4B5563]">
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
        className="h-full w-full object-contain mix-blend-multiply opacity-90"
      />
    </div>
  );
}
