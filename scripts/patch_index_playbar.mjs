import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const regex = /<img id="player-thumb" src="\.\/music-cover\.svg" alt="Album Art" class="player-thumb album-art" onerror="this\.onerror=null; this\.src='\.\/music-cover\.svg';">[\r\n\s]+<div class="player-info song-text">[\r\n\s]+<div style="display: flex; align-items: center; gap: 6px; min-width: 0;">[\r\n\s]+<span id="player-title" class="player-title song-title">Select a Song<\/span>[\s\S]*?<span id="player-artist" class="player-artist artist">Pulse Music<\/span>/;

const replacement = `<img id="player-thumb" src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/600x600bb.jpg" alt="Album Art" class="player-thumb album-art" onerror="this.onerror=null; this.src='https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/600x600bb.jpg';">
        <div class="player-info song-text">
          <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
            <span id="player-title" class="player-title song-title">Blinding Lights</span>
            <span class="playbar-quality-badge" id="playbar-quality-badge" title="Master Audio Stream"><i class="fa-solid fa-bolt"></i> HI-FI</span>
            <div id="playbar-eq-wave" class="playbar-eq-wave hidden" title="Playing Lossless Audio">
              <span class="eq-bar eq-b1"></span>
              <span class="eq-bar eq-b2"></span>
              <span class="eq-bar eq-b3"></span>
              <span class="eq-bar eq-b4"></span>
            </div>
          </div>
          <span id="player-artist" class="player-artist artist">The Weeknd</span>`;

if (regex.test(html)) {
  html = html.replace(regex, replacement);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully updated index.html player-thumb and initial track info!');
} else {
  console.warn('Could not match regex in index.html');
}

