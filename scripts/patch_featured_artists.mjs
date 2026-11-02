import fs from 'fs';

let content = fs.readFileSync('src/catalogService.js', 'utf8');
const startAnchor = 'export const getFeaturedArtists = () => {';
const endAnchor = 'export const getCuratedPlaylists = () => {';

const startIdx = content.indexOf(startAnchor);
const endIdx = content.indexOf(endAnchor);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find anchors');
  process.exit(1);
}

const replacement = `export const getFeaturedArtists = () => {
  if (typeof ARTIST_DATABASE !== 'object' || !ARTIST_DATABASE) return [];
  return Object.keys(ARTIST_DATABASE).map(k => {
    const a = ARTIST_DATABASE[k];
    return {
      id: k,
      name: a.name,
      genre: a.worldRank || 'Verified Artist',
      avatar: a.avatar || a.banner
    };
  });
};

`;

content = content.slice(0, startIdx) + replacement + content.slice(endIdx);
fs.writeFileSync('src/catalogService.js', content, 'utf8');
console.log('Successfully updated getFeaturedArtists!');

