import { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BatteryCharging,
  BookOpen,
  Briefcase,
  Check,
  ClipboardCheck,
  Cpu,
  Film,
  Gamepad2,
  MessageSquareText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  WifiOff,
} from 'lucide-react';
import {
  BUDGET_OPTIONS,
  DAILY_LIFE_OPTIONS,
  PRIORITY_OPTIONS,
  SHOWDOWN_ROUNDS,
  SHOWDOWN_TELEMETRY,
  THREE_TAP_STORE_CHECK,
  formatFastInr,
  solveFastModeMatch,
  type BudgetTierId,
  type DailyLifeId,
  type FastModeMatchResult,
  type FastModeSelection,
  type FastStoreId,
  type PriorityId,
  type ShowdownMeterTelemetry,
  type ShowdownRoundId,
} from '../game/fastModeData';
import { triggerHaptic } from '../game/haptics';

interface FastModeExperienceProps {
  selection: FastModeSelection;
  onChangeSelection: (next: FastModeSelection) => void;
  storeFilter: FastStoreId;
  onChangeStoreFilter: (next: FastStoreId) => void;
  activeRound: ShowdownRoundId;
  onChangeRound: (next: ShowdownRoundId) => void;
  muted: boolean;
  onOpenNova: (promptText?: string) => void;
  onSwitchToPro: () => void;
}

function getDailyIcon(id: DailyLifeId) {
  switch (id) {
    case 'college':
      return BookOpen;
    case 'office':
      return Briefcase;
    case 'creator':
      return Sparkles;
    case 'movies_home':
      return Film;
    case 'study_gaming':
      return Gamepad2;
  }
}

interface AnimatedSvgMeterProps {
  label: string;
  valuePct: number;
  statusText: string;
  tone: 'good' | 'warn' | 'bad';
  invertedHeat?: boolean;
}

function AnimatedSvgMeter({
  label,
  valuePct,
  statusText,
  tone,
  invertedHeat = false,
}: AnimatedSvgMeterProps) {
  const clamped = Math.max(0, Math.min(100, valuePct));
  const barColor =
    tone === 'good'
      ? '#0F766E'
      : tone === 'warn'
        ? '#E08E45'
        : '#E86A58';

  return (
    <div className="py-1.5 sm:py-2">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#334155] dark:text-[#CBD5E1] sm:text-xs">
          {label}
        </span>
        <span
          className={`font-mono-tabular text-[11px] font-bold sm:text-xs ${
            tone === 'good'
              ? 'text-[#0F766E] dark:text-[#2DD4BF]'
              : tone === 'warn'
                ? 'text-[#B45309] dark:text-[#FBBF24]'
                : 'text-[#C84B39] dark:text-[#F48474]'
          }`}
        >
          {invertedHeat ? `${clamped}% load` : `${clamped}%`} · {statusText}
        </span>
      </div>
      <svg
        viewBox="0 0 320 10"
        className="h-2.5 w-full overflow-visible"
        role="img"
        aria-label={`${label}: ${clamped} percent, ${statusText}`}
      >
        <rect
          x="0"
          y="0"
          width="320"
          height="10"
          rx="5"
          className="fill-[#E4ECEB] dark:fill-[#1E2E36]"
        />
        <rect
          x="0"
          y="0"
          width={Math.max(12, Math.round((clamped / 100) * 320))}
          height="10"
          rx="5"
          fill={barColor}
          style={{ transition: 'width 450ms cubic-bezier(0.16, 1, 0.3, 1), fill 300ms ease' }}
        />
      </svg>
    </div>
  );
}

function ShowdownCardMeters({
  telemetry,
  isIntel,
}: {
  telemetry: ShowdownMeterTelemetry;
  isIntel: boolean;
}) {
  return (
    <div className="divide-y divide-[#E4ECEB] dark:divide-[#1E2E36]">
      <AnimatedSvgMeter
        label="Battery Left"
        valuePct={telemetry.batteryLeftPct}
        statusText={telemetry.batteryNote}
        tone={
          telemetry.batteryLeftPct >= 65
            ? 'good'
            : telemetry.batteryLeftPct >= 40
              ? 'warn'
              : 'bad'
        }
      />
      <AnimatedSvgMeter
        label="Heat & Fan Noise"
        valuePct={telemetry.heatNoisePct}
        statusText={telemetry.heatNoiseLabel}
        tone={
          telemetry.heatNoisePct <= 35
            ? 'good'
            : telemetry.heatNoisePct <= 60
              ? 'warn'
              : 'bad'
        }
        invertedHeat
      />
      <AnimatedSvgMeter
        label="Privacy Shield"
        valuePct={telemetry.privacyPct}
        statusText={telemetry.privacyLabel}
        tone={
          telemetry.privacyPct >= 85
            ? 'good'
            : telemetry.privacyPct >= 50
              ? 'warn'
              : 'bad'
        }
      />
      <AnimatedSvgMeter
        label="App Reliability"
        valuePct={telemetry.reliabilityPct}
        statusText={telemetry.reliabilityLabel}
        tone={
          telemetry.reliabilityPct >= 85
            ? 'good'
            : telemetry.reliabilityPct >= 60
              ? 'warn'
              : 'bad'
        }
      />

      {isIntel && (
        <div className="mt-2 flex items-center gap-2 pt-2.5 text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>100% Private &amp; Offline — notes stay on your laptop</span>
        </div>
      )}

      {!isIntel && telemetry.privacyAlert && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#F3B8AF] bg-[#FFF2EF] px-3 py-2 text-xs font-semibold text-[#B93827] dark:border-[#6B2D26] dark:bg-[#2E1A18] dark:text-[#FCA5A5]">
          <ShieldAlert className="h-4 w-4 shrink-0 text-[#E86A58]" />
          <span>Warning: {telemetry.privacyAlert}</span>
        </div>
      )}
    </div>
  );
}

export function FastModeExperience({
  selection,
  onChangeSelection,
  storeFilter,
  onChangeStoreFilter: _onChangeStoreFilter,
  activeRound,
  onChangeRound,
  muted,
  onOpenNova,
  onSwitchToPro,
}: FastModeExperienceProps) {
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [activePhaseTab, setActivePhaseTab] = useState<'taps' | 'showdown' | 'advisor'>('taps');

  const [showdownSlideIdx, setShowdownSlideIdx] = useState(0);
  const [advisorSlideIdx, setAdvisorSlideIdx] = useState(0);
  const [verifySlideIdx, setVerifySlideIdx] = useState(0);

  const showdownTrackRef = useRef<HTMLDivElement | null>(null);
  const advisorTrackRef = useRef<HTMLDivElement | null>(null);
  const verifyTrackRef = useRef<HTMLDivElement | null>(null);

  const computeNearestSlideIdx = (container: HTMLDivElement | null): number => {
    if (!container) return 0;
    const center = container.scrollLeft + container.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    Array.from(container.children).forEach((child, idx) => {
      const el = child as HTMLElement;
      const elCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(elCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    return bestIdx;
  };

  const scrollTrackToIdx = (container: HTMLDivElement | null, idx: number) => {
    if (!container) return;
    const child = container.children[idx] as HTMLElement | undefined;
    if (!child) return;
    const targetLeft = Math.max(0, child.offsetLeft - (container.clientWidth - child.offsetWidth) / 2);
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const match: FastModeMatchResult = useMemo(
    () => solveFastModeMatch(selection, storeFilter),
    [selection, storeFilter]
  );

  const roundMeta =
    SHOWDOWN_ROUNDS.find((r) => r.id === activeRound) ?? SHOWDOWN_ROUNDS[0];
  const telemetry = SHOWDOWN_TELEMETRY[activeRound];

  const handleSelectDailyLife = (id: DailyLifeId) => {
    triggerHaptic(8, muted);
    if (selection.primaryLife === id) return;
    if (selection.secondaryLife === id) {
      onChangeSelection({ ...selection, secondaryLife: null });
      return;
    }
    onChangeSelection({
      ...selection,
      primaryLife: id,
      secondaryLife: selection.secondaryLife === id ? null : selection.secondaryLife,
    });
  };

  const handleToggleSecondaryLife = (id: DailyLifeId) => {
    triggerHaptic(8, muted);
    if (id === selection.primaryLife) return;
    onChangeSelection({
      ...selection,
      secondaryLife: selection.secondaryLife === id ? null : id,
    });
  };

  const handleTogglePriority = (id: PriorityId) => {
    triggerHaptic(8, muted);
    const exists = selection.priorities.includes(id);
    const next = exists
      ? selection.priorities.filter((p) => p !== id)
      : [...selection.priorities, id];
    onChangeSelection({ ...selection, priorities: next });
  };

  const handleSelectBudget = (budgetTier: BudgetTierId) => {
    triggerHaptic(8, muted);
    onChangeSelection({ ...selection, budgetTier });
  };

  const handleNextRound = () => {
    triggerHaptic(10, muted);
    const idx = SHOWDOWN_ROUNDS.findIndex((r) => r.id === activeRound);
    const nextIdx = (idx + 1) % SHOWDOWN_ROUNDS.length;
    onChangeRound(SHOWDOWN_ROUNDS[nextIdx].id);
  };

  const jumpToSection = (tab: 'taps' | 'showdown' | 'advisor', targetId: string) => {
    triggerHaptic(8, muted);
    setActivePhaseTab(tab);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const completedCheckCount = THREE_TAP_STORE_CHECK.filter(
    (s) => checkedSteps[s.id]
  ).length;

  return (
    <div className="fast-mode-canvas pb-12 text-[#0F172A] transition-colors duration-200 dark:text-[#F1F5F9] sm:pb-16">
      {/* Compact Airy Step Bar */}
      <div className="border-b border-[#D6E2E1] bg-white/85 backdrop-blur-md dark:border-[#1E2E36] dark:bg-[#0E181E]/90">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-2 px-3 py-2 sm:justify-center sm:gap-10 sm:px-6">
          <button
            type="button"
            onClick={() => jumpToSection('taps', 'day-taps')}
            className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:rounded-none sm:border-b-2 sm:bg-transparent sm:px-1 whitespace-nowrap ${
              activePhaseTab === 'taps'
                ? 'bg-[#E6F4F2] text-[#0F766E] sm:border-[#0F766E] sm:bg-transparent dark:bg-[#12312E] dark:text-[#2DD4BF] dark:sm:border-[#2DD4BF] dark:sm:bg-transparent'
                : 'text-[#475569] hover:text-[#0F766E] sm:border-transparent dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
            }`}
          >
            Your Day
          </button>
          <button
            type="button"
            onClick={() => jumpToSection('showdown', 'store-showdown')}
            className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:rounded-none sm:border-b-2 sm:bg-transparent sm:px-1 whitespace-nowrap ${
              activePhaseTab === 'showdown'
                ? 'bg-[#E6F4F2] text-[#0F766E] sm:border-[#0F766E] sm:bg-transparent dark:bg-[#12312E] dark:text-[#2DD4BF] dark:sm:border-[#2DD4BF] dark:sm:bg-transparent'
                : 'text-[#475569] hover:text-[#0F766E] sm:border-transparent dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
            }`}
          >
            60s Showdown
          </button>
          <button
            type="button"
            onClick={() => jumpToSection('advisor', 'store-quote')}
            className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:rounded-none sm:border-b-2 sm:bg-transparent sm:px-1 whitespace-nowrap ${
              activePhaseTab === 'advisor'
                ? 'bg-[#E6F4F2] text-[#0F766E] sm:border-[#0F766E] sm:bg-transparent dark:bg-[#12312E] dark:text-[#2DD4BF] dark:sm:border-[#2DD4BF] dark:sm:bg-transparent'
                : 'text-[#475569] hover:text-[#0F766E] sm:border-transparent dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
            }`}
          >
            Store Match
          </button>
        </div>
      </div>

      {/* PHASE 1: AIRY SOFT-TINTED HERO + 3-TAP SELECTOR */}
      <section
        id="day-taps"
        className="mx-auto max-w-[1160px] px-3.5 pt-5 pb-8 sm:px-6 sm:pt-7 sm:pb-12 md:px-10"
      >
        {/* Airy Seafoam-Porcelain Welcome Hero Banner with Soft Coral Accent Glow */}
        <div className="rounded-2xl border border-[#C6DFDD] bg-gradient-to-br from-[#E9F5F4] via-[#F4FAFA] to-[#FFF5F2] p-5 text-[#0F172A] shadow-[0_10px_30px_-10px_rgba(15,118,110,0.12)] dark:border-[#1E3B40] dark:from-[#102327] dark:via-[#111D24] dark:to-[#221718] dark:text-[#F1F5F9] dark:shadow-none sm:p-8 md:p-9">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
            <span>Croma</span>
            <span aria-hidden="true" className="text-[#94A3B8]">·</span>
            <span>Reliance Digital</span>
            <span aria-hidden="true" className="text-[#94A3B8]">·</span>
            <span>Vijay Sales</span>
            <span aria-hidden="true" className="text-[#94A3B8]">/</span>
            <span className="text-[#C84B39] dark:text-[#F48474]">60-Second Store Guide</span>
          </div>

          <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h1
                className="font-fast-display text-[clamp(1.95rem,5vw,3.35rem)] font-extrabold leading-[1.06] tracking-tight text-[#0F172A] dark:text-[#F8FAFC]"
                style={{ textWrap: 'balance' }}
              >
                Buy a Laptop That Still Feels Fast in Year 4.
              </h1>

              <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-[#334155] dark:text-[#CBD5E1] sm:text-base">
                Pick your everyday routine and comfortable budget in three taps. We match you to the
                right Intel Core Ultra laptop right on the store shelf—zero tech jargon.
              </p>
            </div>

            {/* Clean Soft-Shadowed Quick Jump Controls */}
            <div className="shrink-0">
              <div className="mb-1.5 text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8]">
                Jump ahead
              </div>
              <div className="inline-flex w-full items-center gap-1.5 rounded-xl border border-[#D6E2E1] bg-white/95 p-1.5 shadow-[0_4px_14px_-4px_rgba(15,39,44,0.08)] dark:border-[#22333D] dark:bg-[#0E181E] sm:w-auto">
                <button
                  type="button"
                  onClick={() => jumpToSection('showdown', 'store-showdown')}
                  className="min-h-[40px] flex-1 rounded-lg bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#0D625B] dark:bg-[#14B8A6] dark:text-[#042F2E] dark:hover:bg-[#2DD4BF] sm:flex-initial whitespace-nowrap"
                >
                  60s Showdown
                </button>
                <button
                  type="button"
                  onClick={() => jumpToSection('advisor', 'store-quote')}
                  className="min-h-[40px] flex-1 rounded-lg px-4 py-2 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#FFF2EF] hover:text-[#C84B39] dark:text-[#CBD5E1] dark:hover:bg-[#2E1A18] dark:hover:text-[#F48474] sm:flex-initial whitespace-nowrap"
                >
                  Store Quote
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Soft-Bordered Tinted Card Container */}
        <div className="mt-5 rounded-2xl border border-[#D6E2E1] bg-white p-5 shadow-[0_6px_24px_-6px_rgba(15,39,44,0.07)] dark:border-[#22333D] dark:bg-[#121D24] dark:shadow-none sm:mt-6 sm:p-7">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
                Step 01 · Your Everyday Routine
              </div>
              <h2 className="font-fast-display mt-0.5 text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] sm:text-2xl">
                What is your daily life?
              </h2>
            </div>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Tap 1 main life · Optionally add a 2nd
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DAILY_LIFE_OPTIONS.map((opt) => {
              const Icon = getDailyIcon(opt.id);
              const isPrimary = selection.primaryLife === opt.id;
              const isSecondary = selection.secondaryLife === opt.id;

              return (
                <div
                  key={opt.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 ${
                    isPrimary
                      ? 'border-[1.5px] border-[#0F766E] bg-[#ECFDF8] shadow-[0_6px_18px_-6px_rgba(15,118,110,0.18)] dark:border-[#2DD4BF] dark:bg-[#12312E] dark:shadow-none'
                      : isSecondary
                        ? 'border-[1.5px] border-[#E86A58] bg-[#FFF2EF] shadow-[0_6px_18px_-6px_rgba(232,106,88,0.16)] dark:border-[#F48474] dark:bg-[#2E1A18] dark:shadow-none'
                        : 'border-[#DCE7E6] bg-[#F8FBFB] hover:border-[#0F766E]/45 hover:bg-white dark:border-[#22333D] dark:bg-[#0E181E] dark:hover:border-[#2DD4BF]/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectDailyLife(opt.id)}
                    aria-pressed={isPrimary}
                    className="flex min-h-[52px] w-full items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]"
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isPrimary
                          ? 'bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:text-[#042F2E]'
                          : isSecondary
                            ? 'bg-[#E86A58] text-white dark:bg-[#F48474] dark:text-[#2E110D]'
                            : 'bg-[#E7F0EF] text-[#334155] dark:bg-[#1A2932] dark:text-[#CBD5E1]'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-fast-display text-base font-bold leading-snug text-[#0F172A] dark:text-[#F8FAFC]">
                          {opt.title}
                        </span>
                        {isPrimary && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:text-[#042F2E]">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                        )}
                        {isSecondary && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E86A58] text-white dark:bg-[#F48474] dark:text-[#2E110D]">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#475569] dark:text-[#94A3B8]">
                        {opt.examples}
                      </p>
                    </div>
                  </button>

                  <div className="mt-3 flex items-center justify-between border-t border-[#D6E2E1]/70 pt-2.5 dark:border-[#22333D]">
                    <span
                      className={`text-[11px] font-semibold ${
                        isPrimary
                          ? 'text-[#0F766E] dark:text-[#2DD4BF]'
                          : isSecondary
                            ? 'text-[#C84B39] dark:text-[#F48474]'
                            : 'text-[#64748B] dark:text-[#94A3B8]'
                      }`}
                    >
                      {isPrimary ? 'Main pick' : isSecondary ? 'Added as 2nd need' : 'Tap card for main'}
                    </span>

                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleToggleSecondaryLife(opt.id)}
                        className={`min-h-[32px] text-xs font-semibold transition-colors ${
                          isSecondary
                            ? 'text-[#C84B39] hover:text-[#9F3626] dark:text-[#F48474]'
                            : 'text-[#0F766E] hover:text-[#09554F] dark:text-[#2DD4BF]'
                        }`}
                      >
                        {isSecondary ? 'Remove extra' : '+ Also add this'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2 & Step 3 Soft-Elevated Cards */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-6 lg:grid-cols-12">
          {/* Step 2: Priorities */}
          <div className="rounded-2xl border border-[#D6E2E1] bg-white p-5 shadow-[0_6px_24px_-6px_rgba(15,39,44,0.07)] dark:border-[#22333D] dark:bg-[#121D24] dark:shadow-none sm:p-6 lg:col-span-6">
            <div className="text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
              Step 02 · Priorities
            </div>
            <h2 className="font-fast-display mt-0.5 mb-3.5 text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              What matters most to you?
            </h2>
            <div className="space-y-2.5">
              {PRIORITY_OPTIONS.map((p) => {
                const active = selection.priorities.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleTogglePriority(p.id)}
                    aria-pressed={active}
                    className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'border-[1.5px] border-[#0F766E] bg-[#ECFDF8] font-semibold text-[#0F172A] shadow-[0_4px_14px_-4px_rgba(15,118,110,0.14)] dark:border-[#2DD4BF] dark:bg-[#12312E] dark:text-white dark:shadow-none'
                        : 'border-[#DCE7E6] bg-[#F8FBFB] text-[#334155] hover:border-[#0F766E]/45 dark:border-[#22333D] dark:bg-[#0E181E] dark:text-[#CBD5E1]'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        active
                          ? 'border-[#0F766E] bg-[#0F766E] text-white dark:border-[#2DD4BF] dark:bg-[#2DD4BF] dark:text-[#042F2E]'
                          : 'border-[#CBD5E1] bg-white dark:border-[#334155] dark:bg-[#121D24]'
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Comfortable Budget */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#D6E2E1] bg-white p-5 shadow-[0_6px_24px_-6px_rgba(15,39,44,0.07)] dark:border-[#22333D] dark:bg-[#121D24] dark:shadow-none sm:p-6 lg:col-span-6">
            <div>
              <div className="text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
                Step 03 · Comfort Range
              </div>
              <h2 className="font-fast-display mt-0.5 mb-3.5 text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Your comfortable budget
              </h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {BUDGET_OPTIONS.map((b) => {
                  const active = selection.budgetTier === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBudget(b.id)}
                      aria-pressed={active}
                      className={`flex min-h-[64px] items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                        active
                          ? 'border-[1.5px] border-[#0F766E] bg-[#ECFDF8] text-[#0F172A] shadow-[0_4px_14px_-4px_rgba(15,118,110,0.16)] dark:border-[#2DD4BF] dark:bg-[#12312E] dark:text-white dark:shadow-none'
                          : 'border-[#DCE7E6] bg-[#F8FBFB] text-[#0F172A] hover:border-[#0F766E]/45 dark:border-[#22333D] dark:bg-[#0E181E] dark:text-[#F1F5F9]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-mono-tabular text-sm font-bold">{b.label}</div>
                        <div className="mt-0.5 text-xs text-[#475569] dark:text-[#94A3B8]">
                          {b.hint}
                        </div>
                      </div>
                      {active && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:text-[#042F2E]">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <a
                href="#store-showdown"
                onClick={() => {
                  triggerHaptic(10, muted);
                  setActivePhaseTab('showdown');
                }}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_-4px_rgba(15,118,110,0.3)] transition-colors hover:bg-[#0D625B] dark:bg-[#14B8A6] dark:text-[#042F2E] dark:hover:bg-[#2DD4BF] sm:w-auto whitespace-nowrap"
              >
                <span>See 60-Second Showdown</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#store-quote"
                onClick={() => {
                  triggerHaptic(8, muted);
                  setActivePhaseTab('advisor');
                }}
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-xl border border-[#E86A58]/50 bg-[#FFF5F2] px-4 py-3 text-sm font-semibold text-[#C84B39] transition-colors hover:border-[#E86A58] hover:bg-[#FFEBE6] dark:border-[#F48474]/50 dark:bg-[#2E1A18] dark:text-[#F48474] sm:w-auto whitespace-nowrap"
              >
                Jump to Store Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 2: THE 60-SECOND STORE SHOWDOWN */}
      <section
        id="store-showdown"
        className="border-t border-[#D6E2E1] py-7 transition-colors duration-200 dark:border-[#1E2E36] sm:py-11"
      >
        <div className="mx-auto max-w-[1160px] px-3.5 sm:px-6 md:px-10">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
                Phase 2 · The 60-Second Store Showdown
              </div>
              <h2
                className="font-fast-display mt-1 text-[clamp(1.4rem,3.6vw,2.3rem)] font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-[#F8FAFC]"
                style={{ textWrap: 'balance' }}
              >
                See How Two Same-Price Laptops Behave After You Buy Them.
              </h2>
              <p className="mt-1 hidden max-w-[60ch] text-sm text-[#475569] dark:text-[#CBD5E1] sm:block">
                Tap the four real-world moments below to compare your matched Intel Core Ultra
                laptop against a flashy generic store lookalike.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextRound}
              className="hidden min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-[#C6DFDD] bg-[#EAF5F4] px-4 py-2 text-xs font-semibold text-[#0F766E] transition-colors hover:bg-[#DCF0EE] dark:border-[#22333D] dark:bg-[#122629] dark:text-[#2DD4BF] md:inline-flex whitespace-nowrap"
            >
              <span>Next Stress Moment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 4 Interactive Stress Options — Soft Seafoam Segmented Bar */}
          <div
            role="tablist"
            aria-label="Real-world stress moments"
            className="mt-4 flex items-stretch gap-1.5 overflow-x-auto rounded-xl border border-[#D6E2E1] bg-[#EDF4F4] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-[#22333D] dark:bg-[#121D24] sm:mt-5 sm:grid sm:grid-cols-4 sm:overflow-visible"
          >
            {SHOWDOWN_ROUNDS.map((round) => {
              const isSelected = activeRound === round.id;
              return (
                <button
                  key={round.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    triggerHaptic(10, muted);
                    onChangeRound(round.id);
                    e.currentTarget.scrollIntoView({
                      inline: 'center',
                      block: 'nearest',
                      behavior: 'smooth',
                    });
                  }}
                  className={`flex min-h-[42px] shrink-0 items-center justify-center rounded-lg px-3 py-2 text-center text-xs font-semibold transition-all whitespace-nowrap sm:justify-start sm:text-left sm:px-3.5 ${
                    isSelected
                      ? 'bg-[#0F766E] text-white shadow-xs dark:bg-[#14B8A6] dark:text-[#042F2E]'
                      : 'text-[#334155] hover:bg-white/75 hover:text-[#0F172A] dark:text-[#CBD5E1] dark:hover:bg-[#1A2932]'
                  }`}
                >
                  <span className="sm:hidden">{round.shortLabel}</span>
                  <span className="hidden sm:inline sm:whitespace-normal sm:leading-snug">
                    {round.buttonLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Compact Scene Strip */}
          <div className="mt-3 rounded-xl border border-[#D6E2E1] bg-white px-4 py-2.5 shadow-[0_4px_16px_-6px_rgba(15,39,44,0.06)] dark:border-[#22333D] dark:bg-[#121D24] dark:shadow-none sm:mt-4 sm:py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-fast-display text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] sm:text-base">
                {roundMeta.headline}
              </div>
              {activeRound === 'train_offline' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Zero Wi-Fi Test</span>
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs leading-snug text-[#475569] dark:text-[#94A3B8] sm:text-sm">
              {roundMeta.sceneSummary}
            </p>
          </div>

          {/* Mobile Quick Switch / Slide Indicator */}
          <div className="mt-3 flex items-center justify-between gap-2 md:hidden">
            <div className="inline-flex items-center rounded-xl border border-[#D6E2E1] bg-[#EDF4F4] p-1 dark:border-[#22333D] dark:bg-[#121D24]">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8, muted);
                  setShowdownSlideIdx(0);
                  scrollTrackToIdx(showdownTrackRef.current, 0);
                }}
                className={`min-h-[34px] rounded-lg px-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  showdownSlideIdx === 0
                    ? 'bg-[#0F766E] text-white dark:bg-[#14B8A6] dark:text-[#042F2E]'
                    : 'text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                1. Intel AI PC
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8, muted);
                  setShowdownSlideIdx(1);
                  scrollTrackToIdx(showdownTrackRef.current, 1);
                }}
                className={`min-h-[34px] rounded-lg px-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  showdownSlideIdx === 1
                    ? 'bg-[#E86A58] text-white dark:bg-[#F48474] dark:text-[#2E110D]'
                    : 'text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                2. Lookalike
              </button>
            </div>
            <span className="font-mono-tabular text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
              Slide {showdownSlideIdx + 1} / 2
            </span>
          </div>

          {/* Swipeable Slide-Over Cards on Mobile -> 2-Column Grid on Tablet/Desktop */}
          <div
            ref={showdownTrackRef}
            onScroll={() => setShowdownSlideIdx(computeNearestSlideIdx(showdownTrackRef.current))}
            className="mt-2.5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-5 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0"
          >
            {/* Intel Core Ultra Card */}
            <article className="flex w-[88vw] max-w-[370px] shrink-0 snap-center flex-col justify-between rounded-2xl border-[1.5px] border-[#0F766E]/45 bg-white p-4 shadow-[0_8px_28px_-8px_rgba(15,118,110,0.14)] dark:border-[#2DD4BF]/50 dark:bg-[#121D24] dark:shadow-none md:w-auto md:max-w-none md:p-5">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E4ECEB] pb-2.5 dark:border-[#1E2E36] sm:pb-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#0F766E] dark:text-[#2DD4BF] sm:text-xs">
                      Your Matched Intel AI PC
                    </div>
                    <h3 className="font-fast-display mt-0.5 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] sm:text-lg">
                      {match.primaryLaptop.name}
                    </h3>
                    <div className="mt-0.5 text-[11px] text-[#475569] dark:text-[#94A3B8] sm:text-xs">
                      {match.primaryLaptop.processor} · {match.primaryLaptop.retailerName}
                    </div>
                  </div>
                  <div className="font-mono-tabular text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] sm:text-base">
                    {formatFastInr(match.primaryLaptop.priceInr)}
                  </div>
                </div>

                <div className="mt-2">
                  <ShowdownCardMeters telemetry={telemetry.intel} isIntel />
                </div>
              </div>

              <p className="mt-3 rounded-xl bg-[#ECFDF8] px-3.5 py-2.5 text-xs leading-relaxed text-[#134E4A] dark:bg-[#12312E] dark:text-[#CCFBF1]">
                <strong className="font-bold">What happens: </strong>
                {roundMeta.intelTakeaway}
              </p>
            </article>

            {/* Flashy Generic Rival Card */}
            <article className="flex w-[88vw] max-w-[370px] shrink-0 snap-center flex-col justify-between rounded-2xl border border-[#F0D3CE] bg-[#FFFBFA] p-4 shadow-[0_6px_22px_-8px_rgba(232,106,88,0.12)] dark:border-[#3D2522] dark:bg-[#17161B] dark:shadow-none md:w-auto md:max-w-none md:p-5">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#F2DFDC] pb-2.5 dark:border-[#332220] sm:pb-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#C84B39] dark:text-[#F48474] sm:text-xs">
                      Similarly Priced Lookalike
                    </div>
                    <h3 className="font-fast-display mt-0.5 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] sm:text-lg">
                      {match.genericRival.label}
                    </h3>
                    <div className="mt-0.5 text-[11px] text-[#475569] dark:text-[#94A3B8] sm:text-xs">
                      {match.genericRival.looksPitch}
                    </div>
                  </div>
                  <div className="font-mono-tabular text-sm font-bold text-[#475569] dark:text-[#94A3B8] sm:text-base">
                    ~{formatFastInr(match.genericRival.approxPriceInr)}
                  </div>
                </div>

                <div className="mt-2">
                  <ShowdownCardMeters telemetry={telemetry.generic} isIntel={false} />
                </div>
              </div>

              <p className="mt-3 rounded-xl bg-[#FFF2EF] px-3.5 py-2.5 text-xs leading-relaxed text-[#7F1D1D] dark:bg-[#2E1A18] dark:text-[#FECACA]">
                <strong className="font-bold">What happens: </strong>
                {roundMeta.genericTakeaway}
              </p>
            </article>
          </div>

          {/* Passive Slide Dots on Mobile */}
          <div className="mt-1.5 flex items-center justify-center gap-1.5 md:hidden" aria-hidden="true">
            {[0, 1].map((idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  showdownSlideIdx === idx
                    ? 'w-5 bg-[#0F766E] dark:bg-[#2DD4BF]'
                    : 'w-1.5 bg-[#CBD5E1] dark:bg-[#334155]'
                }`}
              />
            ))}
          </div>

          {/* Brief 10-Second 3-Engine Strip (Soft Seafoam Tinted Card) */}
          <div className="mt-5 rounded-2xl border border-[#C6DFDD] bg-[#EAF5F4] p-4 shadow-[0_4px_18px_-6px_rgba(15,118,110,0.08)] dark:border-[#1E3B40] dark:bg-[#102327] dark:shadow-none sm:mt-7 sm:p-6">
            <div className="font-fast-display text-sm font-bold text-[#0F766E] dark:text-[#2DD4BF] sm:text-base">
              Why It Works (In 10 Seconds)
            </div>
            <p className="mt-1 text-xs text-[#334155] dark:text-[#CBD5E1]">
              Intel Core Ultra splits your day across three built-in helpers instead of overheating one chip:
            </p>
            <div className="mt-3.5 grid grid-cols-1 gap-3 border-t border-[#C6DFDD] pt-3.5 dark:border-[#1E3B40] sm:gap-4 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] sm:text-sm">
                  <Cpu className="h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>1. Fast Everyday CPU</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-[#475569] dark:text-[#94A3B8]">
                  20+ Chrome tabs, Tally, and Excel stay smooth without hesitation.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] sm:text-sm">
                  <Thermometer className="h-4 w-4 shrink-0 text-[#E86A58] dark:text-[#F48474]" />
                  <span>2. Intel Arc Graphics</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-[#475569] dark:text-[#94A3B8]">
                  Canva, reels editing, 4K movies, and casual games without heavy weight.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] sm:text-sm">
                  <BatteryCharging className="h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>3. Intel AI Boost NPU</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-[#475569] dark:text-[#94A3B8]">
                  Quietly runs call blur &amp; offline notes so battery lasts and files stay private.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 3: ASK THE STORE ADVISOR — PURE SLIDE & CARD FORMAT (STORE IN CARD, ZERO BUTTONS) */}
      <section
        id="store-quote"
        className="border-t border-[#D6E2E1] py-8 transition-colors duration-200 dark:border-[#1E2E36] sm:py-12"
      >
        <div className="mx-auto max-w-[1160px] px-3.5 sm:px-6 md:px-10">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
                Phase 3 · Your In-Store Shortlist
              </div>
              <h2
                className="font-fast-display mt-1 text-[clamp(1.45rem,3.6vw,2.3rem)] font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]"
                style={{ textWrap: 'balance' }}
              >
                Ask the Store Advisor for This Exact Match.
              </h2>
            </div>

            <div className="font-mono-tabular text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] sm:text-xs">
              Slide across Croma, Reliance Digital &amp; Vijay Sales cards ({advisorSlideIdx + 1} / {match.storePicks.length})
            </div>
          </div>

          {/* Pure Slide-Over Store Cards (zero buttons inside — store name & SKU live cleanly in each card) */}
          <div
            ref={advisorTrackRef}
            onScroll={() => setAdvisorSlideIdx(computeNearestSlideIdx(advisorTrackRef.current))}
            className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:pb-0"
          >
            {match.storePicks.map((laptop, idx) => {
              const isTopPick = idx === 0;
              const perYearInr = Math.round(laptop.priceInr / 4);
              return (
                <article
                  key={laptop.id}
                  className={`flex w-[86vw] max-w-[360px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-2xl border transition-all lg:w-auto lg:max-w-none ${
                    isTopPick
                      ? 'border-[1.5px] border-[#0F766E] bg-[#ECFDF8] text-[#0F172A] shadow-[0_10px_28px_-8px_rgba(15,118,110,0.18)] dark:border-[#2DD4BF] dark:bg-[#12312E] dark:text-[#F8FAFC] dark:shadow-none'
                      : 'border-[#D6E2E1] bg-white text-[#0F172A] shadow-[0_6px_20px_-6px_rgba(15,39,44,0.07)] dark:border-[#22333D] dark:bg-[#121D24] dark:text-[#F8FAFC] dark:shadow-none'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-lg px-2.5 py-1 font-fast-display text-xs font-bold ${
                          isTopPick
                            ? 'bg-[#0F766E] text-white dark:bg-[#2DD4BF] dark:text-[#042F2E]'
                            : 'bg-[#FFF2EF] text-[#C84B39] dark:bg-[#2E1A18] dark:text-[#F48474]'
                        }`}
                      >
                        {laptop.retailerName}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          isTopPick
                            ? 'text-[#0F766E] dark:text-[#2DD4BF]'
                            : 'text-[#475569] dark:text-[#94A3B8]'
                        }`}
                      >
                        {isTopPick ? `Best Match · ${laptop.seriesLabel}` : laptop.seriesLabel}
                      </span>
                    </div>

                    <div
                      className={`mt-3 flex items-baseline justify-between gap-2 border-b pb-3.5 ${
                        isTopPick
                          ? 'border-[#0F766E]/20 dark:border-[#2DD4BF]/25'
                          : 'border-[#E4ECEB] dark:border-[#1E2E36]'
                      }`}
                    >
                      <div className="min-w-0">
                        <h3 className="font-fast-display text-lg font-bold leading-snug">
                          {laptop.name}
                        </h3>
                        <p className="mt-0.5 font-mono-tabular text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          SKU: {laptop.storeSku}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono-tabular text-lg font-bold">
                          {formatFastInr(laptop.priceInr)}
                        </div>
                        <div className="font-mono-tabular text-[11px] font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
                          {formatFastInr(perYearInr)} / yr
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-[#334155] dark:text-[#CBD5E1]">
                      {laptop.whyItFitsPlain}
                    </p>
                  </div>

                  <dl
                    className={`grid grid-cols-2 gap-x-3 gap-y-2 border-t px-5 py-4 text-xs ${
                      isTopPick
                        ? 'border-[#0F766E]/15 bg-white/80 dark:border-[#2DD4BF]/20 dark:bg-[#0E181E]/75'
                        : 'border-[#E4ECEB] bg-[#F8FBFB] dark:border-[#1E2E36] dark:bg-[#0E181E]'
                    }`}
                  >
                    <div>
                      <dt className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Processor</dt>
                      <dd className="mt-0.5 font-semibold">{laptop.processor}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Graphics</dt>
                      <dd className="mt-0.5 font-semibold">{laptop.graphics}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Memory &amp; SSD</dt>
                      <dd className="mt-0.5 font-semibold">
                        {laptop.ram} · {laptop.storage}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Battery &amp; Weight</dt>
                      <dd className="mt-0.5 font-mono-tabular font-semibold">
                        Up to {laptop.batteryHours}h · {laptop.weightKg} kg
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>

          {/* Passive Slide Dots on Mobile/Tablet */}
          <div className="mt-1.5 flex items-center justify-center gap-1.5 lg:hidden" aria-hidden="true">
            {match.storePicks.map((laptop, idx) => (
              <span
                key={laptop.id}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  advisorSlideIdx === idx
                    ? 'w-5 bg-[#0F766E] dark:bg-[#2DD4BF]'
                    : 'w-1.5 bg-[#CBD5E1] dark:bg-[#334155]'
                }`}
              />
            ))}
          </div>

          {/* 4-Year Value + Stretch Note */}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <article className="rounded-2xl border border-[#D6E2E1] bg-white p-4 shadow-[0_6px_20px_-6px_rgba(15,39,44,0.06)] dark:border-[#22333D] dark:bg-[#121D24] dark:shadow-none sm:p-5 lg:col-span-7">
              <h3 className="font-fast-display text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                4-Year Value Breakdown ({match.primaryLaptop.retailerName})
              </h3>
              <div className="mt-2.5 space-y-2 text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    This Core Ultra AI PC (1 laptop · 4 years)
                  </span>
                  <span className="font-mono-tabular font-bold text-[#0F766E] dark:text-[#2DD4BF]">
                    {formatFastInr(match.intelFourYearPerYear)} / yr
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[#475569] dark:text-[#94A3B8]">
                    Flashy budget laptop replaced in {match.genericRival.replacementMonths}
                  </span>
                  <span className="font-mono-tabular font-bold text-[#C84B39] dark:text-[#F48474]">
                    {formatFastInr(match.genericFourYearPerYear)} / yr
                  </span>
                </div>
                {match.fourYearSavingsInr > 0 && (
                  <p className="border-t border-[#E4ECEB] pt-2 text-xs font-semibold text-[#0F766E] dark:border-[#1E2E36] dark:text-[#2DD4BF]">
                    Saves roughly {formatFastInr(match.fourYearSavingsInr)} over 4 years by not buying twice.
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-[#F3CBC4] bg-[#FFF5F3] p-4 shadow-[0_6px_20px_-6px_rgba(232,106,88,0.09)] dark:border-[#4A2522] dark:bg-[#221515] dark:shadow-none sm:p-5 lg:col-span-5">
              <div className="font-fast-display text-sm font-bold text-[#C84B39] dark:text-[#F48474]">
                What You Do NOT Need to Pay Extra For
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#334155] dark:text-[#E2E8F0]">
                {match.dontNeedToPayFor}
              </p>
              {match.stretchLaptop && (
                <p className="mt-2.5 border-t border-[#F3CBC4] pt-2 text-xs text-[#334155] dark:border-[#4A2522] dark:text-[#CBD5E1]">
                  <strong className="font-bold text-[#0F766E] dark:text-[#2DD4BF]">
                    Stretch pick at {match.stretchLaptop.retailerName}:{' '}
                  </strong>
                  {match.stretchLaptop.name} ({formatFastInr(match.stretchLaptop.priceInr)})
                </p>
              )}
            </article>
          </div>

          {/* Interactive 3-Tap Store Check on the Demo Laptop — Card & Slide Format */}
          <div className="mt-6 rounded-2xl border border-[#D6E2E1] bg-white p-4 shadow-[0_6px_24px_-6px_rgba(15,39,44,0.07)] dark:border-[#22333D] dark:bg-[#121D24] dark:shadow-none sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Test the Demo Laptop Right Now</span>
                </div>
                <h3 className="font-fast-display mt-1 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] sm:text-lg">
                  30-Second In-Store Verification Check
                </h3>
              </div>
              <span className="font-mono-tabular text-xs font-bold text-[#334155] dark:text-[#CBD5E1]">
                {completedCheckCount} / {THREE_TAP_STORE_CHECK.length} checked
              </span>
            </div>

            {/* Swipeable Slide Cards on Mobile -> 3-Column Grid on Tablet/Desktop */}
            <div
              ref={verifyTrackRef}
              onScroll={() => setVerifySlideIdx(computeNearestSlideIdx(verifyTrackRef.current))}
              className="mt-3.5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-4 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0"
            >
              {THREE_TAP_STORE_CHECK.map((step) => {
                const checked = Boolean(checkedSteps[step.id]);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(8, muted);
                      setCheckedSteps((prev) => ({ ...prev, [step.id]: !prev[step.id] }));
                    }}
                    aria-pressed={checked}
                    className={`flex min-h-[124px] w-[84vw] max-w-[330px] shrink-0 snap-center flex-col justify-between rounded-xl border p-4 text-left transition-all md:w-auto md:max-w-none ${
                      checked
                        ? 'border-[1.5px] border-[#0F766E] bg-[#ECFDF8] shadow-[0_4px_14px_-4px_rgba(15,118,110,0.16)] dark:border-[#2DD4BF] dark:bg-[#12312E] dark:shadow-none'
                        : 'border-[#DCE7E6] bg-[#F8FBFB] hover:border-[#0F766E]/45 dark:border-[#22333D] dark:bg-[#0E181E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-tabular text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF]">
                          Step 0{step.stepNo}
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            checked
                              ? 'border-[#0F766E] bg-[#0F766E] text-white dark:border-[#2DD4BF] dark:bg-[#2DD4BF] dark:text-[#042F2E]'
                              : 'border-[#CBD5E1] bg-white dark:border-[#334155] dark:bg-[#121D24]'
                          }`}
                        >
                          {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </span>
                      </div>
                      <div className="font-fast-display mt-1.5 text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {step.title}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#475569] dark:text-[#94A3B8]">
                        {step.plainInstruction}
                      </p>
                    </div>
                    <p className="mt-2.5 text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF]">
                      Look for: {step.whatToLookFor}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Slide Progress Controls on Mobile */}
            <div className="mt-2 flex items-center justify-between gap-2 md:hidden">
              <div className="flex items-center">
                {THREE_TAP_STORE_CHECK.map((step, idx) => (
                  <button
                    key={step.id}
                    type="button"
                    aria-label={`Jump to verification step ${step.stepNo}`}
                    onClick={() => {
                      triggerHaptic(6, muted);
                      setVerifySlideIdx(idx);
                      scrollTrackToIdx(verifyTrackRef.current, idx);
                    }}
                    className="inline-flex min-h-[36px] min-w-[28px] items-center justify-center"
                  >
                    <span
                      className={`h-2 rounded-full transition-all duration-200 ${
                        verifySlideIdx === idx
                          ? 'w-6 bg-[#0F766E] dark:bg-[#2DD4BF]'
                          : 'w-2 bg-[#CBD5E1] dark:bg-[#334155]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="font-mono-tabular text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                Swipe steps · {verifySlideIdx + 1} / {THREE_TAP_STORE_CHECK.length}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4ECEB] pt-4 text-xs dark:border-[#1E2E36]">
              <span className="text-[#475569] dark:text-[#94A3B8]">
                Still unsure about Tally, Photoshop, or a ₹55k laptop? Ask NOVA in plain English.
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenNova()}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 font-semibold text-white shadow-[0_4px_14px_-4px_rgba(15,118,110,0.28)] transition-colors hover:bg-[#0D625B] dark:bg-[#14B8A6] dark:text-[#042F2E] dark:hover:bg-[#2DD4BF] whitespace-nowrap"
                >
                  <MessageSquareText className="h-4 w-4" />
                  <span>Ask NOVA Plain-English Questions</span>
                </button>
                <button
                  type="button"
                  onClick={onSwitchToPro}
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[#0F766E] underline underline-offset-4 hover:text-[#C84B39] dark:text-[#2DD4BF] dark:hover:text-[#F48474] whitespace-nowrap"
                >
                  <span>Want custom PC specs or the arcade game? Open Pro Builder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
