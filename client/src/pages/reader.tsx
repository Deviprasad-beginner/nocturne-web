import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getQueryFn } from "@/lib/queryClient";
import {
    X,
    Settings,
    ZoomIn,
    ZoomOut,
    Clock,
    Eye,
    EyeOff,
    ChevronDown,
    Library,
    ArrowRight,
    Share2,
    MessageSquare,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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

    // Quote sharing state
    const [quoteData, setQuoteData] = useState<{ text: string, rect: DOMRect } | null>(null);
    const [isSharingTarget, setIsSharingTarget] = useState(false);
    const [quotePov, setQuotePov] = useState("");
    const [isSharingQuote, setIsSharingQuote] = useState(false);

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
        queryFn: getQueryFn({ on401: "throw" }),
    });


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
            <div className="min-h-screen text-white flex items-center justify-center bg-transparent">
                <p className="text-gray-400">Please sign in to read</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen text-white flex items-center justify-center bg-transparent">
                <p className="text-gray-400 animate-pulse">Opening reading room…</p>
            </div>
        );
    }

    if (!read) {
        return (
            <div className="min-h-screen text-white flex items-center justify-center bg-transparent">
                <div className="text-center space-y-4">
                    {(error as any)?.status === 401 ? (
                        <>
                            <p className="text-gray-400">Your session expired. Please sign in again.</p>
                            <Button onClick={() => setLocation("/auth")}>Sign In</Button>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-400">Read not found</p>
                            <Button onClick={() => setLocation("/read-card")}>
                                Back to Read Card
                            </Button>
                        </>
                    )}
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
            {read.contentType === "curated" ? (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fadeIn relative overflow-hidden bg-transparent">
                    {/* Immersive ambient glows */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative z-10 w-full max-w-lg">
                        <div className="bg-indigo-950/20 border border-indigo-500/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(79,70,229,0.05)] backdrop-blur-md mb-8 flex flex-col items-center">
                            <div className="w-24 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-xl mb-6 flex items-center justify-center shadow-2xl">
                                <Library className="w-10 h-10 text-indigo-300/80" />
                            </div>
                            <h2 className="text-3xl font-semibold text-white/95 mb-2 font-serif tracking-wide">{read.title}</h2>
                            {read.author && <p className="text-indigo-300/80 font-medium mb-8 uppercase tracking-widest text-sm">{read.author}</p>}

                            <div className="bg-black/40 border border-white/[0.03] p-5 rounded-2xl w-full">
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    You have stepped into the curated external collection. This masterwork is preserved by the Open Library.
                                </p>
                                <Button
                                    className="bg-indigo-600/90 hover:bg-indigo-500 text-white w-full rounded-xl h-12 shadow-[0_0_20px_rgba(79,70,229,0.2)] transition-all font-medium tracking-wide"
                                    onClick={() => window.open(read.contentUrl || "", "_blank")}
                                >
                                    Enter the Grand Library <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <ReaderEnvironment
                    content={read.content || ""}
                    mode={activeMode}
                    onProgress={handleProgress}
                    initialPosition={session?.lastPosition ?? 0}
                    onQuoteSelected={(text, rect) => setQuoteData(text && rect ? { text, rect } : null)}
                />
            )}

            {/* ─── Quote Sharing Popup ─── */}
            {quoteData && !isSharingTarget && (
                <div
                    className="fixed z-[100] animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: Math.max(20, quoteData.rect.top - 60) + 'px',
                        left: Math.max(20, quoteData.rect.left + (quoteData.rect.width / 2) - 100) + 'px'
                    }}
                >
                    <div className="bg-black/90 backdrop-blur-xl border border-indigo-500/30 p-2 rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.2)] flex gap-2">
                        <Button
                            className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white h-8 text-xs font-medium px-4 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); setIsSharingTarget(true); }}
                        >
                            <Share2 className="w-3.5 h-3.5 mr-2" /> Share Quote
                        </Button>
                    </div>
                </div>
            )}

            {/* ─── Quote Sharing Composer ─── */}
            {isSharingTarget && quoteData && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsSharingTarget(false)}>
                    <Card
                        className="w-full max-w-lg bg-[#0a0a0f] border-indigo-500/20 shadow-2xl p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-serif text-white/90 mb-4 flex items-center">
                            <Share2 className="w-5 h-5 text-indigo-400 mr-2" /> Share to Night Feed
                        </h3>

                        <div className="bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-xl mb-4 relative overflow-hidden">
                            <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/50" />
                            <p className="text-indigo-100/90 text-sm leading-relaxed italic font-serif">
                                "{quoteData.text}"
                            </p>
                        </div>

                        <Textarea
                            className="bg-black/50 border-white/10 focus-visible:ring-indigo-500/50 text-white/90 placeholder:text-gray-600 resize-none h-24 mb-6"
                            placeholder="Add your thoughts or point of view... (optional)"
                            value={quotePov}
                            onChange={(e) => setQuotePov(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="ghost"
                                className="text-gray-400 hover:text-white"
                                onClick={() => setIsSharingTarget(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                disabled={isSharingQuote}
                                onClick={async () => {
                                    setIsSharingQuote(true);
                                    try {
                                        await fetch(`/api/v1/books-social/gutenberg_${id}/quotes`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                bookTitle: read.title || "Unknown Book",
                                                authorName: read.author || "Unknown Author",
                                                quoteText: quoteData.text,
                                                notes: quotePov.trim() || undefined
                                            })
                                        });
                                        setIsSharingTarget(false);
                                        setQuoteData(null);
                                        setQuotePov("");
                                        // Could show a toast here
                                    } catch (e) {
                                        console.error("Failed to share quote", e);
                                    } finally {
                                        setIsSharingQuote(false);
                                    }
                                }}
                            >
                                {isSharingQuote ? <Loader2 className="w-4 h-4 animate-spin" /> : "Share Quote"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

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
