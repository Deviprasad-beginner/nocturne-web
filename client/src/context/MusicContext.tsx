import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { audioPlayer, Track } from "@/lib/audioPlayer";

interface MusicContextType {
    // Current playback state
    currentTrack: Track | null;
    isPlaying: boolean;
    isBuffering: boolean;
    volume: number; // 0-1

    // Autoplay queue
    queue: Track[];

    // Sleep Timer
    sleepTimerRemaining: number | null; // seconds

    // UI state
    mood: string | null;
    listeners: number; // Mock listener count

    // Methods
    playTrack: (track: Track, newQueue?: Track[]) => void;
    playNext: () => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    seek: (percentage: number) => void;
    setMood: (mood: string | null) => void;
    startSleepTimer: (minutes: number) => void;
    cancelSleepTimer: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);
const MusicProgressContext = createContext<{ progress: number; duration: number } | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    // UI state versions for React renders
    const [volume, setVolumeState] = useState(0.5);
    const [mood, setMoodState] = useState<string | null>(null);
    const [listeners, setListeners] = useState(0);
    const [queue, setQueueState] = useState<Track[]>([]);
    const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

    // Separate state for frequent updates to avoid re-rendering main context consumers
    const [progressState, setProgressState] = useState({ progress: 0, duration: 0 });

    // Mutable refs for callbacks that shouldn't recreate listeners
    const queueRef = useRef<Track[]>([]);
    const currentTrackRef = useRef<Track | null>(null);
    const sleepEndTimeRef = useRef<number | null>(null);
    const userVolumeRef = useRef<number>(0.5);
    const timerIntervalRef = useRef<any>(null);

    // Sync state to refs
    useEffect(() => { queueRef.current = queue; }, [queue]);
    useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

    const playNext = useCallback(() => {
        if (queueRef.current.length > 0) {
            const nextTrack = queueRef.current[0];
            const newQueue = queueRef.current.slice(1);
            setQueueState(newQueue);
            setIsBuffering(true);
            audioPlayer.play(nextTrack);
        }
    }, []);

    // Initialize audioEngine listeners
    useEffect(() => {
        const handlePlay = (track: Track | null) => {
            setCurrentTrack(prev => {
                if (prev?.id !== track?.id) {
                    setListeners(Math.floor(Math.random() * 50) + 10);
                }
                return track;
            });
            setIsPlaying(true);
            setIsBuffering(false);
        };

        const handlePause = () => setIsPlaying(false);
        const handleBuffering = () => setIsBuffering(true);

        const handleStop = () => {
            setIsPlaying(false);
            setIsBuffering(false);
            setProgressState(prev => ({ ...prev, progress: 0 }));
        };

        const handleTimeUpdate = (data: { currentTime: number; duration: number }) => {
            if (data.duration > 0) {
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
            // AUTOPLAY: Trigger next track in queue!
            playNext();
        };

        const handleVolumeChange = (data: { volume: number }) => {
            setVolumeState(data.volume);
        };

        const handleError = () => {
            setIsPlaying(false);
            setIsBuffering(false);
            playNext(); // Try advancing if track fails
        };

        // Subscribe to events
        audioPlayer.on('play', handlePlay);
        audioPlayer.on('pause', handlePause);
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
            userVolumeRef.current = state.volume;
        }

        return () => {
            // Cleanup separate listeners
            audioPlayer.off('play', handlePlay);
            audioPlayer.off('pause', handlePause);
            audioPlayer.off('stop', handleStop);
            audioPlayer.off('timeupdate', handleTimeUpdate);
            audioPlayer.off('loadedmetadata', handleLoadedMetadata);
            audioPlayer.off('ended', handleEnded);
            audioPlayer.off('volumechange', handleVolumeChange);
            audioPlayer.off('buffering', handleBuffering);
            audioPlayer.off('error', handleError);
        };
    }, [playNext]);

    // Timer Interval logic for Sleep Fade
    useEffect(() => {
        timerIntervalRef.current = setInterval(() => {
            if (sleepEndTimeRef.current !== null) {
                const now = Date.now();
                const remainingMs = sleepEndTimeRef.current - now;

                if (remainingMs <= 0) {
                    audioPlayer.pause();
                    sleepEndTimeRef.current = null;
                    setSleepTimerRemaining(null);
                    // restore user volume after stopping
                    audioPlayer.setVolume(userVolumeRef.current * 100);
                } else {
                    setSleepTimerRemaining(Math.ceil(remainingMs / 1000));
                    // Fade out logic: if < 60s remaining, fade linear to 0
                    if (remainingMs <= 60000) {
                        const volumeMultiplier = remainingMs / 60000;
                        const newVol = userVolumeRef.current * volumeMultiplier;
                        audioPlayer.setVolume(newVol * 100);
                    }
                }
            } else {
                setSleepTimerRemaining(null);
            }
        }, 1000);
        return () => clearInterval(timerIntervalRef.current!);
    }, []);

    const startSleepTimer = useCallback((minutes: number) => {
        sleepEndTimeRef.current = Date.now() + minutes * 60000;
        setSleepTimerRemaining(minutes * 60);
    }, []);

    const cancelSleepTimer = useCallback(() => {
        sleepEndTimeRef.current = null;
        setSleepTimerRemaining(null);
        audioPlayer.setVolume(userVolumeRef.current * 100); // restore
    }, []);

    const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
        if (newQueue) {
            setQueueState(newQueue);
        }
        setIsBuffering(true);
        audioPlayer.play(track);
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) audioPlayer.pause();
        else audioPlayer.resume();
    }, [isPlaying]);

    const setVolume = useCallback((vol: number) => {
        userVolumeRef.current = vol;
        if (!sleepEndTimeRef.current || (sleepEndTimeRef.current - Date.now() > 60000)) {
            // only apply direct volume if we aren't currently fading
            audioPlayer.setVolume(vol * 100);
        }
    }, []);

    const seek = useCallback((percentage: number) => {
        const duration = audioPlayer.getState().duration; // Get directly from player
        const time = (percentage / 100) * duration;
        audioPlayer.seek(time);
    }, []);

    const setMood = useCallback((newMood: string | null) => setMoodState(newMood), []);

    // Stable context value
    const contextValue = React.useMemo(() => ({
        currentTrack,
        isPlaying,
        isBuffering,
        volume,
        mood,
        listeners,
        queue,
        sleepTimerRemaining,
        playTrack,
        playNext,
        togglePlay,
        setVolume,
        seek,
        setMood,
        startSleepTimer,
        cancelSleepTimer
    }), [currentTrack, isPlaying, isBuffering, volume, mood, listeners, queue, sleepTimerRemaining, playTrack, playNext, togglePlay, setVolume, seek, setMood, startSleepTimer, cancelSleepTimer]);

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
