import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');

const idx = content.indexOf('return {', content.indexOf('getArtistDetails'));
const nextIdx = content.indexOf('return {', idx + 10);
console.log(content.substring(nextIdx, nextIdx + 1500));
