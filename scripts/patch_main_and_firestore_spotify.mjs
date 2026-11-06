import fs from 'fs';

// 1. PATCH src/main.js
let mainCode = fs.readFileSync('src/main.js', 'utf8');

// A. Patch socials in openArtistView
const oldSocials = `        socialsContainer.innerHTML = \`
          <span style="font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 4px;">Connect:</span>
          <a href="\${art.socials.instagram}" target="_blank" rel="noopener noreferrer" class="artist-social-chip hover-glow" title="Instagram @\${escapeHtml(art.name)}">
            <i class="fa-brands fa-instagram" style="color: #e1306c;"></i> Instagram
          </a>
          <a href="\${art.socials.x}" target="_blank" rel="noopener noreferrer" class="artist-social-chip hover-glow" title="X (Twitter) @\${escapeHtml(art.name)}">
            \${xSvg} X
          </a>
          <a href="\${art.socials.facebook}" target="_blank" rel="noopener noreferrer" class="artist-social-chip hover-glow" title="Facebook @\${escapeHtml(art.name)}">
            <i class="fa-brands fa-facebook" style="color: #1877f2;"></i> Facebook
          </a>
          <a href="\${art.socials.youtube}" target="_blank" rel="noopener noreferrer" class="artist-social-chip hover-glow" title="YouTube @\${escapeHtml(art.name)}">
            <i class="fa-brands fa-youtube" style="color: #ff0000;"></i> YouTube
          </a>
        \`;`;

const newSocials = `        const spotifyUrl = art.socials.spotify || ('https://open.spotify.com/search/' + encodeURIComponent(art.name));
        socialsContainer.innerHTML = \`
          <span style="font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 4px;">Connect:</span>
          <a href="\${spotifyUrl}" target="_blank" rel="noopener noreferrer" class="artist-social-chip hover-glow" title="Spotify Profile @\${escapeHtml(art.name)}" style="background: rgba(30, 215, 96, 0.12); border-color: rgba(30, 215, 96, 0.35); color: #1ed760;">
            <i class="fa-brands fa-spotify" style="color: #1ed760; font-size: 1rem;"></i> Spotify
          </a>
          <a href="\${art.socials.instagram}" target="_blank" rel="noopener noreferrer" class="artist-social-chip hover-glow" title="Instagram @\${escapeHtml(art.name)}">
            <i class="fa-brands fa-instagram" style="color: #e1306c;"></i> Instagram
          </a>
          <a href="\${art.socials.x}" target="_blank" rel="noopener noreferrer" class="artist-social-chip hover-glow" title="X (Twitter) @\${escapeHtml(art.name)}">
            \${xSvg} X
          </a>
          <a href="\${art.socials.facebook}" target="_blank" rel="noopener noreferrer" class="artist-social-chip hover-glow" title="Facebook @\${escapeHtml(art.name)}">
            <i class="fa-brands fa-facebook" style="color: #1877f2;"></i> Facebook
          </a>
          <a href="\${art.socials.youtube}" target="_blank" rel="noopener noreferrer" class="artist-social-chip hover-glow" title="YouTube @\${escapeHtml(art.name)}">
            <i class="fa-brands fa-youtube" style="color: #ff0000;"></i> YouTube
          </a>
        \`;`;

// B. Patch about container in openArtistView
const oldAbout = `      // Render Spotify-Grade About Section
      const aboutBox = document.getElementById('artist-about-container');
      if (aboutBox) {
        aboutBox.innerHTML = \`
          <div style="background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border: 1px solid var(--border-glass); border-radius: 20px; padding: 2rem; box-shadow: 0 12px 36px rgba(0,0,0,0.35);">
            <div style="display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap;">
              <img src="\${art.avatar || art.banner}" alt="\${escapeHtml(art.name)}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 24px rgba(0,0,0,0.5); border: 2px solid rgba(168,85,247,0.5); flex-shrink: 0;" onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(art.name)}&backgroundColor=8b5cf6';">
              <div style="flex: 1; min-width: 250px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.4rem;">
                  <span style="font-size: 1.4rem; font-weight: 800; color: #fff;">\${escapeHtml(art.name)}</span>
                  <i class="fa-solid fa-circle-check" style="color: #38bdf8; font-size: 1.1rem;" title="Verified on Spotify & Pulse"></i>
                </div>
                <div style="font-size: 0.9rem; color: #38bdf8; font-weight: 700; margin-bottom: 0.5rem;">\${escapeHtml(art.worldRank || '#1 Verified')}</div>
                <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.7; margin: 0;">\${escapeHtml(art.bio)}</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem;">
              <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Monthly Listeners</div>
                <div style="font-size: 1.35rem; font-weight: 800; color: #38bdf8; margin-top: 4px;">\${escapeHtml(art.monthlyListeners || '25,000,000')}</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">Verified Spotify stream tier</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Global Followers</div>
                <div style="font-size: 1.35rem; font-weight: 800; color: #c084fc; margin-top: 4px;">\${escapeHtml(art.followersCount || '18,500,000')}</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">Dedicated fan community</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Discography</div>
                <div style="font-size: 1.35rem; font-weight: 800; color: #10b981; margin-top: 4px;">Top 10 Master Singles</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">Full studio audio available</div>
              </div>
            </div>
          </div>
        \`;
      }`;

const newAbout = `      // Render Spotify-Grade About Section
      const aboutBox = document.getElementById('artist-about-container');
      if (aboutBox) {
        const spotifyUrl = (art.socials && art.socials.spotify) ? art.socials.spotify : ('https://open.spotify.com/search/' + encodeURIComponent(art.name));
        const originText = art.origin || 'International';
        aboutBox.innerHTML = \`
          <div style="background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border: 1px solid var(--border-glass); border-radius: 20px; padding: 2rem; box-shadow: 0 12px 36px rgba(0,0,0,0.35);">
            <div style="display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap;">
              <img src="\${art.avatar || art.banner}" alt="\${escapeHtml(art.name)}" style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 24px rgba(0,0,0,0.5); border: 2px solid rgba(168,85,247,0.5); flex-shrink: 0;" onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(art.name)}&backgroundColor=8b5cf6';">
              <div style="flex: 1; min-width: 250px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.35rem; flex-wrap: wrap;">
                  <span style="font-size: 1.5rem; font-weight: 800; color: #fff;">\${escapeHtml(art.name)}</span>
                  <i class="fa-solid fa-circle-check" style="color: #38bdf8; font-size: 1.15rem;" title="Verified on Spotify & Pulse"></i>
                  <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 14px; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); color: #38bdf8; font-size: 0.75rem; font-weight: 800;">
                    \${escapeHtml(art.worldRank || '#1 Verified')}
                  </span>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 14px; background: rgba(244,63,94,0.12); border: 1px solid rgba(244,63,94,0.25); color: #fb7185; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.65rem;">
                  <i class="fa-solid fa-location-dot"></i> \${escapeHtml(originText)}
                </div>
                <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.75; margin: 0;">\${escapeHtml(art.bio)}</p>
                <div style="margin-top: 1.1rem; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                  <a href="\${spotifyUrl}" target="_blank" rel="noopener noreferrer" class="hover-glow" style="display: inline-flex; align-items: center; gap: 8px; background: #1ed760; color: #000; font-weight: 800; padding: 0.5rem 1.25rem; border-radius: 24px; text-decoration: none; box-shadow: 0 4px 14px rgba(30,215,96,0.3); font-size: 0.85rem;">
                    <i class="fa-brands fa-spotify" style="font-size: 1.1rem; color: #000;"></i> Open on Spotify
                  </a>
                  <span style="font-size: 0.78rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-bolt" style="color: #10b981;"></i> Studio master audio verified on Pulse
                  </span>
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem;">
              <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Monthly Listeners</div>
                <div style="font-size: 1.35rem; font-weight: 800; color: #38bdf8; margin-top: 4px;">\${escapeHtml(art.monthlyListeners || '25,000,000')}</div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">Verified Spotify stream tier</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Global Followers</div>
                <div style="font-size: 1.35rem; font-weight: 800; color: #c084fc; margin-top: 4px;">\${escapeHtml(art.followersCount || '18,500,000')}</div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">Dedicated fan community</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Origin / Hometown</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #fb7185; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="\${escapeHtml(originText)}">\${escapeHtml(originText)}</div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">Verified origin</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Discography</div>
                <div style="font-size: 1.35rem; font-weight: 800; color: #10b981; margin-top: 4px;">Top 10 Master Hits</div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">Full studio audio available</div>
              </div>
            </div>
          </div>
        \`;
      }`;

// C. Patch renderSongCard in src/main.js
const oldRenderCover = `    let coverUrl = track.coverUrl || track.cover;
    if (!coverUrl || coverUrl === './music-cover.svg' || coverUrl.includes('music-cover.svg')) {
      if (ytId && ytId.length >= 8) {
        coverUrl = \`https://i.ytimg.com/vi/\${ytId}/hqdefault.jpg\`;
      } else if (window.catalogService && typeof window.catalogService.findCatalogCover === 'function') {
        const found = window.catalogService.findCatalogCover(track.title, track.artist);
        if (found) coverUrl = found;
      }
    }
    if (!coverUrl) {
      coverUrl = \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(track.title || 'Track')}&backgroundColor=8b5cf6\`;
    }`;

const newRenderCover = `    let coverUrl = track.coverUrl || track.cover;
    if (!coverUrl || coverUrl === './music-cover.svg' || coverUrl.includes('music-cover.svg')) {
      coverUrl = '';
      if (ytId && ytId.length >= 8) {
        coverUrl = \`https://i.ytimg.com/vi/\${ytId}/hqdefault.jpg\`;
      } else if (window.catalogService && typeof window.catalogService.findCatalogCover === 'function') {
        const found = window.catalogService.findCatalogCover(track.title, track.artist);
        if (found) coverUrl = found;
      }
    }
    if (!coverUrl || coverUrl.includes('music-cover.svg')) {
      if (track.artist && window.catalogService?.ARTIST_DATABASE) {
        const art = Object.values(window.catalogService.ARTIST_DATABASE).find(a => 
          (a.name || '').toLowerCase() === (track.artist || '').toLowerCase()
        );
        if (art && (art.avatar || art.banner)) coverUrl = art.avatar || art.banner;
      }
    }
    if (!coverUrl || coverUrl.includes('music-cover.svg')) {
      coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
    }`;

// Apply replacements handling CRLF
function replaceNormalized(source, oldBlock, newBlock) {
  if (source.includes(oldBlock)) {
    return source.replace(oldBlock, newBlock);
  }
  const crlfOld = oldBlock.replace(/\n/g, '\r\n');
  const crlfNew = newBlock.replace(/\n/g, '\r\n');
  if (source.includes(crlfOld)) {
    return source.replace(crlfOld, crlfNew);
  }
  console.warn("Could not find block to replace");
  return source;
}

mainCode = replaceNormalized(mainCode, oldSocials, newSocials);
mainCode = replaceNormalized(mainCode, oldAbout, newAbout);
mainCode = replaceNormalized(mainCode, oldRenderCover, newRenderCover);

fs.writeFileSync('src/main.js', mainCode, 'utf8');
console.log('Successfully updated src/main.js');

// 2. PATCH src/firestoreService.js
let fsCode = fs.readFileSync('src/firestoreService.js', 'utf8');

const oldHistoryAdd = `  const uid = getCurrentUserId();
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

const newHistoryAdd = `  const uid = getCurrentUserId();
  let coverUrl = track.coverUrl || track.cover || '';
  if (!coverUrl || coverUrl.includes('music-cover.svg')) {
    coverUrl = '';
    if (track.ytId) {
      coverUrl = \`https://i.ytimg.com/vi/\${track.ytId}/hqdefault.jpg\`;
    } else if (track.id && String(track.id).startsWith('ytm-')) {
      coverUrl = \`https://i.ytimg.com/vi/\${String(track.id).replace('ytm-', '')}/hqdefault.jpg\`;
    } else if (typeof window !== 'undefined' && window.catalogService?.findCatalogCover) {
      coverUrl = window.catalogService.findCatalogCover(track.title, track.artist) || '';
    }
  }
  if (!coverUrl || coverUrl.includes('music-cover.svg')) {
    coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
  }
  const historyEntry = {
    id: track.id,
    ytId: track.ytId || (String(track.id).startsWith('ytm-') ? String(track.id).replace('ytm-', '') : ''),
    title: track.title,
    artist: track.artist,
    album: track.album || '',
    coverUrl: coverUrl,
    duration: track.duration,
    streamUrl: track.streamUrl,
    playedAt: Date.now()
  };`;

const oldHeal = `  const healHistoryItem = (item) => {
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
  };`;

const newHeal = `  const healHistoryItem = (item) => {
    if (!item) return item;
    if (!item.coverUrl || item.coverUrl === './music-cover.svg' || item.coverUrl.includes('music-cover.svg') || item.coverUrl.trim() === '') {
      item.coverUrl = '';
      if (item.cover && !item.cover.includes('music-cover.svg')) {
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
    if (!item.coverUrl || item.coverUrl.includes('music-cover.svg')) {
      item.coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
    }
    return item;
  };`;

fsCode = replaceNormalized(fsCode, oldHistoryAdd, newHistoryAdd);
fsCode = replaceNormalized(fsCode, oldHeal, newHeal);

fs.writeFileSync('src/firestoreService.js', fsCode, 'utf8');
console.log('Successfully updated src/firestoreService.js');
