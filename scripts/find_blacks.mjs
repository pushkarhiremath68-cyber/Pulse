import fs from 'fs';

const css = fs.readFileSync('src/style.css', 'utf8');
const lines = css.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('#000000') || l.includes('rgba(25, 25, 25')) {
    console.log(`${idx + 1}: ${l.trim().slice(0, 90)}`);
  }
});

