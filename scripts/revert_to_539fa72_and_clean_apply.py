import subprocess, os, re, shutil

print("[1/5] Restoring clean base from commit 539fa72...")
# Restore files from 539fa72
for fp in ['index.html', 'src/main.js', 'src/style.css', 'src/playbarController.js', 'src/catalogService.js', 'src/musicService.js', 'src/lyricsService.js', 'src/firebaseClient.js']:
    res = subprocess.run(["git", "show", f"539fa72:{fp}"], capture_output=True, text=True, errors='ignore')
    if res.returncode == 0:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(res.stdout)
        print(f"  Restored {fp}")

# 2. In index.html:
# A) Remove Video Button in fullscreen header
# B) Remove Gemini AI DJ from sidebar, hero, quick hub, lyrics drawer, fs header, and mobile nav
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove video button
html = re.sub(r'<button id="toggle-video-modal-btn"[^>]*>[\s\S]*?</button>\s*', '', html)

# Remove gemini nav item
html = re.sub(r'<a href="#" class="nav-item nav-item-gemini" id="nav-gemini-dj"[\s\S]*?</a>\s*', '', html)

# Remove hero gemini button
html = re.sub(r'<button id="hero-like-btn" class="btn-secondary-outline" onclick="window\.openGeminiDjModal\(\)">[\s\S]*?</button>\s*', '', html)
html = html.replace('with Gemini AI DJ, synchronized lyrics,', 'with synchronized lyrics, high-definition audio,')

# Remove Quick Discovery Hub Gemini card
html = re.sub(r'<div class="feature-action-card" onclick="window\.openGeminiDjModal\(\)"[\s\S]*?Launch AI DJ <i class="fa-solid fa-arrow-right"></i></span>\s*</div>\s*', '', html)

# Remove fs header gemini button
html = re.sub(r'<button id="fs-btn-gemini"[\s\S]*?</button>\s*', '', html)

# Remove side drawer gemini insight bar
html = re.sub(r'<div class="lyrics-gemini-bar"[\s\S]*?</div>\s*<div id="gemini-song-insight-box"[\s\S]*?</div>\s*', '', html)

# Remove gemini modal
html = re.sub(r'<!-- GEMINI AI DJ STUDIO MODAL -->[\s\S]*?<!-- AUTHENTIC GOOGLE OAUTH', '<!-- AUTHENTIC GOOGLE OAUTH', html)

# Remove mobile nav gemini
html = re.sub(r'<button class="mobile-nav-item" id="mobile-nav-gemini"[\s\S]*?</button>\s*', '', html)

# Remove gemini script tag from head
html = re.sub(r'<script type="module" src="\./src/geminiService\.js"></script>\s*', '', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[2/5] Cleaned index.html (Removed video button & Gemini AI DJ)")

# 3. In src/firebaseClient.js, ensure Email/Pass, Phone SMS (Recaptcha), Google, onAuthStateChanged work via window.firebase CDN
firebase_client_code = """/**
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
  if (!cleanPhone || !/^\\+[1-9]\\d{6,14}$/.test(cleanPhone)) {
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
  const cleanCode = (otpCode || '').replace(/\\s+/g, '').trim();
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
"""

with open('src/firebaseClient.js', 'w', encoding='utf-8') as f:
    f.write(firebase_client_code)
print("[3/5] Updated src/firebaseClient.js with robust zero-error Firebase CDN client")

# 4. In src/main.js, ensure window.playSpecificTrack and Lyrics drawer are wired cleanly
with open('src/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

# Add playSpecificTrack if not present on window
if 'window.playSpecificTrack' not in main_js:
    play_specific_track_code = """
  window.playSpecificTrack = function(trackId) {
    if (!trackId) return;
    let track = (window.musicService && typeof window.musicService.getTrack === 'function' && window.musicService.getTrack(trackId)) ||
                (window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]);
    if (!track) {
      const card = document.querySelector(`[onclick*="'${trackId}'"]`);
      if (card) {
        const title = card.querySelector('.music-card-title, h4, h5')?.textContent?.trim() || trackId;
        const artist = card.querySelector('.music-card-subtitle, p')?.textContent?.trim() || 'Artist';
        const cover = card.querySelector('img')?.src || './pulse-logo.png';
        track = { id: trackId, title, artist, cover, duration: '3:30', source: 'Pulse Direct' };
      }
    }
    if (track) {
      if (typeof setTrack === 'function') {
        setTrack(track, true);
      } else if (window.playbarController && typeof window.playbarController.playTrack === 'function') {
        window.playbarController.playTrack(track);
      }
    }
  };
"""
    main_js = main_js.replace('function initApp()', play_specific_track_code.strip() + '\n\n  function initApp()')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_js)

print("[4/5] Saved src/main.js")

# 5. Build and sync to docs/
res = subprocess.run(["npm", "run", "build"], capture_output=True, text=True, shell=True)
print(res.stdout)
if os.path.exists('docs'):
    shutil.rmtree('docs')
shutil.copytree('dist', 'docs')
shutil.copytree('src', os.path.join('docs', 'src'), dirs_exist_ok=True)
shutil.copytree('public', os.path.join('docs', 'public'), dirs_exist_ok=True)
with open(os.path.join('docs', '.nojekyll'), 'w') as f: f.write('')
if os.path.exists('pulse-logo.png'): shutil.copy('pulse-logo.png', 'docs/pulse-logo.png')
if os.path.exists('pulse-logo.svg'): shutil.copy('pulse-logo.svg', 'docs/pulse-logo.svg')

print("[5/5] Build complete and synced to docs/")
