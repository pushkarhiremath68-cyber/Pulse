import fs from 'fs';

let cat = fs.readFileSync('src/catalogService.js', 'utf8');

// Patch 1: getArtistDetails return with origin and avatar
cat = cat.replace(
  `      worldRank: data.worldRank,\n      banner: data.banner,\n      avatar: data.banner,`,
  `      worldRank: data.worldRank,\n      origin: data.origin || 'Global',\n      banner: data.banner,\n      avatar: data.avatar || data.banner,`
);

// If CRLF
cat = cat.replace(
  `      worldRank: data.worldRank,\r\n      banner: data.banner,\r\n      avatar: data.banner,`,
  `      worldRank: data.worldRank,\r\n      origin: data.origin || 'Global',\r\n      banner: data.banner,\r\n      avatar: data.avatar || data.banner,`
);

// Patch 2: getArtistDetails dynamic fallback
const oldFallback = `    socials: {
      instagram: \`https://www.instagram.com/\${cleanHandle}/\`,
      x: \`https://x.com/\${cleanHandle}\`,
      facebook: \`https://www.facebook.com/\${cleanHandle}/\`,
      youtube: \`https://www.youtube.com/results?search_query=\${encodeURIComponent(artistName + ' official channel')}\`
    },`;

const newFallback = `    origin: "Global",
    socials: {
      instagram: \`https://www.instagram.com/\${cleanHandle}/\`,
      x: \`https://x.com/\${cleanHandle}\`,
      facebook: \`https://www.facebook.com/\${cleanHandle}/\`,
      youtube: \`https://www.youtube.com/@\${cleanHandle}\`,
      spotify: \`https://open.spotify.com/search/\${encodeURIComponent(artistName)}\`
    },`;

cat = cat.replace(oldFallback, newFallback);
cat = cat.replace(oldFallback.replace(/\n/g, '\r\n'), newFallback.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/catalogService.js', cat, 'utf8');
console.log('Successfully patched src/catalogService.js fallback');

// Patch musicService.js
let mus = fs.readFileSync('src/musicService.js', 'utf8');
const oldMus = `      socials: {
        instagram: \`https://www.instagram.com/\${cleanHandle}/\`,
        x: \`https://x.com/\${cleanHandle}\`,
        facebook: \`https://www.facebook.com/\${cleanHandle}/\`,
        youtube: \`https://www.youtube.com/results?search_query=\${encodeURIComponent(canonicalName + ' official channel')}\`
      },`;

const newMus = `      origin: "Global",
      socials: {
        instagram: \`https://www.instagram.com/\${cleanHandle}/\`,
        x: \`https://x.com/\${cleanHandle}\`,
        facebook: \`https://www.facebook.com/\${cleanHandle}/\`,
        youtube: \`https://www.youtube.com/@\${cleanHandle}\`,
        spotify: \`https://open.spotify.com/search/\${encodeURIComponent(canonicalName)}\`
      },`;

mus = mus.replace(oldMus, newMus);
mus = mus.replace(oldMus.replace(/\n/g, '\r\n'), newMus.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/musicService.js', mus, 'utf8');
console.log('Successfully patched src/musicService.js fallback');

