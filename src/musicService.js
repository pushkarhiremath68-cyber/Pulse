/**
 * Pulse Music - Music Service Engine
 * Connects directly to Audius Decentralized API and Jamendo API (Client ID: 23b33f2a)
 * Provides access to over 1.6 Million free, high-fidelity streamable tracks.
 */

const JAMENDO_CLIENT_ID = '23b33f2a';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const AUDIUS_APP_NAME = 'PULSE_APP';
const AUDIUS_FALLBACK_NODE = 'https://discoveryprovider.audius.co';

let cachedAudiusNode = null;
let audiusNodeExpiry = 0;

/**
 * 1. Dynamically select an active Audius Discovery Node
 */
export async function getAudiusDiscoveryNode() {
  if (cachedAudiusNode && Date.now() < audiusNodeExpiry) {
    return cachedAudiusNode;
  }
  try {
    const res = await fetch('https://api.audius.co', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        cachedAudiusNode = json.data[Math.floor(Math.random() * json.data.length)].replace(/\/+$/, '');
        audiusNodeExpiry = Date.now() + 20 * 60 * 1000;
        return cachedAudiusNode;
      }
    }
  } catch (e) {
    console.warn('[MusicService] Audius gateway discovery notice:', e);
  }

  cachedAudiusNode = AUDIUS_FALLBACK_NODE;
  audiusNodeExpiry = Date.now() + 5 * 60 * 1000;
  return cachedAudiusNode;
}

/**
 * Normalizes track data across Audius and Jamendo into a standard format
 */
export function normalizeTrack(raw, source = 'unknown') {
  if (!raw) return null;
  return {
    id: raw.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: raw.title || raw.name || 'Untitled Track',
    artist: raw.artist || raw.artist_name || (raw.user && raw.user.name) || 'Pulse Artist',
    album: raw.album || raw.album_name || (source === 'audius' ? 'Audius Stream' : 'Jamendo Single'),
    coverUrl: raw.coverUrl || raw.image || raw.album_image || (raw.artwork && (raw.artwork['480x480'] || raw.artwork['150x150'])) || './pulse-logo.png',
    cover: raw.coverUrl || raw.image || raw.album_image || (raw.artwork && (raw.artwork['480x480'] || raw.artwork['150x150'])) || './pulse-logo.png',
    duration: typeof raw.duration === 'number' ? raw.duration : (parseInt(raw.duration, 10) || 210),
    streamUrl: raw.streamUrl || raw.audio || raw.audiodownload || '',
    previewUrl: raw.previewUrl || raw.audio || raw.streamUrl || '',
    genre: raw.genre || (raw.musicinfo && raw.musicinfo.tags && raw.musicinfo.tags.genres && raw.musicinfo.tags.genres[0]) || 'Music',
    source: source === 'audius' ? 'Audius Network' : 'Jamendo Music'
  };
}

/**
 * 2. Fetch Trending Tracks from Audius and Jamendo
 */
export async function fetchTrendingTracks(limit = 20) {
  const tracks = [];
  const half = Math.ceil(limit / 2);

  // Audius Trending
  try {
    const node = await getAudiusDiscoveryNode();
    const url = `${node}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=${half}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(t => {
          tracks.push(normalizeTrack({
            id: `audius-${t.id}`,
            title: t.title,
            artist: t.user?.name,
            coverUrl: t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : null,
            duration: t.duration,
            streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            genre: t.genre
          }, 'audius'));
        });
      }
    }
  } catch (e) {
    console.warn('[MusicService] Audius Trending notice:', e);
  }

  // Jamendo Trending
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${half}&order=popularity_week&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results)) {
        json.results.forEach(t => {
          tracks.push(normalizeTrack({
            id: `jamendo-${t.id}`,
            title: t.name,
            artist: t.artist_name,
            album: t.album_name,
            coverUrl: t.image || t.album_image,
            duration: parseInt(t.duration, 10),
            streamUrl: t.audio || t.audiodownload,
            genre: t.musicinfo?.tags?.genres?.[0]
          }, 'jamendo'));
        });
      }
    }
  } catch (e) {
    console.warn('[MusicService] Jamendo Trending notice:', e);
  }

  return tracks;
}

/**
 * 3. Search Tracks across Audius and Jamendo
 */
export async function searchTracks(query, limit = 25) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  const q = encodeURIComponent(query.trim());
  const half = Math.ceil(limit / 2);
  const results = [];
  const seenTitles = new Set();

  const addUnique = (item) => {
    if (!item || !item.streamUrl) return;
    const key = `${item.title.toLowerCase()}___${item.artist.toLowerCase()}`;
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      results.push(item);
    }
  };

  // 1. Search Audius
  try {
    const node = await getAudiusDiscoveryNode();
    const url = `${node}/v1/tracks/search?query=${q}&app_name=${AUDIUS_APP_NAME}&limit=${half}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(t => {
          addUnique(normalizeTrack({
            id: `audius-${t.id}`,
            title: t.title,
            artist: t.user?.name,
            coverUrl: t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : null,
            duration: t.duration,
            streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            genre: t.genre
          }, 'audius'));
        });
      }
    }
  } catch (e) {
    console.warn('[MusicService] Audius Search notice:', e);
  }

  // 2. Search Jamendo
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${half}&namesearch=${q}&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results)) {
        json.results.forEach(t => {
          addUnique(normalizeTrack({
            id: `jamendo-${t.id}`,
            title: t.name,
            artist: t.artist_name,
            album: t.album_name,
            coverUrl: t.image || t.album_image,
            duration: parseInt(t.duration, 10),
            streamUrl: t.audio || t.audiodownload,
            genre: t.musicinfo?.tags?.genres?.[0]
          }, 'jamendo'));
        });
      }
    }
  } catch (e) {
    console.warn('[MusicService] Jamendo Search notice:', e);
  }

  return results;
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.musicService = {
    getAudiusDiscoveryNode,
    fetchTrendingTracks,
    searchTracks,
    normalizeTrack
  };
}
