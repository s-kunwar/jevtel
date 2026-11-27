export type MusicMode = 'none' | 'title' | 'trap' | 'city' | 'boss' | 'expo';

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private muted = false;
  private mode: MusicMode = 'none';
  private step = 0;
  private timerId: number | null = null;
  private prevLeadFreq: number | null = null;

  public init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.72;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.28;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.62;
    this.sfxGain.connect(this.masterGain);
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.72, this.ctx.currentTime, 0.03);
    }
    return this.muted;
  }

  public setMusicMode(nextMode: MusicMode): void {
    if (this.mode === nextMode) return;
    this.mode = nextMode;
    this.step = 0;
    this.prevLeadFreq = null;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (nextMode === 'none') return;

    const tempoMs =
      nextMode === 'boss'
        ? 130 // Urgent GTA Chinatown Wars / Boss breakbeat pulse
        : nextMode === 'trap'
          ? 230
          : nextMode === 'expo'
            ? 175
            : 165; // Groovy San Andreas G-funk / Zelda tempo

    this.timerId = window.setInterval(() => {
      this.tickMusic();
    }, tempoMs);
  }

  public dispose(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    dest: 'music' | 'sfx',
    slideToFreq?: number,
    delay = 0,
    startFreq?: number
  ): void {
    if (!this.ctx || !this.musicGain || !this.sfxGain || this.muted) return;
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq ?? freq, now);
    if (startFreq && startFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq), now + Math.min(0.06, duration * 0.4));
    }
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(dest === 'music' ? this.musicGain : this.sfxGain);
    osc.start(now);
    osc.stop(now + duration + 0.025);
  }

  private drumKick(volume = 0.32): void {
    if (!this.ctx || !this.musicGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.11);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  private drumSnare(volume = 0.16): void {
    this.noiseBurst(0.09, volume, 950, 'music');
    this.tone(185, 0.07, 'triangle', volume * 0.6, 'music', 110);
  }

  private drumHat(volume = 0.06): void {
    this.noiseBurst(0.035, volume, 5200, 'music');
  }

  private noiseBurst(
    duration: number,
    volume: number,
    highpass = 800,
    dest: 'music' | 'sfx' = 'sfx'
  ): void {
    if (!this.ctx || !this.sfxGain || !this.musicGain || this.muted) return;
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
    gain.connect(dest === 'music' ? this.musicGain : this.sfxGain);
    src.start();
  }

  private tickMusic(): void {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const s = this.step++;

    if (this.mode === 'title') {
      // Zelda heroic mystery + San Andreas warm Rhodes pad
      const bass = [110, 0, 110, 130.81, 146.83, 0, 164.81, 130.81];
      const arp = [440, 523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25];
      if (s % 4 === 0) this.drumKick(0.22);
      if (s % 2 === 1) this.drumHat(0.045);
      const b = bass[s % bass.length];
      if (b > 0) this.tone(b, 0.24, 'triangle', 0.24, 'music');
      if (s % 2 === 0) {
        this.tone(arp[(s / 2) % arp.length], 0.24, 'sine', 0.14, 'music');
      }
      return;
    }

    if (this.mode === 'trap') {
      const notes = [87.31, 0, 82.41, 0, 77.78, 82.41, 0, 73.42];
      if (s % 4 === 0) this.drumKick(0.2);
      const n = notes[s % notes.length];
      if (n > 0) this.tone(n, 0.2, 'sawtooth', 0.12, 'music', n * 0.92);
      return;
    }

    if (this.mode === 'city') {
      // GTA San Andreas G-Funk Groove + Zelda Adventure Melody
      const kickPattern = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0];
      const snarePattern = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1];
      const idx = s % 16;
      if (kickPattern[idx]) this.drumKick(0.32);
      if (snarePattern[idx]) this.drumSnare(0.14);
      if (s % 2 === 0) this.drumHat(0.05);

      const bass = [
        98.0, 0, 98.0, 116.54, 130.81, 0, 146.83, 130.81,
        87.31, 0, 87.31, 103.83, 116.54, 0, 130.81, 116.54,
      ];
      const b = bass[idx];
      if (b > 0) {
        this.tone(b, 0.2, 'triangle', 0.28, 'music');
        this.tone(b * 0.5, 0.18, 'sine', 0.18, 'music');
      }

      // G-funk portamento sine whistle lead (San Andreas signature!)
      const gFunkLead = [
        783.99, 0, 932.33, 0, 1046.5, 0, 932.33, 783.99,
        698.46, 0, 783.99, 0, 880.0, 783.99, 698.46, 0,
      ];
      const l = gFunkLead[idx];
      if (l > 0) {
        this.tone(l, 0.25, 'sine', 0.14, 'music', undefined, 0, this.prevLeadFreq ?? l);
        this.prevLeadFreq = l;
      }

      // Warm electric Rhodes stabs on beat 1 & 9
      if (idx === 0 || idx === 8) {
        const root = idx === 0 ? 196 : 174.61;
        this.tone(root, 0.45, 'sine', 0.08, 'music');
        this.tone(root * 1.189, 0.45, 'sine', 0.07, 'music');
        this.tone(root * 1.498, 0.45, 'sine', 0.07, 'music');
      }
      return;
    }

    if (this.mode === 'boss') {
      // GTA Chinatown Wars gritty breakbeat + urgent pentatonic boss riff
      const idx = s % 16;
      const kick = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0];
      const snare = [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0];
      if (kick[idx]) this.drumKick(0.36);
      if (snare[idx]) this.drumSnare(0.18);
      this.drumHat(idx % 2 === 0 ? 0.065 : 0.035);

      const bass = [110, 110, 220, 110, 130.81, 110, 146.83, 130.81, 110, 110, 220, 110, 164.81, 146.83, 130.81, 123.47];
      this.tone(bass[idx], 0.13, 'sawtooth', 0.16, 'music');

      // Pentatonic Chinatown-style sharp lead
      const riff = [440, 0, 523.25, 587.33, 659.25, 0, 587.33, 523.25, 440, 0, 659.25, 783.99, 659.25, 587.33, 523.25, 440];
      const r = riff[idx];
      if (r > 0) {
        this.tone(r, 0.13, 'square', 0.1, 'music');
      }
      return;
    }

    if (this.mode === 'expo') {
      // Upbeat Zelda Town + Sunny Funk Showcase Loop
      const idx = s % 16;
      if (idx % 4 === 0) this.drumKick(0.24);
      if (idx === 4 || idx === 12) this.drumSnare(0.11);
      if (idx % 2 === 1) this.drumHat(0.045);

      const chords = [
        [261.63, 329.63, 392, 493.88],
        [293.66, 349.23, 440, 523.25],
        [220, 261.63, 329.63, 392],
        [196, 246.94, 293.66, 392],
      ];
      if (idx % 4 === 0) {
        const ch = chords[Math.floor(s / 4) % chords.length];
        ch.forEach((f, i) => this.tone(f, 0.42, 'sine', 0.08, 'music', undefined, i * 0.025));
      }
      const bass = [130.81, 0, 196, 130.81, 146.83, 0, 220, 146.83, 110, 0, 164.81, 110, 98, 0, 146.83, 196];
      if (bass[idx] > 0) this.tone(bass[idx], 0.18, 'triangle', 0.22, 'music');
    }
  }

  public playSlash(): void {
    this.init();
    this.noiseBurst(0.1, 0.28, 1300);
    this.tone(680, 0.09, 'triangle', 0.28, 'sfx', 180);
    this.tone(1120, 0.06, 'sine', 0.12, 'sfx', 480);
  }

  public playDash(): void {
    this.init();
    this.noiseBurst(0.12, 0.22, 850);
    this.tone(220, 0.13, 'sine', 0.26, 'sfx', 620);
  }

  public playHit(heavy = false): void {
    this.init();
    this.noiseBurst(heavy ? 0.18 : 0.09, heavy ? 0.42 : 0.24, 300);
    this.tone(heavy ? 135 : 220, heavy ? 0.18 : 0.1, 'sawtooth', heavy ? 0.36 : 0.24, 'sfx', 55);
    if (heavy) {
      this.tone(95, 0.2, 'sine', 0.38, 'sfx', 38);
    }
  }

  public playShieldShatter(): void {
    this.init();
    this.noiseBurst(0.24, 0.35, 2200);
    [1318.5, 1046.5, 880, 659.25].forEach((f, i) => {
      this.tone(f, 0.14, 'triangle', 0.2, 'sfx', f * 0.7, i * 0.03);
    });
  }

  public playPlayerHurt(): void {
    this.init();
    this.tone(210, 0.18, 'sawtooth', 0.32, 'sfx', 75);
    this.noiseBurst(0.13, 0.24, 480);
  }

  public playNpuPulse(): void {
    this.init();
    this.tone(330, 0.24, 'sine', 0.3, 'sfx', 880);
    this.tone(523.25, 0.26, 'triangle', 0.22, 'sfx', 1046.5, 0.04);
    this.tone(783.99, 0.3, 'sine', 0.2, 'sfx', 1318.5, 0.08);
  }

  public playXessSurge(): void {
    this.init();
    [440, 554.37, 659.25, 880, 1174.66].forEach((freq, i) => {
      this.tone(freq, 0.16, 'square', 0.15, 'sfx', freq * 1.16, i * 0.032);
    });
  }

  public playPickup(): void {
    this.init();
    this.tone(587.33, 0.09, 'triangle', 0.24, 'sfx');
    this.tone(880, 0.15, 'triangle', 0.26, 'sfx', undefined, 0.065);
  }

  public playUnlock(): void {
    this.init();
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.tone(f, i === notes.length - 1 ? 0.44 : 0.12, 'triangle', 0.3, 'sfx', undefined, i * 0.09);
    });
  }

  public playDialogueBlip(pitch = 520): void {
    this.init();
    this.tone(pitch + (Math.random() * 44 - 22), 0.042, 'triangle', 0.1, 'sfx');
  }

  public playBossTelegraph(): void {
    this.init();
    this.tone(260, 0.22, 'sawtooth', 0.2, 'sfx', 480);
  }

  public playBossPhase(): void {
    this.init();
    this.tone(175, 0.38, 'sawtooth', 0.32, 'sfx', 65);
    this.tone(350, 0.3, 'square', 0.22, 'sfx', 130, 0.07);
  }

  public playCrash(): void {
    this.init();
    this.noiseBurst(0.34, 0.4, 220);
    this.tone(145, 0.36, 'sawtooth', 0.34, 'sfx', 42);
  }

  public playTransform(): void {
    this.init();
    const sweep = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    sweep.forEach((f, i) => {
      this.tone(f, 0.32, 'sine', 0.22, 'sfx', f * 1.05, i * 0.09);
    });
  }

  public playVictory(): void {
    this.init();
    const fanfare = [392, 523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((f, i) => {
      this.tone(f, i === 4 ? 0.75 : 0.15, 'triangle', 0.28, 'sfx', undefined, i * 0.11);
    });
  }

  public playArcadeClick(): void {
    this.init();
    this.noiseBurst(0.028, 0.28, 2400, 'sfx');
    this.tone(1480, 0.032, 'square', 0.16, 'sfx', 420);
    this.tone(360, 0.04, 'triangle', 0.18, 'sfx', 140);
  }

  public playArcadePowerOn(): void {
    this.init();
    // CRT degauss low thump + warm phosphor sweep + crisp Odama-inspired power chime
    this.tone(72, 0.28, 'sine', 0.34, 'sfx', 38);
    this.noiseBurst(0.08, 0.16, 1600, 'sfx');
    this.tone(523.25, 0.16, 'triangle', 0.22, 'sfx', undefined, 0.04);
    this.tone(659.25, 0.16, 'triangle', 0.2, 'sfx', undefined, 0.11);
    this.tone(1046.5, 0.34, 'sine', 0.26, 'sfx', 1054, 0.18);
  }
}

export const gameAudio = new GameAudioEngine();
