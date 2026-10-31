import fs from 'fs';
import { searchArtists, getArtistDetails, ARTIST_DATABASE } from '../src/catalogService.js';

console.log('--- 1. Testing searchArtists ---');
const testQueries = ['weeknd', 'arijit', 'diljit', 'sonu', 'atif', 'billie', 'coldplay', 'taylor'];
testQueries.forEach(q => {
  const matches = searchArtists(q);
  if (!matches || matches.length === 0) {
    throw new Error(`searchArtists returned empty for query: "${q}"`);
  }
  const top = matches[0];
  console.log(`✓ Query "${q}": found ${matches.length} matches. Top: ${top.name} (${top.genre}), Avatar: ${top.avatar.substring(0, 45)}...`);
});

console.log('\n--- 2. Testing getArtistDetails (Scoping & Photos) ---');
const artistsToCheck = ['Sonu Nigam', 'Arijit Singh', 'The Weeknd', 'Taylor Swift', 'Diljit Dosanjh', 'Billie Eilish'];
artistsToCheck.forEach(name => {
  const details = getArtistDetails(name);
  if (!details || !details.name) {
    throw new Error(`getArtistDetails failed for "${name}"`);
  }
  if (name !== 'The Weeknd' && (details.banner.includes('18UMGIM17204') || details.banner.includes('19UM1IM04638'))) {
    throw new Error(`Artist "${name}" is using The Weeknd's photo!`);
  }
  // Check similar artists
  if (details.similarArtists) {
    details.similarArtists.forEach(sim => {
      if (sim.name.toLowerCase() === details.name.toLowerCase()) {
        throw new Error(`Artist "${name}" has themselves in similarArtists!`);
      }
    });
  }
  console.log(`✓ Artist "${details.name}": banner is authentic (${details.banner.substring(0, 45)}...), topTracks: ${details.topTracks?.length || 0}`);
});

console.log('\n--- 3. Testing HTML Structure ---');
const html = fs.readFileSync('index.html', 'utf8');

// Verify Left Sidebar Followed Artists
if (!html.includes('id="sidebar-followed-section"') || 
    !html.includes('id="sidebar-followed-badge"') || 
    !html.includes('id="sidebar-followed-list"')) {
  throw new Error('Missing sidebar-followed-section or elements in index.html!');
}
console.log('✓ Sidebar contains #sidebar-followed-section, #sidebar-followed-badge, #sidebar-followed-list');

if (html.includes('>COLLECTIONS<') || html.includes('Trending Hits</span>')) {
  throw new Error('Old COLLECTIONS section is still present in index.html!');
}
console.log('✓ Old COLLECTIONS section successfully removed from left sidebar');

// Verify Search Artists Shelf
if (!html.includes('id="search-artists-section"') || !html.includes('id="search-artists-container"')) {
  throw new Error('Missing search-artists-section or search-artists-container in index.html!');
}
console.log('✓ Search view contains #search-artists-section and #search-artists-container');

console.log('\n ALL TESTS PASSED SUCCESSFULLY! 🎉');
