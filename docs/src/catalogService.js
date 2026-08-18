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
  // 1. DYNAMIC CATEGORY & GENRE CONFIGURATION
  // =========================================================================
  const CATEGORIES = {
    'recommended': {
      id: 'recommended',
      title: 'Songs You Will Love',
      subtitle: 'Curated picks tailored to your musical taste & mood',
      icon: 'fa-wand-magic-sparkles',
      color: '#e879f9',
      jamendoTags: 'pop',
      audiusTrending: true
    },
    'nineties': {
      id: 'nineties',
      title: 'Top 90s Golden Hits & Nostalgia',
      subtitle: 'Timeless 90s Bollywood classics & iconic international anthems',
      icon: 'fa-record-vinyl',
      color: '#f59e0b',
      jamendoTags: 'retro',
      audiusQuery: '90s hits',
      saavnQuery: '90s Bollywood'
    },
    'hollywood': {
      id: 'hollywood',
      title: 'Top Hollywood Blockbuster Hits',
      subtitle: 'Legendary movie soundtracks, Billboard #1s & global pop anthems',
      icon: 'fa-clapperboard',
      color: '#38bdf8',
      jamendoTags: 'soundtrack',
      audiusQuery: 'movie soundtrack',
      itunesQuery: 'Hollywood Movie Hits'
    },
    'bollywood_evergreen': {
      id: 'bollywood_evergreen',
      title: 'Bollywood Evergreen & Modern Hits',
      subtitle: 'Soulful melodies, romantic chartbusters & cinematic blockbusters',
      icon: 'fa-compact-disc',
      color: '#ec4899',
      jamendoTags: 'indian',
      audiusQuery: 'Arijit Singh',
      saavnQuery: 'Bollywood Hits'
    },
    'punjabi_chartbusters': {
      id: 'punjabi_chartbusters',
      title: 'Punjabi Chartbusters & Desi Swag',
      subtitle: 'High-voltage Punjabi bangers, hip-hop & modern folk',
      icon: 'fa-guitar',
      color: '#eab308',
      jamendoTags: 'indian',
      audiusQuery: 'Diljit Dosanjh',
      saavnQuery: 'Punjabi Top Hits'
    },
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
    // Recommended / Songs You'll Like
    { id: 'rec-1', title: 'Starboy', artist: 'The Weeknd, Daft Punk', album: 'Starboy', duration: '3:50', category: 'recommended', genre: 'Pop', language: 'English', playCount: 1420000 },
    { id: 'rec-2', title: 'Kesariya', artist: 'Arijit Singh, Pritam', album: 'Brahmastra', duration: '4:28', category: 'recommended', genre: 'Bollywood', language: 'Hindi', playCount: 854000 },
    { id: 'rec-3', title: 'Lover', artist: 'Diljit Dosanjh', album: 'MoonChild Era', duration: '3:12', category: 'recommended', genre: 'Punjabi', language: 'Punjabi', playCount: 650000 },
    { id: 'rec-4', title: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover', duration: '2:58', category: 'recommended', genre: 'Pop', language: 'English', playCount: 1350000 },
    { id: 'rec-5', title: 'Midnight City Lights', artist: 'Chillhop Beats', album: 'Nightfall Session', duration: '2:45', category: 'recommended', genre: 'Lo-Fi', language: 'Instrumental', playCount: 320000 },
    { id: 'rec-6', title: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', duration: '3:24', category: 'recommended', genre: 'Rock', language: 'English', playCount: 1700000 },

    // Top 90s Golden Hits
    { id: '90s-1', title: 'Tujhe Dekha Toh', artist: 'Kumar Sanu, Lata Mangeshkar', album: 'Dilwale Dulhania Le Jayenge', duration: '5:02', category: 'nineties', genre: '90s Bollywood', language: 'Hindi', playCount: 1540000 },
    { id: '90s-2', title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', duration: '5:01', category: 'nineties', genre: '90s Grunge', language: 'English', playCount: 1890000 },
    { id: '90s-3', title: 'Chaiyya Chaiyya', artist: 'Sukhwinder Singh, Sapna Awasthi, A.R. Rahman', album: 'Dil Se', duration: '6:54', category: 'nineties', genre: '90s Bollywood', language: 'Hindi', playCount: 1250000 },
    { id: '90s-4', title: 'I Want It That Way', artist: 'Backstreet Boys', album: 'Millennium', duration: '3:33', category: 'nineties', genre: '90s Pop', language: 'English', playCount: 1650000 },
    { id: '90s-5', title: 'Pehla Nasha', artist: 'Udit Narayan, Sadhana Sargam', album: 'Jo Jeeta Wohi Sikandar', duration: '4:51', category: 'nineties', genre: '90s Bollywood', language: 'Hindi', playCount: 980000 },
    { id: '90s-6', title: 'Wonderwall', artist: 'Oasis', album: '(What\'s the Story) Morning Glory?', duration: '4:18', category: 'nineties', genre: '90s Britpop', language: 'English', playCount: 1420000 },
    { id: '90s-7', title: 'Chura Ke Dil Mera', artist: 'Kumar Sanu, Alka Yagnik', album: 'Main Khiladi Tu Anari', duration: '5:12', category: 'nineties', genre: '90s Bollywood', language: 'Hindi', playCount: 890000 },
    { id: '90s-8', title: 'My Heart Will Go On', artist: 'Celine Dion', album: 'Titanic Soundtrack', duration: '4:40', category: 'nineties', genre: '90s Pop', language: 'English', playCount: 1750000 },

    // Top Hollywood Blockbuster Hits
    { id: 'hwd-1', title: 'See You Again', artist: 'Wiz Khalifa, Charlie Puth', album: 'Furious 7 Soundtrack', duration: '3:49', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 2100000 },
    { id: 'hwd-2', title: 'Sunflower', artist: 'Post Malone, Swae Lee', album: 'Spider-Man: Into the Spider-Verse', duration: '2:38', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1950000 },
    { id: 'hwd-3', title: 'Skyfall', artist: 'Adele', album: '007 Skyfall Soundtrack', duration: '4:46', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1680000 },
    { id: 'hwd-4', title: 'Shallow', artist: 'Lady Gaga, Bradley Cooper', album: 'A Star Is Born', duration: '3:35', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1520000 },
    { id: 'hwd-5', title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack', duration: '5:26', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1890000 },
    { id: 'hwd-6', title: 'Let It Go', artist: 'Idina Menzel', album: 'Frozen Soundtrack', duration: '3:44', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1450000 },
    { id: 'hwd-7', title: 'Eye of the Tiger', artist: 'Survivor', album: 'Rocky III Soundtrack', duration: '4:04', category: 'hollywood', genre: 'Classic Rock', language: 'English', playCount: 1320000 },

    // Bollywood Evergreen & Modern Hits
    { id: 'bolly-1', title: 'Kesariya', artist: 'Arijit Singh, Pritam', album: 'Brahmastra', duration: '4:28', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 854000 },
    { id: 'bolly-2', title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', album: 'Bhediya', duration: '4:21', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 742000 },
    { id: 'bolly-3', title: 'Tum Se Hi', artist: 'Mohit Chauhan, Pritam', album: 'Jab We Met', duration: '5:21', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 680000 },
    { id: 'bolly-4', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao, Anirudh', album: 'Jawan', duration: '3:20', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 920000 },
    { id: 'bolly-5', title: 'Kal Ho Naa Ho', artist: 'Sonu Nigam, Shankar-Ehsaan-Loy', album: 'Kal Ho Naa Ho', duration: '5:21', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 1100000 },
    { id: 'bolly-6', title: 'Tum Hi Ho', artist: 'Arijit Singh, Mithoon', album: 'Aashiqui 2', duration: '4:22', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 1200000 },
    { id: 'bolly-7', title: 'Kabira', artist: 'Arijit Singh, Harshdeep Kaur, Pritam', album: 'Yeh Jawaani Hai Deewani', duration: '4:11', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 890000 },
    { id: 'bolly-8', title: 'Kun Faya Kun', artist: 'A.R. Rahman, Mohit Chauhan, Javed Ali', album: 'Rockstar', duration: '7:53', category: 'bollywood_evergreen', genre: 'Sufi / Bollywood', language: 'Hindi', playCount: 990000 },

    // Punjabi Chartbusters
    { id: 'pb-1', title: 'Lover', artist: 'Diljit Dosanjh', album: 'MoonChild Era', duration: '3:12', category: 'punjabi_chartbusters', genre: 'Punjabi Pop', language: 'Punjabi', playCount: 750000 },
    { id: 'pb-2', title: 'Softly', artist: 'Karan Aujla, Ikky', album: 'Making Memories', duration: '2:35', category: 'punjabi_chartbusters', genre: 'Punjabi', language: 'Punjabi', playCount: 840000 },
    { id: 'pb-3', title: 'Excuses', artist: 'AP Dhillon, Gurinder Gill', album: 'Excuses', duration: '2:56', category: 'punjabi_chartbusters', genre: 'Punjabi', language: 'Punjabi', playCount: 920000 },
    { id: 'pb-4', title: 'Brown Munde', artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon', album: 'Brown Munde', duration: '4:27', category: 'punjabi_chartbusters', genre: 'Punjabi Hip-Hop', language: 'Punjabi', playCount: 1450000 },
    { id: 'pb-5', title: '295', artist: 'Sidhu Moose Wala', album: 'Moosetape', duration: '4:30', category: 'punjabi_chartbusters', genre: 'Punjabi Rap', language: 'Punjabi', playCount: 1600000 },
    { id: 'pb-6', title: 'Born to Shine', artist: 'Diljit Dosanjh', album: 'G.O.A.T.', duration: '3:33', category: 'punjabi_chartbusters', genre: 'Punjabi Pop', language: 'Punjabi', playCount: 880000 },
    { id: 'pb-7', title: 'White Brown Black', artist: 'Karan Aujla, Avvy Sra', album: 'White Brown Black', duration: '3:00', category: 'punjabi_chartbusters', genre: 'Punjabi', language: 'Punjabi', playCount: 720000 },
    { id: 'pb-8', title: 'Mi Amor', artist: 'Sharn, 40k, The Paul', album: 'Mi Amor', duration: '3:24', category: 'punjabi_chartbusters', genre: 'Punjabi', language: 'Punjabi', playCount: 680000 },

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

  // Pre-seed all starter tracks immediately into categoryTracksCache and window.TRACKS_REGISTRY
  STARTER_TRACKS.forEach(t => {
    const norm = normalizeCatalogTrack(t);
    if (!categoryTracksCache[norm.category]) {
      categoryTracksCache[norm.category] = [];
    }
    if (!categoryTracksCache[norm.category].some(x => x.id === norm.id)) {
      categoryTracksCache[norm.category].push(norm);
    }
  });

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
        if (allTracks.length === 0) {
          STARTER_TRACKS.forEach(t => {
            const norm = normalizeCatalogTrack(t);
            if (!allTracks.some(x => x.id === norm.id)) allTracks.push(norm);
          });
        }
        return allTracks;
      }
      const list = categoryTracksCache[categoryId] || [];
      if (list.length === 0) {
        return STARTER_TRACKS.filter(t => t.category === categoryId).map(normalizeCatalogTrack);
      }
      return list;
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

    getFeaturedArtists() {
      return [
        { name: 'Arijit Singh', genre: 'Bollywood & Romantic', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '4.8M' },
        { name: 'The Weeknd', genre: 'Pop & R&B', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', listens: '5.2M' },
        { name: 'Diljit Dosanjh', genre: 'Punjabi & Pop', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '3.9M' },
        { name: 'Taylor Swift', genre: 'Pop & Country', avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80', listens: '6.1M' },
        { name: 'Ed Sheeran', genre: 'Acoustic & Pop', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80', listens: '4.4M' },
        { name: 'Karan Aujla', genre: 'Punjabi & Hip-Hop', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '2.8M' },
        { name: 'Dua Lipa', genre: 'Dance Pop & Disco', avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=80', listens: '3.7M' },
        { name: 'Alan Walker', genre: 'EDM & Electro', avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80', listens: '3.5M' },
        { name: 'Imagine Dragons', genre: 'Alternative Rock', avatar: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80', listens: '4.1M' },
        { name: 'Sidhu Moose Wala', genre: 'Punjabi Rap', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '4.6M' },
        { name: 'A.R. Rahman', genre: 'Film Score & World', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '5.0M' }
      ];
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
