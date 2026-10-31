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
    if (user.provider === 'google' || user.provider === 'email' || user.provider === 'phone') {
      setGateUnlocked(true);
    }
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

// 3. Google Sign-In Flow (Real Firebase OAuth)
let isGoogleAuthInProgress = false;

export async function signInWithGoogle() {
  if (isGoogleAuthInProgress) {
    console.warn('[FirebaseAuth] Google Sign-In already in flight, preventing concurrent conflict.');
    return null;
  }
  isGoogleAuthInProgress = true;

  try {
    const { auth } = initFirebase();
    if (!auth) {
      throw new Error('Firebase is not initialized. Please check your configuration.');
    }

    // 1. Electron Native Desktop OAuth (Bypasses popup/browser restrictions entirely)
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.signInWithGoogle === 'function') {
      try {
        console.log('[FirebaseAuth] Initiating Electron Native Google Sign-In...');
        const nativeAuth = await window.electronAPI.signInWithGoogle();
        if (nativeAuth && nativeAuth.idToken) {
          if (firebase && firebase.auth && firebase.auth.GoogleAuthProvider) {
            const cred = firebase.auth.GoogleAuthProvider.credential(nativeAuth.idToken, nativeAuth.accessToken);
            const res = await auth.signInWithCredential(cred);
            const user = {
              id: res.user.uid,
              uid: res.user.uid,
              name: res.user.displayName || 'Google Listener',
              email: res.user.email,
              avatar: res.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(res.user.displayName || 'User')}&backgroundColor=8b5cf6`,
              provider: 'google'
            };
            setStoredUser(user);
            return user;
          }
        }
      } catch (electronErr) {
        console.warn('[FirebaseAuth] Electron native Google Auth notice:', electronErr.message);
        if (electronErr.message && electronErr.message.includes('closed by user')) {
          throw new Error('Sign-in cancelled. You closed the Google popup window.');
        }
        // If Electron native auth had another error, fall through to web auth
      }
    }

    // Ensure clean state if an anonymous session or stale user is lingering
    if (auth.currentUser && auth.currentUser.isAnonymous) {
      try { await auth.signOut(); } catch (_) {}
    }

    // 2. Standard Web Auth with popup & graceful fallback
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account' });

    let res = null;
    try {
      res = await auth.signInWithPopup(provider);
    } catch (popupErr) {
      console.warn('[FirebaseAuth] Google popup notice:', popupErr.code, popupErr.message);

      if (popupErr.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. You closed the Google popup window.');
      }

      if (popupErr.code === 'auth/cancelled-popup-request') {
        console.log('[FirebaseAuth] Popup request was cancelled, returning cleanly.');
        return null;
      }

      // Check if auth observer actually resolved the user despite the popup rejection
      if (auth.currentUser && auth.currentUser.uid && !auth.currentUser.isAnonymous) {
        const u = auth.currentUser;
        const user = {
          id: u.uid,
          uid: u.uid,
          name: u.displayName || 'Google Listener',
          email: u.email,
          avatar: u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.displayName || 'User')}&backgroundColor=8b5cf6`,
          provider: 'google'
        };
        setStoredUser(user);
        return user;
      }

      const isElectron = typeof window !== 'undefined' && (window.electronAPI || navigator.userAgent.includes('Electron'));

      // If popup was blocked or unsupported, fall back to redirect
      if (!isElectron && (
        popupErr.code === 'auth/popup-blocked' ||
        popupErr.code === 'auth/operation-not-supported-in-this-environment'
      )) {
        console.log('[FirebaseAuth] Falling back to signInWithRedirect for Google OAuth...');
        try {
          const redirectProvider = new firebase.auth.GoogleAuthProvider();
          redirectProvider.addScope('profile');
          redirectProvider.addScope('email');
          await auth.signInWithRedirect(redirectProvider);
          return null;
        } catch (rErr) {
          console.warn('[FirebaseAuth] Redirect notice:', rErr.message);
          throw new Error('Popup blocked and redirect failed. Please allow popups for this site.');
        }
      }

      // If internal error occurred (e.g. transient iframe handshake desync after logout),
      // wait for SDK state to settle and retry once cleanly with a fresh provider
      if (popupErr.code === 'auth/internal-error' || (popupErr.message && popupErr.message.includes('auth/internal-error'))) {
        console.log('[FirebaseAuth] Transient auth internal error detected. Settling and retrying once...');
        await new Promise(r => setTimeout(r, 400));

        // Re-check if auth state resolved in the background
        if (auth.currentUser && auth.currentUser.uid && !auth.currentUser.isAnonymous) {
          const u = auth.currentUser;
          const user = {
            id: u.uid,
            uid: u.uid,
            name: u.displayName || 'Google Listener',
            email: u.email,
            avatar: u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.displayName || 'User')}&backgroundColor=8b5cf6`,
            provider: 'google'
          };
          setStoredUser(user);
          return user;
        }

        try {
          const retryProvider = new firebase.auth.GoogleAuthProvider();
          retryProvider.addScope('profile');
          retryProvider.addScope('email');
          retryProvider.setCustomParameters({ prompt: 'select_account' });
          res = await auth.signInWithPopup(retryProvider);
        } catch (retryErr) {
          console.warn('[FirebaseAuth] Retry popup notice:', retryErr.code, retryErr.message);
          if (retryErr.code === 'auth/popup-closed-by-user') {
            throw new Error('Sign-in cancelled. You closed the Google popup window.');
          }
          if (retryErr.code === 'auth/cancelled-popup-request') {
            return null;
          }
          if (!isElectron && (
            retryErr.code === 'auth/popup-blocked' ||
            retryErr.code === 'auth/operation-not-supported-in-this-environment'
          )) {
            try {
              const fallbackProvider = new firebase.auth.GoogleAuthProvider();
              fallbackProvider.addScope('profile');
              fallbackProvider.addScope('email');
              await auth.signInWithRedirect(fallbackProvider);
              return null;
            } catch (rErr) {
              console.warn('[FirebaseAuth] Fallback redirect notice:', rErr.message);
            }
          }
          throw new Error('Google Sign-In was interrupted. Please click to try again, or continue with Guest mode.');
        }
      } else {
        throw popupErr;
      }
    }

    if (!res || !res.user) {
      if (auth.currentUser && auth.currentUser.uid && !auth.currentUser.isAnonymous) {
        const u = auth.currentUser;
        const user = {
          id: u.uid,
          uid: u.uid,
          name: u.displayName || 'Google Listener',
          email: u.email,
          avatar: u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.displayName || 'User')}&backgroundColor=8b5cf6`,
          provider: 'google'
        };
        setStoredUser(user);
        return user;
      }
      throw new Error('No user data returned from Google sign-in.');
    }

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
    if (e.code === 'auth/popup-closed-by-user' || (e.message && e.message.includes('closed the Google popup'))) {
      throw new Error('Sign-in cancelled. You closed the Google popup window.');
    }
    if (e.code === 'auth/cancelled-popup-request') {
      return null;
    }
    if (e.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups for this site.');
    }
    if (e.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google Sign-In in Firebase. Please add this domain to Firebase Console.');
    }
    if (e.code === 'auth/network-request-failed') {
      throw new Error('Network error connecting to Google. Please check your internet connection.');
    }
    if (e.code === 'auth/internal-error' || (e.message && e.message.includes('auth/internal-error'))) {
      throw new Error('Google Sign-In was interrupted. Please click to try again, or continue with Guest mode.');
    }
    console.error('[FirebaseAuth] Google sign-in error:', e.code, e.message);
    throw new Error(e.message || 'Google sign-in failed. Please try again.');
  } finally {
    isGoogleAuthInProgress = false;
  }
}

// 3b. Phone Number Authentication (Firebase SMS OTP)
export function setupRecaptcha(containerId = 'recaptcha-container', isNormal = false) {
  const { app, auth } = initFirebase();
  if (!auth) throw new Error('Firebase is not initialized. Please check your configuration.');

  // If already rendered, clear old verifier
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {}
    window.recaptchaVerifier = null;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[FirebaseAuth] Recaptcha container #${containerId} not found, will attach dynamically.`);
  }

  if (auth && auth.useDeviceLanguage) {
    try { auth.useDeviceLanguage(); } catch (e) {}
  }

  const targetApp = app || (firebase.apps && firebase.apps.length ? firebase.app() : null);

  // Note: 3rd parameter must be firebase.app.App, NOT auth instance!
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(containerId, {
    size: isNormal ? 'normal' : 'invisible',
    callback: () => {
      console.log('[FirebaseAuth] reCAPTCHA verified successfully.');
    },
    'expired-callback': () => {
      console.warn('[FirebaseAuth] reCAPTCHA expired.');
      if (window.showToast) window.showToast('reCAPTCHA expired. Please try again.', 'warning', 3000);
    }
  }, targetApp || undefined);

  return window.recaptchaVerifier;
}

export async function sendPhoneOtp(phoneNumber, containerId = 'recaptcha-container') {
  if (!phoneNumber || phoneNumber.trim().length < 8) {
    throw new Error('Please enter a valid mobile number with country code (e.g. +91 9876543210).');
  }

  // Format to E.164: remove all spaces, dashes, brackets
  let cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '').trim();
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone;
  }

  const { auth } = initFirebase();
  if (!auth) throw new Error('Firebase is not initialized.');

  // Ensure any lingering anonymous session is cleanly cleared if needed
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    try { await auth.signOut(); } catch (_) {}
  }

  const appVerifier = setupRecaptcha(containerId);

  try {
    const confirmationResult = await auth.signInWithPhoneNumber(cleanPhone, appVerifier);
    window.confirmationResult = confirmationResult;
    return { success: true, phoneNumber: cleanPhone };
  } catch (err) {
    console.error('[FirebaseAuth] sendPhoneOtp error:', err);
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    const errMsg = err.message || '';
    if (errMsg.includes('BILLING_NOT_ENABLED') || err.code === 'auth/billing-not-enabled') {
      throw new Error('Firebase requires Blaze plan (Pay-As-You-Go) for real SMS, or add this number under "Phone numbers for testing" in Firebase Console (Authentication > Sign-in method > Phone).');
    } else if (err.code === 'auth/invalid-phone-number') {
      throw new Error('The phone number is not valid. Please verify the country code and number.');
    } else if (err.code === 'auth/quota-exceeded') {
      throw new Error('SMS verification quota exceeded for today. Please use Google Sign-In or try again later.');
    } else if (err.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait a few minutes before trying again.');
    } else if (err.code === 'auth/operation-not-allowed') {
      throw new Error('Phone sign-in is not enabled in Firebase Authentication console.');
    } else if (err.code === 'auth/captcha-check-failed') {
      throw new Error('reCAPTCHA security check failed. Please refresh and try again.');
    }
    throw new Error(err.message || 'Failed to send SMS code. Please try again.');
  }
}

export async function verifyPhoneOtp(verificationCode) {
  if (!verificationCode || verificationCode.trim().length < 4) {
    throw new Error('Please enter the 6-digit code received via SMS.');
  }

  if (!window.confirmationResult) {
    throw new Error('No active verification request found. Please request an SMS code first.');
  }

  const cleanCode = verificationCode.replace(/[\s\-]/g, '').trim();

  try {
    const result = await window.confirmationResult.confirm(cleanCode);
    const firebaseUser = result.user;

    const formattedPhone = firebaseUser.phoneNumber || 'Mobile User';
    const displayName = firebaseUser.displayName || `Listener (${formattedPhone})`;
    const user = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      name: displayName,
      email: firebaseUser.email || `${firebaseUser.phoneNumber || firebaseUser.uid}@pulse.app`,
      phoneNumber: firebaseUser.phoneNumber || '',
      avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedPhone)}&backgroundColor=10b981`,
      provider: 'phone'
    };

    setStoredUser(user);
    setGateUnlocked(true);

    const { db } = initFirebase();
    if (db) {
      try {
        await db.collection('users').doc(firebaseUser.uid).set({
          uid: firebaseUser.uid,
          name: user.name,
          phoneNumber: user.phoneNumber,
          provider: 'phone',
          lastLoginAt: Date.now()
        }, { merge: true });
      } catch (e) {}
    }

    return user;
  } catch (err) {
    console.error('[FirebaseAuth] verifyPhoneOtp error:', err);
    if (err.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid code entered. Please check your SMS and try again.');
    } else if (err.code === 'auth/code-expired') {
      throw new Error('The SMS code has expired. Please request a new verification code.');
    }
    throw new Error(err.message || 'Verification failed. Please try again.');
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

const GATE_UNLOCKED_KEY = 'pulse_gate_unlocked';
const PRIVACY_SETTINGS_KEY = 'pulse_privacy_settings';

export function isGateUnlocked() {
  // Allow by default: never block listeners with gate permission screens
  return true;
}

export function setGateUnlocked(unlocked = true) {
  try {
    localStorage.setItem(GATE_UNLOCKED_KEY, 'true');
  } catch (e) {}
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

  // Allow auth state observers and persistence to settle cleanly
  await new Promise(r => setTimeout(r, 100));

  setStoredUser(null);
  return getStoredUser();
}

// 6. User Profile Update
export async function updateUserProfile(updates = {}) {
  const current = getStoredUser();
  const updatedUser = {
    ...current,
    ...updates,
    updatedAt: Date.now()
  };
  setStoredUser(updatedUser);

  const { auth, db } = initFirebase();
  if (auth && auth.currentUser && updates.name && auth.currentUser.updateProfile) {
    try {
      await auth.currentUser.updateProfile({
        displayName: updates.name,
        photoURL: updates.avatar || auth.currentUser.photoURL
      });
    } catch (e) {
      console.warn('[FirebaseAuth] Profile update error:', e.message);
    }
  }

  if (db && updatedUser.uid && updatedUser.provider !== 'anonymous') {
    try {
      await db.collection('users').doc(updatedUser.uid).set({
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        preferredLanguage: updatedUser.preferredLanguage || 'Global',
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Profile sync warning:', err.message);
    }
  }

  return updatedUser;
}

// 7. Privacy Settings Management
export function getPrivacySettings() {
  const defaults = {
    privateSession: false,
    cloudHistorySync: true,
    publicPlaylists: true,
    audioQuality: '320kbps',
    autoScrollLyrics: true,
    gaplessPlayback: true,
    eqPreset: 'balanced'
  };

  try {
    const raw = localStorage.getItem(PRIVACY_SETTINGS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch (e) {}
  return defaults;
}

export async function updatePrivacySettings(newSettings = {}) {
  const current = getPrivacySettings();
  const merged = { ...current, ...newSettings };
  try {
    localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(merged));
  } catch (e) {}

  const user = getStoredUser();
  const { db } = initFirebase();
  if (db && user && user.provider !== 'anonymous' && user.uid) {
    try {
      await db.collection('users').doc(user.uid).set({
        privacySettings: merged
      }, { merge: true });
    } catch (e) {}
  }

  return merged;
}

// 8. User Data Export (GDPR / Privacy Compliance)
export function exportUserData() {
  const user = getStoredUser();
  const privacy = getPrivacySettings();
  let favorites = [];
  let playlists = [];
  let history = [];

  if (window.PulseFirestore) {
    favorites = window.PulseFirestore.getFavorites ? window.PulseFirestore.getFavorites() : [];
    playlists = window.PulseFirestore.getPlaylists ? window.PulseFirestore.getPlaylists() : [];
    history = window.PulseFirestore.getHistory ? window.PulseFirestore.getHistory() : [];
  }

  const exportPayload = {
    app: 'Pulse Music',
    version: '2.5.0',
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id || user.uid,
      name: user.name,
      email: user.email,
      provider: user.provider,
      avatar: user.avatar
    },
    privacySettings: privacy,
    statistics: {
      totalFavorites: favorites.length,
      totalPlaylists: playlists.length,
      totalHistoryItems: history.length
    },
    favorites,
    playlists,
    history
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `pulse_music_backup_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  return exportPayload;
}

// 9. Cache Cleaner
export async function clearUserCache() {
  let clearedCount = 0;
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      for (const k of keys) {
        if (k.includes('pulse') || k.includes('audio') || k.includes('track')) {
          await caches.delete(k);
          clearedCount++;
        }
      }
    } catch (e) {}
  }

  // Clear non-critical local caches
  const preserveKeys = new Set([
    STORAGE_KEY,
    GATE_UNLOCKED_KEY,
    PRIVACY_SETTINGS_KEY,
    'pulse_favorites_data_' + (getStoredUser()?.uid || ''),
    'pulse_playlists_data_' + (getStoredUser()?.uid || '')
  ]);

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !preserveKeys.has(key) && (key.startsWith('pulse_cache_') || key.startsWith('pulse_temp_'))) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {}

  return { clearedCaches: clearedCount, success: true };
}

// Native Firebase Auth state observer to sync cross-tab and session persistence
export function setupNativeAuthSync() {
  const { auth, db } = initFirebase();
  if (auth && auth.getRedirectResult) {
    auth.getRedirectResult().then((res) => {
      if (res && res.user) {
        console.log('[FirebaseAuth] Recovered Google user from redirect:', res.user.displayName);
        const isGoogle = res.user.providerData?.some(p => p.providerId === 'google.com');
        const user = {
          id: res.user.uid,
          uid: res.user.uid,
          name: res.user.displayName || (isGoogle ? 'Google Listener' : 'Listener'),
          email: res.user.email || 'user@pulse.app',
          avatar: res.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(res.user.displayName || res.user.email || 'User')}&backgroundColor=8b5cf6`,
          provider: isGoogle ? 'google' : (res.user.isAnonymous ? 'anonymous' : 'email')
        };
        setStoredUser(user);
        setGateUnlocked(true);
      }
    }).catch((err) => {
      if (err.code !== 'auth/null-user') {
        console.warn('[FirebaseAuth] Redirect sign-in result notice:', err.message);
      }
    });
  }

  if (auth && auth.onAuthStateChanged) {
    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setGateUnlocked(true);
        const isGoogle = firebaseUser.providerData?.some(p => p.providerId === 'google.com');
        const isPhone = firebaseUser.providerData?.some(p => p.providerId === 'phone') || !!firebaseUser.phoneNumber;
        const provider = isGoogle ? 'google' : (isPhone ? 'phone' : (firebaseUser.isAnonymous ? 'anonymous' : 'email'));
        const formattedPhone = firebaseUser.phoneNumber || 'Mobile User';
        const displayName = firebaseUser.displayName || (isPhone ? `Listener (${formattedPhone})` : (isGoogle ? 'Google Listener' : 'Listener'));
        const email = firebaseUser.email || (firebaseUser.phoneNumber ? `${firebaseUser.phoneNumber}@pulse.app` : 'user@pulse.app');
        const user = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: displayName,
          email: email,
          phoneNumber: firebaseUser.phoneNumber || '',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=${isPhone ? '10b981' : '8b5cf6'}`,
          provider: provider
        };
        setStoredUser(user);

        // Sync user profile to Firestore
        if (db && !firebaseUser.isAnonymous) {
          try {
            await db.collection('users').doc(firebaseUser.uid).set({
              uid: firebaseUser.uid,
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber,
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
  isGateUnlocked,
  setGateUnlocked,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  sendPhoneOtp,
  verifyPhoneOtp,
  setupRecaptcha,
  signInAnonymously,
  signOut,
  updateUserProfile,
  getPrivacySettings,
  updatePrivacySettings,
  exportUserData,
  clearUserCache,
  onAuthStateChanged,
  setupNativeAuthSync
};

if (typeof window !== 'undefined') {
  window.firebaseAuthService = authService;
  window.PulseAuth = authService;
}

export default authService;
