/**
 * Pulse Music - Firebase & Cloud Firestore Integration Module
 * Provides initialized Firebase App, Auth, and Firestore instances
 * with robust offline persistence and graceful fallbacks.
 */

// Default Firebase Configuration (Can be overridden via window.PULSE_FIREBASE_CONFIG or .env)
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyPulseMusicAdFreeExtractor2026Key",
  authDomain: "pulse-music-app-streaming.firebaseapp.com",
  projectId: "pulse-music-app-streaming",
  storageBucket: "pulse-music-app-streaming.appspot.com",
  messagingSenderId: "109876543210",
  appId: "1:109876543210:web:abcdef1234567890pulse"
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

  // If Firebase compat SDK is loaded via CDN (recommended for cross-platform Web/Capacitor/Electron)
  if (typeof window !== 'undefined' && window.firebase) {
    try {
      if (!window.firebase.apps.length) {
        firebaseApp = window.firebase.initializeApp(config);
      } else {
        firebaseApp = window.firebase.app();
      }

      if (window.firebase.auth) {
        firebaseAuth = window.firebase.auth();
        // Set persistence to LOCAL
        try {
          firebaseAuth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
        } catch (e) {}
      }

      if (window.firebase.firestore) {
        firestoreDb = window.firebase.firestore();
        // Enable offline persistence if available
        try {
          firestoreDb.enablePersistence({ synchronizeTabs: true }).catch((err) => {
            if (err.code === 'failed-precondition') {
              console.warn('[Firestore] Multiple tabs open, persistence enabled on primary tab only.');
            } else if (err.code === 'unimplemented') {
              console.warn('[Firestore] Current browser does not support offline persistence.');
            }
          });
        } catch (e) {}
      }

      isFirebaseInitialized = true;
      console.log('[Pulse Firebase] Firebase initialized successfully with project:', config.projectId);
    } catch (err) {
      console.warn('[Pulse Firebase] Firebase SDK initialization notice:', err.message);
    }
  }

  return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
}

// Auto initialize when window is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initFirebase());
  } else {
    initFirebase();
  }
}

export { firebaseApp, firebaseAuth, firestoreDb };
