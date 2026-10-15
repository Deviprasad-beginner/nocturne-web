import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'host' | 'listener' | null;

interface AudioRoomContextType {
    currentRoomId: number | null;
    userRole: UserRole;
    joinRoom: (id: number, role: UserRole) => void;
    leaveRoom: () => void;
}

const AudioRoomContext = createContext<AudioRoomContextType | undefined>(undefined);

export function AudioRoomProvider({ children }: { children: ReactNode }) {
    const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);

    const joinRoom = (id: number, role: UserRole) => {
        setCurrentRoomId(id);
        setUserRole(role);
        console.log(`[AudioRoom] Joined room ${id} as ${role}`);
        // Here we would eventually initialize WebRTC/LiveKit
    };

    const leaveRoom = () => {
        if (currentRoomId) {
            console.log(`[AudioRoom] Left room ${currentRoomId}`);
            setCurrentRoomId(null);
            setUserRole(null);
            // Here we would clean up WebRTC/LiveKit
        }
    };

    return (
        <AudioRoomContext.Provider value={{ currentRoomId, userRole, joinRoom, leaveRoom }}>
            {children}
        </AudioRoomContext.Provider>
    );
}

export function useAudioRoom() {
    const context = useContext(AudioRoomContext);
    if (context === undefined) {
        throw new Error('useAudioRoom must be used within an AudioRoomProvider');
    }
    return context;
}
