import fs from 'fs';

let content = fs.readFileSync('src/musicService.js', 'utf8');

// Normalize line endings for replacement
const isCRLF = content.includes('\r\n');
if (isCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. In fetchDynamicArtistProfile: resolve authentic portrait
const oldProfileSnippet = `    // High-resolution master wallpaper / artwork (1000x1000 master)
    const bestCover = (finalSongs[0]?.artworkUrl100 || '').replace('100x100bb', '1000x1000bb');

    // Guarantee at least 10 top tracks
    let extendedSongs = [...finalSongs];
    if (extendedSongs.length < 10) {
      const needed = 10 - extendedSongs.length;
      for (let i = 0; i < needed; i++) {
        extendedSongs.push({
          trackId: \`pulse-dyn-\${i + 1}\`,
          trackName: \`\${canonicalName} - Master Hit #\${extendedSongs.length + 1}\`,
          artistName: canonicalName,
          collectionName: \`\${canonicalName} Definitive Collection\`,
          artworkUrl100: bestCover,
          trackTimeMillis: (210 + (i * 12)) * 1000
        });
      }
    }

    const topTracks = extendedSongs.slice(0, 10).map((t, idx) => ({
      id: \`itunes-\${t.trackId || Math.random().toString(36).substr(2, 8)}\`,
      ytId: '',
      title: t.trackName,
      artist: t.artistName || canonicalName,
      album: t.collectionName || 'Studio Master Release',
      coverUrl: (t.artworkUrl100 || '').replace('100x100bb', '600x600bb') || bestCover,
      duration: Math.round((t.trackTimeMillis || 215000) / 1000),
      plays: (1000000000 - (idx * 65000000)).toLocaleString()
    }));

    const cleanHandle = canonicalName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const listenersVal = \`\${(25000000 + Math.floor(Math.random() * 30000000)).toLocaleString()}\`;
    const followersVal = \`\${(18000000 + Math.floor(Math.random() * 20000000)).toLocaleString()}\`;
    const rankVal = \`#\${Math.floor(Math.random() * 12) + 1} in \${genre}\`;

    const profile = {
      id: cleanKey,
      name: canonicalName,
      monthlyListeners: listenersVal,
      followersCount: followersVal,
      worldRank: rankVal,
      banner: bestCover,
      avatar: bestCover,`;

const newProfileSnippet = `    // High-resolution master wallpaper / artwork (1000x1000 master)
    const bestCover = (finalSongs[0]?.artworkUrl100 || '').replace('100x100bb', '1000x1000bb') || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80';

    // Fetch authentic artist portrait from Deezer to prevent movie soundtrack covers with actors from masking singer face
    let authenticPortrait = null;
    try {
      const dzRes = await fetch(\`https://api.deezer.com/search/artist?q=\${encodeURIComponent(canonicalName)}&limit=5\`, { signal: AbortSignal.timeout(2000) });
      if (dzRes.ok) {
        const dzData = await dzRes.json();
        if (dzData && Array.isArray(dzData.data) && dzData.data.length > 0) {
          const sorted = dzData.data.filter(d => d.picture_xl && !d.picture_xl.endsWith('/1000x1000-000000-80-0-0.jpg')).sort((a,b) => (b.nb_fan || 0) - (a.nb_fan || 0));
          const exact = sorted.find(d => d.name.toLowerCase() === canonicalName.toLowerCase());
          const best = exact || sorted[0];
          if (best?.picture_xl) authenticPortrait = best.picture_xl;
        }
      }
    } catch (e) {}

    const artistPhoto = authenticPortrait || bestCover;

    // Guarantee at least 10 top tracks
    let extendedSongs = [...finalSongs];
    if (extendedSongs.length < 10) {
      const needed = 10 - extendedSongs.length;
      for (let i = 0; i < needed; i++) {
        extendedSongs.push({
          trackId: \`pulse-dyn-\${i + 1}\`,
          trackName: \`\${canonicalName} - Master Hit #\${extendedSongs.length + 1}\`,
          artistName: canonicalName,
          collectionName: \`\${canonicalName} Definitive Collection\`,
          artworkUrl100: bestCover,
          trackTimeMillis: (210 + (i * 12)) * 1000
        });
      }
    }

    const topTracks = extendedSongs.slice(0, 10).map((t, idx) => ({
      id: \`itunes-\${t.trackId || Math.random().toString(36).substr(2, 8)}\`,
      ytId: '',
      title: t.trackName,
      artist: t.artistName || canonicalName,
      album: t.collectionName || 'Studio Master Release',
      coverUrl: (t.artworkUrl100 || '').replace('100x100bb', '600x600bb') || bestCover,
      duration: Math.round((t.trackTimeMillis || 215000) / 1000),
      plays: (1000000000 - (idx * 65000000)).toLocaleString()
    }));

    const cleanHandle = canonicalName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const listenersVal = \`\${(25000000 + Math.floor(Math.random() * 30000000)).toLocaleString()}\`;
    const followersVal = \`\${(18000000 + Math.floor(Math.random() * 20000000)).toLocaleString()}\`;
    const rankVal = \`#\${Math.floor(Math.random() * 12) + 1} in \${genre}\`;

    const profile = {
      id: cleanKey,
      name: canonicalName,
      monthlyListeners: listenersVal,
      followersCount: followersVal,
      worldRank: rankVal,
      banner: artistPhoto,
      avatar: artistPhoto,`;

if (!content.includes(oldProfileSnippet)) {
  console.error('Could not find oldProfileSnippet in musicService.js');
  process.exit(1);
}

content = content.replace(oldProfileSnippet, newProfileSnippet);

// 2. In searchDynamicArtists: check curated catalog first, then query Deezer
const oldSearchSnippet = `export async function searchDynamicArtists(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  
  try {
    const res = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(q)}&entity=musicArtist&limit=3\`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.results)) return [];

    const validArtists = data.results.filter(a => a && a.artistName);
    const candidates = await Promise.all(
      validArtists.map(async (art) => {
        let avatar = '';
        try {
          const trackRes = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(art.artistName)}&entity=song&limit=1\`, { signal: AbortSignal.timeout(1200) });
          if (trackRes.ok) {
            const tData = await trackRes.json();
            if (tData?.results?.[0]?.artworkUrl100) {
              avatar = tData.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
            }
          }
        } catch (e) {}

        return {
          id: art.artistName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: art.artistName,
          genre: art.primaryGenreName || 'Verified Artist',
          avatar: avatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(art.artistName)}&backgroundColor=8b5cf6\`,
          banner: avatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(art.artistName)}&backgroundColor=8b5cf6\`,
          followersCount: '20,000,000',
          worldRank: \`#1 in \${art.primaryGenreName || 'Music'}\`,
          score: 95
        };
      })
    );

    return candidates.filter(Boolean);
  } catch (e) {
    return [];
  }
}`;

const newSearchSnippet = `export async function searchDynamicArtists(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  // 1. Check verified curated artists in catalog first
  if (typeof window !== 'undefined' && window.catalogService && typeof window.catalogService.searchArtists === 'function') {
    const local = window.catalogService.searchArtists(q);
    if (local && local.length > 0) return local;
  }
  
  try {
    // 2. Query Deezer for authentic artist headshots (avoids movie poster actor covers)
    const dzRes = await fetch(\`https://api.deezer.com/search/artist?q=\${encodeURIComponent(q)}&limit=5\`, { signal: AbortSignal.timeout(2000) });
    if (dzRes.ok) {
      const dzData = await dzRes.json();
      if (dzData && Array.isArray(dzData.data) && dzData.data.length > 0) {
        const valid = dzData.data.filter(a => a && a.picture_xl && !a.picture_xl.endsWith('/1000x1000-000000-80-0-0.jpg'));
        if (valid.length > 0) {
          return valid.map(art => ({
            id: art.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: art.name,
            genre: 'Verified Artist',
            avatar: art.picture_xl || art.picture_big,
            banner: art.picture_xl || art.picture_big,
            followersCount: (art.nb_fan || 25000).toLocaleString(),
            worldRank: '#1 Verified Artist',
            score: 95
          }));
        }
      }
    }
  } catch (e) {}

  // 3. Fallback to iTunes if Deezer unavailable
  try {
    const res = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(q)}&entity=musicArtist&limit=3\`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.results)) return [];

    const validArtists = data.results.filter(a => a && a.artistName);
    const candidates = await Promise.all(
      validArtists.map(async (art) => {
        let avatar = '';
        try {
          const trackRes = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(art.artistName)}&entity=song&limit=1\`, { signal: AbortSignal.timeout(1200) });
          if (trackRes.ok) {
            const tData = await trackRes.json();
            if (tData?.results?.[0]?.artworkUrl100) {
              avatar = tData.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
            }
          }
        } catch (e) {}

        return {
          id: art.artistName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: art.artistName,
          genre: art.primaryGenreName || 'Verified Artist',
          avatar: avatar || \`https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80\`,
          banner: avatar || \`https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80\`,
          followersCount: '20,000,000',
          worldRank: \`#1 in \${art.primaryGenreName || 'Music'}\`,
          score: 95
        };
      })
    );

    return candidates.filter(Boolean);
  } catch (e) {
    return [];
  }
}`;

if (!content.includes(oldSearchSnippet)) {
  console.error('Could not find oldSearchSnippet in musicService.js');
  process.exit(1);
}

content = content.replace(oldSearchSnippet, newSearchSnippet);

// Restore original line endings
if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync('src/musicService.js', content);
console.log('Successfully updated src/musicService.js');
