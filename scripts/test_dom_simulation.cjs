const fs = require('fs');

const jsBundlePath = 'docs/assets/index-DMcdlLHm.js';
if (!fs.existsSync(jsBundlePath)) {
  console.error("Bundle not found:", jsBundlePath);
  process.exit(1);
}

const jsCode = fs.readFileSync(jsBundlePath, 'utf-8');
console.log("Bundle size:", jsCode.length, "bytes");

// Create a minimal browser environment simulation
const mockWindow = {
  addEventListener: () => {},
  removeEventListener: () => {},
  document: {
    addEventListener: () => {},
    getElementById: (id) => ({
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      style: {},
      value: ''
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    body: {
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      style: {}
    }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  navigator: { userAgent: 'Node' },
  location: { hash: '', hostname: 'localhost', href: 'http://localhost/' }
};

try {
  // Check syntax
  new Function('window', 'document', 'localStorage', 'navigator', 'location', jsCode);
  console.log("[SUCCESS] Bundle syntax is 100% valid JavaScript without any syntax errors!");
} catch (e) {
  console.error("[ERROR] Bundle has syntax error:", e);
}
