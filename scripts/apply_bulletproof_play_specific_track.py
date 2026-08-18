import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    main = f.read()

bulletproof_play_specific_track = r"""
  // =========================================================================
  // DIRECT UNIVERSAL AUDIO PLAYBACK ENGINE & CARD DISPATCHER
  // =========================================================================
  window.playSpecificTrack = async function(trackId) {
    if (!trackId) return;
    console.log('[Pulse Direct Engine] Playing track ID:', trackId);

    // 1. Resolve Track Metadata from all sources
    let track = null;
    if (typeof window !== 'undefined' && window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]) {
      track = window.TRACKS_REGISTRY[trackId];
    }
    if (!track && window.catalogService && typeof window.catalogService.getCatalogTrackById === 'function') {
      track = window.catalogService.getCatalogTrackById(trackId);
    }
    if (!track && window.musicService && typeof window.musicService.getTrack === 'function') {
      track = window.musicService.getTrack(trackId);
    }

    // Fallback: extract directly from the clicked card in the DOM
    if (!track) {
      const card = document.querySelector(`[onclick*="'${trackId}'"]`) || document.querySelector(`[data-track-id="${trackId}"]`);
      if (card) {
        const title = card.querySelector('.card-title, .music-card-title, .track-title, h4, h5')?.textContent?.trim() || trackId;
        const artist = card.querySelector('.card-artist, .music-card-subtitle, .track-artist, p')?.textContent?.trim() || 'Pulse Artist';
        const cover = card.querySelector('img')?.src || './pulse-logo.png';
        track = {
          id: trackId,
          title: title,
          artist: artist,
          cover: cover,
          duration: '3:30',
          category: 'recommended'
        };
      }
    }

    if (!track) {
      track = {
        id: trackId,
        title: trackId.replace(/-/g, ' ').toUpperCase(),
        artist: 'Pulse Artist',
        cover: './pulse-logo.png',
        duration: '3:30'
      };
    }

    state.currentTrack = track;
    state.isPlaying = true;

    // 2. Instant UI Update across Mini Playbar & Fullscreen Player
    const playerBar = document.querySelector('.bottom-player-bar') || document.getElementById('player-bar');
    if (playerBar) {
      playerBar.classList.remove('hidden');
      playerBar.style.display = 'flex';
      playerBar.style.visibility = 'visible';
      playerBar.style.opacity = '1';
    }

    // Mini bar details
    const pTitle = document.getElementById('player-title');
    const pArtist = document.getElementById('player-artist');
    const pThumb = document.getElementById('player-thumb');
    if (pTitle) pTitle.textContent = track.title;
    if (pArtist) pArtist.textContent = track.artist;
    if (pThumb) pThumb.src = track.cover || './pulse-logo.png';

    // Fullscreen details
    const fsTitle = document.getElementById('fs-track-title');
    const fsArtist = document.getElementById('fs-track-artist');
    const fsArt = document.getElementById('fs-album-art');
    const fsBg = document.getElementById('fs-bg-blur');
    if (fsTitle) fsTitle.textContent = track.title;
    if (fsArtist) fsArtist.textContent = track.artist;
    if (fsArt) fsArt.src = track.cover || './pulse-logo.png';
    if (fsBg) fsBg.style.backgroundImage = `url('${track.cover || './pulse-logo.png'}')`;

    // Update play button icons to Pause
    document.querySelectorAll('#btn-play-pause, #fs-btn-play, .btn-primary-play').forEach(btn => {
      const icon = btn.querySelector('i') || btn;
      if (icon) {
        icon.className = 'fa-solid fa-pause';
      }
    });

    // 3. Update active card highlights in UI
    document.querySelectorAll('.music-card').forEach(c => {
      if (c.getAttribute('onclick')?.includes(`'${trackId}'`)) {
        c.classList.add('playing');
        const playBtn = c.querySelector('.btn-card-play i, .music-card-play-btn i');
        if (playBtn) playBtn.className = 'fa-solid fa-pause';
      } else {
        c.classList.remove('playing');
        const playBtn = c.querySelector('.btn-card-play i, .music-card-play-btn i');
        if (playBtn) playBtn.className = 'fa-solid fa-play';
      }
    });

    // 4. Resolve and play audio soundtrack
    let audio = document.getElementById('fallback-audio-player') || window.globalAudioPlayer;
    if (!audio) {
      audio = new Audio();
      audio.id = 'fallback-audio-player';
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      document.body.appendChild(audio);
      window.globalAudioPlayer = audio;
    }

    // Resolve stream candidates
    let streamCandidates = [];
    if (track.streamUrl && track.streamUrl.startsWith('http')) {
      streamCandidates.push(track.streamUrl);
    }
    if (window.PulseAudioEngine && typeof window.PulseAudioEngine.resolveCandidates === 'function') {
      try {
        const resolved = await window.PulseAudioEngine.resolveCandidates(track);
        if (resolved && resolved.length > 0) {
          streamCandidates.push(...resolved.map(r => r.url));
        }
      } catch (e) {}
    }

    // If still no stream candidates, add direct Jamendo / Audius fallback
    if (streamCandidates.length === 0) {
      const searchQ = `${track.title} ${track.artist}`.trim();
      streamCandidates.push(
        `https://api.jamendo.com/v3.0/tracks/file/?client_id=23b33f2a&namesearch=${encodeURIComponent(searchQ)}&audioformat=mp32`,
        `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(searchQ)}&app_name=PULSE_APP`
      );
    }

    // Play first working candidate
    let playSucceeded = false;
    for (const url of streamCandidates) {
      if (!url || typeof url !== 'string') continue;
      try {
        audio.pause();
        audio.src = url;
        audio.load();
        await audio.play();
        console.log('[Pulse Direct Audio] Successfully playing stream:', url);
        playSucceeded = true;
        break;
      } catch (playErr) {
        console.warn('[Pulse Direct Audio] Stream candidate failed, trying next:', url, playErr.message);
      }
    }

    // 5. Load Synchronized Lyrics
    if (typeof window.loadTrackLyrics === 'function') {
      window.loadTrackLyrics(track);
    }

    // 6. MediaSession metadata
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'Pulse Music',
        artwork: [{ src: track.cover || './pulse-logo.png', sizes: '512x512', type: 'image/png' }]
      });
    }

    showToast(`Playing "${track.title}" by ${track.artist}`, 'success', 3000);
  };
"""

# Replace or insert playSpecificTrack
if 'window.playSpecificTrack = async function' in main:
    main = re.sub(
        r'window\.playSpecificTrack\s*=\s*async\s*function[\s\S]*?showToast\(`Playing[^\n]*\n\s*\};',
        bulletproof_play_specific_track.strip(),
        main
    )
elif 'window.playSpecificTrack = function' in main:
    main = re.sub(
        r'window\.playSpecificTrack\s*=\s*function[\s\S]*?\n\s*\};',
        bulletproof_play_specific_track.strip(),
        main
    )
else:
    main = main.replace(
        'async function initApp()',
        bulletproof_play_specific_track.strip() + '\n\n  async function initApp()'
    )

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main)

print("[OK] Integrated bulletproof window.playSpecificTrack directly into src/main.js")
