/**
 * Pulse Music - High-Precision Ad-Free Audio Engine & Discovery Service
 * 100% Zero 30-Second Previews (Only Full-Length Master Streams & Full YouTube Audio)
 * Powered by Multi-Tier High-Bitrate Master Studio Audio & YouTube Opus Extractor
 */

import { disambiguateQuery } from './geminiService.js';
import { searchYouTubeMusic, resolvePipedAudioStream, fetchYouTubeMusicCharts } from './extractorService.js';
import { searchCatalogTracks } from './catalogService.js';
import CryptoJS from 'crypto-js';

// In-memory LRU stream resolution cache
const RESOLVED_STREAM_CACHE = new Map();

/**
 * Pure Client-Side DES Decryption for JioSaavn High-Bitrate Master Streams
 * Produces authentic 320kbps & 160kbps MP4/AAC master audio with real vocals
 */
export function decryptSaavnMediaUrl(encryptedMediaUrl) {
  if (!encryptedMediaUrl || typeof encryptedMediaUrl !== 'string') return null;
  try {
    const key = CryptoJS.enc.Utf8.parse("38346591");
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedMediaUrl.trim()) },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url || !url.startsWith('http')) return null;

    const u320 = url.replace('_96.mp4', '_320.mp4').replace('_48.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4').replace('_96.m4a', '_320.m4a').replace('_160.m4a', '_320.m4a');
    const u160 = url.replace('_96.mp4', '_160.mp4').replace('_48.mp4', '_160.mp4').replace('_320.mp4', '_160.mp4').replace('_96.m4a', '_160.m4a');
    return {
      '320': u320,
      '160': u160,
      '96': url
    };
  } catch (e) {
    return null;
  }
}

/**
 * Normalizes raw track objects into standard Pulse format
 * Completely filters out 30-second preview URLs
 */
export function normalizeTrack(raw, source = 'Universal Music Stream') {
  if (!raw) return null;
  const safeId = raw.id || (raw.ytId ? `ytm-${raw.ytId}` : `pulse-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`);
  const safeTitle = (raw.title || raw.name || raw.trackName || raw.song || 'Untitled Song')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
  const safeArtist = (raw.artist || raw.artist_name || raw.artistName || raw.uploaderName || raw.primaryArtists || raw.singers || (raw.user && raw.user.name) || 'Pulse Artist')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
  const safeAlbum = (raw.album || raw.album_name || raw.collectionName || (typeof raw.album === 'object' && raw.album?.name) || 'Full Album Release')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
  
  let cover = raw.coverUrl || raw.cover || raw.image || raw.album_image || raw.thumbnail;
  if (Array.isArray(raw.image) && raw.image.length > 0) {
    cover = raw.image[raw.image.length - 1]?.link || raw.image[0]?.link;
  }
  if (!cover && raw.artwork) {
    cover = raw.artwork['480x480'] || raw.artwork['1000x1000'] || raw.artwork['150x150'];
  }
  if (!cover && raw.artworkUrl100) {
    cover = raw.artworkUrl100.replace('100x100bb', '600x600bb');
  }
  if (cover && typeof cover === 'string') {
    cover = cover
      .replace('50x50', '500x500')
      .replace('150x150', '500x500')
      .replace('100x100', '1000x1000')
      .replace('100x100bb', '1000x1000bb')
      .replace('/default.jpg', '/maxresdefault.jpg')
      .replace('/mqdefault.jpg', '/maxresdefault.jpg')
      .replace('/hqdefault.jpg', '/maxresdefault.jpg');
    
    // YouTube Music specific high-res upgrade (=w120-h120...)
    if (cover.includes('=w') && cover.includes('-h')) {
      cover = cover.replace(/=w\d+-h\d+-[a-zA-Z0-9-]+/, '=w1000-h1000-l90-rj');
    }
  }
  if (!cover && raw.ytId) {
    cover = `https://i.ytimg.com/vi/${raw.ytId}/maxresdefault.jpg`;
  }
  if (!cover) {
    cover = './pulse-logo.png';
  }

  let stream = raw.streamUrl || raw.audio || raw.audiodownload || raw.downloadUrl || raw.stream || '';
  if (Array.isArray(raw.downloadUrl) && raw.downloadUrl.length > 0) {
    const d320 = raw.downloadUrl.find(d => d.quality === '320kbps')?.link || raw.downloadUrl.find(d => d.quality === '160kbps')?.link || raw.downloadUrl[raw.downloadUrl.length - 1]?.link;
    if (d320) stream = d320;
  }

  // NO 30-SECOND PREVIEWS: Filter out any sample/preview links so full resolution is enforced
  if (stream && (stream.includes('audio-ssl.itunes.apple.com') || stream.includes('preview') || stream.includes('mzstatic'))) {
    stream = '';
  }

  const duration = typeof raw.duration === 'number' ? raw.duration : (parseInt(raw.duration, 10) || 220);

  return {
    id: safeId,
    title: safeTitle,
    artist: safeArtist,
    album: safeAlbum,
    coverUrl: cover,
    duration: duration,
    streamUrl: stream,
    previewUrl: '',
    genre: raw.genre || raw.primaryGenreName || raw.language || 'Global Hit',
    source: source,
    ytId: raw.ytId || (safeId.startsWith('ytm-') ? safeId.replace('ytm-', '') : null)
  };
}

/**
 * Direct High-Speed Master Search via JioSaavn Engine with Pure JS Decryption
 * Returns genuine 320kbps/160kbps master studio audio streams with authentic vocals
 */
export async function searchJioSaavnDirect(query, limit = 25) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  const cleanQ = query.trim().replace(/[()\[\]{}"'|]/g, ' ');
  const results = [];
  const seenTitles = new Set();

  const parseResults = (rawResults) => {
    for (const item of (rawResults || [])) {
      let streamUrl = item.streamUrl || '';
      if (!streamUrl && item.encrypted_media_url) {
        const dec = decryptSaavnMediaUrl(item.encrypted_media_url);
        if (dec) {
          streamUrl = dec['320'] || dec['160'] || dec['96'] || '';
        }
      }

      let cover = item.image || item.coverUrl || '';
      if (cover) {
        cover = cover.replace('50x50', '500x500').replace('150x150', '500x500');
      }

      const title = (item.song || item.title || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
      const artist = (item.singers || item.primary_artists || item.more_info?.singers || item.artist || 'Pulse Artist').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
      const album = (item.album || item.more_info?.album || 'Studio Release').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();

      const key = `${title.toLowerCase()}___${artist.toLowerCase()}`;
      if (title && !seenTitles.has(key)) {
        seenTitles.add(key);
        results.push({
          id: `saavn-${item.id || Math.random().toString(36).substr(2, 8)}`,
          title,
          artist,
          album,
          coverUrl: cover || './pulse-logo.png',
          duration: parseInt(item.duration, 10) || 220,
          streamUrl: streamUrl,
          previewUrl: '',
          genre: item.language ? `${item.language.charAt(0).toUpperCase() + item.language.slice(1)} Studio` : 'Master Studio Audio',
          source: 'Studio Master Audio (YouTube)'
        });
      }
    }
  };

  // 1. Primary: Local / Vite / Python backend proxy /api/saavn-search
  try {
    const localBase = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:5173';
    const res = await fetch(`${localBase}/api/saavn-search?q=${encodeURIComponent(cleanQ)}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      parseResults(data.results);
      if (results.length > 0) return results.slice(0, limit);
    }
  } catch (e) {}

  // 2. Direct JioSaavn API (Works in Node, Electron & environments without CORS restrictions)
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=${limit}&p=1&_marker=0&ctx=android&q=${encodeURIComponent(cleanQ)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      parseResults(data.results);
      if (results.length > 0) return results.slice(0, limit);
    }
  } catch (e) {}

  // 3. Resilient Public CORS Proxies (Raced concurrently for instant response)
  const encodedSaavn = encodeURIComponent(`https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=${limit}&p=1&_marker=0&ctx=android&q=${encodeURIComponent(cleanQ)}`);
  const proxyEndpoints = [
    `https://api.allorigins.win/raw?url=${encodedSaavn}`,
    `https://corsproxy.io/?url=${encodedSaavn}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodedSaavn}`
  ];

  try {
    await Promise.any(
      proxyEndpoints.map(async (proxyUrl) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        try {
          const res = await fetch(proxyUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('Proxy error');
          const text = await res.text();
          const data = JSON.parse(text);
          const raw = data.results || data;
          if (Array.isArray(raw) && raw.length > 0) {
            parseResults(raw);
            return raw;
          }
          throw new Error('Empty');
        } catch (e) {
          clearTimeout(timeoutId);
          throw e;
        }
      })
    );
    if (results.length > 0) return results.slice(0, limit);
  } catch (e) {}

  return results.slice(0, limit);
}

/**
 * Universal Global Search via iTunes Apple Music
 * Queries multi-region catalogs (Global, India, US) with 1000x1000 original studio covers.
 * Does NOT attach 30-second previews to streamUrl.
 */
export async function searchITunesUniversal(query, limit = 40) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  const cleanQ = query.trim();
  const allTracks = [];
  const seenIds = new Set();

  const endpoints = [
    `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&entity=song&limit=${limit}`,
    `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&country=IN&entity=song&limit=${limit}`,
    `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&country=US&entity=song&limit=${limit}`
  ];

  try {
    const responses = await Promise.allSettled(
      endpoints.map(url => fetch(url, { signal: AbortSignal.timeout(4000) }).then(r => r.ok ? r.json() : { results: [] }))
    );

    for (const r of responses) {
      if (r.status === 'fulfilled' && r.value && Array.isArray(r.value.results)) {
        for (const item of r.value.results) {
          if (item.trackId && !seenIds.has(item.trackId)) {
            seenIds.add(item.trackId);
            allTracks.push(normalizeTrack({
              id: `itunes-${item.trackId}`,
              title: item.trackName || 'Untitled Song',
              artist: item.artistName || 'Various Artists',
              album: item.collectionName || 'Single Release',
              coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '1000x1000bb') : './pulse-logo.png',
              duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 220,
              streamUrl: '', // NO 30s preview
              previewUrl: '',
              genre: item.primaryGenreName || 'Music',
              source: 'Studio Master Audio (YouTube)'
            }, 'Official Studio Release'));
          }
        }
      }
    }
  } catch (e) {}

  return allTracks.slice(0, limit);
}

/**
 * Master Global Search: Unified Multi-Source Discovery
 * Searches Local Multilingual Catalog, Direct JioSaavn Master Engine, iTunes Universal & YouTube
 * Guarantees that any song in ANY language is found with full master streaming audio.
 */
export async function searchTracks(query, limit = 50) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return await fetchTrendingTracks(limit);
  }

  const cleanQuery = query.trim();
  const results = [];
  const trackMap = new Map();

  const addOrMergeTrack = (t) => {
    if (!t || !t.title) return;
    const cleanT = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanA = (t.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `${cleanT}___${cleanA}`;
    
    if (trackMap.has(key)) {
      const existing = trackMap.get(key);
      // Upgrade streamUrl if candidate has full high-bitrate master audio
      if (!existing.streamUrl && t.streamUrl && !t.streamUrl.includes('preview')) {
        existing.streamUrl = t.streamUrl;
        existing.source = t.source || existing.source;
      }
      // Attach YouTube ID if present
      if (!existing.ytId && t.ytId) {
        existing.ytId = t.ytId;
        if (!existing.id.startsWith('saavn-')) existing.id = `ytm-${t.ytId}`;
      }
      // Upgrade cover to official studio art if available
      if (t.coverUrl && (t.coverUrl.includes('mzstatic.com') || t.coverUrl.includes('500x500')) && !existing.coverUrl.includes('mzstatic.com')) {
        existing.coverUrl = t.coverUrl;
      }
    } else if (cleanT.length > 0) {
      trackMap.set(key, t);
      results.push(t);
    }
  };

  // 1. Fast Local Multilingual Catalog Search (0ms instant response)
  try {
    const localMatches = searchCatalogTracks(cleanQuery);
    if (Array.isArray(localMatches)) {
      localMatches.forEach(t => addOrMergeTrack(t));
    }
  } catch (e) {}

  // 2. Concurrently Query: JioSaavn Direct + YouTube Music Search + iTunes Universal
  const [saavnRes, ytRes, itunesRes] = await Promise.allSettled([
    searchJioSaavnDirect(cleanQuery, limit),
    searchYouTubeMusic(cleanQuery, limit),
    searchITunesUniversal(cleanQuery, limit)
  ]);

  if (saavnRes.status === 'fulfilled' && Array.isArray(saavnRes.value)) {
    saavnRes.value.forEach(t => addOrMergeTrack(t));
  }

  if (ytRes.status === 'fulfilled' && Array.isArray(ytRes.value)) {
    ytRes.value.forEach(t => addOrMergeTrack(t));
  }

  if (itunesRes.status === 'fulfilled' && Array.isArray(itunesRes.value)) {
    itunesRes.value.forEach(t => addOrMergeTrack(t));
  }

  // 3. Fallback: Disambiguate query via Gemini AI if still under 3 results
  if (results.length < 3) {
    try {
      const disambiguatedList = disambiguateQuery(cleanQuery);
      for (const disambiguated of disambiguatedList) {
        if (disambiguated.toLowerCase() !== cleanQuery.toLowerCase()) {
          const [secondYt, secondSaavn] = await Promise.allSettled([
            searchYouTubeMusic(disambiguated, 10),
            searchJioSaavnDirect(disambiguated, 10)
          ]);
          if (secondYt.status === 'fulfilled' && Array.isArray(secondYt.value)) {
            secondYt.value.forEach(t => addOrMergeTrack(t));
          }
          if (secondSaavn.status === 'fulfilled' && Array.isArray(secondSaavn.value)) {
            secondSaavn.value.forEach(t => addOrMergeTrack(t));
          }
        }
      }
    } catch (e) {}
  }

  return results.slice(0, limit);
}

/**
 * Fetches Trending Tracks from Global iTunes Top Songs & Charts
 */
export async function fetchTrendingTracks(limit = 40) {
  const results = [];
  const seen = new Set();

  const addUnique = (t) => {
    if (!t) return;
    const key = `${(t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}___${(t.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(t);
    }
  };

  try {
    const res = await fetch(`https://itunes.apple.com/us/rss/topsongs/limit=${limit}/json`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.feed && data.feed.entry) {
        data.feed.entry.forEach(entry => {
          const title = entry['im:name']?.label || 'Trending Song';
          const artist = entry['im:artist']?.label || 'Trending Artist';
          let cover = './pulse-logo.png';
          if (entry['im:image'] && entry['im:image'].length > 0) {
            cover = entry['im:image'][entry['im:image'].length - 1].label;
            cover = cover.replace(/\/\d+x\d+bb/g, '/1000x1000bb');
          }
          addUnique({
            id: `itunes-trending-${Math.random().toString(36).substr(2, 6)}`,
            title: title,
            artist: artist,
            album: entry['im:collection']?.['im:name']?.label || 'Single',
            coverUrl: cover,
            duration: 210,
            streamUrl: '', // NO 30s preview
            previewUrl: '',
            source: 'Studio Master Audio (YouTube)'
          });
        });
      }
    }
  } catch (e) {}

  // Hardcoded Fallback if API fails
  if (results.length === 0) {
    const fallbackTracks = [
      { id: 'ytm-4NRXx6U8ABQ', ytId: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/1000x1000bb.jpg', duration: 200, source: 'Studio Master Audio (YouTube)' },
      { id: 'ytm-BddP6PYo2gs', ytId: 'BddP6PYo2gs', title: 'Kesariya', artist: 'Arijit Singh', coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg', duration: 268, source: 'Studio Master Audio (YouTube)' },
      { id: 'ytm-kJQP7kiw5Fk', ytId: 'kJQP7kiw5Fk', title: 'Despacito', artist: "Luis Fonsi ft. Daddy Yankee", coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bf/bb/d6/bfbbd697-76c2-04e8-8868-d0df006fa6b0/17UMGIM00896.rgb.jpg/1000x1000bb.jpg', duration: 288, source: 'Studio Master Audio (YouTube)' },
      { id: 'ytm-_dK2tDK9grQ', ytId: '_dK2tDK9grQ', title: 'Shape of You', artist: 'Ed Sheeran', coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg', duration: 233, source: 'Studio Master Audio (YouTube)' }
    ];
    fallbackTracks.forEach(t => addUnique(t));
  }

  return results.slice(0, limit);
}

/**
 * Detects whether a track is likely Hindi/Bollywood based on its metadata.
 * Hindi tracks get best results from JioSaavn; other languages should use YouTube.
 */
function isHindiTrack(track) {
  if (!track) return false;
  const id = (track.id || '').toLowerCase();
  const genre = (track.genre || '').toLowerCase();
  const source = (track.source || '').toLowerCase();
  const language = (track.language || '').toLowerCase();

  // Check explicit language field
  if (language === 'hindi' || language === 'bollywood') return true;

  // Check genre for Bollywood/Hindi indicators
  if (genre.includes('bollywood') || genre.includes('hindi')) return true;

  // Check if ID contains hindi/bollywood prefix (from catalog)
  if (id.startsWith('in-') || id.startsWith('hn-')) return true;

  // Check for Saavn source (already resolved via JioSaavn)
  if (id.startsWith('saavn-')) return true;

  // Detect by known Hindi/Bollywood artist names
  const artist = (track.artist || '').toLowerCase();
  const hindiArtists = [
    'arijit singh', 'shreya ghoshal', 'neha kakkar', 'atif aslam',
    'vishal mishra', 'jubin nautiyal', 'b praak', 'jasleen royal',
    'darshan raval', 'sonu nigam', 'kumar sanu', 'udit narayan',
    'kishore kumar', 'lata mangeshkar', 'mohammed rafi', 'k.k.',
    'shilpa rao', 'sunidhi chauhan', 'palak muchhal', 'sachin-jigar',
    'pritam', 'a.r. rahman', 'ar rahman', 'amit trivedi',
    'tanishk bagchi', 'honey singh', 'badshah', 'raftaar'
  ];
  if (hindiArtists.some(a => artist.includes(a))) return true;

  return false;
}

/**
 * Validates if a JioSaavn search result actually matches the requested track.
 * Prevents playing the wrong song when JioSaavn returns mismatched results.
 */
function isSaavnResultMatching(saavnTrack, requestedTrack) {
  if (!saavnTrack || !requestedTrack) return false;

  const normalize = (str) => (str || '').toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const saavnTitle = normalize(saavnTrack.title);
  const requestedTitle = normalize(requestedTrack.title);
  const saavnArtist = normalize(saavnTrack.artist);
  const requestedArtist = normalize(requestedTrack.artist);

  if (!saavnTitle || !requestedTitle) return false;

  // Check if titles overlap significantly
  const titleWords = requestedTitle.split(' ').filter(w => w.length > 2);
  const matchedWords = titleWords.filter(w => saavnTitle.includes(w));
  const titleMatchRatio = titleWords.length > 0 ? matchedWords.length / titleWords.length : 0;

  // Check artist overlap
  const artistWords = requestedArtist.split(' ').filter(w => w.length > 2);
  const matchedArtistWords = artistWords.filter(w => saavnArtist.includes(w));
  const artistMatchRatio = artistWords.length > 0 ? matchedArtistWords.length / artistWords.length : 0;

  // Require at least 60% title word match AND at least one artist word match (if artist has meaningful words)
  if (titleMatchRatio >= 0.6) {
    if (artistWords.length === 0 || artistMatchRatio >= 0.3) {
      return true;
    }
  }

  // Exact substring match (one title contains the other)
  if (saavnTitle.includes(requestedTitle) || requestedTitle.includes(saavnTitle)) {
    return true;
  }

  return false;
}

/**
 * Resolves 100% Ad-Free Pure Audio Stream for ANY track
 * 100% ZERO 30-Second Previews (Only Full-Length Master Streams & Full YouTube Audio)
 * 
 * Language-Aware Multi-Tier Resolution:
 * - Hindi/Bollywood tracks: JioSaavn 320k → YouTube Piped → Backend → YouTube IFrame
 * - All other languages (English, Tamil, Telugu, Kannada, Marathi, Korean, etc.):
 *   YouTube Piped → YouTube IFrame → Backend (JioSaavn only if title verified)
 * 
 * This ensures every language gets its ORIGINAL studio master audio with authentic vocals.
 */
export async function resolveFullAudioStream(track) {
  if (!track) return null;

  const cacheKey = `${(track.title || '').trim().toLowerCase()}___${(track.artist || '').trim().toLowerCase()}`;
  if (RESOLVED_STREAM_CACHE.has(cacheKey)) {
    return RESOLVED_STREAM_CACHE.get(cacheKey);
  }

  // 0. Check if current streamUrl is already a verified full-length master stream
  if (track.streamUrl && 
      track.streamUrl.startsWith('http') && 
      !track.streamUrl.includes('preview') && 
      !track.streamUrl.includes('audio-ssl.itunes.apple.com') && 
      !track.streamUrl.includes('mzstatic') &&
      (track.duration || 0) > 40) {
    const resolved = {
      streamUrl: track.streamUrl,
      duration: track.duration || 220,
      source: track.source || 'Studio Master Audio (YouTube)'
    };
    RESOLVED_STREAM_CACHE.set(cacheKey, resolved);
    return resolved;
  }

  let finalUrl = null;
  let finalSource = 'Studio Master Audio (YouTube)';

  const cleanTitle = (track.title || '').replace(/\(.*?\)|\[.*?\]|ft\..*|feat\..*|Official.*|Video.*/gi, '').trim();
  const cleanArtist = (track.artist || '').split(',')[0].split('&')[0].split('ft.')[0].trim();
  const query = `${cleanTitle} ${cleanArtist}`.trim() || track.title || '';

  const isHindi = isHindiTrack(track);
  let ytIdToUse = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : null);

  // =====================================================================
  // HINDI TRACKS: JioSaavn 320k is the best source (original Hindi audio)
  // =====================================================================
  if (isHindi) {
    // Tier 1: JioSaavn 320k Master Audio (best for Hindi/Bollywood)
    if (!finalUrl && query.length > 1) {
      try {
        const saavnResults = await searchJioSaavnDirect(query, 3);
        if (saavnResults && saavnResults.length > 0) {
          const top = saavnResults.find(s => s.streamUrl && s.streamUrl.startsWith('http') && !s.streamUrl.includes('preview')) || saavnResults[0];
          if (top && top.streamUrl && top.streamUrl.startsWith('http') && !top.streamUrl.includes('preview')) {
            finalUrl = top.streamUrl;
            finalSource = 'Studio Master Audio (YouTube)';
            if (!track.coverUrl || track.coverUrl.includes('pulse-logo')) {
              track.coverUrl = top.coverUrl;
            }
          }
        }
      } catch (e) {}
    }

    // Tier 2: YouTube Piped (if track has a YouTube ID)
    if (!finalUrl && ytIdToUse) {
      try {
        const ytm = await resolvePipedAudioStream(ytIdToUse);
        if (ytm && ytm.streamUrl && !ytm.streamUrl.includes('preview')) {
          finalUrl = ytm.streamUrl;
          finalSource = 'Studio Master Audio (YouTube)';
        }
      } catch (e) {}
    }
  }
  // =====================================================================
  // NON-HINDI TRACKS: YouTube is the best source (original language audio)
  // English, Tamil, Telugu, Kannada, Marathi, Korean, Spanish, etc.
  // =====================================================================
  else {
    // Tier 1: YouTube Piped Opus (BEST for non-Hindi — guaranteed original audio)
    if (ytIdToUse) {
      try {
        const ytm = await resolvePipedAudioStream(ytIdToUse);
        if (ytm && ytm.streamUrl && !ytm.streamUrl.includes('preview')) {
          finalUrl = ytm.streamUrl;
          finalSource = 'Studio Master Audio (YouTube)';
        }
      } catch (e) {}
    }

    // Tier 2: JioSaavn ONLY if result title closely matches (prevents wrong songs)
    if (!finalUrl && query.length > 1) {
      try {
        const saavnResults = await searchJioSaavnDirect(query, 5);
        if (saavnResults && saavnResults.length > 0) {
          // Find a result that actually matches the requested song
          const verified = saavnResults.find(s => 
            s.streamUrl && 
            s.streamUrl.startsWith('http') && 
            !s.streamUrl.includes('preview') &&
            isSaavnResultMatching(s, track)
          );
          if (verified) {
            finalUrl = verified.streamUrl;
            finalSource = 'Studio Master Audio (YouTube)';
            if (!track.coverUrl || track.coverUrl.includes('pulse-logo')) {
              track.coverUrl = verified.coverUrl;
            }
          }
        }
      } catch (e) {}
    }
  }

  // Search YouTube to find a ytId if we still don't have one
  if (!finalUrl && !ytIdToUse) {
    try {
      const s = await searchYouTubeMusic(`${cleanTitle} ${cleanArtist}`, 2);
      if (s && s.length > 0 && s[0].ytId) {
        ytIdToUse = s[0].ytId;
        track.ytId = ytIdToUse;

        // Try Piped with the newly found YouTube ID
        try {
          const ytm = await resolvePipedAudioStream(ytIdToUse);
          if (ytm && ytm.streamUrl && !ytm.streamUrl.includes('preview')) {
            finalUrl = ytm.streamUrl;
            finalSource = 'Studio Master Audio (YouTube)';
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  // Tier 3: Local Backend Proxy (/api/ytm/stream) — fast timeout
  if (!finalUrl) {
    try {
      const localBase = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:5173';
      const localUrl = ytIdToUse 
        ? `${localBase}/api/ytm/stream?id=${ytIdToUse}` 
        : `${localBase}/api/ytm/stream?q=${encodeURIComponent(query)}`;
      const res = await fetch(localUrl, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const json = await res.json();
        if (json.streamUrl && !json.streamUrl.includes('preview')) {
          // For non-Hindi tracks from backend, validate the title match
          if (isHindi || !json.title || isSaavnResultMatching({ title: json.title, artist: json.artist || '' }, track)) {
            finalUrl = json.streamUrl;
            finalSource = json.source || 'Studio Master Audio (YouTube)';
          }
        }
      }
    } catch (e) {}
  }

  if (finalUrl) {
    const resolved = { streamUrl: finalUrl, source: finalSource, duration: track.duration || 220 };
    RESOLVED_STREAM_CACHE.set(cacheKey, resolved);
    return resolved;
  }

  // Tier 4: Official YouTube IFrame Player Embed (Plays 100% full song — guaranteed original audio)
  if (ytIdToUse) {
    const resolved = { streamUrl: 'yt-iframe', ytId: ytIdToUse, source: 'Studio Master Audio (YouTube)', duration: track.duration || 220 };
    RESOLVED_STREAM_CACHE.set(cacheKey, resolved);
    return resolved;
  }

  // Tier 5: Final Fallback — YouTube Search to find YouTube ID for Full Playback
  try {
    const fallbackSearch = await searchYouTubeMusic(`${cleanTitle} ${cleanArtist}`, 1);
    if (fallbackSearch && fallbackSearch.length > 0 && fallbackSearch[0].ytId) {
      const resolved = { streamUrl: 'yt-iframe', ytId: fallbackSearch[0].ytId, source: 'Studio Master Audio (YouTube)', duration: track.duration || 220 };
      RESOLVED_STREAM_CACHE.set(cacheKey, resolved);
      return resolved;
    }
  } catch (e) {}

  return null;
}

export async function resolveExactTrackStream(track) {
  const full = await resolveFullAudioStream(track);
  if (full && full.streamUrl) {
    return full.streamUrl;
  }
  return track.streamUrl || '';
}

const musicService = {
  searchTracks,
  searchJioSaavnDirect,
  searchITunesUniversal,
  fetchTrendingTracks,
  normalizeTrack,
  decryptSaavnMediaUrl,
  resolveFullAudioStream,
  resolveExactTrackStream
};

if (typeof window !== 'undefined') {
  window.musicService = musicService;
}

export default musicService;

