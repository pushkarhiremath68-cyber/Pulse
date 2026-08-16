export const PULSE_STORAGE_BUCKET = 'music';

export const getSupabaseConfig = () => {
  let url = null;
  let key = null;
  let bucket = PULSE_STORAGE_BUCKET;

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      url = import.meta.env.VITE_SUPABASE_URL;
      key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET) {
        bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET;
      }
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    if (!url) url = window.PULSE_SUPABASE_URL;
    if (!key) key = window.PULSE_SUPABASE_ANON_KEY || window.PULSE_SUPABASE_PUBLISHABLE_KEY;
    if (window.PULSE_STORAGE_BUCKET) bucket = window.PULSE_STORAGE_BUCKET;
  }

  return { url, key, bucket };
};

/**
 * Constructs the public Supabase Storage URL for a given audio file path.
 * Supports MP3, M4A, WAV, AAC, FLAC, and OGG full-length audio formats.
 * 
 * @param {string} storagePath - The relative path or filename in the bucket (e.g. 'in-kesariya.mp3')
 * @returns {string} The resolved public audio URL
 */
export function getAudioStorageUrl(storagePath) {
  if (!storagePath) return null;
  
  // If already an absolute HTTP/HTTPS URL, return as-is
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://') || storagePath.startsWith('blob:')) {
    return storagePath;
  }

  const { url, bucket } = getSupabaseConfig();
  const cleanPath = storagePath.replace(/^\/+/, '');

  if (url && url !== 'YOUR_SUPABASE_PROJECT_URL' && url.includes('.')) {
    const cleanBase = url.replace(/\/+$/, '');
    return `${cleanBase}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  // Fallback to local/relative storage path when Supabase credentials are placeholder
  return `./storage/music/${cleanPath}`;
}

const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (url && key && url !== 'YOUR_SUPABASE_PROJECT_URL' && key !== 'YOUR_SUPABASE_PUBLISHABLE_KEY') {
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

// Bind to window for universal access across module and vanilla scripts
if (typeof window !== 'undefined') {
  window.getAudioStorageUrl = getAudioStorageUrl;
  window.PULSE_STORAGE_BUCKET = PULSE_STORAGE_BUCKET;
  window.supabaseClient = supabase;
}

export default supabase;
