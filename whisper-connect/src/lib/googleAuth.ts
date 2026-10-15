import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect } from 'react';

// Required: complete any pending auth sessions on app start
WebBrowser.maybeCompleteAuthSession();

// Web client ID (from Firebase) -- used to verify the ID token on the server
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;

// Native client ID -- use a "Desktop app" OAuth client from Google Cloud Console.
// Desktop app clients accept ANY custom URI scheme (whisperconnect://) as a redirect,
// so no Expo login or redirect URI whitelisting is needed for development.
// Create one at: console.cloud.google.com -> APIs & Services -> Credentials
//                -> Create Credentials -> OAuth 2.0 Client ID -> Desktop app
const NATIVE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_NATIVE ?? WEB_CLIENT_ID;

// Uses the app's custom scheme (whisperconnect://) -- no Expo login needed
const redirectUri = makeRedirectUri({ scheme: 'whisperconnect' });

/**
 * useGoogleAuth
 *
 * Wraps expo-auth-session Google provider using a custom scheme redirect.
 * Works in Expo Go without an Expo account.
 *
 * Required .env vars:
 *   EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB    -- Web client from Firebase (server token verification)
 *   EXPO_PUBLIC_GOOGLE_CLIENT_ID_NATIVE -- Desktop app OAuth client ID from Google Cloud Console
 */
export function useGoogleAuth(
  onSuccess: (idToken: string) => void,
  onError: (message: string) => void
) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: NATIVE_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        onSuccess(id_token);
      } else {
        onError('No ID token received from Google.');
      }
    } else if (response.type === 'error') {
      onError(response.error?.message || 'Google sign-in failed.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return { request, promptAsync };
}
