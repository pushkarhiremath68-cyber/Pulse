/**
 * Deep Exhaustive Verification of All Features in Pulse Music App
 */
const path = require('path');

// Setup Node Browser Mocks
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}
if (typeof globalThis.sessionStorage === 'undefined') {
  const store = new Map();
  globalThis.sessionStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
    platform: 'Win32',
    clipboard: {
      writeText: async (text) => text
    },
    mediaSession: {
      metadata: null,
      setActionHandler: () => {},
      playbackState: 'none',
      setPositionState: () => {}
    }
  };
}

let passes = 0;
let fails = 0;
const failureMessages = [];

function test(name, fn) {
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      return res.then(() => {
        passes++;
        console.log(`  [PASS] ${name}`);
      }).catch(err => {
        fails++;
        console.error(`  [FAIL] ${name}:`, err.message);
        failureMessages.push(`${name}: ${err.message}`);
      });
    } else {
      passes++;
      console.log(`  [PASS] ${name}`);
      return Promise.resolve();
    }
  } catch (err) {
    fails++;
    console.error(`  [FAIL] ${name}:`, err.message);
    failureMessages.push(`${name}: ${err.message}`);
    return Promise.resolve();
  }
}

async function run() {
  console.log('======================================================================');
  console.log('      PULSE MUSIC - COMPREHENSIVE END-TO-END FEATURE VERIFICATION     ');
  console.log('======================================================================\n');

  // Load modules
  const catalog = await import('../src/catalogService.js');
  const music = await import('../src/musicService.js');
  const lyrics = await import('../src/lyricsService.js');
  const firestore = await import('../src/firestoreService.js');
  const gemini = await import('../src/geminiService.js');
  const download = await import('../src/downloadService.js');
  const playbar = (await import('../src/playbarController.js')).default;
  const security = await import('../src/security.js');

  console.log('--- 1. CATALOG & PLAYLIST SHELVES ---');
  await test('Hero slides exist with valid streams/ytIds', () => {
    const slides = catalog.getHeroSlides();
    if (!slides || slides.length < 5) throw new Error('Too few hero slides');
    slides.forEach((s, i) => {
      if (!s.title || (!s.streamUrl && !s.ytId && !s.videoYtId)) {
        throw new Error(`Hero slide #${i+1} (${s.title}) missing playable audio source`);
      }
    });
  });

  await test('Quick picks shelf contains playable tracks', () => {
    const qp = catalog.getQuickPicks();
    if (!qp || qp.length < 6) throw new Error('Quick picks shelf incomplete');
    qp.forEach(t => {
      if (!t.title || !t.artist || (!t.streamUrl && !t.ytId)) {
        throw new Error(`Track ${t.title} missing stream/ytId`);
      }
    });
  });

  await test('Featured artists list has bios and top tracks', () => {
    const artists = catalog.getFeaturedArtists();
    if (!artists || artists.length < 10) throw new Error('Featured artists count too low');
    const arijit = catalog.getArtistDetails('arijit-singh');
    if (!arijit || !arijit.topTracks || arijit.topTracks.length === 0) {
      throw new Error('Arijit Singh details missing top tracks');
    }
  });

  await test('Curated, Movie & Vibe playlists are populated', () => {
    const curated = catalog.getCuratedPlaylists();
    const movies = catalog.getMoviePlaylists();
    const vibes = catalog.getVibePlaylists();
    if (!curated.length || !movies.length || !vibes.length) {
      throw new Error('Missing playlist categories');
    }
  });

  console.log('\n--- 2. LIVE LISTENING PARTY & SESSION SYNC ---');
  let testSessionId = null;
  const sampleTrack = {
    id: 'ytm-test-123',
    ytId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg'
  };

  await test('Host creates live listening party session', async () => {
    testSessionId = await firestore.createSession(sampleTrack, 'host-test-user-42');
    if (!testSessionId || !testSessionId.startsWith('party-')) {
      throw new Error('Invalid session ID returned');
    }
    const cached = localStorage.getItem(`pulse_session_${testSessionId}`);
    if (!cached) throw new Error('Session not cached in localStorage');
  });

  await test('Host updates session state (track, time, play status)', async () => {
    await firestore.updateSessionState(testSessionId, {
      track: sampleTrack,
      isPlaying: true,
      currentTime: 120.5
    });
    const cached = JSON.parse(localStorage.getItem(`pulse_session_${testSessionId}`));
    if (!cached || !cached.state || cached.state.currentTime !== 120.5) {
      throw new Error('Local session state update failed');
    }
  });

  await test('Guest listener joins party session and receives callback', () => {
    let received = null;
    const unsub = firestore.joinSession(testSessionId, (data) => {
      received = data;
    });
    if (typeof unsub !== 'function') throw new Error('joinSession did not return unsubscribe fn');
    unsub();
  });

  await test('Host leaves party session and cleans up local state', () => {
    firestore.leaveSession(testSessionId);
    if (localStorage.getItem(`pulse_session_${testSessionId}`) !== null) {
      throw new Error('Session state not cleaned up from localStorage');
    }
  });

  console.log('\n--- 3. DEEP LINKING & PLAYLIST SHARING ---');
  let generatedShareUrl = '';
  await test('Generate resilient track share link', () => {
    generatedShareUrl = firestore.generateTrackShareUrl(sampleTrack);
    if (!generatedShareUrl || !generatedShareUrl.includes('track=')) {
      throw new Error('Invalid track share URL format');
    }
  });

  await test('Parse track share link back to track object', () => {
    const decoded = firestore.parseTrackShareUrl(generatedShareUrl);
    if (!decoded || decoded.title !== sampleTrack.title || decoded.ytId !== sampleTrack.ytId) {
      throw new Error('Decoded track mismatch');
    }
  });

  let publishedPlaylistRes = null;
  await test('Publish shared playlist and generate cloud share link', async () => {
    publishedPlaylistRes = await firestore.publishSharedPlaylist({
      id: 'pl-deep-test',
      name: 'Midnight Vibes',
      description: 'Late night chill',
      tracks: [sampleTrack]
    });
    if (!publishedPlaylistRes || !publishedPlaylistRes.shareUrl) {
      throw new Error('Failed to generate shared playlist URL');
    }
  });

  await test('Import shared playlist by ID or object', async () => {
    const shareId = publishedPlaylistRes.playlist.id;
    const imported = await firestore.importSharedPlaylist(shareId);
    if (!imported || imported.name !== 'Midnight Vibes' || imported.tracks.length !== 1) {
      throw new Error('Imported playlist mismatch');
    }
  });

  console.log('\n--- 4. FAVORITES & CUSTOM PLAYLISTS ---');
  await test('Add track to favorites', async () => {
    const res = await firestore.addFavorite(sampleTrack);
    if (!res) throw new Error('addFavorite returned false');
    if (!firestore.isFavorite(sampleTrack.id)) throw new Error('isFavorite is false');
  });

  await test('Retrieve favorites list', async () => {
    const favs = await firestore.getFavorites();
    if (!favs || !favs.some(t => t.id === sampleTrack.id)) {
      throw new Error('Favorites list does not contain added track');
    }
  });

  await test('Remove track from favorites', async () => {
    await firestore.removeFavorite(sampleTrack.id);
    if (firestore.isFavorite(sampleTrack.id)) {
      throw new Error('Track still marked as favorite');
    }
  });

  let customPlId = '';
  await test('Create custom playlist and add tracks', async () => {
    const pl = await firestore.createPlaylist('My Roadtrip');
    if (!pl || !pl.id) throw new Error('Failed to create playlist');
    customPlId = pl.id;
    await firestore.addTrackToPlaylist(customPlId, sampleTrack);
    const playlists = await firestore.getPlaylists();
    const found = playlists.find(p => p.id === customPlId);
    if (!found || found.tracks.length !== 1) throw new Error('Track not added to playlist');
  });

  await test('Remove track and delete custom playlist', async () => {
    await firestore.removeTrackFromPlaylist(customPlId, sampleTrack.id);
    await firestore.deletePlaylist(customPlId);
    const playlists = await firestore.getPlaylists();
    if (playlists.some(p => p.id === customPlId)) throw new Error('Playlist was not deleted');
  });

  console.log('\n--- 5. REAL-TIME SYNCHRONIZED LYRICS ---');
  await test('Parse synchronized LRC timestamps and unescaped lyrics', () => {
    const sampleLrc = `[00:10.50]Hello world\n[00:15.20]I'm feeling good & fine\n[00:20.00]Karaoke end`;
    const parsed = lyrics.parseLrc(sampleLrc);
    if (!parsed || parsed.length !== 3) throw new Error('Failed to parse 3 lines');
    if (parsed[1].text !== "I'm feeling good & fine") {
      throw new Error(`Unexpected line text: ${parsed[1].text}`);
    }
    const idx = lyrics.getActiveLineIndex(parsed, 16.0);
    if (idx !== 1) throw new Error(`Active line index expected 1, got ${idx}`);
  });

  await test('Fetch lyrics for top song from LRCLIB registry', async () => {
    const lrcData = await lyrics.getLyrics({ title: 'Blinding Lights', artist: 'The Weeknd' });
    if (!lrcData || !lrcData.lines || lrcData.lines.length === 0) {
      throw new Error('No lyrics returned for Blinding Lights');
    }
    if (!lrcData.isSynced) throw new Error('Lyrics should be synchronized');
  });

  console.log('\n--- 6. GEMINI AI DJ / PULSE AI ---');
  await test('Disambiguate fuzzy query via smart knowledge base', () => {
    const matches = gemini.disambiguateQuery('gulabi aankhen');
    if (!matches || matches.length === 0 || !matches.some(m => m.toLowerCase().includes('gulabi'))) {
      throw new Error('Smart knowledge base failed to match gulabi aankhen');
    }
  });

  await test('Ask Pulse AI DJ for mood recommendations (curated fallback & intelligence)', async () => {
    const djRes = await gemini.askGeminiDJ('romantic bollywood melodies');
    if (!djRes || !djRes.tracks || djRes.tracks.length < 4) {
      throw new Error('AI DJ did not return playlist tracks');
    }
    if (!djRes.djTitle || !djRes.vibe) {
      throw new Error('AI DJ response missing title or vibe');
    }
  });

  console.log('\n--- 7. PLAYBAR & CONTROLLERS ---');
  await test('Playbar controller basic state methods', () => {
    if (typeof playbar.togglePlay !== 'function') throw new Error('togglePlay missing');
    if (typeof playbar.playNext !== 'function') throw new Error('playNext missing');
    if (typeof playbar.playPrevious !== 'function') throw new Error('playPrevious missing');
    if (typeof playbar.seekTo !== 'function') throw new Error('seekTo missing');
    if (typeof playbar.setVolume !== 'function') throw new Error('setVolume missing');
    if (typeof playbar.toggleMute !== 'function') throw new Error('toggleMute missing');
    if (typeof playbar.toggleShuffle !== 'function') throw new Error('toggleShuffle missing');
    if (typeof playbar.toggleRepeat !== 'function') throw new Error('toggleRepeat missing');
    if (typeof playbar.queueTrackNext !== 'function') throw new Error('queueTrackNext missing');
    if (typeof playbar.addTrackToQueueEnd !== 'function') throw new Error('addTrackToQueueEnd missing');
  });

  console.log('\n--- 8. UNIVERSAL DOWNLOAD SERVICE ---');
  await test('Detect user platform accurately', () => {
    const plat = download.detectUserPlatform();
    if (!plat) throw new Error('No platform detected');
  });

  console.log('\n--- 9. SECURITY & SANITIZATION ---');
  await test('Sanitize dangerous inputs, urls, and html', () => {
    const escaped = security.escapeHtml('<script>alert("xss")</script>');
    if (escaped.includes('<script>')) throw new Error('Script tag was not escaped');
    const safeUrl = security.sanitizeUrl('javascript:alert(1)');
    if (safeUrl !== 'about:blank') throw new Error('javascript: protocol was not blocked');
  });

  console.log('\n======================================================================');
  console.log(`TOTAL AUDIT: ${passes} PASSED, ${fails} FAILED`);
  console.log('======================================================================');

  process.exit(fails === 0 ? 0 : 1);
}

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
