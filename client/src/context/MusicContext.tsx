import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { youtubePlayer, Track } from "@/lib/youtubePlayer";

interface MusicContextType {
    // Current playback state
    currentTrack: Track | null;
    isPlaying: boolean;
    progress: number; // 0-100
    duration: number; // seconds
    volume: number; // 0-1

    // UI state
    mood: string | null;
    listeners: number; // Mock listener count

    // Methods
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    seek: (percentage: number) => void;
    setMood: (mood: string | null) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);
const MusicProgressContext = createContext<{ progress: number; duration: number } | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolumeState] = useState(0.5);
    const [mood, setMoodState] = useState<string | null>(null);
    const [listeners, setListeners] = useState(0);

    // Separate state for frequent updates to avoid re-rendering main context consumers
    const [progressState, setProgressState] = useState({ progress: 0, duration: 0 });

    // Initialize audioEngine listeners
    useEffect(() => {
        const handlePlay = (track: Track) => {
            setCurrentTrack(track);
            setIsPlaying(true);
            setListeners(Math.floor(Math.random() * 50) + 10);
        };

        const handlePause = () => setIsPlaying(false);
        const handleResume = () => setIsPlaying(true);

        const handleStop = () => {
            setIsPlaying(false);
            setProgressState(prev => ({ ...prev, progress: 0 }));
        };

        const handleTimeUpdate = (data: { currentTime: number; duration: number }) => {
            if (data.duration > 0) {
                // Update specific progress state
                setProgressState({
                    progress: (data.currentTime / data.duration) * 100,
                    duration: data.duration
                });
            }
        };

        const handleLoadedMetadata = (data: { duration: number }) => {
            setProgressState(prev => ({ ...prev, duration: data.duration }));
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgressState(prev => ({ ...prev, progress: 0 }));
        };

        const handleVolumeChange = (data: { volume: number }) => {
            setVolumeState(data.volume);
        };

        // Subscribe to events
        youtubePlayer.on('play', handlePlay);
        youtubePlayer.on('pause', handlePause);
        youtubePlayer.on('resume', handleResume);
        youtubePlayer.on('stop', handleStop);
        youtubePlayer.on('timeupdate', handleTimeUpdate);
        youtubePlayer.on('loadedmetadata', handleLoadedMetadata);
        youtubePlayer.on('ended', handleEnded);
        youtubePlayer.on('volumechange', handleVolumeChange);

        // Get initial state
        const state = youtubePlayer.getState();
        if (state.track) {
            setCurrentTrack(state.track);
            setIsPlaying(state.isPlaying);
            setVolumeState(state.volume);
        }

        return () => {
            // Cleanup separate listeners
            youtubePlayer.off('play', handlePlay);
            youtubePlayer.off('pause', handlePause);
            youtubePlayer.off('resume', handleResume);
            youtubePlayer.off('stop', handleStop);
            youtubePlayer.off('timeupdate', handleTimeUpdate);
            youtubePlayer.off('loadedmetadata', handleLoadedMetadata);
            youtubePlayer.off('ended', handleEnded);
            youtubePlayer.off('volumechange', handleVolumeChange);
        };
    }, []);

    const playTrack = useCallback((track: Track) => youtubePlayer.play(track), []);

    const togglePlay = useCallback(() => {
        if (isPlaying) youtubePlayer.pause();
        else youtubePlayer.resume();
    }, [isPlaying]);

    const setVolume = useCallback((vol: number) => youtubePlayer.setVolume(vol * 100), []);

    // Note: seek needs duration but we get it from player or keep it in ref if needed
    // For now we'll just pass percentage to player which handles time calc internally if needed
    // actually our seek takes percentage, so straightforward
    const seek = useCallback((percentage: number) => {
        const duration = youtubePlayer.getState().duration; // Get directly from player to avoid dependency
        const time = (percentage / 100) * duration;
        youtubePlayer.seek(time);
    }, []);

    const setMood = useCallback((newMood: string | null) => setMoodState(newMood), []);

    // Stable context value (doesn't change on timeupdate)
    const contextValue = React.useMemo(() => ({
        currentTrack,
        isPlaying,
        // Removed progress/duration from main context
        progress: 0, // Deprecated in main context
        duration: 0, // Deprecated in main context
        volume,
        mood,
        listeners,
        playTrack,
        togglePlay,
        setVolume,
        seek,
        setMood,
    }), [currentTrack, isPlaying, volume, mood, listeners, playTrack, togglePlay, setVolume, seek, setMood]);

    return (
        <MusicContext.Provider value={contextValue}>
            <MusicProgressContext.Provider value={progressState}>
                {children}
            </MusicProgressContext.Provider>
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error("useMusic must be used within a MusicProvider");
    }
    return context;
}

export function useMusicProgress() {
    const context = useContext(MusicProgressContext);
    if (context === undefined) {
        throw new Error("useMusicProgress must be used within a MusicProvider");
    }
    return context;
}
