// src/services/authHandlers.js
import {
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    signInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
  } from "firebase/auth";
  
  import {
    auth,
    googleProvider,
    facebookProvider,
    microsoftProvider,
    githubProvider,
  } from "./firebase";
  
  // 🔐 Login Methods
  export const handleGoogleLogin = async (setShowLoginModal) => {
    await signInWithPopup(auth, googleProvider);
    setShowLoginModal(false);
  };
  
  export const handleFacebookLogin = async (setShowLoginModal) => {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, facebookProvider);
    setShowLoginModal(false);
  };
  
  export const handleMicrosoftLogin = async (setShowLoginModal) => {
    await signInWithPopup(auth, microsoftProvider);
    setShowLoginModal(false);
  };
  
  export const handleGithubLogin = async (setShowLoginModal) => {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, githubProvider);
    setShowLoginModal(false);
  };
  
  export const handleAnonymousLogin = async (setShowLoginModal) => {
    await signInAnonymously(auth);
    setShowLoginModal(false);
  };
  
  // 🔁 Auth Form (Email/Password)
  export const handleAuth = async ({ formData, authMode, setShowLoginModal }) => {
    if (!formData.email.includes("@")) throw new Error("Invalid email");
    if (authMode === "register") {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    } else {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
    }
    setShowLoginModal(false);
  };
  
  // 🔓 Logout
  export const handleLogout = async (setIsLoggedIn, setPhase) => {
    await signOut(auth);
  };
  
  // 🔑 Forgot Password
  export const handleForgotPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };
  
