import {
  CATALOG_CATEGORIES,
  LANGUAGE_PLAYLISTS,
  getQuickPicks,
  getFeaturedArtists,
  getCuratedPlaylists,
  MOVIE_PLAYLISTS,
  VIBE_PLAYLISTS,
  getArtistDetails,
  getHeroSlides
} from '../src/catalogService.js';

console.log('Successfully imported catalogService!');

const allTracks = [];

// 1. Quick Picks
try {
  const qp = getQuickPicks();
  qp.forEach(t => allTracks.push({ source: 'QuickPicks', ...t }));
} catch (e) { console.error('qp error', e); }

// 2. Categories
if (CATALOG_CATEGORIES) {
  if (Array.isArray(CATALOG_CATEGORIES)) {
    CATALOG_CATEGORIES.forEach(cat => {
      const trks = cat.tracks || cat.items || [];
      trks.forEach(t => allTracks.push({ source: `Cat:${cat.id || cat.title || 'cat'}`, ...t }));
    });
  } else {
    Object.entries(CATALOG_CATEGORIES).forEach(([cat, val]) => {
      const trks = Array.isArray(val) ? val : (val.tracks || val.items || []);
      trks.forEach(t => allTracks.push({ source: `Cat:${cat}`, ...t }));
    });
  }
}

// 3. Language Playlists
if (LANGUAGE_PLAYLISTS) {
  Object.entries(LANGUAGE_PLAYLISTS).forEach(([lang, pl]) => {
    if (pl.tracks) pl.tracks.forEach(t => allTracks.push({ source: `Lang:${lang}`, ...t }));
  });
}

// 4. Movie Playlists
if (MOVIE_PLAYLISTS) {
  Object.entries(MOVIE_PLAYLISTS).forEach(([mov, pl]) => {
    if (pl.tracks) pl.tracks.forEach(t => allTracks.push({ source: `Movie:${mov}`, ...t }));
  });
}

// 5. Vibe Playlists
if (VIBE_PLAYLISTS) {
  Object.entries(VIBE_PLAYLISTS).forEach(([vibe, pl]) => {
    if (pl.tracks) pl.tracks.forEach(t => allTracks.push({ source: `Vibe:${vibe}`, ...t }));
  });
}

// 6. Featured Artists & Artist Details
try {
  const artists = getFeaturedArtists();
  console.log(`Featured artists count: ${artists.length}`);
  artists.forEach(a => {
    const details = getArtistDetails(a.id || a.name);
    if (details && details.topTracks) {
      details.topTracks.forEach(t => allTracks.push({ source: `ArtistTop10:${a.name}`, ...t }));
    }
  });
} catch (e) { console.error('artists error', e); }

console.log(`Total collected tracks across app: ${allTracks.length}`);

// Group by coverUrl
const coverMap = new Map();
allTracks.forEach(t => {
  const cover = t.coverUrl || t.artwork || t.cover;
  if (!cover) return;
  if (!coverMap.has(cover)) coverMap.set(cover, []);
  coverMap.get(cover).push(t);
});

console.log(`Distinct cover URLs: ${coverMap.size}`);

const duplicates = [];
coverMap.forEach((tracks, url) => {
  if (tracks.length > 1) {
    duplicates.push({ url, count: tracks.length, tracks });
  }
});

duplicates.sort((a, b) => b.count - a.count);

console.log(`Number of duplicate cover URLs: ${duplicates.length}`);
duplicates.forEach(d => {
  console.log(`\n[${d.count}x] ${d.url.substring(0, 80)}`);
  d.tracks.forEach(t => console.log(`   - (${t.source}) "${t.title}" by ${t.artist} [id: ${t.id}, ytId: ${t.ytId}]`));
});
