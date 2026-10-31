import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');

const match = content.match(/export const getFeaturedArtists = \(\) => \[\s*([\s\S]*?)\];/);
if (match) {
  console.log('FEATURED ARTISTS DEF:\n', match[1].substring(0, 1500));
} else {
  console.log('Not found via regex, searching index');
  const idx = content.indexOf('getFeaturedArtists');
  console.log(content.substring(idx, idx + 1000));
}
