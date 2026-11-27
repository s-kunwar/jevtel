import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Gamepad2,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { TINY_SWORDS_AVATARS } from '../game/assets';
import { RETAILERS, STORE_FLOOR_CHECKLIST, type RetailerId } from '../game/landingData';
import {
  COOLING_OPTIONS,
  GRAPHICS_OPTIONS,
  MEMORY_OPTIONS,
  PROCESSOR_OPTIONS,
  STORAGE_OPTIONS,
  solveBuilderStoreMatch,
  type PcBuilderConfig,
} from '../game/pcBuilderData';
import { HandUnderline } from './SketchDoodles';

interface RetailActionSectionProps {
  builderConfig: PcBuilderConfig;
  matchSource: 'builder' | 'quest';
  questMatchedPcId?: string;
  onLaunchArcade: () => void;
  onResetSession: () => void;
}

export function RetailActionSection({
  builderConfig,
  matchSource,
  questMatchedPcId,
  onLaunchArcade,
  onResetSession,
}: RetailActionSectionProps) {
  const [retailerId, setRetailerId] = useState<RetailerId>('croma');
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const retailer = RETAILERS.find((r) => r.id === retailerId) ?? RETAILERS[0];
  const storeMatch = solveBuilderStoreMatch(
    builderConfig,
    retailer,
    matchSource,
    questMatchedPcId
  );
  const verifiedCount = STORE_FLOOR_CHECKLIST.filter((c) => checkedIds[c.id]).length;

  const selectedCpuLabel =
    PROCESSOR_OPTIONS.find((p) => p.id === builderConfig.processor)?.label ?? '';
  const selectedGpuLabel =
    GRAPHICS_OPTIONS.find((g) => g.id === builderConfig.graphics)?.label ?? '';
  const selectedMemLabel =
    MEMORY_OPTIONS.find((m) => m.id === builderConfig.memory)?.label ?? '';
  const selectedSsdLabel =
    STORAGE_OPTIONS.find((s) => s.id === builderConfig.storage)?.label ?? '';
  const selectedCoolLabel =
    COOLING_OPTIONS.find((c) => c.id === builderConfig.cooling)?.label ?? '';

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyStoreCard = async () => {
    try {
      await navigator.clipboard.writeText(storeMatch.copyPayload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="store-guide"
      className="relative overflow-hidden bg-[#FAF8F5] pt-12 pb-10 lg:pt-16 lg:pb-14"
    >
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        {/* Header */}
        <div className="max-w-2xl">
          <h2
            className="font-editorial text-3xl font-bold leading-[1.08] tracking-tight text-[#111827] md:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            Your Store Floor Match &amp; Verification Checklist
          </h2>
          <HandUnderline className="mt-1.5 max-w-md" />
          <p className="mt-3 text-base leading-relaxed text-[#4B5563]">
            Synced directly from your{' '}
            {matchSource === 'quest' ? 'quest with Byte' : 'interactive laptop setup'}. Ask for
            this exact Intel Core Ultra model and check four simple details in the store.
          </p>
        </div>

        {/* Two-Column Closer Grid */}
        <div className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* Left Half: Auto-Synced "Your Store Floor Match" Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 lg:col-span-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] pb-4">
                <h3 className="font-editorial text-2xl font-bold text-[#111827]">
                  Your Store Floor Match
                </h3>
                <span className="font-mono-tabular text-xs font-bold text-[#059669]">
                  {matchSource === 'quest'
                    ? 'Synced from RPG Quest'
                    : 'Auto-Synced from PC Builder'}
                </span>
              </div>

              {storeMatch.warningIfBargain && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3.5 text-xs leading-relaxed text-[#991B1B]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
                  <span>{storeMatch.warningIfBargain}</span>
                </div>
              )}

              {/* Recommended Series 3 Tier Highlight */}
              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAF8F5]">
                  <img
                    src={TINY_SWORDS_AVATARS[0]}
                    alt="Byte Warrior Seal"
                    referrerPolicy="no-referrer"
                    className="pixelated h-10 w-10 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono-tabular text-xs font-bold text-[#0068B5]">
                    {storeMatch.badgeLabel}
                  </div>
                  <h4 className="font-editorial mt-1 text-2xl font-bold text-[#111827]">
                    {storeMatch.recommendedTier}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4B5563]">
                    {storeMatch.reason}
                  </p>
                </div>
              </div>

              {/* Active Workbench Configuration Summary */}
              <div className="mt-6 space-y-2 border-t border-[#E5E7EB] pt-5 text-xs">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[#6B7280]">Processor</span>
                  <span className="text-right font-semibold text-[#111827]">
                    {selectedCpuLabel}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[#6B7280]">Graphics</span>
                  <span className="text-right font-semibold text-[#111827]">
                    {selectedGpuLabel}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[#6B7280]">Memory</span>
                  <span className="text-right font-semibold text-[#111827]">
                    {selectedMemLabel}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[#6B7280]">Storage</span>
                  <span className="text-right font-semibold text-[#111827]">
                    {selectedSsdLabel}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[#6B7280]">Cooling</span>
                  <span className="text-right font-semibold text-[#111827]">
                    {selectedCoolLabel}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-dashed border-[#E5E7EB] pt-2.5">
                  <span className="text-[#6B7280]">Target Store Spec</span>
                  <span className="text-right font-mono-tabular font-bold text-[#0068B5]">
                    {storeMatch.specSummary}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#E5E7EB] pt-4">
              <a
                href="#pc-builder"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0068B5] underline-offset-4 hover:underline whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Adjust Parts Above</span>
              </a>
              <span aria-hidden="true" className="text-[#CBD5E1]">
                ·
              </span>
              <button
                type="button"
                onClick={onLaunchArcade}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374151] underline-offset-4 hover:text-[#0068B5] hover:underline whitespace-nowrap shrink-0"
              >
                <Gamepad2 className="h-3.5 w-3.5" />
                <span>Get Over Here, Byte needs you!</span>
              </button>
            </div>
          </div>

          {/* Right Half: Retailer Selector + 4-Item Physical Checklist + One-Click Copy */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 lg:col-span-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-editorial text-2xl font-bold text-[#111827]">
                  Store Floor Checklist
                </h3>
                <span className="font-mono-tabular text-xs font-bold text-[#0068B5]">
                  {verifiedCount}/{STORE_FLOOR_CHECKLIST.length} Verified
                </span>
              </div>

              {/* Store Selector */}
              <div
                role="tablist"
                aria-label="Retail partner store"
                className="mt-4 grid grid-cols-3 gap-1 rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] p-1"
              >
                {RETAILERS.map((r) => {
                  const active = r.id === retailerId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setRetailerId(r.id)}
                      className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-white text-[#111827] shadow-xs'
                          : 'text-[#4B5563] hover:text-[#111827]'
                      }`}
                    >
                      {r.name}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#4B5563]">{retailer.floorTip}</p>

              {/* 4 Physical Checks */}
              <div className="mt-4 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
                {STORE_FLOOR_CHECKLIST.map((item) => {
                  const checked = !!checkedIds[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className="flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-[#FAF8F5]"
                    >
                      {checked ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#059669]" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#9CA3AF]" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              checked ? 'text-[#059669] line-through' : 'text-[#111827]'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="font-mono-tabular text-[11px] font-medium text-[#6B7280]">
                            {item.badgeCheck}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#4B5563]">
                          {item.howToVerify}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* One-Click Copyable Store Ask-Card & Checklist */}
            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#FAF8F5] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-[#111827]">
                  {retailer.name} Salesperson Ask-Card
                </div>
                <button
                  type="button"
                  onClick={handleCopyStoreCard}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0068B5] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#005291] whitespace-nowrap shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Checklist Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Store Checklist</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2.5 text-sm font-medium leading-relaxed text-[#1F2937]">
                &ldquo;{storeMatch.askScript}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Quiet Footer + Kiosk Reset Safeguard */}
        <footer className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#E5E7EB] pt-6 text-xs text-[#6B7280] sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#111827]">Jevtel</span>
            <span aria-hidden="true">·</span>
            <span>Croma · Reliance Digital · Vijay Sales Store Guide</span>
          </div>

          <button
            type="button"
            onClick={onResetSession}
            className="inline-flex items-center gap-1.5 font-medium text-[#4B5563] transition-colors hover:text-[#111827] whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Session</span>
          </button>
        </footer>
      </div>
    </section>
  );
}
