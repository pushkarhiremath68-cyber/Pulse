import fs from 'fs';

let content = fs.readFileSync('src/firestoreService.js', 'utf8');

const target1 = `  const uid = getCurrentUserId();
  const historyEntry = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album || '',
    coverUrl: track.coverUrl,
    duration: track.duration,
    streamUrl: track.streamUrl,
    playedAt: Date.now()
  };`;

const replace1 = `  const uid = getCurrentUserId();
  const coverUrl = track.coverUrl || track.cover || (track.ytId ? \`https://i.ytimg.com/vi/\${track.ytId}/hqdefault.jpg\` : (track.id && String(track.id).startsWith('ytm-') ? \`https://i.ytimg.com/vi/\${String(track.id).replace('ytm-', '')}/hqdefault.jpg\` : ''));
  const historyEntry = {
    id: track.id,
    ytId: track.ytId || (String(track.id).startsWith('ytm-') ? String(track.id).replace('ytm-', '') : ''),
    title: track.title,
    artist: track.artist,
    album: track.album || '',
    coverUrl: coverUrl || './music-cover.svg',
    duration: track.duration,
    streamUrl: track.streamUrl,
    playedAt: Date.now()
  };`;

// Use regex with \r? to match CRLF
const regex1 = /const uid = getCurrentUserId\(\);[\r\n\s]+const historyEntry = \{[\r\n\s]+id: track\.id,[\r\n\s]+title: track\.title,[\r\n\s]+artist: track\.artist,[\r\n\s]+album: track\.album \|\| '',[\r\n\s]+coverUrl: track\.coverUrl,[\r\n\s]+duration: track\.duration,[\r\n\s]+streamUrl: track\.streamUrl,[\r\n\s]+playedAt: Date\.now\(\)[\r\n\s]+\};/;

if (regex1.test(content)) {
  content = content.replace(regex1, replace1);
  console.log('Successfully updated addToHistory in firestoreService.js!');
} else {
  console.warn('Regex1 did not match');
}

// In getHistory, auto-heal existing history items
const getHistoryRegex = /export async function getHistory\(limitCount = 50\) \{[\r\n\s]+const uid = getCurrentUserId\(\);[\r\n\s]+const local = getLocalData\(LOCAL_HISTORY_KEY\);/;
const getHistoryReplace = `export async function getHistory(limitCount = 50) {
  const uid = getCurrentUserId();
  let local = getLocalData(LOCAL_HISTORY_KEY);

  const healHistoryItem = (item) => {
    if (!item) return item;
    if (!item.coverUrl || item.coverUrl === './music-cover.svg' || item.coverUrl.trim() === '') {
      if (item.cover && item.cover !== './music-cover.svg') {
        item.coverUrl = item.cover;
      } else if (item.ytId) {
        item.coverUrl = \`https://i.ytimg.com/vi/\${item.ytId}/hqdefault.jpg\`;
      } else if (item.id && String(item.id).startsWith('ytm-')) {
        item.coverUrl = \`https://i.ytimg.com/vi/\${String(item.id).replace('ytm-', '')}/hqdefault.jpg\`;
      } else if (typeof window !== 'undefined' && window.catalogService?.findCatalogCover) {
        const found = window.catalogService.findCatalogCover(item.title, item.artist);
        if (found) item.coverUrl = found;
      }
    }
    return item;
  };

  local = local.map(healHistoryItem);`;

if (getHistoryRegex.test(content)) {
  content = content.replace(getHistoryRegex, getHistoryReplace);
  console.log('Successfully updated getHistory in firestoreService.js!');
} else {
  console.warn('getHistoryRegex did not match');
}

fs.writeFileSync('src/firestoreService.js', content, 'utf8');
