/**
 * Pulse Music - 1.6M+ Universal Audius & Jamendo Live Music Engine
 * Zero 30-second previews - 100% full-length audio tracks.
 */

const JAMENDO_CLIENT_ID = '23b33f2a';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const AUDIUS_APP_NAME = 'PULSE_APP';

const AUDIUS_NODES = [
  'https://discoveryprovider.audius.co',
  'https://audius-discovery-1.cultur3stake.com',
  'https://audius-dp.singapore.creatorseed.com',
  'https://discovery-us-01.audius.openplayer.org'
];

let nodeIdx = 0;
export function getActiveAudiusNode() {
  return AUDIUS_NODES[nodeIdx % AUDIUS_NODES.length];
}

export function rotateAudiusNode() {
  nodeIdx = (nodeIdx + 1) % AUDIUS_NODES.length;
  return getActiveAudiusNode();
}

export function normalizeTrack(raw, source = 'Pulse') {
  if (!raw) return null;
  const safeId = raw.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const safeTitle = raw.title || raw.name || raw.trackName || 'Untitled Track';
  const safeArtist = raw.artist || raw.artist_name || raw.artistName || (raw.user && raw.user.name) || 'Pulse Artist';
  const safeAlbum = raw.album || raw.album_name || raw.collectionName || 'Full Album';
  
  let cover = raw.coverUrl || raw.cover || raw.image || raw.album_image;
  if (!cover && raw.artwork) {
    cover = raw.artwork['480x480'] || raw.artwork['1000x1000'] || raw.artwork['150x150'];
  }
  if (!cover) cover = './pulse-logo.png';

  const stream = raw.streamUrl || raw.audio || raw.audiodownload || '';
  const duration = typeof raw.duration === 'number' ? raw.duration : (parseInt(raw.duration, 10) || 210);

  return {
    id: safeId,
    title: safeTitle,
    artist: safeArtist,
    album: safeAlbum,
    coverUrl: cover,
    duration: duration,
    streamUrl: stream,
    previewUrl: stream,
    genre: raw.genre || raw.primaryGenreName || 'Music',
    source: source
  };
}

/**
 * Searches 1.6M+ Audius and Jamendo Full Tracks
 */
export async function searchTracks(query, limit = 50) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return await fetchTrendingTracks(limit);
  }
  const q = query.trim();
  const encodedQ = encodeURIComponent(q);
  const results = [];
  const seen = new Set();

  const addUnique = (t) => {
    if (!t || !t.streamUrl) return;
    const key = `${t.title.toLowerCase().replace(/[^a-z0-9]/g, '')}___${t.artist.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(t);
    }
  };

  // 1. Audius 1.6M+ Network
  try {
    const node = getActiveAudiusNode();
    const url = `${node}/v1/tracks/search?query=${encodedQ}&app_name=${AUDIUS_APP_NAME}&limit=${Math.min(limit, 30)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(t => {
          const cover = t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : './pulse-logo.png';
          addUnique(normalizeTrack({
            id: `audius-${t.id}`,
            title: t.title,
            artist: t.user?.name,
            artwork: t.artwork,
            duration: t.duration || 210,
            streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            genre: t.genre || 'Stream'
          }, 'Audius (Full Song)'));
        });
      }
    }
  } catch (e) {
    rotateAudiusNode();
  }

  // 2. Jamendo Name Search
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=25&namesearch=${encodedQ}&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results)) {
        json.results.forEach(t => {
          const audio = t.audio || t.audiodownload;
          if (audio) {
            addUnique(normalizeTrack({
              id: `jamendo-${t.id}`,
              title: t.name,
              artist: t.artist_name,
              album: t.album_name,
              image: t.image || t.album_image,
              duration: parseInt(t.duration, 10) || 210,
              audio: audio,
              genre: t.musicinfo?.tags?.genres?.[0]
            }, 'Jamendo (Full Song)'));
          }
        });
      }
    }
  } catch (e) {}

  return results;
}

/**
 * Fetches Trending Tracks from Audius & Jamendo
 */
export async function fetchTrendingTracks(limit = 40) {
  const results = [];
  const seen = new Set();

  const addUnique = (t) => {
    if (!t || !t.streamUrl) return;
    const key = `${t.title.toLowerCase().replace(/[^a-z0-9]/g, '')}___${t.artist.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(t);
    }
  };

  // 1. Audius Trending
  try {
    const node = getActiveAudiusNode();
    const url = `${node}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=25`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(t => {
          const cover = t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : './pulse-logo.png';
          addUnique(normalizeTrack({
            id: `audius-${t.id}`,
            title: t.title,
            artist: t.user?.name,
            artwork: t.artwork,
            duration: t.duration || 210,
            streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            genre: t.genre
          }, 'Audius Trending (Full Song)'));
        });
      }
    }
  } catch (e) {
    rotateAudiusNode();
  }

  // 2. Jamendo Popular
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=25&order=popularity_total&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results)) {
        json.results.forEach(t => {
          const audio = t.audio || t.audiodownload;
          if (audio) {
            addUnique(normalizeTrack({
              id: `jamendo-${t.id}`,
              title: t.name,
              artist: t.artist_name,
              album: t.album_name,
              image: t.image,
              duration: parseInt(t.duration, 10) || 210,
              audio: audio,
              genre: t.musicinfo?.tags?.genres?.[0]
            }, 'Jamendo Top (Full Song)'));
          }
        });
      }
    }
  } catch (e) {}

  return results;
}

const musicService = {
  searchTracks,
  fetchTrendingTracks,
  normalizeTrack,
  getActiveAudiusNode,
  rotateAudiusNode
};

if (typeof window !== 'undefined') {
  window.musicService = musicService;
}

export default musicService;
