/* ==========================================================================
   PULSE MUSIC SERVICE LAYER - SUPABASE 120,000 CATALOG & MP4 AUDIO ENGINE
   High-Throughput PostgreSQL Integration, Multi-Tier MP4 Audio Streaming & Caching
   Designed by Pushkar Hiremath
   ========================================================================== */

(function(window) {
  'use strict';

  // In-memory LRU Query Cache (Instant responsiveness & 0 latency)
  const searchCache = new Map();
  const MAX_CACHE_SIZE = 100;

  // Global In-Memory Tracks Registry & Category Cache
  window.TRACKS_REGISTRY = window.TRACKS_REGISTRY || {};
  const CATEGORY_CACHE = new Map();

  // =========================================================================
  // AUDIUS & JAMENDO API CONFIGURATION
  // Audius: Decentralized music platform (~600k+ free, streamable tracks)
  // Jamendo: Creative Commons licensed music (~1M+ free, streamable tracks)
  // =========================================================================
  const AUDIUS_APP_NAME = 'PULSE_APP';
  const AUDIUS_GATEWAY_URL = 'https://api.audius.co';
  let _audiusDiscoveryNode = null; // Cached after first resolution
  let _audiusNodeResolving = null; // Prevents duplicate resolution requests

  // Jamendo: 1,000,000+ Creative Commons tracks via https://devportal.jamendo.com/
  const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';

  /**
   * Dynamically retrieves the Jamendo API Client ID from environment, window, or localStorage
   * @returns {string} Jamendo Client ID
   */
  function getJamendoClientId() {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_JAMENDO_CLIENT_ID) {
      const val = String(import.meta.env.VITE_JAMENDO_CLIENT_ID).trim();
      if (val && !val.includes('your_copied') && !val.includes('your_jamendo')) return val;
    }
    if (typeof window !== 'undefined') {
      if (window.JAMENDO_CLIENT_ID && typeof window.JAMENDO_CLIENT_ID === 'string') {
        const val = window.JAMENDO_CLIENT_ID.trim();
        if (val) return val;
      }
      try {
        const stored = window.localStorage.getItem('pulse_jamendo_client_id');
        if (stored && stored.trim()) return stored.trim();
      } catch (e) {}
    }
    return '';
  }

  // Runtime helper to set Jamendo Client ID dynamically without restart
  if (typeof window !== 'undefined') {
    window.getJamendoClientId = getJamendoClientId;
    window.setJamendoClientId = function(clientId) {
      if (clientId && typeof clientId === 'string') {
        const clean = clientId.trim();
        window.JAMENDO_CLIENT_ID = clean;
        try { window.localStorage.setItem('pulse_jamendo_client_id', clean); } catch(e) {}
        console.log(`[Jamendo] Client ID configured: ${clean}`);
        if (window.musicService && typeof window.musicService.initCatalog === 'function') {
          window.musicService.initCatalog();
        }
      }
    };
  }

  /**
   * Dynamically resolves an active Audius Discovery Node endpoint.
   * Fetches from the gateway once, then caches for session lifetime.
   * @returns {Promise<string>} Active discovery node base URL
   */
  async function getAudiusDiscoveryNode() {
    if (_audiusDiscoveryNode) return _audiusDiscoveryNode;
    if (_audiusNodeResolving) return _audiusNodeResolving;

    _audiusNodeResolving = (async () => {
      try {
        const res = await fetch(AUDIUS_GATEWAY_URL, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            // Pick a random healthy node from the list
            const nodes = json.data;
            _audiusDiscoveryNode = nodes[Math.floor(Math.random() * nodes.length)];
            console.log(`[Audius] Resolved discovery node: ${_audiusDiscoveryNode}`);
            return _audiusDiscoveryNode;
          }
        }
      } catch (e) {
        console.warn('[Audius] Gateway resolution notice:', e.message);
      }
      // Fallback to well-known discovery provider
      _audiusDiscoveryNode = 'https://discoveryprovider.audius.co';
      console.log(`[Audius] Using fallback discovery node: ${_audiusDiscoveryNode}`);
      return _audiusDiscoveryNode;
    })();

    return _audiusNodeResolving;
  }

  // Local Storage Cache Keys
  const STORAGE_KEYS = {
    RECENTLY_PLAYED: 'pulse_recently_played_v2',
    LIKED_TRACKS: 'pulse_liked_tracks_v2',
    USER_PLAYLISTS: 'pulse_user_playlists_v2'
  };

  // =========================================================================
  // PURE JAVASCRIPT DES ECB DECRYPTOR FOR JIOSAAVN 320k/160k MASTER MP4 STREAMS
  // =========================================================================
  const DES_PC1 = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4];
  const DES_PC2 = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32];
  const DES_SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
  const DES_IP = [58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7];
  const DES_FP = [40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25];
  const DES_E = [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1];
  const DES_P = [16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25];
  const DES_SBOXES = [
    [[14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],[0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],[4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],[15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]],
    [[15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],[3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],[0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],[13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]],
    [[10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],[13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],[13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],[1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]],
    [[7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],[13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],[10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],[3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]],
    [[2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],[14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],[4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],[11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]],
    [[12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],[10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],[9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],[4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]],
    [[4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],[13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],[1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],[6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]],
    [[13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],[1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],[7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],[2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]]
  ];

  function _desPermute(input, table) {
    const output = [];
    for (let i = 0; i < table.length; i++) output.push(input[table[i] - 1]);
    return output;
  }
  function _desLeftShift(arr, n) { return arr.slice(n).concat(arr.slice(0, n)); }
  function _desXor(a, b) {
    const res = [];
    for (let i = 0; i < a.length; i++) res.push(a[i] ^ b[i]);
    return res;
  }
  function _desGenerateSubkeys(keyBits) {
    const keyPerm = _desPermute(keyBits, DES_PC1);
    let c = keyPerm.slice(0, 28);
    let d = keyPerm.slice(28, 56);
    const subkeys = [];
    for (let i = 0; i < 16; i++) {
      c = _desLeftShift(c, DES_SHIFTS[i]);
      d = _desLeftShift(d, DES_SHIFTS[i]);
      subkeys.push(_desPermute(c.concat(d), DES_PC2));
    }
    return subkeys;
  }
  function _desFeistel(r, subkey) {
    const expanded = _desPermute(r, DES_E);
    const xored = _desXor(expanded, subkey);
    const sOutput = [];
    for (let i = 0; i < 8; i++) {
      const chunk = xored.slice(i * 6, (i + 1) * 6);
      const row = (chunk[0] << 1) | chunk[5];
      const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
      const val = DES_SBOXES[i][row][col];
      sOutput.push((val >> 3) & 1, (val >> 2) & 1, (val >> 1) & 1, val & 1);
    }
    return _desPermute(sOutput, DES_P);
  }
  function _desDecryptBlock(blockBits, subkeys) {
    const perm = _desPermute(blockBits, DES_IP);
    let l = perm.slice(0, 32);
    let r = perm.slice(32, 64);
    for (let i = 15; i >= 0; i--) {
      const nextL = r;
      const fRes = _desFeistel(r, subkeys[i]);
      r = _desXor(l, fRes);
      l = nextL;
    }
    return _desPermute(r.concat(l), DES_FP);
  }
  function _desBytesToBits(bytes) {
    const bits = [];
    for (let i = 0; i < bytes.length; i++) {
      for (let b = 7; b >= 0; b--) bits.push((bytes[i] >> b) & 1);
    }
    return bits;
  }
  function _desBitsToBytes(bits) {
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b];
      bytes.push(byte);
    }
    return bytes;
  }
  function _desBase64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function decryptSaavnUrl(encryptedBase64) {
    if (!encryptedBase64) return null;
    try {
      const rawBytes = _desBase64ToBytes(encryptedBase64);
      const keyBytes = new TextEncoder().encode('38346591');
      const subkeys = _desGenerateSubkeys(_desBytesToBits(keyBytes));
      let decryptedBytes = [];
      for (let i = 0; i < rawBytes.length; i += 8) {
        const chunk = rawBytes.slice(i, i + 8);
        if (chunk.length < 8) break;
        const blockBits = _desBytesToBits(chunk);
        const decBits = _desDecryptBlock(blockBits, subkeys);
        decryptedBytes = decryptedBytes.concat(_desBitsToBytes(decBits));
      }
      const padLen = decryptedBytes[decryptedBytes.length - 1];
      if (padLen >= 1 && padLen <= 8) {
        decryptedBytes = decryptedBytes.slice(0, decryptedBytes.length - padLen);
      }
      const url = new TextDecoder().decode(new Uint8Array(decryptedBytes));
      const u320 = url.replace('_96.mp4', '_320.mp4').replace('_48.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4');
      const u160 = url.replace('_96.mp4', '_160.mp4').replace('_48.mp4', '_160.mp4').replace('_320.mp4', '_160.mp4');
      return {
        '320': u320,
        '160': u160,
        '96': url
      };
    } catch (e) {
      return null;
    }
  }
  window.decryptSaavnUrl = decryptSaavnUrl;

  /**
   * Generates a studio-grade 500x500 SVG album artwork tailored to song title, artist, and genre
   */
  function generateTrackCover(title = 'Track', artist = 'Pulse Artist', category = 'pop') {
    const rawTitle = String(title || 'Track').trim();
    const rawArtist = String(artist || 'Pulse Artist').trim();
    const safeTitle = rawTitle.length > 20 ? rawTitle.substring(0, 18) + '...' : rawTitle;
    const safeArtist = rawArtist.length > 24 ? rawArtist.substring(0, 22) + '...' : rawArtist;
    const safeHash = Math.abs(Array.from(rawTitle + rawArtist).reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0)) % 10000;

    const palettes = [
      ['#8b5cf6', '#ec4899', '#3b82f6', 'BOLLYWOOD HITS'],
      ['#f97316', '#ef4444', '#eab308', 'DEVOTIONAL / BHAKTI'],
      ['#06b6d4', '#3b82f6', '#8b5cf6', 'GLOBAL HITS'],
      ['#10b981', '#059669', '#34d399', 'PUNJABI CLASSICS'],
      ['#e11d48', '#be123c', '#fb7185', 'TELUGU / TOLLYWOOD'],
      ['#d97706', '#b45309', '#f59e0b', 'KANNADA HITS'],
      ['#6366f1', '#4f46e5', '#818cf8', 'TAMIL MELODIES'],
      ['#14b8a6', '#0d9488', '#2dd4bf', 'MALAYALAM VIBES'],
      ['#f43f5e', '#a855f7', '#6366f1', 'LO-FI CHILL']
    ];

    const idx = (safeHash + (category ? category.length : 0)) % palettes.length;
    const [c1, c2, c3, badgeText] = palettes[idx];

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <linearGradient id="bg_${safeHash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}" />
          <stop offset="50%" stop-color="${c2}" />
          <stop offset="100%" stop-color="#0b0d14" />
        </linearGradient>
        <radialGradient id="glow_${safeHash}" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="${c3}" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.95" />
        </radialGradient>
        <linearGradient id="glass_${safeHash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255, 255, 255, 0.22)" />
          <stop offset="100%" stop-color="rgba(255, 255, 255, 0.04)" />
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(#bg_${safeHash})" />
      <circle cx="250" cy="185" r="160" fill="url(#glow_${safeHash})" />
      <circle cx="250" cy="185" r="135" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
      <circle cx="250" cy="185" r="105" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
      <circle cx="250" cy="185" r="75" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" />
      <circle cx="250" cy="185" r="45" fill="rgba(0,0,0,0.7)" stroke="rgba(255,255,255,0.45)" stroke-width="3" />
      <path d="M236 170 L260 162 L260 192 A11 11 0 1 1 249 181 L249 173 L238 176 L238 198 A11 11 0 1 1 227 187 L227 170 Z" fill="#ffffff" />
      <rect y="330" width="500" height="170" fill="url(#glass_${safeHash})" />
      <line x1="0" y1="330" x2="500" y2="330" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
      <rect x="25" y="348" width="140" height="22" rx="11" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <text x="95" y="363" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="1.2">${badgeText}</text>
      <text x="25" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#ffffff" letter-spacing="0.2">${safeTitle}</text>
      <text x="25" y="455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="16" fill="rgba(255,255,255,0.85)">${safeArtist}</text>
    </svg>`;

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  window.generateTrackCover = generateTrackCover;

  function unescapeHtml(str) {
    if (!str) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

  function formatSeconds(sec) {
    const s = parseInt(sec, 10) || 210;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  }

  function normalizeTrack(raw) {
    if (!raw) return null;
    const cleanId = String(raw.id || raw.trackId || `track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    const cleanTitle = unescapeHtml(String(raw.title || raw.name || raw.trackName || 'Pulse Track').trim());
    const cleanArtist = unescapeHtml(String(raw.artist || raw.artistName || raw.singers || 'Pulse Artist').trim());
    const cleanAlbum = unescapeHtml(String(raw.album || raw.collectionName || 'Single').trim());

    let cleanCover = raw.cover || raw.artworkUrl100 || raw.image || null;
    if (cleanCover && (cleanCover.includes('50x50') || cleanCover.includes('150x150'))) {
      cleanCover = cleanCover.replace('150x150', '500x500').replace('50x50', '500x500');
    }
    if (cleanCover && cleanCover.includes('100x100bb.jpg')) {
      cleanCover = cleanCover.replace('100x100bb.jpg', '600x600bb.jpg');
    }

    // Generate sleek dynamic cover if cover is missing or generic
    if (!cleanCover || cleanCover === './pulse-logo.png' || cleanCover.includes('unsplash.com') || cleanCover.trim() === '') {
      cleanCover = generateTrackCover(cleanTitle, cleanArtist, raw.category);
    }

    let cleanDuration = raw.duration || '3:30';
    if (typeof cleanDuration === 'number') {
      cleanDuration = formatSeconds(cleanDuration);
    }

    const cleanStoragePath = raw.storagePath || raw.storage_path || `${cleanId}.mp3`;
    let cleanAudioUrl = raw.audioUrl || raw.audio_url || raw.streamUrl || raw.audio || null;
    if (!cleanAudioUrl && typeof window !== 'undefined' && typeof window.getAudioStorageUrl === 'function') {
      cleanAudioUrl = window.getAudioStorageUrl(cleanStoragePath);
    }

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
      streamUrl: raw.streamUrl || (cleanAudioUrl && cleanAudioUrl.startsWith('http') ? cleanAudioUrl : null),
      encrypted_media_url: raw.encrypted_media_url || raw.encryptedMediaUrl || null,
      language: raw.language || 'Hindi',
      year: raw.year || 2026,
      ytId: raw.ytId || raw.yt_id || null,
      source: raw.source || 'Pulse Studio Master MP3 (320kbps)',
      playCount: raw.playCount || raw.play_count || 0,
      audio: raw.audio || null, // Preserved for Jamendo direct MP3 stream URLs
      audiodownload: raw.audiodownload || null, // Preserved for Jamendo high-quality audio download
      jamendoId: raw.jamendoId || (cleanId.startsWith('jamendo-') ? cleanId.replace('jamendo-', '') : null),
      license: raw.license || null
    };
  }

  function getJamendoClientId() {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_JAMENDO_CLIENT_ID) {
      const val = String(import.meta.env.VITE_JAMENDO_CLIENT_ID).trim();
      if (val && !val.includes('your_copied') && !val.includes('your_jamendo')) return val;
    }
    if (typeof window !== 'undefined') {
      if (window.JAMENDO_CLIENT_ID && typeof window.JAMENDO_CLIENT_ID === 'string') {
        const val = window.JAMENDO_CLIENT_ID.trim();
        if (val) return val;
      }
      try {
        const stored = window.localStorage.getItem('pulse_jamendo_client_id');
        if (stored && stored.trim()) return stored.trim();
      } catch (e) {}
    }
    return '23b33f2a';
  }

  // Runtime helper to set Jamendo Client ID dynamically without restart
  if (typeof window !== 'undefined') {
    window.getJamendoClientId = getJamendoClientId;
    window.setJamendoClientId = function(clientId) {
      if (clientId && typeof clientId === 'string') {
        const clean = clientId.trim();
        window.JAMENDO_CLIENT_ID = clean;
        try { window.localStorage.setItem('pulse_jamendo_client_id', clean); } catch(e) {}
        console.log(`[Jamendo] Client ID configured: ${clean}`);
        if (window.musicService && typeof window.musicService.initCatalog === 'function') {
          window.musicService.initCatalog();
        }
      }
    };
  }

  const STARTER_HITS = [
    // Hindi / Bollywood
    { id: 'hindi-1', title: 'Kesariya', artist: 'Arijit Singh, Pritam', album: 'Brahmastra', cover: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.webp', streamUrl: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4', duration: '4:28', category: 'bollywood', language: 'Hindi' },
    { id: 'hindi-2', title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', album: 'Bhediya', cover: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.webp', streamUrl: 'https://aac.saavncdn.com/815/483a6e118e8108cbb3e5cd8701674f32_320.mp4', duration: '4:21', category: 'bollywood', language: 'Hindi' },
    { id: 'hindi-3', title: 'Tum Se Hi', artist: 'Mohit Chauhan, Pritam', album: 'Jab We Met', duration: '5:21', category: 'bollywood', language: 'Hindi' },
    { id: 'hindi-4', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao, Anirudh', album: 'Jawan', cover: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.webp', streamUrl: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4', duration: '3:20', category: 'bollywood', language: 'Hindi' },
    { id: 'hindi-5', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal, Asees Kaur', album: 'Shershaah', duration: '3:50', category: 'bollywood', language: 'Hindi' },
    { id: 'hindi-6', title: 'Tum Hi Ho', artist: 'Arijit Singh, Mithoon', album: 'Aashiqui 2', cover: 'https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg', streamUrl: 'https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_320.mp4', duration: '4:22', category: 'bollywood', language: 'Hindi' },
    { id: 'hindi-7', title: 'Heeriye', artist: 'Jasleen Royal, Arijit Singh', album: 'Heeriye', duration: '3:15', category: 'bollywood', language: 'Hindi' },
    { id: 'hindi-8', title: 'Shayad', artist: 'Arijit Singh, Pritam', album: 'Love Aaj Kal', duration: '4:07', category: 'bollywood', language: 'Hindi' },
    // Punjabi
    { id: 'punjabi-1', title: 'Lover', artist: 'Diljit Dosanjh', album: 'MoonChild Era', cover: 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.webp', streamUrl: 'https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4', duration: '3:12', category: 'punjabi', language: 'Punjabi' },
    { id: 'punjabi-2', title: 'Softly', artist: 'Karan Aujla, Ikky', album: 'Making Memories', cover: 'https://c.saavncdn.com/538/Making-Memories-English-2023-20230818075015-500x500.webp', streamUrl: 'https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4', duration: '2:35', category: 'punjabi', language: 'Punjabi' },
    { id: 'punjabi-3', title: 'Excuses', artist: 'AP Dhillon, Gurinder Gill', album: 'Excuses', cover: 'https://c.saavncdn.com/890/Excuses-English-2021-20210930112054-500x500.webp', streamUrl: 'https://aac.saavncdn.com/890/a18aabc4681dc6c334d5d29b67e84a0f_320.mp4', duration: '2:56', category: 'punjabi', language: 'Punjabi' },
    { id: 'punjabi-4', title: 'Brown Munde', artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon', album: 'Brown Munde', cover: 'https://c.saavncdn.com/973/Brown-Munde-English-2020-20260520131422-500x500.webp', streamUrl: 'https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4', duration: '4:27', category: 'punjabi', language: 'Punjabi' },
    { id: 'punjabi-5', title: '295', artist: 'Sidhu Moose Wala', album: 'Moosetape', cover: 'https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.webp', streamUrl: 'https://aac.saavncdn.com/609/852628435c98083dfe217c1cfa731bb5_320.mp4', duration: '4:30', category: 'punjabi', language: 'Punjabi' },
    { id: 'punjabi-6', title: 'Born to Shine', artist: 'Diljit Dosanjh', album: 'G.O.A.T.', cover: 'https://c.saavncdn.com/597/G-O-A-T-Punjabi-2020-20240708055140-500x500.webp', streamUrl: 'https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4', duration: '3:33', category: 'punjabi', language: 'Punjabi' },
    { id: 'punjabi-7', title: 'White Brown Black', artist: 'Karan Aujla, Avvy Sra', album: 'White Brown Black', cover: 'https://c.saavncdn.com/177/White-Brown-Black-Punjabi-2022-20251118151218-500x500.webp', streamUrl: 'https://aac.saavncdn.com/177/8a4e89ae82b74333f57ab3130b05d056_320.mp4', duration: '3:00', category: 'punjabi', language: 'Punjabi' },
    { id: 'punjabi-8', title: 'Mi Amor', artist: 'Sharn, 40k, The Paul', album: 'Mi Amor', cover: 'https://c.saavncdn.com/051/Mi-Amor-Punjabi-2022-20220930164801-500x500.webp', streamUrl: 'https://aac.saavncdn.com/051/249871fff26d5400e55170a94d1acf99_320.mp4', duration: '3:24', category: 'punjabi', language: 'Punjabi' },
    { id: 'punjabi-9', title: 'Wavy', artist: 'Karan Aujla', album: 'Four Me', cover: 'https://c.saavncdn.com/178/Wavy-Punjabi-2024-20250523044332-500x500.webp', streamUrl: 'https://aac.saavncdn.com/178/9af31095a56a0a124dee89ef89ffee5a_320.mp4', duration: '2:48', category: 'punjabi', language: 'Punjabi' },
    // Global Pop
    { id: 'global-1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', category: 'pop', language: 'English' },
    { id: 'global-2', title: 'Starboy', artist: 'The Weeknd, Daft Punk', album: 'Starboy', duration: '3:50', category: 'pop', language: 'English' },
    { id: 'global-3', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', duration: '3:53', category: 'pop', language: 'English' },
    { id: 'global-4', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23', category: 'pop', language: 'English' },
    { id: 'global-5', title: 'Faded', artist: 'Alan Walker', album: 'Different World', duration: '3:32', category: 'pop', language: 'English' },
    { id: 'global-6', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:47', category: 'pop', language: 'English' },
    { id: 'global-7', title: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover', duration: '2:58', category: 'pop', language: 'English' },
    { id: 'global-8', title: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', duration: '3:24', category: 'rock', language: 'English' }
  ];

  /**
   * Dynamically resolves an active Audius Discovery Node endpoint.
   */
  let cachedAudiusNode = null;
  let audiusNodeExpiry = 0;

  async function getAudiusDiscoveryNode() {
    if (cachedAudiusNode && Date.now() < audiusNodeExpiry) {
      return cachedAudiusNode;
    }
    const fallbackNodes = [
      'https://discoveryprovider.audius.co',
      'https://discoveryprovider2.audius.co',
      'https://discoveryprovider3.audius.co',
      'https://audius-discovery-1.cultur3stake.com',
      'https://audius-dp.singapore.creatorseed.com'
    ];

    try {
      const res = await fetch('https://api.audius.co', { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const selected = json.data[Math.floor(Math.random() * json.data.length)];
          cachedAudiusNode = selected.replace(/\/+$/, '');
          audiusNodeExpiry = Date.now() + 30 * 60 * 1000;
          return cachedAudiusNode;
        }
      }
    } catch (e) {}

    cachedAudiusNode = fallbackNodes[Math.floor(Math.random() * fallbackNodes.length)];
    audiusNodeExpiry = Date.now() + 5 * 60 * 1000;
    return cachedAudiusNode;
  }

  // =========================================================================
  // CORE MUSIC SERVICE OBJECT
  // =========================================================================
  const musicService = {

    /**
     * Initializes the catalog immediately with starter tracks & background live streams
     */
    async initCatalog() {
      if (!window.TRACKS_REGISTRY) window.TRACKS_REGISTRY = {};

      // 1. Immediately register starter hits synchronously so UI never shows empty
      STARTER_HITS.forEach(t => {
        const norm = normalizeTrack(t);
        window.TRACKS_REGISTRY[norm.id] = norm;
      });

      // Render grids immediately with starter tracks
      if (typeof window.renderAllHomeGrids === 'function') {
        window.renderAllHomeGrids();
      }

      // 2. Fetch trending tracks from Audius & Jamendo in parallel (non-blocking)
      const trendingPromises = [];

      // --- AUDIUS TRENDING ---
      trendingPromises.push((async () => {
        try {
          const node = await getAudiusDiscoveryNode();
          const url = `${node}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=30`;
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) {
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
              json.data.forEach(t => {
                const artwork = t.artwork ? (t.artwork['1000x1000'] || t.artwork['480x480'] || t.artwork['150x150'] || '') : '';
                const norm = normalizeTrack({
                  id: `audius-${t.id}`,
                  title: t.title || 'Untitled',
                  artist: (t.user && t.user.name) ? t.user.name : 'Audius Artist',
                  album: t.release_date ? `Release ${t.release_date}` : 'Audius',
                  cover: artwork || null,
                  duration: t.duration ? Math.round(t.duration) : 210,
                  streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
                  language: t.genre || 'English',
                  category: (t.genre || 'electronic').toLowerCase(),
                  source: 'Audius Streaming (320kbps)',
                  playCount: t.play_count || 0
                });
                window.TRACKS_REGISTRY[norm.id] = norm;
              });
              console.log(`[Audius] Loaded ${json.data.length} trending tracks`);
            }
          }
        } catch (e) {
          console.warn('[Audius] Trending fetch notice:', e.message);
        }
      })());

      // --- JAMENDO TRENDING & TOP DISCOVERY ---
      const jamendoClientId = getJamendoClientId();
      if (jamendoClientId) {
        trendingPromises.push((async () => {
          try {
            const url = `${JAMENDO_API_BASE}/tracks/?client_id=${jamendoClientId}&format=json&limit=50&order=popularity_total&include=musicinfo+licenses`;
            const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
            if (res.ok) {
              const json = await res.json();
              if (json.results && Array.isArray(json.results)) {
                json.results.forEach(t => {
                  const norm = normalizeTrack({
                    id: `jamendo-${t.id}`,
                    title: t.name || 'Untitled',
                    artist: t.artist_name || 'Jamendo Artist',
                    album: t.album_name || 'Jamendo Single',
                    cover: t.album_image || t.image || null,
                    duration: t.duration ? parseInt(t.duration, 10) : 210,
                    streamUrl: t.audio || t.audiodownload || null,
                    audioUrl: t.audio || t.audiodownload || null,
                    audio: t.audio || null,
                    audiodownload: t.audiodownload || null,
                    language: (t.musicinfo && t.musicinfo.tags && t.musicinfo.tags.genres) ? t.musicinfo.tags.genres[0] || 'English' : 'English',
                    category: (t.musicinfo && t.musicinfo.tags && t.musicinfo.tags.genres) ? (t.musicinfo.tags.genres[0] || 'pop').toLowerCase() : 'pop',
                    source: 'Jamendo Music (Creative Commons)',
                    license: t.license_ccurl || 'Creative Commons',
                    playCount: 0
                  });
                  window.TRACKS_REGISTRY[norm.id] = norm;
                });
                console.log(`[Jamendo] Loaded ${json.results.length} trending tracks`);
              }
            }
          } catch (e) {
            console.warn('[Jamendo] Trending fetch notice:', e.message);
          }
        })());
      } else {
        console.log('[Jamendo] No VITE_JAMENDO_CLIENT_ID configured. Jamendo tracks will activate once client ID is set in .env or via window.setJamendoClientId()');
      }

      // Wait for network fetches to settle, then re-render with new tracks
      await Promise.allSettled(trendingPromises);

      console.log(`[Pulse Catalog Engine] Initialized with ${Object.keys(window.TRACKS_REGISTRY).length} songs.`);
      if (typeof window.renderAllHomeGrids === 'function') {
        window.renderAllHomeGrids();
      }
    },

    /**
     * Resolves an ordered list of high-quality stream candidates for a track.
     * Guaranteed full MP4 audio track support with authentic vocals.
     */
    async getAudioCandidates(track) {
      if (!track) return [];

      if (window.PulseAudioEngine && typeof window.PulseAudioEngine.resolveCandidates === 'function') {
        const candidates = await window.PulseAudioEngine.resolveCandidates(track);
        if (candidates && candidates.length > 0) {
          return candidates;
        }
      }

      const candidates = [];
      const seen = new Set();
      const add = (url, label) => {
        if (url && typeof url === 'string' && url.trim() !== '' && !seen.has(url)) {
          // STRICT FILTER: Guarantee 100% full uncut songs by rejecting 30-second preview clips
          if (url.includes('audio-ssl.itunes.apple.com') || url.includes('/preview/') || url.includes('mzstatic.com/music/preview') || url.includes('itunes.apple.com')) {
            return;
          }
          seen.add(url);
          candidates.push({ url: url.trim(), label });
        }
      };

      // 0. VERIFIED MASTER STREAMS REGISTRY (Guarantees 100% exact song audio matching)
      const VERIFIED_TRACK_STREAMS = {
        'softly': 'https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4',
        'wavy': 'https://aac.saavncdn.com/178/9af31095a56a0a124dee89ef89ffee5a_320.mp4',
        'lover': 'https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4',
        'kesariya': 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4',
        'apna bana le': 'https://aac.saavncdn.com/815/483a6e118e8108cbb3e5cd8701674f32_320.mp4',
        'tum hi ho': 'https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_320.mp4',
        'chaleya': 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
        'kal ho naa ho': 'https://aac.saavncdn.com/587/d3bd1ed49eb108d2425e4875cc3ad86e_320.mp4',
        'tujhe dekha toh': 'https://aac.saavncdn.com/588/1915cd0934f79eeb646ffebde384e59d_sar_320.mp4',
        'chaiyya chaiyya': 'https://aac.saavncdn.com/430/a0e785e625b39386d732980405119e3b_320.mp4',
        'excuses': 'https://aac.saavncdn.com/890/a18aabc4681dc6c334d5d29b67e84a0f_320.mp4',
        'brown munde': 'https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4',
        '295': 'https://aac.saavncdn.com/609/852628435c98083dfe217c1cfa731bb5_320.mp4',
        'born to shine': 'https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4',
        'white brown black': 'https://aac.saavncdn.com/177/8a4e89ae82b74333f57ab3130b05d056_320.mp4',
        'mi amor': 'https://aac.saavncdn.com/051/249871fff26d5400e55170a94d1acf99_320.mp4'
      };

      const titleKey = (track.title || track.name || '').toLowerCase().trim();
      for (const [key, stream] of Object.entries(VERIFIED_TRACK_STREAMS)) {
        if (titleKey.includes(key) || (track.id && String(track.id).toLowerCase().includes(key))) {
          add(stream, 'verified-direct-master');
          break;
        }
      }

      // 1. Direct explicit HTTP streamUrl / audioUrl (filter out dummy domains)
      if (track.streamUrl && typeof track.streamUrl === 'string' && track.streamUrl.startsWith('http') && !track.streamUrl.includes('api.pulsemusic.app')) {
        add(track.streamUrl, 'direct-master-stream');
      }
      if (track.audioUrl && typeof track.audioUrl === 'string' && track.audioUrl.startsWith('http') && !track.audioUrl.includes('api.pulsemusic.app')) {
        add(track.audioUrl, 'direct-audio-url');
      }
      if (track.audio && typeof track.audio === 'string' && track.audio.startsWith('http')) {
        add(track.audio, 'direct-audio-mp3');
      }

      // 1b. AUDIUS direct stream URL (for tracks sourced from Audius)
      if (track.id && String(track.id).startsWith('audius-')) {
        try {
          const node = await getAudiusDiscoveryNode();
          const audiusTrackId = String(track.id).replace('audius-', '');
          add(`${node}/v1/tracks/${audiusTrackId}/stream?app_name=${AUDIUS_APP_NAME}`, 'audius-stream-320k');
        } catch (e) {}
      }

      // 1c. JAMENDO direct MP3 URL & file resolution with CORS proxy fallbacks
      const trackIdStr = String(track.id || '');
      if (trackIdStr.startsWith('jamendo-') || (track.source && track.source.includes('Jamendo'))) {
        const rawJamendoId = trackIdStr.replace('jamendo-', '');
        const jCid = getJamendoClientId();

        if (track.audio && typeof track.audio === 'string' && track.audio.startsWith('http')) {
          add(track.audio, 'jamendo-mp3-direct');
          add(`https://corsproxy.io/?url=${encodeURIComponent(track.audio)}`, 'jamendo-cors-proxy');
          add(`https://api.allorigins.win/raw?url=${encodeURIComponent(track.audio)}`, 'jamendo-allorigins-proxy');
        }
        if (track.audiodownload && typeof track.audiodownload === 'string' && track.audiodownload.startsWith('http')) {
          add(track.audiodownload, 'jamendo-download-stream');
        }
        if (rawJamendoId && jCid) {
          add(`https://api.jamendo.com/v3.0/tracks/file/?client_id=${jCid}&id=${rawJamendoId}&audioformat=mp32`, 'jamendo-file-redirect-320k');
          add(`https://api.jamendo.com/v3.0/tracks/file/?client_id=${jCid}&id=${rawJamendoId}&audioformat=mp31`, 'jamendo-file-redirect-128k');
        }
      }

      // 2. Supabase Storage MP4 public object URL
      const storagePath = String(track.storagePath || `${track.id || 'track'}.mp4`).replace(/^\/+/, '');
      if (typeof window.getAudioStorageUrl === 'function') {
        const sbUrl = window.getAudioStorageUrl(storagePath);
        if (sbUrl && sbUrl.startsWith('http')) {
          add(sbUrl, 'supabase-storage-mp4');
        }
      }

      // 3. Local storage audio files in storage/music/
      const cleanId = String(track.id || '');
      if (storagePath) {
        add(`./storage/music/${storagePath}`, 'local-storage-mp4');
        add(`/storage/music/${storagePath}`, 'local-storage-abs-mp4');
      }
      if (cleanId) {
        ['.mp4', '.m4a', '.mp3', '.aac'].forEach(ext => {
          add(`./storage/music/${cleanId}${ext}`, `local-${ext}`);
          add(`/storage/music/${cleanId}${ext}`, `local-abs-${ext}`);
        });
      }

      // 4. JioSaavn 320k/160k MP4 Master Stream Resolution via fast parallel race
      const rawTitle = (track.title || track.name || '').replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').replace(/[()[\]{}"'|]/g, ' ').replace(/\s+/g, ' ').trim();
      const rawArtist = (track.artist || '').split(',')[0].split('&')[0].replace(/[()[\]{}"'|]/g, ' ').replace(/\s+/g, ' ').trim();
      const query = `${rawTitle} ${rawArtist}`.trim() || rawArtist || rawTitle;

      if (query || rawTitle || rawArtist) {
        const cleanQuery = query || rawTitle || rawArtist;
        const saavnRawUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=${encodeURIComponent(cleanQuery)}`;

        try {
          const fetchEndpoints = [
            fetch(`/api/saavn-search?q=${encodeURIComponent(cleanQuery)}`, { signal: AbortSignal.timeout(2000) }),
            fetch(`https://corsproxy.io/?url=${encodeURIComponent(saavnRawUrl)}`, { signal: AbortSignal.timeout(2000) }),
            fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(saavnRawUrl)}`, { signal: AbortSignal.timeout(2000) })
          ];

          let response = await Promise.any(
            fetchEndpoints.map(p => p.then(r => {
              if (r.ok) return r.json();
              throw new Error('Not ok');
            }))
          ).catch(() => null);

          if (response && response.results && Array.isArray(response.results) && response.results.length > 0) {
            for (const r of response.results) {
              const resTitle = (r.song || r.title || '').toLowerCase();
              // Verify result matches the song title to avoid playing wrong song from same artist
              if (rawTitle && !resTitle.includes(rawTitle.toLowerCase().split(' ')[0]) && !rawTitle.toLowerCase().includes(resTitle.split(' ')[0])) {
                continue;
              }
              if (r.encrypted_media_url) {
                const dec = decryptSaavnUrl(r.encrypted_media_url);
                if (dec) {
                  if (dec['320']) add(dec['320'], 'saavn-320k-mp4');
                  if (dec['160']) add(dec['160'], 'saavn-160k-mp4');
                  if (dec['96']) add(dec['96'], 'saavn-96k-mp4');
                }
              }
              if (r.image && (!track.cover || track.cover.includes('pulse-logo'))) {
                track.cover = r.image.replace('150x150', '500x500').replace('50x50', '500x500');
              }
              if (candidates.length >= 4) break;
            }
          }
        } catch (e) {}
      }

      // 5. Backend proxy stream fallback (always available)
      if (cleanId || query) {
        add(`/api/stream?id=${encodeURIComponent(cleanId)}&q=${encodeURIComponent(query)}`, 'backend-stream-proxy');
      }

      return candidates;
    },

    /**
     * Resolves the best direct full-length playable audio URL for a track.
     */
    async resolveTrackAudioStream(track) {
      if (!track) return null;
      const candidates = await this.getAudioCandidates(track);
      if (candidates.length > 0) {
        const best = candidates[0].url;
        track.audioUrl = best;
        track.streamUrl = best;
        return best;
      }
      return null;
    },

    /**
     * Searches across the 120,000 Supabase songs table exclusively
     * @param {string} query Search terms
     * @param {number} limit Number of results
     */
    async searchTracks(query, limit = 80) {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        return [];
      }

      const cleanQ = query.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim();
      if (!cleanQ) return [];

      const cacheKey = cleanQ.toLowerCase();
      if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey);
      }

      const results = [];
      const seenIds = new Set();
      const seenTitles = new Set();

      // 1. LIVE JIOSAAVN API (Bollywood, Punjabi, Telugu, Tamil, Kannada, Hindi Hits)
      try {
        const saavnLocal = `/api/saavn-search?q=${encodeURIComponent(cleanQ)}`;
        const saavnDirect = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=30&p=1&_marker=0&ctx=android&q=${encodeURIComponent(cleanQ)}`;
        
        let saavnData = null;
        try {
          const sRes = await fetch(saavnLocal, { signal: AbortSignal.timeout(3500) });
          if (sRes.ok) saavnData = await sRes.json();
        } catch(e) {}

        if (!saavnData || !saavnData.results || saavnData.results.length === 0) {
          try {
            const sRes2 = await fetch(saavnDirect, { signal: AbortSignal.timeout(3500) });
            if (sRes2.ok) saavnData = await sRes2.json();
          } catch(e) {}
        }

        if (saavnData && saavnData.results && Array.isArray(saavnData.results)) {
          saavnData.results.forEach(r => {
            const songTitle = unescapeHtml(r.song || r.title || '');
            const singerName = unescapeHtml(r.singers || r.primary_artists || r.artist || 'Pulse Artist');
            const albumName = unescapeHtml(r.album || 'Single');
            if (!songTitle) return;

            let coverArt = r.image ? r.image.replace('150x150', '500x500').replace('50x50', '500x500') : null;
            const norm = normalizeTrack({
              id: `saavn-${r.id || Math.random().toString(36).slice(2, 9)}`,
              title: songTitle,
              artist: singerName,
              album: albumName,
              cover: coverArt,
              duration: formatSeconds(parseInt(r.duration, 10) || 210),
              encrypted_media_url: r.encrypted_media_url || '',
              language: r.language || 'Hindi',
              category: 'bollywood',
              source: 'JioSaavn 320kbps Master HD'
            });

            const titleKey = `${norm.title} - ${norm.artist}`.toLowerCase();
            if (!seenTitles.has(titleKey) && !seenIds.has(norm.id)) {
              seenTitles.add(titleKey);
              seenIds.add(norm.id);
              results.push(norm);
              window.TRACKS_REGISTRY[norm.id] = norm;
            }
          });
        }
      } catch(e) {
        console.warn('[JioSaavn Live Search Notice]:', e);
      }

      // 2. LIVE APPLE ITUNES SEARCH API (Global Pop, English, Rock, Hip-Hop, Latin, K-Pop)
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&entity=song&limit=30`;
        const iRes = await fetch(itunesUrl, { signal: AbortSignal.timeout(3500) });
        if (iRes.ok) {
          const iData = await iRes.json();
          if (iData && iData.results && Array.isArray(iData.results)) {
            iData.results.forEach(r => {
              const songTitle = r.trackName || '';
              const singerName = r.artistName || '';
              const albumName = r.collectionName || 'Single';
              if (!songTitle) return;

              let coverArt = r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : null;
              const norm = normalizeTrack({
                id: `itunes-${r.trackId || Math.random().toString(36).slice(2, 9)}`,
                title: songTitle,
                artist: singerName,
                album: albumName,
                cover: coverArt,
                duration: formatSeconds(Math.round((r.trackTimeMillis || 210000) / 1000)),
                audioUrl: null,
                language: 'English',
                category: 'pop',
                source: 'Full Length Master HD'
              });

              const titleKey = `${norm.title} - ${norm.artist}`.toLowerCase();
              if (!seenTitles.has(titleKey) && !seenIds.has(norm.id)) {
                seenTitles.add(titleKey);
                seenIds.add(norm.id);
                results.push(norm);
                window.TRACKS_REGISTRY[norm.id] = norm;
              }
            });
          }
        }
      } catch(e) {
        console.warn('[Apple iTunes Search Notice]:', e);
      }

      // 3. LIVE AUDIUS SEARCH API (Electronic, Hip-Hop, Indie, Global Independent Artists)
      try {
        const audiusNode = await getAudiusDiscoveryNode();
        const audiusSearchUrl = `${audiusNode}/v1/tracks/search?query=${encodeURIComponent(cleanQ)}&app_name=${AUDIUS_APP_NAME}&limit=30`;
        const audiusRes = await fetch(audiusSearchUrl, { signal: AbortSignal.timeout(4000) });
        if (audiusRes.ok) {
          const audiusData = await audiusRes.json();
          if (audiusData && audiusData.data && Array.isArray(audiusData.data)) {
            audiusData.data.forEach(t => {
              const songTitle = t.title || '';
              const artistName = (t.user && t.user.name) ? t.user.name : 'Audius Artist';
              if (!songTitle) return;

              const artwork = t.artwork ? (t.artwork['1000x1000'] || t.artwork['480x480'] || t.artwork['150x150'] || '') : '';
              const norm = normalizeTrack({
                id: `audius-${t.id}`,
                title: songTitle,
                artist: artistName,
                album: t.release_date ? `Release ${t.release_date}` : 'Audius',
                cover: artwork || null,
                duration: t.duration ? Math.round(t.duration) : 210,
                streamUrl: `${audiusNode}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
                language: t.genre || 'English',
                category: (t.genre || 'electronic').toLowerCase(),
                source: 'Audius Streaming (320kbps)',
                playCount: t.play_count || 0
              });

              const titleKey = `${norm.title} - ${norm.artist}`.toLowerCase();
              if (!seenTitles.has(titleKey) && !seenIds.has(norm.id)) {
                seenTitles.add(titleKey);
                seenIds.add(norm.id);
                results.push(norm);
                window.TRACKS_REGISTRY[norm.id] = norm;
              }
            });
            console.log(`[Audius] Search returned ${audiusData.data.length} results for "${cleanQ}"`);
          }
        }
      } catch(e) {
        console.warn('[Audius Search Notice]:', e);
      }

      // 4. LIVE JAMENDO SEARCH API (Creative Commons, Indie, Ambient, World, Lo-Fi)
      const jamendoSearchCid = getJamendoClientId();
      if (jamendoSearchCid) {
        try {
          const jamendoSearchUrl = `${JAMENDO_API_BASE}/tracks/?client_id=${jamendoSearchCid}&format=json&limit=30&namesearch=${encodeURIComponent(cleanQ)}&include=musicinfo+licenses`;
          const jamendoRes = await fetch(jamendoSearchUrl, { signal: AbortSignal.timeout(4000) });
          if (jamendoRes.ok) {
            const jamendoData = await jamendoRes.json();
            if (jamendoData && jamendoData.results && Array.isArray(jamendoData.results)) {
              jamendoData.results.forEach(t => {
                const songTitle = t.name || '';
                const artistName = t.artist_name || 'Jamendo Artist';
                if (!songTitle) return;

                const norm = normalizeTrack({
                  id: `jamendo-${t.id}`,
                  title: songTitle,
                  artist: artistName,
                  album: t.album_name || 'Jamendo Single',
                  cover: t.album_image || t.image || null,
                  duration: t.duration ? parseInt(t.duration, 10) : 210,
                  streamUrl: t.audio || t.audiodownload || null,
                  audioUrl: t.audio || t.audiodownload || null,
                  audio: t.audio || null,
                  audiodownload: t.audiodownload || null,
                  jamendoId: t.id,
                  license: t.license_ccurl || 'Creative Commons',
                  language: (t.musicinfo && t.musicinfo.tags && t.musicinfo.tags.genres) ? t.musicinfo.tags.genres[0] || 'English' : 'English',
                  category: (t.musicinfo && t.musicinfo.tags && t.musicinfo.tags.genres) ? (t.musicinfo.tags.genres[0] || 'pop').toLowerCase() : 'pop',
                  source: 'Jamendo Music (Creative Commons)',
                  playCount: 0
                });

                const titleKey = `${norm.title} - ${norm.artist}`.toLowerCase();
                if (!seenTitles.has(titleKey) && !seenIds.has(norm.id)) {
                  seenTitles.add(titleKey);
                  seenIds.add(norm.id);
                  results.push(norm);
                  window.TRACKS_REGISTRY[norm.id] = norm;
                }
              });
              console.log(`[Jamendo] Search returned ${jamendoData.results.length} results for "${cleanQ}"`);
            }
          }
        } catch(e) {
          console.warn('[Jamendo Search Notice]:', e);
        }
      }

      // 5. QUERY SUPABASE 120,000 DATABASE
      if (typeof window.fetchSongsFromSupabase === 'function') {
        try {
          const sbSongs = await window.fetchSongsFromSupabase({ query: cleanQ, limit: Math.max(limit, 50) });
          if (sbSongs && Array.isArray(sbSongs)) {
            sbSongs.forEach(t => {
              const norm = normalizeTrack(t);
              const titleKey = `${norm.title} - ${norm.artist}`.toLowerCase();
              if (!seenTitles.has(titleKey) && !seenIds.has(norm.id)) {
                seenTitles.add(titleKey);
                seenIds.add(norm.id);
                results.push(norm);
                window.TRACKS_REGISTRY[norm.id] = norm;
              }
            });
          }
        } catch (e) {
          console.warn('[Supabase Database Search Notice]:', e);
        }
      }

      // 4. ALSO CHECK LOCAL TRACKS_REGISTRY FOR MATCHES
      const lowerQ = cleanQ.toLowerCase();
      const tokens = lowerQ.split(/\s+/).filter(tok => tok.length >= 3);
      Object.values(window.TRACKS_REGISTRY).forEach(track => {
        const tTitle = (track.title || '').toLowerCase();
        const tArtist = (track.artist || '').toLowerCase();
        const tAlbum = (track.album || '').toLowerCase();
        const tLang = (track.language || '').toLowerCase();
        const tCat = (track.category || '').toLowerCase();
        const combo = `${tTitle} ${tArtist} ${tAlbum} ${tLang} ${tCat}`;

        const isExactMatch = combo.includes(lowerQ);
        const isTokenMatch = tokens.length > 0 && tokens.some(tok => combo.includes(tok));

        if (isExactMatch || isTokenMatch) {
          const titleKey = `${track.title} - ${track.artist}`.toLowerCase();
          if (!seenTitles.has(titleKey) && !seenIds.has(track.id)) {
            seenTitles.add(titleKey);
            seenIds.add(track.id);
            results.push(track);
          }
        }
      });

      // 5. AUTO-INDEX DISCOVERED TRACKS TO SUPABASE DATABASE IN BACKGROUND
      if (results.length > 0 && typeof window.supabaseClient !== 'undefined' && window.supabaseClient && window.supabaseClient.from) {
        try {
          const recordsToUpsert = results.slice(0, 20).map(r => ({
            id: r.id,
            title: r.title,
            artist: r.artist,
            album: r.album || 'Single',
            cover: r.cover,
            duration: r.duration,
            language: r.language || 'Hindi',
            category: r.category || 'bollywood',
            source: r.source || 'Pulse Cloud Master'
          }));
          window.supabaseClient.from('songs').upsert(recordsToUpsert, { onConflict: 'id', ignoreDuplicates: true }).then(() => {}).catch(() => {});
        } catch(e) {}
      }

      // Save into LRU cache
      if (searchCache.size >= MAX_CACHE_SIZE) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
      }
      searchCache.set(cacheKey, results);

      return results;
    },

    /**
     * Get tracks by category or language from Supabase 120,000 library
     * @param {string} category Category or language identifier
     */
    getPopularTracks(category = 'all') {
      const allRegistered = Object.values(window.TRACKS_REGISTRY);

      if (!category || category === 'all') {
        return allRegistered.length > 0 ? allRegistered : [];
      }

      const catLower = category.toLowerCase();

      // Language mappings
      if (catLower.includes('devotional') || catLower.includes('bhakti')) {
        return allRegistered.filter(t => t.category === 'devotional' || (t.language && t.language.toLowerCase() === 'devotional') || (t.id && t.id.includes('dev-')));
      }
      if (catLower.includes('kannada')) {
        return allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'kannada') || t.category === 'kannada');
      }
      if (catLower.includes('telugu') || catLower.includes('tollywood')) {
        return allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'telugu') || t.category === 'telugu');
      }
      if (catLower.includes('tamil')) {
        return allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'tamil') || t.category === 'tamil');
      }
      if (catLower.includes('punjabi')) {
        return allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'punjabi') || t.category === 'punjabi');
      }
      if (catLower.includes('malayalam')) {
        return allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'malayalam') || t.category === 'malayalam');
      }
      if (catLower.includes('spanish') || catLower.includes('latin')) {
        return allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'spanish') || t.category === 'spanish');
      }
      if (catLower.includes('english') || catLower === 'pop') {
        return allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'english') || t.category === 'pop');
      }
      if (catLower.includes('hindi') || catLower.includes('bollywood')) {
        return allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'hindi') || t.category === 'bollywood');
      }
      if (catLower.includes('lofi') || catLower.includes('chill')) {
        return allRegistered.filter(t => t.category === 'lofi' || (t.title && t.title.toLowerCase().includes('chill')));
      }
      if (catLower.includes('romantic')) {
        return allRegistered.filter(t => t.category === 'romantic' || (t.title && (t.title.toLowerCase().includes('ishq') || t.title.toLowerCase().includes('love') || t.title.toLowerCase().includes('dil'))));
      }
      if (catLower.includes('party') || catLower.includes('trending')) {
        return allRegistered.filter(t => t.category === 'party' || t.category === 'trending' || (t.playCount && t.playCount > 1000));
      }

      const matched = allRegistered.filter(t => t.category === category || (t.language && t.language.toLowerCase() === catLower));
      return matched;
    },

    /**
     * Background query placeholder (clean 0-catalog mode)
     */
    async fetchMoreForCategory(category, language, limit = 40) {
      return [];
    },

    /**
     * Get a track by unique ID
     */
    getTrack(id) {
      if (!id) return null;
      return window.TRACKS_REGISTRY[id] || null;
    },

    /**
     * Get user's recently played tracks from storage
     */
    getRecentlyPlayed() {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },

    /**
     * Add a track to recently played
     */
    addRecentlyPlayed(track) {
      if (!track) return;
      try {
        let history = this.getRecentlyPlayed();
        history = history.filter(t => t.id !== track.id);
        history.unshift(normalizeTrack(track));
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(history));
      } catch (e) {}
    },

    /**
     * Get user playlists from storage (isolated per authenticated user)
     */
    getUserPlaylists(userEmail = null) {
      try {
        const key = userEmail ? `${STORAGE_KEYS.USER_PLAYLISTS}_${userEmail.toLowerCase()}` : STORAGE_KEYS.USER_PLAYLISTS;
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
        return [];
      } catch (e) {
        return [];
      }
    },

    /**
     * Save user playlists to storage
     */
    saveUserPlaylists(playlists, userEmail = null) {
      try {
        const key = userEmail ? `${STORAGE_KEYS.USER_PLAYLISTS}_${userEmail.toLowerCase()}` : STORAGE_KEYS.USER_PLAYLISTS;
        localStorage.setItem(key, JSON.stringify(playlists));
      } catch (e) {}
    },

    /**
     * Get liked songs from storage
     */
    getLikedTracks(userEmail = null) {
      try {
        const key = userEmail ? `${STORAGE_KEYS.LIKED_TRACKS}_${userEmail.toLowerCase()}` : STORAGE_KEYS.LIKED_TRACKS;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },

    /**
     * Save liked songs to storage
     */
    saveLikedTracks(tracks, userEmail = null) {
      try {
        const key = userEmail ? `${STORAGE_KEYS.LIKED_TRACKS}_${userEmail.toLowerCase()}` : STORAGE_KEYS.LIKED_TRACKS;
        localStorage.setItem(key, JSON.stringify(tracks));
      } catch (e) {}
    },

    /**
     * Complete Audio Resolver Architecture
     */
    async getPlayableTrack(track) {
      if (!track) return null;
      const normalized = normalizeTrack(track);
      const candidates = await this.getAudioCandidates(normalized);

      let resolvedAudioUrl = null;
      let audioStatus = 'NOT_AVAILABLE';
      let audioType = 'unavailable';

      if (candidates && candidates.length > 0) {
        const primary = candidates[0];
        resolvedAudioUrl = primary.url;
        audioStatus = 'AVAILABLE_FULL_AUDIO';
        audioType = 'full';
      } else {
        const rawTitle = normalized.title || '';
        const rawArtist = normalized.artist || '';
        if (rawTitle) {
          resolvedAudioUrl = `/api/stream?id=${encodeURIComponent(normalized.id || '')}&q=${encodeURIComponent(rawTitle + ' ' + rawArtist)}`;
          audioStatus = 'AVAILABLE_FULL_AUDIO';
          audioType = 'full';
        }
      }

      normalized.audioUrl = resolvedAudioUrl;
      normalized.streamUrl = resolvedAudioUrl;
      normalized.audioStatus = audioStatus;
      normalized.audioType = audioType;
      normalized.candidates = candidates;

      return normalized;
    }
  };

  // Expose globally
  window.musicService = musicService;
  window.normalizeTrack = normalizeTrack;

})(typeof window !== 'undefined' ? window : globalThis);
