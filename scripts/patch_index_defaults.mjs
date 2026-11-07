import fs from 'fs';

const filePath = 'index.html';
let html = fs.readFileSync(filePath, 'utf8');

const WEEKND_COVER = 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/600x600bb.jpg';

// 1. Drawer Now Playing
html = html.replace(
  `<img id="drawer-np-thumb" src="./assets/music-cover-MfJ9DAMu.svg" alt="thumb" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover;">`,
  `<img id="drawer-np-thumb" src="${WEEKND_COVER}" alt="thumb" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover;" onerror="this.onerror=null; this.src='${WEEKND_COVER}';">`
);

html = html.replace(
  `<div id="drawer-np-title" style="font-size: 0.95rem; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Select a Song</div>`,
  `<div id="drawer-np-title" style="font-size: 0.95rem; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Blinding Lights</div>`
);

html = html.replace(
  `<div id="drawer-np-artist" style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pulse Music</div>`,
  `<div id="drawer-np-artist" style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">The Weeknd</div>`
);

// 2. Share modal cover
html = html.replace(
  `<img id="share-modal-cover" src="./music-cover.svg" alt="Cover"`,
  `<img id="share-modal-cover" src="${WEEKND_COVER}" alt="Cover"`
);

// 3. Fullscreen player titles
html = html.replace(
  `<h2 id="fs-track-title" class="fs-title">Select a Song</h2>`,
  `<h2 id="fs-track-title" class="fs-title">Blinding Lights</h2>`
);

html = html.replace(
  `<span id="fs-track-artist" class="fs-artist">Pulse Music</span>`,
  `<span id="fs-track-artist" class="fs-artist">The Weeknd</span>`
);

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated index.html defaults');

