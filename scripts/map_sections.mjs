import fs from 'fs';

const css = fs.readFileSync('src/style.css', 'utf8');
const lines = css.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('====') || (l.startsWith('/*') && l.includes('---')) || l.match(/\/\*\s*\d+\./)) {
    console.log(`${idx + 1}: ${l.trim().slice(0, 80)}`);
  }
});
