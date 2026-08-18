import re

firebase_clean = """/**
 * Pulse Music - Google Cloud & Firebase Engine
 * Project: pulse-music-app-68 (845940809877)
 * Uses window.firebase compat SDK loaded synchronously in <head>
 */

export const firebaseConfig = {
  apiKey: "AIzaSyAWQx9wqglmoO0OPY7pmXy7we_qC6Btt4M",
  authDomain: "pulse-music-app-68.firebaseapp.com",
  projectId: "pulse-music-app-68",
  storageBucket: "pulse-music-app-68.firebasestorage.app",
  messagingSenderId: "845940809877",
  appId: "1:845940809877:web:23602883153d95133abb9c"
};

if (typeof window !== 'undefined') {
  window.PULSE_FIREBASE_CONFIG = firebaseConfig;
}

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;

export function initFirebase() {
  if (firebaseApp) {
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  }

  if (typeof window !== 'undefined' && window.firebase) {
    try {
      if (!window.firebase.apps.length) {
        firebaseApp = window.firebase.initializeApp(firebaseConfig);
      } else {
        firebaseApp = window.firebase.app();
      }
      firebaseAuth = window.firebase.auth();
      firestoreDb = window.firebase.firestore ? window.firebase.firestore() : null;
      console.log('[Pulse Firebase] Initialized successfully with project:', firebaseConfig.projectId);
      return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
    } catch (e) {
      console.warn('[Pulse Firebase Init Notice]:', e);
    }
  }

  return { app: null, auth: null, db: null };
}

export async function signInWithGoogle() {
  const { auth } = initFirebase();
  if (!auth) return null;

  try {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    return {
      id: user.uid,
      name: user.displayName || 'Google Listener',
      email: user.email,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=8b5cf6`,
      provider: 'google',
      token: await user.getIdToken()
    };
  } catch (err) {
    console.error('[Pulse Google Sign-In Error]:', err);
    throw err;
  }
}

export async function signUpWithEmail(email, password, displayName = '') {
  const { auth } = initFirebase();
  if (!auth) throw new Error('Firebase Auth not available');

  const result = await auth.createUserWithEmailAndPassword(email, password);
  const user = result.user;
  if (displayName && user.updateProfile) {
    await user.updateProfile({ displayName });
  }
  return {
    id: user.uid,
    name: displayName || user.displayName || email.split('@')[0],
    email: user.email,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || email)}&backgroundColor=8b5cf6`,
    provider: 'email'
  };
}

export async function signInWithEmail(email, password) {
  const { auth } = initFirebase();
  if (!auth) throw new Error('Firebase Auth not available');

  const result = await auth.signInWithEmailAndPassword(email, password);
  const user = result.user;
  return {
    id: user.uid,
    name: user.displayName || email.split('@')[0],
    email: user.email,
    avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || email)}&backgroundColor=8b5cf6`,
    provider: 'email'
  };
}

export async function sendPasswordReset(email) {
  const { auth } = initFirebase();
  if (!auth) throw new Error('Firebase Auth not available');
  return auth.sendPasswordResetEmail(email);
}

export async function signOutFirebase() {
  const { auth } = initFirebase();
  if (auth) await auth.signOut();
}

export function onAuthStateChangedListener(callback) {
  const { auth } = initFirebase();
  if (auth) {
    return auth.onAuthStateChanged(user => {
      if (user) {
        callback({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Listener',
          email: user.email,
          avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}&backgroundColor=8b5cf6`,
          provider: user.providerData?.[0]?.providerId || 'firebase'
        });
      } else {
        callback(null);
      }
    });
  }
  return () => {};
}

// Global window bindings
if (typeof window !== 'undefined') {
  window.PulseAuth = {
    init: initFirebase,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    signOut: signOutFirebase,
    onAuthStateChanged: onAuthStateChangedListener
  };
}
"""

with open('src/firebaseClient.js', 'w', encoding='utf-8') as f:
    f.write(firebase_clean)

print("[OK] Rewrote src/firebaseClient.js with clean direct compat SDK")
