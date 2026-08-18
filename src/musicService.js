/**
 * Pulse Music - Multi-Source Global Music Engine
 * Powered by Audius Decentralized Network (1.6M+ Full Songs), Jamendo Masters, and Studio Search.
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
  const safeAlbum = raw.album || raw.album_name || raw.collectionName || 'Full Album Release';
  
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
 * Expands user query using YouTube and Gemini search intelligence
 */
async function expandQuery(query) {
  const expanded = [query];
  try {
    const ytUrl = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`;
    const res = await fetch(ytUrl, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const text = await res.text();
      const matches = text.match(/\["(.*?)"/g);
      if (matches) {
        matches.slice(0, 3).forEach(m => {
          const clean = m.replace(/^\["/, '').replace(/"$/, '').trim();
          if (clean && !expanded.includes(clean)) {
            expanded.push(clean);
          }
        });
      }
    }
  } catch (e) {}

  const geminiQueries = disambiguateQuery(query);
  geminiQueries.forEach(g => {
    if (!expanded.includes(g)) expanded.push(g);
  });

  return expanded;
}

/**
 * Searches across Audius (1.6M+ Full Songs), Jamendo, and Studio Masters concurrently
 */
export async function searchTracks(query, limit = 60) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return await fetchTrendingTracks(limit);
  }

  const terms = await expandQuery(query.trim());
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

    // 1. Audius 1.6M+ Global Network (Full Length Streams from 0:00 to end)
    promises.push((async () => {
      try {
        const node = getActiveAudiusNode();
        const url = `${node}/v1/tracks/search?query=${encodedQ}&app_name=${AUDIUS_APP_NAME}&limit=${Math.min(limit, 30)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            json.data.forEach(t => {
              const cover = t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : './pulse-logo.png';
              const norm = normalizeTrack({
                id: `audius-${t.id}`,
                title: t.title,
                artist: t.user?.name,
                artwork: t.artwork,
                duration: t.duration || 220,
                streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
                genre: t.genre || 'Top Hit'
              }, 'Audius (1.6M+ Full Song)');
              if (norm) addUnique(norm);
            });
          }
        }
      } catch (e) {
        rotateAudiusNode();
      }
    })());

    // 2. Studio Master Index (Exact Song & Official Vocal)
    promises.push((async () => {
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodedQ}&entity=song&limit=${Math.min(limit, 20)}`;
        const res = await fetch(itunesUrl, { signal: AbortSignal.timeout(3500) });
        if (res.ok) {
          const json = await res.json();
          if (json.results && Array.isArray(json.results)) {
            json.results.forEach(r => {
              if (r.previewUrl) {
                const norm = normalizeTrack({
                  id: `studio-${r.trackId}`,
                  title: r.trackName,
                  artist: r.artistName,
                  album: r.collectionName,
                  artworkUrl100: r.artworkUrl100,
                  duration: Math.round((r.trackTimeMillis || 220000) / 1000),
                  streamUrl: r.previewUrl,
                  genre: r.primaryGenreName
                }, 'Studio Master (Exact Song)');
                if (norm) addUnique(norm);
              }
            });
          }
        }
      } catch (e) {}
    })());

    // 3. Jamendo Library (320kbps MP3s)
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
                const norm = normalizeTrack({
                  id: `jamendo-${t.id}`,
                  title: t.name,
                  artist: t.artist_name,
                  album: t.album_name,
                  image: t.image || t.album_image,
                  duration: parseInt(t.duration, 10) || 220,
                  streamUrl: audio,
                  genre: t.musicinfo?.tags?.genres?.[0]
                }, 'Jamendo (Full Audio)');
                if (norm) addUnique(norm);
              }
            });
          }
        }
      } catch (e) {}
    })());

    await Promise.allSettled(promises);
    if (results.length >= 35) break;
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
    const url = `${node}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=35`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(t => {
          const cover = t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : './pulse-logo.png';
          const norm = normalizeTrack({
            id: `audius-${t.id}`,
            title: t.title,
            artist: t.user?.name,
            artwork: t.artwork,
            duration: t.duration || 220,
            streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
            genre: t.genre || 'Trending'
          }, 'Audius (1.6M+ Full Song)');
          if (norm) addUnique(norm);
        });
      }
    }
  } catch (e) {
    rotateAudiusNode();
  }

  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=25&order=popularity_total&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results)) {
        json.results.forEach(t => {
          const audio = t.audio || t.audiodownload;
          if (audio) {
            const norm = normalizeTrack({
              id: `jamendo-${t.id}`,
              title: t.name,
              artist: t.artist_name,
              album: t.album_name,
              image: t.image,
              duration: parseInt(t.duration, 10) || 220,
              streamUrl: audio,
              genre: t.musicinfo?.tags?.genres?.[0]
            }, 'Jamendo Top (Full Song)');
            if (norm) addUnique(norm);
          }
        });
      }
    }
  } catch (e) {}

  return results;
}

/**
 * CRITICAL: Resolves the best full-length audio stream at PLAY TIME.
 * Called by playbarController before playing any track.
 * Searches Audius & Jamendo live for the actual song to avoid 30s previews and wrong audio.
 */
export async function resolveExactTrackStream(track) {
  if (!track) return '';

  const currentStream = track.streamUrl || '';

  // If it's already an Audius or Jamendo full stream, validate it quickly
  if (currentStream.includes('audius.co') || currentStream.includes('jamendo.com')) {
    try {
      const check = await fetch(currentStream, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
      if (check.ok) return currentStream;
    } catch (e) {}
  }

  const title = (track.title || '').split('(')[0].split('-')[0].trim();
  const artist = (track.artist || '').split(',')[0].split('&')[0].trim();
  const searchQ = `${title} ${artist}`.trim();

  if (!searchQ || searchQ.length < 2) return currentStream;

  const encodedQ = encodeURIComponent(searchQ);
  const titleLower = title.toLowerCase();
  const artistLower = artist.toLowerCase();

  // 1. Try Audius - FULL LENGTH decentralized streams (no 30s limit)
  try {
    const node = getActiveAudiusNode();
    const url = `${node}/v1/tracks/search?query=${encodedQ}&app_name=${AUDIUS_APP_NAME}&limit=10`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        // Score each result by title/artist match quality and duration
        let bestMatch = null;
        let bestScore = -1;

        for (const t of json.data) {
          const tTitle = (t.title || '').toLowerCase();
          const tArtist = (t.user?.name || '').toLowerCase();
          const dur = t.duration || 0;
          let score = 0;

          // Title match scoring
          if (tTitle.includes(titleLower) || titleLower.includes(tTitle)) score += 50;
          if (tTitle === titleLower) score += 30;

          // Artist match scoring
          if (tArtist.includes(artistLower) || artistLower.includes(tArtist)) score += 40;

          // Prefer tracks > 60 seconds (full songs, not clips)
          if (dur > 60) score += 20;
          if (dur > 120) score += 10;
          if (dur > 180) score += 5;

          // Penalize very short tracks (likely samples/clips)
          if (dur < 30) score -= 50;

          // Penalize tracks with "remix", "cover", "mashup" etc. if original is wanted
          const lower = tTitle.toLowerCase();
          if (lower.includes('remix') || lower.includes('cover') || lower.includes('mashup') || lower.includes('slowed') || lower.includes('reverb') || lower.includes('lofi')) {
            score -= 15;
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = t;
          }
        }

        if (bestMatch && bestScore >= 30) {
          const streamUrl = `${node}/v1/tracks/${bestMatch.id}/stream?app_name=${AUDIUS_APP_NAME}`;
          console.log(`[Pulse Resolve] "${title}" -> Audius FULL: "${bestMatch.title}" by ${bestMatch.user?.name} (${bestMatch.duration}s, score=${bestScore})`);
          return streamUrl;
        }
      }
    }
  } catch (e) {
    rotateAudiusNode();
  }

  // 2. Try Jamendo - FULL LENGTH 320kbps MP3
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=5&namesearch=${encodedQ}&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results) && json.results.length > 0) {
        // Find best match
        for (const t of json.results) {
          const audio = t.audio || t.audiodownload;
          const dur = parseInt(t.duration, 10) || 0;
          if (audio && dur > 60) {
            console.log(`[Pulse Resolve] "${title}" -> Jamendo FULL: "${t.name}" by ${t.artist_name} (${dur}s)`);
            return audio;
          }
        }
        // Even short Jamendo is better than 30s iTunes preview
        const first = json.results[0];
        const audio = first.audio || first.audiodownload;
        if (audio) return audio;
      }
    }
  } catch (e) {}

  // 3. Last resort: return whatever stream URL we already have
  console.log(`[Pulse Resolve] "${title}" -> using existing stream (no full match found)`);
  return currentStream;
}

const musicService = {
  searchTracks,
  fetchTrendingTracks,
  normalizeTrack,
  getActiveAudiusNode,
  rotateAudiusNode,
  resolveExactTrackStream
};

if (typeof window !== 'undefined') {
  window.musicService = musicService;
}

export default musicService;
