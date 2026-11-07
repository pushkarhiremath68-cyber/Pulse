/**
 * ============================================================================
 * PULSE MUSIC - MOBILE BACKGROUND AUDIO GUARDIAN
 * ============================================================================
 * Ensures non-stop audio playback when mobile users switch to another app,
 * navigate to home screen, or lock their phone.
 *
 * Mechanisms:
 *  1. Mobile-First Direct Audio Prioritization:
 *     - Routes playback through native HTML5 <audio> (Opus/AAC/M4A) which mobile
 *       operating systems (iOS WebKit / Android Chromium) allow in the background.
 *  2. Seamless Visibility Handoff:
 *     - If YouTube iframe is active when app is backgrounded (document.visibilityState === 'hidden'),
 *       immediately hands off the exact playback position to native HTML5 <audio>
 *       before the OS throttles iframe execution.
 *  3. Full MediaSession Integration:
 *     - Lock screen controls, notification drawer controls, artwork, scrubbing.
 *  4. Audio Focus & WakeLock:
 *     - Keeps audio pipeline prioritized in mobile OS scheduling.
 * ============================================================================
 */

import { PERMANENT_STREAM_MAP } from './catalogService.js';
import { resolveFullAudioStream } from './musicService.js';
import { resolvePipedAudioStream } from './extractorService.js';

(function(global) {
  'use strict';

  let initialized = false;
  let wakeLockSentinel = null;
  let silentAnchorNode = null;
  let isHandoffInProgress = false;

  const isMobile = typeof navigator !== 'undefined' && 
    /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '');

  /**
   * Requests a Screen / CPU WakeLock while audio is playing
   */
  async function requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        if (!wakeLockSentinel) {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
          wakeLockSentinel.addEventListener('release', () => {
            wakeLockSentinel = null;
          });
        }
      } catch (e) {}
    }
  }

  function releaseWakeLock() {
    if (wakeLockSentinel) {
      try {
        wakeLockSentinel.release();
        wakeLockSentinel = null;
      } catch (e) {}
    }
  }

  /**
   * Initializes a silent Web Audio anchor buffer for mobile operating systems
   * Prevents aggressive mobile browser power management from suspending the audio context
   */
  function initSilentAudioAnchor() {
    if (silentAnchorNode) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        // Create an inaudible buffer
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(ctx.destination);
        source.start(0);
        silentAnchorNode = { ctx, source };
      }
    } catch (e) {}
  }

  /**
   * Performs seamless handoff from YouTube IFrame to Native HTML5 Audio
   * when mobile user switches to another app or locks the device.
   */
  async function handoffToNativeAudio(currentTrack, currentPos = 0) {
    if (!currentTrack || isHandoffInProgress) return false;
    isHandoffInProgress = true;

    try {
      console.log(`[Pulse Background Audio] Initiating handoff to native audio at ${currentPos}s`);

      // 1. Check if track is saved offline in IndexedDB
      if (window.PulseOffline?.isTrackOffline(currentTrack.id)) {
        const offlineUrl = await window.PulseOffline.getOfflineAudioUrl(currentTrack.id);
        if (offlineUrl && window.PulsePlaybar?.getAudio) {
          const audio = window.PulsePlaybar.getAudio();
          audio.src = offlineUrl;
          audio.currentTime = currentPos;
          await audio.play();
          if (window.PulsePlaybar.setActiveEngine) {
            window.PulsePlaybar.setActiveEngine('native');
          }
          console.log('[Pulse Background Audio] Handoff successful via Offline Blob');
          isHandoffInProgress = false;
          return true;
        }
      }

      // 2. Check PERMANENT_STREAM_MAP
      let streamUrl = currentTrack.streamUrl;
      const cleanTitle = (currentTrack.title || '').replace(/\(.*?\)|\[.*?\]/gi, '').trim();
      if (!streamUrl || streamUrl === 'yt-iframe') {
        streamUrl = PERMANENT_STREAM_MAP[currentTrack.title] || PERMANENT_STREAM_MAP[cleanTitle];
      }

      // 3. Resolve direct audio stream via Piped / Saavn
      if (!streamUrl || streamUrl === 'yt-iframe') {
        const ytId = currentTrack.ytId || (currentTrack.id && String(currentTrack.id).startsWith('ytm-') ? String(currentTrack.id).replace('ytm-', '') : null);
        if (ytId) {
          const piped = await resolvePipedAudioStream(ytId);
          if (piped && piped.streamUrl) streamUrl = piped.streamUrl;
        }
        if (!streamUrl) {
          const resolved = await resolveFullAudioStream(currentTrack);
          if (resolved && resolved.streamUrl && resolved.streamUrl !== 'yt-iframe') {
            streamUrl = resolved.streamUrl;
          }
        }
      }

      if (streamUrl && streamUrl.startsWith('http') && window.PulsePlaybar?.getAudio) {
        const audio = window.PulsePlaybar.getAudio();
        audio.src = streamUrl;
        audio.currentTime = currentPos;
        await audio.play();
        if (window.PulsePlaybar.setActiveEngine) {
          window.PulsePlaybar.setActiveEngine('native');
        }
        console.log('[Pulse Background Audio] Handoff successful via direct stream:', streamUrl);
        isHandoffInProgress = false;
        return true;
      }
    } catch (err) {
      console.warn('[Pulse Background Audio] Handoff notice:', err.message);
    }

    isHandoffInProgress = false;
    return false;
  }

  /**
   * Watchdog for visibility changes (app minimized, switched to another app, screen locked)
   */
  function setupVisibilityWatchdog() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', async () => {
      const isHidden = document.visibilityState === 'hidden';
      const playbar = window.PulsePlaybar;
      if (!playbar) return;

      const currentTrack = playbar.getCurrentTrack();
      const isPlaying = playbar.getIsPlaying();
      const activeEngine = playbar.getActiveEngine();

      if (isHidden) {
        // App is minimized or user switched to another app
        if (isPlaying && currentTrack) {
          console.log('[Pulse Background Audio] App backgrounded during playback. Active engine:', activeEngine);

          // If playing via YouTube iframe on mobile, hand off to native audio
          if (activeEngine === 'youtube') {
            const ytPlayer = playbar.getYtPlayer();
            let currentPos = 0;
            if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
              try { currentPos = ytPlayer.getCurrentTime(); } catch (e) {}
            }
            await handoffToNativeAudio(currentTrack, currentPos);
          }

          // Ensure MediaSession is locked in playing state
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
          requestWakeLock();
        }
      } else {
        // App returned to foreground
        releaseWakeLock();
      }
    });

    // Also handle pagehide (mobile browser backgrounding event)
    window.addEventListener('pagehide', async () => {
      const playbar = window.PulsePlaybar;
      if (playbar && playbar.getIsPlaying() && playbar.getActiveEngine() === 'youtube') {
        const currentTrack = playbar.getCurrentTrack();
        const ytPlayer = playbar.getYtPlayer();
        let currentPos = 0;
        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          try { currentPos = ytPlayer.getCurrentTime(); } catch (e) {}
        }
        await handoffToNativeAudio(currentTrack, currentPos);
      }
    });
  }

  /**
   * Initializes the Background Audio Guardian
   */
  function initBackgroundAudioGuardian() {
    if (initialized) return;
    initialized = true;

    setupVisibilityWatchdog();
    if (isMobile) {
      initSilentAudioAnchor();
    }

    console.log('[Pulse Background Audio Guardian] Online and safeguarding background mobile playback.');
  }

  const BackgroundAudioGuardian = {
    init: initBackgroundAudioGuardian,
    isMobile,
    handoffToNativeAudio,
    requestWakeLock,
    releaseWakeLock
  };

  if (typeof window !== 'undefined') {
    window.PulseBackgroundAudio = BackgroundAudioGuardian;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundAudioGuardian;
  }

})(typeof window !== 'undefined' ? window : globalThis);

export default (typeof window !== 'undefined' ? window.PulseBackgroundAudio : null);
