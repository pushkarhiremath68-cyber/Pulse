const fs = require('fs');

const jsCode = fs.readFileSync('docs/assets/pulse.js', 'utf-8');

const elements = {};
function createMockEl(tag, id = '') {
  return {
    tagName: tag.toUpperCase(),
    id: id,
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
    },
    style: {},
    dataset: {},
    children: [],
    addEventListener(evt, fn) {},
    removeEventListener(evt, fn) {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    click() {}
  };
}

const mockDoc = {
  readyState: 'complete',
  createElement: (tag) => createMockEl(tag),
  getElementById: (id) => {
    if (!elements[id]) elements[id] = createMockEl('div', id);
    return elements[id];
  },
  querySelector: (sel) => createMockEl('div'),
  querySelectorAll: (sel) => [createMockEl('div')],
  addEventListener: () => {},
  removeEventListener: () => {},
  body: createMockEl('body')
};

const mockWindow = {
  document: mockDoc,
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  sessionStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  },
  navigator: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    mediaSession: { setActionHandler() {}, playbackState: 'none' }
  },
  location: { hash: '', hostname: 'localhost', href: 'http://localhost/' },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  console: console,
  Audio: class {
    constructor() { this.currentTime = 0; this.duration = 200; }
    play() { return Promise.resolve(); }
    pause() {}
    addEventListener() {}
    removeEventListener() {}
  },
  AudioContext: class {
    createAnalyser() { return { fftSize: 2048, frequencyBinCount: 1024, getByteFrequencyData() {} }; }
    createMediaElementSource() { return { connect() {} }; }
  }
};
mockWindow.window = mockWindow;
mockWindow.globalThis = mockWindow;

console.log("[RUNNING TEST] Executing pulse.js with mocked environment...");

try {
  const runner = new Function(
    'window', 'document', 'localStorage', 'sessionStorage', 'navigator', 'location',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'console', 'Audio', 'AudioContext',
    jsCode
  );
  runner(
    mockWindow, mockDoc, mockWindow.localStorage, mockWindow.sessionStorage, mockWindow.navigator,
    mockWindow.location, setTimeout, clearTimeout, setInterval, clearInterval, console,
    mockWindow.Audio, mockWindow.AudioContext
  );

  console.log("\n[TEST RESULT 1] pulse.js executed completely without crashing!");
  console.log("Exported functions on window:");
  const exported = Object.keys(mockWindow).filter(k => typeof mockWindow[k] === 'function');
  console.log(exported.join(', '));

  console.log("\n[TEST RESULT 2] Testing playSpecificTrack('rec-1')...");
  if (typeof mockWindow.playSpecificTrack === 'function') {
    mockWindow.playSpecificTrack('rec-1');
    console.log("[SUCCESS] playSpecificTrack('rec-1') executed without error!");
  } else {
    console.error("[FAILED] playSpecificTrack is not a function!");
  }

} catch (err) {
  console.error("[CRITICAL EXECUTION ERROR]:", err);
}
