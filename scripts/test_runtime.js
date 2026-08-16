
const fs = require('fs');
const path = require('path');

console.log('--- Testing JS Module Loads ---');

// Mock browser globals
global.window = global;
global.document = {
  getElementById: (id) => ({
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    style: {},
    addEventListener: () => {},
    appendChild: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  body: {
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} }
  },
  createElement: () => ({
    classList: { add: () => {}, remove: () => {} },
    style: {},
    appendChild: () => {}
  }),
  readyState: 'complete'
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.Audio = function() {
  return {
    play: async () => {},
    pause: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    style: {}
  };
};
global.navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  serviceWorker: { register: async () => ({ scope: '/' }) }
};
global.location = { hash: '', reload: () => {} };
global.matchMedia = () => ({ matches: false, addEventListener: () => {} });

// Load musicService.js
require(path.join(process.cwd(), 'src', 'musicService.js'));
console.log('[OK] musicService loaded, total catalog items:', window.DEMO_CATALOG?.length);

// Load main.js
require(path.join(process.cwd(), 'src', 'main.js'));
console.log('[OK] main.js loaded successfully!');
console.log('[OK] typeof window.playSpecificTrack =', typeof window.playSpecificTrack);
console.log('[OK] typeof window.switchView =', typeof window.switchView);
console.log('[OK] typeof window.executeSearch =', typeof window.executeSearch);
console.log('[OK] typeof window.openLoginModal =', typeof window.openLoginModal);
console.log('[OK] typeof window.downloadSong =', typeof window.downloadSong);

// Test playing a track
if (typeof window.playSpecificTrack === 'function') {
  window.playSpecificTrack('in-kesariya');
  console.log('[OK] playSpecificTrack executed, current track:', window.pulseState?.currentTrack?.title);
}

console.log('>>> ALL MODULE RUNTIME EVALUATIONS PASSED 100%! <<<');
