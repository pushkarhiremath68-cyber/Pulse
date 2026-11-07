import fs from 'fs';

const css = fs.readFileSync('src/style.css', 'utf8');
const lines = css.split('\n');

const mediaQueries = [];
lines.forEach((l, idx) => {
  if (l.trim().startsWith('@media')) {
    mediaQueries.push({ line: idx + 1, text: l.trim() });
  }
});

console.log("Media queries found in src/style.css:");
mediaQueries.forEach(mq => console.log(`Line ${mq.line}: ${mq.text}`));
