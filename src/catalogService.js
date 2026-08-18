/**
 * Pulse Music - Pure Audius & Jamendo Full-Length Music Service
 * Zero 30-second previews. 100% full songs from start to finish.
 */

export const CATEGORY_MAP = {
  'global_trending': { query: 'trending', genre: 'pop', title: 'Trending Worldwide (Top 50)', icon: 'fa-fire-flame-curved', color: '#ef4444' },
  'hindi_bollywood': { query: 'hindi bollywood', genre: 'world', title: 'Hindi & Bollywood Hits', icon: 'fa-compact-disc', color: '#ec4899' },
  'punjabi_bangers': { query: 'punjabi', genre: 'desi', title: 'Punjabi & Desi Heat', icon: 'fa-drum', color: '#f59e0b' },
  'edm_dance': { query: 'edm electronic', genre: 'electronic', title: 'EDM & Festival Dance', icon: 'fa-bolt-lightning', color: '#a855f7' },
  'bollywood_90s': { query: 'bollywood classics', genre: 'acoustic', title: '90s Golden Bollywood Nostalgia', icon: 'fa-music', color: '#eab308' },
  'gym_workout': { query: 'workout motivation', genre: 'rock', title: 'Gym & Workout Motivation', icon: 'fa-dumbbell', color: '#ef4444' },
  'late_night_drive': { query: 'synthwave synthpop', genre: 'ambient', title: 'Late Night Neon Drive', icon: 'fa-moon', color: '#8b5cf6' },
  'lofi_study': { query: 'lofi chill', genre: 'lofi', title: 'Lo-Fi Study & Chill Beats', icon: 'fa-headphones-simple', color: '#10b981' }
};

export async function fetchCategoryTracks(catId, limit = 40) {
  if (window.musicService && typeof window.musicService.searchTracks === 'function') {
    const meta = CATEGORY_MAP[catId] || { query: catId, title: 'Music' };
    const tracks = await window.musicService.searchTracks(meta.query, limit);
    return tracks.map(t => ({
      ...t,
      source: `${meta.title || catId} (Full Song)`
    }));
  }
  return [];
}

const catalogService = {
  CATEGORY_MAP,
  fetchCategoryTracks
};

if (typeof window !== 'undefined') {
  window.catalogService = catalogService;
}

export default catalogService;
