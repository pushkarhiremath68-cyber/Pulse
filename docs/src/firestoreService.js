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
export function getCurrentUserId() {
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

function withTimeout(promise, ms = 2500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
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
    coverUrl: track.coverUrl || track.cover || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : './music-cover.svg'),
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
      const snapshot = await withTimeout(db.collection('users').doc(uid).collection('favorites').orderBy('addedAt', 'desc').get(), 2500);
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
      const snapshot = await withTimeout(db.collection('users').doc(uid).collection('playlists').orderBy('updatedAt', 'desc').get(), 2500);
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

  // Private Session Check: Never save or sync history when in Incognito/Private Session
  try {
    const raw = localStorage.getItem('pulse_privacy_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.privateSession) return;
    }
  } catch (e) {}

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
      const snapshot = await withTimeout(db.collection('users').doc(uid).collection('history').orderBy('playedAt', 'desc').limit(limitCount).get(), 2500);
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

// -----------------------------------------------------------------------------
// 5. LISTENING PARTY / LIVE SESSION MANAGEMENT
// -----------------------------------------------------------------------------

let activeSessionUnsubscribe = null;

export async function createSession(currentTrack, optionalHostId = null) {
  const uid = optionalHostId || getCurrentUserId();
  if (!uid || (uid.startsWith('guest-') && !optionalHostId)) throw new Error('Sign in required');

  const sessionId = `party-${uid.slice(0, 8)}-${Date.now().toString(36)}`;
  const sessionData = {
    hostId: uid,
    createdAt: Date.now(),
    state: {
      track: currentTrack || null,
      isPlaying: false,
      currentTime: 0,
      timestamp: Date.now()
    }
  };

  try {
    const { db } = initFirebase();
    if (db) {
      await withTimeout(db.collection('sessions').doc(sessionId).set(sessionData), 2500);
    }
  } catch (e) {
    console.warn('[Pulse Sessions] Firestore session creation notice:', e.message);
  }

  // Also store locally as fallback
  try {
    localStorage.setItem(`pulse_session_${sessionId}`, JSON.stringify(sessionData));
  } catch (e) {}

  return sessionId;
}

export async function updateSessionState(sessionId, stateUpdate) {
  if (!sessionId) return;
  const payload = {
    state: {
      ...stateUpdate,
      timestamp: Date.now()
    }
  };

  try {
    const { db } = initFirebase();
    if (db) {
      await withTimeout(db.collection("sessions").doc(sessionId).update(payload), 2500);
    }
  } catch (e) {
    console.warn("[Pulse Sessions] State update notice:", e.message);
  }

  try {
    const cached = localStorage.getItem("pulse_session_" + sessionId);
    if (cached) {
      const parsed = JSON.parse(cached);
      parsed.state = { ...(parsed.state || {}), ...stateUpdate, timestamp: Date.now() };
      localStorage.setItem("pulse_session_" + sessionId, JSON.stringify(parsed));
    }
  } catch (e) {}
}

export function joinSession(sessionId, callback) {
  if (!sessionId || typeof callback !== "function") return () => {};

  try {
    const { db } = initFirebase();
    if (db) {
      activeSessionUnsubscribe = db.collection("sessions").doc(sessionId)
        .onSnapshot((doc) => {
          if (doc && doc.exists) {
            callback(doc.data());
          } else {
            callback(null); // Session ended
          }
        }, (err) => {
          console.warn("[Pulse Sessions] Listener error:", err.message);
          try {
            const raw = localStorage.getItem("pulse_session_" + sessionId);
            if (raw) callback(JSON.parse(raw));
            else callback(null);
          } catch (e) {
            callback(null);
          }
        });
      return () => {
        if (activeSessionUnsubscribe) {
          activeSessionUnsubscribe();
          activeSessionUnsubscribe = null;
        }
      };
    }
  } catch (e) {
    console.warn("[Pulse Sessions] Join notice:", e.message);
  }

  // Fallback: local session if available
  try {
    const raw = localStorage.getItem("pulse_session_" + sessionId);
    if (raw) callback(JSON.parse(raw));
    else callback(null);
  } catch (e) {
    callback(null);
  }
  return () => {};
}

export function leaveSession(sessionId) {
  if (activeSessionUnsubscribe) {
    activeSessionUnsubscribe();
    activeSessionUnsubscribe = null;
  }

  // If host, clean up the session document
  try {
    const { db } = initFirebase();
    if (db && sessionId) {
      const uid = getCurrentUserId();
      db.collection('sessions').doc(sessionId).get().then(doc => {
        if (doc.exists && doc.data().hostId === uid) {
          db.collection('sessions').doc(sessionId).delete().catch(() => {});
        }
      }).catch(() => {});
    }
  } catch (e) {}

  try {
    localStorage.removeItem(`pulse_session_${sessionId}`);
  } catch (e) {}
}

// -----------------------------------------------------------------------------
// 5. PLAYLIST SHARING & IMPORTING (INTER-USER CLOUD & ZERO-DEPENDENCY DEEP LINKS)
// -----------------------------------------------------------------------------

export function safeBtoa(str) {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    }));
  } catch (e) {
    return '';
  }
}

export function safeAtob(b64) {
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(b64), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return '';
  }
}

export function encodeSharePayload(payload) {
  try {
    const minimal = {
      i: payload.id || '',
      n: payload.name || payload.title || 'Shared Playlist',
      d: payload.description || '',
      c: payload.coverUrl || payload.cover || '',
      u: payload.creatorName || 'Pulse Listener',
      t: (payload.tracks || []).map(t => [
        t.title || '',
        t.artist || '',
        t.ytId || '',
        t.duration || 220,
        t.coverUrl || t.cover || ''
      ])
    };
    const jsonStr = JSON.stringify(minimal);
    return encodeURIComponent(safeBtoa(jsonStr));
  } catch (e) {
    console.warn('[Firestore] Failed to encode share payload:', e);
    return '';
  }
}

export function decodeSharePayload(encodedStr) {
  if (!encodedStr) return null;
  try {
    const jsonStr = safeAtob(decodeURIComponent(encodedStr));
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !parsed.n) return null;
    return {
      id: parsed.i || `shared-pl-${Date.now()}`,
      name: parsed.n,
      title: parsed.n,
      description: parsed.d || '',
      coverUrl: parsed.c || '',
      creatorName: parsed.u || 'Pulse Listener',
      trackCount: (parsed.t || []).length,
      isShared: true,
      tracks: (parsed.t || []).map((t, idx) => ({
        id: t[2] ? `ytm-${t[2]}` : `pulse-track-${idx}-${Date.now()}`,
        ytId: t[2],
        title: t[0],
        artist: t[1],
        duration: t[3] || 220,
        coverUrl: t[4] || (t[2] ? `https://i.ytimg.com/vi/${t[2]}/hqdefault.jpg` : './music-cover.svg'),
        source: 'Shared Playlist Track'
      }))
    };
  } catch (e) {
    console.warn('[Firestore] Failed to decode share payload:', e);
    return null;
  }
}

export async function publishSharedPlaylist(playlist) {
  if (!playlist) return { shareUrl: '', error: 'Playlist is empty' };

  const uid = getCurrentUserId();
  const user = getStoredUser();
  const creatorName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'Pulse Listener';

  const sharePayload = {
    id: playlist.id || `pl-${Date.now()}`,
    name: playlist.name || playlist.title || 'Shared Playlist',
    title: playlist.name || playlist.title || 'Shared Playlist',
    description: playlist.description || '',
    coverUrl: playlist.coverUrl || playlist.cover || '',
    tracks: (playlist.tracks || []).map(t => ({
      id: t.id || (t.ytId ? `ytm-${t.ytId}` : `pulse-${Math.random().toString(36).substr(2, 6)}`),
      ytId: t.ytId || '',
      title: t.title || 'Untitled',
      artist: t.artist || 'Unknown Artist',
      album: t.album || '',
      coverUrl: t.coverUrl || t.cover || (t.ytId ? `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg` : './music-cover.svg'),
      duration: t.duration || 220,
      streamUrl: t.streamUrl || ''
    })),
    trackCount: (playlist.tracks || []).length,
    creatorId: playlist.creatorId || uid,
    creatorName: playlist.creatorName || creatorName,
    sharedAt: Date.now()
  };

  // 1. Sync to Cloud Firestore public collection
  const { db } = initFirebase();
  if (db && sharePayload.id) {
    try {
      await withTimeout(db.collection('shared_playlists').doc(sharePayload.id).set(sharePayload, { merge: true }), 2500);
    } catch (e) {
      console.warn('[Firestore] Error publishing shared playlist to cloud:', e.message);
    }
  }

  // 2. Build resilient deep link (both Firestore ID and encoded payload fallback)
  const encodedData = encodeSharePayload(sharePayload);
  const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : '';
  const pathname = (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname : '/';
  
  // Base share link
  try {
    localStorage.setItem(`pulse_shared_playlist_${sharePayload.id}`, JSON.stringify(sharePayload));
  } catch (e) {}

  const shareUrl = `${origin}${pathname}?sharedPlaylist=${encodeURIComponent(sharePayload.id)}&data=${encodedData}`;

  return {
    playlist: sharePayload,
    shareUrl,
    sharePayload
  };
}

export async function getSharedPlaylist(playlistId, optionalData = null) {
  // 1. Try to fetch from Cloud Firestore shared_playlists collection
  const { db } = initFirebase();
  if (db && playlistId) {
    try {
      const doc = await withTimeout(db.collection('shared_playlists').doc(playlistId).get(), 2500);
      if (doc.exists) {
        const data = doc.data();
        data.isShared = true;
        return data;
      }
    } catch (e) {
      console.warn('[Firestore] Error fetching shared playlist from cloud:', e.message);
    }
  }

  // 2. Decode fallback data payload if provided in URL
  if (optionalData) {
    const decoded = decodeSharePayload(optionalData);
    if (decoded) return decoded;
  }

  // 3. Fallback to local playlists if opened on the same browser
  if (playlistId) {
    const local = getLocalData(LOCAL_PLAYLISTS_KEY);
    const found = local.find(p => p.id === playlistId);
    if (found) {
      return { ...found, isShared: true };
    }
  }

  return null;
}

export async function importSharedPlaylist(sharedPlaylistOrId, optionalData = null) {
  let sharedPlaylist = sharedPlaylistOrId;
  if (typeof sharedPlaylistOrId === 'string') {
    sharedPlaylist = await getSharedPlaylist(sharedPlaylistOrId, optionalData);
  }
  if (!sharedPlaylist || !sharedPlaylist.name) return null;

  const name = sharedPlaylist.name || sharedPlaylist.title || 'Imported Playlist';
  const desc = sharedPlaylist.description 
    ? `${sharedPlaylist.description} (Shared by ${sharedPlaylist.creatorName || 'a friend'})`
    : `Shared by ${sharedPlaylist.creatorName || 'a friend'}`;
  const coverUrl = sharedPlaylist.coverUrl || '';

  // Create personal playlist for recipient
  const newPl = await createPlaylist(name, desc, coverUrl);
  if (!newPl) return null;

  newPl.tracks = [];

  // Add all tracks from the shared playlist
  if (Array.isArray(sharedPlaylist.tracks)) {
    for (const t of sharedPlaylist.tracks) {
      await addTrackToPlaylist(newPl.id, t);
      newPl.tracks.push(t);
    }
  }

  return newPl;
}

// -----------------------------------------------------------------------------
// 6. TRACK / MUSIC LINK GENERATOR & PARSER
// -----------------------------------------------------------------------------

export function generateTrackShareUrl(track) {
  if (!track) return (typeof window !== 'undefined' && window.location) ? window.location.href : '';
  const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
  const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '/';

  const id = track.id || track.ytId || '';
  const ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : (track.id && track.id.startsWith('yt-') ? track.id.replace('yt-', '') : ''));
  const title = track.title || 'Music';
  const artist = track.artist || 'Pulse Artist';
  const coverUrl = track.coverUrl || track.cover || '';
  const duration = track.duration || 220;

  const compact = {
    i: id,
    y: ytId,
    t: title,
    a: artist,
    c: coverUrl,
    d: duration
  };
  const encoded = safeBtoa(JSON.stringify(compact));

  const url = new URL(origin + pathname);
  url.searchParams.set('track', id);
  url.searchParams.set('title', title);
  url.searchParams.set('artist', artist);
  if (encoded) {
    url.searchParams.set('data', encoded);
  }
  return url.toString();
}

export function parseTrackShareUrl(urlStr) {
  try {
    const url = new URL(urlStr || (typeof window !== 'undefined' && window.location ? window.location.href : 'http://localhost/'));
    const trackParam = url.searchParams.get('track') || url.searchParams.get('song');
    if (!trackParam) return null;

    const dataParam = url.searchParams.get('data');
    if (dataParam) {
      try {
        const decoded = JSON.parse(safeAtob(dataParam));
        if (decoded && (decoded.t || decoded.title)) {
          const ytId = decoded.y || decoded.ytId || (trackParam.startsWith('ytm-') ? trackParam.replace('ytm-', '') : (trackParam.startsWith('yt-') ? trackParam.replace('yt-', '') : trackParam));
          return {
            id: decoded.i || decoded.id || trackParam,
            ytId: ytId,
            title: decoded.t || decoded.title || 'Shared Track',
            artist: decoded.a || decoded.artist || 'Pulse Artist',
            coverUrl: decoded.c || decoded.coverUrl || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : './music-cover.svg'),
            duration: Number(decoded.d || decoded.duration) || 220,
            source: 'Shared Music Stream'
          };
        }
      } catch (e) {}
    }

    const title = url.searchParams.get('title') || 'Shared Track';
    const artist = url.searchParams.get('artist') || 'Pulse Artist';
    const ytId = trackParam.startsWith('ytm-') ? trackParam.replace('ytm-', '') : (trackParam.startsWith('yt-') ? trackParam.replace('yt-', '') : trackParam);
    const cover = url.searchParams.get('cover') || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : './music-cover.svg');
    const dur = Number(url.searchParams.get('dur')) || 220;

    return {
      id: trackParam,
      ytId: ytId,
      title: title,
      artist: artist,
      coverUrl: cover,
      duration: dur,
      source: 'Shared Music Stream'
    };
  } catch (err) {
    return null;
  }
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
  onHistoryChanged,
  createSession,
  joinSession,
  leaveSession,
  updateSessionState,
  publishSharedPlaylist,
  getSharedPlaylist,
  importSharedPlaylist,
  encodeSharePayload,
  decodeSharePayload,
  generateTrackShareUrl,
  parseTrackShareUrl
};

if (typeof window !== 'undefined') {
  window.firestoreService = firestoreService;
  window.PulseFirestore = firestoreService;
}

export default firestoreService;

