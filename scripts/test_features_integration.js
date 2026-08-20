import { getQuickPicks, getFeaturedArtists, getCuratedPlaylists, CATALOG_CATEGORIES, LANGUAGE_PLAYLISTS } from '../src/catalogService.js';
import { parseLrc, getActiveLineIndex, getLyrics } from '../src/lyricsService.js';

console.log('=== TEST 1: Home Catalogues ===');
console.log('Catalog categories count:', CATALOG_CATEGORIES.length);
console.log('Language playlists count:', LANGUAGE_PLAYLISTS.length);
console.log('Quick picks count:', getQuickPicks().length);
console.log('Featured artists count:', getFeaturedArtists().length);
console.log('Curated playlists count:', getCuratedPlaylists().length);

if (CATALOG_CATEGORIES.length > 0 && LANGUAGE_PLAYLISTS.length > 0 && getQuickPicks().length > 0) {
  console.log('✓ Home screen catalogues verification PASSED');
} else {
  console.error('✗ Home screen catalogues verification FAILED');
  process.exit(1);
}

console.log('\n=== TEST 2: Lyrics Engine & LRC Parser ===');
const sampleLrc = `[00:09.10]I'm tryna put you in the worst mood, ah
[00:11.80]P1 cleaner than your church shoes, ah
[00:14.20]Milli point two just to hurt you, ah
[00:16.80]All red Lamb' just to tease you, ah`;

const parsed = parseLrc(sampleLrc);
console.log('Parsed LRC lines:', parsed.length);
console.log('Line 0:', parsed[0]);
console.log('Line 1:', parsed[1]);

const idxAt10 = getActiveLineIndex(parsed, 10.0);
console.log('Active index at 10.0s:', idxAt10, 'Text:', parsed[idxAt10]?.text);

const idxAt12 = getActiveLineIndex(parsed, 12.5);
console.log('Active index at 12.5s:', idxAt12, 'Text:', parsed[idxAt12]?.text);

if (idxAt10 === 0 && idxAt12 === 1) {
  console.log('✓ Real-time LRC synchronized parser PASSED');
} else {
  console.error('✗ Real-time LRC synchronized parser FAILED');
  process.exit(1);
}

console.log('\n=== TEST 3: Verified Registry Lyrics Fetch ===');
async function testRegistry() {
  const lyrics = await getLyrics('Starboy', 'The Weeknd');
  console.log('Fetched lyrics for Starboy:', lyrics?.title, 'isSynced:', lyrics?.isSynced, 'Lines:', lyrics?.lines?.length);
  if (lyrics && lyrics.isSynced && lyrics.lines.length > 0) {
    console.log('✓ Verified lyrics fetch PASSED');
  } else {
    console.error('✗ Verified lyrics fetch FAILED');
    process.exit(1);
  }
}

testRegistry();
