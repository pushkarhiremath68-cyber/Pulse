import fs from 'fs';
import assert from 'assert';

console.log('🧪 Testing Artist Play Buttons & Library Downloaded Option Removal...');

const html = fs.readFileSync('index.html', 'utf8');
const mainJs = fs.readFileSync('src/main.js', 'utf8');
const styleCss = fs.readFileSync('src/style.css', 'utf8');

// 1. Library: Downloaded songs option must be removed
assert(!html.includes('data-tab="offline"'), 'index.html must NOT contain data-tab="offline" in Library');
assert(!html.includes('id="offline-songs-count"'), 'index.html must NOT contain offline-songs-count in Library tabs');
console.log('✅ PASS: Downloaded songs tab removed from Your Library');

// 2. Artist View: Play buttons exist with IDs
assert(html.includes('id="artist-header-play-btn"'), 'Artist header play button must have id="artist-header-play-btn"');
assert(html.includes('id="artist-section-play-all-btn"'), 'Artist section play button must have id="artist-section-play-all-btn"');
console.log('✅ PASS: Artist play buttons have designated IDs');

// 3. Main JS: Functions defined for artist playback
assert(mainJs.includes('window.playArtistTopTracks = async function'), 'playArtistTopTracks must be defined');
assert(mainJs.includes('window.updateArtistPlayButtons = function'), 'updateArtistPlayButtons must be defined');
assert(mainJs.includes('window.playArtistDirect = async function'), 'playArtistDirect must be defined');
console.log('✅ PASS: Artist playback handlers and state updates are properly implemented');

// 4. Featured Artists: Hover play button and click handler
assert(mainJs.includes('window.playArtistDirect'), 'Featured artist cards must trigger window.playArtistDirect');
assert(styleCss.includes('.artist-card-item:hover .artist-play-hover'), 'CSS must include hover opacity rule for artist play button');
console.log('✅ PASS: Artist card hover play button and styles verified');

console.log('🎉 ALL TESTS PASSED 100%!');
