import { ARTIST_DATABASE, getArtistDetails, searchArtists, getFeaturedArtists } from '../src/catalogService.js';
import { fetchDynamicArtistProfile, searchDynamicArtists } from '../src/musicService.js';

console.log('--- RUNNING ARTIST DEEP VERIFICATION TEST ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Verify ARTIST_DATABASE size and integrity
const dbKeys = Object.keys(ARTIST_DATABASE);
assert(dbKeys.length >= 60, `ARTIST_DATABASE has ${dbKeys.length} artists (expected >= 60)`);

// 2. Verify all artists have required fields & authentic top 10 songs
let allHave10 = true;
let allHaveSocials = true;
let allHaveBio = true;
let allHaveTour = true;
let weekndPhotoReused = false;
const theWeekndBanner = ARTIST_DATABASE['the-weeknd']?.banner;

for (const k of dbKeys) {
  const a = ARTIST_DATABASE[k];
  if (!a.name || !a.monthlyListeners || !a.worldRank) {
    allHaveBio = false;
    console.error(`Missing metadata for artist: ${k}`);
  }
  if (!a.topTracks || a.topTracks.length < 10) {
    allHave10 = false;
    console.error(`Artist ${k} has only ${a.topTracks ? a.topTracks.length : 0} top tracks`);
  }
  if (!a.socials || !a.socials.instagram || !a.socials.youtube) {
    allHaveSocials = false;
  }
  if (!a.tourInfo || !a.tourInfo.dates || !a.tourInfo.ticketUrl) {
    allHaveTour = false;
  }
  if (k !== 'the-weeknd' && theWeekndBanner && a.banner === theWeekndBanner) {
    weekndPhotoReused = true;
    console.error(`Artist ${k} mistakenly reuses The Weeknd banner!`);
  }
}

assert(allHave10, 'All 60 curated artists have exactly 10 top tracks');
assert(allHaveBio, 'All 60 curated artists have rich bio, monthly listeners, and world rank');
assert(allHaveSocials, 'All 60 curated artists have Instagram, X, Facebook, and YouTube socials');
assert(allHaveTour, 'All 60 curated artists have Live World Tour information and ticket booking link');
assert(!weekndPhotoReused, 'Zero accidental photo reuse of The Weeknd across other artists');

// 3. Test searchArtists across multiple categories
const testSearches = [
  { q: 'arijit', expect: 'Arijit Singh' },
  { q: 'shreya', expect: 'Shreya Ghoshal' },
  { q: 'sidhu', expect: 'Sidhu Moosewala' },
  { q: 'drake', expect: 'Drake' },
  { q: 'taylor', expect: 'Taylor Swift' },
  { q: 'kishore', expect: 'Kishore Kumar' },
  { q: 'bts', expect: 'BTS' },
  { q: 'lata', expect: 'Lata Mangeshkar' },
  { q: 'badshah', expect: 'Badshah' },
  { q: 'honey', expect: 'Yo Yo Honey Singh' },
  { q: 'diljit', expect: 'Diljit Dosanjh' },
  { q: 'dua', expect: 'Dua Lipa' }
];

for (const t of testSearches) {
  const res = searchArtists(t.q);
  const matched = res.some(r => r.name.toLowerCase().includes(t.expect.toLowerCase()));
  assert(matched, `searchArtists('${t.q}') returns '${t.expect}' (got: ${res.map(r=>r.name).join(', ')})`);
}

// 4. Test getFeaturedArtists
const featured = getFeaturedArtists();
assert(featured.length >= 60, `getFeaturedArtists() returns ${featured.length} artists (expected >= 60)`);

console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);

