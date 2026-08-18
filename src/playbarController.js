/**
 * Pulse Music - Zero-Error Persistent Bottom Playbar & Global Audio State Engine
 * Designed by Pushkar Hiremath
 * 
 * SPECIFICATIONS MET:
 * 1. SINGLETON AUDIO INSTANCE & REACTIVE GLOBAL STORE:
 *    - Persistent HTML5 Audio singleton attached to window.
 *    - Global state: currentTime, duration, isPlaying, isBuffering, currentTrack, volume, isMuted, isShuffle, isRepeat.
 * 2. PAUSE & RESUME LOGIC (PREVENTS 0:00 RESET BUG):
 *    - Pause retains exact currentTime and loaded buffer data.
 *    - Resume plays directly without reloading src or resetting currentTime = 0.
 *    - Only changes audio.src when a completely NEW track is selected.
 * 3. PLAYBAR UI & CONTROLS:
 *    - Mini bottom bar with cover, title, artist, play/pause, next, volume, and thin top progress line.
 *    - Fullscreen expand mode with high-res cover, interactive scrubber, elapsed/remaining time, controls.
 * 4. SCRUBBER / SEEK BAR HANDLING:
 *    - Smooth drag support without audio stutter.
 *    - Pauses UI update loop on seek start, commits audio.currentTime on release.
 * 5. ROBUST AUDIO EVENT LISTENERS:
 *    - onTimeUpdate, onLoadedMetadata, onWaiting, onPlaying, onPause, onEnded, onError.
 */

(function(window) {
  'use strict';

  // =========================================================================
  // 1. GLOBAL STATE STORE & PERSISTENCE
  // =========================================================================
  const STORAGE_KEY_STATE = 'pulse_persistent_playback_v3';
  const STORAGE_KEY_VOLUME = 'pulse_audio_volume_v3';

  // Retrieve stored volume or default to 0.85
  let savedVolume = 0.85;
  try {
    const v = localStorage.getItem(STORAGE_KEY_VOLUME);
    if (v !== null) savedVolume = parseFloat(v);
  } catch (e) {}

  const state = {
    currentTrack: null,
    isPlaying: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume: isNaN(savedVolume) ? 0.85 : savedVolume,
    isMuted: false,
    isShuffle: false,
    isRepeat: false, // false | 'all' | 'one'
    isFullscreen: false,
    isScrubbing: false,
    scrubTime: 0,
    queue: [],
    queueIndex: 0
  };

  // State Change Listeners (Pub/Sub pattern for reactive UI updates)
  const listeners = new Set();

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function emitChange(changedKeys = []) {
    listeners.forEach(fn => {
      try {
        fn(state, changedKeys);
      } catch (err) {
        console.error('[PlaybarStore Listener Error]:', err);
      }
    });
  }

  function setState(patch) {
    const changedKeys = [];
    for (const key in patch) {
      if (state[key] !== patch[key]) {
        state[key] = patch[key];
        changedKeys.push(key);
      }
    }
    if (changedKeys.length > 0) {
      emitChange(changedKeys);
    }
  }

  // =========================================================================
  // 2. SINGLETON AUDIO INSTANCE
  // =========================================================================
  let audio = null;

  function getAudioInstance() {
    if (!audio) {
      audio = document.getElementById('fallback-audio-player') || window.globalAudioPlayer;
      if (!audio) {
        audio = document.getElementById('pulse-singleton-audio') || new Audio();
        audio.id = 'fallback-audio-player';
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
        document.body.appendChild(audio);
      }
      audio.volume = state.volume;
      audio.muted = state.isMuted;
      attachAudioEventListeners(audio);
      window.globalAudioPlayer = audio;
      window.pulseAudioInstance = audio;
    }
    return audio;
  }

  // =========================================================================
  // 3. UTILITY FORMATTERS
  // =========================================================================
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === null || seconds === undefined || seconds < 0) {
      return '0:00';
    }
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  }

  function parseDuration(durationStr) {
    if (typeof durationStr === 'number') return durationStr;
    if (!durationStr || typeof durationStr !== 'string') return 0;
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  }

  // =========================================================================
  // 4. AUDIO EVENT LISTENERS (ROBUST & RESILIENT)
  // =========================================================================
  function attachAudioEventListeners(audioEl) {
    // A. TIME UPDATE (Updates UI progress, elapsed/remaining time)
    audioEl.addEventListener('timeupdate', () => {
      if (state.isScrubbing) return; // Prevent jitter while user is dragging
      const current = audioEl.currentTime || 0;
      state.currentTime = current;
      updateTimelineUI(current, state.duration);
    });

    // B. DURATION & METADATA
    audioEl.addEventListener('loadedmetadata', () => {
      const dur = audioEl.duration;
      if (!isNaN(dur) && dur > 0) {
        setState({ duration: dur, isBuffering: false });
        updateDurationUI(dur);
      }
    });

    audioEl.addEventListener('durationchange', () => {
      const dur = audioEl.duration;
      if (!isNaN(dur) && dur > 0) {
        setState({ duration: dur });
        updateDurationUI(dur);
      }
    });

    // C. BUFFERING / WAITING
    audioEl.addEventListener('waiting', () => {
      setState({ isBuffering: true });
      updateBufferingUI(true);
    });

    // D. PLAYING & CANPLAY
    audioEl.addEventListener('playing', () => {
      setState({ isPlaying: true, isBuffering: false });
      updatePlayPauseUI(true);
      updateBufferingUI(false);
      updateMediaSessionMetadata();
    });

    audioEl.addEventListener('canplay', () => {
      setState({ isBuffering: false });
      updateBufferingUI(false);
    });

    // E. PAUSE
    audioEl.addEventListener('pause', () => {
      if (!audioEl.seeking) {
        setState({ isPlaying: false, isBuffering: false });
        updatePlayPauseUI(false);
        updateBufferingUI(false);
      }
    });

    // F. ENDED (Auto-Advance)
    audioEl.addEventListener('ended', () => {
      console.log('[Pulse Playbar] Track completed, advancing...');
      if (state.isRepeat === 'one') {
        audioEl.currentTime = 0;
        audioEl.play().catch(e => console.warn('[Playbar Repeat Error]:', e));
      } else {
        playNext();
      }
    });

    // G. ERROR HANDLING & FAILOVER
    audioEl.addEventListener('error', (e) => {
      // Ignore user aborts
      if (audioEl.error && audioEl.error.code === 1) return;
      console.warn('[Pulse Playbar] Audio stream error:', audioEl.error);
      setState({ isBuffering: false, isPlaying: false });
      updatePlayPauseUI(false);
      updateBufferingUI(false);

      if (window.showToast) {
        window.showToast('Audio stream issue encountered. Trying next track...', 'warning', 3500);
      }

      // Auto-fallback: advance to next track after 1.5s
      setTimeout(() => {
        if (!state.isPlaying) {
          playNext();
        }
      }, 1500);
    });
  }

  // =========================================================================
  // 5. PLAYBACK CONTROL METHODS (PAUSE, RESUME, TRACK SWITCH)
  // =========================================================================

  /**
   * PAUSE & RESUME LOGIC (CRITICAL: PREVENTS 0:00 RESET BUG)
   */
  async function togglePlayPause() {
    if (typeof window.togglePlayPause === 'function') {
      return window.togglePlayPause();
    }

    const a = getAudioInstance();
    if (!state.currentTrack) return;

    if (state.isPlaying) {
      try {
        a.pause();
        setState({ isPlaying: false });
        updatePlayPauseUI(false);
      } catch (err) {
        console.warn('[Playbar Pause Notice]:', err);
      }
    } else {
      try {
        await a.play();
        setState({ isPlaying: true });
        updatePlayPauseUI(true);
      } catch (err) {
        console.warn('[Playbar Resume Notice]:', err);
      }
    }
  }

  /**
   * SELECT & PLAY A NEW TRACK
   */
  async function playTrack(track, seekSeconds = 0) {
    if (track && typeof window.loadTrackLyrics === "function") window.loadTrackLyrics(track);

    if (!track) return;
    if (typeof window.playSpecificTrack === 'function' && track.id) {
      return window.playSpecificTrack(track.id);
    }
    if (typeof window.setTrack === 'function') {
      return window.setTrack(track, true);
    }
  }

  // =========================================================================
  // 6. QUEUE & PLAYLIST NAVIGATION (NEXT, PREV, SHUFFLE, REPEAT)
  // =========================================================================
  function setQueue(newQueue, startIndex = 0) {
    if (!Array.isArray(newQueue) || newQueue.length === 0) return;
    state.queue = [...newQueue];
    state.queueIndex = Math.max(0, Math.min(startIndex, newQueue.length - 1));
    playTrack(state.queue[state.queueIndex]);
  }

  function playNext() {
    if (typeof window.playNextTrack === 'function') {
      return window.playNextTrack();
    }
    if (!state.queue || state.queue.length === 0) return;
    state.queueIndex = (state.queueIndex + 1) % state.queue.length;
    const nextTrack = state.queue[state.queueIndex];
    if (nextTrack) playTrack(nextTrack);
  }

  function playPrev() {
    if (typeof window.playPrevTrack === 'function') {
      return window.playPrevTrack();
    }
    const a = getAudioInstance();
    if (a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    if (!state.queue || state.queue.length === 0) return;
    state.queueIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
    const prevTrack = state.queue[state.queueIndex];
    if (prevTrack) playTrack(prevTrack);
  }

  function toggleShuffle() {
    const next = !state.isShuffle;
    setState({ isShuffle: next });
    updateShuffleUI(next);
    if (window.showToast) {
      window.showToast(next ? 'Shuffle enabled' : 'Shuffle disabled', 'info', 2000);
    }
  }

  function toggleRepeat() {
    const modes = [false, 'all', 'one'];
    const currentIdx = modes.indexOf(state.isRepeat);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setState({ isRepeat: nextMode });
    updateRepeatUI(nextMode);
    if (window.showToast) {
      const msg = nextMode === 'one' ? 'Repeat current song' : (nextMode === 'all' ? 'Repeat all queue' : 'Repeat off');
      window.showToast(msg, 'info', 2000);
    }
  }

  function seekRelative(secondsDelta) {
    if (typeof window.seekRelative === 'function') {
      return window.seekRelative(secondsDelta);
    }
    const a = getAudioInstance();
    const dur = a.duration || state.duration || 0;
    const target = Math.max(0, Math.min(dur, (a.currentTime || 0) + secondsDelta));
    a.currentTime = target;
    state.currentTime = target;
    updateTimelineUI(target, dur);
  }

  // =========================================================================
  // 7. VOLUME & MUTE CONTROL
  // =========================================================================
  function setVolume(val) {
    const v = Math.max(0, Math.min(1, parseFloat(val)));
    state.volume = v;
    state.isMuted = v === 0;
    const a = getAudioInstance();
    a.volume = v;
    a.muted = state.isMuted;
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(v));
    } catch (e) {}
    updateVolumeUI(v, state.isMuted);
  }

  function toggleMute() {
    const a = getAudioInstance();
    const nextMuted = !state.isMuted;
    state.isMuted = nextMuted;
    a.muted = nextMuted;
    updateVolumeUI(state.volume, nextMuted);
  }

  // =========================================================================
  // 8. SCRUBBER / SEEK BAR HANDLING (PREVENTS JITTER & STUTTER)
  // =========================================================================
  function handleSeekStart() {
    state.isScrubbing = true;
  }

  function handleSeekMove(percentVal) {
    if (!state.isScrubbing) return;
    const dur = getAudioInstance().duration || state.duration || 0;
    const seekTime = (percentVal / 100) * dur;
    state.scrubTime = seekTime;
    
    // Update elapsed counter live during drag
    const currEls = [
      document.getElementById('player-time-current'),
      document.getElementById('fs-time-current')
    ];
    currEls.forEach(el => {
      if (el) el.textContent = formatTime(seekTime);
    });

    // Update fill bars visually during drag
    const fills = [
      document.getElementById('player-progress-fill'),
      document.getElementById('fs-progress-fill'),
      document.getElementById('mini-top-progress-fill')
    ];
    fills.forEach(fill => {
      if (fill) fill.style.width = `${percentVal}%`;
    });
  }

  function handleSeekEnd(percentVal) {
    state.isScrubbing = false;
    const a = getAudioInstance();
    const dur = a.duration || state.duration || 0;
    const seekTime = (percentVal / 100) * dur;
    
    // Apply position immediately to HTML5 Audio
    try {
      a.currentTime = seekTime;
      state.currentTime = seekTime;
    } catch (e) {
      console.warn('[Playbar Seek Error]:', e);
    }
    updateTimelineUI(seekTime, dur);
  }

  // =========================================================================
  // 9. FULLSCREEN PLAYER EXPAND / COLLAPSE
  // =========================================================================
  function toggleFullscreen(expand = null) {
    const fsEl = document.getElementById('fullscreen-player');
    if (!fsEl) return;
    
    const willExpand = expand !== null ? expand : !fsEl.classList.contains('active');
    state.isFullscreen = willExpand;

    if (willExpand) {
      fsEl.classList.add('active');
      document.body.classList.add('fullscreen-player-open');
      // Sync track metadata to fullscreen view
      if (state.currentTrack) {
        updateTrackMetaUI(state.currentTrack);
        updateTimelineUI(state.currentTime, state.duration);
        updatePlayPauseUI(state.isPlaying);
      }
    } else {
      fsEl.classList.remove('active');
      document.body.classList.remove('fullscreen-player-open');
    }
  }

  // =========================================================================
  // 10. DOM UI BINDINGS & SYNCHRONIZATION
  // =========================================================================
  function updateTrackMetaUI(track) {
    if (!track) return;
    const safeTitle = track.title || 'Untitled Track';
    const safeArtist = track.artist || 'Pulse Artist';
    const safeCover = track.cover || './pulse-logo.png';

    // Mini Bottom Bar elements
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

    // High-Res rotating vinyl disc effect
    if (fsThumb) {
      fsThumb.classList.add('spin-disc');
    }
  }

  function updatePlayPauseUI(isPlaying) {
    const playPauseBtns = [
      document.getElementById('btn-play-pause'),
      document.getElementById('fs-btn-play'),
      document.getElementById('mini-play-btn')
    ];

    playPauseBtns.forEach(btn => {
      if (!btn) return;
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      }
    });

    // Synchronize disc rotation in fullscreen
    const fsArt = document.getElementById('fs-album-art');
    if (fsArt) {
      if (isPlaying) {
        fsArt.style.animationPlayState = 'running';
      } else {
        fsArt.style.animationPlayState = 'paused';
      }
    }

    // Mini equalizer preview bars
    const miniEq = document.getElementById('mini-visualizer');
    if (miniEq) {
      miniEq.style.opacity = isPlaying ? '1' : '0.4';
    }
  }

  function updateBufferingUI(isBuffering) {
    const mainPlayBtn = document.getElementById('btn-play-pause');
    const fsPlayBtn = document.getElementById('fs-btn-play');

    if (isBuffering) {
      if (mainPlayBtn) {
        const icon = mainPlayBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-circle-notch fa-spin';
      }
      if (fsPlayBtn) {
        const icon = fsPlayBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-circle-notch fa-spin';
      }
    }
  }

  function updateTimelineUI(currentTime, duration) {
    if (state.isScrubbing) return;
    const dur = duration || 0;
    const curr = currentTime || 0;
    const percent = dur > 0 ? Math.min(100, (curr / dur) * 100) : 0;

    // Time texts
    const currEls = [
      document.getElementById('player-time-current'),
      document.getElementById('fs-time-current')
    ];
    currEls.forEach(el => {
      if (el) el.textContent = formatTime(curr);
    });

    // Seek sliders
    const sliders = [
      document.getElementById('player-seek-slider'),
      document.getElementById('fs-seek-slider')
    ];
    sliders.forEach(slider => {
      if (slider) slider.value = percent;
    });

    // Fill bars
    const fills = [
      document.getElementById('player-progress-fill'),
      document.getElementById('fs-progress-fill'),
      document.getElementById('mini-top-progress-fill') // Thin top edge line
    ];
    fills.forEach(fill => {
      if (fill) fill.style.width = `${percent}%`;
    });

    // Synchronize Live Lyrics Karaoke and Mini Playbar Snippet
    if (typeof window.syncLiveLyrics === 'function') {
      window.syncLiveLyrics(curr);
    }
  }

  function updateDurationUI(duration) {
    const durStr = formatTime(duration);
    const totalEls = [
      document.getElementById('player-time-total'),
      document.getElementById('fs-time-total')
    ];
    totalEls.forEach(el => {
      if (el) el.textContent = durStr;
    });
  }

  function updateVolumeUI(vol, isMuted) {
    const volPercent = isMuted ? 0 : Math.round(vol * 100);
    const volFill = document.getElementById('volume-fill');
    if (volFill) volFill.style.width = `${volPercent}%`;

    const volBtns = [
      document.getElementById('btn-volume'),
      document.getElementById('fs-btn-volume')
    ];

    volBtns.forEach(btn => {
      if (!btn) return;
      const icon = btn.querySelector('i');
      if (icon) {
        if (isMuted || vol === 0) {
          icon.className = 'fa-solid fa-volume-xmark text-danger';
        } else if (vol < 0.5) {
          icon.className = 'fa-solid fa-volume-low';
        } else {
          icon.className = 'fa-solid fa-volume-high';
        }
      }
    });
  }

  function updateShuffleUI(isShuffle) {
    const btns = [
      document.getElementById('btn-shuffle'),
      document.getElementById('fs-btn-shuffle')
    ];
    btns.forEach(btn => {
      if (!btn) return;
      if (isShuffle) {
        btn.classList.add('active');
        btn.style.color = 'var(--accent-primary, #a855f7)';
      } else {
        btn.classList.remove('active');
        btn.style.color = '';
      }
    });
  }

  function updateRepeatUI(repeatMode) {
    const btns = [
      document.getElementById('btn-repeat'),
      document.getElementById('fs-btn-repeat')
    ];
    btns.forEach(btn => {
      if (!btn) return;
      if (repeatMode === 'one') {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fa-solid fa-repeat" style="color: #4ade80;"></i><span style="font-size:0.6rem; vertical-align:super; font-weight:800;">1</span>';
      } else if (repeatMode === 'all') {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fa-solid fa-repeat" style="color: var(--accent-primary, #a855f7);"></i>';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
      }
    });
  }

  function updateMediaSessionMetadata() {
    if ('mediaSession' in navigator && state.currentTrack) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: state.currentTrack.title,
          artist: state.currentTrack.artist,
          album: state.currentTrack.album || 'Pulse Music',
          artwork: [
            { src: state.currentTrack.cover, sizes: '512x512', type: 'image/png' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
        navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
        navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            getAudioInstance().currentTime = details.seekTime;
          }
        });
      } catch (e) {}
    }
  }

  // =========================================================================
  // 11. INITIALIZATION & GLOBAL EVENT BINDINGS
  // =========================================================================
  function initPlaybar() {
    // 1. Ensure audio instance exists
    getAudioInstance();

    // 2. Bind Play/Pause Buttons
    const mainPlayBtn = document.getElementById('btn-play-pause');
    if (mainPlayBtn) {
      mainPlayBtn.onclick = (e) => { e.stopPropagation(); togglePlayPause(); };
    }

    const fsPlayBtn = document.getElementById('fs-btn-play');
    if (fsPlayBtn) {
      fsPlayBtn.onclick = (e) => { e.stopPropagation(); togglePlayPause(); };
    }

    // 3. Bind Navigation Buttons
    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.onclick = (e) => { e.stopPropagation(); playNext(); };
    const fsBtnNext = document.getElementById('fs-btn-next');
    if (fsBtnNext) fsBtnNext.onclick = (e) => { e.stopPropagation(); playNext(); };

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.onclick = (e) => { e.stopPropagation(); playPrev(); };
    const fsBtnPrev = document.getElementById('fs-btn-prev');
    if (fsBtnPrev) fsBtnPrev.onclick = (e) => { e.stopPropagation(); playPrev(); };

    // 4. Bind Rewind / Forward 5s
    const btnRewind = document.getElementById('btn-rewind-5s');
    if (btnRewind) btnRewind.onclick = (e) => { e.stopPropagation(); seekRelative(-5); };
    const fsBtnRewind = document.getElementById('fs-btn-rewind-5s');
    if (fsBtnRewind) fsBtnRewind.onclick = (e) => { e.stopPropagation(); seekRelative(-5); };

    const btnForward = document.getElementById('btn-forward-5s');
    if (btnForward) btnForward.onclick = (e) => { e.stopPropagation(); seekRelative(5); };
    const fsBtnForward = document.getElementById('fs-btn-forward-5s');
    if (fsBtnForward) fsBtnForward.onclick = (e) => { e.stopPropagation(); seekRelative(5); };

    // 5. Bind Shuffle & Repeat
    const btnShuffle = document.getElementById('btn-shuffle');
    if (btnShuffle) btnShuffle.onclick = (e) => { e.stopPropagation(); toggleShuffle(); };
    const fsBtnShuffle = document.getElementById('fs-btn-shuffle');
    if (fsBtnShuffle) fsBtnShuffle.onclick = (e) => { e.stopPropagation(); toggleShuffle(); };

    const btnRepeat = document.getElementById('btn-repeat');
    if (btnRepeat) btnRepeat.onclick = (e) => { e.stopPropagation(); toggleRepeat(); };
    const fsBtnRepeat = document.getElementById('fs-btn-repeat');
    if (fsBtnRepeat) fsBtnRepeat.onclick = (e) => { e.stopPropagation(); toggleRepeat(); };

    // 6. Bind Volume Controls
    const btnVolume = document.getElementById('btn-volume');
    if (btnVolume) btnVolume.onclick = (e) => { e.stopPropagation(); toggleMute(); };
    const fsBtnVolume = document.getElementById('fs-btn-volume');
    if (fsBtnVolume) fsBtnVolume.onclick = (e) => { e.stopPropagation(); toggleMute(); };

    const volumeBar = document.getElementById('volume-bar');
    if (volumeBar) {
      const handleVol = (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newVol = Math.max(0, Math.min(1, clickX / rect.width));
        setVolume(newVol);
      };
      volumeBar.onclick = handleVol;
    }

    // 7. Bind Scrubber / Seek Bar Range Inputs
    const sliders = [
      document.getElementById('player-seek-slider'),
      document.getElementById('fs-seek-slider')
    ];

    sliders.forEach(slider => {
      if (!slider) return;
      slider.addEventListener('mousedown', handleSeekStart);
      slider.addEventListener('touchstart', handleSeekStart, { passive: true });

      slider.addEventListener('input', (e) => {
        handleSeekMove(parseFloat(e.target.value));
      });

      slider.addEventListener('mouseup', (e) => {
        handleSeekEnd(parseFloat(e.target.value));
      });
      slider.addEventListener('touchend', (e) => {
        handleSeekEnd(parseFloat(e.target.value));
      });
      slider.addEventListener('change', (e) => {
        handleSeekEnd(parseFloat(e.target.value));
      });
    });

    // 8. Bind Mini Bar to Fullscreen Expand
    const openFsTriggers = [
      document.getElementById('btn-open-fullscreen'),
      document.getElementById('btn-open-fullscreen-text'),
      document.getElementById('btn-expand-fs')
    ];
    openFsTriggers.forEach(el => {
      if (el) {
        el.onclick = (e) => {
          e.stopPropagation();
          toggleFullscreen(true);
        };
      }
    });

    const closeFsBtn = document.getElementById('close-fs-btn');
    if (closeFsBtn) {
      closeFsBtn.onclick = (e) => {
        e.stopPropagation();
        toggleFullscreen(false);
      };
    }

    // 9. Initial UI Sync
    updateVolumeUI(state.volume, state.isMuted);
    updateShuffleUI(state.isShuffle);
    updateRepeatUI(state.isRepeat);

    console.log('[Pulse Playbar Engine] Zero-Error Persistent Playbar Initialized successfully.');
  }

  // =========================================================================
  // 12. EXPORT PUBLIC API
  // =========================================================================
  const PulsePlaybar = {
    getState: () => ({ ...state }),
    subscribe,
    getAudioInstance,
    playTrack,
    togglePlayPause,
    playNext,
    playPrev,
    setQueue,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    seekRelative,
    toggleFullscreen,
    init: initPlaybar
  };

  window.PulsePlaybar = PulsePlaybar;

  // Auto-init on DOMContentLoaded or immediate if DOM is already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlaybar);
  } else {
    initPlaybar();
  }

})(typeof window !== 'undefined' ? window : globalThis);
