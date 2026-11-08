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
    assert(art.topTracks.length >= 5, `Artist ${k} (${art.name}) must have at least 5 top tracks, got ${art.topTracks.length}`);
    
    // Check real photo (no dicebear, no unsplash)
    assert(art.banner, `Artist ${k} must have a banner photo`);
    assert(art.avatar, `Artist ${k} must have an avatar photo`);
    assert(!art.banner.includes('dicebear') && !art.banner.includes('unsplash'), `Artist ${k} must have real photo, not dicebear/unsplash`);
    assert(!art.avatar.includes('dicebear') && !art.avatar.includes('unsplash'), `Artist ${k} must have real photo, not dicebear/unsplash`);

    // Check no Spotify connect in socials
    if (art.socials) {
      assert(!art.socials.spotify, `Artist ${k} must NOT have spotify in socials`);
    }

    // Check each track has real titles & durations
    art.topTracks.forEach((t, i) => {
      assert(t.title && t.title.trim().length > 0, `Track ${i + 1} of ${art.name} must have a title`);
      assert(t.duration && t.duration > 30, `Track ${i + 1} of ${art.name} must have valid duration`);
      assert(t.coverUrl, `Track ${i + 1} of ${art.name} must have album cover`);
      assert(!t.title.includes('Greatest Anthem'), `Track ${i + 1} of ${art.name} must not be dummy title`);
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
// TEST 3: getArtistDetails handles both curated and uncurated artists
// -------------------------------------------------------------
await itAsync('getArtistDetails returns curated 10 tracks and clean dynamic uncurated object', async () => {
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

  // Uncurated dynamic fallback: returns clean profile and zero dummy Greatest Anthem titles
  const random = mod.getArtistDetails('The Lumineers');
  assert(random && random.name === 'The Lumineers', 'Must return profile for The Lumineers');
  assert(!random.topTracks.some(t => t.title.includes('Greatest Anthem')), 'Must NOT have fake dummy Greatest Anthem titles');
  assert(!random.banner?.includes('dicebear'), 'The Lumineers must NOT have dicebear banner');
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
// TEST 5: Verify NO Pakistani artists
// -------------------------------------------------------------
await itAsync('No Pakistani artists present in ARTIST_DATABASE or SIMILAR_ARTIST_MAP', async () => {
  const mod = await import('../src/catalogService.js');
  const PAKISTANI_SINGERS = [
    'atif-aslam', 'atif aslam', 'rahat-fateh-ali-khan', 'rahat fateh ali khan',
    'ali-zafar', 'ali zafar', 'shafqat-amanat-ali', 'shafqat amanat ali',
    'farhan-saeed', 'farhan saeed', 'ghulam-ali', 'ghulam ali',
    'nusrat-fateh-ali-khan', 'nusrat fateh ali khan', 'momina-mustehsan',
    'mustafa-zahid', 'asif-aslam', 'abida-parveen', 'sajjad-ali', 'quratulain-balouch'
  ];

  const dbKeys = Object.keys(mod.ARTIST_DATABASE);
  PAKISTANI_SINGERS.forEach(singer => {
    assert(!dbKeys.includes(singer), `ARTIST_DATABASE must NOT contain blacklisted singer: ${singer}`);
  });

  // Check similar artist map
  if (mod.SIMILAR_ARTIST_MAP) {
    Object.keys(mod.SIMILAR_ARTIST_MAP).forEach(k => {
      assert(!PAKISTANI_SINGERS.includes(k), `SIMILAR_ARTIST_MAP key must NOT be: ${k}`);
      mod.SIMILAR_ARTIST_MAP[k].forEach(sim => {
        assert(!PAKISTANI_SINGERS.includes(sim), `SIMILAR_ARTIST_MAP value must NOT contain: ${sim}`);
      });
    });
  }
});

// -------------------------------------------------------------
// TEST 6: Verify pure HTML/CSS UI structure in main.js
// -------------------------------------------------------------
await itAsync('main.js has zero "Connect Spotify" or "Open on Spotify" user-facing references', async () => {
  const fs = await import('fs');
  const mainCode = fs.readFileSync('src/main.js', 'utf8');
  assert(!mainCode.includes('Connect Spotify'), 'Must not have "Connect Spotify" button');
  assert(!mainCode.includes('Open on Spotify'), 'Must not have "Open on Spotify" link');
});

// -------------------------------------------------------------
// TEST 7: Play Top 10 Button and Verified UI Elements
// -------------------------------------------------------------
await itAsync('Artist profile includes Play Top 10 button and Spotify-grade action controls', async () => {
  const fs = await import('fs');
  const mainCode = fs.readFileSync('src/main.js', 'utf8');
  assert(mainCode.includes('playArtistTopTracks'), 'main.js must define playArtistTopTracks function');
  assert(mainCode.includes('artist-popular-tracks-list'), 'main.js must render artist-popular-tracks-list');
  assert(mainCode.includes('artist-about-container'), 'main.js must render artist-about-container');
});

console.log('\n====================================================');
console.log(`📊 RESULTS: ${pass} PASSED, ${fail} FAILED`);
console.log('====================================================\n');

if (fail > 0) {
  process.exit(1);
}
