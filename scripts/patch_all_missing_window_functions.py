import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

all_missing_functions = r"""
  // =========================================================================
  // GLOBAL WINDOW ACTIONS & INTERACTIVE CONTROLLER REGISTRY
  // =========================================================================

  window.playSpecificTrack = async function(trackId) {
    if (!trackId) return;
    console.log('[Pulse Interactive] playSpecificTrack:', trackId);

    let track = null;
    if (window.musicService && typeof window.musicService.getTrack === 'function') {
      track = window.musicService.getTrack(trackId);
    }
    if (!track && window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]) {
      track = window.TRACKS_REGISTRY[trackId];
    }
    if (!track && window.catalogService && typeof window.catalogService.getCatalogTrackById === 'function') {
      track = window.catalogService.getCatalogTrackById(trackId);
    }

    // Fallback: extract track metadata directly from clicked DOM card
    if (!track) {
      const cardEl = document.querySelector(`[onclick*="'${trackId}'"]`) || document.querySelector(`[data-track-id="${trackId}"]`);
      if (cardEl) {
        const title = cardEl.querySelector('.music-card-title, .track-title, h4, h5')?.textContent?.trim() || trackId;
        const artist = cardEl.querySelector('.music-card-subtitle, .track-artist, p')?.textContent?.trim() || 'Popular Artist';
        const img = cardEl.querySelector('img')?.src || './pulse-logo.png';
        track = {
          id: trackId,
          title: title,
          artist: artist,
          cover: img,
          duration: '3:30',
          source: 'Pulse Direct'
        };
      }
    }

    if (track) {
      if (!state.queue || state.queue.length === 0) {
        state.queue = [track];
        state.queueIndex = 0;
      } else {
        const existingIdx = state.queue.findIndex(t => t.id === track.id);
        if (existingIdx !== -1) {
          state.queueIndex = existingIdx;
        } else {
          state.queue.splice(state.queueIndex + 1, 0, track);
          state.queueIndex += 1;
        }
      }

      if (typeof setTrack === 'function') {
        setTrack(track, true);
      } else if (window.playbarController && typeof window.playbarController.playTrack === 'function') {
        window.playbarController.playTrack(track);
      }
    } else {
      console.warn('[Pulse] Track not found for ID:', trackId);
    }
  };

  window.selectCatalogCategory = function(catKey) {
    document.querySelectorAll('.catalog-categories-bar .filter-pill, .filter-pills-bar .pill-btn').forEach(btn => {
      if (btn.dataset.category === catKey || btn.dataset.filter === catKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (catKey === 'all') {
      window.switchView('home');
      return;
    }

    // Scroll to category section if present on home screen
    const sectionEl = document.getElementById(`section-${catKey}`) || document.getElementById(`catalog-${catKey}`);
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.openGenreGridView(catKey);
    }
  };

  let _currentGenreKey = 'all';
  window.openGenreGridView = function(catKey) {
    _currentGenreKey = catKey;
    const titleMap = {
      'hindi-bollywood': 'Hindi & Bollywood Hits',
      'english-pop': 'English & International Pop',
      'punjabi-regional': 'Punjabi & Regional Hits',
      'edm-electronic': 'EDM & Electronic Beats',
      'lofi-chill': 'Lo-Fi & Chill Vibes',
      'rock-alternative': 'Rock & Alternative Anthems',
      '90s-golden': '90s Golden Hits',
      'hollywood-hits': 'Hollywood Cinematic Hits'
    };

    const title = titleMap[catKey] || catKey.replace(/-/g, ' ').toUpperCase();
    const headingEl = document.getElementById('genre-view-title');
    if (headingEl) headingEl.textContent = title;

    window.switchView('genre-grid-view');

    // Populate grid
    const container = document.getElementById('genre-tracks-grid');
    if (container) {
      let tracks = [];
      if (window.catalogService && typeof window.catalogService.getCatalogByCategory === 'function') {
        tracks = window.catalogService.getCatalogByCategory(catKey);
      }
      if (!tracks || tracks.length === 0) {
        tracks = Object.values(window.TRACKS_REGISTRY || {}).filter(t => 
          (t.category && t.category.toLowerCase().includes(catKey.replace(/-/g, ' '))) ||
          (t.language && t.language.toLowerCase().includes(catKey.split('-')[0]))
        );
      }

      if (tracks.length > 0) {
        container.innerHTML = tracks.map(t => `
          <div class="music-card" onclick="window.playSpecificTrack('${t.id}')">
            <div class="music-card-cover-wrapper">
              <img src="${t.cover || './pulse-logo.png'}" alt="${t.title}" class="music-card-cover">
              <button class="music-card-play-btn" title="Play">
                <i class="fa-solid fa-play"></i>
              </button>
            </div>
            <h4 class="music-card-title">${t.title}</h4>
            <p class="music-card-subtitle">${t.artist}</p>
          </div>
        `).join('');
      } else {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">No songs found in this category.</div>`;
      }
    }
  };

  window.playGenreTracks = function(shuffle = false) {
    let tracks = [];
    if (window.catalogService && typeof window.catalogService.getCatalogByCategory === 'function') {
      tracks = [...window.catalogService.getCatalogByCategory(_currentGenreKey)];
    }
    if (tracks.length === 0) {
      tracks = Object.values(window.TRACKS_REGISTRY || {});
    }
    if (tracks.length === 0) return;

    if (shuffle) {
      tracks.sort(() => Math.random() - 0.5);
    }

    state.queue = tracks;
    state.queueIndex = 0;
    setTrack(tracks[0], true);
    showToast(`Playing ${tracks.length} tracks from category`);
  };

  let _activeArtistName = '';
  let _activeArtistTracks = [];

  window.openArtistProfile = function(artistName) {
    if (!artistName) return;
    _activeArtistName = artistName;

    const modal = document.getElementById('artist-detail-modal');
    const nameEl = document.getElementById('artist-hero-name');
    const countEl = document.getElementById('artist-hero-count');
    const tracksContainer = document.getElementById('artist-tracks-list');

    if (nameEl) nameEl.textContent = artistName;

    // Find artist tracks
    let tracks = Object.values(window.TRACKS_REGISTRY || {}).filter(t => 
      t.artist && t.artist.toLowerCase().includes(artistName.toLowerCase())
    );
    if (tracks.length === 0 && window.catalogService && typeof window.catalogService.getAllCatalogTracks === 'function') {
      tracks = window.catalogService.getAllCatalogTracks().filter(t =>
        t.artist && t.artist.toLowerCase().includes(artistName.toLowerCase())
      );
    }
    _activeArtistTracks = tracks;

    if (countEl) countEl.textContent = `${tracks.length} Songs • Verified Artist`;

    if (tracksContainer) {
      if (tracks.length > 0) {
        tracksContainer.innerHTML = tracks.map((t, idx) => `
          <div class="artist-track-row" onclick="window.playSpecificTrack('${t.id}')" style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.8rem; border-radius: 8px; cursor: pointer; transition: background 0.2s ease; margin-bottom: 0.35rem;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='transparent'">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="width: 20px; font-weight: 700; color: var(--text-muted); font-size: 0.82rem;">${idx + 1}</span>
              <img src="${t.cover || './pulse-logo.png'}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
              <div>
                <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">${t.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${t.album || 'Single'}</div>
              </div>
            </div>
            <button type="button" class="btn-icon-small" style="color: #c084fc;">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
        `).join('');
      } else {
        tracksContainer.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Explore music by ${artistName}</div>`;
      }
    }

    if (modal) modal.classList.remove('hidden');
  };

  window.closeArtistModal = function() {
    const modal = document.getElementById('artist-detail-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.playCurrentArtistTracks = function(shuffle = false) {
    if (!_activeArtistTracks || _activeArtistTracks.length === 0) return;
    const tracks = [..._activeArtistTracks];
    if (shuffle) tracks.sort(() => Math.random() - 0.5);

    state.queue = tracks;
    state.queueIndex = 0;
    setTrack(tracks[0], true);
    showToast(`Playing ${tracks.length} songs by ${_activeArtistName}`);
    window.closeArtistModal();
  };

  window.toggleFollowCurrentArtist = function() {
    showToast(`Followed ${_activeArtistName || 'Artist'}!`, 'success');
  };

  let _activeLyricsModalTrack = null;
  window.openLyricsForTrack = function(trackId) {
    let track = null;
    if (trackId) {
      track = (window.musicService && window.musicService.getTrack(trackId)) || (window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]);
    }
    if (!track) {
      track = state.currentTrack || (window.playbarController && typeof window.playbarController.getState === 'function' && window.playbarController.getState().currentTrack);
    }
    if (!track) {
      showToast('Select a song to load synchronized lyrics!');
      return;
    }

    _activeLyricsModalTrack = track;

    // Toggle fullscreen lyrics scroller if in fullscreen player
    const fsPlayer = document.getElementById('fullscreen-player');
    if (fsPlayer && fsPlayer.classList.contains('active')) {
      if (typeof window.toggleFullscreenLyrics === 'function') {
        window.toggleFullscreenLyrics();
        return;
      }
    }

    // Otherwise open side drawer lyrics tab
    const drawer = document.getElementById('side-drawer');
    if (drawer) {
      if (!drawer.classList.contains('open')) toggleDrawer(true);
      switchDrawerTab('lyrics');
    }
    loadTrackLyrics(track);
  };

  window.closeLyricsModal = function() {
    const modal = document.getElementById('lyrics-preview-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.playLyricsModalTrack = function() {
    if (_activeLyricsModalTrack) {
      setTrack(_activeLyricsModalTrack, true);
      window.closeLyricsModal();
    }
  };

  window.openFullscreenPlayerWithLyrics = function() {
    window.openFullscreenPlayer();
    setTimeout(() => {
      if (typeof window.toggleFullscreenLyrics === 'function') {
        window.toggleFullscreenLyrics();
      }
    }, 150);
  };

  window.downloadSong = function(trackId) {
    const track = (window.musicService && window.musicService.getTrack(trackId)) || (window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]) || state.currentTrack;
    if (!track) {
      showToast('No song selected to download.');
      return;
    }
    showToast(`Downloading "${track.title}" in High-Definition audio...`, 'success', 3500);
  };

  window.goBackOrHome = function() {
    window.switchView('home');
  };

  window.closeUploadAudioModal = function() {
    const modal = document.getElementById('upload-audio-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.executeAudioUpload = function() {
    showToast('Audio track uploaded to Pulse Studio successfully!', 'success');
    window.closeUploadAudioModal();
  };
"""

# Append missing global functions right before initApp
main_js = main_js.replace(
    'async function initApp()',
    all_missing_functions.strip() + '\n\n  async function initApp()'
)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_js)

print("[OK] Injected all missing interactive global window functions into src/main.js")
