import fs from 'fs';

const css = fs.readFileSync('src/style.css', 'utf8');
const lines = css.split('\n');

const lineIndices = [7, 168, 200, 458, 814, 831, 1477, 1641, 2084, 2521, 3153, 3204, 3252, 3551, 4368, 4438, 4520, 4640, 4894, 5150, 5201, 5232, 5348];

lineIndices.forEach(idx => {
  const start = Math.max(0, idx - 2);
  const end = Math.min(lines.length, idx + 4);
  console.log(`\n--- Line ~${idx} ---`);
  for (let i = start; i < end; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
});
