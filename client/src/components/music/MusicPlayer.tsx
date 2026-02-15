import { useMusic, useMusicProgress } from "@/context/MusicContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, ChevronDown, ChevronUp, Music } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

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
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVolumeToggle = () => {
        if (isMuted) {
            setVolume(previousVolume);
            setIsMuted(false);
        } else {
            setPreviousVolume(volume);
            setVolume(0);
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0] / 100;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const handleSeek = (value: number[]) => {
        seek(value[0]);
    };

    return (
        <>
            {/* Minimized floating tab — visible only when bar is hidden */}
            {isMinimized && (
                <button
                    onClick={() => setIsMinimized(false)}
                    className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-lg border border-white/10 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                    {isPlaying && (
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                        </span>
                    )}
                    <Music className="h-4 w-4 text-white" />
                    <span className="text-xs font-medium text-white max-w-[120px] truncate">
                        {currentTrack.title}
                    </span>
                    <ChevronUp className="h-3.5 w-3.5 text-white/70 group-hover:text-white transition-colors" />
                </button>
            )}

            {/* Full music bar */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMinimized ? 'translate-y-full' : 'translate-y-0'}`}
            >
                {/* Toggle tab — sits on top of the bar */}
                <div className="flex justify-end pr-4">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-black/60 backdrop-blur-md border border-b-0 border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs"
                    >
                        <span>Hide</span>
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </div>

                {/* Bar content */}
                <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        {/* Progress bar */}
                        <div className="mb-3">
                            <Slider
                                value={[progress]}
                                max={100}
                                step={0.1}
                                onValueChange={handleSeek}
                                className="cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>{formatTime((progress / 100) * duration)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Main controls */}
                        <div className="flex items-center justify-between gap-4">
                            {/* Track info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {currentTrack.coverArt && (
                                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600">
                                        <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-white truncate">{currentTrack.title}</div>
                                    <div className="text-xs text-gray-400 truncate">{currentTrack.artist}</div>
                                </div>
                                <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs">
                                    {currentTrack.mood}
                                </Badge>
                            </div>

                            {/* Playback controls */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={togglePlay}
                                    className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                                >
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                                </Button>
                            </div>

                            {/* Volume controls */}
                            <div className="flex items-center gap-2 flex-1 justify-end">
                                <div className="text-xs text-gray-400 hidden sm:block">
                                    {listeners} listening
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleVolumeToggle}
                                    className="h-8 w-8 text-gray-400 hover:text-white"
                                >
                                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                                <div className="w-24 hidden md:block">
                                    <Slider
                                        value={[isMuted ? 0 : volume * 100]}
                                        max={100}
                                        step={1}
                                        onValueChange={handleVolumeChange}
                                        className="cursor-pointer"
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
