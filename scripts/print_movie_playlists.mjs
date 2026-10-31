import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');

const idx = content.indexOf('export const MOVIE_PLAYLISTS =');
console.log(content.substring(idx, idx + 1200));

