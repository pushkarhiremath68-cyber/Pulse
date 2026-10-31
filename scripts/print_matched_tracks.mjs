import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');

const idx = content.indexOf('const top10 = matchedTracks.slice(0, 10);');
console.log(content.substring(idx - 1500, idx));

