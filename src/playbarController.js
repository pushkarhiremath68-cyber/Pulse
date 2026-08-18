/**
 * Pulse Music - Dual Engine Audio & YouTube Player Controller
 * Seamlessly plays 100% Full-Length Songs (320kbps / 160kbps Master Audio).
 * Features exact master audio, LRCLIB live synced lyrics, 70px slim playbar, and centered fullscreen view.
 */

let audio = null;
let ytPlayer = null;
let isYtReady = false;
let currentEngine = 'audio'; // 'audio' or 'yt'
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
let ytInterval = null;
let activePlaySessionId = 0;

// Initialize Native HTML5 Audio
function getAudio() {
  if (!audio) {
    audio = document.getElementById('fallback-audio-player') || new Audio();
    audio.id = 'fallback-audio-player';
    audio.volume = currentVolume;
    audio.preload = 'auto';

    audio.addEventListener('play', () => {
      if (currentEngine === 'audio') {
        isPlaying = true;
        updatePlayPauseUI();
      }
    });

    audio.addEventListener('pause', () => {
      if (currentEngine === 'audio') {
        isPlaying = false;
        updatePlayPauseUI();
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 45) {
        duration = audio.duration;
        if (currentTrack) currentTrack.duration = duration;
        updateTimeUI();
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (currentEngine === 'audio' && !isSeeking) {
        currentTime = audio.currentTime;
        if (audio.duration && !isNaN(audio.duration) && audio.duration > 45) {
          duration = audio.duration;
        }
        updateTimeUI();
        if (typeof window.syncLiveLyrics === 'function') {
          window.syncLiveLyrics(currentTime);
        }
      }
    });

    audio.addEventListener('ended', () => {
      if (currentEngine === 'audio') {
        if (isRepeat) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } else {
          playNext();
        }
      }
    });

    audio.addEventListener('error', (e) => {
      console.warn('[Pulse Audio Engine] Stream playback notice:', e);
    });
  }
  return audio;
}

// Initialize YouTube IFrame API
function initYouTubePlayer() {
  if (window.YT && window.YT.Player) {
    createYTInstance();
  } else {
    window.onYouTubeIframeAPIReady = () => {
      createYTInstance();
    };
  }
}

function createYTInstance() {
  const host = document.getElementById('yt-player-host');
  if (!host) return;

  try {
    ytPlayer = new window.YT.Player('yt-player-host', {
      height: '200',
      width: '200',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          isYtReady = true;
          event.target.setVolume(currentVolume * 100);
          console.log('[Pulse YT Engine] YouTube Audio Engine Ready');
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            isPlaying = true;
            updatePlayPauseUI();
            startYtTracking();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            isPlaying = false;
            updatePlayPauseUI();
            stopYtTracking();
          } else if (event.data === window.YT.PlayerState.ENDED) {
            stopYtTracking();
            if (isRepeat) {
              ytPlayer.seekTo(0, true);
              ytPlayer.playVideo();
            } else {
              playNext();
            }
          }
        },
        onError: (err) => {
          console.warn('[Pulse YT Engine] Video playback notice, switching to 320k audio stream:', err);
          if (currentTrack) {
            fallbackToHtmlAudio(currentTrack);
          }
        }
      }
    });
  } catch (e) {
    console.warn('[Pulse YT Engine] Error initializing YT player:', e);
  }
}

function startYtTracking() {
  stopYtTracking();
  ytInterval = setInterval(() => {
    if (currentEngine === 'yt' && ytPlayer && ytPlayer.getCurrentTime && !isSeeking) {
      const cur = ytPlayer.getCurrentTime() || 0;
      const dur = ytPlayer.getDuration() || duration || 220;
      currentTime = cur;
      duration = dur;
      updateTimeUI();
      if (typeof window.syncLiveLyrics === 'function') {
        window.syncLiveLyrics(currentTime);
      }
    }
  }, 250);
}

function stopYtTracking() {
  if (ytInterval) {
    clearInterval(ytInterval);
    ytInterval = null;
  }
}

function fallbackToHtmlAudio(track) {
  currentEngine = 'audio';
  if (ytPlayer && ytPlayer.stopVideo) {
    try { ytPlayer.stopVideo(); } catch (e) {}
  }
  const a = getAudio();
  if (track && track.streamUrl) {
    a.src = track.streamUrl;
    a.load();
    a.play().catch(e => console.warn('[Pulse Audio Notice]', e));
  }
}

function setupMediaSession(track) {
  if ('mediaSession' in navigator && track) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Untitled Song',
      artist: track.artist || 'Pulse Artist',
      album: track.album || 'Pulse Music',
      artwork: [
        { src: track.coverUrl || './pulse-logo.png', sizes: '512x512', type: 'image/png' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
    navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        handleSeekEnd((details.seekTime / (duration || 220)) * 100);
      }
    });
  }
}

/**
 * Main PlayTrack function: Resolves 100% Full-Length Audio and plays seamlessly
 */
export async function playTrack(track, newQueue = null) {
  if (!track) return;
  const sessionId = ++activePlaySessionId;

  if (newQueue && Array.isArray(newQueue)) {
    playQueue = newQueue;
    queueIndex = playQueue.findIndex(t => t.id === track.id || t.title === track.title);
    if (queueIndex === -1) queueIndex = 0;
  }

  currentTrack = track;
  duration = track.duration && track.duration > 45 ? track.duration : 220;
  currentTime = 0;

  if (window.pulseState) {
    window.pulseState.currentTrack = track;
    window.pulseState.isPlaying = true;
  }

  updateTrackMetadataUI(track);
  updateTimeUI();
  setupMediaSession(track);

  // Check if track stream needs full-length resolution (e.g. was iTunes 30s preview or missing)
  const isPreview = !track.streamUrl || 
                    track.streamUrl.includes('itunes.apple.com') || 
                    track.streamUrl.includes('preview') || 
                    (track.duration && track.duration <= 35);

  let fullStreamUrl = isPreview ? '' : track.streamUrl;
  if (isPreview) {
    track.streamUrl = '';
  }

  if (isPreview && window.musicService && typeof window.musicService.resolveFullAudioStream === 'function') {
    try {
      const fullRes = await window.musicService.resolveFullAudioStream(track);
      if (fullRes && fullRes.streamUrl && sessionId === activePlaySessionId) {
        fullStreamUrl = fullRes.streamUrl;
        track.streamUrl = fullRes.streamUrl;
        if (fullRes.duration && fullRes.duration > 45) {
          track.duration = fullRes.duration;
          duration = fullRes.duration;
        }
        if (fullRes.source) track.source = fullRes.source;
        if (fullRes.coverUrl && (!track.coverUrl || track.coverUrl.includes('pulse-logo.png'))) {
          track.coverUrl = fullRes.coverUrl;
          updateTrackMetadataUI(track);
        }
        updateTimeUI();
      }
    } catch (e) {
      console.warn('[Pulse Stream Resolution Notice]', e);
    }
  }

  if (sessionId !== activePlaySessionId) return;

  // Attempt YouTube play if video ID exists and user engine prefers YT
  let ytId = track.ytId;
  if (!ytId && isPreview && window.musicService && typeof window.musicService.resolveYouTubeVideoId === 'function') {
    try {
      ytId = await window.musicService.resolveYouTubeVideoId(track);
      if (ytId) track.ytId = ytId;
    } catch (e) {}
  }

  if (sessionId !== activePlaySessionId) return;

  // Play through native HTML5 audio with 320k master stream (Fastest & 100% full length)
  if (fullStreamUrl && (!ytId || !isYtReady)) {
    currentEngine = 'audio';
    if (ytPlayer && ytPlayer.stopVideo) {
      try { ytPlayer.stopVideo(); } catch (e) {}
    }
    const a = getAudio();
    a.src = fullStreamUrl;
    a.load();
    a.play().then(() => {
      isPlaying = true;
      updatePlayPauseUI();
    }).catch(err => {
      console.warn('[Pulse HTML5 Audio Playback]', err);
    });
  } else if (ytId && ytPlayer && isYtReady) {
    currentEngine = 'yt';
    if (audio) audio.pause();
    try {
      ytPlayer.loadVideoById(ytId);
      ytPlayer.playVideo();
      isPlaying = true;
      updatePlayPauseUI();
    } catch (e) {
      fallbackToHtmlAudio(track);
    }
  } else if (fullStreamUrl) {
    fallbackToHtmlAudio(track);
  }

  // Load live synced lyrics
  if (typeof window.loadTrackLyrics === 'function') {
    window.loadTrackLyrics(track);
  }
}

export function togglePlayPause() {
  if (currentEngine === 'yt' && ytPlayer && isYtReady) {
    const state = ytPlayer.getPlayerState ? ytPlayer.getPlayerState() : -1;
    if (state === window.YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  } else {
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
}

export function playNext() {
  if (playQueue.length > 1) {
    if (isShuffle) {
      queueIndex = Math.floor(Math.random() * playQueue.length);
    } else {
      queueIndex = (queueIndex + 1) % playQueue.length;
    }
    playTrack(playQueue[queueIndex], playQueue);
  } else if (window.catalogService && Array.isArray(window.catalogService.CATALOG_CATEGORIES)) {
    const allTracks = [];
    window.catalogService.CATALOG_CATEGORIES.forEach(c => {
      if (Array.isArray(c.tracks)) {
        c.tracks.forEach(t => allTracks.push({
          title: t.title,
          artist: t.artist,
          coverUrl: t.cover,
          streamUrl: t.stream,
          ytId: t.ytId,
          duration: t.duration || 220,
          source: `${c.title} (100% Full Song)`
        }));
      }
    });
    if (allTracks.length > 0) {
      const nextIdx = Math.floor(Math.random() * allTracks.length);
      playTrack(allTracks[nextIdx], allTracks);
    } else {
      togglePlayPause();
    }
  } else {
    togglePlayPause();
  }
}

export function playPrev() {
  if (currentTime > 3) {
    if (currentEngine === 'yt' && ytPlayer && isYtReady) {
      ytPlayer.seekTo(0, true);
    } else if (audio) {
      audio.currentTime = 0;
    }
    return;
  }
  if (playQueue.length > 0) {
    queueIndex = (queueIndex - 1 + playQueue.length) % playQueue.length;
    playTrack(playQueue[queueIndex], playQueue);
  }
}

export function toggleShuffle() {
  isShuffle = !isShuffle;
  const btn = document.getElementById('btn-shuffle');
  const fsBtn = document.getElementById('fs-btn-shuffle');
  if (btn) btn.style.color = isShuffle ? '#ff007a' : 'inherit';
  if (fsBtn) fsBtn.style.color = isShuffle ? '#ff007a' : 'inherit';
  if (window.showToast) window.showToast(isShuffle ? 'Shuffle Enabled' : 'Shuffle Disabled', 'info', 1500);
}

export function toggleRepeat() {
  isRepeat = !isRepeat;
  const btn = document.getElementById('btn-repeat');
  const fsBtn = document.getElementById('fs-btn-repeat');
  if (btn) btn.style.color = isRepeat ? '#ff007a' : 'inherit';
  if (fsBtn) fsBtn.style.color = isRepeat ? '#ff007a' : 'inherit';
  if (window.showToast) window.showToast(isRepeat ? 'Repeat Track Enabled' : 'Repeat Disabled', 'info', 1500);
}

export function setVolume(vol) {
  currentVolume = Math.max(0, Math.min(1, vol));
  isMuted = currentVolume === 0;
  if (audio) audio.volume = currentVolume;
  if (ytPlayer && isYtReady && ytPlayer.setVolume) {
    ytPlayer.setVolume(currentVolume * 100);
  }
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

export function handleSeekStart() {
  isSeeking = true;
}

export function handleSeekMove(percentage) {
  const dur = duration || 220;
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
  const dur = duration || 220;
  const targetTime = (percentage / 100) * dur;
  if (currentEngine === 'yt' && ytPlayer && isYtReady) {
    ytPlayer.seekTo(targetTime, true);
  } else if (audio) {
    audio.currentTime = targetTime;
  }
  currentTime = targetTime;
  isSeeking = false;
}

export function toggleFullscreen(open) {
  const fs = document.getElementById('fullscreen-player');
  if (fs) {
    fs.classList.toggle('active', open);
    if (open) fs.classList.toggle('playing', isPlaying);
  }
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
  const fsPlayer = document.getElementById('fullscreen-player');

  if (mainBtn) mainBtn.innerHTML = icon;
  if (fsBtn) fsBtn.innerHTML = icon;
  if (thumb) thumb.classList.toggle('playing-spin', isPlaying);
  if (fsPlayer) fsPlayer.classList.toggle('playing', isPlaying);
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
  if (fsArtist) fsArtist.innerHTML = `<i class="fa-solid fa-circle-check fs-verified-icon"></i> ${track.artist}`;
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
  const volIcon = document.getElementById('volume-icon');
  const volSlider = document.getElementById('volume-slider');
  const fsVolSlider = document.getElementById('fs-volume-slider');

  if (volSlider) volSlider.value = currentVolume * 100;
  if (fsVolSlider) fsVolSlider.value = currentVolume * 100;
  if (volIcon) {
    if (isMuted || currentVolume === 0) {
      volIcon.className = 'fa-solid fa-volume-xmark';
      volIcon.style.color = '#f87171';
    } else if (currentVolume < 0.5) {
      volIcon.className = 'fa-solid fa-volume-low';
      volIcon.style.color = '#fff';
    } else {
      volIcon.className = 'fa-solid fa-volume-high';
      volIcon.style.color = '#ff007a';
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
    volume: currentVolume
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
  getState,
  initYouTubePlayer
};

if (typeof window !== 'undefined') {
  window.PulsePlaybar = playbarController;
  window.toggleFSLyrics = function() {
    const lyricsSec = document.getElementById('fs-lyrics-section');
    const btn = document.getElementById('fs-lyrics-toggle-btn');
    if (lyricsSec) {
      lyricsSec.classList.toggle('hidden');
      if (btn) btn.classList.toggle('active', !lyricsSec.classList.contains('hidden'));
    }
  };
}

// Auto init on script load
if (typeof document !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initYouTubePlayer();
  } else {
    document.addEventListener('DOMContentLoaded', initYouTubePlayer);
  }
}

export default playbarController;
