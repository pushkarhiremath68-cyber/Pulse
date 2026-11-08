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
if (!sw.includes('pulse-music-v5.0.3')) throw new Error('SW version must be v5.0.3');

// Video preview embed assertions
if (js.includes('&playlist=${slide.videoYtId}')) {
  throw new Error('Hero preview iframe must NOT contain playlist param to avoid playlist controls');
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
