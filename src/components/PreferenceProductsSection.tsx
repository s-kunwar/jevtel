import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic } from '../game/haptics';
import { EDITORIAL_ART_URLS } from '../game/assets';
import {
  COOLING_OPTIONS,
  GRAPHICS_OPTIONS,
  MEMORY_OPTIONS,
  PROCESSOR_OPTIONS,
  STORAGE_OPTIONS,
  WORKLOAD_SCENARIOS,
  type PcBuilderConfig,
  type WorkloadScenarioId,
} from '../game/pcBuilderData';
import {
  CATALOG_RETAILERS,
  formatInrPrice,
  rankCatalogByPreferences,
  type CatalogRetailerId,
  type ProductArtKey,
} from '../game/retailCatalogData';
import { HandUnderline } from './SketchDoodles';

interface PreferenceProductsSectionProps {
  builderConfig: PcBuilderConfig;
  scenario: WorkloadScenarioId;
  matchSource: 'builder' | 'quest';
  questMatchedPcId?: string;
  onApplyProductToBuilder: (next: PcBuilderConfig) => void;
}

function ProductEditorialArt({
  artKey,
  alt,
}: {
  artKey: ProductArtKey;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = EDITORIAL_ART_URLS[artKey];

  if (failed || !src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#FAF8F5] p-6 text-center text-xs font-semibold text-[#6B7280] dark:bg-[#18181B] dark:text-[#94A3B8]">
        {alt}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] dark:brightness-95 dark:contrast-105"
    />
  );
}

export function PreferenceProductsSection({
  builderConfig,
  scenario,
  matchSource,
  questMatchedPcId,
  onApplyProductToBuilder,
}: PreferenceProductsSectionProps) {
  const [retailerFilter, setRetailerFilter] = useState<CatalogRetailerId>('all');
  const [copiedSkuId, setCopiedSkuId] = useState<string | null>(null);
  const [loadedProductId, setLoadedProductId] = useState<string | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const rankedItems = rankCatalogByPreferences(
    builderConfig,
    scenario,
    retailerFilter,
    questMatchedPcId
  );

  useEffect(() => {
    setActiveSlideIdx(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [retailerFilter, builderConfig.processor, builderConfig.graphics]);

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el || rankedItems.length === 0) return;
    const cardWidth = Math.max(1, el.clientWidth * 0.86);
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveSlideIdx(Math.max(0, Math.min(rankedItems.length - 1, idx)));
  };

  const scrollToSlide = (idx: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(rankedItems.length - 1, idx));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
    setActiveSlideIdx(clamped);
    triggerHaptic(6);
  };

  const cpuLabel =
    PROCESSOR_OPTIONS.find((p) => p.id === builderConfig.processor)?.label ?? 'Core Ultra';
  const gpuLabel =
    GRAPHICS_OPTIONS.find((g) => g.id === builderConfig.graphics)?.label ?? 'Arc Graphics';
  const ramLabel =
    MEMORY_OPTIONS.find((m) => m.id === builderConfig.memory)?.label ?? '16GB';
  const ssdLabel =
    STORAGE_OPTIONS.find((s) => s.id === builderConfig.storage)?.label ?? '1TB';
  const coolLabel =
    COOLING_OPTIONS.find((c) => c.id === builderConfig.cooling)?.label ?? 'Vapor Cooling';
  const scenarioLabel =
    WORKLOAD_SCENARIOS.find((s) => s.id === scenario)?.shortLabel ?? 'Daily AI';

  const handleCopySku = async (productId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSkuId(productId);
      window.setTimeout(() => {
        setCopiedSkuId((curr) => (curr === productId ? null : curr));
      }, 2200);
    } catch {
      setCopiedSkuId(null);
    }
  };

  const handleLoadIntoBuilder = (productId: string, config: PcBuilderConfig) => {
    onApplyProductToBuilder(config);
    setLoadedProductId(productId);
    window.setTimeout(() => {
      setLoadedProductId((curr) => (curr === productId ? null : curr));
    }, 2000);
  };

  return (
    <section
      id="recommended-products"
      className="relative overflow-hidden border-t border-[#E5E7EB] bg-[#FAF8F5] py-10 transition-colors duration-200 dark:border-[#1F2937] dark:bg-[#0B1120] sm:py-12 lg:py-16"
    >
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-5 md:px-10">
        {/* Section Header + Retailer Filter Tabs */}
        <div className="flex flex-col justify-between gap-4 sm:gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h2
              className="font-editorial text-2xl font-bold leading-[1.1] tracking-tight text-[#111827] dark:text-[#F3F4F6] sm:text-3xl md:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              Laptops Matched to Your Exact Preferences
            </h2>
            <HandUnderline className="mt-1.5 max-w-md" />
            <p className="mt-3 text-sm leading-relaxed text-[#4B5563] dark:text-[#9CA3AF] sm:text-base">
              Ranked live from your{' '}
              {matchSource === 'quest' ? 'adventure with Byte' : 'PC Builder configuration'} across
              Amazon India, Croma, Vijay Sales, and Reliance Digital.
            </p>
          </div>

          {/* Segmented Retailer Filter Tabs (Horizontal Scroll Strip on Phones) */}
          <div
            role="tablist"
            aria-label="Filter laptops by retailer"
            className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white p-1 dark:border-[#1F2937] dark:bg-[#111827] md:inline-flex md:flex-wrap"
          >
            {CATALOG_RETAILERS.map((retailer) => {
              const active = retailer.id === retailerFilter;
              return (
                <button
                  key={retailer.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    triggerHaptic(8);
                    setRetailerFilter(retailer.id);
                  }}
                  className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 md:min-h-[34px] ${
                    active
                      ? 'bg-[#0068B5] text-white'
                      : 'text-[#4B5563] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6]'
                  }`}
                >
                  {retailer.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Requirement Criteria Strip (Clean Monospace Architectural Row, hidden on compact phones) */}
        <div className="mt-5 hidden flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs dark:border-[#1F2937] dark:bg-[#111827] sm:mt-6 sm:flex sm:gap-3 sm:px-4 sm:py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#374151] dark:text-[#D1D5DB] sm:gap-x-4 sm:gap-y-1.5">
            <span className="font-mono-tabular font-bold text-[#0068B5] dark:text-[#38BDF8]">
              Active Spec Filter:
            </span>
            <span>{cpuLabel.replace(' (Series 3)', '')}</span>
            <span aria-hidden="true" className="text-[#CBD5E1] dark:text-[#334155]">
              ·
            </span>
            <span>{gpuLabel.replace(' Laptop GPU', '').replace(' (with XeSS)', '')}</span>
            <span aria-hidden="true" className="text-[#CBD5E1] dark:text-[#334155]">
              ·
            </span>
            <span>
              {ramLabel.replace(' Dual-Channel Memory', '').replace(' High-Speed Memory', '')}
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1] dark:text-[#334155]">
              ·
            </span>
            <span>{ssdLabel}</span>
            <span aria-hidden="true" className="hidden text-[#CBD5E1] dark:text-[#334155] sm:inline">
              ·
            </span>
            <span className="hidden sm:inline">{coolLabel}</span>
            <span aria-hidden="true" className="text-[#CBD5E1] dark:text-[#334155]">
              ·
            </span>
            <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">
              Focus: {scenarioLabel}
            </span>
          </div>

          <a
            href="#pc-builder"
            className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold text-[#0068B5] hover:underline dark:text-[#38BDF8] whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Change Specs</span>
          </a>
        </div>

        {/* Mobile Swipe Header Hint */}
        <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] md:hidden">
          <span>Swipe cards ({activeSlideIdx + 1} of {rankedItems.length})</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlideIdx - 1)}
              disabled={activeSlideIdx <= 0}
              aria-label="Previous laptop"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111827] disabled:opacity-35 dark:border-[#334155] dark:bg-[#111827] dark:text-[#F3F4F6]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlideIdx + 1)}
              disabled={activeSlideIdx >= rankedItems.length - 1}
              aria-label="Next laptop"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111827] disabled:opacity-35 dark:border-[#334155] dark:bg-[#111827] dark:text-[#F3F4F6]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Snap Carousel on Phones -> Editorial Multi-Column Grid on Tablet/Desktop */}
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:mt-8 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-3"
        >
          {rankedItems.map(({ product, matchPct, isTopMatch, matchReasons }) => {
            const copied = copiedSkuId === product.id;
            const loaded = loadedProductId === product.id;

            return (
              <article
                key={product.id}
                className="group flex w-[86vw] max-w-[360px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#111827]/35 hover:shadow-md dark:border-[#1F2937] dark:bg-[#111827] dark:hover:border-[#38BDF8]/50 md:w-auto md:max-w-none md:shrink"
              >
                {/* 4:3 Bespoke Pen-and-Ink Hardware Illustration Frame */}
                <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[#E5E7EB] bg-[#FAF8F5] dark:border-[#1F2937] dark:bg-[#18181B]">
                  <ProductEditorialArt
                    artKey={product.artKey}
                    alt={`Architectural pen-and-ink studio illustration of ${product.brand} ${product.name}`}
                  />

                  {/* Maximum 1 subtle text status tag */}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono-tabular text-[11px] font-bold ${
                        isTopMatch
                          ? 'border-[#0068B5] bg-[#0068B5] text-white'
                          : 'border-[#111827]/15 bg-[#FAF8F5]/95 text-[#111827] dark:border-[#334155] dark:bg-[#0F172A]/95 dark:text-[#E2E8F0]'
                      }`}
                    >
                      {isTopMatch && <Sparkles className="h-3 w-3" />}
                      <span>
                        {isTopMatch ? `Best Match · ${matchPct}%` : `${matchPct}% Spec Fit`}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Clean Metadata Block */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    {/* Brand + Retailer Line (Muted 12px uppercase) */}
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold tracking-wide text-[#6B7280] uppercase dark:text-[#9CA3AF]">
                      <span>
                        {product.brand} · {product.retailerName}
                      </span>
                      <span className="font-mono-tabular text-[11px] normal-case text-[#059669] dark:text-[#34D399]">
                        {product.availability.split(' · ')[0]}
                      </span>
                    </div>

                    {/* Product Name + Tabular INR Price */}
                    <div className="mt-1.5 flex items-baseline justify-between gap-3">
                      <h3 className="font-editorial text-base font-semibold leading-snug text-[#111827] dark:text-[#F3F4F6]">
                        {product.name}
                      </h3>
                      <span className="font-mono-tabular text-[15px] font-bold text-[#111827] dark:text-[#F3F4F6] shrink-0">
                        {formatInrPrice(product.priceInr)}
                      </span>
                    </div>

                    {/* Why It Matches Your Preferences */}
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF] sm:line-clamp-none">
                      {matchReasons.join(' · ')}
                    </p>

                    {/* Clean Key Specs Grid */}
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#E5E7EB] pt-3.5 text-xs dark:border-[#1F2937]">
                      <div>
                        <dt className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Processor</dt>
                        <dd className="truncate font-semibold text-[#111827] dark:text-[#E5E7EB]">
                          {product.processorLabel}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Graphics</dt>
                        <dd className="truncate font-semibold text-[#111827] dark:text-[#E5E7EB]">
                          {product.graphicsLabel}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                          Memory &amp; SSD
                        </dt>
                        <dd className="truncate font-mono-tabular font-semibold text-[#111827] dark:text-[#E5E7EB]">
                          {product.ramLabel.split(' ')[0]} · {product.storageLabel.replace(' NVMe SSD', '')}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                          Battery &amp; Weight
                        </dt>
                        <dd className="truncate font-mono-tabular font-semibold text-[#111827] dark:text-[#E5E7EB]">
                          {product.batteryHours}h · {product.weightKg} kg
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Contiguous Action Row (>= 44px touch hitboxes) */}
                  <div className="mt-5 flex items-center gap-2 border-t border-[#E5E7EB] pt-4 dark:border-[#1F2937]">
                    <a
                      href={product.storeSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0068B5] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#005291] md:min-h-[36px] whitespace-nowrap"
                    >
                      <span>View at {product.retailerName}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        handleLoadIntoBuilder(product.id, { ...product.builderMatch });
                      }}
                      title="Load these exact laptop parts into the PC Builder above"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#111827] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#E5E7EB] dark:hover:border-[#38BDF8] dark:hover:text-[#38BDF8] md:min-h-[36px] md:px-2.5 whitespace-nowrap shrink-0"
                    >
                      {loaded ? 'Synced' : 'Test Build'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        handleCopySku(
                          product.id,
                          `${product.brand} ${product.name} (${product.retailerName} SKU: ${product.storeSku}) — ${product.processorLabel}, ${product.ramLabel}, ${product.storageLabel} @ ${formatInrPrice(product.priceInr)}`
                        );
                      }}
                      aria-label={`Copy ${product.brand} ${product.name} store SKU`}
                      title={`Copy Store SKU (${product.storeSku})`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] text-[#4B5563] transition-colors hover:border-[#111827] hover:text-[#111827] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#9CA3AF] dark:hover:border-[#38BDF8] dark:hover:text-[#F3F4F6] md:h-9 md:w-9 shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-[#059669] dark:text-[#34D399]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile Carousel Pagination Dots */}
        {rankedItems.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
            {rankedItems.map(({ product }, idx) => (
              <button
                key={product.id}
                type="button"
                aria-label={`View matched laptop ${idx + 1}`}
                onClick={() => scrollToSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === activeSlideIdx
                    ? 'w-7 bg-[#0068B5] dark:bg-[#38BDF8]'
                    : 'w-2.5 bg-[#CBD5E1] dark:bg-[#334155]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
