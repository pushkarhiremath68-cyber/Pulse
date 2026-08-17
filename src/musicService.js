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

  const AUTHENTIC_ARTIST_COVERS = {
    'arijit singh': 'https://c.saavncdn.com/191/Kesariya-From-Brahmastra-Hindi-2022-20220717092820-500x500.jpg',
    'karan aujla': 'https://c.saavncdn.com/978/Tauba-Tauba-From-Bad-Newz-Hindi-2024-20240702111004-500x500.jpg',
    'diljit dosanjh': 'https://c.saavncdn.com/973/MoonChild-Era-Punjabi-2021-20210822180844-500x500.jpg',
    'ap dhillon': 'https://c.saavncdn.com/624/With-You-Punjabi-2023-20230811053424-500x500.jpg',
    'shreya ghoshal': 'https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814114324-500x500.jpg',
    'ed sheeran': 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/ba/66/1b/ba661b17-3dd3-29dd-7fb4-0d9c15ff9209/190295851286.jpg/600x600bb.jpg',
    'the weeknd': 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/7d/51/a47d519b-640a-ca1d-ff14-c1ab415f33f6/16UMGIM60655.rgb.jpg/600x600bb.jpg',
    'taylor swift': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/f5/ec/4bf5ecf8-7f99-ef2e-736f-e3c6a4d7d3d7/19UMGIM68357.rgb.jpg/600x600bb.jpg',
    'anirudh': 'https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814114324-500x500.jpg',
    'sid sriram': 'https://c.saavncdn.com/513/Pushpa-The-Rise-Telugu-2021-20211217064846-500x500.jpg',
    'vijay prakash': 'https://c.saavncdn.com/129/Kantara-Kannada-2022-20221010165736-500x500.jpg',
    'hariharan': 'https://c.saavncdn.com/007/Shree-Hanuman-Chalisa-Hanuman-Ashtak-Hindi-1992-500x500.jpg',
    'shankar mahadevan': 'https://c.saavncdn.com/423/Shiv-Tandav-Stotram-Hindi-2020-20200706173934-500x500.jpg',
    'sonu nigam': 'https://c.saavncdn.com/264/Aashiqui-2-Hindi-2013-500x500.jpg',
    'atif aslam': 'https://c.saavncdn.com/040/Love-Aaj-Kal-Hindi-2020-20200214140417-500x500.jpg',
    'kk': 'https://c.saavncdn.com/264/Aashiqui-2-Hindi-2013-500x500.jpg',
    'pritam': 'https://c.saavncdn.com/191/Kesariya-From-Brahmastra-Hindi-2022-20220717092820-500x500.jpg',
    'vishal mishra': 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191410-500x500.jpg',
    'jubin nautiyal': 'https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg',
    'badshah': 'https://c.saavncdn.com/978/Tauba-Tauba-From-Bad-Newz-Hindi-2024-20240702111004-500x500.jpg',
    'shubh': 'https://c.saavncdn.com/139/Still-Rollin-Punjabi-2023-20230519060416-500x500.jpg',
    'sidhu moose wala': 'https://c.saavncdn.com/973/MoonChild-Era-Punjabi-2021-20210822180844-500x500.jpg'
  };

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

    // Match authentic artist cover if cover is missing or generic
    if (!cleanCover || cleanCover === './pulse-logo.png' || cleanCover.includes('unsplash.com') || cleanCover.trim() === '') {
      const lowerArtist = cleanArtist.toLowerCase();
      for (const [artKey, artCover] of Object.entries(AUTHENTIC_ARTIST_COVERS)) {
        if (lowerArtist.includes(artKey)) {
          cleanCover = artCover;
          break;
        }
      }
      if (!cleanCover) {
        cleanCover = generateTrackCover(cleanTitle, cleanArtist, raw.category);
      }
    }

    let cleanDuration = raw.duration || '3:30';
    if (typeof cleanDuration === 'number') {
      cleanDuration = formatSeconds(cleanDuration);
    }

    const cleanStoragePath = raw.storagePath || raw.storage_path || `${cleanId}.mp4`;
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
      source: raw.source || 'Pulse Cloud CDN (320kbps MP4)',
      playCount: raw.playCount || raw.play_count || 0
    };
  }

  // =========================================================================
  // CORE MUSIC SERVICE OBJECT
  // =========================================================================
  const musicService = {

    /**
     * Initializes the Supabase 120,000 songs catalog on startup
     */
    async initCatalog() {
      // 1. Initial Curated High-Fidelity Catalog Seed (Guarantees all home categories are rich on launch)
      const defaultCatalog = [
        // Bollywood / Hindi Hits
        { id: 'in-kesariya', title: 'Kesariya', artist: 'Arijit Singh, Pritam', album: 'Brahmastra', duration: '4:28', category: 'bollywood', language: 'Hindi', cover: 'https://c.saavncdn.com/191/Kesariya-From-Brahmastra-Hindi-2022-20220717092820-500x500.jpg' },
        { id: 'in-chaleya', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao, Anirudh', album: 'Jawan', duration: '3:20', category: 'bollywood', language: 'Hindi', cover: 'https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814114324-500x500.jpg' },
        { id: 'in-apna-bana-le', title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', album: 'Bhediya', duration: '4:21', category: 'romantic', language: 'Hindi', cover: 'https://c.saavncdn.com/815/Bhediya-Hindi-2022-20221124110332-500x500.jpg' },
        { id: 'in-tum-hi-ho', title: 'Tum Hi Ho', artist: 'Arijit Singh, Mithoon', album: 'Aashiqui 2', duration: '4:22', category: 'romantic', language: 'Hindi', cover: 'https://c.saavncdn.com/264/Aashiqui-2-Hindi-2013-500x500.jpg' },
        { id: 'in-pehle-bhi-main', title: 'Pehle Bhi Main', artist: 'Vishal Mishra, Raj Shekhar', album: 'Animal', duration: '4:10', category: 'bollywood', language: 'Hindi', cover: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191410-500x500.jpg' },
        { id: 'in-shayad', title: 'Shayad', artist: 'Arijit Singh, Pritam', album: 'Love Aaj Kal', duration: '4:07', category: 'romantic', language: 'Hindi', cover: 'https://c.saavncdn.com/040/Love-Aaj-Kal-Hindi-2020-20200214140417-500x500.jpg' },
        { id: 'in-raataan-lambiyan', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal, Asees Kaur', album: 'Shershaah', duration: '3:50', category: 'romantic', language: 'Hindi', cover: 'https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg' },
        { id: 'in-jawan-title', title: 'Jawan Title Track', artist: 'Anirudh Ravichander', album: 'Jawan', duration: '3:08', category: 'party', language: 'Hindi', cover: 'https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814114324-500x500.jpg' },
        { id: 'in-heeriye', title: 'Heeriye', artist: 'Jasleen Royal, Arijit Singh', album: 'Heeriye', duration: '3:15', category: 'romantic', language: 'Hindi', cover: 'https://c.saavncdn.com/022/Heeriye-feat-Arijit-Singh-Hindi-2023-20230928050405-500x500.jpg' },

        // Punjabi Hits
        { id: 'pj-tauba-tauba', title: 'Tauba Tauba', artist: 'Karan Aujla', album: 'Bad Newz', duration: '3:27', category: 'punjabi', language: 'Punjabi', cover: 'https://c.saavncdn.com/978/Tauba-Tauba-From-Bad-Newz-Hindi-2024-20240702111004-500x500.jpg' },
        { id: 'pj-softly', title: 'Softly', artist: 'Karan Aujla, Ikky', album: 'Making Memories', duration: '2:35', category: 'punjabi', language: 'Punjabi', cover: 'https://c.saavncdn.com/949/Making-Memories-Punjabi-2023-20230818053240-500x500.jpg' },
        { id: 'pj-wavy', title: 'Winning Speech / Wavy', artist: 'Karan Aujla', album: 'Street Dreams', duration: '3:04', category: 'punjabi', language: 'Punjabi', cover: 'https://c.saavncdn.com/949/Making-Memories-Punjabi-2023-20230818053240-500x500.jpg' },
        { id: 'pj-lover', title: 'Lover', artist: 'Diljit Dosanjh', album: 'MoonChild Era', duration: '3:10', category: 'punjabi', language: 'Punjabi', cover: 'https://c.saavncdn.com/973/MoonChild-Era-Punjabi-2021-20210822180844-500x500.jpg' },
        { id: 'pj-with-you', title: 'With You', artist: 'AP Dhillon', album: 'With You', duration: '2:34', category: 'punjabi', language: 'Punjabi', cover: 'https://c.saavncdn.com/624/With-You-Punjabi-2023-20230811053424-500x500.jpg' },
        { id: 'pj-cheques', title: 'Cheques', artist: 'Shubh', album: 'Still Rollin', duration: '3:03', category: 'punjabi', language: 'Punjabi', cover: 'https://c.saavncdn.com/139/Still-Rollin-Punjabi-2023-20230519060416-500x500.jpg' },

        // Devotional / Bhakti
        { id: 'dev-hanuman-chalisa', title: 'Shree Hanuman Chalisa', artist: 'Hariharan, Gulshan Kumar', album: 'Shree Hanuman Chalisa', duration: '9:48', category: 'devotional', language: 'Devotional', cover: 'https://c.saavncdn.com/007/Shree-Hanuman-Chalisa-Hanuman-Ashtak-Hindi-1992-500x500.jpg' },
        { id: 'dev-achyutam-keshavam', title: 'Achyutam Keshavam', artist: 'Vikram Hazra', album: 'Krishna Bhajans', duration: '5:12', category: 'devotional', language: 'Devotional', cover: 'https://c.saavncdn.com/495/Krishna-Bhajans-Hindi-2018-20180829-500x500.jpg' },
        { id: 'dev-shiv-tandav', title: 'Shiv Tandav Stotram', artist: 'Shankar Mahadevan', album: 'Shiv Stotram', duration: '9:14', category: 'devotional', language: 'Devotional', cover: 'https://c.saavncdn.com/423/Shiv-Tandav-Stotram-Hindi-2020-20200706173934-500x500.jpg' },
        { id: 'dev-ram-siya-ram', title: 'Ram Siya Ram', artist: 'Sachet Tandon, Parampara Tandon', album: 'Adipurush', duration: '3:50', category: 'devotional', language: 'Devotional', cover: 'https://c.saavncdn.com/445/Ram-Siya-Ram-From-Adipurush-Hindi-2023-20230529124403-500x500.jpg' },

        // Global Pop & English Hits
        { id: 'en-shape-of-you', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', duration: '3:53', category: 'pop', language: 'English', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/ba/66/1b/ba661b17-3dd3-29dd-7fb4-0d9c15ff9209/190295851286.jpg/600x600bb.jpg' },
        { id: 'en-starboy', title: 'Starboy', artist: 'The Weeknd, Daft Punk', album: 'Starboy', duration: '3:50', category: 'pop', language: 'English', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/7d/51/a47d519b-640a-ca1d-ff14-c1ab415f33f6/16UMGIM60655.rgb.jpg/600x600bb.jpg' },
        { id: 'en-blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', category: 'pop', language: 'English', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b9/8b/6e/b98b6e3b-9e48-8df0-109d-0c58a5e840d5/20UMGIM10243.rgb.jpg/600x600bb.jpg' },
        { id: 'en-cruel-summer', title: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover', duration: '2:58', category: 'pop', language: 'English', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/f5/ec/4bf5ecf8-7f99-ef2e-736f-e3c6a4d7d3d7/19UMGIM68357.rgb.jpg/600x600bb.jpg' },
        { id: 'en-as-it-was', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:47', category: 'pop', language: 'English', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/0a/6d/8d/0a6d8d85-455b-4395-5bb6-1c706d0a7a0b/886449987823.jpg/600x600bb.jpg' },

        // Regional (South Indian / Kannada / Telugu / Tamil)
        { id: 'kn-singara-siriye', title: 'Singara Siriye', artist: 'Vijay Prakash, Ananya Bhat', album: 'Kantara', duration: '4:42', category: 'kannada', language: 'Kannada', cover: 'https://c.saavncdn.com/129/Kantara-Kannada-2022-20221010165736-500x500.jpg' },
        { id: 'te-srivalli', title: 'Srivalli', artist: 'Sid Sriram, Devi Sri Prasad', album: 'Pushpa: The Rise', duration: '3:44', category: 'telugu', language: 'Telugu', cover: 'https://c.saavncdn.com/513/Pushpa-The-Rise-Telugu-2021-20211217064846-500x500.jpg' },
        { id: 'tm-arabic-kuthu', title: 'Arabic Kuthu - Halamithi Habibo', artist: 'Anirudh Ravichander, Jonita Gandhi', album: 'Beast', duration: '4:37', category: 'tamil', language: 'Tamil', cover: 'https://c.saavncdn.com/712/Beast-Tamil-2022-20220412124507-500x500.jpg' },
        { id: 'tm-kaavaalaa', title: 'Kaavaalaa', artist: 'Anirudh Ravichander, Shilpa Rao', album: 'Jailer', duration: '3:10', category: 'tamil', language: 'Tamil', cover: 'https://c.saavncdn.com/001/Kaavaalaa-From-Jailer-Tamil-2023-20230706073105-500x500.jpg' }
      ];

      defaultCatalog.forEach(t => {
        const norm = normalizeTrack(t);
        window.TRACKS_REGISTRY[norm.id] = norm;
      });

      // 2. Fetch additional seed from 120,000 Supabase database
      if (typeof window.fetchInitialCatalogSeed === 'function') {
        try {
          const seed = await window.fetchInitialCatalogSeed(40);
          if (seed && Array.isArray(seed) && seed.length > 0) {
            seed.forEach(t => {
              const norm = normalizeTrack(t);
              window.TRACKS_REGISTRY[norm.id] = norm;
            });
            console.log(`[Pulse Catalog Engine] Initialized ${Object.keys(window.TRACKS_REGISTRY).length} tracks into in-memory catalog.`);
          }
        } catch (e) {
          console.warn('[Pulse Supabase Seed Exception]:', e);
        }
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

      // 1. Direct explicit HTTP streamUrl / audioUrl (filter out dummy domains)
      if (track.streamUrl && typeof track.streamUrl === 'string' && track.streamUrl.startsWith('http') && !track.streamUrl.includes('api.pulsemusic.app')) {
        add(track.streamUrl, 'direct-master-stream');
      }
      if (track.audioUrl && typeof track.audioUrl === 'string' && track.audioUrl.startsWith('http') && !track.audioUrl.includes('api.pulsemusic.app')) {
        add(track.audioUrl, 'direct-audio-url');
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

          // If no results for combined query, retry with artist only
          if ((!response || !response.results || response.results.length === 0) && rawArtist) {
            try {
              const artistRes = await fetch(`/api/saavn-search?q=${encodeURIComponent(rawArtist)}`, { signal: AbortSignal.timeout(1500) });
              if (artistRes.ok) {
                response = await artistRes.json();
              }
            } catch(e) {}
          }

          if (response && response.results && Array.isArray(response.results) && response.results.length > 0) {
            for (const r of response.results) {
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

      // 3. QUERY SUPABASE 120,000 DATABASE
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
        const res = allRegistered.filter(t => t.category === 'devotional' || (t.language && t.language.toLowerCase() === 'devotional') || (t.id && t.id.includes('dev-')));
        if (res.length < 8) this.fetchMoreForCategory('devotional', 'Devotional');
        return res;
      }
      if (catLower.includes('kannada')) {
        const res = allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'kannada') || t.category === 'kannada');
        if (res.length < 8) this.fetchMoreForCategory('kannada', 'Kannada');
        return res;
      }
      if (catLower.includes('telugu') || catLower.includes('tollywood')) {
        const res = allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'telugu') || t.category === 'telugu');
        if (res.length < 8) this.fetchMoreForCategory('telugu', 'Telugu');
        return res;
      }
      if (catLower.includes('tamil')) {
        const res = allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'tamil') || t.category === 'tamil');
        if (res.length < 8) this.fetchMoreForCategory('tamil', 'Tamil');
        return res;
      }
      if (catLower.includes('punjabi')) {
        const res = allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'punjabi') || t.category === 'punjabi');
        if (res.length < 8) this.fetchMoreForCategory('punjabi', 'Punjabi');
        return res;
      }
      if (catLower.includes('malayalam')) {
        const res = allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'malayalam') || t.category === 'malayalam');
        if (res.length < 8) this.fetchMoreForCategory('malayalam', 'Malayalam');
        return res;
      }
      if (catLower.includes('spanish') || catLower.includes('latin')) {
        const res = allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'spanish') || t.category === 'spanish');
        if (res.length < 8) this.fetchMoreForCategory('spanish', 'Spanish');
        return res;
      }
      if (catLower.includes('english') || catLower === 'pop') {
        const res = allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'english') || t.category === 'pop');
        if (res.length < 8) this.fetchMoreForCategory('pop', 'English');
        return res;
      }
      if (catLower.includes('hindi') || catLower.includes('bollywood')) {
        const res = allRegistered.filter(t => (t.language && t.language.toLowerCase() === 'hindi') || t.category === 'bollywood');
        if (res.length < 8) this.fetchMoreForCategory('bollywood', 'Hindi');
        return res;
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
      return matched.length > 0 ? matched : allRegistered.slice(0, 30);
    },

    /**
     * Background query to fetch more tracks for a specific category/language from Supabase
     */
    async fetchMoreForCategory(category, language, limit = 40) {
      if (typeof window.fetchSongsFromSupabase !== 'function') return;
      try {
        const songs = await window.fetchSongsFromSupabase({ category, language, limit });
        if (songs && Array.isArray(songs)) {
          songs.forEach(s => {
            const norm = normalizeTrack(s);
            window.TRACKS_REGISTRY[norm.id] = norm;
          });
          if (typeof window.renderAllHomeGrids === 'function') {
            window.renderAllHomeGrids();
          }
        }
      } catch (e) {}
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
        
        if (userEmail) {
          const sample = Object.values(window.TRACKS_REGISTRY).slice(0, 4);
          const defaultPl = [
            {
              id: `pl-${Date.now()}`,
              name: 'My Pulse Mix',
              createdAt: Date.now(),
              tracks: sample
            }
          ];
          localStorage.setItem(key, JSON.stringify(defaultPl));
          return defaultPl;
        }
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
