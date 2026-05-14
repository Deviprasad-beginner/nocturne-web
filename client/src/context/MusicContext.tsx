import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { audioPlayer, Track } from "@/lib/audioPlayer";

interface MusicContextType {
    // Current playback state
    currentTrack: Track | null;
    isPlaying: boolean;
    isBuffering: boolean;
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
    const [isBuffering, setIsBuffering] = useState(false);
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
            setIsBuffering(false);
            setListeners(Math.floor(Math.random() * 50) + 10);
        };

        const handlePause = () => setIsPlaying(false);
        const handleResume = () => { setIsPlaying(true); setIsBuffering(false); };
        const handleBuffering = () => setIsBuffering(true);

        const handleStop = () => {
            setIsPlaying(false);
            setIsBuffering(false);
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
            setIsBuffering(false);
            setProgressState(prev => ({ ...prev, progress: 0 }));
        };

        const handleVolumeChange = (data: { volume: number }) => {
            setVolumeState(data.volume);
        };

        const handleError = () => {
            setIsPlaying(false);
            setIsBuffering(false);
            // We could set a global error state here if needed
        };

        // Subscribe to events
        audioPlayer.on('play', handlePlay);
        audioPlayer.on('pause', handlePause);
        audioPlayer.on('resume', handleResume);
        audioPlayer.on('stop', handleStop);
        audioPlayer.on('timeupdate', handleTimeUpdate);
        audioPlayer.on('loadedmetadata', handleLoadedMetadata);
        audioPlayer.on('ended', handleEnded);
        audioPlayer.on('volumechange', handleVolumeChange);
        audioPlayer.on('buffering', handleBuffering);
        audioPlayer.on('error', handleError);

        // Get initial state
        const state = audioPlayer.getState();
        if (state.track) {
            setCurrentTrack(state.track);
            setIsPlaying(state.isPlaying);
            setVolumeState(state.volume);
        }

        return () => {
            // Cleanup separate listeners
            audioPlayer.off('play', handlePlay);
            audioPlayer.off('pause', handlePause);
            audioPlayer.off('resume', handleResume);
            audioPlayer.off('stop', handleStop);
            audioPlayer.off('timeupdate', handleTimeUpdate);
            audioPlayer.off('loadedmetadata', handleLoadedMetadata);
            audioPlayer.off('ended', handleEnded);
            audioPlayer.off('volumechange', handleVolumeChange);
            audioPlayer.off('buffering', handleBuffering);
            audioPlayer.off('error', handleError);
        };
    }, []);

    const playTrack = useCallback((track: Track) => {
        setIsBuffering(true);
        audioPlayer.play(track);
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) audioPlayer.pause();
        else audioPlayer.resume();
    }, [isPlaying]);

    const setVolume = useCallback((vol: number) => audioPlayer.setVolume(vol * 100), []);

    // Note: seek needs duration but we get it from player or keep it in ref if needed
    // For now we'll just pass percentage to player which handles time calc internally if needed
    // actually our seek takes percentage, so straightforward
    const seek = useCallback((percentage: number) => {
        const duration = audioPlayer.getState().duration; // Get directly from player to avoid dependency
        const time = (percentage / 100) * duration;
        audioPlayer.seek(time);
    }, []);

    const setMood = useCallback((newMood: string | null) => setMoodState(newMood), []);

    // Stable context value (doesn't change on timeupdate)
    const contextValue = React.useMemo(() => ({
        currentTrack,
        isPlaying,
        isBuffering,
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
    }), [currentTrack, isPlaying, isBuffering, volume, mood, listeners, playTrack, togglePlay, setVolume, seek, setMood]);

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
