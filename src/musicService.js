/**
 * Pulse Music - 100% Full-Length Audio Service
 * Powered by Audius 1.6M+ Network and Jamendo 600k+ Full MP3 Streams.
 * Zero 30-second preview limits - every track plays full duration from start to finish.
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

/**
 * Searches across 1.6M+ Audius and Jamendo Full Tracks
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

  // 1. Audius 1.6M+ Decentralized Full-Length Network
  try {
    const node = getActiveAudiusNode();
    const url = `${node}/v1/tracks/search?query=${encodedQ}&app_name=${AUDIUS_APP_NAME}&limit=${Math.min(limit, 30)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(t => {
          const cover = t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : './pulse-logo.png';
          addUnique({
            id: `audius-${t.id}`,
            title: t.title,
            artist: t.user?.name || 'Audius Artist',
            album: 'Audius Full Stream',
            coverUrl: cover,
            duration: t.duration || 210,
            streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            previewUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            genre: t.genre || 'Full Stream',
            source: 'Audius 1.6M+ (Full Song)'
          });
        });
      }
    }
  } catch (e) {
    rotateAudiusNode();
  }

  // 2. Jamendo 600k+ Full MP3 Library
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=25&namesearch=${encodedQ}&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results)) {
        json.results.forEach(t => {
          const audio = t.audio || t.audiodownload;
          if (audio) {
            addUnique({
              id: `jamendo-${t.id}`,
              title: t.name,
              artist: t.artist_name || 'Jamendo Artist',
              album: t.album_name || 'Full Release',
              coverUrl: t.image || t.album_image || './pulse-logo.png',
              duration: parseInt(t.duration, 10) || 220,
              streamUrl: audio,
              previewUrl: audio,
              genre: t.musicinfo?.tags?.genres?.[0] || 'Music',
              source: 'Jamendo (Full Song)'
            });
          }
        });
      }
    }
  } catch (e) {}

  return results;
}

/**
 * Fetches 100% Full-Length Trending Tracks
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

  // 1. Audius Trending Full Tracks
  try {
    const node = getActiveAudiusNode();
    const url = `${node}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=25`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(t => {
          const cover = t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : './pulse-logo.png';
          addUnique({
            id: `audius-${t.id}`,
            title: t.title,
            artist: t.user?.name || 'Audius Artist',
            album: 'Audius Trending',
            coverUrl: cover,
            duration: t.duration || 210,
            streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            previewUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            genre: t.genre || 'Trending',
            source: 'Audius 1.6M+ (Full Song)'
          });
        });
      }
    }
  } catch (e) {
    rotateAudiusNode();
  }

  // 2. Jamendo Top Full Tracks
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=25&order=popularity_total&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results)) {
        json.results.forEach(t => {
          const audio = t.audio || t.audiodownload;
          if (audio) {
            addUnique({
              id: `jamendo-${t.id}`,
              title: t.name,
              artist: t.artist_name,
              album: t.album_name || 'Top Release',
              coverUrl: t.image || t.album_image || './pulse-logo.png',
              duration: parseInt(t.duration, 10) || 220,
              streamUrl: audio,
              previewUrl: audio,
              genre: t.musicinfo?.tags?.genres?.[0] || 'Popular',
              source: 'Jamendo (Full Song)'
            });
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
  getActiveAudiusNode,
  rotateAudiusNode
};

if (typeof window !== 'undefined') {
  window.musicService = musicService;
}

export default musicService;
