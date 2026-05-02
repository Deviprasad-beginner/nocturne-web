import { useMusic, useMusicProgress } from "@/context/MusicContext";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, ChevronDown, ChevronUp, Music } from "lucide-react";
import { useState } from "react";

export function MusicPlayer() {
    const { currentTrack, isPlaying, volume, listeners, togglePlay, setVolume, seek } = useMusic();
    const { progress, duration } = useMusicProgress();
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(volume);
    const [isMinimized, setIsMinimized] = useState(false);

    if (!currentTrack) return null;

    const formatTime = (seconds: number) => {
        if (!isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleVolumeToggle = () => {
        if (isMuted) { setVolume(previousVolume); setIsMuted(false); }
        else { setPreviousVolume(volume); setVolume(0); setIsMuted(true); }
    };

    const handleVolumeChange = (value: number[]) => {
        const v = value[0] / 100;
        setVolume(v);
        setIsMuted(v === 0);
    };

    return (
        <>
            {/* Minimised pill */}
            {isMinimized && (
                <button
                    onClick={() => setIsMinimized(false)}
                    className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-xl border border-white/8 bg-black/50 text-white/60 hover:text-white/90 hover:border-white/14 transition-all duration-300 text-xs"
                >
                    {isPlaying && (
                        <span className="block w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                    )}
                    <Music className="h-3.5 w-3.5" />
                    <span className="max-w-[110px] truncate font-medium">{currentTrack.title}</span>
                    <ChevronUp className="h-3 w-3 opacity-40" />
                </button>
            )}

            {/* Full bar */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isMinimized ? "translate-y-full" : "translate-y-0"
                }`}
            >
                {/* Hide tab */}
                <div className="flex justify-end pr-5">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="flex items-center gap-1 px-3 py-1 rounded-t-lg bg-black/40 backdrop-blur-md border border-b-0 border-white/6 text-white/25 hover:text-white/50 transition-colors text-[11px]"
                    >
                        Hide <ChevronDown className="h-3 w-3" />
                    </button>
                </div>

                {/* Bar */}
                <div className="border-t border-white/6 bg-[#06060a]/85 backdrop-blur-2xl">
                    <div className="max-w-7xl mx-auto px-5 pt-2.5 pb-4">
                        {/* Progress */}
                        <div className="mb-3">
                            <Slider
                                value={[progress]}
                                max={100}
                                step={0.1}
                                onValueChange={(v) => seek(v[0])}
                                className="cursor-pointer [&_[data-radix-slider-track]]:bg-white/8 [&_[data-radix-slider-range]]:bg-white/30 [&_[data-radix-slider-thumb]]:border-white/20 [&_[data-radix-slider-thumb]]:bg-white/60 [&_[data-radix-slider-thumb]]:shadow-none [&_[data-radix-slider-thumb]]:w-2.5 [&_[data-radix-slider-thumb]]:h-2.5"
                            />
                            <div className="flex justify-between text-[10px] text-white/20 mt-1.5 font-mono">
                                <span>{formatTime((progress / 100) * duration)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls row */}
                        <div className="flex items-center justify-between gap-4">
                            {/* Track info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {currentTrack.coverArt && (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                                        <img
                                            src={currentTrack.coverArt}
                                            alt={currentTrack.title}
                                            className="w-full h-full object-cover opacity-70"
                                            style={{ filter: "saturate(0.4)" }}
                                        />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white/75 truncate">{currentTrack.title}</p>
                                    <p className="text-[11px] text-white/28 truncate">{currentTrack.artist}</p>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-white/20 hidden sm:block">
                                    {currentTrack.mood}
                                </span>
                            </div>

                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="h-9 w-9 rounded-full border border-white/12 bg-white/6 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white/90 transition-all duration-200 flex-shrink-0"
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 flex-1 justify-end">
                                <span className="text-[10px] text-white/18 hidden sm:block">{listeners} listening</span>
                                <button
                                    onClick={handleVolumeToggle}
                                    className="h-7 w-7 flex items-center justify-center text-white/25 hover:text-white/55 transition-colors"
                                >
                                    {isMuted || volume === 0
                                        ? <VolumeX className="h-3.5 w-3.5" />
                                        : <Volume2 className="h-3.5 w-3.5" />
                                    }
                                </button>
                                <div className="w-20 hidden md:block">
                                    <Slider
                                        value={[isMuted ? 0 : volume * 100]}
                                        max={100}
                                        step={1}
                                        onValueChange={handleVolumeChange}
                                        className="cursor-pointer [&_[data-radix-slider-track]]:bg-white/8 [&_[data-radix-slider-range]]:bg-white/25 [&_[data-radix-slider-thumb]]:border-white/15 [&_[data-radix-slider-thumb]]:bg-white/50 [&_[data-radix-slider-thumb]]:shadow-none [&_[data-radix-slider-thumb]]:w-2 [&_[data-radix-slider-thumb]]:h-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
