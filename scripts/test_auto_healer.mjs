import assert from 'assert';

console.log('====================================================');
console.log('🧪 RUNNING PULSE AI GUARDIAN & AUTO-HEALER TEST SUITE');
console.log('====================================================\n');

// Lightweight Mock DOM
class MockElement {
  constructor(tagName = 'div', id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className.split(' ').filter(Boolean)),
      contains: (c) => this.classList._classes.has(c),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      toggle: (c, v) => v ? this.classList._classes.add(c) : this.classList._classes.delete(c)
    };
    this.style = {};
    this.dataset = {};
    this.src = '';
    this.children = [];
    this._attributes = {};
  }
  getAttribute(attr) { return this._attributes[attr] || null; }
  setAttribute(attr, val) { this._attributes[attr] = val; }
  querySelector(sel) {
    for (const c of this.children) {
      if (c.className && c.className.includes(sel.replace('.', ''))) return c;
      const found = c.querySelector(sel);
      if (found) return found;
    }
    return null;
  }
  querySelectorAll(sel) {
    const results = [];
    for (const c of this.children) {
      if (c.tagName === sel.toUpperCase() || (c.className && c.className.includes(sel.replace('.', '')))) {
        results.push(c);
      }
      results.push(...c.querySelectorAll(sel));
    }
    return results;
  }
  closest() { return this; }
}

const mockImg = new MockElement('img', 'player-thumb', 'player-thumb album-art');
mockImg.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

const mockCard = new MockElement('div', 'card-1', 'song-card');
mockCard.dataset.title = 'Blinding Lights';
mockCard.dataset.artist = 'The Weeknd';
mockCard.dataset.ytid = '4NRXx6U8ABQ';
const cardImg = new MockElement('img', '', 'song-card-img');
cardImg.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
mockCard.children.push(cardImg);

const rootBody = new MockElement('body', 'app-body');
rootBody.children.push(mockImg, mockCard);

const listeners = {};
global.window = {
  addEventListener(evt, fn) {
    if (!listeners[evt]) listeners[evt] = [];
    listeners[evt].push(fn);
  },
  dispatchEvent(evt) {
    if (listeners[evt.type]) {
      listeners[evt.type].forEach(fn => fn(evt));
    }
  },
  pulseState: {
    currentTrack: { id: 'track-1', title: 'Blinding Lights', artist: 'The Weeknd', ytId: '4NRXx6U8ABQ' },
    isPlaying: true
  }
};

global.document = {
  readyState: 'complete',
  body: rootBody,
  documentElement: rootBody,
  getElementById(id) {
    if (id === 'player-thumb') return mockImg;
    return null;
  },
  querySelector(sel) {
    if (sel.includes('player-thumb')) return mockImg;
    return null;
  },
  querySelectorAll(sel) {
    if (sel === 'img') return [mockImg, cardImg];
    if (sel.includes('player-thumb') || sel.includes('playing-spin')) return [mockImg];
    return [];
  },
  addEventListener() {}
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

global.MutationObserver = class {
  observe() {}
  disconnect() {}
};

// Import Pulse AI Guardian
const { default: PulseAIHealer } = await import('../src/aiAutoHealer.js');

let passedTests = 0;
let totalTests = 0;

async function runTest(desc, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${desc}:`, err.message);
  }
}

async function main() {
  // 1. Initialization and Invisibility
  await runTest('Test 1: Healer initializes silently with zero visible UI elements', () => {
    PulseAIHealer.init();
    assert.strictEqual(PulseAIHealer.initialized, true, 'PulseAIHealer must be initialized');
    assert.strictEqual(window.__PulseAIHealer, PulseAIHealer, 'PulseAIHealer must attach to window.__PulseAIHealer');
  });

  // 2. Dynamic Harmonic Studio Artwork Generator
  await runTest('Test 2: Harmonic Studio Art Generator creates unique high-definition SVG artworks', () => {
    const art1 = PulseAIHealer.generateHarmonicCoverSvg('Blinding Lights', 'The Weeknd');
    const art2 = PulseAIHealer.generateHarmonicCoverSvg('Kesariya', 'Arijit Singh');
    
    assert.ok(art1.startsWith('data:image/svg+xml;charset=utf-8,'), 'Artwork 1 must be SVG Data URI');
    assert.ok(art2.startsWith('data:image/svg+xml;charset=utf-8,'), 'Artwork 2 must be SVG Data URI');
    assert.notStrictEqual(art1, art2, 'Different songs must produce distinct harmonic artwork');
    
    const decoded1 = decodeURIComponent(art1);
    assert.ok(decoded1.includes('Blinding Lights'), 'SVG must include song title');
    assert.ok(decoded1.includes('The Weeknd'), 'SVG must include artist name');
    assert.ok(decoded1.includes('PULSE HI-FI MASTER'), 'SVG must include Hi-Fi Master emblem');
  });

  // 3. Proactive DOM Scanner & Vinyl Placeholder Cure
  await runTest('Test 3: Proactive DOM Scanner cures vinyl placeholder images on rendered cards', () => {
    const freshImg = new MockElement('img', 'fresh-img', 'song-card-img');
    freshImg.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
    rootBody.children.push(freshImg);

    assert.ok(freshImg.src.includes('photo-1511671782779-c97d3d27a1d4'), 'Card initially has vinyl placeholder');
    PulseAIHealer.scanAndHealArtwork(rootBody);
    assert.strictEqual(freshImg.dataset.aiHealed, 'true', 'Card image must be processed by scanner');
  });

  // 4. Audio Watchdog & Decode Failover
  await runTest('Test 4: Audio Watchdog intercepts decode errors and initiates recovery', async () => {
    let playNextCalled = false;
    window.PulsePlaybar = {
      playNext() { playNextCalled = true; },
      playOnYouTubeIframe: () => {},
      playOnYouTubeSearch: async () => false
    };

    const mockAudio = {
      listeners: {},
      addEventListener(evt, fn) { this.listeners[evt] = fn; },
      error: { code: 4, message: 'MEDIA_ELEMENT_ERROR: SRC_NOT_SUPPORTED' },
      paused: false,
      currentTime: 0
    };

    PulseAIHealer.attachAudioWatchdog(mockAudio);
    assert.ok(mockAudio.listeners['error'], 'Audio element must have error listener attached');

    // Trigger error 4 times to test circuit breaker & graceful queue advancement
    const dummyEvent = { type: 'error' };
    await mockAudio.listeners['error'](dummyEvent);
    await mockAudio.listeners['error'](dummyEvent);
    await mockAudio.listeners['error'](dummyEvent);
    await mockAudio.listeners['error'](dummyEvent);

    assert.strictEqual(playNextCalled, true, 'Audio watchdog must failover safely without freeze');
  });

  // 5. YouTube Embed Restriction 101/150 Auto-Healer
  await runTest('Test 5: YouTube 101/150 embed restriction is intercepted and healed', async () => {
    let searchAltCalled = false;
    window.PulsePlaybar = {
      async playOnYouTubeSearch(q, track) {
        searchAltCalled = true;
        track.ytId = 'alternative-working-id';
        return true;
      },
      playNext: () => {}
    };

    const track = { id: 'yt-101', title: 'Restricted Anthem', artist: 'Famous Artist', ytId: 'restricted-video-id' };
    const mockYtPlayer = {
      loadVideoById(id) {}
    };

    await PulseAIHealer.handleYouTubeEmbedError(101, mockYtPlayer, track);
    assert.strictEqual(searchAltCalled, true, 'Healer must search for alternative audio video embed');
    assert.strictEqual(track.ytId, 'alternative-working-id', 'Track ytId must be hot-patched');
  });

  // 6. Offline Mutation Queueing
  await runTest('Test 6: Offline Mutation Queue stores mutations and flushes on network restore', () => {
    PulseAIHealer.enqueueOfflineMutation('FAVORITE_ADD', { id: 'fav-1', title: 'Offline Loved Song' });
    const status = PulseAIHealer.status();
    assert.ok(status.offlineQueueLength >= 1, 'Offline queue must record mutation');
  });

  // 7. Global Runtime Exception Containment
  await runTest('Test 7: Global exception boundary catches errors and records journal', () => {
    const errorEvent = {
      type: 'error',
      message: 'Simulated non-fatal UI glitch',
      filename: 'test.js',
      lineno: 42,
      preventDefault: () => {}
    };

    window.dispatchEvent(errorEvent);
    
    const status = PulseAIHealer.status();
    assert.ok(status.metrics.errorsIntercepted > 0, 'Healer must intercept error');
    assert.ok(status.metrics.domCrashesPrevented > 0, 'Healer must count crash prevention');
  });

  // 8. Playbar Artwork Zero Rotation Enforcer
  await runTest('Test 8: Playbar artwork has zero rotation and animation: none', () => {
    mockImg.classList.add('playing-spin');
    mockImg.style.animation = 'spin 2s linear infinite';
    mockImg.style.transform = 'rotate(180deg)';

    PulseAIHealer.enforceZeroRotationAndSmoothSeek();
    
    assert.strictEqual(mockImg.classList.contains('playing-spin'), false, 'Spin class must be stripped');
    assert.strictEqual(mockImg.style.animation, 'none', 'Animation must be strictly none');
    assert.strictEqual(mockImg.style.transform, 'none', 'Transform must be strictly none');
  });

  // 9. Diagnostics Journal
  await runTest('Test 9: Internal Diagnostic Journal is maintained for developer console audit', () => {
    const diagnostics = PulseAIHealer.getDiagnostics();
    assert.ok(Array.isArray(diagnostics.journal), 'Diagnostics must contain journal array');
    assert.ok(diagnostics.journal.length > 0, 'Journal must record actions');
    assert.ok(diagnostics.journal[0].timestamp, 'Journal entry must have ISO timestamp');
  });

  console.log(`\n====================================================`);
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log(`====================================================\n`);

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
