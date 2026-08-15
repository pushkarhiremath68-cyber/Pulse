import re

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update normalizeTrack function
normalize_func = '''  function getAudioStorageUrl(storagePath) {
    if (!storagePath) return null;
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://') || storagePath.startsWith('blob:')) {
      return storagePath;
    }
    const supabaseUrl = (typeof window !== 'undefined' && window.PULSE_SUPABASE_URL && window.PULSE_SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL')
      ? window.PULSE_SUPABASE_URL
      : ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL')
        ? import.meta.env.VITE_SUPABASE_URL
        : null);

    const bucket = (typeof window !== 'undefined' && window.PULSE_STORAGE_BUCKET) || 'music';
    const cleanPath = storagePath.replace(/^\\/+/, '');

    if (supabaseUrl && supabaseUrl.includes('.')) {
      const cleanBase = supabaseUrl.replace(/\\/+$/, '');
      return `${cleanBase}/storage/v1/object/public/${bucket}/${cleanPath}`;
    }
    return `./storage/music/${cleanPath}`;
  }
  if (typeof window !== 'undefined') {
    window.getAudioStorageUrl = getAudioStorageUrl;
  }

  /**
   * Normalize any track object into the standard Pulse Music format
   * Supports full-length audio files (.mp3, .m4a, .wav, .aac, .flac, .ogg)
   */
  function normalizeTrack(raw) {
    if (!raw) return null;
    const cleanId = String(raw.id || raw.trackId || `track-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
    const cleanTitle = String(raw.title || raw.name || raw.trackName || 'Unknown Title').trim();
    const cleanArtist = String(raw.artist || raw.artistName || raw.primaryArtists || 'Pulse Artist').trim();
    const cleanAlbum = String(raw.album || raw.collectionName || raw.albumName || 'Single').trim();
    
    // High-Resolution Cover Resolution (Guaranteed No Blur)
    let cleanCover = raw.cover || raw.artworkUrl100 || raw.image || null;
    if (typeof cleanCover === 'string' && cleanCover.includes('100x100bb')) {
      cleanCover = cleanCover.replace('100x100bb', '600x600bb');
    }
    if (Array.isArray(cleanCover) && cleanCover.length > 0) {
      cleanCover = cleanCover[cleanCover.length - 1]?.url || cleanCover[0]?.url || null;
    }
    if (!cleanCover || cleanCover.includes('unsplash.com') || cleanCover === './pulse-logo.png') {
      if (raw.ytId) {
        cleanCover = `https://i.ytimg.com/vi/${raw.ytId}/hqdefault.jpg`;
      } else {
        cleanCover = './pulse-logo.png';
      }
    }

    // Duration formatting
    let cleanDuration = raw.duration || '3:30';
    if (typeof cleanDuration === 'number') {
      const m = Math.floor(cleanDuration / 60);
      const s = Math.floor(cleanDuration % 60);
      cleanDuration = `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // Storage Path & Full-Length Audio URL Resolution
    const cleanStoragePath = raw.storagePath || `${cleanId}.mp3`;
    const cleanAudioUrl = (typeof window !== 'undefined' && window.getAudioStorageUrl)
      ? window.getAudioStorageUrl(cleanStoragePath)
      : getAudioStorageUrl(cleanStoragePath);

    return {
      id: cleanId,
      title: cleanTitle,
      artist: cleanArtist,
      album: cleanAlbum,
      cover: cleanCover,
      duration: cleanDuration,
      category: raw.category || 'bollywood',
      storagePath: cleanStoragePath,
      audioUrl: cleanAudioUrl,
      language: raw.language || 'Hindi',
      year: raw.year || 2024,
      ytId: raw.ytId || null,
      ytSearchQuery: raw.ytSearchQuery || `${cleanTitle} ${cleanArtist}`,
      source: raw.source || 'Pulse Supabase Storage'
    };
  }'''

# Replace from 'function normalizeTrack' up to 'const DEMO_CATALOG = ['
content = re.sub(
    r'\/\*\*[\s\S]*?function normalizeTrack\(raw\)[\s\S]*?const DEMO_CATALOG = \[',
    normalize_func + '\n\n  // Master Curated Global Catalog (Supabase Storage Full-Length Audio Engine)\n  const DEMO_CATALOG = [',
    content
)

# Clean up all DEMO_CATALOG entries: remove apple audioUrl / previewUrl lines and ensure storagePath is set
content = re.sub(r'\s*"audioUrl":\s*"https:\/\/audio-ssl\.itunes\.apple\.com[^"]*",?', '', content)
content = re.sub(r'\s*"previewUrl":\s*"https:\/\/audio-ssl\.itunes\.apple\.com[^"]*",?', '', content)

with open('src/musicService.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored src/musicService.js for Supabase Storage successfully!")
