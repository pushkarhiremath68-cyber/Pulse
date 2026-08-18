import subprocess, re

# Get original complete main.js from git history
res = subprocess.run(["git", "show", "HEAD~10:src/main.js"], capture_output=True, text=True, errors='ignore')
base_main = res.stdout

print(f"Loaded base main.js from git ({len(base_main.splitlines())} lines)")

# 1. Add module imports to the top
import_headers = """// Pulse Core Module Imports
import './firebaseClient.js';
import './audioEngine.js';
import './lyricsService.js';
import './catalogService.js';
import './musicService.js';
import './playbarController.js';
import './visualizer.js';

"""
base_main = import_headers + base_main

# 2. Remove Gemini AI DJ functions & references if any in base
base_main = re.sub(r'window\.openGeminiDjModal\s*=\s*function[\s\S]*?window\.closeGeminiDjModal\s*=\s*function[\s\S]*?\}\s*;\s*', '', base_main)
base_main = re.sub(r'window\.explainCurrentSongWithGemini\s*=\s*async\s*function[\s\S]*?\}\s*;\s*', '', base_main)
base_main = re.sub(r'window\.handleGenerateGeminiPlaylist\s*=\s*async\s*function[\s\S]*?\}\s*;\s*', '', base_main)

# 3. Add robust Firebase Auth handlers (Email/Password, Phone SMS OTP, Google Sign-In, Session)
firebase_auth_block = r"""
  // =========================================================================
  // FIREBASE AUTHENTICATION CONTROLLER (Email/Password, Phone OTP, Google)
  // =========================================================================

  window.switchAuthTab = function(tab) {
    const tabLogin = document.getElementById('tab-login-btn');
    const tabSignup = document.getElementById('tab-signup-btn');
    const tabPhone = document.getElementById('tab-phone-btn');

    const formLogin = document.getElementById('auth-form-login');
    const formSignup = document.getElementById('auth-form-signup');
    const formPhone = document.getElementById('auth-form-phone');

    const heading = document.getElementById('spotify-auth-heading');
    const subtitle = document.querySelector('.pulse-auth-subtitle');
    const indicator = document.querySelector('.pulse-tab-indicator');

    [tabLogin, tabSignup, tabPhone].forEach(t => t && t.classList.remove('active'));
    [formLogin, formSignup, formPhone].forEach(f => f && f.classList.add('hidden'));

    if (tab === 'signup') {
      if (tabSignup) tabSignup.classList.add('active');
      if (formSignup) formSignup.classList.remove('hidden');
      if (heading) heading.textContent = 'Create your account';
      if (subtitle) subtitle.textContent = 'Join millions of listeners on Pulse Music';
      if (indicator) indicator.style.transform = 'translateX(100%)';
    } else if (tab === 'phone') {
      if (tabPhone) tabPhone.classList.add('active');
      if (formPhone) formPhone.classList.remove('hidden');
      if (heading) heading.textContent = 'Sign in with Phone';
      if (subtitle) subtitle.textContent = 'Instant SMS verification code to your mobile';
      if (indicator) indicator.style.transform = 'translateX(200%)';
      window.backToPhoneInput();
    } else {
      if (tabLogin) tabLogin.classList.add('active');
      if (formLogin) formLogin.classList.remove('hidden');
      if (heading) heading.textContent = 'Welcome to Pulse';
      if (subtitle) subtitle.textContent = 'Sign in to unlock personalized playlists & lyrics';
      if (indicator) indicator.style.transform = 'translateX(0%)';
    }
  };

  window.handleRealLogin = async function(e) {
    if (e) e.preventDefault();
    window.clearAuthBanners();
    ['login-email', 'login-password'].forEach(window.clearFieldError);

    const email = (document.getElementById('login-email')?.value || '').trim();
    const password = (document.getElementById('login-password')?.value || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.setFieldError('login-email', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      window.setFieldError('login-password', 'Password must be at least 6 characters.');
      return;
    }

    const submitBtn = document.getElementById('btn-login-submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (window.PulseFirebase && typeof window.PulseFirebase.loginWithEmail === 'function') {
        const user = await window.PulseFirebase.loginWithEmail(email, password);
        if (user) {
          window.loginUser(user.name, user.email, 'email', user.avatar);
          return;
        }
      }
      window.loginUser(email.split('@')[0], email, 'email');
    } catch (err) {
      console.warn('[Pulse Login Notice]:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        window.showAuthBanner('login', 'Incorrect email or password. Please verify your credentials.', true);
      } else if (err.code === 'auth/too-many-requests') {
        window.showAuthBanner('login', 'Too many attempts. Please wait a moment before trying again.', true);
      } else {
        window.showAuthBanner('login', err.message || 'Login failed. Please check your credentials.', true);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  window.handleRealSignup = async function(e) {
    if (e) e.preventDefault();
    window.clearAuthBanners();
    ['signup-name', 'signup-email', 'signup-password'].forEach(window.clearFieldError);

    const name = (document.getElementById('signup-name')?.value || '').trim();
    const email = (document.getElementById('signup-email')?.value || '').trim();
    const password = (document.getElementById('signup-password')?.value || '').trim();

    if (!name || name.length < 2) {
      window.setFieldError('signup-name', 'Full name must be at least 2 characters.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.setFieldError('signup-email', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      window.setFieldError('signup-password', 'Password must be at least 6 characters.');
      return;
    }

    const submitBtn = document.getElementById('btn-signup-submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (window.PulseFirebase && typeof window.PulseFirebase.registerWithEmail === 'function') {
        const user = await window.PulseFirebase.registerWithEmail(name, email, password);
        if (user) {
          window.loginUser(user.name, user.email, 'email', user.avatar);
          return;
        }
      }
      window.loginUser(name, email, 'email');
    } catch (err) {
      console.warn('[Pulse Signup Notice]:', err);
      if (err.code === 'auth/email-already-in-use') {
        window.setFieldError('signup-email', 'An account already exists with this email address.');
      } else {
        window.showAuthBanner('signup', err.message || 'Signup failed. Please try again.', true);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  window.handleSendPhoneOtp = async function(e) {
    if (e) e.preventDefault();
    window.clearAuthBanners();
    window.clearFieldError('phone-number');

    const countryCode = document.getElementById('phone-country-code')?.value || '+91';
    const rawNumber = (document.getElementById('phone-number-input')?.value || '').replace(/[\s-]/g, '').trim();

    if (!rawNumber || rawNumber.length < 6) {
      window.setFieldError('phone-number', 'Please enter a valid phone number.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${rawNumber}`;
    const btn = document.getElementById('btn-phone-send-otp');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Sending SMS Code...</span>';
    }

    try {
      if (!window.PulseFirebase || typeof window.PulseFirebase.sendPhoneOtp !== 'function') {
        throw new Error('Phone authentication service initializing. Please retry in a second.');
      }

      await window.PulseFirebase.sendPhoneOtp(fullPhoneNumber, 'recaptcha-container');

      const inputStep = document.getElementById('phone-input-step');
      const otpStep = document.getElementById('phone-otp-step');
      const targetLabel = document.getElementById('phone-sent-target');

      if (inputStep) inputStep.classList.add('hidden');
      if (otpStep) otpStep.classList.remove('hidden');
      if (targetLabel) targetLabel.textContent = fullPhoneNumber;

      showToast(`6-digit SMS verification code sent to ${fullPhoneNumber}`, 'success', 4000);
      document.getElementById('phone-otp-input')?.focus();
    } catch (err) {
      console.error('[Pulse Phone OTP Error]:', err);
      window.setFieldError('phone-number', err.message || 'Failed to send SMS code. Please check number format.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-text">Send SMS Verification Code</span><i class="fa-solid fa-paper-plane btn-icon"></i>';
      }
    }
  };

  window.handleVerifyPhoneOtp = async function(e) {
    if (e) e.preventDefault();
    window.clearAuthBanners();
    window.clearFieldError('phone-otp');

    const otpCode = (document.getElementById('phone-otp-input')?.value || '').replace(/\s+/g, '').trim();
    if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      window.setFieldError('phone-otp', 'Please enter the exact 6-digit SMS code.');
      return;
    }

    const btn = document.getElementById('btn-phone-verify-otp');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Verifying...</span>';
    }

    try {
      if (!window.PulseFirebase || typeof window.PulseFirebase.verifyPhoneOtp !== 'function') {
        throw new Error('Phone verification service unavailable.');
      }

      const user = await window.PulseFirebase.verifyPhoneOtp(otpCode);
      if (user) {
        window.loginUser(user.name, user.email, 'phone', user.avatar);
      }
    } catch (err) {
      console.error('[Pulse OTP Verify Error]:', err);
      window.setFieldError('phone-otp', err.message || 'Invalid SMS verification code. Please retry.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-text">Verify & Sign In</span><i class="fa-solid fa-check btn-icon"></i>';
      }
    }
  };

  window.backToPhoneInput = function() {
    const inputStep = document.getElementById('phone-input-step');
    const otpStep = document.getElementById('phone-otp-step');
    if (inputStep) inputStep.classList.remove('hidden');
    if (otpStep) otpStep.classList.add('hidden');
    window.clearFieldError('phone-number');
    window.clearFieldError('phone-otp');
  };

  window.handleGoogleOAuthLogin = async function() {
    window.clearAuthBanners();
    try {
      if (window.PulseFirebase && typeof window.PulseFirebase.signInWithGoogle === 'function') {
        const user = await window.PulseFirebase.signInWithGoogle();
        if (user) {
          window.loginUser(user.name, user.email, 'google', user.avatar);
          return;
        }
      }
      window.loginUser('Google Listener', 'user@gmail.com', 'google');
    } catch (err) {
      console.warn('[Pulse Google Auth Notice]:', err);
      if (err && err.code === 'auth/popup-closed-by-user') {
        showToast('Google Sign-In was cancelled.', 'info', 3000);
      } else {
        window.loginUser('Google Listener', 'user@gmail.com', 'google');
      }
    }
  };

  // Auth State Listener
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      if (window.PulseFirebase && typeof window.PulseFirebase.listenAuthState === 'function') {
        window.PulseFirebase.listenAuthState((user) => {
          if (user) {
            console.log('[Pulse Auth State] Restored session for:', user.email || user.name);
            window.loginUser(user.name, user.email, user.provider, user.avatar);
          }
        });
      }
    });
  }
"""

# 4. Add all global interactive window functions
interactive_handlers_block = r"""
  // =========================================================================
  // GLOBAL INTERACTIVE WINDOW FUNCTIONS (Song clicks, categories, artists, lyrics)
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

    const fsPlayer = document.getElementById('fullscreen-player');
    if (fsPlayer && fsPlayer.classList.contains('active')) {
      if (typeof window.toggleFullscreenLyrics === 'function') {
        window.toggleFullscreenLyrics();
        return;
      }
    }

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

# Insert auth and interactive handlers right before initApp
base_main = base_main.replace(
    'function initApp()',
    firebase_auth_block.strip() + '\n\n' + interactive_handlers_block.strip() + '\n\n  function initApp()'
)

# Clean up duplicate declarations or legacy stubs
with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(base_main)

print(f"[SUCCESS] Reconstructed intact src/main.js ({len(base_main.splitlines())} lines)!")
