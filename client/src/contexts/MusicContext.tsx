import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MusicContextType {
    currentTrack: string | null;
    isPlaying: boolean;
    setTrack: (track: string) => void;
    togglePlay: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const setTrack = (track: string) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (currentTrack) {
            setIsPlaying(prev => !prev);
        }
    };

    return (
        <MusicContext.Provider value={{ currentTrack, isPlaying, setTrack, togglePlay }}>
            {/* We could mount a hidden <audio> element here that plays based on currentTrack */}
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
}
