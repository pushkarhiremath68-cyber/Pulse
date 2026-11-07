import assert from 'assert';
import { ARTIST_DATABASE, getFeaturedArtists, getArtistDetails } from '../src/catalogService.js';

console.log('🧪 RUNNING ARTIST PHOTO AUTHENTICITY AUDIT TEST SUITE...\n');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${desc}\n     -> Error: ${err.message}`);
    failed++;
  }
}

// 1. Arijit Singh must be the real Arijit Singh, NEVER Ranbir Kapoor
it('Arijit Singh has real portrait and no movie actor artwork', () => {
  const arijit = ARTIST_DATABASE['arijit-singh'];
  assert(arijit, 'Arijit Singh must exist in database');
  assert(arijit.avatar, 'Arijit must have avatar');
  assert(!arijit.avatar.includes('196589311191'), 'Arijit must NOT have Ranbir Kapoor / Brahmastra album cover');
  assert(arijit.avatar.includes('ac5350cff290edd5b69fa584b8b1bd4f'), 'Arijit must have verified singing portrait');
  assert.strictEqual(arijit.avatar, arijit.banner, 'Avatar and banner should match verified photo');
});

// 2. Shilpa Rao must not have Ranbir Kapoor
it('Shilpa Rao has real portrait and no movie actor artwork', () => {
  const shilpa = ARTIST_DATABASE['shilpa-rao'];
  assert(shilpa, 'Shilpa Rao must exist');
  assert(!shilpa.avatar.includes('196589311191'), 'Shilpa Rao must NOT have Ranbir Kapoor / Brahmastra artwork');
  assert(shilpa.avatar.includes('d6c9df2eb27416ade91b4b8d7caa1669'), 'Shilpa Rao must have verified portrait');
});

// 3. KK has real portrait, not YouTube video thumbnail
it('KK has authentic portrait', () => {
  const kk = ARTIST_DATABASE['kk'];
  assert(kk, 'KK must exist');
  assert(!kk.avatar.includes('i.ytimg.com'), 'KK must not have low-res YouTube video thumbnail');
  assert(kk.avatar.includes('e118eeb5332fe76610d4b355fdb61b03'), 'KK must have verified portrait');
});

// 4. Michael Jackson has King of Pop portrait, not Katy Perry cover
it('Michael Jackson has real King of Pop portrait', () => {
  const mj = ARTIST_DATABASE['michael-jackson'];
  assert(mj, 'Michael Jackson must exist');
  assert(!mj.avatar.includes('17UMGIM88289'), 'Michael Jackson must NOT have Katy Perry cover');
  assert(mj.avatar.includes('97fae13b2b30e4aec2e8c9e0c7839d92'), 'Michael Jackson must have official portrait');
});

// 5. Queen has real band portrait
it('Queen has authentic band portrait', () => {
  const queen = ARTIST_DATABASE['queen'];
  assert(queen, 'Queen must exist');
  assert(!queen.avatar.includes('17UMGIM88289'), 'Queen must NOT have Katy Perry cover');
  assert(queen.avatar.includes('71eeb9e2eeb375df35a3c0654a5a01ab'), 'Queen must have official band portrait');
});

// 6. Bollywood legends have authentic portraits
it('Bollywood playback legends (Sonu, Shreya, Kishore, Lata, Rafi, Mukesh, Asha, Jagjit, Shaan, Udit, Sanu, Alka) have real portraits', () => {
  const legends = [
    'sonu-nigam', 'shreya-ghoshal', 'kishore-kumar', 'lata-mangeshkar',
    'mohammed-rafi', 'mukesh', 'asha-bhosle', 'jagjit-singh',
    'shaan', 'udit-narayan', 'kumar-sanu', 'alka-yagnik', 'mohit-chauhan', 'pritam', 'ar-rahman'
  ];
  for (const id of legends) {
    const art = ARTIST_DATABASE[id];
    assert(art, `Legend ${id} must exist`);
    assert(art.avatar && art.avatar.startsWith('https://cdn-images.dzcdn.net/images/artist/'), `${id} must have verified high-res portrait`);
  }
});

// 7. Zero duplicate photos across all 87 artists
it('Zero duplicate photos across all artists in ARTIST_DATABASE', () => {
  const urlMap = new Map();
  for (const [id, art] of Object.entries(ARTIST_DATABASE)) {
    assert(art.avatar, `Artist ${id} must have an avatar`);
    if (urlMap.has(art.avatar)) {
      throw new Error(`Duplicate photo found between ${urlMap.get(art.avatar)} and ${id}: ${art.avatar}`);
    }
    urlMap.set(art.avatar, id);
  }
});

// 8. getFeaturedArtists returns avatar for all artists
it('getFeaturedArtists returns valid avatar for every artist', () => {
  const featured = getFeaturedArtists();
  assert(featured.length >= 80, 'Must have at least 80 featured artists');
  for (const f of featured) {
    assert(f.avatar && f.avatar.startsWith('https://'), `Featured artist ${f.name} must have valid avatar URL`);
  }
});

// 9. getArtistDetails resolves Arijit Singh with real photo
it('getArtistDetails returns verified Arijit Singh photo', () => {
  const details = getArtistDetails('Arijit Singh');
  assert(details, 'Arijit Singh details must be returned');
  assert(details.avatar.includes('ac5350cff290edd5b69fa584b8b1bd4f'), 'Arijit details avatar must be verified photo');
  assert(!details.avatar.includes('196589311191'), 'Arijit details avatar must NOT be Ranbir Kapoor');
  assert.strictEqual(details.topTracks.length, 10, 'Arijit must have 10 tracks');
});

console.log('\n====================================================');
console.log(`📊 RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL ARTIST PHOTO AUTHENTICITY TESTS PASSED WITH 100% SUCCESS!');
}
