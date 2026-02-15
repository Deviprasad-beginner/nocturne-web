import { useMusic, useMusicProgress } from "@/context/MusicContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function MusicPlayer() {
    const { currentTrack, isPlaying, volume, listeners, togglePlay, setVolume, seek } = useMusic();
    const { progress, duration } = useMusicProgress();
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(volume);

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
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/40 backdrop-blur-xl">
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
    );
}
