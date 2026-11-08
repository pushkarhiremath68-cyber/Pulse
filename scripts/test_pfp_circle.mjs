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
if (!sw.includes('pulse-music-v5.0.2')) throw new Error('SW version must be v5.0.2');

console.log('✅ ALL CIRCULAR PFP TESTS PASSED 100%!');
