const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');

const ids = [
  'view-home',
  'home-quick-picks-container',
  'home-featured-artists-container',
  'dynamic-home-shelves',
  'language-shelves-container',
  'home-curated-playlists-container',
  'pwa-floating-banner',
  'header-download-btn'
];

ids.forEach(id => {
  console.log(id, 'exists in HTML:', html.includes(`id="${id}"`));
});
