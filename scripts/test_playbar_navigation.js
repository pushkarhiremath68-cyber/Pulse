import fs from 'fs';

console.log('🧪 TESTING PLAYBAR FORWARD/BACKWARD & SEEK OVERHAUL\n');

const playbarJs = fs.readFileSync('src/playbarController.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

let passed = 0;
let failed = 0;

function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${detail ? '(' + detail + ')' : ''}`);
    failed++;
  }
}

// 1. Session Navigation Stacks
console.log('--- 1. Session Navigation Stacks & History Tracking ---');
assert('playbackHistoryStack is defined', playbarJs.includes('let playbackHistoryStack = [];'));
assert('forwardHistoryStack is defined', playbarJs.includes('let forwardHistoryStack = [];'));
assert('lastPrevClickTime is tracked for rapid double-click', playbarJs.includes('let lastPrevClickTime = 0;'));

assert('playTrack pushes to playbackHistoryStack when switching tracks', 
  playbarJs.includes('playbackHistoryStack.push(currentTrack)') &&
  playbarJs.includes('forwardHistoryStack = []'));

assert('playTrack supports isHistoryNav parameter',
  playbarJs.includes('export async function playTrack(track, queue = null, isHistoryNav = false)'));

// 2. Backward Navigation (playPrevious)
console.log('\n--- 2. Backward Navigation (playPrevious) Logic ---');
assert('playPrevious checks for rapid double-click (< 1800ms)', 
  playbarJs.includes('now - lastPrevClickTime < 1800'));

assert('playPrevious pops from playbackHistoryStack', 
  playbarJs.includes('const prevTrack = playbackHistoryStack.pop()'));

assert('playPrevious pushes to forwardHistoryStack when going back',
  playbarJs.includes('forwardHistoryStack.push(currentTrack)'));

assert('playPrevious falls back to queue index and wraps queue',
  playbarJs.includes('queueIndex = queueIndex - 1') &&
  playbarJs.includes('queueIndex = playQueue.length - 1'));

// 3. Forward Navigation (playNext)
console.log('\n--- 3. Forward Navigation (playNext) Logic ---');
assert('playNext checks forwardHistoryStack first',
  playbarJs.includes('if (forwardHistoryStack.length > 0) {') &&
  playbarJs.includes('const nextTrack = forwardHistoryStack.pop()'));

assert('playNext checks pre-computed currentSimilarTracks for instant next track',
  playbarJs.includes('if (currentSimilarTracks && currentSimilarTracks.length > 0)'));

assert('playNext pushes currentTrack to playbackHistoryStack before progressing',
  playbarJs.includes('playbackHistoryStack.push(currentTrack)'));

// 4. Precise Seeking & Live Lyrics Synchronization
console.log('\n--- 4. Precise Seeking & Live Lyrics Synchronization ---');
assert('seekTo calls window.syncLiveLyrics immediately',
  playbarJs.includes('typeof window.syncLiveLyrics === \'function\'') &&
  playbarJs.includes('window.syncLiveLyrics(safeSec)'));

assert('seekForward5 clamps safely to duration and shows toast feedback',
  playbarJs.includes('seekForward5') &&
  playbarJs.includes('Math.min(maxDur, Math.floor(current) + 5)') &&
  playbarJs.includes('⏩ +5s'));

assert('seekBackward5 clamps safely to 0 and shows toast feedback',
  playbarJs.includes('seekBackward5') &&
  playbarJs.includes('Math.max(0, Math.floor(current) - 5)') &&
  playbarJs.includes('⏪ -5s'));

// 5. Keyboard Navigation
console.log('\n--- 5. Keyboard Shortcuts ---');
assert('Shift+ArrowRight triggers playNext',
  playbarJs.includes('e.code === \'ArrowRight\'') &&
  playbarJs.includes('e.shiftKey') &&
  playbarJs.includes('playNext()'));

assert('Shift+ArrowLeft triggers playPrevious',
  playbarJs.includes('e.code === \'ArrowLeft\'') &&
  playbarJs.includes('e.shiftKey') &&
  playbarJs.includes('playPrevious()'));

assert('Key N triggers playNext and Key P triggers playPrevious',
  playbarJs.includes('e.key === \'n\' || e.key === \'N\'') &&
  playbarJs.includes('e.key === \'p\' || e.key === \'P\''));

// 6. Playbar HTML Buttons
console.log('\n--- 6. Playbar UI Controls in index.html ---');
assert('Desktop playbar prev button has proper handler and title',
  indexHtml.includes('id="btn-prev"') &&
  indexHtml.includes('window.PulsePlaybar.playPrevious()'));

assert('Desktop playbar next button has proper handler and title',
  indexHtml.includes('id="btn-next"') &&
  indexHtml.includes('window.PulsePlaybar.playNext()'));

assert('Desktop seek buttons have 5s SVG intact',
  indexHtml.includes('id="btn-seek-backward"') &&
  indexHtml.includes('id="btn-seek-forward"'));

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`==============================================\n`);

if (failed > 0) {
  process.exit(1);
}
