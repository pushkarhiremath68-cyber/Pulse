/**
 * Pulse Music - LRCLIB Lyrics Engine & Live Synchronizer
 * Queries the free, open LRCLIB API (https://lrclib.net) with fast local & in-memory caching.
 * Supports timestamp-synchronized (.lrc) karaoke scroll and plain lyrics formatting.
 */

(function(window) {
  'use strict';

  const LRCLIB_BASE = 'https://lrclib.net/api';
  const CACHE_PREFIX = 'pulse_lyrics_cache_v2_';
  const memoryCache = new Map();

  /**
   * Cleans and prepares song titles and artist names for high-accuracy API matching.
   */
  function cleanSearchTerm(text) {
    if (!text) return '';
    return text
      .replace(/\s*\([^)]*(?:feat|ft|official|remix|bonus|audio|video|soundtrack|version|deluxe)[^)]*\)/gi, '')
      .replace(/\s*\[[^\]]*(?:feat|ft|official|remix|bonus|audio|video|soundtrack|version|deluxe)[^\]]*\]/gi, '')
      .replace(/[\(\)\[\]\{\}"'|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cleanArtistName(text) {
    if (!text) return '';
    return text
      .split(',')[0]
      .split('&')[0]
      .split('feat.')[0]
      .split('ft.')[0]
      .replace(/[\(\)\[\]\{\}"'|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Parses raw .lrc synchronized lyrics string into an ordered array of timestamped lines.
   * Format: [{ time: 15.71, text: "I'm tryna put you in the worst mood, ah" }, ...]
   */
  function parseLrc(lrcText) {
    if (!lrcText || typeof lrcText !== 'string') return [];

    const lines = lrcText.split('\n');
    const parsed = [];
    const timeTagRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Extract all timestamps on this line
      const matches = [...trimmed.matchAll(timeTagRegex)];
      if (matches.length > 0) {
        // Strip timestamps to get clean lyric text
        const text = trimmed.replace(timeTagRegex, '').trim();
        
        matches.forEach(match => {
          const min = parseInt(match[1], 10);
          const sec = parseInt(match[2], 10);
          const msStr = match[3] || '0';
          const ms = parseFloat(`0.${msStr}`);
          const totalSeconds = min * 60 + sec + ms;

          if (text) {
            parsed.push({
              time: totalSeconds,
              text: text
            });
          }
        });
      }
    }

    // Sort chronologically
    return parsed.sort((a, b) => a.time - b.time);
  }

  /**
   * Converts plain un-synced text into standard lines.
   */
  function parsePlainLyrics(plainText) {
    if (!plainText || typeof plainText !== 'string') return [];
    return plainText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(text => ({ time: null, text }));
  }

  /**
   * Fetches lyrics for a track from LRCLIB with fallbacks and caching.
   */
  async function getLyrics(track) {
    if (!track) return null;

    const rawTitle = track.title || track.name || '';
    const rawArtist = track.artist || '';
    const cleanTitle = cleanSearchTerm(rawTitle);
    const cleanArtist = cleanArtistName(rawArtist);

    if (!cleanTitle) return null;

    const cacheKey = `${cleanTitle.toLowerCase()}___${cleanArtist.toLowerCase()}`;

    // 1. Check in-memory cache
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    // 2. Check localStorage cache
    try {
      const stored = localStorage.getItem(CACHE_PREFIX + cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch (e) {}

    let result = null;

    // 3. Direct GET Query to LRCLIB
    try {
      let getUrl = `${LRCLIB_BASE}/get?track_name=${encodeURIComponent(cleanTitle)}`;
      if (cleanArtist) {
        getUrl += `&artist_name=${encodeURIComponent(cleanArtist)}`;
      }
      if (track.album && !track.album.includes('Single')) {
        getUrl += `&album_name=${encodeURIComponent(cleanSearchTerm(track.album))}`;
      }
      if (track.duration && typeof track.duration === 'string' && track.duration.includes(':')) {
        const parts = track.duration.split(':');
        const secs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        if (secs > 0) getUrl += `&duration=${secs}`;
      }

      const res = await fetch(getUrl, {
        headers: { 'User-Agent': 'PulseMusicApp/2.5' },
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.syncedLyrics || data.plainLyrics)) {
          result = formatLyricsPayload(data, cleanTitle, cleanArtist);
        }
      }
    } catch (e) {}

    // 4. Fallback Search Query to LRCLIB
    if (!result) {
      try {
        const searchQuery = `${cleanTitle} ${cleanArtist}`.trim();
        const searchUrl = `${LRCLIB_BASE}/search?q=${encodeURIComponent(searchQuery)}`;

        const res = await fetch(searchUrl, {
          headers: { 'User-Agent': 'PulseMusicApp/2.5' },
          signal: AbortSignal.timeout(4000)
        });

        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            // Find best candidate (prioritize syncedLyrics)
            const syncedCandidate = list.find(item => item.syncedLyrics);
            const chosen = syncedCandidate || list[0];
            if (chosen && (chosen.syncedLyrics || chosen.plainLyrics)) {
              result = formatLyricsPayload(chosen, cleanTitle, cleanArtist);
            }
          }
        }
      } catch (e) {}
    }

    // 5. Fallback via CORS Proxy if direct connection is blocked
    if (!result) {
      try {
        const searchQuery = `${cleanTitle} ${cleanArtist}`.trim();
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${LRCLIB_BASE}/search?q=${encodeURIComponent(searchQuery)}`)}`;
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const chosen = list.find(item => item.syncedLyrics) || list[0];
            if (chosen && (chosen.syncedLyrics || chosen.plainLyrics)) {
              result = formatLyricsPayload(chosen, cleanTitle, cleanArtist);
            }
          }
        }
      } catch (e) {}
    }

    // If still no lyrics, create fallback object
    if (!result) {
      result = {
        title: cleanTitle,
        artist: cleanArtist,
        isSynced: false,
        lines: [],
        rawPlain: '',
        rawSynced: '',
        notFound: true,
        fallbackMessage: 'Lyrics preview not available for this track.'
      };
    }

    // Cache the result
    memoryCache.set(cacheKey, result);
    try {
      localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(result));
    } catch (e) {}

    return result;
  }

  function formatLyricsPayload(data, title, artist) {
    const rawSynced = data.syncedLyrics || '';
    const rawPlain = data.plainLyrics || '';
    const isSynced = Boolean(rawSynced && rawSynced.trim().length > 0);

    const parsedLines = isSynced ? parseLrc(rawSynced) : parsePlainLyrics(rawPlain);

    return {
      id: data.id || null,
      title: data.trackName || title,
      artist: data.artistName || artist,
      album: data.albumName || '',
      duration: data.duration || 0,
      isSynced: isSynced && parsedLines.length > 0,
      lines: parsedLines,
      rawSynced,
      rawPlain,
      notFound: parsedLines.length === 0,
      fallbackMessage: parsedLines.length === 0 ? 'Lyrics preview not available for this track.' : ''
    };
  }

  /**
   * Given an ordered list of timestamped lines and the current audio playback time,
   * returns the index of the active lyric line.
   */
  function getActiveLineIndex(lines, currentTime) {
    if (!Array.isArray(lines) || lines.length === 0) return -1;
    if (currentTime < lines[0].time) return -1;

    for (let i = lines.length - 1; i >= 0; i--) {
      if (currentTime >= lines[i].time) {
        return i;
      }
    }
    return -1;
  }

  const lyricsService = {
    getLyrics,
    parseLrc,
    parsePlainLyrics,
    getActiveLineIndex,
    cleanSearchTerm
  };

  window.lyricsService = lyricsService;
  window.PulseLyrics = lyricsService;

})(typeof window !== 'undefined' ? window : globalThis);
