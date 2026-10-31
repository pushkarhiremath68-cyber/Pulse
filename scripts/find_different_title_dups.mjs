import {
  CATALOG_CATEGORIES,
  LANGUAGE_PLAYLISTS,
  getQuickPicks,
  getFeaturedArtists,
  MOVIE_PLAYLISTS,
  VIBE_PLAYLISTS,
  getArtistDetails
} from '../src/catalogService.js';

const allTracks = [];
const qp = getQuickPicks();
qp.forEach(t => allTracks.push({ source: 'QuickPicks', ...t }));

if (CATALOG_CATEGORIES) {
  Object.entries(CATALOG_CATEGORIES).forEach(([cat, val]) => {
    const trks = Array.isArray(val) ? val : (val.tracks || val.items || []);
    trks.forEach(t => allTracks.push({ source: `Cat:${cat}`, ...t }));
  });
}

if (LANGUAGE_PLAYLISTS) {
  Object.entries(LANGUAGE_PLAYLISTS).forEach(([lang, pl]) => {
    if (pl.tracks) pl.tracks.forEach(t => allTracks.push({ source: `Lang:${lang}`, ...t }));
  });
}

if (MOVIE_PLAYLISTS) {
  Object.entries(MOVIE_PLAYLISTS).forEach(([mov, pl]) => {
    if (pl.tracks) pl.tracks.forEach(t => allTracks.push({ source: `Movie:${mov}`, ...t }));
  });
}

if (VIBE_PLAYLISTS) {
  Object.entries(VIBE_PLAYLISTS).forEach(([vibe, pl]) => {
    if (pl.tracks) pl.tracks.forEach(t => allTracks.push({ source: `Vibe:${vibe}`, ...t }));
  });
}

const artists = getFeaturedArtists();
artists.forEach(a => {
  const details = getArtistDetails(a.id || a.name);
  if (details && details.topTracks) {
    details.topTracks.forEach(t => allTracks.push({ source: `ArtistTop10:${a.name}`, ...t }));
  }
});

const coverMap = new Map();
allTracks.forEach(t => {
  const cover = t.coverUrl || t.artwork || t.cover;
  if (!cover) return;
  if (!coverMap.has(cover)) coverMap.set(cover, []);
  coverMap.get(cover).push(t);
});

const differentTitleDups = [];
coverMap.forEach((tracks, url) => {
  const titles = new Set(tracks.map(t => t.title.toLowerCase().trim()));
  if (titles.size > 1) {
    differentTitleDups.push({ url, titles: Array.from(titles), tracks });
  }
});

console.log(`Found ${differentTitleDups.length} cover URLs shared by DIFFERENT song titles:`);
differentTitleDups.forEach(d => {
  console.log(`\nURL: ${d.url.substring(0, 80)}`);
  console.log(`Titles: ${d.titles.join(' | ')}`);
  d.tracks.forEach(t => console.log(`   - (${t.source}) "${t.title}" by ${t.artist} [id: ${t.id}, ytId: ${t.ytId}]`));
});

