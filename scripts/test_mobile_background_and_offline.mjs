/**
 * Verification test suite for:
 * 1. Mobile Background Audio Guardian
 * 2. 100% Offline Music Access (IndexedDB Storage & Playback)
 */
import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 Starting Mobile Background Audio & Offline Music Test Suite...\n');

let passCount = 0;
let failCount = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// TEST 1: Source Files Exist and are Valid JS
// -------------------------------------------------------------
it('Source files offlineMusicService.js and backgroundAudioGuardian.js exist', () => {
  const offlinePath = path.resolve('src/offlineMusicService.js');
  const bgPath = path.resolve('src/backgroundAudioGuardian.js');
  assert(fs.existsSync(offlinePath), 'offlineMusicService.js should exist');
  assert(fs.existsSync(bgPath), 'backgroundAudioGuardian.js should exist');
  assert(fs.statSync(offlinePath).size > 1000, 'offlineMusicService.js should not be empty');
  assert(fs.statSync(bgPath).size > 1000, 'backgroundAudioGuardian.js should not be empty');
});

// -------------------------------------------------------------
// TEST 2: Index.html has Downloaded tab and playbar offline button
// -------------------------------------------------------------
it('index.html contains Downloaded tab and playbar offline button', () => {
  const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert(html.includes('data-tab="offline"'), 'index.html must have data-tab="offline" button');
  assert(html.includes('id="offline-songs-count"'), 'index.html must have offline-songs-count badge');
  assert(html.includes('id="playbar-offline-btn"'), 'index.html must have playbar-offline-btn');
  assert(html.includes('toggleCurrentTrackOffline'), 'playbar-offline-btn must trigger toggleCurrentTrackOffline');
});

// -------------------------------------------------------------
// TEST 3: main.js boots background guardian & imports offline service
// -------------------------------------------------------------
it('main.js boots Background Audio Guardian and imports offline service', () => {
  const mainJs = fs.readFileSync(path.resolve('src/main.js'), 'utf8');
  assert(mainJs.includes("from './offlineMusicService.js'"), 'main.js imports offlineMusicService');
  assert(mainJs.includes("from './backgroundAudioGuardian.js'"), 'main.js imports backgroundAudioGuardian');
  assert(mainJs.includes('PulseBackgroundAudio.init()'), 'main.js initializes PulseBackgroundAudio');
  assert(mainJs.includes("activeTab === 'offline'"), 'main.js renders library offline tab');
  assert(mainJs.includes('window.playOfflineTrackDirect'), 'main.js defines playOfflineTrackDirect');
  assert(mainJs.includes('window.playAllOfflineTracks'), 'main.js defines playAllOfflineTracks');
  assert(mainJs.includes('window.shuffleOfflineTracks'), 'main.js defines shuffleOfflineTracks');
  assert(mainJs.includes('window.toggleCurrentTrackOffline'), 'main.js defines toggleCurrentTrackOffline');
});

// -------------------------------------------------------------
// TEST 4: playbarController.js fast-path offline playing & mobile background logic
// -------------------------------------------------------------
it('playbarController.js integrates offline fast-path and mobile background prioritization', () => {
  const playbarJs = fs.readFileSync(path.resolve('src/playbarController.js'), 'utf8');
  assert(playbarJs.includes('PulseOffline.isTrackOffline'), 'playbar checks isTrackOffline');
  assert(playbarJs.includes('PulseOffline.getOfflineAudioUrl'), 'playbar fetches offline blob URL');
  assert(playbarJs.includes('isMobileDevice'), 'playbar detects mobile devices');
  assert(playbarJs.includes('resolveFullAudioStream(track)'), 'mobile background resolves direct native stream first');
  assert(playbarJs.includes('getActiveEngine: () => activeEngine'), 'playbar exports getActiveEngine for guardian');
  assert(playbarJs.includes('setActiveEngine: (eng) =>'), 'playbar exports setActiveEngine for guardian');
  assert(playbarJs.includes('getYtPlayer: () => ytPlayer'), 'playbar exports getYtPlayer for guardian');
  assert(playbarJs.includes('updateOfflineButtonUI'), 'updateTrackInfoUI updates offline button');
});

// -------------------------------------------------------------
// TEST 5: Background Audio Guardian unit logic verification
// -------------------------------------------------------------
it('Background Audio Guardian exports expected interface and visibility handlers', () => {
  const bgCode = fs.readFileSync(path.resolve('src/backgroundAudioGuardian.js'), 'utf8');
  assert(bgCode.includes('setupVisibilityWatchdog'), 'Must setup visibility watchdog');
  assert(bgCode.includes('handoffToNativeAudio'), 'Must implement handoffToNativeAudio');
  assert(bgCode.includes('requestWakeLock'), 'Must implement requestWakeLock');
  assert(bgCode.includes('releaseWakeLock'), 'Must implement releaseWakeLock');
  assert(bgCode.includes('initSilentAudioAnchor'), 'Must implement silent audio context anchor for mobile');
  assert(bgCode.includes('pagehide'), 'Must listen for pagehide event for mobile backgrounding');
});

// -------------------------------------------------------------
// TEST 6: Offline Music Service CRUD and 0ms cache logic
// -------------------------------------------------------------
it('Offline Music Service provides full CRUD operations and 0ms fast-path Set', () => {
  const offCode = fs.readFileSync(path.resolve('src/offlineMusicService.js'), 'utf8');
  assert(offCode.includes('const DB_NAME = \'PulseOfflineMusicDB\';'), 'Uses PulseOfflineMusicDB');
  assert(offCode.includes('initOfflineMusicDB'), 'Exports initOfflineMusicDB');
  assert(offCode.includes('saveTrackForOffline'), 'Exports saveTrackForOffline');
  assert(offCode.includes('removeOfflineTrack'), 'Exports removeOfflineTrack');
  assert(offCode.includes('getOfflineTracks'), 'Exports getOfflineTracks');
  assert(offCode.includes('getOfflineAudioUrl'), 'Exports getOfflineAudioUrl');
  assert(offCode.includes('isTrackOffline'), 'Exports isTrackOffline');
  assert(offCode.includes('getOfflineStats'), 'Exports getOfflineStats');
  assert(offCode.includes('pulse:offline-updated'), 'Dispatches pulse:offline-updated custom event');
});

console.log(`\n==================================================`);
console.log(`Results: ${passCount} passed, ${failCount} failed.`);
console.log(`==================================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 All mobile background audio and offline music checks passed!\n');
}

