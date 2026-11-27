import { useEffect, useRef } from 'react';
import { getPreloadedOrLoadImage } from '../game/assets';

export type RoamingTrackVariant = 'heroes' | 'sheep' | 'boss';

interface LandingRoamingTrackProps {
  variant: RoamingTrackVariant;
}

interface RoamingActorConfig {
  id: string;
  idleUrl: string;
  moveUrl: string;
  actionUrl?: string;
  minPct: number;
  maxPct: number;
  startPct: number;
  speedPct: number;
  sizePx: number;
  yBaselineOffset: number;
  fps: number;
  startDir: 1 | -1;
}

const TS_BASE = '/assets/tiny_swords';

function tsUrl(path: string): string {
  return `${TS_BASE}/${path
    .split('/')
    .map((s) => encodeURIComponent(s))
    .join('/')}`;
}

const TRACK_CONFIGS: Record<RoamingTrackVariant, RoamingActorConfig[]> = {
  heroes: [
    {
      id: 'byte_knight',
      idleUrl: tsUrl('Units/Blue Units/Warrior/Warrior_Idle.png'),
      moveUrl: tsUrl('Units/Blue Units/Warrior/Warrior_Run.png'),
      minPct: 0.06,
      maxPct: 0.34,
      startPct: 0.14,
      speedPct: 0.042,
      sizePx: 66,
      yBaselineOffset: 18,
      fps: 10,
      startDir: 1,
    },
    {
      id: 'blue_pawn',
      idleUrl: tsUrl('Units/Blue Units/Pawn/Pawn_Idle Gold.png'),
      moveUrl: tsUrl('Units/Blue Units/Pawn/Pawn_Run Gold.png'),
      minPct: 0.66,
      maxPct: 0.93,
      startPct: 0.82,
      speedPct: 0.036,
      sizePx: 62,
      yBaselineOffset: 17,
      fps: 10,
      startDir: -1,
    },
  ],
  sheep: [
    {
      id: 'sheep_west',
      idleUrl: tsUrl('Terrain/Resources/Meat/Sheep/Sheep_Idle.png'),
      moveUrl: tsUrl('Terrain/Resources/Meat/Sheep/Sheep_Move.png'),
      actionUrl: tsUrl('Terrain/Resources/Meat/Sheep/Sheep_Grass.png'),
      minPct: 0.08,
      maxPct: 0.33,
      startPct: 0.24,
      speedPct: 0.028,
      sizePx: 46,
      yBaselineOffset: 13,
      fps: 8,
      startDir: -1,
    },
    {
      id: 'sheep_east',
      idleUrl: tsUrl('Terrain/Resources/Meat/Sheep/Sheep_Idle.png'),
      moveUrl: tsUrl('Terrain/Resources/Meat/Sheep/Sheep_Move.png'),
      actionUrl: tsUrl('Terrain/Resources/Meat/Sheep/Sheep_Grass.png'),
      minPct: 0.67,
      maxPct: 0.91,
      startPct: 0.74,
      speedPct: 0.026,
      sizePx: 46,
      yBaselineOffset: 13,
      fps: 8,
      startDir: 1,
    },
  ],
  boss: [
    {
      id: 'lag_titan_patrol',
      idleUrl: tsUrl('Units/Black Units/Warrior/Warrior_Idle.png'),
      moveUrl: tsUrl('Units/Black Units/Warrior/Warrior_Run.png'),
      minPct: 0.07,
      maxPct: 0.34,
      startPct: 0.22,
      speedPct: 0.032,
      sizePx: 72,
      yBaselineOffset: 20,
      fps: 9,
      startDir: 1,
    },
    {
      id: 'red_scout',
      idleUrl: tsUrl('Units/Red Units/Pawn/Pawn_Idle.png'),
      moveUrl: tsUrl('Units/Red Units/Pawn/Pawn_Run.png'),
      minPct: 0.68,
      maxPct: 0.92,
      startPct: 0.79,
      speedPct: 0.038,
      sizePx: 60,
      yBaselineOffset: 17,
      fps: 10,
      startDir: -1,
    },
  ],
};

function loadCachedSprite(url: string): Promise<HTMLImageElement> {
  return getPreloadedOrLoadImage(url);
}

export function LandingRoamingTrack({ variant }: LandingRoamingTrackProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const actors = TRACK_CONFIGS[variant].map((cfg, idx) => ({
      cfg,
      pct: cfg.startPct,
      dir: cfg.startDir,
      state: (idx % 2 === 0 ? 'MOVE' : 'IDLE') as 'MOVE' | 'IDLE' | 'ACTION',
      timer: 1.8 + idx * 0.9,
      idleImg: null as HTMLImageElement | null,
      moveImg: null as HTMLImageElement | null,
      actionImg: null as HTMLImageElement | null,
    }));

    let destroyed = false;
    let isVisible = true;
    let rafId: number | null = null;
    let lastTime = performance.now();
    let elapsed = 0;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const syncSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(200, Math.round(rect.width || 800));
      const h = Math.max(48, Math.round(rect.height || 56));
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    };

    const drawFrame = (dt: number) => {
      const { w, h } = syncSize();
      ctx.clearRect(0, 0, w, h);

      const groundY = h - 9;

      for (const a of actors) {
        if (!reducedMotion) {
          a.timer -= dt;
          if (a.state === 'MOVE') {
            a.pct += a.dir * a.cfg.speedPct * dt;
            if (a.pct >= a.cfg.maxPct) {
              a.pct = a.cfg.maxPct;
              a.dir = -1;
              a.state = a.actionImg && Math.random() < 0.65 ? 'ACTION' : 'IDLE';
              a.timer = 1.6 + Math.random() * 1.4;
            } else if (a.pct <= a.cfg.minPct) {
              a.pct = a.cfg.minPct;
              a.dir = 1;
              a.state = a.actionImg && Math.random() < 0.65 ? 'ACTION' : 'IDLE';
              a.timer = 1.6 + Math.random() * 1.4;
            } else if (a.timer <= 0) {
              a.state = a.actionImg && Math.random() < 0.5 ? 'ACTION' : 'IDLE';
              a.timer = 1.3 + Math.random() * 1.2;
            }
          } else if (a.timer <= 0) {
            a.state = 'MOVE';
            a.timer = 3.2 + Math.random() * 2.2;
          }
        }

        const sheet =
          a.state === 'MOVE'
            ? a.moveImg
            : a.state === 'ACTION' && a.actionImg
              ? a.actionImg
              : a.idleImg;
        if (!sheet || !sheet.complete || sheet.height === 0) continue;

        const fh = sheet.height;
        const totalFrames = Math.max(1, Math.round(sheet.width / fh));
        const frameIdx = reducedMotion ? 0 : Math.floor(elapsed * a.cfg.fps) % totalFrames;

        const px = Math.round(a.pct * w);
        const mobileScale = w < 520 ? 0.72 : 1;
        const s = Math.round(a.cfg.sizePx * mobileScale);

        // Grounded soft ellipse contact shadow on the blueprint trace line
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
        ctx.beginPath();
        ctx.ellipse(px, groundY, Math.round(s * 0.22), 3.0, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(px, groundY + Math.round(a.cfg.yBaselineOffset * mobileScale));
        if (a.dir < 0) ctx.scale(-1, 1);
        ctx.drawImage(sheet, frameIdx * fh, 0, fh, fh, -Math.round(s / 2), -s, s, s);
        ctx.restore();
      }
    };

    const loadAll = async () => {
      await Promise.all(
        actors.map(async (a) => {
          const [idle, move, action] = await Promise.all([
            loadCachedSprite(a.cfg.idleUrl),
            loadCachedSprite(a.cfg.moveUrl),
            a.cfg.actionUrl ? loadCachedSprite(a.cfg.actionUrl) : Promise.resolve(null),
          ]);
          a.idleImg = idle;
          a.moveImg = move;
          a.actionImg = action;
        })
      );
      if (destroyed) return;
      drawFrame(0);
      if (reducedMotion) return;

      const loop = (now: number) => {
        if (destroyed) return;
        const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
        lastTime = now;
        if (isVisible) {
          elapsed += dt;
          drawFrame(dt);
        }
        rafId = window.requestAnimationFrame(loop);
      };
      rafId = window.requestAnimationFrame(loop);
    };

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              isVisible = entries[0]?.isIntersecting ?? true;
            },
            { threshold: 0.05 }
          )
        : null;
    observer?.observe(canvas);

    void loadAll();

    return () => {
      destroyed = true;
      observer?.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [variant]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-3 bottom-[4px] h-[44px] select-none sm:inset-x-6 sm:bottom-[6px] sm:h-[56px] md:inset-x-10"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
