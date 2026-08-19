/**
 * Pulse Music - Pure Audio Playbar & Media Session Controller
 * 100% Ad-Free Pure Audio Playback (Zero Video Containers / Zero Visual Frames)
 * Features lock screen media controls (navigator.mediaSession), Firestore history & favorites sync,
 * Web Audio spectrum analysis, and synchronized LRCLIB lyrics.
 */

import { addToHistory, isFavorite, addFavorite, removeFavorite, onFavoritesChanged } from './firestoreService.js';
import { resolvePipedAudioStream } from './extractorService.js';
import { resolveExactTrackStream } from './musicService.js';

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
let activePlaySessionId = 0;

// Initialize Native HTML5 Pure Audio Element
function getAudio() {
  if (!audio) {
    audio = document.getElementById('fallback-audio-player') || new Audio();
    audio.id = 'fallback-audio-player';
    audio.volume = currentVolume;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';

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
      console.warn('[Pulse Audio Player] Playback error event:', e);
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

  // Action handlers
  try {
    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10;
      seekTo(Math.max(currentTime - skipTime, 0));
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10;
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
  if (typeof window.fetchTrackLyrics === 'function') {
    window.fetchTrackLyrics(track);
  }

  // Resolve Direct Stream Candidates
  let streamUrl = track.streamUrl;

  // 1. If YouTube Video ID present, resolve direct Opus/M4A audio stream
  const ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : null);
  if (!streamUrl || streamUrl.includes('preview') || (ytId && !streamUrl.startsWith('http'))) {
    if (ytId) {
      const ytmRes = await resolvePipedAudioStream(ytId);
      if (ytmRes && ytmRes.streamUrl) {
        streamUrl = ytmRes.streamUrl;
        track.streamUrl = streamUrl;
        track.source = ytmRes.source || 'YouTube Music Ad-Free Opus';
      }
    }
  }

  // 2. Fallback to MusicService multi-tier resolver
  if (!streamUrl || streamUrl.includes('preview')) {
    streamUrl = await resolveExactTrackStream(track);
  }

  if (sessionId !== activePlaySessionId) return;

  if (streamUrl && streamUrl.startsWith('http')) {
    try {
      a.pause();
      a.src = streamUrl;
      a.load();
      await a.play();
      isPlaying = true;
      updatePlayPauseUI();
      updateMediaSessionPlaybackState('playing');
      console.log('[Pulse Pure Audio] Playing stream:', track.title, track.source || '');
      return;
    } catch (err) {
      console.warn('[Pulse Audio] Direct stream failed, attempting native engine cascade:', err.message);
    }
  }

  // 3. Last-resort fallback via PulseAudioEngine
  if (window.PulseAudioEngine?.playTrackOnNativeAudio) {
    const success = await window.PulseAudioEngine.playTrackOnNativeAudio(track);
    if (success) {
      isPlaying = true;
      updatePlayPauseUI();
      updateMediaSessionPlaybackState('playing');
      return;
    }
  }

  if (typeof window.showToast === 'function') {
    window.showToast(`Unable to play "${track.title}". Trying next track...`, 'warning', 2500);
  }
  setTimeout(() => playNext(), 1000);
}

export function togglePlay() {
  const a = getAudio();
  if (isPlaying) {
    pause();
  } else {
    resume();
  }
}

export function pause() {
  const a = getAudio();
  a.pause();
  isPlaying = false;
  if (window.pulseState) window.pulseState.isPlaying = false;
  updatePlayPauseUI();
  updateMediaSessionPlaybackState('paused');
}

export function resume() {
  const a = getAudio();
  if (currentTrack) {
    a.play().catch(() => {});
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
  playTrack(playQueue[queueIndex]);
}

export function playPrevious() {
  if (playQueue.length === 0) return;
  if (currentTime > 3) {
    seekTo(0);
    return;
  }
  queueIndex = (queueIndex - 1 + playQueue.length) % playQueue.length;
  playTrack(playQueue[queueIndex]);
}

export function seekTo(seconds) {
  const a = getAudio();
  currentTime = seconds;
  a.currentTime = seconds;
  updateTimeUI();
  updateMediaSessionPositionState();
}

export function setVolume(vol) {
  const a = getAudio();
  currentVolume = Math.max(0, Math.min(1, vol));
  a.volume = currentVolume;
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
  const btn = document.getElementById('btn-shuffle');
  if (btn) btn.classList.toggle('active-ctrl', isShuffle);
  if (typeof window.showToast === 'function') {
    window.showToast(`Shuffle is ${isShuffle ? 'ON' : 'OFF'}`, 'info', 1500);
  }
}

export function toggleRepeat() {
  isRepeat = !isRepeat;
  const btn = document.getElementById('btn-repeat');
  if (btn) btn.classList.toggle('active-ctrl', isRepeat);
  if (typeof window.showToast === 'function') {
    window.showToast(`Repeat is ${isRepeat ? 'ON' : 'OFF'}`, 'info', 1500);
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
  const curTimeEl = document.getElementById('playbar-current-time');
  const durTimeEl = document.getElementById('playbar-duration');
  const progressBar = document.getElementById('playbar-progress-fill');
  const seeker = document.getElementById('playbar-seeker');

  if (curTimeEl) curTimeEl.textContent = formatTime(currentTime);
  if (durTimeEl) durTimeEl.textContent = formatTime(duration);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  if (progressBar) progressBar.style.width = `${pct}%`;
  if (seeker && !isSeeking) seeker.value = pct;
}

function updatePlayPauseUI() {
  const playIcons = document.querySelectorAll('.playbar-play-icon, #playbar-play-btn i, #fullscreen-play-btn i');
  playIcons.forEach(icon => {
    if (isPlaying) {
      icon.className = 'fa-solid fa-pause';
    } else {
      icon.className = 'fa-solid fa-play';
    }
  });

  const disk = document.getElementById('fullscreen-album-art');
  if (disk) {
    if (isPlaying) disk.classList.add('playing-spin');
    else disk.classList.remove('playing-spin');
  }
}

function updateVolumeUI() {
  const volBar = document.getElementById('volume-progress-fill');
  const volSlider = document.getElementById('volume-slider');
  const volIcon = document.getElementById('volume-icon');

  if (volSlider) volSlider.value = currentVolume * 100;
  if (volBar) volBar.style.width = `${currentVolume * 100}%`;

  if (volIcon) {
    if (currentVolume === 0 || isMuted) {
      volIcon.className = 'fa-solid fa-volume-xmark';
    } else if (currentVolume < 0.5) {
      volIcon.className = 'fa-solid fa-volume-low';
    } else {
      volIcon.className = 'fa-solid fa-volume-high';
    }
  }
}

function updateTrackInfoUI(track) {
  if (!track) return;
  const titleEls = document.querySelectorAll('#playbar-title, #fullscreen-track-title');
  const artistEls = document.querySelectorAll('#playbar-artist, #fullscreen-track-artist');
  const coverEls = document.querySelectorAll('#playbar-cover, #fullscreen-cover-img');
  const badgeEl = document.getElementById('playbar-source-badge');

  titleEls.forEach(el => el.textContent = track.title || 'Untitled Track');
  artistEls.forEach(el => el.textContent = track.artist || 'Pulse Artist');
  coverEls.forEach(el => {
    el.src = track.coverUrl || track.cover || './pulse-logo.png';
  });

  if (badgeEl) {
    badgeEl.textContent = track.source || 'Ad-Free Opus Pure Audio';
  }

  // Update Favorite Button State in Playbar
  updateFavoriteButtonUI(track.id);
}

export function updateFavoriteButtonUI(trackId) {
  const favBtns = document.querySelectorAll('#playbar-fav-btn, #fullscreen-fav-btn');
  const isFav = isFavorite(trackId);
  favBtns.forEach(btn => {
    const icon = btn.querySelector('i');
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
  const container = document.getElementById('playbar-queue-list');
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
    playTrack(playQueue[queueIndex]);
  }
}

// -----------------------------------------------------------------------------
// EVENT LISTENERS BINDING
// -----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  getAudio();

  const seeker = document.getElementById('playbar-seeker');
  if (seeker) {
    seeker.addEventListener('input', (e) => {
      isSeeking = true;
      const pct = parseFloat(e.target.value);
      currentTime = (pct / 100) * duration;
      const curTimeEl = document.getElementById('playbar-current-time');
      if (curTimeEl) curTimeEl.textContent = formatTime(currentTime);
      const progressBar = document.getElementById('playbar-progress-fill');
      if (progressBar) progressBar.style.width = `${pct}%`;
    });

    seeker.addEventListener('change', (e) => {
      isSeeking = false;
      const pct = parseFloat(e.target.value);
      seekTo((pct / 100) * duration);
    });
  }

  const volSlider = document.getElementById('volume-slider');
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      setVolume(parseFloat(e.target.value) / 100);
    });
  }

  // Listen to Firestore Favorites changes to update UI
  onFavoritesChanged(() => {
    if (currentTrack) updateFavoriteButtonUI(currentTrack.id);
  });
});

export function toggleFullscreen(forceState) {
  const fsModal = document.getElementById('fullscreen-player');
  if (!fsModal) return;
  const shouldOpen = typeof forceState === 'boolean' ? forceState : fsModal.classList.contains('hidden');
  if (shouldOpen) {
    fsModal.classList.remove('hidden');
    fsModal.classList.add('active-fs');
    if (currentTrack && typeof window.loadTrackLyrics === 'function') {
      window.loadTrackLyrics(currentTrack);
    }
  } else {
    fsModal.classList.add('hidden');
    fsModal.classList.remove('active-fs');
  }
}

export function seekBackward5() {
  seekTo(Math.max(0, currentTime - 5));
}

export function seekForward5() {
  seekTo(Math.min(duration, currentTime + 5));
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
  toggleFullscreen,
  setVolume,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
  toggleCurrentTrackFavorite,
  playTrackAtQueueIndex,
  getAudio,
  getCurrentTrack: () => currentTrack,
  getIsPlaying: () => isPlaying,
  getPlayQueue: () => playQueue
};

if (typeof window !== 'undefined') {
  window.PulsePlaybar = playbarController;
}

export default playbarController;
