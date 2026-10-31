import fs from 'fs';

const c = fs.readFileSync('index.html', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('id="search-view"') || l.includes('search-results-container')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});
