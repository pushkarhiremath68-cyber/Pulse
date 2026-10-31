import fs from 'fs';

let content = fs.readFileSync('src/main.js', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Add window.renderSidebarFollowedArtists and enhance window.toggleFollowArtist
const oldFollowSection = `  window.toggleFollowArtist = function(targetName) {
    const artist = window.pulseState.currentArtistData;
    const name = targetName || (artist ? artist.name : '');
    if (!name) return;

    let list = window.getFollowedArtists();
    const norm = name.toLowerCase().trim();
    const idx = list.findIndex(a => a.toLowerCase().trim() === norm);
    let isNowFollowing = false;

    if (idx >= 0) {
      list.splice(idx, 1);
      isNowFollowing = false;
      window.showToast(\`Unfollowed \${name}\`, 'info', 2000);
    } else {
      list.push(name);
      isNowFollowing = true;
      window.showToast(\`Following \${name}! 🎉\`, 'success', 2500);
    }

    try {
      localStorage.setItem('pulse_followed_artists', JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save pulse_followed_artists', e);
    }

    window.updateArtistFollowButton(name, isNowFollowing);
  };`;

const newFollowSection = `  window.renderSidebarFollowedArtists = function() {
    const container = document.getElementById('sidebar-followed-list');
    const badge = document.getElementById('sidebar-followed-badge');
    if (!container) return;

    const followed = window.getFollowedArtists();
    if (badge) badge.textContent = followed.length;

    if (followed.length === 0) {
      container.innerHTML = \`
        <div style="padding: 0.75rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px dashed var(--border-glass);">
          <i class="fa-regular fa-heart" style="color: #a855f7; margin-bottom: 4px; display: block; font-size: 1rem;"></i>
          <span>Follow artists to see them here!</span>
          <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
            <button onclick="window.toggleFollowArtist('Arijit Singh')" style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); color: #c084fc; border-radius: 8px; padding: 4px 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; text-align: left; display: flex; align-items: center; justify-content: space-between;">
              <span>Arijit Singh</span> <span style="font-weight: 800;">+ Follow</span>
            </button>
            <button onclick="window.toggleFollowArtist('The Weeknd')" style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); color: #c084fc; border-radius: 8px; padding: 4px 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; text-align: left; display: flex; align-items: center; justify-content: space-between;">
              <span>The Weeknd</span> <span style="font-weight: 800;">+ Follow</span>
            </button>
          </div>
        </div>
      \`;
      return;
    }

    container.innerHTML = followed.map(name => {
      const details = window.catalogService ? window.catalogService.getArtistDetails(name) : null;
      const avatar = details?.avatar || details?.banner || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(name)}&backgroundColor=8b5cf6\`;
      const safeName = name.replace(/'/g, "\\\\'");
      return \`
        <div class="sidebar-artist-item hover-glow" onclick="window.openArtistView('\${safeName}')" style="display: flex; align-items: center; gap: 0.65rem; padding: 0.45rem 0.6rem; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; background: rgba(255,255,255,0.02); border: 1px solid transparent;">
          <img src="\${avatar}" alt="\${escapeHtml(name)}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1.5px solid rgba(168,85,247,0.5);" onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(name)}&backgroundColor=8b5cf6';">
          <span style="flex: 1; font-size: 0.82rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${escapeHtml(name)}</span>
          <button onclick="event.stopPropagation(); window.toggleFollowArtist('\${safeName}')" title="Unfollow" style="background: none; border: none; color: #10b981; font-size: 0.75rem; cursor: pointer; padding: 2px 4px; opacity: 0.8; transition: opacity 0.2s;" onmouseenter="this.style.color='#f43f5e'; this.innerHTML='<i class=\\\\'fa-solid fa-xmark\\\\'></i>'" onmouseleave="this.style.color='#10b981'; this.innerHTML='<i class=\\\\'fa-solid fa-check\\\\'></i>'">
            <i class="fa-solid fa-check"></i>
          </button>
        </div>
      \`;
    }).join('');
  };

  window.toggleFollowArtist = function(targetName) {
    const artist = window.pulseState.currentArtistData;
    const name = targetName || (artist ? artist.name : '');
    if (!name) return;

    let list = window.getFollowedArtists();
    const norm = name.toLowerCase().trim();
    const idx = list.findIndex(a => a.toLowerCase().trim() === norm);
    let isNowFollowing = false;

    if (idx >= 0) {
      list.splice(idx, 1);
      isNowFollowing = false;
      window.showToast(\`Unfollowed \${name}\`, 'info', 2000);
    } else {
      list.push(name);
      isNowFollowing = true;
      window.showToast(\`Following \${name}! 🎉\`, 'success', 2500);
    }

    try {
      localStorage.setItem('pulse_followed_artists', JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save pulse_followed_artists', e);
    }

    window.updateArtistFollowButton(name, isNowFollowing);
    if (typeof window.renderSidebarFollowedArtists === 'function') {
      window.renderSidebarFollowedArtists();
    }

    // Update all matching search artist follow buttons
    document.querySelectorAll('.search-artist-follow-btn').forEach(btn => {
      if ((btn.getAttribute('data-artist-name') || '').toLowerCase().trim() === norm) {
        if (isNowFollowing) {
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Following';
          btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
          btn.style.color = '#ffffff';
        } else {
          btn.innerHTML = '<i class="fa-solid fa-plus"></i> Follow';
          btn.style.background = 'rgba(168, 85, 247, 0.15)';
          btn.style.color = '#c084fc';
        }
      }
    });
  };`;

if (!content.includes(oldFollowSection)) {
  console.error('Could not find oldFollowSection in src/main.js');
  process.exit(1);
}

content = content.replace(oldFollowSection, newFollowSection);
console.log('Replaced oldFollowSection with new renderSidebarFollowedArtists and enhanced toggleFollowArtist');

// 2. Replace search execution and rendering
const searchStartMarker = '  window.executeSearch = function(query, isTyping = false) {';
const searchEndMarker = '  // ---------------------------------------------------------------------------\n  // 5. USER LIBRARY (FAVORITES, PLAYLISTS, HISTORY)';

const searchStartIndex = content.indexOf(searchStartMarker);
const searchEndIndex = content.indexOf(searchEndMarker);

if (searchStartIndex === -1 || searchEndIndex === -1) {
  console.error('Could not locate search start or end index', { searchStartIndex, searchEndIndex });
  process.exit(1);
}

const newSearchSection = `  window.executeSearch = function(query, isTyping = false) {
    if (!query || query.trim().length === 0) return;
    window.switchView('search-view');

    const label = document.getElementById('search-query-label');
    const count = document.getElementById('search-count');
    if (label) label.textContent = query;

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
      if (count) count.textContent = 'Searching worldwide & multilingual catalogs...';
      const gen = ++searchGeneration;
      const matchingArtists = window.catalogService && typeof window.catalogService.searchArtists === 'function'
        ? window.catalogService.searchArtists(query)
        : [];
      const results = await window.musicService.searchTracks(query, 50);
      if (gen !== searchGeneration) return; // Stale search
      if (count) {
        if (matchingArtists.length > 0) {
          count.textContent = \`\${matchingArtists.length} artist\${matchingArtists.length > 1 ? 's' : ''} & \${results.length} songs found\`;
        } else {
          count.textContent = \`\${results.length} songs found worldwide\`;
        }
      }
      renderSearchResults(results, matchingArtists);
    }, isTyping ? 500 : 0);
  };

  function renderSearchResults(tracks, matchingArtists = []) {
    const container = document.getElementById('search-results-container');
    const artistsSection = document.getElementById('search-artists-section');
    const artistsContainer = document.getElementById('search-artists-container');
    if (!container) return;

    // Render Matching Artists if found
    if (artistsSection && artistsContainer) {
      if (matchingArtists && matchingArtists.length > 0) {
        artistsSection.style.display = 'block';
        artistsContainer.innerHTML = matchingArtists.map(art => {
          const isFollowing = window.isArtistFollowed(art.name);
          const safeName = art.name.replace(/'/g, "\\\\'");
          return \`
            <div class="search-artist-card hover-glow" onclick="window.openArtistView('\${safeName}')" style="display: flex; align-items: center; gap: 0.9rem; padding: 0.75rem 1.15rem; background: rgba(255,255,255,0.035); border: 1px solid var(--border-glass); border-radius: 16px; cursor: pointer; min-width: 260px; max-width: 320px; flex-shrink: 0; transition: all 0.25s ease;">
              <img src="\${art.avatar || './music-cover.svg'}" alt="\${escapeHtml(art.name)}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid rgba(168,85,247,0.5);" onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(art.name)}&backgroundColor=8b5cf6';">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <span style="font-weight: 800; font-size: 0.95rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${escapeHtml(art.name)}</span>
                  <i class="fa-solid fa-circle-check" style="color: #38bdf8; font-size: 0.75rem;" title="Verified Artist"></i>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${escapeHtml(art.genre || 'Master Artist')} &bull; \${escapeHtml(art.followersCount || '10M+')}</div>
              </div>
              <button class="search-artist-follow-btn" data-artist-name="\${escapeHtml(art.name)}" onclick="event.stopPropagation(); window.toggleFollowArtist('\${safeName}')" style="padding: 0.4rem 0.8rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; cursor: pointer; border: 1px solid rgba(168,85,247,0.4); flex-shrink: 0; transition: all 0.2s ease; \${isFollowing ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff;' : 'background: rgba(168, 85, 247, 0.15); color: #c084fc;'}">
                \${isFollowing ? '<i class="fa-solid fa-check"></i> Following' : '<i class="fa-solid fa-plus"></i> Follow'}
              </button>
            </div>
          \`;
        }).join('');
      } else {
        artistsSection.style.display = 'none';
        artistsContainer.innerHTML = '';
      }
    }

    if ((!tracks || tracks.length === 0) && (!matchingArtists || matchingArtists.length === 0)) {
      container.innerHTML = \`
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-compact-disc" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; color: var(--accent-primary);"></i>
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.5rem;">No audio tracks found</h3>
          <p>Try searching for a song, artist, album, or regional language name.</p>
        </div>
      \`;
      return;
    }

    window.__searchResults = tracks || [];

    window.playSearchTrack = function(index) {
      if (!window.__searchResults || !window.__searchResults[index]) return;
      const track = window.__searchResults[index];
      window.playTrackDirect(track, window.__searchResults);
    };

    container.innerHTML = (tracks || []).map((track, idx) => {
      const isTopMatch = idx === 0 && (track._relevanceScore !== undefined ? track._relevanceScore >= 140 : true);
      const badgeText = isTopMatch ? '★ Best Match' : (track.source || '320kbps Master');
      return window.renderSongCard(track, idx, 'window.__searchResults', { badge: badgeText });
    }).join('');
  }\n\n`;

content = content.substring(0, searchStartIndex) + newSearchSection + content.substring(searchEndIndex);
console.log('Replaced search section with artist shelf support');

// Also add call to renderSidebarFollowedArtists inside window.renderHomeDiscovery
const homeDiscoveryTarget = 'window.renderHomeDiscovery = function() {\n    // 0. Initialize Showcase Hero Carousel\n    window.initHeroCarousel();';
const homeDiscoveryReplacement = 'window.renderHomeDiscovery = function() {\n    // Render followed artists in sidebar\n    if (window.renderSidebarFollowedArtists) window.renderSidebarFollowedArtists();\n\n    // 0. Initialize Showcase Hero Carousel\n    window.initHeroCarousel();';

if (content.includes(homeDiscoveryTarget)) {
  content = content.replace(homeDiscoveryTarget, homeDiscoveryReplacement);
  console.log('Added renderSidebarFollowedArtists to renderHomeDiscovery');
}

// Also call renderSidebarFollowedArtists on app load
const authGateTarget = 'if (document.readyState === \'loading\') {\n    document.addEventListener(\'DOMContentLoaded\', () => {\n      removeFilterPillsBar();\n      checkAuthGateState();';
const authGateReplacement = 'if (document.readyState === \'loading\') {\n    document.addEventListener(\'DOMContentLoaded\', () => {\n      removeFilterPillsBar();\n      checkAuthGateState();\n      if (window.renderSidebarFollowedArtists) window.renderSidebarFollowedArtists();';

if (content.includes(authGateTarget)) {
  content = content.replace(authGateTarget, authGateReplacement);
  console.log('Added renderSidebarFollowedArtists to DOMContentLoaded');
}

fs.writeFileSync('src/main.js', content, 'utf8');
console.log('Successfully patched src/main.js for followed artists and artist search!');
