import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

async function testJsdomFull() {
  const html = fs.readFileSync('index.html', 'utf-8');
  const dom = new JSDOM(html, {
    url: 'http://localhost:5173/',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
  });

  const { window } = dom;
  window.Audio = class MockAudio {
    constructor() {
      this.src = '';
      this.currentTime = 0;
      this.duration = 200;
      this.volume = 1;
    }
    play() { return Promise.resolve(); }
    pause() {}
    load() {}
    addEventListener(evt, fn) { this[`on${evt}`] = fn; }
    removeEventListener() {}
  };

  // Check errors
  window.addEventListener('error', (e) => {
    console.error('JSDOM Window Error:', e.error || e.message);
  });

  // Load modules
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.navigator = window.navigator;
  globalThis.localStorage = window.localStorage;
  globalThis.sessionStorage = window.sessionStorage;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.customElements = window.customElements;

  console.log('Importing main.js...');
  await import('../src/main.js');

  console.log('Checking DOM content:');
  const qp = window.document.getElementById('home-quick-picks-container');
  console.log('Quick picks children count:', qp?.children?.length);
  console.log('Dynamic shelves children count:', window.document.getElementById('dynamic-home-shelves')?.children?.length);
  console.log('Language shelves children count:', window.document.getElementById('language-shelves-container')?.children?.length);

  console.log('Testing play track direct...');
  const firstTrack = window.__quickPicks?.[0];
  console.log('First track:', firstTrack?.title, firstTrack?.artist);
  window.playTrackDirect(firstTrack);

  console.log('Current track in playbar:', window.PulsePlaybar?.getCurrentTrack()?.title);
  console.log('Player title element text:', window.document.getElementById('player-title')?.textContent);
}

testJsdomFull().catch(e => console.error('Test failed:', e));
