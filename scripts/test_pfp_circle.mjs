import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('src/style.css', 'utf8');
const js = fs.readFileSync('src/main.js', 'utf8');
const sw = fs.readFileSync('public/sw.js', 'utf8');

console.log('🧪 Testing Circular PFP & Customizer...');

if (!html.includes('id="header-auth-btn"')) throw new Error('Header auth button must exist');
if (!html.includes('id="header-user-pfp"') || !html.includes('referrerpolicy="no-referrer"')) {
  throw new Error('Header user PFP must have referrerpolicy="no-referrer"');
}
if (!html.includes('id="pfp-customizer-modal"')) throw new Error('PFP Customizer modal must exist');
if (!html.includes('id="pfp-camera-input"') || !html.includes('capture="user"')) {
  throw new Error('Camera input with capture="user" must exist');
}
if (!html.includes('id="pfp-gallery-input"')) throw new Error('Gallery input must exist');

const normCss = css.replace(/\r\n/g, '\n');
if (!normCss.includes('.header-pfp-img.hidden,\n.header-pfp-fallback.hidden {\n  display: none !important;')) {
  throw new Error('Hidden pfp elements must be display: none !important');
}
if (!sw.includes('pulse-music-v5.0.9')) throw new Error('SW version must be v5.0.9');

// Preset Avatars assertions
if (!html.includes('class="preset-avatar-btn"') || !html.includes('window.selectPresetAvatar')) {
  throw new Error('Preset avatar buttons and selectPresetAvatar must exist in HTML');
}
if (!js.includes('window.selectPresetAvatar = function')) {
  throw new Error('window.selectPresetAvatar must be implemented in main.js');
}
if (!fs.existsSync('public/avatars/avatar-dj.svg')) {
  throw new Error('public/avatars/avatar-dj.svg must exist');
}

// Live Webcam Viewfinder assertions
if (!html.includes('id="pfp-modal-live-video"')) throw new Error('Live camera video element must exist');
if (!js.includes('getUserMedia') || !js.includes('capturePfpPhoto')) {
  throw new Error('Live camera getUserMedia & capturePhoto must be implemented');
}

// Video preview embed and 15s duration assertions
if (js.includes('&playlist=${slide.videoYtId}')) {
  throw new Error('Hero preview iframe must NOT contain playlist param to avoid playlist controls');
}
if (!js.includes('HERO_SLIDE_DURATION_MS = 15000')) {
  throw new Error('Hero slide duration must be 15000ms');
}
if (!css.includes('heroPillFill 15s')) {
  throw new Error('Hero pill progress animation must be 15s');
}

// Playbar idle assertions
const playbarJs = fs.readFileSync('src/playbarController.js', 'utf8');
if (!playbarJs.includes('resetPlaybarToEmpty')) {
  throw new Error('playbarController must export resetPlaybarToEmpty');
}
if (html.includes('<span id="player-title" class="player-title song-title">Blinding Lights</span>')) {
  throw new Error('Initial playbar must not hardcode Blinding Lights');
}

console.log('✅ ALL CIRCULAR PFP & PLAYER IDLE TESTS PASSED 100%!');
