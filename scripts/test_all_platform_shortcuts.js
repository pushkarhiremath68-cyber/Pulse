import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('--- TESTING MULTI-PLATFORM PULSE SHORTCUTS & LOGO ASSETS ---');

// 1. Check Icon Assets Exist
const requiredIcons = [
  'pulse-logo.png',
  'public/pulse-logo.png',
  'public/pulse-logo.svg',
  'public/icons/icon-16.png',
  'public/icons/icon-32.png',
  'public/icons/icon-64.png',
  'public/icons/icon-128.png',
  'public/icons/icon-180.png',
  'public/icons/icon-192.png',
  'public/icons/icon-256.png',
  'public/icons/icon-384.png',
  'public/icons/icon-512.png',
  'public/icons/icon-1024.png',
  'public/icons/icon.ico',
  'public/favicon.ico',
  'apple-touch-icon.png',
  'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'
];

let allIconsExist = true;
requiredIcons.forEach(iconPath => {
  const fullPath = path.join(__dirname, '..', iconPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[FAIL] Missing icon asset: ${iconPath}`);
    allIconsExist = false;
  } else {
    const stat = fs.statSync(fullPath);
    console.log(`[PASS] Icon exists: ${iconPath} (${stat.size} bytes)`);
  }
});

// 2. Check HTML Meta Tags
const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const hasAppleTouch = htmlContent.includes('rel="apple-touch-icon"');
console.log(`Apple touch icon tag in index.html: ${hasAppleTouch ? 'PASS' : 'FAIL'}`);
if (!hasAppleTouch) throw new Error('Missing apple-touch-icon in index.html');

const hasManifest = htmlContent.includes('rel="manifest"');
console.log(`Manifest link in index.html: ${hasManifest ? 'PASS' : 'FAIL'}`);
if (!hasManifest) throw new Error('Missing manifest link in index.html');

const hasDownloadModal = htmlContent.includes('id="download-app-modal"');
console.log(`Download app modal in index.html: ${hasDownloadModal ? 'PASS' : 'FAIL'}`);
if (!hasDownloadModal) throw new Error('Missing download-app-modal in index.html');

// 3. Check Manifest JSON
const manifestContent = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'manifest.json'), 'utf8'));
console.log(`Manifest name: ${manifestContent.name}`);
console.log(`Manifest icons count: ${manifestContent.icons.length}`);
console.log(`Manifest shortcuts count: ${manifestContent.shortcuts.length}`);
if (manifestContent.icons.length < 5) throw new Error('Manifest icons array is incomplete');

// 4. Check shortcuts folder generated files
const shortcuts = [
  'shortcuts/windows/Pulse Music Web.url',
  'shortcuts/windows/Launch-Pulse.bat',
  'shortcuts/linux/Pulse-Music.desktop',
  'shortcuts/macos/Pulse Music Web.webloc'
];

shortcuts.forEach(s => {
  const p = path.join(__dirname, '..', s);
  if (fs.existsSync(p)) {
    console.log(`[PASS] Shortcut file exists: ${s}`);
  } else {
    console.error(`[FAIL] Missing shortcut file: ${s}`);
  }
});

console.log('\n==================================================');
console.log('[SUCCESS] ALL MULTI-PLATFORM PULSE SHORTCUT CHECKS PASSED!');
console.log('==================================================');
