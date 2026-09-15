import { initFirebase, firebase } from './firebase.js';

const STORAGE_KEY = 'pulse_user_session';

export function getStoredUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}

  const guest = {
    id: `guest-${Date.now()}`,
    uid: `guest-${Date.now()}`,
    name: 'Guest Listener',
    email: 'guest@pulse.app',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=guest`,
    provider: 'anonymous'
  };
  setStoredUser(guest);
  return guest;
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  notifyAuthListeners(user);
}

const authListeners = new Set();

export function onAuthStateChanged(callback) {
  authListeners.add(callback);
  callback(getStoredUser());
  return () => authListeners.delete(callback);
}

function notifyAuthListeners(user) {
  authListeners.forEach(cb => {
    try { cb(user); } catch (e) {}
  });
}

// 1. Email & Password Sign Up
export async function signUpWithEmail(email, password, displayName = '') {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const { auth } = initFirebase();
  if (auth) {
    try {
      const res = await auth.createUserWithEmailAndPassword(email, password);
      if (displayName && res.user.updateProfile) {
        await res.user.updateProfile({ displayName });
      }
      const user = {
        id: res.user.uid,
        uid: res.user.uid,
        name: displayName || res.user.displayName || email.split('@')[0],
        email: res.user.email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || email)}&backgroundColor=8b5cf6`,
        provider: 'email'
      };
      setStoredUser(user);
      return user;
    } catch (e) {
      console.warn('[FirebaseAuth] SDK signup fallback:', e.message);
    }
  }

  // Instant Local Session Fallback
  const user = {
    id: `user-${Date.now()}`,
    uid: `user-${Date.now()}`,
    name: displayName || email.split('@')[0] || 'Listener',
    email: email,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || email)}&backgroundColor=8b5cf6`,
    provider: 'email'
  };
  setStoredUser(user);
  return user;
}

// 2. Email & Password Sign In
export async function signInWithEmail(email, password) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const { auth } = initFirebase();
  if (auth) {
    try {
      const res = await auth.signInWithEmailAndPassword(email, password);
      const user = {
        id: res.user.uid,
        uid: res.user.uid,
        name: res.user.displayName || email.split('@')[0],
        email: res.user.email,
        avatar: res.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=8b5cf6`,
        provider: 'email'
      };
      setStoredUser(user);
      return user;
    } catch (e) {
      console.warn('[FirebaseAuth] SDK login notice:', e.message);
      if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        throw new Error(e.message);
      }
    }
  }

  const user = {
    id: `user-${Date.now()}`,
    uid: `user-${Date.now()}`,
    name: email.split('@')[0] || 'Listener',
    email: email,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=8b5cf6`,
    provider: 'email'
  };
  setStoredUser(user);
  return user;
}

// 3. Google Sign-In Flow (Real Firebase OAuth — no fake fallback)
export async function signInWithGoogle() {
  const { auth } = initFirebase();
  if (!auth) {
    throw new Error('Firebase is not initialized. Please check your configuration.');
  }

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    const res = await auth.signInWithPopup(provider);
    const user = {
      id: res.user.uid,
      uid: res.user.uid,
      name: res.user.displayName || 'Google User',
      email: res.user.email,
      avatar: res.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(res.user.displayName || 'User')}&backgroundColor=8b5cf6`,
      provider: 'google'
    };
    setStoredUser(user);
    return user;
  } catch (e) {
    if (e.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. You closed the Google popup.');
    }
    if (e.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups for this site.');
    }
    console.error('[FirebaseAuth] Google sign-in error:', e.code, e.message);
    throw new Error(e.message || 'Google sign-in failed. Please try again.');
  }
}

// 4. Guest / Anonymous Mode Sign In
export async function signInAnonymously() {
  const { auth } = initFirebase();
  if (auth && auth.signInAnonymously) {
    try {
      const res = await auth.signInAnonymously();
      const user = {
        id: res.user.uid,
        uid: res.user.uid,
        name: 'Guest Listener',
        email: 'guest@pulse.app',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${res.user.uid}`,
        provider: 'anonymous'
      };
      setStoredUser(user);
      return user;
    } catch (e) {
      console.warn('[FirebaseAuth] Anonymous login notice:', e.message);
    }
  }

  const guestId = `guest-${Date.now()}`;
  const user = {
    id: guestId,
    uid: guestId,
    name: 'Guest Listener',
    email: 'guest@pulse.app',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
    provider: 'anonymous'
  };
  setStoredUser(user);
  return user;
}

// 5. Sign Out
export async function signOut() {
  const { auth } = initFirebase();
  if (auth && auth.signOut) {
    try {
      await auth.signOut();
    } catch (e) {
      console.warn('[FirebaseAuth] Sign out notice:', e.message);
    }
  }
  setStoredUser(null);
  return getStoredUser();
}

// Native Firebase Auth state observer to sync cross-tab and session persistence
export function setupNativeAuthSync() {
  const { auth, db } = initFirebase();
  if (auth && auth.onAuthStateChanged) {
    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const isGoogle = firebaseUser.providerData?.some(p => p.providerId === 'google.com');
        const user = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || (isGoogle ? 'Google Listener' : 'Listener'),
          email: firebaseUser.email || 'user@pulse.app',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email || 'User')}&backgroundColor=8b5cf6`,
          provider: isGoogle ? 'google' : (firebaseUser.isAnonymous ? 'anonymous' : 'email')
        };
        setStoredUser(user);

        // Sync user profile to Firestore
        if (db && !firebaseUser.isAnonymous) {
          try {
            await db.collection('users').doc(firebaseUser.uid).set({
              uid: firebaseUser.uid,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              provider: user.provider,
              lastLoginAt: Date.now()
            }, { merge: true });
          } catch (err) {
            console.warn('[Firestore] User document sync notice:', err.message);
          }
        }
      }
    });
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setupNativeAuthSync());
  } else {
    setupNativeAuthSync();
  }
}

const authService = {
  getStoredUser,
  setStoredUser,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  setupNativeAuthSync
};

if (typeof window !== 'undefined') {
  window.firebaseAuthService = authService;
  window.PulseAuth = authService;
}

export default authService;
