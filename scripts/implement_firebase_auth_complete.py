import re

# 1. Update src/firebaseClient.js with complete modular Firebase Auth (Email/Pass, Phone SMS with Recaptcha, Google, onAuthStateChanged)
firebase_client_code = """/**
 * Pulse Music - Firebase Authentication & Cloud Firestore Engine
 * Project: pulse-music-app-68
 * Providers: Email/Password, Phone SMS (with OTP & Recaptcha), and Google Sign-In
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged,
  signOut,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAWQx9wqglmoO0OPY7pmXy7we_qC6Btt4M",
  authDomain: "pulse-music-app-68.firebaseapp.com",
  projectId: "pulse-music-app-68",
  storageBucket: "pulse-music-app-68.firebasestorage.app",
  messagingSenderId: "845940809877",
  appId: "1:845940809877:web:23602883153d95133abb9c"
};

// Initialize App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

let recaptchaVerifierInstance = null;
let phoneConfirmationResult = null;

/**
 * 1. EMAIL & PASSWORD REGISTRATION
 */
export async function registerWithEmail(name, email, password) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  const displayName = name ? name.trim() : email.split('@')[0];
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=8b5cf6`;

  await updateProfile(user, {
    displayName: displayName,
    photoURL: avatarUrl
  });

  const userData = {
    id: user.uid,
    name: displayName,
    email: user.email,
    avatar: avatarUrl,
    provider: 'email',
    token: await user.getIdToken()
  };

  await syncUserDoc(userData).catch(() => {});
  return userData;
}

/**
 * 1. EMAIL & PASSWORD LOGIN
 */
export async function loginWithEmail(email, password) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password) {
    throw new Error('Password is required.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  const userData = {
    id: user.uid,
    name: user.displayName || user.email.split('@')[0],
    email: user.email,
    avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=8b5cf6`,
    provider: 'email',
    token: await user.getIdToken()
  };

  await syncUserDoc(userData).catch(() => {});
  return userData;
}

/**
 * 2. PHONE NUMBER SMS AUTHENTICATION (Recaptcha + OTP)
 */
export function setupRecaptchaVerifier(containerId = 'recaptcha-container') {
  try {
    if (recaptchaVerifierInstance) {
      recaptchaVerifierInstance.clear();
      recaptchaVerifierInstance = null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('[Pulse Phone Auth] Recaptcha container element not found:', containerId);
      return null;
    }

    recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('[Pulse Phone Auth] Recaptcha verified successfully.');
      },
      'expired-callback': () => {
        console.warn('[Pulse Phone Auth] Recaptcha expired, resetting...');
      }
    });

    return recaptchaVerifierInstance;
  } catch (err) {
    console.error('[Pulse Recaptcha Init Error]:', err);
    return null;
  }
}

export async function sendPhoneOtp(fullPhoneNumber, containerId = 'recaptcha-container') {
  const cleanPhone = (fullPhoneNumber || '').replace(/[\s-]/g, '').trim();
  if (!cleanPhone || !/^\+[1-9]\d{6,14}$/.test(cleanPhone)) {
    throw new Error('Please provide a valid international phone number with country code (e.g. +91 98765 43210 or +1 650 555 1234).');
  }

  const appVerifier = recaptchaVerifierInstance || setupRecaptchaVerifier(containerId);
  if (!appVerifier) {
    throw new Error('Recaptcha verification initialization failed. Please refresh the page.');
  }

  try {
    phoneConfirmationResult = await signInWithPhoneNumber(auth, cleanPhone, appVerifier);
    window.phoneConfirmationResult = phoneConfirmationResult;
    console.log('[Pulse Phone Auth] SMS OTP dispatched successfully to:', cleanPhone);
    return { success: true, phoneNumber: cleanPhone };
  } catch (err) {
    console.error('[Pulse Phone Auth Send OTP Error]:', err);
    if (recaptchaVerifierInstance) {
      try { recaptchaVerifierInstance.clear(); } catch(e) {}
      recaptchaVerifierInstance = null;
    }
    throw err;
  }
}

export async function verifyPhoneOtp(otpCode) {
  const cleanCode = (otpCode || '').replace(/\s+/g, '').trim();
  if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    throw new Error('Please enter a valid 6-digit SMS verification code.');
  }

  const confirmation = phoneConfirmationResult || window.phoneConfirmationResult;
  if (!confirmation || typeof confirmation.confirm !== 'function') {
    throw new Error('No active verification session found. Please request a new OTP code.');
  }

  const result = await confirmation.confirm(cleanCode);
  const user = result.user;
  const phone = user.phoneNumber || 'Phone User';
  const name = user.displayName || `Listener ${phone.slice(-4)}`;
  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(phone)}&backgroundColor=10b981`;

  const userData = {
    id: user.uid,
    name: name,
    email: user.email || `${phone.replace('+', '')}@phone.pulse`,
    phone: phone,
    avatar: avatarUrl,
    provider: 'phone',
    token: await user.getIdToken()
  };

  await syncUserDoc(userData).catch(() => {});
  return userData;
}

/**
 * 3. GOOGLE SIGN-IN (with GoogleAuthProvider)
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userData = {
      id: user.uid,
      name: user.displayName || 'Google Listener',
      email: user.email,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=8b5cf6`,
      provider: 'google',
      token: await user.getIdToken()
    };

    await syncUserDoc(userData).catch(() => {});
    return userData;
  } catch (error) {
    console.error('[Pulse Firebase Google Sign-In Error]:', error);
    throw error;
  }
}

/**
 * 4. OBSERVE AUTH STATE ACROSS RESTARTS
 */
export function listenAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userData = {
        id: user.uid,
        name: user.displayName || (user.email ? user.email.split('@')[0] : `Listener ${user.phoneNumber?.slice(-4) || ''}`),
        email: user.email || (user.phoneNumber ? `${user.phoneNumber.replace('+', '')}@phone.pulse` : ''),
        phone: user.phoneNumber || null,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}&backgroundColor=8b5cf6`,
        provider: user.providerData && user.providerData[0] ? user.providerData[0].providerId : 'firebase',
        token: await user.getIdToken().catch(() => '')
      };
      if (typeof callback === 'function') callback(userData);
    } else {
      if (typeof callback === 'function') callback(null);
    }
  });
}

/**
 * SIGN OUT
 */
export async function signOutFirebase() {
  await signOut(auth).catch(e => console.warn('[Pulse SignOut Notice]:', e));
}

/**
 * FIRESTORE SYNC HELPERS
 */
export async function syncUserDoc(user) {
  if (!user || (!user.email && !user.id)) return;
  try {
    const docId = (user.email || user.id).toLowerCase();
    const userRef = doc(db, 'users', docId);
    await setDoc(userRef, {
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      avatar: user.avatar,
      provider: user.provider || 'firebase',
      last_active: new Date().toISOString()
    }, { merge: true });
    console.log('[Pulse Firestore] User document synced for:', docId);
  } catch (err) {
    console.warn('[Pulse Firestore User Sync]:', err);
  }
}

export async function savePlaylistsToFirestore(userId, playlists) {
  if (!userId) return;
  try {
    const playlistRef = doc(db, 'user_playlists', userId.toLowerCase());
    await setDoc(playlistRef, {
      user_id: userId.toLowerCase(),
      playlists: playlists || [],
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('[Pulse Firestore Save Playlists]:', e);
  }
}

export async function loadPlaylistsFromFirestore(userId) {
  if (!userId) return [];
  try {
    const playlistRef = doc(db, 'user_playlists', userId.toLowerCase());
    const snap = await getDoc(playlistRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.playlists || [];
    }
  } catch (e) {
    console.warn('[Pulse Firestore Load Playlists]:', e);
  }
  return [];
}

// Global Export
if (typeof window !== 'undefined') {
  window.PulseFirebase = {
    auth,
    db,
    registerWithEmail,
    loginWithEmail,
    setupRecaptchaVerifier,
    sendPhoneOtp,
    verifyPhoneOtp,
    signInWithGoogle,
    listenAuthState,
    signOutFirebase,
    syncUserDoc,
    savePlaylistsToFirestore,
    loadPlaylistsFromFirestore
  };
}
"""

with open('src/firebaseClient.js', 'w', encoding='utf-8') as f:
    f.write(firebase_client_code)
print("[OK] Updated src/firebaseClient.js with complete Firebase Auth providers.")
