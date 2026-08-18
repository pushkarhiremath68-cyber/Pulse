/**
 * Pulse Music - Firebase Authentication & Cloud Engine
 * Uses window.firebase CDN for zero-build universal browser compatibility
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
let recaptchaVerifier = null;
let phoneConfirmationResult = null;

export function getFirebase() {
  if (typeof window === 'undefined' || !window.firebase) {
    return { app: null, auth: null, db: null };
  }
  if (!firebaseApp) {
    try {
      if (!window.firebase.apps.length) {
        firebaseApp = window.firebase.initializeApp(firebaseConfig);
      } else {
        firebaseApp = window.firebase.app();
      }
      firebaseAuth = window.firebase.auth();
      firestoreDb = window.firebase.firestore ? window.firebase.firestore() : null;
    } catch (e) {
      console.warn('[Pulse Firebase Init Notice]:', e);
    }
  }
  return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
}

export async function loginWithEmail(email, password) {
  const { auth } = getFirebase();
  if (!auth) throw new Error('Firebase Authentication is initializing.');
  const res = await auth.signInWithEmailAndPassword(email.trim(), password);
  const user = res.user;
  return {
    id: user.uid,
    name: user.displayName || user.email.split('@')[0],
    email: user.email,
    avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=8b5cf6`,
    provider: 'email',
    token: await user.getIdToken()
  };
}

export async function registerWithEmail(name, email, password) {
  const { auth } = getFirebase();
  if (!auth) throw new Error('Firebase Authentication is initializing.');
  const res = await auth.createUserWithEmailAndPassword(email.trim(), password);
  const user = res.user;
  const displayName = name ? name.trim() : email.split('@')[0];
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=8b5cf6`;
  
  if (user.updateProfile) {
    await user.updateProfile({ displayName, photoURL: avatarUrl }).catch(() => {});
  }

  return {
    id: user.uid,
    name: displayName,
    email: user.email,
    avatar: avatarUrl,
    provider: 'email',
    token: await user.getIdToken()
  };
}

export async function sendPhoneOtp(fullPhoneNumber, containerId = 'recaptcha-container') {
  const { auth } = getFirebase();
  if (!auth) throw new Error('Firebase Auth unavailable.');
  
  const cleanPhone = (fullPhoneNumber || '').replace(/[\s-]/g, '').trim();
  if (!cleanPhone || !/^\+[1-9]\d{6,14}$/.test(cleanPhone)) {
    throw new Error('Please enter a valid international phone number with country code (e.g. +91 98765 43210).');
  }

  if (!recaptchaVerifier) {
    recaptchaVerifier = new window.firebase.auth.RecaptchaVerifier(containerId, {
      size: 'invisible',
      callback: () => console.log('[Pulse Phone Auth] Recaptcha verified')
    });
  }

  phoneConfirmationResult = await auth.signInWithPhoneNumber(cleanPhone, recaptchaVerifier);
  window.phoneConfirmationResult = phoneConfirmationResult;
  return { success: true, phoneNumber: cleanPhone };
}

export async function verifyPhoneOtp(otpCode) {
  const cleanCode = (otpCode || '').replace(/\s+/g, '').trim();
  const confirmation = phoneConfirmationResult || window.phoneConfirmationResult;
  if (!confirmation) throw new Error('No active verification session found.');
  
  const res = await confirmation.confirm(cleanCode);
  const user = res.user;
  const phone = user.phoneNumber || 'Phone User';
  const name = user.displayName || `Listener ${phone.slice(-4)}`;

  return {
    id: user.uid,
    name: name,
    email: user.email || `${phone.replace('+', '')}@phone.pulse`,
    phone: phone,
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(phone)}&backgroundColor=10b981`,
    provider: 'phone',
    token: await user.getIdToken()
  };
}

export async function signInWithGoogle() {
  const { auth } = getFirebase();
  if (!auth) throw new Error('Firebase Auth unavailable.');
  const provider = new window.firebase.auth.GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  const res = await auth.signInWithPopup(provider);
  const user = res.user;
  return {
    id: user.uid,
    name: user.displayName || 'Google Listener',
    email: user.email,
    avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=8b5cf6`,
    provider: 'google',
    token: await user.getIdToken()
  };
}

export function listenAuthState(callback) {
  const { auth } = getFirebase();
  if (!auth) return;
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      callback({
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || `Listener ${user.phoneNumber?.slice(-4) || ''}`,
        email: user.email || (user.phoneNumber ? `${user.phoneNumber.replace('+', '')}@phone.pulse` : ''),
        phone: user.phoneNumber || null,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=8b5cf6`,
        provider: user.providerData && user.providerData[0] ? user.providerData[0].providerId : 'firebase',
        token: await user.getIdToken().catch(() => '')
      });
    } else {
      callback(null);
    }
  });
}

export async function signOutFirebase() {
  const { auth } = getFirebase();
  if (auth) await auth.signOut().catch(() => {});
}

if (typeof window !== 'undefined') {
  window.PulseFirebase = {
    getFirebase,
    loginWithEmail,
    registerWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    signInWithGoogle,
    listenAuthState,
    signOutFirebase
  };
}
