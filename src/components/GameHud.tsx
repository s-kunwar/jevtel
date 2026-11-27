import { useState } from 'react';
import { LogOut, Pause, Shield } from 'lucide-react';
import { INTEL_HARDWARE_URLS, TINY_SWORDS_AVATARS, TINY_SWORDS_UI } from '../game/assets';
import type { HudSnapshot } from '../game/types';

interface GameHudProps {
  hud: HudSnapshot;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onExitArcade: () => void;
  onOpenStoreModal: () => void;
}

export function GameHud({
  hud,
  onPause,
  onExitArcade,
  onOpenStoreModal,
}: GameHudProps) {
  const [portraitErr, setPortraitErr] = useState(false);
  const isTrap = hud.district === 'TRAP_ALLEY' && hud.fpsDisplay < 25;
  const heroAvatarUrl = TINY_SWORDS_AVATARS[hud.heroForm === 'pawn' ? 1 : 0];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2.5 sm:p-3">
      {/* Top Perimeter Clusters */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left: Compact Vitals Panel */}
        <div className="ts-wood-compact flex items-center gap-2.5">
          <div className="ts-special-panel relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
            {!portraitErr ? (
              <img
                src={heroAvatarUrl}
                alt={hud.pcLabel}
                referrerPolicy="no-referrer"
                onError={() => setPortraitErr(true)}
                className="pixelated h-full w-full object-contain"
              />
            ) : (
              <Shield className="h-5 w-5 text-sky-300" />
            )}
          </div>

          <div className="min-w-[180px] space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="font-display font-bold text-[#FEF3C7]">{hud.pcLabel}</span>
              <span
                className={`font-mono-tabular font-bold ${
                  isTrap ? 'text-red-300' : hud.fpsDisplay >= 100 ? 'text-cyan-300' : 'text-emerald-300'
                }`}
              >
                {hud.fpsDisplay} FPS
              </span>
            </div>

            {/* HP Bar */}
            <div className="flex items-center gap-1.5">
              <img src={TINY_SWORDS_UI.icons.meat} alt="HP" referrerPolicy="no-referrer" className="pixelated h-3.5 w-3.5 shrink-0" />
              <div className="ts-bar-frame relative h-3.5 flex-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-b from-rose-400 via-red-500 to-red-700 transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100))}%` }}
                />
              </div>
              <span className="w-7 text-right font-mono-tabular text-[11px] font-bold text-[#FEF3C7]">{hud.hp}</span>
            </div>

            {/* Battery & NPU Row */}
            <div className="flex items-center justify-between gap-2 text-[10px]">
              <div className="flex flex-1 items-center gap-1">
                <span className="font-mono-tabular font-bold text-[#FDE68A]">BAT</span>
                <div className="ts-bar-frame relative h-3 flex-1 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      hud.battery <= 25
                        ? 'bg-gradient-to-b from-amber-400 to-red-600'
                        : 'bg-gradient-to-b from-emerald-400 to-emerald-600'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, hud.battery))}%` }}
                  />
                </div>
                <span className={`font-mono-tabular font-bold ${hud.battery <= 25 ? 'text-red-300' : 'text-emerald-300'}`}>
                  {hud.battery}%
                </span>
              </div>

              {hud.hasNpuPulse && !hud.inExpoPark && (
                <span className="inline-flex items-center gap-1 font-mono-tabular font-bold text-cyan-300">
                  <img src={INTEL_HARDWARE_URLS.chip} alt="" referrerPolicy="no-referrer" className="pixelated h-3 w-3" />
                  <span>{hud.npuCharge}%</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top-Right: Compact Objective + Pause + Clear Always-Visible Exit */}
        <div className="flex items-start gap-2">
          <div className="ts-paper-panel hidden max-w-[260px] text-right sm:block">
            <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-[#6E492D]">
              <span>{hud.districtTitle}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular text-[#00559B]">
                {hud.inExpoPark
                  ? `PCs ${hud.inspectedPcCount}/${hud.totalExpoPcs}`
                  : `${hud.tasksRescued}/${hud.totalTasks}`}
              </span>
            </div>
            <p className="mt-0.5 font-display text-xs font-bold leading-snug text-[#2B1B12]">{hud.objectiveText}</p>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            {hud.inExpoPark && (
              <button
                type="button"
                onClick={onOpenStoreModal}
                className="ts-btn-blue inline-flex h-9 items-center gap-1.5 px-2.5 font-display text-xs font-bold text-white whitespace-nowrap shrink-0"
              >
                <img src={TINY_SWORDS_UI.icons.info} alt="" referrerPolicy="no-referrer" className="pixelated h-3.5 w-3.5" />
                <span>Store [C]</span>
              </button>
            )}
            <button
              type="button"
              onClick={onPause}
              title="Pause [Esc]"
              className="inline-flex h-9 items-center gap-1 rounded-lg border-2 border-[#0B1120] bg-[#1E293B]/95 px-2.5 text-xs font-bold text-[#F8FAFC] shadow-md transition-colors hover:border-[#38BDF8] hover:bg-[#0F172A] whitespace-nowrap shrink-0"
            >
              <Pause className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Pause</span>
            </button>
            <button
              type="button"
              onClick={onExitArcade}
              title="Exit Game"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border-2 border-[#0B1120] bg-[#DC2626] px-3 text-xs font-extrabold text-white shadow-md transition-colors hover:bg-[#B91C1C] whitespace-nowrap shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transient District / Phase Ribbon Banner */}
      {hud.bannerText && (
        <div className="mx-auto my-2">
          <div className="ts-ribbon ts-ribbon-Blue px-8 py-1 text-center font-display text-xs font-bold tracking-wider sm:text-sm">
            {hud.bannerText}
          </div>
        </div>
      )}

      {/* Bottom Center: Only Interactive Nearby Prompt when beside NPC / Exhibit */}
      <div className="flex min-h-[28px] items-end justify-center">
        {hud.nearbyPrompt && (
          <div className="ts-paper-panel font-display text-xs font-bold text-[#2B1B12] sm:text-sm">
            {hud.nearbyPrompt}
          </div>
        )}
      </div>
    </div>
  );
}
