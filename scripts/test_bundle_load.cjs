// Minimal test to see if the main.js IIFE runs without throwing
const fs = require('fs');

// Mock DOM
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (t) => ({ style: {}, className: '', innerHTML: '', appendChild: () => {}, setAttribute: () => {} }),
  body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } },
  readyState: 'complete',
  addEventListener: () => {},
  fullscreenElement: null,
  exitFullscreen: () => {},
  documentElement: { requestFullscreen: () => Promise.resolve() },
  activeElement: null,
  head: { appendChild: () => {} }
};

global.window = global;
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.navigator = { 
  userAgent: 'test', 
  platform: 'Win32', 
  mediaSession: {},
  serviceWorker: null,
  maxTouchPoints: 0
};
global.Audio = function() { 
  return { 
    id: '', preload: '', src: '', load: () => {}, play: () => Promise.resolve(), 
    pause: () => {}, addEventListener: () => {}, removeAttribute: () => {},
    currentTime: 0, duration: 0, volume: 1, muted: false,
    setAttribute: () => {}, style: {},
    error: null, seeking: false
  }; 
};
global.MediaMetadata = function() {};
global.fetch = () => Promise.resolve({ ok: false });
global.AbortSignal = { timeout: () => ({}) };
global.AbortController = function() { return { signal: {}, abort: () => {} }; };
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);
global.setTimeout = global.setTimeout;
global.clearTimeout = global.clearTimeout;
global.setInterval = global.setInterval;
global.clearInterval = global.clearInterval;
global.atob = (s) => Buffer.from(s, 'base64').toString('binary');
global.btoa = (s) => Buffer.from(s, 'binary').toString('base64');
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
global.Map = Map;
global.Set = Set;
global.URL = require('url').URL;
global.Uint8Array = Uint8Array;
global.Array = Array;
global.Promise = Promise;
global.confirm = () => true;
global.alert = () => {};
global.location = { hostname: 'test' };
global.HTMLElement = function() {};
global.google = undefined;
global.matchMedia = () => ({ matches: false, addEventListener: () => {} });
global.ResizeObserver = function() { return { observe: () => {}, disconnect: () => {} }; };
global.IntersectionObserver = function() { return { observe: () => {}, disconnect: () => {} }; };
global.MutationObserver = function() { return { observe: () => {}, disconnect: () => {} }; };

// Try to load the source files in order
try {
  // 1. catalogService
  eval(fs.readFileSync('src/catalogService.js', 'utf8'));
  console.log('[OK] catalogService.js loaded successfully');
  console.log('  catalogService exists:', typeof window.catalogService);
  console.log('  searchCatalog exists:', typeof window.catalogService?.searchCatalog);
} catch(e) {
  console.log('[ERROR] catalogService.js:', e.message);
}

try {
  // 2. audioEngine  
  eval(fs.readFileSync('src/audioEngine.js', 'utf8'));
  console.log('[OK] audioEngine.js loaded successfully');
  console.log('  PulseAudioEngine exists:', typeof window.PulseAudioEngine);
} catch(e) {
  console.log('[ERROR] audioEngine.js:', e.message);
}

try {
  // 3. playbarController
  eval(fs.readFileSync('src/playbarController.js', 'utf8'));
  console.log('[OK] playbarController.js loaded successfully');
  console.log('  playbarController exists:', typeof window.playbarController);
} catch(e) {
  console.log('[ERROR] playbarController.js:', e.message);
}

try {
  // 4. main.js
  eval(fs.readFileSync('src/main.js', 'utf8'));
  console.log('[OK] main.js loaded successfully');
  console.log('  playSpecificTrack exists:', typeof window.playSpecificTrack);
  console.log('  executeSearch exists:', typeof window.executeSearch);
  console.log('  switchView exists:', typeof window.switchView);
  console.log('  showToast exists:', typeof window.showToast);
  console.log('  TRACKS_REGISTRY keys:', Object.keys(window.TRACKS_REGISTRY || {}).length);
} catch(e) {
  console.log('[ERROR] main.js:', e.message);
  console.log('  Stack:', e.stack?.split('\n').slice(0,3).join('\n'));
}
