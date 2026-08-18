import fs from 'fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = fs.readFileSync('docs/index.html', 'utf-8');
const jsCode = fs.readFileSync('docs/assets/pulse.js', 'utf-8');

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (err) => { console.error("[BROWSER ERROR]:", err); });
virtualConsole.on("warn", (warn) => { console.warn("[BROWSER WARN]:", warn); });
virtualConsole.on("log", (log) => { console.log("[BROWSER LOG]:", log); });

const dom = new JSDOM(html, {
  url: "http://localhost:3000/",
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
});

const window = dom.window;
const document = window.document;

// Mock Audio
window.Audio = class {
  constructor() {
    this.src = '';
    this.currentTime = 0;
    this.duration = 210;
    this.volume = 1;
    this.paused = true;
  }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
  addEventListener() {}
  removeEventListener() {}
  load() {}
};

// Mock AudioContext
window.AudioContext = class {
  createAnalyser() { return { fftSize: 2048, frequencyBinCount: 1024, getByteFrequencyData: () => {} }; }
  createMediaElementSource() { return { connect: () => {} }; }
};
window.webkitAudioContext = window.AudioContext;

// Mock MediaSession
window.navigator.mediaSession = {
  setActionHandler: () => {},
  playbackState: 'none',
  metadata: null
};

// Mock Firebase & Supabase
window.firebase = {
  apps: [],
  initializeApp: () => ({}),
  app: () => ({}),
  auth: () => ({
    signInWithEmailAndPassword: () => Promise.resolve({ user: { uid: '123', email: 'test@test.com' } }),
    createUserWithEmailAndPassword: () => Promise.resolve({ user: { uid: '123', email: 'test@test.com' } }),
    signInWithPopup: () => Promise.resolve({ user: { uid: '123', email: 'test@test.com' } }),
    onAuthStateChanged: () => {},
    signOut: () => Promise.resolve()
  })
};
window.firebase.auth.GoogleAuthProvider = class {};
window.firebase.auth.RecaptchaVerifier = class {};

console.log("\n[TEST 1] Executing pulse.js in simulated browser environment...");

try {
  const scriptEl = document.createElement('script');
  scriptEl.textContent = jsCode;
  document.body.appendChild(scriptEl);
  console.log("[SUCCESS] pulse.js loaded without top-level syntax/execution errors!");
} catch (e) {
  console.error("[CRITICAL ERROR on pulse.js load]:", e);
}

// Trigger DOMContentLoaded
const domEvent = new window.Event('DOMContentLoaded');
window.dispatchEvent(domEvent);

console.log("\n[TEST 2] Testing window.playSpecificTrack('rec-1')...");
try {
  if (typeof window.playSpecificTrack === 'function') {
    window.playSpecificTrack('rec-1');
    console.log("[SUCCESS] window.playSpecificTrack('rec-1') executed successfully!");
  } else {
    console.error("[ERROR] window.playSpecificTrack is NOT defined on window!");
  }
} catch (e) {
  console.error("[CRITICAL ERROR on playSpecificTrack]:", e);
}

console.log("\n[TEST 3] Testing window.openLoginModal()...");
try {
  if (typeof window.openLoginModal === 'function') {
    window.openLoginModal();
    const modal = document.getElementById('auth-modal');
    console.log("[SUCCESS] openLoginModal executed. Modal has class hidden?", modal ? modal.classList.contains('hidden') : 'Modal element not found');
  } else {
    console.error("[ERROR] window.openLoginModal is NOT defined on window!");
  }
} catch (e) {
  console.error("[CRITICAL ERROR on openLoginModal]:", e);
}

console.log("\n[TEST 4] Testing clicking first song card in DOM...");
try {
  const card = document.querySelector('.music-card');
  if (card) {
    console.log("Found card with onclick attribute:", card.getAttribute('onclick'));
    card.click();
    console.log("[SUCCESS] Card click handled without errors!");
  } else {
    console.error("[ERROR] No .music-card found in DOM!");
  }
} catch (e) {
  console.error("[CRITICAL ERROR on card.click()]:", e);
}
