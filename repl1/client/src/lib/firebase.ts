import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// Check if environment variables are loaded correctly
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`Missing environment variable: ${key}. Firebase features will be disabled.`);
    return "";
  }
  return value;
};

// Firebase config with validation
const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY"),
  authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVar("VITE_FIREBASE_APP_ID"),
};

// Check if Firebase config is complete
const hasValidConfig = Object.values(firebaseConfig).every(value => value !== "");

let app: any = null;
let db: any = null;
let auth: any = null;
let provider: any = null;

if (hasValidConfig) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
}

export { db, auth, provider };

export const signInWithGoogle = () => {
  if (!auth || !provider) {
    throw new Error("Firebase not configured. Please provide Firebase credentials.");
  }
  return signInWithPopup(auth, provider);
};

export const signOutUser = () => {
  if (!auth) {
    throw new Error("Firebase not configured. Please provide Firebase credentials.");
  }
  return signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn("Firebase not configured. Authentication disabled.");
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Firestore utility functions
export const fetchCategory = async (categoryName: string, filterPublic = false) => {
  if (!db) {
    console.warn("Firebase not configured. Returning empty data.");
    return [];
  }
  
  try {
    const q = query(collection(db, categoryName), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const items = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => (filterPublic ? !item.isPrivate : true));
    return items;
  } catch (error) {
    console.error(`Failed to fetch ${categoryName}:`, error);
    return [];
  }
};

export const addDocument = async (collectionName: string, data: any) => {
  if (!db) {
    throw new Error("Firebase not configured. Please provide Firebase credentials.");
  }
  
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      timestamp: serverTimestamp(),
    });
    return docRef;
  } catch (error) {
    console.error(`Failed to add document to ${collectionName}:`, error);
    throw error;
  }
};
