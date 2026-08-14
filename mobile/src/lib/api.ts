/**
 * Mobile API client — JWT Bearer token based
 * Replaces the cookie-based web client
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform, NativeModules } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Determine the correct host IP (works for emulators and physical devices on WiFi)
let hostIp = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
if (__DEV__) {
    const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
    if (scriptURL) {
        const match = scriptURL.match(/^https?:\/\/([^:]+):/);
        if (match && match[1]) {
            hostIp = match[1];
        }
    }
}

export const API_BASE_URL = __DEV__
    ? `https://spicy-moments-hope.loca.lt/api/v1`
    : 'https://nocturne.placeholder.com/api/v1'; // Replace with prod URL later

export const TOKEN_KEY = 'nocturne_jwt';

/** Read stored JWT */
export async function getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
        try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
}

/** Persist JWT to encrypted storage */
export async function saveToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
        try { localStorage.setItem(TOKEN_KEY, token); } catch { }
        return;
    }
    return SecureStore.setItemAsync(TOKEN_KEY, token);
}

/** Remove JWT (logout) */
export async function clearToken(): Promise<void> {
    if (Platform.OS === 'web') {
        try { localStorage.removeItem(TOKEN_KEY); } catch { }
        return;
    }
    return SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** Typed API response envelope */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Axios instance — shared across the whole app
export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true' // Bypass Localtunnel reminder screen
    },
});

// Request interceptor — attach JWT on every call
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — unwrap { success, data } envelope
api.interceptors.response.use(
    (response) => {
        // Unwrap v1 envelope so callers get data directly
        if (
            response.data &&
            typeof response.data === 'object' &&
            'success' in response.data &&
            'data' in response.data
        ) {
            response.data = response.data.data;
        }
        return response;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

export default api;
