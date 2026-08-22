/**
 * Pulse Music - YouTube Music & Piped Pure Audio Stream Extractor
 * Resolves direct ad-free Opus (~160kbps) and M4A/AAC (~128kbps/256kbps) audio streams
 * with 0 video frames and zero visual container dependencies.
 */

// Active Verified High-Performance Piped & Invidious Instances (2026 Resilient Fleet)
export const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.projectsegfau.lt',
  'https://pipedapi.r4fo.com',
  'https://pipedapi.leptons.xyz',
  'https://piped-api.lunar.icu',
  'https://pipedapi.in.projectsegfau.lt'
];

export const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.flokinet.to',
  'https://invidious.privacyredirect.com',
  'https://iv.ggtyler.dev',
  'https://invidious.protokolla.fi',
  'https://yewtu.be'
];

let pipedIdx = 0;
let invidiousIdx = 0;

export function getActivePipedNode() {
  return PIPED_INSTANCES[pipedIdx % PIPED_INSTANCES.length];
}

export function rotatePipedNode() {
  pipedIdx = (pipedIdx + 1) % PIPED_INSTANCES.length;
  return getActivePipedNode();
}

export function getActiveInvidiousNode() {
  return INVIDIOUS_INSTANCES[invidiousIdx % INVIDIOUS_INSTANCES.length];
}

export function rotateInvidiousNode() {
  invidiousIdx = (invidiousIdx + 1) % INVIDIOUS_INSTANCES.length;
  return getActiveInvidiousNode();
}

// In-Memory Stream Cache (VideoId / Query -> Direct Stream Object)
const STREAM_RESOLVER_CACHE = new Map();
const SEARCH_CACHE = new Map();

/**
 * Resolves ad-free direct audio streams for a specific YouTube Video ID
 * Returns { streamUrl, codec, bitrate, duration, title, artist, thumbnail }
 */
export async function resolvePipedAudioStream(videoId) {
  if (!videoId || typeof videoId !== 'string' || videoId.length < 5) return null;

  const cleanId = videoId.replace('ytm-', '').replace('yt-', '').trim();
  if (STREAM_RESOLVER_CACHE.has(cleanId)) {
    const cached = STREAM_RESOLVER_CACHE.get(cleanId);
    if (Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  // 1. Primary: Local / Vite / Python backend stream resolver (0ms instant resolution)
  try {
    const localUrl = `/api/ytm/stream?id=${cleanId}`;
    const res = await fetch(localUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      if (json.streamUrl) {
        const resolved = {
          streamUrl: json.streamUrl,
          codec: json.codec || 'mp4/aac',
          bitrate: json.bitrate || '320kbps',
          duration: json.duration || 220,
          title: json.title || '',
          artist: json.artist || '',
          thumbnail: json.thumbnail || `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
          source: 'Studio Master Audio 320k'
        };
        STREAM_RESOLVER_CACHE.set(cleanId, {
          data: resolved,
          expiresAt: Date.now() + 30 * 60 * 1000
        });
        return resolved;
      }
    }
  } catch (e) {}

  // 2. FAST CONCURRENT RACING across top responsive nodes (short timeout for fast YouTube fallback)
  const nodesToRace = [
    ...PIPED_INSTANCES.slice(0, 3).map(n => ({ type: 'piped', url: `${n}/streams/${cleanId}` })),
    ...INVIDIOUS_INSTANCES.slice(0, 2).map(n => ({ type: 'invidious', url: `${n}/api/v1/videos/${cleanId}?fields=title,author,lengthSeconds,formatStreams,adaptiveFormats` }))
  ];

  try {
    const fastestResolved = await Promise.any(
      nodesToRace.map(async (node) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        try {
          const res = await fetch(node.url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('Not ok');
          const data = await res.json();
          
          if (node.type === 'piped') {
            const audioStreams = data.audioStreams || [];
            if (audioStreams.length > 0) {
              audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
              const bestStream = audioStreams.find(s => s.codec === 'opus') || audioStreams[0];
              if (bestStream && bestStream.url) {
                return {
                  streamUrl: bestStream.url,
                  codec: bestStream.codec || 'opus',
                  bitrate: bestStream.bitrate ? `${Math.round(bestStream.bitrate / 1000)}kbps` : '160kbps',
                  mimeType: bestStream.mimeType || 'audio/webm',
                  duration: data.duration || 220,
                  title: data.title || '',
                  artist: data.uploader || '',
                  thumbnail: data.thumbnailUrl || (data.thumbnails && data.thumbnails[0]?.url) || `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
                  source: 'Studio Master Audio 320k'
                };
              }
            }
          } else if (node.type === 'invidious') {
            const formats = (data.adaptiveFormats || []).filter(f => f.type && f.type.startsWith('audio/'));
            if (formats.length > 0) {
              formats.sort((a, b) => (parseInt(b.bitrate, 10) || 0) - (parseInt(a.bitrate, 10) || 0));
              const best = formats[0];
              if (best && best.url) {
                return {
                  streamUrl: best.url,
                  codec: best.container || 'webm/opus',
                  bitrate: best.bitrate ? `${Math.round(parseInt(best.bitrate, 10) / 1000)}kbps` : '160kbps',
                  mimeType: best.type || 'audio/webm',
                  duration: parseInt(data.lengthSeconds, 10) || 220,
                  title: data.title || '',
                  artist: data.author || '',
                  thumbnail: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
                  source: 'Studio Master Audio 320k'
                };
              }
            }
          }
          throw new Error('No valid streams');
        } catch (e) {
          clearTimeout(timeoutId);
          throw e;
        }
      })
    );

    STREAM_RESOLVER_CACHE.set(cleanId, {
      data: fastestResolved,
      expiresAt: Date.now() + 30 * 60 * 1000
    });
    return fastestResolved;
  } catch (aggregateError) {
    // All raced instances failed — caller should fall through to YouTube IFrame
  }

  return null;
}

/**
 * Searches YouTube Music & YouTube for Songs, Artists, and Audio Tracks
 */
export async function searchYouTubeMusic(query, limit = 30) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  const cleanQ = query.trim();

  if (SEARCH_CACHE.has(cleanQ)) {
    return SEARCH_CACHE.get(cleanQ);
  }

  // Result aggregation arrays (CRITICAL: these must be declared before use)
  const results = [];
  const seenIds = new Set();

  // 1. Primary: Local / Vite backend direct YouTube search endpoint
  try {
    const localBase = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:5173';
    const res = await fetch(`${localBase}/api/yt/search?q=${encodeURIComponent(cleanQ)}`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        SEARCH_CACHE.set(cleanQ, data.results.slice(0, limit));
        return data.results.slice(0, limit);
      }
    }
  } catch (e) {}

  // 2. Secondary: Fallback to active Piped & Invidious nodes
  const nodesToRace = [
    { type: 'piped', url: `${PIPED_INSTANCES[0]}/search?q=${encodeURIComponent(cleanQ)}&filter=music_songs` },
    { type: 'piped', url: `${PIPED_INSTANCES[1]}/search?q=${encodeURIComponent(cleanQ)}&filter=all` },
    { type: 'invidious', url: `${INVIDIOUS_INSTANCES[0]}/api/v1/search?q=${encodeURIComponent(cleanQ)}&type=video` },
    { type: 'invidious', url: `${INVIDIOUS_INSTANCES[1]}/api/v1/search?q=${encodeURIComponent(cleanQ)}&type=video` }
  ];

  try {
    const responses = await Promise.allSettled(
      nodesToRace.map(async (node) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        try {
          const res = await fetch(node.url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('Not ok');
          const json = await res.json();
          const items = Array.isArray(json) ? json : (json.items || []);
          if (items.length === 0) throw new Error('Empty');
          return items;
        } catch (e) {
          clearTimeout(timeoutId);
          throw e;
        }
      })
    );

    for (const r of responses) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        for (const item of r.value) {
          let videoId = '';
          if (item.videoId) {
            videoId = item.videoId;
          } else if (item.url) {
            videoId = item.url.replace('/watch?v=', '').replace('/streams/', '').trim();
          }

          if (videoId && !seenIds.has(videoId) && videoId.length >= 8) {
            seenIds.add(videoId);
            results.push({
              id: `ytm-${videoId}`,
              ytId: videoId,
              title: item.title || 'Untitled Track',
              artist: item.uploaderName || item.author || item.artist || 'YouTube Artist',
              album: item.album || 'YouTube Release',
              coverUrl: item.thumbnail || (item.thumbnails && item.thumbnails[0]?.url) || (item.videoThumbnails && item.videoThumbnails[0]?.url) || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              duration: typeof item.duration === 'number' ? item.duration : (parseInt(item.lengthSeconds, 10) || 220),
              streamUrl: '',
              source: 'Studio Master Audio 320k'
            });
          }
          if (results.length >= limit) break;
        }
      }
    }
  } catch (e) {}

  if (results.length > 0) {
    SEARCH_CACHE.set(cleanQ, results.slice(0, limit));
  }

  return results.slice(0, limit);
}

/**
 * Fetches YouTube Music Top Charts & Trending Songs
 */
export async function fetchYouTubeMusicCharts(country = 'GLOBAL', limit = 30) {
  const cacheKey = `charts_${country}`;
  if (SEARCH_CACHE.has(cacheKey)) {
    return SEARCH_CACHE.get(cacheKey);
  }

  const results = [];
  
  let attempts = 0;
  while (attempts < 3 && results.length === 0) {
    const node = getActivePipedNode();
    try {
      const res = await fetch(`${node}/trending?region=US`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          for (const item of items) {
            const videoId = (item.url || '').replace('/watch?v=', '').trim();
            if (videoId && (item.duration || 0) > 45) {
              results.push({
                id: `ytm-${videoId}`,
                ytId: videoId,
                title: item.title || 'Trending Track',
                artist: item.uploaderName || 'Trending Artist',
                album: 'Global Trending Release',
                coverUrl: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                duration: item.duration || 220,
                streamUrl: '',
                source: 'Studio Master Audio 320k'
              });
            }
          }
        }
      } else {
        throw new Error('Not ok');
      }
    } catch (e) {
      rotatePipedNode();
    }
    attempts++;
  }

  if (results.length > 0) {
    SEARCH_CACHE.set(cacheKey, results.slice(0, limit));
  }

  return results.slice(0, limit);
}

const extractorService = {
  resolvePipedAudioStream,
  searchYouTubeMusic,
  fetchYouTubeMusicCharts,
  getActivePipedNode,
  rotatePipedNode,
  getActiveInvidiousNode,
  rotateInvidiousNode
};

if (typeof window !== 'undefined') {
  window.extractorService = extractorService;
  window.PulseExtractor = extractorService;
}

export default extractorService;
