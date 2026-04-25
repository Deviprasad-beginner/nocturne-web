
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration for deployment
export const firebaseConfig = {
  // These will be set during deployment
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if running in Firebase hosting environment
export const isFirebaseEnvironment = () => {
  return window.location.hostname.includes('firebaseapp.com') || 
         window.location.hostname.includes('web.app');
};

// Get the appropriate API base URL
export const getApiBaseUrl = () => {
  if (isFirebaseEnvironment()) {
    return '/api'; // Firebase Functions will handle the routing
  }
  return import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';
};

// Check if environment variables are loaded correctly
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`Missing environment variable: ${key}. Firebase features will be disabled.`);
    return "";
  }
  return value;
};

// Check if all required Firebase env vars are present
const hasFirebaseConfig = () => {
  const requiredVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN", 
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID"
  ];

  return requiredVars.every(key => import.meta.env[key]);
};

// Initialize Firebase only if config is complete
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let provider: GoogleAuthProvider | null = null;

if (hasFirebaseConfig()) {
  try {
    const firebaseConfig = {
      apiKey: getEnvVar("VITE_FIREBASE_API_KEY"),
      authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN"),
      projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID"),
      storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET"),
      messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID"),
      appId: getEnvVar("VITE_FIREBASE_APP_ID"),
    };

    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();

    console.log("Firebase initialized successfully");
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase not configured. Authentication disabled.");
}

// Export Firebase instances and functions for use in other parts of the app
export { app, auth, db, provider, signInWithPopup, signOut };