import fs from 'fs';
const content = fs.readFileSync('src/catalogService.js', 'utf8');
const lines = content.split('\n');
for (let i = 551; i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith('export const') || l.startsWith('export function') || l.startsWith('export let')) {
    console.log(i + 1, l.slice(0, 50));
  }
}
