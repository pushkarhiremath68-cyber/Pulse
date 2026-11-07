import fs from 'fs';

const verifiedPhotos = JSON.parse(fs.readFileSync('scripts/final_verified_photos.json', 'utf8'));
let catalogContent = fs.readFileSync('src/catalogService.js', 'utf8');

// Parse ARTIST_DATABASE
const match = catalogContent.match(/export const ARTIST_DATABASE = (\{[\s\S]*?\n\};)/);
if (!match) {
  console.error('Could not find ARTIST_DATABASE in catalogService.js');
  process.exit(1);
}

const dbStr = match[1];
// Using Function to safely parse object literal
const parseDB = new Function(`return ${dbStr}`);
const db = parseDB();

let updatedCount = 0;
for (const [id, info] of Object.entries(verifiedPhotos)) {
  if (db[id]) {
    db[id].avatar = info.photo;
    db[id].banner = info.photo;
    updatedCount++;
  } else {
    console.warn(`Artist ${id} not found in ARTIST_DATABASE`);
  }
}

console.log(`Updated ${updatedCount} artists in ARTIST_DATABASE`);

const newDbStr = JSON.stringify(db, null, 2) + ';';
catalogContent = catalogContent.replace(match[0], `export const ARTIST_DATABASE = ${newDbStr}`);

// Also fix searchArtists in catalogService to pass artist.avatar
catalogContent = catalogContent.replace(
  'addCandidate(artist.name, artist.worldRank || \'Verified Master\', artist.banner, artist.banner, artist.followersCount, artist.worldRank, 30);',
  'addCandidate(artist.name, artist.worldRank || \'Verified Master\', artist.avatar, artist.banner, artist.followersCount, artist.worldRank, 30);'
);

fs.writeFileSync('src/catalogService.js', catalogContent);
console.log('Successfully written updated catalogService.js');
