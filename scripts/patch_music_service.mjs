import fs from 'fs';

let content = fs.readFileSync('src/musicService.js', 'utf8');

const anchor = 'export async function fetchDynamicArtistData(artistName) {';
const anchorIdx = content.indexOf(anchor);

if (anchorIdx === -1) {
  console.error('Could not find anchor');
  process.exit(1);
}

const newMethods = `export async function fetchDynamicArtistProfile(artistName) {
  if (!artistName || typeof artistName !== 'string') return null;
  const norm = artistName.toLowerCase().trim();
  const cleanKey = norm.replace(/[^a-z0-9]/g, '-');

  // 1. Check ARTIST_DATABASE in catalogService first
  if (typeof window !== 'undefined' && window.catalogService?.ARTIST_DATABASE) {
    const db = window.catalogService.ARTIST_DATABASE;
    if (db[cleanKey]) return db[cleanKey];
    const matchKey = Object.keys(db).find(k => {
      const art = db[k];
      return art && (art.name.toLowerCase() === norm || norm.includes(art.name.toLowerCase()) || art.name.toLowerCase().includes(norm));
    });
    if (matchKey && db[matchKey]) return db[matchKey];
  }

  // 2. Check LocalStorage cache
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(\`pulse_artist_\${cleanKey}\`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.topTracks && parsed.topTracks.length > 0) return parsed;
      }
    }
  } catch (e) {}

  try {
    // 3. Query iTunes Search API for both artist entity and top songs in parallel
    const artistPromise = fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(artistName)}&entity=musicArtist&limit=3\`, { signal: AbortSignal.timeout(4000) })
      .then(r => r.ok ? r.json() : null).catch(() => null);

    const songsPromise = fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(artistName)}&entity=song&limit=25\`, { signal: AbortSignal.timeout(4000) })
      .then(r => r.ok ? r.json() : null).catch(() => null);

    const [artistData, songsData] = await Promise.all([artistPromise, songsPromise]);

    let canonicalName = artistName;
    let genre = 'Recording Artist';

    if (artistData && artistData.results && artistData.results.length > 0) {
      const art = artistData.results[0];
      if (art.artistName) canonicalName = art.artistName;
      if (art.primaryGenreName) genre = art.primaryGenreName;
    }

    const allSongs = (songsData && songsData.results) ? songsData.results : [];
    const filteredSongs = allSongs.filter(s => {
      const a = (s.artistName || '').toLowerCase();
      return a.includes(norm) || norm.includes(a);
    });

    const finalSongs = filteredSongs.length >= 3 ? filteredSongs : allSongs;
    if (finalSongs.length === 0) return null;

    if (canonicalName === artistName && finalSongs[0]?.artistName) {
      const mainArt = finalSongs[0].artistName.split(/[,&+]|feat\\.|ft\\./i)[0].trim();
      if (mainArt.toLowerCase().includes(norm) || norm.includes(mainArt.toLowerCase())) {
        canonicalName = mainArt;
      }
    }

    if (genre === 'Recording Artist' && finalSongs[0]?.primaryGenreName) {
      genre = finalSongs[0].primaryGenreName;
    }

    // High-resolution master wallpaper / artwork (1000x1000 master)
    const bestCover = (finalSongs[0]?.artworkUrl100 || '').replace('100x100bb', '1000x1000bb');

    const topTracks = finalSongs.slice(0, 10).map((t, idx) => ({
      id: \`itunes-\${t.trackId || Math.random().toString(36).substr(2, 8)}\`,
      ytId: '',
      title: t.trackName,
      artist: t.artistName || canonicalName,
      album: t.collectionName || 'Studio Master Release',
      coverUrl: (t.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
      duration: Math.round((t.trackTimeMillis || 215000) / 1000),
      plays: (100000000 - (idx * 7500000)).toLocaleString()
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
      avatar: bestCover,
      topTracks,
      bio: \`\${canonicalName} is a celebrated \${genre} recording artist and global musical phenomenon. Recognized by millions for sensational vocal artistry, signature hits, and multi-platinum releases, \${canonicalName} continues to shape contemporary music with chart-topping studio productions and sold-out live performances across the world.\`,
      socials: {
        instagram: \`https://www.instagram.com/\${cleanHandle}/\`,
        x: \`https://x.com/\${cleanHandle}\`,
        facebook: \`https://www.facebook.com/\${cleanHandle}/\`,
        youtube: \`https://www.youtube.com/results?search_query=\${encodeURIComponent(canonicalName + ' official channel')}\`
      },
      tourInfo: {
        tourName: \`\${canonicalName} Live World Tour 2026\`,
        status: "Tickets Live",
        dates: "Upcoming Arena & Stadium Dates Worldwide",
        ticketUrl: "https://in.bookmyshow.com/explore/events"
      },
      similarArtists: (typeof window !== 'undefined' && window.catalogService) ? window.catalogService.getCuratedSimilarArtists('', canonicalName) : []
    };

    // Cache to localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(\`pulse_artist_\${cleanKey}\`, JSON.stringify(profile));
      }
    } catch (e) {}

    return profile;
  } catch (err) {
    console.warn('Dynamic artist resolution failed:', err);
    return null;
  }
}

export async function searchDynamicArtists(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  
  try {
    const res = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(q)}&entity=musicArtist&limit=3\`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !data.results) return [];

    const candidates = [];
    for (const art of data.results) {
      if (!art.artistName) continue;
      let avatar = '';
      try {
        const trackRes = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(art.artistName)}&entity=song&limit=1\`, { signal: AbortSignal.timeout(2000) });
        if (trackRes.ok) {
          const tData = await trackRes.json();
          if (tData && tData.results && tData.results[0]?.artworkUrl100) {
            avatar = tData.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          }
        }
      } catch (e) {}

      candidates.push({
        id: art.artistName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: art.artistName,
        genre: art.primaryGenreName || 'Verified Artist',
        avatar: avatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(art.artistName)}&backgroundColor=8b5cf6\`,
        banner: avatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(art.artistName)}&backgroundColor=8b5cf6\`,
        followersCount: '20,000,000',
        worldRank: \`#1 in \${art.primaryGenreName || 'Music'}\`,
        score: 95
      });
    }
    return candidates;
  } catch (e) {
    return [];
  }
}

// Backward compatibility export
export async function fetchDynamicArtistData(artistName) {
  return fetchDynamicArtistProfile(artistName);
}

// Attach to musicService object
musicService.fetchDynamicArtistProfile = fetchDynamicArtistProfile;
musicService.searchDynamicArtists = searchDynamicArtists;
musicService.fetchDynamicArtistData = fetchDynamicArtistData;

export default musicService;
`;

content = content.slice(0, anchorIdx) + newMethods;
fs.writeFileSync('src/musicService.js', content, 'utf8');
console.log('Successfully updated src/musicService.js!');
