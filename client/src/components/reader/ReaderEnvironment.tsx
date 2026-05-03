import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { ReadingModeConfig } from "@/lib/reading-modes";

interface ReaderEnvironmentProps {
    content: string;
    mode: ReadingModeConfig;
    onProgress?: (position: number) => void;
    initialPosition?: number;
}

// ── Per-mode atmospheric background config ────────────────────────────────────
const MOOD_ATMOSPHERES: Record<string, {
    base: string;           // full-screen gradient
    orb1: string;           // large ambient orb colour
    orb2: string;           // secondary orb colour
    vignette: string;       // edge vignette colour
    grain: boolean;         // film-grain overlay
    particles: string;      // floating particle colour (empty string = none)
    particleCount: number;
    scanlines: boolean;     // subtle horizontal scanlines (learn)
}> = {
    learn: {
        base: "linear-gradient(160deg, #0f172a 0%, #0e1b2e 40%, #071120 100%)",
        orb1: "rgba(56,189,248,0.12)",
        orb2: "rgba(99,102,241,0.09)",
        vignette: "rgba(0,0,0,0.55)",
        grain: true,
        particles: "rgba(148,213,255,0.5)",
        particleCount: 18,
        scanlines: true,
    },
    feel: {
        base: "linear-gradient(150deg, #1a0a00 0%, #2d1200 35%, #1a0c04 70%, #0f0800 100%)",
        orb1: "rgba(251,146,60,0.15)",
        orb2: "rgba(217,119,6,0.10)",
        vignette: "rgba(10,4,0,0.6)",
        grain: true,
        particles: "rgba(251,191,36,0.4)",
        particleCount: 22,
        scanlines: false,
    },
    think: {
        base: "linear-gradient(170deg, #0a0a12 0%, #0d0b18 45%, #07080f 100%)",
        orb1: "rgba(139,92,246,0.13)",
        orb2: "rgba(99,102,241,0.08)",
        vignette: "rgba(0,0,0,0.65)",
        grain: true,
        particles: "rgba(167,139,250,0.35)",
        particleCount: 14,
        scanlines: false,
    },
    sleep: {
        base: "linear-gradient(180deg, #000005 0%, #02020a 50%, #000000 100%)",
        orb1: "rgba(71,85,105,0.12)",
        orb2: "rgba(30,41,59,0.08)",
        vignette: "rgba(0,0,0,0.75)",
        grain: false,
        particles: "rgba(148,163,184,0.25)",
        particleCount: 8,
        scanlines: false,
    },
};

// Text colors that work on dark backgrounds — overrides the light-mode defaults
const MOOD_TEXT: Record<string, { text: string; dimText: string; accent: string; selection: string }> = {
    learn: {
        text: "#cbd5e1",
        dimText: "rgba(203,213,225,0.3)",
        accent: "#38bdf8",
        selection: "#1e3a5f",
    },
    feel: {
        text: "#fde8d0",
        dimText: "rgba(253,232,208,0.25)",
        accent: "#fb923c",
        selection: "#7c2d12",
    },
    think: {
        text: "#ddd6fe",
        dimText: "rgba(221,214,254,0.25)",
        accent: "#a78bfa",
        selection: "#3b1f6e",
    },
    sleep: {
        text: "#94a3b8",
        dimText: "rgba(148,163,184,0.2)",
        accent: "#475569",
        selection: "#1e293b",
    },
};

// ── Floating particle component ────────────────────────────────────────────────
function Particle({
    color,
    delay,
    size,
    left,
    duration,
}: {
    color: string;
    delay: number;
    size: number;
    left: number;
    duration: number;
}) {
    return (
        <div
            style={{
                position: "absolute",
                bottom: "-10px",
                left: `${left}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                background: color,
                filter: `blur(${size * 0.4}px)`,
                animation: `floatUp ${duration}s ${delay}s ease-in-out infinite`,
                pointerEvents: "none",
            }}
        />
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ReaderEnvironment({
    content,
    mode,
    onProgress,
    initialPosition = 0,
}: ReaderEnvironmentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollPct, setScrollPct] = useState(0);
    const [activeParagraph, setActiveParagraph] = useState<number>(-1);
    const [readingDuration, setReadingDuration] = useState(0);
    const progressTimerRef = useRef<ReturnType<typeof setTimeout>>();

    const atm = MOOD_ATMOSPHERES[mode.id] ?? MOOD_ATMOSPHERES.think;
    const textColors = MOOD_TEXT[mode.id] ?? MOOD_TEXT.think;

    // Seeded random particles (stable across renders)
    const particles = useMemo(() =>
        Array.from({ length: atm.particleCount }, (_, i) => ({
            id: i,
            left: ((i * 37 + 11) % 97),
            size: 2 + ((i * 13) % 5),
            delay: (i * 1.3) % 8,
            duration: 12 + ((i * 7) % 14),
        })),
        [atm.particleCount]
    );

    // ── Lightweight content parser ────────────────────────────────────────────
    // Parses the raw text into typed blocks: heading, blockquote, divider, paragraph
    type Block =
        | { type: "h1"; text: string }
        | { type: "h2"; text: string }
        | { type: "h3"; text: string }
        | { type: "blockquote"; text: string }
        | { type: "divider" }
        | { type: "paragraph"; lines: string[] };

    const blocks = useMemo((): Block[] => {
        // ── Tier 1: Try double-newline split
        let rawBlocks = content.split(/\n\n+/).map(b => b.trim()).filter(Boolean);

        // ── Tier 2: If entire content is 1–2 big blobs, try single-newline split instead
        const avgLen = rawBlocks.reduce((s, b) => s + b.length, 0) / (rawBlocks.length || 1);
        if (rawBlocks.length <= 2 || avgLen > 800) {
            const singleSplit = content.split(/\n/).map(b => b.trim()).filter(Boolean);
            if (singleSplit.length > rawBlocks.length) rawBlocks = singleSplit;
        }

        // ── Helper: auto-split a wall-of-text blob by sentence boundaries (~3 sentences each)
        const sentenceChunk = (text: string): string[] => {
            // Match sentence endings: period/!/? followed by space or end, but not abbreviations like "a.m."
            const sentences = text.match(/[^.!?]*(?:[.!?](?:["']?\s+(?=[A-Z])|["']?$))/g) ?? [text];
            const chunks: string[] = [];
            const size = 3;
            for (let s = 0; s < sentences.length; s += size) {
                const chunk = sentences.slice(s, s + size).join("").trim();
                if (chunk) chunks.push(chunk);
            }
            // Leftover sentences that didn't complete a full chunk
            const remainder = text.slice(chunks.join("").length).trim();
            if (remainder) chunks.push(remainder);
            return chunks.length > 1 ? chunks : [text];
        };

        const result: Block[] = [];
        for (const block of rawBlocks) {
            const trimmed = block.trim();
            if (!trimmed) continue;

            if (/^#{3}\s+/.test(trimmed)) {
                result.push({ type: "h3", text: trimmed.replace(/^#{3}\s+/, "") });
            } else if (/^#{2}\s+/.test(trimmed)) {
                result.push({ type: "h2", text: trimmed.replace(/^#{2}\s+/, "") });
            } else if (/^#\s+/.test(trimmed)) {
                result.push({ type: "h1", text: trimmed.replace(/^#\s+/, "") });
            } else if (/^>{1,2}\s?/.test(trimmed)) {
                result.push({ type: "blockquote", text: trimmed.replace(/^>{1,2}\s?/, "") });
            } else if (/^[-*]{3,}$/.test(trimmed.replace(/\s/g, ""))) {
                result.push({ type: "divider" });
            } else {
                const lines = trimmed.split("\n");
                const hasMultipleLines = lines.length > 1;

                if (!hasMultipleLines && trimmed.length > 500) {
                    // ── Tier 3: Wall of text — auto-split by sentence boundaries
                    for (const chunk of sentenceChunk(trimmed)) {
                        result.push({ type: "paragraph", lines: [chunk] });
                    }
                } else {
                    result.push({ type: "paragraph", lines: lines });
                }
            }
        }
        return result;
    }, [content]);

    // Render inline markdown: **bold**, *italic*, `code`
    const renderInline = (text: string): React.ReactNode => {
        const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
        return parts.map((part, i) => {
            if (/^\*\*[^*]+\*\*$/.test(part))
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            if (/^\*[^*]+\*$/.test(part))
                return <em key={i}>{part.slice(1, -1)}</em>;
            if (/^`[^`]+`$/.test(part))
                return <code key={i} style={{ fontFamily: "monospace", fontSize: "0.9em", opacity: 0.8 }}>{part.slice(1, -1)}</code>;
            return part;
        });
    };

    // Reading duration timer (adaptive contrast)
    useEffect(() => {
        const t = setInterval(() => setReadingDuration((d) => d + 1), 1000);
        return () => clearInterval(t);
    }, []);

    // Restore scroll position
    useEffect(() => {
        if (initialPosition > 0 && containerRef.current) {
            const target = (initialPosition / 100) * containerRef.current.scrollHeight;
            containerRef.current.scrollTop = target;
        }
    }, [initialPosition]);

    // Focus paragraph detection
    const updateActiveParagraph = useCallback(() => {
        if (!containerRef.current || !mode.features.focusMode) return;
        const container = containerRef.current;
        const center = container.scrollTop + container.clientHeight / 2;
        const paragraphEls = container.querySelectorAll("[data-paragraph]");
        let closest = -1, minDist = Infinity;
        paragraphEls.forEach((el, i) => {
            const rect = (el as HTMLElement).offsetTop + (el as HTMLElement).offsetHeight / 2;
            const dist = Math.abs(rect - center);
            if (dist < minDist) { minDist = dist; closest = i; }
        });
        setActiveParagraph(closest);
    }, [mode.features.focusMode]);

    // Scroll handler
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handleScroll = () => {
            const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
            setScrollPct(Math.min(pct, 100));
            updateActiveParagraph();
            if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
            progressTimerRef.current = setTimeout(() => onProgress?.(Math.round(pct)), 1500);
        };
        el.addEventListener("scroll", handleScroll, { passive: true });
        updateActiveParagraph();
        return () => {
            el.removeEventListener("scroll", handleScroll);
            if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
        };
    }, [onProgress, updateActiveParagraph]);

    const adaptiveOpacity = readingDuration > 600 ? 0.92 : 1;

    return (
        <div
            className="reader-env-root"
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                background: atm.base,
                color: textColors.text,
                transition: "background 0.8s ease, color 0.6s ease",
                overflow: "hidden",
            }}
        >
            {/* ── Ambient orb 1 (top-left) ── */}
            <div style={{
                position: "absolute", top: "-15%", left: "-10%",
                width: "60vw", height: "60vw",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${atm.orb1}, transparent 70%)`,
                filter: "blur(60px)",
                pointerEvents: "none",
                animation: "orbDrift1 18s ease-in-out infinite alternate",
            }} />

            {/* ── Ambient orb 2 (bottom-right) ── */}
            <div style={{
                position: "absolute", bottom: "-10%", right: "-8%",
                width: "50vw", height: "50vw",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${atm.orb2}, transparent 70%)`,
                filter: "blur(80px)",
                pointerEvents: "none",
                animation: "orbDrift2 22s ease-in-out infinite alternate",
            }} />

            {/* ── Sleep extra orb (centre) ── */}
            {mode.id === "sleep" && (
                <div style={{
                    position: "absolute", top: "30%", left: "30%",
                    width: "40vw", height: "40vw",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(30,41,59,0.15), transparent 70%)",
                    filter: "blur(100px)",
                    pointerEvents: "none",
                    animation: "breathe 8s ease-in-out infinite",
                }} />
            )}

            {/* ── Feel mode warm candle flicker ── */}
            {mode.id === "feel" && (
                <div style={{
                    position: "absolute", top: "10%", right: "15%",
                    width: "25vw", height: "40vh",
                    background: "radial-gradient(ellipse at 50% 80%, rgba(251,146,60,0.08), transparent 70%)",
                    filter: "blur(40px)",
                    pointerEvents: "none",
                    animation: "flicker 3s ease-in-out infinite alternate",
                }} />
            )}

            {/* ── Grain overlay ── */}
            {atm.grain && (
                <div style={{
                    position: "absolute", inset: 0,
                    pointerEvents: "none", zIndex: 1,
                    opacity: 0.04,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "128px 128px",
                    mixBlendMode: "overlay",
                }} />
            )}

            {/* ── Scanlines (learn mode) ── */}
            {atm.scanlines && (
                <div style={{
                    position: "absolute", inset: 0,
                    pointerEvents: "none", zIndex: 1,
                    opacity: 0.025,
                    backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 4px)",
                    mixBlendMode: "overlay",
                }} />
            )}

            {/* ── Edge vignette ── */}
            <div style={{
                position: "absolute", inset: 0,
                pointerEvents: "none", zIndex: 2,
                background: `radial-gradient(ellipse at 50% 50%, transparent 50%, ${atm.vignette} 100%)`,
            }} />

            {/* ── Floating particles ── */}
            {atm.particles && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
                    {particles.map((p) => (
                        <Particle
                            key={p.id}
                            color={atm.particles}
                            left={p.left}
                            size={p.size}
                            delay={p.delay}
                            duration={p.duration}
                        />
                    ))}
                </div>
            )}

            {/* ── Progress bar ── */}
            <div style={{
                position: "fixed", top: 0, left: 0,
                width: `${scrollPct}%`, height: 2,
                background: `linear-gradient(90deg, ${textColors.accent}, ${textColors.accent}88)`,
                boxShadow: `0 0 8px ${textColors.accent}`,
                transition: "width 0.3s ease",
                zIndex: 50,
            }} />

            {/* ── Scrollable text content ── */}
            <div
                ref={containerRef}
                style={{
                    position: "relative",
                    zIndex: 10,
                    height: "100%",
                    overflowY: "auto",
                    scrollBehavior: mode.physics.scrollBehavior,
                    overscrollBehavior: mode.physics.resistance > 0.5 ? "contain" : "auto",
                    padding: `80px ${mode.layout.padding}`,
                    maxWidth: mode.layout.maxWidth,
                    margin: "0 auto",
                    fontFamily: mode.typography.fontFamily,
                    fontSize: mode.typography.fontSize,
                    lineHeight: mode.typography.lineHeight,
                    letterSpacing: mode.typography.letterSpacing,
                    fontWeight: mode.typography.fontWeight as any,
                    textAlign: "left",
                    opacity: adaptiveOpacity,
                    transition: "opacity 2s ease",
                    ...({ "--selection-bg": textColors.selection } as React.CSSProperties),
                }}
            >
                {blocks.map((block, i) => {
                    const isFocused = activeParagraph === i;
                    const dimmed = mode.features.focusMode && activeParagraph >= 0 && !isFocused;
                    const paraSpacing =
                        mode.id === "sleep" ? "3.2em" :
                        mode.id === "think" ? "2.4em" : "1.8em";
                    const dimStyle = {
                        color: dimmed ? textColors.dimText : textColors.text,
                        transition: "color 0.5s ease, transform 0.5s ease",
                        transform: isFocused && mode.features.focusMode ? "scale(1.006)" : "scale(1)",
                    };

                    if (block.type === "divider") {
                        return (
                            <hr
                                key={i}
                                data-paragraph={i}
                                style={{
                                    border: "none",
                                    borderTop: `1px solid ${textColors.accent}33`,
                                    margin: `${paraSpacing} auto`,
                                    width: "40%",
                                }}
                            />
                        );
                    }

                    if (block.type === "blockquote") {
                        return (
                            <blockquote
                                key={i}
                                data-paragraph={i}
                                style={{
                                    ...dimStyle,
                                    marginBottom: paraSpacing,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    paddingLeft: "1.4em",
                                    borderLeft: `3px solid ${textColors.accent}`,
                                    fontStyle: "italic",
                                    opacity: dimmed ? 0.35 : 0.85,
                                    letterSpacing: "0.01em",
                                }}
                            >
                                {renderInline(block.text)}
                            </blockquote>
                        );
                    }

                    if (block.type === "h1") {
                        return (
                            <h1
                                key={i}
                                data-paragraph={i}
                                style={{
                                    ...dimStyle,
                                    fontSize: "1.9em",
                                    fontWeight: 700,
                                    color: textColors.accent,
                                    marginBottom: "0.6em",
                                    marginTop: i === 0 ? 0 : "1.6em",
                                    lineHeight: 1.25,
                                    letterSpacing: "-0.01em",
                                    paddingBottom: "0.3em",
                                    borderBottom: `1px solid ${textColors.accent}30`,
                                }}
                            >
                                {renderInline(block.text)}
                            </h1>
                        );
                    }

                    if (block.type === "h2") {
                        return (
                            <h2
                                key={i}
                                data-paragraph={i}
                                style={{
                                    ...dimStyle,
                                    fontSize: "1.4em",
                                    fontWeight: 600,
                                    color: textColors.accent,
                                    marginBottom: "0.5em",
                                    marginTop: i === 0 ? 0 : "1.4em",
                                    lineHeight: 1.3,
                                    opacity: dimmed ? 0.35 : 0.9,
                                }}
                            >
                                {renderInline(block.text)}
                            </h2>
                        );
                    }

                    if (block.type === "h3") {
                        return (
                            <h3
                                key={i}
                                data-paragraph={i}
                                style={{
                                    ...dimStyle,
                                    fontSize: "1.1em",
                                    fontWeight: 600,
                                    color: textColors.text,
                                    marginBottom: "0.4em",
                                    marginTop: i === 0 ? 0 : "1.2em",
                                    lineHeight: 1.4,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    opacity: dimmed ? 0.35 : 0.7,
                                }}
                            >
                                {renderInline(block.text)}
                            </h3>
                        );
                    }

                    // paragraph
                    return (
                        <p
                            key={i}
                            data-paragraph={i}
                            style={{
                                ...dimStyle,
                                marginBottom: paraSpacing,
                                textIndent:
                                    (mode.id === "feel" || mode.id === "sleep") && i > 0 && blocks[i - 1]?.type === "paragraph"
                                        ? "1.8em"
                                        : "0",
                            }}
                        >
                            {block.lines.map((line, li) => (
                                <span key={li}>
                                    {renderInline(line)}
                                    {li < block.lines.length - 1 && <br />}
                                </span>
                            ))}
                        </p>
                    );
                })}
                <div style={{ height: "60vh" }} />
            </div>

            {/* ── Keyframes ── */}
            <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes flicker {
          0%   { opacity: 0.7; transform: scaleY(1) translateX(0); }
          33%  { opacity: 0.9; transform: scaleY(1.04) translateX(2px); }
          66%  { opacity: 0.75; transform: scaleY(0.97) translateX(-1px); }
          100% { opacity: 0.85; transform: scaleY(1.02) translateX(1px); }
        }
        @keyframes orbDrift1 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(4%, 6%) scale(1.08); }
        }
        @keyframes orbDrift2 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-5%, -4%) scale(1.05); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        .reader-env-root ::selection {
          background: var(--selection-bg, #374151);
        }
        .reader-env-root::-webkit-scrollbar { width: 4px; }
        .reader-env-root::-webkit-scrollbar-track { background: transparent; }
        .reader-env-root::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>
        </div>
    );
}
