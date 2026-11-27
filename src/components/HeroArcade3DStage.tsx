import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Play, Rotate3d, Shield } from 'lucide-react';
import { EDITORIAL_ART_URLS } from '../game/assets';
import { gameAudio } from '../game/audio';

interface HeroArcade3DStageProps {
  launchNonce: number;
  paused: boolean;
  onLaunchComplete: () => void;
  onRequestLaunch: () => void;
}

// Pre-allocated scratch vectors for zero-GC animation loop
const _camTargetPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _screenWorldPos = new THREE.Vector3();
const _screenForward = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();

const HOME_CAM_POS = new THREE.Vector3(2.45, 2.55, 4.35);
const HOME_LOOK_AT = new THREE.Vector3(0, 1.48, 0.05);
const HOME_FOV = 38;
const DIVE_FOV = 54;
const LAUNCH_DURATION_SEC = 1.5;

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

function createParchmentGrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#F4EFE6';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle warm paper speckles & hairline grain
  for (let i = 0; i < 1600; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.cos(i * 78.233) * 19341.231) % 1;
    const px = Math.abs(x) * 256;
    const py = Math.abs(y) * 256;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(17, 24, 39, 0.045)' : 'rgba(217, 199, 173, 0.25)';
    ctx.fillRect(px, py, 1.5, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createMarqueeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm illuminated parchment marquee with Cobalt & Charcoal ink graphics
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, '#005291');
  grad.addColorStop(0.5, '#0068B5');
  grad.addColorStop(1, '#005291');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 256);

  // Inner parchment plaque
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(28, 24, 968, 208);
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 10;
  ctx.strokeRect(28, 24, 968, 208);

  // Accent corner stripes
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(48, 42, 18, 172);
  ctx.fillRect(958, 42, 18, 172);

  // Title typography
  ctx.fillStyle = '#111827';
  ctx.textAlign = 'center';
  ctx.font = '900 92px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.fillText('JEVTEL', 512, 128);

  ctx.fillStyle = '#0068B5';
  ctx.font = '800 34px "JetBrains Mono", monospace';
  ctx.fillText('BYTE VS. THE LAG TITAN · INSERT QUEST', 512, 186);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createApronTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#EFE9DD';
  ctx.fillRect(0, 0, 512, 512);

  // Blueprint grid
  ctx.strokeStyle = 'rgba(17, 24, 39, 0.08)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Coin-door style embossed frame
  ctx.fillStyle = '#141824';
  ctx.fillRect(106, 92, 300, 310);
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 8;
  ctx.strokeRect(106, 92, 300, 310);

  // Left & Right glowing amber coin slots
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(138, 146, 94, 152);
  ctx.fillRect(280, 146, 94, 152);

  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(156, 174, 58, 36);
  ctx.fillRect(298, 174, 58, 36);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PLAY', 185, 198);
  ctx.fillText('FREE', 327, 198);

  // Intel Core Ultra badge at bottom
  ctx.fillStyle = '#0068B5';
  ctx.fillRect(148, 336, 216, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('CORE ULTRA INSIDE', 256, 363);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 124);
  grad.addColorStop(0, 'rgba(17, 24, 39, 0.36)');
  grad.addColorStop(0.55, 'rgba(17, 24, 39, 0.14)');
  grad.addColorStop(1, 'rgba(17, 24, 39, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function drawCrtScreenFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  launchProgress: number,
  hovered: boolean
): void {
  // Deep CRT night sky background
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#07101F');
  sky.addColorStop(0.65, '#0F2544');
  sky.addColorStop(1, '#1A345B');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Subtle retro grid horizon
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
  ctx.lineWidth = 2;
  const horizonY = h * 0.72;
  ctx.fillStyle = '#0B172A';
  ctx.fillRect(0, horizonY, w, h - horizonY);
  for (let i = -4; i <= 12; i++) {
    const xTop = w * 0.5 + (i - 4) * 44;
    const xBot = w * 0.5 + (i - 4) * 118;
    ctx.beginPath();
    ctx.moveTo(xTop, horizonY);
    ctx.lineTo(xBot, h);
    ctx.stroke();
  }
  const scrollOff = (time * 36) % 28;
  for (let y = horizonY + scrollOff; y < h; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Animated Pixel Knight Byte (Left)
  const bob = Math.sin(time * 4.2) * 7;
  const bx = w * 0.27;
  const by = horizonY - 62 + bob;

  // Byte glowing Cobalt aura
  const aura = ctx.createRadialGradient(bx + 18, by + 26, 6, bx + 18, by + 26, 68);
  aura.addColorStop(0, 'rgba(56, 189, 248, 0.48)');
  aura.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(bx + 18, by + 26, 68, 0, Math.PI * 2);
  ctx.fill();

  // Byte body & shield (crisp pixel silhouette)
  ctx.fillStyle = '#0068B5';
  ctx.fillRect(bx, by + 16, 40, 44);
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(bx + 6, by, 28, 22);
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(bx + 14, by + 6, 16, 8);
  // Shield
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(bx + 36, by + 18, 16, 36);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx + 36, by + 18, 16, 36);

  // Lag Titan Boss (Right)
  const bossBob = Math.cos(time * 3.1) * 9;
  const tx = w * 0.69;
  const ty = horizonY - 108 + bossBob;
  const bossGlow = ctx.createRadialGradient(tx + 34, ty + 46, 10, tx + 34, ty + 46, 92);
  bossGlow.addColorStop(0, 'rgba(239, 68, 68, 0.42)');
  bossGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = bossGlow;
  ctx.beginPath();
  ctx.arc(tx + 34, ty + 46, 92, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1E1B2E';
  ctx.fillRect(tx, ty + 18, 72, 86);
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(tx + 12, ty + 32, 16, 10);
  ctx.fillRect(tx + 42, ty + 32, 16, 10);
  // Thermal warning horns
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(tx - 6, ty + 4, 14, 24);
  ctx.fillRect(tx + 64, ty + 4, 14, 24);

  // Energy arc between Byte & Lag Titan
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bx + 54, by + 34);
  ctx.quadraticCurveTo(w * 0.5, horizonY - 76 + Math.sin(time * 9) * 16, tx - 8, ty + 48);
  ctx.stroke();

  // Top HUD bar inside CRT
  ctx.fillStyle = 'rgba(11, 21, 36, 0.85)';
  ctx.fillRect(24, 22, w - 48, 44);
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 22, w - 48, 44);

  ctx.fillStyle = '#FAF8F5';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('BYTE  HP 100%', 40, 50);
  ctx.fillStyle = '#F59E0B';
  ctx.textAlign = 'right';
  ctx.fillText('LAG TITAN', w - 40, 50);

  // Center CTA banner on screen
  const blink = hovered || Math.sin(time * 4.5) > -0.25;
  if (blink) {
    ctx.fillStyle = hovered ? '#0068B5' : 'rgba(0, 104, 181, 0.92)';
    ctx.fillRect(w * 0.5 - 165, h * 0.25, 330, 56);
    ctx.strokeStyle = '#FAF8F5';
    ctx.lineWidth = 3;
    ctx.strokeRect(w * 0.5 - 165, h * 0.25, 330, 56);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS TO LAUNCH', w * 0.5, h * 0.25 + 36);
  }

  // Authentic CRT scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1.5);
  }

  // Beat 2 CRT Power-On Degauss Flicker & Phosphor Line Burst during launch (1.5s pacing)
  if (launchProgress > 0) {
    if (launchProgress < 0.36) {
      // Classic horizontal CRT collapse/expand warm-up flash
      const bandT = launchProgress / 0.36;
      const bandH = Math.max(10, h * Math.pow(bandT, 1.35));
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, (h - bandH) * 0.5);
      ctx.fillRect(0, (h + bandH) * 0.5, w, (h - bandH) * 0.5);
      ctx.fillStyle = `rgba(224, 242, 254, ${Math.max(0.25, 0.9 - bandT * 0.55)})`;
      ctx.fillRect(0, (h - bandH) * 0.5, w, bandH);
    } else {
      // Gentle phosphor bloom ramping smoothly as camera dives into screen
      const flashAlpha = Math.min(0.92, Math.max(0, (launchProgress - 0.52) * 1.65));
      ctx.fillStyle = `rgba(250, 248, 245, ${flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }
  }
}

export function HeroArcade3DStage({
  launchNonce,
  paused,
  onLaunchComplete,
  onRequestLaunch,
}: HeroArcade3DStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [hoveredPart, setHoveredPart] = useState(false);
  const [prefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  // Refs synced to latest props so Three.js mounts once cleanly
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const onLaunchCompleteRef = useRef(onLaunchComplete);
  onLaunchCompleteRef.current = onLaunchComplete;
  const onRequestLaunchRef = useRef(onRequestLaunch);
  onRequestLaunchRef.current = onRequestLaunch;

  const triggerLaunchRef = useRef<(() => void) | null>(null);
  const lastHandledNonceRef = useRef(launchNonce);

  useEffect(() => {
    if (launchNonce !== lastHandledNonceRef.current) {
      lastHandledNonceRef.current = launchNonce;
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
    renderer.toneMappingExposure = 1.06;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FAF8F5');

    // Mandatory studio Environment Reflection Map
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

    // OrbitControls — rotatable hero showcase with tight framing
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(HOME_LOOK_AT);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.72;
    controls.minPolarAngle = 0.88;
    controls.maxPolarAngle = 1.56;
    controls.minAzimuthAngle = -0.82;
    controls.maxAzimuthAngle = 0.82;
    controls.update();

    // Studio 3-Point Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#FFFDF9', '#D6CFC2', 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF6EA', 2.05);
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

    const cobaltRim = new THREE.DirectionalLight('#60A5FA', 0.9);
    cobaltRim.position.set(-4.2, 3.2, -3.4);
    scene.add(cobaltRim);

    const screenGlowLight = new THREE.PointLight('#38BDF8', 1.1, 3.2, 2);
    screenGlowLight.position.set(0, 1.72, 0.72);
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

    // Procedural textures
    const parchmentTex = trackTex(createParchmentGrainTexture());
    const marqueeTex = trackTex(createMarqueeTexture());
    const apronTex = trackTex(createApronTexture());
    const shadowTex = trackTex(createContactShadowTexture());

    // Dynamic animated CRT canvas texture
    const crtCanvas = document.createElement('canvas');
    crtCanvas.width = 512;
    crtCanvas.height = 384;
    const crtCtx = crtCanvas.getContext('2d')!;
    drawCrtScreenFrame(crtCtx, 512, 384, 0, 0, false);
    const crtTex = trackTex(new THREE.CanvasTexture(crtCanvas));
    crtTex.colorSpace = THREE.SRGBColorSpace;

    // Materials
    const parchmentMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: parchmentTex,
        color: '#F6F1E7',
        roughness: 0.78,
        metalness: 0.04,
      })
    );
    const darkInkMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#111827',
        roughness: 0.52,
        metalness: 0.12,
      })
    );
    const bezelMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#181E2B',
        roughness: 0.42,
        metalness: 0.18,
      })
    );
    const deckSurfaceMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#E5DEC9',
        roughness: 0.62,
        metalness: 0.08,
      })
    );
    const chromeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#E2E8F0',
        roughness: 0.22,
        metalness: 0.88,
      })
    );
    const cobaltBtnMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#0068B5',
        emissive: '#004A87',
        emissiveIntensity: 0.25,
        roughness: 0.26,
        metalness: 0.12,
      })
    );
    const amberBtnMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#F59E0B',
        emissive: '#B45309',
        emissiveIntensity: 0.25,
        roughness: 0.26,
        metalness: 0.12,
      })
    );
    const emeraldBtnMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#10B981',
        emissive: '#047857',
        emissiveIntensity: 0.2,
        roughness: 0.28,
        metalness: 0.1,
      })
    );
    const crtScreenMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: crtTex,
        emissiveMap: crtTex,
        emissive: '#FFFFFF',
        emissiveIntensity: 0.92,
        roughness: 0.22,
        metalness: 0.05,
      })
    );
    const visorMat = trackMat(
      isSoftwareGl
        ? new THREE.MeshStandardMaterial({
            color: '#E0F2FE',
            transparent: true,
            opacity: 0.1,
            roughness: 0.12,
            metalness: 0.15,
          })
        : new THREE.MeshPhysicalMaterial({
            color: '#F8FAFC',
            transparent: true,
            opacity: 0.14,
            roughness: 0.06,
            metalness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            reflectivity: 0.9,
          })
    );
    const marqueeMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: marqueeTex,
        emissiveMap: marqueeTex,
        emissive: '#FFFFFF',
        emissiveIntensity: 0.45,
        roughness: 0.35,
      })
    );
    const apronMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: apronTex,
        roughness: 0.72,
        metalness: 0.08,
      })
    );

    // Contact shadow plane on studio floor (y = 0)
    const floorShadowMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      })
    );
    const floorShadow = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(3.4, 3.4)), floorShadowMat);
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.set(0, 0.002, 0.15);
    scene.add(floorShadow);

    // Assemble Multi-Part Arcade Cabinet Group (grounded at y = 0)
    const cabinetGroup = new THREE.Group();
    scene.add(cabinetGroup);

    const interactiveMeshes: THREE.Object3D[] = [];

    // 1. Extruded Arcade Side Profile (Left & Right Warm Parchment Walls)
    const sideShape = new THREE.Shape();
    sideShape.moveTo(-0.72, 0.06);
    sideShape.lineTo(0.62, 0.06);
    sideShape.lineTo(0.62, 1.08); // Front lower apron
    sideShape.lineTo(0.84, 1.18); // Protruding front control deck lip
    sideShape.lineTo(0.84, 1.29); // Deck top edge
    sideShape.lineTo(0.46, 1.38); // Slant back into monitor recess
    sideShape.lineTo(0.42, 2.28); // CRT bezel top
    sideShape.lineTo(0.68, 2.42); // Marquee lower overhang
    sideShape.lineTo(0.64, 2.74); // Marquee top front
    sideShape.lineTo(-0.34, 2.78); // Crown top
    sideShape.lineTo(-0.72, 2.48); // Upper back bevel
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

    // Note: ExtrudeGeometry extrudes in +Z, rotate -90 deg on Y so profile lies in Z-Y plane!
    const leftSide = new THREE.Mesh(sideGeo, parchmentMat);
    leftSide.rotation.y = -Math.PI / 2;
    leftSide.position.x = -0.68;
    leftSide.castShadow = true;
    leftSide.receiveShadow = true;
    cabinetGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, parchmentMat);
    rightSide.rotation.y = -Math.PI / 2;
    rightSide.position.x = 0.77;
    rightSide.castShadow = true;
    rightSide.receiveShadow = true;
    cabinetGroup.add(rightSide);

    // Charcoal ink T-molding outer frame trim strips on front edges
    const leftTrim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.032, 2.68, 0.035)), darkInkMat);
    leftTrim.position.set(-0.725, 1.42, 0.62);
    cabinetGroup.add(leftTrim);

    const rightTrim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.032, 2.68, 0.035)), darkInkMat);
    rightTrim.position.set(0.725, 1.42, 0.62);
    cabinetGroup.add(rightTrim);

    // 2. Plinth Base & Feet
    const basePlinth = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.42, 0.08, 1.3)), darkInkMat);
    basePlinth.position.set(0, 0.04, -0.04);
    basePlinth.castShadow = true;
    basePlinth.receiveShadow = true;
    cabinetGroup.add(basePlinth);

    // 3. Main Cabinet Core & Back Housing
    const backBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 2.5, 0.86)), parchmentMat);
    backBody.position.set(0, 1.32, -0.25);
    backBody.castShadow = true;
    backBody.receiveShadow = true;
    cabinetGroup.add(backBody);

    // Roof cap
    const roofCap = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.38, 0.09, 1.06)), darkInkMat);
    roofCap.position.set(0, 2.74, -0.02);
    roofCap.rotation.x = 0.04;
    cabinetGroup.add(roofCap);

    // 4. Lower Coin / Graphic Apron
    const apronBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 1.04, 0.56)), parchmentMat);
    apronBody.position.set(0, 0.59, 0.34);
    apronBody.castShadow = true;
    apronBody.receiveShadow = true;
    cabinetGroup.add(apronBody);

    const apronArtPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.24, 0.94)), apronMat);
    apronArtPlane.position.set(0, 0.59, 0.625);
    cabinetGroup.add(apronArtPlane);

    // 5. Recessed CRT Bay, Animated Screen & Curved Clearcoat Glass Visor
    const crtBayGroup = new THREE.Group();
    crtBayGroup.position.set(0, 1.84, 0.32);
    crtBayGroup.rotation.x = -0.24; // Ergonomic upward CRT tilt
    cabinetGroup.add(crtBayGroup);

    const bezelFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 0.96, 0.22)), bezelMat);
    bezelFrame.position.set(0, 0, -0.06);
    crtBayGroup.add(bezelFrame);

    // Inner dark recessed lip
    const crtScreenMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.12, 0.82)), crtScreenMat);
    crtScreenMesh.position.set(0, 0, 0.056);
    crtBayGroup.add(crtScreenMesh);
    interactiveMeshes.push(crtScreenMesh);

    const crtVisorMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.16, 0.85)), visorMat);
    crtVisorMesh.position.set(0, 0, 0.072);
    crtBayGroup.add(crtVisorMesh);
    interactiveMeshes.push(crtVisorMesh);

    // Speaker grille under CRT
    const speakerStrip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.34, 0.14, 0.14)), darkInkMat);
    speakerStrip.position.set(0, 2.34, 0.45);
    speakerStrip.rotation.x = 0.28;
    cabinetGroup.add(speakerStrip);

    // 6. Illuminated Top Marquee Box
    const marqueeBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 0.34, 0.28)), darkInkMat);
    marqueeBox.position.set(0, 2.57, 0.52);
    marqueeBox.rotation.x = 0.14;
    cabinetGroup.add(marqueeBox);

    const marqueeFace = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.28, 0.28)), marqueeMat);
    marqueeFace.position.set(0, 0, 0.145);
    marqueeBox.add(marqueeFace);
    interactiveMeshes.push(marqueeFace);

    // 7. Angled Tactile Control Deck, Spring Joystick & Reactive Arcade Buttons
    const deckGroup = new THREE.Group();
    deckGroup.position.set(0, 1.24, 0.56);
    deckGroup.rotation.x = 0.18;
    cabinetGroup.add(deckGroup);

    const deckBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.38, 0.14, 0.58)), darkInkMat);
    deckBase.castShadow = true;
    deckGroup.add(deckBase);

    const deckTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.32, 0.025, 0.52)), deckSurfaceMat);
    deckTop.position.set(0, 0.075, 0);
    deckGroup.add(deckTop);

    // Joystick base collar
    const joyCollar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.085, 0.095, 0.03, 24)),
      darkInkMat
    );
    joyCollar.position.set(-0.34, 0.095, 0.04);
    deckGroup.add(joyCollar);

    // Joystick pivot assembly (rotates cleanly on spring physics)
    const joystickPivot = new THREE.Group();
    joystickPivot.position.set(-0.34, 0.1, 0.04);
    deckGroup.add(joystickPivot);

    const joyShaft = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.17, 16)),
      chromeMat
    );
    joyShaft.position.y = 0.085;
    joystickPivot.add(joyShaft);

    const joyBall = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.056, 24, 24)), cobaltBtnMat);
    joyBall.position.y = 0.185;
    joyBall.castShadow = true;
    joystickPivot.add(joyBall);
    interactiveMeshes.push(joyBall);

    // Arcade Buttons (Cobalt Attack, Amber Boost, Emerald Dash)
    const createArcadeButton = (
      x: number,
      z: number,
      capMat: THREE.Material
    ): { cap: THREE.Mesh; baseY: number } => {
      const housing = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.054, 0.058, 0.024, 20)),
        darkInkMat
      );
      housing.position.set(x, 0.092, z);
      deckGroup.add(housing);

      const cap = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.042, 0.046, 0.032, 20)),
        capMat
      );
      const baseY = 0.108;
      cap.position.set(x, baseY, z);
      deckGroup.add(cap);
      interactiveMeshes.push(cap);
      return { cap, baseY };
    };

    const btnCobalt = createArcadeButton(0.14, 0.05, cobaltBtnMat);
    const btnAmber = createArcadeButton(0.29, -0.02, amberBtnMat);
    const btnEmerald = createArcadeButton(0.43, 0.06, emeraldBtnMat);

    // Raycaster & Launch State Machine
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
    let btnPressCobalt = 0;
    let btnPressAmber = 0;
    let btnPressEmerald = 0;

    const startCabinetLaunch = () => {
      if (launchState === 'launching') return;
      launchState = 'launching';
      launchElapsed = 0;
      controls.enabled = false;

      // Crisp Odama-inspired microswitch click + CRT degauss chime
      gameAudio.playArcadeClick();
      gameAudio.playArcadePowerOn();

      // Physical deck snap: joystick pushes diagonally + arcade buttons depress
      joyTiltX = 0.28;
      joyTiltZ = -0.34;
      joyVelX = 0;
      joyVelZ = 0;
      btnPressCobalt = 1;
      btnPressAmber = 0.85;
      btnPressEmerald = 0.65;
    };
    triggerLaunchRef.current = startCabinetLaunch;

    // Pointer drag-vs-click guard so OrbitControls drag never triggers launch
    let downX = 0;
    let downY = 0;
    let lastHoverCheck = 0;

    const updatePointerNdc = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (ev: PointerEvent) => {
      downX = ev.clientX;
      downY = ev.clientY;
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (launchState === 'launching') return;
      const now = performance.now();
      if (now - lastHoverCheck < 45) return;
      lastHoverCheck = now;

      updatePointerNdc(ev);
      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      const nextHovered = hits.length > 0;
      if (nextHovered !== isHovered) {
        isHovered = nextHovered;
        setHoveredPart(nextHovered);
      }
    };

    const onPointerLeave = () => {
      if (isHovered) {
        isHovered = false;
        setHoveredPart(false);
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (launchState === 'launching') return;
      const dist = Math.hypot(ev.clientX - downX, ev.clientY - downY);
      if (dist > 7) return; // User rotated the 3D cabinet

      updatePointerNdc(ev);
      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0) {
        onRequestLaunchRef.current();
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Visibility & Viewport observers so offscreen/modal state never burns CPU/GPU
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

    // Responsive ResizeObserver
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.floor(entry.contentRect.width), 100);
      const h = Math.max(Math.floor(entry.contentRect.height), 100);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    ro.observe(container);

    // WebGL context loss safety
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
      launchElapsed = 0;
      camera.position.copy(HOME_CAM_POS);
      camera.fov = HOME_FOV;
      camera.updateProjectionMatrix();
      controls.target.copy(HOME_LOOK_AT);
      controls.enabled = true;
      controls.update();
      drawCrtScreenFrame(crtCtx, 512, 384, elapsedTotal, 0, isHovered);
      crtTex.needsUpdate = true;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      if (prevPaused && !pausedRef.current) {
        // Modal closed -> cleanly reset cabinet camera back to hero framing
        resetFromModalClose();
      }
      prevPaused = pausedRef.current;

      const canRender = !pausedRef.current && isInViewport && isDocumentVisible && !contextLost;

      if (canRender) {
        elapsedTotal += dt;

        // Subtle idle cabinet float breath when not launching
        if (launchState === 'idle') {
          cabinetGroup.position.y = Math.sin(elapsedTotal * 1.4) * 0.012;
          // Gentle autonomous joystick fidget micro-tilt on hover
          const targetHoverTilt = isHovered ? Math.sin(elapsedTotal * 8) * 0.08 : 0;
          joyTiltX += (targetHoverTilt - joyTiltX) * Math.min(1, dt * 8);
          joyTiltZ += ((isHovered ? -0.08 : 0) - joyTiltZ) * Math.min(1, dt * 8);
          controls.update();
        } else {
          // Beat 2 & Beat 3 Launch Choreography
          launchElapsed += dt;
          const progress = Math.min(1, launchElapsed / LAUNCH_DURATION_SEC);

          // Spring-back joystick (unhurried tactile motion)
          const k = 64;
          const damp = 8.5;
          joyVelX += (-k * joyTiltX - damp * joyVelX) * dt;
          joyVelZ += (-k * joyTiltZ - damp * joyVelZ) * dt;
          joyTiltX += joyVelX * dt;
          joyTiltZ += joyVelZ * dt;

          // Button rebound
          btnPressCobalt = Math.max(0, btnPressCobalt - dt * 1.9);
          btnPressAmber = Math.max(0, btnPressAmber - dt * 1.7);
          btnPressEmerald = Math.max(0, btnPressEmerald - dt * 2.1);

          // Beat 3 Camera Dive into CRT center starting smoothly around t = 0.34 (~0.51s into 1.5s)
          if (progress > 0.34) {
            crtScreenMesh.updateWorldMatrix(true, false);
            crtScreenMesh.getWorldPosition(_screenWorldPos);
            _screenForward.setFromMatrixColumn(crtScreenMesh.matrixWorld, 2).normalize();

            _camTargetPos.copy(_screenWorldPos).addScaledVector(_screenForward, 0.34);
            _lookTarget.copy(_screenWorldPos);

            camera.position.x = THREE.MathUtils.damp(camera.position.x, _camTargetPos.x, 3.4, dt);
            camera.position.y = THREE.MathUtils.damp(camera.position.y, _camTargetPos.y, 3.4, dt);
            camera.position.z = THREE.MathUtils.damp(camera.position.z, _camTargetPos.z, 3.4, dt);
            controls.target.x = THREE.MathUtils.damp(controls.target.x, _lookTarget.x, 4.2, dt);
            controls.target.y = THREE.MathUtils.damp(controls.target.y, _lookTarget.y, 4.2, dt);
            controls.target.z = THREE.MathUtils.damp(controls.target.z, _lookTarget.z, 4.2, dt);
            camera.lookAt(controls.target);

            camera.fov = THREE.MathUtils.damp(camera.fov, DIVE_FOV, 3.0, dt);
            camera.updateProjectionMatrix();
          }

          if (progress >= 1) {
            launchState = 'idle';
            onLaunchCompleteRef.current();
          }
        }

        // Apply joystick & button kinematics
        joystickPivot.rotation.z = -joyTiltX;
        joystickPivot.rotation.x = joyTiltZ;
        btnCobalt.cap.position.y = btnCobalt.baseY - btnPressCobalt * 0.018;
        btnAmber.cap.position.y = btnAmber.baseY - btnPressAmber * 0.018;
        btnEmerald.cap.position.y = btnEmerald.baseY - btnPressEmerald * 0.018;

        // Redraw CRT CanvasTexture at ~24fps during idle, every frame during launch flicker
        const redrawIntervalMs = launchState === 'launching' ? 16 : 42;
        if (now - lastCrtRedraw >= redrawIntervalMs) {
          lastCrtRedraw = now;
          const lp =
            launchState === 'launching' ? Math.min(1, launchElapsed / LAUNCH_DURATION_SEC) : 0;
          drawCrtScreenFrame(crtCtx, 512, 384, elapsedTotal, lp, isHovered);
          crtTex.needsUpdate = true;
          screenGlowLight.intensity = lp > 0 ? 1.8 + lp * 1.4 : isHovered ? 1.45 : 1.05;
        }

        renderer.render(scene, camera);
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
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || webglFailed) {
    return (
      <button
        type="button"
        onClick={onRequestLaunch}
        aria-label="Get Over Here, Byte needs you! Click to play"
        className="group relative flex h-full min-h-[420px] w-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#111827] bg-[#FAF8F5] text-left shadow-[6px_6px_0px_#111827] transition-shadow duration-200 hover:shadow-[10px_10px_0px_#111827]"
      >
        <img
          src={EDITORIAL_ART_URLS.heroGateway}
          alt="Pen-and-ink illustration of knight Byte with a glowing blue shield confronting the dark Lag Titan."
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t-2 border-[#111827] bg-[#FAF8F5] px-5 py-4">
          <div>
            <div className="font-editorial text-xl font-bold text-[#111827]">
              Byte vs. The Lag Titan
            </div>
            <div className="text-xs font-medium text-[#4B5563]">
              Play the story and rescue Silicon City
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg border-2 border-[#111827] bg-[#0068B5] px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_#111827]">
            <Shield className="h-4 w-4" />
            <span>Play</span>
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="relative h-full min-h-[430px] w-full overflow-hidden rounded-2xl border-2 border-[#111827] bg-[#FAF8F5] shadow-[6px_6px_0px_#111827]">
      {/* Dedicated WebGL Mount Container — unobstructed center */}
      <div
        ref={mountRef}
        className={`h-full min-h-[430px] w-full ${hoveredPart ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
        aria-label="Interactive 3D Jevtel Arcade Machine. Drag to rotate or click the screen to launch gameplay."
      />

      {/* Minimal Outer-Corner Controls Only (Zero backdrop-blur over WebGL) */}
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg border border-[#111827]/20 bg-[#FAF8F5] px-2.5 py-1.5 text-[11px] font-bold text-[#374151] shadow-xs">
        <Rotate3d className="h-3.5 w-3.5 text-[#0068B5]" />
        <span>Drag to rotate</span>
      </div>

      <button
        type="button"
        onClick={onRequestLaunch}
        className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg border-2 border-[#111827] bg-[#0068B5] px-3.5 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0px_#111827] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#005291]"
      >
        <Play className="h-3.5 w-3.5 fill-white" />
        <span>Play Arcade</span>
      </button>
    </div>
  );
}
