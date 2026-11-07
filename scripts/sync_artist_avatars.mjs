import fs from 'fs';

const filePath = 'src/catalogService.js';
let content = fs.readFileSync(filePath, 'utf8');

// For any artist in ARTIST_DATABASE that has banner but no avatar, inject avatar: banner
// e.g. "banner": "https...", -> "banner": "https...",\n    "avatar": "https...",
content = content.replace(/"banner":\s*"([^"]+)",(?!\s*"avatar")/g, (match, url) => {
  return `"banner": "${url}",\n    "avatar": "${url}",`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Synchronized avatar with banner for all artists in catalogService.js');
