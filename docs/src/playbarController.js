/**
 * Pulse Music - State-of-the-Art Bottom Audio Playbar Controller
 * Features exact stream resolution, animated vinyl cover, live scrubber, volume control, and zero-error playback.
 */

let audio = null;
let currentTrack = null;
let isPlaying = false;
let isMuted = false;
let previousVolume = 0.8;
let duration = 0;
let currentTime = 0;
let isSeeking = false;
let playQueue = [];
let queueIndex = 0;
let isShuffle = false;
let isRepeat = false;

function getAudio() {
  if (!audio) {
    audio = document.getElementById('fallback-audio-player') || new Audio();
    audio.id = 'fallback-audio-player';
    audio.volume = 0.8;

    audio.addEventListener('play', () => {
      isPlaying = true;
      updatePlayPauseUI();
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
      updatePlayPauseUI();
    });

    audio.addEventListener('timeupdate', () => {
      if (!isSeeking && audio.duration) {
        currentTime = audio.currentTime;
        duration = audio.duration;
        updateTimeUI();
        if (typeof window.syncLiveLyrics === 'function') {
          window.syncLiveLyrics(currentTime);
        }
      }
    });

    audio.addEventListener('ended', () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    });

    audio.addEventListener('error', (e) => {
      console.warn('[Playbar] Audio stream notice, trying alternative node...', e);
      if (window.musicService && typeof window.musicService.rotateAudiusNode === 'function') {
        window.musicService.rotateAudiusNode();
      }
    });
  }
  return audio;
}

export async function playTrack(track, newQueue = null) {
  if (!track) return;
  const a = getAudio();

  if (newQueue && Array.isArray(newQueue)) {
    playQueue = newQueue;
    queueIndex = playQueue.findIndex(t => t.id === track.id || t.title === track.title);
    if (queueIndex === -1) queueIndex = 0;
  }

  currentTrack = track;
  if (window.pulseState) {
    window.pulseState.currentTrack = track;
    window.pulseState.isPlaying = true;
  }

  updateTrackMetadataUI(track);

  // Resolve exact authentic audio stream URL
  let stream = track.streamUrl;
  if (window.musicService && typeof window.musicService.resolveExactTrackStream === 'function') {
    stream = await window.musicService.resolveExactTrackStream(track);
  }

  try {
    a.src = stream;
    a.load();
    const playPromise = a.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('[Playbar] Playback gesture requirement:', err);
      });
    }
  } catch (err) {
    console.error('[Playbar] Play error:', err);
  }

  // Load lyrics
  if (typeof window.loadTrackLyrics === 'function') {
    window.loadTrackLyrics(track);
  }
}

export function togglePlayPause() {
  const a = getAudio();
  if (!a.src) {
    if (currentTrack) playTrack(currentTrack);
    return;
  }
  if (a.paused) {
    a.play().catch(e => console.warn(e));
  } else {
    a.pause();
  }
}

export function playNext() {
  if (playQueue.length > 0) {
    if (isShuffle) {
      queueIndex = Math.floor(Math.random() * playQueue.length);
    } else {
      queueIndex = (queueIndex + 1) % playQueue.length;
    }
    playTrack(playQueue[queueIndex]);
  } else {
    // If no queue, pick from master registry
    togglePlayPause();
  }
}

export function playPrev() {
  const a = getAudio();
  if (a && a.currentTime > 3) {
    a.currentTime = 0;
    return;
  }
  if (playQueue.length > 0) {
    queueIndex = (queueIndex - 1 + playQueue.length) % playQueue.length;
    playTrack(playQueue[queueIndex]);
  }
}

export function toggleShuffle() {
  isShuffle = !isShuffle;
  const btn = document.getElementById('btn-shuffle');
  if (btn) btn.style.color = isShuffle ? '#a855f7' : 'inherit';
  if (window.showToast) window.showToast(isShuffle ? 'Shuffle Enabled' : 'Shuffle Disabled', 'info', 1500);
}

export function toggleRepeat() {
  isRepeat = !isRepeat;
  const btn = document.getElementById('btn-repeat');
  if (btn) btn.style.color = isRepeat ? '#a855f7' : 'inherit';
  if (window.showToast) window.showToast(isRepeat ? 'Repeat Track Enabled' : 'Repeat Disabled', 'info', 1500);
}

export function setVolume(vol) {
  const a = getAudio();
  a.volume = Math.max(0, Math.min(1, vol));
  isMuted = a.volume === 0;
  updateVolumeUI();
}

export function toggleMute() {
  const a = getAudio();
  if (isMuted) {
    a.volume = previousVolume || 0.8;
    isMuted = false;
  } else {
    previousVolume = a.volume;
    a.volume = 0;
    isMuted = true;
  }
  updateVolumeUI();
}

export function handleSeekStart() {
  isSeeking = true;
}

export function handleSeekMove(percentage) {
  const a = getAudio();
  const dur = a.duration || duration || 210;
  const targetTime = (percentage / 100) * dur;
  const curEl = document.getElementById('player-time-current');
  const fsCurEl = document.getElementById('fs-time-current');
  const timeStr = formatTime(targetTime);
  if (curEl) curEl.textContent = timeStr;
  if (fsCurEl) fsCurEl.textContent = timeStr;

  const fill = document.getElementById('player-progress-fill');
  const fsFill = document.getElementById('fs-progress-fill');
  const topFill = document.getElementById('mini-top-progress-fill');
  if (fill) fill.style.width = `${percentage}%`;
  if (fsFill) fsFill.style.width = `${percentage}%`;
  if (topFill) topFill.style.width = `${percentage}%`;
}

export function handleSeekEnd(percentage) {
  const a = getAudio();
  const dur = a.duration || duration || 210;
  a.currentTime = (percentage / 100) * dur;
  isSeeking = false;
}

export function toggleFullscreen(open) {
  const fs = document.getElementById('fullscreen-player');
  if (fs) fs.classList.toggle('active', open);
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updatePlayPauseUI() {
  const icon = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
  const mainBtn = document.getElementById('btn-play-pause');
  const fsBtn = document.getElementById('fs-btn-play');
  const thumb = document.getElementById('player-thumb');

  if (mainBtn) mainBtn.innerHTML = icon;
  if (fsBtn) fsBtn.innerHTML = icon;
  if (thumb) thumb.classList.toggle('playing-spin', isPlaying);
}

function updateTrackMetadataUI(track) {
  const thumb = document.getElementById('player-thumb');
  const title = document.getElementById('player-title');
  const artist = document.getElementById('player-artist');
  const fsArt = document.getElementById('fs-album-art');
  const fsTitle = document.getElementById('fs-track-title');
  const fsArtist = document.getElementById('fs-track-artist');
  const fsBg = document.getElementById('fs-bg-blur');

  const cover = track.coverUrl || './pulse-logo.png';
  if (thumb) thumb.src = cover;
  if (title) title.textContent = track.title;
  if (artist) artist.textContent = track.artist;
  if (fsArt) fsArt.src = cover;
  if (fsTitle) fsTitle.textContent = track.title;
  if (fsArtist) fsArtist.textContent = track.artist;
  if (fsBg) fsBg.style.backgroundImage = `url(${cover})`;
}

function updateTimeUI() {
  const curTimeStr = formatTime(currentTime);
  const totalTimeStr = formatTime(duration);
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const curEl = document.getElementById('player-time-current');
  const totalEl = document.getElementById('player-time-total');
  const fsCurEl = document.getElementById('fs-time-current');
  const fsTotalEl = document.getElementById('fs-time-total');
  const slider = document.getElementById('player-seek-slider');
  const fsSlider = document.getElementById('fs-seek-slider');
  const fill = document.getElementById('player-progress-fill');
  const fsFill = document.getElementById('fs-progress-fill');
  const topFill = document.getElementById('mini-top-progress-fill');

  if (curEl) curEl.textContent = curTimeStr;
  if (totalEl) totalEl.textContent = totalTimeStr;
  if (fsCurEl) fsCurEl.textContent = curTimeStr;
  if (fsTotalEl) fsTotalEl.textContent = totalTimeStr;

  if (slider && !isSeeking) slider.value = pct;
  if (fsSlider && !isSeeking) fsSlider.value = pct;
  if (fill) fill.style.width = `${pct}%`;
  if (fsFill) fsFill.style.width = `${pct}%`;
  if (topFill) topFill.style.width = `${pct}%`;
}

function updateVolumeUI() {
  const a = getAudio();
  const volIcon = document.getElementById('volume-icon');
  const volSlider = document.getElementById('volume-slider');

  if (volSlider) volSlider.value = a.volume * 100;
  if (volIcon) {
    if (isMuted || a.volume === 0) {
      volIcon.className = 'fa-solid fa-volume-xmark';
      volIcon.style.color = '#f87171';
    } else if (a.volume < 0.5) {
      volIcon.className = 'fa-solid fa-volume-low';
      volIcon.style.color = '#fff';
    } else {
      volIcon.className = 'fa-solid fa-volume-high';
      volIcon.style.color = '#c084fc';
    }
  }
}

export function getState() {
  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    volume: audio ? audio.volume : 0.8
  };
}

const playbarController = {
  playTrack,
  togglePlayPause,
  playNext,
  playPrev,
  toggleShuffle,
  toggleRepeat,
  setVolume,
  toggleMute,
  handleSeekStart,
  handleSeekMove,
  handleSeekEnd,
  toggleFullscreen,
  getState
};

if (typeof window !== 'undefined') {
  window.PulsePlaybar = playbarController;
}

export default playbarController;
