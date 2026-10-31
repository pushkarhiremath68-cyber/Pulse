import {
  getHeroSlides,
  getQuickPicks,
  getFeaturedArtists,
  getArtistDetails,
  getCuratedPlaylists,
  getMoviePlaylists,
  getVibePlaylists,
  CATALOG_CATEGORIES,
  LANGUAGE_PLAYLISTS,
  PERMANENT_STREAM_MAP,
  searchCatalogTracks
} from '../src/catalogService.js';

console.log('=== AUDITING CATALOG TRACKS & STRUCTURES ===');

let totalTracksFound = 0;
let tracksWithStreams = 0;
let tracksWithYtId = 0;
let tracksWithDirectAudioOrYt = 0;
let brokenTracks = [];

function checkTrack(track, location) {
  if (!track) {
    brokenTracks.push({ issue: 'Null track object', location });
    return;
  }
  totalTracksFound++;

  const hasTitle = Boolean(track.title && track.title.trim());
  const hasArtist = Boolean(track.artist && track.artist.trim());
  const hasCover = Boolean(track.coverUrl || track.cover || track.thumbnail);
  const streamUrl = track.streamUrl || PERMANENT_STREAM_MAP[track.title] || PERMANENT_STREAM_MAP[track.id];
  const ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : null);

  const hasDirectStream = Boolean(streamUrl && streamUrl.startsWith('http') && !streamUrl.includes('preview') && !streamUrl.includes('audio-ssl.itunes.apple.com'));
  const hasValidYtId = Boolean(ytId && ytId.length >= 8 && ytId.length <= 20);

  if (hasDirectStream) tracksWithStreams++;
  if (hasValidYtId) tracksWithYtId++;
  if (hasDirectStream || hasValidYtId) tracksWithDirectAudioOrYt++;

  if (!hasTitle || !hasArtist) {
    brokenTracks.push({ issue: 'Missing title or artist', track, location });
  }

  if (!hasCover) {
    brokenTracks.push({ issue: 'Missing cover artwork', track: track.title, location });
  }

  if (!hasDirectStream && !hasValidYtId) {
    brokenTracks.push({ issue: 'NO direct stream and NO valid YouTube ID', track: `${track.title} - ${track.artist}`, location });
  }
}

// 1. Hero slides
const heroSlides = getHeroSlides();
console.log(`Hero Slides: ${heroSlides.length}`);
heroSlides.forEach((slide, idx) => {
  checkTrack(slide, `Hero Slide #${idx}`);
});

// 2. Quick picks
const quickPicks = getQuickPicks();
console.log(`Quick Picks: ${quickPicks.length}`);
quickPicks.forEach((qp, idx) => {
  checkTrack(qp, `Quick Pick #${idx}`);
});

// 3. Featured Artists
const featuredArtists = getFeaturedArtists();
console.log(`Featured Artists: ${featuredArtists.length}`);
featuredArtists.forEach(artist => {
  const details = getArtistDetails(artist.id || artist.name);
  if (details && details.topTracks) {
    details.topTracks.forEach((t, idx) => {
      checkTrack(t, `Artist ${artist.name} TopTrack #${idx}`);
    });
  }
});

// 4. Curated Playlists
const curatedPlaylists = getCuratedPlaylists();
console.log(`Curated Playlists: ${curatedPlaylists.length}`);
curatedPlaylists.forEach(pl => {
  if (pl.tracks) {
    pl.tracks.forEach((t, idx) => {
      checkTrack(t, `Curated Playlist "${pl.title}" #${idx}`);
    });
  }
});

// 5. Movie Playlists
const moviePlaylists = getMoviePlaylists();
console.log(`Movie Playlists: ${moviePlaylists.length}`);
moviePlaylists.forEach(pl => {
  if (pl.tracks) {
    pl.tracks.forEach((t, idx) => {
      checkTrack(t, `Movie Playlist "${pl.title}" #${idx}`);
    });
  }
});

// 6. Vibe Playlists
const vibePlaylists = getVibePlaylists();
console.log(`Vibe Playlists: ${vibePlaylists.length}`);
vibePlaylists.forEach(pl => {
  if (pl.tracks) {
    pl.tracks.forEach((t, idx) => {
      checkTrack(t, `Vibe Playlist "${pl.title}" #${idx}`);
    });
  }
});

// 7. Catalog Categories
console.log(`Catalog Categories: ${Object.keys(CATALOG_CATEGORIES).length}`);
Object.entries(CATALOG_CATEGORIES).forEach(([catKey, cat]) => {
  if (cat.tracks) {
    cat.tracks.forEach((t, idx) => {
      checkTrack(t, `Category "${cat.title || catKey}" #${idx}`);
    });
  }
});

// 8. Language Playlists
console.log(`Language Playlists: ${LANGUAGE_PLAYLISTS.length}`);
LANGUAGE_PLAYLISTS.forEach(lp => {
  if (lp.tracks) {
    lp.tracks.forEach((t, idx) => {
      checkTrack(t, `Language "${lp.language || lp.name}" #${idx}`);
    });
  }
});

console.log('\n=== AUDIT SUMMARY ===');
console.log(`Total track references tested: ${totalTracksFound}`);
console.log(`Tracks with Direct 320kbps Streams: ${tracksWithStreams}`);
console.log(`Tracks with Valid YouTube IDs: ${tracksWithYtId}`);
console.log(`Tracks with AT LEAST ONE valid playback source (Direct Stream OR YouTube): ${tracksWithDirectAudioOrYt}`);
console.log(`Issues / Broken tracks count: ${brokenTracks.length}`);

if (brokenTracks.length > 0) {
  console.log('\n--- Details of Broken Tracks ---');
  brokenTracks.forEach(b => console.log(b));
}

