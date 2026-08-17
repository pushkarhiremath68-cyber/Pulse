/**
 * Pulse Music - Supabase Client & 120,000 Catalog REST Engine
 * Connects directly to Supabase PostgreSQL 'public.songs' database
 * and high-fidelity 'music' storage bucket for full-length MP4 audio.
 */

export const PULSE_STORAGE_BUCKET = 'music';

export const getSupabaseConfig = () => {
  let url = 'https://fswnnnmicaakeuhwyyai.supabase.co';
  let key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzd25ubm1pY2Fha2V1aHd5eWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODc3NzQsImV4cCI6MjEwMjU2Mzc3NH0.lptcHWEtEv-dEOLK_y7AfwHTbedCg1DCIKviOiuO7KQ';
  let bucket = PULSE_STORAGE_BUCKET;

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_SUPABASE_URL) url = import.meta.env.VITE_SUPABASE_URL;
      if (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) {
        key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
      }
      if (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET) {
        bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET;
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    if (window.PULSE_SUPABASE_URL) url = window.PULSE_SUPABASE_URL;
    if (window.PULSE_SUPABASE_ANON_KEY || window.PULSE_SUPABASE_PUBLISHABLE_KEY) {
      key = window.PULSE_SUPABASE_ANON_KEY || window.PULSE_SUPABASE_PUBLISHABLE_KEY;
    }
    if (window.PULSE_STORAGE_BUCKET) bucket = window.PULSE_STORAGE_BUCKET;
  }

  return { url, key, bucket };
};

/**
 * Constructs the public Supabase Storage URL for an audio file path (MP4/M4A/MP3/AAC/FLAC).
 * @param {string} storagePath - Relative path or filename in bucket (e.g. 'track-id.mp4')
 * @returns {string} The resolved public audio URL
 */
export function getAudioStorageUrl(storagePath) {
  if (!storagePath) return null;
  
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://') || storagePath.startsWith('blob:')) {
    return storagePath;
  }

  const { url, bucket } = getSupabaseConfig();
  const cleanPath = String(storagePath).replace(/^\/+/, '');

  if (url && url.includes('.')) {
    const cleanBase = url.replace(/\/+$/, '');
    return `${cleanBase}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  return `./storage/music/${cleanPath}`;
}

const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        return window.supabase.createClient(url, key);
      }
    } catch (e) {
      console.warn('[Pulse Supabase Init]', e);
    }
  }
  return null;
};

export const supabase = getSupabaseClient();

/**
 * Formats a raw database row from public.songs into a canonical track object
 */
export function formatSupabaseTrack(r) {
  if (!r) return null;
  const storagePath = r.storage_path || `${r.id || 'track'}.mp4`;
  return {
    id: r.id,
    title: r.title || 'Unknown Title',
    artist: r.artist || 'Unknown Artist',
    album: r.album || 'Single',
    cover: r.cover || (typeof window !== 'undefined' && window.generateTrackCover ? window.generateTrackCover(r.title, r.artist, r.category) : './pulse-logo.png'),
    duration: r.duration || '3:30',
    year: r.year || 2026,
    language: r.language || 'Hindi',
    category: r.category || 'bollywood',
    audioUrl: r.audio_url || getAudioStorageUrl(storagePath),
    storagePath: storagePath,
    ytId: r.yt_id || '',
    source: r.source || 'Pulse Cloud CDN (320kbps MP4)',
    playCount: r.play_count || 0
  };
}

/**
 * Queries songs from the 120,000 Supabase database with pagination, filters, and multi-field smart search.
 */
export async function fetchSongsFromSupabase({
  query = '',
  language = '',
  category = '',
  limit = 50,
  offset = 0,
  sortBy = 'created_at',
  sortOrder = 'desc'
} = {}) {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    const baseUrl = url.replace(/\/+$/, '');
    const headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    };

    let baseEndpoint = `${baseUrl}/rest/v1/songs?select=*&order=${sortBy}.${sortOrder}&limit=${limit}&offset=${offset}`;

    if (language && language !== 'all' && language !== 'All') {
      baseEndpoint += `&language=eq.${encodeURIComponent(language)}`;
    }
    if (category && category !== 'all' && category !== 'All') {
      baseEndpoint += `&category=eq.${encodeURIComponent(category)}`;
    }

    const cleanQuery = (query || '').trim();
    if (!cleanQuery) {
      const resp = await fetch(baseEndpoint, { headers });
      if (!resp.ok) return null;
      const data = await resp.json();
      return Array.isArray(data) ? data.map(formatSupabaseTrack).filter(Boolean) : [];
    }

    const results = [];
    const seenIds = new Set();

    // 1. Primary Attempt: Full Phrase Search
    const qExact = encodeURIComponent(`*${cleanQuery}*`);
    const exactEndpoint = `${baseEndpoint}&or=(title.ilike.${qExact},artist.ilike.${qExact},album.ilike.${qExact},language.ilike.${qExact},category.ilike.${qExact})`;

    try {
      const resp = await fetch(exactEndpoint, { headers });
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) {
          data.forEach(r => {
            if (!seenIds.has(r.id)) {
              seenIds.add(r.id);
              results.push(formatSupabaseTrack(r));
            }
          });
        }
      }
    } catch (e) {}

    // 2. Secondary Attempt: Tokenized multi-word search (if few results found)
    const words = cleanQuery.split(/\s+/).filter(w => w.length >= 3);
    if (results.length < 5 && words.length > 0) {
      const significantWords = words.slice(0, 3);
      for (const word of significantWords) {
        const wQ = encodeURIComponent(`*${word}*`);
        const tokenEndpoint = `${baseEndpoint}&or=(title.ilike.${wQ},artist.ilike.${wQ},album.ilike.${wQ})&limit=30`;
        try {
          const resp = await fetch(tokenEndpoint, { headers });
          if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data)) {
              data.forEach(r => {
                if (!seenIds.has(r.id)) {
                  seenIds.add(r.id);
                  results.push(formatSupabaseTrack(r));
                }
              });
            }
          }
        } catch (e) {}
        if (results.length >= limit) break;
      }
    }

    return results;
  } catch (e) {
    console.warn('[Supabase Songs Query Exception]:', e);
    return null;
  }
}

/**
 * Retrieves a single track by its unique ID directly from Supabase
 */
export async function fetchSongByIdFromSupabase(id) {
  if (!id) return null;
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    const endpoint = `${url.replace(/\/+$/, '')}/rest/v1/songs?id=eq.${encodeURIComponent(id)}&limit=1`;
    const resp = await fetch(endpoint, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data && data.length > 0) {
      return formatSupabaseTrack(data[0]);
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Fetches total count of songs in Supabase database
 */
export async function fetchTotalSongCountFromSupabase() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return 120000;

  try {
    const endpoint = `${url.replace(/\/+$/, '')}/rest/v1/songs?select=id`;
    const resp = await fetch(endpoint, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Range-Unit': 'items',
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    const cr = resp.headers.get('Content-Range');
    if (cr && cr.includes('/')) {
      return parseInt(cr.split('/')[1], 10) || 120000;
    }
    return 120000;
  } catch (e) {
    return 120000;
  }
}

/**
 * Pre-fetches an initial curated seed across all languages for instant UI rendering on startup.
 */
export async function fetchInitialCatalogSeed(perLanguageLimit = 30) {
  const languages = ['Hindi', 'Punjabi', 'English', 'Telugu', 'Kannada', 'Tamil', 'Devotional', 'Malayalam', 'Spanish'];
  const results = [];

  const promises = languages.map(lang =>
    fetchSongsFromSupabase({ language: lang, limit: perLanguageLimit })
  );

  try {
    const settled = await Promise.allSettled(promises);
    for (const res of settled) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        results.push(...res.value);
      }
    }
  } catch (e) {
    console.warn('[Supabase Initial Seed Notice]:', e);
  }

  return results;
}

// Bind globally to window for browser context
if (typeof window !== 'undefined') {
  window.getAudioStorageUrl = getAudioStorageUrl;
  window.PULSE_STORAGE_BUCKET = PULSE_STORAGE_BUCKET;
  window.supabaseClient = supabase;
  window.fetchSongsFromSupabase = fetchSongsFromSupabase;
  window.fetchSongByIdFromSupabase = fetchSongByIdFromSupabase;
  window.fetchTotalSongCountFromSupabase = fetchTotalSongCountFromSupabase;
  window.fetchInitialCatalogSeed = fetchInitialCatalogSeed;
  window.formatSupabaseTrack = formatSupabaseTrack;
}

export default supabase;
