/**
 * Pulse Music - Pure Audio Playbar & Media Session Controller
 * 100% Ad-Free Pure Audio Playback (Zero Video Containers / Zero Visual Frames)
 * Features lock screen media controls (navigator.mediaSession), Firestore history & favorites sync,
 * Web Audio spectrum analysis, synchronized LRCLIB lyrics, and smooth Maximize/Minimize states.
 */

import { addToHistory, isFavorite, addFavorite, removeFavorite, onFavoritesChanged } from './firestoreService.js';
import { resolvePipedAudioStream, searchYouTubeMusic } from './extractorService.js';
import { resolveFullAudioStream } from './musicService.js';
import { downloadCurrentTrack } from './downloadService.js';

if (typeof window !== 'undefined') {
  window.PulsePlaybar = window.PulsePlaybar || {};
  window.downloadCurrentTrack = downloadCurrentTrack;
}

let audio = null;
let currentTrack = null;
let isPlaying = false;
let isMuted = false;
let currentVolume = 0.8;
let previousVolume = 0.8;
let duration = 220;
let currentTime = 0;
let isSeeking = false;
let playQueue = [];
let queueIndex = 0;
let isShuffle = false;
let isRepeat = false;
let isMaximized = false;
let activePlaySessionId = 0;

// Hybrid Engine State
let activeEngine = 'native'; // 'native' | 'youtube'
let ytPlayer = null;
let ytPlayerReady = false;
let ytTimeInterval = null;

// Initialize Native HTML5 Pure Audio Element
function getAudio() {
  if (!audio) {
    audio = document.getElementById('fallback-audio-player') || new Audio();
    audio.id = 'fallback-audio-player';
    audio.volume = currentVolume > 0 ? currentVolume : 0.8;
    audio.muted = false;
    audio.preload = 'auto';

    audio.addEventListener('play', () => {
      isPlaying = true;
      if (window.pulseState) window.pulseState.isPlaying = true;
      updatePlayPauseUI();
      updateMediaSessionPlaybackState('playing');
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
      if (window.pulseState) window.pulseState.isPlaying = false;
      updatePlayPauseUI();
      updateMediaSessionPlaybackState('paused');
    });

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 10) {
        duration = audio.duration;
        if (currentTrack) currentTrack.duration = duration;
        updateTimeUI();
        updateMediaSessionPositionState();
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (!isSeeking) {
        currentTime = audio.currentTime;
        if (audio.duration && !isNaN(audio.duration) && audio.duration > 10) {
          duration = audio.duration;
        }
        updateTimeUI();
        updateMediaSessionPositionState();
        if (typeof window.syncLiveLyrics === 'function') {
          window.syncLiveLyrics(currentTime);
        }
      }
    });

    audio.addEventListener('ended', () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNext();
      }
    });

    audio.addEventListener('error', (e) => {
      console.warn('[Pulse Audio Player] Native Audio stream error event:', e);
      if (activeEngine === 'native' && currentTrack && isPlaying) {
        const ytId = currentTrack.ytId || (currentTrack.id && currentTrack.id.startsWith('ytm-') ? currentTrack.id.replace('ytm-', '') : null);
        if (ytId) {
          console.log('[Pulse Audio Player] Auto-recovering via YouTube stream fallback for:', ytId);
          playOnYouTubeIframe(ytId, currentTrack);
        } else {
          const searchQuery = `${currentTrack.title} ${currentTrack.artist}`.trim();
          playOnYouTubeSearch(searchQuery, currentTrack);
        }
      }
    });
  }
  return audio;
}

// -----------------------------------------------------------------------------
// LOCK SCREEN & BACKGROUND MEDIA CONTROLS (MediaSession API)
// -----------------------------------------------------------------------------

function updateMediaSession(track) {
  if (!('mediaSession' in navigator) || !track) return;

  const artworkUrl = track.coverUrl || track.cover || './pulse-logo.png';
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title || 'Untitled Track',
    artist: track.artist || 'Pulse Artist',
    album: track.album || 'Pulse Ad-Free Music',
    artwork: [
      { src: artworkUrl, sizes: '96x96', type: 'image/png' },
      { src: artworkUrl, sizes: '128x128', type: 'image/png' },
      { src: artworkUrl, sizes: '192x192', type: 'image/png' },
      { src: artworkUrl, sizes: '256x256', type: 'image/png' },
      { src: artworkUrl, sizes: '384x384', type: 'image/png' },
      { src: artworkUrl, sizes: '512x512', type: 'image/png' }
    ]
  });

  try {
    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 5;
      seekTo(Math.max(currentTime - skipTime, 0));
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 5;
      seekTo(Math.min(currentTime + skipTime, duration));
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== null && details.seekTime !== undefined) {
        seekTo(details.seekTime);
      }
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      pause();
      seekTo(0);
    });
  } catch (e) {}
}

function updateMediaSessionPlaybackState(state) {
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = state;
    } catch (e) {}
  }
}

function updateMediaSessionPositionState() {
  if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
    try {
      if (duration && !isNaN(duration) && duration > 0 && currentTime <= duration) {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1.0,
          position: currentTime
        });
      }
    } catch (e) {}
  }
}

/**
 * Dynamic High-Resolution Official Album Artwork Resolver
 * Upgrades YouTube video frames / low-res images to crystal-clear 1000x1000 studio covers
 */
export async function ensureOriginalAlbumCover(track) {
  if (!track || !track.title) return;
  const currentCover = track.coverUrl || track.cover || '';
  if (currentCover.includes('mzstatic.com') || currentCover.includes('1000x1000') || currentCover.includes('600x600')) {
    return;
  }

  try {
    const cleanTitle = (track.title || '').replace(/\(.*?\)|\[.*?\]|ft\..*|feat\..*|Official.*|Video.*/gi, '').trim();
    const cleanArtist = (track.artist || '').split(',')[0].split('&')[0].split('ft.')[0].trim();
    const query = `${cleanTitle} ${cleanArtist}`.trim();
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
        const hdCover = data.results[0].artworkUrl100.replace('100x100bb', '1000x1000bb');
        track.coverUrl = hdCover;
        track.cover = hdCover;
        if (currentTrack && (currentTrack.id === track.id || currentTrack.title === track.title)) {
          updateTrackInfoUI(track);
          updateMediaSession(track);
        }
      }
    }
  } catch (e) {}
}

export async function playTrack(track, queue = null) {
  if (!track) return;
  const sessionId = ++activePlaySessionId;
  const a = getAudio();

  currentTrack = track;
  if (window.pulseState) {
    window.pulseState.currentTrack = track;
    window.pulseState.isPlaying = true;
  }

  // Set Queue
  if (queue && Array.isArray(queue) && queue.length > 0) {
    playQueue = [...queue];
    queueIndex = playQueue.findIndex(t => t.id === track.id || t.title === track.title);
    if (queueIndex === -1) queueIndex = 0;
  } else if (!playQueue.some(t => t.id === track.id)) {
    playQueue.push(track);
    queueIndex = playQueue.length - 1;
  }

  updateTrackInfoUI(track);
  updatePlayPauseUI();
  updateMediaSession(track);
  renderQueueUI();

  // Firestore: Record to Listening History
  addToHistory(track);

  // Fetch LRCLIB Synchronized Lyrics
  if (typeof window.loadTrackLyrics === 'function') {
    window.loadTrackLyrics(track);
  }

  // Dynamic High-Resolution Official Album Cover Enhancer
  ensureOriginalAlbumCover(track);

  // Ensure YouTube IFrame is ready as fallback
  ensureYouTubeReady();

  // =========================================================================
  // BULLETPROOF STUDIO MASTER PLAYBACK ENGINE
  // =========================================================================

  // 1. FAST PATH: If track already has verified full-length native streamUrl, play immediately
  if (track.streamUrl && 
      track.streamUrl.startsWith('http') && 
      !track.streamUrl.includes('preview') && 
      !track.streamUrl.includes('audio-ssl.itunes.apple.com') && 
      !track.streamUrl.includes('mzstatic') && 
      track.streamUrl !== 'yt-iframe' &&
      (track.duration || 0) > 40) {
    const nativeSuccess = await playOnNativeAudio(track);
    if (nativeSuccess) {
      console.log('[Pulse Studio Master] Playing via pre-verified native stream:', track.source || 'Direct');
      return;
    }
  }

  // 2. PRIMARY TIER: Resolve High-Bitrate Studio Master Stream (320kbps / 160kbps AAC)
  try {
    const resolved = await resolveFullAudioStream(track);
    if (sessionId !== activePlaySessionId) return;

    if (resolved && resolved.streamUrl && resolved.streamUrl.startsWith('http') && !resolved.streamUrl.includes('preview') && resolved.streamUrl !== 'yt-iframe') {
      track.streamUrl = resolved.streamUrl;
      track.source = resolved.source || 'Studio Master Audio (320kbps)';
      if (resolved.duration) track.duration = resolved.duration;
      const played = await playOnNativeAudio(track);
      if (played) {
        console.log('[Pulse Studio Master] Successfully playing native master stream:', resolved.source);
        return;
      }
    }
  } catch (e) {
    console.warn('[Pulse Studio Master] Stream resolution notice:', e);
  }

  if (sessionId !== activePlaySessionId) return;

  // 3. SECONDARY TIER: YouTube IFrame playback (if track has ytId or resolved ytId)
  let ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : null);
  if (ytId && ytId.length >= 8) {
    console.log('[Pulse Studio Master] Attempting YouTube IFrame playback for:', ytId);
    const ytSuccess = await playOnYouTubeIframe(ytId, track);
    if (ytSuccess) return;
  }

  // 4. TERTIARY TIER: Search YouTube for the track and play via IFrame
  const searchQuery = `${track.title} ${track.artist}`.trim();
  if (sessionId === activePlaySessionId) {
    const searchSuccess = await playOnYouTubeSearch(searchQuery, track);
    if (searchSuccess) return;
  }

  // 5. If absolutely everything failed, notify user and auto-skip to next
  if (sessionId === activePlaySessionId && typeof window.showToast === 'function') {
    window.showToast(`Unable to stream "${track.title}" right now. Trying next...`, 'warning', 2500);
    setTimeout(() => {
      if (sessionId === activePlaySessionId && playQueue.length > 1) playNext();
    }, 1500);
  }
}

let lastToggleTime = 0;

export function togglePlay() {
  const now = Date.now();
  if (now - lastToggleTime < 250) {
    return; // Prevent rapid double-clicks from duplicate event handlers
  }
  lastToggleTime = now;

  if (isPlaying) {
    pause();
  } else {
    resume();
  }
}

export function pause() {
  // 1. Guaranteed pause on Native Audio
  if (audio) {
    try { audio.pause(); } catch (e) {}
  }
  
  // 2. Guaranteed pause on YouTube IFrame API
  if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
    try { ytPlayer.pauseVideo(); } catch (e) {}
  }

  isPlaying = false;
  if (window.pulseState) window.pulseState.isPlaying = false;
  updatePlayPauseUI();
  updateMediaSessionPlaybackState('paused');
}

export function resume() {
  if (!currentTrack) return;

  if (activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.playVideo === 'function') {
    try { ytPlayer.playVideo(); } catch (e) {}
  } else {
    const a = getAudio();
    if (a && a.src && !a.src.endsWith('/') && !a.src.includes('about:blank')) {
      a.play().catch(() => {});
    } else if (currentTrack.ytId || currentTrack.id) {
      playTrack(currentTrack);
      return;
    }
  }

  isPlaying = true;
  if (window.pulseState) window.pulseState.isPlaying = true;
  updatePlayPauseUI();
  updateMediaSessionPlaybackState('playing');
}

export function playNext() {
  if (playQueue.length === 0) return;
  if (isShuffle) {
    queueIndex = Math.floor(Math.random() * playQueue.length);
  } else {
    queueIndex = (queueIndex + 1) % playQueue.length;
  }
  playTrack(playQueue[queueIndex], playQueue);
}

export function playPrevious() {
  if (playQueue.length === 0) return;
  if (currentTime > 3) {
    seekTo(0);
    return;
  }
  queueIndex = (queueIndex - 1 + playQueue.length) % playQueue.length;
  playTrack(playQueue[queueIndex], playQueue);
}

export function seekTo(seconds) {
  currentTime = seconds;
  if (activeEngine === 'native') {
    getAudio().currentTime = seconds;
  } else if (activeEngine === 'youtube' && ytPlayer && ytPlayer.seekTo) {
    ytPlayer.seekTo(seconds, true);
  }
  updateTimeUI();
  updateMediaSessionPositionState();
}

export function seekForward5() {
  const a = getAudio();
  if (!a || !a.duration) return;
  seekTo(Math.min(a.duration, a.currentTime + 5));
}

export function seekBackward5() {
  const a = getAudio();
  if (!a) return;
  seekTo(Math.max(0, a.currentTime - 5));
}

export function setVolume(vol) {
  currentVolume = Math.max(0, Math.min(1, vol));
  
  // Native
  getAudio().volume = currentVolume;
  
  // Youtube
  if (ytPlayer && ytPlayer.setVolume) {
    ytPlayer.setVolume(currentVolume * 100);
  }

  if (currentVolume > 0) isMuted = false;
  updateVolumeUI();
}

export function toggleMute() {
  if (isMuted) {
    setVolume(previousVolume || 0.8);
    isMuted = false;
  } else {
    previousVolume = currentVolume;
    setVolume(0);
    isMuted = true;
  }
  updateVolumeUI();
}

export function toggleShuffle() {
  isShuffle = !isShuffle;
  const btns = document.querySelectorAll('#btn-shuffle, #fs-btn-shuffle');
  btns.forEach(b => b.classList.toggle('active-ctrl', isShuffle));
  if (typeof window.showToast === 'function') {
    window.showToast(`Shuffle is ${isShuffle ? 'ON' : 'OFF'}`, 'info', 1500);
  }
}

export function toggleRepeat() {
  isRepeat = !isRepeat;
  const btns = document.querySelectorAll('#btn-repeat, #fs-btn-repeat');
  btns.forEach(b => b.classList.toggle('active-ctrl', isRepeat));
  if (typeof window.showToast === 'function') {
    window.showToast(`Repeat is ${isRepeat ? 'ON' : 'OFF'}`, 'info', 1500);
  }
}

// -----------------------------------------------------------------------------
// MAXIMIZE & MINIMIZE CONTROLS
// -----------------------------------------------------------------------------

export function maximizePlayer() {
  toggleFullscreen(true);
}

export function minimizePlayer() {
  toggleFullscreen(false);
}

export function toggleFullscreen(forceState) {
  const fsModal = document.getElementById('fullscreen-player');
  if (!fsModal) return;

  const shouldOpen = typeof forceState === 'boolean' ? forceState : !fsModal.classList.contains('active');
  isMaximized = shouldOpen;

  if (shouldOpen) {
    fsModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Start Visualizer Canvas if present
    if (window.pulseVisualizerInstance) {
      window.pulseVisualizerInstance.start();
    }

    if (currentTrack) {
      updateTrackInfoUI(currentTrack);
      if (typeof window.loadTrackLyrics === 'function') {
        window.loadTrackLyrics(currentTrack);
      }
    }
  } else {
    fsModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// -----------------------------------------------------------------------------
// UI SYNCHRONIZATION HELPERS
// -----------------------------------------------------------------------------

function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function updateTimeUI() {
  const formattedCur = formatTime(currentTime);
  const formattedDur = formatTime(duration);

  const curTimeEls = document.querySelectorAll('#player-time-current, #playbar-current-time, #fs-time-current');
  const durTimeEls = document.querySelectorAll('#player-time-total, #playbar-duration, #fs-time-total');
  const progressBars = document.querySelectorAll('#player-progress-fill, #playbar-progress-fill, #mini-top-progress-fill, #fs-progress-fill');
  const seekers = document.querySelectorAll('#player-seek-slider, #playbar-seeker, #fs-seek-slider');

  curTimeEls.forEach(el => el.textContent = formattedCur);
  durTimeEls.forEach(el => el.textContent = formattedDur);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  progressBars.forEach(el => { el.style.width = `${pct}%`; });
  if (!isSeeking) {
    seekers.forEach(el => { el.value = pct; });
  }
}

function updatePlayPauseUI() {
  const playIcons = document.querySelectorAll('.playbar-play-icon, #btn-play-pause i, #playbar-play-btn i, #mobile-play-btn i, #fullscreen-play-btn i, #fs-play-pause-btn i');
  playIcons.forEach(icon => {
    if (isPlaying) {
      icon.className = 'fa-solid fa-pause';
    } else {
      icon.className = 'fa-solid fa-play';
    }
  });

  const disks = document.querySelectorAll('#fullscreen-album-art, #fs-album-art, #player-thumb');
  disks.forEach(disk => {
    if (isPlaying) disk.classList.add('playing-spin');
    else disk.classList.remove('playing-spin');
  });
}

function updateVolumeUI() {
  const volBars = document.querySelectorAll('#volume-progress-fill, #player-volume-fill, #fs-volume-fill');
  const volSliders = document.querySelectorAll('#volume-slider, #player-volume-slider, #fs-volume-slider');
  const volIcons = document.querySelectorAll('#volume-icon, #player-volume-icon, #fs-volume-icon');

  volSliders.forEach(s => { s.value = currentVolume * 100; });
  volBars.forEach(b => { b.style.width = `${currentVolume * 100}%`; });

  volIcons.forEach(icon => {
    if (currentVolume === 0 || isMuted) {
      icon.className = 'fa-solid fa-volume-xmark';
    } else if (currentVolume < 0.5) {
      icon.className = 'fa-solid fa-volume-low';
    } else {
      icon.className = 'fa-solid fa-volume-high';
    }
  });
}

function updateTrackInfoUI(track) {
  if (!track) return;
  const titleEls = document.querySelectorAll('#player-title, #playbar-title, #fullscreen-track-title, #fs-track-title');
  const artistEls = document.querySelectorAll('#player-artist, #playbar-artist, #fullscreen-track-artist, #fs-track-artist');
  const coverEls = document.querySelectorAll('#player-thumb, #playbar-cover, #fullscreen-cover-img, #fullscreen-album-art, #fs-album-art');
  const badgeEls = document.querySelectorAll('#player-source-badge, #playbar-source-badge, #fs-source-badge');

  const coverUrl = track.coverUrl || track.cover || './pulse-logo.png';

  titleEls.forEach(el => { el.textContent = track.title || 'Untitled Track'; });
  artistEls.forEach(el => { el.textContent = track.artist || 'Pulse Artist'; });
  coverEls.forEach(el => {
    if (el.tagName === 'IMG') {
      el.src = coverUrl;
      el.onerror = function() { this.onerror = null; this.src = './pulse-logo.png'; };
    } else {
      el.style.backgroundImage = `url('${coverUrl}')`;
    }
  });

  const bgBlur = document.getElementById('fs-bg-blur');
  if (bgBlur) {
    bgBlur.style.backgroundImage = `url('${coverUrl}')`;
  }

  badgeEls.forEach(el => {
    el.textContent = track.source || 'Ad-Free Opus Pure Audio';
  });

  updateFavoriteButtonUI(track.id);
}

export function updateFavoriteButtonUI(trackId) {
  const favBtns = document.querySelectorAll('#btn-player-like, #playbar-fav-btn, #fullscreen-fav-btn, #fs-btn-like');
  const isFav = isFavorite(trackId);
  favBtns.forEach(btn => {
    const icon = btn.querySelector('i') || btn;
    if (icon) {
      if (isFav) {
        icon.className = 'fa-solid fa-heart';
        btn.style.color = '#ff007a';
      } else {
        icon.className = 'fa-regular fa-heart';
        btn.style.color = 'var(--text-muted)';
      }
    }
  });
}

export function addCurrentToPlaylist() {
  if (!currentTrack) return;
  if (typeof window !== 'undefined' && window.openAddToPlaylistModal) {
    window.openAddToPlaylistModal(currentTrack);
  }
}

export async function toggleCurrentTrackFavorite() {
  if (!currentTrack) return;
  const trackId = currentTrack.id;
  if (isFavorite(trackId)) {
    await removeFavorite(trackId);
    if (typeof window.showToast === 'function') {
      window.showToast(`Removed "${currentTrack.title}" from Liked Songs`, 'info', 2000);
    }
  } else {
    await addFavorite(currentTrack);
    if (typeof window.showToast === 'function') {
      window.showToast(`Added "${currentTrack.title}" to Liked Songs ❤️`, 'success', 2000);
    }
  }
  updateFavoriteButtonUI(trackId);
}

function renderQueueUI() {
  const container = document.getElementById('playbar-queue-list') || document.getElementById('fs-queue-list');
  if (!container) return;

  if (playQueue.length === 0) {
    container.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Queue is empty</div>';
    return;
  }

  container.innerHTML = playQueue.map((t, idx) => `
    <div class="queue-item ${idx === queueIndex ? 'active-queue-item' : ''}" onclick="window.PulsePlaybar.playTrackAtQueueIndex(${idx})">
      <img src="${t.coverUrl || './pulse-logo.png'}" alt="cover" class="queue-item-thumb">
      <div class="queue-item-details">
        <div class="queue-item-title">${t.title}</div>
        <div class="queue-item-artist">${t.artist}</div>
      </div>
      ${idx === queueIndex ? '<i class="fa-solid fa-volume-high text-accent"></i>' : ''}
    </div>
  `).join('');
}

export function playTrackAtQueueIndex(index) {
  if (index >= 0 && index < playQueue.length) {
    queueIndex = index;
    playTrack(playQueue[queueIndex], playQueue);
  }
}



// -----------------------------------------------------------------------------
// EVENT LISTENERS BINDING
// -----------------------------------------------------------------------------

function initPlaybarController() {
  getAudio();

  // Maximize / Minimize Click Bindings
  document.querySelectorAll('.player-left, #player-thumb, #player-info, #playbar-maximize-btn, .btn-mobile-expand').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.player-track-actions') || (e.target.closest('button') && !e.target.closest('#playbar-maximize-btn, .btn-mobile-expand'))) {
        return;
      }
      maximizePlayer();
    });
  });

  const minBtn = document.getElementById('btn-fs-minimize');
  if (minBtn) {
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      minimizePlayer();
    });
  }

  const seekers = document.querySelectorAll('#player-seek-slider, #playbar-seeker, #fs-seek-slider');
  seekers.forEach(seeker => {
    seeker.addEventListener('input', (e) => {
      isSeeking = true;
      const pct = parseFloat(e.target.value);
      currentTime = (pct / 100) * duration;
      const formattedCur = formatTime(currentTime);
      document.querySelectorAll('#player-time-current, #playbar-current-time, #fs-time-current').forEach(el => {
        el.textContent = formattedCur;
      });
      document.querySelectorAll('#player-progress-fill, #playbar-progress-fill, #mini-top-progress-fill, #fs-progress-fill').forEach(el => {
        el.style.width = `${pct}%`;
      });
      if (typeof window.syncLiveLyrics === 'function') {
        window.syncLiveLyrics(currentTime);
      }
    });

    seeker.addEventListener('change', (e) => {
      isSeeking = false;
      const pct = parseFloat(e.target.value);
      seekTo((pct / 100) * duration);
    });
  });

  const volSliders = document.querySelectorAll('#volume-slider, #player-volume-slider, #fs-volume-slider');
  volSliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      setVolume(parseFloat(e.target.value) / 100);
    });
  });

  // Keyboard Shortcuts: Space, Arrows, Escape, M, L
  window.addEventListener('keydown', (e) => {
    if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'Escape') {
      if (isMaximized) {
        minimizePlayer();
      }
    } else if (e.code === 'ArrowRight') {
      seekForward5();
    } else if (e.code === 'ArrowLeft') {
      seekBackward5();
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      setVolume(Math.min(1, currentVolume + 0.05));
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      setVolume(Math.max(0, currentVolume - 0.05));
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMute();
    } else if (e.key === 'l' || e.key === 'L') {
      if (typeof window.switchFullscreenView === 'function') {
        window.switchFullscreenView('lyrics');
      }
    }
  });

  // Swipe down to minimize fullscreen player on mobile
  let fsStartY = 0;
  const fsPlayer = document.getElementById('fullscreen-player');
  if (fsPlayer) {
    fsPlayer.addEventListener('touchstart', (e) => {
      fsStartY = e.touches[0].clientY;
    }, { passive: true });
    
    fsPlayer.addEventListener('touchend', (e) => {
      const deltaY = e.changedTouches[0].clientY - fsStartY;
      if (deltaY > 80) {
        minimizePlayer();
      }
    });
  }

  // Listen to Firestore Favorites
  if (typeof onFavoritesChanged === 'function') {
    onFavoritesChanged(() => {
      if (currentTrack) updateFavoriteButtonUI(currentTrack.id);
    });
  }

  // Eagerly pre-initialize YouTube IFrame API for instant playback
  ensureYouTubeReady();
}

// -----------------------------------------------------------------------------
// NATIVE STUDIO AUDIO STREAM PLAYER
// -----------------------------------------------------------------------------
export async function playOnNativeAudio(track) {
  const stream = track.streamUrl || '';
  if (!stream || !stream.startsWith('http') || stream.includes('preview') || stream.includes('audio-ssl.itunes.apple.com') || stream.includes('mzstatic')) {
    return false;
  }

  const a = getAudio();
  try {
    activeEngine = 'native';
    if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      try { ytPlayer.pauseVideo(); } catch (e) {}
    }
    if (ytTimeInterval) clearInterval(ytTimeInterval);

    a.pause();
    a.muted = false;
    a.volume = currentVolume > 0 ? currentVolume : 0.8;
    a.src = stream;
    a.load();
    await a.play();
    isPlaying = true;
    if (window.pulseState) window.pulseState.isPlaying = true;
    track.source = track.source || 'Studio Audio Stream';
    updateTrackInfoUI(track);
    updatePlayPauseUI();
    updateMediaSessionPlaybackState('playing');
    return true;
  } catch (err) {
    console.warn('[Pulse Engine] Native Audio play notice:', err.message);
    // If play was rejected due to transient user gesture requirement, try one more time on immediate interaction
    try {
      a.muted = false;
      await a.play();
      isPlaying = true;
      if (window.pulseState) window.pulseState.isPlaying = true;
      updatePlayPauseUI();
      return true;
    } catch (retryErr) {
      return false;
    }
  }
}

// -----------------------------------------------------------------------------
// INITIALIZE YOUTUBE IFRAME API & HYBRID PLAYBACK RESOLVER
// -----------------------------------------------------------------------------
function initYouTubePlayer(initialVideoId = '4NRXx6U8ABQ', retryCount = 0) {
  if (ytPlayer && ytPlayerReady) return;
  let container = document.getElementById('yt-player-container');
  if (!container) {
    let host = document.getElementById('global-yt-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'global-yt-host';
      host.style.cssText = 'position: fixed; bottom: 0; right: 0; width: 240px; height: 135px; z-index: -1; opacity: 0.01; pointer-events: none; overflow: hidden;';
      document.body.appendChild(host);
    }
    container = document.createElement('div');
    container.id = 'yt-player-container';
    host.appendChild(container);
  }

  if (typeof window.YT !== 'undefined' && window.YT.Player) {
    try {
      ytPlayer = new window.YT.Player('yt-player-container', {
        height: '100%',
        width: '100%',
        videoId: initialVideoId,
        playerVars: {
          'autoplay': 0,
          'controls': 1,
          'playsinline': 1,
          'enablejsapi': 1,
          'rel': 0
        },
        events: {
          'onReady': (event) => {
            ytPlayerReady = true;
            try {
              ytPlayer.setVolume(currentVolume * 100);
            } catch (e) {}
            console.log('[Pulse Studio Master] YouTube IFrame API Ready — Primary engine online.');
          },
          'onStateChange': (event) => {
            if (activeEngine !== 'youtube') return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              isPlaying = true;
              updatePlayPauseUI();
              updateMediaSessionPlaybackState('playing');
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              isPlaying = false;
              updatePlayPauseUI();
              updateMediaSessionPlaybackState('paused');
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (isRepeat) {
                ytPlayer.seekTo(0, true);
                ytPlayer.playVideo();
              } else {
                playNext();
              }
            }
          },
          'onError': async (e) => {
            const errorCode = e?.data;
            console.warn('[Pulse Studio Master] YouTube IFrame error code:', errorCode);
            if (activeEngine === 'youtube' && isPlaying && currentTrack) {
              // Error 100 = video not found, 101/150 = embedding restricted by label
              if ((errorCode === 101 || errorCode === 150 || errorCode === 100) && !currentTrack._hasRetriedAlternative) {
                currentTrack._hasRetriedAlternative = true;
                console.log('[Pulse Studio Master] Attempting alternative video embed for:', currentTrack.title);
                const altQuery = `${currentTrack.title} ${currentTrack.artist} audio lyrics`.trim();
                const altSuccess = await playOnYouTubeSearch(altQuery, currentTrack);
                if (altSuccess) return;
              }
              const skipDelay = (errorCode === 100 || errorCode === 101 || errorCode === 150) ? 400 : 1000;
              setTimeout(() => {
                if (activeEngine === 'youtube') playNext();
              }, skipDelay);
            }
          }
        }
      });
    } catch (e) {
      console.warn('[Pulse Studio Master] Error instantiating YT Player:', e);
      // Retry up to 3 times with increasing delay
      if (retryCount < 3) {
        setTimeout(() => {
          // Re-create container for fresh attempt
          const oldContainer = document.getElementById('yt-player-container');
          if (oldContainer) {
            const parent = oldContainer.parentNode;
            oldContainer.remove();
            const newContainer = document.createElement('div');
            newContainer.id = 'yt-player-container';
            parent.appendChild(newContainer);
          }
          ytPlayer = null;
          ytPlayerReady = false;
          initYouTubePlayer(initialVideoId, retryCount + 1);
        }, 1000 * (retryCount + 1));
      }
    }
  }
}

/**
 * Ensures the YouTube IFrame API script is loaded and player is ready.
 * Handles the race condition where the API script may load before or after our module.
 */
function ensureYouTubeReady() {
  // If YT API is already loaded, init immediately
  if (typeof window.YT !== 'undefined' && window.YT.Player) {
    initYouTubePlayer();
    return;
  }

  // If the script tag doesn't exist yet, inject it
  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }
  }

  // Poll for API readiness (handles delayed script loading)
  let ytPollAttempts = 0;
  const ytPollInterval = setInterval(() => {
    ytPollAttempts++;
    if (typeof window.YT !== 'undefined' && window.YT.Player) {
      clearInterval(ytPollInterval);
      initYouTubePlayer();
    } else if (ytPollAttempts > 50) {
      clearInterval(ytPollInterval);
      console.warn('[Pulse] YouTube IFrame API did not load after 10s');
    }
  }, 200);
}

export async function playOnYouTubeIframe(videoId, track) {
  if (!videoId) return false;
  const cleanId = videoId.replace('ytm-', '').replace('yt-', '').trim();
  const a = getAudio();

  return new Promise((resolve) => {
    function executePlay() {
      try {
        a.pause();
        activeEngine = 'youtube';
        ytPlayer.loadVideoById(cleanId);
        ytPlayer.playVideo();
        isPlaying = true;
        if (window.pulseState) window.pulseState.isPlaying = true;
        track.streamUrl = 'yt-iframe';
        track.source = 'Studio Master Audio (YouTube)';
        updateTrackInfoUI(track);
        updatePlayPauseUI();
        updateMediaSessionPlaybackState('playing');

        const host = document.getElementById('global-yt-host');
        if (host) host.classList.add('active-yt-video');

        if (ytTimeInterval) clearInterval(ytTimeInterval);
        ytTimeInterval = setInterval(() => {
          if (activeEngine === 'youtube' && isPlaying && ytPlayer && ytPlayer.getCurrentTime) {
            try {
              currentTime = ytPlayer.getCurrentTime() || 0;
              if (ytPlayer.getDuration) duration = ytPlayer.getDuration() || 220;
              if (currentTrack) currentTrack.duration = duration;
              updateTimeUI();
              updateMediaSessionPositionState();
              if (typeof window.syncLiveLyrics === 'function') {
                window.syncLiveLyrics(currentTime);
              }
            } catch (e) {}
          }
        }, 500);
        resolve(true);
      } catch (err) {
        console.warn('[Pulse Studio Master] YT Play error:', err);
        resolve(false);
      }
    }

    if (ytPlayer && ytPlayerReady && typeof ytPlayer.loadVideoById === 'function') {
      executePlay();
    } else {
      // Ensure YouTube is initializing
      ensureYouTubeReady();
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (ytPlayer && ytPlayerReady && typeof ytPlayer.loadVideoById === 'function') {
          clearInterval(interval);
          executePlay();
        } else if (attempts > 50) {
          clearInterval(interval);
          console.warn('[Pulse Studio Master] YouTube IFrame failed to become ready after 10s');
          resolve(false);
        }
      }, 200);
    }
  });
}

export async function playOnYouTubeSearch(query, track) {
  if (!query) return false;
  try {
    const hits = await searchYouTubeMusic(query, 2);
    if (hits && hits.length > 0 && hits[0].ytId) {
      track.ytId = hits[0].ytId;
      return await playOnYouTubeIframe(hits[0].ytId, track);
    }
  } catch (e) {}
  return false;
}

// Global hook for YouTube Iframe API callback
if (typeof window !== 'undefined') {
  window.onYouTubeIframeAPIReady = function() {
    initYouTubePlayer();
  };

  // Also check immediately in case API script already loaded
  if (typeof window.YT !== 'undefined' && window.YT.Player) {
    initYouTubePlayer();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPlaybarController();
    // Eager YouTube IFrame initialization — pre-warm on page load for instant playback
    ensureYouTubeReady();
  });
} else {
  initPlaybarController();
  // Eager YouTube IFrame initialization — pre-warm on page load for instant playback
  ensureYouTubeReady();
}

const playbarController = {
  playTrack,
  togglePlay,
  togglePlayPause: togglePlay,
  pause,
  resume,
  playNext,
  playPrevious,
  playPrev: playPrevious,
  seekTo,
  seekBackward5,
  seekForward5,
  maximize: maximizePlayer,
  minimize: minimizePlayer,
  maximizePlayer,
  minimizePlayer,
  toggleFullscreen,
  setVolume,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
  toggleCurrentTrackFavorite,
  addCurrentToPlaylist,
  downloadCurrentTrack,
  downloadTrack,
  playTrackAtQueueIndex,
  getAudio,
  getCurrentTrack: () => currentTrack,
  getIsPlaying: () => isPlaying,
  getPlayQueue: () => playQueue,
  getIsMaximized: () => isMaximized
};

if (typeof window !== 'undefined') {
  Object.assign(window.PulsePlaybar, playbarController);
}

export default playbarController;

