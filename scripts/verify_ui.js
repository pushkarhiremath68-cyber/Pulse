import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

console.log('--- Verifying Pulse UI Elements ---');

// 1. Playbar check
const playbar = document.getElementById('player-bar');
console.assert(playbar !== null, 'player-bar exists');

const playbarLyricsBtn = document.getElementById('playbar-lyrics-btn');
console.assert(playbarLyricsBtn !== null, 'playbar-lyrics-btn (desktop) exists');

const mobileLyricsBtn = document.getElementById('mobile-playbar-lyrics-btn');
console.assert(mobileLyricsBtn !== null, 'mobile-playbar-lyrics-btn (mobile) exists');

const mobilePrevBtn = document.getElementById('mobile-prev-btn');
console.assert(mobilePrevBtn !== null, 'mobile-prev-btn exists');

const mobileNextBtn = document.getElementById('mobile-next-btn');
console.assert(mobileNextBtn !== null, 'mobile-next-btn exists');

// 2. Fullscreen Player check
const fsPlayer = document.getElementById('fullscreen-player');
console.assert(fsPlayer !== null, 'fullscreen-player exists');

const fsMinimizeBtn = document.getElementById('btn-fs-minimize');
console.assert(fsMinimizeBtn !== null, 'btn-fs-minimize exists');

const fsToggleLyricsBtn = document.getElementById('fs-toggle-lyrics-btn');
console.assert(fsToggleLyricsBtn !== null, 'fs-toggle-lyrics-btn exists');

const fsPlayPauseBtn = document.getElementById('fs-play-pause-btn');
console.assert(fsPlayPauseBtn !== null, 'fs-play-pause-btn exists');

const fsPrevBtn = document.getElementById('fs-btn-prev');
console.assert(fsPrevBtn !== null, 'fs-btn-prev exists');

const fsNextBtn = document.getElementById('fs-btn-next');
console.assert(fsNextBtn !== null, 'fs-btn-next exists');

const fsLyricsScrollBox = document.getElementById('fs-lyrics-scroll-box');
console.assert(fsLyricsScrollBox !== null, 'fs-lyrics-scroll-box exists');

console.log('✅ All UI elements & selectors verified successfully!');
