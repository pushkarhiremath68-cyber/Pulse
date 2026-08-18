/**
 * Pulse Music - 1.6M+ Universal Streaming & Multi-Gateway Audio Engine
 * Connects Audius Decentralized Network, Jamendo MP3 API, and Global Universal Catalog.
 * Ensures 100% accessibility, discoverability, and reliable playback.
 */

const JAMENDO_CLIENT_ID = '23b33f2a';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const AUDIUS_APP_NAME = 'PULSE_APP';

const AUDIUS_DISCOVERY_NODES = [
  'https://discoveryprovider.audius.co',
  'https://audius-discovery-1.cultur3stake.com',
  'https://audius-dp.singapore.creatorseed.com',
  'https://discovery-us-01.audius.openplayer.org'
];

let activeAudiusNodeIndex = 0;

export function getActiveAudiusNode() {
  return AUDIUS_DISCOVERY_NODES[activeAudiusNodeIndex % AUDIUS_DISCOVERY_NODES.length];
}

export function rotateAudiusNode() {
  activeAudiusNodeIndex = (activeAudiusNodeIndex + 1) % AUDIUS_DISCOVERY_NODES.length;
  return getActiveAudiusNode();
}

/**
 * Normalizes raw track objects into standard Pulse track format
 */
export function normalizeTrack(raw, source = 'Pulse') {
  if (!raw) return null;
  const safeId = raw.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const safeTitle = raw.title || raw.name || raw.trackName || 'Untitled Track';
  const safeArtist = raw.artist || raw.artist_name || raw.artistName || (raw.user && raw.user.name) || 'Pulse Artist';
  const safeAlbum = raw.album || raw.album_name || raw.collectionName || (source === 'Audius' ? 'Audius Network' : 'Studio Master');
  
  let cover = raw.coverUrl || raw.cover || raw.image || raw.album_image;
  if (!cover && raw.artwork) {
    cover = raw.artwork['480x480'] || raw.artwork['150x150'];
  }
  if (!cover && raw.artworkUrl100) {
    cover = raw.artworkUrl100.replace('100x100bb', '600x600bb');
  }
  if (!cover) cover = './pulse-logo.png';

  const stream = raw.streamUrl || raw.audio || raw.audiodownload || raw.previewUrl || '';
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
 * Searches across all 1.6M+ tracks with multi-gateway failover
 */
export async function searchTracks(query, limit = 40) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  const q = query.trim();
  const encodedQ = encodeURIComponent(q);
  const results = [];
  const seenKeys = new Set();

  const addUnique = (item) => {
    if (!item || !item.streamUrl) return;
    const key = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '')}___${item.artist.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      results.push(item);
    }
  };

  // 1. Global Universal Catalog Search (iTunes API - High Bitrate Global & Indian Songs)
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodedQ}&entity=song&limit=${Math.min(limit, 25)}`;
    const res = await fetch(itunesUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results)) {
        json.results.forEach(r => {
          if (r.previewUrl) {
            addUnique(normalizeTrack({
              id: `itunes-${r.trackId}`,
              title: r.trackName,
              artist: r.artistName,
              album: r.collectionName,
              artworkUrl100: r.artworkUrl100,
              duration: Math.round((r.trackTimeMillis || 210000) / 1000),
              streamUrl: r.previewUrl,
              genre: r.primaryGenreName
            }, 'Global Studio'));
          }
        });
      }
    }
  } catch (e) {}

  // 2. Audius 1.6M+ Search
  try {
    const node = getActiveAudiusNode();
    const url = `${node}/v1/tracks/search?query=${encodedQ}&app_name=${AUDIUS_APP_NAME}&limit=20`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(t => {
          addUnique(normalizeTrack({
            id: `audius-${t.id}`,
            title: t.title,
            artist: t.user?.name,
            artwork: t.artwork,
            duration: t.duration,
            streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            genre: t.genre
          }, 'Audius 1.6M+'));
        });
      }
    }
  } catch (e) {
    rotateAudiusNode();
  }

  // 3. Jamendo 600k+ Free Music API
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=20&namesearch=${encodedQ}&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
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
          }, 'Jamendo'));
        });
      }
    }
  } catch (e) {}

  return results;
}

const musicService = {
  searchTracks,
  normalizeTrack,
  getActiveAudiusNode,
  rotateAudiusNode
};

if (typeof window !== 'undefined') {
  window.musicService = musicService;
}

export default musicService;
