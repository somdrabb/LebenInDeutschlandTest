// src/services/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

import { getDatabase, ref, get, set, child, update } from "firebase/database";
import { getFirestore } from 'firebase/firestore';




// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5TK-nlxxgGrP3UedYdmhiLJVD6iviCOc",
  authDomain: "lebide-3b6e3.firebaseapp.com",
  projectId: "lebide-3b6e3",
  storageBucket: "lebide-3b6e3.firebasestorage.app",
  messagingSenderId: "1076140170519",
  appId: "1:1076140170519:web:6d8dbf0af0f9ef0259ab52",
  measurementId: "G-D5G8XRGFJ7"
};

// ✅ Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Firebase Auth
const auth = getAuth(app);

// ✅ Initialize all auth providers
// ✅ Google: always show account picker
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"  // or "consent" for full re-auth
});

// ✅ Facebook: force re-auth
const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  auth_type: "reauthenticate" // optional: to always show login
});

const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({
  prompt: "login", // 👈 forces fresh login each time
});
const githubProvider = new GithubAuthProvider(); 

export const database = getDatabase(app); // ✅ Add this
export { ref, get, set, child, update };

// ✅ Export all for use in App.js and AuthForm.js
export {
  auth,
  googleProvider,
  facebookProvider,
  microsoftProvider,
  githubProvider,
};

export const db = getFirestore(app); // ✅ this enables Firestore access
