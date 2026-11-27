import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { THREE_PILLARS } from '../game/landingData';
import {
  BatteryLanternDoodle,
  ChipSketchDoodle,
  HandUnderline,
  SketchSectionDivider,
  SwordShieldDoodle,
} from './SketchDoodles';

export function ThreePillarsStrip() {
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});

  return (
    <section
      id="three-pillars"
      className="relative overflow-hidden border-y-2 border-dashed border-[#CBD5E1] bg-[#F8F9FA]/90 py-16 lg:py-24"
    >
      {/* Margin sketchbook doodles filling outer gutter whitespace */}
      <BatteryLanternDoodle className="animate-doodle-drift absolute top-24 right-6 hidden h-24 w-24 opacity-60 xl:block" />
      <ChipSketchDoodle className="animate-doodle-drift absolute top-1/2 left-5 hidden h-20 w-20 opacity-55 xl:block" />
      <SwordShieldDoodle className="animate-doodle-drift absolute bottom-20 right-8 hidden h-20 w-24 opacity-60 xl:block" />

      <div className="relative mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="font-hand-display text-2xl font-bold tracking-wide text-[#0068B5]">
              Three Pillars of Intel Core Ultra
            </div>
            <h2
              className="font-editorial mt-1 text-3xl font-bold leading-[1.06] text-[#111827] md:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              Built for how you actually work, study, and game all day.
            </h2>
            <HandUnderline className="mt-1.5 max-w-sm" />
            <p className="mt-4 text-base leading-relaxed text-[#374151] md:text-lg">
              An Intel AI PC splits tasks across dedicated compute engines instead of forcing one
              overworked processor to do everything at once.
            </p>
          </div>

          <div className="hidden items-center gap-3 rounded-xl border border-dashed border-[#94A3B8] bg-white/80 px-4 py-3 lg:flex">
            <ChipSketchDoodle className="h-14 w-14 shrink-0" />
            <div className="text-sm leading-snug text-[#374151]">
              <span className="font-hand-display block text-2xl font-bold leading-none text-[#0068B5]">
                3 Dedicated Engines
              </span>
              <span className="mt-1 block">CPU + GPU + NPU working together</span>
            </div>
          </div>
        </div>

        {/* Alternating Editorial Rows */}
        <div className="mt-14 space-y-14 lg:mt-16 lg:space-y-20">
          {THREE_PILLARS.map((pillar, idx) => {
            const artOnLeft = idx % 2 === 1;
            const hasErr = !!failedIds[pillar.id];

            return (
              <div key={pillar.id}>
                <article className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                  {/* Text Column */}
                  <div className={`lg:col-span-6 ${artOnLeft ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#4B5563]">
                      <span className="font-mono-tabular font-bold text-[#0068B5]">
                        {pillar.index}.
                      </span>
                      <span>{pillar.title}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pillar.metricTag}</span>
                    </div>

                    <h3
                      className="font-editorial mt-2 text-3xl font-bold leading-tight text-[#111827] md:text-4xl"
                      style={{ textWrap: 'balance' }}
                    >
                      {pillar.headline}
                    </h3>

                    <p className="mt-3 max-w-[54ch] text-base leading-relaxed text-[#374151] md:text-lg">
                      {pillar.description}
                    </p>

                    {/* Tabular Spec Footnotes (unboxed, clean hairline separation) */}
                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-dashed border-[#CBD5E1] pt-4 font-mono-tabular text-xs font-semibold text-[#111827]">
                      {pillar.proofFootnotes.map((note, noteIdx) => (
                        <span key={note} className="inline-flex items-center gap-3">
                          <span>{note}</span>
                          {noteIdx < pillar.proofFootnotes.length - 1 && (
                            <span aria-hidden="true" className="text-[#9CA3AF]">
                              ·
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Seamless Paper-Matched Artwork Plate with sketchbook ink border */}
                  <div className={`lg:col-span-6 ${artOnLeft ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="overflow-hidden rounded-2xl border-2 border-[#111827] bg-[#FAF8F5] shadow-[5px_5px_0px_#CBD5E1]">
                      {!hasErr ? (
                        <img
                          src={pillar.imageUrl}
                          alt={pillar.imageAlt}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedIds((prev) => ({ ...prev, [pillar.id]: true }))
                          }
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-[#FAF8F5] p-8 text-center">
                          <Cpu className="h-10 w-10 text-[#0068B5]" />
                          <span className="font-editorial text-2xl font-bold text-[#111827]">
                            {pillar.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>

                {idx < THREE_PILLARS.length - 1 && (
                  <div className="mt-12 lg:mt-16">
                    <SketchSectionDivider />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
