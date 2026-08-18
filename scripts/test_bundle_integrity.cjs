const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const js = fs.readFileSync('dist/assets/pulse.js', 'utf8');

console.log('HTML size:', html.length);
console.log('JS bundle size:', js.length);

// Check if all expected functions are in window:
console.log('Checking for function definitions in JS:');
const fns = [
  'playSpecificTrack',
  'executeSearch',
  'switchView',
  'openLyricsForCurrentTrack',
  'closeLyricsModal',
  'loadTrackLyrics',
  'syncLiveLyrics',
  'TRACKS_REGISTRY',
  'catalogService',
  'lyricsService',
  'PulseAudioEngine'
];

fns.forEach(fn => {
  console.log(`- ${fn}: ${js.includes(fn)}`);
});
