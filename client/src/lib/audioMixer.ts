/**
 * NightcapAudioMixer — Web Audio API engine for the Nightcap Studio.
 *
 * Architecture:
 *
 *  OscL (200 Hz) → StereoPanner(-1) ─┐
 *  OscR (200+Δ)  → StereoPanner(+1) ─┤→ binauralGain → destination
 *                                      │
 *  Mic → MediaStreamSource → voiceGain ┤→ destination
 *                                      │
 *  AmbientBuffer → bufferSource → rainGain → destination
 *
 * Usage:
 *   const mixer = new NightcapAudioMixer();
 *   await mixer.init();
 *   mixer.setBinauralFrequency(6);   // 6 Hz Theta
 *   mixer.setVoiceVolume(0.8);
 *   mixer.setRainVolume(0.5);
 *   const blob = await mixer.stopRecording();
 *   mixer.destroy();
 */

export interface MixerSettings {
  voiceVolume: number;       // 0.0 – 1.0
  rainVolume: number;        // 0.0 – 1.0
  binauralFrequency: number; // Hz offset (e.g. 6 → left=200Hz, right=206Hz)
}

export class NightcapAudioMixer {
  private ctx: AudioContext | null = null;

  // Gain nodes — one per source for independent volume control
  private voiceGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private binauralGain: GainNode | null = null;

  // Binaural oscillators
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private panLeft: StereoPannerNode | null = null;
  private panRight: StereoPannerNode | null = null;
  private baseFrequency = 200; // Hz — carrier wave for the left ear

  // Recording
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Waveform analysis
  private analyser: AnalyserNode | null = null;

  // Ambient
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientBuffer: AudioBuffer | null = null;

  /** Returns true if the AudioContext has been created */
  get isInitialized(): boolean {
    return this.ctx !== null;
  }

  /** Returns the current AudioContext state */
  get state(): AudioContextState | "uninitialized" {
    return this.ctx?.state ?? "uninitialized";
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Creates the AudioContext and wires up the binaural beat oscillators.
   * Must be called from a user-gesture handler (click/touch) to satisfy
   * browser autoplay policy.
   */
  async init(settings?: Partial<MixerSettings>): Promise<void> {
    if (this.ctx) return; // already initialised

    this.ctx = new AudioContext();
    const ctx = this.ctx;

    // ── Gain nodes ────────────────────────────────────────────────────────────
    this.voiceGain = ctx.createGain();
    this.voiceGain.gain.value = settings?.voiceVolume ?? 0.8;

    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = settings?.rainVolume ?? 0.5;

    this.binauralGain = ctx.createGain();
    this.binauralGain.gain.value = 0.15; // keep oscillators subtle by default

    // Connect gains to master destination
    this.voiceGain.connect(ctx.destination);
    this.rainGain.connect(ctx.destination);
    this.binauralGain.connect(ctx.destination);

    // ── Binaural beat oscillators ─────────────────────────────────────────────
    // Left ear: carrier frequency (e.g. 200 Hz)
    this.oscLeft = ctx.createOscillator();
    this.oscLeft.type = "sine";
    this.oscLeft.frequency.value = this.baseFrequency;

    this.panLeft = ctx.createStereoPanner();
    this.panLeft.pan.value = -1; // hard left

    this.oscLeft.connect(this.panLeft);
    this.panLeft.connect(this.binauralGain);

    // Right ear: carrier + beat frequency (e.g. 200 + 6 = 206 Hz → 6 Hz Theta)
    this.oscRight = ctx.createOscillator();
    this.oscRight.type = "sine";
    this.oscRight.frequency.value = this.baseFrequency + (settings?.binauralFrequency ?? 6);

    this.panRight = ctx.createStereoPanner();
    this.panRight.pan.value = 1; // hard right

    this.oscRight.connect(this.panRight);
    this.panRight.connect(this.binauralGain);

    // Start oscillators immediately
    this.oscLeft.start();
    this.oscRight.start();

    // Resume if suspended (Safari)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  /**
   * Tears down the AudioContext and stops all sources.
   * Call this when the user navigates away or closes the studio.
   */
  destroy(): void {
    this.oscLeft?.stop();
    this.oscRight?.stop();
    this.ambientSource?.stop();
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close();
    this.ctx = null;
    this.voiceGain = null;
    this.rainGain = null;
    this.binauralGain = null;
    this.oscLeft = null;
    this.oscRight = null;
    this.panLeft = null;
    this.panRight = null;
    this.ambientSource = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  // ─── Volume Controls ────────────────────────────────────────────────────────

  /** Set voice/mic gain (0.0 – 1.0) */
  setVoiceVolume(value: number): void {
    if (this.voiceGain && this.ctx) {
      this.voiceGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, value)),
        this.ctx.currentTime,
        0.01 // 10 ms smooth ramp
      );
    }
  }

  /** Set ambient rain gain (0.0 – 1.0) */
  setRainVolume(value: number): void {
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, value)),
        this.ctx.currentTime,
        0.01
      );
    }
  }

  /**
   * Set binaural beat frequency offset in Hz.
   * Examples:
   *   4 Hz  → Deep Theta (drowsiness)
   *   6 Hz  → Theta (meditation, REM dreams)
   *   10 Hz → Alpha (relaxed awareness)
   */
  setBinauralFrequency(hz: number): void {
    if (this.oscRight && this.ctx) {
      this.oscRight.frequency.setTargetAtTime(
        this.baseFrequency + hz,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  // ─── Microphone Recording ───────────────────────────────────────────────────

  /**
   * Starts recording the microphone.
   * The mic stream is also routed through voiceGain so the user can hear
   * themselves in real time (optional — set voiceVolume=0 to disable monitor).
   */
  async startRecording(): Promise<void> {
    if (!this.ctx) throw new Error("AudioMixer not initialised. Call init() first.");

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    // Wire mic into the audio graph
    const micSource = this.ctx.createMediaStreamSource(this.mediaStream);
    micSource.connect(this.voiceGain!);

    // Wire analyser for waveform visualisation
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;           // 128 frequency bins
    this.analyser.smoothingTimeConstant = 0.75;
    micSource.connect(this.analyser);

    // Set up MediaRecorder for capturing
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm",
    });

    this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };

    this.mediaRecorder.start(100); // collect chunks every 100 ms
  }

  /**
   * Stops recording and returns the audio Blob.
   * Resolves once the MediaRecorder has flushed all chunks.
   */
  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No active recording"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
        this.recordedChunks = [];
        // Stop mic tracks
        this.mediaStream?.getTracks().forEach((t) => t.stop());
        this.mediaStream = null;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }

  /** Returns the AnalyserNode so callers can drive a canvas visualiser */
  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  // ─── Ambient Audio ──────────────────────────────────────────────────────────

  /**
   * Fetches, decodes, and starts looping an ambient audio file (e.g. rain).
   * Safe to call before or after init() — queues the load.
   */
  async loadAmbientBuffer(url: string): Promise<void> {
    if (!this.ctx) throw new Error("AudioMixer not initialised. Call init() first.");

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.ambientBuffer = await this.ctx.decodeAudioData(arrayBuffer);

    this._startAmbient();
  }

  private _startAmbient(): void {
    if (!this.ctx || !this.ambientBuffer || !this.rainGain) return;

    this.ambientSource?.stop();
    this.ambientSource = this.ctx.createBufferSource();
    this.ambientSource.buffer = this.ambientBuffer;
    this.ambientSource.loop = true;
    this.ambientSource.connect(this.rainGain);
    this.ambientSource.start();
  }

  /** Pause / resume ambient sound */
  toggleAmbient(play: boolean): void {
    if (play) {
      this._startAmbient();
    } else {
      this.ambientSource?.stop();
      this.ambientSource = null;
    }
  }

  // ─── Snapshot ───────────────────────────────────────────────────────────────

  /** Returns the current mixer state as a plain object for persistence */
  getSettings(): MixerSettings {
    return {
      voiceVolume: this.voiceGain?.gain.value ?? 0.8,
      rainVolume: this.rainGain?.gain.value ?? 0.5,
      binauralFrequency:
        (this.oscRight?.frequency.value ?? this.baseFrequency + 6) - this.baseFrequency,
    };
  }
}
