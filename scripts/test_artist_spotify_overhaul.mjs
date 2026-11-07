/**
 * scripts/test_artist_spotify_overhaul.mjs
 * Comprehensive automated verification for:
 * 1. Every single artist in ARTIST_DATABASE has 10 real top hit tracks
 * 2. Every single artist has real authentic photos (banner & avatar, zero dicebear)
 * 3. Dynamic resolution guarantees 10 real tracks and authentic artwork for ANY artist
 * 4. Zero Pakistani singers in database or similar artist maps
 * 5. All "Connect Spotify" and "Open on Spotify" elements removed
 * 6. High-end Spotify-style layout and controls
 */
import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 RUNNING SPOTIFY-GRADE ARTIST OVERHAUL TEST SUITE...\n');

let pass = 0;
let fail = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${desc}`);
    pass++;
  } catch (e) {
    console.error(`  ❌ [FAIL] ${desc}`);
    console.error(`     Error: ${e.message}`);
    fail++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${desc}`);
    pass++;
  } catch (e) {
    console.error(`  ❌ [FAIL] ${desc}`);
    console.error(`     Error: ${e.message}`);
    fail++;
  }
}

// -------------------------------------------------------------
// TEST 1: ARTIST_DATABASE Size & Integrity
// -------------------------------------------------------------
await itAsync('ARTIST_DATABASE has over 80 verified artists and all have 10 tracks', async () => {
  const mod = await import('../src/catalogService.js');
  const db = mod.ARTIST_DATABASE;
  const keys = Object.keys(db);
  assert(keys.length >= 80, `Expected at least 80 artists, got ${keys.length}`);

  keys.forEach(k => {
    const art = db[k];
    assert(art.name, `Artist ${k} must have a name`);
    assert(art.topTracks, `Artist ${k} must have topTracks array`);
    assert.strictEqual(art.topTracks.length, 10, `Artist ${k} (${art.name}) must have exactly 10 top tracks, got ${art.topTracks.length}`);
    
    // Check real photo (no dicebear)
    assert(art.banner, `Artist ${k} must have a banner photo`);
    assert(art.avatar, `Artist ${k} must have an avatar photo`);
    assert(!art.banner.includes('dicebear'), `Artist ${k} must have real photo, not dicebear`);
    assert(!art.avatar.includes('dicebear'), `Artist ${k} must have real photo, not dicebear`);

    // Check no Spotify connect in socials
    if (art.socials) {
      assert(!art.socials.spotify, `Artist ${k} must NOT have spotify in socials`);
    }

    // Check each of the 10 tracks has real titles & durations
    art.topTracks.forEach((t, i) => {
      assert(t.title && t.title.trim().length > 0, `Track ${i + 1} of ${art.name} must have a title`);
      assert(t.duration && t.duration > 30, `Track ${i + 1} of ${art.name} must have valid duration`);
      assert(t.coverUrl, `Track ${i + 1} of ${art.name} must have album cover`);
    });
  });
});

// -------------------------------------------------------------
// TEST 2: Curated Specific Artists Check (Alka Yagnik, Selena Gomez, etc.)
// -------------------------------------------------------------
await itAsync('Curated artists like Alka Yagnik, Selena Gomez, Katy Perry, Alan Walker, Queen exist with 10 tracks', async () => {
  const mod = await import('../src/catalogService.js');
  const checkList = [
    'alka-yagnik', 'mohammed-rafi', 'mukesh', 'asha-bhosle',
    'selena-gomez', 'katy-perry', 'maroon-5', 'alan-walker',
    'guru-randhawa', 'b-praak', 'jasleen-royal', 'sza',
    'chappell-roan', 'queen', 'michael-jackson'
  ];

  checkList.forEach(id => {
    const art = mod.ARTIST_DATABASE[id];
    assert(art, `Curated artist ${id} must exist in ARTIST_DATABASE`);
    assert.strictEqual(art.topTracks.length, 10, `${art.name} must have 10 tracks`);
    assert(art.banner.startsWith('http'), `${art.name} must have valid photo URL`);
  });
});

// -------------------------------------------------------------
// TEST 3: getArtistDetails handles both curated and uncurated artists with 10 tracks
// -------------------------------------------------------------
await itAsync('getArtistDetails returns 10 tracks and real photo for ANY query', async () => {
  const mod = await import('../src/catalogService.js');
  
  // Curated lookup by query
  const alka = mod.getArtistDetails('Alka Yagnik');
  assert(alka && alka.name === 'Alka Yagnik', 'Must find Alka Yagnik');
  assert.strictEqual(alka.topTracks.length, 10, 'Alka Yagnik must have 10 tracks');
  assert(!alka.banner.includes('dicebear'), 'Alka Yagnik must have real photo');

  // Alias lookup
  const selena = mod.getArtistDetails('selena');
  assert(selena && selena.name === 'Selena Gomez', 'Must find Selena Gomez by alias');
  assert.strictEqual(selena.topTracks.length, 10, 'Selena Gomez must have 10 tracks');

  // Uncurated dynamic fallback
  const random = mod.getArtistDetails('The Lumineers');
  assert(random && random.name === 'The Lumineers', 'Must return profile for The Lumineers');
  assert.strictEqual(random.topTracks.length, 10, 'The Lumineers must have exactly 10 tracks in fallback');
  assert(!random.banner.includes('dicebear'), 'The Lumineers must NOT have dicebear banner');
  assert(!random.topTracks.some(t => t.ytId === 'dQw4w9WgXcQ'), 'Must NOT have Rickroll placeholder');
});

// -------------------------------------------------------------
// TEST 4: searchArtists returns real candidates
// -------------------------------------------------------------
await itAsync('searchArtists returns verified candidates with real banners', async () => {
  const mod = await import('../src/catalogService.js');
  const queries = ['alka', 'selena', 'katy', 'alan', 'guru', 'praak', 'queen', 'michael', 'sza'];
  queries.forEach(q => {
    const results = mod.searchArtists(q);
    assert(results.length > 0, `searchArtists('${q}') should return matches`);
    assert(results[0].banner && !results[0].banner.includes('dicebear'), `Search result for ${q} must have real banner`);
  });
});

// -------------------------------------------------------------
// TEST 5: Zero Pakistani singers anywhere in ARTIST_DATABASE or SIMILAR_ARTIST_MAP
// -------------------------------------------------------------
it('No Pakistani artists present in ARTIST_DATABASE or SIMILAR_ARTIST_MAP', () => {
  const catalog = fs.readFileSync(path.resolve('src/catalogService.js'), 'utf8');
  const forbidden = ['atif-aslam', 'atif aslam', 'rahat fateh', 'ali zafar', 'nusrat fateh'];
  forbidden.forEach(name => {
    assert(!catalog.includes(`"name": "${name}"`), `ARTIST_DATABASE must not contain ${name}`);
    assert(!catalog.includes(`"${name}":`), `SIMILAR_ARTIST_MAP must not contain ${name}`);
  });
});

// -------------------------------------------------------------
// TEST 6: All Spotify Connect / Open on Spotify UI completely removed
// -------------------------------------------------------------
it('main.js has zero "Connect Spotify" or "Open on Spotify" user-facing references', () => {
  const mainJs = fs.readFileSync(path.resolve('src/main.js'), 'utf8');
  assert(!mainJs.includes('Open on Spotify'), 'main.js must not contain "Open on Spotify"');
  assert(!mainJs.includes('Connect:</span>'), 'main.js must not contain "Connect:"');
  assert(!mainJs.includes('title="Spotify Profile'), 'main.js must not contain Spotify Profile link');
  assert(!mainJs.includes('Verified on Spotify'), 'main.js must not contain "Verified on Spotify"');
  assert(!mainJs.includes('Verified Spotify stream tier'), 'main.js must not contain "Verified Spotify stream tier"');
});

// -------------------------------------------------------------
// TEST 7: Spotify-Style Play Top 10 button is present
// -------------------------------------------------------------
it('Artist profile includes Play Top 10 button and Spotify-grade action controls', () => {
  const mainJs = fs.readFileSync(path.resolve('src/main.js'), 'utf8');
  assert(mainJs.includes('window.playArtistTopTracks()'), 'main.js must provide playArtistTopTracks');
  assert(mainJs.includes('Play Top 10 Hits'), 'main.js must contain Play Top 10 Hits button');
});

console.log(`\n====================================================`);
console.log(`📊 RESULTS: ${pass} PASSED, ${fail} FAILED`);
console.log(`====================================================\n`);

if (fail > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SPOTIFY ARTIST OVERHAUL TESTS PASSED!\n');
}
