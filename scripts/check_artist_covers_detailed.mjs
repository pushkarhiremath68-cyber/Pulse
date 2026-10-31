import { getArtistDetails, getFeaturedArtists } from '../src/catalogService.js';

const featured = getFeaturedArtists();
featured.forEach(a => {
  const details = getArtistDetails(a.id || a.name);
  console.log(`\n========================================`);
  console.log(`ARTIST: ${a.name} (id: ${a.id})`);
  if (!details || !details.topTracks) {
    console.log('No details or topTracks');
    return;
  }
  const covers = new Set();
  details.topTracks.forEach((t, i) => {
    const isDup = covers.has(t.coverUrl);
    covers.add(t.coverUrl);
    console.log(`  ${i + 1}. "${t.title}" - ${t.artist} [ytId: ${t.ytId}] ${isDup ? '<< DUPLICATE COVER' : ''}`);
    console.log(`     Cover: ${t.coverUrl}`);
  });
});

