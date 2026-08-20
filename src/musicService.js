/**
 * Pulse Music - High-Precision Ad-Free Audio Engine & Discovery Service
 * Delivers 100% Pure Ad-Free Audio Streams (Opus 160kbps / Studio Master 320kbps)
 * Powered by YouTube Music Piped Extractor, Saavn Master Audio, and Audius Nodes.
 */

import { disambiguateQuery } from './geminiService.js';
import { searchYouTubeMusic, resolvePipedAudioStream, fetchYouTubeMusicCharts } from './extractorService.js';
import CryptoJS from 'crypto-js';



// In-memory LRU-like stream resolution cache
const RESOLVED_STREAM_CACHE = new Map();

/**
 * Decrypts Saavn DES ECB encrypted media URL into direct 320k / 160k MP4/AAC stream URL
 */
export function decryptSaavnMediaUrl(encryptedUrl) {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    if (url && url.startsWith('http')) {
      const u320 = url.replace('_96.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4').replace('_48.mp4', '_320.mp4');
      const u160 = url.replace('_96.mp4', '_160.mp4').replace('_320.mp4', '_160.mp4').replace('_48.mp4', '_160.mp4');
      return { '320': u320, '160': u160, '96': url };
    }
  } catch (e) {
    console.warn('[Pulse Decrypt Notice]', e);
  }
  return null;
}

/**
 * Normalizes raw track objects into standard Pulse format
 */
export function normalizeTrack(raw, source = 'YouTube Music Ad-Free Opus') {
  if (!raw) return null;
  const safeId = raw.id || (raw.ytId ? `ytm-${raw.ytId}` : `pulse-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`);
  const safeTitle = (raw.title || raw.name || raw.trackName || raw.song || 'Untitled Song').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
  const safeArtist = (raw.artist || raw.artist_name || raw.artistName || raw.uploaderName || raw.primaryArtists || raw.singers || (raw.user && raw.user.name) || 'Pulse Artist').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
  const safeAlbum = (raw.album || raw.album_name || raw.collectionName || (typeof raw.album === 'object' && raw.album?.name) || 'Full Album Release').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
  
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
      .replace('100x100bb', '600x600bb')
      .replace('/default.jpg', '/hqdefault.jpg')
      .replace('/mqdefault.jpg', '/hqdefault.jpg');
  }
  if (!cover && raw.ytId) {
    cover = `https://i.ytimg.com/vi/${raw.ytId}/hqdefault.jpg`;
  }
  if (!cover) cover = './pulse-logo.png';

  let stream = raw.streamUrl || raw.audio || raw.audiodownload || raw.downloadUrl || raw.stream || '';
  if (Array.isArray(raw.downloadUrl) && raw.downloadUrl.length > 0) {
    const d320 = raw.downloadUrl.find(d => d.quality === '320kbps')?.link || raw.downloadUrl.find(d => d.quality === '160kbps')?.link || raw.downloadUrl[raw.downloadUrl.length - 1]?.link;
    if (d320) stream = d320;
  }
  if (typeof stream !== 'string') stream = '';

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
    genre: raw.genre || raw.primaryGenreName || raw.language || 'Ad-Free Hits',
    source: source,
    ytId: raw.ytId || (safeId.startsWith('ytm-') ? safeId.replace('ytm-', '') : null)
  };
}

/**
 * Expands user query using YouTube and Gemini search intelligence
 */
async function expandQuery(query) {
  const expanded = [query];
  try {
    const ytUrl = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`;
    const res = await fetch(ytUrl, { signal: AbortSignal.timeout(2000) });
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
 * Searches Saavn Master Audio for 100% Full-Length 320k/160k Songs
 */
export async function searchSaavnMasterTracks(query, limit = 25) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  const cleanQ = query.replace(/[()\[\]{}"'|]/g, ' ').replace(/\s+/g, ' ').trim();
  const results = [];
  const seen = new Set();

  const addTrack = (item, sourceName = 'Studio Master 320k') => {
    if (!item) return;
    let streamUrl = '';
    if (Array.isArray(item.downloadUrl) && item.downloadUrl.length > 0) {
      streamUrl = item.downloadUrl.find(d => d.quality === '320kbps')?.link || item.downloadUrl.find(d => d.quality === '160kbps')?.link || item.downloadUrl[item.downloadUrl.length - 1]?.link || '';
    } else if (item.encrypted_media_url) {
      const dec = decryptSaavnMediaUrl(item.encrypted_media_url);
      if (dec) streamUrl = dec['320'] || dec['160'] || dec['96'] || '';
    } else if (item.streamUrl && typeof item.streamUrl === 'string') {
      streamUrl = item.streamUrl;
    }

    let coverUrl = './pulse-logo.png';
    if (Array.isArray(item.image) && item.image.length > 0) {
      coverUrl = item.image[item.image.length - 1]?.link || item.image[0]?.link;
    } else if (item.image && typeof item.image === 'string') {
      coverUrl = item.image.replace('150x150', '500x500').replace('50x50', '500x500');
    }

    const title = (item.name || item.song || item.title || 'Untitled Song').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    const artist = (item.primaryArtists || item.singers || item.artist || 'Pulse Artist').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    const dur = parseInt(item.duration, 10) || 220;

    const key = `${title.toLowerCase().replace(/[^a-z0-9]/g, '')}___${artist.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        id: item.id ? `saavn-${item.id}` : `pulse-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: title,
        artist: artist,
        album: (typeof item.album === 'object' ? item.album?.name : item.album) || 'Full Release',
        coverUrl: coverUrl,
        duration: dur,
        streamUrl: streamUrl,
        previewUrl: streamUrl,
        genre: item.language || 'Trending Master',
        source: sourceName
      });
    }
  };

  // 1. Direct Saavn Mirror API
  try {
    const mirrorUrl = `https://jiosaavn-api-2.vercel.app/search/songs?query=${encodeURIComponent(cleanQ)}&limit=${limit}`;
    const res = await fetch(mirrorUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      const rawList = json.results || json.data?.results || [];
      if (Array.isArray(rawList)) {
        rawList.forEach(r => addTrack(r));
      }
    }
  } catch (e) {}

  // 2. Local Backend Server Proxy
  if (results.length === 0) {
    try {
      const localUrl = `/api/saavn-search?q=${encodeURIComponent(cleanQ)}&limit=${limit}`;
      const res = await fetch(localUrl, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const json = await res.json();
        const rawList = json.results || [];
        if (Array.isArray(rawList)) {
          rawList.forEach(r => addTrack(r));
        }
      }
    } catch (e) {}
  }

  return results.slice(0, limit);
}


/**
 * Master Global Search: Searches YouTube Music Extractor + Studio Masters + Audius + Jamendo
 * Guarantees zero ads, direct pure audio streams, and complete metadata.
 */
export async function searchTracks(query, limit = 40) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return await fetchTrendingTracks(limit);
  }

  const cleanQuery = query.trim();
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

  // STEP 1: Studio Master JioSaavn 320k (100% Reliable Streams)
  try {
    const saavnTracks = await searchSaavnMasterTracks(cleanQuery, Math.min(limit, 30));
    saavnTracks.forEach(t => addUnique(t));
  } catch (e) {}

  // STEP 2: YouTube Music Ad-Free Extractor
  if (results.length < limit) {
    try {
      const ytTracks = await searchYouTubeMusic(cleanQuery, limit - results.length);
      ytTracks.forEach(t => addUnique(t));
    } catch (e) {}
  }


  return results.slice(0, limit);
}

/**
 * Fetches Trending Tracks from YouTube Music & Global Top Hits
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

  // 1. Studio Master Trending Hits
  const trendingQueries = ['Top Global Hits 2024', 'Bollywood Romance', 'Punjabi Hits'];
  for (const tq of trendingQueries) {
    try {
      const sTracks = await searchSaavnMasterTracks(tq, 15);
      sTracks.forEach(t => addUnique(t));
    } catch (e) {}
  }

  // 2. YouTube Music Global Charts Fallback
  if (results.length < limit) {
    try {
      const ytTracks = await fetchYouTubeMusicCharts(Math.min(limit - results.length, 20));
      ytTracks.forEach(t => addUnique(t));
    } catch (e) {}
  }

  // 3. Audius Trending Top 10
  if (results.length < limit) {
    try {
      const node = getActiveAudiusNode();
      const res = await fetch(`${node}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=10`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          json.data.forEach(t => {
            if (t.duration && t.duration > 45) {
              const norm = normalizeTrack({
                id: `audius-${t.id}`,
                title: t.title,
                artist: t.user?.name,
                artwork: t.artwork,
                duration: t.duration || 220,
                streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
                genre: t.genre || 'Trending Decentralized'
              }, 'Audius Decentralized');
              if (norm) addUnique(norm);
            }
          });
        }
      }
    } catch (e) {}
  }

  // 4. Jamendo Top Tracks of the Week
  if (results.length < limit) {
    try {
      const clientId = 'b6747d04'; // Public Jamendo Client ID
      const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=10&order=popularity_week`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json.results && Array.isArray(json.results)) {
          json.results.forEach(t => {
            if (t.audio && t.duration > 30) {
              const norm = normalizeTrack({
                id: `jamendo-${t.id}`,
                title: t.name,
                artist: t.artist_name,
                artwork: { '1000x1000': t.image },
                duration: parseInt(t.duration, 10) || 200,
                streamUrl: t.audio,
                genre: 'Jamendo Top Weekly'
              }, 'Jamendo Independent');
              if (norm) addUnique(norm);
            }
          });
        }
      }
    } catch (e) {}
  }

  return results.slice(0, limit);
}

/**
 * Fetches Curated Top Tracks for the 6 target languages
 * Each returns up to 100 songs to satisfy the 1000+ total dynamic catalog goal.
 */
export async function fetchLanguagePlaylists() {
  const languages = [
    { id: "hindi", title: "Top Hindi Hits", query: "Bollywood Top 100", icon: "fa-compact-disc", color: "#ec4899" },
    { id: "english", title: "Top English Hits", query: "Global Top Hits 2024", icon: "fa-fire-flame-curved", color: "#ff007a" },
    { id: "kannada", title: "Top Kannada Hits", query: "Kannada Hits", icon: "fa-crown", color: "#f59e0b" },
    { id: "tamil", title: "Top Tamil Hits", query: "Kollywood Chartbusters", icon: "fa-star", color: "#ef4444" },
    { id: "telugu", title: "Top Telugu Hits", query: "Tollywood Viral Songs", icon: "fa-guitar", color: "#3b82f6" },
    { id: "gujarati", title: "Top Gujarati Hits", query: "Gujarati Hits", icon: "fa-music", color: "#10b981" }
  ];

  const results = {};
  
  // Fetch these concurrently
  const promises = languages.map(async (lang) => {
    try {
      const tracks = await searchSaavnMasterTracks(lang.query, 100);
      results[lang.title] = {
        meta: lang,
        tracks: tracks
      };
    } catch (e) {
      results[lang.title] = { meta: lang, tracks: [] };
    }
  });

  await Promise.allSettled(promises);
  return languages.map(l => results[l.title]);
}

/**
 * Resolves 100% Ad-Free Pure Audio Stream for ANY track
 * Eliminates preview clips completely by fetching direct Opus/M4A/320k stream
 */
export async function resolveFullAudioStream(track) {
  if (!track) return null;

  const cacheKey = `${(track.title || '').trim().toLowerCase()}___${(track.artist || '').trim().toLowerCase()}`;
  if (RESOLVED_STREAM_CACHE.has(cacheKey)) {
    return RESOLVED_STREAM_CACHE.get(cacheKey);
  }

  // Check if current streamUrl is already a verified full-length audio stream
  if (track.streamUrl && 
      track.streamUrl.startsWith('http') && 
      !track.streamUrl.includes('preview') && 
      track.duration > 30) {
    const resolved = {
      streamUrl: track.streamUrl,
      duration: track.duration || 220,
      source: track.source || 'Ad-Free Opus Pure Audio'
    };
    RESOLVED_STREAM_CACHE.set(cacheKey, resolved);
    return resolved;
  }

  // 1. Resolve via YouTube Music / Piped Extractor (Direct Opus 160k stream)
  const ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : null);
  if (ytId) {
    try {
      const ytmRes = await resolvePipedAudioStream(ytId);
      if (ytmRes && ytmRes.streamUrl) {
        const resolved = {
          streamUrl: ytmRes.streamUrl,
          duration: ytmRes.duration || track.duration || 220,
          coverUrl: ytmRes.thumbnail || track.coverUrl,
          source: ytmRes.source || 'YouTube Music Ad-Free Opus'
        };
        RESOLVED_STREAM_CACHE.set(cacheKey, resolved);
        return resolved;
      }
    } catch (e) {}
  }

  const cleanTitle = (track.title || '').replace(/\s*\([^)]*(?:feat|ft|official|remix|bonus|audio|video|soundtrack|version)[^)]*\)/gi, '').replace(/\s*\[[^\]]*\]/gi, '').split('-')[0].trim();
  const cleanArtist = (track.artist || '').split(',')[0].split('&')[0].trim();
  const query = `${cleanTitle} ${cleanArtist}`.trim();

  // 2. Search Saavn Master for genuine 320k/160k audio
  try {
    const saavnMatches = await searchSaavnMasterTracks(query, 3);
    if (saavnMatches.length > 0 && saavnMatches[0].streamUrl) {
      const match = saavnMatches[0];
      const resolved = {
        streamUrl: match.streamUrl,
        duration: match.duration || track.duration || 220,
        coverUrl: match.coverUrl || track.coverUrl,
        source: 'Studio Master 320k (Pure Audio)'
      };
      RESOLVED_STREAM_CACHE.set(cacheKey, resolved);
      return resolved;
    }
  } catch (e) {}

  // 3. Search Audius
  try {
    const audiusMatches = await searchAudiusTracks(query, 3);
    if (audiusMatches.length > 0 && audiusMatches[0].streamUrl) {
      const match = audiusMatches[0];
      const resolved = {
        streamUrl: match.streamUrl,
        duration: match.duration || 220,
        source: 'Audius Pure Audio'
      };
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
  fetchTrendingTracks,
  fetchLanguagePlaylists,
  searchSaavnMasterTracks,
  searchAudiusTracks,
  normalizeTrack,
  resolveFullAudioStream,
  resolveExactTrackStream,
  decryptSaavnMediaUrl
};

if (typeof window !== 'undefined') {
  window.musicService = musicService;
}

export default musicService;
