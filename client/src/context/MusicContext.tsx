import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Station, Playlist, playlists } from "@/data/playlists";

interface MusicContextType {
    currentStation: Station | null;
    isPlaying: boolean;
    volume: number;
    isPlayerReady: boolean;
    activePlaylist: Playlist | null;
    sleepTimer: number | null; // Minutes remaining

    playStation: (station: Station) => void;
    togglePlay: () => void;
    setVolume: (val: number) => void;
    setIsPlayerReady: (ready: boolean) => void;
    setSleepTimer: (minutes: number | null) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
    const [currentStation, setCurrentStation] = useState<Station | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolumeState] = useState(0.5);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [sleepTimer, setSleepTimerState] = useState<number | null>(null); // Minutes

    // Derive active playlist
    const activePlaylist = currentStation
        ? playlists.find(p => p.stations.some(s => s.id === currentStation.id)) || null
        : null;

    const playStation = (station: Station) => {
        if (currentStation?.id === station.id) {
            setIsPlaying(!isPlaying);
        } else {
            setIsPlayerReady(false);
            setCurrentStation(station);
            setIsPlaying(true);
        }
    };

    const togglePlay = () => {
        if (currentStation && isPlayerReady) {
            setIsPlaying(!isPlaying);
        }
    };

    const setVolume = (val: number) => {
        setVolumeState(val);
    };

    const setSleepTimer = (minutes: number | null) => {
        setSleepTimerState(minutes);
    };

    // Sleep Timer Logic
    useEffect(() => {
        if (sleepTimer === null) return;

        if (sleepTimer <= 0) {
            setIsPlaying(false);
            setSleepTimerState(null);
            return;
        }

        const interval = setInterval(() => {
            setSleepTimerState(prev => (prev !== null ? prev - 1 : null));
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [sleepTimer]);

    return (
        <MusicContext.Provider
            value={{
                currentStation,
                isPlaying,
                volume,
                isPlayerReady,
                activePlaylist,
                sleepTimer,
                playStation,
                togglePlay,
                setVolume,
                setIsPlayerReady,
                setSleepTimer,
            }}
        >
            {children}
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
