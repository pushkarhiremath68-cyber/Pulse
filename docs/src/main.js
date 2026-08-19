/**
 * Pulse Music - Main Application Coordinator
 * Integrates:
 * 1. Real-Time LRCLIB Synchronized Lyrics with active-line highlight, smooth centering auto-scroll & click-to-seek.
 * 2. Spotify-Style Home Discovery Feed: Quick Picks 6-Tile Grid, Featured Artists, Curated Playlists.
 * 3. Dedicated Immersive Artist Page (/artist/:artistId) with Top Tracks, Discography, Bio & Similar Artists.
 * 4. Firebase Authentication, Cloud Firestore (Playlists & Favorites), and Pure Audio Engine.
 */

import './firebase.js';
import './firebaseAuthService.js';
import './firestoreService.js';
import './extractorService.js';
import './musicService.js';
import './audioEngine.js';
import './playbarController.js';
import './lyricsService.js';
import './catalogService.js';
import './geminiService.js';

import { getStoredUser, signInWithEmail, signUpWithEmail, signInWithGoogle, signInAnonymously, signOut, onAuthStateChanged } from './firebaseAuthService.js';
import { getFavorites, removeFavorite, addFavorite, getPlaylists, createPlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist, getHistory, clearHistory, onFavoritesChanged, onPlaylistsChanged, onHistoryChanged } from './firestoreService.js';
import { getQuickPicks, getFeaturedArtists, getArtistDetails, getCuratedPlaylists } from './catalogService.js';
import { getLyrics, getActiveLineIndex } from './lyricsService.js';

(function() {
  'use strict';

  // Global State Reference
  window.pulseState = {
    currentUser: getStoredUser(),
    currentTrack: null,
    isPlaying: false,
    activeCategory: 'all',
    activeLibraryTab: 'favorites',
    currentLyrics: null,
    activeLyricIdx: -1,
    currentArtistData: null
  };

  // Toast Notification Helper
  window.showToast = function(msg, type = 'info', duration = 3000) {
    let container = document.getElementById('pulse-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pulse-toast-container';
      container.style.cssText = 'position: fixed; bottom: 90px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'rgba(34,197,94,0.95)' : (type === 'warning' ? 'rgba(234,179,8,0.95)' : 'rgba(139,92,246,0.95)');
    toast.style.cssText = `background: ${bg}; color: #fff; padding: 0.8rem 1.2rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.5); backdrop-filter: blur(10px); transition: all 0.3s ease; animation: toastIn 0.3s ease; pointer-events: auto;`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // View Routing
  window.switchView = function(viewId) {
    document.querySelectorAll('.app-view').forEach(el => el.classList.remove('active-view'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.nav-item, .mobile-nav-item, .mobile-nav-link').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-view') === viewId);
    });

    if (viewId === 'library') {
      window.renderLibraryView();
    } else if (viewId === 'home') {
      window.renderHomeDiscovery();
    }
  };

  // Dedicated Category Grid Viewer
  window.openCategoryView = async function(catId, catTitle) {
    window.switchView('search-view');
    const label = document.getElementById('search-query-label');
    const count = document.getElementById('search-count');
    if (label) label.textContent = catTitle || catId;
    if (count) count.textContent = 'Curating category tracks...';

    const container = document.getElementById('search-results-container');
    if (container) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #c084fc;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem;"></i><p style="margin-top: 0.5rem;">Loading ' + catTitle + '...</p></div>';
    }

    const results = await window.catalogService.fetchCategoryTracks(catId, 24);
    if (count) count.textContent = `${results.length} pure audio tracks available`;
    renderSearchResults(results);
  };

  // Filter Pills Selector
  window.selectFilterPill = function(btn, query) {
    document.querySelectorAll('.filter-pill').forEach(b => {
      b.classList.remove('active-pill', 'pill-cyan');
    });
    if (btn) {
      btn.classList.add('active-pill', 'pill-cyan');
    }
    const input = document.getElementById('global-search-input');
    if (input) input.value = query;
    window.executeSearch(query, false);
  };

  // Playback Trigger
  window.playTrackDirect = function(track, queue = null) {
    if (!track) return;
    if (window.PulsePlaybar && typeof window.PulsePlaybar.playTrack === 'function') {
      window.PulsePlaybar.playTrack(track, queue);
      window.loadTrackLyrics(track);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. REAL-TIME SYNCHRONIZED LYRICS (LRCLIB + KARAOKE HIGHLIGHTING + SEEK)
  // ---------------------------------------------------------------------------

  window.loadTrackLyrics = async function(track) {
    if (!track) return;
    window.pulseState.currentTrack = track;
    window.pulseState.activeLyricIdx = -1;

    // Update Drawer Header
    const drawerTitle = document.getElementById('lyrics-drawer-title');
    const drawerArtist = document.getElementById('lyrics-drawer-artist');
    if (drawerTitle) drawerTitle.textContent = track.title || 'Live Lyrics';
    if (drawerArtist) drawerArtist.textContent = track.artist || 'Pulse Karaoke';

    // Show Loading state
    const drawerContent = document.getElementById('lyrics-drawer-content');
    const fsScrollBox = document.getElementById('fs-lyrics-scroll-box');
    const loadingHtml = `<div class="lyrics-loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Synchronizing LRCLIB lyrics...</div>`;

    if (drawerContent) drawerContent.innerHTML = loadingHtml;
    if (fsScrollBox) fsScrollBox.innerHTML = `<p class="fs-lyric-line fs-lyric-active">${loadingHtml}</p>`;

    try {
      const lyricsData = await getLyrics(track);
      window.pulseState.currentLyrics = lyricsData;

      if (!lyricsData || lyricsData.notFound || !lyricsData.lines || lyricsData.lines.length === 0) {
        const notFoundHtml = `
          <div class="lyrics-empty-state">
            <i class="fa-solid fa-microphone-slash" style="font-size: 2.5rem; opacity: 0.4; margin-bottom: 0.75rem;"></i>
            <h4>Lyrics not available</h4>
            <p>Enjoy the instrumental and pure audio flow.</p>
          </div>
        `;
        if (drawerContent) drawerContent.innerHTML = notFoundHtml;
        if (fsScrollBox) fsScrollBox.innerHTML = notFoundHtml;
        return;
      }

      // Render line-by-line karaoke elements
      const linesHtml = lyricsData.lines.map((line, idx) => {
        const timeAttr = line.time !== null ? `data-time="${line.time}"` : '';
        const seekHandler = line.time !== null ? `onclick="window.seekToLyricTimestamp(${line.time})"` : '';
        const clickableClass = line.time !== null ? 'lyric-clickable' : '';
        return `
          <p class="fs-lyric-line lyric-line ${clickableClass}" id="lyric-line-${idx}" ${timeAttr} ${seekHandler} title="${line.time !== null ? `Click to jump to ${Math.floor(line.time / 60)}:${Math.floor(line.time % 60).toString().padStart(2, '0')}` : ''}">
            ${line.text}
          </p>
        `;
      }).join('');

      if (drawerContent) {
        drawerContent.innerHTML = `
          <div class="lyrics-mode-badge">${lyricsData.isSynced ? '⚡ Synchronized Karaoke' : '📄 Plain Lyrics'} • ${lyricsData.source}</div>
          <div class="lyrics-lines-wrapper">${linesHtml}</div>
        `;
      }

      if (fsScrollBox) {
        fsScrollBox.innerHTML = `
          <div class="fs-lyrics-badge">${lyricsData.isSynced ? '⚡ Real-Time Karaoke' : '📄 Lyrics'}</div>
          <div class="fs-lines-wrapper">${linesHtml}</div>
        `;
      }
    } catch (err) {
      console.warn('[Pulse Lyrics] Error loading lyrics:', err);
    }
  };

  /**
   * Called on audio timeupdate to highlight current line and center-scroll
   */
  window.syncLiveLyrics = function(currentTime) {
    const lyrics = window.pulseState.currentLyrics;
    if (!lyrics || !lyrics.isSynced || !lyrics.lines || lyrics.lines.length === 0) {
      return;
    }

    const activeIdx = getActiveLineIndex(lyrics.lines, currentTime);
    if (activeIdx === window.pulseState.activeLyricIdx) {
      return; // No change
    }

    window.pulseState.activeLyricIdx = activeIdx;

    // Update highlights in all active lyrics containers
    ['lyrics-drawer-content', 'fs-lyrics-scroll-box'].forEach(containerId => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const allLines = container.querySelectorAll('.lyric-line');
      allLines.forEach((el, idx) => {
        if (idx === activeIdx) {
          el.classList.add('active-lyric-line', 'fs-lyric-active');
          el.classList.remove('past-lyric-line', 'future-lyric-line');

          // Smooth Auto-Scroll keeping active line centered vertically
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        } else if (idx < activeIdx) {
          el.classList.remove('active-lyric-line', 'fs-lyric-active');
          el.classList.add('past-lyric-line');
          el.classList.remove('future-lyric-line');
        } else {
          el.classList.remove('active-lyric-line', 'fs-lyric-active', 'past-lyric-line');
          el.classList.add('future-lyric-line');
        }
      });
    });
  };

  /**
   * Click-to-Seek: immediately jumps audio playback to lyric timestamp
   */
  window.seekToLyricTimestamp = function(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) return;
    if (window.PulsePlaybar && typeof window.PulsePlaybar.seekTo === 'function') {
      window.PulsePlaybar.seekTo(seconds);
      window.syncLiveLyrics(seconds);
      window.showToast(`Jumped to ${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`, 'info', 1000);
    }
  };

  window.openLyricsDrawer = function() {
    const modal = document.getElementById('lyrics-drawer-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('active-modal');
      const track = window.pulseState.currentTrack || (window.PulsePlaybar && window.PulsePlaybar.getCurrentTrack());
      if (track) window.loadTrackLyrics(track);
    }
  };

  window.closeLyricsDrawer = function() {
    const modal = document.getElementById('lyrics-drawer-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('active-modal');
    }
  };

  // ---------------------------------------------------------------------------
  // 2. MAIN SCREEN CATALOG & DISCOVERY SHELVES
  // ---------------------------------------------------------------------------

  window.renderHomeDiscovery = function() {
    // 1. Quick Picks 6-Tile Grid
    const qpContainer = document.getElementById('home-quick-picks-container');
    if (qpContainer) {
      const qpList = getQuickPicks();
      window.__quickPicks = qpList;
      qpContainer.innerHTML = qpList.map((track, idx) => `
        <div class="quick-pick-tile hover-glow" onclick="window.playTrackDirect(window.__quickPicks[${idx}], window.__quickPicks)">
          <img src="${track.coverUrl}" alt="${track.title}" class="qp-thumb" loading="lazy">
          <div class="qp-info">
            <span class="qp-title" title="${track.title}">${track.title}</span>
            <span class="qp-artist" title="${track.artist}">${track.artist}</span>
          </div>
          <button class="qp-play-btn" title="Play Now">
            <i class="fa-solid fa-play"></i>
          </button>
        </div>
      `).join('');
    }

    // 2. Featured Artists Carousel
    const artContainer = document.getElementById('home-featured-artists-container');
    if (artContainer) {
      const artists = getFeaturedArtists();
      window.__featuredArtists = artists;
      artContainer.innerHTML = artists.map((art, idx) => `
        <div class="artist-card-item" onclick="window.openArtistView('${art.name}')">
          <div class="artist-avatar-wrap">
            <img src="${art.avatar}" alt="${art.name}" class="artist-avatar-img" loading="lazy">
            <div class="artist-play-hover">
              <i class="fa-solid fa-play"></i>
            </div>
          </div>
          <div class="artist-card-name">${art.name}</div>
          <div class="artist-card-role"><i class="fa-solid fa-circle-check" style="color: #38bdf8; font-size: 0.7rem;"></i> ${art.genre.split('/')[0]}</div>
        </div>
      `).join('');
    }

    // 3. Curated Playlists Carousel
    const plContainer = document.getElementById('home-curated-playlists-container');
    if (plContainer) {
      const playlists = getCuratedPlaylists();
      window.__curatedPlaylists = playlists;
      plContainer.innerHTML = playlists.map((pl, idx) => `
        <div class="curated-playlist-card hover-glow" onclick="window.playCuratedPlaylist(${idx})">
          <div class="curated-cover-wrap">
            <img src="${pl.coverUrl}" alt="${pl.title}" class="curated-cover-img" loading="lazy">
            <div class="curated-play-overlay">
              <button class="btn-card-play"><i class="fa-solid fa-play"></i></button>
            </div>
            <span class="curated-badge">${pl.trackCount} Tracks</span>
          </div>
          <div class="curated-meta">
            <h4 class="curated-title">${pl.title}</h4>
            <p class="curated-desc">${pl.description}</p>
          </div>
        </div>
      `).join('');
    }
  };

  window.playCuratedPlaylist = function(idx) {
    const pl = window.__curatedPlaylists?.[idx];
    if (pl && pl.tracks && pl.tracks.length > 0) {
      window.playTrackDirect(pl.tracks[0], pl.tracks);
      window.showToast(`Playing playlist "${pl.title}"`, 'info');
    }
  };

  // ---------------------------------------------------------------------------
  // 3. IMMERSIVE ARTIST DETAILS PAGE (/artist/:artistId)
  // ---------------------------------------------------------------------------

  window.openArtistView = function(artistQuery) {
    const artist = getArtistDetails(artistQuery);
    window.pulseState.currentArtistData = artist;

    // Update Hero Banner
    const heroName = document.getElementById('artist-hero-name');
    const heroListeners = document.getElementById('artist-hero-listeners');
    const heroRank = document.getElementById('artist-world-rank');
    const heroCard = document.getElementById('artist-hero-card');

    if (heroName) heroName.textContent = artist.name;
    if (heroListeners) heroListeners.textContent = artist.monthlyListeners;
    if (heroRank) heroRank.textContent = artist.worldRank;
    if (heroCard) {
      heroCard.style.backgroundImage = `linear-gradient(180deg, rgba(15,17,26,0.3) 0%, #0f111a 100%), url('${artist.banner}')`;
    }

    // Render Popular Tracks (Top 5)
    const topTracksList = document.getElementById('artist-popular-tracks-list');
    if (topTracksList) {
      window.__artistTopTracks = artist.topTracks;
      topTracksList.innerHTML = artist.topTracks.map((track, idx) => `
        <div class="artist-track-row hover-glow" onclick="window.playTrackDirect(window.__artistTopTracks[${idx}], window.__artistTopTracks)">
          <span class="artist-track-rank">${idx + 1}</span>
          <img src="${track.coverUrl}" alt="${track.title}" class="artist-track-thumb" loading="lazy">
          <div class="artist-track-info">
            <span class="artist-track-title">${track.title}</span>
            <span class="artist-track-plays">${track.plays || '1,200,000'} plays</span>
          </div>
          <span class="artist-track-duration">${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60).toString().padStart(2, '0')}</span>
          <div class="artist-track-actions" onclick="event.stopPropagation()">
            <button class="btn-action-icon" title="Save to Favorites" onclick="window.toggleFavoriteTrack(window.__artistTopTracks[${idx}])">
              <i class="fa-regular fa-heart"></i>
            </button>
            <button class="btn-action-icon" title="Add to Playlist" onclick="window.openAddToPlaylistModal(window.__artistTopTracks[${idx}])">
              <i class="fa-solid fa-list-plus"></i>
            </button>
          </div>
        </div>
      `).join('');
    }

    // Render Discography Grid
    window.renderArtistDiscog('all');

    // Render About Box
    const aboutBox = document.getElementById('artist-about-container');
    if (aboutBox) {
      aboutBox.innerHTML = `
        <div class="artist-about-inner">
          <img src="${artist.avatar}" alt="${artist.name}" class="artist-about-avatar">
          <div class="artist-about-details">
            <div class="artist-about-rank">${artist.worldRank}</div>
            <p class="artist-about-bio">${artist.bio}</p>
            <div class="artist-about-stats">
              <div class="stat-pill"><i class="fa-solid fa-users"></i> ${artist.monthlyListeners}</div>
              <div class="stat-pill"><i class="fa-solid fa-music"></i> ${artist.genre}</div>
            </div>
          </div>
        </div>
      `;
    }

    // Render Similar Artists
    const similarBox = document.getElementById('artist-similar-container');
    if (similarBox) {
      similarBox.innerHTML = artist.similarArtists.map(sim => `
        <div class="artist-card-item" onclick="window.openArtistView('${sim.name}')">
          <div class="artist-avatar-wrap">
            <img src="${sim.avatar}" alt="${sim.name}" class="artist-avatar-img" loading="lazy">
            <div class="artist-play-hover">
              <i class="fa-solid fa-play"></i>
            </div>
          </div>
          <div class="artist-card-name">${sim.name}</div>
          <div class="artist-card-role">${sim.role}</div>
        </div>
      `).join('');
    }

    window.switchView('artist');
  };

  window.renderArtistDiscog = function(filter) {
    const artist = window.pulseState.currentArtistData;
    if (!artist) return;

    const grid = document.getElementById('artist-discography-grid');
    if (!grid) return;

    let items = [];
    if (filter === 'all' || filter === 'albums') {
      items = items.concat(artist.albums || []);
    }
    if (filter === 'all' || filter === 'singles') {
      items = items.concat(artist.singles || []);
    }

    grid.innerHTML = items.map(item => `
      <div class="music-card hover-glow" onclick="window.openCategoryView('spotify_global_top50', '${item.title}')">
        <div class="card-image-wrapper">
          <img src="${item.coverUrl}" alt="${item.title}" class="card-image" loading="lazy">
          <div class="card-play-overlay">
            <button class="btn-card-play"><i class="fa-solid fa-play"></i></button>
          </div>
          <span style="position: absolute; top: 8px; right: 8px; font-size: 0.65rem; font-weight: 700; background: rgba(0,0,0,0.8); color: #38bdf8; padding: 2px 6px; border-radius: 6px;">${item.year}</span>
        </div>
        <div class="card-meta">
          <span class="card-title">${item.title}</span>
          <span class="card-artist">${item.type} • ${artist.name}</span>
        </div>
      </div>
    `).join('');
  };

  window.filterArtistDiscog = function(filter) {
    document.querySelectorAll('.discog-filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-dfilter') === filter);
    });
    window.renderArtistDiscog(filter);
  };

  window.playArtistTopTracks = function() {
    const artist = window.pulseState.currentArtistData;
    if (artist && artist.topTracks && artist.topTracks.length > 0) {
      window.playTrackDirect(artist.topTracks[0], artist.topTracks);
      window.showToast(`Playing ${artist.name}'s Top Tracks`, 'info');
    }
  };

  window.toggleFollowArtist = function() {
    const btn = document.getElementById('artist-follow-btn');
    if (btn) {
      const isFollowing = btn.classList.toggle('following');
      btn.innerHTML = isFollowing ? `<i class="fa-solid fa-check"></i> Following` : `<i class="fa-solid fa-user-plus"></i> Follow`;
      window.showToast(isFollowing ? `Following ${window.pulseState.currentArtistData?.name || 'Artist'}` : `Unfollowed`, 'info', 1500);
    }
  };

  // ---------------------------------------------------------------------------
  // GLOBAL SEARCH & CONTROLLERS
  // ---------------------------------------------------------------------------

  let searchDebounceTimer = null;
  window.executeSearch = function(query, isTyping = false) {
    if (!query || query.trim().length === 0) return;
    window.switchView('search-view');

    const label = document.getElementById('search-query-label');
    const count = document.getElementById('search-count');
    if (label) label.textContent = query;

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
      if (count) count.textContent = 'Searching YouTube Music & ad-free streams...';
      const results = await window.musicService.searchTracks(query, 30);
      if (count) count.textContent = `${results.length} ad-free audio tracks discovered`;
      renderSearchResults(results);
    }, isTyping ? 300 : 0);
  };

  function renderSearchResults(tracks) {
    const container = document.getElementById('search-results-container');
    if (!container) return;

    if (tracks.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-compact-disc" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; color: var(--accent-primary);"></i>
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.5rem;">No audio tracks found</h3>
          <p>Try searching for a different artist, genre, or track title.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tracks.map((track, idx) => `
      <div class="track-card glass-card hover-glow" onclick="window.playTrackDirect(window.__searchResults[${idx}], window.__searchResults)">
        <div class="card-cover-wrap">
          <img src="${track.coverUrl || './pulse-logo.png'}" alt="${track.title}" class="card-cover" loading="lazy" onerror="this.src='./pulse-logo.png'">
          <div class="card-play-overlay">
            <button class="btn-play-hover" title="Play Ad-Free Audio">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
          <span class="card-badge-source">Ad-Free</span>
        </div>
        <div class="card-info">
          <h4 class="card-title" title="${track.title}">${track.title}</h4>
          <p class="card-artist" title="${track.artist}" onclick="event.stopPropagation(); window.openArtistView('${track.artist}')">${track.artist}</p>
        </div>
        <div class="card-actions" onclick="event.stopPropagation()">
          <button class="btn-action-icon" title="Add to Favorites" onclick="window.toggleFavoriteTrack(window.__searchResults[${idx}])">
            <i class="fa-regular fa-heart"></i>
          </button>
          <button class="btn-action-icon" title="Add to Playlist" onclick="window.openAddToPlaylistModal(window.__searchResults[${idx}])">
            <i class="fa-solid fa-list-plus"></i>
          </button>
        </div>
      </div>
    `).join('');

    window.__searchResults = tracks;
  }

  // ---------------------------------------------------------------------------
  // FIREBASE USER AUTHENTICATION & PROFILE CONTROLLERS
  // ---------------------------------------------------------------------------

  window.openAuthModal = function(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('active-modal');
    window.switchAuthTab(mode);
  };

  window.closeAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active-modal');
  };

  window.switchAuthTab = function(mode) {
    const loginForm = document.getElementById('auth-login-form');
    const signupForm = document.getElementById('auth-signup-form');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');

    if (mode === 'login') {
      if (loginForm) loginForm.style.display = 'block';
      if (signupForm) signupForm.style.display = 'none';
      if (tabLogin) tabLogin.classList.add('active-tab');
      if (tabSignup) tabSignup.classList.remove('active-tab');
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (signupForm) signupForm.style.display = 'block';
      if (tabLogin) tabLogin.classList.remove('active-tab');
      if (tabSignup) tabSignup.classList.add('active-tab');
    }
  };

  window.handleEmailLogin = async function(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('auth-login-email')?.value;
    const pass = document.getElementById('auth-login-pass')?.value;
    try {
      const user = await signInWithEmail(email, pass);
      window.closeAuthModal();
      window.showToast(`Welcome back, ${user.name}!`, 'success');
      updateUserUI(user);
    } catch (err) {
      window.showToast(err.message || 'Login failed', 'warning');
    }
  };

  window.handleEmailSignup = async function(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('auth-signup-name')?.value;
    const email = document.getElementById('auth-signup-email')?.value;
    const pass = document.getElementById('auth-signup-pass')?.value;
    try {
      const user = await signUpWithEmail(email, pass, name);
      window.closeAuthModal();
      window.showToast(`Welcome to Pulse, ${user.name}!`, 'success');
      updateUserUI(user);
    } catch (err) {
      window.showToast(err.message || 'Sign up failed', 'warning');
    }
  };

  window.handleGoogleLogin = async function() {
    try {
      const user = await signInWithGoogle();
      window.closeAuthModal();
      window.showToast(`Signed in with Google as ${user.name}`, 'success');
      updateUserUI(user);
    } catch (err) {
      window.showToast(err.message || 'Google sign-in failed', 'warning');
    }
  };

  window.handleAnonymousLogin = async function() {
    try {
      const user = await signInAnonymously();
      window.closeAuthModal();
      window.showToast(`Continuing as Guest Listener`, 'info');
      updateUserUI(user);
    } catch (err) {
      window.showToast('Guest sign in failed', 'warning');
    }
  };

  window.handleSignOut = function() {
    signOut();
    window.showToast('Signed out of Pulse', 'info');
    updateUserUI(null);
  };

  function updateUserUI(user) {
    window.pulseState.currentUser = user;
    const userBtn = document.getElementById('user-profile-btn');
    const userAvatar = document.getElementById('user-avatar-img');
    const userName = document.getElementById('user-display-name');

    if (user) {
      if (userAvatar) userAvatar.src = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`;
      if (userName) userName.textContent = user.name || 'Listener';
      if (userBtn) {
        userBtn.onclick = () => window.handleSignOut();
        userBtn.title = `Signed in as ${user.name} (Click to Sign Out)`;
      }
    } else {
      if (userAvatar) userAvatar.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=pulse';
      if (userName) userName.textContent = 'Sign In';
      if (userBtn) {
        userBtn.onclick = () => window.openAuthModal('login');
        userBtn.title = 'Sign In / Register';
      }
    }

    window.renderLibraryView();
  }

  // ---------------------------------------------------------------------------
  // CLOUD FIRESTORE USER LIBRARY (FAVORITES, PLAYLISTS, HISTORY)
  // ---------------------------------------------------------------------------

  window.switchLibraryTab = function(tabName) {
    window.pulseState.activeLibraryTab = tabName;
    document.querySelectorAll('.library-tab-btn').forEach(btn => {
      btn.classList.toggle('active-tab', btn.getAttribute('data-tab') === tabName);
    });
    window.renderLibraryView();
  };

  window.renderLibraryView = async function() {
    const container = document.getElementById('library-content-area');
    if (!container) return;

    const activeTab = window.pulseState.activeLibraryTab || 'favorites';

    if (activeTab === 'favorites') {
      const favorites = await getFavorites();
      if (favorites.length === 0) {
        container.innerHTML = `
          <div class="empty-library-state">
            <i class="fa-solid fa-heart" style="font-size: 3rem; color: #ff007a; margin-bottom: 1rem; opacity: 0.6;"></i>
            <h3>No liked songs yet</h3>
            <p>Tap the heart icon on any song to save it to your Firebase favorites.</p>
            <button class="btn-primary-action" onclick="window.switchView('home')" style="margin-top: 1rem;">
              <i class="fa-solid fa-compass"></i> Discover Music
            </button>
          </div>
        `;
        return;
      }

      window.__userFavorites = favorites;
      container.innerHTML = `
        <div class="library-header-row">
          <div>
            <h3 style="font-size: 1.4rem; font-weight: 700; color: #fff;">Liked Songs</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;">${favorites.length} saved songs</p>
          </div>
          <button class="btn-play-all" onclick="window.playTrackDirect(window.__userFavorites[0], window.__userFavorites)">
            <i class="fa-solid fa-play"></i> Play All
          </button>
        </div>
        <div class="library-track-list">
          ${favorites.map((track, idx) => `
            <div class="library-track-row" onclick="window.playTrackDirect(window.__userFavorites[${idx}], window.__userFavorites)">
              <span class="track-row-idx">${idx + 1}</span>
              <img src="${track.coverUrl || './pulse-logo.png'}" alt="cover" class="track-row-thumb">
              <div class="track-row-meta">
                <div class="track-row-title">${track.title}</div>
                <div class="track-row-artist">${track.artist}</div>
              </div>
              <div class="track-row-album">${track.album || 'Single'}</div>
              <div class="track-row-actions" onclick="event.stopPropagation()">
                <button class="btn-icon-danger" title="Remove from Favorites" onclick="window.removeFavoriteTrack('${track.id}')">
                  <i class="fa-solid fa-heart" style="color: #ff007a;"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeTab === 'playlists') {
      const playlists = await getPlaylists();
      if (playlists.length === 0) {
        container.innerHTML = `
          <div class="empty-library-state">
            <i class="fa-solid fa-folder-plus" style="font-size: 3rem; color: #38bdf8; margin-bottom: 1rem; opacity: 0.6;"></i>
            <h3>No custom playlists</h3>
            <p>Create your first cloud playlist to organize tracks.</p>
            <button class="btn-primary-action" onclick="window.openCreatePlaylistModal()" style="margin-top: 1rem;">
              <i class="fa-solid fa-plus"></i> Create Playlist
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="playlist-grid">
          ${playlists.map(pl => `
            <div class="playlist-card" onclick="window.playPlaylistDirect('${pl.id}')">
              <button class="btn-delete-playlist" title="Delete Playlist" onclick="event.stopPropagation(); window.deleteUserPlaylist('${pl.id}', '${pl.name}')">
                <i class="fa-solid fa-trash"></i>
              </button>
              <img src="${pl.coverUrl || './pulse-logo.png'}" alt="playlist" class="playlist-card-cover" style="width: 100%; aspect-ratio: 1; border-radius: 12px; object-fit: cover; margin-bottom: 0.75rem;">
              <h4 style="color: #fff; font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">${pl.name}</h4>
              <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0;">${pl.tracks ? pl.tracks.length : 0} tracks</p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeTab === 'history') {
      const history = await getHistory();
      if (history.length === 0) {
        container.innerHTML = `
          <div class="empty-library-state">
            <i class="fa-solid fa-clock-rotate-left" style="font-size: 3rem; color: #a855f7; margin-bottom: 1rem; opacity: 0.6;"></i>
            <h3>No listening history</h3>
            <p>Songs you stream will automatically appear here.</p>
          </div>
        `;
        return;
      }

      window.__userHistory = history;
      container.innerHTML = `
        <div class="library-header-row">
          <div>
            <h3 style="font-size: 1.4rem; font-weight: 700; color: #fff;">Listening History</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Recently played tracks</p>
          </div>
          <button class="btn-secondary-action" onclick="window.clearUserHistory()">
            <i class="fa-solid fa-trash-can"></i> Clear History
          </button>
        </div>
        <div class="library-track-list">
          ${history.map((track, idx) => `
            <div class="library-track-row" onclick="window.playTrackDirect(window.__userHistory[${idx}], window.__userHistory)">
              <span class="track-row-idx">${idx + 1}</span>
              <img src="${track.coverUrl || './pulse-logo.png'}" alt="cover" class="track-row-thumb">
              <div class="track-row-meta">
                <div class="track-row-title">${track.title}</div>
                <div class="track-row-artist">${track.artist}</div>
              </div>
              <div class="track-row-album">${track.album || 'Single'}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  };

  window.toggleFavoriteTrack = async function(track) {
    if (!track) return;
    const isFav = await addFavorite(track);
    window.showToast(isFav ? `Added "${track.title}" to Liked Songs` : `Song already in favorites`, 'success', 2000);
  };

  window.removeFavoriteTrack = async function(id) {
    await removeFavorite(id);
    window.showToast('Removed from Liked Songs', 'info', 1500);
    window.renderLibraryView();
  };

  window.openCreatePlaylistModal = function() {
    const modal = document.getElementById('create-playlist-modal');
    if (modal) modal.classList.add('active-modal');
  };

  window.closeCreatePlaylistModal = function() {
    const modal = document.getElementById('create-playlist-modal');
    if (modal) modal.classList.remove('active-modal');
  };

  window.handleCreatePlaylist = async function(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('new-playlist-name');
    const descInput = document.getElementById('new-playlist-desc');
    const name = nameInput ? nameInput.value : '';
    const desc = descInput ? descInput.value : '';

    if (!name.trim()) {
      window.showToast('Please enter a playlist name', 'warning');
      return;
    }

    try {
      const pl = await createPlaylist(name, desc);
      window.closeCreatePlaylistModal();
      if (nameInput) nameInput.value = '';
      if (descInput) descInput.value = '';
      window.showToast(`Playlist "${pl.name}" created!`, 'success');
      window.renderLibraryView();
    } catch (err) {
      window.showToast(err.message || 'Error creating playlist', 'warning');
    }
  };

  window.deleteUserPlaylist = async function(id, name) {
    if (confirm(`Delete playlist "${name}"?`)) {
      await deletePlaylist(id);
      window.showToast(`Playlist deleted`, 'info');
      window.renderLibraryView();
    }
  };

  window.playPlaylistDirect = async function(id) {
    const playlists = await getPlaylists();
    const pl = playlists.find(p => p.id === id);
    if (pl && pl.tracks && pl.tracks.length > 0) {
      window.playTrackDirect(pl.tracks[0], pl.tracks);
      window.showToast(`Playing playlist "${pl.name}"`, 'info');
    } else {
      window.showToast('Playlist is empty', 'warning');
    }
  };

  // Add to Playlist Modal
  let trackToAddToPlaylist = null;
  window.openAddToPlaylistModal = async function(track) {
    trackToAddToPlaylist = track;
    const modal = document.getElementById('add-to-playlist-modal');
    const listEl = document.getElementById('user-playlists-picker-list');
    if (!modal || !listEl) return;

    const playlists = await getPlaylists();
    if (playlists.length === 0) {
      listEl.innerHTML = '<p style="padding: 1rem; color: var(--text-muted);">No playlists created yet. Create one first!</p>';
    } else {
      listEl.innerHTML = playlists.map(pl => `
        <div class="playlist-picker-item" onclick="window.confirmAddTrackToPlaylist('${pl.id}')">
          <i class="fa-solid fa-list-check text-accent"></i>
          <span style="font-weight: 600;">${pl.name}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">${pl.tracks ? pl.tracks.length : 0} tracks</span>
        </div>
      `).join('');
    }

    modal.classList.add('active-modal');
  };

  window.closeAddToPlaylistModal = function() {
    const modal = document.getElementById('add-to-playlist-modal');
    if (modal) modal.classList.remove('active-modal');
    trackToAddToPlaylist = null;
  };

  window.confirmAddTrackToPlaylist = async function(playlistId) {
    if (!trackToAddToPlaylist || !playlistId) return;
    const added = await addTrackToPlaylist(playlistId, trackToAddToPlaylist);
    window.closeAddToPlaylistModal();
    if (added) {
      window.showToast(`Added to playlist!`, 'success');
    } else {
      window.showToast(`Song already in playlist`, 'info');
    }
  };

  window.clearUserHistory = async function() {
    if (confirm('Clear all listening history?')) {
      await clearHistory();
      window.showToast('History cleared', 'info');
      window.renderLibraryView();
    }
  };

  // ---------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY
  // ---------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // Render Home Feed Discovery
    window.renderHomeDiscovery();

    // Initial Auth State Sync
    onAuthStateChanged((user) => {
      updateUserUI(user);
    });

    // Realtime Library Updates
    onFavoritesChanged(() => {
      if (window.pulseState.activeLibraryTab === 'favorites') {
        window.renderLibraryView();
      }
    });

    onPlaylistsChanged(() => {
      if (window.pulseState.activeLibraryTab === 'playlists') {
        window.renderLibraryView();
      }
    });

    onHistoryChanged(() => {
      if (window.pulseState.activeLibraryTab === 'history') {
        window.renderLibraryView();
      }
    });

    // Search Input Binding
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        window.executeSearch(e.target.value, true);
      });
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          window.executeSearch(e.target.value, false);
        }
      });
    }
  });

})();
