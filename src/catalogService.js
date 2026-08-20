/**
 * Pulse Music - Catalog Service
 * Cleared all hardcoded tracks as requested.
 */

export const CATALOG_CATEGORIES = [];
export const TRACK_DATABASE = [];
export const LANGUAGE_PLAYLISTS = [];

export const getQuickPicks = async (limit = 6) => {
  return [];
};

export const getFeaturedArtists = async () => {
  return [];
};

export const getCuratedPlaylists = async () => {
  return [];
};

export const getCategoryTracks = async (categoryId, limit = 20) => {
  return [];
};

export const fetchCategoryTracks = async (categoryId, limit = 20) => {
  return [];
};

export const getArtistDetails = (artistName) => {
  return {
    id: artistName.toLowerCase().replace(/\s+/g, '-'),
    name: artistName,
    monthlyListeners: "0",
    worldRank: "#0",
    banner: "./pulse-logo.png",
    topTracks: [],
    albums: [],
    singles: [],
    bio: "No information available.",
    similarArtists: []
  };
};
