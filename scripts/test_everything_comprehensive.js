// Setup minimal Node mocks for localStorage and navigator
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = { userAgent: 'Node.js Test Agent', platform: 'Win32' };
}

import {
  getHeroSlides,
  getQuickPicks,
  getFeaturedArtists,
  getArtistDetails,
  getCuratedPlaylists,
  getMoviePlaylists,
  getVibePlaylists,
  CATALOG_CATEGORIES,
  LANGUAGE_PLAYLISTS,
  PERMANENT_STREAM_MAP,
  searchCatalogTracks
} from '../src/catalogService.js';
import { resolveFullAudioStream, searchTracks } from '../src/musicService.js';
import { getLyrics, parseLrc } from '../src/lyricsService.js';
import { detectTrackVibe, getSimilarTracks, getNextSuggestedTrack } from '../src/recommendationService.js';
import { getStoredUser, setGateUnlocked, isGateUnlocked } from '../src/firebaseAuthService.js';
import {
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavorites,
  createPlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getPlaylists
} from '../src/firestoreService.js';
import { detectUserPlatform } from '../src/downloadService.js';
import { escapeHtml, sanitizeUrl } from '../src/security.js';

console.log('===============================================================');
console.log('   PULSE MUSIC APP - EXHAUSTIVE SYSTEM & SONG VERIFICATION   ');
console.log('===============================================================');

let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
    failures.push(message);
  }
}

// -----------------------------------------------------------------------------
// 1. VERIFY ALL SONGS IN THE CATALOG
// -----------------------------------------------------------------------------
console.log('\n--- 1. AUDITING ALL CATALOG SONGS ---');

const allTracks = [];
const seenIds = new Set();

function collectTrack(t, source) {
  if (!t) return;
  const key = `${t.title}::${t.artist}`;
  if (!seenIds.has(key)) {
    seenIds.add(key);
    allTracks.push({ ...t, _source: source });
  }
}

// Hero slides
getHeroSlides().forEach((s, idx) => collectTrack({ ...s, ytId: s.videoYtId || s.ytId }, `Hero Slide #${idx+1}`));

// Quick picks
getQuickPicks().forEach((t, idx) => collectTrack(t, `Quick Pick #${idx+1}`));

// Featured Artists Top Tracks
getFeaturedArtists().forEach(a => {
  const details = getArtistDetails(a.id || a.name);
  if (details && details.topTracks) {
    details.topTracks.forEach(t => collectTrack(t, `Artist: ${a.name}`));
  }
});

// Curated Playlists
getCuratedPlaylists().forEach(pl => {
  if (pl.tracks) pl.tracks.forEach(t => collectTrack(t, `Curated: ${pl.title}`));
});

// Movie Playlists
getMoviePlaylists().forEach(pl => {
  if (pl.tracks) pl.tracks.forEach(t => collectTrack(t, `Movie: ${pl.title}`));
});

// Vibe Playlists
getVibePlaylists().forEach(pl => {
  if (pl.tracks) pl.tracks.forEach(t => collectTrack(t, `Vibe: ${pl.title}`));
});

// Categories
Object.entries(CATALOG_CATEGORIES).forEach(([k, cat]) => {
  if (cat.tracks) cat.tracks.forEach(t => collectTrack(t, `Category: ${cat.title || k}`));
});

// Languages
LANGUAGE_PLAYLISTS.forEach(lp => {
  if (lp.tracks) lp.tracks.forEach(t => collectTrack(t, `Language: ${lp.language || lp.name}`));
});

console.log(`Total unique songs collected from entire catalog: ${allTracks.length}`);

let songsWithIssues = [];
allTracks.forEach(track => {
  const hasTitle = Boolean(track.title && track.title.trim());
  const hasArtist = Boolean(track.artist && track.artist.trim());
  const hasCover = Boolean(track.coverUrl || track.cover);
  const stream = track.streamUrl || PERMANENT_STREAM_MAP[track.title] || PERMANENT_STREAM_MAP[track.id];
  const ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : null);

  const hasStream = Boolean(stream && stream.startsWith('http') && !stream.includes('preview'));
  const hasYtId = Boolean(ytId && ytId.length >= 8 && ytId.length <= 15);

  if (!hasTitle || !hasArtist) {
    songsWithIssues.push({ track, error: 'Missing title or artist' });
  }
  if (!hasCover) {
    songsWithIssues.push({ track: track.title, error: 'Missing cover image' });
  }
  if (!hasStream && !hasYtId) {
    songsWithIssues.push({ track: `${track.title} by ${track.artist}`, source: track._source, error: 'NO direct stream AND NO YouTube ID' });
  }
});

assert(songsWithIssues.length === 0, `All ${allTracks.length} catalog songs have playback source (Issues: ${songsWithIssues.length})`);
if (songsWithIssues.length > 0) {
  console.log('Songs with issues:', songsWithIssues);
}

// -----------------------------------------------------------------------------
// 2. TEST PERMANENT STREAM MAP SAMPLES
// -----------------------------------------------------------------------------
console.log('\n--- 2. VERIFYING PERMANENT STREAM MAP ---');
const mapKeys = Object.keys(PERMANENT_STREAM_MAP);
console.log(`PERMANENT_STREAM_MAP has ${mapKeys.length} mapped stream entries.`);
assert(mapKeys.length >= 80, `PERMANENT_STREAM_MAP contains robust pre-resolved streams (${mapKeys.length} entries)`);

let invalidMapEntries = [];
mapKeys.forEach(k => {
  const url = PERMANENT_STREAM_MAP[k];
  if (!url || !url.startsWith('https://aac.saavncdn.com/') || !url.endsWith('.mp4')) {
    invalidMapEntries.push({ key: k, url });
  }
});
assert(invalidMapEntries.length === 0, `All PERMANENT_STREAM_MAP URLs are authentic high-bitrate Saavn CDN links`);

// -----------------------------------------------------------------------------
// 3. TEST LYRICS PARSER & LRCLIB INTEGRATION
// -----------------------------------------------------------------------------
console.log('\n--- 3. TESTING LYRICS SERVICE ---');
const sampleLrc = `
[00:01.00]First line
[00:04.50]Second line with feeling
[00:10.25]Third chorus line
`;
const parsed = parseLrc(sampleLrc);
assert(parsed.length === 3, `LRC parser correctly parsed 3 lines (got ${parsed.length})`);
assert(parsed[1].time === 4.5 && parsed[1].text === 'Second line with feeling', `LRC line 2 timestamp and text parsed with precision`);

// -----------------------------------------------------------------------------
// 4. TEST RECOMMENDATION & VIBE ENGINE
// -----------------------------------------------------------------------------
console.log('\n--- 4. TESTING RECOMMENDATION SERVICE ---');
const edmTrack = { title: 'Animals', artist: 'Martin Garrix', genre: 'EDM' };
const romanticTrack = { title: 'Kesariya', artist: 'Arijit Singh', genre: 'Romantic' };

const edmVibe = detectTrackVibe(edmTrack);
const romVibe = detectTrackVibe(romanticTrack);
assert(typeof edmVibe === 'object' && edmVibe.vibe, `detectTrackVibe returned valid vibe (${edmVibe?.vibe}) for EDM`);
assert(typeof romVibe === 'object' && romVibe.vibe, `detectTrackVibe returned valid vibe (${romVibe?.vibe}) for Romantic`);

const similar = await getSimilarTracks(edmTrack, 5);
assert(Array.isArray(similar) && similar.length > 0, `getSimilarTracks returned ${similar.length} recommendations`);

// -----------------------------------------------------------------------------
// 5. TEST SECURITY SANITIZATION
// -----------------------------------------------------------------------------
console.log('\n--- 5. TESTING SECURITY SANITIZATION ---');
const dirtyHtml = '<script>alert("xss")</script><b>Hello & Welcome</b>';
const cleanHtml = escapeHtml(dirtyHtml);
assert(!cleanHtml.includes('<script>') && cleanHtml.includes('&lt;script&gt;'), `escapeHtml safely neutralizes script injection`);

const safeUrl = sanitizeUrl('https://example.com/audio.mp4');
const badUrl = sanitizeUrl('javascript:alert(1)');
assert(safeUrl === 'https://example.com/audio.mp4', `sanitizeUrl preserves valid https URLs`);
assert(badUrl === 'about:blank', `sanitizeUrl blocks javascript: scheme`);

// -----------------------------------------------------------------------------
// 6. TEST FIRESTORE LOCAL STATE LOGIC
// -----------------------------------------------------------------------------
console.log('\n--- 6. TESTING PLAYLISTS & FAVORITES STORAGE ---');
const testTrack = { id: 'test-track-123', title: 'Test Song', artist: 'Test Artist' };

// Test favorites
await addFavorite(testTrack);
assert(isFavorite('test-track-123'), `addFavorite successfully marks track as favorite`);
const favs = await getFavorites();
assert(Array.isArray(favs) && favs.some(f => f.id === 'test-track-123'), `getFavorites includes added test track`);
await removeFavorite('test-track-123');
assert(!isFavorite('test-track-123'), `removeFavorite successfully unmarks track`);

// Test playlists
const createdPlaylist = await createPlaylist('Workout Vibes 2026', 'My energy mix');
const testPlId = createdPlaylist ? createdPlaylist.id : null;
assert(Boolean(testPlId), `createPlaylist created playlist with ID: ${testPlId}`);
await addTrackToPlaylist(testPlId, testTrack);
const pls = await getPlaylists();
const created = pls.find(p => p.id === testPlId);
assert(created && created.tracks.some(t => t.id === 'test-track-123'), `addTrackToPlaylist added track to playlist`);
await removeTrackFromPlaylist(testPlId, 'test-track-123');
const afterRemove = (await getPlaylists()).find(p => p.id === testPlId);
assert(afterRemove && !afterRemove.tracks.some(t => t.id === 'test-track-123'), `removeTrackFromPlaylist removed track`);
await deletePlaylist(testPlId);
const afterDel = (await getPlaylists()).find(p => p.id === testPlId);
assert(!afterDel, `deletePlaylist deleted the playlist`);

// -----------------------------------------------------------------------------
// 7. TEST STREAM RESOLUTION FOR TOP 5 TRACKS
// -----------------------------------------------------------------------------
console.log('\n--- 7. TESTING STREAM RESOLUTION FOR TOP TRACKS ---');
const probeTracks = [
  { title: 'Kesariya', artist: 'Arijit Singh', ytId: 'BddP6PYo2gs' },
  { title: 'Blinding Lights', artist: 'The Weeknd', ytId: '4NRXx6U8ABQ' },
  { title: 'Espresso', artist: 'Sabrina Carpenter', ytId: 'eVli-tstM5E' },
  { title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', ytId: 'kPa7bsKwL-c' },
  { title: 'Shape of You', artist: 'Ed Sheeran', ytId: '_dK2tDK9grQ' }
];

for (const tr of probeTracks) {
  try {
    const res = await resolveFullAudioStream(tr);
    const ok = Boolean(res && (res.streamUrl || res.ytId));
    assert(ok, `resolveFullAudioStream("${tr.title}") resolved -> ${res?.source || 'No source'} (${res?.streamUrl ? 'Direct Stream' : 'YouTube IFrame'})`);
  } catch (e) {
    assert(false, `resolveFullAudioStream("${tr.title}") threw: ${e.message}`);
  }
}

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`AUDIT FINISHED: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('===============================================================');
if (failures.length > 0) {
  console.log('Failures list:');
  failures.forEach(f => console.log(' - ' + f));
}
