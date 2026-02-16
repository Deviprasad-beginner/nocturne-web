import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
    X,
    Settings,
    ZoomIn,
    ZoomOut,
    Clock,
    Eye,
    EyeOff,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ReaderEnvironment from "@/components/reader/ReaderEnvironment";
import {
    READING_MODES,
    type ReadingMode,
    type ReadingModeConfig,
} from "@/lib/reading-modes";
import type { Read, ReadSession } from "@shared/schema";

export default function Reader() {
    const { id } = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const { user } = useAuth();

    const [showControls, setShowControls] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [readingTime, setReadingTime] = useState(0);

    // Typography overrides
    const [fontSizeOverride, setFontSizeOverride] = useState<number | null>(null);

    // Mode override (user can switch mode while reading)
    const [modeOverride, setModeOverride] = useState<ReadingMode | null>(null);
    const [showModeMenu, setShowModeMenu] = useState(false);

    const startTimeRef = useRef(Date.now());

    // Fetch read + session
    const { data, isLoading, error } = useQuery<{ read: Read; session: ReadSession }>({
        queryKey: [`/api/v1/reads/${id}`],
        enabled: !!user && !!id,
    });

    // Debug logging
    console.log("[Reader] id:", id, "user:", !!user, "data:", data, "error:", error, "isLoading:", isLoading);

    const read = data?.read;
    const session = data?.session;

    // Determine active reading mode config
    const activeMode: ReadingModeConfig = (() => {
        const modeId: ReadingMode =
            modeOverride || (read?.intention as ReadingMode) || "think";
        const base = READING_MODES[modeId] || READING_MODES.think;
        if (fontSizeOverride !== null) {
            return {
                ...base,
                typography: { ...base.typography, fontSize: `${fontSizeOverride}px` },
            };
        }
        return base;
    })();

    // Current font size number (for increment/decrement)
    const currentFontSize =
        fontSizeOverride ?? parseInt(activeMode.typography.fontSize, 10);

    // Progress mutation
    const updateProgress = useMutation({
        mutationFn: async (position: number) => {
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            await fetch(`/api/v1/reads/${id}/progress`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    position,
                    positionType: "percentage",
                    timeSpentSeconds: timeSpent,
                }),
            });
            startTimeRef.current = Date.now();
        },
    });

    // Reading timer
    useEffect(() => {
        const t = setInterval(() => setReadingTime((r) => r + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    // Handle progress from ReaderEnvironment
    const handleProgress = useCallback(
        (position: number) => {
            updateProgress.mutate(position);
        },
        [id]
    );

    // ─── Guards ───
    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-gray-400">Please sign in to read</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-gray-400 animate-pulse">Opening reading room…</p>
            </div>
        );
    }

    if (!read) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-gray-400">Read not found</p>
                    <Button onClick={() => setLocation("/read-card")}>
                        Back to Read Card
                    </Button>
                </div>
            </div>
        );
    }

    const modeOptions: { id: ReadingMode; label: string }[] = [
        { id: "learn", label: "Learn" },
        { id: "feel", label: "Feel" },
        { id: "think", label: "Think" },
        { id: "sleep", label: "Sleep" },
    ];

    return (
        <div className="relative" onClick={() => setShowControls((s) => !s)}>
            {/* Main reading environment */}
            <ReaderEnvironment
                content={read.content || ""}
                mode={activeMode}
                onProgress={handleProgress}
                initialPosition={session?.lastPosition ?? 0}
            />

            {/* ─── Floating Controls ─── */}
            {showControls && (
                <div
                    className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Left: close + timer */}
                    <div className="flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation("/read-card")}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-gray-400 font-mono">
                            {formatTime(readingTime)}
                        </span>
                    </div>

                    {/* Right: settings */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSettings((s) => !s)}
                        className="bg-black/80 backdrop-blur-xl border border-white/10  rounded-xl"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* ─── Settings Panel ─── */}
            {showSettings && (
                <Card
                    className="fixed top-16 right-4 z-50 p-5 bg-gray-950/95 backdrop-blur-xl border-white/10 w-72 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Reading Settings
                    </h3>

                    <div className="space-y-5">
                        {/* Font Size */}
                        <div>
                            <label className="text-xs text-gray-500 block mb-2">
                                Font Size
                            </label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setFontSizeOverride(Math.max(14, currentFontSize - 2))
                                    }
                                >
                                    <ZoomOut className="w-3 h-3" />
                                </Button>
                                <span className="text-sm flex-1 text-center text-gray-300">
                                    {currentFontSize}px
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setFontSizeOverride(Math.min(32, currentFontSize + 2))
                                    }
                                >
                                    <ZoomIn className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div>
                            <label className="text-xs text-gray-500 block mb-2">
                                Reading Mode
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowModeMenu((s) => !s)}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-700 text-sm hover:border-gray-600 transition-colors"
                                >
                                    <span className="capitalize">
                                        {modeOverride || read.intention || "think"}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>
                                {showModeMenu && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden z-10">
                                        {modeOptions.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    setModeOverride(opt.id);
                                                    setShowModeMenu(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors
                          ${(modeOverride || read.intention) === opt.id ? "text-indigo-400" : "text-gray-300"}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Focus Mode Toggle */}
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-500">Focus Mode</label>
                            <span className="text-xs text-gray-400">
                                {activeMode.features.focusMode ? (
                                    <Eye className="w-4 h-4 text-indigo-400 inline" />
                                ) : (
                                    <EyeOff className="w-4 h-4 text-gray-600 inline" />
                                )}
                                <span className="ml-1">
                                    {activeMode.features.focusMode ? "On" : "Off"}
                                </span>
                            </span>
                        </div>

                        {/* Reading Stats */}
                        <div className="pt-3 border-t border-gray-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-500 uppercase tracking-wider">
                                    Session
                                </span>
                            </div>
                            <div className="space-y-1.5 text-xs text-gray-400">
                                <div className="flex justify-between">
                                    <span>Time</span>
                                    <span className="text-gray-300 font-mono">
                                        {formatTime(readingTime)}
                                    </span>
                                </div>
                                {read.estimatedReadTimeMinutes && (
                                    <div className="flex justify-between">
                                        <span>Est. total</span>
                                        <span className="text-gray-300">
                                            {read.estimatedReadTimeMinutes} min
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Inline animation */}
            <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.35s ease forwards; }
      `}</style>
        </div>
    );
}
