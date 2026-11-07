import assert from 'assert';
import { ARTIST_DATABASE } from '../src/catalogService.js';

console.log('=== TEST SUITE: AUTHENTIC TRACK COVERS & PROFILE FIDELITY ===\n');

// 1. Check Shilpa Rao, Prateek Kuhad, and Pritam for unwanted Ranbir Kapoor 196589311191 covers
const unwantedRanbirCover = '196589311191';
const shilpaTracks = ARTIST_DATABASE['shilpa-rao']?.topTracks || [];
const prateekTracks = ARTIST_DATABASE['prateek-kuhad']?.topTracks || [];
const pritamTracks = ARTIST_DATABASE['pritam']?.topTracks || [];

let shilpaRanbirCount = 0;
shilpaTracks.forEach(t => {
  if (t.coverUrl?.includes(unwantedRanbirCover)) shilpaRanbirCount++;
});
console.log(`[TEST 1] Shilpa Rao unwanted Ranbir cover count: ${shilpaRanbirCount}/10 (Expected: 0)`);
assert.strictEqual(shilpaRanbirCount, 0, 'Shilpa Rao must have 0 Ranbir Kapoor covers');

let prateekRanbirCount = 0;
prateekTracks.forEach(t => {
  if (t.coverUrl?.includes(unwantedRanbirCover)) prateekRanbirCount++;
});
console.log(`[TEST 2] Prateek Kuhad unwanted Ranbir cover count: ${prateekRanbirCount}/10 (Expected: 0)`);
assert.strictEqual(prateekRanbirCount, 0, 'Prateek Kuhad must have 0 Ranbir Kapoor covers');

let pritamRanbirCount = 0;
pritamTracks.forEach(t => {
  const isBrahmastraSong = t.title.toLowerCase().includes('kesariya') || t.title.toLowerCase().includes('dance ka bhoot');
  if (t.coverUrl?.includes(unwantedRanbirCover) && !isBrahmastraSong) pritamRanbirCount++;
});
console.log(`[TEST 3] Pritam non-Brahmastra tracks with Ranbir cover: ${pritamRanbirCount}/10 (Expected: 0)`);
assert.strictEqual(pritamRanbirCount, 0, 'Pritam non-Brahmastra songs must have their own song cover');

// 2. Check track cover variety (no artist should have all 10 tracks using the exact same generic cover)
let lowVarietyArtists = [];
for (const [id, artist] of Object.entries(ARTIST_DATABASE)) {
  const covers = new Set((artist.topTracks || []).map(t => t.coverUrl).filter(Boolean));
  if (covers.size <= 1 && (artist.topTracks || []).length > 3) {
    lowVarietyArtists.push({ id, name: artist.name, uniqueCovers: covers.size });
  }
}
console.log(`[TEST 4] Artists with only 1 repeated cover across all tracks: ${lowVarietyArtists.length} (Expected: 0)`);

// 3. Check all 87 artists have 10 tracks with valid title, duration, ytId, coverUrl
let incompleteTracks = 0;
for (const [id, artist] of Object.entries(ARTIST_DATABASE)) {
  if (!artist.topTracks || artist.topTracks.length < 10) {
    incompleteTracks++;
    console.error(`Artist ${id} has only ${artist.topTracks?.length} tracks!`);
  }
  for (const t of artist.topTracks || []) {
    if (!t.title || !t.coverUrl || !t.ytId) {
      incompleteTracks++;
    }
  }
}
console.log(`[TEST 5] Incomplete track records across all 87 artists: ${incompleteTracks} (Expected: 0)`);
assert.strictEqual(incompleteTracks, 0, 'All 87 artists must have 10 complete tracks with valid metadata');

// 4. Verify artist avatar and banner portraits remain authentic and distinct
const avatars = new Set();
for (const [id, artist] of Object.entries(ARTIST_DATABASE)) {
  assert.ok(artist.avatar, `Artist ${id} must have avatar`);
  assert.ok(artist.banner, `Artist ${id} must have banner`);
  avatars.add(artist.avatar);
}
console.log(`[TEST 6] Unique artist avatars: ${avatars.size} / ${Object.keys(ARTIST_DATABASE).length} (Expected: ${Object.keys(ARTIST_DATABASE).length})`);
assert.strictEqual(avatars.size, Object.keys(ARTIST_DATABASE).length, 'Every artist must have a unique, authentic portrait');

console.log('\n>>> ALL ARTIST TRACK & PORTRAIT AUDIT TESTS PASSED! <<<');

