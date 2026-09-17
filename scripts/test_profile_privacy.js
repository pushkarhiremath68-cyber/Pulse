import fs from 'fs';

console.log('🧪 Verifying Profile & Privacy Suite and Auth Gate Persistence...');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const mainJs = fs.readFileSync('src/main.js', 'utf8');
const authServiceJs = fs.readFileSync('src/firebaseAuthService.js', 'utf8');
const styleCss = fs.readFileSync('src/style.css', 'utf8');

const checks = [
  // Zero-flicker gate check in index.html head
  { name: 'Head zero-flicker script in index.html', pass: indexHtml.includes('pulse_gate_unlocked') && indexHtml.includes('gate-already-unlocked') },
  { name: 'CSS rule for gate-already-unlocked', pass: styleCss.includes('html.gate-already-unlocked .auth-gate-overlay') },

  // Auth gate persistent check in main.js
  { name: 'isGateUnlocked check in checkAuthGateState', pass: mainJs.includes('isGateUnlocked()') },
  { name: 'setGateUnlocked(true) in handleGateGuestContinue', pass: mainJs.includes('setGateUnlocked(true)') },

  // Profile & Privacy Modal elements in index.html
  { name: 'Profile modal auth-modal container', pass: indexHtml.includes('id="auth-modal"') },
  { name: 'Profile tab buttons (stats, privacy, audio)', pass: indexHtml.includes('tab-btn-stats') && indexHtml.includes('tab-btn-privacy') && indexHtml.includes('tab-btn-audio') },
  { name: 'Live metrics in stats tab', pass: indexHtml.includes('profile-stat-favorites') && indexHtml.includes('profile-stat-playlists') && indexHtml.includes('profile-stat-history') },
  { name: 'Privacy incognito toggle', pass: indexHtml.includes('privacy-incognito-toggle') },
  { name: 'Cloud Firestore sync toggle', pass: indexHtml.includes('privacy-cloud-sync-toggle') },
  { name: 'Clear cache button in privacy tab', pass: indexHtml.includes('window.handleClearCache()') },
  { name: 'Export data button in privacy tab', pass: indexHtml.includes('window.handleExportUserData()') },
  { name: 'Audio quality selector', pass: indexHtml.includes('profile-audio-quality-select') },
  { name: 'Equalizer selector', pass: indexHtml.includes('profile-eq-select') },
  { name: 'Avatar picker drawer', pass: indexHtml.includes('profile-avatar-picker-drawer') },

  // Data methods in firebaseAuthService.js
  { name: 'updateUserProfile in firebaseAuthService', pass: authServiceJs.includes('export async function updateUserProfile') },
  { name: 'getPrivacySettings in firebaseAuthService', pass: authServiceJs.includes('export function getPrivacySettings') },
  { name: 'updatePrivacySettings in firebaseAuthService', pass: authServiceJs.includes('export async function updatePrivacySettings') },
  { name: 'exportUserData in firebaseAuthService', pass: authServiceJs.includes('export function exportUserData') },
  { name: 'clearUserCache in firebaseAuthService', pass: authServiceJs.includes('export async function clearUserCache') },
  { name: 'isGateUnlocked in firebaseAuthService', pass: authServiceJs.includes('export function isGateUnlocked') },
  { name: 'setGateUnlocked in firebaseAuthService', pass: authServiceJs.includes('export function setGateUnlocked') }
];

let failed = 0;
checks.forEach(c => {
  if (c.pass) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    failed++;
  }
});

if (failed === 0) {
  console.log('\n🎉 ALL PROFILE & PRIVACY VERIFICATIONS PASSED!\n');
  process.exit(0);
} else {
  console.error(`\n❌ ${failed} checks failed!\n`);
  process.exit(1);
}
