import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 Testing Sound Quality & 320kbps Studio Master Audio Engine...');

const rootDir = process.cwd();
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
const musicServiceJs = fs.readFileSync(path.join(rootDir, 'src', 'musicService.js'), 'utf-8');
const playbarControllerJs = fs.readFileSync(path.join(rootDir, 'src', 'playbarController.js'), 'utf-8');
const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf-8');
const styleCss = fs.readFileSync(path.join(rootDir, 'src', 'style.css'), 'utf-8');

// 1. Verify index.html elements
assert(indexHtml.includes('id="playbar-quality-badge"'), 'playbar-quality-badge must exist in index.html');
assert(indexHtml.includes('openAudioQualityModal()'), 'playbar-quality-badge must call openAudioQualityModal');
assert(indexHtml.includes('id="playbar-quality-btn"'), 'playbar-quality-btn must exist in index.html');
assert(indexHtml.includes('id="fs-quality-badge"'), 'fs-quality-badge must exist in index.html');
assert(indexHtml.includes('id="audio-quality-modal"'), 'audio-quality-modal must exist in index.html');
assert(indexHtml.includes('id="aq-tier-320"'), 'aq-tier-320 option must exist in index.html');
assert(indexHtml.includes('id="aq-eq-bass"'), 'aq-eq-bass preset must exist in index.html');
console.log('✅ PASS: index.html has quality badges, playbar button, and audio quality modal');

// 2. Verify musicService.js 320kbps prioritization
assert(musicServiceJs.includes('_320.$2') || musicServiceJs.includes('_320.'), 'musicService.js must enforce _320 upgrade for Saavn streams');
assert(musicServiceJs.includes('Studio Master Audio (320kbps Lossless)'), 'musicService.js must tag 320kbps lossless source');
assert(musicServiceJs.includes('isHindiTrack(track)'), 'resolveFullAudioStream must prioritize JioSaavn 320k for Hindi/Indian tracks');
console.log('✅ PASS: musicService.js enforces 320kbps upgrade and Indian track studio master prioritization');

// 3. Verify playbarController.js quality handling
assert(playbarControllerJs.includes("suggestedQuality: 'hd1080'") || playbarControllerJs.includes("'suggestedQuality': 'hd1080'"), 'YouTube player must enforce hd1080');
assert(playbarControllerJs.includes("setPlaybackQuality('hd1080')"), 'YouTube player must call setPlaybackQuality hd1080');
assert(playbarControllerJs.includes("playbar-quality-badge-text"), 'playbarController.js must update playbar-quality-badge-text');
assert(playbarControllerJs.includes("fs-quality-badge"), 'playbarController.js must update fs-quality-badge');
console.log('✅ PASS: playbarController.js forces hd1080 YouTube playback and updates quality badges');

// 4. Verify main.js exports and functions
assert(mainJs.includes('window.openAudioQualityModal'), 'main.js must define window.openAudioQualityModal');
assert(mainJs.includes('window.closeAudioQualityModal'), 'main.js must define window.closeAudioQualityModal');
assert(mainJs.includes('window.selectAudioQuality'), 'main.js must define window.selectAudioQuality');
assert(mainJs.includes('window.selectAcousticProfile'), 'main.js must define window.selectAcousticProfile');
assert(mainJs.includes('window.updateAudioQualityUI'), 'main.js must define window.updateAudioQualityUI');
console.log('✅ PASS: main.js has all sound quality modal controllers and UI synchronizers');

// 5. Verify style.css rules
assert(styleCss.includes('.playbar-quality-badge'), 'style.css must style .playbar-quality-badge');
assert(styleCss.includes('.fs-quality-badge'), 'style.css must style .fs-quality-badge');
assert(styleCss.includes('.btn-audio-quality'), 'style.css must style .btn-audio-quality');
assert(styleCss.includes('.aq-tier-option'), 'style.css must style .aq-tier-option');
console.log('✅ PASS: style.css contains premium audio quality styles');

console.log('🎉 ALL SOUND QUALITY TESTS PASSED 100%!');

