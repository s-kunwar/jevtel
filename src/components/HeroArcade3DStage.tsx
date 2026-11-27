import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { Play, Rotate3d, Shield, Volume2, VolumeX } from 'lucide-react';
import { ARCADE_CABINET_ART_URLS, EDITORIAL_ART_URLS } from '../game/assets';
import { gameAudio } from '../game/audio';

interface HeroArcade3DStageProps {
  launchNonce: number;
  paused: boolean;
  darkMode?: boolean;
  globalMuted?: boolean;
  onToggleGlobalMute?: () => void;
  onLaunchComplete: () => void;
  onRequestLaunch: () => void;
}

interface YTPlayerInstance {
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo?: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  loadVideoById: (opts: { videoId: string; startSeconds?: number }) => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement | string,
    opts: {
      videoId: string;
      width?: number | string;
      height?: number | string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayerInstance }) => void;
        onStateChange?: (e: { data: number; target: YTPlayerInstance }) => void;
      };
    }
  ) => YTPlayerInstance;
  PlayerState?: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YOUTUBE_PLAYLIST = [
  { videoId: 'xhFe3ejXybs', startSeconds: 42, gapAfterMs: 5000, nextTitle: 'Intel Core Ultra Showcase' },
  { videoId: '0YtfqncTfVc', startSeconds: 0, gapAfterMs: 10000, nextTitle: 'Jevtel Quest Feature' },
] as const;

let ytApiPromise: Promise<YTNamespace | null> | null = null;
function loadYouTubeIframeApi(): Promise<YTNamespace | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const existingPrev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      existingPrev?.();
      resolve(window.YT ?? null);
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = () => resolve(null);
      document.head.appendChild(tag);
    }

    window.setTimeout(() => {
      if (window.YT?.Player) resolve(window.YT);
    }, 4500);
  });

  return ytApiPromise;
}

// Pre-allocated scratch vectors for zero-GC animation loop
const _camTargetPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _screenWorldPos = new THREE.Vector3();
const _screenWorldQuat = new THREE.Quaternion();
const _screenForward = new THREE.Vector3();
const _diveStartPos = new THREE.Vector3();
const _diveStartTarget = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();
const _hoverOffset = new THREE.Vector3();
const _hoverSpherical = new THREE.Spherical();

const HOME_CAM_POS = new THREE.Vector3(2.38, 2.48, 4.22);
const HOME_LOOK_AT = new THREE.Vector3(0, 1.48, 0.06);
const HOME_SPHERICAL = new THREE.Spherical().setFromVector3(
  HOME_CAM_POS.clone().sub(HOME_LOOK_AT)
);
const HOME_FOV = 38;
const DIVE_FOV = 54;
// 1.0s snappy ease-out camera dive + 0.5s modal expand = 1.5s combined
const LAUNCH_DURATION_SEC = 1.0;

const CSS_SCREEN_W = 560;
const CSS_SCREEN_H = 406;
const WORLD_SCREEN_W = 1.1;
const WORLD_SCREEN_H = 0.798;

function detectSoftwareGl(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '')
      : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|Software|Mesa OffScreen/i.test(rendererStr);
  } catch {
    return true;
  }
}

function createBrushedAluminumTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const base = ctx.createLinearGradient(0, 0, 512, 512);
  base.addColorStop(0, '#E3E9F0');
  base.addColorStop(0.5, '#CFD8E3');
  base.addColorStop(1, '#DCE4EE');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  // Fine directional anodized aluminum grain
  for (let y = 0; y < 512; y += 2) {
    const n = Math.abs(Math.sin(y * 17.31) * 43758.54) % 1;
    ctx.fillStyle = n > 0.5 ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.045)';
    ctx.fillRect(0, y, 512, 1);
  }

  // Subtle architectural panel seam & recessed fasteners
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.14)';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, 484, 484);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createSideDecalTexture(side: 'left' | 'right'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Brushed slate-cobalt recessed side plate
  const bg = ctx.createLinearGradient(0, 0, 512, 1024);
  bg.addColorStop(0, '#0F1A2E');
  bg.addColorStop(0.45, '#0B1324');
  bg.addColorStop(1, '#09101E');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 1024);

  // Anodized cobalt perimeter pinstripe
  ctx.strokeStyle = '#0068B5';
  ctx.lineWidth = 8;
  ctx.strokeRect(18, 18, 476, 988);

  ctx.strokeStyle = 'rgba(0, 199, 253, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 448, 960);

  // Diagonal Intel Silicon Forge diagonal cobalt chevron stripe
  ctx.save();
  ctx.fillStyle = '#0068B5';
  ctx.beginPath();
  if (side === 'left') {
    ctx.moveTo(32, 170);
    ctx.lineTo(480, 320);
    ctx.lineTo(480, 440);
    ctx.lineTo(32, 290);
  } else {
    ctx.moveTo(32, 320);
    ctx.lineTo(480, 170);
    ctx.lineTo(480, 290);
    ctx.lineTo(32, 440);
  }
  ctx.closePath();
  ctx.fill();

  // Electric cyan thin highlight line
  ctx.fillStyle = '#00C7FD';
  ctx.beginPath();
  if (side === 'left') {
    ctx.moveTo(32, 295);
    ctx.lineTo(480, 445);
    ctx.lineTo(480, 456);
    ctx.lineTo(32, 306);
  } else {
    ctx.moveTo(32, 445);
    ctx.lineTo(480, 295);
    ctx.lineTo(480, 306);
    ctx.lineTo(32, 456);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Custom Core Ultra 3D tile emblem (CPU / GPU / NPU chiplet diagram)
  const cx = 256;
  const cy = 615;
  ctx.strokeStyle = 'rgba(0, 199, 253, 0.42)';
  ctx.lineWidth = 3;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 26, cy - 118);
    ctx.lineTo(cx + i * 26, cy + 118);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 118, cy + i * 26);
    ctx.lineTo(cx + 118, cy + i * 26);
    ctx.stroke();
  }

  // Die package border
  ctx.fillStyle = '#111D33';
  ctx.fillRect(cx - 88, cy - 88, 176, 176);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 5;
  ctx.strokeRect(cx - 88, cy - 88, 176, 176);

  // Tile subdivisions inside die
  ctx.fillStyle = '#0068B5';
  ctx.fillRect(cx - 72, cy - 72, 68, 68); // Compute Tile
  ctx.fillStyle = '#00A3E0';
  ctx.fillRect(cx + 4, cy - 72, 68, 68); // Arc Graphics Tile
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(cx - 72, cy + 4, 144, 68); // AI Boost NPU Tile

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CPU', cx - 38, cy - 32);
  ctx.fillText('ARC', cx + 38, cy - 32);
  ctx.fillText('INTEL AI BOOST NPU', cx, cy + 44);

  // Architectural typography header & footer
  ctx.fillStyle = '#00C7FD';
  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.fillText('INTEL · SILICON FORGE', 256, 98);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '800 54px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.fillText('CORE ULTRA', 256, 152);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '700 22px "Chakra Petch", sans-serif';
  ctx.fillText('JEVTEL CUSTOM EDITION', 256, 868);

  // Lower heat-sink louver lines
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1E293B' : '#0068B5';
    ctx.fillRect(96, 902 + i * 16, 320, 7);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCoreUltraMarqueeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const paintMarquee = (bannerImg?: HTMLImageElement) => {
    const grad = ctx.createLinearGradient(0, 0, 1024, 256);
    grad.addColorStop(0, '#041A36');
    grad.addColorStop(0.5, '#00559B');
    grad.addColorStop(1, '#041A36');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 256);

    if (bannerImg && bannerImg.naturalWidth > 0) {
      ctx.save();
      const iw = bannerImg.naturalWidth;
      const ih = bannerImg.naturalHeight;
      const scale = Math.max(1000 / iw, 232 / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(bannerImg, (1024 - dw) / 2, (256 - dh) / 2, dw, dh);
      // Contrast scrim in center for readable Tiny Swords · Jevtel Quest title lockup
      const scrim = ctx.createRadialGradient(512, 128, 40, 512, 128, 440);
      scrim.addColorStop(0, 'rgba(6, 15, 34, 0.78)');
      scrim.addColorStop(0.7, 'rgba(6, 15, 34, 0.32)');
      scrim.addColorStop(1, 'rgba(6, 15, 34, 0.08)');
      ctx.fillStyle = scrim;
      ctx.fillRect(14, 14, 996, 228);
      ctx.restore();
    }

    // Machined aluminum outer bezel frame
    ctx.strokeStyle = '#DCE3EC';
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, 996, 228);

    // Cyan luminous edge rails
    ctx.fillStyle = '#00C7FD';
    ctx.fillRect(28, 26, 968, 5);
    ctx.fillRect(28, 225, 968, 5);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#7DD3FC';
    ctx.font = '700 22px "JetBrains Mono", monospace';
    ctx.fillText('TINY SWORDS · INTEL CORE ULTRA EDITION', 512, 74);

    // Crisp drop shadow + white lockup
    ctx.font = '900 74px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.fillStyle = '#040B1A';
    ctx.fillText('JEVTEL QUEST', 515, 155);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('JEVTEL QUEST', 512, 152);

    ctx.fillStyle = '#FDE68A';
    ctx.font = '700 22px "Chakra Petch", sans-serif';
    ctx.fillText('PLAY BYTE’S ADVENTURE  ·  FREE PLAY', 512, 198);

    tex.needsUpdate = true;
  };

  paintMarquee();
  const img = new Image();
  img.onload = () => paintMarquee(img);
  img.src = ARCADE_CABINET_ART_URLS.marqueeTinySwords;

  return tex;
}

function createControlDeckTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#121B2E';
  ctx.fillRect(0, 0, 1024, 512);

  // Brushed aluminum perimeter trim line
  ctx.strokeStyle = '#0068B5';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, 984, 472);

  ctx.strokeStyle = 'rgba(0, 199, 253, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 38, 948, 436);

  // Subtle circuit vector line linking stick to action buttons
  ctx.strokeStyle = 'rgba(0, 199, 253, 0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(270, 290);
  ctx.lineTo(490, 290);
  ctx.lineTo(540, 255);
  ctx.lineTo(860, 255);
  ctx.stroke();

  // Silkscreen control legends aligned below joystick & 3 cobalt buttons
  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MOVE', 260, 412);

  ctx.fillStyle = '#7DD3FC';
  ctx.fillText('ATK', 615, 388);
  ctx.fillText('NPU', 730, 336);
  ctx.fillText('DASH', 840, 396);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 20px "Chakra Petch", sans-serif';
  ctx.fillText('TINY SWORDS · SILICON FORGE DECK', 512, 86);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCoinDoorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 576;
  const ctx = canvas.getContext('2d')!;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const paintFrontPanel = (artImg?: HTMLImageElement) => {
    const bg = ctx.createLinearGradient(0, 0, 768, 576);
    bg.addColorStop(0, '#0F1A2E');
    bg.addColorStop(1, '#09101E');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 768, 576);

    // Outer cobalt & steel arcade kickplate bezel
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 748, 556);

    // Hand-drawn Tiny Swords game artwork filling upper 82% of cabinet front
    const artX = 24;
    const artY = 22;
    const artW = 720;
    const artH = 446;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(artX, artY, artW, artH, 8);
    ctx.clip();

    if (artImg && artImg.naturalWidth > 0) {
      const iw = artImg.naturalWidth;
      const ih = artImg.naturalHeight;
      const scale = Math.max(artW / iw, artH / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(artImg, artX + (artW - dw) / 2, artY + (artH - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = '#0F3A68';
      ctx.fillRect(artX, artY, artW, artH);
    }
    ctx.restore();

    ctx.strokeStyle = '#00C7FD';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(artX, artY, artW, artH, 8);
    ctx.stroke();

    // Compact lower arcade coin-insert / Free Play metal apron bar
    ctx.fillStyle = '#0D1424';
    ctx.fillRect(24, 480, 720, 76);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 480, 720, 76);

    // Twin backlit coin-door slots flanking the "TINY SWORDS · FREE PLAY" plate
    const drawMiniSlot = (sx: number, label: string) => {
      ctx.fillStyle = '#0068B5';
      ctx.fillRect(sx, 495, 92, 46);
      ctx.strokeStyle = '#00C7FD';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, 495, 92, 46);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, sx + 46, 524);
    };

    drawMiniSlot(48, 'FREE');
    drawMiniSlot(628, 'PLAY');

    // Center badge plate
    ctx.fillStyle = '#162238';
    ctx.fillRect(166, 493, 436, 50);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.strokeRect(166, 493, 436, 50);
    ctx.fillStyle = '#FDE68A';
    ctx.font = '800 20px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TINY SWORDS · SILICON QUEST', 384, 517);
    ctx.fillStyle = '#7DD3FC';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillText('CLICK SCREEN OR BUTTON TO PLAY', 384, 536);

    // Corner rivets
    ctx.fillStyle = '#CBD5E1';
    for (const [bx, by] of [
      [20, 20],
      [748, 20],
      [20, 556],
      [748, 556],
    ]) {
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    tex.needsUpdate = true;
  };

  paintFrontPanel();
  const img = new Image();
  img.onload = () => paintFrontPanel(img);
  img.src = ARCADE_CABINET_ART_URLS.frontTinySwords;

  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 124);
  grad.addColorStop(0, 'rgba(11, 17, 32, 0.42)');
  grad.addColorStop(0.55, 'rgba(11, 17, 32, 0.16)');
  grad.addColorStop(1, 'rgba(11, 17, 32, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function drawCrtIdleOrLaunchFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  launchProgress: number
): void {
  // Deep CRT glass backdrop when video is paused during launch or transitioning
  ctx.fillStyle = '#050B16';
  ctx.fillRect(0, 0, w, h);

  if (launchProgress > 0) {
    if (launchProgress < 0.34) {
      // Classic horizontal CRT degauss line expansion
      const bandT = launchProgress / 0.34;
      const bandH = Math.max(8, h * Math.pow(bandT, 1.3));
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = `rgba(0, 199, 253, ${0.95 - bandT * 0.45})`;
      ctx.fillRect(0, (h - bandH) * 0.5, w, bandH);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, h * 0.5 - 3, w, 6);
    } else {
      // Bright Core Ultra cyan-to-white phosphor flash as camera enters the tube
      const t = (launchProgress - 0.34) / 0.66;
      const flashAlpha = Math.min(0.96, t * 1.15);
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.72);
      grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
      grad.addColorStop(0.55, `rgba(56, 189, 248, ${flashAlpha * 0.9})`);
      grad.addColorStop(1, `rgba(0, 104, 181, ${flashAlpha * 0.85})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  } else {
    // Subtle dark phosphor grid behind YouTube iframe
    ctx.strokeStyle = 'rgba(0, 199, 253, 0.14)';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#7DD3FC';
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LOADING CRT FEED...', w * 0.5, h * 0.5);
  }
}

export function HeroArcade3DStage({
  launchNonce,
  paused,
  darkMode = false,
  globalMuted = false,
  onToggleGlobalMute,
  onLaunchComplete,
  onRequestLaunch,
}: HeroArcade3DStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [hoveredPart, setHoveredPart] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [prefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  // Refs synced to latest props so Three.js & YouTube mount cleanly once
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const globalMutedRef = useRef(globalMuted);
  globalMutedRef.current = globalMuted;
  const onLaunchCompleteRef = useRef(onLaunchComplete);
  onLaunchCompleteRef.current = onLaunchComplete;
  const onRequestLaunchRef = useRef(onRequestLaunch);
  onRequestLaunchRef.current = onRequestLaunch;

  const triggerLaunchRef = useRef<(() => void) | null>(null);
  const lastHandledNonceRef = useRef(launchNonce);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const playlistIdxRef = useRef<number>(0);
  const playlistGapTimerRef = useRef<number | null>(null);
  const playlistCountdownRef = useRef<number | null>(null);
  const userDesiredMutedRef = useRef(true);
  const hasUnlockedAudioRef = useRef(false);
  const isLaunchingRef = useRef(false);

  const clearPlaylistTimers = () => {
    if (playlistGapTimerRef.current !== null) {
      window.clearTimeout(playlistGapTimerRef.current);
      playlistGapTimerRef.current = null;
    }
    if (playlistCountdownRef.current !== null) {
      window.clearInterval(playlistCountdownRef.current);
      playlistCountdownRef.current = null;
    }
  };

  const cutVideoForLaunch = () => {
    isLaunchingRef.current = true;
    clearPlaylistTimers();
    const p = ytPlayerRef.current;
    if (p) {
      try {
        p.mute();
        p.pauseVideo();
      } catch {
        // Ignore player state races
      }
    }
  };

  const handleToggleVideoAudio = () => {
    hasUnlockedAudioRef.current = true;
    if (onToggleGlobalMute) {
      onToggleGlobalMute();
      return;
    }
    const p = ytPlayerRef.current;
    const nextMuted = !userDesiredMutedRef.current;
    userDesiredMutedRef.current = nextMuted;
    setVideoMuted(nextMuted);
    if (p) {
      try {
        if (nextMuted) {
          p.mute();
        } else {
          p.unMute();
          p.setVolume(85);
          p.playVideo();
        }
      } catch {
        // Ignore player readiness race
      }
    }
  };

  // Sync top navbar globalMuted with YouTube CRT player immediately
  useEffect(() => {
    const effectiveMuted = globalMuted || (!hasUnlockedAudioRef.current && videoMuted);
    userDesiredMutedRef.current = effectiveMuted;
    if (globalMuted) {
      setVideoMuted(true);
    } else if (hasUnlockedAudioRef.current) {
      setVideoMuted(false);
    }
    const p = ytPlayerRef.current;
    if (!p || isLaunchingRef.current || pausedRef.current) return;
    try {
      if (effectiveMuted) {
        p.mute();
      } else {
        p.unMute();
        p.setVolume(85);
        p.playVideo();
      }
    } catch {
      // Ignore player state races
    }
  }, [globalMuted, videoMuted]);

  // Global first-click-anywhere listener to unlock YouTube CRT sound automatically (respecting globalMuted)
  useEffect(() => {
    if (prefersReducedMotion || webglFailed) return;

    const unlockAudioNow = () => {
      if (
        hasUnlockedAudioRef.current ||
        isLaunchingRef.current ||
        pausedRef.current ||
        globalMutedRef.current
      ) {
        return;
      }
      hasUnlockedAudioRef.current = true;
      userDesiredMutedRef.current = false;
      setVideoMuted(false);
      const p = ytPlayerRef.current;
      if (p) {
        try {
          p.unMute();
          p.setVolume(85);
          p.playVideo();
        } catch {
          // Ignore if player isn't ready yet; onReady syncs userDesiredMutedRef
        }
      }
    };

    const unlockOnFirstGesture = (ev: Event) => {
      if (
        hasUnlockedAudioRef.current ||
        isLaunchingRef.current ||
        pausedRef.current ||
        globalMutedRef.current
      ) {
        return;
      }
      const target = ev.target as HTMLElement | null;
      if (target?.closest('[data-crt-audio-toggle="true"]')) return;
      if (target?.closest('[data-arcade-launch="true"]')) return;
      if (mountRef.current && target && mountRef.current.contains(target)) return;
      unlockAudioNow();
    };

    window.addEventListener('pointerdown', unlockOnFirstGesture, { capture: true, passive: true });
    window.addEventListener('keydown', unlockOnFirstGesture, { capture: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockOnFirstGesture, { capture: true });
      window.removeEventListener('keydown', unlockOnFirstGesture, { capture: true });
    };
  }, [prefersReducedMotion, webglFailed]);

  useEffect(() => {
    if (launchNonce !== lastHandledNonceRef.current) {
      lastHandledNonceRef.current = launchNonce;
      cutVideoForLaunch();
      if (prefersReducedMotion || webglFailed) {
        onLaunchCompleteRef.current();
      } else {
        triggerLaunchRef.current?.();
      }
    }
  }, [launchNonce, prefersReducedMotion, webglFailed]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || prefersReducedMotion) return;

    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: true,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 1);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Synced CSS3DRenderer sits BEHIND WebGL so 3D joystick, bezel & cabinet walls occlude the video
    const cssRenderer = new CSS3DRenderer();
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.inset = '0';
    cssRenderer.domElement.style.zIndex = '1';
    cssRenderer.domElement.style.pointerEvents = 'none';
    cssRenderer.domElement.style.overflow = 'hidden';
    cssRenderer.domElement.style.background = 'transparent';
    container.appendChild(cssRenderer.domElement);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.zIndex = '2';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.background = 'transparent';
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;
    const cssScene = new THREE.Scene();

    // Studio Environment Reflection Map for brushed aluminum & cobalt clearcoat
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 360);
    const camera = new THREE.PerspectiveCamera(HOME_FOV, width / height, 0.1, 40);
    camera.position.copy(HOME_CAM_POS);
    renderer.setSize(width, height, false);
    cssRenderer.setSize(width, height);

    // OrbitControls — rotatable hero showcase with clean framing
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(HOME_LOOK_AT);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.72;
    controls.minPolarAngle = 0.88;
    controls.maxPolarAngle = 1.56;
    controls.minAzimuthAngle = -0.82;
    controls.maxAzimuthAngle = 0.82;
    controls.update();

    // Studio 3-Point Lighting Rig tuned for brushed aluminum & Intel cobalt
    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#CBD5E1', 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFFBF4', 2.2);
    keyLight.position.set(4.2, 6.4, 4.8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.025;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 16;
      keyLight.shadow.camera.left = -2.5;
      keyLight.shadow.camera.right = 2.5;
      keyLight.shadow.camera.top = 3.5;
      keyLight.shadow.camera.bottom = -1;
    }
    scene.add(keyLight);

    const cobaltRim = new THREE.DirectionalLight('#38BDF8', 1.15);
    cobaltRim.position.set(-4.2, 3.2, -3.4);
    scene.add(cobaltRim);

    const screenGlowLight = new THREE.PointLight('#00C7FD', 1.2, 3.4, 2);
    screenGlowLight.position.set(0, 1.72, 0.78);
    scene.add(screenGlowLight);

    // Track disposable resources
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };
    const trackTex = <T extends THREE.Texture>(t: T): T => {
      t.anisotropy = maxAnisotropy;
      textures.push(t);
      return t;
    };

    // Custom Intel Silicon Forge procedural textures
    const aluminumTex = trackTex(createBrushedAluminumTexture());
    const leftDecalTex = trackTex(createSideDecalTexture('left'));
    const rightDecalTex = trackTex(createSideDecalTexture('right'));
    const marqueeTex = trackTex(createCoreUltraMarqueeTexture());
    const deckTex = trackTex(createControlDeckTexture());
    const coinDoorTex = trackTex(createCoinDoorTexture());
    const shadowTex = trackTex(createContactShadowTexture());

    // CRT launch-flash CanvasTexture behind / replacing CSS3D video during launch dive
    const crtCanvas = document.createElement('canvas');
    crtCanvas.width = 512;
    crtCanvas.height = 384;
    const crtCtx = crtCanvas.getContext('2d')!;
    drawCrtIdleOrLaunchFrame(crtCtx, 512, 384, 0);
    const crtTex = trackTex(new THREE.CanvasTexture(crtCanvas));
    crtTex.colorSpace = THREE.SRGBColorSpace;

    // Materials — Brushed Aluminum & Intel Cobalt palette
    const brushedAluminumMat = trackMat(
      isSoftwareGl
        ? new THREE.MeshStandardMaterial({
            map: aluminumTex,
            color: '#DCE4EE',
            roughness: 0.34,
            metalness: 0.65,
          })
        : new THREE.MeshPhysicalMaterial({
            map: aluminumTex,
            color: '#E2E8F0',
            roughness: 0.28,
            metalness: 0.78,
            anisotropy: 0.8,
            clearcoat: 0.25,
            clearcoatRoughness: 0.22,
          })
    );

    const darkSlateMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#0F172A',
        roughness: 0.44,
        metalness: 0.32,
      })
    );

    const cobaltTrimMat = trackMat(
      isSoftwareGl
        ? new THREE.MeshStandardMaterial({
            color: '#0068B5',
            emissive: '#003B70',
            emissiveIntensity: 0.25,
            roughness: 0.28,
            metalness: 0.25,
          })
        : new THREE.MeshPhysicalMaterial({
            color: '#0068B5',
            emissive: '#003B70',
            emissiveIntensity: 0.22,
            roughness: 0.22,
            metalness: 0.2,
            clearcoat: 0.85,
            clearcoatRoughness: 0.14,
          })
    );

    const bezelMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#111827',
        roughness: 0.36,
        metalness: 0.28,
      })
    );

    const deckSurfaceMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: deckTex,
        roughness: 0.42,
        metalness: 0.28,
      })
    );

    const chromeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#F1F5F9',
        roughness: 0.14,
        metalness: 0.94,
      })
    );

    const cobaltBtnMat = trackMat(
      isSoftwareGl
        ? new THREE.MeshStandardMaterial({
            color: '#0068B5',
            emissive: '#005291',
            emissiveIntensity: 0.35,
            roughness: 0.22,
            metalness: 0.14,
          })
        : new THREE.MeshPhysicalMaterial({
            color: '#0068B5',
            emissive: '#004B8D',
            emissiveIntensity: 0.35,
            roughness: 0.16,
            metalness: 0.12,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
          })
    );

    const cyanRingMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#00C7FD',
        emissive: '#00C7FD',
        emissiveIntensity: 0.55,
        roughness: 0.24,
      })
    );

    const crtScreenMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0,
        transparent: true,
        blending: THREE.NoBlending,
        depthTest: true,
        depthWrite: true,
      })
    );

    const crtFlashMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: crtTex,
        emissiveMap: crtTex,
        emissive: '#FFFFFF',
        emissiveIntensity: 0.95,
        roughness: 0.2,
        metalness: 0.06,
      })
    );

    const visorMat = trackMat(
      isSoftwareGl
        ? new THREE.MeshStandardMaterial({
            color: '#E0F2FE',
            transparent: true,
            opacity: 0.06,
            roughness: 0.1,
            metalness: 0.1,
          })
        : new THREE.MeshPhysicalMaterial({
            color: '#F8FAFC',
            transparent: true,
            opacity: 0.08,
            roughness: 0.05,
            metalness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.04,
            reflectivity: 0.85,
          })
    );

    const marqueeMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: marqueeTex,
        emissiveMap: marqueeTex,
        emissive: '#FFFFFF',
        emissiveIntensity: 0.55,
        roughness: 0.28,
      })
    );

    const coinDoorMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: coinDoorTex,
        roughness: 0.44,
        metalness: 0.38,
      })
    );

    const leftDecalMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: leftDecalTex,
        roughness: 0.36,
        metalness: 0.22,
      })
    );

    const rightDecalMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: rightDecalTex,
        roughness: 0.36,
        metalness: 0.22,
      })
    );

    // Contact shadow plane on studio floor (y = 0)
    const floorShadowMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      })
    );
    const floorShadow = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(3.45, 3.45)), floorShadowMat);
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.set(0, 0.002, 0.15);
    scene.add(floorShadow);

    // Multi-Part Intel Silicon Forge Arcade Cabinet Group (grounded at y = 0)
    const cabinetGroup = new THREE.Group();
    scene.add(cabinetGroup);

    const interactiveMeshes: THREE.Object3D[] = [];

    // 1. Extruded Arcade Side Profile (Left & Right Brushed Aluminum Flanks)
    const sideShape = new THREE.Shape();
    sideShape.moveTo(-0.72, 0.06);
    sideShape.lineTo(0.62, 0.06);
    sideShape.lineTo(0.62, 1.08);
    sideShape.lineTo(0.84, 1.18);
    sideShape.lineTo(0.84, 1.29);
    sideShape.lineTo(0.46, 1.38);
    sideShape.lineTo(0.42, 2.28);
    sideShape.lineTo(0.68, 2.42);
    sideShape.lineTo(0.64, 2.74);
    sideShape.lineTo(-0.34, 2.78);
    sideShape.lineTo(-0.72, 2.48);
    sideShape.closePath();

    const sideGeo = trackGeo(
      new THREE.ExtrudeGeometry(sideShape, {
        depth: 0.09,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: 2,
      })
    );

    const leftSide = new THREE.Mesh(sideGeo, brushedAluminumMat);
    leftSide.rotation.y = -Math.PI / 2;
    leftSide.position.x = -0.68;
    leftSide.castShadow = true;
    leftSide.receiveShadow = true;
    cabinetGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, brushedAluminumMat);
    rightSide.rotation.y = -Math.PI / 2;
    rightSide.position.x = 0.77;
    rightSide.castShadow = true;
    rightSide.receiveShadow = true;
    cabinetGroup.add(rightSide);

    // Custom Silicon Forge Side-Panel Decal Plates
    const leftDecalPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.1, 2.15)), leftDecalMat);
    leftDecalPlane.rotation.y = -Math.PI / 2;
    leftDecalPlane.position.set(-0.79, 1.25, -0.05);
    cabinetGroup.add(leftDecalPlane);

    const rightDecalPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.1, 2.15)), rightDecalMat);
    rightDecalPlane.rotation.y = Math.PI / 2;
    rightDecalPlane.position.set(0.79, 1.25, -0.05);
    cabinetGroup.add(rightDecalPlane);

    // Cobalt T-molding outer frame trim strips on front edges
    const leftTrim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.034, 2.66, 0.036)), cobaltTrimMat);
    leftTrim.position.set(-0.725, 1.42, 0.62);
    cabinetGroup.add(leftTrim);

    const rightTrim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.034, 2.66, 0.036)), cobaltTrimMat);
    rightTrim.position.set(0.725, 1.42, 0.62);
    cabinetGroup.add(rightTrim);

    // 2. Plinth Base & Cobalt Accent Strip
    const basePlinth = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.44, 0.08, 1.32)), darkSlateMat);
    basePlinth.position.set(0, 0.04, -0.04);
    basePlinth.castShadow = true;
    basePlinth.receiveShadow = true;
    cabinetGroup.add(basePlinth);

    const plinthCobaltLine = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.38, 0.022, 0.02)), cyanRingMat);
    plinthCobaltLine.position.set(0, 0.05, 0.625);
    cabinetGroup.add(plinthCobaltLine);

    // 3. Main Cabinet Core & Back Housing
    const backBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 2.5, 0.86)), darkSlateMat);
    backBody.position.set(0, 1.32, -0.25);
    backBody.castShadow = true;
    backBody.receiveShadow = true;
    cabinetGroup.add(backBody);

    const roofCap = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.4, 0.09, 1.08)), brushedAluminumMat);
    roofCap.position.set(0, 2.74, -0.02);
    roofCap.rotation.x = 0.04;
    cabinetGroup.add(roofCap);

    // 4. Lower Embossed Coin Door Apron
    const apronBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 1.04, 0.56)), darkSlateMat);
    apronBody.position.set(0, 0.59, 0.34);
    apronBody.castShadow = true;
    apronBody.receiveShadow = true;
    cabinetGroup.add(apronBody);

    const coinDoorPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.26, 0.96)), coinDoorMat);
    coinDoorPlane.position.set(0, 0.59, 0.625);
    cabinetGroup.add(coinDoorPlane);
    interactiveMeshes.push(coinDoorPlane);

    // 5. Recessed CRT Bay, WebGL Flash Backing & Synced YouTube CSS3D Screen
    const crtBayGroup = new THREE.Group();
    crtBayGroup.position.set(0, 1.84, 0.34);
    crtBayGroup.rotation.x = -0.24;
    cabinetGroup.add(crtBayGroup);

    const bezelFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 0.96, 0.16)), bezelMat);
    bezelFrame.position.set(0, 0, -0.04);
    crtBayGroup.add(bezelFrame);

    // Cobalt inner bezel accent trim
    const bezelTrimTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.16, 0.016, 0.02)), cobaltTrimMat);
    bezelTrimTop.position.set(0, 0.422, 0.048);
    crtBayGroup.add(bezelTrimTop);

    const bezelTrimBot = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.16, 0.016, 0.02)), cobaltTrimMat);
    bezelTrimBot.position.set(0, -0.422, 0.048);
    crtBayGroup.add(bezelTrimBot);

    const crtScreenMesh = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(WORLD_SCREEN_W, WORLD_SCREEN_H)),
      crtScreenMat
    );
    crtScreenMesh.position.set(0, 0, 0.044);
    crtScreenMesh.renderOrder = 1;
    crtBayGroup.add(crtScreenMesh);
    interactiveMeshes.push(crtScreenMesh);

    // Degauss / phosphor flash plane rendered in front of aperture only during 1.0s launch
    const crtFlashMesh = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(WORLD_SCREEN_W, WORLD_SCREEN_H)),
      crtFlashMat
    );
    crtFlashMesh.position.set(0, 0, 0.047);
    crtFlashMesh.renderOrder = 3;
    crtFlashMesh.visible = false;
    crtBayGroup.add(crtFlashMesh);

    const crtVisorMesh = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(1.14, 0.83)),
      visorMat
    );
    crtVisorMesh.position.set(0, 0, 0.062);
    crtVisorMesh.renderOrder = 2;
    crtBayGroup.add(crtVisorMesh);
    interactiveMeshes.push(crtVisorMesh);

    // Create perspective-locked CSS3D element containing the YouTube IFrame player
    const cssScreenWrapper = document.createElement('div');
    cssScreenWrapper.style.width = `${CSS_SCREEN_W}px`;
    cssScreenWrapper.style.height = `${CSS_SCREEN_H}px`;
    cssScreenWrapper.style.borderRadius = '12px';
    cssScreenWrapper.style.overflow = 'hidden';
    cssScreenWrapper.style.backgroundColor = '#040812';
    cssScreenWrapper.style.position = 'relative';
    cssScreenWrapper.style.pointerEvents = 'none';
    cssScreenWrapper.style.boxShadow = 'inset 0 0 28px rgba(0, 0, 0, 0.72)';
    cssScreenWrapper.style.transition = 'opacity 140ms ease-out';

    const ytMountEl = document.createElement('div');
    ytMountEl.style.width = '100%';
    ytMountEl.style.height = '100%';
    ytMountEl.style.pointerEvents = 'none';
    cssScreenWrapper.appendChild(ytMountEl);

    // Subtle CRT scanlines + glass vignette overlay inside the CSS3D screen (non-blocking)
    const crtScanOverlay = document.createElement('div');
    crtScanOverlay.style.position = 'absolute';
    crtScanOverlay.style.inset = '0';
    crtScanOverlay.style.pointerEvents = 'none';
    crtScanOverlay.style.background =
      'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px), radial-gradient(circle at 50% 45%, rgba(0,199,253,0.04) 55%, rgba(2,6,23,0.52) 100%)';
    cssScreenWrapper.appendChild(crtScanOverlay);

    // Clean Tiny Swords CRT Standby overlay shown cleanly during 5s / 10s inter-video gaps
    const crtStandbyOverlay = document.createElement('div');
    crtStandbyOverlay.style.position = 'absolute';
    crtStandbyOverlay.style.inset = '0';
    crtStandbyOverlay.style.display = 'none';
    crtStandbyOverlay.style.flexDirection = 'column';
    crtStandbyOverlay.style.alignItems = 'center';
    crtStandbyOverlay.style.justifyContent = 'center';
    crtStandbyOverlay.style.gap = '10px';
    crtStandbyOverlay.style.padding = '24px';
    crtStandbyOverlay.style.background =
      'radial-gradient(circle at 50% 40%, #0E294B 0%, #060D1D 70%, #030712 100%)';
    crtStandbyOverlay.style.color = '#F8FAFC';
    crtStandbyOverlay.style.textAlign = 'center';
    crtStandbyOverlay.style.pointerEvents = 'none';
    crtStandbyOverlay.innerHTML =
      '<div style="font:700 12px \'JetBrains Mono\',monospace;letter-spacing:0.18em;color:#38BDF8;text-transform:uppercase;">TINY SWORDS · INTEL CORE ULTRA</div>' +
      '<div data-standby-title style="font:800 22px \'Bricolage Grotesque\',sans-serif;color:#FFFFFF;">Next Showcase Loading...</div>' +
      '<div data-standby-timer style="font:700 13px \'JetBrains Mono\',monospace;color:#FDE68A;">Starting in 5s</div>';
    cssScreenWrapper.appendChild(crtStandbyOverlay);

    const standbyTitleEl = crtStandbyOverlay.querySelector<HTMLElement>('[data-standby-title]');
    const standbyTimerEl = crtStandbyOverlay.querySelector<HTMLElement>('[data-standby-timer]');

    const cssScreenObject = new CSS3DObject(cssScreenWrapper);
    cssScreenObject.scale.set(
      WORLD_SCREEN_W / CSS_SCREEN_W,
      WORLD_SCREEN_H / CSS_SCREEN_H,
      1
    );
    cssScene.add(cssScreenObject);

    // Speaker grille under marquee with cobalt acoustic backing
    const speakerStrip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.34, 0.14, 0.14)), darkSlateMat);
    speakerStrip.position.set(0, 2.34, 0.45);
    speakerStrip.rotation.x = 0.28;
    cabinetGroup.add(speakerStrip);

    // 6. Illuminated Custom Intel Core Ultra Top Marquee Box
    const marqueeBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 0.34, 0.28)), darkSlateMat);
    marqueeBox.position.set(0, 2.57, 0.52);
    marqueeBox.rotation.x = 0.14;
    cabinetGroup.add(marqueeBox);

    const marqueeFace = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.28, 0.28)), marqueeMat);
    marqueeFace.position.set(0, 0, 0.145);
    marqueeBox.add(marqueeFace);
    interactiveMeshes.push(marqueeFace);

    // 7. Angled Control Deck, Classic Chrome Joystick & Cobalt Action Buttons
    const deckGroup = new THREE.Group();
    deckGroup.position.set(0, 1.24, 0.56);
    deckGroup.rotation.x = 0.18;
    cabinetGroup.add(deckGroup);

    const deckBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.38, 0.14, 0.58)), brushedAluminumMat);
    deckBase.castShadow = true;
    deckGroup.add(deckBase);

    const deckTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.32, 0.025, 0.52)), deckSurfaceMat);
    deckTop.position.set(0, 0.075, 0);
    deckGroup.add(deckTop);

    // Front deck cobalt accent rail
    const deckFrontRail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 0.032, 0.024)), cobaltTrimMat);
    deckFrontRail.position.set(0, 0.03, 0.295);
    deckGroup.add(deckFrontRail);

    // Joystick dust washer & chrome collar
    const joyWasher = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.092, 0.098, 0.012, 24)),
      darkSlateMat
    );
    joyWasher.position.set(-0.34, 0.092, 0.03);
    deckGroup.add(joyWasher);

    const joyCollar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.042, 0.056, 0.026, 24)),
      chromeMat
    );
    joyCollar.position.set(-0.34, 0.104, 0.03);
    deckGroup.add(joyCollar);

    // Classic Chrome Stick Pivot + Cobalt Ball Top
    const joystickPivot = new THREE.Group();
    joystickPivot.position.set(-0.34, 0.1, 0.03);
    deckGroup.add(joystickPivot);

    const joyShaft = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.017, 0.017, 0.185, 16)),
      chromeMat
    );
    joyShaft.position.y = 0.092;
    joystickPivot.add(joyShaft);

    const joyBall = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.058, 24, 24)), cobaltBtnMat);
    joyBall.position.y = 0.195;
    joyBall.castShadow = true;
    joystickPivot.add(joyBall);
    interactiveMeshes.push(joyBall);

    // Classic Cobalt Arcade Action Buttons (ATK, NPU, DASH) with subtle cyan bevel rings
    const createCobaltButton = (
      x: number,
      z: number
    ): { cap: THREE.Mesh; baseY: number } => {
      const bezel = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.056, 0.06, 0.022, 24)),
        darkSlateMat
      );
      bezel.position.set(x, 0.092, z);
      deckGroup.add(bezel);

      const glowRing = new THREE.Mesh(
        trackGeo(new THREE.TorusGeometry(0.049, 0.0045, 8, 24)),
        cyanRingMat
      );
      glowRing.rotation.x = Math.PI / 2;
      glowRing.position.set(x, 0.103, z);
      deckGroup.add(glowRing);

      const cap = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.043, 0.047, 0.03, 24)),
        cobaltBtnMat
      );
      const baseY = 0.108;
      cap.position.set(x, baseY, z);
      deckGroup.add(cap);
      interactiveMeshes.push(cap);
      return { cap, baseY };
    };

    const btnAtk = createCobaltButton(0.14, 0.04);
    const btnNpu = createCobaltButton(0.29, -0.025);
    const btnDash = createCobaltButton(0.43, 0.055);

    // Initialize YouTube IFrame Player with 2-video playlist (5s gap after v1, 10s delay after v2)
    let disposed = false;
    playlistIdxRef.current = 0;

    const showStandbyGap = (nextTitle: string, delayMs: number, onGapDone: () => void) => {
      clearPlaylistTimers();
      let remainingSec = Math.ceil(delayMs / 1000);
      if (standbyTitleEl) standbyTitleEl.textContent = nextTitle;
      if (standbyTimerEl) standbyTimerEl.textContent = `Starting in ${remainingSec}s · Click screen to play game`;
      crtStandbyOverlay.style.display = 'flex';

      playlistCountdownRef.current = window.setInterval(() => {
        remainingSec = Math.max(1, remainingSec - 1);
        if (standbyTimerEl) {
          standbyTimerEl.textContent = `Starting in ${remainingSec}s · Click screen to play game`;
        }
      }, 1000);

      playlistGapTimerRef.current = window.setTimeout(() => {
        clearPlaylistTimers();
        if (disposed || isLaunchingRef.current || pausedRef.current) return;
        crtStandbyOverlay.style.display = 'none';
        onGapDone();
      }, delayMs);
    };

    const syncMuteState = (player: YTPlayerInstance) => {
      if (userDesiredMutedRef.current) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(85);
      }
    };

    void loadYouTubeIframeApi().then((YT) => {
      if (disposed || !YT?.Player) return;
      try {
        const firstVideo = YOUTUBE_PLAYLIST[0];
        const player = new YT.Player(ytMountEl, {
          videoId: firstVideo.videoId,
          width: CSS_SCREEN_W,
          height: CSS_SCREEN_H,
          playerVars: {
            autoplay: 1,
            mute: 1,
            start: firstVideo.startSeconds,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            origin: window.location.origin,
          },
          events: {
            onReady: (ev) => {
              if (disposed) {
                try {
                  ev.target.destroy();
                } catch {
                  // Ignore
                }
                return;
              }
              ytPlayerRef.current = ev.target;
              setVideoReady(true);
              crtStandbyOverlay.style.display = 'none';
              try {
                ev.target.seekTo(firstVideo.startSeconds, true);
                if (!isLaunchingRef.current && !pausedRef.current) {
                  syncMuteState(ev.target);
                  ev.target.playVideo();
                } else {
                  ev.target.mute();
                  ev.target.pauseVideo();
                }
              } catch {
                // Ignore
              }
            },
            onStateChange: (ev) => {
              if (disposed) return;
              const endedCode = YT.PlayerState?.ENDED ?? 0;
              const playingCode = YT.PlayerState?.PLAYING ?? 1;
              if (ev.data === playingCode) {
                crtStandbyOverlay.style.display = 'none';
                try {
                  syncMuteState(ev.target);
                } catch {
                  // Ignore
                }
              } else if (ev.data === endedCode && !isLaunchingRef.current && !pausedRef.current) {
                const finishedIdx = playlistIdxRef.current;
                const finishedEntry = YOUTUBE_PLAYLIST[finishedIdx] ?? YOUTUBE_PLAYLIST[0];
                const nextIdx = (finishedIdx + 1) % YOUTUBE_PLAYLIST.length;
                const nextEntry = YOUTUBE_PLAYLIST[nextIdx];

                try {
                  ev.target.pauseVideo();
                } catch {
                  // Ignore
                }

                showStandbyGap(finishedEntry.nextTitle, finishedEntry.gapAfterMs, () => {
                  playlistIdxRef.current = nextIdx;
                  try {
                    ev.target.loadVideoById({
                      videoId: nextEntry.videoId,
                      startSeconds: nextEntry.startSeconds,
                    });
                    syncMuteState(ev.target);
                    ev.target.playVideo();
                  } catch {
                    // Ignore
                  }
                });
              }
            },
          },
        });
        ytPlayerRef.current = player;
      } catch {
        // Fallback to CRT texture if YouTube constructor fails
      }
    });

    // Raycaster & Snappy 1.0s Launch State Machine
    const raycaster = new THREE.Raycaster();
    let isHovered = false;
    let launchState: 'idle' | 'launching' = 'idle';
    let launchElapsed = 0;
    let lastCrtRedraw = 0;

    // Tactile spring state
    let joyTiltX = 0;
    let joyTiltZ = 0;
    let joyVelX = 0;
    let joyVelZ = 0;
    let btnPressAtk = 0;
    let btnPressNpu = 0;
    let btnPressDash = 0;

    const startCabinetLaunch = () => {
      if (launchState === 'launching') return;
      launchState = 'launching';
      isLaunchingRef.current = true;
      launchElapsed = 0;
      controls.enabled = false;

      // Immediately cut YouTube video sound & enable WebGL CRT flash overlay for launch dive
      cutVideoForLaunch();
      cssScreenWrapper.style.opacity = '0';
      crtFlashMesh.visible = true;

      // Snapshot camera start pose for snappy ease-out dive
      _diveStartPos.copy(camera.position);
      _diveStartTarget.copy(controls.target);

      // Microswitch click + CRT degauss chime
      gameAudio.playArcadeClick();
      gameAudio.playArcadePowerOn();

      // Physical deck snap: chrome stick leans + cobalt buttons depress
      joyTiltX = 0.28;
      joyTiltZ = -0.34;
      joyVelX = 0;
      joyVelZ = 0;
      btnPressAtk = 1;
      btnPressNpu = 0.85;
      btnPressDash = 0.7;
    };
    triggerLaunchRef.current = startCabinetLaunch;

    // Pointer drag-vs-click guard + smooth hover-orbit tracking
    const isTouchOrMobile =
      (window.matchMedia?.('(pointer: coarse)')?.matches ?? false) ||
      navigator.maxTouchPoints > 0;
    let downX = 0;
    let downY = 0;
    let lastHoverCheck = 0;
    let isPointerInside = false;
    let hoverTargetX = 0;
    let hoverTargetY = 0;
    let isManualDragging = false;

    const onControlsStart = () => {
      isManualDragging = true;
    };
    const onControlsEnd = () => {
      isManualDragging = false;
    };
    controls.addEventListener('start', onControlsStart);
    controls.addEventListener('end', onControlsEnd);

    const updatePointerNdc = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      _pointerNdc.x = Math.max(-1, Math.min(1, ((ev.clientX - rect.left) / rect.width) * 2 - 1));
      _pointerNdc.y = Math.max(-1, Math.min(1, -((ev.clientY - rect.top) / rect.height) * 2 + 1));
    };

    const onPointerDown = (ev: PointerEvent) => {
      downX = ev.clientX;
      downY = ev.clientY;
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (launchState === 'launching') return;

      updatePointerNdc(ev);
      if (ev.pointerType !== 'touch') {
        isPointerInside = true;
        hoverTargetX = _pointerNdc.x;
        hoverTargetY = _pointerNdc.y;
      }

      const now = performance.now();
      if (now - lastHoverCheck < 45) return;
      lastHoverCheck = now;

      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      const nextHovered = hits.length > 0;
      if (nextHovered !== isHovered) {
        isHovered = nextHovered;
        setHoveredPart(nextHovered);
      }
    };

    const onPointerLeave = () => {
      isPointerInside = false;
      hoverTargetX = 0;
      hoverTargetY = 0;
      if (isHovered) {
        isHovered = false;
        setHoveredPart(false);
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (launchState === 'launching') return;
      const dist = Math.hypot(ev.clientX - downX, ev.clientY - downY);
      if (dist > 7) {
        // User spun the 3D cabinet -> unlock CRT sound cleanly on first interaction
        if (!hasUnlockedAudioRef.current) {
          hasUnlockedAudioRef.current = true;
          userDesiredMutedRef.current = false;
          setVideoMuted(false);
          try {
            ytPlayerRef.current?.unMute();
            ytPlayerRef.current?.setVolume(85);
            ytPlayerRef.current?.playVideo();
          } catch {
            // Ignore
          }
        }
        return;
      }

      updatePointerNdc(ev);
      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0) {
        cutVideoForLaunch();
        onRequestLaunchRef.current();
      } else if (!hasUnlockedAudioRef.current) {
        hasUnlockedAudioRef.current = true;
        userDesiredMutedRef.current = false;
        setVideoMuted(false);
        try {
          ytPlayerRef.current?.unMute();
          ytPlayerRef.current?.setVolume(85);
          ytPlayerRef.current?.playVideo();
        } catch {
          // Ignore
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Visibility & Viewport observers
    let isInViewport = true;
    let isDocumentVisible = !document.hidden;
    let contextLost = false;

    const io = new IntersectionObserver(
      (entries) => {
        isInViewport = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    const onVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Responsive ResizeObserver updating both WebGL and CSS3D renderers
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.floor(entry.contentRect.width), 100);
      const h = Math.max(Math.floor(entry.contentRect.height), 100);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      cssRenderer.setSize(w, h);
    });
    ro.observe(container);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    let prevPaused = pausedRef.current;
    let rafId = 0;
    let softwareTimerId = 0;
    let prevTime = performance.now();
    let elapsedTotal = 0;

    const resetFromModalClose = () => {
      launchState = 'idle';
      isLaunchingRef.current = false;
      launchElapsed = 0;
      camera.position.copy(HOME_CAM_POS);
      camera.fov = HOME_FOV;
      camera.updateProjectionMatrix();
      controls.target.copy(HOME_LOOK_AT);
      controls.enabled = true;
      controls.update();
      drawCrtIdleOrLaunchFrame(crtCtx, 512, 384, 0);
      crtTex.needsUpdate = true;
      crtFlashMesh.visible = false;

      // Restore YouTube CRT playlist from Video 1 at t=42s
      clearPlaylistTimers();
      playlistIdxRef.current = 0;
      crtStandbyOverlay.style.display = 'none';
      cssScreenWrapper.style.opacity = '1';
      const p = ytPlayerRef.current;
      if (p) {
        try {
          const firstVideo = YOUTUBE_PLAYLIST[0];
          p.loadVideoById({ videoId: firstVideo.videoId, startSeconds: firstVideo.startSeconds });
          if (userDesiredMutedRef.current) p.mute();
          else {
            p.unMute();
            p.setVolume(85);
          }
          p.playVideo();
        } catch {
          // Ignore
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      if (prevPaused && !pausedRef.current) {
        resetFromModalClose();
      }
      prevPaused = pausedRef.current;

      const canRender = !pausedRef.current && isInViewport && isDocumentVisible && !contextLost;

      if (canRender) {
        elapsedTotal += dt;

        if (launchState === 'idle') {
          cabinetGroup.position.y = Math.sin(elapsedTotal * 1.4) * 0.012;
          const targetHoverTilt = isHovered ? Math.sin(elapsedTotal * 8) * 0.08 : 0;
          joyTiltX += (targetHoverTilt - joyTiltX) * Math.min(1, dt * 8);
          joyTiltZ += ((isHovered ? -0.08 : 0) - joyTiltZ) * Math.min(1, dt * 8);

          if (!isManualDragging && !isTouchOrMobile) {
            const targetTheta = isPointerInside
              ? THREE.MathUtils.clamp(0.18 + hoverTargetX * 0.62, -0.78, 0.80)
              : HOME_SPHERICAL.theta;
            const targetPhi = isPointerInside
              ? THREE.MathUtils.clamp(HOME_SPHERICAL.phi - hoverTargetY * 0.16, 0.92, 1.50)
              : HOME_SPHERICAL.phi;

            _hoverOffset.copy(camera.position).sub(controls.target);
            _hoverSpherical.setFromVector3(_hoverOffset);
            _hoverSpherical.theta = THREE.MathUtils.damp(
              _hoverSpherical.theta,
              targetTheta,
              5.2,
              dt
            );
            _hoverSpherical.phi = THREE.MathUtils.damp(_hoverSpherical.phi, targetPhi, 5.2, dt);
            _hoverSpherical.radius = THREE.MathUtils.damp(
              _hoverSpherical.radius,
              HOME_SPHERICAL.radius,
              5.2,
              dt
            );
            _hoverOffset.setFromSpherical(_hoverSpherical);
            camera.position.copy(controls.target).add(_hoverOffset);
            camera.lookAt(controls.target);
          } else {
            controls.update();
          }
        } else {
          // 1.0s Snappy Ease-Out Camera Dive + CRT Flash
          launchElapsed += dt;
          const progress = Math.min(1, launchElapsed / LAUNCH_DURATION_SEC);
          const diveEase = 1 - Math.pow(1 - progress, 3.2);

          // Spring-back joystick
          const k = 90;
          const damp = 10.5;
          joyVelX += (-k * joyTiltX - damp * joyVelX) * dt;
          joyVelZ += (-k * joyTiltZ - damp * joyVelZ) * dt;
          joyTiltX += joyVelX * dt;
          joyTiltZ += joyVelZ * dt;

          // Button rebound
          btnPressAtk = Math.max(0, btnPressAtk - dt * 2.4);
          btnPressNpu = Math.max(0, btnPressNpu - dt * 2.2);
          btnPressDash = Math.max(0, btnPressDash - dt * 2.6);

          crtScreenMesh.updateWorldMatrix(true, false);
          crtScreenMesh.getWorldPosition(_screenWorldPos);
          _screenForward.setFromMatrixColumn(crtScreenMesh.matrixWorld, 2).normalize();
          _camTargetPos.copy(_screenWorldPos).addScaledVector(_screenForward, 0.32);
          _lookTarget.copy(_screenWorldPos);

          camera.position.lerpVectors(_diveStartPos, _camTargetPos, diveEase);
          controls.target.lerpVectors(_diveStartTarget, _lookTarget, diveEase);
          camera.lookAt(controls.target);

          camera.fov = THREE.MathUtils.lerp(HOME_FOV, DIVE_FOV, diveEase);
          camera.updateProjectionMatrix();

          if (progress >= 1) {
            launchState = 'idle';
            onLaunchCompleteRef.current();
          }
        }

        // Apply joystick & cobalt button kinematics
        joystickPivot.rotation.z = -joyTiltX;
        joystickPivot.rotation.x = joyTiltZ;
        btnAtk.cap.position.y = btnAtk.baseY - btnPressAtk * 0.018;
        btnNpu.cap.position.y = btnNpu.baseY - btnPressNpu * 0.018;
        btnDash.cap.position.y = btnDash.baseY - btnPressDash * 0.018;

        // Sync CSS3D YouTube screen transform cleanly to CRT world matrix
        cabinetGroup.updateMatrixWorld(true);
        crtScreenMesh.getWorldPosition(_screenWorldPos);
        crtScreenMesh.getWorldQuaternion(_screenWorldQuat);
        _screenForward.setFromMatrixColumn(crtScreenMesh.matrixWorld, 2).normalize();
        cssScreenObject.position.copy(_screenWorldPos).addScaledVector(_screenForward, 0.002);
        cssScreenObject.quaternion.copy(_screenWorldQuat);

        // Redraw CRT flash canvas during launch
        const redrawIntervalMs = launchState === 'launching' ? 16 : 250;
        if (now - lastCrtRedraw >= redrawIntervalMs) {
          lastCrtRedraw = now;
          const lp =
            launchState === 'launching' ? Math.min(1, launchElapsed / LAUNCH_DURATION_SEC) : 0;
          if (lp > 0) {
            drawCrtIdleOrLaunchFrame(crtCtx, 512, 384, lp);
            crtTex.needsUpdate = true;
          }
          screenGlowLight.intensity = lp > 0 ? 1.85 + lp * 1.6 : isHovered ? 1.45 : 1.15;
        }

        renderer.render(scene, camera);
        cssRenderer.render(cssScene, camera);
      }

      if (isSoftwareGl) {
        softwareTimerId = window.setTimeout(() => {
          rafId = window.requestAnimationFrame(tick);
        }, 64);
      } else {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      clearPlaylistTimers();
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(softwareTimerId);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignore
        }
        ytPlayerRef.current = null;
      }

      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('end', onControlsEnd);
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      if (cssRenderer.domElement.parentNode === container) {
        container.removeChild(cssRenderer.domElement);
      }
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || webglFailed) {
    return (
      <div className="relative flex h-full min-h-[420px] w-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#111827] bg-[#0B1220] text-left shadow-[6px_6px_0px_#111827] dark:border-[#334155] dark:shadow-[6px_6px_0px_#020617]">
        <div className="relative flex-1 overflow-hidden bg-[#040812]">
          <img
            src={EDITORIAL_ART_URLS.heroGateway}
            alt="Byte confronting the Lag Titan inside the Intel Core Ultra showcase."
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-90"
          />
        </div>
        <div className="flex items-center justify-between gap-4 border-t-2 border-[#111827] bg-[#FAF8F5] px-5 py-4 dark:border-[#334155] dark:bg-[#111827]">
          <div>
            <div className="font-editorial text-xl font-bold text-[#111827] dark:text-[#F8FAFC]">
              Byte vs. The Lag Titan
            </div>
            <div className="text-xs font-medium text-[#4B5563] dark:text-[#94A3B8]">
              Play the story and rescue Silicon City
            </div>
          </div>
          <button
            type="button"
            data-arcade-launch="true"
            onClick={onRequestLaunch}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-[#111827] bg-[#0068B5] px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_#111827] dark:border-[#38BDF8] whitespace-nowrap shrink-0"
          >
            <Shield className="h-4 w-4" />
            <span>Play</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme-mode={darkMode ? 'dark' : 'light'}
      className="relative h-full min-h-[430px] w-full overflow-hidden bg-transparent"
    >
      {/* Dedicated WebGL + Synced CSS3D Mount Container */}
      <div
        ref={mountRef}
        className={`relative h-full min-h-[430px] w-full bg-transparent ${hoveredPart ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
        aria-label="Interactive 3D Intel Core Ultra Arcade Machine. Hover to orbit or click the screen or buttons to launch gameplay."
      />

      {/* Discreet Corner Video Audio Toggle */}
      {videoReady && (
        <button
          type="button"
          data-crt-audio-toggle="true"
          onClick={handleToggleVideoAudio}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/75 px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow-xs backdrop-blur-md transition-colors hover:border-[#0068B5]/40 hover:text-[#0068B5] dark:border-white/15 dark:bg-slate-950/60 dark:text-white dark:hover:border-[#38BDF8]/50 dark:hover:text-[#38BDF8] whitespace-nowrap shrink-0"
        >
          {globalMuted || videoMuted ? (
            <>
              <VolumeX className="h-3.5 w-3.5 text-[#0068B5] dark:text-[#38BDF8]" />
              <span>{globalMuted ? 'Muted' : 'Tap anywhere for sound'}</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5 text-[#0068B5] dark:text-[#38BDF8]" />
              <span>Sound On</span>
            </>
          )}
        </button>
      )}

      {/* Theme-Aware Floating HUD Pills */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/75 px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow-xs backdrop-blur-md transition-colors dark:border-white/15 dark:bg-slate-950/60 dark:text-white whitespace-nowrap shrink-0">
        <Rotate3d className="h-3.5 w-3.5 text-[#0068B5] dark:text-[#38BDF8]" />
        <span>Hover to orbit</span>
      </div>

      <button
        type="button"
        data-arcade-launch="true"
        onClick={() => {
          cutVideoForLaunch();
          onRequestLaunch();
        }}
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-xs backdrop-blur-md transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0068B5]/40 hover:text-[#0068B5] dark:border-white/15 dark:bg-slate-950/60 dark:text-white dark:hover:border-[#38BDF8]/50 dark:hover:text-[#38BDF8] whitespace-nowrap shrink-0"
      >
        <Play className="h-3.5 w-3.5 fill-[#0068B5] text-[#0068B5] dark:fill-[#38BDF8] dark:text-[#38BDF8]" />
        <span>Play Arcade</span>
      </button>
    </div>
  );
}
