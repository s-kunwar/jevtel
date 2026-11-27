import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Gamepad2,
  MessageSquareText,
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
  onAskNova?: (prompt?: string) => void;
}

export function RetailActionSection({
  builderConfig,
  matchSource,
  questMatchedPcId,
  onLaunchArcade,
  onAskNova,
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
      className="relative overflow-hidden bg-[#FAF8F5] py-10 transition-colors duration-200 dark:bg-[#0B1120] sm:py-12 lg:py-16"
    >
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-5 md:px-10">
        {/* Header */}
        <div className="max-w-2xl">
          <h2
            className="font-editorial text-2xl font-bold leading-[1.1] tracking-tight text-[#111827] dark:text-[#F3F4F6] sm:text-3xl md:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            Your Store Floor Match &amp; Verification Checklist
          </h2>
          <HandUnderline className="mt-1.5 max-w-md" />
          <p className="mt-3 text-sm leading-relaxed text-[#4B5563] dark:text-[#9CA3AF] sm:text-base">
            Synced directly from your{' '}
            {matchSource === 'quest' ? 'quest with Byte' : 'interactive laptop setup'}. Ask for
            this exact Intel Core Ultra model and check four simple details in the store.
          </p>
        </div>

        {/* Two-Column Closer Grid */}
        <div className="mt-7 grid grid-cols-1 items-stretch gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-12">
          {/* Left Half: Auto-Synced "Your Store Floor Match" Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-4 transition-colors dark:border-[#1F2937] dark:bg-[#111827] sm:p-6 md:p-8 lg:col-span-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] pb-4 dark:border-[#1F2937]">
                <h3 className="font-editorial text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                  Your Store Floor Match
                </h3>
                <span className="font-mono-tabular text-xs font-bold text-[#059669] dark:text-[#34D399]">
                  {matchSource === 'quest'
                    ? 'Synced from RPG Quest'
                    : 'Auto-Synced from PC Builder'}
                </span>
              </div>

              {storeMatch.warningIfBargain && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3.5 text-xs leading-relaxed text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#450A0A]/55 dark:text-[#FCA5A5]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626] dark:text-[#F87171]" />
                  <span>{storeMatch.warningIfBargain}</span>
                </div>
              )}

              {/* Recommended Series 3 Tier Highlight */}
              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAF8F5] dark:border-[#334155] dark:bg-[#0F172A]">
                  <img
                    src={TINY_SWORDS_AVATARS[0]}
                    alt="Byte Warrior Seal"
                    referrerPolicy="no-referrer"
                    className="pixelated h-10 w-10 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono-tabular text-xs font-bold text-[#0068B5] dark:text-[#38BDF8]">
                    {storeMatch.badgeLabel}
                  </div>
                  <h4 className="font-editorial mt-1 text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                    {storeMatch.recommendedTier}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
                    {storeMatch.reason}
                  </p>
                </div>
              </div>

              {/* Active Workbench Configuration Summary */}
              <div className="mt-5 border-t border-[#E5E7EB] pt-4 text-xs dark:border-[#1F2937] sm:mt-6 sm:pt-5">
                <div className="hidden space-y-2 pb-2.5 sm:block">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Processor</span>
                    <span className="text-right font-semibold text-[#111827] dark:text-[#F3F4F6]">
                      {selectedCpuLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Graphics</span>
                    <span className="text-right font-semibold text-[#111827] dark:text-[#F3F4F6]">
                      {selectedGpuLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Memory</span>
                    <span className="text-right font-semibold text-[#111827] dark:text-[#F3F4F6]">
                      {selectedMemLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Storage</span>
                    <span className="text-right font-semibold text-[#111827] dark:text-[#F3F4F6]">
                      {selectedSsdLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Cooling</span>
                    <span className="text-right font-semibold text-[#111827] dark:text-[#F3F4F6]">
                      {selectedCoolLabel}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-4 sm:border-t sm:border-dashed sm:border-[#E5E7EB] sm:pt-2.5 dark:sm:border-[#334155]">
                  <span className="text-[#6B7280] dark:text-[#9CA3AF]">Target Store Spec</span>
                  <span className="text-right font-mono-tabular font-bold text-[#0068B5] dark:text-[#38BDF8]">
                    {storeMatch.specSummary}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E5E7EB] pt-4 dark:border-[#1F2937]">
              <a
                href="#pc-builder"
                className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-[#0068B5] underline-offset-4 hover:underline dark:text-[#38BDF8] whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Adjust Parts Above</span>
              </a>
              <span aria-hidden="true" className="hidden text-[#CBD5E1] dark:text-[#475569] sm:inline">
                ·
              </span>
              <button
                type="button"
                onClick={onLaunchArcade}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-[#374151] underline-offset-4 hover:text-[#0068B5] hover:underline dark:text-[#D1D5DB] dark:hover:text-[#38BDF8] whitespace-nowrap shrink-0"
              >
                <Gamepad2 className="h-3.5 w-3.5" />
                <span>Get Over Here, Byte needs you!</span>
              </button>
              {onAskNova && (
                <>
                  <span aria-hidden="true" className="hidden text-[#CBD5E1] dark:text-[#475569] sm:inline">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => onAskNova('Review my current setup and tell me if it fits my needs')}
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-[#0068B5] underline-offset-4 hover:underline dark:text-[#38BDF8] whitespace-nowrap shrink-0"
                  >
                    <MessageSquareText className="h-3.5 w-3.5" />
                    <span>Ask NOVA Advisor</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Half: Retailer Selector + 4-Item Physical Checklist + One-Click Copy */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-4 transition-colors dark:border-[#1F2937] dark:bg-[#111827] sm:p-6 md:p-8 lg:col-span-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-editorial text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                  Store Floor Checklist
                </h3>
                <span className="font-mono-tabular text-xs font-bold text-[#0068B5] dark:text-[#38BDF8]">
                  {verifiedCount}/{STORE_FLOOR_CHECKLIST.length} Verified
                </span>
              </div>

              {/* Store Selector */}
              <div
                role="tablist"
                aria-label="Retail partner store"
                className="mt-4 grid grid-cols-3 gap-1 rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] p-1 dark:border-[#334155] dark:bg-[#0F172A]"
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
                      className={`min-h-[44px] rounded-md px-2 py-2 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs whitespace-nowrap ${
                        active
                          ? 'bg-white text-[#111827] shadow-xs dark:bg-[#1E293B] dark:text-[#F3F4F6]'
                          : 'text-[#4B5563] hover:text-[#111827] dark:text-[#94A3B8] dark:hover:text-[#F3F4F6]'
                      }`}
                    >
                      {r.name}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">{retailer.floorTip}</p>

              {/* 4 Physical Checks */}
              <div className="mt-4 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB] dark:divide-[#1F2937] dark:border-[#1F2937]">
                {STORE_FLOOR_CHECKLIST.map((item) => {
                  const checked = !!checkedIds[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className="flex min-h-[52px] w-full items-start gap-3 py-3 text-left transition-colors hover:bg-[#FAF8F5] dark:hover:bg-[#0F172A]/70"
                    >
                      {checked ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#059669] dark:text-[#34D399]" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#9CA3AF] dark:text-[#64748B]" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              checked
                                ? 'text-[#059669] line-through dark:text-[#34D399]'
                                : 'text-[#111827] dark:text-[#F3F4F6]'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="font-mono-tabular text-[11px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                            {item.badgeCheck}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
                          {item.howToVerify}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* One-Click Copyable Store Ask-Card & Checklist */}
            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#FAF8F5] p-4 dark:border-[#334155] dark:bg-[#0F172A]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-[#111827] dark:text-[#F3F4F6]">
                  {retailer.name} Salesperson Ask-Card
                </div>
                <button
                  type="button"
                  onClick={handleCopyStoreCard}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#0068B5] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#005291] whitespace-nowrap shrink-0"
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
              <p className="mt-2.5 text-sm font-medium leading-relaxed text-[#1F2937] dark:text-[#E5E7EB]">
                &ldquo;{storeMatch.askScript}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
