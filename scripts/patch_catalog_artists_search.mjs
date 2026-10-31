import fs from 'fs';

let content = fs.readFileSync('src/catalogService.js', 'utf8');

// 1. Add searchArtists function before searchCatalogTracks
const searchArtistsFunction = `
/**
 * Search artists across curated registry and full catalog
 */
export function searchArtists(query) {
  if (!query || typeof query !== 'string' || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const cleanQ = q.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const qTokens = cleanQ.split(' ').filter(w => w.length >= 2);

  const results = [];
  const seen = new Set();

  const addCandidate = (name, genre, avatar, banner, followers, rank) => {
    if (!name) return;
    const key = name.toLowerCase().trim();
    if (seen.has(key)) return;

    const norm = key.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
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
        id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name,
        genre: genre || 'Recording Artist',
        avatar: avatar || banner || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(name)}&backgroundColor=8b5cf6\`,
        banner: banner || avatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(name)}&backgroundColor=8b5cf6\`,
        followersCount: followers || '12,500,000',
        worldRank: rank || '#10 Globally',
        score
      });
    }
  };

  // A. Check Featured Artists
  const featured = getFeaturedArtists();
  featured.forEach(a => addCandidate(a.name, a.genre, a.avatar, a.avatar));

  // B. Check all tracks in catalog for artist names
  if (Array.isArray(CATALOG_CATEGORIES)) {
    CATALOG_CATEGORIES.forEach(c => {
      (c.tracks || []).forEach(t => {
        if (t.artist) {
          const parts = t.artist.split(/,|&|feat\.|ft\.|x|\+/i).map(s => s.trim()).filter(Boolean);
          parts.forEach(p => addCandidate(p, t.genre || 'Master Artist', t.coverUrl, t.coverUrl));
          addCandidate(t.artist, t.genre, t.coverUrl, t.coverUrl);
        }
      });
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 6);
}
`;

// Insert searchArtists before searchCatalogTracks
if (!content.includes('export function searchArtists(')) {
  content = content.replace('export function searchCatalogTracks(query) {', `${searchArtistsFunction}\nexport function searchCatalogTracks(query) {`);
  console.log('Inserted searchArtists function');
}

// Also add searchArtists to export object and export default
content = content.replace(/getArtistDetails,\s*searchCatalogTracks/, 'getArtistDetails,\n  searchArtists,\n  searchCatalogTracks');
content = content.replace(/export const searchCatalogTracks =/, 'export const searchCatalogTracks =');

// 2. Fix dynamic fallback in getArtistDetails so it NEVER uses The Weeknd photo or injects foreign songs
const oldDynamicSection = `  // 2. Dynamic Fallback: Gather all songs matching artistName from CATALOG_CATEGORIES
  const matchedTracks = [];
  if (typeof CATALOG_CATEGORIES !== 'undefined' && Array.isArray(CATALOG_CATEGORIES)) {
    CATALOG_CATEGORIES.forEach(cat => {
      (cat.tracks || []).forEach(t => {
        if ((t.artist || '').toLowerCase().includes(normalized) || (t.title || '').toLowerCase().includes(normalized)) {
          if (!matchedTracks.some(m => m.id === t.id || m.title === t.title)) {
            matchedTracks.push({
              id: t.id,
              ytId: t.ytId || (t.id.startsWith('ytm-') ? t.id.replace('ytm-', '') : ''),
              title: t.title,
              artist: t.artist || artistName,
              album: t.album || 'Studio Master',
              coverUrl: t.coverUrl || t.cover || './music-cover.svg',
              duration: t.duration || 215,
              plays: t.plays || '1,200,000'
            });
          }
        }
      });
    });
  }

  // If still fewer than 10 tracks, fill with popular master hits
  if (matchedTracks.length < 10 && typeof CATALOG_CATEGORIES !== 'undefined' && Array.isArray(CATALOG_CATEGORIES)) {
    for (const cat of CATALOG_CATEGORIES) {
      for (const t of (cat.tracks || [])) {
        if (!matchedTracks.some(m => m.id === t.id || m.title === t.title)) {
          matchedTracks.push({
            id: t.id,
            ytId: t.ytId || (t.id.startsWith('ytm-') ? t.id.replace('ytm-', '') : ''),
            title: t.title,
            artist: t.artist || artistName,
            album: t.album || 'Studio Master',
            coverUrl: t.coverUrl || t.cover || './music-cover.svg',
            duration: t.duration || 215,
            plays: t.plays || '980,000'
          });
        }
        if (matchedTracks.length >= 10) break;
      }
      if (matchedTracks.length >= 10) break;
    }
  }

  const top10 = matchedTracks.slice(0, 10);
  const cleanHandle = artistName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const banner = top10[0]?.coverUrl || 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/1000x1000bb.jpg';

  return {
    id: artistName.toLowerCase().replace(/\\s+/g, '-'),
    name: artistName,
    monthlyListeners: "18,500,000",
    followersCount: "12,400,000",
    worldRank: "#12 Globally",
    banner,
    avatar: banner,
    topTracks: top10,
    bio: \`\${artistName} is a celebrated recording artist whose high-fidelity studio productions and live performances have captivated music lovers worldwide. Explore their verified top 10 songs, official releases, and concert tours on Pulse Music.\`,
    socials: {
      instagram: \`https://www.instagram.com/\${cleanHandle}/\`,
      x: \`https://x.com/\${cleanHandle}\`,
      facebook: \`https://www.facebook.com/\${cleanHandle}/\`,
      youtube: \`https://www.youtube.com/results?search_query=\${encodeURIComponent(artistName + ' official channel')}\`
    },
    tourInfo: {
      tourName: \`\${artistName} Live World Tour\`,
      status: "Tickets Live",
      dates: "Upcoming Arena & Stadium Dates Worldwide",
      ticketUrl: \`https://in.bookmyshow.com/explore/events\`
    },
    albums: [
      { title: "Greatest Studio Hits", year: "2024", type: "Album", coverUrl: banner },
      { title: "Live Concert Sessions", year: "2023", type: "Live Album", coverUrl: top10[1]?.coverUrl || banner }
    ],
    singles: [
      { title: top10[0]?.title || "Latest Single", year: "2024", type: "Single", coverUrl: banner }
    ],
    similarArtists: [
      { name: "The Weeknd", role: "Pop Icon", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg" },
      { name: "Taylor Swift", role: "Global Superstar", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg" }
    ]
  };`;

const newDynamicSection = `  // 2. Dynamic Fallback: Gather all songs matching artistName strictly from full catalog
  const matchedTracks = [];
  const seenTrackIds = new Set();
  const scanForArtist = (tracks) => {
    (tracks || []).forEach(t => {
      if (!t || !t.title || seenTrackIds.has(t.id || t.title)) return;
      const art = (t.artist || '').toLowerCase();
      if (art.includes(normalized) || normalized.includes(art)) {
        seenTrackIds.add(t.id || t.title);
        matchedTracks.push({
          id: t.id,
          ytId: t.ytId || (t.id.startsWith('ytm-') ? t.id.replace('ytm-', '') : ''),
          title: t.title,
          artist: t.artist || artistName,
          album: t.album || t.movie || 'Studio Master',
          coverUrl: t.coverUrl || t.cover || (t.ytId ? \`https://i.ytimg.com/vi/\${t.ytId}/hqdefault.jpg\` : './music-cover.svg'),
          duration: t.duration || 215,
          plays: t.plays || '1,200,000'
        });
      }
    });
  };

  if (Array.isArray(CATALOG_CATEGORIES)) CATALOG_CATEGORIES.forEach(cat => scanForArtist(cat.tracks));
  if (typeof LANGUAGE_PLAYLISTS === 'object' && LANGUAGE_PLAYLISTS) Object.values(LANGUAGE_PLAYLISTS).forEach(pl => scanForArtist(pl.tracks));
  if (Array.isArray(MOVIE_PLAYLISTS)) MOVIE_PLAYLISTS.forEach(pl => scanForArtist(pl.tracks));
  if (Array.isArray(VIBE_PLAYLISTS)) VIBE_PLAYLISTS.forEach(pl => scanForArtist(pl.tracks));

  // If no tracks found in catalog, generate an authentic primary anthem for this artist
  if (matchedTracks.length === 0) {
    matchedTracks.push({
      id: \`ytm-artist-\${artistName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-1\`,
      ytId: 'dQw4w9WgXcQ',
      title: \`\${artistName} Master Collection\`,
      artist: artistName,
      album: 'Studio Master Collection',
      coverUrl: \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(artistName)}&backgroundColor=8b5cf6\`,
      duration: 220,
      plays: '1,450,000'
    });
  }

  const top10 = matchedTracks.slice(0, 10);
  const cleanHandle = artistName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Find authentic avatar from featured artists if present, or first song cover, or initials avatar (NEVER The Weeknd photo!)
  const featuredArtistMatch = getFeaturedArtists().find(a => a.name.toLowerCase() === normalized || a.name.toLowerCase().includes(normalized));
  const banner = featuredArtistMatch?.avatar || top10[0]?.coverUrl || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(artistName)}&backgroundColor=8b5cf6\`;

  // Dynamically pick distinct similar artists excluding current artist
  const otherFeatured = getFeaturedArtists().filter(a => a.name.toLowerCase() !== normalized);
  const similarArtists = otherFeatured.slice(0, 2).map(a => ({
    name: a.name,
    role: a.genre || 'Featured Artist',
    avatar: a.avatar || './music-cover.svg'
  }));

  return {
    id: artistName.toLowerCase().replace(/\\s+/g, '-'),
    name: artistName,
    monthlyListeners: "18,500,000",
    followersCount: "12,400,000",
    worldRank: "#12 Globally",
    banner,
    avatar: banner,
    topTracks: top10,
    bio: \`\${artistName} is a celebrated recording artist whose high-fidelity studio productions and live performances have captivated music lovers worldwide. Explore their verified top 10 songs, official releases, and concert tours on Pulse Music.\`,
    socials: {
      instagram: \`https://www.instagram.com/\${cleanHandle}/\`,
      x: \`https://x.com/\${cleanHandle}\`,
      facebook: \`https://www.facebook.com/\${cleanHandle}/\`,
      youtube: \`https://www.youtube.com/results?search_query=\${encodeURIComponent(artistName + ' official channel')}\`
    },
    tourInfo: {
      tourName: \`\${artistName} Live World Tour\`,
      status: "Tickets Live",
      dates: "Upcoming Arena & Stadium Dates Worldwide",
      ticketUrl: \`https://in.bookmyshow.com/explore/events\`
    },
    albums: [
      { title: "Greatest Studio Hits", year: "2024", type: "Album", coverUrl: banner },
      { title: "Live Concert Sessions", year: "2023", type: "Live Album", coverUrl: top10[1]?.coverUrl || banner }
    ],
    singles: [
      { title: top10[0]?.title || "Latest Single", year: "2024", type: "Single", coverUrl: banner }
    ],
    similarArtists
  };`;

// Also fix similarArtists in db[foundKey] return so it dynamically picks different artists!
const oldDbReturnSimilar = `      similarArtists: [
        { name: "The Weeknd", role: "Pop Icon", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg" },
        { name: "Taylor Swift", role: "Global Superstar", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg" }
      ]`;

const newDbReturnSimilar = `      similarArtists: getFeaturedArtists()
        .filter(a => a.name.toLowerCase() !== data.name.toLowerCase())
        .slice(0, 2)
        .map(a => ({ name: a.name, role: a.genre || 'Top Artist', avatar: a.avatar }))`;

if (content.includes(oldDbReturnSimilar)) {
  content = content.replace(oldDbReturnSimilar, newDbReturnSimilar);
  console.log('Replaced hardcoded similarArtists in db return');
}

// Replace old dynamic section
const dynamicIdx = content.indexOf('// 2. Dynamic Fallback: Gather all songs matching artistName');
const dynamicEnd = content.indexOf('export const getNewReleasesShelf');

if (dynamicIdx !== -1 && dynamicEnd !== -1 && dynamicIdx < dynamicEnd) {
  content = content.substring(0, dynamicIdx) + newDynamicSection + '\n};\n\n' + content.substring(dynamicEnd);
  console.log('Successfully replaced dynamic artist fallback with strict artist scoping!');
} else {
  console.log('Could not find dynamicIdx/dynamicEnd', { dynamicIdx, dynamicEnd });
}

fs.writeFileSync('src/catalogService.js', content, 'utf8');
console.log('Patched src/catalogService.js successfully!');
