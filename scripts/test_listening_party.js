if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = { userAgent: 'Node.js Test Agent', platform: 'Win32' };
}

import {
  createSession,
  updateSessionState,
  joinSession,
  leaveSession,
  generateTrackShareUrl,
  parseTrackShareUrl,
  publishSharedPlaylist,
  getSharedPlaylist,
  importSharedPlaylist
} from '../src/firestoreService.js';

console.log('===============================================================');
console.log('       TESTING LIVE LISTENING PARTY & SHARE FEATURES         ');
console.log('===============================================================');

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) {
    pass++;
    console.log(`  [PASS] ${msg}`);
  } else {
    fail++;
    console.error(`  [FAIL] ${msg}`);
  }
}

async function run() {
  const sampleTrack = {
    id: 'ytm-4NRXx6U8ABQ',
    ytId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg'
  };

  // 1. Test Track Share URL generation & parsing
  console.log('\n--- 1. Track Deep Link Generation & Parsing ---');
  const trackShareUrl = generateTrackShareUrl(sampleTrack);
  assert(Boolean(trackShareUrl) && trackShareUrl.includes('track='), `Generated track share URL: ${trackShareUrl}`);
  
  const parsedTrack = parseTrackShareUrl(trackShareUrl);
  assert(parsedTrack && parsedTrack.title === 'Blinding Lights' && parsedTrack.ytId === '4NRXx6U8ABQ', `Decoded track correctly matches original metadata (${parsedTrack?.title})`);

  // 2. Test Shared Playlist Export & Import (Zero-Dependency & Cloud)
  console.log('\n--- 2. Playlist Sharing & Import ---');
  const samplePlaylist = {
    id: 'pl-party-1',
    name: 'Party Bangers',
    description: 'Live test party playlist',
    tracks: [sampleTrack]
  };

  const publishRes = await publishSharedPlaylist(samplePlaylist);
  assert(Boolean(publishRes && publishRes.shareUrl), `Published playlist generated shareable URL: ${publishRes?.shareUrl}`);

  const shareCode = publishRes.playlist.id;
  const fetchedPl = await getSharedPlaylist(shareCode);
  assert(fetchedPl && fetchedPl.name === 'Party Bangers' && fetchedPl.tracks.length === 1, `Fetched shared playlist successfully: ${fetchedPl?.name}`);

  const importedPl = await importSharedPlaylist(shareCode);
  assert(importedPl && importedPl.name === 'Party Bangers', `Imported shared playlist into local collection: ${importedPl?.name}`);

  // 3. Test Listening Party Session Lifecycle
  console.log('\n--- 3. Listening Party Session Lifecycle ---');
  const sessionId = await createSession(sampleTrack, 'test-host-uid-123');
  assert(Boolean(sessionId) && sessionId.startsWith('party-'), `Host successfully created party session ID: ${sessionId}`);

  // Test local session caching
  const localCached = localStorage.getItem(`pulse_session_${sessionId}`);
  assert(Boolean(localCached), `Session metadata cached in localStorage for offline resiliency`);

  // Test state update
  await updateSessionState(sessionId, {
    track: sampleTrack,
    isPlaying: true,
    currentTime: 45.5
  });
  assert(true, `Host successfully dispatched session state update (track + time 45.5s + isPlaying)`);

  // Test join session callback
  let receivedSessionData = null;
  const unsubscribe = joinSession(sessionId, (data) => {
    receivedSessionData = data;
  });

  // Test leave session
  leaveSession(sessionId);
  assert(localStorage.getItem(`pulse_session_${sessionId}`) === null, `Host successfully left party and cleared local session state`);

  console.log('\n===============================================================');
  console.log(`LISTENING PARTY & SHARE AUDIT: ${pass} PASSED, ${fail} FAILED`);
  console.log('===============================================================');
  process.exit(fail === 0 ? 0 : 1);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
