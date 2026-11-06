import fs from 'fs';

let content = fs.readFileSync('src/catalogService.js', 'utf8');

// 1. Add cover normalization right after CATALOG_CATEGORIES definition
const catTarget = 'export const CATALOG_CATEGORIES = [';
if (!content.includes('// Normalize CATALOG_CATEGORIES tracks to ensure both coverUrl and cover exist')) {
  // Find where CATALOG_CATEGORIES ends
  const catEndAnchor = 'export const LANGUAGE_PLAYLISTS = {';
  const catEndIdx = content.indexOf(catEndAnchor);
  if (catEndIdx !== -1) {
    const normalizationCode = `// Normalize CATALOG_CATEGORIES tracks to ensure both coverUrl and cover exist
if (Array.isArray(CATALOG_CATEGORIES)) {
  CATALOG_CATEGORIES.forEach(cat => {
    if (Array.isArray(cat.tracks)) {
      cat.tracks.forEach(t => {
        if (!t.coverUrl && t.cover) t.coverUrl = t.cover;
        if (!t.cover && t.coverUrl) t.cover = t.coverUrl;
      });
    }
  });
}

`;
    content = content.slice(0, catEndIdx) + normalizationCode + content.slice(catEndIdx);
  }
}

// 2. Add findCatalogCover function
const findCatalogCoverCode = `export function findCatalogCover(title, artist) {
  if (!title) return null;
  const cleanT = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanA = (artist || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Check ARTIST_DATABASE top tracks
  if (typeof ARTIST_DATABASE === 'object' && ARTIST_DATABASE) {
    for (const art of Object.values(ARTIST_DATABASE)) {
      if (Array.isArray(art.topTracks)) {
        for (const t of art.topTracks) {
          const tClean = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (tClean === cleanT || (cleanT.length >= 4 && (tClean.includes(cleanT) || cleanT.includes(tClean)))) {
            const c = t.coverUrl || t.cover;
            if (c && !c.includes('music-cover.svg')) return c;
          }
        }
      }
    }
  }

  // 2. Check CATALOG_CATEGORIES
  if (Array.isArray(CATALOG_CATEGORIES)) {
    for (const cat of CATALOG_CATEGORIES) {
      if (Array.isArray(cat.tracks)) {
        for (const t of cat.tracks) {
          const tClean = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (tClean === cleanT || (cleanT.length >= 4 && (tClean.includes(cleanT) || cleanT.includes(tClean)))) {
            const c = t.coverUrl || t.cover;
            if (c && !c.includes('music-cover.svg')) return c;
          }
        }
      }
    }
  }

  // 3. Check LANGUAGE_PLAYLISTS, MOVIE_PLAYLISTS, VIBE_PLAYLISTS
  const allPlaylists = [
    ...(typeof LANGUAGE_PLAYLISTS === 'object' ? Object.values(LANGUAGE_PLAYLISTS) : []),
    ...(Array.isArray(MOVIE_PLAYLISTS) ? MOVIE_PLAYLISTS : []),
    ...(Array.isArray(VIBE_PLAYLISTS) ? VIBE_PLAYLISTS : [])
  ];
  for (const pl of allPlaylists) {
    if (Array.isArray(pl.tracks)) {
      for (const t of pl.tracks) {
        const tClean = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (tClean === cleanT || (cleanT.length >= 4 && (tClean.includes(cleanT) || cleanT.includes(tClean)))) {
          const c = t.coverUrl || t.cover;
          if (c && !c.includes('music-cover.svg')) return c;
        }
      }
    }
  }

  return null;
}
`;

if (!content.includes('export function findCatalogCover')) {
  const exportTarget = 'export const getNewReleasesShelf = () => {';
  const exportIdx = content.indexOf(exportTarget);
  if (exportIdx !== -1) {
    content = content.slice(0, exportIdx) + findCatalogCoverCode + '\n' + content.slice(exportIdx);
  }
}

// 3. Update getNewReleasesShelf to guarantee coverUrl is present
const oldGetNewReleases = `export const getNewReleasesShelf = () => {
  if (typeof window !== 'undefined' && window.newReleasesService && typeof window.newReleasesService.getCachedNewReleases === 'function') {
    return window.newReleasesService.getCachedNewReleases();
  }
  const cat = CATALOG_CATEGORIES.find(c => c.id === 'cat-new-releases');
  return cat ? cat.tracks : [];
};`;

const newGetNewReleases = `export const getNewReleasesShelf = () => {
  let tracks = [];
  if (typeof window !== 'undefined' && window.newReleasesService && typeof window.newReleasesService.getCachedNewReleases === 'function') {
    tracks = window.newReleasesService.getCachedNewReleases();
  } else {
    const cat = CATALOG_CATEGORIES.find(c => c.id === 'cat-new-releases');
    tracks = cat ? cat.tracks : [];
  }
  return tracks.map(t => ({
    ...t,
    coverUrl: t.coverUrl || t.cover || (t.ytId ? \`https://i.ytimg.com/vi/\${t.ytId}/hqdefault.jpg\` : './music-cover.svg'),
    cover: t.cover || t.coverUrl || (t.ytId ? \`https://i.ytimg.com/vi/\${t.ytId}/hqdefault.jpg\` : './music-cover.svg')
  }));
};`;

if (content.includes(oldGetNewReleases)) {
  content = content.replace(oldGetNewReleases, newGetNewReleases);
}

// 4. Update default export list at bottom of catalogService.js
if (!content.includes('findCatalogCover,') && content.includes('getNewReleasesShelf,')) {
  content = content.replace('getNewReleasesShelf,', 'getNewReleasesShelf,\n  findCatalogCover,');
}

fs.writeFileSync('src/catalogService.js', content, 'utf8');
console.log('Successfully patched catalogService.js with cover normalization and findCatalogCover!');

