import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

console.log('=== Pulse Music Full UI & Click Interaction Test ===');

const html = fs.readFileSync('index.html', 'utf-8');

const dom = new JSDOM(html, {
  url: 'http://localhost:3000/',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true
});

const { window } = dom;
const { document } = window;

// Polyfill browser globals for node environment
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

window.scrollTo = function() {};
window.requestAnimationFrame = function(cb) { return setTimeout(cb, 16); };
window.cancelAnimationFrame = function(id) { clearTimeout(id); };

// Mock HTMLMediaElement prototype
window.HTMLMediaElement.prototype.play = function() {
  this.paused = false;
  return Promise.resolve();
};
window.HTMLMediaElement.prototype.pause = function() {
  this.paused = true;
};
window.HTMLMediaElement.prototype.load = function() {};

// Mock YouTube IFrame API
window.YT = {
  Player: function(id, config) {
    this.loadVideoById = (id) => { console.log('[Mock YT Player] loadVideoById:', id); };
    this.playVideo = () => { console.log('[Mock YT Player] playVideo'); };
    this.pauseVideo = () => { console.log('[Mock YT Player] pauseVideo'); };
    this.seekTo = (sec) => { console.log('[Mock YT Player] seekTo:', sec); };
    this.setVolume = (vol) => {};
    this.getDuration = () => 220;
    this.getCurrentTime = () => 15;
    this.getPlayerState = () => 1;
    if (config && config.events && config.events.onReady) {
      setTimeout(() => config.events.onReady({ target: this }), 10);
    }
  },
  PlayerState: {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5
  }
};

// Now import the bundled app script or modules
console.log('1. Checking DOM structure and containers...');
const qpContainer = document.getElementById('home-quick-picks-container');
const artContainer = document.getElementById('home-featured-artists-container');
const plContainer = document.getElementById('home-curated-playlists-container');
const shelvesContainer = document.getElementById('dynamic-home-shelves');
const langContainer = document.getElementById('language-shelves-container');
const playerBar = document.getElementById('player-bar');

console.log('- Quick picks container:', qpContainer ? 'FOUND' : 'MISSING');
console.log('- Featured artists container:', artContainer ? 'FOUND' : 'MISSING');
console.log('- Curated playlists container:', plContainer ? 'FOUND' : 'MISSING');
console.log('- Dynamic shelves container:', shelvesContainer ? 'FOUND' : 'MISSING');
console.log('- Language shelves container:', langContainer ? 'FOUND' : 'MISSING');
console.log('- Player bar:', playerBar ? 'FOUND' : 'MISSING');

// Import catalog service to test data
import { getQuickPicks, getFeaturedArtists, getCuratedPlaylists, CATALOG_CATEGORIES, LANGUAGE_PLAYLISTS } from '../src/catalogService.js';

console.log('\n2. Verifying Catalog Data Sources:');
const qp = getQuickPicks(6);
console.log(`- Quick Picks: ${qp.length} tracks`);
const artists = getFeaturedArtists();
console.log(`- Featured Artists: ${artists.length} artists`);
const curated = getCuratedPlaylists();
console.log(`- Curated Playlists: ${curated.length} playlists`);
console.log(`- Catalog Categories: ${CATALOG_CATEGORIES.length} categories, Total tracks: ${CATALOG_CATEGORIES.reduce((acc, c) => acc + c.tracks.length, 0)}`);
console.log(`- Language Playlists: ${LANGUAGE_PLAYLISTS.length} languages, Total tracks: ${LANGUAGE_PLAYLISTS.reduce((acc, l) => acc + l.tracks.length, 0)}`);

// Check if any track lacks title, artist, cover, or ytId
let invalidTracks = 0;
CATALOG_CATEGORIES.forEach(cat => {
  cat.tracks.forEach(t => {
    if (!t.title || !t.artist || !t.ytId) {
      console.warn(`Invalid track in category ${cat.id}:`, t);
      invalidTracks++;
    }
  });
});

LANGUAGE_PLAYLISTS.forEach(lang => {
  lang.tracks.forEach(t => {
    if (!t.title || !t.artist || !t.ytId) {
      console.warn(`Invalid track in language ${lang.id}:`, t);
      invalidTracks++;
    }
  });
});

console.log(`Invalid catalog tracks count: ${invalidTracks}`);
console.log('=== Test Completed ===');
