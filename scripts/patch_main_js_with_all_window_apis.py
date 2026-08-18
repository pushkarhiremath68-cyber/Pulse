import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

# Make sure all window APIs are cleanly exposed
apis = """
  // =========================================================================
  // GLOBAL WINDOW EXPORTS FOR ZERO-ERROR CLICK & AUDIO DISPATCH
  // =========================================================================
  window.playSpecificTrack = async function(trackId) {
    if (!trackId) return;
    console.log('[Pulse Universal Player] Playing track:', trackId);

    let track = null;
    if (typeof window !== 'undefined' && window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]) {
      track = window.TRACKS_REGISTRY[trackId];
    }
    if (!track && window.catalogService && typeof window.catalogService.getCatalogTrackById === 'function') {
      track = window.catalogService.getCatalogTrackById(trackId);
    }
    if (!track && window.musicService && typeof window.musicService.getTrack === 'function') {
      track = window.musicService.getTrack(trackId);
    }

    if (!track) {
      const card = document.querySelector(`[onclick*="'${trackId}'"]`) || document.querySelector(`[data-track-id="${trackId}"]`);
      if (card) {
        const title = card.querySelector('.card-title, .music-card-title, .track-title, h4, h5')?.textContent?.trim() || trackId;
        const artist = card.querySelector('.card-artist, .music-card-subtitle, .track-artist, p')?.textContent?.trim() || 'Pulse Artist';
        const cover = card.querySelector('img')?.src || './pulse-logo.png';
        track = { id: trackId, title, artist, cover, duration: '3:30', category: 'recommended' };
      }
    }

    if (!track) {
      track = { id: trackId, title: trackId.replace(/-/g, ' ').toUpperCase(), artist: 'Pulse Artist', cover: './pulse-logo.png', duration: '3:30' };
    }

    state.currentTrack = track;
    state.isPlaying = true;

    // Mini bar details
    const pTitle = document.getElementById('player-title');
    const pArtist = document.getElementById('player-artist');
    const pThumb = document.getElementById('player-thumb');
    const playerBar = document.querySelector('.bottom-player-bar') || document.getElementById('player-bar');
    if (playerBar) {
      playerBar.classList.remove('hidden');
      playerBar.style.display = 'flex';
      playerBar.style.visibility = 'visible';
      playerBar.style.opacity = '1';
    }
    if (pTitle) pTitle.textContent = track.title;
    if (pArtist) pArtist.textContent = track.artist;
    if (pThumb) pThumb.src = track.cover || './pulse-logo.png';

    // Fullscreen details
    const fsTitle = document.getElementById('fs-track-title');
    const fsArtist = document.getElementById('fs-track-artist');
    const fsArt = document.getElementById('fs-album-art');
    const fsBg = document.getElementById('fs-bg-blur');
    if (fsTitle) fsTitle.textContent = track.title;
    if (fsArtist) fsArtist.textContent = track.artist;
    if (fsArt) fsArt.src = track.cover || './pulse-logo.png';
    if (fsBg) fsBg.style.backgroundImage = `url('${track.cover || './pulse-logo.png'}')`;

    // Update play button icons to Pause
    document.querySelectorAll('#btn-play-pause, #fs-btn-play, .btn-primary-play').forEach(btn => {
      const icon = btn.querySelector('i') || btn;
      if (icon) icon.className = 'fa-solid fa-pause';
    });

    // Update active card highlights in UI
    document.querySelectorAll('.music-card').forEach(c => {
      if (c.getAttribute('onclick')?.includes(`'${trackId}'`)) {
        c.classList.add('playing');
        const playBtn = c.querySelector('.btn-card-play i, .music-card-play-btn i');
        if (playBtn) playBtn.className = 'fa-solid fa-pause';
      } else {
        c.classList.remove('playing');
        const playBtn = c.querySelector('.btn-card-play i, .music-card-play-btn i');
        if (playBtn) playBtn.className = 'fa-solid fa-play';
      }
    });

    // Play Audio
    let audio = document.getElementById('fallback-audio-player') || window.globalAudioPlayer;
    if (!audio) {
      audio = new Audio();
      audio.id = 'fallback-audio-player';
      audio.preload = 'auto';
      document.body.appendChild(audio);
      window.globalAudioPlayer = audio;
    }

    let streamCandidates = [];
    if (track.streamUrl && track.streamUrl.startsWith('http')) {
      streamCandidates.push(track.streamUrl);
    }
    if (window.PulseAudioEngine && typeof window.PulseAudioEngine.resolveCandidates === 'function') {
      try {
        const resolved = await window.PulseAudioEngine.resolveCandidates(track);
        if (resolved && resolved.length > 0) {
          streamCandidates.push(...resolved.map(r => r.url));
        }
      } catch (e) {}
    }

    if (streamCandidates.length === 0) {
      const searchQ = `${track.title} ${track.artist}`.trim();
      streamCandidates.push(
        `https://api.jamendo.com/v3.0/tracks/file/?client_id=23b33f2a&namesearch=${encodeURIComponent(searchQ)}&audioformat=mp32`,
        `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(searchQ)}&app_name=PULSE_APP`
      );
    }

    for (const url of streamCandidates) {
      if (!url || typeof url !== 'string') continue;
      try {
        audio.pause();
        audio.src = url;
        audio.load();
        await audio.play();
        console.log('[Pulse Audio] Playing stream:', url);
        break;
      } catch (playErr) {
        console.warn('[Pulse Audio] Stream candidate failed, trying next:', url);
      }
    }

    if (typeof window.loadTrackLyrics === 'function') {
      window.loadTrackLyrics(track);
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'Pulse Music',
        artwork: [{ src: track.cover || './pulse-logo.png', sizes: '512x512', type: 'image/png' }]
      });
    }

    showToast(`Playing "${track.title}" by ${track.artist}`, 'success', 3000);
  };

  // App View Switcher
  window.switchView = function(viewName) {
    if (!viewName) return;
    state.activeView = viewName;
    const targetId = viewName.startsWith('view-') ? viewName : `view-${viewName}`;

    document.querySelectorAll('.app-view').forEach(v => {
      if (v.id === targetId || v.id === viewName) {
        v.classList.add('active-view');
        v.style.display = 'block';
      } else {
        v.classList.remove('active-view');
        v.style.display = 'none';
      }
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      const raw = item.dataset.view;
      if (raw === viewName || `view-${raw}` === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      const raw = item.dataset.view;
      if (raw === viewName || `view-${raw}` === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (viewName === 'home') {
      const input = document.getElementById('global-search-input');
      const clearBtn = document.getElementById('clear-search-btn');
      if (input && input.value) input.value = '';
      if (clearBtn) clearBtn.classList.add('hidden');
    }
  };

  // Real-time search
  let searchDebounceTimer = null;
  window.executeSearch = function(query, isDebounced = true) {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }

    const rawQ = query === null || query === undefined ? '' : String(query);
    const trimmed = rawQ.trim();

    const clearBtn = document.getElementById('clear-search-btn');
    if (!trimmed && !rawQ.trim()) {
      if (clearBtn) clearBtn.classList.add('hidden');
      if (state.activeView === 'search-view' || state.activeView === 'view-search-view') {
        window.switchView('home');
      }
      return;
    }

    if (clearBtn) clearBtn.classList.remove('hidden');

    const performSearch = async () => {
      if (state.activeView !== 'search-view' && state.activeView !== 'view-search-view') {
        window.switchView('search-view');
      }

      const searchLabel = document.getElementById('search-query-label');
      const searchCountEl = document.getElementById('search-count');
      const loadingEl = document.getElementById('search-loading');
      const container = document.getElementById('search-results-container');

      if (searchLabel) searchLabel.textContent = trimmed || rawQ;
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (searchCountEl) searchCountEl.textContent = 'Searching catalog...';

      try {
        let results = [];
        if (window.catalogService && typeof window.catalogService.searchCatalog === 'function') {
          results = await window.catalogService.searchCatalog(trimmed || rawQ, 35);
        } else {
          const qLower = (trimmed || rawQ).toLowerCase();
          results = Object.values(window.TRACKS_REGISTRY || {}).filter(t => 
            (t.title && t.title.toLowerCase().includes(qLower)) ||
            (t.artist && t.artist.toLowerCase().includes(qLower)) ||
            (t.album && t.album.toLowerCase().includes(qLower)) ||
            (t.category && t.category.toLowerCase().includes(qLower))
          );
        }

        if (loadingEl) loadingEl.classList.add('hidden');

        if (searchCountEl) {
          searchCountEl.textContent = `${results.length} track${results.length === 1 ? '' : 's'} found`;
        }

        if (container) {
          if (results.length > 0) {
            container.innerHTML = `
              <div class="music-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.25rem; margin-top: 1rem;">
                ${results.map(t => `
                  <div class="music-card" onclick="window.playSpecificTrack('${t.id}')">
                    <div class="card-image-wrapper">
                      <img src="${t.cover || './pulse-logo.png'}" alt="${t.title}" loading="lazy">
                      <div class="card-play-overlay">
                        <button class="btn-card-play" title="Play ${t.title}"><i class="fa-solid fa-play"></i></button>
                      </div>
                    </div>
                    <div class="card-info">
                      <span class="card-title">${t.title}</span>
                      <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('${t.artist}')">${t.artist}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `;
          } else {
            container.innerHTML = `
              <div style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
                <i class="fa-solid fa-compact-disc" style="font-size: 2.5rem; margin-bottom: 0.85rem; display: block; color: var(--accent-primary); opacity: 0.6;"></i>
                <h3 style="color: #fff; font-weight: 700; margin-bottom: 0.35rem;">No songs found for "${trimmed || rawQ}"</h3>
                <p style="font-size: 0.85rem;">Try searching for artist names like Arijit Singh, The Weeknd, Diljit, or song titles.</p>
              </div>
            `;
          }
        }
      } catch (err) {
        console.error('[Pulse Search Error]:', err);
        if (loadingEl) loadingEl.classList.add('hidden');
      }
    };

    if (isDebounced) {
      searchDebounceTimer = setTimeout(performSearch, 150);
    } else {
      performSearch();
    }
  };

  // Gemini AI DJ
  window.openGeminiDjModal = function() {
    const modal = document.getElementById('gemini-dj-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const input = document.getElementById('gemini-dj-prompt');
      if (input) setTimeout(() => input.focus(), 150);
    }
  };

  window.closeGeminiDjModal = function() {
    const modal = document.getElementById('gemini-dj-modal');
    if (modal) modal.classList.add('hidden');
  };

  // Lyrics Modal
  window.openLyricsForCurrentTrack = function() {
    const track = state.currentTrack;
    if (!track) {
      showToast('Play a song first to see lyrics!', 'info', 3000);
      return;
    }
    const modal = document.getElementById('lyrics-preview-modal');
    if (modal) {
      const titleEl = document.getElementById('lyrics-modal-title');
      const artistEl = document.getElementById('lyrics-modal-artist');
      const coverEl = document.getElementById('lyrics-modal-cover');
      if (titleEl) titleEl.textContent = track.title;
      if (artistEl) artistEl.textContent = track.artist;
      if (coverEl) coverEl.src = track.cover || './pulse-logo.png';
      modal.classList.remove('hidden');
      if (typeof window.loadTrackLyrics === 'function') {
        window.loadTrackLyrics(track);
      }
    }
  };

  window.closeLyricsModal = function() {
    const modal = document.getElementById('lyrics-preview-modal');
    if (modal) modal.classList.add('hidden');
  };
"""

if 'window.playSpecificTrack = async function' not in main_js:
    # Insert right before (function() { or at the end of the IIFE
    main_js = main_js.replace(
        'function initApp()',
        apis.strip() + '\n\n  function initApp()'
    )
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(main_js)
    print("[OK] Injected window APIs into src/main.js")
