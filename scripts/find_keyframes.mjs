import fs from 'fs';

const css = fs.readFileSync('src/style.css', 'utf8');
const lines = css.split('\n');

const keyframes = [];
lines.forEach((l, idx) => {
  if (l.trim().startsWith('@keyframes')) {
    keyframes.push({ line: idx + 1, text: l.trim() });
  }
});

console.log("Keyframes found in src/style.css:");
keyframes.forEach(kf => console.log(`Line ${kf.line}: ${kf.text}`));

