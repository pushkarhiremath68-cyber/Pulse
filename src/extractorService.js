/**
 * Pulse Music - YouTube Music & Piped Pure Audio Stream Extractor
 * Resolves direct ad-free Opus (~160kbps) and M4A/AAC (~128kbps/256kbps) audio streams
 * with 0 video frames and zero visual container dependencies.
 */

// Active High-Performance Piped API Instances
export const PIPED_INSTANCES = [
  'https://api.piped.privacydev.net',
  'https://pipedapi.kavin.rocks',
  'https://piped-api.garudalinux.org',
  'https://api.piped.projectsegfau.lt',
  'https://pipedapi.tokhmi.xyz',
  'https://pa.il.ax',
  'https://pipedapi.r4fo.com'
];

// Active Invidious Instances for Secondary Fallback
export const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://inv.tux.pizza',
  'https://invidious.private.coffee',
  'https://invidious.jing.rocks'
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

  const cleanId = videoId.replace('yt-', '').trim();
  if (STREAM_RESOLVER_CACHE.has(cleanId)) {
    const cached = STREAM_RESOLVER_CACHE.get(cleanId);
    if (Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  // FAST CONCURRENT RACING (Piped + Invidious Combined)
  // We race ALL nodes simultaneously. First valid stream wins instantly.
  const nodesToRace = [
    ...PIPED_INSTANCES.map(n => ({ type: 'piped', url: `${n}/streams/${cleanId}` })),
    ...INVIDIOUS_INSTANCES.map(n => ({ type: 'invidious', url: `${n}/api/v1/videos/${cleanId}?fields=title,author,lengthSeconds,formatStreams,adaptiveFormats` }))
  ];

  try {
    const fastestResolved = await Promise.any(
      nodesToRace.map(async (node) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // Generous 6.0s timeout to guarantee we catch even slow working nodes
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
                  thumbnail: data.thumbnailUrl || (data.thumbnails && data.thumbnails[0]?.url) || '',
                  source: 'Piped Master (Fast)'
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
                  source: 'Invidious (Fast)'
                };
              }
            }
          }
          throw new Error('No valid streams');
        } catch (e) {
          clearTimeout(timeoutId);
          throw e; // Important for Promise.any to skip this failure
        }
      })
    );

    STREAM_RESOLVER_CACHE.set(cleanId, {
      data: fastestResolved,
      expiresAt: Date.now() + 30 * 60 * 1000
    });
    return fastestResolved;
  } catch (aggregateError) {
    console.warn('[Audio Extractor] All raced nodes failed:', aggregateError.errors);
  }

  // 3. Try Local Backend Python Extractor
  try {
    const localUrl = `/api/ytm/stream?id=${cleanId}`;
    const res = await fetch(localUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      if (json.streamUrl) {
        const resolved = {
          streamUrl: json.streamUrl,
          codec: json.codec || 'opus/m4a',
          bitrate: json.bitrate || '160kbps',
          duration: json.duration || 220,
          title: json.title || '',
          artist: json.artist || '',
          thumbnail: json.thumbnail || `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
          source: 'Pulse Local High-Throughput Extractor'
        };
        STREAM_RESOLVER_CACHE.set(cleanId, {
          data: resolved,
          expiresAt: Date.now() + 30 * 60 * 1000
        });
        return resolved;
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Searches YouTube Music / Piped for Songs, Artists, and Albums
 * Utilizes a high-performance concurrent race across all nodes to guarantee instant results.
 */
export async function searchYouTubeMusic(query, limit = 25) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  const cleanQ = query.trim();

  if (SEARCH_CACHE.has(cleanQ)) {
    return SEARCH_CACHE.get(cleanQ);
  }

  const results = [];
  const seenIds = new Set();

  const nodesToRace = PIPED_INSTANCES.map(n => `${n}/search?q=${encodeURIComponent(cleanQ)}&filter=music_songs`);

  try {
    const fastestSearch = await Promise.any(
      nodesToRace.map(async (searchUrl) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6.0s max tolerance
        try {
          const res = await fetch(searchUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('Not ok');
          const json = await res.json();
          if (!json.items || json.items.length === 0) throw new Error('Empty');
          return json.items;
        } catch (e) {
          clearTimeout(timeoutId);
          throw e;
        }
      })
    );

    // Parse the winning fast search
    for (const item of fastestSearch) {
      const videoId = (item.url || '').replace('/watch?v=', '').trim();
      if (videoId && !seenIds.has(videoId)) {
        seenIds.add(videoId);
        results.push({
          id: `ytm-${videoId}`,
          ytId: videoId,
          title: item.title || 'Untitled Track',
          artist: item.uploaderName || item.artist || 'YouTube Music Artist',
          album: item.album || 'YouTube Music Single',
          coverUrl: item.thumbnail || (item.thumbnails && item.thumbnails[0]?.url) || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          duration: item.duration || 220,
          streamUrl: '', // Resolved on play
          source: 'YouTube Music Ad-Free Opus'
        });
      }
      if (results.length >= limit) break;
    }
  } catch (aggregateError) {
    console.warn('[Pulse Search Engine] All nodes failed the fast race for search:', aggregateError.errors);
  }

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
  const node = getActivePipedNode();
  try {
    const res = await fetch(`${node}/trending?region=US`, { signal: AbortSignal.timeout(3500) });
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
              source: 'YouTube Music Top Chart'
            });
          }
        }
      }
    }
  } catch (e) {
    rotatePipedNode();
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
  rotatePipedNode
};

if (typeof window !== 'undefined') {
  window.extractorService = extractorService;
  window.PulseExtractor = extractorService;
}

export default extractorService;
