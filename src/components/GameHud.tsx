import { useState } from 'react';
import { Shield } from 'lucide-react';
import { INTEL_HARDWARE_URLS, TINY_SWORDS_AVATARS, TINY_SWORDS_UI } from '../game/assets';
import type { HudSnapshot } from '../game/types';

interface GameHudProps {
  hud: HudSnapshot;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenStoreModal: () => void;
}

export function GameHud({ hud, muted, onToggleMute, onPause, onOpenStoreModal }: GameHudProps) {
  const [portraitErr, setPortraitErr] = useState(false);
  const isTrap = hud.district === 'TRAP_ALLEY' && hud.fpsDisplay < 25;
  // Avatar 02 = Blue Pawn, Avatar 01 = Blue Warrior!
  const heroAvatarUrl = TINY_SWORDS_AVATARS[hud.heroForm === 'pawn' ? 1 : 0];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 md:p-4">
      {/* Top Perimeter Clusters */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left: Wooden Tabletop Vitals Panel */}
        <div className="ts-wood-compact flex items-center gap-3">
          <div className="ts-special-panel relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
            {!portraitErr ? (
              <img
                src={heroAvatarUrl}
                alt={hud.pcLabel}
                referrerPolicy="no-referrer"
                onError={() => setPortraitErr(true)}
                className="pixelated h-full w-full object-contain"
              />
            ) : (
              <Shield className="h-6 w-6 text-sky-300" />
            )}
          </div>

          <div className="min-w-[225px] space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <img
                  src={INTEL_HARDWARE_URLS.chip}
                  alt="Core Ultra"
                  referrerPolicy="no-referrer"
                  className="pixelated h-4 w-4 shrink-0"
                />
                <span className="font-display font-bold text-[#FEF3C7]">{hud.pcLabel}</span>
              </div>
              <span
                className={`font-mono-tabular font-bold ${
                  isTrap ? 'text-red-300' : hud.fpsDisplay >= 100 ? 'text-cyan-300' : 'text-emerald-300'
                }`}
              >
                {hud.fpsDisplay} FPS
              </span>
            </div>

            {/* Tiny Swords HP Bar */}
            <div className="flex items-center gap-2">
              <img src={TINY_SWORDS_UI.icons.meat} alt="HP" referrerPolicy="no-referrer" className="pixelated h-4 w-4 shrink-0" />
              <div className="ts-bar-frame relative h-4 flex-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-b from-rose-400 via-red-500 to-red-700 transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100))}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono-tabular text-[11px] font-bold text-[#FEF3C7]">{hud.hp}</span>
            </div>

            {/* Battery & Gold/Wood Row */}
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <div className="flex flex-1 items-center gap-1.5">
                <span className="font-mono-tabular font-bold text-[#FDE68A]">BAT</span>
                <div className="ts-bar-frame relative h-3.5 flex-1 overflow-hidden">
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

              <div className="flex items-center gap-1.5 font-mono-tabular font-bold text-[#FDE68A]">
                <img src={TINY_SWORDS_UI.icons.gold} alt="Gold" referrerPolicy="no-referrer" className="pixelated h-3.5 w-3.5" />
                <span>{hud.goldCount}</span>
                {hud.hasNpuPulse && !hud.inExpoPark && (
                  <span className="ml-1 inline-flex items-center gap-1 text-cyan-300">
                    <img src={INTEL_HARDWARE_URLS.chip} alt="" referrerPolicy="no-referrer" className="pixelated h-3.5 w-3.5" />
                    <span>NPU {hud.npuCharge}%</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right: District Parchment Card + Tiny Swords Icon Buttons */}
        <div className="flex items-start gap-2">
          <div className="ts-paper-panel max-w-xs text-right">
            <div className="flex items-center justify-end gap-2 text-[11px] font-bold text-[#6E492D]">
              <span>{hud.districtTitle}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular text-[#00559B]">
                {hud.inExpoPark
                  ? `PCs ${hud.inspectedPcCount}/${hud.totalExpoPcs}`
                  : `Tasks ${hud.tasksRescued}/${hud.totalTasks}`}
              </span>
            </div>
            <p className="mt-0.5 font-display text-xs font-bold text-[#2B1B12] md:text-sm">{hud.objectiveText}</p>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            {hud.inExpoPark && (
              <button
                type="button"
                onClick={onOpenStoreModal}
                className="ts-btn-blue inline-flex items-center gap-1.5 font-display text-xs font-bold text-white whitespace-nowrap shrink-0"
              >
                <img src={TINY_SWORDS_UI.icons.info} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                <span>Store Guide [C]</span>
              </button>
            )}
            <button
              type="button"
              onClick={onToggleMute}
              title={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
              className="ts-btn-blue flex h-11 w-11 items-center justify-center p-0"
            >
              <img
                src={muted ? TINY_SWORDS_UI.icons.close : TINY_SWORDS_UI.icons.music}
                alt="Audio"
                referrerPolicy="no-referrer"
                className="pixelated h-5 w-5"
              />
            </button>
            <button
              type="button"
              onClick={onPause}
              title="Pause [Esc]"
              className="ts-btn-red flex h-11 w-11 items-center justify-center p-0"
            >
              <img src={TINY_SWORDS_UI.icons.gear} alt="Pause" referrerPolicy="no-referrer" className="pixelated h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transient District / Phase Ribbon Banner */}
      {hud.bannerText && (
        <div className="mx-auto my-2">
          <div className="ts-ribbon ts-ribbon-Blue px-10 py-1.5 text-center font-display text-sm font-bold tracking-wider">
            {hud.bannerText}
          </div>
        </div>
      )}

      {/* Bottom Perimeter: Wooden Action Bar + Nearby Banner */}
      <div className="flex items-end justify-between gap-4">
        <div className="ts-wood-compact flex items-center gap-3 text-xs text-[#FEF3C7]">
          {hud.inExpoPark ? (
            <>
              <div className="flex items-center gap-1.5">
                <kbd className="rounded bg-[#3e2618] px-1.5 py-0.5 font-mono-tabular text-[11px] text-[#FDE68A]">WASD</kbd>
                <span className="font-semibold">Walk Expo Park</span>
              </div>
              <span aria-hidden="true" className="text-[#a88a5d]">·</span>
              <div className="flex items-center gap-1.5">
                <kbd className="rounded bg-[#3e2618] px-1.5 py-0.5 font-mono-tabular text-[11px] text-[#FDE68A]">E</kbd>
                <span className="font-semibold">Meet Champion</span>
              </div>
              <span aria-hidden="true" className="text-[#a88a5d]">·</span>
              <div className="flex items-center gap-1.5">
                <kbd className="rounded bg-[#3e2618] px-1.5 py-0.5 font-mono-tabular text-[11px] text-[#BAE6FD]">C</kbd>
                <span className="font-semibold">Store Guide</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <img
                  src={hud.heroForm === 'pawn' ? TINY_SWORDS_UI.icons.hammer : TINY_SWORDS_UI.icons.sword}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="pixelated h-4 w-4"
                />
                <kbd className="rounded bg-[#3e2618] px-1.5 py-0.5 font-mono-tabular text-[11px] text-[#BAE6FD]">O</kbd>
                <span className="font-semibold">{hud.heroForm === 'pawn' ? 'Hammer' : 'Slash'}</span>
              </div>
              <span aria-hidden="true" className="text-[#a88a5d]">·</span>
              <div className="flex items-center gap-1.5">
                <img src={TINY_SWORDS_UI.icons.shield} alt="" referrerPolicy="no-referrer" className="pixelated h-4 w-4" />
                <kbd className="rounded bg-[#3e2618] px-1.5 py-0.5 font-mono-tabular text-[11px] text-[#BAE6FD]">Space</kbd>
                <span className={hud.dashReadyPct >= 100 ? 'font-semibold text-white' : 'text-[#c2a47e]'}>Guard Dash</span>
              </div>
              {hud.hasNpuPulse && (
                <>
                  <span aria-hidden="true" className="text-[#a88a5d]">·</span>
                  <div className="flex items-center gap-1.5">
                    <kbd className="rounded bg-[#3e2618] px-1.5 py-0.5 font-mono-tabular text-[11px] text-[#FDE68A]">P</kbd>
                    <span className={hud.specialReadyPct >= 100 ? 'font-bold text-[#FDE68A]' : 'text-[#c2a47e]'}>
                      {hud.hasXessSurge ? 'NPU + XeSS Surge' : 'NPU Heal Pulse'}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {hud.nearbyPrompt && (
          <div className="ts-paper-panel font-display text-sm font-bold text-[#2B1B12]">
            {hud.nearbyPrompt}
          </div>
        )}
      </div>
    </div>
  );
}
