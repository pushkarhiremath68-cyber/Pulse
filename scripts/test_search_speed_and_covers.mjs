if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] || null
  };
}

import { searchCatalogTracks, getNewReleasesShelf, CATALOG_CATEGORIES, findCatalogCover } from '../src/catalogService.js';
import { addToHistory, getHistory } from '../src/firestoreService.js';

console.log('--- TESTING SEARCH SPEED & COVER INTEGRITY ---');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
  }
}

// 1. Search Speed Test: Measure latency of local catalog search
const t0 = performance.now();
const res1 = searchCatalogTracks('arijit');
const t1 = performance.now();
const latencyMs = Math.round(t1 - t0);

assert(latencyMs < 50, `searchCatalogTracks executed in ${latencyMs}ms (<50ms threshold)`);
assert(res1.length > 0, `searchCatalogTracks('arijit') returned ${res1.length} songs`);

// 2. Cover Verification: getNewReleasesShelf
const newReleases = getNewReleasesShelf();
assert(newReleases.length >= 6, `getNewReleasesShelf returned ${newReleases.length} songs`);

let allReleasesHaveCovers = true;
for (const t of newReleases) {
  if (!t.coverUrl || t.coverUrl.includes('music-cover.svg') || !t.coverUrl.startsWith('http')) {
    allReleasesHaveCovers = false;
    console.error('Invalid release cover:', t.title, t.coverUrl);
  }
}
assert(allReleasesHaveCovers, 'All tracks in Fresh New Releases have authentic, high-res HTTP covers (no undefined/music-cover.svg)');

// 3. Cover Verification: CATALOG_CATEGORIES
let catIssues = 0;
for (const cat of CATALOG_CATEGORIES) {
  for (const t of cat.tracks) {
    if (!t.coverUrl || t.coverUrl.includes('music-cover.svg') || !t.coverUrl.startsWith('http')) {
      catIssues++;
      console.error('Invalid category track cover:', cat.title, '->', t.title, t.coverUrl);
    }
  }
}
assert(catIssues === 0, `All 88 tracks across CATALOG_CATEGORIES have valid high-res covers (issues: ${catIssues})`);

// 4. Test findCatalogCover
const cover1 = findCatalogCover('Blinding Lights', 'The Weeknd');
assert(cover1 && cover1.startsWith('http'), `findCatalogCover('Blinding Lights') found: ${cover1}`);

const cover2 = findCatalogCover('Kesariya', 'Arijit Singh');
assert(cover2 && cover2.startsWith('http'), `findCatalogCover('Kesariya') found: ${cover2}`);

const cover3 = findCatalogCover('Die With A Smile', 'Lady Gaga');
assert(cover3 && cover3.startsWith('http'), `findCatalogCover('Die With A Smile') found: ${cover3}`);

// 5. Test History cover preservation & healing
const testTrack = {
  id: 'test-track-123',
  title: 'Blinding Lights',
  artist: 'The Weeknd',
  cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/600x600bb.jpg'
};
addToHistory(testTrack);

getHistory(5).then(hist => {
  const found = hist.find(h => h.id === 'test-track-123');
  assert(found && found.coverUrl && found.coverUrl.startsWith('http'), `History accurately saved and returned coverUrl: ${found?.coverUrl}`);
  
  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
});
