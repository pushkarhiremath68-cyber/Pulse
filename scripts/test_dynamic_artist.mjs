import https from 'https';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function resolveDynamicArtist(artistQuery) {
  const norm = artistQuery.toLowerCase().trim();
  const cleanHandle = norm.replace(/[^a-z0-9]/g, '');

  // Fetch top tracks for this artist from iTunes
  const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(artistQuery)}&entity=song&limit=25`;
  const data = await fetchJson(searchUrl);
  if (!data || !data.results || data.results.length === 0) return null;

  // Filter tracks by artist name similarity
  const tracks = data.results.filter(t => {
    const a = (t.artistName || '').toLowerCase();
    return a.includes(norm) || norm.includes(a);
  });

  const finalTracks = tracks.length > 0 ? tracks : data.results.slice(0, 10);
  const primaryArtistName = finalTracks[0]?.artistName || artistQuery;
  const genre = finalTracks[0]?.primaryGenreName || 'Music';

  // Get best high-res artwork
  const bestArtwork = (finalTracks[0]?.artworkUrl100 || '').replace('100x100bb', '1000x1000bb');

  const top10 = finalTracks.slice(0, 10).map((t, idx) => ({
    id: `itunes-${t.trackId}`,
    ytId: '',
    title: t.trackName,
    artist: t.artistName,
    album: t.collectionName || 'Master Release',
    coverUrl: (t.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
    duration: Math.round((t.trackTimeMillis || 210000) / 1000),
    plays: (100000000 - (idx * 6500000)).toLocaleString()
  }));

  const profile = {
    id: primaryArtistName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: primaryArtistName,
    monthlyListeners: `${(25000000 + Math.floor(Math.random() * 35000000)).toLocaleString()}`,
    followersCount: `${(15000000 + Math.floor(Math.random() * 20000000)).toLocaleString()}`,
    worldRank: `#${Math.floor(Math.random() * 15) + 1} in ${genre}`,
    banner: bestArtwork,
    avatar: bestArtwork,
    topTracks: top10,
    bio: `${primaryArtistName} is a world-renowned ${genre} recording artist and global musical phenomenon. Recognized by millions for stellar vocal range, evocative songwriting, and chart-topping studio anthems, ${primaryArtistName} has dominated global streaming charts with legendary multi-platinum releases and unforgettable live arena concert tours.`,
    socials: {
      instagram: `https://www.instagram.com/${cleanHandle}/`,
      x: `https://x.com/${cleanHandle}`,
      facebook: `https://www.facebook.com/${cleanHandle}/`,
      youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(primaryArtistName + ' official channel')}`
    },
    tourInfo: {
      tourName: `${primaryArtistName} Global World Tour 2026`,
      status: "Tickets Live",
      dates: "Stadium & Arena Dates Across Global Tour Cities",
      ticketUrl: `https://in.bookmyshow.com/explore/events`
    }
  };

  return profile;
}

(async () => {
  const shreya = await resolveDynamicArtist('Shreya Ghoshal');
  console.log('Shreya Ghoshal resolved:');
  console.log('Name:', shreya.name);
  console.log('Banner:', shreya.banner);
  console.log('Top tracks count:', shreya.topTracks.length);
  console.log('Top track 1:', shreya.topTracks[0].title, 'by', shreya.topTracks[0].artist);

  const drake = await resolveDynamicArtist('Drake');
  console.log('\nDrake resolved:');
  console.log('Name:', drake.name);
  console.log('Banner:', drake.banner);
  console.log('Top track 1:', drake.topTracks[0].title, 'by', drake.topTracks[0].artist);
})();

