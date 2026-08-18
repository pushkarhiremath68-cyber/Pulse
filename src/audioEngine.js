/**
 * Pulse Music - Dual Jamendo + Audius Streaming Audio Engine
 * Pure Native HTML5 Audio (<audio id="fallback-audio-player">)
 * Powered by Jamendo API (23b33f2a) & Decentralized Audius Nodes
 */

(function(window) {
  'use strict';

  const JAMENDO_CLIENT_ID = '23b33f2a';
  const AUDIUS_APP_NAME = 'PULSE_MUSIC';
  const AUDIUS_FALLBACK_NODE = 'https://discoveryprovider.audius.co';

  let cachedAudiusNode = null;
  let audiusNodeExpiry = 0;

  /**
   * Dynamically fetch an active Audius Discovery Node
   */
  async function getAudiusNode() {
    if (cachedAudiusNode && Date.now() < audiusNodeExpiry) {
      return cachedAudiusNode;
    }
    try {
      const res = await fetch('https://api.audius.co', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          cachedAudiusNode = json.data[Math.floor(Math.random() * json.data.length)].replace(/\/+$/, '');
          audiusNodeExpiry = Date.now() + 20 * 60 * 1000;
          return cachedAudiusNode;
        }
      }
    } catch (e) {}

    cachedAudiusNode = AUDIUS_FALLBACK_NODE;
    audiusNodeExpiry = Date.now() + 5 * 60 * 1000;
    return cachedAudiusNode;
  }

  /**
   * Resolve audio stream candidates with the exact Audius -> Jamendo -> Storage cascade
   */
  async function resolveCandidates(track) {
    if (!track) return [];
    const candidates = [];
    const seen = new Set();
    const add = (url, label) => {
      if (url && typeof url === 'string' && url.startsWith('http') && !seen.has(url)) {
        seen.add(url);
        candidates.push({ url, label });
      }
    };

    // 1. Direct explicit streamUrl if present on track
    if (track.streamUrl && track.streamUrl.startsWith('http')) {
      add(track.streamUrl, 'direct-track-stream');
    }
    if (track.audioUrl && track.audioUrl.startsWith('http')) {
      add(track.audioUrl, 'direct-audio-url');
    }
    if (track.audio && track.audio.startsWith('http')) {
      add(track.audio, 'direct-audio-mp3');
    }

    const title = (track.title || track.name || '').replace(/\s*\([^)]*\)/g, '').trim();
    const artist = (track.artist || '').split(',')[0].trim();
    const query = encodeURIComponent(`${title} ${artist}`.trim());

    // 2. Cascade Step A: Audius Search & Stream
    try {
      const node = await getAudiusNode();
      const audiusSearchUrl = `${node}/v1/tracks/search?query=${query}&app_name=${AUDIUS_APP_NAME}&limit=3`;
      const aRes = await fetch(audiusSearchUrl, { signal: AbortSignal.timeout(3500) });
      if (aRes.ok) {
        const aJson = await aRes.json();
        if (aJson.data && Array.isArray(aJson.data) && aJson.data.length > 0) {
          for (const item of aJson.data) {
            if (item.id) {
              add(`${node}/v1/tracks/${item.id}/stream?app_name=${AUDIUS_APP_NAME}`, 'audius-stream-320k');
            }
          }
        }
      }
    } catch (e) {}

    // 3. Cascade Step B: Jamendo API Search & Stream
    try {
      const jamendoSearchUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=5&search=${query}&audioformat=mp32`;
      const jRes = await fetch(jamendoSearchUrl, { signal: AbortSignal.timeout(3500) });
      if (jRes.ok) {
        const jJson = await jRes.json();
        if (jJson.results && Array.isArray(jJson.results)) {
          for (const item of jJson.results) {
            if (item.audio) add(item.audio, 'jamendo-mp3-stream');
            if (item.audiodownload) add(item.audiodownload, 'jamendo-download-stream');
          }
        }
      }
    } catch (e) {}

    // 4. Cascade Step C: Storage / Fallback URLs
    if (typeof window.getAudioStorageUrl === 'function' && track.storagePath) {
      const sb = window.getAudioStorageUrl(track.storagePath);
      if (sb) add(sb, 'supabase-storage-mp4');
    }

    return candidates;
  }

  // Universal Player Singleton Dispatcher
  async function playTrackOnNativeAudio(track) {
    if (!track) return false;
    let audio = document.getElementById('fallback-audio-player') || window.globalAudioPlayer;
    if (!audio) {
      audio = new Audio();
      audio.id = 'fallback-audio-player';
      audio.preload = 'auto';
      document.body.appendChild(audio);
      window.globalAudioPlayer = audio;
    }

    const candidates = await resolveCandidates(track);
    for (const c of candidates) {
      try {
        audio.pause();
        audio.src = c.url;
        audio.load();
        await audio.play();
        console.log(`[Pulse Native Engine] Playing via ${c.label}:`, c.url);
        return true;
      } catch (err) {
        console.warn(`[Pulse Native Engine] Stream candidate failed (${c.label}), trying next:`, err.message);
      }
    }

    return false;
  }

  window.PulseAudioEngine = {
    getAudiusNode,
    resolveCandidates,
    playTrackOnNativeAudio
  };

})(typeof window !== 'undefined' ? window : globalThis);
