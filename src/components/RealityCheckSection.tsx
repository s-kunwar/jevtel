import { useState } from 'react';
import {
  REALITY_MATRIX,
  REALITY_WORKLOADS,
  TIMELINE_MONTHS,
  type RealityWorkload,
  type TimelineMonth,
} from '../game/landingData';
import { BatteryLanternDoodle, HandUnderline } from './SketchDoodles';

export function RealityCheckSection() {
  const [month, setMonth] = useState<TimelineMonth>('m12');
  const [workload, setWorkload] = useState<RealityWorkload>('college');

  const snapshot = REALITY_MATRIX[workload][month];
  const activeMonthMeta = TIMELINE_MONTHS.find((m) => m.id === month) ?? TIMELINE_MONTHS[2];

  return (
    <section id="reality-check" className="relative overflow-hidden bg-[#FAF8F5] py-16 lg:py-24">
      <BatteryLanternDoodle className="animate-doodle-drift absolute top-14 left-5 hidden h-20 w-20 opacity-55 xl:block" />

      <div className="relative mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="font-hand-display text-2xl font-bold tracking-wide text-[#0068B5]">
              The 1-Year Reality Check
            </div>
            <h2
              className="font-editorial mt-1 text-3xl font-bold leading-[1.06] text-[#111827] md:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              Flashy Budget Thin-and-Light vs. Intel Core Ultra AI PC
            </h2>
            <HandUnderline className="mt-1.5 max-w-md" />
            <p className="mt-4 text-base leading-relaxed text-[#374151] md:text-lg">
              Almost any laptop looks fast in a 5-minute showroom browse. Toggle the timeline and
              workload below to see how architecture holds up across your first year.
            </p>
          </div>

          {/* Interactive Timeline Selector */}
          <div
            role="group"
            aria-label="Ownership timeline"
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border-2 border-[#111827] bg-white p-1.5 shadow-[3px_3px_0px_#CBD5E1] self-start"
          >
            {TIMELINE_MONTHS.map((item) => {
              const active = item.id === month;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMonth(item.id)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#0068B5] text-white'
                      : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Workload Selector Tabs */}
        <div
          role="tablist"
          aria-label="Daily workload type"
          className="mt-8 flex flex-wrap items-center gap-2.5"
        >
          {REALITY_WORKLOADS.map((w) => {
            const active = w.id === workload;
            return (
              <button
                key={w.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setWorkload(w.id)}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-[#111827] bg-[#111827] text-white shadow-[2px_2px_0px_#0068B5]'
                    : 'border-[#CBD5E1] bg-white text-[#374151] hover:border-[#111827] hover:text-[#111827]'
                }`}
              >
                {w.label}
              </button>
            );
          })}
        </div>

        {/* Comparison Plate */}
        <div className="mt-6 overflow-hidden rounded-2xl border-2 border-[#111827] bg-white shadow-[5px_5px_0px_#CBD5E1]">
          {/* Verdict Summary Strip */}
          <div className="flex flex-col justify-between gap-2 border-b-2 border-dashed border-[#CBD5E1] bg-[#F8F9FA] px-6 py-4 md:flex-row md:items-center">
            <div className="font-mono-tabular text-xs font-bold text-[#0068B5]">
              {activeMonthMeta.label} · {activeMonthMeta.sub}
            </div>
            <p className="text-base font-bold text-[#111827]">{snapshot.summaryVerdict}</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#E5E7EB]">
            {/* Column Headers */}
            <div className="hidden grid-cols-12 gap-4 px-6 py-3.5 text-sm font-bold text-[#6B7280] md:grid">
              <div className="col-span-4">Real-World Test</div>
              <div className="col-span-4">Flashy Budget Thin-and-Light</div>
              <div className="col-span-4 text-[#0068B5]">Intel Core Ultra AI PC</div>
            </div>

            {snapshot.rows.map((row) => {
              const bargainTone =
                row.bargainStatus === 'THROTTLED'
                  ? 'text-[#B45309]'
                  : row.bargainStatus === 'WARN'
                    ? 'text-[#92400E]'
                    : 'text-[#4B5563]';

              return (
                <div
                  key={row.dimension}
                  className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-12 md:items-center"
                >
                  <div className="md:col-span-4">
                    <div className="text-sm font-semibold text-[#111827]">{row.dimension}</div>
                  </div>

                  {/* Competitor Budget Baseline */}
                  <div className="md:col-span-4">
                    <div className="text-[11px] font-medium text-[#6B7280] md:hidden">
                      Flashy Budget Thin-and-Light
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-2 md:mt-0 md:justify-start md:gap-3">
                      <span className="font-mono-tabular text-sm font-medium text-[#374151]">
                        {row.bargainValue}
                      </span>
                      <span className={`font-mono-tabular text-[11px] font-bold ${bargainTone}`}>
                        [{row.bargainStatus}]
                      </span>
                    </div>
                  </div>

                  {/* Intel Core Ultra AI PC */}
                  <div className="md:col-span-4">
                    <div className="text-[11px] font-medium text-[#0068B5] md:hidden">
                      Intel Core Ultra AI PC
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-2 md:mt-0 md:justify-start md:gap-3">
                      <span className="font-mono-tabular text-sm font-semibold text-[#111827]">
                        {row.intelValue}
                      </span>
                      <span className="font-mono-tabular text-[11px] font-bold text-[#047857]">
                        [{row.intelStatus}]
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
