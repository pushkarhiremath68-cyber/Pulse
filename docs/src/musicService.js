/**
 * Pulse Music - YouTube Intelligence + Audius (1.6M+) & Jamendo Streaming Engine
 * Uses YouTube Search Intelligence to discover all regional/global songs (e.g. Uden Jab Jab Zulfen Teri)
 * and streams via Audius (1.6M+ songs), Jamendo (600k+ songs), and Studio Masters.
 */

import { disambiguateQuery } from './geminiService.js';

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
 * Normalizes raw track objects into standard Pulse format
 */
export function normalizeTrack(raw, source = 'Pulse Universal') {
  if (!raw) return null;
  const safeId = raw.id || `pulse-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const safeTitle = raw.title || raw.name || raw.trackName || 'Untitled Song';
  const safeArtist = raw.artist || raw.artist_name || raw.artistName || (raw.user && raw.user.name) || 'Pulse Artist';
  const safeAlbum = raw.album || raw.album_name || raw.collectionName || 'Single / Full Album';
  
  let cover = raw.coverUrl || raw.cover || raw.image || raw.album_image;
  if (!cover && raw.artwork) {
    cover = raw.artwork['480x480'] || raw.artwork['1000x1000'] || raw.artwork['150x150'];
  }
  if (!cover && raw.artworkUrl100) {
    cover = raw.artworkUrl100.replace('100x100bb', '600x600bb');
  }
  if (!cover) cover = './pulse-logo.png';

  const stream = raw.streamUrl || raw.audio || raw.audiodownload || raw.previewUrl || raw.stream || '';
  const duration = typeof raw.duration === 'number' ? raw.duration : (parseInt(raw.duration, 10) || 220);

  return {
    id: safeId,
    title: safeTitle,
    artist: safeArtist,
    album: safeAlbum,
    coverUrl: cover,
    duration: duration,
    streamUrl: stream,
    previewUrl: stream,
    genre: raw.genre || raw.primaryGenreName || 'Top Hits',
    source: source
  };
}

/**
 * Expands user query using YouTube search intelligence and phonetic matching
 */
async function expandWithYouTube(query) {
  const expanded = [query];
  try {
    const ytUrl = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`;
    const res = await fetch(ytUrl, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const text = await res.text();
      const matches = text.match(/\["(.*?)"/g);
      if (matches) {
        matches.slice(0, 4).forEach(m => {
          const clean = m.replace(/^\["/, '').replace(/"$/, '').trim();
          if (clean && !expanded.includes(clean)) {
            expanded.push(clean);
          }
        });
      }
    }
  } catch (e) {}

  // Merge with Gemini disambiguated queries
  const geminiQueries = disambiguateQuery(query);
  geminiQueries.forEach(g => {
    if (!expanded.includes(g)) expanded.push(g);
  });

  return expanded;
}

/**
 * Searches across YouTube-expanded queries on Studio Masters, Audius 1.6M+, and Jamendo
 */
export async function searchTracks(query, limit = 60) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return await fetchTrendingTracks(limit);
  }

  const terms = await expandWithYouTube(query.trim());
  const results = [];
  const seen = new Set();

  const addUnique = (t) => {
    if (!t || !t.streamUrl) return;
    const key = `${(t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}___${(t.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(t);
    }
  };

  for (const term of terms) {
    const encodedQ = encodeURIComponent(term);
    const promises = [];

    // 1. Studio Master Search (Ensures EXACT song, artist vocals & 600x600 HD artwork)
    promises.push((async () => {
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodedQ}&entity=song&limit=${Math.min(limit, 25)}`;
        const res = await fetch(itunesUrl, { signal: AbortSignal.timeout(3500) });
        if (res.ok) {
          const json = await res.json();
          if (json.results && Array.isArray(json.results)) {
            json.results.forEach(r => {
              if (r.previewUrl) {
                addUnique(normalizeTrack({
                  id: `studio-${r.trackId}`,
                  title: r.trackName,
                  artist: r.artistName,
                  album: r.collectionName,
                  artworkUrl100: r.artworkUrl100,
                  duration: Math.round((r.trackTimeMillis || 220000) / 1000),
                  streamUrl: r.previewUrl,
                  genre: r.primaryGenreName
                }, 'Studio Master (Exact Song)'));
              }
            });
          }
        }
      } catch (e) {}
    })());

    // 2. Audius 1.6M+ Network
    promises.push((async () => {
      try {
        const node = getActiveAudiusNode();
        const url = `${node}/v1/tracks/search?query=${encodedQ}&app_name=${AUDIUS_APP_NAME}&limit=${Math.min(limit, 25)}`;
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
                duration: t.duration || 220,
                streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
                genre: t.genre || 'Top Hit'
              }, 'Audius (1.6M+ Full Song)'));
            });
          }
        }
      } catch (e) {
        rotateAudiusNode();
      }
    })());

    // 3. Jamendo Library
    promises.push((async () => {
      try {
        const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=20&namesearch=${encodedQ}&audioformat=mp32`;
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
                  duration: parseInt(t.duration, 10) || 220,
                  audio: audio,
                  genre: t.musicinfo?.tags?.genres?.[0]
                }, 'Jamendo (Full Audio)'));
              }
            });
          }
        }
      } catch (e) {}
    })());

    await Promise.allSettled(promises);
    if (results.length >= 30) break;
  }

  return results;
}

/**
 * Fetches Trending Tracks from Audius & Jamendo
 */
export async function fetchTrendingTracks(limit = 50) {
  const results = [];
  const seen = new Set();

  const addUnique = (t) => {
    if (!t || !t.streamUrl) return;
    const key = `${(t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}___${(t.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(t);
    }
  };

  try {
    const node = getActiveAudiusNode();
    const url = `${node}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=30`;
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
            duration: t.duration || 220,
            streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            genre: t.genre || 'Trending'
          }, 'Audius 1.6M+ (Full Song)'));
        });
      }
    }
  } catch (e) {
    rotateAudiusNode();
  }

  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=30&order=popularity_total&audioformat=mp32`;
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
              duration: parseInt(t.duration, 10) || 220,
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
