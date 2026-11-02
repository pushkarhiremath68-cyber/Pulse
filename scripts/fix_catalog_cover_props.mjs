import fs from 'fs';

let content = fs.readFileSync('src/catalogService.js', 'utf8');

// 1. Locate CATALOG_CATEGORIES block
const startIdx = content.indexOf('export const CATALOG_CATEGORIES = [');
const endIdx = content.indexOf('export const LANGUAGE_PLAYLISTS = [');

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find CATALOG_CATEGORIES bounds');
  process.exit(1);
}

let catBlock = content.slice(startIdx, endIdx);
// Replace every `cover: "URL"` with `coverUrl: "URL", cover: "URL"`
catBlock = catBlock.replace(/cover:\s*"([^"]+)"/g, 'coverUrl: "$1", cover: "$1"');
content = content.slice(0, startIdx) + catBlock + content.slice(endIdx);

// 2. Replace getNewReleasesShelf using regex
const regex = /export const getNewReleasesShelf = \(\) => \{[\s\S]*?return cat \? cat\.tracks : \[\];\s*\};/;
const replacement = `export const getNewReleasesShelf = () => {
  let tracks = [];
  if (typeof window !== 'undefined' && window.newReleasesService && typeof window.newReleasesService.getCachedNewReleases === 'function') {
    tracks = window.newReleasesService.getCachedNewReleases();
  } else {
    const cat = CATALOG_CATEGORIES.find(c => c.id === 'cat-new-releases');
    tracks = cat ? cat.tracks : [];
  }
  return (tracks || []).map(t => ({
    ...t,
    coverUrl: t.coverUrl || t.cover || (t.ytId ? \`https://i.ytimg.com/vi/\${t.ytId}/hqdefault.jpg\` : './music-cover.svg'),
    cover: t.cover || t.coverUrl || (t.ytId ? \`https://i.ytimg.com/vi/\${t.ytId}/hqdefault.jpg\` : './music-cover.svg')
  }));
};`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  console.log('Replaced getNewReleasesShelf');
} else {
  console.warn('Could not match getNewReleasesShelf with regex');
}

fs.writeFileSync('src/catalogService.js', content, 'utf8');
console.log('Finished updating CATALOG_CATEGORIES covers!');
