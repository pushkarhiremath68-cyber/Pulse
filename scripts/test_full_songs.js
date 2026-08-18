import musicService from '../src/musicService.js';

async function testFullSongEngine() {
  console.log('=== 1. Testing searchTracks ===');
  const searchResults = await musicService.searchTracks('Kesariya Arijit Singh', 5);
  console.log('Search Results Count:', searchResults.length);
  searchResults.forEach((t, i) => {
    console.log(`[${i+1}] ${t.title} - ${t.artist} (${t.duration}s)`);
    console.log(`     Stream: ${t.streamUrl.substring(0, 60)}...`);
    console.log(`     Source: ${t.source}`);
  });

  console.log('\n=== 2. Testing resolveFullAudioStream for a 30s preview track ===');
  const dummyPreviewTrack = {
    title: 'Starboy',
    artist: 'The Weeknd',
    streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/...',
    duration: 30
  };
  const resolved = await musicService.resolveFullAudioStream(dummyPreviewTrack);
  console.log('Resolved Full Stream:', resolved?.streamUrl?.substring(0, 70));
  console.log('Resolved Duration:', resolved?.duration, 'seconds');
  console.log('Resolved Source:', resolved?.source);

  console.log('\n=== 3. Testing Punjabi / Global Tracks ===');
  const loverResolved = await musicService.resolveFullAudioStream({ title: 'Lover', artist: 'Diljit Dosanjh' });
  console.log('Lover Stream:', loverResolved?.streamUrl?.substring(0, 70), '| Duration:', loverResolved?.duration, 's');

  const shapeResolved = await musicService.resolveFullAudioStream({ title: 'Shape of You', artist: 'Ed Sheeran' });
  console.log('Shape of You Stream:', shapeResolved?.streamUrl?.substring(0, 70), '| Duration:', shapeResolved?.duration, 's');

  console.log('\n=== 4. Testing Trending Tracks ===');
  const trending = await musicService.fetchTrendingTracks(6);
  console.log('Trending tracks count:', trending.length);
  trending.slice(0, 3).forEach((t, i) => {
    console.log(`[${i+1}] ${t.title} - ${t.artist} (${t.duration}s)`);
  });
}

testFullSongEngine();
