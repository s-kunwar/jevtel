export type MusicMode =
  | 'none'
  | 'title'
  | 'trap'
  | 'city'
  | 'dungeon'
  | 'battle'
  | 'boss'
  | 'boss_climax'
  | 'expo';

const TRACK_URLS: Record<Exclude<MusicMode, 'none'>, string> = {
  title: '/assets/audio/theme_new_adventure.ogg',
  trap: '/assets/audio/scene_hurry_up.ogg',
  city: '/assets/audio/field_northreach_mountain.ogg',
  dungeon: '/assets/audio/dungeon_uncharted_horizon.ogg',
  battle: '/assets/audio/battle_new_adventure.ogg',
  boss: '/assets/audio/fight2.mp3',
  boss_climax: '/assets/audio/demise.mp3',
  expo: '/assets/audio/field_spring_valley.ogg',
};

const TARGET_MUSIC_VOLUME = 0.42;
const CROSSFADE_MS = 560;

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private muted = false;
  private mode: MusicMode = 'none';

  private tracks = new Map<Exclude<MusicMode, 'none'>, HTMLAudioElement>();
  private activeMode: Exclude<MusicMode, 'none'> | null = null;
  private fadingTracks = new Map<HTMLAudioElement, number>();
  private trackVolumes = new Map<HTMLAudioElement, number>();
  private fadeRafId: number | null = null;
  private lastFadeTick = 0;
  private pendingUnlock = false;

  public init(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : 0.72;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.62;
        this.sfxGain.connect(this.masterGain);
      }
    } else if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    if (this.pendingUnlock && !this.muted && this.activeMode) {
      const el = this.getOrCreateTrack(this.activeMode);
      void el.play().then(() => {
        this.pendingUnlock = false;
      }).catch(() => {
        // Still blocked until direct user interaction
      });
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(nextMuted: boolean): boolean {
    this.muted = nextMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.72, this.ctx.currentTime, 0.03);
    }
    this.syncTrackMuteState();
    return this.muted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.muted);
  }

  private syncTrackMuteState(): void {
    this.tracks.forEach((el) => {
      el.muted = this.muted;
    });
    if (!this.muted && this.activeMode) {
      const el = this.getOrCreateTrack(this.activeMode);
      el.muted = false;
      if ((this.trackVolumes.get(el) ?? 0) < 0.02) {
        this.trackVolumes.set(el, TARGET_MUSIC_VOLUME);
        el.volume = TARGET_MUSIC_VOLUME;
      }
      if (el.paused) {
        void el.play().catch(() => {
          this.pendingUnlock = true;
        });
      }
    }
  }

  private getOrCreateTrack(mode: Exclude<MusicMode, 'none'>): HTMLAudioElement {
    const existing = this.tracks.get(mode);
    if (existing) return existing;

    const el = new Audio(TRACK_URLS[mode]);
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0;
    el.muted = this.muted;
    this.tracks.set(mode, el);
    this.trackVolumes.set(el, 0);
    return el;
  }

  public setMusicMode(nextMode: MusicMode): void {
    if (this.mode === nextMode) return;
    this.mode = nextMode;

    if (this.activeMode) {
      const oldEl = this.tracks.get(this.activeMode);
      if (oldEl) {
        this.fadingTracks.set(oldEl, this.trackVolumes.get(oldEl) ?? oldEl.volume);
      }
    }

    if (nextMode === 'none') {
      this.activeMode = null;
      this.startFadeLoop();
      return;
    }

    this.activeMode = nextMode;
    const nextEl = this.getOrCreateTrack(nextMode);
    this.fadingTracks.delete(nextEl);
    nextEl.muted = this.muted;

    if (nextEl.ended) {
      nextEl.currentTime = 0;
    }

    if (!this.muted) {
      void nextEl.play().then(() => {
        this.pendingUnlock = false;
      }).catch(() => {
        this.pendingUnlock = true;
      });
    }

    this.startFadeLoop();
  }

  private startFadeLoop(): void {
    if (typeof window === 'undefined' || this.fadeRafId !== null) return;
    this.lastFadeTick = performance.now();

    const step = (now: number) => {
      const dtMs = Math.min(80, Math.max(8, now - this.lastFadeTick));
      this.lastFadeTick = now;
      const delta = dtMs / CROSSFADE_MS;
      let keepRunning = false;

      if (this.activeMode) {
        const activeEl = this.tracks.get(this.activeMode);
        if (activeEl) {
          const current = this.trackVolumes.get(activeEl) ?? 0;
          const nextVol = Math.min(TARGET_MUSIC_VOLUME, current + delta * TARGET_MUSIC_VOLUME);
          this.trackVolumes.set(activeEl, nextVol);
          activeEl.volume = nextVol;
          activeEl.muted = this.muted;
          if (nextVol < TARGET_MUSIC_VOLUME - 0.004) {
            keepRunning = true;
          }
        }
      }

      this.fadingTracks.forEach((_, el) => {
        const current = this.trackVolumes.get(el) ?? el.volume;
        const nextVol = Math.max(0, current - delta * TARGET_MUSIC_VOLUME);
        this.trackVolumes.set(el, nextVol);
        el.volume = nextVol;
        if (nextVol <= 0.004) {
          el.pause();
          el.volume = 0;
          this.fadingTracks.delete(el);
        } else {
          keepRunning = true;
        }
      });

      if (keepRunning) {
        this.fadeRafId = window.requestAnimationFrame(step);
      } else {
        this.fadeRafId = null;
      }
    };

    this.fadeRafId = window.requestAnimationFrame(step);
  }

  public dispose(): void {
    if (this.fadeRafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.fadeRafId);
      this.fadeRafId = null;
    }
    this.tracks.forEach((el) => {
      el.pause();
      el.src = '';
    });
    this.tracks.clear();
    this.fadingTracks.clear();
    this.trackVolumes.clear();
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    slideToFreq?: number,
    delay = 0,
    startFreq?: number
  ): void {
    if (!this.ctx || !this.sfxGain || this.muted) return;
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq ?? freq, now);
    if (startFreq && startFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, freq),
        now + Math.min(0.06, duration * 0.4)
      );
    }
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.025);
  }

  private noiseBurst(duration: number, volume: number, highpass = 800): void {
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = highpass;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start();
  }

  public playSlash(): void {
    this.init();
    this.noiseBurst(0.1, 0.28, 1300);
    this.tone(680, 0.09, 'triangle', 0.28, 180);
    this.tone(1120, 0.06, 'sine', 0.12, 480);
  }

  public playDash(): void {
    this.init();
    this.noiseBurst(0.12, 0.22, 850);
    this.tone(220, 0.13, 'sine', 0.26, 620);
  }

  public playHit(heavy = false): void {
    this.init();
    this.noiseBurst(heavy ? 0.18 : 0.09, heavy ? 0.42 : 0.24, 300);
    this.tone(heavy ? 135 : 220, heavy ? 0.18 : 0.1, 'sawtooth', heavy ? 0.36 : 0.24, 55);
    if (heavy) {
      this.tone(95, 0.2, 'sine', 0.38, 38);
    }
  }

  public playShieldShatter(): void {
    this.init();
    this.noiseBurst(0.24, 0.35, 2200);
    [1318.5, 1046.5, 880, 659.25].forEach((f, i) => {
      this.tone(f, 0.14, 'triangle', 0.2, f * 0.7, i * 0.03);
    });
  }

  public playPlayerHurt(): void {
    this.init();
    this.tone(210, 0.18, 'sawtooth', 0.32, 75);
    this.noiseBurst(0.13, 0.24, 480);
  }

  public playNpuPulse(): void {
    this.init();
    this.tone(330, 0.24, 'sine', 0.3, 880);
    this.tone(523.25, 0.26, 'triangle', 0.22, 1046.5, 0.04);
    this.tone(783.99, 0.3, 'sine', 0.2, 1318.5, 0.08);
  }

  public playXessSurge(): void {
    this.init();
    [440, 554.37, 659.25, 880, 1174.66].forEach((freq, i) => {
      this.tone(freq, 0.16, 'square', 0.15, freq * 1.16, i * 0.032);
    });
  }

  public playPickup(): void {
    this.init();
    this.tone(587.33, 0.09, 'triangle', 0.24);
    this.tone(880, 0.15, 'triangle', 0.26, undefined, 0.065);
  }

  public playUnlock(): void {
    this.init();
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.tone(f, i === notes.length - 1 ? 0.44 : 0.12, 'triangle', 0.3, undefined, i * 0.09);
    });
  }

  public playDialogueBlip(pitch = 520): void {
    this.init();
    this.tone(pitch + (Math.random() * 44 - 22), 0.042, 'triangle', 0.1);
  }

  public playBossTelegraph(): void {
    this.init();
    this.tone(260, 0.22, 'sawtooth', 0.2, 480);
  }

  public playBossPhase(): void {
    this.init();
    this.tone(175, 0.38, 'sawtooth', 0.32, 65);
    this.tone(350, 0.3, 'square', 0.22, 130, 0.07);
  }

  public playCrash(): void {
    this.init();
    this.noiseBurst(0.34, 0.4, 220);
    this.tone(145, 0.36, 'sawtooth', 0.34, 42);
  }

  public playTransform(): void {
    this.init();
    const sweep = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    sweep.forEach((f, i) => {
      this.tone(f, 0.32, 'sine', 0.22, f * 1.05, i * 0.09);
    });
  }

  public playVictory(): void {
    this.init();
    const fanfare = [392, 523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((f, i) => {
      this.tone(f, i === 4 ? 0.75 : 0.15, 'triangle', 0.28, undefined, i * 0.11);
    });
  }

  public playArcadeClick(): void {
    this.init();
    this.noiseBurst(0.028, 0.28, 2400);
    this.tone(1480, 0.032, 'square', 0.16, 420);
    this.tone(360, 0.04, 'triangle', 0.18, 140);
  }

  public playArcadePowerOn(): void {
    this.init();
    this.tone(72, 0.28, 'sine', 0.34, 38);
    this.noiseBurst(0.08, 0.16, 1600);
    this.tone(523.25, 0.16, 'triangle', 0.22, undefined, 0.04);
    this.tone(659.25, 0.16, 'triangle', 0.2, undefined, 0.11);
    this.tone(1046.5, 0.34, 'sine', 0.26, 1054, 0.18);
  }
}

export const gameAudio = new GameAudioEngine();
