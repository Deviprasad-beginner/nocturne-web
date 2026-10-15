import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Auto-detect optimal API base address depending on environment
function resolveApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Android emulator routes to host through 10.0.2.2
  if (Platform.OS === 'android' && !Device.isDevice) {
    return 'http://10.0.2.2:5000/api/v1';
  }

  // Web in browser
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api/v1';
  }

  // Extract dev machine IP from Metro bundler hostUri if running in Expo Go
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5000/api/v1`;
    }
  }

  // Configured default Wi-Fi LAN IP
  return 'http://10.199.120.176:5000/api/v1';
}

export const API_BASE = resolveApiBase();

const FETCH_TIMEOUT_MS = 15000; // 15 seconds

function fetchWithTimeout(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    try {
      controller.abort();
    } catch {
      // ignore
    }
  }, FETCH_TIMEOUT_MS);

  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

async function authFetch(endpoint: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return fetchWithTimeout(`${API_BASE}${endpoint}`, { ...options, headers });
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  const res = await authFetch('/auth/token', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function register(username: string, password: string) {
  const res = await authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function loginWithGoogle(idToken: string) {
  const res = await authFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Google sign-in failed');
  return data;
}

// ─── Whispers ──────────────────────────────────────────────────────────────

/**
 * Fetch the public whisper feed.
 * Server: GET /api/v1/whispers/feed
 * Returns an array of whisper objects.
 */
export async function fetchWhispers(): Promise<any[]> {
  try {
    const res = await authFetch('/whispers/feed');
    if (!res.ok) {
      console.warn('[API] fetchWhispers status:', res.status);
      return [];
    }
    const json = await res.json();
    // Shape: { success: true, data: { whispers: [...] } }
    return json.data?.whispers ?? json.data ?? [];
  } catch (error: any) {
    console.warn('[API] fetchWhispers error:', error?.message || error);
    return [];
  }
}

/**
 * Fetch the authenticated user's own whispers.
 * Server: GET /api/v1/whispers/sanctuary
 */
export async function fetchUserWhispers(): Promise<any[]> {
  try {
    const res = await authFetch('/whispers/sanctuary');
    if (!res.ok) {
      console.warn('[API] fetchUserWhispers status:', res.status);
      return [];
    }
    const json = await res.json();
    return json.data?.whispers ?? json.data ?? [];
  } catch (error: any) {
    console.warn('[API] fetchUserWhispers error:', error?.message || error);
    return [];
  }
}

/**
 * Create a new whisper.
 * Server: POST /api/v1/whispers
 * - visibility: "private" | "public" | "resonance"
 *   The UI uses "community" which is mapped to "public" server-side as well.
 */
export async function postWhisper(
  content: string,
  visibility: 'public' | 'private' | 'resonance',
  mood: string
) {
  try {
    const res = await authFetch('/whispers', {
      method: 'POST',
      body: JSON.stringify({ content, visibility, mood }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to post whisper');
    }
    return await res.json();
  } catch (error: any) {
    console.warn('[API] postWhisper error:', error?.message || error);
    return null;
  }
}

/**
 * React to a whisper (resonate = heart equivalent).
 * Server: POST /api/v1/whispers/:id/react
 */
export async function heartWhisper(id: string) {
  try {
    const res = await authFetch(`/whispers/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ type: 'resonate' }),
    });
    if (!res.ok) throw new Error('Failed to react to whisper');
    return await res.json();
  } catch (error: any) {
    console.warn('[API] heartWhisper error:', error?.message || error);
    return null;
  }
}

/**
 * Delete own whisper.
 * Server: DELETE /api/v1/whispers/:id
 */
export async function deleteWhisper(id: string) {
  try {
    const res = await authFetch(`/whispers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete whisper');
    return await res.json();
  } catch (error: any) {
    console.warn('[API] deleteWhisper error:', error?.message || error);
    return null;
  }
}

// ─── Resonance matching ────────────────────────────────────────────────────

/**
 * Enter the mood-based resonance queue.
 * Server: POST /api/v1/resonance/queue  body: { mood }
 * Returns { status: 'searching'|'matched'|'fallback', peer?, matchToken?, ... }
 */
export async function queueResonance(mood: string) {
  try {
    const res = await authFetch('/resonance/queue', {
      method: 'POST',
      body: JSON.stringify({ mood }),
    });
    if (!res.ok) {
      console.warn('[API] queueResonance non-ok status:', res.status);
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (error: any) {
    console.warn('[API] queueResonance error:', error?.message || error);
    return null;
  }
}

/**
 * Cancel resonance search.
 * Server: DELETE /api/v1/resonance/queue/leave
 */
export async function leaveResonanceQueue() {
  try {
    await authFetch('/resonance/queue/leave', { method: 'DELETE' });
  } catch {
    // fire-and-forget
  }
}

// ─── Night Circles ─────────────────────────────────────────────────────────

export async function fetchNightCircles() {
  try {
    const res = await authFetch('/circles');
    if (!res.ok) {
      console.warn('[API] fetchNightCircles non-ok status:', res.status);
      return [];
    }
    const json = await res.json();
    return json.data || json || [];
  } catch (error: any) {
    console.warn('[API] fetchNightCircles error:', error?.message || error);
    return [];
  }
}
