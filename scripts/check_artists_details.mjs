import { getArtistDetails, getFeaturedArtists } from '../src/catalogService.js';

const featured = getFeaturedArtists();
console.log('Featured artists list:');
featured.forEach(a => {
  const details = getArtistDetails(a.id || a.name);
  console.log(`- ID: ${a.id}, Name: ${a.name}`);
  if (details) {
    console.log(`  Top tracks count: ${details.topTracks?.length || 0}`);
    if (details.topTracks && details.topTracks.length > 0) {
      console.log(`  First track: "${details.topTracks[0].title}" by ${details.topTracks[0].artist}`);
      console.log(`  First cover: ${details.topTracks[0].coverUrl}`);
    }
  } else {
    console.log(`  NO DETAILS RETURNED`);
  }
});
