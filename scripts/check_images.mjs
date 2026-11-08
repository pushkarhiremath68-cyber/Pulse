import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
const linkRegex = /<link[^>]+href=["']([^"']+)["']/g;

console.log('=== IMG SOURCES ===');
let m;
while ((m = imgRegex.exec(html)) !== null) {
  console.log('IMG:', m[1]);
}

console.log('\n=== LINK HREFS (icons) ===');
while ((m = linkRegex.exec(html)) !== null) {
  if (m[0].includes('icon')) {
    console.log('ICON:', m[1]);
  }
}

