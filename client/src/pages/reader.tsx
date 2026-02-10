import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
    X,
    Settings,
    Type,
    ZoomIn,
    ZoomOut,
    Clock,
    BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Read, ReadSession } from "@shared/schema";

export default function Reader() {
    const { id } = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const { user } = useAuth();

    const [showControls, setShowControls] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [readingTime, setReadingTime] = useState(0);

    // Typography settings
    const [fontSize, setFontSize] = useState(18);
    const [lineHeight, setLineHeight] = useState(1.8);
    const [fontFamily, setFontFamily] = useState<"sans" | "serif">("serif");

    const contentRef = useRef<HTMLDivElement>(null);
    const scrollTimerRef = useRef<NodeJS.Timeout>();
    const startTimeRef = useRef(Date.now());

    // Fetch read and session
    const { data, isLoading } = useQuery<{ read: Read; session: ReadSession }>({
        queryKey: [`/api/v1/reads/${id}`],
        enabled: !!user && !!id,
    });

    const read = data?.read;
    const session = data?.session;

    // Update progress mutation
    const updateProgressMutation = useMutation({
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
            startTimeRef.current = Date.now(); // Reset timer
        },
    });

    // Track reading time
    useEffect(() => {
        const timer = setInterval(() => {
            setReadingTime((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Restore scroll position
    useEffect(() => {
        if (session?.lastPosition && contentRef.current) {
            const scrollTo =
                (session.lastPosition / 100) * contentRef.current.scrollHeight;
            contentRef.current.scrollTop = scrollTo;
        }
    }, [session]);

    // Track scroll and save progress
    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                const position =
                    (contentRef.current.scrollTop / contentRef.current.scrollHeight) *
                    100;
                setScrollPosition(Math.min(position, 100));

                // Debounce progress update
                if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
                scrollTimerRef.current = setTimeout(() => {
                    updateProgressMutation.mutate(Math.round(position));
                }, 2000);
            }
        };

        const content = contentRef.current;
        content?.addEventListener("scroll", handleScroll);
        return () => {
            content?.removeEventListener("scroll", handleScroll);
            if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        };
    }, [id]);

    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>Please sign in to read</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-gray-400">Loading...</p>
            </div>
        );
    }

    if (!read) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Read not found</p>
                    <Button onClick={() => setLocation("/read-alone")}>
                        Back to Bookshelf
                    </Button>
                </div>
            </div>
        );
    }

    // Get intention-based background and text styling
    const intentionThemes = {
        learn: {
            bg: "bg-gray-900",
            text: "text-gray-100",
            accent: "text-blue-300",
        },
        feel: {
            bg: "bg-gradient-to-b from-amber-950 to-gray-900",
            text: "text-amber-50",
            accent: "text-amber-300",
        },
        think: {
            bg: "bg-gray-950",
            text: "text-gray-200",
            accent: "text-indigo-300",
        },
        sleep: {
            bg: "bg-black",
            text: "text-gray-400 opacity-75",
            accent: "text-gray-500",
        },
    };

    const theme =
        intentionThemes[read.intention as keyof typeof intentionThemes] ||
        intentionThemes.think;

    // Calculate reading stats
    const wordsRead = Math.floor(
        (scrollPosition / 100) * (read.content?.split(/\s+/).length || 0)
    );
    const timeRemaining = read.estimatedReadTimeMinutes
        ? Math.max(
            0,
            read.estimatedReadTimeMinutes * 60 - (session?.totalTimeSeconds || 0)
        )
        : 0;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.text} relative`}>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${scrollPosition}%` }}
                />
            </div>

            {/* Top Controls */}
            {showControls && (
                <div className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 bg-black/90 backdrop-blur px-4 py-3 rounded-lg border border-gray-700">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setLocation("/read-alone");
                            }}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <div className="text-sm text-gray-300">
                            {Math.round(scrollPosition)}%
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSettings(!showSettings);
                        }}
                        className="bg-black/90 backdrop-blur border border-gray-700"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <Card className="fixed top-20 right-4 z-40 p-6 bg-gray-900/95 backdrop-blur border-gray-700 w-80 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Type className="w-5 h-5" />
                        Typography
                    </h3>

                    <div className="space-y-4">
                        {/* Font Size */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">
                                Font Size
                            </label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <span className="text-sm flex-1 text-center">{fontSize}px</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Line Height */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">
                                Line Height
                            </label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setLineHeight(Math.max(1.4, lineHeight - 0.2))}
                                >
                                    -
                                </Button>
                                <span className="text-sm flex-1 text-center">
                                    {lineHeight.toFixed(1)}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setLineHeight(Math.min(2.4, lineHeight + 0.2))}
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        {/* Font Family */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">
                                Font Family
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={fontFamily === "serif" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFontFamily("serif")}
                                >
                                    Serif
                                </Button>
                                <Button
                                    variant={fontFamily === "sans" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFontFamily("sans")}
                                >
                                    Sans
                                </Button>
                            </div>
                        </div>

                        {/* Reading Stats */}
                        <div className="pt-4 border-t border-gray-700">
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Reading Stats
                            </h4>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex justify-between">
                                    <span>Time reading:</span>
                                    <span className={theme.accent}>{formatTime(readingTime)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Words read:</span>
                                    <span className={theme.accent}>{wordsRead}</span>
                                </div>
                                {timeRemaining > 0 && (
                                    <div className="flex justify-between">
                                        <span>Est. remaining:</span>
                                        <span className={theme.accent}>
                                            {Math.ceil(timeRemaining / 60)}m
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Reading Content */}
            <div
                ref={contentRef}
                className="h-screen overflow-y-auto px-8 py-20"
                onClick={() => setShowControls(!showControls)}
                style={{
                    maxWidth: "65ch",
                    margin: "0 auto",
                }}
            >
                <h1 className="text-4xl font-bold mb-2">{read.title}</h1>
                {read.author && (
                    <p className={`text-lg mb-8 ${theme.accent}`}>by {read.author}</p>
                )}
                <div
                    className={`${fontFamily === "serif" ? "font-serif" : "font-sans"} whitespace-pre-wrap`}
                    style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: lineHeight,
                    }}
                >
                    {read.content}
                </div>

                {/* End padding */}
                <div className="h-96" />
            </div>
        </div>
    );
}
