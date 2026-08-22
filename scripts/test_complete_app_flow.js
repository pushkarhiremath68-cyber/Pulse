import fs from 'fs';

console.log('=== Pulse Music Complete App Flow Simulator ===');

// Lightweight Browser DOM Simulation
const elementStore = new Map();

function createElementMock(id, tagName = 'div') {
  const el = {
    id,
    tagName: tagName.toUpperCase(),
    children: [],
    style: {},
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      toggle(c, force) {
        if (force === true) { this._classes.add(c); return true; }
        if (force === false) { this._classes.delete(c); return false; }
        if (this._classes.has(c)) { this._classes.delete(c); return false; }
        this._classes.add(c); return true;
      },
      contains(c) { return this._classes.has(c); }
    },
    textContent: '',
    value: '',
    innerHTML_: '',
    set innerHTML(val) {
      this.innerHTML_ = val;
      // create fake children count by counting main tags
      const matches = val.match(/<div|<section|<button/g);
      this.children = matches ? matches.map((m, i) => ({ id: `${id}-child-${i}`, style: {}, textContent: '' })) : [];
    },
    get innerHTML() {
      return this.innerHTML_;
    },
    getAttribute(name) { return this[name] || ''; },
    setAttribute(name, val) { this[name] = val; },
    addEventListener(evt, handler) { this[`on${evt}`] = handler; },
    appendChild(child) { this.children.push(child); },
    remove() {},
    querySelector(sel) { return null; },
    querySelectorAll(sel) { return []; },
    closest(sel) { return null; },
    focus() {},
    scrollIntoView() {}
  };
  elementStore.set(id, el);
  return el;
}

// Setup common DOM elements
const requiredIds = [
  'home-quick-picks-container',
  'home-featured-artists-container',
  'home-curated-playlists-container',
  'dynamic-home-shelves',
  'language-shelves-container',
  'search-results-container',
  'search-query-label',
  'search-count',
  'global-search-input',
  'player-title',
  'player-artist',
  'player-thumb',
  'player-bar',
  'playbar-title',
  'playbar-artist',
  'playbar-cover',
  'playbar-play-btn',
  'playbar-current-time',
  'playbar-duration',
  'fullscreen-player',
  'fallback-audio-player',
  'pulse-toast-container',
  'lyrics-drawer-title',
  'lyrics-drawer-artist',
  'lyrics-drawer-content',
  'fs-lyrics-scroll-box',
  'view-home',
  'view-search-view',
  'view-library',
  'view-artist'
];

requiredIds.forEach(id => createElementMock(id));

const documentMock = {
  getElementById(id) {
    if (!elementStore.has(id)) {
      return createElementMock(id);
    }
    return elementStore.get(id);
  },
  querySelectorAll(selector) {
    return Array.from(elementStore.values());
  },
  createElement(tag) {
    return createElementMock(`mock-${Date.now()}-${Math.random()}`, tag);
  },
  addEventListener(evt, handler) {},
  body: {
    contains: () => false,
    appendChild: () => {},
    style: {}
  },
  readyState: 'complete'
};

const windowMock = {
  document: documentMock,
  navigator: {
    userAgent: 'Mozilla/5.0 NodeTest',
    mediaSession: {
      metadata: null,
      setActionHandler: () => {},
      playbackState: 'none',
      setPositionState: () => {}
    }
  },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  sessionStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  location: { origin: 'http://localhost:5173' },
  addEventListener: () => {},
  scrollTo: () => {},
  requestAnimationFrame: cb => setTimeout(cb, 16),
  cancelAnimationFrame: id => clearTimeout(id),
  MediaMetadata: class { constructor(opts) { Object.assign(this, opts); } }
};

globalThis.window = windowMock;
globalThis.document = documentMock;
globalThis.navigator = windowMock.navigator;
globalThis.localStorage = windowMock.localStorage;
globalThis.sessionStorage = windowMock.sessionStorage;
globalThis.MediaMetadata = windowMock.MediaMetadata;

async function runTests() {
  console.log('1. Importing application services...');
  await import('../src/main.js');

  console.log('\n2. Testing Home Screen Catalog Rendering:');
  window.renderHomeDiscovery();

  const qp = documentMock.getElementById('home-quick-picks-container');
  const artists = documentMock.getElementById('home-featured-artists-container');
  const playlists = documentMock.getElementById('home-curated-playlists-container');
  const shelves = documentMock.getElementById('dynamic-home-shelves');
  const langs = documentMock.getElementById('language-shelves-container');

  console.log(`- Quick Picks populated: ${qp.innerHTML.length > 50 ? 'PASS' : 'FAIL'} (${qp.innerHTML.length} chars)`);
  console.log(`- Featured Artists populated: ${artists.innerHTML.length > 50 ? 'PASS' : 'FAIL'} (${artists.innerHTML.length} chars)`);
  console.log(`- Curated Playlists populated: ${playlists.innerHTML.length > 50 ? 'PASS' : 'FAIL'} (${playlists.innerHTML.length} chars)`);
  console.log(`- Genre Shelves populated: ${shelves.innerHTML.length > 50 ? 'PASS' : 'FAIL'} (${shelves.innerHTML.length} chars)`);
  console.log(`- Language Shelves populated: ${langs.innerHTML.length > 50 ? 'PASS' : 'FAIL'} (${langs.innerHTML.length} chars)`);

  console.log('\n3. Testing Quick Pick Click Playback:');
  const firstTrack = window.__quickPicks[0];
  console.log(`- Clicking Quick Pick track: "${firstTrack.title}" by "${firstTrack.artist}" (ytId: ${firstTrack.ytId})`);
  window.playTrackDirect(firstTrack, window.__quickPicks);

  console.log(`- Current active track: "${window.pulseState.currentTrack?.title}"`);
  console.log(`- Playback state: isPlaying=${window.pulseState.isPlaying}`);

  console.log('\n4. Testing Live Search APIs:');
  const searchQueries = ['Kesariya', 'Blinding Lights', 'Singara Siriye'];
  for (const q of searchQueries) {
    const res = await window.musicService.searchTracks(q, 10);
    console.log(`- Search "${q}": found ${res.length} songs`);
    if (res.length > 0) {
      console.log(`  Top hit: "${res[0].title}" by "${res[0].artist}" (id: ${res[0].id}, stream: ${res[0].streamUrl ? 'direct' : 'requires-resolution'})`);
    }
  }

  console.log('\n5. Testing Real Stream Resolution for Tracks:');
  const testTracks = [
    { title: 'Kesariya', artist: 'Arijit Singh', ytId: 'BddP6PYo2gs' },
    { title: 'Blinding Lights', artist: 'The Weeknd', ytId: '4NRXx6U8ABQ' },
    { title: 'Shape of You', artist: 'Ed Sheeran', ytId: 'JGwWNGJdvx8' }
  ];

  for (const track of testTracks) {
    const stream = await window.musicService.resolveFullAudioStream(track);
    console.log(`- Stream for "${track.title}":`, stream ? `RESOLVED via ${stream.source}` : 'FAILED');
    if (stream && stream.streamUrl) {
      console.log(`  URL preview: ${stream.streamUrl.substring(0, 70)}...`);
    }
  }

  console.log('\n=== Simulation Completed Successfully ===');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
});
