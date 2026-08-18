/**
 * Pulse Music - Structured Multi-Category Catalog & Artist Directory Engine
 * Powered by Audius & Jamendo Live APIs with 30s Snippet Preview Engine.
 */

const JAMENDO_CLIENT_ID = '23b33f2a';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const AUDIUS_APP_NAME = 'PULSE_APP';

// 1. Dynamic Category & Genre Configurations
export const CATEGORIES = {
  'pop': {
    id: 'pop',
    title: 'English & Global Pop',
    subtitle: 'Billboard hits, catchy hooks & chart-topping pop anthems',
    icon: 'fa-earth-americas',
    color: '#3b82f6',
    audiusGenre: 'Pop',
    jamendoTags: 'pop,english'
  },
  'hindi': {
    id: 'hindi',
    title: 'Hindi & Desi Beats',
    subtitle: 'Soulful Bollywood hits, modern Indian indie & romantic classics',
    icon: 'fa-compact-disc',
    color: '#ec4899',
    audiusQuery: 'Hindi',
    jamendoTags: 'indian,hindi,bollywood'
  },
  'electronic': {
    id: 'electronic',
    title: 'EDM & Electronic Heat',
    subtitle: 'High-energy club bangers, house, synthwave & dance',
    icon: 'fa-bolt-lightning',
    color: '#a855f7',
    audiusGenre: 'Electronic',
    jamendoTags: 'edm,electronic'
  },
  'lofi': {
    id: 'lofi',
    title: 'Lo-Fi & Study Chill',
    subtitle: 'Soothing instrumental beats, ambient vibes & relaxation',
    icon: 'fa-headphones-simple',
    color: '#10b981',
    audiusGenre: 'Lo-Fi',
    jamendoTags: 'lofi,chillout'
  },
  'rock': {
    id: 'rock',
    title: 'Rock & Alternative',
    subtitle: 'Electric riffs, indie rock, classic anthems & punk',
    icon: 'fa-guitar',
    color: '#ef4444',
    audiusGenre: 'Rock',
    jamendoTags: 'rock,indie'
  },
  'ambient': {
    id: 'ambient',
    title: 'Ambient & Cinematic',
    subtitle: 'Film soundtracks, orchestral textures & deep meditation',
    icon: 'fa-film',
    color: '#06b6d4',
    jamendoTags: 'filmscore,ambient'
  }
};

const categoryCache = {};
let previewAudio = null;
let previewTimer = null;
let activePreviewId = null;

/**
 * Fetches category tracks dynamically from Audius and Jamendo
 */
export async function fetchCategoryTracks(catId, limit = 12) {
  if (categoryCache[catId] && categoryCache[catId].length > 0) {
    return categoryCache[catId];
  }
  const cat = CATEGORIES[catId];
  if (!cat) return [];

  const tracks = [];
  const half = Math.ceil(limit / 2);

  // 1. Audius Fetch
  if (cat.audiusGenre || cat.audiusQuery) {
    try {
      const node = 'https://discoveryprovider.audius.co';
      const url = cat.audiusGenre
        ? `${node}/v1/tracks/trending?genre=${encodeURIComponent(cat.audiusGenre)}&app_name=${AUDIUS_APP_NAME}&limit=${half}`
        : `${node}/v1/tracks/search?query=${encodeURIComponent(cat.audiusQuery)}&app_name=${AUDIUS_APP_NAME}&limit=${half}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          json.data.forEach(t => {
            tracks.push({
              id: `audius-${t.id}`,
              title: t.title,
              artist: t.user?.name || 'Audius Artist',
              album: 'Audius Stream',
              coverUrl: t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : './pulse-logo.png',
              duration: t.duration || 210,
              streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
              previewUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
              genre: cat.title,
              source: 'Audius Network'
            });
          });
        }
      }
    } catch (e) {}
  }

  // 2. Jamendo Fetch
  if (cat.jamendoTags) {
    try {
      const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${half}&fuzzytags=${encodeURIComponent(cat.jamendoTags)}&audioformat=mp32`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const json = await res.json();
        if (json.results && Array.isArray(json.results)) {
          json.results.forEach(t => {
            tracks.push({
              id: `jamendo-${t.id}`,
              title: t.name,
              artist: t.artist_name || 'Jamendo Artist',
              album: t.album_name || 'Jamendo Single',
              coverUrl: t.image || t.album_image || './pulse-logo.png',
              duration: parseInt(t.duration, 10) || 210,
              streamUrl: t.audio || t.audiodownload,
              previewUrl: t.audio,
              genre: cat.title,
              source: 'Jamendo Music'
            });
          });
        }
      }
    } catch (e) {}
  }

  categoryCache[catId] = tracks;
  return tracks;
}

// 3. Artist Profile Generator
export function getArtistProfile(artistName, allTracks = []) {
  if (!artistName) return null;
  const clean = artistName.split(',')[0].split('&')[0].trim();
  const key = clean.toLowerCase();

  const matchingTracks = allTracks.filter(t => t.artist && t.artist.toLowerCase().includes(key));
  const sorted = [...matchingTracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));

  return {
    id: `artist-${key.replace(/[^a-z0-9]/g, '-')}`,
    name: clean,
    avatar: matchingTracks.length > 0 ? matchingTracks[0].coverUrl : './pulse-logo.png',
    trackCount: matchingTracks.length,
    popularTracks: sorted
  };
}

// 4. 30-Second Snippet Preview Engine
export function previewTrackSnippet(track, onStateChange = null) {
  if (!track) return false;
  const trackId = track.id;

  if (activePreviewId === trackId && previewAudio && !previewAudio.paused) {
    stopSnippetPreview();
    if (onStateChange) onStateChange(false);
    return false;
  }

  stopSnippetPreview();

  if (!previewAudio) {
    previewAudio = new Audio();
    previewAudio.volume = 0.8;
  }

  activePreviewId = trackId;
  previewAudio.src = track.previewUrl || track.streamUrl;
  previewAudio.currentTime = 15; // start 15s in for chorus/hook

  previewAudio.play().then(() => {
    if (onStateChange) onStateChange(true);
    if (typeof window.showToast === 'function') {
      window.showToast(`🎶 30s Preview: "${track.title}"`, 'info', 2500);
    }
    previewTimer = setTimeout(() => {
      stopSnippetPreview();
      if (onStateChange) onStateChange(false);
    }, 30000);
  }).catch(e => {
    stopSnippetPreview();
  });

  return true;
}

export function stopSnippetPreview() {
  if (previewAudio) {
    try {
      previewAudio.pause();
      previewAudio.removeAttribute('src');
    } catch (e) {}
  }
  activePreviewId = null;
  clearTimeout(previewTimer);
}

const catalogService = {
  CATEGORIES,
  fetchCategoryTracks,
  getArtistProfile,
  previewTrackSnippet,
  stopSnippetPreview
};

if (typeof window !== 'undefined') {
  window.catalogService = catalogService;
  window.PulseCatalog = catalogService;
}

export default catalogService;
