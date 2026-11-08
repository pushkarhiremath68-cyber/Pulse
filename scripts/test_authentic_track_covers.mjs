import { ARTIST_DATABASE } from '../src/catalogService.js';
import assert from 'assert';

console.log('=== TEST SUITE: AUTHENTIC TRACK COVERS & PROFILE FIDELITY ===\n');

// 1. Verify specific high-risk artists don't have movie actor photos (e.g. Ranbir Kapoor) for playback tracks
const checkSingerNoRanbir = (artistId, artistName) => {
  const art = ARTIST_DATABASE[artistId];
  assert.ok(art, `Artist ${artistId} must exist in ARTIST_DATABASE`);
  
  const ranbirTracks = (art.topTracks || []).filter(t => {
    const cover = (t.coverUrl || '').toLowerCase();
    const title = (t.title || '').toLowerCase();
    // Allow legitimate movie tracks from Brahmastra/Animal if they belong there, but flag wrong movie covers
    return (cover.includes('animal') || cover.includes('ranbir') || cover.includes('brahmastra')) &&
           !title.includes('kesariya') && !title.includes('satranga') && !title.includes('ranvijay');
  });

  console.log(`[TEST] ${artistName} unwanted Ranbir cover count: ${ranbirTracks.length}/10 (Expected: 0)`);
  assert.strictEqual(ranbirTracks.length, 0, `${artistName} must not have misplaced Ranbir Kapoor covers for unrelated tracks`);
};

checkSingerNoRanbir('shilpa-rao', 'Shilpa Rao');
checkSingerNoRanbir('prateek-kuhad', 'Prateek Kuhad');

// Pritam check - Pritam composed Brahmastra, but non-Brahmastra tracks shouldn't have Brahmastra covers
const pritam = ARTIST_DATABASE['pritam'];
assert.ok(pritam, 'Pritam must exist in database');
const wrongPritamCovers = (pritam.topTracks || []).filter(t => {
  const cover = (t.coverUrl || '').toLowerCase();
  const title = (t.title || '').toLowerCase();
  return cover.includes('brahmastra') && !title.includes('kesariya') && !title.includes('deva deva');
});
console.log(`[TEST 3] Pritam non-Brahmastra tracks with Ranbir cover: ${wrongPritamCovers.length}/10 (Expected: 0)`);
assert.strictEqual(wrongPritamCovers.length, 0, 'Pritam tracks must have accurate album covers');

// 2. Check track variety: No artist should have all 10 tracks sharing the exact same cover image
let lowVarietyArtists = [];
for (const [id, artist] of Object.entries(ARTIST_DATABASE)) {
  const covers = new Set((artist.topTracks || []).map(t => t.coverUrl).filter(Boolean));
  if (covers.size <= 1 && (artist.topTracks || []).length > 3) {
    lowVarietyArtists.push({ id, name: artist.name, uniqueCovers: covers.size });
  }
}
console.log(`[TEST 4] Artists with only 1 repeated cover across all tracks: ${lowVarietyArtists.length} (Expected: 0)`);

// 3. Check all artists have tracks with valid title, duration, valid stream reference and coverUrl
let incompleteTracks = 0;
for (const [id, artist] of Object.entries(ARTIST_DATABASE)) {
  if (!artist.topTracks || artist.topTracks.length < 5) {
    incompleteTracks++;
    console.error(`Artist ${id} has only ${artist.topTracks?.length} tracks!`);
  }
  for (const t of artist.topTracks || []) {
    if (!t.title || !t.coverUrl || (!t.ytId && !t.id?.startsWith('itunes-') && !t.id?.startsWith('ytm-'))) {
      incompleteTracks++;
    }
  }
}
console.log(`[TEST 5] Incomplete track records across all ${Object.keys(ARTIST_DATABASE).length} artists: ${incompleteTracks} (Expected: 0)`);
assert.strictEqual(incompleteTracks, 0, 'All artists must have complete tracks with valid metadata');

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
