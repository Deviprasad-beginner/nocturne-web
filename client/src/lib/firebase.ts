import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Use environment variables in production, fallback to hardcoded values for development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBzrabH9FEcd3zoMKsXErV0JQJQkJfeiW4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nocturne-web1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nocturne-web1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nocturne-web1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "491993562697",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:491993562697:web:f1f08df364d04c2f7ec998"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Helper function to get API base URL based on environment.
// In development, Vite proxies /api → http://localhost:5000 so we always
// use a same-origin path. In production the API is served from the same origin.
export const getApiBaseUrl = () => '/api';

