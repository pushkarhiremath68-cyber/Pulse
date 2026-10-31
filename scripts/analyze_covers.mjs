import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');

const regex = /coverUrl:\s*['"]([^'"]+)['"]/g;
const covers = [];
let match;
while ((match = regex.exec(content)) !== null) {
  covers.push(match[1]);
}
console.log('Total coverUrl entries found:', covers.length);

const counts = {};
covers.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
const duplicates = Object.entries(counts).filter(([url, count]) => count > 1);
console.log('Number of URLs appearing more than once:', duplicates.length);
duplicates.forEach(([url, count]) => {
  console.log(`${count} times: ${url.substring(0, 90)}`);
});
