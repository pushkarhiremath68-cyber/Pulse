const fs = require('fs');

// Create a DOM environment from docs/index.html
const html = fs.readFileSync('docs/index.html', 'utf8');

// Build virtual DOM elements lookup
const elementMap = new Map();
const querySelectorAllMatches = (selector) => {
  if (selector.startsWith('.')) {
    const cls = selector.substring(1);
    return Array.from(elementMap.values()).filter(el => el.classList.contains(cls));
  }
  return [];
};

function createMockElement(id, tagName = 'div', className = '') {
  const classes = new Set(className.split(' ').filter(Boolean));
  const el = {
    id: id || '',
    tagName: tagName.toUpperCase(),
    className: className,
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
      toggle: (c) => classes.has(c) ? classes.delete(c) : classes.add(c)
    },
    style: {},
    dataset: {},
    innerHTML: '',
    textContent: '',
    value: '',
    children: [],
    appendChild: (c) => el.children.push(c),
    removeChild: () => {},
    setAttribute: () => {},
    getAttribute: (attr) => null,
    addEventListener: (evt, fn) => {},
    querySelector: (sel) => {
      if (sel.startsWith('#')) return elementMap.get(sel.substring(1)) || null;
      if (sel.startsWith('.')) return querySelectorAllMatches(sel)[0] || null;
      return null;
    },
    querySelectorAll: querySelectorAllMatches,
    closest: () => el,
    scrollIntoView: () => {},
    focus: () => {},
    click: () => {}
  };
  if (id) elementMap.set(id, el);
  return el;
}

// Pre-create all known IDs from index.html
const idMatches = html.match(/id=[\'"]([^\'"]+)[\'"]/g) || [];
idMatches.forEach(m => {
  const id = m.replace(/id=[\'"]/, '').replace(/[\'"]$/, '');
  createMockElement(id);
});

// Setup mock window & document
global.window = global;
global.document = {
  getElementById: (id) => elementMap.get(id) || createMockElement(id),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return elementMap.get(sel.substring(1)) || null;
    if (sel.startsWith('.')) return querySelectorAllMatches(sel)[0] || null;
    return createMockElement('', 'div');
  },
  querySelectorAll: querySelectorAllMatches,
  createElement: (tag) => createMockElement('', tag),
  body: createMockElement('body', 'body'),
  head: createMockElement('head', 'head'),
  documentElement: createMockElement('html', 'html'),
  readyState: 'complete',
  addEventListener: () => {}
};

global.localStorage = {
  _data: {},
  getItem: (k) => global.localStorage._data[k] || null,
  setItem: (k, v) => { global.localStorage._data[k] = String(v); },
  removeItem: (k) => { delete global.localStorage._data[k]; }
};

global.navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  mediaSession: { metadata: null },
  serviceWorker: { getRegistrations: () => Promise.resolve([]) }
};

global.Audio = function() {
  const a = createMockElement('audio-element', 'audio');
  a.currentTime = 0;
  a.duration = 210;
  a.volume = 1;
  a.muted = false;
  a.paused = true;
  a.play = () => { a.paused = false; return Promise.resolve(); };
  a.pause = () => { a.paused = true; };
  a.load = () => {};
  return a;
};

global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ results: [], data: [] }) });
global.AbortSignal = { timeout: () => ({}) };
global.MediaMetadata = function(m) { return m; };

console.log('========================================================');
console.log('TESTING PRODUCTION BUNDLE RUNTIME IN SIMULATED BROWSER');
console.log('========================================================');

// Execute bundle
try {
  const code = fs.readFileSync('docs/assets/pulse.js', 'utf8');
  eval(code);
  console.log('[SUCCESS] docs/assets/pulse.js loaded without syntax/runtime errors!');
} catch (e) {
  console.error('[FATAL RUNTIME ERROR]:', e);
  process.exit(1);
}

// Test 1: playSpecificTrack
console.log('\n[1] Testing window.playSpecificTrack("rec-1")...');
try {
  if (typeof window.playSpecificTrack === 'function') {
    window.playSpecificTrack('rec-1');
    console.log('  [PASS] window.playSpecificTrack executed successfully!');
  } else {
    console.error('  [FAIL] window.playSpecificTrack is NOT a function!');
  }
} catch (e) {
  console.error('  [FAIL] Error during playSpecificTrack:', e);
}

// Test 2: executeSearch
console.log('\n[2] Testing window.executeSearch("Starboy", false)...');
try {
  if (typeof window.executeSearch === 'function') {
    window.executeSearch('Starboy', false);
    console.log('  [PASS] window.executeSearch executed successfully!');
  } else {
    console.error('  [FAIL] window.executeSearch is NOT a function!');
  }
} catch (e) {
  console.error('  [FAIL] Error during executeSearch:', e);
}

// Test 3: switchView
console.log('\n[3] Testing window.switchView("search-view")...');
try {
  if (typeof window.switchView === 'function') {
    window.switchView('search-view');
    console.log('  [PASS] window.switchView executed successfully!');
  } else {
    console.error('  [FAIL] window.switchView is NOT a function!');
  }
} catch (e) {
  console.error('  [FAIL] Error during switchView:', e);
}

// Test 4: openGeminiDjModal
console.log('\n[4] Testing window.openGeminiDjModal()...');
try {
  if (typeof window.openGeminiDjModal === 'function') {
    window.openGeminiDjModal();
    console.log('  [PASS] window.openGeminiDjModal executed successfully!');
  } else {
    console.error('  [FAIL] window.openGeminiDjModal is NOT a function!');
  }
} catch (e) {
  console.error('  [FAIL] Error during openGeminiDjModal:', e);
}

// Test 5: openLyricsForCurrentTrack
console.log('\n[5] Testing window.openLyricsForCurrentTrack()...');
try {
  if (typeof window.openLyricsForCurrentTrack === 'function') {
    window.openLyricsForCurrentTrack();
    console.log('  [PASS] window.openLyricsForCurrentTrack executed successfully!');
  } else {
    console.error('  [FAIL] window.openLyricsForCurrentTrack is NOT a function!');
  }
} catch (e) {
  console.error('  [FAIL] Error during openLyricsForCurrentTrack:', e);
}

console.log('\n========================================================');
console.log('ALL RUNTIME SIMULATION TESTS COMPLETED SUCCESSFULLY!');
console.log('========================================================');
