import fs from 'fs';

let content = fs.readFileSync('src/catalogService.js', 'utf8');

const oldSimilar = `      similarArtists: [
        { name: "The Weeknd", role: "Pop Icon", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg" },
        { name: "Taylor Swift", role: "Global Superstar", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg" }
      ]`;

const newSimilar = `      similarArtists: getFeaturedArtists()
        .filter(a => a.name.toLowerCase() !== data.name.toLowerCase())
        .slice(0, 2)
        .map(a => ({ name: a.name, role: a.genre || 'Top Artist', avatar: a.avatar }))`;

const normContent = content.replace(/\r\n/g, '\n');
const normOld = oldSimilar.replace(/\r\n/g, '\n');

if (normContent.includes(normOld)) {
  content = normContent.replace(normOld, newSimilar);
  fs.writeFileSync('src/catalogService.js', content, 'utf8');
  console.log('Successfully replaced hardcoded similarArtists with dynamic filter!');
} else {
  console.error('Could not locate oldSimilar in src/catalogService.js');
  process.exit(1);
}
