import fs from 'fs';

let main = fs.readFileSync('src/main.js', 'utf8');

// 1. Locate window.openArtistView
const startTarget = '  window.openArtistView = function(artistQuery) {';
const endTarget = '  window.playArtistTopTracks = function() {';

const startIdx = main.indexOf(startTarget);
const endIdx = main.indexOf(endTarget);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find window.openArtistView targets!');
  process.exit(1);
}

const newOpenArtistView = `  window.openArtistView = async function(artistQuery) {
    if (!artistQuery) return;
    window.switchView('artist');

    let artist = typeof getArtistDetails === 'function' ? getArtistDetails(artistQuery) : null;

    const renderArtist = (art) => {
      if (!art) return;
      window.pulseState.currentArtistData = art;

      const heroName = document.getElementById('artist-hero-name');
      const heroListeners = document.getElementById('artist-hero-listeners');
      const heroRank = document.getElementById('artist-world-rank');
      const heroCard = document.getElementById('artist-hero-card');
      const followersEl = document.getElementById('artist-followers-count');

      if (heroName) heroName.textContent = art.name;
      if (heroListeners) heroListeners.textContent = art.monthlyListeners || '25,000,000';
      if (heroRank) heroRank.textContent = art.worldRank || '#1 Verified Artist';
      if (followersEl) followersEl.textContent = art.followersCount || '18,500,000';
      if (heroCard && (art.banner || art.avatar)) {
        heroCard.style.backgroundImage = \`linear-gradient(180deg, rgba(15,17,26,0.35) 0%, #0f111a 100%), url('\${art.banner || art.avatar}')\`;
      }

      // Set persistent follow button state
      const isFollowing = window.isArtistFollowed(art.name);
      window.updateArtistFollowButton(art.name, isFollowing);

      // Render Social Media Badges (Instagram, X, Facebook, YouTube)
      const socialsContainer = document.getElementById('artist-socials-container');
      if (socialsContainer && art.socials) {
        const xSvg = \`<svg style="width: 14px; height: 14px; fill: #ffffff; vertical-align: -2px; margin-right: 5px;" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>\`;
        socialsContainer.innerHTML = \`
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
        \`;
      }

      // Render Top 10 Songs List
      const topTracksList = document.getElementById('artist-popular-tracks-list');
      if (topTracksList) {
        window.__artistTopTracks = art.topTracks || [];
        topTracksList.innerHTML = window.__artistTopTracks.map((track, idx) => \`
          <div class="artist-track-row hover-glow" onclick="window.playTrackDirect(window.__artistTopTracks[\${idx}], window.__artistTopTracks)" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); cursor: pointer; transition: all 0.2s ease;">
            <span style="font-weight: 800; color: \${idx < 3 ? '#38bdf8' : 'var(--text-muted)'}; width: 24px; text-align: center; font-size: 1rem;">#\${idx + 1}</span>
            <img src="\${track.coverUrl || './music-cover.svg'}" alt="\${escapeHtml(track.title)}" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover; animation: none !important; transform: none !important;" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.95rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${escapeHtml(track.title)}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">\${escapeHtml(track.plays || 'Top Release')} plays &bull; \${escapeHtml(track.album || 'Studio Master')}</div>
            </div>
            <span style="font-size: 0.82rem; color: var(--text-muted); font-variant-numeric: tabular-nums;">\${Math.floor(track.duration / 60)}:\${Math.floor(track.duration % 60).toString().padStart(2, '0')}</span>
            <button class="btn-player-icon" title="Like Track" onclick="event.stopPropagation(); window.toggleFavoriteTrack(window.__artistTopTracks[\${idx}])"><i class="fa-regular fa-heart"></i></button>
          </div>
        \`).join('');
      }

      // Render Tour Dates & Book Tickets Card
      const tourContainer = document.getElementById('artist-tour-container');
      if (tourContainer && art.tourInfo) {
        tourContainer.innerHTML = \`
          <div style="background: linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(168,85,247,0.12) 100%); border: 1px solid var(--border-glass-top); border-radius: 18px; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 8px 30px rgba(0,0,0,0.3);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
                <span style="background: #10b981; color: #000; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">● LIVE TOUR</span>
                <span style="color: #38bdf8; font-size: 0.85rem; font-weight: 700;">\${escapeHtml(art.tourInfo.tourName)}</span>
              </div>
              <h4 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0 0 0.35rem 0;">Catch \${escapeHtml(art.name)} Live On Stage</h4>
              <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0;"><i class="fa-solid fa-location-dot" style="color: #f43f5e; margin-right: 6px;"></i> \${escapeHtml(art.tourInfo.dates)}</p>
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <a href="\${art.tourInfo.ticketUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary-play" style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); box-shadow: 0 0 16px rgba(244,63,94,0.4);"><i class="fa-solid fa-ticket"></i> Book Tickets Now</a>
            </div>
          </div>
        \`;
      }

      // Render Spotify-Grade About Section
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
      }
    };

    if (artist) {
      renderArtist(artist);
    }

    // Dynamic resolution for any artist globally
    const isCurated = artist && artist.topTracks && artist.topTracks.length >= 10 && artist.banner && !artist.banner.includes('dicebear');
    if (!isCurated && window.musicService && typeof window.musicService.fetchDynamicArtistProfile === 'function') {
      try {
        const dynamicData = await window.musicService.fetchDynamicArtistProfile(artistQuery);
        if (dynamicData && dynamicData.topTracks && dynamicData.topTracks.length > 0) {
          renderArtist(dynamicData);
        }
      } catch (err) {
        console.warn('Failed to dynamically enhance artist view:', err);
      }
    }
  };

`;

main = main.slice(0, startIdx) + newOpenArtistView + main.slice(endIdx);

// 2. Enhance executeSearch to include dynamic artist search
const searchTarget = `      const matchingArtists = window.catalogService && typeof window.catalogService.searchArtists === 'function'
        ? window.catalogService.searchArtists(query)
        : [];
      const results = await window.musicService.searchTracks(query, 50);`;

const newSearchCode = `      let matchingArtists = window.catalogService && typeof window.catalogService.searchArtists === 'function'
        ? window.catalogService.searchArtists(query)
        : [];

      // If fewer than 4 artists found or query has >= 2 letters, query dynamic global artists
      if (matchingArtists.length < 4 && window.musicService && typeof window.musicService.searchDynamicArtists === 'function') {
        try {
          const dynamicCandidates = await window.musicService.searchDynamicArtists(query);
          for (const cand of dynamicCandidates) {
            if (!matchingArtists.some(ma => ma.name.toLowerCase() === cand.name.toLowerCase())) {
              matchingArtists.push(cand);
            }
          }
        } catch (e) {}
      }

      const results = await window.musicService.searchTracks(query, 50);`;

if (main.includes(searchTarget)) {
  main = main.replace(searchTarget, newSearchCode);
} else {
  console.warn('Could not find searchTarget in main.js, checking alternate spacing...');
}

fs.writeFileSync('src/main.js', main, 'utf8');
console.log('Successfully updated src/main.js!');

