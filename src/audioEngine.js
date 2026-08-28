/**
 * Pulse Music - Pure Audio Engine & Media Stream Player
 * 100% Native HTML5 Audio & Web Audio API (Zero Video Frames / Zero Iframes)
 * Features direct Opus/M4A audio playback, Web Audio visualizer nodes, and Cache API storage.
 */

import { resolvePipedAudioStream } from './extractorService.js';

(function(window) {
  'use strict';

  let globalAudio = null;
  let audioContext = null;
  let analyserNode = null;
  let sourceNode = null;
  let isContextInitialized = false;

  // Audio Cache Storage
  const AUDIO_CACHE_NAME = 'pulse-audio-cache-v1';

  /**
   * Initializes or returns the Singleton HTML5 Audio element
   */
  function getAudioPlayer() {
    if (!globalAudio) {
      globalAudio = document.getElementById('fallback-audio-player') || new Audio();
      globalAudio.id = 'fallback-audio-player';
      globalAudio.preload = 'auto';

      // Keep in document body
      if (!document.body.contains(globalAudio)) {
        globalAudio.style.display = 'none';
        document.body.appendChild(globalAudio);
      }
      window.globalAudioPlayer = globalAudio;
    }
    return globalAudio;
  }

  /**
   * Initializes Web Audio Context for Spectrum Analysis & Visualization
   */
  function getAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 128;
        analyserNode.smoothingTimeConstant = 0.8;
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return { audioContext, analyserNode };
  }

  /**
   * Connects HTML5 Audio to Web Audio Analyser
   */
  function connectAudioSource() {
    const audio = getAudioPlayer();
    const { audioContext: ctx, analyserNode: analyser } = getAudioContext();
    if (!ctx || !analyser || isContextInitialized) return analyser;

    try {
      sourceNode = ctx.createMediaElementSource(audio);
      sourceNode.connect(analyser);
      analyser.connect(ctx.destination);
      isContextInitialized = true;
    } catch (e) {
      // Media element source already connected or cross-origin restrictions
    }
    return analyser;
  }

  /**
   * Caches audio stream locally for instant offline/repeat playback
   */
  async function cacheAudioBlob(trackId, url) {
    if (!trackId || !url || !url.startsWith('http') || !('caches' in window)) return;
    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const cached = await cache.match(url);
      if (!cached) {
        // Fetch in background
        fetch(url, { mode: 'cors' })
          .then(res => {
            if (res.ok) cache.put(url, res);
          })
          .catch(() => {});
      }
    } catch (e) {}
  }

  /**
   * Retrieves cached audio response if available
   */
  async function getCachedAudioUrl(url) {
    if (!url || !('caches' in window)) return url;
    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const match = await cache.match(url);
      if (match) {
        const blob = await match.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {}
    return url;
  }

  /**
   * Resolves audio stream candidates for any track
   * Exclusive YouTube Music Opus -> Piped M4A Extractor
   */
  async function resolveCandidates(track) {
    if (!track) return [];
    const candidates = [];
    const seen = new Set();
    const add = (url, label, codec = 'audio') => {
      if (url && typeof url === 'string' && url.startsWith('http') && !seen.has(url)) {
        seen.add(url);
        candidates.push({ url, label, codec });
      }
    };

    // 1. Local Backend /api/ytm/stream (MOST RELIABLE — bypasses CORS, returns decrypted Saavn CDN URLs)
    const title = (track.title || track.name || '').replace(/\s*\([^)]*\)/g, '').trim();
    const artist = (track.artist || '').split(',')[0].trim();
    const query = `${title} ${artist}`.trim();
    const ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : null);

    try {
      const localUrl = ytId
        ? `/api/ytm/stream?id=${ytId}`
        : `/api/ytm/stream?q=${encodeURIComponent(query)}`;
      const localExtRes = await fetch(localUrl, { signal: AbortSignal.timeout(4000) });
      if (localExtRes.ok) {
        const lData = await localExtRes.json();
        if (lData.streamUrl) {
          // Proxy saavncdn URLs through our backend
          let streamUrl = lData.streamUrl;
          if (streamUrl.includes('saavncdn.com')) {
            const origin = (typeof window !== 'undefined' && window.location?.origin) || 'http://localhost:5173';
            streamUrl = `${origin}/api/proxy-stream?url=${encodeURIComponent(streamUrl)}`;
          }
          add(streamUrl, 'pulse-server-ytm-stream', lData.codec || 'mp4/aac');
        }
      }
    } catch (e) {}

    // 2. Direct explicit streamUrl on track if already verified full-length master
    if (track.streamUrl && 
        track.streamUrl.startsWith('http') && 
        !track.streamUrl.includes('preview') && 
        !track.streamUrl.includes('audio-ssl.itunes.apple.com') && 
        !track.streamUrl.includes('mzstatic')) {
      let streamUrl = track.streamUrl;
      if (streamUrl.includes('saavncdn.com')) {
        const origin = (typeof window !== 'undefined' && window.location?.origin) || 'http://localhost:5173';
        streamUrl = `${origin}/api/proxy-stream?url=${encodeURIComponent(streamUrl)}`;
      }
      add(streamUrl, track.source || 'direct-master-audio', 'master');
    }

    // 3. YouTube Piped Opus (often blocked by CORS in browsers)
    if (ytId && ytId.length >= 10) {
      try {
        const ytmResolved = await resolvePipedAudioStream(ytId);
        if (ytmResolved && ytmResolved.streamUrl) {
          add(ytmResolved.streamUrl, `ytm-opus-${ytmResolved.bitrate || '160k'}`, ytmResolved.codec || 'opus');
        }
      } catch (e) {}
    }

    return candidates;
  }

  /**
   * Universal Pure Native Audio Player Dispatcher
   */
  async function playTrackOnNativeAudio(track) {
    if (!track) return false;
    const audio = getAudioPlayer();
    connectAudioSource();

    const candidates = await resolveCandidates(track);
    if (candidates.length === 0) {
      console.warn('[Pulse Pure Audio Engine] No valid audio candidates found for track:', track.title);
      return false;
    }

    for (const c of candidates) {
      try {
        audio.pause();
        const playUrl = await getCachedAudioUrl(c.url);
        audio.src = playUrl;
        audio.load();
        await audio.play();
        console.log(`[Pulse Pure Audio Engine] Playing via ${c.label} (${c.codec}):`, c.url);

        // Cache for background/offline
        cacheAudioBlob(track.id, c.url);
        return true;
      } catch (err) {
        console.warn(`[Pulse Pure Audio Engine] Candidate (${c.label}) failed, trying next:`, err.message);
      }
    }

    return false;
  }

  window.PulseAudioEngine = {
    getAudioPlayer,
    getAudioContext,
    connectAudioSource,
    resolveCandidates,
    playTrackOnNativeAudio,
    cacheAudioBlob,
    getCachedAudioUrl
  };

})(typeof window !== 'undefined' ? window : globalThis);

export default (typeof window !== 'undefined' ? window.PulseAudioEngine : {});
