/**
 * NightTones — native Web Audio tone generator
 * Lets users layer binaural beats or ambient noise independently from any Jamendo track.
 * No external API. Pure browser audio.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Tone presets ─────────────────────────────────────────────────────────────

type NoiseType = "brown" | "pink" | "white";
type BinauralPreset = "delta" | "theta" | "alpha" | null;
type AmbientType = "rain" | "campfire" | "ocean" | null;

const BINAURAL_PRESETS = [
    {
        id: "delta" as const,
        label: "Delta",
        hz: 2,
        sub: "Deep sleep  ·  2 Hz",
        color: "text-indigo-300",
        active: "bg-indigo-600/30 border-indigo-500/40 text-indigo-200",
    },
    {
        id: "theta" as const,
        label: "Theta",
        hz: 6,
        sub: "Meditation  ·  6 Hz",
        color: "text-violet-300",
        active: "bg-violet-600/30 border-violet-500/40 text-violet-200",
    },
    {
        id: "alpha" as const,
        label: "Alpha",
        hz: 10,
        sub: "Calm focus  ·  10 Hz",
        color: "text-cyan-300",
        active: "bg-cyan-600/30 border-cyan-500/40 text-cyan-200",
    },
];

const NOISE_OPTIONS: { id: NoiseType; label: string; sub: string }[] = [
    { id: "brown", label: "Brown", sub: "Warm, deep hum" },
    { id: "pink", label: "Pink", sub: "Balanced, natural" },
    { id: "white", label: "White", sub: "Full-spectrum wash" },
];

const AMBIENT_OPTIONS: { id: NonNullable<AmbientType>; label: string; sub: string; url: string }[] = [
    { id: "rain", label: "Light Rain", sub: "Steady, calming drops", url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg" },
    { id: "campfire", label: "Campfire", sub: "Cozy crackling wood", url: "https://actions.google.com/sounds/v1/foley/fire_crackling.ogg" },
    { id: "ocean", label: "Ocean Waves", sub: "Gentle rhythmic surf", url: "https://actions.google.com/sounds/v1/water/ocean_waves_rhythmic.ogg" },
];

// ─── Web Audio helpers ────────────────────────────────────────────────────────

function createNoiseBuffer(ctx: AudioContext, type: NoiseType): AudioBuffer {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === "white") {
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
    } else {
        // Brown noise
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
    }

    return buffer;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useNightAudio() {
    const ctxRef = useRef<AudioContext | null>(null);
    const noiseRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);
    const binauralRef = useRef<{ left: OscillatorNode; right: OscillatorNode; gain: GainNode; merger: ChannelMergerNode } | null>(null);
    const ambientRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode; url: string } | null>(null);

    const getCtx = useCallback(() => {
        if (!ctxRef.current || ctxRef.current.state === "closed") {
            ctxRef.current = new AudioContext();
        }
        if (ctxRef.current.state === "suspended") ctxRef.current.resume();
        return ctxRef.current;
    }, []);

    const startNoise = useCallback((type: NoiseType, vol: number) => {
        const ctx = getCtx();
        if (noiseRef.current) {
            noiseRef.current.source.stop();
            noiseRef.current = null;
        }
        const buffer = createNoiseBuffer(ctx, type);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
        noiseRef.current = { source, gain };
    }, [getCtx]);

    const stopNoise = useCallback(() => {
        if (noiseRef.current) {
            noiseRef.current.gain.gain.linearRampToValueAtTime(0, (ctxRef.current?.currentTime ?? 0) + 0.3);
            setTimeout(() => {
                noiseRef.current?.source.stop();
                noiseRef.current = null;
            }, 350);
        }
    }, []);

    const startBinaural = useCallback((beatHz: number, vol: number) => {
        const ctx = getCtx();
        if (binauralRef.current) {
            binauralRef.current.left.stop();
            binauralRef.current.right.stop();
            binauralRef.current = null;
        }
        const baseFreq = 200;
        const left = ctx.createOscillator();
        const right = ctx.createOscillator();
        left.frequency.value = baseFreq;
        right.frequency.value = baseFreq + beatHz;
        left.type = "sine";
        right.type = "sine";

        const merger = ctx.createChannelMerger(2);
        left.connect(merger, 0, 0);
        right.connect(merger, 0, 1);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol * 0.25, ctx.currentTime);
        merger.connect(gain);
        gain.connect(ctx.destination);
        left.start();
        right.start();
        binauralRef.current = { left, right, gain, merger };
    }, [getCtx]);

    const stopBinaural = useCallback(() => {
        if (binauralRef.current) {
            binauralRef.current.gain.gain.linearRampToValueAtTime(0, (ctxRef.current?.currentTime ?? 0) + 0.3);
            const b = binauralRef.current;
            setTimeout(() => { b.left.stop(); b.right.stop(); }, 350);
            binauralRef.current = null;
        }
    }, []);

    const setNoiseVolume = useCallback((vol: number) => {
        if (noiseRef.current && ctxRef.current) {
            noiseRef.current.gain.gain.setValueAtTime(vol * 0.4, ctxRef.current.currentTime);
        }
    }, []);

    const setBinauralVolume = useCallback((vol: number) => {
        if (binauralRef.current && ctxRef.current) {
            binauralRef.current.gain.gain.setValueAtTime(vol * 0.25, ctxRef.current.currentTime);
        }
    }, []);

    const startAmbient = useCallback(async (url: string, vol: number) => {
        const ctx = getCtx();
        if (ambientRef.current) {
            if (ambientRef.current.url === url) return; // already playing this
            ambientRef.current.source.stop();
            ambientRef.current = null;
        }

        try {
            const resp = await fetch(url);
            const arrayBuffer = await resp.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(vol * 0.5, ctx.currentTime);

            source.connect(gain);
            gain.connect(ctx.destination);
            source.start();

            ambientRef.current = { source, gain, url };
        } catch (e) {
            console.error("Failed to load ambient loop", e);
        }
    }, [getCtx]);

    const stopAmbient = useCallback(() => {
        if (ambientRef.current) {
            ambientRef.current.gain.gain.linearRampToValueAtTime(0, (ctxRef.current?.currentTime ?? 0) + 0.3);
            setTimeout(() => {
                ambientRef.current?.source.stop();
                ambientRef.current = null;
            }, 350);
        }
    }, []);

    const setAmbientVolume = useCallback((vol: number) => {
        if (ambientRef.current && ctxRef.current) {
            ambientRef.current.gain.gain.setValueAtTime(vol * 0.5, ctxRef.current.currentTime);
        }
    }, []);

    useEffect(() => () => {
        noiseRef.current?.source.stop();
        binauralRef.current?.left.stop();
        binauralRef.current?.right.stop();
        ambientRef.current?.source.stop();
        ctxRef.current?.close();
    }, []);

    return {
        startNoise, stopNoise, setNoiseVolume,
        startBinaural, stopBinaural, setBinauralVolume,
        startAmbient, stopAmbient, setAmbientVolume
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NightTones() {
    const [activeNoise, setActiveNoise] = useState<NoiseType | null>(null);
    const [activeBinaural, setActiveBinaural] = useState<BinauralPreset>(null);
    const [activeAmbient, setActiveAmbient] = useState<AmbientType>(null);

    const [noiseVol, setNoiseVol] = useState(0.6);
    const [binauralVol, setBinauralVolState] = useState(0.5);
    const [ambientVol, setAmbientVol] = useState(0.7);

    const [isOpen, setIsOpen] = useState(false);

    const {
        startNoise, stopNoise, setNoiseVolume,
        startBinaural, stopBinaural, setBinauralVolume,
        startAmbient, stopAmbient, setAmbientVolume
    } = useNightAudio();

    const toggleNoise = (type: NoiseType) => {
        if (activeNoise === type) {
            stopNoise();
            setActiveNoise(null);
        } else {
            startNoise(type, noiseVol);
            setActiveNoise(type);
        }
    };

    const toggleBinaural = (preset: typeof BINAURAL_PRESETS[0]) => {
        if (activeBinaural === preset.id) {
            stopBinaural();
            setActiveBinaural(null);
        } else {
            startBinaural(preset.hz, binauralVol);
            setActiveBinaural(preset.id);
        }
    };

    const toggleAmbient = (preset: typeof AMBIENT_OPTIONS[0]) => {
        if (activeAmbient === preset.id) {
            stopAmbient();
            setActiveAmbient(null);
        } else {
            startAmbient(preset.url, ambientVol);
            setActiveAmbient(preset.id);
        }
    };

    const handleNoiseVol = (v: number) => {
        setNoiseVol(v);
        setNoiseVolume(v);
    };

    const handleBinauralVol = (v: number) => {
        setBinauralVolState(v);
        setBinauralVolume(v);
    };

    const handleAmbientVol = (v: number) => {
        setAmbientVol(v);
        setAmbientVolume(v);
    };

    const isActive = activeNoise !== null || activeBinaural !== null || activeAmbient !== null;

    return (
        <div className="mb-8">
            {/* Toggle row */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-base font-medium tracking-wide">Tonight's Tone</span>
                    {isActive && (
                        <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono animate-pulse">
                            live
                        </span>
                    )}
                </div>
                <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">
                    {isOpen ? "close" : "layer sounds →"}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-5 space-y-6">

                            {/* Noise layer */}
                            <div>
                                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                                    Background noise
                                </p>
                                <div className="flex gap-2.5">
                                    {NOISE_OPTIONS.map((n) => (
                                        <button
                                            key={n.id}
                                            onClick={() => toggleNoise(n.id)}
                                            className={`flex-1 rounded-2xl border py-3 text-center transition-all ${activeNoise === n.id
                                                ? "bg-white/10 border-white/20 text-white"
                                                : "border-white/6 text-white/40 hover:text-white/70 hover:border-white/12"
                                                }`}
                                        >
                                            <p className="text-sm font-medium">{n.label}</p>
                                            <p className="text-[10px] mt-0.5 opacity-50">{n.sub}</p>
                                        </button>
                                    ))}
                                </div>
                                {activeNoise && (
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[10px] text-white/30 w-10">quiet</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={noiseVol}
                                            onChange={(e) => handleNoiseVol(parseFloat(e.target.value))}
                                            className="flex-1 h-0.5 accent-white/60 cursor-pointer"
                                        />
                                        <span className="text-[10px] text-white/30 w-10 text-right">loud</span>
                                    </div>
                                )}
                            </div>

                            {/* Binaural layer */}
                            <div>
                                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                                    Binaural beats
                                    <span className="ml-2 normal-case text-white/20">use headphones</span>
                                </p>
                                <div className="flex gap-2.5">
                                    {BINAURAL_PRESETS.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => toggleBinaural(p)}
                                            className={`flex-1 rounded-2xl border py-3 text-center transition-all ${activeBinaural === p.id
                                                ? p.active
                                                : "border-white/6 text-white/40 hover:text-white/70 hover:border-white/12"
                                                }`}
                                        >
                                            <p className="text-sm font-medium">{p.label}</p>
                                            <p className="text-[10px] mt-0.5 opacity-60">{p.sub}</p>
                                        </button>
                                    ))}
                                </div>
                                {activeBinaural && (
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[10px] text-white/30 w-10">subtle</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={binauralVol}
                                            onChange={(e) => handleBinauralVol(parseFloat(e.target.value))}
                                            className="flex-1 h-0.5 accent-white/60 cursor-pointer"
                                        />
                                        <span className="text-[10px] text-white/30 w-10 text-right">present</span>
                                    </div>
                                )}
                            </div>

                            {/* Ambient loops layer */}
                            <div>
                                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                                    Ambient Sounds
                                </p>
                                <div className="flex gap-2.5">
                                    {AMBIENT_OPTIONS.map((a) => (
                                        <button
                                            key={a.id}
                                            onClick={() => toggleAmbient(a)}
                                            className={`flex-1 rounded-2xl border py-3 text-center transition-all ${activeAmbient === a.id
                                                ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                                : "border-white/6 text-white/40 hover:text-white/70 hover:border-white/12"
                                                }`}
                                        >
                                            <p className="text-sm font-medium">{a.label}</p>
                                            <p className="text-[10px] mt-0.5 opacity-60">{a.sub}</p>
                                        </button>
                                    ))}
                                </div>
                                {activeAmbient && (
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[10px] text-white/30 w-10">subtle</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={ambientVol}
                                            onChange={(e) => handleAmbientVol(parseFloat(e.target.value))}
                                            className="flex-1 h-0.5 accent-white/60 cursor-pointer"
                                        />
                                        <span className="text-[10px] text-white/30 w-10 text-right">present</span>
                                    </div>
                                )}
                            </div>

                            {isActive && (
                                <p className="text-[11px] text-white/20 leading-relaxed">
                                    These tones layer on top of any music you play.
                                    They'll stop when you leave the page.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Divider */}
            <div className="mt-6 h-px bg-white/5" />
        </div>
    );
}
