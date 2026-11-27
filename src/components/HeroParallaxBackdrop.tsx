import { useEffect, useRef, type RefObject } from 'react';

interface HeroParallaxBackdropProps {
  containerRef: RefObject<HTMLElement | null>;
}

interface DustMote {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  vy: number;
  vx: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  warmth: number;
}

const DUST_MOTE_COUNT = 40;
const LERP_FACTOR = 0.06;
const MAX_SHIFT_LAYER_1 = 10;
const MAX_SHIFT_LAYER_2 = 16;
const MAX_SHIFT_LAYER_3 = 24;

function createDustMotes(width: number, height: number): DustMote[] {
  return Array.from({ length: DUST_MOTE_COUNT }, (_, idx) => {
    const seed = (idx + 1) * 1.6180339;
    const randA = Math.abs(Math.sin(seed * 19.31)) % 1;
    const randB = Math.abs(Math.cos(seed * 37.77)) % 1;
    const randC = Math.abs(Math.sin(seed * 53.13)) % 1;
    return {
      x: randA * width,
      y: randB * height,
      radius: 1.4 + randC * 2.8,
      alpha: 0.16 + randA * 0.34,
      vy: -(6 + randB * 10),
      vx: 2.5 + randC * 5.5,
      swayPhase: randA * Math.PI * 2,
      swaySpeed: 0.35 + randB * 0.45,
      swayAmp: 4 + randC * 8,
      warmth: randC,
    };
  });
}

function drawDustMotes(
  ctx: CanvasRenderingContext2D,
  motes: DustMote[],
  width: number,
  height: number,
  elapsedSec: number
): void {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < motes.length; i++) {
    const m = motes[i];
    const sway = Math.sin(elapsedSec * m.swaySpeed + m.swayPhase) * m.swayAmp;
    const px = m.x + sway;
    const py = m.y;

    const rOuter = m.radius * 2.8;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, rOuter);
    const r = Math.round(244 + m.warmth * 11);
    const g = Math.round(222 + m.warmth * 16);
    const b = Math.round(176 + m.warmth * 24);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${m.alpha.toFixed(3)})`);
    grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${(m.alpha * 0.42).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, rOuter, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function HeroParallaxBackdrop({ containerRef }: HeroParallaxBackdropProps) {
  const layer1Ref = useRef<HTMLDivElement | null>(null);
  const layer2Ref = useRef<HTMLDivElement | null>(null);
  const layer3Ref = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const heroEl = containerRef.current;
    const canvas = canvasRef.current;
    if (!heroEl || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const coarsePointerQuery = window.matchMedia?.('(pointer: coarse)');
    const fineHoverQuery = window.matchMedia?.('(hover: hover) and (pointer: fine)');

    let prefersReducedMotion = reducedMotionQuery?.matches ?? false;
    let isTouchOrMobile =
      (coarsePointerQuery?.matches ?? false) ||
      (fineHoverQuery ? !fineHoverQuery.matches : false) ||
      navigator.maxTouchPoints > 0;

    let width = 1280;
    let height = 720;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let motes: DustMote[] = [];

    let targetNormX = 0;
    let targetNormY = 0;
    let currentNormX = 0;
    let currentNormY = 0;

    let rafId: number | null = null;
    let lastTime = performance.now();
    let elapsedSec = 0;

    const applyTransforms = (nx: number, ny: number) => {
      if (layer1Ref.current) {
        const tx = (nx * MAX_SHIFT_LAYER_1).toFixed(2);
        const ty = (ny * MAX_SHIFT_LAYER_1).toFixed(2);
        layer1Ref.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
      if (layer2Ref.current) {
        const tx = (nx * MAX_SHIFT_LAYER_2).toFixed(2);
        const ty = (ny * MAX_SHIFT_LAYER_2).toFixed(2);
        layer2Ref.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
      if (layer3Ref.current) {
        const tx = (nx * MAX_SHIFT_LAYER_3).toFixed(2);
        const ty = (ny * MAX_SHIFT_LAYER_3).toFixed(2);
        layer3Ref.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
    };

    const resizeCanvas = () => {
      const rect = heroEl.getBoundingClientRect();
      // Oversize by ±28px margins so ±24px Layer 3 shift never exposes edges
      width = Math.max(320, Math.round(rect.width + 56));
      height = Math.max(320, Math.round(rect.height + 56));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (motes.length === 0) {
        motes = createDustMotes(width, height);
      } else {
        for (const m of motes) {
          m.x = ((m.x % width) + width) % width;
          m.y = ((m.y % height) + height) % height;
        }
      }

      if (prefersReducedMotion) {
        applyTransforms(0, 0);
        drawDustMotes(ctx, motes, width, height, 0);
      }
    };

    const tick = (now: number) => {
      if (prefersReducedMotion) {
        rafId = null;
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      elapsedSec += dt;

      if (isTouchOrMobile) {
        targetNormX = 0;
        targetNormY = 0;
      }

      currentNormX += (targetNormX - currentNormX) * LERP_FACTOR;
      currentNormY += (targetNormY - currentNormY) * LERP_FACTOR;

      if (Math.abs(currentNormX) < 0.0005 && targetNormX === 0) currentNormX = 0;
      if (Math.abs(currentNormY) < 0.0005 && targetNormY === 0) currentNormY = 0;

      applyTransforms(currentNormX, currentNormY);

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.y < -16) m.y = height + 16;
        if (m.x > width + 16) m.x = -16;
        if (m.x < -16) m.x = width + 16;
      }

      drawDustMotes(ctx, motes, width, height, elapsedSec);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId !== null) return;
      lastTime = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion || isTouchOrMobile) return;
      if (e.pointerType && e.pointerType !== 'mouse') return;

      const rect = heroEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      targetNormX = Math.max(-1, Math.min(1, (relX - 0.5) * 2));
      targetNormY = Math.max(-1, Math.min(1, (relY - 0.5) * 2));
    };

    const onPointerLeave = () => {
      targetNormX = 0;
      targetNormY = 0;
    };

    const onReducedMotionChange = () => {
      prefersReducedMotion = reducedMotionQuery?.matches ?? false;
      if (prefersReducedMotion) {
        stopLoop();
        targetNormX = 0;
        targetNormY = 0;
        currentNormX = 0;
        currentNormY = 0;
        applyTransforms(0, 0);
        drawDustMotes(ctx, motes, width, height, 0);
      } else {
        startLoop();
      }
    };

    const onPointerMediaChange = () => {
      isTouchOrMobile =
        (coarsePointerQuery?.matches ?? false) ||
        (fineHoverQuery ? !fineHoverQuery.matches : false) ||
        navigator.maxTouchPoints > 0;
      if (isTouchOrMobile) {
        targetNormX = 0;
        targetNormY = 0;
      }
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(heroEl);

    heroEl.addEventListener('pointermove', onPointerMove, { passive: true });
    heroEl.addEventListener('pointerleave', onPointerLeave, { passive: true });
    reducedMotionQuery?.addEventListener?.('change', onReducedMotionChange);
    coarsePointerQuery?.addEventListener?.('change', onPointerMediaChange);
    fineHoverQuery?.addEventListener?.('change', onPointerMediaChange);

    if (prefersReducedMotion) {
      applyTransforms(0, 0);
      drawDustMotes(ctx, motes, width, height, 0);
    } else {
      startLoop();
    }

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      heroEl.removeEventListener('pointermove', onPointerMove);
      heroEl.removeEventListener('pointerleave', onPointerLeave);
      reducedMotionQuery?.removeEventListener?.('change', onReducedMotionChange);
      coarsePointerQuery?.removeEventListener?.('change', onPointerMediaChange);
      fineHoverQuery?.removeEventListener?.('change', onPointerMediaChange);
    };
  }, [containerRef]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0A0C0B]"
    >
      {/* Layer 1 — Base Scene (max shift ±10px, opacity 0.35, grayscale 15%, scale 1.06) */}
      <div
        ref={layer1Ref}
        className="absolute inset-0 will-change-transform"
      >
        <img
          src="/tlou-bg.jpg"
          alt=""
          className="h-full w-full scale-[1.06] object-cover object-center opacity-[0.35] grayscale-[15%]"
        />
      </div>

      {/* Layer 2 — Window Light Beam from top-right toward center (max shift ±16px, opacity 0.14) */}
      <div
        ref={layer2Ref}
        className="absolute -inset-8 will-change-transform"
      >
        <div className="h-full w-full opacity-[0.14] blur-2xl bg-[radial-gradient(ellipse_75%_60%_at_84%_8%,rgba(255,241,200,0.95)_0%,rgba(244,214,152,0.52)_34%,rgba(190,175,130,0.12)_64%,transparent_86%),linear-gradient(215deg,rgba(255,238,195,0.85)_0%,rgba(235,205,145,0.34)_38%,transparent_72%)]" />
      </div>

      {/* Layer 3 — Drifting Dust Motes Canvas (max shift ±24px) */}
      <div
        ref={layer3Ref}
        className="absolute -inset-7 will-change-transform"
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>

      {/* Readability Guard — Dark Radial Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,12,11,0.40)_0%,rgba(10,12,11,0.92)_100%)]" />
    </div>
  );
}
