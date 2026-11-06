import { ARTIST_DATABASE, getArtistDetails } from '../src/catalogService.js';

console.log("=== COMPREHENSIVE ARTIST & SPOTIFY SOCIALS VERIFICATION ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${message}`);
  }
}

// 1. Verify ARTIST_DATABASE Count
const keys = Object.keys(ARTIST_DATABASE);
assert(keys.length === 60, `ARTIST_DATABASE contains exactly 60 curated artists (found ${keys.length})`);

// 2. Audit every single artist
keys.forEach(k => {
  const art = ARTIST_DATABASE[k];
  const s = art.socials || {};
  
  const hasOrigin = typeof art.origin === 'string' && art.origin.length > 3;
  const hasBio = typeof art.bio === 'string' && art.bio.length >= 100;
  const hasSpotify = typeof s.spotify === 'string' && s.spotify.startsWith('https://open.spotify.com/');
  const hasIG = typeof s.instagram === 'string' && s.instagram.startsWith('https://www.instagram.com/');
  const hasX = typeof s.x === 'string' && s.x.startsWith('https://x.com/');
  const hasFB = typeof s.facebook === 'string' && s.facebook.startsWith('https://www.facebook.com/');
  const hasYT = typeof s.youtube === 'string' && s.youtube.startsWith('https://www.youtube.com/');
  const has10Tracks = Array.isArray(art.topTracks) && art.topTracks.length === 10;

  if (!hasOrigin || !hasBio || !hasSpotify || !hasIG || !hasX || !hasFB || !hasYT || !has10Tracks) {
    assert(false, `Artist [${k}] ${art.name} is missing required Spotify fields: Origin=${hasOrigin}, Bio=${hasBio}, Spotify=${hasSpotify}, IG=${hasIG}, X=${hasX}, FB=${hasFB}, YT=${hasYT}, Tracks=${art.topTracks?.length}`);
  }
});

assert(failed === 0, `All 60 artists have verified Origin, Bio, Socials (Spotify, IG, X, FB, YT) and 10 master tracks`);

// 3. Test getArtistDetails
const arijit = getArtistDetails('Arijit Singh');
assert(arijit && arijit.socials && arijit.socials.spotify.includes('4YRxDV8wJFPHPTeXepOstw'), 'Arijit Singh has verified Spotify profile URL');
assert(arijit.origin.includes('Jiaganj'), 'Arijit Singh has verified origin: Jiaganj');

const weeknd = getArtistDetails('The Weeknd');
assert(weeknd && weeknd.socials && weeknd.socials.spotify.includes('1Xyo4u8uXC1ZmMpatF05PJ'), 'The Weeknd has verified Spotify profile URL');
assert(weeknd.origin.includes('Toronto'), 'The Weeknd has verified origin: Toronto');

const taylor = getArtistDetails('Taylor Swift');
assert(taylor && taylor.socials && taylor.socials.spotify.includes('06HL4z0CvFAxyc27GXpf02'), 'Taylor Swift has verified Spotify profile URL');
assert(taylor.origin.includes('Pennsylvania'), 'Taylor Swift has verified origin: Pennsylvania');

// 4. Test dynamic artist fallback
const unknownArt = getArtistDetails('Independent Indie Artist');
assert(unknownArt && unknownArt.socials && unknownArt.socials.spotify.startsWith('https://open.spotify.com/search/'), 'Dynamic artist fallback generates valid Spotify search URL');
assert(unknownArt.socials.youtube.startsWith('https://www.youtube.com/@'), 'Dynamic artist fallback generates valid YouTube channel link');

console.log(`\nTest Results: ${passed} Passed, ${failed} Failed.`);
if (failed > 0) process.exit(1);
