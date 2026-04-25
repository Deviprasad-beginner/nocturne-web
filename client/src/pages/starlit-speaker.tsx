import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Mic, MicOff, Square, Timer, Users, Trophy, Star, Clock, Sparkles, AlertCircle, Play, ChevronLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { StarlitSpeaker, InsertStarlitSpeaker } from "@shared/schema";

// ─── Topic options ─────────────────────────────────────────────────────────────
const TOPICS = [
    { value: "impromptu",     label: "🎯 Impromptu",     color: "#f87171", rgb: "248,113,113" },
    { value: "storytelling",  label: "📚 Storytelling",  color: "#c084fc", rgb: "192,132,252" },
    { value: "debate",        label: "⚖️ Devil's Advocate", color: "#fb923c", rgb: "251,146,60" },
    { value: "presentation",  label: "💼 Pitch",         color: "#60a5fa", rgb: "96,165,250" },
    { value: "motivational",  label: "🔥 Motivation",    color: "#fbbf24", rgb: "251,191,36" },
    { value: "philosophical", label: "🤔 Deep Thoughts", color: "#34d399", rgb: "52,211,153" },
];

const PROMPTS = [
    "Convince an alien why pizza is humanity's greatest invention.",
    "Explain the internet to someone from the 1800s.",
    "Pitch a reality show about introverts.",
    "Argue why midnight snacks are a fundamental human right.",
    "Describe your ideal world in 2050.",
    "What would you do if you had one hour left on Earth?",
];

function getTopicColor(val: string) {
    return TOPICS.find(t => t.value === val)?.color ?? "#c084fc";
}
function getTopicLabel(val: string) {
    return TOPICS.find(t => t.value === val)?.label ?? val;
}
function fmtTime(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ─── Waveform canvas ──────────────────────────────────────────────────────────
function Waveform({ analyser, active }: { analyser: AnalyserNode | null; active: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !analyser || !active) return;
        const ctx = canvas.getContext("2d")!;
        const buf = new Uint8Array(analyser.frequencyBinCount);

        const draw = () => {
            frameRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(buf);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#c084fc";
            ctx.shadowColor = "#c084fc";
            ctx.shadowBlur = 8;
            ctx.beginPath();

            const step = canvas.width / buf.length;
            let x = 0;
            for (let i = 0; i < buf.length; i++) {
                const y = (buf[i] / 128.0) * (canvas.height / 2);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                x += step;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };
        draw();
        return () => cancelAnimationFrame(frameRef.current);
    }, [analyser, active]);

    // Draw flat line when idle
    useEffect(() => {
        if (active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(192,132,252,0.2)";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }, [active]);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={80}
            style={{ width: "100%", height: 80, borderRadius: 12 }}
        />
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function StarlitSpeakerPage() {
    const [, navigate] = useLocation();
    const queryClient = useQueryClient();

    // Session state
    const [topic, setTopic]             = useState("");
    const [notes, setNotes]             = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds]         = useState(0);
    const [micError, setMicError]       = useState<string | null>(null);
    const [audioUrl, setAudioUrl]       = useState<string | null>(null);
    const [sessionId, setSessionId]     = useState<number | null>(null);
    const [prompt]                      = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

    // Audio refs — not state so they don't trigger re-renders
    const streamRef        = useRef<MediaStream | null>(null);
    const recorderRef      = useRef<MediaRecorder | null>(null);
    const audioCtxRef      = useRef<AudioContext | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const chunksRef        = useRef<Blob[]>([]);

    // Server data
    const { data: rooms = [] } = useQuery<StarlitSpeaker[]>({
        queryKey: ["/api/v1/speaker"],
        refetchInterval: 30_000, // refresh every 30s, not on every render
    });
    const { data: stats } = useQuery<{ activeRooms: number; totalSessions: number }>({
        queryKey: ["/api/v1/speaker/stats"],
        refetchInterval: 60_000,
    });

    const createRoom = useMutation({
        mutationFn: (data: InsertStarlitSpeaker) =>
            apiRequest("POST", "/api/v1/speaker", data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/v1/speaker"] }),
    });

    // Recording timer
    useEffect(() => {
        if (!isRecording) { setSeconds(0); return; }
        const t = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(t);
    }, [isRecording]);

    // ── Start recording ────────────────────────────────────────────────────────
    const startRecording = useCallback(async () => {
        if (!topic) return;
        setMicError(null);
        setAudioUrl(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            streamRef.current = stream;

            const actx = new AudioContext();
            audioCtxRef.current = actx;

            const an = actx.createAnalyser();
            an.fftSize = 2048;
            actx.createMediaStreamSource(stream).connect(an);
            setAnalyser(an);

            const recorder = new MediaRecorder(stream);
            recorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = e => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setAudioUrl(URL.createObjectURL(blob));
            };

            recorder.start(200); // chunk every 200ms
            setIsRecording(true);

            // Create the room in DB
            const res = await createRoom.mutateAsync({
                roomName: `${getTopicLabel(topic)} – ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                topic,
                description: notes.trim() || "A live speaking session",
                maxParticipants: 10,
            }) as any;
            const id = res?.data?.id ?? res?.id ?? null;
            setSessionId(id);
        } catch (err: any) {
            setMicError(
                err?.name === "NotAllowedError"
                    ? "Microphone access was denied. Please allow it in your browser settings."
                    : "Could not access your microphone. Try again."
            );
        }
    }, [topic, notes, createRoom]);

    // ── Stop recording ─────────────────────────────────────────────────────────
    const stopRecording = useCallback(() => {
        recorderRef.current?.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
        audioCtxRef.current?.close();
        setAnalyser(null);
        setIsRecording(false);

        if (sessionId) {
            apiRequest("PATCH", `/api/v1/speaker/${sessionId}/end`, {});
            queryClient.invalidateQueries({ queryKey: ["/api/v1/speaker"] });
            queryClient.invalidateQueries({ queryKey: ["/api/v1/speaker/stats"] });
            setSessionId(null);
        }
    }, [sessionId, queryClient]);

    // Cleanup on unmount (e.g. navigate away mid-recording)
    useEffect(() => () => {
        if (isRecording) stopRecording();
    }, []); // eslint-disable-line

    const canRecord = !!topic && !!navigator.mediaDevices?.getUserMedia;

    return (
        <div style={{ minHeight: "100vh", background: "#05050a", color: "#e2e8f0", fontFamily: "Inter, system-ui, sans-serif" }}>
            <style>{CSS}</style>

            {/* Back button */}
            <button className="ss-back" onClick={() => navigate("/")}>
                <ChevronLeft className="ss-back-icon" /> Back
            </button>

            <div className="ss-shell">

                {/* ── Header ───────────────────────────────────────────────── */}
                <header className="ss-header">
                    <div className="ss-header-icon">
                        <Mic className="ss-header-mic" />
                        {isRecording && <span className="ss-live-dot" />}
                    </div>
                    <div>
                        <h1 className="ss-title">Starlit Speaker</h1>
                        <p className="ss-subtitle">Voice rooms for people who think better out loud.</p>
                    </div>
                </header>

                {/* ── Stats ────────────────────────────────────────────────── */}
                <div className="ss-stats">
                    {[
                        { icon: <Users className="ss-stat-icon" />, value: stats?.activeRooms ?? "—", label: "Live rooms" },
                        { icon: <Mic className="ss-stat-icon" />,   value: stats?.totalSessions ?? "—", label: "Total sessions" },
                        { icon: <Clock className="ss-stat-icon" />, value: fmtTime(seconds), label: isRecording ? "Recording" : "Duration" },
                    ].map((s, i) => (
                        <div key={i} className="ss-stat">
                            {s.icon}
                            <span className="ss-stat-value">{String(s.value)}</span>
                            <span className="ss-stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* ── Studio card ───────────────────────────────────────────── */}
                <div className="ss-card">
                    <div className="ss-card-header">
                        <span className="ss-card-title">Practice Studio</span>
                        <span className="ss-prompt">{prompt}</span>
                    </div>

                    {/* Topic picker */}
                    <div className="ss-section">
                        <label className="ss-label">Choose a format</label>
                        <div className="ss-topics">
                            {TOPICS.map(t => (
                                <button
                                    key={t.value}
                                    className={`ss-topic-btn ${topic === t.value ? "is-on" : ""}`}
                                    style={{ "--tc": t.color, "--tr": t.rgb } as React.CSSProperties}
                                    onClick={() => !isRecording && setTopic(t.value)}
                                    disabled={isRecording}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="ss-section">
                        <label className="ss-label">Key points / outline <span className="ss-optional">(optional)</span></label>
                        <textarea
                            className="ss-textarea"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            disabled={isRecording}
                            placeholder="Bullet points, opening line, structure... or just wing it."
                            rows={3}
                        />
                    </div>

                    {/* Waveform */}
                    <div className="ss-waveform">
                        <Waveform analyser={analyser} active={isRecording} />
                    </div>

                    {/* Error */}
                    {micError && (
                        <div className="ss-error">
                            <AlertCircle className="ss-error-icon" />
                            {micError}
                        </div>
                    )}

                    {/* Controls */}
                    <div className="ss-controls">
                        <button
                            className={`ss-record-btn ${isRecording ? "is-recording" : ""}`}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={!canRecord}
                        >
                            {isRecording ? (
                                <><Square className="ss-btn-icon" /> Stop — {fmtTime(seconds)}</>
                            ) : (
                                <><Mic className="ss-btn-icon" /> Start Speaking</>
                            )}
                        </button>

                        {!canRecord && !isRecording && (
                            <p className="ss-hint">Select a format above to enable recording.</p>
                        )}
                    </div>

                    {/* Playback */}
                    {audioUrl && !isRecording && (
                        <div className="ss-playback">
                            <div className="ss-playback-header">
                                <Play className="ss-play-icon" />
                                <span>Your recording</span>
                            </div>
                            <audio controls src={audioUrl} className="ss-audio" />
                            <p className="ss-playback-hint">
                                This recording lives only in your browser and is never uploaded.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Active rooms ──────────────────────────────────────────── */}
                <div className="ss-card">
                    <div className="ss-card-header">
                        <span className="ss-card-title">Active Sessions</span>
                        <span className="ss-rooms-count">{rooms.length} live</span>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="ss-empty">
                            <Mic className="ss-empty-icon" />
                            <p>No active sessions right now.</p>
                            <p className="ss-empty-sub">Be the first to start speaking tonight.</p>
                        </div>
                    ) : (
                        <div className="ss-rooms">
                            {rooms.map(r => (
                                <div key={r.id} className="ss-room" style={{ "--rc": getTopicColor(r.topic) } as React.CSSProperties}>
                                    <div className="ss-room-dot" />
                                    <div className="ss-room-info">
                                        <span className="ss-room-name">{r.roomName}</span>
                                        <span className="ss-room-topic" style={{ color: getTopicColor(r.topic) }}>
                                            {getTopicLabel(r.topic)}
                                        </span>
                                    </div>
                                    <span className="ss-room-count">
                                        <Users style={{ width: 13, height: 13 }} />
                                        {r.currentParticipants}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ss-back {
  position: fixed; top: 16px; left: 20px; z-index: 50;
  display: flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px; padding: 7px 14px 7px 10px;
  color: #9ca3af; font-size: 13px; cursor: pointer; font-family: inherit;
  transition: all 0.2s;
}
.ss-back:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.ss-back-icon { width: 15px; height: 15px; }

.ss-shell {
  max-width: 700px; margin: 0 auto;
  padding: 80px 16px 60px;
  display: flex; flex-direction: column; gap: 24px;
}

/* Header */
.ss-header {
  display: flex; align-items: center; gap: 18px;
}
.ss-header-icon {
  position: relative;
  width: 60px; height: 60px; border-radius: 20px; flex-shrink: 0;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(139,92,246,0.4);
}
.ss-header-mic { width: 26px; height: 26px; color: white; }
.ss-live-dot {
  position: absolute; top: -4px; right: -4px;
  width: 14px; height: 14px; border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
  animation: livePulse 1.2s ease-in-out infinite;
}
@keyframes livePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }
.ss-title { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: #f1f5f9; }
.ss-subtitle { font-size: 14px; color: rgba(148,163,184,0.7); margin-top: 4px; }

/* Stats */
.ss-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.ss-stat {
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px; padding: 16px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.ss-stat-icon { width: 16px; height: 16px; color: #c084fc; }
.ss-stat-value { font-size: 18px; font-weight: 700; color: #f1f5f9; }
.ss-stat-label { font-size: 11px; color: rgba(148,163,184,0.6); text-align: center; }

/* Card */
.ss-card {
  background: linear-gradient(155deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 22px;
  padding: 22px;
  display: flex; flex-direction: column; gap: 20px;
}
.ss-card-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 8px;
}
.ss-card-title { font-size: 15px; font-weight: 650; color: #f1f5f9; }
.ss-prompt {
  font-size: 11.5px; color: #a78bfa;
  background: rgba(167,139,250,0.1);
  border: 1px solid rgba(167,139,250,0.2);
  border-radius: 100px; padding: 3px 10px;
  max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* Topic picker */
.ss-section { display: flex; flex-direction: column; gap: 8px; }
.ss-label { font-size: 12px; font-weight: 500; color: rgba(148,163,184,0.7); }
.ss-optional { font-weight: 400; color: rgba(148,163,184,0.45); }
.ss-topics { display: flex; flex-wrap: wrap; gap: 8px; }
.ss-topic-btn {
  padding: 7px 14px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.04);
  color: #9ca3af; font-size: 13px; cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.ss-topic-btn:hover:not(:disabled) { background: rgba(255,255,255,0.07); color: #e2e8f0; }
.ss-topic-btn.is-on {
  color: var(--tc, #c084fc);
  background: rgba(var(--tr, 192,132,252), 0.13);
  border-color: rgba(var(--tr, 192,132,252), 0.3);
}
.ss-topic-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Notes */
.ss-textarea {
  width: 100%; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 12px 14px;
  color: #e2e8f0; font-size: 13px; font-family: inherit;
  line-height: 1.6; resize: none;
  transition: border-color 0.2s;
}
.ss-textarea::placeholder { color: rgba(148,163,184,0.4); }
.ss-textarea:focus { outline: none; border-color: rgba(192,132,252,0.35); }

/* Waveform */
.ss-waveform {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; padding: 8px;
}

/* Error */
.ss-error {
  display: flex; align-items: center; gap: 8px;
  color: #f87171; font-size: 13px;
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.2);
  border-radius: 12px; padding: 10px 14px;
}
.ss-error-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* Record button */
.ss-controls { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.ss-record-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 32px; border-radius: 100px; border: none;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white; font-size: 15px; font-weight: 600; font-family: inherit;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(139,92,246,0.4);
  transition: all 0.25s;
}
.ss-record-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(139,92,246,0.55); }
.ss-record-btn:active:not(:disabled) { transform: scale(0.98); }
.ss-record-btn.is-recording {
  background: linear-gradient(135deg, #b91c1c, #ef4444);
  box-shadow: 0 6px 24px rgba(239,68,68,0.4);
  animation: recordPulse 1.5s ease-in-out infinite;
}
@keyframes recordPulse { 0%,100% { box-shadow: 0 6px 24px rgba(239,68,68,0.4); } 50% { box-shadow: 0 6px 36px rgba(239,68,68,0.7); } }
.ss-record-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
.ss-btn-icon { width: 18px; height: 18px; }
.ss-hint { font-size: 12px; color: rgba(148,163,184,0.5); }

/* Playback */
.ss-playback {
  background: rgba(192,132,252,0.07);
  border: 1px solid rgba(192,132,252,0.18);
  border-radius: 14px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.ss-playback-header { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: #c084fc; }
.ss-play-icon { width: 14px; height: 14px; }
.ss-audio { width: 100%; height: 36px; }
.ss-playback-hint { font-size: 11px; color: rgba(148,163,184,0.45); }

/* Active rooms */
.ss-rooms-count {
  font-size: 12px; color: #34d399;
  background: rgba(52,211,153,0.1);
  border: 1px solid rgba(52,211,153,0.2);
  border-radius: 100px; padding: 2px 9px;
}
.ss-rooms { display: flex; flex-direction: column; gap: 8px; }
.ss-room {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  transition: border-color 0.2s;
}
.ss-room:hover { border-color: rgba(var(--rc), 0.2); }
.ss-room-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: #34d399; box-shadow: 0 0 6px #34d399;
  animation: livePulse 2s ease-in-out infinite;
}
.ss-room-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ss-room-name { font-size: 13.5px; font-weight: 600; color: #f1f5f9; }
.ss-room-topic { font-size: 11.5px; font-weight: 500; }
.ss-room-count { display: flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(148,163,184,0.6); flex-shrink: 0; }

.ss-empty { text-align: center; padding: 24px 0; color: rgba(148,163,184,0.5); font-size: 14px; display: flex; flex-direction: column; gap: 6px; align-items: center; }
.ss-empty-icon { width: 32px; height: 32px; opacity: 0.3; }
.ss-empty-sub { font-size: 12px; }
`;