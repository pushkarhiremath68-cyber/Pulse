const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
const mobileNavLines = [];
let capture = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('mobile-nav') || lines[i].includes('bottom-nav')) {
    capture = true;
  }
  if (capture && mobileNavLines.length < 20) {
    mobileNavLines.push(lines[i]);
  }
}
console.log(mobileNavLines.join('\n'));
