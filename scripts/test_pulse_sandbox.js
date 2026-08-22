import fs from 'fs';
import vm from 'vm';

console.log('--- Testing pulse.js execution in browser simulation ---');

const html = fs.readFileSync('dist/index.html', 'utf-8');
const js = fs.readFileSync('dist/assets/pulse.js', 'utf-8');

// Create sandbox
const sandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  document: {
    readyState: 'complete',
    addEventListener: (ev, cb) => {},
    removeEventListener: () => {},
    querySelectorAll: (sel) => [],
    getElementById: (id) => {
      // Return dummy element with style and innerHTML
      return {
        id,
        style: {},
        classList: {
          add: () => {},
          remove: () => {},
          toggle: () => false,
          contains: () => false
        },
        innerHTML: '',
        textContent: '',
        addEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null
      };
    },
    createElement: (tag) => {
      return {
        tagName: tag,
        style: {},
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {},
        remove: () => {}
      };
    },
    body: {
      appendChild: () => {}
    }
  },
  window: {},
  navigator: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    onLine: true
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  location: {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    pathname: '/'
  },
  fetch: globalThis.fetch
};

sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

try {
  const script = new vm.Script(js);
  const context = vm.createContext(sandbox);
  script.runInContext(context);
  console.log('✅ pulse.js executed successfully without throwing top-level errors!');
  console.log('window.pulseState:', !!sandbox.pulseState);
  console.log('window.renderHomeDiscovery:', typeof sandbox.renderHomeDiscovery);
  console.log('window.playTrackDirect:', typeof sandbox.playTrackDirect);
  console.log('window.playCatalogTrack:', typeof sandbox.playCatalogTrack);
  console.log('window.switchView:', typeof sandbox.switchView);
  console.log('window.PulsePlaybar:', !!sandbox.PulsePlaybar);
  console.log('window.musicService:', !!sandbox.musicService);
} catch (e) {
  console.error('❌ pulse.js threw runtime error:', e);
}
