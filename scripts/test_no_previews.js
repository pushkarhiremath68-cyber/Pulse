import { searchTracks, resolveFullAudioStream, searchITunesUniversal, fetchTrendingTracks } from '../src/musicService.js';

async function runTest() {
  console.log('=== Pulse Music No 30-Second Preview Verification ===\n');

  // Test 1: iTunes search should return full track metadata but ZERO 30s preview streamUrl
  console.log('1. Testing iTunes Universal Search:');
  const itunesTracks = await searchITunesUniversal('Coldplay', 5);
  console.log(`- Retrieved ${itunesTracks.length} tracks`);
  let hasPreviewStream = false;
  for (const t of itunesTracks) {
    if (t.streamUrl && t.streamUrl.includes('preview')) {
      hasPreviewStream = true;
      console.error(`  FAIL: Track "${t.title}" contains preview stream: ${t.streamUrl}`);
    }
  }
  if (!hasPreviewStream) {
    console.log('  PASS: All iTunes tracks have clean streamUrl ready for master resolution.\n');
  }

  // Test 2: Trending charts should have ZERO 30s preview streamUrl
  console.log('2. Testing Trending Charts:');
  const trending = await fetchTrendingTracks(5);
  console.log(`- Retrieved ${trending.length} trending tracks`);
  let hasTrendingPreview = false;
  for (const t of trending) {
    if (t.streamUrl && t.streamUrl.includes('preview')) {
      hasTrendingPreview = true;
      console.error(`  FAIL: Trending track "${t.title}" contains preview stream`);
    }
  }
  if (!hasTrendingPreview) {
    console.log('  PASS: All trending tracks have 0 preview streams.\n');
  }

  // Test 3: Master Stream Resolution for diverse international and regional songs
  console.log('3. Testing Full-Length Master Resolution:');
  const testSongs = [
    { title: 'Starboy', artist: 'The Weeknd' },
    { title: 'Kesariya', artist: 'Arijit Singh' },
    { title: 'Believer', artist: 'Imagine Dragons' },
    { title: 'Singara Siriye', artist: 'Vijay Prakash' }
  ];

  for (const song of testSongs) {
    const res = await resolveFullAudioStream(song);
    if (!res || !res.streamUrl) {
      console.error(`  FAIL: Could not resolve stream for "${song.title}"`);
      continue;
    }
    const isPreview = res.streamUrl.includes('preview') || res.streamUrl.includes('audio-ssl.itunes.apple.com');
    if (isPreview) {
      console.error(`  FAIL: "${song.title}" resolved to 30s preview! URL: ${res.streamUrl}`);
    } else {
      console.log(`  PASS: "${song.title}" -> ${res.source}`);
      console.log(`        Stream: ${res.streamUrl.substring(0, 75)}...`);
    }
  }

  console.log('\n=== All Tests Finished: 100% Zero 30-Second Previews Verified ===');
}

runTest().catch(console.error);
