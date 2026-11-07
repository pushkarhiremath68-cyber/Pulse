/**
 * ============================================================================
 * PULSE MUSIC - OFFLINE MUSIC STORAGE & PLAYBACK SERVICE
 * ============================================================================
 * Persistent client-side IndexedDB storage engine for 100% offline music access.
 * Enables users to download, store, and play entire high-fidelity audio tracks
 * without internet access (airplane mode, mobile network drops, background).
 * ============================================================================
 */

import { PERMANENT_STREAM_MAP } from './catalogService.js';
import { resolveFullAudioStream } from './musicService.js';
import { resolvePipedAudioStream } from './extractorService.js';

const DB_NAME = 'PulseOfflineMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_tracks';

let dbInstance = null;
const offlineIdsSet = new Set();
const activeBlobUrls = new Map();

/**
 * Initializes the IndexedDB database and loads cached offline track IDs
 */
export async function initOfflineMusicDB() {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    console.warn('[Pulse Offline] IndexedDB is not supported in this environment.');
    return null;
  }

  if (dbInstance) return dbInstance;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('artist', 'artist', { unique: false });
          store.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        dbInstance = event.target.result;
        await refreshOfflineIdsCache();
        console.log(`[Pulse Offline] Database initialized. ${offlineIdsSet.size} offline tracks ready.`);
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.warn('[Pulse Offline] Failed to open IndexedDB:', event.target.error);
        resolve(null);
      };
    } catch (e) {
      console.warn('[Pulse Offline] IndexedDB error:', e);
      resolve(null);
    }
  });
}

/**
 * Refreshes the in-memory Set of downloaded track IDs for 0ms instantaneous lookups
 */
async function refreshOfflineIdsCache() {
  if (!dbInstance) return;
  return new Promise((resolve) => {
    try {
      const tx = dbInstance.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        offlineIdsSet.clear();
        (request.result || []).forEach(id => offlineIdsSet.add(String(id)));
        resolve();
      };
      request.onerror = () => resolve();
    } catch (e) {
      resolve();
    }
  });
}

/**
 * Checks if a track is saved offline in 0ms (synchronous from memory)
 */
export function isTrackOffline(trackId) {
  if (!trackId) return false;
  return offlineIdsSet.has(String(trackId));
}

/**
 * Resolves the downloadable audio stream URL for a track
 */
async function resolveAudioDownloadUrl(track) {
  if (!track) return null;

  // 1. Pre-embedded direct streamUrl
  if (track.streamUrl &&
      track.streamUrl.startsWith('http') &&
      !track.streamUrl.includes('preview') &&
      track.streamUrl !== 'yt-iframe') {
    return track.streamUrl;
  }

  // 2. Permanent stream map
  const cleanTitle = (track.title || '').replace(/\(.*?\)|\[.*?\]/gi, '').trim();
  const permUrl = PERMANENT_STREAM_MAP[track.title] || PERMANENT_STREAM_MAP[cleanTitle];
  if (permUrl) return permUrl;

  // 3. JioSaavn / Piped Opus Master Stream via resolveFullAudioStream
  try {
    const resolved = await resolveFullAudioStream(track);
    if (resolved && resolved.streamUrl && resolved.streamUrl.startsWith('http') && resolved.streamUrl !== 'yt-iframe') {
      return resolved.streamUrl;
    }
  } catch (e) {}

  // 4. Piped Direct Audio Stream if track has ytId
  const ytId = track.ytId || (track.id && String(track.id).startsWith('ytm-') ? String(track.id).replace('ytm-', '') : null);
  if (ytId) {
    try {
      const piped = await resolvePipedAudioStream(ytId);
      if (piped && piped.streamUrl && piped.streamUrl.startsWith('http')) {
        return piped.streamUrl;
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Downloads and stores a track in IndexedDB for 100% offline access
 */
export async function saveTrackForOffline(track, onProgress = null) {
  if (!track || !track.title) return { success: false, error: 'Invalid track data' };
  const trackId = String(track.id || (track.ytId ? `ytm-${track.ytId}` : `offline-${Date.now()}`));

  if (isTrackOffline(trackId)) {
    return { success: true, message: 'Already available offline' };
  }

  const db = await initOfflineMusicDB();
  if (!db) return { success: false, error: 'Offline storage not supported' };

  if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
    window.showToast(`Downloading "${track.title}" for offline listening... ⚡`, 'info', 3000);
  }

  try {
    const streamUrl = await resolveAudioDownloadUrl(track);
    if (!streamUrl) {
      throw new Error('Unable to resolve audio stream for offline storage');
    }

    // Fetch the audio stream blob
    const response = await fetch(streamUrl);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const blob = await response.blob();
    const audioBlob = new Blob([blob], { type: blob.type || 'audio/mp4' });

    // Resolve cover artwork
    let coverUrl = track.coverUrl || track.cover || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : '');
    if (!coverUrl && window.PulseAIHealer?.generateHarmonicCoverSvg) {
      coverUrl = window.PulseAIHealer.generateHarmonicCoverSvg(track.title, track.artist);
    }

    const offlineRecord = {
      id: trackId,
      ytId: track.ytId || (String(track.id).startsWith('ytm-') ? String(track.id).replace('ytm-', '') : ''),
      title: track.title,
      artist: track.artist || 'Pulse Artist',
      album: track.album || 'Offline Album',
      duration: track.duration || 200,
      coverUrl: coverUrl,
      audioBlob: audioBlob,
      mimeType: audioBlob.type,
      sizeBytes: audioBlob.size,
      savedAt: Date.now()
    };

    // Store in IndexedDB
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(offlineRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    offlineIdsSet.add(trackId);

    // Notify application
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pulse:offline-updated', { detail: { action: 'add', trackId } }));
      if (typeof window.showToast === 'function') {
        window.showToast(`"${track.title}" is now ready for Offline Playback! 🎵⚡`, 'success', 3500);
      }
    }

    return { success: true, record: offlineRecord };
  } catch (err) {
    console.warn('[Pulse Offline] Save error:', err.message);
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`Could not save "${track.title}" offline: ${err.message}`, 'warning', 3500);
    }
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves a playable ObjectURL for a downloaded track (0ms network, 100% offline)
 */
export async function getOfflineAudioUrl(trackId) {
  if (!trackId) return null;
  const key = String(trackId);

  // Return existing blob URL if cached
  if (activeBlobUrls.has(key)) {
    return activeBlobUrls.get(key);
  }

  const db = await initOfflineMusicDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        const item = req.result;
        if (item && item.audioBlob) {
          const url = URL.createObjectURL(item.audioBlob);
          activeBlobUrls.set(key, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Removes a track from offline storage
 */
export async function removeOfflineTrack(trackId) {
  if (!trackId) return false;
  const key = String(trackId);

  const db = await initOfflineMusicDB();
  if (!db) return false;

  // Revoke object URL
  if (activeBlobUrls.has(key)) {
    try { URL.revokeObjectURL(activeBlobUrls.get(key)); } catch (e) {}
    activeBlobUrls.delete(key);
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => {
        offlineIdsSet.delete(key);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pulse:offline-updated', { detail: { action: 'remove', trackId: key } }));
          if (typeof window.showToast === 'function') {
            window.showToast('Track removed from Offline Downloads', 'info', 2500);
          }
        }
        resolve(true);
      };
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Retrieves all offline downloaded tracks
 */
export async function getOfflineTracks() {
  const db = await initOfflineMusicDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result || [];
        // Sort newest saved first
        results.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}

/**
 * Returns offline storage stats
 */
export async function getOfflineStats() {
  const tracks = await getOfflineTracks();
  const totalBytes = tracks.reduce((acc, t) => acc + (t.sizeBytes || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  return {
    count: tracks.length,
    totalBytes,
    totalMB: `${totalMB} MB`
  };
}

// Global exposure
if (typeof window !== 'undefined') {
  window.PulseOffline = {
    init: initOfflineMusicDB,
    saveTrackForOffline,
    removeOfflineTrack,
    getOfflineTracks,
    getOfflineAudioUrl,
    isTrackOffline,
    getOfflineStats
  };

  // Auto-init on script load
  initOfflineMusicDB();
}

export default (typeof window !== 'undefined' ? window.PulseOffline : null);
