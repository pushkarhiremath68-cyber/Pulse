import fs from 'fs';

let content = fs.readFileSync('src/catalogService.js', 'utf8');

const idCoverMap = {
  '_ovdm2yX4MA': 'https://i.ytimg.com/vi/_ovdm2yX4MA/hqdefault.jpg',
  'cF1Na4AIecM': 'https://i.ytimg.com/vi/cF1Na4AIecM/hqdefault.jpg',
  '2Vv-BfVoq4g': 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
  'rYEDA3JcQqw': 'https://i.ytimg.com/vi/rYEDA3JcQqw/hqdefault.jpg',
  '450p7goxZqg': 'https://i.ytimg.com/vi/450p7goxZqg/hqdefault.jpg',
  'gCYcHz2k5x0': 'https://i.ytimg.com/vi/gCYcHz2k5x0/hqdefault.jpg',
  '0zGcUoRlhmw': 'https://i.ytimg.com/vi/0zGcUoRlhmw/hqdefault.jpg',
  '1w7OgIMMRc4': 'https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg',
  'YqeW9_5kURI': 'https://i.ytimg.com/vi/YqeW9_5kURI/hqdefault.jpg',
  'yKNxeF4KMsY': 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
  't5MlnGOKGDI': 'https://i.ytimg.com/vi/t5MlnGOKGDI/hqdefault.jpg',
  'Oq8j5Qz9Q6U': 'https://i.ytimg.com/vi/Oq8j5Qz9Q6U/hqdefault.jpg'
};

let count = 0;
for (const [ytId, cover] of Object.entries(idCoverMap)) {
  // Replace coverUrl for this ytId
  const reg1 = new RegExp(`(\\{\\s*id:[^}]+?${ytId}[^}]+?coverUrl:\\s*['"])[^'"]+(['"])`, 'g');
  content = content.replace(reg1, (m, p1, p2) => {
    count++;
    return `${p1}${cover}${p2}`;
  });

  // Also replace cover: if used
  const reg2 = new RegExp(`(\\{\\s*id:[^}]+?${ytId}[^}]+?cover:\\s*['"])[^'"]+(['"])`, 'g');
  content = content.replace(reg2, (m, p1, p2) => {
    count++;
    return `${p1}${cover}${p2}`;
  });
}

// Special case for rel-please-please-please
content = content.replace(/(\{\s*id:\s*['"]rel-please-please-please['"][^}]+?coverUrl:\s*['"])[^'"]+(['"])/g, (m, p1, p2) => {
  count++;
  return `${p1}https://i.ytimg.com/vi/cF1Na4AIecM/hqdefault.jpg${p2}`;
});

console.log(`Updated ${count} track cover occurrences.`);
fs.writeFileSync('src/catalogService.js', content, 'utf8');
