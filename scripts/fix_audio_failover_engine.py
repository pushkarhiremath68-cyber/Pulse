import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN_JS_PATH = os.path.join(ROOT, 'src', 'main.js')

with open(MAIN_JS_PATH, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Replace startPlayback and playTrackOnYouTubePlayer with robust failover
old_start_playback_pattern = re.compile(
    r'/\*\*\s*\*\s*Primary Full-Length Audio Playback Engine.*?'
    r'function updateProgressTimeline\(\)\s*\{',
    re.DOTALL
)

new_playback_engine_code = """/**
   * Primary Full-Length Audio Playback Engine
   * Seamless multi-tier streaming powered by Local Storage Master Audio, JioSaavn CDN & YouTube Audio Engine
   */
  async function startPlayback(track, initialSeekTime = null) {
    if (!track) return;

    // Increment session ID to cancel any in-flight playback promises or fallbacks
    const sessionId = ++_currentPlaybackSessionId;

    // 1. STOP ALL EXISTING AUDIO FIRST — strictly prevents double playback
    stopAllAudio();

    const seekTarget = (initialSeekTime !== null && initialSeekTime !== undefined) ? initialSeekTime : 0;
    state.currentTime = seekTarget;
    state.isPlaying = true;
    updatePlayPauseUI();

    const title = track.title || track.name || 'Unknown Track';
    const artist = track.artist || 'Unknown Artist';

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

    showBuffering(true);
    console.log(`[Pulse Audio #${sessionId}] Starting playback for: "${title}" by ${artist}`);

    // Resolve candidates list from musicService
    let candidates = [];
    if (window.musicService && typeof window.musicService.getAudioCandidates === 'function') {
      try {
        candidates = await window.musicService.getAudioCandidates(track);
      } catch (e) {
        console.warn(`[Pulse Audio #${sessionId}] Candidates resolution notice:`, e);
      }
    }

    if (!candidates || candidates.length === 0) {
      const cleanStorage = String(track.storagePath || `${track.id || 'track'}.mp4`).replace(/^\\/+/, '');
      candidates = [
        { url: `./storage/music/${cleanStorage}`, label: 'local-storage' },
        { url: `/storage/music/${cleanStorage}`, label: 'local-abs' }
      ];
    }

    if (sessionId !== _currentPlaybackSessionId) return; // Stale session

    _activeAudioCandidates = candidates;
    _activeCandidateIndex = 0;

    function attemptHtml5Candidate(url, timeoutMs = 1800) {
      return new Promise((resolve, reject) => {
        if (sessionId !== _currentPlaybackSessionId) {
          reject(new Error('Stale session'));
          return;
        }

        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            cleanup();
            reject(new Error(`Timeout loading source (${timeoutMs}ms)`));
          }
        }, timeoutMs);

        function onPlaying() {
          if (!settled) {
            settled = true;
            cleanup();
            resolve(true);
          }
        }

        function onError(err) {
          if (!settled) {
            settled = true;
            cleanup();
            reject(err || new Error('HTML5 audio error event'));
          }
        }

        function cleanup() {
          clearTimeout(timer);
          fallbackAudio.removeEventListener('playing', onPlaying);
          fallbackAudio.removeEventListener('canplay', onPlaying);
          fallbackAudio.removeEventListener('error', onError);
        }

        fallbackAudio.addEventListener('playing', onPlaying);
        fallbackAudio.addEventListener('canplay', onPlaying);
        fallbackAudio.addEventListener('error', onError);

        fallbackAudio.src = url;
        fallbackAudio.volume = state.volume !== undefined ? state.volume : 1;
        fallbackAudio.muted = state.isMuted || false;
        if (seekTarget > 0) {
          try { fallbackAudio.currentTime = seekTarget; } catch (e) {}
        }

        const playPromise = fallbackAudio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(err => {
            onError(err);
          });
        }
      });
    }

    async function tryNextCandidate() {
      if (sessionId !== _currentPlaybackSessionId) return false;

      while (_activeCandidateIndex < _activeAudioCandidates.length) {
        const item = _activeAudioCandidates[_activeCandidateIndex++];
        const url = item.url;
        console.log(`[Pulse Audio #${sessionId}] Testing source [${item.label}]:`, url);

        state.playbackSource = 'html5';

        try {
          await attemptHtml5Candidate(url, 1800);
          if (sessionId !== _currentPlaybackSessionId) {
            fallbackAudio.pause();
            return false;
          }
          showBuffering(false);
          state.isPlaying = true;
          updatePlayPauseUI();
          updateMediaSession(track);
          requestAudioWakeLock();
          enableBackgroundKeepAlive();
          if (canvasVisualizer) canvasVisualizer.start();
          if (progressInterval) clearInterval(progressInterval);
          progressInterval = setInterval(updateProgressTimeline, 400);
          console.log(`[Pulse Audio #${sessionId}] Successfully started HTML5 playback via [${item.label}]`);
          return true;
        } catch (err) {
          console.warn(`[Pulse Audio #${sessionId}] Source [${item.label}] failed (${err.message}). Trying next...`);
        }
      }

      // If all HTML5 sources failed, instantly fall back to YouTube engine without hanging
      const exactTarget = track.ytId || getYouTubeIdForTrack(track) || `${title} ${artist}`;
      console.log(`[Pulse Audio #${sessionId}] HTML5 sources exhausted, falling back to YouTube engine:`, exactTarget);
      await playTrackOnYouTubePlayer(exactTarget, true, sessionId);
      updateMediaSession(track);
      requestAudioWakeLock();
      enableBackgroundKeepAlive();
      return false;
    }

    _tryNextCandidateRef = tryNextCandidate;
    await tryNextCandidate();
  }

  /* ==========================================================================
     YOUTUBE AUDIO STREAMING ENGINE (Static Web Hosting & Native Fallback)
     ========================================================================== */
  async function playTrackOnYouTubePlayer(videoIdOrQuery, autoPlay = true, parentSessionId = null) {
    if (!videoIdOrQuery) return;
    const currentSession = parentSessionId || _currentPlaybackSessionId;
    if (parentSessionId && parentSessionId !== _currentPlaybackSessionId) return; // Stale

    console.log(`[Pulse Audio #${currentSession}] Initiating YouTube Player playback for target:`, videoIdOrQuery);
    state.playbackSource = 'youtube';
    showBuffering(false); // Immediately dismiss spinner

    // Stop HTML5 audio completely to prevent double playback
    if (fallbackAudio) {
      try {
        fallbackAudio.pause();
        fallbackAudio.currentTime = 0;
        fallbackAudio.removeAttribute('src');
      } catch (e) {}
    }

    let isVideoId = typeof videoIdOrQuery === 'string' && videoIdOrQuery.length === 11 && !videoIdOrQuery.includes(' ');
    let targetId = isVideoId ? videoIdOrQuery : null;

    // Check catalog or map first
    if (!targetId && state.currentTrack) {
      targetId = state.currentTrack.ytId || getYouTubeIdForTrack(state.currentTrack);
      if (targetId) isVideoId = true;
    }

    // If query, resolve with quick timeout
    if (!targetId) {
      try {
        targetId = await Promise.race([
          resolveYouTubeVideoId(videoIdOrQuery),
          new Promise(res => setTimeout(() => res(null), 1200))
        ]);
        if (targetId) isVideoId = true;
      } catch (e) {}
    }

    if (parentSessionId && parentSessionId !== _currentPlaybackSessionId) return; // Stale

    const fallbackContainer = document.getElementById('youtube-fallback-container');
    const hiddenContainer = document.getElementById('hidden-youtube-container');
    if (hiddenContainer) {
      hiddenContainer.style.position = 'fixed';
      hiddenContainer.style.bottom = '10px';
      hiddenContainer.style.right = '10px';
      hiddenContainer.style.width = '180px';
      hiddenContainer.style.height = '180px';
      hiddenContainer.style.zIndex = '-1';
      hiddenContainer.style.opacity = '0.01';
      hiddenContainer.style.pointerEvents = 'none';
      hiddenContainer.style.display = 'block';
    }

    // PRIMARY: Control via YouTube IFrame API if exact 11-character video ID is resolved
    if (targetId && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
      if (fallbackContainer) fallbackContainer.innerHTML = '';
      try {
        ytPlayer.loadVideoById(targetId);
        try {
          ytPlayer.unMute();
          ytPlayer.setVolume(Math.max(50, Math.round((state.volume || 1) * 100)));
        } catch(e) {}

        if (autoPlay && typeof ytPlayer.playVideo === 'function') {
          ytPlayer.playVideo();
          state.isPlaying = true;
          updatePlayPauseUI();
        }
        showBuffering(false);

        // Multi-stage interval unmuting
        [100, 300, 600, 1000].forEach((ms) => {
          setTimeout(() => {
            try {
              if (currentSession === _currentPlaybackSessionId && ytPlayer && typeof ytPlayer.unMute === 'function') {
                ytPlayer.unMute();
                ytPlayer.setVolume(Math.max(50, Math.round((state.volume || 1) * 100)));
              }
            } catch(e) {}
          }, ms);
        });
      } catch (e) {
        console.warn('[Pulse YouTube] Direct player load error:', e);
      }
    } else {
      // Dynamic Search-To-Play Embed Player — Guarantees exact song matches without playing stale video
      if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
        try { ytPlayer.stopVideo(); } catch(e) {}
      }

      let embedSrc = '';
      if (targetId) {
        embedSrc = `https://www.youtube-nocookie.com/embed/${targetId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0&iv_load_policy=3&modestbranding=1&controls=0&disablekb=1`;
      } else {
        const queryClean = encodeURIComponent(String(videoIdOrQuery).replace(/[()\\\\[\\\\]{}"'|]/g, ' ').replace(/\\s+/g, ' ').trim());
        embedSrc = `https://www.youtube-nocookie.com/embed?listType=search&list=${queryClean}&autoplay=1&playsinline=1&enablejsapi=1&rel=0&iv_load_policy=3&modestbranding=1&controls=0&disablekb=1`;
      }

      if (fallbackContainer) {
        fallbackContainer.innerHTML = `
          <iframe id="bg-audio-iframe" width="100%" height="100%"
            src="${embedSrc}"
            frameborder="0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
            allowfullscreen
            style="width: 100%; height: 100%; border: none;">
          </iframe>
        `;
      }
      state.isPlaying = true;
      updatePlayPauseUI();
      showBuffering(false);
    }

    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(updateProgressTimeline, 400);
  }
  window.playTrackOnYouTubePlayer = playTrackOnYouTubePlayer;

  function updateProgressTimeline() {"""

if old_start_playback_pattern.search(code):
    code = old_start_playback_pattern.sub(lambda m: new_playback_engine_code, code)
    print("[SUCCESS] Replaced startPlayback and playTrackOnYouTubePlayer with robust failover")
else:
    print("[ERROR] Could not match old startPlayback pattern")

with open(MAIN_JS_PATH, 'w', encoding='utf-8') as f:
    f.write(code)

print("[SUCCESS] Updated src/main.js")
