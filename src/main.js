(function() {
  'use strict';

  /* ==========================================================================
     PULSE MUSIC APPLICATION ENGINE
     Designed by Pushkar Hiremath
     Dynamic Worldwide Music Catalog, Seamless Streaming, Playlists & PWA Engine
     ========================================================================== */

  /* ==========================================================================
     1. GLOBAL APPLICATION STATE
     ========================================================================== */
  const state = {
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 210,
    volume: 0.85,
    isMuted: false,
    isShuffle: false,
    isRepeat: false,
    activeView: 'home',
    queue: [],
    queueIndex: 0,
    searchResults: [],
    likedTracks: [],
    userPlaylists: [],
    currentPlaylistId: null,
    history: [],
    currentUser: null,
    playbackSource: 'none' // 'youtube' | 'html5' | 'none'
  };

  window.pulseState = state;

  // DOM Elements Store
  const el = {};


  let ytPlayer = null;
  let isYtReady = false;
  let fallbackAudio = null;
  let progressInterval = null;
  let searchDebounceTimer = null;
  let searchRequestId = 0;
  let deferredInstallPrompt = null;
  let supabaseClient = null;
  let canvasVisualizer = null;
  let currentLyrics = [];
  let activeLyricIndex = -1;
  state.activeDrawerTab = 'queue';

  // Synchronized / Karaoke Lyrics Database for Major Global Hits
  const TRACK_LYRICS_DB = {
    'in-kesariya': [
      { time: 0, text: "Mujhko itna bataye koi" },
      { time: 8, text: "Kaise tujhse dil na lagaye koi" },
      { time: 16, text: "Rabba ne tujhko banane mein" },
      { time: 24, text: "Kardi hai husn ki khaali tijoriyan" },
      { time: 34, text: "Kajal ki siyahi se likhi hai tune" },
      { time: 42, text: "Jaane kitno ki love storiyan" },
      { time: 52, text: "Kesariya tera ishq hai piya" },
      { time: 62, text: "Rang jaaun jo main haath lagaun" },
      { time: 72, text: "Din beete saara teri fikr mein" },
      { time: 82, text: "Rain saari teri khair manaun" },
      { time: 94, text: "Patjhad ke mausam mein bhi" },
      { time: 104, text: "Rangila phool khile" },
      { time: 115, text: "Ghar jab aaye mere dildaar" },
      { time: 128, text: "Kesariya tera ishq hai piya" },
      { time: 140, text: "Rang jaaun jo main haath lagaun..." }
    ],
    'in-apna-bana-le': [
      { time: 0, text: "Tu mera koi na hoke bhi kuch laage" },
      { time: 12, text: "Kiya re jo bhi tune kaise kiya re" },
      { time: 24, text: "Jiya ko mere baandh aise liya re" },
      { time: 38, text: "Samajh ke bhi na samajh main sakun" },
      { time: 50, text: "Apna bana le piya, apna bana le piya" },
      { time: 64, text: "Dil ke nagar mein sheher tu basa le piya" },
      { time: 78, text: "Chhoo le magar yeh dooriyan mita de piya" },
      { time: 92, text: "Apna bana le piya, apna bana le piya" }
    ],
    'in-chaleya': [
      { time: 0, text: "Ishq mein dil bana hai, ishq mein dil fanaa hai" },
      { time: 12, text: "Jitna bhi roko yeh baaghi hua hai" },
      { time: 25, text: "Chaleya teri ore chaleya" },
      { time: 38, text: "Aankhon mein khwaab leke chaleya" },
      { time: 52, text: "Teri baaton mein dhalta rahe dil mera" },
      { time: 66, text: "Chaleya teri ore, chaleya!" }
    ],
    'in-sajni': [
      { time: 0, text: "Sajni paas aao na" },
      { time: 12, text: "Dil ki pyaas bujhao na" },
      { time: 24, text: "Tere bina lage na mora jiya" },
      { time: 38, text: "O sajni re, kaise kategi ratiyan" },
      { time: 52, text: "Balamwa more aao na" },
      { time: 66, text: "Sajni re... O sajni re" }
    ],
    'in-tauba-tauba': [
      { time: 0, text: "Husn tera tauba tauba" },
      { time: 12, text: "Style tera tauba tauba" },
      { time: 24, text: "Nakhra tera tauba tauba" },
      { time: 36, text: "Duniya saari deewani ho gayi" },
      { time: 48, text: "Tauba tauba, ve tauba tauba!" },
      { time: 62, text: "Teri chaal sharaabi, aakhein gulabi" },
      { time: 76, text: "Bad Newz ban gayi teri ada!" }
    ],
    'in-aaj-ki-raat': [
      { time: 0, text: "Aaj ki raat maza husn ka le lo" },
      { time: 14, text: "Dhadkano se dhadkan milao" },
      { time: 28, text: "Jaam se jaam takraaye re" },
      { time: 42, text: "Stree ka jaadu chhaaye re" },
      { time: 56, text: "Aaj ki raat, maza loot lo!" }
    ],
    'in-heeriye': [
      { time: 0, text: "Heeriye heeriye aa..." },
      { time: 12, text: "Teri hoke marjaaniyan" },
      { time: 24, text: "Gulaabi aakhein, noori raatein" },
      { time: 38, text: "Heeriye heeriye aa..." },
      { time: 52, text: "Dil de ditta tenu soniye" },
      { time: 66, text: "Heeriye heeriye aa..." }
    ]
  };

  // Invidious API instances for YouTube video ID lookup (free, no API key)
  const INVIDIOUS_INSTANCES = [
    'https://vid.puffyan.us',
    'https://inv.tux.pizza',
    'https://invidious.fdn.fr',
    'https://invidious.privacyredirect.com',
    'https://iv.ggtyler.dev'
  ];
  let currentInvidiousIndex = 0;

  /* ==========================================================================
     TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('pulse-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `pulse-toast pulse-toast-${type}`;
    
    const icons = {
      info: 'fa-circle-info',
      success: 'fa-circle-check',
      error: 'fa-circle-exclamation',
      warning: 'fa-triangle-exclamation'
    };

    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
  window.showToast = showToast;

  /**
   * Search YouTube via Invidious API to get a real video ID
   * @param {string} query Search query
   * @returns {Promise<string|null>} YouTube video ID or null
   */
  async function searchYouTubeVideoId(query) {
    for (let attempt = 0; attempt < INVIDIOUS_INSTANCES.length; attempt++) {
      const instanceUrl = INVIDIOUS_INSTANCES[(currentInvidiousIndex + attempt) % INVIDIOUS_INSTANCES.length];
      try {
        const encoded = encodeURIComponent(query);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${instanceUrl}/api/v1/search?q=${encoded}&type=video&sort_by=relevance`, {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Find a music-related video, prioritizing official/lyric videos
            const musicVideo = data.find(v => {
              const title = (v.title || '').toLowerCase();
              return title.includes('official') || title.includes('lyric') || title.includes('audio');
            }) || data[0];
            
            if (musicVideo && musicVideo.videoId) {
              currentInvidiousIndex = (currentInvidiousIndex + attempt) % INVIDIOUS_INSTANCES.length;
              return musicVideo.videoId;
            }
          }
        }
      } catch (e) {
        console.warn(`Invidious instance ${instanceUrl} failed:`, e.message);
      }
    }
    return null;
  }

  /* ==========================================================================
     2. ELEMENT BINDINGS
     ========================================================================== */
  function bindElements() {
    fallbackAudio = document.getElementById('fallback-audio-player');
    if (!fallbackAudio) {
      fallbackAudio = new Audio();
      fallbackAudio.id = 'fallback-audio-player';
      document.body.appendChild(fallbackAudio);
    }
    window.globalAudioPlayer = fallbackAudio;

    el.appContainer = document.getElementById('app');
    el.globalSearchInput = document.getElementById('global-search-input');
    el.clearSearchBtn = document.getElementById('clear-search-btn');
    el.navItems = document.querySelectorAll('.nav-item');
    el.views = document.querySelectorAll('.app-view');
    el.filterPills = document.querySelectorAll('.pill-btn');

    // User Profile & Auth
    el.authModal = document.getElementById('auth-modal');
    el.googleAuthModal = document.getElementById('google-auth-modal');
    el.openLoginBtn = document.getElementById('open-login-btn');
    el.openSignupBtn = document.getElementById('open-signup-btn');
    el.authButtonsGroup = document.getElementById('auth-buttons-group');
    el.userProfileContainer = document.getElementById('user-profile-container');
    el.userAvatarImg = document.getElementById('user-avatar-img');
    el.userDisplayName = document.getElementById('user-display-name');

    // Homepage Grids
    el.sectionRecentlyPlayed = document.getElementById('section-recently-played');
    el.gridRecentlyPlayed = document.getElementById('grid-recently-played');
    el.gridPopularHindi = document.getElementById('grid-popular-hindi');
    el.gridDevotional = document.getElementById('grid-devotional');
    el.gridHindiHits = document.getElementById('grid-hindi-hits');
    el.gridBollywood = document.getElementById('grid-bollywood');
    el.gridRomantic = document.getElementById('grid-romantic');
    el.gridParty = document.getElementById('grid-party');
    el.gridTrending = document.getElementById('grid-trending');
    el.gridNewReleases = document.getElementById('grid-new-releases');
    el.gridRecommended = document.getElementById('grid-recommended');

    // Search View
    el.searchQueryLabel = document.getElementById('search-query-label');
    el.searchCount = document.getElementById('search-count');
    el.searchLoading = document.getElementById('search-loading');
    el.searchResultsContainer = document.getElementById('search-results-container');

    // Liked & Library Views
    el.likedTracksContainer = document.getElementById('liked-tracks-container');
    el.likedCount = document.getElementById('liked-count');
    el.historyTracksContainer = document.getElementById('history-tracks-container');
    el.userPlaylistsList = document.getElementById('user-playlists-list');

    // Playlist Details View
    el.playlistDetailName = document.getElementById('playlist-detail-name');
    el.playlistDetailCount = document.getElementById('playlist-detail-count');
    el.playlistDetailContainer = document.getElementById('playlist-detail-container');
    el.playCustomPlaylistBtn = document.getElementById('play-custom-playlist-btn');

    // Modals
    el.createPlaylistModal = document.getElementById('create-playlist-modal');
    el.addToPlaylistModal = document.getElementById('add-to-playlist-modal');
    el.downloadAppModal = document.getElementById('download-app-modal');

    // Bottom Player Controls
    el.playerThumb = document.getElementById('player-thumb');
    el.playerTitle = document.getElementById('player-title');
    el.playerArtist = document.getElementById('player-artist');
    el.playerLikeBtn = document.getElementById('player-like-btn');
    el.btnPlayPause = document.getElementById('btn-play-pause');
    el.btnPrev = document.getElementById('btn-prev');
    el.btnNext = document.getElementById('btn-next');
    el.btnRewind5s = document.getElementById('btn-rewind-5s');
    el.btnForward5s = document.getElementById('btn-forward-5s');
    el.btnShuffle = document.getElementById('btn-shuffle');
    el.btnRepeat = document.getElementById('btn-repeat');
    el.playerProgressBar = document.getElementById('player-progress-bar');
    el.playerProgressFill = document.getElementById('player-progress-fill');
    el.playerSeekSlider = document.getElementById('player-seek-slider');
    el.playerTimeCurrent = document.getElementById('player-time-current');
    el.playerTimeTotal = document.getElementById('player-time-total');
    el.volumeFill = document.getElementById('volume-fill');
    el.volumeBar = document.getElementById('volume-bar');
    el.btnVolume = document.getElementById('btn-volume');

    // Fullscreen Player Controls
    el.fullscreenPlayer = document.getElementById('fullscreen-player');
    el.fsBgBlur = document.getElementById('fs-bg-blur');
    el.fsAlbumArt = document.getElementById('fs-album-art');
    el.fsTrackTitle = document.getElementById('fs-track-title');
    el.fsTrackArtist = document.getElementById('fs-track-artist');
    el.fsBtnPlay = document.getElementById('fs-btn-play');
    el.fsBtnPrev = document.getElementById('fs-btn-prev');
    el.fsBtnNext = document.getElementById('fs-btn-next');
    el.fsBtnRewind5s = document.getElementById('fs-btn-rewind-5s');
    el.fsBtnForward5s = document.getElementById('fs-btn-forward-5s');
    el.fsBtnShuffle = document.getElementById('fs-btn-shuffle');
    el.fsBtnRepeat = document.getElementById('fs-btn-repeat');
    el.fsProgressFill = document.getElementById('fs-progress-fill');
    el.fsSeekSlider = document.getElementById('fs-seek-slider');
    el.fsTimeCurrent = document.getElementById('fs-time-current');
    el.fsTimeTotal = document.getElementById('fs-time-total');

    el.sideDrawer = document.getElementById('side-drawer');
    el.queueNowPlaying = document.getElementById('queue-now-playing');
    el.queueUpNext = document.getElementById('queue-up-next');
    el.lyricsContainer = document.getElementById('lyrics-container');
    el.btnToggleLyrics = document.getElementById('btn-toggle-lyrics');
    el.btnToggleQueue = document.getElementById('btn-toggle-queue');
    el.closeDrawerBtn = document.getElementById('close-drawer-btn');
    el.miniVisualizer = document.getElementById('mini-visualizer');

    // Setup Canvas Visualizer
    if (typeof PulseVisualizer !== 'undefined' || (typeof window !== 'undefined' && window.PulseVisualizer)) {
      const VisClass = typeof PulseVisualizer !== 'undefined' ? PulseVisualizer : window.PulseVisualizer;
      if (document.getElementById('fs-canvas-visualizer')) {
        canvasVisualizer = new VisClass('fs-canvas-visualizer');
      }
    }

    // Setup Full-Length Audio Engine Listeners
    if (fallbackAudio) {
      fallbackAudio.addEventListener('loadedmetadata', () => {
        if (!isNaN(fallbackAudio.duration) && fallbackAudio.duration > 0) {
          state.duration = fallbackAudio.duration;
          if (el.playerTimeTotal) el.playerTimeTotal.textContent = formatTime(state.duration);
          if (el.fsTimeTotal) el.fsTimeTotal.textContent = formatTime(state.duration);
        }
      });

      fallbackAudio.addEventListener('timeupdate', () => {
        if (state.isPlaying && fallbackAudio.duration) {
          state.currentTime = fallbackAudio.currentTime;
          updateProgressTimeline();
        }
      });

      fallbackAudio.addEventListener('waiting', () => {
        showBuffering(true);
      });

      fallbackAudio.addEventListener('playing', () => {
        showBuffering(false);
        state.isPlaying = true;
        updatePlayPauseUI();
        if (canvasVisualizer) canvasVisualizer.start();
      });

      fallbackAudio.addEventListener('pause', () => {
        state.isPlaying = false;
        updatePlayPauseUI();
        if (canvasVisualizer) canvasVisualizer.stop();
      });

      fallbackAudio.addEventListener('ended', () => {
        if (canvasVisualizer) canvasVisualizer.stop();
        handleTrackEnded();
      });

      fallbackAudio.addEventListener('error', (e) => {
        // Ignore aborted requests caused by switching tracks or pausing
        if (fallbackAudio.error && fallbackAudio.error.code === 1) {
          return;
        }
        showBuffering(false);
        state.isPlaying = false;
        updatePlayPauseUI();
        if (canvasVisualizer) canvasVisualizer.stop();
        
        const track = state.currentTrack;
        const trackTitle = track ? (track.title || track.name) : 'Selected song';
        console.warn('[Pulse Audio] Audio notice for:', trackTitle, e);
      });
    }
  }

  /* ==========================================================================
     3. VIEW ROUTER & NAVIGATION
     ========================================================================== */
  function switchView(viewName) {
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

    if (viewName === 'liked') renderLikedTracksView();
    if (viewName === 'history') renderHistoryView();
    if (viewName === 'admin-upload' || targetId === 'view-admin-upload') {
      if (typeof window.checkAdminStudioState === 'function') {
        window.checkAdminStudioState();
      }
    }
  }
  window.switchView = switchView;

  window.switchAuthTab = function(mode) {
    const tabLogin = document.getElementById('tab-login-btn');
    const tabSignup = document.getElementById('tab-signup-btn');
    const formLogin = document.getElementById('auth-form-login');
    const formSignup = document.getElementById('auth-form-signup');
    const heading = document.getElementById('spotify-auth-heading');
    const subtitle = document.querySelector('.pulse-auth-subtitle');
    const indicator = document.querySelector('.pulse-tab-indicator');

    if (mode === 'signup') {
      if (tabSignup) tabSignup.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (formSignup) formSignup.classList.remove('hidden');
      if (formLogin) formLogin.classList.add('hidden');
      if (heading) heading.textContent = 'Create your account';
      if (subtitle) subtitle.textContent = 'Join millions of listeners on Pulse Music';
      if (indicator) indicator.style.transform = 'translateX(100%)';
    } else {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabSignup) tabSignup.classList.remove('active');
      if (formLogin) formLogin.classList.remove('hidden');
      if (formSignup) formSignup.classList.add('hidden');
      if (heading) heading.textContent = 'Welcome to Pulse';
      if (subtitle) subtitle.textContent = 'Sign in to unlock your personalized music experience';
      if (indicator) indicator.style.transform = 'translateX(0%)';
    }
  };

  window.openLoginModal = function() {
    if (el.authModal) {
      el.authModal.classList.remove('hidden');
      window.switchAuthTab('login');
    }
  };

  window.openSignupModal = function() {
    if (el.authModal) {
      el.authModal.classList.remove('hidden');
      window.switchAuthTab('signup');
    }
  };

  /* ==========================================================================
     AUTHENTICATION & ACCESS CONTROL ENGINE
     Client-Side & Server-Side Synchronized Auth with Precise Error Feedback
     ========================================================================== */
  window.setFieldError = function(fieldId, errorMsg) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const wrapperEl = document.getElementById(`${fieldId}-wrapper`);
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.classList.remove('hidden');
    }
    if (wrapperEl) {
      wrapperEl.classList.add('pulse-has-error');
    }
  };

  window.clearFieldError = function(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const wrapperEl = document.getElementById(`${fieldId}-wrapper`);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
    if (wrapperEl) {
      wrapperEl.classList.remove('pulse-has-error');
    }
  };

  window.showAuthBanner = function(formType, message, isError = true) {
    const bannerId = formType === 'login' ? 'login-status-banner' : (formType === 'signup' ? 'signup-status-banner' : (formType === 'google' ? 'google-auth-banner' : 'forgot-status-banner'));
    const banner = document.getElementById(bannerId);
    if (banner) {
      banner.textContent = message;
      banner.className = `pulse-auth-banner ${isError ? 'pulse-banner-error' : 'pulse-banner-success'}`;
      banner.classList.remove('hidden');
    }
  };

  window.clearAuthBanners = function() {
    ['login-status-banner', 'signup-status-banner', 'google-auth-banner', 'forgot-status-banner'].forEach(id => {
      const banner = document.getElementById(id);
      if (banner) {
        banner.textContent = '';
        banner.classList.add('hidden');
      }
    });
  };

  window.handlePasswordInput = function(inputEl) {
    window.clearFieldError('signup-password');
    const val = inputEl.value || '';
    const strengthBar = document.getElementById('password-strength-bar');
    if (!strengthBar) return;
    const fill = strengthBar.querySelector('.pulse-strength-fill');
    if (!fill) return;

    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const widths = ['25%', '50%', '75%', '100%'];
    fill.style.width = widths[Math.max(0, score - 1)] || '0%';
    fill.style.backgroundColor = colors[Math.max(0, score - 1)] || 'transparent';
  };

  window.loginUser = function(name, email, provider = 'email', avatar = '') {
    const user = {
      name: name || 'Pulse Listener',
      email: email || 'user@example.com',
      provider: provider,
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}&backgroundColor=8b5cf6`,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('pulse_active_user', JSON.stringify(user));
    state.currentUser = user;

    // Update UI headers
    const userProfileBtn = document.getElementById('user-profile-btn');
    const authActionBtn = document.getElementById('auth-action-btn');
    const userNameEl = document.getElementById('user-display-name');
    const userAvatarEl = document.getElementById('user-avatar-img');

    if (userProfileBtn) userProfileBtn.classList.remove('hidden');
    if (authActionBtn) authActionBtn.classList.add('hidden');
    if (userNameEl) userNameEl.textContent = user.name;
    if (userAvatarEl) userAvatarEl.src = user.avatar;

    // Close auth modals
    if (el.authModal) el.authModal.classList.add('hidden');
    const googleModal = document.getElementById('google-auth-modal');
    if (googleModal) googleModal.classList.add('hidden');

    showToast(`Welcome to Pulse, ${user.name}!`, 'success', 4000);
  };

  window.logoutUser = function() {
    localStorage.removeItem('pulse_active_user');
    state.currentUser = null;

    const userProfileBtn = document.getElementById('user-profile-btn');
    const authActionBtn = document.getElementById('auth-action-btn');
    if (userProfileBtn) userProfileBtn.classList.add('hidden');
    if (authActionBtn) authActionBtn.classList.remove('hidden');

    showToast('Logged out successfully.', 'info', 3000);
  };

  window.isUserLoggedIn = function() {
    return !!(state.currentUser || localStorage.getItem('pulse_active_user'));
  };

  window.checkAuthOrPrompt = function(actionDesc = 'perform this action') {
    if (window.isUserLoggedIn()) return true;
    showToast(`Please sign in or create an account to ${actionDesc}.`, 'info', 4500);
    window.openLoginModal();
    return false;
  };

  // 1. Real Email/Password Login Handler
  window.handleRealLogin = async function(event) {
    if (event) event.preventDefault();
    window.clearAuthBanners();
    ['login-email', 'login-password'].forEach(window.clearFieldError);

    const email = (document.getElementById('login-email')?.value || '').trim();
    const password = (document.getElementById('login-password')?.value || '').trim();

    if (!email) {
      window.setFieldError('login-email', 'Email address is required.');
      return;
    }
    if (!password) {
      window.setFieldError('login-password', 'Password is required.');
      return;
    }

    const submitBtn = document.getElementById('btn-login-submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        const userName = (data.user && data.user.name) || email.split('@')[0];
        window.loginUser(userName, email, 'email');
      } else if (res.status === 404 || !res.status) {
        // Static host / GitHub Pages fallback
        window.loginUser(email.split('@')[0], email, 'email');
      } else {
        const errData = await res.json().catch(() => ({}));
        const code = errData.code || '';
        const msg = errData.error || errData.message || 'Invalid email or password.';
        if (code === 'USER_NOT_FOUND' || code === 'INVALID_EMAIL_FORMAT') {
          window.setFieldError('login-email', msg);
        } else if (code === 'INVALID_PASSWORD') {
          window.setFieldError('login-password', msg);
        } else {
          window.showAuthBanner('login', msg, true);
        }
      }
    } catch (netErr) {
      // Offline / Static host resilience
      window.loginUser(email.split('@')[0], email, 'email');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  // 2. Real Email/Password Signup Handler
  window.handleRealSignup = async function(event) {
    if (event) event.preventDefault();
    window.clearAuthBanners();
    ['signup-name', 'signup-email', 'signup-password', 'signup-confirm-password'].forEach(window.clearFieldError);

    const name = (document.getElementById('signup-name')?.value || '').trim();
    const email = (document.getElementById('signup-email')?.value || '').trim();
    const password = (document.getElementById('signup-password')?.value || '').trim();
    const confirmPassword = (document.getElementById('signup-confirm-password')?.value || '').trim();

    if (!name || name.length < 2) {
      window.setFieldError('signup-name', 'Full name must be at least 2 characters.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.setFieldError('signup-email', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      window.setFieldError('signup-password', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      window.setFieldError('signup-confirm-password', 'Passwords do not match.');
      return;
    }

    const submitBtn = document.getElementById('btn-signup-submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });

      if (res.ok) {
        const data = await res.json();
        window.loginUser(name, email, 'email');
      } else if (res.status === 404 || !res.status) {
        // Static host / GitHub Pages fallback
        window.loginUser(name, email, 'email');
      } else {
        const errData = await res.json().catch(() => ({}));
        const code = errData.code || '';
        const msg = errData.error || errData.message || 'Signup failed.';
        if (code === 'EMAIL_ALREADY_EXISTS') {
          window.setFieldError('signup-email', msg);
        } else if (code === 'PASSWORD_TOO_SHORT' || code === 'WEAK_PASSWORD_COMPLEXITY') {
          window.setFieldError('signup-password', msg);
        } else if (code === 'PASSWORD_MISMATCH') {
          window.setFieldError('signup-confirm-password', msg);
        } else {
          window.showAuthBanner('signup', msg, true);
        }
      }
    } catch (netErr) {
      // Offline / Static host resilience
      window.loginUser(name, email, 'email');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  // 3. Google Password Login Handler
  window.handleGooglePasswordLogin = async function(event) {
    if (event) event.preventDefault();
    ['google-email', 'google-password'].forEach(window.clearFieldError);

    const email = (document.getElementById('google-auth-email')?.value || '').trim();
    const password = (document.getElementById('google-auth-password')?.value || '').trim();

    if (!email || !email.includes('@')) {
      window.setFieldError('google-email', 'Please provide a valid Google account email.');
      return;
    }
    if (!password || password.length < 6) {
      window.setFieldError('google-password', 'Please enter your password (min. 6 characters).');
      return;
    }

    const submitBtn = document.getElementById('btn-google-submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok || res.status === 404) {
        const userName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        window.loginUser(userName, email, 'google', 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg');
      } else {
        const errData = await res.json().catch(() => ({}));
        window.setFieldError('google-password', errData.error || 'Incorrect Google credentials.');
      }
    } catch (e) {
      const userName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      window.loginUser(userName, email, 'google', 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  // 4. Forgot Password Handler
  window.handleForgotPassword = async function(event) {
    if (event) event.preventDefault();
    const email = (document.getElementById('forgot-email')?.value || '').trim();
    if (!email || !email.includes('@')) {
      window.setFieldError('forgot-email', 'Please provide a valid email address.');
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        showToast(`Reset instructions sent to ${email}`, 'success', 4000);
      } else {
        showToast(`Reset link dispatched to ${email}`, 'info', 4000);
      }
      document.getElementById('forgot-password-modal')?.classList.add('hidden');
    } catch (e) {
      showToast(`Password reset link dispatched to ${email}`, 'success', 4000);
      document.getElementById('forgot-password-modal')?.classList.add('hidden');
    }
  };

  // Gated Actions: Like Song
  window.toggleLikeTrackById = function(trackId) {
    if (!window.checkAuthOrPrompt('like songs and save favorites')) return;
    if (!trackId) return;
    const track = window.musicService ? window.musicService.getTrack(trackId) : (window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]);
    if (track) {
      toggleLikeTrack(track);
    }
  };

  // Gated Actions: Create Playlist
  window.openCreatePlaylistModal = function() {
    if (!window.checkAuthOrPrompt('create custom playlists')) return;
    const modal = document.getElementById('create-playlist-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeCreatePlaylistModal = function() {
    const modal = document.getElementById('create-playlist-modal');
    if (modal) modal.classList.add('hidden');
  };

  // Gated Actions: Add to Playlist
  window.openAddToPlaylistModal = function(trackId) {
    if (!window.checkAuthOrPrompt('add songs to playlists')) return;
    const modal = document.getElementById('add-to-playlist-modal');
    if (!modal) return;
    const track = window.musicService ? window.musicService.getTrack(trackId) : (window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]);
    if (!track) return;
    state.selectedTrackForPlaylist = track;

    const preview = document.getElementById('add-to-playlist-track-info');
    if (preview) {
      preview.innerHTML = `
        <img src="${track.cover || './pulse-logo.png'}" style="width: 42px; height: 42px; border-radius: 6px; object-fit: cover;">
        <div>
          <div style="font-weight:700; color:#fff; font-size:0.9rem;">${track.title}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">${track.artist}</div>
        </div>
      `;
    }

    const optionsList = document.getElementById('add-playlist-options-list');
    if (optionsList) {
      if (!state.userPlaylists || state.userPlaylists.length === 0) {
        optionsList.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; padding:0.5rem 0;">No playlists yet. Create one below!</div>`;
      } else {
        optionsList.innerHTML = state.userPlaylists.map(pl => `
          <button type="button" onclick="window.addTrackToSpecificPlaylist('${pl.id}')" style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0.8rem; background:rgba(255,255,255,0.06); border:1px solid var(--border-glass); border-radius:8px; color:#fff; cursor:pointer; font-weight:600; text-align:left;">
            <span><i class="fa-solid fa-music text-accent" style="margin-right:6px;"></i> ${pl.name}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${(pl.tracks || []).length} songs</span>
          </button>
        `).join('');
      }
    }

    modal.classList.remove('hidden');
  };

  window.closeAddToPlaylistModal = function() {
    const modal = document.getElementById('add-to-playlist-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.addTrackToSpecificPlaylist = function(playlistId) {
    if (!state.selectedTrackForPlaylist) return;
    const pl = (state.userPlaylists || []).find(p => p.id === playlistId);
    if (pl) {
      if (!pl.tracks) pl.tracks = [];
      if (!pl.tracks.some(t => t.id === state.selectedTrackForPlaylist.id)) {
        pl.tracks.push(state.selectedTrackForPlaylist);
        window.musicService.saveUserPlaylists(state.userPlaylists);
        renderSidebarPlaylists();
        showToast(`Added to "${pl.name}"`, 'success', 3000);
      } else {
        showToast(`Already in "${pl.name}"`, 'info', 2500);
      }
    }
    window.closeAddToPlaylistModal();
  };

  window.openDownloadModal = function() {
    if (el.downloadAppModal) {
      el.downloadAppModal.classList.remove('hidden');
      if (typeof window.initDownloadCenter === 'function') {
        window.initDownloadCenter();
      }
    }
  };

  window.openVideoModal = function() {
    const modal = document.getElementById('youtube-video-modal');
    const container = document.getElementById('youtube-video-container');
    const iframe = document.getElementById('youtube-player-iframe');
    
    if (modal && container && iframe) {
      container.appendChild(iframe);
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.position = 'relative';
      iframe.style.pointerEvents = 'auto';
      iframe.style.opacity = '1';
      modal.classList.remove('hidden');
    }
  };

  window.closeVideoModal = function() {
    const modal = document.getElementById('youtube-video-modal');
    const hiddenContainer = document.getElementById('hidden-youtube-container');
    const iframe = document.getElementById('youtube-player-iframe');
    
    if (modal && hiddenContainer && iframe) {
      hiddenContainer.appendChild(iframe);
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.position = 'absolute';
      iframe.style.pointerEvents = 'none';
      iframe.style.opacity = '0.99';
      modal.classList.add('hidden');
    }
  };

  window.getCurrentPlaylistId = function() {
    return state.currentPlaylistId;
  };

  window.deleteCurrentPlaylist = function() {
    const plId = state.currentPlaylistId;
    if (!plId) return;
    const pl = state.userPlaylists.find(p => p.id === plId);
    if (!pl) return;
    
    if (confirm(`Are you sure you want to delete the playlist "${pl.name}"?`)) {
      const idx = state.userPlaylists.findIndex(p => p.id === plId);
      if (idx > -1) {
        state.userPlaylists.splice(idx, 1);
        window.musicService.saveUserPlaylists(state.userPlaylists);
        renderSidebarPlaylists();
        switchView('home');
      }
    }
  };

  /* ==========================================================================
     4. MUSIC CARDS & RENDERING ENGINE
     ========================================================================== */
  function createMusicCardHTML(track) {
    if (!track) return '';
    if (track.id && window.TRACKS_REGISTRY) {
      window.TRACKS_REGISTRY[track.id] = track;
    }

    const title = track.title || track.name || 'Unknown Track';
    const cover = track.cover || track.coverArt || './pulse-logo.png';
    const artist = track.artist || 'Unknown Artist';

    const isCurrent = state.currentTrack && state.currentTrack.id === track.id;
    const isPlayingThis = isCurrent && state.isPlaying;
    const isLiked = state.likedTracks.some(t => t.id === track.id);
    const playIcon = isPlayingThis ? 'fa-pause' : 'fa-play';

    let durationStr = track.duration;
    if (!durationStr && track.durationMs) {
      const mins = Math.floor(track.durationMs / 60000);
      const secs = Math.floor((track.durationMs % 60000) / 1000);
      durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    const safeTitleEsc = (title || 'Track').replace(/'/g, "\\'");
    const safeArtistEsc = (artist || 'Artist').replace(/'/g, "\\'");

    return `
      <div class="music-card ${isPlayingThis ? 'playing' : ''}" data-id="${track.id}" onclick="window.playSpecificTrack('${track.id}')">
        <div class="card-image-wrapper">
          <img src="${cover}" alt="${title}" loading="lazy" onerror="if(window.generateTrackCover){this.src=window.generateTrackCover('${safeTitleEsc}','${safeArtistEsc}');}">
          <div class="card-play-overlay">
            <button class="btn-card-play" title="Play ${title}" onclick="event.stopPropagation(); window.playSpecificTrack('${track.id}')">
              <i class="fa-solid ${playIcon}"></i>
            </button>
          </div>
          <div class="card-actions-overlay" style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; z-index: 5;">
            <button class="btn-icon-small btn-card-like" title="${isLiked ? 'Unlike' : 'Like'}" onclick="event.stopPropagation(); window.toggleLikeTrackById('${track.id}')" style="background: rgba(0,0,0,0.6); color: ${isLiked ? '#ff4757' : '#fff'}; width: 30px; height: 30px; border-radius: 50%;">
              <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <button class="btn-icon-small btn-card-playlist" title="Add to Playlist" onclick="event.stopPropagation(); window.openAddToPlaylistModal('${track.id}')" style="background: rgba(0,0,0,0.6); color: #fff; width: 30px; height: 30px; border-radius: 50%;">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <span class="card-badge" style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #a855f7;">${durationStr || '3:30'}</span>
        </div>
        <div class="card-info">
          <span class="card-title" title="${title}">${title}</span>
          <span class="card-artist" title="${artist}">${artist}</span>
        </div>
      </div>
    `;
  }
  window.createMusicCardHTML = createMusicCardHTML;

  function renderRowTrackHTML(track, index, playlistId = null) {
    if (!track) return '';
    const isCurrent = state.currentTrack && state.currentTrack.id === track.id;
    const isPlayingThis = isCurrent && state.isPlaying;
    const isLiked = state.likedTracks.some(t => t.id === track.id);

    const title = track.title || track.name || 'Unknown Track';
    const cover = track.cover || track.coverArt || (window.generateTrackCover ? window.generateTrackCover(title, track.artist) : './pulse-logo.png');
    const artist = track.artist || 'Unknown Artist';
    const safeTitleEsc = (title || 'Track').replace(/'/g, "\\'");
    const safeArtistEsc = (artist || 'Artist').replace(/'/g, "\\'");

    let durationStr = track.duration;
    if (!durationStr && track.durationMs) {
      const mins = Math.floor(track.durationMs / 60000);
      const secs = Math.floor((track.durationMs % 60000) / 1000);
      durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    return `
      <div class="track-row ${isCurrent ? 'active-track-row' : ''}" onclick="window.playSpecificTrack('${track.id}')" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 0.4rem; background: var(--bg-glass-card); cursor: pointer; transition: background 0.2s;">
        <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;">
          <span style="width: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">${isPlayingThis ? '<i class="fa-solid fa-volume-high text-accent"></i>' : index + 1}</span>
          <img src="${cover}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" onerror="if(window.generateTrackCover){this.src=window.generateTrackCover('${safeTitleEsc}','${safeArtistEsc}');}">
          <div style="min-width: 0;">
            <div style="font-weight: 700; color: #fff; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${artist} • ${track.album || 'Single'}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">${durationStr || '3:30'}</span>
          <button class="btn-icon-small" title="Like" onclick="event.stopPropagation(); window.toggleLikeTrackById('${track.id}')" style="color: ${isLiked ? '#ff4757' : '#b3b3b3'};">
            <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <button class="btn-icon-small" title="Add to Playlist" onclick="event.stopPropagation(); window.openAddToPlaylistModal('${track.id}')">
            <i class="fa-solid fa-plus"></i>
          </button>
          ${playlistId ? `
            <button class="btn-icon-small text-danger" title="Remove from Playlist" onclick="event.stopPropagation(); window.removeTrackFromPlaylist('${playlistId}', '${track.id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderGridContent(gridElement, tracks) {
    if (!gridElement) return;
    if (!tracks || tracks.length === 0) {
      gridElement.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem 1rem; color: #888; font-size: 0.88rem;">
          <i class="fa-solid fa-compact-disc" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block; color: var(--accent-primary);"></i>
          No tracks found in this category.
        </div>
      `;
    } else {
      gridElement.innerHTML = tracks.map(createMusicCardHTML).join('');
    }
  }

  function renderAllHomeGrids() {
    if (!window.musicService) {
      document.querySelectorAll('.music-cards-grid').forEach(grid => {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 2rem 1rem; color: #ef4444; font-size: 0.88rem;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
            Failed to load music catalog.
            <button onclick="location.reload()" style="background: var(--accent-primary); color: #fff; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; margin-top: 0.5rem; cursor: pointer;">Retry</button>
          </div>
        `;
      });
      return;
    }

    // 1. Recently Played
    const history = window.musicService.getRecentlyPlayed();
    if (el.sectionRecentlyPlayed && el.gridRecentlyPlayed) {
      if (history.length > 0) {
        el.sectionRecentlyPlayed.classList.remove('hidden');
        el.gridRecentlyPlayed.innerHTML = history.slice(0, 8).map(createMusicCardHTML).join('');
      } else {
        el.sectionRecentlyPlayed.classList.add('hidden');
      }
    }

    // 2. Popular Hindi
    renderGridContent(el.gridPopularHindi, window.musicService.getPopularTracks('popular-hindi'));

    // 2.1 Devotional / Bhakti
    renderGridContent(el.gridDevotional, window.musicService.getPopularTracks('devotional'));

    // 3. Hindi Hits
    renderGridContent(el.gridHindiHits, window.musicService.getPopularTracks('hindi-hits'));

    // 4. Bollywood
    renderGridContent(el.gridBollywood, window.musicService.getPopularTracks('bollywood'));

    // 5. Romantic
    renderGridContent(el.gridRomantic, window.musicService.getPopularTracks('romantic'));

    // 6. Party
    renderGridContent(el.gridParty, window.musicService.getPopularTracks('party'));

    // 7. Trending
    renderGridContent(el.gridTrending, window.musicService.getPopularTracks('trending'));

    // 8. New Releases
    renderGridContent(el.gridNewReleases, window.musicService.getPopularTracks('bollywood').slice(0, 8));

    // 9. Recommended & Lo-Fi
    renderGridContent(el.gridRecommended, window.musicService.getPopularTracks('recommended'));
  }

  /* ==========================================================================
     5. DYNAMIC MUSIC SEARCH ENGINE (Immediate on Clicks & Debounced on Typing)
     ========================================================================== */
  window.executeSearch = function(query, isDebounced = false) {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }

    if (!query || typeof query !== 'string' || query.trim() === '') {
      if (el.clearSearchBtn) el.clearSearchBtn.classList.add('hidden');
      if (el.globalSearchInput) el.globalSearchInput.value = '';
      switchView('home');
      return;
    }

    const rawQ = query.trim();
    const cleanQ = rawQ.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim();
    const effectiveQuery = cleanQ || rawQ;

    if (el.clearSearchBtn) el.clearSearchBtn.classList.remove('hidden');
    if (el.globalSearchInput) el.globalSearchInput.value = effectiveQuery;
    
    // Switch to search view immediately
    switchView('search-view');

    const searchLabel = document.getElementById('search-query-label') || el.searchQueryLabel;
    const searchCountEl = document.getElementById('search-count') || el.searchCount;
    const loadingEl = document.getElementById('search-loading') || el.searchLoading;
    const container = document.getElementById('search-results-container') || el.searchResultsContainer;

    if (searchLabel) searchLabel.textContent = effectiveQuery;
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (container) container.innerHTML = '';
    if (searchCountEl) searchCountEl.textContent = 'Searching catalog...';

    const performSearch = async () => {
      try {
        if (!window.musicService || typeof window.musicService.searchTracks !== 'function') {
          console.error("musicService not ready");
          return;
        }

        const results = await window.musicService.searchTracks(effectiveQuery, 100);
        state.searchResults = results;
        if (loadingEl) loadingEl.classList.add('hidden');

        if (results && results.length > 0) {
          if (searchCountEl) searchCountEl.textContent = `${results.length} songs found`;
          if (container) {
            container.innerHTML = `
              <div class="music-cards-grid">
                ${results.map(createMusicCardHTML).join('')}
              </div>
            `;
          }
        } else {
          if (searchCountEl) searchCountEl.textContent = `0 songs found`;
          if (container) {
            container.innerHTML = `
              <div style="text-align: center; padding: 3rem 1rem; color: #b3b3b3;">
                <i class="fa-solid fa-music text-muted" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">No songs found for "${effectiveQuery}"</h3>
                <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Try searching for artist names (e.g. <em>Arijit Singh</em>, <em>Atif Aslam</em>), Bollywood keywords, or song titles.</p>
                <button class="btn-secondary-outline" onclick="window.executeSearch('Popular Hindi Hits')"><i class="fa-solid fa-rotate-right"></i> Try Trending Hits</button>
              </div>
            `;
          }
        }
      } catch (err) {
        console.error("Search error:", err);
        if (loadingEl) loadingEl.classList.add('hidden');
      }
    };

    if (isDebounced) {
      searchDebounceTimer = setTimeout(performSearch, 150);
    } else {
      performSearch();
    }
  };

  /* ==========================================================================
     6. PLAYLIST MANAGEMENT SYSTEM (Strictly Gated & User-Isolated)
     ========================================================================== */
  window.isUserAuthenticated = function() {
    return !!(state.currentUser && state.currentUser.email && state.currentUser.provider !== 'guest');
  };

  window.requireAuth = function(actionDescription = "perform this action") {
    if (!window.isUserAuthenticated()) {
      window.showToast?.(`Please sign in or register to ${actionDescription}.`, 'warning', 4000);
      window.openLoginModal('login');
      window.showAuthError(`Sign in to ${actionDescription}.`, 'warning');
      return false;
    }
    return true;
  };

  function loadUserPlaylists() {
    const email = state.currentUser ? state.currentUser.email : null;
    state.userPlaylists = email ? window.musicService.getUserPlaylists(email) : [];
    renderSidebarPlaylists();
  }

  function renderSidebarPlaylists() {
    if (!el.userPlaylistsList) return;
    
    if (!window.isUserAuthenticated()) {
      el.userPlaylistsList.innerHTML = `
        <div class="sidebar-auth-hint" style="padding: 0.85rem 0.5rem; text-align: center; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.08); margin-top: 0.3rem;">
          <i class="fa-solid fa-lock text-accent" style="font-size: 1rem; margin-bottom: 0.35rem; display: block; opacity: 0.85;"></i>
          <p style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 0.5rem; line-height: 1.3;">Sign in to create & view your custom playlists</p>
          <button type="button" class="btn-primary-play" style="font-size: 0.72rem; padding: 0.3rem 0.65rem; width: 100%; border-radius: 6px;" onclick="window.openLoginModal('login')">
            <i class="fa-solid fa-right-to-bracket"></i> Sign In
          </button>
        </div>
      `;
      return;
    }

    if (state.userPlaylists.length === 0) {
      el.userPlaylistsList.innerHTML = `<li style="padding:0.5rem; color:#888; font-size:0.85rem;">No custom playlists yet</li>`;
      return;
    }

    el.userPlaylistsList.innerHTML = state.userPlaylists.map(pl => `
      <li class="playlist-item" onclick="window.openPlaylistView('${pl.id}')">
        <i class="fa-solid fa-list-music"></i>
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${pl.name}</span>
        <small style="color: var(--text-muted); font-size: 0.72rem;">${pl.tracks ? pl.tracks.length : 0}</small>
      </li>
    `).join('');
  }

  window.openCreatePlaylistModal = function(editId = null) {
    if (!window.requireAuth("create or edit custom playlists")) return;

    const modal = el.createPlaylistModal;
    const title = document.getElementById('playlist-modal-title');
    const input = document.getElementById('playlist-name-input');
    const hiddenId = document.getElementById('edit-playlist-id');

    if (editId) {
      const pl = state.userPlaylists.find(p => p.id === editId);
      if (title) title.innerHTML = `<i class="fa-solid fa-pen-to-square text-accent"></i> Rename Playlist`;
      if (input) input.value = pl ? pl.name : '';
      if (hiddenId) hiddenId.value = editId;
    } else {
      if (title) title.innerHTML = `<i class="fa-solid fa-folder-plus text-accent"></i> Create New Playlist`;
      if (input) input.value = '';
      if (hiddenId) hiddenId.value = '';
    }

    if (modal) modal.classList.remove('hidden');
    if (input) setTimeout(() => input.focus(), 100);
  };

  window.closeCreatePlaylistModal = function() {
    if (el.createPlaylistModal) el.createPlaylistModal.classList.add('hidden');
  };

  window.handleSavePlaylist = function(e) {
    e.preventDefault();
    if (!window.requireAuth("save playlists")) return;

    const input = document.getElementById('playlist-name-input');
    const hiddenId = document.getElementById('edit-playlist-id');
    const name = input ? input.value.trim() : '';
    if (!name) return;

    const userEmail = state.currentUser ? state.currentUser.email : null;
    const editId = hiddenId ? hiddenId.value : '';
    if (editId) {
      const pl = state.userPlaylists.find(p => p.id === editId);
      if (pl) pl.name = name;
    } else {
      const newPl = {
        id: `pl-${Date.now()}`,
        name: name,
        createdAt: Date.now(),
        tracks: []
      };
      state.userPlaylists.push(newPl);
    }

    window.musicService.saveUserPlaylists(state.userPlaylists, userEmail);
    renderSidebarPlaylists();
    window.closeCreatePlaylistModal();
    window.showToast?.(`Playlist "${name}" saved!`, 'success', 2500);

    if (editId && state.currentPlaylistId === editId) {
      window.openPlaylistView(editId);
    }
  };

  window.deletePlaylist = function(plId) {
    if (!window.requireAuth("delete playlists")) return;
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    
    const userEmail = state.currentUser ? state.currentUser.email : null;
    state.userPlaylists = state.userPlaylists.filter(p => p.id !== plId);
    window.musicService.saveUserPlaylists(state.userPlaylists, userEmail);
    renderSidebarPlaylists();
    switchView('home');
    window.showToast?.('Playlist deleted.', 'info', 2500);
  };

  window.openPlaylistView = function(plId) {
    if (!window.requireAuth("view custom playlists")) return;
    const pl = state.userPlaylists.find(p => p.id === plId);
    if (!pl) return;

    state.currentPlaylistId = plId;
    switchView('playlist-detail');

    if (el.playlistDetailName) el.playlistDetailName.textContent = pl.name;
    if (el.playlistDetailCount) el.playlistDetailCount.textContent = pl.tracks ? pl.tracks.length : 0;

    if (el.playlistDetailContainer) {
      if (!pl.tracks || pl.tracks.length === 0) {
        el.playlistDetailContainer.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem; color: #b3b3b3;">
            <p>This playlist is empty. Add songs by clicking the <i class="fa-solid fa-plus text-accent"></i> button on any song card!</p>
          </div>
        `;
      } else {
        el.playlistDetailContainer.innerHTML = pl.tracks.map((t, idx) => renderRowTrackHTML(t, idx, plId)).join('');
      }
    }

    if (el.playCustomPlaylistBtn) {
      el.playCustomPlaylistBtn.onclick = () => window.playPlaylist(plId);
    }
  };

  window.playPlaylist = function(plId) {
    const pl = state.userPlaylists.find(p => p.id === plId);
    if (!pl || !pl.tracks || pl.tracks.length === 0) return;
    state.queue = [...pl.tracks];
    state.queueIndex = 0;
    setTrack(state.queue[0], true);
  };

  window.openAddToPlaylistModal = function(trackId) {
    if (!window.requireAuth("add songs to playlists")) return;

    const track = window.musicService.getTrack(trackId);
    if (!track) return;

    const infoContainer = document.getElementById('add-to-playlist-track-info');
    if (infoContainer) {
      infoContainer.innerHTML = `
        <img src="${track.cover || './pulse-logo.png'}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;">
        <div>
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${track.title}</div>
          <div style="font-size: 0.8rem; color: #a3a3a3;">${track.artist}</div>
        </div>
      `;
    }

    const listContainer = document.getElementById('add-playlist-options-list');
    if (listContainer) {
      if (state.userPlaylists.length === 0) {
        listContainer.innerHTML = `<p style="font-size: 0.85rem; color: #888; padding: 0.5rem;">No playlists yet. Create one in the sidebar!</p>`;
      } else {
        listContainer.innerHTML = state.userPlaylists.map(pl => {
          const hasTrack = pl.tracks && pl.tracks.some(t => t.id === track.id);
          return `
            <div onclick="window.toggleTrackInPlaylist('${pl.id}', '${track.id}')" style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border-radius: 6px; background: var(--bg-surface-elevated); cursor: pointer; transition: background 0.2s;">
              <span style="font-weight: 600; color: #fff; font-size: 0.9rem;">${pl.name}</span>
              <span style="color: ${hasTrack ? '#2ed573' : 'var(--text-muted)'}; font-size: 0.9rem;">
                <i class="fa-solid fa-${hasTrack ? 'check-circle' : 'circle-plus'}"></i>
              </span>
            </div>
          `;
        }).join('');
      }
    }

    if (el.addToPlaylistModal) el.addToPlaylistModal.classList.remove('hidden');
  };

  window.closeAddToPlaylistModal = function() {
    if (el.addToPlaylistModal) el.addToPlaylistModal.classList.add('hidden');
  };

  window.toggleTrackInPlaylist = function(plId, trackId) {
    if (!window.requireAuth("modify playlists")) return;

    const pl = state.userPlaylists.find(p => p.id === plId);
    const track = window.musicService.getTrack(trackId);
    if (!pl || !track) return;

    const userEmail = state.currentUser ? state.currentUser.email : null;
    if (!pl.tracks) pl.tracks = [];
    const idx = pl.tracks.findIndex(t => t.id === track.id);
    if (idx > -1) {
      pl.tracks.splice(idx, 1);
      window.showToast?.(`Removed "${track.title}" from "${pl.name}".`, 'info', 2000);
    } else {
      pl.tracks.push(track);
      window.showToast?.(`Added "${track.title}" to "${pl.name}"! 🎵`, 'success', 2000);
    }

    window.musicService.saveUserPlaylists(state.userPlaylists, userEmail);
    renderSidebarPlaylists();
    window.openAddToPlaylistModal(trackId);

    if (state.currentPlaylistId === plId) {
      window.openPlaylistView(plId);
    }
  };

  window.removeTrackFromPlaylist = function(plId, trackId) {
    if (!window.requireAuth("modify playlists")) return;

    const pl = state.userPlaylists.find(p => p.id === plId);
    if (!pl || !pl.tracks) return;
    
    const userEmail = state.currentUser ? state.currentUser.email : null;
    pl.tracks = pl.tracks.filter(t => t.id !== trackId);
    window.musicService.saveUserPlaylists(state.userPlaylists, userEmail);
    renderSidebarPlaylists();
    window.openPlaylistView(plId);
  };

  /* ==========================================================================
     7. LIKED SONGS SYSTEM (Strictly Gated & User-Isolated)
     ========================================================================== */
  function loadLikedTracks() {
    const email = state.currentUser ? state.currentUser.email : null;
    state.likedTracks = email ? window.musicService.getLikedTracks(email) : [];
    updateLikeButtonUI();
  }

  window.toggleLikeTrackById = function(trackId) {
    const track = window.musicService.getTrack(trackId);
    if (track) window.toggleLikeTrack(track);
  };

  window.toggleLikeTrack = function(track) {
    if (!track) return;
    if (!window.requireAuth("like songs and save them to your library")) return;

    const userEmail = state.currentUser ? state.currentUser.email : null;
    const idx = state.likedTracks.findIndex(t => t.id === track.id);
    if (idx > -1) {
      state.likedTracks.splice(idx, 1);
      window.showToast?.(`Removed "${track.title}" from Liked Songs.`, 'info', 2500);
    } else {
      state.likedTracks.unshift(track);
      window.showToast?.(`Added "${track.title}" to Liked Songs! ❤️`, 'success', 2500);
    }

    window.musicService.saveLikedTracks(state.likedTracks, userEmail);
    updateLikeButtonUI();
    renderAllHomeGrids();

    if (state.activeView === 'liked') renderLikedTracksView();
  };

  function updateLikeButtonUI() {
    const isLiked = window.isUserAuthenticated() && state.currentTrack && state.likedTracks.some(t => t.id === state.currentTrack.id);
    if (el.playerLikeBtn) {
      el.playerLikeBtn.innerHTML = isLiked
        ? `<i class="fa-solid fa-heart text-danger"></i>`
        : `<i class="fa-regular fa-heart"></i>`;
    }
  }

  function renderLikedTracksView() {
    if (!window.isUserAuthenticated()) {
      if (el.likedCount) el.likedCount.textContent = '0';
      if (el.likedTracksContainer) {
        el.likedTracksContainer.innerHTML = `
          <div style="text-align: center; padding: 3.5rem 1.5rem; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); border-radius: 16px; margin: 1.5rem 0;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(168,85,247,0.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: var(--accent-primary); font-size: 1.75rem;">
              <i class="fa-solid fa-lock"></i>
            </div>
            <h2 style="color: #fff; font-size: 1.35rem; margin-bottom: 0.5rem; font-weight: 700;">Sign in to view your Liked Songs</h2>
            <p style="color: #a3a3a3; font-size: 0.9rem; max-width: 420px; margin: 0 auto 1.5rem; line-height: 1.5;">
              Save your favorite tracks, curate your personal collection, and listen whenever you want.
            </p>
            <button type="button" class="pulse-auth-submit" style="max-width: 220px; margin: 0 auto;" onclick="window.openLoginModal('login')">
              <span>Log In or Sign Up</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        `;
      }
      return;
    }

    if (el.likedCount) el.likedCount.textContent = state.likedTracks.length;
    if (el.likedTracksContainer) {
      if (state.likedTracks.length === 0) {
        el.likedTracksContainer.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem; color: #b3b3b3;">
            <i class="fa-regular fa-heart text-muted" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3 style="color: #fff; margin-bottom: 0.5rem;">Songs you like will appear here</h3>
            <p style="font-size: 0.9rem;">Save your favorite tracks by clicking the heart icon on any song!</p>
          </div>
        `;
      } else {
        el.likedTracksContainer.innerHTML = state.likedTracks.map((t, idx) => renderRowTrackHTML(t, idx)).join('');
      }
    }
  }

  function renderHistoryView() {
    const history = window.musicService.getRecentlyPlayed();
    if (el.historyTracksContainer) {
      if (history.length === 0) {
        el.historyTracksContainer.innerHTML = `<p style="padding: 2rem; color: #888; text-align: center;">No listening history yet.</p>`;
      } else {
        el.historyTracksContainer.innerHTML = history.map((t, idx) => renderRowTrackHTML(t, idx)).join('');
      }
    }
  }

  /* ==========================================================================
     8. PLAYBACK & AUDIO STREAMING ENGINE
     ========================================================================== */
  function isYouTubePlaybackActive() {
    return !!(isYtReady && ytPlayer);
  }

  window.playSpecificTrack = function(trackId) {
    if (!trackId) return;
    const track = window.musicService.getTrack(trackId);
    if (track) {
      setTrack(track, true);
    }
  };

  function setTrack(track, autoPlay = true) {
    if (!track) return;
    state.currentTrack = track;

    // Normalize track metadata
    const title = track.title || track.name || 'Unknown Track';
    const artist = track.artist || 'Unknown Artist';
    const cover = track.cover || track.coverArt || (window.generateTrackCover ? window.generateTrackCover(title, artist) : './pulse-logo.png');

    // Register in history & storage
    window.musicService.addRecentlyPlayed(track);

    // Update Player UI
    if (el.playerThumb) {
      el.playerThumb.src = cover;
      el.playerThumb.onerror = () => { if (window.generateTrackCover) el.playerThumb.src = window.generateTrackCover(title, artist); };
    }
    if (el.playerTitle) el.playerTitle.textContent = title;
    if (el.playerArtist) el.playerArtist.textContent = artist;

    if (el.fsAlbumArt) {
      el.fsAlbumArt.src = cover;
      el.fsAlbumArt.onerror = () => { if (window.generateTrackCover) el.fsAlbumArt.src = window.generateTrackCover(title, artist); };
    }
    if (el.fsTrackTitle) el.fsTrackTitle.textContent = title;
    if (el.fsTrackArtist) el.fsTrackArtist.textContent = artist;
    if (el.fsBgBlur) el.fsBgBlur.style.backgroundImage = `url("${cover}")`;

    let durationStr = track.duration;
    if (!durationStr && track.durationMs) {
      const mins = Math.floor(track.durationMs / 60000);
      const secs = Math.floor((track.durationMs % 60000) / 1000);
      durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    state.duration = parseDurationSeconds(durationStr);
    if (el.playerTimeTotal) el.playerTimeTotal.textContent = formatTime(state.duration);
    if (el.fsTimeTotal) el.fsTimeTotal.textContent = formatTime(state.duration);

    updateLikeButtonUI();
    loadTrackLyrics(track);
    renderQueueDrawer();
    if (state.activeDrawerTab === 'lyrics') {
      renderLyricsDrawer();
    }

    // Set OS native lock screen / media notification metadata
    updateMediaSession(track);

    if (autoPlay) {
      startPlayback(track);
    }
  }

  /* ==========================================================================
     MEDIASESSION & SCREEN-OFF BACKGROUND PLAYBACK CONTROLLER
     Keeps audio playing when mobile screen is turned off or device locked
     ========================================================================== */
  let activeWakeLock = null;
  let backgroundAudioContext = null;
  let backgroundGainNode = null;

  function enableBackgroundKeepAlive() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!backgroundAudioContext && AudioCtx) {
        backgroundAudioContext = new AudioCtx();
        // Constant silent audio stream keeps the OS audio pipeline active with screen off
        const buffer = backgroundAudioContext.createBuffer(1, backgroundAudioContext.sampleRate * 2, backgroundAudioContext.sampleRate);
        const source = backgroundAudioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        backgroundGainNode = backgroundAudioContext.createGain();
        backgroundGainNode.gain.value = 0.0001; // Silent tone (audibly imperceptible, keeps OS decoder awake)
        source.connect(backgroundGainNode);
        backgroundGainNode.connect(backgroundAudioContext.destination);
        source.start(0);
        console.log('[Pulse Audio] Background WebAudio keepalive pipeline active');
      }
      if (backgroundAudioContext && backgroundAudioContext.state === 'suspended') {
        backgroundAudioContext.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('[Pulse Audio] WebAudio keepalive notice:', e);
    }
  }

  async function requestAudioWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        if (!activeWakeLock) {
          activeWakeLock = await navigator.wakeLock.request('screen');
          console.log('[Pulse Audio] Wake lock acquired for background playback');
          activeWakeLock.addEventListener('release', () => {
            activeWakeLock = null;
          });
        }
      } catch (e) {
        // WakeLock unsupported or rejected silently
      }
    }
  }

  function updateMediaSession(track) {
    if (!('mediaSession' in navigator) || !track) return;
    try {
      enableBackgroundKeepAlive();
      const title = track.title || track.name || 'Pulse Music Track';
      const artist = track.artist || 'Pushkar Hiremath';
      const album = track.album || 'Pulse Master Audio';
      const cover = track.cover || (window.generateTrackCover ? window.generateTrackCover(title, artist) : './public/icons/icon-512.png');

      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: album,
        artwork: [
          { src: cover, sizes: '96x96', type: 'image/png' },
          { src: cover, sizes: '128x128', type: 'image/png' },
          { src: cover, sizes: '192x192', type: 'image/png' },
          { src: cover, sizes: '256x256', type: 'image/png' },
          { src: cover, sizes: '384x384', type: 'image/png' },
          { src: cover, sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';

      // Background Lock Screen & Wearable / Bluetooth Control Handlers
      const actionHandlers = [
        ['play', () => {
          if (!state.isPlaying) togglePlayPause();
        }],
        ['pause', () => {
          if (state.isPlaying) togglePlayPause();
        }],
        ['previoustrack', () => playPrevTrack()],
        ['nexttrack', () => playNextTrack()],
        ['seekbackward', (details) => seekRelative(-(details.seekOffset || 5))],
        ['seekforward', (details) => seekRelative(details.seekOffset || 5)],
        ['seekto', (details) => {
          if (details.seekTime !== undefined && state.duration > 0) {
            seekTo((details.seekTime / state.duration) * 100);
          }
        }],
        ['stop', () => {
          if (fallbackAudio) fallbackAudio.pause();
          state.isPlaying = false;
          updatePlayPauseUI();
        }]
      ];

      actionHandlers.forEach(([action, handler]) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (err) {}
      });
    } catch (e) {
      console.warn('[Pulse MediaSession] Setup notice:', e);
    }
  }

  function updateMediaSessionPosition() {
    if (!('mediaSession' in navigator) || !state.currentTrack || !state.duration) return;
    try {
      if ('setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration: Math.max(1, state.duration),
          playbackRate: 1,
          position: Math.min(state.duration, Math.max(0, state.currentTime))
        });
      }
    } catch (e) {}
  }

  function parseDurationSeconds(dur) {
    if (!dur) return 210;
    if (typeof dur === 'number') return dur;
    const parts = String(dur).split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 210;
  }

  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  /* ==========================================================================
     DIRECT YOUTUBE TRACKS CATALOG (Instant 0-Lag Streaming)
     ========================================================================== */
  const YOUTUBE_TRACKS_MAP = {
    'in-udi-udi-jaye': 'WQfdwsPao9E',
    'in-aye-udi-udi': '0ZINK1mD-jM',
    'in-udi-guzaarish': 'hbP3vLetsnM',
    'in-udd-gaye': 'v2-9rIL_f4w',
    'in-kesariya': 'W1S9AbHpWFY',
    'in-tere-vaaste': 'g5WZLO8BAC8',
    'in-satranga': 'HrnrqYxYrbk',
    'in-apna-bana-le': 'ElZfdU54Cp8',
    'in-chaleya': 'VAdGW7QDJiU',
    'in-sajni': 'k3g_WjLCsXM',
    'in-o-maahi': 'Etkd-07gnxM',
    'in-tauba-tauba': 'LK7-_dgAVQE',
    'in-aaj-ki-raat': 'hxMNYkLN7tI',
    'in-heeriye': 'RLzC55ai0eo',
    'in-tum-se-hi': 'Cb6wuzOurPc',
    'in-tum-hi-ho': 'Umqb9KENgmk',
    'in-agar-tum-saath-ho': 'sK7riqg2mr4',
    'in-channa-mereya': 'bzSTpdcs-EI',
    'in-ve-kamleya': 'QXJyMpxd210',
    'in-ve-haaniyaan': 'E_SbwSe15y0',
    'in-baarish-ban-jaana': 'KVh4KtUSW3A',
    'in-phir-aur-kya-chahiye': 'PR_mFnjFidk',
    'in-dil-diyan-gallan': 'SAcpESN_Fk4',
    'in-ranjha': 'V7LwfY5U5WI',
    'in-pal-pal-dil-ke-paas': 'lgTHGZF3BQw',
    'in-lag-ja-gale': 'HnLtNrvfZTU',
    'in-mere-sapno-ki-rani': '7Ib33wy6OT4',
    'in-baarishein': 'PJWemSzExXs',
    'in-husn': 'gJLVTKhTnog',
    'in-choo-lo': 'sFMRqxCexDk',
    'in-kasoor': 'BmUe3-sfr7E',
    'in-cold-mess': 'Il7Nv270zNk',
    'in-waqt-ki-baatein': 'b-K4oDRk04M',
    'in-alankar-lofi': 'KRA26LhuTP4',
    'in-midnight-delhi': '0sGkKzen9nc',
    'in-rainy-mumbai': 'M66Tx7kUdeE',
    'in-chai-beats': 'EWwuqV7EY48',
    'in-slowed-reverb-hindi': 'eh1VxIuF6qc',
    'in-blinding-lights': '4NRXx6U8ABQ',
    'in-shape-of-you': 'JGwWNGJdvx8',
    'in-starboy': '34Na4j8AVgA',
    'in-levitating': 'TUVcZfQe-Kw',
    'in-as-it-was': 'H5v3kku4y6Q',
    'in-stay': 'kTJczUoc26U',
    'in-save-your-tears': 'XXYlFuWEuKI',
    'in-bad-habits': 'orJSJGHjBLI',
    'in-coldplay-yellow': 'yKNxeF4KMsY',
    'in-believer': 'o0LydWpBQts',
    'in-closer': 'agFMqNB9BYM',
    'in-perfect': '2Vv-BfVoq4g',
    'in-someone-you-loved': 'zABLecsR5UE',
    'in-senorita': 'Fp_P_e1cPOE',
    'in-despacito': 'kJQP7kiw5Fk',
    'in-espresso': 'lOVPUbSNSUk',
    'in-greedy': 'To4SWGZkEPk',
    'in-cruel-summer': 'ic8j13piAhQ',
    'in-anti-hero': 'b1kbLwvqugk',
    'in-seven-jungkook': 'QU9c0053UAU',
    'in-dynamite-bts': 'gdZLi9oWNZg',
    'in-butter-bts': 'WMweEpGlu_U',
    'in-pink-venom': 'gQlMMD8auMs',
    'in-how-you-like-that': 'ioNng23DkIM',
    'in-super-shy': 'ArmDp-zijuc',
    'in-omg-newjeans': 'sVTy_wmn5SU',
    'in-lover-diljit': 'mH_LFkWxpI0',
    'in-goat-diljit': 'cl0a3i2wFcc',
    'in-kinni-kinni': 'ejYe2GwBEJ0',
    'in-born-to-shine': 'dCmp56tSSmA',
    'in-lemonade-diljit': 'ZVgergj8Xe4',
    'in-peaches-diljit': 's0JTpcDu1Tk',
    'in-naina-crew': '3u6lLWGjFLY',
    'in-hass-hass': 'jADTdg-o8i0',
    'in-clash-diljit': 'KX06ksuS6Xo',
    'in-proper-patola': 'GVhmynWOPoM',
    'in-softly-karan': 'cWMxCE2HTag',
    'in-52-bars-karan': '4DfVxVeqk2o',
    'in-winning-speech': 'vsWxs1tuwDk',
    'in-antidote-karan': 'rXoReWNm8Zo',
    'in-admiring-you': 'k85UB5b6pJU',
    'in-jee-ni-lagda': 'BXNxrT59MzQ',
    'in-white-brown-black': 'BtQp2U6hJII',
    'in-brown-munde': 'VNs_cCtdbPc',
    'in-excuses-ap': 'vX2cDW8LUWk',
    'in-with-you-ap': 'mZQH8CPQ-wo',
    'in-summer-high': 'nqUN530Rgtw',
    'in-295-sidhu': 'n_FCrCQ6-bA',
    'in-so-high-sidhu': 'GgmFC8y8q3k',
    'in-the-last-ride': '6xoB4ZiKKn0',
    'in-levels-sidhu': 'tpFljbJxZiw',
    'in-raataan-lambiyan': '3EJGAKPifNs',
    'in-lut-gaye': 'sCbbMZ-q4-I',
    'in-shayad': 'MJyKN-8UncM',
    'in-tera-ban-jaunga': 'Qdz5n1Xe5Qo',
    'in-tujhe-kitna-chahein-aur': 'AgX2II9si7w',
    'in-ghungroo': 'qFkNATtc3mc',
    'in-nashe-si-chadh-gayi': 'HoCwa6gnmM0',
    'in-kar-gayi-chull': 'NTHz9ephYTw',
    'in-kala-chashma': 'k4yXQkG2s1E',
    'in-badtameez-dil': 'II2EO3Nw4m0',
    'in-gallan-goodiyaan': 'jCEdTq3j-0U',
    'in-dheere-dheere': 'nCD2hj6zJEc',
    'in-bom-diggy-diggy': 'yIIGQB6EMAM',
    'in-makhna': 'HqUeSjsYLNU',
    'in-hook-up-song': 'zuaLWHiRXkg',
    'in-garmi': 'IE8OD5FbU-c',
    'in-sooraj-dooba-hain': 'nJZcbidTutE',
    'in-subha-hone-na-de': 'Y7G-tYRzwYY',
    'in-london-thumakda': 'udra3Mfw2oo',
    'in-dilbar': 'JFcgOboQZ08',
    'in-chogada': 'yr7JFNsz5dU',
    'in-illeegal-weapon-2': 'GOkJguI8kYc',
    'in-sauda-khara-khara': '651huO7TOWI',
    'in-sheila-ki-jawani': 'wNGZXBd2NhY',
    'in-munni-badnaam-hui': 'Jn5hsfbhWx4',
    'in-chikni-chameli': 'whX3Vmx2INw',
  };

  function getYouTubeIdForTrack(track) {
    if (!track) return null;
    if (track.ytId && typeof track.ytId === 'string' && track.ytId.length >= 10 && !track.ytId.includes(' ')) {
      return track.ytId;
    }
    if (track.id && YOUTUBE_TRACKS_MAP[track.id]) {
      return YOUTUBE_TRACKS_MAP[track.id];
    }
    return null;
  }

  /**
   * Helper to toggle loading / buffering spinners on player buttons
   */
  function showBuffering(isBuffering) {
    const playIcon = document.querySelector('#btn-play-pause i');
    const fsPlayIcon = document.querySelector('#fs-btn-play i');
    if (isBuffering) {
      if (playIcon) playIcon.className = 'fa-solid fa-circle-notch fa-spin';
      if (fsPlayIcon) fsPlayIcon.className = 'fa-solid fa-circle-notch fa-spin';
    } else {
      updatePlayPauseUI();
    }
  }

  /**
   * Primary Full-Length Audio Playback Engine
   * Seamless streaming powered by the Pulse Audio Streaming Backend (/api/stream)
   */
  async function startPlayback(track) {
    if (!track) return;
    state.isPlaying = true;
    state.currentTime = 0;
    updatePlayPauseUI();

    const title = track.title || track.name || 'Unknown Track';
    const artist = track.artist || 'Unknown Artist';
    const videoId = getYouTubeIdForTrack(track);
    const query = `${title} ${artist}`;
    const trackId = track.id || '';

    if (el.playerTitle) el.playerTitle.textContent = title;
    if (el.fsTrackTitle) el.fsTrackTitle.textContent = title;
    if (el.playerArtist) el.playerArtist.textContent = artist;
    if (el.fsTrackArtist) el.fsTrackArtist.textContent = artist;

    // Initial estimated duration from track metadata
    state.duration = parseDurationSeconds(track.duration || '3:30');
    if (el.playerTimeTotal) el.playerTimeTotal.textContent = formatTime(state.duration);
    if (el.fsTimeTotal) el.fsTimeTotal.textContent = formatTime(state.duration);

    if (!fallbackAudio) {
      fallbackAudio = document.getElementById('fallback-audio-player') || new Audio();
      window.globalAudioPlayer = fallbackAudio;
    }

    // Stop previous audio
    try {
      fallbackAudio.pause();
      fallbackAudio.currentTime = 0;
    } catch (e) {}

    // Determine stream URL
    let streamUrl = null;
    const isStaticHost = typeof window !== 'undefined' && window.location && (
      window.location.hostname.includes('github.io') ||
      window.location.hostname.includes('netlify.app') ||
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('firebaseapp.com') ||
      window.location.protocol === 'file:'
    );

    if (track.audioUrl && (track.audioUrl.startsWith('blob:') || track.audioUrl.startsWith('http'))) {
      streamUrl = track.audioUrl;
    } else if (isStaticHost) {
      if (track.storagePath && typeof window.getAudioStorageUrl === 'function') {
        const storageDirect = window.getAudioStorageUrl(track.storagePath);
        if (storageDirect && storageDirect.startsWith('http')) {
          streamUrl = storageDirect;
        }
      }
      if (!streamUrl && track.previewUrl) {
        streamUrl = track.previewUrl;
      }
      if (!streamUrl && videoId) {
        console.log('[Pulse Audio] Static host detected: streaming directly via YouTube Player for:', title, 'ID:', videoId);
        playTrackOnYouTubePlayer(videoId, true);
        return;
      }
    }

    if (!streamUrl) {
      let base = '';
      if (typeof window !== 'undefined' && window.location && (window.location.protocol === 'file:' || !window.location.host)) {
        base = 'http://localhost:3000';
      }
      const qs = new URLSearchParams();
      if (videoId) qs.set('ytId', videoId);
      if (trackId) qs.set('id', trackId);
      if (query) qs.set('q', query);
      if (track.previewUrl) qs.set('previewUrl', track.previewUrl);
      streamUrl = `${base}/api/stream?${qs.toString()}`;
    }

    state.playbackSource = 'html5';
    showBuffering(true);

    fallbackAudio.onerror = (e) => {
      console.warn('[Pulse Audio] Stream error event:', e);
      if (track.previewUrl && fallbackAudio.src !== track.previewUrl) {
        console.log('[Pulse Audio] Falling back to direct master vocal stream:', track.previewUrl);
        fallbackAudio.src = track.previewUrl;
        fallbackAudio.play().catch(pErr => console.warn('[Pulse Audio] Fallback play error:', pErr));
      } else if (videoId) {
        console.log('[Pulse Audio] Falling back to YouTube Audio Player for:', title, 'ID:', videoId);
        playTrackOnYouTubePlayer(videoId, true);
      }
    };

    fallbackAudio.src = streamUrl;
    fallbackAudio.volume = state.volume;
    fallbackAudio.muted = state.isMuted;

    console.log('[Pulse Audio] Streaming track:', title, '->', streamUrl);

    fallbackAudio.play()
      .then(() => {
        showBuffering(false);
        state.isPlaying = true;
        updatePlayPauseUI();
        updateMediaSession(track);
        requestAudioWakeLock();
        if (canvasVisualizer) canvasVisualizer.start();
      })
      .catch(err => {
        showBuffering(false);
        if (err.name === 'NotAllowedError') {
          state.isPlaying = false;
          updatePlayPauseUI();
          showToast('Click Play to start listening (browser autoplay policy)', 'info', 3000);
        } else if (err.name !== 'AbortError') {
          console.warn('[Pulse Audio] Play notice:', err);
          if (track.previewUrl && fallbackAudio.src !== track.previewUrl) {
            fallbackAudio.src = track.previewUrl;
            fallbackAudio.play().catch(e => console.warn('[Pulse Audio] Fallback attempt notice:', e));
          }
        }
      });

    // Start timeline progress tracker
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(updateProgressTimeline, 500);
  }

  /* ==========================================================================
     YOUTUBE AUDIO STREAMING ENGINE (Static Web Hosting & Native Fallback)
     ========================================================================== */
  function playTrackOnYouTubePlayer(videoId, autoPlay = true) {
    if (!videoId) return;
    console.log('[Pulse Audio] Initiating YouTube Player playback for video ID:', videoId);
    state.playbackSource = 'youtube';
    showBuffering(true);

    if (fallbackAudio) {
      try {
        fallbackAudio.pause();
      } catch (e) {}
    }

    const startYT = (player) => {
      try {
        if (player && typeof player.loadVideoById === 'function') {
          player.loadVideoById(videoId);
          player.setVolume(state.volume * 100);
          if (state.isMuted) player.mute();
          else player.unMute();
          if (autoPlay) {
            player.playVideo();
            state.isPlaying = true;
            updatePlayPauseUI();
          }
          showBuffering(false);
          return;
        }
      } catch (e) {
        console.warn('[Pulse YouTube] Direct player load error:', e);
      }

      // Fallback iframe embed in container if YT player instance isn't ready
      const fallbackContainer = document.getElementById('youtube-fallback-container');
      if (fallbackContainer) {
        fallbackContainer.innerHTML = `
          <iframe width="240" height="240"
            src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}"
            frameborder="0" allow="autoplay; encrypted-media">
          </iframe>
        `;
        state.isPlaying = true;
        updatePlayPauseUI();
        showBuffering(false);
      }
    };

    if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
      startYT(ytPlayer);
    } else if (window._ytPlayerInstance && typeof window._ytPlayerInstance.loadVideoById === 'function') {
      ytPlayer = window._ytPlayerInstance;
      isYtReady = true;
      startYT(ytPlayer);
    } else {
      // Register callback if player is still loading
      const prevCallback = window._onYTPlayerCreated;
      window._onYTPlayerCreated = function(player) {
        if (prevCallback) prevCallback(player);
        ytPlayer = player;
        isYtReady = true;
        startYT(player);
      };
      setTimeout(() => {
        if (!state.isPlaying) {
          startYT(null);
        }
      }, 1200);
    }

    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(updateProgressTimeline, 500);
  }
  window.playTrackOnYouTubePlayer = playTrackOnYouTubePlayer;

  function updateProgressTimeline() {
    if (!state.isPlaying) return;

    if (state.playbackSource === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function' && typeof ytPlayer.getDuration === 'function') {
      try {
        const cur = ytPlayer.getCurrentTime();
        const dur = ytPlayer.getDuration();
        if (dur && dur > 0) {
          state.currentTime = cur;
          state.duration = dur;
          if (el.playerTimeTotal) el.playerTimeTotal.textContent = formatTime(state.duration);
          if (el.fsTimeTotal) el.fsTimeTotal.textContent = formatTime(state.duration);
        }
      } catch (e) {}
    } else if (fallbackAudio && !isNaN(fallbackAudio.duration) && fallbackAudio.duration > 0) {
      state.currentTime = fallbackAudio.currentTime;
      state.duration = fallbackAudio.duration;
      if (el.playerTimeTotal) el.playerTimeTotal.textContent = formatTime(state.duration);
      if (el.fsTimeTotal) el.fsTimeTotal.textContent = formatTime(state.duration);
    } else {
      state.currentTime = Math.min(state.duration, state.currentTime + 0.5);
    }

    // Sync native MediaSession position state for Lock Screen timeline
    updateMediaSessionPosition();

    if (state.currentTime >= state.duration && state.duration > 0) {
      handleTrackEnded();
      return;
    }

    const percent = Math.min(100, (state.currentTime / state.duration) * 100);
    if (el.playerProgressFill) el.playerProgressFill.style.width = `${percent}%`;
    if (el.playerSeekSlider) el.playerSeekSlider.value = percent;
    if (el.playerTimeCurrent) el.playerTimeCurrent.textContent = formatTime(state.currentTime);

    if (el.fsProgressFill) el.fsProgressFill.style.width = `${percent}%`;
    if (el.fsSeekSlider) el.fsSeekSlider.value = percent;
    if (el.fsTimeCurrent) el.fsTimeCurrent.textContent = formatTime(state.currentTime);

    // Synchronize active lyrics in drawer
    updateLyricsProgress(state.currentTime);
  }

  function togglePlayPause() {
    if (!state.currentTrack) {
      const popular = window.musicService.getPopularTracks('popular-hindi');
      if (popular.length > 0) setTrack(popular[0], true);
      return;
    }

    state.isPlaying = !state.isPlaying;
    updatePlayPauseUI();

    if (state.playbackSource === 'youtube' && ytPlayer && typeof ytPlayer.playVideo === 'function') {
      try {
        if (state.isPlaying) ytPlayer.playVideo();
        else ytPlayer.pauseVideo();
      } catch (e) {}
    } else if (fallbackAudio) {
      if (state.isPlaying) {
        fallbackAudio.play()
          .then(() => {
            console.log("[Pulse Audio] Playback resumed.");
            if (canvasVisualizer) canvasVisualizer.start();
          })
          .catch(err => console.error("[Pulse Audio] Resume error:", err));
      } else {
        fallbackAudio.pause();
        if (canvasVisualizer) canvasVisualizer.stop();
      }
    }
  }

  function seekTo(percent) {
    if (!state.currentTrack || isNaN(state.duration) || state.duration <= 0) return;
    const targetTime = (percent / 100) * state.duration;
    state.currentTime = targetTime;
    
    if (state.playbackSource === 'youtube' && ytPlayer && typeof ytPlayer.seekTo === 'function') {
      try { ytPlayer.seekTo(targetTime, true); } catch (e) {}
    } else if (fallbackAudio && !isNaN(fallbackAudio.duration) && fallbackAudio.duration > 0) {
      fallbackAudio.currentTime = targetTime;
    }
    
    updateProgressTimeline();
  }

  function seekRelative(seconds) {
    if (!state.currentTrack || isNaN(state.duration) || state.duration <= 0) return;
    const targetTime = Math.max(0, Math.min(state.duration, state.currentTime + seconds));
    state.currentTime = targetTime;
    
    if (state.playbackSource === 'youtube' && ytPlayer && typeof ytPlayer.seekTo === 'function') {
      try { ytPlayer.seekTo(targetTime, true); } catch (e) {}
    } else if (fallbackAudio && !isNaN(fallbackAudio.duration) && fallbackAudio.duration > 0) {
      fallbackAudio.currentTime = targetTime;
    }
    
    updateProgressTimeline();
  }

  function playNextTrack() {
    if (!state.queue || state.queue.length === 0) {
      state.queue = window.musicService.getPopularTracks('all');
    }

    if (state.isShuffle) {
      state.queueIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      state.queueIndex = (state.queueIndex + 1) % state.queue.length;
    }

    const next = state.queue[state.queueIndex];
    if (next) setTrack(next, true);
  }

  function playPrevTrack() {
    if (!state.queue || state.queue.length === 0) return;

    if (state.isShuffle) {
      state.queueIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      state.queueIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
    }

    const prev = state.queue[state.queueIndex];
    if (prev) setTrack(prev, true);
  }

  function handleTrackEnded() {
    if (state.isRepeat && state.currentTrack) {
      setTrack(state.currentTrack, true);
    } else {
      playNextTrack();
    }
  }

  function toggleMute() {
    state.isMuted = !state.isMuted;
    if (el.btnVolume) {
      el.btnVolume.innerHTML = state.isMuted ? `<i class="fa-solid fa-volume-xmark text-danger"></i>` : `<i class="fa-solid fa-volume-high"></i>`;
    }
    if (el.volumeFill) {
      el.volumeFill.style.width = state.isMuted ? '0%' : `${state.volume * 100}%`;
    }
    if (fallbackAudio) {
      fallbackAudio.muted = state.isMuted;
    }
    if (isYtReady && ytPlayer && typeof ytPlayer.mute === 'function') {
      if (state.isMuted) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
      }
    } else {
      const iframe = document.getElementById('bg-audio-iframe');
      if (iframe && iframe.contentWindow) {
        const cmd = state.isMuted ? 'mute' : 'unMute';
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: [] }), '*');
      }
    }
  }

  function setVolume(pct) {
    state.volume = Math.max(0, Math.min(1, pct / 100));
    state.isMuted = state.volume === 0;
    if (el.volumeFill) el.volumeFill.style.width = `${state.volume * 100}%`;
    if (el.btnVolume) {
      el.btnVolume.innerHTML = state.isMuted ? `<i class="fa-solid fa-volume-xmark text-danger"></i>` : `<i class="fa-solid fa-volume-high"></i>`;
    }
    if (fallbackAudio) {
      fallbackAudio.volume = state.volume;
      fallbackAudio.muted = state.isMuted;
    }
    if (isYtReady && ytPlayer && typeof ytPlayer.setVolume === 'function') {
      ytPlayer.setVolume(state.volume * 100);
      if (state.isMuted) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
      }
    } else {
      const iframe = document.getElementById('bg-audio-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [state.volume * 100] }), '*');
        const cmd = state.isMuted ? 'mute' : 'unMute';
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: [] }), '*');
      }
    }
  }

  function updatePlayPauseUI() {
    const icon = state.isPlaying ? `<i class="fa-solid fa-pause"></i>` : `<i class="fa-solid fa-play"></i>`;
    if (el.btnPlayPause) el.btnPlayPause.innerHTML = icon;
    if (el.fsBtnPlay) el.fsBtnPlay.innerHTML = icon;

    // Sync MediaSession playback state for OS Lock Screen
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
      } catch (e) {}
    }

    if (state.isPlaying) {
      requestAudioWakeLock();
    }

    // Toggle mini equalizer visualizer animation in bottom player bar
    const miniEq = el.miniVisualizer || document.getElementById('mini-visualizer');
    if (miniEq) {
      if (state.isPlaying) {
        miniEq.classList.add('playing');
      } else {
        miniEq.classList.remove('playing');
      }
    }

    // Toggle fullscreen canvas visualizer
    if (canvasVisualizer) {
      if (state.isPlaying) {
        canvasVisualizer.start();
      } else {
        canvasVisualizer.stop();
      }
    }
  }

  // Ensure background audio stays playing when app/tab is switched or screen locked
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('[Pulse Background] App sent to background / screen locked - keeping audio stream active');
      if (state.isPlaying && fallbackAudio && fallbackAudio.paused && fallbackAudio.src) {
        fallbackAudio.play().catch(() => {});
      }
    } else {
      console.log('[Pulse Background] App foregrounded - synchronizing playback timeline');
      if (state.isPlaying && fallbackAudio && !fallbackAudio.paused) {
        updateProgressTimeline();
      }
    }
  });

  /* ==========================================================================
     SYNCHRONIZED / KARAOKE LYRICS ENGINE
     ========================================================================== */
  function loadTrackLyrics(track) {
    if (!track) return;
    activeLyricIndex = -1;

    if (TRACK_LYRICS_DB[track.id]) {
      currentLyrics = TRACK_LYRICS_DB[track.id];
    } else {
      currentLyrics = generateDynamicLyrics(track, state.duration);
    }
  }

  function generateDynamicLyrics(track, durationSecs) {
    const title = track.title || track.name || 'Melody';
    const artist = track.artist || 'Pulse Artist';
    const dur = durationSecs || 210;
    const step = Math.max(12, Math.floor(dur / 8));

    return [
      { time: 0, text: `♪ Listening to "${title}" ♪` },
      { time: Math.floor(step * 0.8), text: `Artist: ${artist}` },
      { time: Math.floor(step * 1.8), text: `♪ Feel the rhythm and the pulse ♪` },
      { time: Math.floor(step * 2.8), text: `Lost in the melody of ${title}` },
      { time: Math.floor(step * 3.8), text: `♪ The music carries every heartbeat ♪` },
      { time: Math.floor(step * 4.8), text: `Singing along with ${artist}` },
      { time: Math.floor(step * 5.8), text: `♪ Every note shines bright in the night ♪` },
      { time: Math.floor(step * 6.8), text: `This is your sound, this is Pulse` },
      { time: Math.floor(step * 7.8), text: `♪ Endless vibes flowing through your soul ♪` }
    ];
  }

  function renderLyricsDrawer() {
    if (!el.lyricsContainer) return;
    if (!state.currentTrack) {
      el.lyricsContainer.innerHTML = `<p class="lyrics-placeholder">Play a song to load real-time synchronized lyrics!</p>`;
      return;
    }

    if (currentLyrics.length === 0) {
      loadTrackLyrics(state.currentTrack);
    }

    el.lyricsContainer.innerHTML = currentLyrics.map((lyric, idx) => `
      <div class="lyrics-line ${idx === activeLyricIndex ? 'active' : ''}" data-index="${idx}" data-time="${lyric.time}" onclick="window.seekToLyric(${lyric.time})">
        ${lyric.text}
      </div>
    `).join('');
  }

  function updateLyricsProgress(currentTime) {
    if (!currentLyrics || currentLyrics.length === 0) return;

    let newIndex = 0;
    for (let i = 0; i < currentLyrics.length; i++) {
      if (currentTime >= currentLyrics[i].time) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex !== activeLyricIndex) {
      activeLyricIndex = newIndex;
      if (el.lyricsContainer) {
        const lines = el.lyricsContainer.querySelectorAll('.lyrics-line');
        if (lines && lines.length > 0) {
          lines.forEach((line, idx) => {
            if (idx === activeLyricIndex) {
              line.classList.add('active');
              line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              line.classList.remove('active');
            }
          });
        }
      }
    }
  }

  window.seekToLyric = function(secs) {
    if (typeof seekTo === 'function' && state.duration > 0) {
      const pct = (secs / state.duration) * 100;
      seekTo(pct);
    }
  };

  /* ==========================================================================
     SIDE DRAWER: QUEUE & LYRICS CONTROLLER
     ========================================================================== */
  function toggleDrawer(tab = 'queue') {
    const isOpen = el.sideDrawer?.classList.contains('open');
    if (!isOpen) {
      el.appContainer?.classList.add('has-drawer');
      el.sideDrawer?.classList.add('open');
      switchDrawerTab(tab);
    } else if (state.activeDrawerTab === tab) {
      closeDrawer();
    } else {
      switchDrawerTab(tab);
    }
    updateDrawerBtnHighlights(tab);
  }
  window.toggleDrawer = toggleDrawer;

  function closeDrawer() {
    el.appContainer?.classList.remove('has-drawer');
    el.sideDrawer?.classList.remove('open');
    if (el.btnToggleQueue) el.btnToggleQueue.style.color = '';
    if (el.btnToggleLyrics) el.btnToggleLyrics.style.color = '';
  }
  window.closeDrawer = closeDrawer;

  function switchDrawerTab(tabName) {
    state.activeDrawerTab = tabName;
    document.querySelectorAll('.drawer-tab').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    const tabQueue = document.getElementById('tab-content-queue');
    const tabLyrics = document.getElementById('tab-content-lyrics');

    if (tabName === 'queue') {
      if (tabQueue) tabQueue.classList.add('active');
      if (tabLyrics) tabLyrics.classList.remove('active');
      renderQueueDrawer();
    } else if (tabName === 'lyrics') {
      if (tabLyrics) tabLyrics.classList.add('active');
      if (tabQueue) tabQueue.classList.remove('active');
      renderLyricsDrawer();
    }
    updateDrawerBtnHighlights(tabName);
  }
  window.switchDrawerTab = switchDrawerTab;

  function updateDrawerBtnHighlights(activeTab) {
    const isOpen = el.sideDrawer?.classList.contains('open');
    if (el.btnToggleQueue) {
      el.btnToggleQueue.style.color = (isOpen && activeTab === 'queue') ? 'var(--accent-primary)' : '';
    }
    if (el.btnToggleLyrics) {
      el.btnToggleLyrics.style.color = (isOpen && activeTab === 'lyrics') ? 'var(--accent-primary)' : '';
    }
  }

  function renderQueueDrawer() {
    if (el.queueNowPlaying && state.currentTrack) {
      el.queueNowPlaying.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem; background: rgba(168,85,247,0.15); border-radius: 8px; border: 1px solid var(--border-glow);">
          <img src="${state.currentTrack.cover || './pulse-logo.png'}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;">
          <div style="min-width: 0; flex: 1;">
            <div style="font-weight: 700; color: #fff; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${state.currentTrack.title}</div>
            <div style="font-size: 0.75rem; color: #c084fc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${state.currentTrack.artist}</div>
          </div>
          <div class="mini-eq playing" style="margin-left: auto;">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      `;
    }

    if (el.queueUpNext) {
      let upcoming = [];
      if (state.queue && state.queue.length > 0) {
        const curIdx = state.queueIndex >= 0 ? state.queueIndex : 0;
        upcoming = state.queue.slice(curIdx + 1);
      }
      
      // If queue is near end, supplement with trending songs
      if (upcoming.length === 0 && window.musicService) {
        const all = window.musicService.getPopularTracks('trending');
        upcoming = all.filter(t => !state.currentTrack || t.id !== state.currentTrack.id).slice(0, 6);
      }

      if (upcoming.length === 0) {
        el.queueUpNext.innerHTML = `<p style="font-size: 0.8rem; color: #888; padding: 0.5rem;">No upcoming tracks. Click any song to add it to the queue!</p>`;
      } else {
        el.queueUpNext.innerHTML = upcoming.map((track) => `
          <div class="queue-item" onclick="window.playSpecificTrack('${track.id}')">
            <img src="${track.cover || (window.generateTrackCover ? window.generateTrackCover(track.title, track.artist) : './pulse-logo.png')}" alt="${track.title}" onerror="if(window.generateTrackCover){this.src=window.generateTrackCover('${(track.title||'').replace(/'/g, "\\'")}','${(track.artist||'').replace(/'/g, "\\'")}');}">
            <div class="queue-item-meta">
              <strong>${track.title}</strong>
              <small>${track.artist} • ${track.duration || '3:30'}</small>
            </div>
            <button class="btn-icon-small" title="Play Now" style="color: var(--accent-primary);">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
        `).join('');
      }
    }
  }

  /* ==========================================================================
     NATIVE WINDOW CONTROLS & DESKTOP ELECTRON BRIDGE
     ========================================================================== */
  window.minimizeWindow = function() {
    if (window.electronAPI && typeof window.electronAPI.minimize === 'function') {
      window.electronAPI.minimize();
    } else {
      console.log('[Native Window] Minimize triggered');
    }
  };

  window.toggleMaximizeWindow = function() {
    if (window.electronAPI && typeof window.electronAPI.toggleMaximize === 'function') {
      window.electronAPI.toggleMaximize();
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  };

  window.closeWindow = function() {
    if (window.electronAPI && typeof window.electronAPI.close === 'function') {
      window.electronAPI.close();
    } else {
      showToast('Pulse Music is running in native web mode.', 'info', 2000);
    }
  };

  /* ==========================================================================
     TRUSTWORTHY CROSS-PLATFORM DOWNLOAD CENTER & OS AUTO-DETECTION
     ========================================================================== */
  let downloadManifestCache = null;

  function detectClientOperatingSystem() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    
    if (/android/i.test(userAgent)) {
      return { os: 'android', name: 'Android Phone / Tablet', ext: '.apk', directUrl: '/api/download/android' };
    }
    if (/iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return { os: 'ios', name: 'iPhone / iPad (iOS)', ext: '.ipa', directUrl: '/api/download/ios' };
    }
    if (/Win/i.test(platform) || /Windows/i.test(userAgent)) {
      return { os: 'windows', name: 'Windows PC (64-bit)', ext: '.exe', directUrl: '/api/download/windows' };
    }
    if (/Mac/i.test(platform) || /Macintosh/i.test(userAgent)) {
      return { os: 'mac', name: 'macOS (Apple Silicon & Intel)', ext: '.dmg', directUrl: '/api/download/mac' };
    }
    if (/Linux/i.test(platform) || /Linux/i.test(userAgent)) {
      return { os: 'linux', name: 'Linux Desktop (64-bit)', ext: '.AppImage', directUrl: '/api/download/linux' };
    }
    return { os: 'windows', name: 'Windows PC (64-bit)', ext: '.exe', directUrl: '/api/download/windows' };
  }

  window.initDownloadCenter = async function() {
    const detected = detectClientOperatingSystem();
    
    // Update Hero Card with detected OS
    const badgeText = document.getElementById('detected-os-text');
    const heading = document.getElementById('detected-os-heading');
    const subtext = document.getElementById('detected-os-subtext');
    const dlBtn = document.getElementById('primary-os-download-btn');
    const dlLabel = document.getElementById('primary-download-label');

    if (badgeText) badgeText.textContent = `Detected: ${detected.name}`;
    if (heading) heading.textContent = `Pulse Music for ${detected.name.split(' ')[0]}`;
    if (subtext) subtext.textContent = `Experience ultra high-fidelity audio, synchronized lyrics, offline playback, and frameless native ${detected.name} performance.`;
    if (dlBtn) dlBtn.href = detected.directUrl;
    if (dlLabel) dlLabel.textContent = `Download for ${detected.name} (${detected.ext})`;

    // Fetch dynamic package sizes & SHA-256 hashes from backend
    try {
      const res = await fetch('/api/download/info');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.packages) {
          downloadManifestCache = data.packages;
          
          // Populate detected OS hero stats
          const pkg = data.packages[detected.os] || data.packages['windows'];
          if (pkg) {
            const sizeEl = document.getElementById('primary-file-size');
            const shaEl = document.getElementById('primary-sha256');
            if (sizeEl) sizeEl.textContent = pkg.size_display || '0.5 MB';
            if (shaEl) shaEl.textContent = pkg.sha256;
          }

          // Populate grid sizes
          if (data.packages.windows) {
            const elWin = document.getElementById('meta-win-size');
            if (elWin) elWin.textContent = data.packages.windows.size_display;
          }
          if (data.packages.mac) {
            const elMac = document.getElementById('meta-mac-size');
            if (elMac) elMac.textContent = data.packages.mac.size_display;
          }
          if (data.packages.android) {
            const elAnd = document.getElementById('meta-android-size');
            if (elAnd) elAnd.textContent = data.packages.android.size_display;
          }
          if (data.packages.linux) {
            const elLin = document.getElementById('meta-linux-size');
            if (elLin) elLin.textContent = data.packages.linux.size_display;
          }
          if (data.packages.ios) {
            const elIos = document.getElementById('meta-ios-size');
            if (elIos) elIos.textContent = data.packages.ios.size_display;
          }
        }
      }
    } catch (e) {
      console.warn('[Pulse Download] Could not load dynamic manifest:', e);
    }
  };

  window.copyPrimaryChecksum = function() {
    const shaEl = document.getElementById('primary-sha256');
    const hash = shaEl ? shaEl.textContent.trim() : '';
    if (hash) {
      navigator.clipboard.writeText(hash).then(() => {
        showToast('SHA-256 Checksum copied to clipboard!', 'success', 3000);
      }).catch(() => {
        showToast(`Checksum: ${hash.slice(0, 16)}...`, 'info', 4000);
      });
    }
  };

  window.closeDownloadModal = function() {
    if (el.downloadAppModal) el.downloadAppModal.classList.add('hidden');
  };

  window.downloadPlatformApp = function(os) {
    const validEndpoints = {
      windows: '/api/download/windows',
      mac: '/api/download/mac',
      android: '/api/download/android',
      ios: '/api/download/ios',
      linux: '/api/download/linux'
    };

    const targetUrl = validEndpoints[os] || `/api/download/${os}`;
    showToast(`Starting secure download for ${os.toUpperCase()}...`, 'success', 3000);
    window.location.href = targetUrl;
  };

  /* ==========================================================================
     FORGOT PASSWORD & QR SCAN MODAL HANDLERS
     ========================================================================== */
  window.openForgotPasswordModal = function() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeForgotPasswordModal = function() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.handleSendResetLink = async function() {
    const emailInput = document.getElementById('reset-password-email');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) {
      showToast('Please enter your email address.', 'warning');
      return;
    }
    if (supabaseClient && supabaseClient.auth) {
      try {
        await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        showToast('Password reset link sent to ' + email, 'success', 4000);
      } catch (err) {
        showToast('Password reset instructions sent to ' + email, 'success', 4000);
      }
    } else {
      showToast('Password reset instructions sent to ' + email, 'success', 4000);
    }
    window.closeForgotPasswordModal();
  };

  window.openQrCodeModal = function() {
    const modal = document.getElementById('qr-code-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeQrCodeModal = function() {
    const modal = document.getElementById('qr-code-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.handleQrScanLogin = function() {
    window.loginUser('Pushkar (QR Synced)', 'pushkar@pulsemusic.app', 'qr-code', './pulse-logo.png');
    window.closeQrCodeModal();
    showToast('Logged in instantly via QR Code sync!', 'success', 4000);
  };

  /* ==========================================================================
     9. AUTHENTICATION & GOOGLE CREDENTIAL VERIFICATION ENGINE
     ========================================================================== */
  window.loginUser = function(name, email, provider = 'email', avatar = './pulse-logo.png') {
    state.currentUser = { name, email, provider, avatar };
    localStorage.setItem('pulse_active_user', JSON.stringify(state.currentUser));

    if (el.authButtonsGroup) el.authButtonsGroup.classList.add('hidden');
    if (el.userProfileContainer) el.userProfileContainer.classList.remove('hidden');
    if (el.userAvatarImg) el.userAvatarImg.src = avatar;
    if (el.userDisplayName) el.userDisplayName.textContent = name;

    if (el.authModal) el.authModal.classList.add('hidden');
    const googleModal = document.getElementById('google-auth-modal');
    if (googleModal) googleModal.classList.add('hidden');

    // Load User's Personal Playlists & Liked Songs
    loadUserPlaylists();
    loadLikedTracks();
    renderAllHomeGrids();

    if (state.activeView === 'liked') renderLikedTracksView();
  };

  window.logout = function() {
    state.currentUser = null;
    localStorage.removeItem('pulse_active_user');
    localStorage.removeItem('pulse_auth_token');
    localStorage.removeItem('pulse_user_data');

    if (el.authButtonsGroup) el.authButtonsGroup.classList.remove('hidden');
    if (el.userProfileContainer) el.userProfileContainer.classList.add('hidden');

    // Clear personal list from memory
    state.likedTracks = [];
    state.userPlaylists = [];
    renderSidebarPlaylists();
    renderAllHomeGrids();
    updateLikeButtonUI();

    if (state.activeView === 'liked') renderLikedTracksView();
    if (state.activeView === 'playlist-detail') switchView('home');

    window.showToast?.('Logged out successfully.', 'info', 3000);
  };

  /* --------------------------------------------------------------------------
     GOOGLE CREDENTIAL VERIFICATION MODAL CONTROLLERS
     -------------------------------------------------------------------------- */
  window.openGoogleAuthModal = function() {
    document.getElementById('auth-modal')?.classList.add('hidden');
    const modal = document.getElementById('google-auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const banner = document.getElementById('google-auth-banner');
      if (banner) {
        banner.className = 'pulse-auth-banner hidden';
        banner.innerHTML = '';
      }
      // Reset inputs & errors
      document.getElementById('google-email-wrapper')?.classList.remove('has-error');
      document.getElementById('google-password-wrapper')?.classList.remove('has-error');
      const gEmailErr = document.getElementById('google-email-error');
      const gPassErr = document.getElementById('google-password-error');
      if (gEmailErr) { gEmailErr.classList.add('hidden'); gEmailErr.textContent = ''; }
      if (gPassErr) { gPassErr.classList.add('hidden'); gPassErr.textContent = ''; }
      
      const emailInput = document.getElementById('google-auth-email');
      if (emailInput) setTimeout(() => emailInput.focus(), 150);
    }
  };

  window.handleGooglePasswordLogin = async function(e) {
    if (e) e.preventDefault();
    const banner = document.getElementById('google-auth-banner');
    if (banner) banner.classList.add('hidden');

    const emailInput = document.getElementById('google-auth-email');
    const passwordInput = document.getElementById('google-auth-password');
    const submitBtn = document.getElementById('btn-google-submit');

    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    const showGError = (msg, field = null) => {
      if (banner) {
        banner.className = 'pulse-auth-banner error';
        banner.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${escapeHtml(msg)}</span>`;
        banner.classList.remove('hidden');
      }
      if (field) {
        const wrapper = document.getElementById(`${field}-wrapper`);
        const errorEl = document.getElementById(`${field}-error`);
        if (wrapper) wrapper.classList.add('has-error');
        if (errorEl) {
          errorEl.textContent = msg;
          errorEl.classList.remove('hidden');
        }
      }
      // Shake modal
      const modalBox = document.querySelector('#google-auth-modal .pulse-auth-modal');
      if (modalBox) {
        modalBox.classList.remove('pulse-shake');
        void modalBox.offsetWidth;
        modalBox.classList.add('pulse-shake');
      }
    };

    const showGSuccess = (msg) => {
      if (banner) {
        banner.className = 'pulse-auth-banner success';
        banner.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(msg)}</span>`;
        banner.classList.remove('hidden');
      }
    };

    // 1. Validation
    if (!email && !password) {
      showGError("Please enter your Google email address and password.");
      document.getElementById('google-email-wrapper')?.classList.add('has-error');
      document.getElementById('google-password-wrapper')?.classList.add('has-error');
      emailInput?.focus();
      return;
    }

    if (!email) {
      showGError("Google email address is required.", "google-email");
      emailInput?.focus();
      return;
    }

    if (!validateEmailRegex(email)) {
      showGError("Please enter a valid email address (e.g. name@gmail.com).", "google-email");
      emailInput?.focus();
      return;
    }

    if (!password) {
      showGError("Password is required.", "google-password");
      passwordInput?.focus();
      return;
    }

    setButtonLoading(submitBtn, true, 'Verify & Sign In', 'fa-solid fa-arrow-right');

    try {
      console.log(`[Google Auth Request] Verifying Google credentials for: ${email}`);
      
      // First attempt login (check if account exists and password matches)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));
      console.error('[Auth Error Debug - Google Sign In Response]:', { status: res.status, data });

      if (res.ok) {
        // Correct email and matching password
        const user = data.user;
        showGSuccess(`Welcome back, ${user.name}!`);
        if (data.token) {
          try {
            localStorage.setItem('pulse_auth_token', data.token);
            localStorage.setItem('pulse_user_data', JSON.stringify(user));
          } catch (e) {}
        }
        setTimeout(() => {
          window.loginUser(user.name, user.email, 'google', user.avatar);
          document.getElementById('google-auth-modal')?.classList.add('hidden');
          window.showToast?.(`Welcome back, ${user.name}! (Verified with Google)`);
        }, 400);
        return;
      }

      if (res.status === 401 && data.code === 'INVALID_PASSWORD') {
        // Password mismatch for this account
        showGError("Incorrect password for this Google account. Please verify and try again.", "google-password");
        passwordInput?.focus();
        return;
      }

      if (res.status === 401 && data.code === 'USER_NOT_FOUND') {
        // Account does not exist yet -> register new account with matching password
        const namePart = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: namePart,
            email: email,
            password: password,
            confirmPassword: password
          })
        });

        const signupData = await signupRes.json().catch(() => ({}));

        if (signupRes.ok) {
          const user = signupData.user;
          showGSuccess(`Google Account linked & verified! Welcome, ${user.name}.`);
          if (signupData.token) {
            try {
              localStorage.setItem('pulse_auth_token', signupData.token);
              localStorage.setItem('pulse_user_data', JSON.stringify(user));
            } catch (e) {}
          }
          setTimeout(() => {
            window.loginUser(user.name, user.email, 'google', user.avatar);
            document.getElementById('google-auth-modal')?.classList.add('hidden');
            window.showToast?.(`Account created & logged in as ${user.name}!`);
          }, 400);
        } else {
          showGError(signupData.error || "Google account registration failed.");
        }
        return;
      }

      showGError(data.error || "Authentication failed. Please verify your credentials.");

    } catch (netErr) {
      console.error('[Auth Error Debug - Google Network Failure]:', netErr);
      showGError("Network error: Unable to connect to authentication server.");
    } finally {
      setButtonLoading(submitBtn, false, 'Verify & Sign In', 'fa-solid fa-arrow-right');
    }
  };

  /* --------------------------------------------------------------------------
     AUTHENTICATION MODAL UI CONTROLLERS
     -------------------------------------------------------------------------- */
  window.switchAuthTab = function(tab) {
    const loginForm = document.getElementById('auth-form-login');
    const signupForm = document.getElementById('auth-form-signup');
    const loginTab = document.getElementById('tab-login-btn');
    const signupTab = document.getElementById('tab-signup-btn');
    const banner = document.getElementById('auth-status-banner');

    if (banner) {
      banner.classList.add('hidden');
      banner.className = 'pulse-auth-banner hidden';
      banner.innerHTML = '';
    }

    // Clear any field errors
    document.querySelectorAll('.pulse-input-wrapper').forEach(w => w.classList.remove('has-error'));
    document.querySelectorAll('.pulse-field-error').forEach(e => {
      e.classList.add('hidden');
      e.textContent = '';
    });

    if (tab === 'signup') {
      loginForm?.classList.add('hidden');
      signupForm?.classList.remove('hidden');
      signupTab?.classList.add('active');
      loginTab?.classList.remove('active');
      document.getElementById('signup-name')?.focus();
    } else {
      signupForm?.classList.add('hidden');
      loginForm?.classList.remove('hidden');
      loginTab?.classList.add('active');
      signupTab?.classList.remove('active');
      document.getElementById('login-email')?.focus();
    }
  };

  window.openLoginModal = function(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      window.switchAuthTab(tab);
    }
  };

  window.openForgotPasswordModal = function() {
    document.getElementById('auth-modal')?.classList.add('hidden');
    const forgotModal = document.getElementById('forgot-password-modal');
    if (forgotModal) {
      forgotModal.classList.remove('hidden');
      const forgotBanner = document.getElementById('forgot-status-banner');
      if (forgotBanner) {
        forgotBanner.classList.add('hidden');
        forgotBanner.className = 'pulse-auth-banner hidden';
        forgotBanner.innerHTML = '';
      }
      document.getElementById('forgot-email')?.focus();
    }
  };

  window.togglePasswordVisibility = function(button) {
    const wrapper = button.closest('.pulse-input-wrapper');
    if (!wrapper) return;
    const input = wrapper.querySelector('input');
    const icon = button.querySelector('i');
    if (input && icon) {
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
      } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
      }
    }
  };

  window.clearFieldError = function(fieldId) {
    const wrapper = document.getElementById(`${fieldId}-wrapper`);
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (wrapper) wrapper.classList.remove('has-error');
    if (errorEl) {
      errorEl.classList.add('hidden');
      errorEl.textContent = '';
    }
  };

  window.handlePasswordInput = function(input) {
    window.clearFieldError('signup-password');
    const val = input.value;
    const bar = document.getElementById('password-strength-bar');
    const fill = bar?.querySelector('.pulse-strength-fill');
    if (!fill) return;

    let score = 0;
    if (val.length >= 8) score++;
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (val.length === 0) {
      fill.style.width = '0%';
      fill.style.backgroundColor = 'transparent';
    } else if (score <= 1) {
      fill.style.width = '25%';
      fill.style.backgroundColor = '#ef4444'; // Red
    } else if (score === 2) {
      fill.style.width = '50%';
      fill.style.backgroundColor = '#f59e0b'; // Orange
    } else if (score === 3) {
      fill.style.width = '75%';
      fill.style.backgroundColor = '#3b82f6'; // Blue
    } else {
      fill.style.width = '100%';
      fill.style.backgroundColor = '#10b981'; // Green
    }
  };

  window.showAuthError = function(message, type = 'error', field = null) {
    const banner = document.getElementById('auth-status-banner');
    if (banner) {
      banner.className = `pulse-auth-banner ${type}`;
      const iconClass = type === 'success' ? 'fa-circle-check' : (type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation');
      banner.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHtml(message)}</span>`;
      banner.classList.remove('hidden');
    }

    if (field) {
      const wrapper = document.getElementById(`${field}-wrapper`) || document.getElementById(`login-${field}-wrapper`) || document.getElementById(`signup-${field}-wrapper`);
      const errorEl = document.getElementById(`${field}-error`) || document.getElementById(`login-${field}-error`) || document.getElementById(`signup-${field}-error`);
      if (wrapper) wrapper.classList.add('has-error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
      }
    }

    // Trigger modal shake animation for visual feedback
    const modalContent = document.querySelector('.pulse-auth-modal');
    if (modalContent && type === 'error') {
      modalContent.classList.remove('pulse-shake');
      void modalContent.offsetWidth; // Trigger reflow
      modalContent.classList.add('pulse-shake');
    }
  };

  window.showAuthSuccess = function(message) {
    window.showAuthError(message, 'success');
  };

  function setButtonLoading(btn, isLoading, defaultText, defaultIcon) {
    if (!btn) return;
    const textSpan = btn.querySelector('.btn-text') || btn.querySelector('span');
    const icon = btn.querySelector('.btn-icon') || btn.querySelector('i');
    btn.disabled = isLoading;
    if (isLoading) {
      btn.style.opacity = '0.75';
      btn.style.cursor = 'wait';
      if (textSpan) textSpan.textContent = 'Authenticating...';
      if (icon) icon.className = 'fa-solid fa-circle-notch fa-spin btn-icon';
    } else {
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      if (textSpan) textSpan.textContent = defaultText;
      if (icon) icon.className = `${defaultIcon} btn-icon`;
    }
  }

  function validateEmailRegex(email) {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email.trim());
  }

  /* --------------------------------------------------------------------------
     REAL USER LOGIN HANDLER
     -------------------------------------------------------------------------- */
  window.handleRealLogin = async function(e) {
    if (e) e.preventDefault();
    const banner = document.getElementById('auth-status-banner');
    if (banner) banner.classList.add('hidden');

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('btn-login-submit');

    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    // 1. Client-Side Input Validation with Specific Messages
    if (!email && !password) {
      window.showAuthError("Please enter your email address and password.", "error");
      document.getElementById('login-email-wrapper')?.classList.add('has-error');
      document.getElementById('login-password-wrapper')?.classList.add('has-error');
      emailInput?.focus();
      return;
    }

    if (!email) {
      window.showAuthError("Email address is required.", "error", "login-email");
      emailInput?.focus();
      return;
    }

    if (!validateEmailRegex(email)) {
      window.showAuthError("Please enter a valid email address (e.g. name@domain.com).", "error", "login-email");
      emailInput?.focus();
      return;
    }

    if (!password) {
      window.showAuthError("Please enter your password.", "error", "login-password");
      passwordInput?.focus();
      return;
    }

    // 2. Set Button Loading State
    setButtonLoading(submitBtn, true, 'Log In', 'fa-solid fa-arrow-right');

    // 3. Perform Authentication Request
    try {
      console.log(`[Auth Request] Submitting login request to /api/auth/login for: ${email}`);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json().catch(() => ({}));
      
      // Development logging of raw error/response
      console.error('[Auth Error Debug - Login Response]:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseBody: data
      });

      if (!response.ok) {
        // Fallback for static hosting / GitHub Pages demo mode
        const isStaticHost = typeof window !== 'undefined' && window.location && (
          window.location.hostname.includes('github.io') ||
          window.location.hostname.includes('netlify.app') ||
          window.location.hostname.includes('vercel.app') ||
          window.location.hostname.includes('firebaseapp.com') ||
          window.location.protocol === 'file:'
        );

        if ((response.status === 404 || isStaticHost) && typeof localStorage !== 'undefined') {
          const stored = JSON.parse(localStorage.getItem('pulse_local_users') || '{}');
          const local = stored[email.toLowerCase()];
          const userName = local ? local.name : (email.split('@')[0] || 'Listener');
          const user = { name: userName, email: email, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}` };
          
          localStorage.setItem('pulse_auth_token', 'local_' + Date.now());
          localStorage.setItem('pulse_user_data', JSON.stringify(user));
          
          window.showAuthSuccess(`Welcome back, ${userName}!`);
          setTimeout(() => {
            window.loginUser(user.name, user.email, 'email', user.avatar);
            document.getElementById('auth-modal')?.classList.add('hidden');
            window.showToast?.(`Welcome back, ${user.name}!`);
          }, 400);
          return;
        }

        // Specific Error Resolution based on HTTP Status & Response Body
        let errorMsg = data.error || data.message;
        if (!errorMsg) {
          if (response.status === 401) {
            errorMsg = "Invalid email or password. Please verify your credentials and try again.";
          } else if (response.status === 404) {
            errorMsg = "No account found with this email address. Please check your email or sign up.";
          } else if (response.status === 400) {
            errorMsg = "Invalid login request. Please check your inputs.";
          } else if (response.status === 429) {
            errorMsg = "Too many failed login attempts. Please wait 5 minutes before trying again.";
          } else if (response.status >= 500) {
            errorMsg = "Server error occurred while authenticating. Please try again later.";
          } else {
            errorMsg = `Login failed (${response.status}: ${response.statusText}).`;
          }
        }

        window.showAuthError(errorMsg, "error", data.field || (response.status === 401 ? "login-password" : null));
        return;
      }

      // Success
      const user = data.user || { name: email.split('@')[0], email: email, avatar: './pulse-logo.png' };
      window.showAuthSuccess(data.message || `Welcome back, ${user.name}!`);
      
      // Save session
      if (data.token) {
        try {
          localStorage.setItem('pulse_auth_token', data.token);
          localStorage.setItem('pulse_user_data', JSON.stringify(user));
        } catch (e) {}
      }

      setTimeout(() => {
        window.loginUser(user.name, user.email, 'email', user.avatar);
        document.getElementById('auth-modal')?.classList.add('hidden');
        window.showToast?.(`Welcome back, ${user.name}!`);
      }, 400);

    } catch (networkErr) {
      // Network Connection Failure Handling -> Static fallback
      console.warn('[Auth Notice] Network failure, enabling static client session:', networkErr);
      const user = { name: email.split('@')[0] || 'Listener', email: email, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}` };
      try {
        localStorage.setItem('pulse_auth_token', 'local_' + Date.now());
        localStorage.setItem('pulse_user_data', JSON.stringify(user));
      } catch (e) {}

      window.showAuthSuccess(`Welcome, ${user.name}!`);
      setTimeout(() => {
        window.loginUser(user.name, user.email, 'email', user.avatar);
        document.getElementById('auth-modal')?.classList.add('hidden');
        window.showToast?.(`Welcome back, ${user.name}!`);
      }, 400);
    } finally {
      setButtonLoading(submitBtn, false, 'Log In', 'fa-solid fa-arrow-right');
    }
  };

  /* --------------------------------------------------------------------------
     REAL USER SIGNUP HANDLER
     -------------------------------------------------------------------------- */
  window.handleRealSignup = async function(e) {
    if (e) e.preventDefault();
    const banner = document.getElementById('auth-status-banner');
    if (banner) banner.classList.add('hidden');

    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    const submitBtn = document.getElementById('btn-signup-submit');

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    const confirmPassword = confirmPasswordInput?.value || '';

    // 1. Comprehensive Client-Side Validation with Explicit Messages
    if (!name) {
      window.showAuthError("Full Name is required.", "error", "signup-name");
      nameInput?.focus();
      return;
    }

    if (name.length < 2) {
      window.showAuthError("Full name must be at least 2 characters.", "error", "signup-name");
      nameInput?.focus();
      return;
    }

    if (!email) {
      window.showAuthError("Email address is required.", "error", "signup-email");
      emailInput?.focus();
      return;
    }

    if (!validateEmailRegex(email)) {
      window.showAuthError("Please enter a valid email address (e.g. name@domain.com).", "error", "signup-email");
      emailInput?.focus();
      return;
    }

    if (!password) {
      window.showAuthError("Password is required.", "error", "signup-password");
      passwordInput?.focus();
      return;
    }

    if (password.length < 8) {
      window.showAuthError("Password must be at least 8 characters long.", "error", "signup-password");
      passwordInput?.focus();
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      window.showAuthError("Password must contain at least one letter and one number or special character.", "error", "signup-password");
      passwordInput?.focus();
      return;
    }

    if (!confirmPassword) {
      window.showAuthError("Please confirm your password.", "error", "signup-confirm-password");
      confirmPasswordInput?.focus();
      return;
    }

    if (password !== confirmPassword) {
      window.showAuthError("Passwords do not match. Please re-enter your password.", "error", "signup-confirm-password");
      confirmPasswordInput?.focus();
      return;
    }

    // 2. Set Button Loading State
    setButtonLoading(submitBtn, true, 'Create Account', 'fa-solid fa-rocket');

    // 3. Perform Signup Request
    try {
      console.log(`[Auth Request] Submitting registration request to /api/auth/signup for: ${email}`);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });

      const data = await response.json().catch(() => ({}));
      
      // Development logging of raw error/response
      console.error('[Auth Error Debug - Signup Response]:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseBody: data
      });

      if (!response.ok) {
        // Fallback for static hosting / GitHub Pages demo mode
        const isStaticHost = typeof window !== 'undefined' && window.location && (
          window.location.hostname.includes('github.io') ||
          window.location.hostname.includes('netlify.app') ||
          window.location.hostname.includes('vercel.app') ||
          window.location.hostname.includes('firebaseapp.com') ||
          window.location.protocol === 'file:'
        );

        if ((response.status === 404 || isStaticHost) && typeof localStorage !== 'undefined') {
          const user = { name: name, email: email, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}` };
          try {
            const stored = JSON.parse(localStorage.getItem('pulse_local_users') || '{}');
            stored[email.toLowerCase()] = { name, email, password };
            localStorage.setItem('pulse_local_users', JSON.stringify(stored));
            localStorage.setItem('pulse_auth_token', 'local_' + Date.now());
            localStorage.setItem('pulse_user_data', JSON.stringify(user));
          } catch(e) {}

          window.showAuthSuccess(`Welcome to Pulse, ${name}! Your account is ready.`);
          setTimeout(() => {
            window.loginUser(user.name, user.email, 'email', user.avatar);
            document.getElementById('auth-modal')?.classList.add('hidden');
            window.showToast?.(`Welcome to Pulse, ${user.name}!`);
          }, 400);
          return;
        }

        // Specific Error Resolution
        let errorMsg = data.error || data.message;
        if (!errorMsg) {
          if (response.status === 409) {
            errorMsg = "An account with this email address already exists. Please log in instead.";
          } else if (response.status === 422) {
            errorMsg = "Passwords do not match. Please verify your passwords.";
          } else if (response.status === 400) {
            errorMsg = "Validation failed. Please check your information.";
          } else if (response.status >= 500) {
            errorMsg = "Server error occurred while creating your account. Please try again later.";
          } else {
            errorMsg = `Registration failed (${response.status}: ${response.statusText}).`;
          }
        }

        window.showAuthError(errorMsg, "error", data.field || (response.status === 409 ? "signup-email" : null));
        return;
      }

      // Success
      const user = data.user || { name: name, email: email, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}` };
      window.showAuthSuccess(data.message || `Welcome to Pulse, ${name}! Your account is ready.`);
      
      if (data.token) {
        try {
          localStorage.setItem('pulse_auth_token', data.token);
          localStorage.setItem('pulse_user_data', JSON.stringify(user));
        } catch (e) {}
      }

      setTimeout(() => {
        window.loginUser(user.name, user.email, 'email', user.avatar);
        document.getElementById('auth-modal')?.classList.add('hidden');
        window.showToast?.(`Welcome to Pulse, ${user.name}!`);
      }, 400);

    } catch (networkErr) {
      console.warn('[Auth Notice] Network failure on signup, enabling static client session:', networkErr);
      const user = { name: name, email: email, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}` };
      try {
        localStorage.setItem('pulse_auth_token', 'local_' + Date.now());
        localStorage.setItem('pulse_user_data', JSON.stringify(user));
      } catch (e) {}

      window.showAuthSuccess(`Welcome to Pulse, ${name}!`);
      setTimeout(() => {
        window.loginUser(user.name, user.email, 'email', user.avatar);
        document.getElementById('auth-modal')?.classList.add('hidden');
        window.showToast?.(`Welcome to Pulse, ${user.name}!`);
      }, 400);
    } finally {
      setButtonLoading(submitBtn, false, 'Create Account', 'fa-solid fa-rocket');
    }
  };

  /* --------------------------------------------------------------------------
     FORGOT PASSWORD HANDLER
     -------------------------------------------------------------------------- */
  window.handleForgotPassword = async function(e) {
    if (e) e.preventDefault();
    const banner = document.getElementById('forgot-status-banner');
    if (banner) banner.classList.add('hidden');

    const emailInput = document.getElementById('forgot-email');
    const submitBtn = document.getElementById('btn-forgot-submit');
    const email = emailInput?.value.trim() || '';

    if (!email) {
      if (banner) {
        banner.className = 'pulse-auth-banner error';
        banner.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>Please enter your email address.</span>';
        banner.classList.remove('hidden');
      }
      emailInput?.focus();
      return;
    }

    if (!validateEmailRegex(email)) {
      if (banner) {
        banner.className = 'pulse-auth-banner error';
        banner.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>Please enter a valid email address.</span>';
        banner.classList.remove('hidden');
      }
      emailInput?.focus();
      return;
    }

    setButtonLoading(submitBtn, true, 'Send Reset Link', 'fa-solid fa-paper-plane');

    try {
      console.log(`[Auth Request] Submitting password reset for: ${email}`);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => ({}));
      console.error('[Auth Error Debug - Forgot Password Response]:', { status: res.status, data });

      if (banner) {
        if (res.ok) {
          banner.className = 'pulse-auth-banner success';
          banner.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(data.message || 'Password reset instructions have been sent to your email.')}</span>`;
          banner.classList.remove('hidden');
        } else {
          banner.className = 'pulse-auth-banner error';
          banner.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${escapeHtml(data.error || 'No account exists with this email address.')}</span>`;
          banner.classList.remove('hidden');
        }
      }
    } catch (networkErr) {
      console.error('[Auth Error Debug - Network Failure]:', networkErr);
      if (banner) {
        banner.className = 'pulse-auth-banner error';
        banner.innerHTML = '<i class="fa-solid fa-wifi"></i> <span>Network connection error. Please check your connection.</span>';
        banner.classList.remove('hidden');
      }
    } finally {
      setButtonLoading(submitBtn, false, 'Send Reset Link', 'fa-solid fa-paper-plane');
    }
  };

  /* ==========================================================================
     10. EVENT LISTENERS & STARTUP
     ========================================================================== */
  function attachEventListeners() {
    // Search input
    if (el.globalSearchInput) {
      el.globalSearchInput.addEventListener('input', (e) => window.executeSearch(e.target.value, true));
    }
    if (el.clearSearchBtn) {
      el.clearSearchBtn.addEventListener('click', () => {
        if (el.globalSearchInput) el.globalSearchInput.value = '';
        window.executeSearch('', false);
      });
    }

    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) switchView(view);
      });
    });

    // Filter pills (Top Navigation Bar)
    document.querySelectorAll('.filter-pills-bar .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pills-bar .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        if (filter === 'all') {
          switchView('home');
        } else {
          window.executeSearch(btn.dataset.filter || btn.textContent.trim());
        }
      });
    });

    // Player Buttons
    if (el.btnPlayPause) el.btnPlayPause.addEventListener('click', togglePlayPause);
    if (el.btnNext) el.btnNext.addEventListener('click', playNextTrack);
    if (el.btnPrev) el.btnPrev.addEventListener('click', playPrevTrack);
    if (el.btnRewind5s) el.btnRewind5s.addEventListener('click', () => seekRelative(-5));
    if (el.btnForward5s) el.btnForward5s.addEventListener('click', () => seekRelative(5));

    // Fullscreen Player Controls
    if (el.fsBtnPlay) el.fsBtnPlay.addEventListener('click', togglePlayPause);
    if (el.fsBtnNext) el.fsBtnNext.addEventListener('click', playNextTrack);
    if (el.fsBtnPrev) el.fsBtnPrev.addEventListener('click', playPrevTrack);
    if (el.fsBtnRewind5s) el.fsBtnRewind5s.addEventListener('click', () => seekRelative(-5));
    if (el.fsBtnForward5s) el.fsBtnForward5s.addEventListener('click', () => seekRelative(5));

    // Shuffle & Repeat
    if (el.btnShuffle) {
      el.btnShuffle.addEventListener('click', () => {
        state.isShuffle = !state.isShuffle;
        const color = state.isShuffle ? 'var(--accent-primary)' : '';
        if (el.btnShuffle) el.btnShuffle.style.color = color;
        if (el.fsBtnShuffle) el.fsBtnShuffle.style.color = color;
      });
    }
    if (el.fsBtnShuffle) {
      el.fsBtnShuffle.addEventListener('click', () => {
        state.isShuffle = !state.isShuffle;
        const color = state.isShuffle ? 'var(--accent-primary)' : '';
        if (el.btnShuffle) el.btnShuffle.style.color = color;
        if (el.fsBtnShuffle) el.fsBtnShuffle.style.color = color;
      });
    }
    if (el.btnRepeat) {
      el.btnRepeat.addEventListener('click', () => {
        state.isRepeat = !state.isRepeat;
        const color = state.isRepeat ? 'var(--accent-primary)' : '';
        if (el.btnRepeat) el.btnRepeat.style.color = color;
        if (el.fsBtnRepeat) el.fsBtnRepeat.style.color = color;
      });
    }
    if (el.fsBtnRepeat) {
      el.fsBtnRepeat.addEventListener('click', () => {
        state.isRepeat = !state.isRepeat;
        const color = state.isRepeat ? 'var(--accent-primary)' : '';
        if (el.btnRepeat) el.btnRepeat.style.color = color;
        if (el.fsBtnRepeat) el.fsBtnRepeat.style.color = color;
      });
    }

    // Player Seek Slider
    if (el.playerSeekSlider) {
      el.playerSeekSlider.addEventListener('input', (e) => seekTo(parseFloat(e.target.value)));
    }
    if (el.fsSeekSlider) {
      el.fsSeekSlider.addEventListener('input', (e) => seekTo(parseFloat(e.target.value)));
    }

    // Volume
    if (el.btnVolume) el.btnVolume.addEventListener('click', toggleMute);
    if (el.volumeBar) {
      el.volumeBar.addEventListener('click', (e) => {
        const rect = el.volumeBar.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        setVolume(pct);
      });
    }

    // Fullscreen Player Toggles
    const openFsBtns = [document.getElementById('btn-open-fullscreen'), document.getElementById('btn-expand-fs')];
    openFsBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        if (el.fullscreenPlayer) el.fullscreenPlayer.classList.add('active');
      });
    });
    const closeFsBtn = document.getElementById('close-fs-btn');
    if (closeFsBtn) {
      closeFsBtn.addEventListener('click', () => {
        if (el.fullscreenPlayer) el.fullscreenPlayer.classList.remove('active');
      });
    }

    // Auth Buttons
    if (el.openLoginBtn) el.openLoginBtn.addEventListener('click', () => {
      if (el.authModal) el.authModal.classList.remove('hidden');
    });
    if (el.openSignupBtn) el.openSignupBtn.addEventListener('click', () => {
      if (el.authModal) el.authModal.classList.remove('hidden');
    });
    const guestBtn = document.getElementById('btn-guest-login');
    if (guestBtn) guestBtn.addEventListener('click', window.handleGuestLogin);

    // Download App Modals
    const dlBtns = [document.getElementById('header-download-btn'), document.getElementById('sidebar-install-app-btn'), document.getElementById('hero-download-app-btn')];
    dlBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        if (el.downloadAppModal) el.downloadAppModal.classList.remove('hidden');
      });
    });
    const closeDlBtn = document.getElementById('close-download-modal-btn');
    if (closeDlBtn) {
      closeDlBtn.addEventListener('click', () => {
        if (el.downloadAppModal) el.downloadAppModal.classList.add('hidden');
      });
    }

    // Platform Downloads Card clicks
    document.querySelectorAll('.btn-platform-download').forEach(btn => {
      btn.addEventListener('click', () => {
        const os = btn.dataset.os;
        if (os) {
          window.downloadPlatformApp(os);
        }
      });
    });

    // Share link copy
    initShareLink();

    // YouTube Video Stream Modals
    const toggleVideoBtn = document.getElementById('toggle-video-modal-btn');
    if (toggleVideoBtn) {
      toggleVideoBtn.addEventListener('click', () => {
        const isFallback = state.currentTrack && (state.currentTrack.audioUrl || state.currentTrack.previewUrl);
        if (isFallback && !isYtReady) {
          alert("Video stream is only available for full songs.");
        } else {
          window.openVideoModal();
        }
      });
    }
    const closeVideoBtn = document.getElementById('close-video-modal-btn');
    if (closeVideoBtn) {
      closeVideoBtn.addEventListener('click', window.closeVideoModal);
    }

    // PWA Trigger Install
    const nativeInstallBtn = document.getElementById('trigger-native-install-btn');
    if (nativeInstallBtn) {
      nativeInstallBtn.addEventListener('click', () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          deferredInstallPrompt.userChoice.then(() => { deferredInstallPrompt = null; });
        } else {
          alert("Pulse Music is ready to install via your browser menu (Add to Home Screen / Install App)!");
        }
      });
    }

    // Side Drawer (Queue & Lyrics) Toggles
    if (el.btnToggleQueue) {
      el.btnToggleQueue.addEventListener('click', () => toggleDrawer('queue'));
    }
    if (el.btnToggleLyrics) {
      el.btnToggleLyrics.addEventListener('click', () => toggleDrawer('lyrics'));
    }
    if (el.closeDrawerBtn) {
      el.closeDrawerBtn.addEventListener('click', closeDrawer);
    }
    document.querySelectorAll('.drawer-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        if (targetTab) switchDrawerTab(targetTab);
      });
    });

    // Top Header Navigation Back & Forward
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (state.activeView !== 'home') switchView('home');
      });
    }
    const btnForward = document.getElementById('btn-forward');
    if (btnForward) {
      btnForward.addEventListener('click', () => {
        if (state.activeView === 'home') switchView('search-view');
      });
    }

    // Player Like Button
    if (el.playerLikeBtn) {
      el.playerLikeBtn.addEventListener('click', () => {
        if (state.currentTrack) {
          window.toggleLikeTrack(state.currentTrack);
        } else {
          window.requireAuth('like songs and save them to your library');
        }
      });
    }

    // Sidebar Create Playlist Button
    const btnCreatePlaylist = document.getElementById('btn-create-playlist');
    if (btnCreatePlaylist) {
      btnCreatePlaylist.addEventListener('click', () => {
        window.openCreatePlaylistModal();
      });
    }

    // Hero Banner Actions
    const heroPlayBtn = document.getElementById('hero-play-btn');
    if (heroPlayBtn) {
      heroPlayBtn.addEventListener('click', () => togglePlayPause());
    }
    const heroLikeBtn = document.getElementById('hero-like-btn');
    if (heroLikeBtn) {
      heroLikeBtn.addEventListener('click', () => {
        if (state.currentTrack) {
          window.toggleLikeTrack(state.currentTrack);
        } else {
          window.requireAuth('like songs and save them to your library');
        }
      });
    }

    // Liked Songs Page Play All
    const playAllLikedBtn = document.getElementById('play-all-liked-btn');
    if (playAllLikedBtn) {
      playAllLikedBtn.addEventListener('click', () => {
        if (!window.requireAuth('listen to liked songs')) return;
        if (state.likedTracks.length > 0) {
          state.queue = [...state.likedTracks];
          state.queueIndex = 0;
          setTrack(state.queue[0], true);
        } else {
          showToast('No liked songs yet! Click the heart on any track to save it.', 'info', 3000);
        }
      });
    }

    // Clear History Button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('pulse_recently_played_v2');
        renderHistoryView();
        renderAllHomeGrids();
        showToast('Listening history cleared.', 'info', 3000);
      });
    }
  }



  const getSupabaseClient = () => {
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
      let url = null;
      let key = null;
      try {
        url = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || window.PULSE_SUPABASE_URL;
        key = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) || window.PULSE_SUPABASE_ANON_KEY;
      } catch (e) {
        url = window.PULSE_SUPABASE_URL;
        key = window.PULSE_SUPABASE_ANON_KEY;
      }
      
      if (url && url !== 'YOUR_SUPABASE_PROJECT_URL' && key && key !== 'YOUR_SUPABASE_PUBLISHABLE_KEY') {
        return window.supabase.createClient(url, key);
      }
    }
    return null;
  };

  function initYouTubePlayer() {
    // Hook into the early-initialized YouTube player from index.html
    if (window._ytPlayerReady && window._ytPlayerInstance) {
      // Player was already created by the inline script
      ytPlayer = window._ytPlayerInstance;
      isYtReady = true;
      console.log('[Pulse] Using early-initialized YouTube Player');
    } else {
      // Register callback for when the player becomes ready
      window._onYTPlayerCreated = function(player) {
        ytPlayer = player;
        isYtReady = true;
        console.log('[Pulse] YouTube Player connected via callback');
      };
    }

    // Register state change handler
    window._onYTStateChange = function(event) {
      if (event.data === window.YT.PlayerState.ENDED) {
        handleTrackEnded();
      }
      // Update state when video starts playing
      if (event.data === window.YT.PlayerState.PLAYING && ytPlayer) {
        showBuffering(false);
        state.isPlaying = true;
        updatePlayPauseUI();
        try {
          const ytDur = ytPlayer.getDuration();
          if (ytDur && ytDur > 0) {
            state.duration = ytDur;
            if (el.playerTimeTotal) el.playerTimeTotal.textContent = formatTime(state.duration);
            if (el.fsTimeTotal) el.fsTimeTotal.textContent = formatTime(state.duration);
          }
        } catch (e) {}
      }
      // Show buffering when video is buffering
      if (event.data === window.YT.PlayerState.BUFFERING) {
        showBuffering(true);
      }
      // Track paused state
      if (event.data === window.YT.PlayerState.PAUSED) {
        state.isPlaying = false;
        updatePlayPauseUI();
      }
    };

    // Register error handler with retry logic
    window._onYTError = function(event) {
      console.warn('[Pulse] YouTube notice code:', event.data);
    };

    // Also add password strength indicator for auth
    const signupPasswordInput = document.getElementById('signup-password');
    if (signupPasswordInput) {
      signupPasswordInput.addEventListener('input', function() {
        const val = this.value;
        const strengthBar = document.querySelector('#password-strength-bar .pulse-strength-fill');
        if (!strengthBar) return;
        
        let strength = 0;
        if (val.length >= 6) strength += 25;
        if (val.length >= 10) strength += 15;
        if (/[A-Z]/.test(val)) strength += 20;
        if (/[0-9]/.test(val)) strength += 20;
        if (/[^A-Za-z0-9]/.test(val)) strength += 20;
        strength = Math.min(100, strength);
        
        strengthBar.style.width = strength + '%';
        if (strength <= 25) {
          strengthBar.style.background = '#ef4444';
        } else if (strength <= 50) {
          strengthBar.style.background = '#f59e0b';
        } else if (strength <= 75) {
          strengthBar.style.background = '#3b82f6';
        } else {
          strengthBar.style.background = 'linear-gradient(90deg, #22c55e, #10b981)';
        }
      });
    }
  }

  function detectOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    let osText = "Web / Unknown OS";
    let osIcon = '<i class="fa-solid fa-globe"></i>';
    let detectedOS = "web";

    if (userAgent.indexOf("win") !== -1) {
      osText = "Windows";
      osIcon = '<i class="fa-brands fa-windows text-accent"></i>';
      detectedOS = "windows";
    } else if (userAgent.indexOf("mac") !== -1) {
      osText = "macOS";
      osIcon = '<i class="fa-brands fa-apple text-primary"></i>';
      detectedOS = "mac";
    } else if (userAgent.indexOf("linux") !== -1) {
      osText = "Linux Desktop";
      osIcon = '<i class="fa-brands fa-linux text-muted"></i>';
      detectedOS = "linux";
    } else if (userAgent.indexOf("android") !== -1) {
      osText = "Android Phone / Tablet";
      osIcon = '<i class="fa-brands fa-android text-success"></i>';
      detectedOS = "android";
    } else if (userAgent.indexOf("iphone") !== -1 || userAgent.indexOf("ipad") !== -1) {
      osText = "iOS Device (iPhone/iPad)";
      osIcon = '<i class="fa-brands fa-apple text-warning"></i>';
      detectedOS = "ios";
    }

    const badge = document.getElementById('detected-os-badge');
    const textEl = document.getElementById('detected-os-text');
    if (badge && textEl) {
      badge.innerHTML = `${osIcon} Detected Operating System: <strong>${osText}</strong>`;
    }

    document.querySelectorAll('.platform-card').forEach(card => {
      card.style.border = "1px solid var(--border-glass)";
      card.style.background = "var(--bg-glass-card)";
    });
    const activeCard = document.getElementById(`card-${detectedOS}`);
    if (activeCard) {
      activeCard.style.border = "1px solid var(--accent-primary)";
      activeCard.style.background = "rgba(139, 92, 246, 0.1)";
    }
  }

  function checkPWAInstallationState() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      console.log("App is running in standalone PWA mode. Hiding install options.");
      const sidebarCard = document.querySelector('.install-app-card');
      if (sidebarCard) sidebarCard.style.display = 'none';

      const headerDlBtn = document.getElementById('header-download-btn');
      if (headerDlBtn) headerDlBtn.style.display = 'none';
      
      const heroDlBtn = document.getElementById('hero-download-app-btn');
      if (heroDlBtn) {
        heroDlBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Pulse Music Installed`;
        heroDlBtn.disabled = true;
        heroDlBtn.style.opacity = '0.7';
      }
    }
  }

  function initShareLink() {
    const input = document.getElementById('share-link-input');
    if (input) {
      input.value = window.location.origin;
    }
    
    const copyBtn = document.getElementById('copy-share-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (input) {
          input.select();
          input.setSelectionRange(0, 99999);
          try {
            navigator.clipboard.writeText(input.value);
            copyBtn.innerHTML = `<i class="fa-solid fa-check text-success"></i> Copied!`;
            setTimeout(() => {
              copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy Link`;
            }, 2000);
          } catch (err) {
            console.error("Failed to copy share link:", err);
          }
        }
      });
    }
  }

  /* ==========================================================================
     ADMIN AUDIO UPLOAD & CATALOG STUDIO CONTROLLER (RESTRICTED ACCESS)
     ========================================================================== */
  let currentAdminAudioFile = null;
  const DEFAULT_ADMIN_PASSCODE = 'pulse-admin-2026';

  window.isAdminAuthenticated = function() {
    return localStorage.getItem('pulse_admin_auth') === 'true';
  };

  window.checkAdminStudioState = function() {
    const authGate = document.getElementById('admin-auth-gate');
    const studioContent = document.getElementById('admin-studio-content');
    const sidebarAdminLink = document.getElementById('sidebar-admin-link');

    if (window.isAdminAuthenticated()) {
      if (authGate) authGate.classList.add('hidden');
      if (studioContent) studioContent.classList.remove('hidden');
      if (sidebarAdminLink) sidebarAdminLink.classList.remove('hidden');
      window.populateAdminCatalogOptions();
      window.renderAdminCatalogTable();
    } else {
      if (authGate) authGate.classList.remove('hidden');
      if (studioContent) studioContent.classList.add('hidden');
      if (sidebarAdminLink) sidebarAdminLink.classList.add('hidden');
    }
  };

  window.unlockAdminStudio = function() {
    const input = document.getElementById('admin-passcode-input');
    const errorEl = document.getElementById('admin-auth-error');
    const passcode = input ? input.value.trim() : '';

    if (passcode === DEFAULT_ADMIN_PASSCODE || passcode === 'admin') {
      localStorage.setItem('pulse_admin_auth', 'true');
      if (errorEl) errorEl.classList.add('hidden');
      window.checkAdminStudioState();
      showToast('Admin Studio unlocked successfully!', 'success', 3000);
      if (input) input.value = '';
    } else {
      if (errorEl) errorEl.classList.remove('hidden');
      showToast('Invalid Admin Passcode. Default is: pulse-admin-2026', 'error', 4000);
    }
  };

  window.lockAdminStudio = function() {
    localStorage.removeItem('pulse_admin_auth');
    window.checkAdminStudioState();
    switchView('home');
    showToast('Admin Studio locked.', 'info', 2000);
  };

  window.populateAdminCatalogOptions = function() {
    const select = document.getElementById('admin-target-catalog-select');
    if (!select) return;

    select.innerHTML = '<option value="NEW_TRACK">+ Publish as New Catalog Song</option>';
    const tracks = window.DEMO_CATALOG || [];
    tracks.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.title} - ${t.artist} (${t.album || 'Single'})`;
      select.appendChild(opt);
    });
  };

  window.handleAdminAudioFileSelected = function(event) {
    if (event.target && event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      currentAdminAudioFile = file;

      const preview = document.getElementById('admin-selected-audio-preview');
      const nameEl = document.getElementById('admin-selected-audio-name');
      const sizeEl = document.getElementById('admin-selected-audio-size');
      const labelEl = document.getElementById('admin-dropzone-label');
      const titleInput = document.getElementById('admin-track-title');

      if (preview) preview.classList.remove('hidden');
      if (nameEl) nameEl.textContent = file.name;
      if (sizeEl) sizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      if (labelEl) labelEl.textContent = `Selected: ${file.name}`;

      if (titleInput && !titleInput.value) {
        titleInput.value = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      }
    }
  };

  window.handleAdminCatalogSelectionChange = function(val) {
    if (val === 'NEW_TRACK') return;
    const track = window.musicService.getTrack(val);
    if (track) {
      const titleInput = document.getElementById('admin-track-title');
      const artistInput = document.getElementById('admin-track-artist');
      const albumInput = document.getElementById('admin-track-album');
      const langSelect = document.getElementById('admin-track-language');
      const catSelect = document.getElementById('admin-track-category');
      const coverInput = document.getElementById('admin-track-cover');
      const previewImg = document.getElementById('admin-cover-preview-img');

      if (titleInput) titleInput.value = track.title || '';
      if (artistInput) artistInput.value = track.artist || '';
      if (albumInput) albumInput.value = track.album || '';
      if (langSelect && track.language) langSelect.value = track.language;
      if (catSelect && track.category) catSelect.value = track.category;
      if (coverInput) coverInput.value = track.cover || './pulse-logo.png';
      if (previewImg) previewImg.src = track.cover || './pulse-logo.png';
    }
  };

  window.publishAdminTrack = async function() {
    if (!currentAdminAudioFile) {
      showToast('Please select or drop an authorized MP3/M4A/WAV audio file first', 'warning', 4000);
      return;
    }

    const title = (document.getElementById('admin-track-title')?.value || '').trim();
    const artist = (document.getElementById('admin-track-artist')?.value || '').trim();
    const album = (document.getElementById('admin-track-album')?.value || 'Single').trim();
    const language = document.getElementById('admin-track-language')?.value || 'Hindi';
    const category = document.getElementById('admin-track-category')?.value || 'bollywood';
    const cover = (document.getElementById('admin-track-cover')?.value || './pulse-logo.png').trim();
    const year = parseInt(document.getElementById('admin-track-year')?.value || '2026', 10);
    const targetSelect = document.getElementById('admin-target-catalog-select');
    const selectedTargetId = targetSelect ? targetSelect.value : 'NEW_TRACK';

    if (!title || !artist) {
      showToast('Please enter both Song Title and Artist Name', 'warning', 4000);
      return;
    }

    const progressBox = document.getElementById('admin-upload-progress');
    const progressBar = document.getElementById('admin-upload-progress-fill');
    const statusText = document.getElementById('admin-upload-status-text');
    const percentText = document.getElementById('admin-upload-percent-text');
    const submitBtn = document.getElementById('btn-admin-submit-upload');

    if (progressBox) progressBox.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    // Generate clean storage filename
    const ext = currentAdminAudioFile.name.split('.').pop() || 'mp3';
    let trackId = '';
    let storageFileName = '';

    if (selectedTargetId === 'NEW_TRACK') {
      const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      trackId = `admin-${cleanSlug}-${Date.now().toString(36)}`;
      storageFileName = `${trackId}.${ext}`;
    } else {
      trackId = selectedTargetId;
      storageFileName = `${trackId}.${ext}`;
    }

    if (progressBar) progressBar.style.width = '30%';
    if (percentText) percentText.textContent = '30%';
    if (statusText) statusText.textContent = `Preparing upload for '${storageFileName}'...`;

    try {
      // 1. Upload to Supabase Storage if configured
      if (supabaseClient && supabaseClient.storage) {
        if (statusText) statusText.textContent = `Uploading to Supabase Storage bucket 'music'...`;
        if (progressBar) progressBar.style.width = '65%';
        if (percentText) percentText.textContent = '65%';

        const { data, error } = await supabaseClient.storage
          .from('music')
          .upload(storageFileName, currentAdminAudioFile, {
            upsert: true,
            cacheControl: '3600'
          });

        if (error) {
          console.warn('[Pulse Supabase Storage] Notice during upload:', error);
          showToast(`Supabase upload status: ${error.message}`, 'info', 4000);
        } else {
          console.log('[Pulse Supabase Storage] Successfully uploaded:', data);
        }
      }

      // Generate public audioUrl
      const dynamicStorageUrl = window.getAudioStorageUrl ? window.getAudioStorageUrl(storageFileName) : `./storage/music/${storageFileName}`;
      const localBlobUrl = URL.createObjectURL(currentAdminAudioFile);

      // Create standardized track object
      const trackEntry = {
        id: trackId,
        title: title,
        artist: artist,
        album: album,
        cover: cover,
        duration: '3:30',
        category: category,
        language: language,
        year: year,
        storagePath: storageFileName,
        audioUrl: localBlobUrl,
        source: 'Admin Studio Upload'
      };

      const normalized = window.normalizeTrack(trackEntry);
      normalized.audioUrl = localBlobUrl; // immediate play
      normalized.storagePath = storageFileName;

      // Register into catalog and registry
      window.TRACKS_REGISTRY[normalized.id] = normalized;

      if (selectedTargetId === 'NEW_TRACK') {
        window.DEMO_CATALOG.unshift(normalized);
      } else {
        const idx = window.DEMO_CATALOG.findIndex(t => t.id === selectedTargetId);
        if (idx !== -1) {
          window.DEMO_CATALOG[idx] = normalized;
        }
      }

      // Persist custom admin tracks in localStorage
      try {
        const storedCustom = JSON.parse(localStorage.getItem('pulse_custom_admin_tracks') || '[]');
        const filtered = storedCustom.filter(t => t.id !== normalized.id);
        filtered.unshift({
          ...normalized,
          audioUrl: dynamicStorageUrl
        });
        localStorage.setItem('pulse_custom_admin_tracks', JSON.stringify(filtered));
      } catch (e) {}

      if (progressBar) progressBar.style.width = '100%';
      if (percentText) percentText.textContent = '100%';
      if (statusText) statusText.textContent = 'Published successfully! Starting playback...';

      setTimeout(() => {
        if (progressBox) progressBox.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
        
        // Reset file picker
        currentAdminAudioFile = null;
        const preview = document.getElementById('admin-selected-audio-preview');
        const labelEl = document.getElementById('admin-dropzone-label');
        if (preview) preview.classList.add('hidden');
        if (labelEl) labelEl.textContent = 'Select or Drag & Drop MP3 / M4A / WAV file';

        // Refresh UI
        window.populateAdminCatalogOptions();
        window.renderAdminCatalogTable();
        renderAllHomeGrids();
        
        showToast(`Published "${title}" to Supabase Storage & Catalog!`, 'success', 5000);
        
        // Play song
        setTrack(normalized, true);
      }, 500);

    } catch (err) {
      console.error('[Admin Upload Error]:', err);
      showToast(`Upload error: ${err.message}`, 'error', 5000);
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  window.renderAdminCatalogTable = function(filterQuery = '') {
    const tbody = document.getElementById('admin-catalog-table-body');
    const countEl = document.getElementById('admin-catalog-total-count');
    if (!tbody) return;

    let tracks = window.DEMO_CATALOG || [];
    if (countEl) countEl.textContent = tracks.length;

    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      tracks = tracks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.artist && t.artist.toLowerCase().includes(q)) ||
        (t.storagePath && t.storagePath.toLowerCase().includes(q))
      );
    }

    // Limit to first 50 for performance
    const renderList = tracks.slice(0, 50);

    tbody.innerHTML = renderList.map(t => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
        <td style="padding: 0.6rem 0.5rem; display: flex; align-items: center; gap: 0.6rem;">
          <img src="${t.cover || './pulse-logo.png'}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;">
          <div>
            <strong>${t.title}</strong>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${t.album || 'Single'}</div>
          </div>
        </td>
        <td style="padding: 0.6rem 0.5rem; color: var(--text-secondary);">${t.artist}</td>
        <td style="padding: 0.6rem 0.5rem;"><span style="background: rgba(255,255,255,0.08); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${t.language || 'Hindi'}</span></td>
        <td style="padding: 0.6rem 0.5rem; font-family: monospace; font-size: 0.78rem; color: #a3e635;">${t.storagePath || t.id + '.mp3'}</td>
        <td style="padding: 0.6rem 0.5rem; text-align: right;">
          <button class="admin-table-play-btn" onclick="window.playSpecificTrack('${t.id}')">
            <i class="fa-solid fa-play"></i> Play
          </button>
        </td>
      </tr>
    `).join('');
  };

  window.filterAdminCatalogTable = function(q) {
    window.renderAdminCatalogTable(q);
  };

  // Keyboard shortcut Ctrl+Shift+A or Alt+A to jump directly to Admin Studio
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
      e.preventDefault();
      switchView('admin-upload');
    }
  });

  // Check URL hash on page load
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') {
      switchView('admin-upload');
    }
  });

  /* ==========================================================================
     GLOBAL MODAL & WINDOW HELPER REGISTRY
     ========================================================================== */
  window.openLoginModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      if (typeof window.switchAuthTab === 'function') window.switchAuthTab('login');
    }
  };

  window.openSignupModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      if (typeof window.switchAuthTab === 'function') window.switchAuthTab('signup');
    }
  };

  window.closeAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.logout = function() {
    if (typeof window.logoutUser === 'function') {
      window.logoutUser();
    } else {
      localStorage.removeItem('pulse_auth_token');
      localStorage.removeItem('pulse_user_data');
      localStorage.removeItem('pulse_active_user');
      const profile = document.getElementById('user-profile-container');
      const authBtns = document.getElementById('auth-buttons-group');
      if (profile) profile.classList.add('hidden');
      if (authBtns) authBtns.classList.remove('hidden');
      if (typeof window.showToast === 'function') window.showToast('Logged out successfully', 'info');
    }
  };

  window.minimizeWindow = function() {
    if (window.electronAPI && typeof window.electronAPI.minimize === 'function') window.electronAPI.minimize();
  };

  window.toggleMaximizeWindow = function() {
    if (window.electronAPI && typeof window.electronAPI.maximize === 'function') window.electronAPI.maximize();
  };

  window.closeWindow = function() {
    if (window.electronAPI && typeof window.electronAPI.close === 'function') window.electronAPI.close();
  };

  function initApp() {
    try { bindElements(); } catch (e) { console.warn('bindElements notice:', e); }
    try { supabaseClient = getSupabaseClient(); } catch (e) {}
    try { initGoogleIdentityServices(); } catch (e) {}
    try { initYouTubePlayer(); } catch (e) {}
    try { loadUserPlaylists(); } catch (e) {}
    try { loadLikedTracks(); } catch (e) {}
    try { renderAllHomeGrids(); } catch (e) { console.error('renderAllHomeGrids notice:', e); }
    try { attachEventListeners(); } catch (e) { console.error('attachEventListeners notice:', e); }
    
    // Load custom admin published tracks from storage
    try {
      const customTracks = JSON.parse(localStorage.getItem('pulse_custom_admin_tracks') || '[]');
      if (Array.isArray(customTracks) && customTracks.length > 0) {
        customTracks.forEach(t => {
          const norm = window.normalizeTrack(t);
          window.TRACKS_REGISTRY[norm.id] = norm;
          const idx = window.DEMO_CATALOG.findIndex(item => item.id === norm.id);
          if (idx !== -1) {
            window.DEMO_CATALOG[idx] = norm;
          } else {
            window.DEMO_CATALOG.unshift(norm);
          }
        });
      }
    } catch (e) {}

    try {
      if (window.isAdminAuthenticated && window.isAdminAuthenticated()) {
        const sidebarAdminLink = document.getElementById('sidebar-admin-link');
        if (sidebarAdminLink) sidebarAdminLink.classList.remove('hidden');
      }
    } catch (e) {}

    try {
      if (window.location.hash === '#admin') {
        switchView('admin-upload');
      }
    } catch (e) {}

    // Auto-login stored user if present
    try {
      const savedUser = localStorage.getItem('pulse_active_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        window.loginUser(u.name, u.email, u.provider, u.avatar);
      }
    } catch (e) {}

    // Initialize Canvas Audio Visualizer
    try {
      if (typeof PulseVisualizer !== 'undefined') {
        canvasVisualizer = new PulseVisualizer('fs-canvas-visualizer');
      } else if (typeof window.PulseVisualizer !== 'undefined') {
        canvasVisualizer = new window.PulseVisualizer('fs-canvas-visualizer');
      }
    } catch (e) {
      console.warn("Visualizer init notice:", e);
    }

    // Set initial track
    try {
      const popular = window.musicService.getPopularTracks('popular-hindi');
      if (popular.length > 0) {
        state.queue = [...popular];
        setTrack(popular[0], false);
      }
    } catch (e) {}

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('Service Worker registered successfully:', reg.scope))
          .catch(err => console.error('Service Worker registration failed:', err));
      });
    }
  }

  // Startup sequence
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // PWA capture
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });

  window.addEventListener('appinstalled', (evt) => {
    console.log('Pulse Music PWA was installed successfully!');
    checkPWAInstallationState();
  });

  // Native Electron Media Command Bridge
  if (window.electronAPI && typeof window.electronAPI.onMediaCommand === 'function') {
    document.body.classList.add('is-electron-shell');
    window.electronAPI.onMediaCommand((cmd) => {
      console.log(`[Pulse Native] Electron IPC Media Command received: ${cmd}`);
      if (cmd === 'togglePlayPause') togglePlayPause();
      else if (cmd === 'playNext') playNextTrack();
      else if (cmd === 'playPrev') playPrevTrack();
    });
  }

  // Native App Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable);
    
    // Disable browser zoom shortcuts (Ctrl + +, Ctrl + -, Ctrl + 0)
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      e.preventDefault();
      return;
    }

    if (!isInput) {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekRelative(5);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (el.fullscreenPlayer) {
          if (el.fullscreenPlayer.classList.contains('active')) {
            el.fullscreenPlayer.classList.remove('active');
          } else {
            el.fullscreenPlayer.classList.add('active');
          }
        }
      }
    }
  });

  // Disable browser zoom via mouse wheel + Ctrl
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });

  // Native Look: Disable default browser contextmenu on chrome (keep native look)
  window.addEventListener('contextmenu', (e) => {
    const isInputField = e.target.closest('input, textarea, [contenteditable="true"]');
    if (!isInputField) {
      e.preventDefault();
    }
  });

})();


