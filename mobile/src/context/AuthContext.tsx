/**
 * Auth Context — manages JWT token + current user for mobile
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, saveToken, getToken, clearToken } from '../lib/api';

interface User {
    id: number;
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
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, displayName?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // Rehydrate from secure storage on mount
    useEffect(() => {
        (async () => {
            try {
                const storedToken = await getToken();
                if (storedToken) {
                    // Validate token by hitting /api/v1/user
                    const res = await api.get('/user');
                    setState({
                        user: res.data,
                        token: storedToken,
                        isLoading: false,
                        isAuthenticated: true,
                    });
                } else {
                    setState(s => ({ ...s, isLoading: false }));
                }
            } catch {
                // Token expired or invalid — clear it
                await clearToken();
                setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
            }
        })();
    }, []);

    const login = async (username: string, password: string) => {
        const res = await api.post<{ token: string; user: User }>('/auth/token', { username, password });
        const { token, user } = res.data as any;
        await saveToken(token);
        setState({ user, token, isLoading: false, isAuthenticated: true });
    };

    const register = async (username: string, password: string, displayName?: string) => {
        const res = await api.post<{ token: string; user: User }>('/auth/register', {
            username,
            password,
            displayName: displayName || username,
        });
        const { token, user } = res.data as any;
        await saveToken(token);
        setState({ user, token, isLoading: false, isAuthenticated: true });
    };

    const logout = async () => {
        await clearToken();
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
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
