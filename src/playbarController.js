/**
 * Pulse Music - Zero-Error Persistent Bottom Playbar & Audio State Engine
 * Robust singleton HTML5 Audio player with smooth scrubber dragging and fullscreen expand mode.
 */

(function(root) {
  'use strict';

  // 1. Reactive Global State
  const state = {
    currentTrack: null,
    isPlaying: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume: 0.85,
    isMuted: false,
    isShuffle: false,
    isRepeat: false, // false | 'all' | 'one'
    isFullscreen: false,
    isScrubbing: false,
    queue: [],
    queueIndex: 0
  };

  const listeners = new Set();

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function setState(patch) {
    Object.assign(state, patch);
    listeners.forEach(fn => {
      try { fn(state); } catch (e) { console.error('[Playbar State Listener Error]:', e); }
    });
  }

  // 2. Singleton Audio Instance
  let audioInstance = null;

  function getAudioInstance() {
    if (!audioInstance) {
      audioInstance = document.getElementById('fallback-audio-player');
      if (!audioInstance) {
        audioInstance = new Audio();
        audioInstance.id = 'fallback-audio-player';
        audioInstance.preload = 'auto';
        document.body.appendChild(audioInstance);
      }
      attachAudioListeners(audioInstance);
      window.globalAudioPlayer = audioInstance;
    }
    return audioInstance;
  }

  // Time format helper
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // 3. Audio Event Listeners
  function attachAudioListeners(a) {
    a.addEventListener('timeupdate', () => {
      if (state.isScrubbing) return;
      const cur = a.currentTime || 0;
      const dur = a.duration || state.duration || 0;
      setState({ currentTime: cur });
      updateTimelineUI(cur, dur);

      // Trigger live lyrics sync if active
      if (typeof window.syncLiveLyrics === 'function') {
        window.syncLiveLyrics(cur);
      }
    });

    a.addEventListener('loadedmetadata', () => {
      const dur = a.duration;
      if (!isNaN(dur) && dur > 0) {
        setState({ duration: dur, isBuffering: false });
        updateDurationUI(dur);
      }
    });

    a.addEventListener('playing', () => {
      setState({ isPlaying: true, isBuffering: false });
      updatePlayPauseUI(true);
    });

    a.addEventListener('pause', () => {
      if (!a.seeking) {
        setState({ isPlaying: false, isBuffering: false });
        updatePlayPauseUI(false);
      }
    });

    a.addEventListener('ended', () => {
      if (state.isRepeat === 'one') {
        a.currentTime = 0;
        a.play().catch(e => console.warn(e));
      } else {
        playNext();
      }
    });

    a.addEventListener('error', () => {
      if (a.error && a.error.code === 1) return; // User abort
      console.warn('[Playbar Engine] Audio stream issue, advancing...');
      setState({ isBuffering: false, isPlaying: false });
      updatePlayPauseUI(false);
      setTimeout(() => playNext(), 1500);
    });
  }

  // 4. Play, Pause & Resume Logic (Prevents 0:00 Reset Bug)
  async function togglePlayPause() {
    const a = getAudioInstance();
    if (!state.currentTrack) return;

    if (state.isPlaying) {
      // Pause: retain exact currentTime and buffer
      a.pause();
      setState({ isPlaying: false });
      updatePlayPauseUI(false);
    } else {
      // Resume: directly invoke play() WITHOUT resetting src or currentTime
      try {
        await a.play();
        setState({ isPlaying: true });
        updatePlayPauseUI(true);
      } catch (err) {
        console.warn('[Playbar Resume Notice]:', err);
      }
    }
  }

  async function playTrack(track) {
    if (!track) return;
    const a = getAudioInstance();
    const isSameTrack = state.currentTrack && (state.currentTrack.id === track.id || state.currentTrack.streamUrl === track.streamUrl);

    // If same track and paused, just resume
    if (isSameTrack && a.src === track.streamUrl) {
      return togglePlayPause();
    }

    // New track selected: update state and src
    setState({
      currentTrack: track,
      isPlaying: true,
      isBuffering: true,
      currentTime: 0
    });

    updateTrackMetaUI(track);
    updatePlayPauseUI(true);

    if (track.streamUrl) {
      a.src = track.streamUrl;
      a.load();
      try {
        await a.play();
        setState({ isBuffering: false });
      } catch (e) {
        console.warn('[Playbar Stream Start Error]:', e);
      }
    }

    // Load lyrics if available
    if (typeof window.loadTrackLyrics === 'function') {
      window.loadTrackLyrics(track);
    }
  }

  function playNext() {
    if (!state.queue || state.queue.length === 0) return;
    state.queueIndex = (state.queueIndex + 1) % state.queue.length;
    const next = state.queue[state.queueIndex];
    if (next) playTrack(next);
  }

  function playPrev() {
    const a = getAudioInstance();
    if (a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    if (!state.queue || state.queue.length === 0) return;
    state.queueIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
    const prev = state.queue[state.queueIndex];
    if (prev) playTrack(prev);
  }

  // 5. Scrubber / Slider Drag Handlers (Smooth Without Stutter)
  function handleSeekStart() {
    state.isScrubbing = true;
  }

  function handleSeekMove(percentVal) {
    if (!state.isScrubbing) return;
    const dur = getAudioInstance().duration || state.duration || 0;
    const seekTime = (percentVal / 100) * dur;

    // Update live counter during drag
    const curEls = [document.getElementById('player-time-current'), document.getElementById('fs-time-current')];
    curEls.forEach(el => { if (el) el.textContent = formatTime(seekTime); });

    // Update progress fill lines
    const fills = [document.getElementById('player-progress-fill'), document.getElementById('fs-progress-fill'), document.getElementById('mini-top-progress-fill')];
    fills.forEach(fill => { if (fill) fill.style.width = `${percentVal}%`; });
  }

  function handleSeekEnd(percentVal) {
    state.isScrubbing = false;
    const a = getAudioInstance();
    const dur = a.duration || state.duration || 0;
    const seekTime = (percentVal / 100) * dur;

    try {
      a.currentTime = seekTime;
      state.currentTime = seekTime;
    } catch (e) {}

    updateTimelineUI(seekTime, dur);
  }

  // 6. UI Synchronizers
  function updateTrackMetaUI(track) {
    if (!track) return;
    const safeTitle = track.title || 'Untitled Track';
    const safeArtist = track.artist || 'Pulse Artist';
    const safeCover = track.coverUrl || track.cover || './pulse-logo.png';

    // Mini bar elements
    const thumb = document.getElementById('player-thumb');
    const title = document.getElementById('player-title');
    const artist = document.getElementById('player-artist');
    if (thumb) thumb.src = safeCover;
    if (title) title.textContent = safeTitle;
    if (artist) artist.textContent = safeArtist;

    // Fullscreen elements
    const fsThumb = document.getElementById('fs-album-art');
    const fsTitle = document.getElementById('fs-track-title');
    const fsArtist = document.getElementById('fs-track-artist');
    const fsBg = document.getElementById('fs-bg-blur');
    if (fsThumb) fsThumb.src = safeCover;
    if (fsTitle) fsTitle.textContent = safeTitle;
    if (fsArtist) fsArtist.textContent = safeArtist;
    if (fsBg) fsBg.style.backgroundImage = `url("${safeCover}")`;
  }

  function updatePlayPauseUI(isPlaying) {
    const playBtns = [document.getElementById('btn-play-pause'), document.getElementById('fs-btn-play')];
    playBtns.forEach(btn => {
      if (btn) {
        const icon = btn.querySelector('i') || btn;
        icon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      }
    });
  }

  function updateTimelineUI(current, duration) {
    const pct = duration > 0 ? (current / duration) * 100 : 0;
    const curEls = [document.getElementById('player-time-current'), document.getElementById('fs-time-current')];
    curEls.forEach(el => { if (el) el.textContent = formatTime(current); });

    const fills = [document.getElementById('player-progress-fill'), document.getElementById('fs-progress-fill'), document.getElementById('mini-top-progress-fill')];
    fills.forEach(fill => { if (fill) fill.style.width = `${pct}%`; });

    const sliders = [document.getElementById('player-seek-slider'), document.getElementById('fs-seek-slider')];
    sliders.forEach(s => { if (s && !state.isScrubbing) s.value = pct; });
  }

  function updateDurationUI(duration) {
    const durEls = [document.getElementById('player-time-total'), document.getElementById('fs-time-total')];
    durEls.forEach(el => { if (el) el.textContent = formatTime(duration); });
  }

  function toggleFullscreen(expand = null) {
    const fsEl = document.getElementById('fullscreen-player');
    if (!fsEl) return;
    const willExpand = expand !== null ? expand : !fsEl.classList.contains('active');
    state.isFullscreen = willExpand;
    if (willExpand) {
      fsEl.classList.add('active');
      document.body.classList.add('fullscreen-player-open');
      if (state.currentTrack) updateTrackMetaUI(state.currentTrack);
    } else {
      fsEl.classList.remove('active');
      document.body.classList.remove('fullscreen-player-open');
    }
  }

  // Public API
  const PulsePlaybar = {
    getState: () => ({ ...state }),
    subscribe,
    getAudioInstance,
    playTrack,
    togglePlayPause,
    playNext,
    playPrev,
    handleSeekStart,
    handleSeekMove,
    handleSeekEnd,
    toggleFullscreen,
    formatTime
  };

  root.PulsePlaybar = PulsePlaybar;
  root.playbarController = PulsePlaybar;

})(typeof window !== 'undefined' ? window : globalThis);
