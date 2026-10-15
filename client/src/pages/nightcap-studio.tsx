import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import { NightcapAudioMixer, MixerSettings } from "@/lib/audioMixer";

// ─── Types ────────────────────────────────────────────────────────────────────
type RecordState = "idle" | "recording" | "stopped";

interface PublicFeedItem {
  id: number;
  title: string;
  aiScript: string;
  mixSettings: MixerSettings;
  createdAt: string;
  creatorUsername: string;
  creatorDisplayName: string | null;
  creatorAvatar: string | null;
  hearts?: number;
}

// ─── Frequency Presets ────────────────────────────────────────────────────────
const FREQ_PRESETS = [
  { label: "Delta", hz: 2, color: "#818cf8", desc: "Deep sleep" },
  { label: "Theta", hz: 6, color: "#c084fc", desc: "Manifestation" },
  { label: "Alpha", hz: 10, color: "#67e8f9", desc: "Calm focus" },
  { label: "Beta", hz: 20, color: "#86efac", desc: "Alertness" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getBinauralLabel(hz: number): string {
  if (hz <= 4) return "Deep Delta · Dream";
  if (hz <= 8) return "Theta · Manifestation";
  if (hz <= 14) return "Alpha · Relaxed Focus";
  return "Beta · Alert";
}

// ─── Waveform Visualizer Component ───────────────────────────────────────────
function WaveformVisualizer({ analyser, isActive }: { analyser: AnalyserNode | null; isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    if (!isActive || !analyser) {
      // Idle flat line animation
      let phase = 0;
      const drawIdle = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(139,92,246,0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const y = H / 2 + Math.sin((x / W) * Math.PI * 4 + phase) * 3;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        phase += 0.025;
        rafRef.current = requestAnimationFrame(drawIdle);
      };
      rafRef.current = requestAnimationFrame(drawIdle);
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }

    // Live waveform from analyser
    const bufLen = analyser.frequencyBinCount;
    const dataArr = new Uint8Array(bufLen);

    const draw = () => {
      analyser.getByteTimeDomainData(dataArr);
      ctx.clearRect(0, 0, W, H);

      // Gradient stroke
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "rgba(139,92,246,0.9)");
      grad.addColorStop(0.5, "rgba(192,132,252,1)");
      grad.addColorStop(1, "rgba(99,102,241,0.9)");

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = grad;
      ctx.shadowColor = "rgba(192,132,252,0.5)";
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sliceW = W / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = dataArr[i] / 128.0;
        const y = (v * H) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [analyser, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={64}
      className="w-full rounded-xl bg-white/[0.03] border border-white/5"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NightcapStudio() {
  const { user, isAuthenticated } = useAuth();

  // Script generation
  const [mood, setMood] = useState("");
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const [copied, setCopied] = useState(false);

  // Recording
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Mixer sliders
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const [rainVolume, setRainVolume] = useState(0.5);
  const [binauralFreq, setBinauralFreq] = useState(6);

  // Publish
  const [title, setTitle] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState("");

  // Feed
  const [feed, setFeed] = useState<PublicFeedItem[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);

  // Audio mixer singleton
  const mixerRef = useRef<NightcapAudioMixer | null>(null);
  const [mixerReady, setMixerReady] = useState(false);

  // ── Fetch public feed on mount ───────────────────────────────────────────
  useEffect(() => {
    fetch("/api/v1/nightcap/formulas/feed")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setFeed(data.data.map((d: PublicFeedItem) => ({ ...d, hearts: 0 })));
      })
      .catch(() => {})
      .finally(() => setIsFeedLoading(false));
  }, []);

  // ── Cleanup mixer on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      mixerRef.current?.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Live-update gain nodes when sliders change ───────────────────────────
  useEffect(() => { mixerRef.current?.setVoiceVolume(voiceVolume); }, [voiceVolume]);
  useEffect(() => { mixerRef.current?.setRainVolume(rainVolume); }, [rainVolume]);
  useEffect(() => { mixerRef.current?.setBinauralFrequency(binauralFreq); }, [binauralFreq]);

  // ── Init mixer ───────────────────────────────────────────────────────────
  const initMixer = useCallback(async () => {
    if (mixerRef.current?.isInitialized) return;
    mixerRef.current = new NightcapAudioMixer();
    await mixerRef.current.init({ voiceVolume, rainVolume, binauralFrequency: binauralFreq });
    setMixerReady(true);
  }, [voiceVolume, rainVolume, binauralFreq]);

  // ── Script Generation ────────────────────────────────────────────────────
  const handleGenerateScript = async () => {
    if (!mood.trim()) return;
    setIsGenerating(true);
    setScriptError("");
    setCopied(false);
    try {
      const res = await fetch("/api/v1/nightcap/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: mood.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setScript(data.data.script);
      else setScriptError(data.message ?? "Failed to generate script.");
    } catch {
      setScriptError("Network error — please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Copy to clipboard ────────────────────────────────────────────────────
  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ── Recording ────────────────────────────────────────────────────────────
  const handleRecord = async () => {
    if (recordState === "recording") {
      setRecordState("stopped");
      if (timerRef.current) clearInterval(timerRef.current);
      setAnalyser(null);
      try {
        const blob = await mixerRef.current!.stopRecording();
        setAudioBlobUrl(URL.createObjectURL(blob));
      } catch (e) {
        console.error("Stop recording error", e);
      }
      return;
    }

    try {
      await initMixer();
      setRecordState("recording");
      setRecordSeconds(0);
      setAudioBlobUrl(null);
      await mixerRef.current!.startRecording();
      // Grab analyser after startRecording() wires it
      setAnalyser(mixerRef.current!.getAnalyser());
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch (e) {
      console.error("Start recording error", e);
      setRecordState("idle");
      alert("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const handleReRecord = () => {
    setRecordState("idle");
    setRecordSeconds(0);
    setAudioBlobUrl(null);
    setAnalyser(null);
  };

  // ── Frequency preset selection ───────────────────────────────────────────
  const handlePreset = async (hz: number) => {
    setBinauralFreq(hz);
    if (!mixerRef.current?.isInitialized) await initMixer();
    mixerRef.current?.setBinauralFrequency(hz);
  };

  // ── Publish ──────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!title.trim() || !script) {
      setPublishError("Please add a title and generate a script first.");
      return;
    }
    if (!isAuthenticated) {
      setPublishError("You must be signed in to publish.");
      return;
    }

    setIsPublishing(true);
    setPublishError("");
    setPublishSuccess(false);

    const mixSettings = mixerRef.current?.getSettings() ?? {
      voiceVolume,
      rainVolume,
      binauralFrequency: binauralFreq,
    };

    try {
      const res = await fetch("/api/v1/nightcap/formulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          aiScript: script,
          audioBlobUrl: null,
          mixSettings,
          isPublic: true,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setPublishSuccess(true);
        setFeed((prev) => [
          {
            id: data.data.id,
            title: data.data.title,
            aiScript: data.data.aiScript,
            mixSettings: data.data.mixSettings,
            audioBlobUrl: null,
            createdAt: data.data.createdAt,
            creatorUsername: (user as any)?.username ?? "you",
            creatorDisplayName: (user as any)?.displayName ?? null,
            creatorAvatar: (user as any)?.profileImageUrl ?? null,
            hearts: 0,
          },
          ...prev,
        ]);
        setTitle("");
      } else {
        setPublishError(data.message ?? "Publish failed.");
      }
    } catch {
      setPublishError("Network error — please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Slider handler ───────────────────────────────────────────────────────
  const handleSliderChange =
    (setter: (v: number) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(parseFloat(e.target.value));
      if (!mixerRef.current?.isInitialized) await initMixer();
    };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#05030f] text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SEO
        title="Nightcap Studio · Nocturne"
        description="Generate AI affirmation scripts, record your voice, and mix it with binaural beats for a personalised sleep manifestation session."
      />

      {/* ── Background blobs ── */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 space-y-10">

        {/* ── Header ── */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-900/40 border border-violet-700/40 text-violet-300 text-xs font-medium tracking-widest uppercase mb-2">
            <span>✦</span> Nightcap Studio <span>✦</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-white via-violet-200 to-indigo-300 bg-clip-text text-transparent">
            Manifest the Night
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
            Generate your affirmation script, record your voice, and weave it with binaural frequencies into a sleep formula.
          </p>
        </header>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* 1 · Script Generator                                              */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-base">🌙</div>
            <h2 className="text-lg font-semibold text-white">AI Script Generator</h2>
          </div>

          <div className="space-y-3">
            <label htmlFor="mood-input" className="block text-sm text-slate-400">
              How are you feeling right now?
            </label>
            <div className="flex gap-3">
              <input
                id="mood-input"
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerateScript()}
                placeholder="e.g. anxious about tomorrow, hopeful but tired…"
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition text-sm"
                disabled={isGenerating}
              />
              <button
                id="generate-script-btn"
                onClick={handleGenerateScript}
                disabled={isGenerating || !mood.trim()}
                className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Crafting…
                  </span>
                ) : "✨ Generate"}
              </button>
            </div>
            {scriptError && <p className="text-red-400 text-xs">{scriptError}</p>}
          </div>

          {/* Script display with copy button */}
          {script && (
            <div
              id="generated-script-display"
              className="relative rounded-xl bg-violet-950/50 border border-violet-700/30 p-5 space-y-2"
              style={{ animation: "fadeSlideIn 0.4s ease" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-violet-500 text-xs font-medium tracking-wide uppercase">Your Script</span>
                <button
                  id="copy-script-btn"
                  onClick={handleCopyScript}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    copied
                      ? "bg-emerald-900/40 border-emerald-700/40 text-emerald-400"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              {script.split("\n").filter(Boolean).map((line, i) => (
                <p key={i} className="text-violet-100 text-sm leading-relaxed pl-3 border-l border-violet-700/40">
                  {line}
                </p>
              ))}
            </div>
          )}
        </section>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* 2 · Recording Controls with Waveform                             */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500/30 flex items-center justify-center text-base">🎙️</div>
            <h2 className="text-lg font-semibold text-white">Voice Recording</h2>
            {recordState === "recording" && (
              <span className="ml-auto flex items-center gap-1.5 text-red-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE · {formatDuration(recordSeconds)}
              </span>
            )}
          </div>

          {/* Waveform visualizer — always visible, shows idle wave when not recording */}
          <WaveformVisualizer analyser={analyser} isActive={recordState === "recording"} />

          <div className="flex flex-col items-center gap-4">
            {/* Record button */}
            <button
              id="record-btn"
              onClick={handleRecord}
              aria-label={recordState === "recording" ? "Stop recording" : "Start recording"}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                recordState === "recording"
                  ? "bg-red-600 hover:bg-red-500 focus:ring-red-500 scale-105"
                  : "bg-white/10 hover:bg-white/15 focus:ring-violet-500 border border-white/20"
              }`}
            >
              {recordState === "recording" && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                  <span className="absolute inset-[-8px] rounded-full border border-red-500/20 animate-pulse" />
                </>
              )}
              {recordState === "recording" ? (
                <svg className="w-7 h-7 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white/80 relative z-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            {recordState === "idle" && (
              <p className="text-slate-500 text-sm">Press to start recording your affirmation</p>
            )}
            {recordState === "stopped" && (
              <p className="text-emerald-400 text-sm font-medium">✓ Recorded · {formatDuration(recordSeconds)}</p>
            )}

            {/* Playback preview */}
            {audioBlobUrl && (
              <div className="w-full space-y-2">
                <audio
                  id="recording-preview"
                  src={audioBlobUrl}
                  controls
                  className="w-full rounded-xl"
                  style={{ accentColor: "#7c3aed" }}
                />
                <button
                  id="re-record-btn"
                  onClick={handleReRecord}
                  className="text-xs text-slate-600 hover:text-slate-300 transition underline underline-offset-2"
                >
                  Re-record
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* 3 · Mix Panel                                                     */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-base">🎛️</div>
            <h2 className="text-lg font-semibold text-white">Mix Panel</h2>
            {!mixerReady && (
              <span className="ml-auto text-xs text-slate-600 italic">Move a slider to activate</span>
            )}
          </div>

          <div className="space-y-6">
            {/* Voice Volume */}
            <SliderRow
              id="voice-slider"
              label="Voice"
              icon="🎙️"
              value={voiceVolume}
              min={0} max={1} step={0.01}
              onChange={handleSliderChange(setVoiceVolume)}
              color="violet"
              valueDisplay={`${Math.round(voiceVolume * 100)}%`}
            />

            {/* Rain Volume */}
            <SliderRow
              id="rain-slider"
              label="Ambient Rain"
              icon="🌧️"
              value={rainVolume}
              min={0} max={1} step={0.01}
              onChange={handleSliderChange(setRainVolume)}
              color="cyan"
              valueDisplay={`${Math.round(rainVolume * 100)}%`}
            />

            {/* Binaural Frequency with Preset Pills */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {FREQ_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    id={`preset-${p.label.toLowerCase()}`}
                    onClick={() => handlePreset(p.hz)}
                    title={p.desc}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      Math.abs(binauralFreq - p.hz) < 0.5
                        ? "border-opacity-80 scale-105 shadow-lg"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                    }`}
                    style={
                      Math.abs(binauralFreq - p.hz) < 0.5
                        ? { background: `${p.color}22`, borderColor: `${p.color}88`, color: p.color, boxShadow: `0 0 12px ${p.color}44` }
                        : undefined
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                    {p.label} {p.hz}Hz
                  </button>
                ))}
              </div>
              <SliderRow
                id="binaural-slider"
                label="Binaural Frequency"
                icon="〰️"
                value={binauralFreq}
                min={0.5} max={30} step={0.5}
                onChange={handleSliderChange(setBinauralFreq)}
                color="indigo"
                valueDisplay={`${binauralFreq} Hz`}
                sublabel={getBinauralLabel(binauralFreq)}
              />
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* 4 · Publish Bar                                                   */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-base">✨</div>
            <h2 className="text-lg font-semibold text-white">Publish to Whispers</h2>
          </div>

          <div className="space-y-3">
            <input
              id="formula-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your formula a name…"
              maxLength={120}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition text-sm"
            />

            {publishError && <p className="text-red-400 text-xs">{publishError}</p>}

            {publishSuccess && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <span>✓</span>
                <span>Published! Your formula is now in the community feed.</span>
              </div>
            )}

            <button
              id="publish-btn"
              onClick={handlePublish}
              disabled={isPublishing || !script || !title.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] shadow-lg shadow-violet-900/30"
            >
              {isPublishing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Publishing…
                </span>
              ) : "🌙 Publish to Whispers"}
            </button>

            {!isAuthenticated && (
              <p className="text-xs text-slate-600 text-center">Sign in to publish your formula to the community feed.</p>
            )}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* 5 · Community Feed                                                */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-violet-400">◈</span> Community Formulas
          </h2>

          {isFeedLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-8 text-center text-slate-600 text-sm">
              No public formulas yet. Be the first to publish one ✨
            </div>
          ) : (
            <div className="space-y-3">
              {feed.map((item) => (
                <FeedCard key={item.id} item={item} onHeart={(id) => {
                  setFeed((prev) => prev.map((f) => f.id === id ? { ...f, hearts: (f.hearts ?? 0) + 1 } : f));
                }} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── CSS ── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 9999px;
          cursor: pointer;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 10px rgba(139,92,246,0.5);
          cursor: pointer;
          transition: transform 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: none;
          background: white;
          box-shadow: 0 0 10px rgba(139,92,246,0.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

// ─── SliderRow ────────────────────────────────────────────────────────────────
interface SliderRowProps {
  id: string;
  label: string;
  icon: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color: "violet" | "cyan" | "indigo";
  valueDisplay: string;
  sublabel?: string;
}

const TRACK_COLORS: Record<SliderRowProps["color"], string> = {
  violet: "rgba(124,58,237,0.8)",
  cyan: "rgba(6,182,212,0.8)",
  indigo: "rgba(99,102,241,0.8)",
};

function SliderRow({ id, label, icon, value, min, max, step, onChange, color, valueDisplay, sublabel }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const trackColor = TRACK_COLORS[color];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="flex items-center gap-2 text-sm text-slate-300 font-medium select-none">
          <span>{icon}</span> {label}
          {sublabel && <span className="text-xs text-slate-600 font-normal">· {sublabel}</span>}
        </label>
        <span className="text-xs font-mono text-slate-400 min-w-[3.5rem] text-right">{valueDisplay}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
        }}
      />
    </div>
  );
}

// ─── FeedCard ─────────────────────────────────────────────────────────────────
function FeedCard({ item, onHeart }: { item: PublicFeedItem; onHeart: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [hearted, setHearted] = useState(false);
  const settings = item.mixSettings;

  const handleHeart = () => {
    if (hearted) return;
    setHearted(true);
    onHeart(item.id);
  };

  return (
    <article
      id={`feed-card-${item.id}`}
      className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-3 hover:border-violet-700/40 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{item.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            by <span className="text-slate-400">{item.creatorDisplayName ?? item.creatorUsername}</span>
            {" · "}
            {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <MixPill label={`${Math.round((settings?.rainVolume ?? 0) * 100)}% rain`} color="cyan" />
          <MixPill label={`${settings?.binauralFrequency ?? 6}Hz`} color="indigo" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-600 hover:text-slate-400 transition underline underline-offset-2"
        >
          {expanded ? "Hide script" : "Read script"}
        </button>

        {/* Heart button */}
        <button
          id={`heart-btn-${item.id}`}
          onClick={handleHeart}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-300 ${
            hearted
              ? "bg-pink-900/30 border-pink-700/40 text-pink-400 scale-110"
              : "bg-white/5 border-white/10 text-slate-500 hover:text-pink-400 hover:border-pink-700/30"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={hearted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {(item.hearts ?? 0) > 0 && <span>{item.hearts}</span>}
        </button>
      </div>

      {expanded && (
        <div
          className="rounded-xl bg-violet-950/40 border border-violet-900/30 p-4 space-y-1.5"
          style={{ animation: "fadeSlideIn 0.3s ease" }}
        >
          {item.aiScript.split("\n").filter(Boolean).map((line, i) => (
            <p key={i} className="text-violet-200/80 text-xs leading-relaxed pl-2 border-l border-violet-800/40">{line}</p>
          ))}
        </div>
      )}
    </article>
  );
}

function MixPill({ label, color }: { label: string; color: "cyan" | "indigo" }) {
  const styles = {
    cyan: "bg-cyan-900/30 border-cyan-700/30 text-cyan-400",
    indigo: "bg-indigo-900/30 border-indigo-700/30 text-indigo-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${styles[color]}`}>
      {label}
    </span>
  );
}
