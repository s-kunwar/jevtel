import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, MessageSquareText, Shield } from 'lucide-react';
import { INTEL_HARDWARE_URLS, TINY_SWORDS_AVATARS, TINY_SWORDS_UI } from '../game/assets';
import { computeRecommendation, EXPO_PC_CATALOG, STORE_STATIONS } from '../game/storyData';
import type { PlayerProfile } from '../game/types';

interface VictorySummaryProps {
  profile: PlayerProfile;
  overridePcId?: string;
  taggedPcIds?: string[];
  isGameOver: boolean;
  onCloseModal?: () => void;
  onPlayAgain: () => void;
  onSendToLandingChecklist?: (profile: PlayerProfile, matchedPcId: string) => void;
  onAskNovaFromQuest?: (profile: PlayerProfile, matchedPcId: string) => void;
}

export function VictorySummary({
  profile,
  overridePcId,
  taggedPcIds = [],
  isGameOver,
  onCloseModal,
  onPlayAgain,
  onSendToLandingChecklist,
  onAskNovaFromQuest,
}: VictorySummaryProps) {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [heroErr, setHeroErr] = useState(false);

  const rec = computeRecommendation(profile, overridePcId);
  const matchedPc = EXPO_PC_CATALOG.find((p) => p.id === rec.matchedPcId) ?? EXPO_PC_CATALOG[0];
  const heroAvatarUrl = TINY_SWORDS_AVATARS[Math.max(0, Math.min(24, matchedPc.avatarIdx - 1))];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' || (isGameOver && e.code === 'Enter')) {
        e.preventDefault();
        onPlayAgain();
      } else if (!isGameOver && onCloseModal && (e.code === 'Escape' || e.code === 'KeyC')) {
        e.preventDefault();
        onCloseModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isGameOver, onCloseModal, onPlayAgain]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isGameOver) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#070D1A]/85 p-3 sm:p-6">
        <div className="ts-wood-panel max-h-[88dvh] w-full max-w-md overflow-y-auto text-center">
          <div className="mb-2 flex justify-center">
            <div className="ts-ribbon ts-ribbon-Red font-display text-xs font-bold sm:text-sm">
              SYSTEM INTERRUPTED
            </div>
          </div>

          <div className="ts-paper-panel">
            <h2 className="font-display text-xl font-bold text-[#2B1B12] sm:text-2xl md:text-3xl">
              2:45 AM · Battery Exhausted
            </h2>
            <p className="mt-3 text-xs font-medium leading-relaxed text-[#3E271A] sm:hidden">
              Burnout overwhelmed Byte before dawn—use Guard Dash through red slams and NPU Surge to shatter the hollow RGB shield!
            </p>
            <p className="mt-3 hidden text-sm font-medium leading-relaxed text-[#3E271A] sm:block">
              Burnout overwhelmed Byte before dawn—use{' '}
              <kbd className="rounded bg-[#3e2618] px-1.5 py-0.5 font-mono-tabular text-[#BAE6FD]">Space</kbd>{' '}
              to Guard Dash through red slams and{' '}
              <kbd className="rounded bg-[#3e2618] px-1.5 py-0.5 font-mono-tabular text-[#FDE68A]">P</kbd>{' '}
              to shatter the hollow RGB shield!
            </p>
            <button
              type="button"
              onClick={onPlayAgain}
              className="ts-btn-blue mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 font-display text-sm font-bold text-white whitespace-nowrap shrink-0"
            >
              <img src={TINY_SWORDS_UI.icons.sword} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
              <span>Retry Mission</span>
              <span className="hidden sm:inline">[R / Enter]</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stations = [STORE_STATIONS.A, STORE_STATIONS.B, STORE_STATIONS.C];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#070D1A]/85 p-2.5 sm:p-4 md:p-6">
      <div className="ts-wood-panel max-h-[88dvh] w-full max-w-6xl overflow-y-auto">
        {/* Header */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="ts-ribbon ts-ribbon-Yellow font-display text-xs font-bold sm:text-sm">
              INTEL AI PC · STORE GUIDE
            </div>
            <span className="font-mono-tabular text-xs font-bold text-[#FEF3C7]">
              {taggedPcIds.length > 0 ? `${taggedPcIds.length} Pick(s) Saved` : 'Personalized Match'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onAskNovaFromQuest && (
              <button
                type="button"
                onClick={() => onAskNovaFromQuest(profile, matchedPc.id)}
                className="ts-btn-blue inline-flex min-h-[44px] items-center gap-1.5 font-display text-xs font-bold text-white sm:min-h-0 sm:gap-2 whitespace-nowrap shrink-0"
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                <span>Ask NOVA</span>
              </button>
            )}
            {onSendToLandingChecklist && (
              <button
                type="button"
                onClick={() => onSendToLandingChecklist(profile, matchedPc.id)}
                className="ts-btn-blue inline-flex min-h-[44px] items-center gap-1.5 font-display text-xs font-bold text-white sm:min-h-0 sm:gap-2 whitespace-nowrap shrink-0"
              >
                <img src={TINY_SWORDS_UI.icons.gold} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                <span className="sm:hidden">Take to Checklist</span>
                <span className="hidden sm:inline">Take Match to Store Checklist</span>
              </button>
            )}
            {onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="ts-btn-blue inline-flex min-h-[44px] items-center gap-1.5 font-display text-xs font-bold text-white sm:min-h-0 sm:gap-2 whitespace-nowrap shrink-0"
              >
                <img src={TINY_SWORDS_UI.icons.back} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                <span>Back to Park</span>
                <span className="hidden sm:inline">[Esc / C]</span>
              </button>
            )}
            <button
              type="button"
              onClick={onPlayAgain}
              className="ts-btn-red inline-flex min-h-[44px] items-center gap-1.5 font-display text-xs font-bold text-white sm:min-h-0 sm:gap-2 whitespace-nowrap shrink-0"
            >
              <img src={TINY_SWORDS_UI.icons.sword} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
              <span>Play Again</span>
              <span className="hidden sm:inline">[R]</span>
            </button>
          </div>
        </div>

        <div className="ts-paper-panel">
          <h1 className="mb-4 font-display text-xl font-bold text-[#2B1B12] sm:text-2xl" style={{ textWrap: 'balance' }}>
            Your Ideal Intel Core Ultra Match &amp; Demo Checklist
          </h1>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            {/* Left Column: Match Card */}
            <div className="rounded border-2 border-[#a88a5d] bg-[#dfd0ac] p-3.5 sm:p-4 lg:col-span-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="ts-special-panel flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden sm:h-20 sm:w-20">
                  {!heroErr ? (
                    <img
                      src={heroAvatarUrl}
                      alt={rec.tierName}
                      referrerPolicy="no-referrer"
                      onError={() => setHeroErr(true)}
                      className="pixelated h-full w-full object-contain"
                    />
                  ) : (
                    <Shield className="h-9 w-9 text-sky-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#00559B]">{rec.archetypeTitle}</div>
                  <h2 className="mt-0.5 font-display text-lg font-bold text-[#2B1B12] sm:text-2xl">{rec.tierName}</h2>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-[#3E271A] sm:text-sm">{rec.tagline}</p>
                </div>

                <div className="hidden shrink-0 items-center gap-1.5 rounded border border-[#b89a6d] bg-[#eee0be] p-1.5 sm:flex">
                  <img src={INTEL_HARDWARE_URLS.aiPc} alt="Intel AI PC" referrerPolicy="no-referrer" className="pixelated h-14 w-14 object-contain" />
                  <img src={INTEL_HARDWARE_URLS.chip} alt="Core Ultra Chip" referrerPolicy="no-referrer" className="pixelated h-10 w-10 object-contain" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-y-2 border-[#b89a6d] py-3 text-center sm:gap-3">
                <div>
                  <div className="font-mono-tabular text-lg font-bold text-[#047857] sm:text-xl">
                    {Math.round(profile.batteryRemaining)}%
                  </div>
                  <div className="text-[10px] font-bold text-[#5C3A21] sm:text-[11px]">Battery Saved</div>
                </div>
                <div>
                  <div className="font-mono-tabular text-lg font-bold text-[#00559B] sm:text-xl">
                    {profile.tasksRescued}/{profile.totalTasks}
                  </div>
                  <div className="text-[10px] font-bold text-[#5C3A21] sm:text-[11px]">Tasks Rescued</div>
                </div>
                <div>
                  <div className="font-mono-tabular text-lg font-bold text-[#9A3412] sm:text-xl">
                    {profile.npuUses + profile.xessUses}
                  </div>
                  <div className="text-[10px] font-bold text-[#5C3A21] sm:text-[11px]">AI Surges Used</div>
                </div>
              </div>

              <p className="mt-3 text-xs font-semibold leading-relaxed text-[#3E271A]">{rec.matchReason}</p>

              <div className="mt-3 space-y-2.5">
                {rec.highlights.map((item) => (
                  <div key={item.label} className="rounded border border-[#b89a6d] bg-[#eee0be] px-3.5 py-2.5">
                    <div className="flex items-center gap-2 font-display text-xs font-bold text-[#2B1B12] sm:text-sm">
                      <img src={TINY_SWORDS_UI.icons.shield} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-[#4E3422]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Demo Station Locator + Store Checklist */}
            <div className="flex flex-col gap-4 lg:col-span-6">
              <div className="rounded border-2 border-[#a88a5d] bg-[#dfd0ac] p-3.5 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-[#2B1B12]">Demo Station Locator</h3>
                  <span className="text-xs font-bold text-[#5C3A21]">Jevtel</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {stations.map((st) => {
                    const isMatch = st.id === rec.station.id;
                    return (
                      <div
                        key={st.id}
                        className={`rounded border-2 p-3 ${
                          isMatch
                            ? 'border-[#00559B] bg-[#eef7fc]'
                            : 'border-[#b89a6d] bg-[#e9d9b8] opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-display font-bold ${isMatch ? 'text-[#00559B]' : 'text-[#5C3A21]'}`}>
                            Station {st.id}
                          </span>
                          {isMatch && (
                            <span className="font-mono-tabular text-[10px] font-bold text-[#9A3412]">MATCH</span>
                          )}
                        </div>
                        <div className="mt-1 font-display text-xs font-bold text-[#2B1B12]">
                          {st.name.replace(`Station ${st.id} · `, '')}
                        </div>
                        <div className="mt-1 text-[11px] font-medium leading-snug text-[#4E3422]">
                          {st.positionLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 rounded border-2 border-[#a88a5d] bg-[#dfd0ac] p-3.5 sm:p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-[#2B1B12]">Instant Store Checklist</h3>
                  <span className="font-mono-tabular text-xs font-bold text-[#00559B]">
                    {Object.values(checkedIds).filter(Boolean).length}/{rec.checklist.length} Tested
                  </span>
                </div>
                <p className="mb-3 text-xs font-medium text-[#4E3422]">
                  Walk over to <strong className="text-[#2B1B12]">{rec.station.name}</strong> and verify these 4 points:
                </p>

                <div className="space-y-2">
                  {rec.checklist.map((item) => {
                    const checked = !!checkedIds[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCheck(item.id)}
                        className={`flex min-h-[44px] w-full items-start gap-3 rounded border-2 px-3 py-2 text-left transition-colors ${
                          checked
                            ? 'border-[#047857] bg-[#d1fae5]'
                            : 'border-[#b89a6d] bg-[#eee0be] hover:border-[#00559B]'
                        }`}
                      >
                        {checked ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#047857]" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#6E492D]" />
                        )}
                        <div>
                          <div className={`font-display text-xs font-bold ${checked ? 'text-[#065F46] line-through' : 'text-[#2B1B12]'}`}>
                            {item.title}
                          </div>
                          <div className="mt-0.5 text-[11px] font-medium leading-relaxed text-[#4E3422]">
                            {item.howToTest}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
