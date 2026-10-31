import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');

// Find all tracks in CATALOG_CATEGORIES, MOVIE_PLAYLISTS, VIBE_PLAYLISTS, getFeaturedArtists, getArtistDetails
// Let's find every track object with `title` and `coverUrl`
const trackRegex = /\{\s*id:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*artist:\s*['"]([^'"]+)['"],(?:[^{}]+?)coverUrl:\s*['"]([^'"]+)['"](?:[^{}]+?)ytId:\s*['"]([^'"]+)['"]/gs;

const tracks = [];
let match;
while ((match = trackRegex.exec(content)) !== null) {
  tracks.push({
    id: match[1],
    title: match[2],
    artist: match[3],
    coverUrl: match[4],
    ytId: match[5]
  });
}

console.log('Total matched tracks with id, title, artist, coverUrl, ytId:', tracks.length);

// Count how many tracks share the same coverUrl
const coverMap = new Map();
tracks.forEach(t => {
  if (!coverMap.has(t.coverUrl)) coverMap.set(t.coverUrl, []);
  coverMap.get(t.coverUrl).push(t);
});

console.log('Unique cover URLs among these tracks:', coverMap.size);

coverMap.forEach((trackList, url) => {
  if (trackList.length > 1) {
    console.log(`\nDuplicate cover (${trackList.length} tracks): ${url.substring(0, 80)}`);
    trackList.forEach(t => console.log(`  - [${t.id}] "${t.title}" by ${t.artist} (ytId: ${t.ytId})`));
  }
});

