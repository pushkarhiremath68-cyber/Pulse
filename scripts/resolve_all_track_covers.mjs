import fs from 'fs';
import https from 'https';
import { ARTIST_DATABASE } from '../src/catalogService.js';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchItunesCover(query) {
  return new Promise(resolve => {
    const req = https.get('https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&entity=song&limit=1', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const rawUrl = parsed?.results?.[0]?.artworkUrl100;
          if (rawUrl) {
            resolve(rawUrl.replace('100x100bb.jpg', '1000x1000bb.jpg'));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function main() {
  console.log('Resolving accurate track covers for all 87 artists...');
  const cacheFile = './scripts/track_covers_cache.json';
  let cache = {};
  if (fs.existsSync(cacheFile)) {
    try {
      cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch {}
  }

  const updatedDatabase = JSON.parse(JSON.stringify(ARTIST_DATABASE));
  let totalTracks = 0;
  let updatedCount = 0;

  for (const [artistId, artist] of Object.entries(updatedDatabase)) {
    console.log(`Processing [${artistId}] ${artist.name}...`);
    for (const track of artist.topTracks || []) {
      totalTracks++;
      const trackKey = `${artistId}:::${track.title}`;
      let cover = cache[trackKey];

      // If already in cache and not the unwanted repeated Ranbir cover on non-Brahmastra tracks
      const isBrahmastraSong = track.title.toLowerCase().includes('kesariya') || track.title.toLowerCase().includes('dance ka bhoot') || track.title.toLowerCase().includes('rasia');
      if (cover && (!cover.includes('196589311191') || isBrahmastraSong)) {
        track.coverUrl = cover;
        continue;
      }

      // Query iTunes
      let fetched = await fetchItunesCover(`${track.title} ${artist.name}`);
      if (!fetched || (!isBrahmastraSong && fetched.includes('196589311191'))) {
        // Try fallback query
        fetched = await fetchItunesCover(`${track.title}`);
      }

      if (fetched && (!fetched.includes('196589311191') || isBrahmastraSong)) {
        track.coverUrl = fetched;
        cache[trackKey] = fetched;
        updatedCount++;
      } else {
        // Fallback to track's YouTube maxres/hq thumbnail if it's safe
        if (track.ytId) {
          track.coverUrl = `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg`;
          cache[trackKey] = track.coverUrl;
          updatedCount++;
        }
      }
      await sleep(120); // polite rate limiting
    }
  }

  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  console.log(`Finished resolving covers. Updated ${updatedCount} / ${totalTracks} tracks.`);

  // Now rewrite src/catalogService.js topTracks with the resolved covers
  const catalogPath = './src/catalogService.js';
  let catalogSrc = fs.readFileSync(catalogPath, 'utf8');

  for (const [artistId, artist] of Object.entries(updatedDatabase)) {
    for (const track of artist.topTracks) {
      // Find the track entry in catalogSrc and replace coverUrl
      // Match pattern: title: '<track.title>', ..., coverUrl: '...'
      const titleEscaped = track.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match track object containing this title
      const trackRegex = new RegExp(`(title:\\s*['"\`]${titleEscaped}['"\`][\\s\\S]*?coverUrl:\\s*['"\`])([^'"\`]+)(['"\`])`, 'g');
      catalogSrc = catalogSrc.replace(trackRegex, `$1${track.coverUrl}$3`);
    }
  }

  fs.writeFileSync(catalogPath, catalogSrc, 'utf8');
  console.log('Successfully updated src/catalogService.js with authentic track artwork!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

