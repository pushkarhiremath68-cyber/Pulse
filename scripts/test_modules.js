// Mock window / document for node
globalThis.window = globalThis;
globalThis.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }),
  body: { contains: () => false, appendChild: () => {}, style: {} },
  readyState: 'complete'
};
globalThis.Audio = class {
  constructor() {
    this.style = {};
  }
  addEventListener() {}
  load() {}
  play() { return Promise.resolve(); }
  pause() {}
};

import '../src/firebase.js';
import '../src/firebaseAuthService.js';
import '../src/firestoreService.js';
import '../src/extractorService.js';
import '../src/musicService.js';
import '../src/audioEngine.js';
import '../src/playbarController.js';
import '../src/lyricsService.js';
import '../src/catalogService.js';
import '../src/visualizer.js';
import '../src/geminiService.js';

console.log('All modules imported successfully without syntax or dependency errors!');
