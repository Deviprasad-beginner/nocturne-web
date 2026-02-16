import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { ReadingModeConfig } from "@/lib/reading-modes";

interface ReaderEnvironmentProps {
    content: string;
    mode: ReadingModeConfig;
    onProgress?: (position: number) => void;
    initialPosition?: number;
}

/**
 * ReaderEnvironment — the cognitive reading container.
 * Renders text with mode-specific typography, scroll physics,
 * focus-paragraph highlighting, and sleep-mode breathing effect.
 */
export default function ReaderEnvironment({
    content,
    mode,
    onProgress,
    initialPosition = 0,
}: ReaderEnvironmentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollPct, setScrollPct] = useState(0);
    const [activeParagraph, setActiveParagraph] = useState<number>(-1);
    const [readingDuration, setReadingDuration] = useState(0); // seconds
    const progressTimerRef = useRef<ReturnType<typeof setTimeout>>();

    // Split content into paragraphs
    const paragraphs = useMemo(
        () => content.split(/\n\n+/).filter((p) => p.trim().length > 0),
        [content]
    );

    // Track reading duration for adaptive contrast
    useEffect(() => {
        const timer = setInterval(() => setReadingDuration((d) => d + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Restore initial scroll position
    useEffect(() => {
        if (initialPosition > 0 && containerRef.current) {
            const target = (initialPosition / 100) * containerRef.current.scrollHeight;
            containerRef.current.scrollTop = target;
        }
    }, [initialPosition]);

    // Determine which paragraph is in the viewport centre
    const updateActiveParagraph = useCallback(() => {
        if (!containerRef.current || !mode.features.focusMode) return;
        const container = containerRef.current;
        const center = container.scrollTop + container.clientHeight / 2;
        const paragraphEls = container.querySelectorAll("[data-paragraph]");
        let closest = -1;
        let minDist = Infinity;
        paragraphEls.forEach((el, i) => {
            const rect = (el as HTMLElement).offsetTop + (el as HTMLElement).offsetHeight / 2;
            const dist = Math.abs(rect - center);
            if (dist < minDist) {
                minDist = dist;
                closest = i;
            }
        });
        setActiveParagraph(closest);
    }, [mode.features.focusMode]);

    // Scroll handler — throttled progress reporting
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleScroll = () => {
            const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
            setScrollPct(Math.min(pct, 100));
            updateActiveParagraph();

            // Debounce progress callback
            if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
            progressTimerRef.current = setTimeout(() => {
                onProgress?.(Math.round(pct));
            }, 1500);
        };

        el.addEventListener("scroll", handleScroll, { passive: true });
        // Initial active paragraph
        updateActiveParagraph();
        return () => {
            el.removeEventListener("scroll", handleScroll);
            if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
        };
    }, [onProgress, updateActiveParagraph]);

    // Adaptive contrast — after 10 min of reading, slightly dim text to reduce eye strain
    const adaptiveOpacity = readingDuration > 600 ? 0.92 : 1;

    // Scroll physics — CSS scroll-behavior + resistance via overscroll-behavior
    const scrollStyle: React.CSSProperties = {
        scrollBehavior: mode.physics.scrollBehavior,
        overscrollBehavior: mode.physics.resistance > 0.5 ? "contain" : "auto",
    };

    return (
        <div
            className="reader-env-root"
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                background: mode.colors.background,
                color: mode.colors.text,
                transition: "background 0.6s ease, color 0.6s ease",
                overflow: "hidden",
            }}
        >
            {/* Sleep-mode breathing glow */}
            {mode.features.breathingEffect && (
                <div
                    className="breathing-glow"
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        zIndex: 1,
                        background: `radial-gradient(ellipse at 50% 50%, ${mode.colors.accent}15, transparent 70%)`,
                        animation: "breathe 6s ease-in-out infinite",
                    }}
                />
            )}

            {/* Progress bar */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: `${scrollPct}%`,
                    height: 2,
                    background: mode.colors.accent,
                    transition: "width 0.3s ease",
                    zIndex: 50,
                }}
            />

            {/* Scrollable content area */}
            <div
                ref={containerRef}
                style={{
                    ...scrollStyle,
                    height: "100%",
                    overflowY: "auto",
                    padding: `80px ${mode.layout.padding}`,
                    maxWidth: mode.layout.maxWidth,
                    margin: "0 auto",
                    fontFamily: mode.typography.fontFamily,
                    fontSize: mode.typography.fontSize,
                    lineHeight: mode.typography.lineHeight,
                    letterSpacing: mode.typography.letterSpacing,
                    fontWeight: mode.typography.fontWeight as any,
                    textAlign: mode.layout.alignment,
                    opacity: adaptiveOpacity,
                    transition: "opacity 2s ease",
                    /* Selection colour */
                    ...(
                        { "--selection-bg": mode.colors.selection } as React.CSSProperties
                    ),
                }}
            >
                {paragraphs.map((para, i) => {
                    const isFocused = activeParagraph === i;
                    const dimmed =
                        mode.features.focusMode && activeParagraph >= 0 && !isFocused;

                    return (
                        <p
                            key={i}
                            data-paragraph={i}
                            style={{
                                marginBottom: mode.id === "sleep" ? "3em" : mode.id === "think" ? "2.4em" : "1.6em",
                                opacity: dimmed ? 0.3 : 1,
                                transform: isFocused && mode.features.focusMode ? "scale(1.005)" : "scale(1)",
                                transition: "opacity 0.5s ease, transform 0.5s ease",
                            }}
                        >
                            {para}
                        </p>
                    );
                })}

                {/* Bottom padding so user can scroll past end */}
                <div style={{ height: "60vh" }} />
            </div>

            {/* Inline keyframes for breathing */}
            <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.04); }
        }
        .reader-env-root ::selection {
          background: var(--selection-bg, #374151);
        }
      `}</style>
        </div>
    );
}
