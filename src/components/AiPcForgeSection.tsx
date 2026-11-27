import { useState, type ReactNode } from 'react';
import {
  BatteryCharging,
  BatteryWarning,
  CheckCircle2,
  Cpu,
  Fan,
  Flame,
  Gauge,
  HardDrive,
  MemoryStick,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Wind,
  Zap,
} from 'lucide-react';
import { EDITORIAL_ART_URLS } from '../game/assets';
import {
  COOLING_OPTIONS,
  GRAPHICS_OPTIONS,
  MEMORY_OPTIONS,
  PROCESSOR_OPTIONS,
  STORAGE_OPTIONS,
  WORKLOAD_SCENARIOS,
  resolveCutawayArtKey,
  simulatePcBenchmark,
  type CutawayArtKey,
  type PartArtKey,
  type PcBuilderConfig,
  type WorkloadScenarioId,
} from '../game/pcBuilderData';
import { HandUnderline } from './SketchDoodles';

interface AiPcForgeSectionProps {
  config: PcBuilderConfig;
  onChangeConfig: (next: PcBuilderConfig) => void;
  scenario: WorkloadScenarioId;
  onChangeScenario: (next: WorkloadScenarioId) => void;
  xessEnabled: boolean;
  onToggleXess: () => void;
}

type SlotCategoryKey = 'processor' | 'graphics' | 'memory' | 'storage' | 'cooling';

interface LeaderAnchors {
  topLeft: [number, number];
  topRight: [number, number];
  bottomLeft: [number, number];
  bottomRight: [number, number];
  heatOrigin: [number, number];
  airflowStart: [number, number];
  airflowEnd: [number, number];
  fanCenter: [number, number];
}

const CUTAWAY_ANCHORS: Record<CutawayArtKey, LeaderAnchors> = {
  bargainTrap: {
    topLeft: [356, 330],
    topRight: [466, 256],
    bottomLeft: [288, 386],
    bottomRight: [538, 344],
    heatOrigin: [356, 320],
    airflowStart: [466, 256],
    airflowEnd: [520, 210],
    fanCenter: [466, 256],
  },
  ultra5Ultrabook: {
    topLeft: [362, 224],
    topRight: [604, 214],
    bottomLeft: [294, 424],
    bottomRight: [556, 290],
    heatOrigin: [362, 224],
    airflowStart: [362, 224],
    airflowEnd: [604, 214],
    fanCenter: [604, 214],
  },
  ultra7Arc: {
    topLeft: [392, 240],
    topRight: [552, 294],
    bottomLeft: [292, 416],
    bottomRight: [542, 392],
    heatOrigin: [392, 240],
    airflowStart: [392, 240],
    airflowEnd: [542, 392],
    fanCenter: [542, 392],
  },
  ultraX9Pro: {
    topLeft: [324, 266],
    topRight: [518, 194],
    bottomLeft: [404, 316],
    bottomRight: [540, 376],
    heatOrigin: [404, 316],
    airflowStart: [232, 326],
    airflowEnd: [518, 194],
    fanCenter: [518, 194],
  },
  rtx4060Dual: {
    topLeft: [382, 226],
    topRight: [468, 272],
    bottomLeft: [288, 306],
    bottomRight: [442, 358],
    heatOrigin: [468, 272],
    airflowStart: [262, 188],
    airflowEnd: [615, 312],
    fanCenter: [615, 312],
  },
};

const SLOT_TABS: { key: SlotCategoryKey; label: string }[] = [
  { key: 'processor', label: 'Processor' },
  { key: 'graphics', label: 'Graphics' },
  { key: 'memory', label: 'Memory' },
  { key: 'storage', label: 'Storage' },
  { key: 'cooling', label: 'Cooling' },
];

function PartArtThumb({
  artKey,
  alt,
  fallbackIcon,
  sizeClass = 'h-12 w-12',
  isWarning = false,
}: {
  artKey?: PartArtKey;
  alt: string;
  fallbackIcon: ReactNode;
  sizeClass?: string;
  isWarning?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = artKey ? EDITORIAL_ART_URLS[artKey] : undefined;

  if (!src || imgFailed) {
    return (
      <div
        className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-lg border ${
          isWarning
            ? 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]'
            : 'border-[#E5E7EB] bg-[#FAF8F5] text-[#4B5563]'
        }`}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-lg border border-[#111827]/15 bg-[#FAF8F5]`}
    >
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function AiPcForgeSection({
  config,
  onChangeConfig,
  scenario,
  onChangeScenario,
  xessEnabled,
  onToggleXess,
}: AiPcForgeSectionProps) {
  const [activeSlot, setActiveSlot] = useState<SlotCategoryKey>('processor');
  const [xrayImgError, setXrayImgError] = useState(false);

  const benchmark = simulatePcBenchmark(config, scenario, xessEnabled);
  const cutawayKey = resolveCutawayArtKey(config);
  const anchors = CUTAWAY_ANCHORS[cutawayKey];

  const isBargainCpu = config.processor === 'bargain_0';
  const isThrottled = benchmark.thermalState === 'throttled';
  const isWarm = benchmark.thermalState === 'warm';

  const activeScenarioMeta =
    WORKLOAD_SCENARIOS.find((s) => s.id === scenario) ?? WORKLOAD_SCENARIOS[0];

  const thermalStatusColor = isThrottled
    ? 'text-[#DC2626]'
    : isWarm
      ? 'text-[#B45309]'
      : 'text-[#059669]';

  const thermalBadgeBg = isThrottled
    ? 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]'
    : isWarm
      ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'
      : 'border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]';

  const selectedCpu =
    PROCESSOR_OPTIONS.find((o) => o.id === config.processor) ?? PROCESSOR_OPTIONS[2];
  const selectedGpu =
    GRAPHICS_OPTIONS.find((o) => o.id === config.graphics) ?? GRAPHICS_OPTIONS[1];
  const selectedMem =
    MEMORY_OPTIONS.find((o) => o.id === config.memory) ?? MEMORY_OPTIONS[2];
  const selectedSsd =
    STORAGE_OPTIONS.find((o) => o.id === config.storage) ?? STORAGE_OPTIONS[1];
  const selectedCool =
    COOLING_OPTIONS.find((o) => o.id === config.cooling) ?? COOLING_OPTIONS[1];

  const cutawayImages: { key: CutawayArtKey; src: string; alt: string }[] = [
    {
      key: 'bargainTrap',
      src: EDITORIAL_ART_URLS.xrayBargainTrap,
      alt: 'Pen-and-ink cutaway of a budget laptop showing one overheated chip and a small battery.',
    },
    {
      key: 'ultra5Ultrabook',
      src: EDITORIAL_ART_URLS.xrayCoreUltra5,
      alt: 'Pen-and-ink cutaway of an Intel Core Ultra 5 laptop with cool copper heatpipe and large all-day battery.',
    },
    {
      key: 'ultra7Arc',
      src: EDITORIAL_ART_URLS.xrayCoreUltra,
      alt: 'Pen-and-ink cutaway of an Intel Core Ultra Series 3 laptop with CPU, Arc graphics, and built-in AI tiles.',
    },
    {
      key: 'ultraX9Pro',
      src: EDITORIAL_ART_URLS.xrayCoreUltraX9,
      alt: 'Pen-and-ink cutaway of an Intel Core Ultra X9 laptop with full copper vapor chamber and twin fans.',
    },
    {
      key: 'rtx4060Dual',
      src: EDITORIAL_ART_URLS.xrayRtx4060,
      alt: 'Pen-and-ink cutaway of a laptop pairing an Intel Core Ultra processor with a dedicated GeForce RTX 4060 graphics chip and dual cooling fans.',
    },
  ];

  const pinStroke = isThrottled ? '#DC2626' : '#0068B5';

  // Active secondary spotlight artwork reflecting the active customization tab
  const activeTabSpotlight =
    activeSlot === 'graphics'
      ? {
          slotTitle: 'Active Graphics',
          label: selectedGpu.label,
          tierHint: selectedGpu.tierHint,
          artKey: selectedGpu.artKey,
          icon: <MonitorPlay className="h-5 w-5" />,
        }
      : activeSlot === 'memory'
        ? {
            slotTitle: 'Active Memory',
            label: selectedMem.label,
            tierHint: selectedMem.tierHint,
            artKey: selectedMem.artKey,
            icon: <MemoryStick className="h-5 w-5" />,
          }
        : activeSlot === 'storage'
          ? {
              slotTitle: 'Active Storage',
              label: selectedSsd.label,
              tierHint: selectedSsd.tierHint,
              artKey: selectedSsd.artKey,
              icon: <HardDrive className="h-5 w-5" />,
            }
          : activeSlot === 'cooling'
            ? {
                slotTitle: 'Active Cooling',
                label: selectedCool.label,
                tierHint: selectedCool.tierHint,
                artKey: selectedCool.artKey,
                icon: <Wind className="h-5 w-5" />,
              }
            : {
                slotTitle: selectedGpu.artKey ? 'Active Graphics' : 'Active Cooling',
                label: selectedGpu.artKey ? selectedGpu.label : selectedCool.label,
                tierHint: selectedGpu.artKey ? selectedGpu.tierHint : selectedCool.tierHint,
                artKey: selectedGpu.artKey ?? selectedCool.artKey,
                icon: selectedGpu.artKey ? (
                  <MonitorPlay className="h-5 w-5" />
                ) : (
                  <Wind className="h-5 w-5" />
                ),
              };

  return (
    <section
      id="pc-builder"
      className="relative overflow-hidden border-y border-[#E5E7EB] bg-[#FAF8F5] py-12 lg:py-16"
    >
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        {/* Section Header + Quick Build Presets */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h2
              className="font-editorial text-3xl font-bold leading-[1.08] tracking-tight text-[#111827] md:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              PC Builder &amp; Live Real-World Stress Tests
            </h2>
            <HandUnderline className="mt-1.5 max-w-sm" />
            <p className="mt-3 text-base leading-relaxed text-[#4B5563]">
              Customize five real laptop parts on the left, inspect the live internal layout on the
              right, and run six daily tests right below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-end">
            <button
              type="button"
              onClick={() =>
                onChangeConfig({
                  processor: 'bargain_0',
                  graphics: 'basic_igpu',
                  memory: 'ram_8gb',
                  storage: 'ssd_512gb',
                  cooling: 'slim_single',
                })
              }
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                config.processor === 'bargain_0'
                  ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#DC2626] hover:text-[#DC2626]'
              }`}
            >
              Test Budget Laptop
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeConfig({
                  processor: 'ultra5_225h',
                  graphics: 'basic_igpu',
                  memory: 'ram_16gb',
                  storage: 'ssd_512gb',
                  cooling: 'dual_vapor',
                })
              }
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                config.processor === 'ultra5_225h' && config.graphics === 'basic_igpu'
                  ? 'border-[#0068B5] bg-[#EFF6FF] text-[#0068B5]'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#0068B5] hover:text-[#0068B5]'
              }`}
            >
              Student Ultrabook
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeConfig({
                  processor: 'ultra7_355',
                  graphics: 'arc_b390_xess',
                  memory: 'ram_32gb',
                  storage: 'ssd_1tb',
                  cooling: 'dual_vapor',
                })
              }
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                config.processor === 'ultra7_355' && config.graphics === 'arc_b390_xess'
                  ? 'border-[#0068B5] bg-[#EFF6FF] text-[#0068B5]'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#0068B5] hover:text-[#0068B5]'
              }`}
            >
              Core Ultra 7 All-Rounder
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeConfig({
                  processor: 'ultra_x9_388h',
                  graphics: 'rtx_4060',
                  memory: 'ram_32gb',
                  storage: 'ssd_2tb',
                  cooling: 'pro_airflow',
                })
              }
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                config.processor === 'ultra_x9_388h' && config.graphics === 'rtx_4060'
                  ? 'border-[#059669] bg-[#ECFDF5] text-[#059669]'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#059669] hover:text-[#059669]'
              }`}
            >
              Creator RTX Rig
            </button>
          </div>
        </div>

        {/* ROW 1: 5-Slot Hardware Selector (5 cols) + Large Featured Cutaway Stage (7 cols) */}
        <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* LEFT PANEL: 5 Real-World Hardware Slots */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="font-editorial text-lg font-bold text-[#111827]">
                  Customize Laptop Parts
                </h3>
                <span className="font-mono-tabular text-[11px] font-semibold text-[#6B7280]">
                  5 Hardware Slots
                </span>
              </div>

              {/* Clean Segmented Slot Switcher */}
              <div
                role="tablist"
                aria-label="Hardware customization slots"
                className="mt-4 grid grid-cols-5 gap-1 rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] p-1"
              >
                {SLOT_TABS.map((tab) => {
                  const active = activeSlot === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveSlot(tab.key)}
                      className={`rounded-md px-1.5 py-2 text-[11px] font-bold transition-colors whitespace-nowrap truncate ${
                        active
                          ? 'bg-white text-[#0068B5] shadow-xs'
                          : 'text-[#4B5563] hover:text-[#111827]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Slot Choices with Custom Pen-and-Ink Artwork */}
              <div className="mt-4 space-y-2.5">
                {activeSlot === 'processor' &&
                  PROCESSOR_OPTIONS.map((opt) => {
                    const active = config.processor === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeConfig({ ...config, processor: opt.id })}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          active
                            ? opt.isBargain
                              ? 'border-[#DC2626] bg-[#FEF2F2] ring-1 ring-[#DC2626]/25'
                              : 'border-[#0068B5] bg-[#EFF6FF] ring-1 ring-[#0068B5]/25'
                            : 'border-[#E5E7EB] bg-[#FAF8F5] hover:border-[#9CA3AF]'
                        }`}
                      >
                        <PartArtThumb
                          artKey={opt.artKey}
                          alt={`Pen-and-ink illustration for ${opt.label}`}
                          fallbackIcon={<Cpu className="h-5 w-5" />}
                          isWarning={opt.isBargain}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-xs font-bold text-[#111827]">
                              {opt.label}
                            </span>
                            <span
                              className={`font-mono-tabular text-[10px] font-bold shrink-0 ${
                                active
                                  ? opt.isBargain
                                    ? 'text-[#DC2626]'
                                    : 'text-[#0068B5]'
                                  : 'text-[#6B7280]'
                              }`}
                            >
                              {opt.tierHint}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#4B5563]">{opt.shortTag}</div>
                        </div>
                      </button>
                    );
                  })}

                {activeSlot === 'graphics' &&
                  GRAPHICS_OPTIONS.map((opt) => {
                    const active = config.graphics === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeConfig({ ...config, graphics: opt.id })}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          active
                            ? opt.isBargain
                              ? 'border-[#D97706] bg-[#FFFBEB] ring-1 ring-[#D97706]/25'
                              : 'border-[#0068B5] bg-[#EFF6FF] ring-1 ring-[#0068B5]/25'
                            : 'border-[#E5E7EB] bg-[#FAF8F5] hover:border-[#9CA3AF]'
                        }`}
                      >
                        <PartArtThumb
                          artKey={opt.artKey}
                          alt={`Pen-and-ink illustration for ${opt.label}`}
                          fallbackIcon={<MonitorPlay className="h-5 w-5" />}
                          isWarning={opt.isBargain}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-xs font-bold text-[#111827]">
                              {opt.label}
                            </span>
                            <span
                              className={`font-mono-tabular text-[10px] font-bold shrink-0 ${
                                active
                                  ? opt.isBargain
                                    ? 'text-[#B45309]'
                                    : 'text-[#0068B5]'
                                  : 'text-[#6B7280]'
                              }`}
                            >
                              {opt.tierHint}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#4B5563]">{opt.shortTag}</div>
                        </div>
                      </button>
                    );
                  })}

                {activeSlot === 'memory' &&
                  MEMORY_OPTIONS.map((opt) => {
                    const active = config.memory === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeConfig({ ...config, memory: opt.id })}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          active
                            ? opt.isBargain
                              ? 'border-[#D97706] bg-[#FFFBEB] ring-1 ring-[#D97706]/25'
                              : 'border-[#059669] bg-[#ECFDF5] ring-1 ring-[#059669]/25'
                            : 'border-[#E5E7EB] bg-[#FAF8F5] hover:border-[#9CA3AF]'
                        }`}
                      >
                        <PartArtThumb
                          artKey={opt.artKey}
                          alt={`Pen-and-ink illustration for ${opt.label}`}
                          fallbackIcon={<MemoryStick className="h-5 w-5" />}
                          isWarning={opt.isBargain}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-xs font-bold text-[#111827]">
                              {opt.label}
                            </span>
                            <span
                              className={`font-mono-tabular text-[10px] font-bold shrink-0 ${
                                active
                                  ? opt.isBargain
                                    ? 'text-[#B45309]'
                                    : 'text-[#059669]'
                                  : 'text-[#6B7280]'
                              }`}
                            >
                              {opt.tierHint}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#4B5563]">{opt.shortTag}</div>
                        </div>
                      </button>
                    );
                  })}

                {activeSlot === 'storage' &&
                  STORAGE_OPTIONS.map((opt) => {
                    const active = config.storage === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeConfig({ ...config, storage: opt.id })}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          active
                            ? 'border-[#0068B5] bg-[#EFF6FF] ring-1 ring-[#0068B5]/25'
                            : 'border-[#E5E7EB] bg-[#FAF8F5] hover:border-[#9CA3AF]'
                        }`}
                      >
                        <PartArtThumb
                          artKey={opt.artKey}
                          alt={`Pen-and-ink illustration for ${opt.label}`}
                          fallbackIcon={<HardDrive className="h-5 w-5" />}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-xs font-bold text-[#111827]">
                              {opt.label}
                            </span>
                            <span
                              className={`font-mono-tabular text-[10px] font-bold shrink-0 ${
                                active ? 'text-[#0068B5]' : 'text-[#6B7280]'
                              }`}
                            >
                              {opt.tierHint}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#4B5563]">{opt.shortTag}</div>
                        </div>
                      </button>
                    );
                  })}

                {activeSlot === 'cooling' &&
                  COOLING_OPTIONS.map((opt) => {
                    const active = config.cooling === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeConfig({ ...config, cooling: opt.id })}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          active
                            ? opt.isBargain
                              ? 'border-[#D97706] bg-[#FFFBEB] ring-1 ring-[#D97706]/25'
                              : 'border-[#059669] bg-[#ECFDF5] ring-1 ring-[#059669]/25'
                            : 'border-[#E5E7EB] bg-[#FAF8F5] hover:border-[#9CA3AF]'
                        }`}
                      >
                        <PartArtThumb
                          artKey={opt.artKey}
                          alt={`Pen-and-ink illustration for ${opt.label}`}
                          fallbackIcon={<Wind className="h-5 w-5" />}
                          isWarning={opt.isBargain}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-xs font-bold text-[#111827]">
                              {opt.label}
                            </span>
                            <span
                              className={`font-mono-tabular text-[10px] font-bold shrink-0 ${
                                active
                                  ? opt.isBargain
                                    ? 'text-[#B45309]'
                                    : 'text-[#059669]'
                                  : 'text-[#6B7280]'
                              }`}
                            >
                              {opt.tierHint}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#4B5563]">{opt.shortTag}</div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Interactive 5-Slot Build Manifest (click any row to edit that slot) */}
            <div className="mt-5 border-t border-[#E5E7EB] pt-4">
              <div className="mb-2 text-[11px] font-bold text-[#6B7280]">
                Active Build (click any row to swap)
              </div>
              <div className="divide-y divide-[#E5E7EB] text-xs">
                <button
                  type="button"
                  onClick={() => setActiveSlot('processor')}
                  className="flex w-full items-center justify-between gap-3 py-1.5 text-left hover:text-[#0068B5]"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#6B7280]">
                    <Cpu className="h-3.5 w-3.5 text-[#0068B5]" />
                    <span>Processor</span>
                  </span>
                  <span className="truncate font-semibold text-[#111827]">{selectedCpu.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlot('graphics')}
                  className="flex w-full items-center justify-between gap-3 py-1.5 text-left hover:text-[#0068B5]"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#6B7280]">
                    <MonitorPlay className="h-3.5 w-3.5 text-[#0068B5]" />
                    <span>Graphics</span>
                  </span>
                  <span className="truncate font-semibold text-[#111827]">{selectedGpu.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlot('memory')}
                  className="flex w-full items-center justify-between gap-3 py-1.5 text-left hover:text-[#0068B5]"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#6B7280]">
                    <MemoryStick className="h-3.5 w-3.5 text-[#0068B5]" />
                    <span>Memory</span>
                  </span>
                  <span className="truncate font-semibold text-[#111827]">{selectedMem.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlot('storage')}
                  className="flex w-full items-center justify-between gap-3 py-1.5 text-left hover:text-[#0068B5]"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#6B7280]">
                    <HardDrive className="h-3.5 w-3.5 text-[#0068B5]" />
                    <span>Storage</span>
                  </span>
                  <span className="truncate font-semibold text-[#111827]">{selectedSsd.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlot('cooling')}
                  className="flex w-full items-center justify-between gap-3 py-1.5 text-left hover:text-[#0068B5]"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#6B7280]">
                    <Wind className="h-3.5 w-3.5 text-[#0068B5]" />
                    <span>Cooling</span>
                  </span>
                  <span className="truncate font-semibold text-[#111827]">{selectedCool.label}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT STAGE: Large Featured Laptop Cutaway (7 cols) with Leader-Line Corner Pins */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#111827]">
                  Inside Your Custom Laptop
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono-tabular text-xs font-semibold text-[#4B5563]">
                  {benchmark.airflowLabel}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 font-mono-tabular text-xs font-bold whitespace-nowrap shrink-0 ${thermalBadgeBg}`}
                >
                  {isThrottled ? (
                    <Flame className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>{benchmark.chassisTempC}°C</span>
                </span>
              </div>
            </div>

            {/* Wide Cutaway Stage */}
            <div className="relative mt-4 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAF8F5] aspect-[4/3]">
              {!xrayImgError ? (
                cutawayImages.map((imgItem) => (
                  <img
                    key={imgItem.key}
                    src={imgItem.src}
                    alt={imgItem.alt}
                    referrerPolicy="no-referrer"
                    onError={() => setXrayImgError(true)}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                      cutawayKey === imgItem.key ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center">
                  <Cpu className="h-12 w-12 text-[#0068B5]" />
                  <span className="font-editorial text-xl font-bold text-[#111827]">
                    {selectedCpu.label} · {selectedGpu.label}
                  </span>
                </div>
              )}

              {/* Subtle Thermal Shimmer Backdrop on Hot Builds */}
              {isThrottled && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_52%,rgba(220,38,38,0.16),transparent_58%)]"
                />
              )}

              {/* Precision Thin Leader Lines + Airflow Streams (No Center Rectangles) */}
              <svg
                aria-hidden="true"
                viewBox="0 0 800 600"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                {/* Animated Airflow / Heat Waves */}
                {isThrottled ? (
                  <>
                    <path
                      d={`M${anchors.heatOrigin[0] - 18} ${anchors.heatOrigin[1]} Q${anchors.heatOrigin[0] - 2} ${anchors.heatOrigin[1] - 45} ${anchors.heatOrigin[0] - 14} ${anchors.heatOrigin[1] - 90}`}
                      fill="none"
                      stroke="#DC2626"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      className="animate-heat-ripple"
                    />
                    <path
                      d={`M${anchors.heatOrigin[0] + 18} ${anchors.heatOrigin[1] - 6} Q${anchors.heatOrigin[0] + 32} ${anchors.heatOrigin[1] - 54} ${anchors.heatOrigin[0] + 16} ${anchors.heatOrigin[1] - 96}`}
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      className="animate-heat-ripple"
                      style={{ animationDelay: '0.45s' }}
                    />
                  </>
                ) : (
                  <>
                    <path
                      d={`M${anchors.airflowStart[0]} ${anchors.airflowStart[1]} Q${(anchors.airflowStart[0] + anchors.airflowEnd[0]) / 2} ${Math.min(anchors.airflowStart[1], anchors.airflowEnd[1]) - 36} ${anchors.airflowEnd[0]} ${anchors.airflowEnd[1]}`}
                      fill="none"
                      stroke="#0068B5"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      opacity="0.72"
                      className="animate-pulse-route"
                    />
                    <circle
                      cx={anchors.fanCenter[0]}
                      cy={anchors.fanCenter[1]}
                      r="26"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="1.6"
                      strokeDasharray="6 6"
                      opacity="0.65"
                    />
                  </>
                )}

                {/* Thin Hairline Leader Lines to 4 Corner Pins */}
                <line
                  x1="138"
                  y1="38"
                  x2={anchors.topLeft[0]}
                  y2={anchors.topLeft[1]}
                  stroke={pinStroke}
                  strokeWidth="1.25"
                  strokeOpacity="0.65"
                />
                <circle
                  cx={anchors.topLeft[0]}
                  cy={anchors.topLeft[1]}
                  r="4"
                  fill="#FFFFFF"
                  stroke={pinStroke}
                  strokeWidth="2"
                />

                <line
                  x1="662"
                  y1="38"
                  x2={anchors.topRight[0]}
                  y2={anchors.topRight[1]}
                  stroke={pinStroke}
                  strokeWidth="1.25"
                  strokeOpacity="0.65"
                />
                <circle
                  cx={anchors.topRight[0]}
                  cy={anchors.topRight[1]}
                  r="4"
                  fill="#FFFFFF"
                  stroke={pinStroke}
                  strokeWidth="2"
                />

                <line
                  x1="138"
                  y1="562"
                  x2={anchors.bottomLeft[0]}
                  y2={anchors.bottomLeft[1]}
                  stroke="#059669"
                  strokeWidth="1.25"
                  strokeOpacity="0.65"
                />
                <circle
                  cx={anchors.bottomLeft[0]}
                  cy={anchors.bottomLeft[1]}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#059669"
                  strokeWidth="2"
                />

                <line
                  x1="662"
                  y1="562"
                  x2={anchors.bottomRight[0]}
                  y2={anchors.bottomRight[1]}
                  stroke={pinStroke}
                  strokeWidth="1.25"
                  strokeOpacity="0.65"
                />
                <circle
                  cx={anchors.bottomRight[0]}
                  cy={anchors.bottomRight[1]}
                  r="4"
                  fill="#FFFFFF"
                  stroke={pinStroke}
                  strokeWidth="2"
                />
              </svg>

              {/* 4 Clean Corner Callout Pins (Edge-Anchored, Never Covering Center Hardware) */}
              <div className="pointer-events-none absolute top-3 left-3 max-w-[44%] rounded-md border border-[#111827]/20 bg-[#FAF8F5]/92 px-2.5 py-1.5 backdrop-blur-xs">
                <div className="font-mono-tabular text-[10px] font-bold text-[#6B7280]">
                  Main Processor
                </div>
                <div className="truncate text-[11px] font-bold text-[#111827]">
                  {isBargainCpu ? 'Budget (Hot)' : selectedCpu.label.replace('Intel ', '')}
                </div>
              </div>

              <div className="pointer-events-none absolute top-3 right-3 max-w-[44%] rounded-md border border-[#111827]/20 bg-[#FAF8F5]/92 px-2.5 py-1.5 text-right backdrop-blur-xs">
                <div className="font-mono-tabular text-[10px] font-bold text-[#6B7280]">
                  Graphics + AI
                </div>
                <div className="truncate text-[11px] font-bold text-[#111827]">
                  {config.graphics === 'rtx_4060'
                    ? 'RTX 4060'
                    : config.graphics === 'arc_b390_xess'
                      ? 'Intel Arc B390'
                      : 'Basic Graphics'}
                  {' · '}
                  {benchmark.activeTiles.npu ? 'AI On' : 'No AI'}
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-3 left-3 max-w-[44%] rounded-md border border-[#111827]/20 bg-[#FAF8F5]/92 px-2.5 py-1.5 backdrop-blur-xs">
                <div className="font-mono-tabular text-[10px] font-bold text-[#6B7280]">
                  4-Hr Battery
                </div>
                <div
                  className={`font-mono-tabular text-[11px] font-bold ${
                    benchmark.batteryAfter4HrPct < 35 ? 'text-[#DC2626]' : 'text-[#059669]'
                  }`}
                >
                  {benchmark.batteryAfter4HrPct}% Left
                </div>
              </div>

              <div className="pointer-events-none absolute right-3 bottom-3 max-w-[44%] rounded-md border border-[#111827]/20 bg-[#FAF8F5]/92 px-2.5 py-1.5 text-right backdrop-blur-xs">
                <div className="font-mono-tabular text-[10px] font-bold text-[#6B7280]">
                  Memory &amp; Cooling
                </div>
                <div className="truncate text-[11px] font-bold text-[#111827]">
                  {selectedMem.label.replace(' Dual-Channel Memory', '').replace(' High-Speed Memory', '').replace(' Memory', '')}
                  {' · '}
                  {benchmark.fanLabel}
                </div>
              </div>
            </div>

            {/* Cutaway Spotlight Badges: Active Processor Crest + Active Customization Art */}
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAF8F5] px-3 py-2">
                <PartArtThumb
                  artKey={selectedCpu.artKey}
                  alt={`Pen-and-ink crest for ${selectedCpu.label}`}
                  fallbackIcon={<Cpu className="h-5 w-5" />}
                  sizeClass="h-12 w-12"
                  isWarning={selectedCpu.isBargain}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6B7280]">
                    <span>Processor Crest</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular font-bold text-[#0068B5]">
                      {selectedCpu.tierHint}
                    </span>
                  </div>
                  <div className="truncate text-xs font-bold text-[#111827]">
                    {selectedCpu.label}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAF8F5] px-3 py-2">
                <PartArtThumb
                  artKey={activeTabSpotlight.artKey}
                  alt={`Pen-and-ink illustration for ${activeTabSpotlight.label}`}
                  fallbackIcon={activeTabSpotlight.icon}
                  sizeClass="h-12 w-12"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6B7280]">
                    <span>{activeTabSpotlight.slotTitle}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular font-bold text-[#059669]">
                      {activeTabSpotlight.tierHint}
                    </span>
                  </div>
                  <div className="truncate text-xs font-bold text-[#111827]">
                    {activeTabSpotlight.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Telemetry Bar Directly Below Cutaway */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E7EB] pt-3.5 text-xs">
              <div className="flex items-center gap-2">
                <Fan
                  className={`h-4 w-4 shrink-0 ${
                    isThrottled
                      ? 'animate-fan-shake text-[#DC2626]'
                      : 'animate-fan-spin text-[#0068B5]'
                  }`}
                />
                <span className="font-semibold text-[#111827]">{benchmark.fanLabel}</span>
                <span className="font-mono-tabular text-[#6B7280]">({benchmark.fanSpeedPct}% speed)</span>
              </div>

              <div className="flex items-center gap-2">
                {benchmark.batteryAfter4HrPct <= 35 ? (
                  <BatteryWarning className="h-4 w-4 text-[#DC2626]" />
                ) : (
                  <BatteryCharging className="h-4 w-4 text-[#059669]" />
                )}
                <span className="font-semibold text-[#374151]">
                  4-Hour Battery Remaining:{' '}
                  <span
                    className={`font-mono-tabular font-bold ${
                      benchmark.batteryAfter4HrPct <= 35 ? 'text-[#DC2626]' : 'text-[#059669]'
                    }`}
                  >
                    {benchmark.batteryAfter4HrPct}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Full-Width Real-World Workload Tests (Left) & Animated Benchmarks (Right) */}
        <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#111827]">
                Real-World Workload Stress Tests
              </h3>
              <p className="mt-0.5 text-xs text-[#4B5563]">
                {activeScenarioMeta.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Intel XeSS Boost Switch */}
              <div className="flex items-center gap-2.5 rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] px-3 py-1.5">
                <span className="text-xs font-bold text-[#111827]">Intel XeSS Frame Boost</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={xessEnabled}
                  onClick={onToggleXess}
                  className={`rounded-md border px-2.5 py-1 font-mono-tabular text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                    xessEnabled
                      ? 'border-[#0068B5] bg-[#0068B5] text-white'
                      : 'border-[#CBD5E1] bg-white text-[#4B5563]'
                  }`}
                >
                  {xessEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <span className={`font-mono-tabular text-xs font-bold ${thermalStatusColor}`}>
                {benchmark.thermalLabel}
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Half: 6 Everyday Test Buttons + Live Hardware Diagnosis */}
            <div className="flex flex-col justify-between gap-4 lg:col-span-6">
              <div
                role="tablist"
                aria-label="Real-world laptop stress tests"
                className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
              >
                {WORKLOAD_SCENARIOS.map((item) => {
                  const active = item.id === scenario;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => onChangeScenario(item.id)}
                      className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
                        active
                          ? 'border-[#111827] bg-[#111827] text-white'
                          : 'border-[#E5E7EB] bg-[#FAF8F5] text-[#1F2937] hover:border-[#111827]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold leading-snug">{item.label}</span>
                        <Zap
                          className={`h-3.5 w-3.5 shrink-0 ${
                            active ? 'text-[#38BDF8]' : 'text-[#9CA3AF]'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Verdict Box */}
              <div
                className={`rounded-xl border p-4 text-xs leading-relaxed ${
                  isThrottled
                    ? 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
                    : isWarm
                      ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
                      : 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]'
                }`}
              >
                <span className="font-bold">Live Hardware Diagnosis: </span>
                {benchmark.energyRouteNote}
              </div>
            </div>

            {/* Right Half: 5 Animated Metric Bars + Fan/Thermal Readout */}
            <div className="space-y-3.5 lg:col-span-6">
              {/* Bar 1: Offline AI Speed */}
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#374151]">
                    <Sparkles className="h-3.5 w-3.5 text-[#0068B5]" />
                    <span>Offline AI Speed</span>
                  </span>
                  <span
                    className={`font-mono-tabular font-bold ${
                      benchmark.tokensPerSec < 15 ? 'text-[#DC2626]' : 'text-[#0068B5]'
                    }`}
                  >
                    {benchmark.tokensPerSec} answers/sec
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      benchmark.tokensPerSec < 15 ? 'bg-[#DC2626]' : 'bg-[#0068B5]'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((benchmark.tokensPerSec / benchmark.tokensMax) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bar 2: Gaming & App Smoothness */}
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#374151]">
                    <Gauge className="h-3.5 w-3.5 text-[#0068B5]" />
                    <span>Gaming &amp; Motion Smoothness</span>
                  </span>
                  <span
                    className={`font-mono-tabular font-bold ${
                      benchmark.fps < 35
                        ? 'text-[#DC2626]'
                        : benchmark.fps >= 85
                          ? 'text-[#059669]'
                          : 'text-[#0068B5]'
                    }`}
                  >
                    {benchmark.fps} FPS
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      benchmark.fps < 35
                        ? 'bg-[#DC2626]'
                        : benchmark.fps >= 85
                          ? 'bg-[#059669]'
                          : 'bg-[#0068B5]'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((benchmark.fps / benchmark.fpsMax) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bar 3: Battery Left After 4 Hours */}
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#374151]">
                    <BatteryCharging className="h-3.5 w-3.5 text-[#059669]" />
                    <span>Battery Left (After 4 Hours)</span>
                  </span>
                  <span
                    className={`font-mono-tabular font-bold ${
                      benchmark.batteryAfter4HrPct < 35 ? 'text-[#DC2626]' : 'text-[#059669]'
                    }`}
                  >
                    {benchmark.batteryAfter4HrPct}%
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      benchmark.batteryAfter4HrPct < 35 ? 'bg-[#DC2626]' : 'bg-[#059669]'
                    }`}
                    style={{ width: `${benchmark.batteryAfter4HrPct}%` }}
                  />
                </div>
              </div>

              {/* Bar 4: App & File Load Speed (SSD + Memory) */}
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#374151]">
                    <HardDrive className="h-3.5 w-3.5 text-[#0068B5]" />
                    <span>App &amp; File Load Speed</span>
                  </span>
                  <span className="font-mono-tabular font-bold text-[#0068B5]">
                    {benchmark.storageSpeedLabel} ({benchmark.storageSpeedPct}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full bg-[#0068B5] transition-all duration-300"
                    style={{ width: `${benchmark.storageSpeedPct}%` }}
                  />
                </div>
              </div>

              {/* Bar 5: Cooling & Windows Compatibility */}
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                <div className="rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] px-3 py-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#4B5563]">
                    <span>Cooling Effort</span>
                    <span className={`font-mono-tabular font-bold ${thermalStatusColor}`}>
                      {benchmark.fanSpeedPct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isThrottled ? 'bg-[#DC2626]' : isWarm ? 'bg-[#D97706]' : 'bg-[#059669]'
                      }`}
                      style={{ width: `${benchmark.fanSpeedPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] px-3 py-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#374151]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
                    <span>Windows Apps</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono-tabular font-bold text-[#059669]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{benchmark.x86CompatibilityPct}% Native</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
