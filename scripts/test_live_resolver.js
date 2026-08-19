import { searchTracks, resolveFullAudioStream, searchSaavnMasterTracks } from '../src/musicService.js';
import { resolvePipedAudioStream } from '../src/extractorService.js';

async function testResolver() {
  console.log("=== TESTING SEARCH & STREAM RESOLVER ===");
  const queries = ['Starboy', 'Kesariya', 'Trending Worldwide'];

  for (const q of queries) {
    console.log(`\n--- Searching: "${q}" ---`);
    try {
      const results = await searchTracks(q, 5);
      console.log(`Found ${results.length} tracks.`);
      if (results.length > 0) {
        const first = results[0];
        console.log(`First track: "${first.title}" by ${first.artist} (ID: ${first.id}, ytId: ${first.ytId})`);
        console.log(`  Initial streamUrl: ${first.streamUrl || 'NONE'}`);

        console.log(`  Resolving audio stream...`);
        const full = await resolveFullAudioStream(first);
        if (full && full.streamUrl) {
          console.log(`  [SUCCESS] Resolved Stream URL: ${full.streamUrl.substring(0, 70)}... (${full.source})`);
        } else {
          console.error(`  [FAILED] Could not resolve stream for "${first.title}"`);
        }
      }
    } catch (err) {
      console.error(`Error searching "${q}":`, err.message);
    }
  }
}

testResolver();
