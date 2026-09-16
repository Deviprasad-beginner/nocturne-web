/**
 * Auth Context — manages Auth state for mobile via Firebase
 * Supports a clean DEV_BYPASS_AUTH toggle for preview mode.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEV_BYPASS_AUTH } from '../lib/api';
import { auth } from '../lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';

interface User {
    id: string | number;
    username: string;
    displayName: string;
    email: string | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const GUEST_USER: User = {
    id: '0',
    username: 'guest',
    displayName: 'Night Owl',
    email: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // Rehydrate from Firebase Auth on mount
    useEffect(() => {
        if (DEV_BYPASS_AUTH) {
            setState({
                user: GUEST_USER,
                token: 'dev-bypass-token',
                isLoading: false,
                isAuthenticated: true,
            });
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                setState({
                    user: {
                        id: firebaseUser.uid,
                        username: firebaseUser.displayName || 'user',
                        displayName: firebaseUser.displayName || 'Night Owl',
                        email: firebaseUser.email,
                    },
                    token: token,
                    isLoading: false,
                    isAuthenticated: true,
                });
            } else {
                setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email: string, password: string, displayName?: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName && userCredential.user) {
            await updateProfile(userCredential.user, { displayName });

            // Refresh local state manually after updating profile
            const token = await userCredential.user.getIdToken();
            setState((prev) => ({
                ...prev,
                user: {
                    id: userCredential.user.uid,
                    username: displayName,
                    displayName: displayName,
                    email: userCredential.user.email,
                },
                token
            }));
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
