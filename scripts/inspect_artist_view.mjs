import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
const artistStart = lines.findIndex(l => l.includes('id="view-artist"'));
console.log('Artist view start line:', artistStart + 1);

if (artistStart !== -1) {
  console.log(lines.slice(artistStart, artistStart + 100).join('\n'));
}
