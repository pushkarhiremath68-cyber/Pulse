/**
 * Pulse Music - LRCLIB Synchronized Lyrics Engine & Live Karaoke Sync
 * Queries the free open LRCLIB API (https://lrclib.net) with fast in-memory caching.
 */

const LRCLIB_BASE = 'https://lrclib.net/api';
const memoryCache = new Map();

function cleanSearchTerm(text) {
  if (!text) return '';
  return text
    .replace(/\s*\([^)]*(?:feat|ft|official|remix|bonus|audio|video|soundtrack|version)[^)]*\)/gi, '')
    .replace(/\s*\[[^\]]*(?:feat|ft|official|remix|bonus|audio|video|soundtrack|version)[^\]]*\]/gi, '')
    .trim();
}

function cleanArtistName(text) {
  if (!text) return '';
  return text.split(',')[0].split('&')[0].trim();
}

/**
 * Parses raw .lrc synchronized lyrics into timestamped lines
 * Format: [{ time: 15.71, text: "Lyric line" }, ...]
 */
export function parseLrc(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];
  const lines = lrcText.split('\n');
  const parsed = [];
  const timeTagRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    const matches = [...trimmed.matchAll(timeTagRegex)];
    if (matches.length > 0) {
      const text = trimmed.replace(timeTagRegex, '').trim();
      matches.forEach(match => {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const msStr = match[3] || '0';
        const ms = parseFloat(`0.${msStr}`);
        const totalSeconds = min * 60 + sec + ms;
        if (text) parsed.push({ time: totalSeconds, text });
      });
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
}

export function parsePlainLyrics(plainText) {
  if (!plainText || typeof plainText !== 'string') return [];
  return plainText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(text => ({ time: null, text }));
}

/**
 * Fetches lyrics from LRCLIB with fallbacks
 */
export async function getLyrics(trackOrTitle, optArtist = '') {
  if (!trackOrTitle) return null;
  let title = typeof trackOrTitle === 'string' ? trackOrTitle : (trackOrTitle.title || '');
  let artist = typeof trackOrTitle === 'string' ? optArtist : (trackOrTitle.artist || '');

  const cleanTitle = cleanSearchTerm(title);
  const cleanArtist = cleanArtistName(artist);
  if (!cleanTitle) return null;

  const cacheKey = `${cleanTitle.toLowerCase()}___${cleanArtist.toLowerCase()}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  // 1. Direct GET Query
  try {
    let getUrl = `${LRCLIB_BASE}/get?track_name=${encodeURIComponent(cleanTitle)}`;
    if (cleanArtist) getUrl += `&artist_name=${encodeURIComponent(cleanArtist)}`;

    const res = await fetch(getUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics || data.plainLyrics) {
        const isSynced = Boolean(data.syncedLyrics && data.syncedLyrics.trim().length > 0);
        const lines = isSynced ? parseLrc(data.syncedLyrics) : parsePlainLyrics(data.plainLyrics);
        const payload = {
          title: data.trackName || title,
          artist: data.artistName || artist,
          isSynced,
          lines,
          notFound: false
        };
        memoryCache.set(cacheKey, payload);
        return payload;
      }
    }
  } catch (e) {}

  // 2. Fallback Search Query
  try {
    const searchUrl = `${LRCLIB_BASE}/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`.trim())}`;
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        const item = list.find(x => x.syncedLyrics) || list[0];
        if (item.syncedLyrics || item.plainLyrics) {
          const isSynced = Boolean(item.syncedLyrics && item.syncedLyrics.trim().length > 0);
          const lines = isSynced ? parseLrc(item.syncedLyrics) : parsePlainLyrics(item.plainLyrics);
          const payload = {
            title: item.trackName || title,
            artist: item.artistName || artist,
            isSynced,
            lines,
            notFound: false
          };
          memoryCache.set(cacheKey, payload);
          return payload;
        }
      }
    }
  } catch (e) {}

  const fallback = {
    title,
    artist,
    isSynced: false,
    lines: [],
    notFound: true,
    fallbackMessage: 'Lyrics preview not available for this track.'
  };
  memoryCache.set(cacheKey, fallback);
  return fallback;
}

export function getActiveLineIndex(lines, currentTime) {
  if (!Array.isArray(lines) || lines.length === 0) return -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].time !== null && currentTime >= lines[i].time) return i;
  }
  return -1;
}

const lyricsService = {
  getLyrics,
  parseLrc,
  parsePlainLyrics,
  getActiveLineIndex
};

if (typeof window !== 'undefined') {
  window.lyricsService = lyricsService;
  window.PulseLyrics = lyricsService;
}

export default lyricsService;
