/**
 * Pulse Music - Firebase & Cloud Firestore Integration Module
 * Provides initialized Firebase App, Auth, and Firestore instances
 * with robust offline persistence and graceful fallbacks.
 */

// Import Firebase from the npm package (bundled by Vite)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Re-export firebase so other modules can use GoogleAuthProvider etc.
export { firebase };

// Environment-driven Firebase Configuration with fallback to real project credentials
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_FIREBASE_API_KEY) || "AIzaSyAWQx9wqglmoO0OPY7pmXy7we_qC6Btt4M",
  authDomain: (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN) || "pulse-music-app-68.firebaseapp.com",
  projectId: (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_FIREBASE_PROJECT_ID) || "pulse-music-app-68",
  storageBucket: (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET) || "pulse-music-app-68.firebasestorage.app",
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "845940809877",
  appId: (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_FIREBASE_APP_ID) || "1:845940809877:web:23602883153d95133abb9c"
};

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let isFirebaseInitialized = false;

export function getFirebaseConfig() {
  if (typeof window !== 'undefined' && window.PULSE_FIREBASE_CONFIG) {
    return window.PULSE_FIREBASE_CONFIG;
  }
  return DEFAULT_FIREBASE_CONFIG;
}

/**
 * Initializes Firebase App, Auth, and Firestore
 */
export function initFirebase() {
  if (isFirebaseInitialized) {
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  }

  const config = getFirebaseConfig();

  try {
    // Initialize using the npm-bundled firebase compat SDK
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(config);
    } else {
      firebaseApp = firebase.app();
    }

    // Initialize Auth
    firebaseAuth = firebase.auth();
    try {
      firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (e) {}

    // Initialize Firestore with offline persistence
    firestoreDb = firebase.firestore();
    try {
      firestoreDb.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('[Firestore] Multiple tabs open, persistence enabled on primary tab only.');
        } else if (err.code === 'unimplemented') {
          console.warn('[Firestore] Current browser does not support offline persistence.');
        }
      });
    } catch (e) {}

    isFirebaseInitialized = true;
    console.log('[Pulse Firebase] Firebase initialized successfully with project:', config.projectId);
  } catch (err) {
    console.warn('[Pulse Firebase] Firebase SDK initialization notice:', err.message);
  }

  return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
}

// Auto initialize when module loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initFirebase());
  } else {
    initFirebase();
  }
}

export { firebaseApp, firebaseAuth, firestoreDb };
