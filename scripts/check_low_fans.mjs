import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/all_87_artists_resolved.json', 'utf8'));

console.log('Total in resolved JSON:', Object.keys(data).length);
for (const [k, v] of Object.entries(data)) {
  if (v.fans < 1000) {
    console.log('Low fans:', k.padEnd(25), '->', v.matchedName, `(${v.fans} fans)`);
  }
}
