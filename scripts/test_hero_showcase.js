import { getHeroSlides } from '../src/catalogService.js';
import fs from 'fs';

console.log('--- 1. Testing Hero Slides in catalogService ---');
const slides = getHeroSlides();
console.log('Total Hero Slides count:', slides.length);

if (slides.length !== 8) {
  throw new Error(`Expected 8 slides, got ${slides.length}`);
}

slides.forEach((s, i) => {
  const ytId = s.videoYtId || s.youtubeId;
  const cover = s.coverUrl || s.artwork;
  const badge = s.badgeText || s.badge;
  const start = s.previewStart;
  console.log(`Slide [${i}]: "${s.title}" by ${s.artist} | Badge: "${badge}" | YT ID: ${ytId} | Preview Start: ${start}s`);
  if (!s.title || !s.artist || !cover || !ytId || typeof start !== 'number') {
    throw new Error(`Slide [${i}] missing required fields or previewStart!`);
  }
});

console.log('\n--- 2. Verifying index.html Carousel Containers ---');
const html = fs.readFileSync('./index.html', 'utf-8');

const requiredTokens = [
  'id="hero-banner"',
  'class="hero-banner hero-carousel-container"',
  'id="hero-bg-artwork"',
  'id="hero-bg-overlay"',
  'id="hero-prev-btn"',
  'id="hero-next-btn"',
  'id="hero-carousel-viewport"',
  'id="hero-slides-track"',
  'id="hero-carousel-pills"'
];

requiredTokens.forEach(token => {
  const found = html.includes(token);
  console.log(`Token [${token}] found:`, found);
  if (!found) throw new Error(`Missing token in index.html: ${token}`);
});

console.log('\n--- 3. Verifying src/style.css Pure Video Preview Styles ---');
const css = fs.readFileSync('./src/style.css', 'utf-8');

const requiredCssSelectors = [
  '.hero-banner',
  '.hero-carousel-viewport',
  '.hero-slides-track',
  '.hero-slide',
  '.hero-slide.active-slide',
  '.hero-content',
  '.hero-badge',
  '.hero-media-wrapper',
  '.hero-media-artwork-box',
  '.hero-media-video-box',
  '.hero-media-video-box.active-video',
  '.hero-video-preview-inner',
  '.hero-preview-iframe',
  '.hero-preview-glass-overlay',
  '.preview-badge-pill',
  '.btn-preview-tool',
  '.hero-nav-arrow',
  '.hero-carousel-pills',
  '.hero-pill-dot',
  '.hero-pill-dot.active-pill',
  '.hero-pill-progress',
  '@keyframes heroPillFill'
];

requiredCssSelectors.forEach(sel => {
  const found = css.includes(sel);
  console.log(`CSS Selector [${sel}] found:`, found);
  if (!found) throw new Error(`Missing CSS selector: ${sel}`);
});

console.log('\n--- 4. Verifying src/main.js Video Preview Methods ---');
const mainJs = fs.readFileSync('./src/main.js', 'utf-8');

const requiredMethods = [
  'window.initHeroCarousel',
  'window.goToHeroSlide',
  'window.nextHeroSlide',
  'window.prevHeroSlide',
  'window.startHeroAutoPlayTimer',
  'window.pauseHeroAutoPlay',
  'window.resumeHeroAutoPlay',
  'window.toggleSlidePreview',
  'window.togglePreviewMute',
  'window.playHeroSlideTrack',
  'window.toggleFavoriteHeroSlide'
];

requiredMethods.forEach(method => {
  const found = mainJs.includes(method);
  console.log(`Method [${method}] found:`, found);
  if (!found) throw new Error(`Missing method in src/main.js: ${method}`);
});

// Verify pure preview parameters in main.js
console.log('\n--- 5. Verifying Pure Video Preview Parameters in main.js ---');
const hasControlsZero = mainJs.includes('controls=0');
const hasLoopParam = mainJs.includes('loop=1');
const hasMuteParam = mainJs.includes('mute=1');
const hasStartParam = mainJs.includes('start=${previewStart}');
const hasPreviewBadge = mainJs.includes('PREVIEW');
const hasAudioToggle = mainJs.includes('togglePreviewMute');

console.log('No YouTube player chrome (controls=0):', hasControlsZero);
console.log('Continuous loop (loop=1):', hasLoopParam);
console.log('Safe muted autoplay (mute=1):', hasMuteParam);
console.log('Iconic chorus start offset (start=...):', hasStartParam);
console.log('Preview badge overlay present:', hasPreviewBadge);
console.log('Preview sound toggle tool present:', hasAudioToggle);

if (!hasControlsZero || !hasLoopParam || !hasMuteParam || !hasStartParam || !hasPreviewBadge || !hasAudioToggle) {
  throw new Error('Video preview parameters missing in main.js');
}

console.log('\n--- 6. Verifying Wallpaper Removal & Premium Playbar Elements ---');
const forbiddenWallpaperTokens = [
  'id="playbar-wallpaper-btn"',
  'id="tab-fs-wallpaper"',
  'id="fs-btn-wallpaper"',
  'id="fs-download-wallpaper-pill"',
  'Save HD Wallpaper'
];

forbiddenWallpaperTokens.forEach(token => {
  const foundInIndex = html.includes(token);
  console.log(`Forbidden Token [${token}] absent in index.html:`, !foundInIndex);
  if (foundInIndex) throw new Error(`Forbidden wallpaper token found in index.html: ${token}`);
});

const docsHtml = fs.readFileSync('./docs/index.html', 'utf-8');
forbiddenWallpaperTokens.forEach(token => {
  const foundInDocs = docsHtml.includes(token);
  console.log(`Forbidden Token [${token}] absent in docs/index.html:`, !foundInDocs);
  if (foundInDocs) throw new Error(`Forbidden wallpaper token found in docs/index.html: ${token}`);
});

const premiumPlaybarTokens = [
  'id="player-bar"',
  'class="bottom-player-bar"',
  'id="playbar-quality-badge"',
  'id="playbar-eq-wave"',
  'id="btn-play-pause"',
  'id="playbar-lyrics-btn"',
  'id="playbar-queue-btn"',
  'id="player-seek-slider"'
];

premiumPlaybarTokens.forEach(token => {
  const found = html.includes(token);
  console.log(`Premium Playbar Token [${token}] found in index.html:`, found);
  if (!found) throw new Error(`Missing premium playbar token in index.html: ${token}`);
});

console.log('\n=============================================================');
console.log('🎉 ALL VIDEO PREVIEW & PLAYBAR TESTS PASSED WITH 100%!       ');
console.log('=============================================================\n');

