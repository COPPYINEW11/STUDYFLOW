import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUFT5gfGZsNb7CgSEnzhbZ_D0kQdDOAZg",
  authDomain: "fcaid-ac919.firebaseapp.com",
  projectId: "fcaid-ac919",
  storageBucket: "fcaid-ac919.firebasestorage.app",
  messagingSenderId: "330010157012",
  appId: "1:330010157012:web:9a20a3b60c80e8e011c041",
  measurementId: "G-F9M9GZVLFL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
