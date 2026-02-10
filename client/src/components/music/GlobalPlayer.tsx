import React, { useState } from "react";
import ReactPlayer from "react-player";
import { useMusic } from "@/context/MusicContext";
import { Play, Pause, X, Volume2, Radio, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function GlobalPlayer() {
    const {
        currentStation,
        isPlaying,
        volume,
        isPlayerReady,
        togglePlay,
        setIsPlayerReady,
        setVolume,
        sleepTimer,
        setSleepTimer,
        activePlaylist
    } = useMusic();
    const { toast } = useToast();

    const [isExpanded, setIsExpanded] = useState(true);

    if (!currentStation) return null;

    return (
        <>
            {/* Hidden Player (In-viewport to ensure rendering, but transparent) */}
            <div className="fixed top-0 left-0 z-[-1] opacity-[0.01] pointer-events-none">
                {React.createElement(ReactPlayer as any, {
                    url: currentStation.streamUrl, // Use generic URL (works for YT, SoundCloud, etc.)
                    playing: isPlaying && isPlayerReady,
                    controls: false,
                    volume: volume,
                    width: "200px",  // Large enough to not be blocked
                    height: "200px",
                    config: {
                        youtube: {
                            playerVars: {
                                origin: window.location.origin,
                                playsinline: 1,
                                autoplay: 1,
                                controls: 0,
                                disablekb: 1
                            }
                        },
                        soundcloud: {
                            options: {
                                auto_play: true,
                                visual: true // Required for some internal logic, though hidden
                            }
                        }
                    },
                    onError: (error: any) => {
                        console.error("Player error:", error);
                        // Only show toast if it was supposed to be playing
                        if (isPlaying) {
                            toast({
                                title: "Playback Error",
                                description: "This station is currently unavailable: " + currentStation.name,
                                variant: "destructive"
                            });
                        }
                    },
                    onReady: () => setIsPlayerReady(true)
                })}
            </div>

            {/* Bottom Bar UI */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 transform ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3px)]'}`}>
                {/* Toggle Handle */}
                <div
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 border-t border-x border-gray-800 rounded-t-lg px-4 py-1 cursor-pointer flex items-center gap-2"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    <span className="text-xs text-gray-400 font-medium">Now Playing</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronUp className="w-3 h-3 text-gray-400" />}
                </div>

                <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 border-t border-gray-800 shadow-2xl backdrop-blur-lg bg-opacity-95 p-3 sm:p-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        {/* Find Track Info */}
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${activePlaylist?.color || 'from-gray-700 to-gray-800'} shadow-lg shrink-0`}>
                                {isPlaying ? (
                                    <div className="flex gap-0.5 h-4 items-center">
                                        <span className="w-0.5 h-full bg-white animate-[music-bar_0.6s_ease-in-out_infinite]" />
                                        <span className="w-0.5 h-2/3 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]" />
                                        <span className="w-0.5 h-full bg-white animate-[music-bar_0.7s_ease-in-out_infinite]" />
                                    </div>
                                ) : (
                                    <Radio className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-white font-medium text-sm sm:text-base truncate">{currentStation.name}</h4>
                                <p className="text-xs text-gray-400 truncate">{activePlaylist?.name || "Live Radio"}</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            {/* Controls */}
                            <div className="hidden sm:flex items-center gap-2 w-24">
                                <Volume2 className="w-4 h-4 text-gray-400" />
                                <Slider
                                    value={[volume * 100]}
                                    onValueChange={(val) => setVolume(val[0] / 100)}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                />
                            </div>

                            {/* Sleep Timer */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className={`h-8 px-2 text-xs ${sleepTimer ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400'}`}>
                                        <Clock className="w-3 h-3 mr-1.5" />
                                        {sleepTimer ? `${sleepTimer}m` : 'Timer'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-gray-200">
                                    <DropdownMenuItem onClick={() => setSleepTimer(15)}>15 Minutes</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSleepTimer(30)}>30 Minutes</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSleepTimer(60)}>1 Hour</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSleepTimer(null)} className="text-red-400">Turn Off</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                size="icon"
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all shadow-lg shadow-white/10"
                                onClick={togglePlay}
                            >
                                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
        @keyframes music-bar {
          0%, 100% { height: 100%; transform: scaleY(1); }
          50% { height: 50%; transform: scaleY(0.5); }
        }
      `}</style>
        </>
    );
}
