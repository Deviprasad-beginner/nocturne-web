import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore - Metro bundler resolves this via react-native export condition but tsc does not
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Using the same config keys that the web application uses
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBzrabH9FEcd3zoMKsXErV0JQJQkJfeiW4",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "nocturne-web1.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "nocturne-web1",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "nocturne-web1.firebasestorage.app",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "491993562697",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:491993562697:web:f1f08df364d04c2f7ec998"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with React Native Persistence (AsyncStorage)
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
