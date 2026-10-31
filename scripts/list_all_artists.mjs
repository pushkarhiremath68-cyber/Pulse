import {
  CATALOG_CATEGORIES,
  LANGUAGE_PLAYLISTS,
  MOVIE_PLAYLISTS,
  getFeaturedArtists
} from '../src/catalogService.js';

const artistSet = new Set();
const featured = getFeaturedArtists();
featured.forEach(a => artistSet.add(a.name));

CATALOG_CATEGORIES.forEach(cat => {
  (cat.tracks || []).forEach(t => {
    if (t.artist) artistSet.add(t.artist);
  });
});

if (LANGUAGE_PLAYLISTS) {
  Object.values(LANGUAGE_PLAYLISTS).forEach(pl => {
    (pl.tracks || []).forEach(t => {
      if (t.artist) artistSet.add(t.artist);
    });
  });
}

if (MOVIE_PLAYLISTS) {
  MOVIE_PLAYLISTS.forEach(pl => {
    (pl.tracks || []).forEach(t => {
      if (t.artist) artistSet.add(t.artist);
    });
  });
}

console.log('Total artists in catalog:', artistSet.size);
console.log('Sample artists:', Array.from(artistSet).slice(0, 40));
