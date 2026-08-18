import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    code = f.read()

lyrics_engine_code = """
  // =========================================================================
  // LRCLIB LIVE SYNCHRONIZED LYRICS & KARAOKE ENGINE
  // =========================================================================
  let currentLyricsData = null;
  let activeLyricIndex = -1;
  let isFullscreenLyricsActive = false;

  async function loadTrackLyrics(track) {
    if (!track) {
      currentLyricsData = null;
      activeLyricIndex = -1;
      updateLyricsUIEmpty();
      return;
    }

    // Reset previous lyrics state
    activeLyricIndex = -1;
    updateLyricsUILoading(track);

    try {
      if (!window.lyricsService || typeof window.lyricsService.getLyrics !== 'function') {
        throw new Error('lyricsService not available');
      }

      const lyrics = await window.lyricsService.getLyrics(track);
      currentLyricsData = lyrics;

      if (!lyrics || lyrics.notFound || !lyrics.lines || lyrics.lines.length === 0) {
        updateLyricsUINotFound(track);
        return;
      }

      renderLyricsToAllContainers(lyrics, track);
    } catch (err) {
      console.warn('[Pulse Lyrics Engine] Load notice:', err);
      updateLyricsUINotFound(track);
    }
  }
  window.loadTrackLyrics = loadTrackLyrics;

  function updateLyricsUILoading(track) {
    const loadingHtml = `
      <div class="lyrics-placeholder-empty">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; margin-bottom: 0.75rem; color: #c084fc; display: block;"></i>
        <p style="font-weight: 700; color: #fff;">Fetching lyrics for "${track.title || 'Song'}"...</p>
        <small style="color: var(--text-muted);">Syncing from LRCLIB free database</small>
      </div>
    `;
    ['fs-lyrics-scroller', 'lyrics-container', 'lyrics-modal-lines'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = loadingHtml;
    });

    const miniSnippet = document.getElementById('mini-playbar-lyrics-snippet');
    if (miniSnippet) miniSnippet.classList.add('hidden');
  }

  function updateLyricsUINotFound(track) {
    const notFoundHtml = `
      <div class="lyrics-placeholder-empty">
        <i class="fa-solid fa-microphone-slash" style="font-size: 2.2rem; margin-bottom: 0.75rem; color: #71717a; display: block;"></i>
        <p style="font-weight: 700; color: #e4e4e7; font-size: 1.05rem;">Lyrics preview not available for this track.</p>
        <p style="color: #a1a1aa; font-size: 0.85rem; margin-top: 0.35rem;">Instrumental, indie, or unindexed release</p>
      </div>
    `;
    ['fs-lyrics-scroller', 'lyrics-container', 'lyrics-modal-lines'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = notFoundHtml;
    });

    const miniSnippet = document.getElementById('mini-playbar-lyrics-snippet');
    if (miniSnippet) miniSnippet.classList.add('hidden');
  }

  function updateLyricsUIEmpty() {
    const emptyHtml = `
      <div class="lyrics-placeholder-empty">
        <i class="fa-solid fa-music" style="font-size: 2.2rem; margin-bottom: 0.75rem; color: #71717a; display: block;"></i>
        <p style="font-weight: 700; color: #e4e4e7;">Play a song to view live synchronized lyrics!</p>
      </div>
    `;
    ['fs-lyrics-scroller', 'lyrics-container', 'lyrics-modal-lines'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = emptyHtml;
    });

    const miniSnippet = document.getElementById('mini-playbar-lyrics-snippet');
    if (miniSnippet) miniSnippet.classList.add('hidden');
  }

  function renderLyricsToAllContainers(lyrics, track) {
    const lines = lyrics.lines;
    const isSynced = lyrics.isSynced;

    // 1. Fullscreen Player Karaoke Scroller
    const fsScroller = document.getElementById('fs-lyrics-scroller');
    if (fsScroller) {
      fsScroller.innerHTML = lines.map((line, idx) => {
        const timeAttr = line.time !== null ? `data-time="${line.time}" onclick="window.seekToLyric(${line.time})"` : '';
        const titleAttr = line.time !== null ? `title="Jump to ${formatLyricTime(line.time)}"` : '';
        return `
          <div class="fs-lyric-line ${idx === 0 ? 'active' : ''}" id="fs-lyric-line-${idx}" data-index="${idx}" ${timeAttr} ${titleAttr}>
            ${escapeHtml(line.text)}
          </div>
        `;
      }).join('');
    }

    // 2. Drawer & Dedicated Modal Lyrics
    const drawerContainer = document.getElementById('lyrics-container');
    const modalLines = document.getElementById('lyrics-modal-lines');
    const listHtml = lines.map((line, idx) => {
      const timeAttr = line.time !== null ? `data-time="${line.time}" onclick="window.seekToLyric(${line.time})"` : '';
      const titleAttr = line.time !== null ? `title="Jump to ${formatLyricTime(line.time)}"` : '';
      return `
        <div class="lyrics-line ${idx === 0 ? 'active' : ''}" id="drawer-lyric-line-${idx}" data-index="${idx}" ${timeAttr} ${titleAttr}>
          ${escapeHtml(line.text)}
        </div>
      `;
    }).join('');

    if (drawerContainer) drawerContainer.innerHTML = `<div class="lyrics-wrapper">${listHtml}</div>`;
    if (modalLines) modalLines.innerHTML = listHtml;

    // 3. Mini Playbar 2-Line Live Preview
    const miniSnippet = document.getElementById('mini-playbar-lyrics-snippet');
    const curLine = document.getElementById('mini-lyric-current');
    const nextLine = document.getElementById('mini-lyric-next');

    if (miniSnippet && curLine) {
      miniSnippet.classList.remove('hidden');
      curLine.textContent = lines[0]?.text || `♪ ${track.title}`;
      if (nextLine) nextLine.textContent = lines[1]?.text || `${track.artist} (Live Lyrics Sync)`;
    }
  }

  function formatLyricTime(seconds) {
    if (seconds === null || seconds === undefined) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  window.syncLiveLyrics = function(currentTime) {
    if (!currentLyricsData || !currentLyricsData.lines || currentLyricsData.lines.length === 0) return;
    if (!currentLyricsData.isSynced) return;

    const lines = currentLyricsData.lines;
    const newIdx = window.lyricsService.getActiveLineIndex(lines, currentTime);

    if (newIdx !== -1 && newIdx !== activeLyricIndex) {
      activeLyricIndex = newIdx;

      // Update Fullscreen Scroller
      const fsScroller = document.getElementById('fs-lyrics-scroller');
      if (fsScroller) {
        fsScroller.querySelectorAll('.fs-lyric-line').forEach((el, i) => {
          if (i === newIdx) {
            el.classList.add('active');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            el.classList.remove('active');
          }
        });
      }

      // Update Drawer / Modal Lines
      ['lyrics-container', 'lyrics-modal-lines'].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
          container.querySelectorAll('.lyrics-line').forEach((el, i) => {
            if (i === newIdx) {
              el.classList.add('active');
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              el.classList.remove('active');
            }
          });
        }
      });

      // Update Mini Bottom Playbar 2-Line Preview Snippet
      const curLine = document.getElementById('mini-lyric-current');
      const nextLine = document.getElementById('mini-lyric-next');
      if (curLine) {
        curLine.textContent = lines[newIdx]?.text || '';
      }
      if (nextLine) {
        nextLine.textContent = lines[newIdx + 1]?.text || '';
      }
    }
  };

  window.seekToLyric = function(timestamp) {
    if (timestamp === null || timestamp === undefined || isNaN(timestamp)) return;
    if (window.playbarController && typeof window.playbarController.seekToTimestamp === 'function') {
      window.playbarController.seekToTimestamp(timestamp);
    } else {
      seekTo((timestamp / (state.duration || 210)) * 100);
    }
    showToast?.(`Jumped to ${formatLyricTime(timestamp)}`, 'info', 1500);
  };

  window.toggleFullscreenLyrics = function() {
    const lyricsView = document.getElementById('fs-lyrics-view');
    const lyricsBtn = document.getElementById('fs-btn-lyrics');
    if (!lyricsView) return;

    isFullscreenLyricsActive = !isFullscreenLyricsActive;
    if (isFullscreenLyricsActive) {
      lyricsView.classList.add('active');
      if (lyricsBtn) lyricsBtn.style.color = '#e879f9';
      if (currentLyricsData && state.currentTime) {
        window.syncLiveLyrics(state.currentTime);
      }
    } else {
      lyricsView.classList.remove('active');
      if (lyricsBtn) lyricsBtn.style.color = '';
    }
  };

  window.openFullscreenPlayerWithLyrics = function() {
    if (window.playbarController && typeof window.playbarController.toggleFullscreen === 'function') {
      window.playbarController.toggleFullscreen(true);
    } else if (typeof window.openFullscreenPlayer === 'function') {
      window.openFullscreenPlayer();
    }
    
    // Automatically turn on karaoke lyrics view in fullscreen
    const lyricsView = document.getElementById('fs-lyrics-view');
    const lyricsBtn = document.getElementById('fs-btn-lyrics');
    if (lyricsView) {
      isFullscreenLyricsActive = true;
      lyricsView.classList.add('active');
      if (lyricsBtn) lyricsBtn.style.color = '#e879f9';
    }
  };

  // Bind Fullscreen Lyrics button
  document.addEventListener('DOMContentLoaded', () => {
    const fsLyricsBtn = document.getElementById('fs-btn-lyrics');
    if (fsLyricsBtn) {
      fsLyricsBtn.onclick = (e) => {
        e.stopPropagation();
        window.toggleFullscreenLyrics();
      };
    }
  });

  // =========================================================================
  // ARTIST DIRECTORY & PROFILE ROUTING ENGINE
  // =========================================================================
  window.openArtistProfile = function(artistName) {
    if (!artistName) return;
    const cleanArtist = artistName.split(',')[0].split('&')[0].trim();

    // 1. Get all tracks by this artist
    let allTracks = [];
    if (window.TRACKS_REGISTRY) {
      allTracks = Object.values(window.TRACKS_REGISTRY).filter(t => 
        t.artist && t.artist.toLowerCase().includes(cleanArtist.toLowerCase())
      );
    }
    if (allTracks.length === 0 && window.musicService && typeof window.musicService.getAllStarterTracks === 'function') {
      allTracks = window.musicService.getAllStarterTracks().filter(t =>
        t.artist && t.artist.toLowerCase().includes(cleanArtist.toLowerCase())
      );
    }

    // 2. Resolve High-Res Avatar
    let avatarUrl = (window.getOfficialCover && window.getOfficialCover(allTracks[0]?.title, cleanArtist)) || allTracks[0]?.cover || './pulse-logo.png';
    const featuredArtist = window.catalogService?.getFeaturedArtists?.()?.find(a => a.name.toLowerCase() === cleanArtist.toLowerCase());
    if (featuredArtist && featuredArtist.avatar) {
      avatarUrl = featuredArtist.avatar;
    }

    // 3. Populate Hero Section
    const avatarEl = document.getElementById('artist-profile-avatar');
    const nameEl = document.getElementById('artist-profile-name');
    const genresEl = document.getElementById('artist-profile-genres');
    const countEl = document.getElementById('artist-profile-track-count');
    const playsEl = document.getElementById('artist-profile-plays');
    const listEl = document.getElementById('artist-popular-tracks-list');

    if (avatarEl) avatarEl.src = avatarUrl;
    if (nameEl) nameEl.textContent = cleanArtist;
    if (genresEl) genresEl.textContent = featuredArtist?.genre || allTracks[0]?.genre || allTracks[0]?.category || 'Music';
    if (countEl) countEl.textContent = `${allTracks.length} Songs`;
    if (playsEl) {
      const totalListens = allTracks.reduce((acc, t) => acc + (t.playCount || 100000), 0);
      playsEl.textContent = `${(totalListens / 1000000).toFixed(1)}M Total Listens`;
    }

    // 4. Render Tracks List
    if (listEl) {
      if (allTracks.length > 0) {
        listEl.innerHTML = `
          <div class="music-cards-grid">
            ${allTracks.map(createMusicCardHTML).join('')}
          </div>
        `;
      } else {
        listEl.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #888;">
            <i class="fa-solid fa-music text-accent" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
            No tracks found for this artist.
          </div>
        `;
      }
    }

    currentViewingArtist = { name: cleanArtist, tracks: allTracks };
    switchView('view-artist-profile');
  };

  window.playCurrentArtistTracks = function(shuffle = false) {
    if (!currentViewingArtist || !currentViewingArtist.tracks || currentViewingArtist.tracks.length === 0) return;
    let list = [...currentViewingArtist.tracks];
    if (shuffle) {
      list = list.sort(() => Math.random() - 0.5);
    }
    state.queue = list;
    state.queueIndex = 0;
    if (list[0]) {
      window.playSpecificTrack(list[0].id);
    }
  };

  window.goBackOrHome = function() {
    switchView('home');
  };
"""

# Insert lyrics engine code before createMusicCardHTML
code = code.replace(
    '  function createMusicCardHTML(track) {',
    f'{lyrics_engine_code}\n  function createMusicCardHTML(track) {{'
)

# Hook loadTrackLyrics into setTrack in main.js
code = re.sub(
    r'(function setTrack\(track,\s*autoPlay\s*=\s*true\)\s*\{[\s\S]*?state\.currentTrack\s*=\s*track;)',
    r'\1\n    loadTrackLyrics(track);',
    code
)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("[OK] Integrated LRCLIB lyrics engine, live sync, and artist profile into src/main.js")
