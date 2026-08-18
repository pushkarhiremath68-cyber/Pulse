// Pulse Music Engine - Standalone Pure Jamendo & Audius Engine

// Global State
window.pulseState = {
  currentUser: JSON.parse(localStorage.getItem('pulse_user') || 'null'),
  currentTrack: null,
  isPlaying: false,
  queue: [],
  likedTracks: JSON.parse(localStorage.getItem('pulse_liked_tracks') || '[]'),
  history: JSON.parse(localStorage.getItem('pulse_history') || '[]'),
  audiusHost: 'https://audius-discovery-1.cultur3stake.com'
};

function getAudioPlayer() {
  let a = document.getElementById('fallback-audio-player');
  if (!a) {
    a = new Audio();
    a.id = 'fallback-audio-player';
    a.preload = 'auto';
    document.body.appendChild(a);
  }
  return a;
}

const audio = (typeof document !== 'undefined' && document.getElementById('fallback-audio-player')) || null;
const JAMENDO_ID = '23b33f2a';

// Fetch active Audius host
async function initAudiusHost() {
  try {
    const res = await fetch('https://api.audius.co');
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      window.pulseState.audiusHost = data.data[0];
    }
  } catch (e) {
    window.pulseState.audiusHost = 'https://discoveryprovider.audius.co';
  }
}
initAudiusHost();

// Helper: Toast Notifications
window.showToast = function(msg) {
  const container = document.getElementById('pulse-toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.style.cssText = 'background: rgba(168,85,247,0.9); color: #fff; padding: 0.8rem 1.2rem; border-radius: 12px; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; box-shadow: 0 4px 15px rgba(0,0,0,0.5); backdrop-filter: blur(10px);';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

// 1. Navigation & Views
window.switchView = function(viewId) {
  document.querySelectorAll('.app-view').forEach(el => el.classList.remove('active-view'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active-view');

  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-view') === viewId);
  });
};

// 2. Modals (Login, Signup, Downloads, AI DJ)
window.openLoginModal = function() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('hidden');
    window.switchAuthTab('login');
  }
};

window.openSignupModal = function() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('hidden');
    window.switchAuthTab('signup');
  }
};

window.switchAuthTab = function(tab) {
  const loginForm = document.getElementById('auth-form-login');
  const signupForm = document.getElementById('auth-form-signup');
  const tabLogin = document.getElementById('tab-login-btn');
  const tabSignup = document.getElementById('tab-signup-btn');

  if (tab === 'login') {
    if (loginForm) loginForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
    if (tabLogin) tabLogin.classList.add('active');
    if (tabSignup) tabSignup.classList.remove('active');
  } else {
    if (loginForm) loginForm.classList.add('hidden');
    if (signupForm) signupForm.classList.remove('hidden');
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabSignup) tabSignup.classList.add('active');
  }
};

window.openDownloadModal = function() {
  const modal = document.getElementById('download-app-modal');
  if (modal) modal.classList.remove('hidden');
};

window.closeDownloadModal = function() {
  const modal = document.getElementById('download-app-modal');
  if (modal) modal.classList.add('hidden');
};

// 3. Auth Handlers (Instant Local Storage Session)
window.handleRealLogin = function(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('login-email')?.value || 'user@pulse.com';
  const user = { name: email.split('@')[0], email: email };
  localStorage.setItem('pulse_user', JSON.stringify(user));
  window.pulseState.currentUser = user;
  updateAuthUI();
  document.getElementById('auth-modal')?.classList.add('hidden');
  window.showToast(`Logged in as ${user.name}`);
};

window.handleRealSignup = function(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('signup-name')?.value || 'Listener';
  const email = document.getElementById('signup-email')?.value || 'user@pulse.com';
  const user = { name, email };
  localStorage.setItem('pulse_user', JSON.stringify(user));
  window.pulseState.currentUser = user;
  updateAuthUI();
  document.getElementById('auth-modal')?.classList.add('hidden');
  window.showToast(`Account created for ${user.name}!`);
};

window.handleGoogleOAuthLogin = function() {
  window.handleRealLogin({ preventDefault: () => {} });
};

window.logout = function() {
  localStorage.removeItem('pulse_user');
  window.pulseState.currentUser = null;
  updateAuthUI();
  window.showToast('Logged out');
};

function updateAuthUI() {
  const authGroup = document.getElementById('auth-buttons-group');
  const userProfile = document.getElementById('user-profile-container');
  const userName = document.getElementById('user-display-name');

  if (window.pulseState.currentUser) {
    if (authGroup) authGroup.classList.add('hidden');
    if (userProfile) userProfile.classList.remove('hidden');
    if (userName) userName.textContent = window.pulseState.currentUser.name;
  } else {
    if (authGroup) authGroup.classList.remove('hidden');
    if (userProfile) userProfile.classList.add('hidden');
  }
}

// 4. Audius & Jamendo Stream Engine
async function resolveAndPlay(query, trackMeta = {}) {
  window.showToast(`Finding stream for "${query}"...`);
  let streamUrl = null;
  let cover = trackMeta.cover || './pulse-logo.png';
  let title = trackMeta.title || query;
  let artist = trackMeta.artist || 'Pulse Artist';

  // 1. Try Audius Search
  try {
    const res = await fetch(`${window.pulseState.audiusHost}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=PULSE_MUSIC`);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      const track = data.data[0];
      streamUrl = `${window.pulseState.audiusHost}/v1/tracks/${track.id}/stream?app_name=PULSE_MUSIC`;
      title = track.title || title;
      artist = track.user?.name || artist;
      if (track.artwork && track.artwork['480x480']) cover = track.artwork['480x480'];
    }
  } catch (e) {
    console.warn('Audius search failed, falling back to Jamendo:', e);
  }

  // 2. Fallback to Jamendo Search
  if (!streamUrl) {
    try {
      const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_ID}&format=jsonpretty&limit=1&namesearch=${encodeURIComponent(query)}&audioformat=mp32`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const track = data.results[0];
        streamUrl = track.audio;
        title = track.name || title;
        artist = track.artist_name || artist;
        if (track.image) cover = track.image;
      }
    } catch (e) {
      console.error('Jamendo search failed:', e);
    }
  }

  const activeAudio = getAudioPlayer();
  if (streamUrl && activeAudio) {
    activeAudio.src = streamUrl;
    activeAudio.play().then(() => {
      window.pulseState.isPlaying = true;
      window.pulseState.currentTrack = { title, artist, cover, streamUrl };
      updatePlayerUI(title, artist, cover);
      window.showToast(`Now Playing: ${title}`);
    }).catch(err => {
      console.error('Playback error:', err);
      window.showToast('Click anywhere on the page first to allow audio playback.');
    });
  } else {
    window.showToast(`No audio stream found for "${query}"`);
  }
}

// 5. Track Card Trigger
window.playSpecificTrack = function(id) {
  const queries = {
    'rec-1': { title: 'Starboy', artist: 'The Weeknd' },
    'rec-2': { title: 'Kesariya', artist: 'Arijit Singh' },
    'rec-3': { title: 'Lover', artist: 'Diljit Dosanjh' },
    'rec-4': { title: 'Cruel Summer', artist: 'Taylor Swift' },
    '90s-1': { title: 'Tujhe Dekha Toh', artist: 'Kumar Sanu' },
    '90s-2': { title: 'Smells Like Teen Spirit', artist: 'Nirvana' },
    'bolly-1': { title: 'Kesariya', artist: 'Arijit Singh' },
    'bolly-2': { title: 'Apna Bana Le', artist: 'Arijit Singh' }
  };
  const item = queries[id] || { title: id, artist: 'Music' };
  resolveAndPlay(`${item.title} ${item.artist}`, item);
};

// 6. Global Search
window.executeSearch = async function(query, isTyping) {
  if (!query || query.trim().length === 0) return;
  window.switchView('search-view');
  
  const label = document.getElementById('search-query-label');
  const count = document.getElementById('search-count');
  const container = document.getElementById('search-results-container');
  if (label) label.textContent = query;

  try {
    const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_ID}&format=jsonpretty&limit=15&namesearch=${encodeURIComponent(query)}&audioformat=mp32`);
    const data = await res.json();
    const tracks = data.results || [];
    
    if (count) count.textContent = `${tracks.length} tracks found`;
    if (container) {
      container.innerHTML = tracks.map(t => `
        <div class="music-card" style="display:flex; align-items:center; gap:1rem; padding:0.75rem; background:rgba(255,255,255,0.03); border-radius:10px; margin-bottom:0.5rem; cursor:pointer;" onclick="window.playDirectJamendo('${t.audio}', '${t.name.replace(/'/g, "")}', '${t.artist_name.replace(/'/g, "")}', '${t.image}')">
          <img src="${t.image || './pulse-logo.png'}" style="width:48px; height:48px; border-radius:6px; object-fit:cover;">
          <div style="flex:1;">
            <div style="font-weight:700; color:#fff;">${t.name}</div>
            <div style="font-size:0.8rem; color:#a1a1aa;">${t.artist_name}</div>
          </div>
          <button class="btn-primary" style="padding:0.4rem 0.8rem; border-radius:16px;"><i class="fa-solid fa-play"></i></button>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Search failed:', e);
  }
};

window.playDirectJamendo = function(url, title, artist, cover) {
  const activeAudio = getAudioPlayer();
  if (!activeAudio) return;
  activeAudio.src = url;
  activeAudio.play();
  window.pulseState.isPlaying = true;
  window.pulseState.currentTrack = { title, artist, cover, streamUrl: url };
  updatePlayerUI(title, artist, cover);
};

// 7. Player UI Updates & Controls
function updatePlayerUI(title, artist, cover) {
  const pTitle = document.getElementById('player-title');
  const pArtist = document.getElementById('player-artist');
  const pThumb = document.getElementById('player-thumb');
  const pPlayBtn = document.getElementById('btn-play-pause');

  if (pTitle) pTitle.textContent = title;
  if (pArtist) pArtist.textContent = artist;
  if (pThumb) pThumb.src = cover || './pulse-logo.png';
  if (pPlayBtn) pPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
}

function attachAudioListeners() {
  const activeAudio = getAudioPlayer();
  if (activeAudio) {
    activeAudio.addEventListener('timeupdate', () => {
      const cur = activeAudio.currentTime;
      const dur = activeAudio.duration || 1;
      const pct = (cur / dur) * 100;
      
      const curText = document.getElementById('player-time-current');
      const durText = document.getElementById('player-time-total') || document.getElementById('player-time-duration');
      const fill = document.getElementById('player-progress-fill');
      const miniFill = document.getElementById('mini-top-progress-fill');

      if (curText) curText.textContent = formatTime(cur);
      if (durText) durText.textContent = formatTime(dur);
      if (fill) fill.style.width = `${pct}%`;
      if (miniFill) miniFill.style.width = `${pct}%`;
    });

    activeAudio.addEventListener('ended', () => {
      const pPlayBtn = document.getElementById('btn-play-pause');
      if (pPlayBtn) pPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    });
  }
}

function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// 8. Download Platform App Handler (PWA & Direct Manifest)
window.downloadPlatformApp = function(platform) {
  window.showToast(`Downloading Pulse Music for ${platform}...`);
  const blob = new Blob([JSON.stringify({ name: 'Pulse Music', version: '2.4.0', engine: 'Audius/Jamendo' }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Pulse-Music-${platform}-installer.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Initialize Listeners
function initPulseMain() {
  updateAuthUI();
  attachAudioListeners();

  // Play / Pause Toggle
  const playBtn = document.getElementById('btn-play-pause');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const activeAudio = getAudioPlayer();
      if (!activeAudio.src) return window.playSpecificTrack('rec-1');
      if (activeAudio.paused) {
        activeAudio.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      } else {
        activeAudio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    });
  }

  // Range seek
  const slider = document.getElementById('player-seek-slider') || document.querySelector('.timeline-range-input');
  if (slider) {
    slider.addEventListener('input', (e) => {
      const activeAudio = getAudioPlayer();
      const seek = (activeAudio.duration || 1) * (e.target.value / 100);
      activeAudio.currentTime = seek;
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPulseMain);
} else {
  initPulseMain();
}
