import musicService from '../src/musicService.js';

const testQueries = [
  'starboy',
  'believer',
  'die with a smile',
  'shape of you ed sheeran',
  'chaleya',
  'raataan lambiyan',
  'fein travis scott',
  'diljit dosanjh',
  'wishes hasan raheem'
];

(async () => {
  for (const q of testQueries) {
    console.log(`\n================== QUERY: "${q}" ==================`);
    const results = await musicService.searchTracks(q, 10);
    console.log(`Found ${results.length} results.`);
    results.slice(0, 5).forEach((r, idx) => {
      console.log(`  [#${idx + 1}] "${r.title}" by "${r.artist}" (source: ${r.source || 'N/A'}, ytId: ${r.ytId || 'none'})`);
    });
  }
})();
