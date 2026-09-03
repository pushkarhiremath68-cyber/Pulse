/**
 * Pulse Music - Smart Similar Track Recommendation Engine
 * Multi-Tiered Contextual Similarity Algorithm:
 * 1. Primary Artist Catalog & Top Hits Discography Matching
 * 2. Genre, Mood, Language & BPM Vibe Matching
 * 3. Smart Knowledge Base & Gemini AI Disambiguation
 * 4. Online Discovery & Radio Seed Generation
 */

import { CATALOG_CATEGORIES, LANGUAGE_PLAYLISTS, getArtistDetails } from './catalogService.js';
import { searchTracks, normalizeTrack } from './musicService.js';
import { SMART_KNOWLEDGE_BASE } from './geminiService.js';

// Cache for generated recommendations
const RECOMMENDATION_CACHE = new Map();

/**
 * Normalizes text for lenient keyword and token comparisons
 */
function cleanStr(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[()\[\]{}"'|\-_.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts individual artist tokens from multi-artist strings
 */
function extractArtistTokens(artistStr) {
  if (!artistStr) return [];
  return artistStr
    .split(/,|&|\bft\.|\bfeat\.|\band\b|\bx\b/i)
    .map(a => a.trim().toLowerCase())
    .filter(a => a.length > 1);
}

/**
 * Categorizes the mood/genre of a track based on its metadata
 */
export function detectTrackVibe(track) {
  if (!track) return { vibe: 'Global Pop', badge: 'Matched Vibe', color: '#c084fc', icon: 'fa-music' };
  const title = cleanStr(track.title);
  const artist = cleanStr(track.artist);
  const genre = cleanStr(track.genre);
  const album = cleanStr(track.album);
  const combined = `${title} ${artist} ${genre} ${album}`;

  if (combined.includes('stotram') || combined.includes('kavacham') || combined.includes('chalisa') || combined.includes('devotional') || combined.includes('mantra') || combined.includes('sahasranama') || combined.includes('appaji')) {
    return { vibe: 'Devotional & Spiritual', badge: 'Sacred Chant', color: '#f59e0b', icon: 'fa-om' };
  }
  if (combined.includes('lofi') || combined.includes('lo-fi') || combined.includes('chill') || combined.includes('beats') || combined.includes('rain') || combined.includes('study')) {
    return { vibe: 'Aesthetic Lo-Fi', badge: 'Lo-Fi Chill', color: '#a855f7', icon: 'fa-headphones' };
  }
  if (combined.includes('edm') || combined.includes('workout') || combined.includes('energy') || combined.includes('gym') || combined.includes('remix') || combined.includes('dance') || combined.includes('house') || combined.includes('levels') || combined.includes('faded') || combined.includes('titanium')) {
    return { vibe: 'High-Energy EDM', badge: 'Peak Adrenaline', color: '#eab308', icon: 'fa-bolt' };
  }
  if (combined.includes('punjabi') || combined.includes('drill') || combined.includes('dhillon') || combined.includes('shubh') || combined.includes('sidhu') || combined.includes('karan')) {
    return { vibe: 'Punjabi Drill & Hype', badge: 'Punjabi Hype', color: '#ef4444', icon: 'fa-fire' };
  }
  if (combined.includes('rock') || combined.includes('nirvana') || combined.includes('linkin') || combined.includes('queen') || combined.includes('ac/dc') || combined.includes('guns')) {
    return { vibe: 'Rock & Alt Legends', badge: 'Rock Anthem', color: '#06b6d4', icon: 'fa-guitar' };
  }
  if (combined.includes('kannada') || combined.includes('kantara') || combined.includes('kgf') || combined.includes('siriye') || combined.includes('rakshith')) {
    return { vibe: 'Kannada Hits', badge: 'Kannada Melodies', color: '#f59e0b', icon: 'fa-music' };
  }
  if (combined.includes('tamil') || combined.includes('anirudh') || combined.includes('ar rahman') || combined.includes('jailer') || combined.includes('vaathi') || combined.includes('kuthu')) {
    return { vibe: 'Tamil Viral Beats', badge: 'Tamil Energy', color: '#f43f5e', icon: 'fa-music' };
  }
  if (combined.includes('telugu') || combined.includes('rrr') || combined.includes('naatu') || combined.includes('pushpa') || combined.includes('srivalli') || combined.includes('thaman')) {
    return { vibe: 'Telugu Chartbusters', badge: 'Telugu Hits', color: '#8b5cf6', icon: 'fa-music' };
  }
  if (combined.includes('bollywood') || combined.includes('arijit') || combined.includes('shreya') || combined.includes('romance') || combined.includes('romantic') || combined.includes('kesariya') || combined.includes('chaleya') || combined.includes('tum hi ho') || combined.includes('apna bana le')) {
    return { vibe: 'Bollywood Soul & Romance', badge: 'Heartfelt Romance', color: '#ec4899', icon: 'fa-heart' };
  }
  if (combined.includes('synthwave') || combined.includes('blinding') || combined.includes('weeknd') || combined.includes('starboy') || combined.includes('pop') || combined.includes('taylor') || combined.includes('sheeran') || combined.includes('sabrina') || combined.includes('billie')) {
    return { vibe: 'Global Pop & Synthwave', badge: 'Chart Anthem', color: '#38bdf8', icon: 'fa-sparkles' };
  }

  return { vibe: 'Global Hits', badge: 'Matched Vibe', color: '#c084fc', icon: 'fa-music' };
}

/**
 * Gathers all track pool candidates from local catalog structures
 */
function getAllCatalogTracks() {
  const map = new Map();

  const add = (t, extraCategory = '') => {
    if (!t || !t.title) return;
    const key = `${cleanStr(t.title)}___${cleanStr(t.artist)}`;
    if (!map.has(key)) {
      map.set(key, {
        id: t.id || (t.ytId ? `ytm-${t.ytId}` : `pulse-${Math.random().toString(36).substr(2, 7)}`),
        ytId: t.ytId,
        title: t.title,
        artist: t.artist,
        coverUrl: t.coverUrl || t.cover || './pulse-logo.png',
        duration: t.duration || 220,
        genre: t.genre || extraCategory || 'Global Hit',
        source: t.source || 'Studio Master Audio (YouTube)'
      });
    }
  };

  // Add tracks from CATALOG_CATEGORIES
  if (Array.isArray(CATALOG_CATEGORIES)) {
    CATALOG_CATEGORIES.forEach(cat => {
      if (Array.isArray(cat.tracks)) {
        cat.tracks.forEach(t => add(t, cat.title));
      }
    });
  }

  // Add tracks from LANGUAGE_PLAYLISTS
  if (Array.isArray(LANGUAGE_PLAYLISTS)) {
    LANGUAGE_PLAYLISTS.forEach(lang => {
      if (Array.isArray(lang.tracks)) {
        lang.tracks.forEach(t => add(t, lang.meta?.title || 'Regional Hit'));
      }
    });
  }

  return Array.from(map.values());
}

/**
 * Calculates a match score between current track and a candidate track
 */
function calculateSimilarityScore(seedTrack, candidateTrack) {
  if (!seedTrack || !candidateTrack) return 0;
  
  const seedCleanTitle = cleanStr(seedTrack.title);
  const candCleanTitle = cleanStr(candidateTrack.title);
  
  // Exclude identical song
  if (seedCleanTitle === candCleanTitle) return -1;
  if (seedTrack.id && candidateTrack.id && seedTrack.id === candidateTrack.id) return -1;
  if (seedTrack.ytId && candidateTrack.ytId && seedTrack.ytId === candidateTrack.ytId) return -1;

  let score = 0;
  let matchReason = 'Similar Melody & Rhythm';
  let badge = 'Similar Vibe';

  const seedArtists = extractArtistTokens(seedTrack.artist);
  const candArtists = extractArtistTokens(candidateTrack.artist);
  
  // 1. Artist Match Check
  const hasArtistMatch = seedArtists.some(sa => candArtists.some(ca => ca.includes(sa) || sa.includes(ca)));
  if (hasArtistMatch) {
    score += 65;
    matchReason = `More by ${seedTrack.artist.split(',')[0].split('&')[0].trim()}`;
    badge = 'Same Artist';
  }

  // 2. Vibe / Genre / Category Match Check
  const seedVibe = detectTrackVibe(seedTrack);
  const candVibe = detectTrackVibe(candidateTrack);

  if (seedVibe.vibe === candVibe.vibe) {
    score += 35;
    if (!hasArtistMatch) {
      matchReason = seedVibe.vibe;
      badge = seedVibe.badge;
    }
  }

  // 3. Title or Keyword Co-occurrence Check
  const seedWords = seedCleanTitle.split(' ').filter(w => w.length > 3);
  const candWords = candCleanTitle.split(' ').filter(w => w.length > 3);
  const commonWords = seedWords.filter(w => candWords.includes(w));
  if (commonWords.length > 0) {
    score += 15;
  }

  // 4. Special Knowledge Base Co-affinity
  for (const [k, list] of Object.entries(SMART_KNOWLEDGE_BASE)) {
    const isSeedInList = k.includes(seedCleanTitle) || seedCleanTitle.includes(k) || list.some(item => cleanStr(item.title) === seedCleanTitle);
    const isCandInList = k.includes(candCleanTitle) || candCleanTitle.includes(k) || list.some(item => cleanStr(item.title) === candCleanTitle);
    if (isSeedInList && isCandInList) {
      score += 45;
      badge = 'AI Match';
      matchReason = 'Curated Knowledge Base Match';
    }
  }

  return {
    score,
    matchReason,
    badge,
    color: seedVibe.color,
    icon: seedVibe.icon
  };
}

/**
 * Primary Recommendation Method: Returns an array of similar tracks for the seed track
 */
export async function getSimilarTracks(seedTrack, limit = 12) {
  if (!seedTrack || !seedTrack.title) return [];

  const cacheKey = `${cleanStr(seedTrack.title)}___${cleanStr(seedTrack.artist)}`;
  if (RECOMMENDATION_CACHE.has(cacheKey)) {
    return RECOMMENDATION_CACHE.get(cacheKey).slice(0, limit);
  }

  const allCatalog = getAllCatalogTracks();
  const scored = [];

  // 1. Match from artist details discography if available
  try {
    const artistData = getArtistDetails(seedTrack.artist);
    const cleanSeedArtist = cleanStr(seedTrack.artist.split(',')[0].trim());
    if (artistData && Array.isArray(artistData.topTracks) && cleanStr(artistData.name).includes(cleanSeedArtist)) {
      artistData.topTracks.forEach(t => {
        // Only include if track belongs to the actual artist or is not a generic fallback placeholder
        const isGenericFallback = (t.title === "Blinding Lights" || t.title === "Shape of You") && !cleanSeedArtist.includes('weeknd') && !cleanSeedArtist.includes('sheeran');
        if (!isGenericFallback && cleanStr(t.title) !== cleanStr(seedTrack.title)) {
          scored.push({
            track: {
              id: t.id || (t.ytId ? `ytm-${t.ytId}` : `pulse-${Math.random()}`),
              ytId: t.ytId,
              title: t.title,
              artist: t.artist || seedTrack.artist,
              coverUrl: t.coverUrl || t.cover || seedTrack.coverUrl || './pulse-logo.png',
              duration: t.duration || 220,
              genre: seedTrack.genre || 'Top Hit',
              source: 'Studio Master Audio (YouTube)'
            },
            score: 75,
            matchReason: `Top Track by ${seedTrack.artist.split(',')[0]}`,
            badge: 'Same Artist',
            color: '#c084fc',
            icon: 'fa-user'
          });
        }
      });
    }
  } catch (e) {}

  // 2. Score across entire catalog
  allCatalog.forEach(cand => {
    const result = calculateSimilarityScore(seedTrack, cand);
    if (result && result.score > 0) {
      scored.push({
        track: cand,
        score: result.score,
        matchReason: result.matchReason,
        badge: result.badge,
        color: result.color,
        icon: result.icon
      });
    }
  });

  // Deduplicate scored results by title + artist
  const uniqueMap = new Map();
  scored.forEach(item => {
    const key = `${cleanStr(item.track.title)}___${cleanStr(item.track.artist)}`;
    if (!uniqueMap.has(key) || uniqueMap.get(key).score < item.score) {
      uniqueMap.set(key, item);
    }
  });

  let sortedResults = Array.from(uniqueMap.values())
    .sort((a, b) => b.score - a.score)
    .map(item => ({
      ...item.track,
      recommendationReason: item.matchReason,
      matchBadge: item.badge,
      matchColor: item.color,
      matchIcon: item.icon
    }));

  // 3. Augment with online discovery search if catalog matches are under 6
  if (sortedResults.length < 6) {
    try {
      const primaryArtist = seedTrack.artist.split(',')[0].split('&')[0].trim();
      const query = `${primaryArtist} top songs hits`;
      const searchResults = await searchTracks(query, 10);
      
      searchResults.forEach(t => {
        if (cleanStr(t.title) !== cleanStr(seedTrack.title)) {
          const key = `${cleanStr(t.title)}___${cleanStr(t.artist)}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, true);
            sortedResults.push({
              ...t,
              recommendationReason: `Related to ${primaryArtist}`,
              matchBadge: 'Recommended',
              matchColor: '#38bdf8',
              matchIcon: 'fa-wand-magic-sparkles'
            });
          }
        }
      });
    } catch (e) {}
  }

  RECOMMENDATION_CACHE.set(cacheKey, sortedResults);
  return sortedResults.slice(0, limit);
}

/**
 * Selects the single best next suggested track that has not already been queued or played
 */
export async function getNextSuggestedTrack(currentTrack, existingQueue = [], playedHistory = []) {
  if (!currentTrack) return null;

  const suggestions = await getSimilarTracks(currentTrack, 15);
  if (!suggestions || suggestions.length === 0) return null;

  const seenIds = new Set();
  const seenTitles = new Set();

  // Mark current track
  seenIds.add(currentTrack.id);
  seenTitles.add(cleanStr(currentTrack.title));

  // Mark queue tracks
  if (Array.isArray(existingQueue)) {
    existingQueue.forEach(t => {
      if (t) {
        if (t.id) seenIds.add(t.id);
        if (t.title) seenTitles.add(cleanStr(t.title));
      }
    });
  }

  // Mark recently played tracks
  if (Array.isArray(playedHistory)) {
    playedHistory.forEach(t => {
      if (t) {
        if (t.id) seenIds.add(t.id);
        if (t.title) seenTitles.add(cleanStr(t.title));
      }
    });
  }

  // Find first unplayed candidate
  const nextTrack = suggestions.find(t => !seenIds.has(t.id) && !seenTitles.has(cleanStr(t.title)));
  return nextTrack || suggestions[0] || null;
}

/**
 * Generates an instant continuous radio queue based on a seed track
 */
export async function generateSimilarRadioQueue(seedTrack, limit = 20) {
  if (!seedTrack) return [];
  const similar = await getSimilarTracks(seedTrack, limit);
  return [seedTrack, ...similar];
}

const recommendationService = {
  getSimilarTracks,
  getNextSuggestedTrack,
  generateSimilarRadioQueue,
  detectTrackVibe
};

if (typeof window !== 'undefined') {
  window.recommendationService = recommendationService;
}

export default recommendationService;
