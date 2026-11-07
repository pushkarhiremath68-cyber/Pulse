import fs from 'fs';
import { ARTIST_DATABASE } from '../src/catalogService.js';

const cache = JSON.parse(fs.readFileSync('./scripts/track_covers_cache.json', 'utf8'));
const updatedDatabase = JSON.parse(JSON.stringify(ARTIST_DATABASE));

let replacedCount = 0;
for (const [artistId, artist] of Object.entries(updatedDatabase)) {
  for (const track of artist.topTracks || []) {
    const key = `${artistId}:::${track.title}`;
    if (cache[key]) {
      track.coverUrl = cache[key];
      replacedCount++;
    }
  }
}

console.log(`Applied cached covers to ${replacedCount} tracks across ${Object.keys(updatedDatabase).length} artists.`);

const src = fs.readFileSync('./src/catalogService.js', 'utf8');
const lines = src.split('\n');

const startIdx = lines.findIndex(l => l.trim() === 'export const ARTIST_DATABASE = {');
if (startIdx === -1) {
  throw new Error('Could not find start of ARTIST_DATABASE');
}

let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === '};' && lines[i + 2]?.includes('export const SIMILAR_ARTIST_MAP')) {
    endIdx = i;
    break;
  }
}
if (endIdx === -1) {
  // Try fallback search
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('};') && lines.slice(i, i + 5).some(l => l.includes('SIMILAR_ARTIST_MAP'))) {
      endIdx = i;
      break;
    }
  }
}

if (endIdx === -1) {
  throw new Error('Could not find end of ARTIST_DATABASE');
}

console.log(`Replacing lines ${startIdx + 1} to ${endIdx + 1} with updated ARTIST_DATABASE...`);

const before = lines.slice(0, startIdx).join('\n');
const after = lines.slice(endIdx + 1).join('\n');
const replacement = `export const ARTIST_DATABASE = ${JSON.stringify(updatedDatabase, null, 2)};`;

const finalContent = `${before}\n${replacement}\n${after}`;
fs.writeFileSync('./src/catalogService.js', finalContent, 'utf8');

console.log('Successfully updated src/catalogService.js!');
