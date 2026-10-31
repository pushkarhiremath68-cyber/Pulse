import fs from 'fs';

let content = fs.readFileSync('src/catalogService.js', 'utf8');

// 1. Locate db in getArtistDetails
const dbStartStr = '  const db = {\n  "arijit-singh": {';
const dbEndStr = '    ]\n  }\n};\n\n  // 1. Direct or fuzzy lookup in curated artist registry';

const dbStartIndex = content.indexOf(dbStartStr);
const dbEndIndex = content.indexOf(dbEndStr);

if (dbStartIndex === -1 || dbEndIndex === -1) {
  console.error('Could not locate db bounds!', { dbStartIndex, dbEndIndex });
  process.exit(1);
}

// Extract the raw db object
const rawDbContent = content.substring(dbStartIndex + '  const db = '.length, dbEndIndex + '    ]\n  }\n}'.length);

// Remove the db definition from inside getArtistDetails and replace with const db = ARTIST_DATABASE;
const beforeDb = content.substring(0, dbStartIndex);
const afterDb = content.substring(dbEndIndex + '    ]\n  }\n};'.length);

let newContent = beforeDb + '  const db = ARTIST_DATABASE;' + afterDb;

// Place export const ARTIST_DATABASE = ... before searchArtists
const artistDbDeclaration = `\n/**\n * Curated Comprehensive Artist Database\n */\nexport const ARTIST_DATABASE = ${rawDbContent};\n`;

const searchArtistsMarker = '/**\n * Search artists across curated registry and full catalog\n */\nexport function searchArtists(query) {';

if (!newContent.includes(searchArtistsMarker)) {
  console.error('Could not locate searchArtistsMarker');
  process.exit(1);
}

// Rewritten searchArtists function with fixed regex and ARTIST_DATABASE scanning
const newSearchArtistsFunction = `/**
 * Curated Comprehensive Artist Database
 */
export const ARTIST_DATABASE = ${rawDbContent};

/**
 * Search artists across curated registry and full catalog
 */
export function searchArtists(query) {
  if (!query || typeof query !== 'string' || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const cleanQ = q.replace(/[^a-z0-9\\s]/g, ' ').replace(/\\s+/g, ' ').trim();
  const qTokens = cleanQ.split(' ').filter(w => w.length >= 2);

  const results = [];
  const seen = new Set();

  const addCandidate = (name, genre, avatar, banner, followers, rank) => {
    if (!name) return;
    const trimmed = name.trim();
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;

    const norm = key.replace(/[^a-z0-9\\s]/g, ' ').replace(/\\s+/g, ' ').trim();
    let score = 0;

    if (norm === cleanQ) score = 100;
    else if (norm.startsWith(cleanQ)) score = 85;
    else if (cleanQ.startsWith(norm)) score = 80;
    else if (norm.includes(cleanQ)) score = 70;
    else {
      const matchTokens = qTokens.filter(t => norm.includes(t));
      if (matchTokens.length > 0) {
        score = 40 + (matchTokens.length * 15);
      }
    }

    if (score > 0) {
      seen.add(key);
      results.push({
        id: trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: trimmed,
        genre: genre || 'Recording Artist',
        avatar: avatar || banner || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(trimmed)}&backgroundColor=8b5cf6\`,
        banner: banner || avatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(trimmed)}&backgroundColor=8b5cf6\`,
        followersCount: followers || '12,500,000',
        worldRank: rank || '#10 Globally',
        score
      });
    }
  };

  // A. Check Curated ARTIST_DATABASE first (highest quality metadata)
  if (typeof ARTIST_DATABASE === 'object' && ARTIST_DATABASE) {
    Object.values(ARTIST_DATABASE).forEach(art => {
      addCandidate(art.name, art.genre || 'Verified Artist', art.avatar || art.banner, art.banner || art.avatar, art.followersCount, art.worldRank);
    });
  }

  // B. Check Featured Artists
  const featured = getFeaturedArtists();
  featured.forEach(a => addCandidate(a.name, a.genre, a.avatar, a.avatar));

  // C. Check all tracks across all playlists in catalog for artist names
  const scanTrackList = (tracks, fallbackGenre) => {
    (tracks || []).forEach(t => {
      if (t && t.artist) {
        const parts = t.artist.split(/,|&|\\bfeat\\.?|\\bft\\.?|x|\\+/i).map(s => s.trim()).filter(Boolean);
        parts.forEach(p => addCandidate(p, t.genre || fallbackGenre || 'Master Artist', t.coverUrl, t.coverUrl));
        addCandidate(t.artist, t.genre || fallbackGenre, t.coverUrl, t.coverUrl);
      }
    });
  };

  if (Array.isArray(CATALOG_CATEGORIES)) CATALOG_CATEGORIES.forEach(c => scanTrackList(c.tracks, c.title));
  if (typeof LANGUAGE_PLAYLISTS === 'object' && LANGUAGE_PLAYLISTS) Object.values(LANGUAGE_PLAYLISTS).forEach(pl => scanTrackList(pl.tracks, pl.title));
  if (Array.isArray(MOVIE_PLAYLISTS)) MOVIE_PLAYLISTS.forEach(pl => scanTrackList(pl.tracks, pl.title));
  if (Array.isArray(VIBE_PLAYLISTS)) VIBE_PLAYLISTS.forEach(pl => scanTrackList(pl.tracks, pl.title));

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 8);
}
`;

// Replace searchArtists block
const searchArtistsEndIndex = newContent.indexOf('export function searchCatalogTracks(query) {');
const searchArtistsStartIndex = newContent.indexOf('/**\n * Search artists across curated registry and full catalog\n */');

if (searchArtistsStartIndex === -1 || searchArtistsEndIndex === -1) {
  console.error('Could not locate searchArtists block');
  process.exit(1);
}

newContent = newContent.substring(0, searchArtistsStartIndex) + newSearchArtistsFunction + '\n' + newContent.substring(searchArtistsEndIndex);

// Also add ARTIST_DATABASE to default export object
newContent = newContent.replace('export default {', 'export default {\n  ARTIST_DATABASE,');

fs.writeFileSync('src/catalogService.js', newContent, 'utf8');
console.log('Successfully hoisted ARTIST_DATABASE and updated searchArtists!');
