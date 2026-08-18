/**
 * Pulse Music - Main Application Coordinator
 * Connects Audius & Jamendo Live Music Service, Persistent Playbar, LRCLIB Lyrics, Catalog, and Auth.
 */

import './musicService.js';
import './playbarController.js';
import './lyricsService.js';
import './catalogService.js';
import './firebaseAuthService.js';

(function() {
  'use strict';

  // Global State Reference
  window.pulseState = {
    currentUser: window.firebaseAuthService ? window.firebaseAuthService.getStoredUser() : null,
    currentTrack: null,
    isPlaying: false,
    activeCategory: 'all',
    currentLyrics: null,
    activeLyricIdx: -1
  };

  // Toast Helper
  window.showToast = function(msg, type = 'info', duration = 3000) {
    const container = document.getElementById('pulse-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'rgba(34,197,94,0.95)' : (type === 'warning' ? 'rgba(234,179,8,0.95)' : 'rgba(168,85,247,0.95)');
    toast.style.cssText = `background: ${bg}; color: #fff; padding: 0.8rem 1.2rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.5); backdrop-filter: blur(10px); transition: all 0.3s ease; animation: toastIn 0.3s ease;`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // 1. Navigation & Views Router
  window.switchView = function(viewId) {
    document.querySelectorAll('.app-view').forEach(el => el.classList.remove('active-view'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active-view');

    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-view') === viewId);
    });

    if (viewId === 'home') loadHomeFeed();
  };

  // 2. Playback Handlers
  window.playTrackDirect = function(track) {
    if (!track) return;
    if (window.PulsePlaybar && typeof window.PulsePlaybar.playTrack === 'function') {
      window.PulsePlaybar.playTrack(track);
    }
  };

  window.playSpecificTrack = async function(queryOrId) {
    window.showToast(`Finding stream for "${queryOrId}"...`, 'info', 2000);
    const results = await window.musicService.searchTracks(queryOrId, 1);
    if (results && results.length > 0) {
      window.playTrackDirect(results[0]);
    } else {
      window.showToast(`No direct audio stream found for "${queryOrId}"`, 'warning', 3000);
    }
  };

  // 3. Search Engine
  let searchDebounceTimer = null;
  window.executeSearch = function(query, isTyping = false) {
    if (!query || query.trim().length === 0) return;
    window.switchView('search-view');

    const label = document.getElementById('search-query-label');
    const count = document.getElementById('search-count');
    if (label) label.textContent = query;

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
      if (count) count.textContent = 'Searching 1.6M+ tracks...';
      const results = await window.musicService.searchTracks(query, 25);
      if (count) count.textContent = `${results.length} tracks discovered`;
      renderSearchResults(results);
    }, isTyping ? 300 : 0);
  };

  function renderSearchResults(tracks) {
    const container = document.getElementById('search-results-container');
    if (!container) return;

    if (tracks.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-compact-disc" style="font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.5;"></i>
          <p>No audio tracks found. Try another search query.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tracks.map(t => {
      const safeTitle = (t.title || 'Track').replace(/'/g, "\\'");
      const safeArtist = (t.artist || 'Artist').replace(/'/g, "\\'");
      return `
        <div class="track-search-row" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 12px; transition: all 0.2s ease; cursor: pointer;"
          onclick="window.playTrackDirect(${JSON.stringify(t).replace(/"/g, '&quot;')})">
          <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;">
            <img src="${t.coverUrl || './pulse-logo.png'}" style="width: 46px; height: 46px; border-radius: 8px; object-fit: cover;">
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.artist} • <span style="color: var(--accent-primary);">${t.source}</span></div>
            </div>
          </div>
          <button class="btn-circle-play" style="width: 38px; height: 38px; border-radius: 50%; background: var(--accent-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; margin-left: 1rem;">
            <i class="fa-solid fa-play"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  // 4. Multi-Category Home Feed Loader
  async function loadHomeFeed() {
    const categories = ['pop', 'hindi', 'electronic', 'lofi', 'rock', 'ambient'];
    for (const catId of categories) {
      const grid = document.getElementById(`cat-grid-${catId}`);
      if (grid && (!grid.children || grid.children.length === 0)) {
        const tracks = await window.catalogService.fetchCategoryTracks(catId, 6);
        if (tracks && tracks.length > 0) {
          grid.innerHTML = tracks.map(t => `
            <div class="music-card" onclick="window.playTrackDirect(${JSON.stringify(t).replace(/"/g, '&quot;')})">
              <div class="card-image-wrapper">
                <img src="${t.coverUrl || './pulse-logo.png'}" alt="${t.title}" class="card-image">
                <div class="card-play-overlay">
                  <button class="btn-card-play"><i class="fa-solid fa-play"></i></button>
                </div>
              </div>
              <div class="card-meta">
                <span class="card-title">${t.title}</span>
                <span class="card-artist">${t.artist}</span>
              </div>
            </div>
          `).join('');
        }
      }
    }
  }

  // 5. LRCLIB Live Lyrics Synchronizer
  window.loadTrackLyrics = async function(track) {
    if (!track) return;
    const lyrics = await window.lyricsService.getLyrics(track);
    window.pulseState.currentLyrics = lyrics;

    // Mini 2-line preview
    const curLine = document.getElementById('mini-lyric-current');
    const nextLine = document.getElementById('mini-lyric-next');
    if (lyrics && lyrics.isSynced && lyrics.lines.length > 0) {
      if (curLine) curLine.textContent = `♪ ${lyrics.lines[0].text}`;
      if (nextLine && lyrics.lines[1]) nextLine.textContent = lyrics.lines[1].text;
    } else {
      if (curLine) curLine.textContent = '♪ Lyrics preview ready';
      if (nextLine) nextLine.textContent = '';
    }
  };

  window.syncLiveLyrics = function(currentTime) {
    const lyrics = window.pulseState.currentLyrics;
    if (!lyrics || !lyrics.isSynced || !lyrics.lines) return;
    const idx = window.lyricsService.getActiveLineIndex(lyrics.lines, currentTime);
    if (idx === window.pulseState.activeLyricIdx) return;
    window.pulseState.activeLyricIdx = idx;

    if (idx >= 0 && lyrics.lines[idx]) {
      const curLine = document.getElementById('mini-lyric-current');
      const nextLine = document.getElementById('mini-lyric-next');
      if (curLine) curLine.textContent = lyrics.lines[idx].text;
      if (nextLine && lyrics.lines[idx + 1]) nextLine.textContent = lyrics.lines[idx + 1].text;
    }
  };

  // 6. Authentication UI Bindings
  window.openLoginModal = () => { document.getElementById('auth-modal')?.classList.remove('hidden'); window.switchAuthTab('login'); };
  window.openSignupModal = () => { document.getElementById('auth-modal')?.classList.remove('hidden'); window.switchAuthTab('signup'); };
  window.closeAuthModal = () => { document.getElementById('auth-modal')?.classList.add('hidden'); };

  window.switchAuthTab = function(tab) {
    document.getElementById('auth-form-login')?.classList.toggle('hidden', tab !== 'login');
    document.getElementById('auth-form-signup')?.classList.toggle('hidden', tab !== 'signup');
    document.getElementById('auth-form-phone')?.classList.toggle('hidden', tab !== 'phone');
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
  };

  window.handleRealLogin = async function(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('login-email')?.value;
    const pass = document.getElementById('login-password')?.value;
    try {
      const user = await window.firebaseAuthService.signInWithEmail(email, pass);
      window.pulseState.currentUser = user;
      updateAuthUI();
      window.closeAuthModal();
      window.showToast(`Welcome back, ${user.name}!`, 'success', 3000);
    } catch (err) {
      window.showToast(err.message, 'warning', 3500);
    }
  };

  window.handleRealSignup = async function(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('signup-name')?.value;
    const email = document.getElementById('signup-email')?.value;
    const pass = document.getElementById('signup-password')?.value;
    try {
      const user = await window.firebaseAuthService.signUpWithEmail(email, pass, name);
      window.pulseState.currentUser = user;
      updateAuthUI();
      window.closeAuthModal();
      window.showToast(`Account created for ${user.name}!`, 'success', 3000);
    } catch (err) {
      window.showToast(err.message, 'warning', 3500);
    }
  };

  window.handleGoogleOAuthLogin = async function() {
    try {
      const user = await window.firebaseAuthService.signInWithGoogle();
      window.pulseState.currentUser = user;
      updateAuthUI();
      window.closeAuthModal();
      window.showToast(`Signed in with Google!`, 'success', 3000);
    } catch (err) {
      window.showToast(err.message, 'warning', 3000);
    }
  };

  window.logout = function() {
    window.firebaseAuthService.signOut();
    window.pulseState.currentUser = null;
    updateAuthUI();
    window.showToast('Logged out successfully', 'info', 2500);
  };

  function updateAuthUI() {
    const authGroup = document.getElementById('auth-buttons-group');
    const userProfile = document.getElementById('user-profile-container');
    const userName = document.getElementById('user-display-name');
    const userAvatar = document.getElementById('user-avatar-img');

    if (window.pulseState.currentUser) {
      if (authGroup) authGroup.classList.add('hidden');
      if (userProfile) userProfile.classList.remove('hidden');
      if (userName) userName.textContent = window.pulseState.currentUser.name;
      if (userAvatar && window.pulseState.currentUser.avatar) userAvatar.src = window.pulseState.currentUser.avatar;
    } else {
      if (authGroup) authGroup.classList.remove('hidden');
      if (userProfile) userProfile.classList.add('hidden');
    }
  }

  // 7. Modals (Downloads)
  window.openDownloadModal = () => document.getElementById('download-app-modal')?.classList.remove('hidden');
  window.closeDownloadModal = () => document.getElementById('download-app-modal')?.classList.add('hidden');

  window.downloadPlatformApp = function(platform) {
    window.showToast(`Starting download for ${platform}...`, 'info', 2500);
  };

  // App Initialization
  function initApp() {
    updateAuthUI();
    loadHomeFeed();

    // Playbar Button bindings
    const playBtn = document.getElementById('btn-play-pause');
    if (playBtn) {
      playBtn.onclick = () => {
        if (!window.PulsePlaybar.getState().currentTrack) {
          window.playSpecificTrack('Starboy The Weeknd');
        } else {
          window.PulsePlaybar.togglePlayPause();
        }
      };
    }

    const prevBtn = document.getElementById('btn-prev');
    if (prevBtn) prevBtn.onclick = () => window.PulsePlaybar.playPrev();

    const nextBtn = document.getElementById('btn-next');
    if (nextBtn) nextBtn.onclick = () => window.PulsePlaybar.playNext();

    const slider = document.getElementById('player-seek-slider');
    if (slider) {
      slider.onmousedown = () => window.PulsePlaybar.handleSeekStart();
      slider.ontouchstart = () => window.PulsePlaybar.handleSeekStart();
      slider.oninput = (e) => window.PulsePlaybar.handleSeekMove(parseFloat(e.target.value));
      slider.onchange = (e) => window.PulsePlaybar.handleSeekEnd(parseFloat(e.target.value));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
