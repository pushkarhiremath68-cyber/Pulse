import musicService from './src/musicService.js';

(async () => {
  console.log('Testing searchTracks("Kesariya")...');
  try {
    const results = await musicService.searchTracks('Kesariya', 20);
    console.log('Results count:', results.length);
    console.log('Sample results:', results.slice(0, 3));
  } catch (e) {
    console.error('Error in searchTracks:', e);
  }
})();
