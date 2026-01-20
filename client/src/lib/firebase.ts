import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzrabH9FEcd3zoMKsXErV0JQJQkJfeiW4",
  authDomain: "nocturne-web1.firebaseapp.com",
  projectId: "nocturne-web1",
  storageBucket: "nocturne-web1.firebasestorage.app",
  messagingSenderId: "491993562697",
  appId: "1:491993562697:web:f1f08df364d04c2f7ec998"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
