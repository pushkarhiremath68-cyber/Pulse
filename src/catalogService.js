/**
 * Pulse Music - Multi-Category Catalog & Artist Directory Engine
 * Powered by Jamendo API (Client ID: 23b33f2a) and Decentralized Audius Nodes
 */

(function(root) {
  'use strict';

  const JAMENDO_CLIENT_ID = '23b33f2a';
  const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
  const AUDIUS_APP_NAME = 'PULSE_MUSIC_APP';

  // =========================================================================
  // 1. DYNAMIC CATEGORY & GENRE CONFIGURATION
  // =========================================================================
  const CATEGORIES = {
    'trending': {
      id: 'trending',
      title: 'Trending Worldwide',
      subtitle: 'Top global chartbusters and viral discoveries',
      icon: 'fa-fire',
      color: '#f97316',
      jamendoOrder: 'popularity_total',
      jamendoTags: null,
      audiusGenre: null,
      audiusTrending: true
    },
    'hindi': {
      id: 'hindi',
      title: 'Hindi & Desi Beats',
      subtitle: 'Bollywood blockbusters, Indian indie & romantic melodies',
      icon: 'fa-compact-disc',
      color: '#ec4899',
      jamendoTags: 'indian',
      audiusQuery: 'Hindi',
      saavnQuery: 'Hindi Hits'
    },
    'pop': {
      id: 'pop',
      title: 'English & International Pop',
      subtitle: 'Billboard hits, catchy hooks & chart-topping pop anthems',
      icon: 'fa-earth-americas',
      color: '#3b82f6',
      jamendoTags: 'pop',
      audiusGenre: 'Pop',
      itunesQuery: 'Top Pop Hits'
    },
    'electronic': {
      id: 'electronic',
      title: 'EDM & Electronic Heat',
      subtitle: 'High-energy club bangers, house, synthwave & dance',
      icon: 'fa-bolt-lightning',
      color: '#a855f7',
      jamendoTags: 'edm',
      audiusGenre: 'Electronic'
    },
    'lofi': {
      id: 'lofi',
      title: 'Lo-Fi & Study Chill',
      subtitle: 'Soothing instrumental beats, ambient vibes & relaxation',
      icon: 'fa-headphones-simple',
      color: '#10b981',
      jamendoTags: 'lofi',
      audiusGenre: 'Lo-Fi'
    },
    'rock': {
      id: 'rock',
      title: 'Rock & Alternative',
      subtitle: 'Electric riffs, indie rock, classic anthems & punk',
      icon: 'fa-guitar',
      color: '#ef4444',
      jamendoTags: 'indie',
      audiusGenre: 'Rock'
    },
    'ambient': {
      id: 'ambient',
      title: 'Ambient & Cinematic Scores',
      subtitle: 'Film soundtracks, orchestral textures & deep meditation',
      icon: 'fa-film',
      color: '#06b6d4',
      jamendoTags: 'filmscore',
      audiusGenre: 'Ambient'
    }
  };

  // =========================================================================
  // 2. STARTER TRACKS (Synchronous Instant Display on Boot)
  // =========================================================================
  const STARTER_TRACKS = [
    // Hindi & Bollywood
    { id: 'hindi-1', title: 'Kesariya', artist: 'Arijit Singh, Pritam', album: 'Brahmastra', duration: '4:28', category: 'hindi', genre: 'Bollywood', language: 'Hindi', playCount: 854000 },
    { id: 'hindi-2', title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', album: 'Bhediya', duration: '4:21', category: 'hindi', genre: 'Bollywood', language: 'Hindi', playCount: 742000 },
    { id: 'hindi-3', title: 'Tum Se Hi', artist: 'Mohit Chauhan, Pritam', album: 'Jab We Met', duration: '5:21', category: 'hindi', genre: 'Bollywood', language: 'Hindi', playCount: 680000 },
    { id: 'hindi-4', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao, Anirudh', album: 'Jawan', duration: '3:20', category: 'hindi', genre: 'Bollywood', language: 'Hindi', playCount: 920000 },
    { id: 'hindi-5', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal, Asees Kaur', album: 'Shershaah', duration: '3:50', category: 'hindi', genre: 'Bollywood', language: 'Hindi', playCount: 610000 },
    { id: 'hindi-6', title: 'Tum Hi Ho', artist: 'Arijit Singh, Mithoon', album: 'Aashiqui 2', duration: '4:22', category: 'hindi', genre: 'Bollywood', language: 'Hindi', playCount: 1200000 },
    { id: 'hindi-7', title: 'Heeriye', artist: 'Jasleen Royal, Arijit Singh', album: 'Heeriye', duration: '3:15', category: 'hindi', genre: 'Bollywood', language: 'Hindi', playCount: 540000 },
    { id: 'hindi-8', title: 'Shayad', artist: 'Arijit Singh, Pritam', album: 'Love Aaj Kal', duration: '4:07', category: 'hindi', genre: 'Bollywood', language: 'Hindi', playCount: 490000 },

    // English & International Pop
    { id: 'pop-1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', category: 'pop', genre: 'Pop', language: 'English', playCount: 1950000 },
    { id: 'pop-2', title: 'Starboy', artist: 'The Weeknd, Daft Punk', album: 'Starboy', duration: '3:50', category: 'pop', genre: 'Pop', language: 'English', playCount: 1420000 },
    { id: 'pop-3', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', duration: '3:53', category: 'pop', genre: 'Pop', language: 'English', playCount: 1800000 },
    { id: 'pop-4', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23', category: 'pop', genre: 'Pop', language: 'English', playCount: 990000 },
    { id: 'pop-5', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:47', category: 'pop', genre: 'Pop', language: 'English', playCount: 1100000 },
    { id: 'pop-6', title: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover', duration: '2:58', category: 'pop', genre: 'Pop', language: 'English', playCount: 1350000 },

    // EDM & Electronic
    { id: 'edm-1', title: 'Faded', artist: 'Alan Walker', album: 'Different World', duration: '3:32', category: 'electronic', genre: 'EDM', language: 'English', playCount: 1600000 },
    { id: 'edm-2', title: 'Titanium', artist: 'David Guetta, Sia', album: 'Nothing but the Beat', duration: '4:05', category: 'electronic', genre: 'EDM', language: 'English', playCount: 890000 },
    { id: 'edm-3', title: 'Closer', artist: 'The Chainsmokers, Halsey', album: 'Collage', duration: '4:04', category: 'electronic', genre: 'EDM', language: 'English', playCount: 1250000 },
    { id: 'edm-4', title: 'Animals', artist: 'Martin Garrix', album: 'Gold Skies', duration: '2:56', category: 'electronic', genre: 'EDM', language: 'Instrumental', playCount: 780000 },

    // Lo-Fi & Chill
    { id: 'lofi-1', title: 'Midnight City Lights', artist: 'Chillhop Beats', album: 'Nightfall Session', duration: '2:45', category: 'lofi', genre: 'Lo-Fi', language: 'Instrumental', playCount: 320000 },
    { id: 'lofi-2', title: 'Coffee & Raindrops', artist: 'LoFi Dreamer', album: 'Cozy Morning', duration: '2:30', category: 'lofi', genre: 'Lo-Fi', language: 'Instrumental', playCount: 290000 },
    { id: 'lofi-3', title: 'Sunset Memories', artist: 'Tokyo LoFi Collective', album: 'Shibuya Sunset', duration: '3:10', category: 'lofi', genre: 'Lo-Fi', language: 'Instrumental', playCount: 410000 },
    { id: 'lofi-4', title: 'Study Beats Vol. 4', artist: 'Sleepy Cat', album: 'Deep Focus', duration: '2:52', category: 'lofi', genre: 'Lo-Fi', language: 'Instrumental', playCount: 350000 },

    // Rock & Alternative
    { id: 'rock-1', title: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', duration: '3:24', category: 'rock', genre: 'Rock', language: 'English', playCount: 1700000 },
    { id: 'rock-2', title: 'Radioactive', artist: 'Imagine Dragons', album: 'Night Visions', duration: '3:06', category: 'rock', genre: 'Rock', language: 'English', playCount: 1300000 },
    { id: 'rock-3', title: 'Demons', artist: 'Imagine Dragons', album: 'Night Visions', duration: '2:57', category: 'rock', genre: 'Rock', language: 'English', playCount: 980000 },
    { id: 'rock-4', title: 'Bones', artist: 'Imagine Dragons', album: 'Mercury - Acts 1 & 2', duration: '2:45', category: 'rock', genre: 'Rock', language: 'English', playCount: 840000 },

    // Ambient & Cinematic
    { id: 'amb-1', title: 'Celestial Horizons', artist: 'Starlight Symphony', album: 'Cosmic Journey', duration: '4:15', category: 'ambient', genre: 'Ambient', language: 'Instrumental', playCount: 210000 },
    { id: 'amb-2', title: 'Deep Ocean Pulse', artist: 'Aurora Soundscapes', album: 'Abyssal Calm', duration: '5:02', category: 'ambient', genre: 'Ambient', language: 'Instrumental', playCount: 180000 },
    { id: 'amb-3', title: 'Cinema Paradiso Theme', artist: 'Orchestral Hall', album: 'Soundtrack Masterpieces', duration: '3:45', category: 'ambient', genre: 'Cinematic', language: 'Instrumental', playCount: 240000 }
  ];

  // =========================================================================
  // 3. INTERNAL STORAGE & CACHES
  // =========================================================================
  const categoryTracksCache = {};
  const artistDirectory = {};
  let previewAudioElement = null;
  let activePreviewTrackId = null;
  let previewTimeoutTimer = null;

  // Audius Discovery Nodes
  let cachedAudiusNode = null;
  let audiusNodeExpiry = 0;

  async function getAudiusNode() {
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
          const node = json.data[Math.floor(Math.random() * json.data.length)].replace(/\/+$/, '');
          cachedAudiusNode = node;
          audiusNodeExpiry = Date.now() + 30 * 60 * 1000;
          return node;
        }
      }
    } catch (e) {}
    cachedAudiusNode = fallbackNodes[Math.floor(Math.random() * fallbackNodes.length)];
    audiusNodeExpiry = Date.now() + 5 * 60 * 1000;
    return cachedAudiusNode;
  }

  // =========================================================================
  // 4. DATA NORMALIZER
  // =========================================================================
  function formatSeconds(secs) {
    if (typeof secs !== 'number' || isNaN(secs) || secs < 0) return '3:30';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function normalizeCatalogTrack(raw) {
    if (!raw) return null;

    const id = String(raw.id || `track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    const title = String(raw.title || raw.name || 'Untitled Track').trim();
    const artist = String(raw.artist || raw.artist_name || (raw.user && raw.user.name) || 'Pulse Artist').trim();
    const album = String(raw.album || raw.album_name || 'Single').trim();

    let coverUrl = raw.cover || raw.coverUrl || raw.image || raw.album_image || null;
    if (raw.artwork) {
      coverUrl = raw.artwork['1000x1000'] || raw.artwork['480x480'] || raw.artwork['150x150'] || coverUrl;
    }
    if (coverUrl && (coverUrl.includes('150x150') || coverUrl.includes('50x50'))) {
      coverUrl = coverUrl.replace('150x150', '500x500').replace('50x50', '500x500');
    }
    if (!coverUrl || coverUrl === './pulse-logo.png' || coverUrl.trim() === '') {
      if (typeof window !== 'undefined' && typeof window.generateTrackCover === 'function') {
        coverUrl = window.generateTrackCover(title, artist, raw.category || 'music');
      } else {
        coverUrl = './pulse-logo.png';
      }
    }

    let dur = raw.duration || '3:30';
    if (typeof dur === 'number') {
      dur = formatSeconds(dur);
    }

    const streamUrl = raw.streamUrl || raw.audio || raw.audiodownload || raw.audioUrl || null;
    const previewUrl = raw.previewUrl || raw.preview || streamUrl || null;

    const category = (raw.category || 'pop').toLowerCase();
    const genre = raw.genre || raw.category || 'Pop';
    const source = raw.source || 'Pulse HD Audio Engine (320kbps)';
    const playCount = parseInt(raw.playCount || raw.play_count || raw.listens || 0, 10);

    const norm = {
      id,
      title,
      artist,
      album,
      cover: coverUrl,
      coverUrl,
      duration: dur,
      streamUrl,
      previewUrl,
      category,
      genre,
      source,
      playCount,
      language: raw.language || 'English'
    };

    // Index into global tracks registry
    if (typeof window !== 'undefined') {
      if (!window.TRACKS_REGISTRY) window.TRACKS_REGISTRY = {};
      window.TRACKS_REGISTRY[norm.id] = norm;
    }

    // Index into Artist Directory
    indexTrackToArtist(norm);

    return norm;
  }

  function indexTrackToArtist(track) {
    if (!track || !track.artist) return;
    const primaryArtist = track.artist.split(',')[0].split('&')[0].trim();
    const artistKey = primaryArtist.toLowerCase();

    if (!artistDirectory[artistKey]) {
      artistDirectory[artistKey] = {
        id: `artist-${artistKey.replace(/[^a-z0-9]/g, '-')}`,
        name: primaryArtist,
        avatar: track.cover,
        genres: new Set(),
        tracks: [],
        totalPlays: 0
      };
    }

    const entry = artistDirectory[artistKey];
    if (track.genre) entry.genres.add(track.genre);
    if (!entry.tracks.some(t => t.id === track.id)) {
      entry.tracks.push(track);
      entry.totalPlays += (track.playCount || 1000);
    }
  }

  // =========================================================================
  // 5. MULTI-CATEGORY API FETCHER (Audius & Jamendo)
  // =========================================================================
  async function fetchJamendoCategory(categoryConfig, limit = 20) {
    if (!categoryConfig.jamendoTags && !categoryConfig.jamendoOrder) return [];
    try {
      let url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&include=musicinfo+licenses`;
      if (categoryConfig.jamendoTags) {
        url += `&fuzzytags=${encodeURIComponent(categoryConfig.jamendoTags)}`;
      }
      if (categoryConfig.jamendoOrder) {
        url += `&order=${categoryConfig.jamendoOrder}`;
      } else {
        url += `&order=popularity_total`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const json = await res.json();
        if (json.results && Array.isArray(json.results)) {
          return json.results.map(t => normalizeCatalogTrack({
            id: `jamendo-${t.id}`,
            title: t.name,
            artist: t.artist_name,
            album: t.album_name || 'Jamendo Single',
            cover: t.album_image || t.image,
            duration: parseInt(t.duration, 10) || 210,
            streamUrl: t.audio || t.audiodownload,
            previewUrl: t.audio,
            category: categoryConfig.id,
            genre: (t.musicinfo && t.musicinfo.tags && t.musicinfo.tags.genres && t.musicinfo.tags.genres[0]) || categoryConfig.title,
            source: 'Jamendo Music (Creative Commons)',
            playCount: 15000 + Math.floor(Math.random() * 80000)
          }));
        }
      }
    } catch (e) {
      console.warn(`[Jamendo Category Fetch Notice (${categoryConfig.id})]:`, e.message);
    }
    return [];
  }

  async function fetchAudiusCategory(categoryConfig, limit = 20) {
    if (!categoryConfig.audiusGenre && !categoryConfig.audiusQuery && !categoryConfig.audiusTrending) return [];
    try {
      const node = await getAudiusNode();
      let url = '';
      if (categoryConfig.audiusTrending) {
        url = `${node}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=${limit}`;
      } else if (categoryConfig.audiusGenre) {
        url = `${node}/v1/tracks/trending?genre=${encodeURIComponent(categoryConfig.audiusGenre)}&app_name=${AUDIUS_APP_NAME}&limit=${limit}`;
      } else if (categoryConfig.audiusQuery) {
        url = `${node}/v1/tracks/search?query=${encodeURIComponent(categoryConfig.audiusQuery)}&app_name=${AUDIUS_APP_NAME}&limit=${limit}`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const json = await res.json();
        const rawList = json.data || [];
        if (Array.isArray(rawList)) {
          return rawList.map(t => {
            const artwork = t.artwork ? (t.artwork['1000x1000'] || t.artwork['480x480'] || t.artwork['150x150']) : null;
            return normalizeCatalogTrack({
              id: `audius-${t.id}`,
              title: t.title || 'Untitled',
              artist: (t.user && t.user.name) ? t.user.name : 'Audius Artist',
              album: t.release_date ? `Release ${t.release_date}` : 'Audius',
              cover: artwork,
              duration: Math.round(t.duration || 210),
              streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
              previewUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
              category: categoryConfig.id,
              genre: t.genre || categoryConfig.title,
              source: 'Audius Streaming (320kbps)',
              playCount: t.play_count || (10000 + Math.floor(Math.random() * 50000))
            });
          });
        }
      }
    } catch (e) {
      console.warn(`[Audius Category Fetch Notice (${categoryConfig.id})]:`, e.message);
    }
    return [];
  }

  // =========================================================================
  // 6. PUBLIC CATALOG API & INITIALIZATION
  // =========================================================================
  const catalogService = {
    CATEGORIES,

    /**
     * Synchronously load starter tracks and fetch dynamic categories asynchronously
     */
    async initCatalog() {
      // 1. Synchronously pre-populate starter tracks
      STARTER_TRACKS.forEach(t => {
        const norm = normalizeCatalogTrack(t);
        if (!categoryTracksCache[norm.category]) {
          categoryTracksCache[norm.category] = [];
        }
        if (!categoryTracksCache[norm.category].some(x => x.id === norm.id)) {
          categoryTracksCache[norm.category].push(norm);
        }
      });

      // Render home screen immediately with starter tracks
      if (typeof window !== 'undefined' && typeof window.renderCatalogUI === 'function') {
        window.renderCatalogUI();
      }

      // 2. Fetch all categories from Jamendo & Audius in parallel
      const fetchTasks = Object.values(CATEGORIES).map(async (cat) => {
        const [jamendoTracks, audiusTracks] = await Promise.all([
          fetchJamendoCategory(cat, 18),
          fetchAudiusCategory(cat, 18)
        ]);

        const combined = [...(categoryTracksCache[cat.id] || []), ...jamendoTracks, ...audiusTracks];
        // Deduplicate
        const seen = new Set();
        categoryTracksCache[cat.id] = combined.filter(t => {
          const k = `${t.title}-${t.artist}`.toLowerCase();
          if (seen.has(k) || seen.has(t.id)) return false;
          seen.add(k);
          seen.add(t.id);
          return true;
        });
      });

      await Promise.allSettled(fetchTasks);

      // Re-render with full remote catalog
      if (typeof window !== 'undefined' && typeof window.renderCatalogUI === 'function') {
        window.renderCatalogUI();
      }
    },

    getCategoryTracks(categoryId) {
      if (categoryId === 'all') {
        const allTracks = [];
        Object.values(categoryTracksCache).forEach(list => {
          list.forEach(t => {
            if (!allTracks.some(x => x.id === t.id)) allTracks.push(t);
          });
        });
        return allTracks;
      }
      return categoryTracksCache[categoryId] || [];
    },

    getAllCategories() {
      return Object.values(CATEGORIES);
    },

    getCategory(categoryId) {
      return CATEGORIES[categoryId] || null;
    },

    // --- ARTIST PROFILES & DIRECTORY ---
    getArtistProfile(artistName) {
      if (!artistName) return null;
      const cleanName = artistName.split(',')[0].split('&')[0].trim();
      const key = cleanName.toLowerCase();
      let profile = artistDirectory[key];

      if (!profile) {
        // Find any tracks matching artist
        const tracks = Object.values(window.TRACKS_REGISTRY || {}).filter(t => 
          t.artist && t.artist.toLowerCase().includes(key)
        );
        profile = {
          id: `artist-${key.replace(/[^a-z0-9]/g, '-')}`,
          name: cleanName,
          avatar: tracks.length > 0 ? tracks[0].cover : './pulse-logo.png',
          genres: new Set(tracks.map(t => t.genre || 'Music')),
          tracks: tracks,
          totalPlays: tracks.reduce((acc, t) => acc + (t.playCount || 1000), 0)
        };
      }

      // Sort popular tracks by play count descending
      const sortedTracks = [...profile.tracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));

      return {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar || './pulse-logo.png',
        genres: Array.from(profile.genres),
        trackCount: profile.tracks.length,
        totalPlays: profile.totalPlays,
        popularTracks: sortedTracks
      };
    },

    getAllArtists() {
      return Object.values(artistDirectory).map(a => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar,
        trackCount: a.tracks.length,
        genres: Array.from(a.genres)
      }));
    },

    // --- 30-SECOND SNIPPET PREVIEW ENGINE ---
    previewTrackSnippet(trackId, onStateChange = null) {
      const track = (window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]) ||
                    STARTER_TRACKS.find(t => t.id === trackId);
      if (!track) return false;

      // Toggle off if clicking the currently previewing track
      if (activePreviewTrackId === trackId && previewAudioElement && !previewAudioElement.paused) {
        this.stopSnippetPreview();
        if (typeof onStateChange === 'function') onStateChange({ isPreviewing: false, trackId });
        return false;
      }

      this.stopSnippetPreview();

      if (!previewAudioElement) {
        previewAudioElement = new Audio();
        previewAudioElement.id = 'pulse-snippet-preview-audio';
        previewAudioElement.volume = 0.8;
      }

      const streamUrl = track.previewUrl || track.streamUrl || track.audioUrl;
      if (!streamUrl) {
        if (typeof window.showToast === 'function') window.showToast('Preview stream not available for this track', 'warning', 3000);
        return false;
      }

      activePreviewTrackId = trackId;
      previewAudioElement.src = streamUrl;
      previewAudioElement.currentTime = 15; // Start 15s in for chorus/hook

      previewAudioElement.play().then(() => {
        if (typeof onStateChange === 'function') onStateChange({ isPreviewing: true, trackId });
        if (typeof window.showToast === 'function') {
          window.showToast(`🎶 30s Snippet Preview: "${track.title}"`, 'info', 3000);
        }

        // Auto stop after 30 seconds
        clearTimeout(previewTimeoutTimer);
        previewTimeoutTimer = setTimeout(() => {
          this.stopSnippetPreview();
          if (typeof onStateChange === 'function') onStateChange({ isPreviewing: false, trackId });
        }, 30000);
      }).catch(e => {
        console.warn('[Snippet Preview Notice]:', e);
        this.stopSnippetPreview();
      });

      return true;
    },

    stopSnippetPreview() {
      if (previewAudioElement) {
        try {
          previewAudioElement.pause();
          previewAudioElement.removeAttribute('src');
        } catch (e) {}
      }
      activePreviewTrackId = null;
      clearTimeout(previewTimeoutTimer);
      previewTimeoutTimer = null;
      document.querySelectorAll('.snippet-preview-ring').forEach(el => el.classList.remove('active'));
    },

    getActivePreviewTrackId() {
      return activePreviewTrackId;
    }
  };

  root.catalogService = catalogService;
  root.PulseCatalog = catalogService;
  root.normalizeCatalogTrack = normalizeCatalogTrack;

})(typeof window !== 'undefined' ? window : globalThis);
