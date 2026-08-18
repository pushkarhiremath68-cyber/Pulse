/**
 * Pulse Music - Google Cloud & Firebase Engine
 * Project: pulse-music-app-68 (845940809877)
 * Handles Firebase Authentication (Google, Email/Password),
 * Cloud Firestore Realtime Sync (Playlists, Favorites, History),
 * and Cloud Storage media endpoints.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyAWQx9wqglmoO0OPY7pmXy7we_qC6Btt4M",
  authDomain: "pulse-music-app-68.firebaseapp.com",
  projectId: "pulse-music-app-68",
  storageBucket: "pulse-music-app-68.firebasestorage.app",
  messagingSenderId: "845940809877",
  appId: "1:845940809877:web:23602883153d95133abb9c"
};

// Global reference fallback
if (typeof window !== 'undefined') {
  window.PULSE_FIREBASE_CONFIG = firebaseConfig;
}

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let googleAuthProvider = null;

export async function initFirebase() {
  if (firebaseApp) {
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  }

  try {
    // 1. Try modern modular Firebase SDK if available
    let fbApp, fbAuth, fbFirestore;
    try {
      fbApp = await import('firebase/app');
      fbAuth = await import('firebase/auth');
      fbFirestore = await import('firebase/firestore');
    } catch (e) {
      // Fallback to window/compat if dynamic import not available
    }

    if (fbApp && fbApp.initializeApp) {
      firebaseApp = fbApp.getApps().length ? fbApp.getApp() : fbApp.initializeApp(firebaseConfig);
      firebaseAuth = fbAuth.getAuth(firebaseApp);
      firestoreDb = fbFirestore.getFirestore(firebaseApp);
      googleAuthProvider = new fbAuth.GoogleAuthProvider();
      console.log('[Pulse Firebase] Initialized with Google Cloud Project:', firebaseConfig.projectId);
      return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
    }
  } catch (err) {
    console.warn('[Pulse Firebase Module Load Notice]:', err);
  }

  // 2. Try window.firebase (compat CDN)
  if (typeof window !== 'undefined' && window.firebase) {
    try {
      if (!window.firebase.apps.length) {
        firebaseApp = window.firebase.initializeApp(firebaseConfig);
      } else {
        firebaseApp = window.firebase.app();
      }
      firebaseAuth = window.firebase.auth();
      firestoreDb = window.firebase.firestore ? window.firebase.firestore() : null;
      googleAuthProvider = new window.firebase.auth.GoogleAuthProvider();
      console.log('[Pulse Firebase CDN] Initialized with Google Cloud Project:', firebaseConfig.projectId);
      return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
    } catch (e) {
      console.warn('[Pulse Firebase CDN Init]:', e);
    }
  }

  return { app: null, auth: null, db: null };
}

/**
 * Sign In / Sign Up using Google Popup
 */
export async function signInWithGoogle() {
  const { auth } = await initFirebase();
  if (!auth) {
    console.warn('[Pulse Firebase] Auth not initialized, falling back to local Google simulation.');
    return null;
  }

  try {
    // Try modular
    const fbAuth = await import('firebase/auth').catch(() => null);
    if (fbAuth && fbAuth.signInWithPopup) {
      const provider = new fbAuth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await fbAuth.signInWithPopup(auth, provider);
      const user = result.user;
      return {
        id: user.uid,
        name: user.displayName || 'Google Listener',
        email: user.email,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=8b5cf6`,
        provider: 'google',
        token: await user.getIdToken()
      };
    }

    // Try compat
    if (typeof window !== 'undefined' && window.firebase && window.firebase.auth) {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      const result = await window.firebase.auth().signInWithPopup(provider);
      const user = result.user;
      return {
        id: user.uid,
        name: user.displayName || 'Google Listener',
        email: user.email,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=8b5cf6`,
        provider: 'google',
        token: await user.getIdToken()
      };
    }
  } catch (error) {
    console.error('[Pulse Firebase Google Sign-In Error]:', error);
    throw error;
  }
}

/**
 * Sign Up with Email and Password
 */
export async function registerWithEmail(name, email, password) {
  const { auth, db } = await initFirebase();
  if (!auth) throw new Error('Firebase Auth unavailable');

  try {
    const fbAuth = await import('firebase/auth').catch(() => null);
    if (fbAuth && fbAuth.createUserWithEmailAndPassword) {
      const res = await fbAuth.createUserWithEmailAndPassword(auth, email, password);
      if (name && fbAuth.updateProfile) {
        await fbAuth.updateProfile(res.user, {
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
        });
      }
      const token = await res.user.getIdToken();
      const userData = {
        id: res.user.uid,
        name: name || email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        provider: 'email',
        token: token
      };

      // Sync user doc to Firestore
      syncUserDoc(userData).catch(() => {});
      return userData;
    }

    if (window.firebase && window.firebase.auth) {
      const res = await window.firebase.auth().createUserWithEmailAndPassword(email, password);
      if (name) {
        await res.user.updateProfile({
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
        });
      }
      const token = await res.user.getIdToken();
      const userData = {
        id: res.user.uid,
        name: name || email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        provider: 'email',
        token: token
      };
      syncUserDoc(userData).catch(() => {});
      return userData;
    }
  } catch (err) {
    console.error('[Pulse Firebase Register Error]:', err);
    throw err;
  }
}

/**
 * Sign In with Email and Password
 */
export async function loginWithEmail(email, password) {
  const { auth } = await initFirebase();
  if (!auth) throw new Error('Firebase Auth unavailable');

  try {
    const fbAuth = await import('firebase/auth').catch(() => null);
    if (fbAuth && fbAuth.signInWithEmailAndPassword) {
      const res = await fbAuth.signInWithEmailAndPassword(auth, email, password);
      const user = res.user;
      const token = await user.getIdToken();
      return {
        id: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        provider: 'email',
        token: token
      };
    }

    if (window.firebase && window.firebase.auth) {
      const res = await window.firebase.auth().signInWithEmailAndPassword(email, password);
      const user = res.user;
      const token = await user.getIdToken();
      return {
        id: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        provider: 'email',
        token: token
      };
    }
  } catch (err) {
    console.error('[Pulse Firebase Login Error]:', err);
    throw err;
  }
}

/**
 * Sign Out
 */
export async function signOutFirebase() {
  const { auth } = await initFirebase();
  if (!auth) return;
  try {
    const fbAuth = await import('firebase/auth').catch(() => null);
    if (fbAuth && fbAuth.signOut) {
      await fbAuth.signOut(auth);
    } else if (window.firebase && window.firebase.auth) {
      await window.firebase.auth().signOut();
    }
  } catch (e) {
    console.warn('[Pulse Firebase SignOut Notice]:', e);
  }
}

/**
 * Sync user profile to Firestore
 */
export async function syncUserDoc(user) {
  if (!user || !user.email) return;
  try {
    const { db } = await initFirebase();
    if (!db) return;

    const fbFirestore = await import('firebase/firestore').catch(() => null);
    if (fbFirestore && fbFirestore.doc && fbFirestore.setDoc) {
      const userRef = fbFirestore.doc(db, 'users', user.email.toLowerCase());
      await fbFirestore.setDoc(userRef, {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider || 'email',
        last_active: new Date().toISOString()
      }, { merge: true });
      console.log('[Pulse Firestore] User document synced for:', user.email);
    } else if (window.firebase && window.firebase.firestore) {
      await window.firebase.firestore().collection('users').doc(user.email.toLowerCase()).set({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider || 'email',
        last_active: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[Pulse Firestore User Sync]:', err);
  }
}

/**
 * Save user playlists to Cloud Firestore
 */
export async function savePlaylistsToFirestore(email, playlists) {
  if (!email) return;
  try {
    const { db } = await initFirebase();
    if (!db) return;

    const fbFirestore = await import('firebase/firestore').catch(() => null);
    if (fbFirestore && fbFirestore.doc && fbFirestore.setDoc) {
      const playlistRef = fbFirestore.doc(db, 'user_playlists', email.toLowerCase());
      await fbFirestore.setDoc(playlistRef, {
        email: email.toLowerCase(),
        playlists: playlists || [],
        updated_at: new Date().toISOString()
      }, { merge: true });
    } else if (window.firebase && window.firebase.firestore) {
      await window.firebase.firestore().collection('user_playlists').doc(email.toLowerCase()).set({
        email: email.toLowerCase(),
        playlists: playlists || [],
        updated_at: new Date().toISOString()
      }, { merge: true });
    }
  } catch (e) {
    console.warn('[Pulse Firestore Save Playlists]:', e);
  }
}

/**
 * Load user playlists from Cloud Firestore
 */
export async function loadPlaylistsFromFirestore(email) {
  if (!email) return [];
  try {
    const { db } = await initFirebase();
    if (!db) return [];

    const fbFirestore = await import('firebase/firestore').catch(() => null);
    if (fbFirestore && fbFirestore.doc && fbFirestore.getDoc) {
      const playlistRef = fbFirestore.doc(db, 'user_playlists', email.toLowerCase());
      const snap = await fbFirestore.getDoc(playlistRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.playlists || [];
      }
    } else if (window.firebase && window.firebase.firestore) {
      const doc = await window.firebase.firestore().collection('user_playlists').doc(email.toLowerCase()).get();
      if (doc.exists) {
        return doc.data().playlists || [];
      }
    }
  } catch (e) {
    console.warn('[Pulse Firestore Load Playlists]:', e);
  }
  return [];
}

// Auto-initialize when running in browser
if (typeof window !== 'undefined') {
  window.PulseFirebase = {
    init: initFirebase,
    signInWithGoogle,
    registerWithEmail,
    loginWithEmail,
    signOutFirebase,
    savePlaylistsToFirestore,
    loadPlaylistsFromFirestore
  };
}
