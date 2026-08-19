/**
 * Pulse Music - Cloud Firestore User Data Service
 * Manages Favorites, Custom Playlists, Listening History, and User Preferences
 * with Real-Time Listeners and Offline Local Sync.
 */

import { initFirebase } from './firebase.js';
import { getStoredUser } from './firebaseAuthService.js';

const LOCAL_FAVORITES_KEY = 'pulse_favorites_data';
const LOCAL_PLAYLISTS_KEY = 'pulse_playlists_data';
const LOCAL_HISTORY_KEY = 'pulse_history_data';

// Helper to get active user ID
function getCurrentUserId() {
  const user = getStoredUser();
  return user ? (user.id || user.uid || 'guest-user') : 'guest-user';
}

function getLocalData(key) {
  try {
    const raw = localStorage.getItem(`${key}_${getCurrentUserId()}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(`${key}_${getCurrentUserId()}`, JSON.stringify(data));
  } catch (e) {}
}

// -----------------------------------------------------------------------------
// 1. FAVORITES & LIKED TRACKS
// -----------------------------------------------------------------------------

export async function addFavorite(track) {
  if (!track || !track.id) return false;
  const uid = getCurrentUserId();
  const favTrack = {
    id: track.id,
    title: track.title || 'Untitled Track',
    artist: track.artist || 'Unknown Artist',
    album: track.album || 'Full Album',
    coverUrl: track.coverUrl || './pulse-logo.png',
    duration: track.duration || 220,
    streamUrl: track.streamUrl || '',
    source: track.source || 'Ad-Free Pure Audio',
    addedAt: Date.now()
  };

  // 1. Update Local Storage Cache immediately
  const local = getLocalData(LOCAL_FAVORITES_KEY).filter(t => t.id !== track.id);
  local.unshift(favTrack);
  setLocalData(LOCAL_FAVORITES_KEY, local);

  // 2. Sync to Cloud Firestore if connected
  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      await db.collection('users').doc(uid).collection('favorites').doc(String(track.id)).set(favTrack, { merge: true });
    } catch (e) {
      console.warn('[Firestore] Favorite sync notice:', e.message);
    }
  }

  notifyFavoritesListeners(local);
  return true;
}

export async function removeFavorite(trackId) {
  if (!trackId) return false;
  const uid = getCurrentUserId();

  // 1. Update Local Storage Cache
  const local = getLocalData(LOCAL_FAVORITES_KEY).filter(t => t.id !== trackId);
  setLocalData(LOCAL_FAVORITES_KEY, local);

  // 2. Remove from Firestore
  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      await db.collection('users').doc(uid).collection('favorites').doc(String(trackId)).delete();
    } catch (e) {
      console.warn('[Firestore] Remove favorite notice:', e.message);
    }
  }

  notifyFavoritesListeners(local);
  return true;
}

export async function getFavorites() {
  const uid = getCurrentUserId();
  const local = getLocalData(LOCAL_FAVORITES_KEY);

  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      const snapshot = await db.collection('users').doc(uid).collection('favorites').orderBy('addedAt', 'desc').get();
      if (!snapshot.empty) {
        const cloudFavorites = [];
        snapshot.forEach(doc => cloudFavorites.push(doc.data()));
        setLocalData(LOCAL_FAVORITES_KEY, cloudFavorites);
        return cloudFavorites;
      }
    } catch (e) {
      console.warn('[Firestore] Fetch favorites notice:', e.message);
    }
  }

  return local;
}

export function isFavorite(trackId) {
  if (!trackId) return false;
  const local = getLocalData(LOCAL_FAVORITES_KEY);
  return local.some(t => t.id === trackId);
}

// -----------------------------------------------------------------------------
// 2. CUSTOM PLAYLISTS
// -----------------------------------------------------------------------------

export async function createPlaylist(name, description = '', coverUrl = '') {
  if (!name || !name.trim()) throw new Error('Playlist name is required.');
  const uid = getCurrentUserId();
  const playlistId = `pl-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  const playlist = {
    id: playlistId,
    name: name.trim(),
    description: description.trim(),
    coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    tracks: [],
    trackCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    creatorId: uid
  };

  const local = getLocalData(LOCAL_PLAYLISTS_KEY);
  local.unshift(playlist);
  setLocalData(LOCAL_PLAYLISTS_KEY, local);

  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      await db.collection('users').doc(uid).collection('playlists').doc(playlistId).set(playlist);
    } catch (e) {
      console.warn('[Firestore] Create playlist notice:', e.message);
    }
  }

  notifyPlaylistsListeners(local);
  return playlist;
}

export async function deletePlaylist(playlistId) {
  if (!playlistId) return false;
  const uid = getCurrentUserId();

  const local = getLocalData(LOCAL_PLAYLISTS_KEY).filter(p => p.id !== playlistId);
  setLocalData(LOCAL_PLAYLISTS_KEY, local);

  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      await db.collection('users').doc(uid).collection('playlists').doc(playlistId).delete();
    } catch (e) {
      console.warn('[Firestore] Delete playlist notice:', e.message);
    }
  }

  notifyPlaylistsListeners(local);
  return true;
}

export async function addTrackToPlaylist(playlistId, track) {
  if (!playlistId || !track) return false;
  const uid = getCurrentUserId();
  const local = getLocalData(LOCAL_PLAYLISTS_KEY);
  const playlist = local.find(p => p.id === playlistId);
  if (!playlist) return false;

  if (!playlist.tracks.some(t => t.id === track.id)) {
    playlist.tracks.push({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      coverUrl: track.coverUrl,
      duration: track.duration,
      streamUrl: track.streamUrl,
      addedAt: Date.now()
    });
    playlist.trackCount = playlist.tracks.length;
    playlist.updatedAt = Date.now();
    setLocalData(LOCAL_PLAYLISTS_KEY, local);

    const { db } = initFirebase();
    if (db && uid && !uid.startsWith('guest-')) {
      try {
        await db.collection('users').doc(uid).collection('playlists').doc(playlistId).set(playlist, { merge: true });
      } catch (e) {}
    }

    notifyPlaylistsListeners(local);
    return true;
  }
  return false;
}

export async function removeTrackFromPlaylist(playlistId, trackId) {
  if (!playlistId || !trackId) return false;
  const uid = getCurrentUserId();
  const local = getLocalData(LOCAL_PLAYLISTS_KEY);
  const playlist = local.find(p => p.id === playlistId);
  if (!playlist) return false;

  playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
  playlist.trackCount = playlist.tracks.length;
  playlist.updatedAt = Date.now();
  setLocalData(LOCAL_PLAYLISTS_KEY, local);

  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      await db.collection('users').doc(uid).collection('playlists').doc(playlistId).set(playlist, { merge: true });
    } catch (e) {}
  }

  notifyPlaylistsListeners(local);
  return true;
}

export async function getPlaylists() {
  const uid = getCurrentUserId();
  const local = getLocalData(LOCAL_PLAYLISTS_KEY);

  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      const snapshot = await db.collection('users').doc(uid).collection('playlists').orderBy('updatedAt', 'desc').get();
      if (!snapshot.empty) {
        const cloudPlaylists = [];
        snapshot.forEach(doc => cloudPlaylists.push(doc.data()));
        setLocalData(LOCAL_PLAYLISTS_KEY, cloudPlaylists);
        return cloudPlaylists;
      }
    } catch (e) {
      console.warn('[Firestore] Fetch playlists notice:', e.message);
    }
  }

  return local;
}

// -----------------------------------------------------------------------------
// 3. LISTENING HISTORY
// -----------------------------------------------------------------------------

export async function addToHistory(track) {
  if (!track || !track.id) return;
  const uid = getCurrentUserId();
  const historyEntry = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album || '',
    coverUrl: track.coverUrl,
    duration: track.duration,
    streamUrl: track.streamUrl,
    playedAt: Date.now()
  };

  const local = getLocalData(LOCAL_HISTORY_KEY).filter(t => t.id !== track.id);
  local.unshift(historyEntry);
  if (local.length > 100) local.pop();
  setLocalData(LOCAL_HISTORY_KEY, local);

  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      await db.collection('users').doc(uid).collection('history').doc(String(track.id)).set(historyEntry, { merge: true });
    } catch (e) {}
  }

  notifyHistoryListeners(local);
}

export async function getHistory(limitCount = 50) {
  const uid = getCurrentUserId();
  const local = getLocalData(LOCAL_HISTORY_KEY);

  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      const snapshot = await db.collection('users').doc(uid).collection('history').orderBy('playedAt', 'desc').limit(limitCount).get();
      if (!snapshot.empty) {
        const cloudHistory = [];
        snapshot.forEach(doc => cloudHistory.push(doc.data()));
        setLocalData(LOCAL_HISTORY_KEY, cloudHistory);
        return cloudHistory;
      }
    } catch (e) {}
  }

  return local.slice(0, limitCount);
}

export async function clearHistory() {
  const uid = getCurrentUserId();
  setLocalData(LOCAL_HISTORY_KEY, []);

  const { db } = initFirebase();
  if (db && uid && !uid.startsWith('guest-')) {
    try {
      const snapshot = await db.collection('users').doc(uid).collection('history').get();
      const batch = db.batch();
      snapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (e) {}
  }

  notifyHistoryListeners([]);
}

// -----------------------------------------------------------------------------
// 4. REALTIME LISTENERS / SUBSCRIPTIONS
// -----------------------------------------------------------------------------

const favListeners = new Set();
const playlistListeners = new Set();
const historyListeners = new Set();

export function onFavoritesChanged(callback) {
  favListeners.add(callback);
  callback(getLocalData(LOCAL_FAVORITES_KEY));
  return () => favListeners.delete(callback);
}

export function onPlaylistsChanged(callback) {
  playlistListeners.add(callback);
  callback(getLocalData(LOCAL_PLAYLISTS_KEY));
  return () => playlistListeners.delete(callback);
}

export function onHistoryChanged(callback) {
  historyListeners.add(callback);
  callback(getLocalData(LOCAL_HISTORY_KEY));
  return () => historyListeners.delete(callback);
}

function notifyFavoritesListeners(data) {
  favListeners.forEach(cb => {
    try { cb(data); } catch (e) {}
  });
}

function notifyPlaylistsListeners(data) {
  playlistListeners.forEach(cb => {
    try { cb(data); } catch (e) {}
  });
}

function notifyHistoryListeners(data) {
  historyListeners.forEach(cb => {
    try { cb(data); } catch (e) {}
  });
}

const firestoreService = {
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
  createPlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getPlaylists,
  addToHistory,
  getHistory,
  clearHistory,
  onFavoritesChanged,
  onPlaylistsChanged,
  onHistoryChanged
};

if (typeof window !== 'undefined') {
  window.firestoreService = firestoreService;
  window.PulseFirestore = firestoreService;
}

export default firestoreService;
