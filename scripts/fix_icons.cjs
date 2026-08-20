const fs = require('fs');

let content = fs.readFileSync('src/catalogService.js', 'utf8');

// Replace Unsplash images with generic but real music album/artist covers
const realCovers = [
  'https://c.saavncdn.com/artists/Taylor_Swift_004_20231220074003_500x500.jpg',
  'https://c.saavncdn.com/artists/The_Weeknd_005_20230922091444_500x500.jpg',
  'https://c.saavncdn.com/artists/Arijit_Singh_002_20230323062147_500x500.jpg',
  'https://c.saavncdn.com/artists/Pritam_003_20230814095711_500x500.jpg',
  'https://c.saavncdn.com/artists/Diljit_Dosanjh_004_20231025075647_500x500.jpg',
  'https://c.saavncdn.com/artists/Jubin_Nautiyal_005_20231123060416_500x500.jpg',
  'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20220602075515_500x500.jpg',
  'https://c.saavncdn.com/artists/Karan_Aujla_004_20231206140502_500x500.jpg',
  'https://c.saavncdn.com/artists/Dua_Lipa_005_20240416111151_500x500.jpg',
  'https://c.saavncdn.com/artists/Ed_Sheeran_005_20230509063229_500x500.jpg',
  'https://c.saavncdn.com/243/The-Cruelest-Summer-English-2023-20231109123211-500x500.webp',
  'https://c.saavncdn.com/077/After-Hours-English-2020-20260804045014-500x500.webp',
  'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.webp'
];

let i = 0;
content = content.replace(/https:\/\/images\.unsplash\.com\/[^'"]+/g, () => {
  const url = realCovers[i % realCovers.length];
  i++;
  return url;
});

fs.writeFileSync('src/catalogService.js', content);

let musicService = fs.readFileSync('src/musicService.js', 'utf8');
musicService = musicService.replace(
  /if \(!cover\) cover = 'https:\/\/images\.unsplash\.com[^']+';/g,
  "if (!cover) cover = './pulse-logo.png';"
);
fs.writeFileSync('src/musicService.js', musicService);

let mainJs = fs.readFileSync('src/main.js', 'utf8');
mainJs = mainJs.replace(
  /https:\/\/images\.unsplash\.com\/photo-1511671782779-c97d3d27a1d4\?w=500&auto=format&fit=crop&q=80/g,
  "./pulse-logo.png"
);
fs.writeFileSync('src/main.js', mainJs);

console.log('Replaced Unsplash placeholders with real music covers & pulse-logo.png');
