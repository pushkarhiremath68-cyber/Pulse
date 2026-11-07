import fs from 'fs';

const css = fs.readFileSync('src/style.css', 'utf8');
const lines = css.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('.music-card') && l.includes('{')) {
    console.log(`${idx + 1}: ${l.trim()}`);
  }
});

