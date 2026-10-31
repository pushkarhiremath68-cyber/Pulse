import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');

const idx = content.indexOf('getFeaturedArtists = () => {');
const endIdx = content.indexOf('};', idx);
console.log('FEATURED ARTISTS:');
console.log(content.substring(idx, endIdx + 2));

const dbIdx = content.indexOf('export const getArtistDetails = (artistName) => {');
const dbEndIdx = content.indexOf('return {', dbIdx);
console.log('\nGET ARTIST DETAILS (START):');
console.log(content.substring(dbIdx, dbIdx + 500));
