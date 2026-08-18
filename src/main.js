/**
 * Pulse Music - Main Application Coordinator
 * Connects Audius & Jamendo Live Music Service, Persistent Playbar, LRCLIB Lyrics, Catalog, Firebase Auth, and Gemini AI DJ.
 */

import './musicService.js';
import './playbarController.js';
import './lyricsService.js';
import './catalogService.js';
import './firebaseAuthService.js';
import './geminiService.js';

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

  // 3. Search Engine with Side-by-Side Responsive Grid Display
  let searchDebounceTimer = null;
  window.executeSearch = function(query, isTyping = false) {
    if (!query || query.trim().length === 0) return;
    window.switchView('search-view');

    const label = document.getElementById('search-query-label');
    const count = document.getElementById('search-count');
    if (label) label.textContent = query;

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
      if (count) count.textContent = 'Searching millions of global tracks...';
      const results = await window.musicService.searchTracks(query, 30);
      if (count) count.textContent = `${results.length} tracks discovered`;
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
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.5rem;">No tracks found</h3>
          <p>Try searching for a different artist, genre, or track title.</p>
        </div>
      `;
      return;
    }

    // Side-by-side responsive music card grid
    container.innerHTML = tracks.map(t => {
      const safeDuration = t.duration ? `${Math.floor(t.duration / 60)}:${(t.duration % 60).toString().padStart(2, '0')}` : '3:30';
      return `
        <div class="music-card search-grid-card" onclick="window.playTrackDirect(${JSON.stringify(t).replace(/"/g, '&quot;')})">
          <div class="card-image-wrapper">
            <img src="${t.coverUrl || './pulse-logo.png'}" alt="${t.title}" class="card-image" loading="lazy">
            <div class="card-play-overlay">
              <button class="btn-card-play"><i class="fa-solid fa-play"></i></button>
            </div>
            <span class="card-source-tag" style="position: absolute; top: 8px; right: 8px; font-size: 0.65rem; font-weight: 700; background: rgba(0,0,0,0.7); color: #c084fc; padding: 2px 6px; border-radius: 6px; backdrop-filter: blur(4px);">${t.source || 'Studio'}</span>
          </div>
          <div class="card-meta">
            <span class="card-title" title="${t.title}" style="display: block; font-weight: 700; color: #fff; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px;">${t.title}</span>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="card-artist" title="${t.artist}" style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${t.artist}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 6px;">${safeDuration}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. LRCLIB Live Lyrics Synchronizer
  window.loadTrackLyrics = async function(track) {
    if (!track) return;
    const lyrics = await window.lyricsService.getLyrics(track);
    window.pulseState.currentLyrics = lyrics;

    const curLine = document.getElementById('mini-lyric-current');
    const nextLine = document.getElementById('mini-lyric-next');
    if (lyrics && lyrics.isSynced && lyrics.lines.length > 0) {
      if (curLine) curLine.textContent = `♪ ${lyrics.lines[0].text}`;
      if (nextLine && lyrics.lines[1]) nextLine.textContent = lyrics.lines[1].text;
    } else {
      if (curLine) curLine.textContent = '♪ Live lyrics synchronized';
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

  // 5. Gemini AI DJ Handlers
  window.openGeminiDJModal = () => document.getElementById('gemini-dj-modal')?.classList.remove('hidden');
  window.closeGeminiDJModal = () => document.getElementById('gemini-dj-modal')?.classList.add('hidden');

  window.handleAskGeminiDJ = async function(promptOverride = null) {
    const input = document.getElementById('gemini-prompt-input');
    const prompt = promptOverride || (input ? input.value : '');
    if (!prompt) {
      window.showToast('Please type a mood or vibe for Gemini DJ', 'warning', 2500);
      return;
    }

    const outputBox = document.getElementById('gemini-dj-output');
    const spinner = document.getElementById('gemini-loading-spinner');
    if (spinner) spinner.classList.remove('hidden');
    if (outputBox) outputBox.innerHTML = '<p style="color: #c084fc; text-align: center;">✨ Gemini 3.6 Flash is curating your personalized sonic journey...</p>';

    try {
      const result = await window.geminiService.askGeminiDJ(prompt);
      if (spinner) spinner.classList.add('hidden');
      if (outputBox) {
        outputBox.innerHTML = `
          <div style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); border-radius: 16px; padding: 1.25rem; margin-top: 1rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <h4 style="font-size: 1.2rem; font-weight: 800; color: #fff; margin: 0;">${result.djTitle}</h4>
              <span style="font-size: 0.72rem; padding: 3px 8px; border-radius: 20px; background: rgba(168,85,247,0.25); color: #c084fc; font-weight: 700;">GEMINI 3.6 FLASH</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">${result.vibe}</p>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${result.tracks.map(t => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; background: rgba(255,255,255,0.04); border-radius: 10px; cursor: pointer;"
                  onclick="window.playSpecificTrack('${t.title} ${t.artist}'); window.closeGeminiDJModal();">
                  <div>
                    <div style="font-size: 0.9rem; font-weight: 700; color: #fff;">${t.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${t.artist} • <em style="color: #a855f7;">${t.reason}</em></div>
                  </div>
                  <button class="btn-circle-play" style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-primary); color: #fff; font-size: 0.8rem;"><i class="fa-solid fa-play"></i></button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    } catch (e) {
      if (spinner) spinner.classList.add('hidden');
      if (outputBox) outputBox.innerHTML = `<p style="color: #f87171; text-align: center;">Error: ${e.message}</p>`;
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
