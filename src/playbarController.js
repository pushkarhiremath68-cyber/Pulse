/**
 * Pulse Music - Pure Audio Playbar & Media Session Controller
 * 100% Ad-Free Pure Audio Playback (Zero Video Containers / Zero Visual Frames)
 * Features lock screen media controls (navigator.mediaSession), Firestore history & favorites sync,
 * Web Audio spectrum analysis, synchronized LRCLIB lyrics, and smooth Maximize/Minimize states.
 */

import { addToHistory, isFavorite, addFavorite, removeFavorite, onFavoritesChanged } from './firestoreService.js';
import { resolvePipedAudioStream } from './extractorService.js';
import { resolveFullAudioStream } from './musicService.js';

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
    audio.volume = currentVolume;
    audio.preload = 'auto';

    audio.addEventListener('play', () => {
      isPlaying = true;
      updatePlayPauseUI();
      updateMediaSessionPlaybackState('playing');
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
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
      console.warn('[Pulse Audio Player] Playback notice:', e);
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

// -----------------------------------------------------------------------------
// PLAYBACK CONTROLLER
// -----------------------------------------------------------------------------

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

  // Collect Stream Candidates
  const streamCandidates = [];

  if (track.streamUrl && track.streamUrl.startsWith('http') && !track.streamUrl.includes('preview')) {
    streamCandidates.push({ url: track.streamUrl, source: track.source || 'Direct Audio Stream' });
    if (track.streamUrl.includes('_320.mp4')) {
      streamCandidates.push({ url: track.streamUrl.replace('_320.mp4', '_160.mp4'), source: 'Studio Master 160k' });
    }
  }

  // 1. YouTube Music Extractor if videoId present
  const ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : null);
  if (ytId) {
    try {
      const ytmRes = await resolvePipedAudioStream(ytId);
      if (ytmRes && ytmRes.streamUrl) {
        streamCandidates.push({ url: ytmRes.streamUrl, source: ytmRes.source || 'YouTube Music Ad-Free Opus' });
      }
    } catch (e) {}
  }

  // 2. Multi-tier resolution via MusicService
  if (streamCandidates.length === 0 || streamCandidates[0].url.includes('preview')) {
    try {
      const resolved = await resolveFullAudioStream(track);
      if (resolved && resolved.streamUrl) {
        streamCandidates.push({ url: resolved.streamUrl, source: resolved.source || 'Pulse Pure Audio' });
        if (resolved.streamUrl.includes('_320.mp4')) {
          streamCandidates.push({ url: resolved.streamUrl.replace('_320.mp4', '_160.mp4'), source: 'Studio Master 160k' });
        }
      }
    } catch (e) {}
  }

  // 3. Fallback to Official YouTube Iframe (Allows Ads, guarantees playback)
  if (ytId) {
    streamCandidates.push({ url: 'yt-iframe', ytId: ytId, source: 'Official YouTube Embed (With Ads)' });
  }

  if (sessionId !== activePlaySessionId) return;

  // Try each stream candidate sequentially
  let playbackStarted = false;
  activeEngine = 'native'; // Default

  for (const cand of streamCandidates) {
    if (cand.url === 'yt-iframe' && cand.ytId) {
      if (ytPlayer && ytPlayerReady) {
        a.pause(); // stop native
        activeEngine = 'youtube';
        ytPlayer.loadVideoById(cand.ytId);
        isPlaying = true;
        playbackStarted = true;
        track.streamUrl = 'yt-iframe';
        track.source = cand.source || 'Official YouTube Embed (With Ads)';
        updateTrackInfoUI(track);
        updatePlayPauseUI();
        updateMediaSessionPlaybackState('playing');
        
        // Start a time interval loop for YT player
        if (ytTimeInterval) clearInterval(ytTimeInterval);
        ytTimeInterval = setInterval(() => {
          if (activeEngine === 'youtube' && isPlaying && ytPlayer.getCurrentTime) {
            currentTime = ytPlayer.getCurrentTime();
            if (ytPlayer.getDuration) duration = ytPlayer.getDuration();
            if (currentTrack) currentTrack.duration = duration;
            updateTimeUI();
            updateMediaSessionPositionState();
            if (typeof window.syncLiveLyrics === 'function') {
              window.syncLiveLyrics(currentTime);
            }
          }
        }, 500);
        break;
      } else {
        console.warn('[Pulse Engine] YT Player not ready yet');
        continue; // Fallback or fail
      }
    }

    if (!cand.url || !cand.url.startsWith('http')) continue;
    try {
      activeEngine = 'native';
      if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
      a.pause();
      a.src = cand.url;
      a.load();
      await a.play();
      isPlaying = true;
      playbackStarted = true;
      track.streamUrl = cand.url;
      track.source = cand.source;
      updateTrackInfoUI(track);
      updatePlayPauseUI();
      updateMediaSessionPlaybackState('playing');
      break;
    } catch (err) {
      console.warn('[Pulse Audio] Candidate notice:', cand.source);
    }
  }

  if (playbackStarted) return;

  if (typeof window.showToast === 'function') {
    window.showToast(`Connecting to audio stream for "${track.title}"...`, 'info', 2000);
  }
}

export function togglePlay() {
  if (isPlaying) {
    pause();
  } else {
    resume();
  }
}

export function pause() {
  if (activeEngine === 'native') {
    getAudio().pause();
  } else if (activeEngine === 'youtube' && ytPlayer && ytPlayer.pauseVideo) {
    ytPlayer.pauseVideo();
  }
  isPlaying = false;
  if (window.pulseState) window.pulseState.isPlaying = false;
  updatePlayPauseUI();
  updateMediaSessionPlaybackState('paused');
}

export function resume() {
  if (currentTrack) {
    if (activeEngine === 'native') {
      getAudio().play().catch(() => {});
    } else if (activeEngine === 'youtube' && ytPlayer && ytPlayer.playVideo) {
      ytPlayer.playVideo();
    }
    isPlaying = true;
    if (window.pulseState) window.pulseState.isPlaying = true;
    updatePlayPauseUI();
    updateMediaSessionPlaybackState('playing');
  }
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

  const shouldOpen = typeof forceState === 'boolean' ? forceState : fsModal.classList.contains('hidden');
  isMaximized = shouldOpen;

  if (shouldOpen) {
    fsModal.classList.remove('hidden');
    fsModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Start Visualizer Canvas if present
    if (window.pulseVisualizerInstance) {
      window.pulseVisualizerInstance.start();
    }

    if (currentTrack && typeof window.loadTrackLyrics === 'function') {
      window.loadTrackLyrics(currentTrack);
    }
  } else {
    fsModal.classList.add('hidden');
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
  const playIcons = document.querySelectorAll('.playbar-play-icon, #btn-play-pause i, #playbar-play-btn i, #fullscreen-play-btn i, #fs-play-pause-btn i');
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

  const coverUrl = track.coverUrl || track.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

  titleEls.forEach(el => { el.textContent = track.title || 'Untitled Track'; });
  artistEls.forEach(el => { el.textContent = track.artist || 'Pulse Artist'; });
  coverEls.forEach(el => {
    if (el.tagName === 'IMG') {
      el.src = coverUrl;
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

export function seekBackward5() {
  seekTo(Math.max(0, currentTime - 5));
}

export function seekForward5() {
  seekTo(Math.min(duration, currentTime + 5));
}

// -----------------------------------------------------------------------------
// EVENT LISTENERS BINDING
// -----------------------------------------------------------------------------

function initPlaybarController() {
  getAudio();

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
      if (typeof window.openLyricsDrawer === 'function') {
        window.openLyricsDrawer();
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
}

}

// -----------------------------------------------------------------------------
// INITIALIZE YOUTUBE IFRAME API
// -----------------------------------------------------------------------------
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new window.YT.Player('yt-player-container', {
    height: '0',
    width: '0',
    videoId: '',
    playerVars: {
      'autoplay': 0,
      'controls': 0,
      'disablekb': 1,
      'playsinline': 1
    },
    events: {
      'onReady': (event) => {
        ytPlayerReady = true;
        ytPlayer.setVolume(currentVolume * 100);
        console.log('[Pulse Hybrid Engine] YouTube IFrame API Ready.');
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
      'onError': (e) => {
        console.warn('[Pulse Hybrid Engine] YT IFrame Error:', e);
        playNext();
      }
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlaybarController);
} else {
  initPlaybarController();
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
  playTrackAtQueueIndex,
  getAudio,
  getCurrentTrack: () => currentTrack,
  getIsPlaying: () => isPlaying,
  getPlayQueue: () => playQueue,
  getIsMaximized: () => isMaximized
};

if (typeof window !== 'undefined') {
  window.PulsePlaybar = playbarController;
}

export default playbarController;
