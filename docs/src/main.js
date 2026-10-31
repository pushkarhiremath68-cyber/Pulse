/**
 * Pulse Music - Main Application Coordinator
 * Integrates:
 * 1. Real-Time LRCLIB Synchronized Lyrics with active-line highlight, smooth centering auto-scroll & click-to-seek.
 * 2. Fullscreen Maximized / Minimized Playbar transitions with album art & visualizer.
 * 3. Complete Home Catalogues: Quick Picks, Featured Artists, Curated Mixes, Genre Shelves, Language Hubs.
 * 4. Universal YouTube & Studio Search Engine with instant multi-source discovery.
 * 5. Dedicated Immersive Artist Page (/artist/:artistId) with Top Tracks & Discography.
 * 6. Cloud Firestore (Playlists & Favorites) and Pure Audio Engine.
 */

import './firebase.js';
import './firebaseAuthService.js';
import './firestoreService.js';
import './extractorService.js';
import './musicService.js';
import { fetchDynamicArtistData } from './musicService.js';
import './audioEngine.js';
import './playbarController.js';
import './lyricsService.js';
import './catalogService.js';
import './recommendationService.js';
import './newReleasesService.js';
import './visualizer.js';
import './geminiService.js';
import './downloadService.js';
import { escapeHtml, sanitizeUrl } from './security.js';

import { fetchFreshNewReleases, getCachedNewReleases } from './newReleasesService.js';

import {
  getStoredUser,
  onAuthStateChanged,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  signOut,
  isGateUnlocked,
  setGateUnlocked,
  updateUserProfile,
  getPrivacySettings,
  updatePrivacySettings,
  exportUserData,
  clearUserCache
} from './firebaseAuthService.js';
import { getFavorites, removeFavorite, addFavorite, isFavorite, getPlaylists, createPlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist, getHistory, clearHistory, onFavoritesChanged, onPlaylistsChanged, onHistoryChanged, getCurrentUserId, createSession, joinSession, leaveSession, updateSessionState, publishSharedPlaylist, getSharedPlaylist, importSharedPlaylist, generateTrackShareUrl, parseTrackShareUrl } from './firestoreService.js';
import { getHeroSlides, getQuickPicks, getFeaturedArtists, getArtistDetails, getCuratedPlaylists, getMoviePlaylists, getVibePlaylists, CATALOG_CATEGORIES, LANGUAGE_PLAYLISTS } from './catalogService.js';
import { detectTrackVibe, getSimilarTracks } from './recommendationService.js';
import { getLyrics, getActiveLineIndex } from './lyricsService.js';
import { askGeminiDJ } from './geminiService.js';
import {
  downloadTrack,
  downloadCurrentTrack,
  detectUserPlatform,
  triggerDirectFileDownload,
  downloadAndroidApk,
  downloadWindowsInstaller,
  downloadMacDmg,
  downloadLinuxAppImage,
  downloadIosIpa,
  downloadAppForDevice
} from './downloadService.js';

// Global error handler to catch broken images and provide progressive fallback
window.addEventListener('error', function(e) {
  if (e.target && e.target.tagName === 'IMG') {
    // Clear inline onerror to prevent it from overriding our progressive fallback
    e.target.onerror = null;
    
    const src = e.target.src || '';
    if (src.includes('maxresdefault.jpg') && e.target.dataset.fallbackLevel !== 'hq') {
      e.target.dataset.fallbackLevel = 'hq';
      e.target.src = src.replace('maxresdefault.jpg', 'hqdefault.jpg');
    } else if (src.includes('hqdefault.jpg') && e.target.dataset.fallbackLevel !== 'mq') {
      e.target.dataset.fallbackLevel = 'mq';
      e.target.src = src.replace('hqdefault.jpg', 'mqdefault.jpg');
    } else if (!e.target.dataset.pulseFallback) {
      e.target.dataset.pulseFallback = 'true';
      if (e.target.classList.contains('brand-logo-img') || e.target.classList.contains('auth-gate-logo')) {
        e.target.src = './pulse-logo.png';
      } else {
        e.target.src = './music-cover.svg';
      }
    }
  }
}, true);

(function() {
  'use strict';

  // Global State Reference
  window.pulseState = {
    currentUser: getStoredUser(),
    currentTrack: null,
    isPlaying: false,
    activeCategory: 'all',
    activeLibraryTab: 'favorites',
    currentLyrics: null,
    activeLyricIdx: -1,
    currentArtistData: null
  };

  // Toast Notification Helper
  window.showToast = function(msg, type = 'info', duration = 3000) {
    let container = document.getElementById('pulse-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pulse-toast-container';
      container.style.cssText = 'position: fixed; bottom: 100px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'rgba(34,197,94,0.95)' : (type === 'warning' ? 'rgba(234,179,8,0.95)' : 'rgba(139,92,246,0.95)');
    toast.style.cssText = `background: ${bg}; color: #fff; padding: 0.8rem 1.2rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.5); backdrop-filter: blur(10px); transition: all 0.3s ease; animation: toastIn 0.3s ease; pointer-events: auto;`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // View Routing
  window.switchView = function(viewId) {
    if (viewId === 'library' || viewId === 'playlist') {
      const uid = getCurrentUserId();
      if (!uid || uid.startsWith('guest-')) {
        window.showToast('Please continue with Google to access your library', 'warning');
        window.signInWithGoogle();
        return; // prevent switching view
      }
    }

    document.querySelectorAll('.app-view').forEach(el => el.classList.remove('active-view'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.nav-item, .mobile-nav-item, .mobile-nav-link').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-view') === viewId);
    });

    if (viewId === 'library') {
      window.renderLibraryView();
    } else if (viewId === 'home') {
      window.renderHomeDiscovery();
    } else if (viewId === 'search-view') {
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.focus();
    }

    if (viewId !== 'home') {
      if (window.pauseHeroAutoPlay) window.pauseHeroAutoPlay();
      if (window.toggleSlideVideo && window.__heroSlides) {
        for (let i = 0; i < window.__heroSlides.length; i++) {
          const vidBox = document.getElementById(`hero-media-video-${i}`);
          if (vidBox && vidBox.classList.contains('active-video')) {
            window.toggleSlideVideo(i, false);
          }
        }
      }
    }
  };

  // Playback Trigger
  window.playTrackDirect = function(track, queue = null) {
    if (!track) return;
    if (window.PulsePlaybar && typeof window.PulsePlaybar.playTrack === 'function') {
      window.PulsePlaybar.playTrack(track, queue);
      window.loadTrackLyrics(track);
    }
    const coverUrl = track.coverUrl || track.cover || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : './music-cover.svg');
    if (window.PulsePlaybar && typeof window.PulsePlaybar.updateDynamicAppWallpaper === 'function') {
      window.PulsePlaybar.updateDynamicAppWallpaper(coverUrl);
    } else {
      const appWallpaper = document.getElementById('app-dynamic-wallpaper');
      if (appWallpaper) {
        appWallpaper.style.backgroundImage = `url('${coverUrl}')`;
        appWallpaper.classList.add('active-wallpaper');
      }
    }
    const heroBg = document.getElementById('hero-bg-artwork');
    if (heroBg) {
      heroBg.style.backgroundImage = `url('${coverUrl}')`;
    }
    if (typeof window.updateCurrentVibeShelf === 'function') {
      window.updateCurrentVibeShelf(track);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. REAL-TIME SYNCHRONIZED LYRICS (LRCLIB + KARAOKE HIGHLIGHTING + SEEK)
  // ---------------------------------------------------------------------------

  window.loadTrackLyrics = async function(track) {
    if (!track) return;
    window.pulseState.currentTrack = track;
    window.pulseState.activeLyricIdx = -1;

    // Update Drawer Header
    const drawerTitle = document.getElementById('lyrics-drawer-title');
    const drawerArtist = document.getElementById('lyrics-drawer-artist');
    if (drawerTitle) drawerTitle.textContent = track.title || 'Live Synced Lyrics';
    if (drawerArtist) drawerArtist.textContent = track.artist || 'Pulse Karaoke';

    // Show Loading state
    const drawerContent = document.getElementById('lyrics-drawer-content');
    const fsScrollBox = document.getElementById('fs-lyrics-scroll-box');
    const loadingHtml = `<div class="lyrics-loading-state" style="padding: 2rem; color: #c084fc;"><i class="fa-solid fa-spinner fa-spin"></i> Synchronizing LRCLIB lyrics...</div>`;

    if (drawerContent) drawerContent.innerHTML = loadingHtml;
    if (fsScrollBox) fsScrollBox.innerHTML = loadingHtml;

    try {
      const lyricsData = await getLyrics(track);
      window.pulseState.currentLyrics = lyricsData;

      if (!lyricsData || lyricsData.notFound || !lyricsData.lines || lyricsData.lines.length === 0) {
        const notFoundHtml = `
          <div class="lyrics-empty-state" style="padding: 3rem 1rem; color: var(--text-muted); text-align: center;">
            <i class="fa-solid fa-microphone-slash" style="font-size: 2.5rem; opacity: 0.4; margin-bottom: 0.75rem; color: #a855f7;"></i>
            <h4 style="color: #fff; margin-bottom: 0.25rem;">Live lyrics not available</h4>
            <p style="font-size: 0.85rem;">Enjoy the pure high-fidelity audio stream.</p>
          </div>
        `;
        if (drawerContent) drawerContent.innerHTML = notFoundHtml;
        if (fsScrollBox) fsScrollBox.innerHTML = notFoundHtml;
        return;
      }

      // Render line-by-line karaoke elements
      const linesHtml = lyricsData.lines.map((line, idx) => {
        const timeAttr = line.time !== null ? `data-time="${line.time}"` : '';
        const seekHandler = line.time !== null ? `onclick="window.seekToLyricTimestamp(${line.time})"` : '';
        const clickableClass = line.time !== null ? 'lyric-clickable' : '';
        return `
          <p class="fs-lyric-line lyric-line ${clickableClass}" id="lyric-line-${idx}" ${timeAttr} ${seekHandler} title="${line.time !== null ? `Click to jump to ${Math.floor(line.time / 60)}:${Math.floor(line.time % 60).toString().padStart(2, '0')}` : ''}" style="margin: 0.75rem 0; font-size: 1.15rem; font-weight: 700; color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.25s ease; border-radius: 8px; padding: 4px 8px;">
            ${escapeHtml(line.text)}
          </p>
        `;
      }).join('');

      if (drawerContent) {
        drawerContent.innerHTML = `
          <div class="lyrics-mode-badge" style="font-size: 0.8rem; font-weight: 700; color: #c084fc; margin-bottom: 1rem; text-align: center;">${lyricsData.isSynced ? '⚡ Real-Time Synchronized Karaoke' : '📄 Plain Lyrics'} • ${escapeHtml(lyricsData.source)}</div>
          <div class="lyrics-lines-wrapper" style="display: flex; flex-direction: column; align-items: center; text-align: center;">${linesHtml}</div>
        `;
      }

      if (fsScrollBox) {
        fsScrollBox.innerHTML = `
          <div class="fs-lyrics-badge" style="font-size: 0.75rem; font-weight: 700; color: #c084fc; margin-bottom: 0.75rem;">${lyricsData.isSynced ? '⚡ Live Lyrics' : '📄 Lyrics'}</div>
          <div class="fs-lines-wrapper" style="display: flex; flex-direction: column; align-items: center;">${linesHtml}</div>
        `;
      }
    } catch (err) {
      console.warn('[Pulse Lyrics] Error loading lyrics:', err);
    }
  };

  /**
   * Called on audio timeupdate to highlight current line and center-scroll
   */
  window.syncLiveLyrics = function(currentTime) {
    const preview = document.getElementById('playbar-lyrics-preview');
    const lyrics = window.pulseState.currentLyrics;
    
    if (!lyrics || !lyrics.isSynced || !lyrics.lines || lyrics.lines.length === 0) {
      if (preview) {
        preview.style.opacity = '0';
        preview.style.transform = 'translateY(10px)';
        preview.style.pointerEvents = 'none';
      }
      return;
    }

    const activeIdx = getActiveLineIndex(lyrics.lines, currentTime);
    if (activeIdx === window.pulseState.activeLyricIdx) {
      return;
    }

    window.pulseState.activeLyricIdx = activeIdx;
    
    // Update live floating preview in bottom playbar
    if (preview) {
      if (activeIdx >= 0 && activeIdx < lyrics.lines.length) {
        const activeText = lyrics.lines[activeIdx].text || '♪';
        if (activeText.trim() === '' || activeText.trim() === '♪') {
          preview.style.opacity = '0';
          preview.style.transform = 'translateY(10px)';
          preview.style.pointerEvents = 'none';
        } else {
          preview.textContent = activeText;
          preview.style.opacity = '1';
          preview.style.transform = 'translateY(0)';
          preview.style.pointerEvents = 'auto';
        }
      } else {
        preview.style.opacity = '0';
        preview.style.transform = 'translateY(10px)';
        preview.style.pointerEvents = 'none';
      }
    }

    // Update highlights in all active lyrics containers
    ['lyrics-drawer-content', 'fs-lyrics-scroll-box'].forEach(containerId => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const allLines = container.querySelectorAll('.lyric-line');
      allLines.forEach((el, idx) => {
        if (idx === activeIdx) {
          el.classList.add('active-lyric-line', 'fs-lyric-active');
          el.style.color = '#ffffff';
          el.style.fontSize = '1.35rem';
          el.style.fontWeight = '900';
          el.style.textShadow = '0 0 20px rgba(192, 132, 252, 0.8), 0 0 35px rgba(168, 85, 247, 0.5)';
          el.style.transform = 'scale(1.05)';
          el.style.background = 'rgba(168, 85, 247, 0.15)';

          // Center Scroll
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        } else if (idx < activeIdx) {
          el.classList.remove('active-lyric-line', 'fs-lyric-active');
          el.style.color = 'rgba(255, 255, 255, 0.35)';
          el.style.fontSize = '1.15rem';
          el.style.fontWeight = '600';
          el.style.textShadow = 'none';
          el.style.transform = 'scale(1)';
          el.style.background = 'transparent';
        } else {
          el.classList.remove('active-lyric-line', 'fs-lyric-active');
          el.style.color = 'rgba(255, 255, 255, 0.5)';
          el.style.fontSize = '1.15rem';
          el.style.fontWeight = '600';
          el.style.textShadow = 'none';
          el.style.transform = 'scale(1)';
          el.style.background = 'transparent';
        }
      });
    });
  };

  /**
   * Click-to-Seek: immediately jumps audio playback to lyric timestamp
   */
  window.seekToLyricTimestamp = function(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) return;
    if (window.PulsePlaybar && typeof window.PulsePlaybar.seekTo === 'function') {
      window.PulsePlaybar.seekTo(seconds);
      window.syncLiveLyrics(seconds);
      window.showToast(`Jumped to ${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`, 'info', 1000);
    }
  };

  window.openLyricsDrawer = function() {
    const modal = document.getElementById('lyrics-drawer-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('active-modal');
      const track = window.pulseState.currentTrack || (window.PulsePlaybar && window.PulsePlaybar.getCurrentTrack());
      if (track) window.loadTrackLyrics(track);
    }
  };

  window.closeLyricsDrawer = function() {
    const modal = document.getElementById('lyrics-drawer-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('active-modal');
    }
  };

  // ---------------------------------------------------------------------------
  // UP NEXT & SIMILAR TRACKS DRAWER CONTROLLER
  // ---------------------------------------------------------------------------
  window.openQueueDrawer = function() {
    const modal = document.getElementById('queue-drawer-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('active-modal');
      
      const track = window.pulseState.currentTrack || (window.PulsePlaybar && window.PulsePlaybar.getCurrentTrack());
      if (track) {
        const npTitle = document.getElementById('drawer-np-title');
        const npArtist = document.getElementById('drawer-np-artist');
        const npThumb = document.getElementById('drawer-np-thumb');
        if (npTitle) npTitle.textContent = track.title || 'Select a Song';
        if (npArtist) npArtist.textContent = track.artist || 'Pulse Music';
        if (npThumb) npThumb.src = track.coverUrl || track.cover || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : './music-cover.svg');
      }

      if (window.PulsePlaybar && typeof window.PulsePlaybar.renderQueueAndSuggestionsUI === 'function') {
        window.PulsePlaybar.renderQueueAndSuggestionsUI();
      }
    }
  };

  window.closeQueueDrawer = function() {
    const modal = document.getElementById('queue-drawer-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('active-modal');
    }
  };

  window.toggleQueueDrawer = function() {
    const modal = document.getElementById('queue-drawer-modal');
    if (modal && !modal.classList.contains('hidden')) {
      window.closeQueueDrawer();
    } else {
      window.openQueueDrawer();
    }
  };

  /**
   * 3-Way Pure Audio Mode Switcher for Fullscreen Player: 'art' | 'lyrics' | 'similar'
   */
  window.switchFullscreenView = function(viewMode) {
    if (viewMode === 'video') viewMode = 'art'; // Automatically redirect any video triggers to album art
    const fsModal = document.getElementById('fullscreen-player');
    const content = document.getElementById('fs-content-container');
    const artSec = document.getElementById('fs-album-section');
    const lyricsSec = document.getElementById('fs-lyrics-panel');
    const similarSec = document.getElementById('fs-similar-panel');

    if (!fsModal || fsModal.classList.contains('hidden')) {
      if (window.PulsePlaybar && typeof window.PulsePlaybar.maximize === 'function') {
        window.PulsePlaybar.maximize();
      }
    }

    // Update active tab buttons
    document.querySelectorAll('.fs-mode-tab-btn').forEach(btn => {
      btn.classList.toggle('active-tab', btn.getAttribute('data-mode') === viewMode);
    });

    if (content) {
      content.setAttribute('data-active-view', viewMode);
    }

    if (artSec) artSec.classList.toggle('hidden-view', viewMode !== 'art');
    if (lyricsSec) lyricsSec.classList.toggle('hidden-view', viewMode !== 'lyrics');
    if (similarSec) similarSec.classList.toggle('hidden-view', viewMode !== 'similar');

    const toggleLyricsBtn = document.getElementById('fs-toggle-lyrics-btn');
    if (toggleLyricsBtn) {
      toggleLyricsBtn.classList.toggle('active-mode', viewMode === 'lyrics');
    }
    const toggleSimilarBtn = document.getElementById('fs-toggle-similar-btn');
    if (toggleSimilarBtn) {
      toggleSimilarBtn.classList.toggle('active-mode', viewMode === 'similar');
    }

    if (viewMode === 'similar' && window.PulsePlaybar && typeof window.PulsePlaybar.renderQueueAndSuggestionsUI === 'function') {
      window.PulsePlaybar.renderQueueAndSuggestionsUI();
    }
  };

  window.toggleFullscreenLyricsView = function() {
    const content = document.getElementById('fs-content-container');
    const curView = content ? content.getAttribute('data-active-view') : 'art';
    window.switchFullscreenView(curView === 'lyrics' ? 'art' : 'lyrics');
  };

  // ---------------------------------------------------------------------------
  // ULTRA-HD SONG WALLPAPER GENERATOR & DOWNLOADER (Phone Lockscreen / Desktop)
  // ---------------------------------------------------------------------------
  window.downloadTrackWallpaper = async function(trackToUse) {
    const track = trackToUse || (window.PulsePlaybar && typeof window.PulsePlaybar.getCurrentTrack === 'function' ? window.PulsePlaybar.getCurrentTrack() : null);
    if (!track || !track.title) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please play or select a song to download its wallpaper!', 'warning', 2500);
      }
      return;
    }

    const cleanTitle = (track.title || 'Song').replace(/[\\/:*?"<>|]/g, '').trim();
    const cleanArtist = (track.artist || 'Pulse Artist').replace(/[\\/:*?"<>|]/g, '').trim();
    const rawCover = track.coverUrl || track.cover || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : './music-cover.svg');
    
    // Upscale to ultra high-resolution
    let hdCover = rawCover
      .replace('50x50', '1000x1000')
      .replace('150x150', '1000x1000')
      .replace('500x500', '1000x1000')
      .replace('100x100bb', '1000x1000bb')
      .replace('/mqdefault.jpg', '/maxresdefault.jpg')
      .replace('/hqdefault.jpg', '/maxresdefault.jpg');
      
    if (hdCover.includes('=w') && hdCover.includes('-h')) {
      hdCover = hdCover.replace(/=w\d+-h\d+-[a-zA-Z0-9-]+/, '=w1200-h1200-l90-rj');
    }

    if (typeof window.showToast === 'function') {
      window.showToast(`Generating Ultra-HD wallpaper for "${cleanTitle}"... 🎨`, 'info', 3000);
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.crossOrigin = 'anonymous';

      function triggerDirectDownload() {
        const link = document.createElement('a');
        link.href = hdCover;
        link.target = '_blank';
        link.download = `${cleanTitle} - Cover.jpg`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 1500);
        if (typeof window.showToast === 'function') {
          window.showToast(`🖼️ Wallpaper downloaded! Set as your Lock Screen 📱`, 'success', 3500);
        }
      }

      img.onload = () => {
        try {
          // 1. Draw blurred ambient background
          ctx.save();
          ctx.filter = 'blur(55px) brightness(0.62) saturate(1.8)';
          ctx.drawImage(img, -100, -100, canvas.width + 200, canvas.height + 200);
          ctx.restore();

          // 2. Dark vignette
          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, 'rgba(8, 10, 16, 0.45)');
          grad.addColorStop(0.35, 'rgba(8, 10, 16, 0.25)');
          grad.addColorStop(0.7, 'rgba(8, 10, 16, 0.65)');
          grad.addColorStop(1, 'rgba(8, 10, 16, 0.95)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 3. Central Album Art with rounded corners & deep shadow
          const artSize = 820;
          const artX = (canvas.width - artSize) / 2;
          const artY = 360;
          const radius = 54;

          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 60;
          ctx.shadowOffsetY = 30;

          ctx.beginPath();
          ctx.moveTo(artX + radius, artY);
          ctx.lineTo(artX + artSize - radius, artY);
          ctx.quadraticCurveTo(artX + artSize, artY, artX + artSize, artY + radius);
          ctx.lineTo(artX + artSize, artY + artSize - radius);
          ctx.quadraticCurveTo(artX + artSize, artY + artSize, artX + artSize - radius, artY + artSize);
          ctx.lineTo(artX + radius, artY + artSize);
          ctx.quadraticCurveTo(artX, artY + artSize, artX, artY + artSize - radius);
          ctx.lineTo(artX, artY + radius);
          ctx.quadraticCurveTo(artX, artY, artX + radius, artY);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, artX, artY, artSize, artSize);
          ctx.restore();

          // 4. Song Info
          ctx.save();
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 56px Inter, sans-serif';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 25;
          const displayTitle = cleanTitle.length > 26 ? cleanTitle.slice(0, 24) + '...' : cleanTitle;
          ctx.fillText(displayTitle, canvas.width / 2, 1280);

          ctx.fillStyle = '#c084fc';
          ctx.font = '600 38px Inter, sans-serif';
          const displayArtist = cleanArtist.length > 32 ? cleanArtist.slice(0, 30) + '...' : cleanArtist;
          ctx.fillText(displayArtist, canvas.width / 2, 1350);

          // 5. Pulse Logo Branding at bottom
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.font = '700 24px Inter, sans-serif';
          ctx.fillText('PULSE MUSIC • 320KBPS MASTER AUDIO', canvas.width / 2, 1800);
          ctx.restore();

          canvas.toBlob((blob) => {
            if (!blob) throw new Error('Canvas blob failed');
            const link = document.createElement('a');
            const fileName = `${cleanTitle} - Pulse Wallpaper.jpg`;
            const blobUrl = URL.createObjectURL(blob);
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(blobUrl);
            }, 2000);
            if (typeof window.showToast === 'function') {
              window.showToast(`🖼️ HD Wallpaper saved! Perfect for Phone & Desktop 📱`, 'success', 5000);
            }
          }, 'image/jpeg', 0.95);
        } catch (canvasErr) {
          triggerDirectDownload();
        }
      };

      img.onerror = () => {
        triggerDirectDownload();
      };

      img.src = hdCover;
    } catch (e) {
      window.open(sanitizeUrl(hdCover), '_blank', 'noopener,noreferrer');
    }
  };

  window.downloadCurrentTrackWallpaper = function() {
    window.downloadTrackWallpaper();
  };

  // ---------------------------------------------------------------------------
  // 2. MAIN SCREEN CATALOGUES & DISCOVERY SHELVES
  // ---------------------------------------------------------------------------

  window.renderNewReleasesShelf = async function(forceRefresh = false) {
    const container = document.getElementById('home-new-releases-container');
    if (!container) return;

    // Fast initial render from cached/verified drops
    let tracks = getCachedNewReleases();
    window.__freshNewReleases = tracks;
    renderReleaseCards(container, tracks);

    // Asynchronously fetch real-time fresh drops from Apple Music / YouTube RSS
    try {
      const fresh = await fetchFreshNewReleases(24);
      if (Array.isArray(fresh) && fresh.length > 0) {
        window.__freshNewReleases = fresh;
        renderReleaseCards(container, fresh);
      }
    } catch (e) {
      console.warn('[Pulse] Live new release fetch notice:', e);
    }
  };

  window.renderPersonalizedGreeting = function() {
    const greetingEl = document.getElementById('header-greeting');
    const greetingSub = document.getElementById('header-greeting-sub');
    if (!greetingEl) return;

    const now = new Date();
    const hour = now.getHours();
    let timeGreeting = 'Good evening';
    let timeIcon = 'fa-moon';
    let timeColor = '#818cf8';

    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning';
      timeIcon = 'fa-sun';
      timeColor = '#f59e0b';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
      timeIcon = 'fa-sun-cloud';
      timeColor = '#38bdf8';
    }

    let userName = 'Music Lover';
    try {
      const userSession = JSON.parse(localStorage.getItem('pulse_user_session') || '{}');
      if (userSession && userSession.displayName) {
        userName = userSession.displayName.split(' ')[0];
      }
    } catch(e) {}

    greetingEl.innerHTML = `<i class="fa-solid ${timeIcon}" style="color: ${timeColor}; font-size: 0.95rem;"></i> ${timeGreeting}, ${escapeHtml(userName)}`;
    if (greetingSub) {
      greetingSub.textContent = 'Welcome back to Pulse Midnight';
    }

    const headerUserName = document.getElementById('header-user-name');
    if (headerUserName) {
      headerUserName.textContent = userName !== 'Music Lover' ? userName : 'Profile';
    }
  };

  window.showNotificationToast = function() {
    if (typeof window.showToast === 'function') {
      window.showToast('Pulse Midnight Engine: 320kbps Studio Audio Online • Real-Time Synced Lyrics Connected', 'success', 3500);
    }
  };

  window.favoriteFeaturedTrack = function() {
    const topTrack = {
      id: "ytm-4NRXx6U8ABQ",
      ytId: "4NRXx6U8ABQ",
      title: "Blinding Lights",
      artist: "The Weeknd",
      coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/1000x1000bb.jpg",
      duration: 200,
      source: "Studio Master Audio (YouTube)"
    };
    const favBtn = document.getElementById('hero-favorite-btn');
    if (isFavorite(topTrack.id)) {
      removeFavorite(topTrack.id);
      if (favBtn) favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Save to Favorites';
      if (typeof window.showToast === 'function') window.showToast('Removed from Liked Songs', 'info', 2000);
    } else {
      addFavorite(topTrack);
      if (favBtn) favBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #f43f5e;"></i> Saved in Library';
      if (typeof window.showToast === 'function') window.showToast('Saved to Liked Songs ❤️', 'success', 2000);
    }
  };

  window.startFeaturedRadio = function() {
    if (window.PulsePlaybar && typeof window.PulsePlaybar.startRadioForCurrentTrack === 'function') {
      window.playPresetQuery('Blinding Lights The Weeknd');
      setTimeout(() => {
        if (window.PulsePlaybar && typeof window.PulsePlaybar.startRadioForCurrentTrack === 'function') {
          window.PulsePlaybar.startRadioForCurrentTrack();
        }
      }, 750);
    } else {
      window.playPresetQuery('The Weeknd');
    }
  };

  // Standardized Pulse Midnight Song Card Renderer
  window.renderSongCard = function(track, index, listGlobalKey, options = {}) {
    if (!track) return '';
    const trackId = track.id || (track.ytId ? `ytm-${track.ytId}` : `pulse-${index}`);
    const ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : '');
    const coverUrl = track.coverUrl || track.cover || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : './music-cover.svg');
    const title = track.title || 'Untitled Track';
    const artist = track.artist || 'Pulse Artist';
    const badge = options.badge || (options.showBadge ? (track.genre || 'Master') : null);

    const current = window.pulseState && window.pulseState.currentTrack;
    const isPlaying = window.pulseState && window.pulseState.isPlaying;
    const isCurrentActive = current && (
      current.id === trackId ||
      (ytId && current.ytId === ytId) ||
      (current.title === title && current.artist === artist)
    );
    const isFav = isFavorite(trackId);

    return `
      <div class="music-card hover-glow ${isCurrentActive && isPlaying ? 'card-active-playing' : ''}"
           data-track-id="${escapeHtml(trackId)}"
           data-yt-id="${escapeHtml(ytId)}"
           onclick="window.playTrackDirect(${listGlobalKey}[${index}], ${listGlobalKey})">
        <div class="card-image-wrapper">
          <img src="${coverUrl}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
          
          <!-- Corner Action Buttons: Favorite & More Options -->
          <div class="card-corner-actions" onclick="event.stopPropagation()">
            <button class="btn-card-action btn-card-fav ${isFav ? 'is-favorited' : ''}" 
                    title="${isFav ? 'Remove Favorite' : 'Save to Favorites'}" 
                    onclick="window.toggleCardFavorite(event, ${listGlobalKey}[${index}])">
              <i class="${isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
            </button>
            <button class="btn-card-action btn-card-more" 
                    title="More Options" 
                    onclick="window.toggleCardContextMenu(event, ${listGlobalKey}[${index}])">
              <i class="fa-solid fa-ellipsis"></i>
            </button>
          </div>

          <!-- Animated Equalizer Waveform when Playing -->
          <div class="card-playing-indicator ${isCurrentActive && isPlaying ? '' : 'hidden'}" title="Now Playing">
            <div class="card-eq-bars">
              <span class="eq-mini-bar eq-b1"></span>
              <span class="eq-mini-bar eq-b2"></span>
              <span class="eq-mini-bar eq-b3"></span>
              <span class="eq-mini-bar eq-b4"></span>
            </div>
          </div>

          <!-- Floating Play/Pause Overlay -->
          <div class="card-play-overlay">
            <button class="btn-card-play" title="Play Track">
              <i class="${isCurrentActive && isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'}"></i>
            </button>
          </div>

          ${badge ? `<span style="position: absolute; bottom: 8px; right: 8px; font-size: 0.65rem; font-weight: 700; background: rgba(7,8,11,0.88); backdrop-filter: blur(6px); color: #38bdf8; padding: 2px 7px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">${escapeHtml(badge)}</span>` : ''}
        </div>
        <div class="card-meta">
          <div class="card-title" title="${escapeHtml(title)}">${escapeHtml(title)}</div>
          <div class="card-artist" title="${escapeHtml(artist)}">${escapeHtml(artist)}</div>
        </div>
      </div>
    `;
  };

  window.toggleCardFavorite = function(event, track) {
    event.stopPropagation();
    if (!track) return;
    const trackId = track.id || (track.ytId ? `ytm-${track.ytId}` : null);
    if (!trackId) return;

    const btn = event.currentTarget;
    const icon = btn ? btn.querySelector('i') : null;

    if (isFavorite(trackId)) {
      removeFavorite(trackId);
      if (btn) btn.classList.remove('is-favorited');
      if (icon) icon.className = 'fa-regular fa-heart';
      if (typeof window.showToast === 'function') window.showToast('Removed from Liked Songs', 'info', 1800);
    } else {
      addFavorite(track);
      if (btn) btn.classList.add('is-favorited');
      if (icon) icon.className = 'fa-solid fa-heart';
      if (typeof window.showToast === 'function') window.showToast('Saved to Liked Songs ❤️', 'success', 1800);
    }
  };

  window.toggleCardContextMenu = function(event, track) {
    event.stopPropagation();
    const menu = document.getElementById('card-context-menu');
    if (!menu || !track) return;

    window.__activeContextTrack = track;

    const rect = event.currentTarget.getBoundingClientRect();
    menu.style.top = `${Math.min(rect.bottom + 6, window.innerHeight - 240)}px`;
    menu.style.left = `${Math.min(rect.left - 130, window.innerWidth - 210)}px`;

    menu.innerHTML = `
      <button class="context-menu-item" onclick="window.playTrackDirect(window.__activeContextTrack); window.closeCardContextMenu();">
        <i class="fa-solid fa-play" style="color: #38bdf8;"></i> Play Now
      </button>
      <button class="context-menu-item" onclick="window.queueTrackNext(window.__activeContextTrack); window.closeCardContextMenu();">
        <i class="fa-solid fa-forward-step" style="color: #818cf8;"></i> Play Next
      </button>
      <button class="context-menu-item" onclick="window.addToPlayQueue(window.__activeContextTrack); window.closeCardContextMenu();">
        <i class="fa-solid fa-list-ul" style="color: #a855f7;"></i> Add to Queue
      </button>
      <button class="context-menu-item" onclick="window.openAddToPlaylistModal(window.__activeContextTrack); window.closeCardContextMenu();">
        <i class="fa-solid fa-folder-plus" style="color: #ec4899;"></i> Add to Playlist
      </button>
      <button class="context-menu-item" onclick="window.shareTrack(window.__activeContextTrack); window.closeCardContextMenu();">
        <i class="fa-solid fa-share-nodes" style="color: #10b981;"></i> Share Music Link
      </button>

    `;

    menu.classList.remove('hidden');

    const closeHandler = () => {
      window.closeCardContextMenu();
      document.removeEventListener('click', closeHandler);
    };
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
    }, 50);
  };

  window.closeCardContextMenu = function() {
    const menu = document.getElementById('card-context-menu');
    if (menu) menu.classList.add('hidden');
  };

  window.queueTrackNext = function(track) {
    if (window.PulsePlaybar && typeof window.PulsePlaybar.addNext === 'function') {
      window.PulsePlaybar.addNext(track);
    } else if (typeof window.showToast === 'function') {
      window.showToast(`"${track.title}" will play next 🎵`, 'info', 2000);
    }
  };

  window.addToPlayQueue = function(track) {
    if (window.PulsePlaybar && typeof window.PulsePlaybar.addToQueue === 'function') {
      window.PulsePlaybar.addToQueue(track);
    } else if (typeof window.showToast === 'function') {
      window.showToast(`Added "${track.title}" to Queue 🎶`, 'success', 2000);
    }
  };

  window.updateActiveCardStates = function(currentTrack, isPlaying) {
    const cards = document.querySelectorAll('.music-card, .track-card');
    cards.forEach(card => {
      const cardId = card.getAttribute('data-track-id');
      const cardYtId = card.getAttribute('data-yt-id');
      const titleEl = card.querySelector('.card-title');
      const cardTitle = titleEl ? titleEl.textContent.trim() : '';
      const isMatch = currentTrack && (
        (cardId && cardId === currentTrack.id) ||
        (cardYtId && currentTrack.ytId && cardYtId === currentTrack.ytId) ||
        (cardYtId && currentTrack.id && currentTrack.id.includes(cardYtId)) ||
        (cardTitle && currentTrack.title && cardTitle === currentTrack.title.trim())
      );

      const indicator = card.querySelector('.card-playing-indicator');
      const playIcon = card.querySelector('.btn-card-play i, .btn-play-hover i');

      if (isMatch && isPlaying) {
        card.classList.add('card-active-playing');
        if (indicator) indicator.classList.remove('hidden');
        if (playIcon) playIcon.className = 'fa-solid fa-pause';
      } else {
        card.classList.remove('card-active-playing');
        if (indicator) indicator.classList.add('hidden');
        if (playIcon) playIcon.className = 'fa-solid fa-play';
      }
    });
  };

  // 1. RECENTLY PLAYED SHELF
  window.renderRecentlyPlayedShelf = async function() {
    const shelf = document.getElementById('home-recently-played-shelf');
    const container = document.getElementById('home-recently-played-container');
    if (!shelf || !container) return;

    try {
      const history = await getHistory(15);
      if (Array.isArray(history) && history.length > 0) {
        window.__recentlyPlayedHistory = history;
        shelf.style.display = 'block';
        container.innerHTML = history.map((track, idx) => 
          window.renderSongCard(track, idx, 'window.__recentlyPlayedHistory', { badge: 'Recent' })
        ).join('');
      } else {
        shelf.style.display = 'none';
      }
    } catch(e) {
      shelf.style.display = 'none';
    }
  };

  // 2. TRENDING NOW SHELF
  window.renderTrendingShelf = function() {
    const container = document.getElementById('home-trending-container');
    if (!container) return;

    const trendingCat = CATALOG_CATEGORIES.find(c => c.id === 'cat-trending');
    const tracks = trendingCat ? trendingCat.tracks : [];
    window.__trendingTracks = tracks;

    container.innerHTML = tracks.map((track, idx) => 
      window.renderSongCard(track, idx, 'window.__trendingTracks', { badge: 'Trending' })
    ).join('');
  };

  // 5. NEW RELEASES SHELF
  function renderReleaseCards(container, tracks) {
    if (!container || !Array.isArray(tracks) || tracks.length === 0) return;
    window.__freshNewReleases = tracks;
    container.innerHTML = tracks.map((track, idx) => 
      window.renderSongCard(track, idx, 'window.__freshNewReleases', { badge: 'New Drop' })
    ).join('');
  }

  window.refreshNewReleasesLive = function() {
    if (typeof window.showToast === 'function') {
      window.showToast('Checking for latest music releases worldwide... 🎵', 'info', 2000);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pulse_cached_new_releases_v2');
    }
    window.renderNewReleasesShelf(true);
  };

  // ---------------------------------------------------------------------------
  // 4. CINEMATIC HERO SHOWCASE CAROUSEL CONTROLLER (8 Curated Anthems & Strictly Inline 4K Videos)
  // ---------------------------------------------------------------------------
  let currentHeroSlideIndex = 0;
  let heroAutoPlayInterval = null;
  let isHeroPaused = false;
  let activeVideoSlideIndex = null;
  const HERO_SLIDE_DURATION_MS = 6000;

  window.initHeroCarousel = function() {
    const banner = document.getElementById('hero-banner');
    const track = document.getElementById('hero-slides-track');
    const pillsContainer = document.getElementById('hero-carousel-pills');
    if (!banner || !track || !pillsContainer) return;

    const slides = getHeroSlides();
    if (!Array.isArray(slides) || slides.length === 0) return;
    window.__heroSlides = slides;

    // 1. Render Slides Track
    track.innerHTML = slides.map((slide, idx) => {
      const isFav = typeof isFavorite === 'function' ? isFavorite(slide.id) : false;
      const artwork = slide.coverUrl || slide.artwork || './music-cover.svg';
      const videoYtId = slide.videoYtId || slide.youtubeId || '';
      const badgeText = slide.badgeText || slide.badge || 'FEATURED ANTHEM';
      const badgeIcon = slide.badgeIcon || 'fa-solid fa-bolt';
      const badgeColor = slide.badgeColor || '#38bdf8';
      const tagline = slide.artistRole || slide.tagline || 'Featured Global Anthem';
      const description = slide.subtitle || slide.description || '';

      return `
        <div class="hero-slide ${idx === currentHeroSlideIndex ? 'active-slide' : ''}" data-slide-index="${idx}">
          <div class="hero-content">
            <div class="hero-badge" style="border-color: ${badgeColor}33; color: ${badgeColor};">
              <span class="hero-live-dot" style="background: ${badgeColor};"></span>
              <i class="${badgeIcon}"></i> ${escapeHtml(badgeText)}
            </div>
            <h2 class="hero-title">${escapeHtml(slide.title)}</h2>
            <div class="hero-artist-tag">
              <i class="fa-solid fa-circle-check" style="font-size: 0.85rem; color: #38bdf8;"></i>
              <span>${escapeHtml(slide.artist)}</span> • ${escapeHtml(tagline)}
            </div>
            <p class="hero-subtitle">${escapeHtml(description)}</p>
            <div class="hero-actions">
              <button class="btn-primary-play" onclick="window.playHeroSlideTrack(${idx})" title="Play Full Anthem in Pulse Audio Engine">
                <i class="fa-solid fa-play"></i> Play Anthem
              </button>
              <button class="btn-hero-video" onclick="window.toggleSlidePreview(${idx}, true)" title="Watch Video Preview strictly inside this slide">
                <i class="fa-solid fa-film"></i> Video Preview
              </button>
              <button class="btn-hero-secondary" onclick="window.toggleFavoriteHeroSlide(${idx})" title="Save to Favorites">
                <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart" id="hero-fav-icon-${idx}" style="${isFav ? 'color: #f43f5e;' : ''}"></i>
              </button>
            </div>
          </div>
          <div class="hero-media-wrapper" id="hero-media-wrapper-${idx}">
            <!-- Artwork Card Mode (Default) -->
            <div class="hero-media-artwork-box" id="hero-media-artwork-${idx}" onclick="window.toggleSlidePreview(${idx}, true)" title="Click to watch Video Preview">
              <img src="${artwork}" alt="${escapeHtml(slide.title)}" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
              <div class="hero-artwork-play-overlay">
                <i class="fa-solid fa-play"></i>
              </div>
              <div class="hero-video-badge-pill">
                <i class="fa-solid fa-film" style="color: #38bdf8;"></i> Video Preview
              </div>
            </div>
            <!-- Strict Inline Video Preview Mode (Pure preview loop, no YouTube player chrome) -->
            <div class="hero-media-video-box" id="hero-media-video-${idx}"></div>
          </div>
        </div>
      `;
    }).join('');

    // 2. Render Navigation Pills
    pillsContainer.innerHTML = slides.map((slide, idx) => `
      <div class="hero-pill-dot ${idx === currentHeroSlideIndex ? 'active-pill' : ''}" data-pill-index="${idx}" onclick="window.goToHeroSlide(${idx})" title="${escapeHtml(slide.title)} - ${escapeHtml(slide.artist)}">
        <div class="hero-pill-progress"></div>
      </div>
    `).join('');

    // 3. Set Ambient Backdrop for initial slide
    window.updateHeroAmbientBackdrop(currentHeroSlideIndex);

    // 4. Setup Auto-Play & Event Listeners once
    if (!window.__heroListenersAttached) {
      window.__heroListenersAttached = true;

      // Banner Hover Pause / Resume
      // Disabled pause on hover per user request
      // banner.addEventListener('mouseenter', () => window.pauseHeroAutoPlay());
      // banner.addEventListener('mouseleave', () => window.resumeHeroAutoPlay());

      // Touch Swipe Gesture for Mobile & Tablets
      let touchStartX = 0;
      let touchStartY = 0;
      banner.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        }
      }, { passive: true });

      banner.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const deltaX = e.changedTouches[0].screenX - touchStartX;
          const deltaY = e.changedTouches[0].screenY - touchStartY;
          if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
              window.nextHeroSlide();
            } else {
              window.prevHeroSlide();
            }
          }
        }
      }, { passive: true });

      // Keyboard Arrow Controls
      document.addEventListener('keydown', (e) => {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea') return;
        const homeView = document.getElementById('view-home');
        if (!homeView || !homeView.classList.contains('active-view')) return;
        if (e.key === 'ArrowRight') {
          window.nextHeroSlide();
        } else if (e.key === 'ArrowLeft') {
          window.prevHeroSlide();
        }
      });
    }

    // 5. Start Auto-Play Timer
    window.startHeroAutoPlayTimer();
  };

  window.updateHeroAmbientBackdrop = function(slideIndex) {
    const slides = window.__heroSlides || getHeroSlides();
    const slide = slides[slideIndex];
    if (!slide) return;

    const artwork = slide.coverUrl || slide.artwork;
    const bgArt = document.getElementById('hero-bg-artwork');
    if (bgArt && artwork) {
      bgArt.style.backgroundImage = `url('${artwork}')`;
    }
    const bgOverlay = document.getElementById('hero-bg-overlay');
    if (bgOverlay) {
      const accent = slide.badgeColor || slide.accentColor || '#6366f1';
      bgOverlay.style.background = `radial-gradient(circle at 75% 40%, ${accent}33, transparent 65%), linear-gradient(90deg, rgba(8, 10, 18, 0.96) 0%, rgba(8, 10, 18, 0.72) 55%, rgba(8, 10, 18, 0.88) 100%)`;
    }
  };

  window.goToHeroSlide = function(targetIndex) {
    const slides = window.__heroSlides || getHeroSlides();
    if (!Array.isArray(slides) || slides.length === 0) return;

    // If a video preview is active in the current slide, close it cleanly before transitioning
    if (activeVideoSlideIndex !== null) {
      window.toggleSlidePreview(activeVideoSlideIndex, false);
    }

    const nextIndex = (targetIndex + slides.length) % slides.length;
    currentHeroSlideIndex = nextIndex;

    // Update Slide Elements
    const slideEls = document.querySelectorAll('.hero-slide');
    slideEls.forEach((el, idx) => {
      if (idx === nextIndex) {
        el.classList.add('active-slide');
      } else {
        el.classList.remove('active-slide');
      }
    });

    // Auto-play the video preview automatically for the new slide
    setTimeout(() => {
      window.toggleSlidePreview(nextIndex, true);
    }, 400);

    // Update Pills and trigger fresh fill animation
    const pillEls = document.querySelectorAll('.hero-pill-dot');
    pillEls.forEach((pill, idx) => {
      const prog = pill.querySelector('.hero-pill-progress');
      if (idx === nextIndex) {
        pill.classList.add('active-pill');
        if (prog) {
          prog.style.animation = 'none';
          void prog.offsetWidth; // Trigger browser reflow
          prog.style.animation = '';
        }
      } else {
        pill.classList.remove('active-pill');
        if (prog) {
          prog.style.animation = 'none';
        }
      }
    });

    // Update ambient backdrop
    window.updateHeroAmbientBackdrop(nextIndex);

    // Restart timer for the fresh slide if not paused
    if (!isHeroPaused && activeVideoSlideIndex === null) {
      window.startHeroAutoPlayTimer();
    }
  };

  window.nextHeroSlide = function() {
    window.goToHeroSlide(currentHeroSlideIndex + 1);
  };

  window.prevHeroSlide = function() {
    window.goToHeroSlide(currentHeroSlideIndex - 1);
  };

  window.startHeroAutoPlayTimer = function() {
    if (heroAutoPlayInterval) {
      clearInterval(heroAutoPlayInterval);
    }
    heroAutoPlayInterval = setInterval(() => {
      window.nextHeroSlide();
    }, HERO_SLIDE_DURATION_MS);
  };

  window.pauseHeroAutoPlay = function() {
    // Disabled per user request (play continuously)
  };

  window.resumeHeroAutoPlay = function() {
    // Disabled per user request
  };

  // Strictly Inline Video Preview Toggle (Pure Preview Clip, No YouTube Player UI)
  window.__previewMutedMap = {};

  window.toggleSlidePreview = function(slideIndex, play, event) {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }

    const slides = window.__heroSlides || getHeroSlides();
    const slide = slides[slideIndex];
    if (!slide) return;

    // If slide is not currently in view, switch to it
    if (currentHeroSlideIndex !== slideIndex) {
      window.goToHeroSlide(slideIndex);
    }

    const artBox = document.getElementById(`hero-media-artwork-${slideIndex}`);
    const vidBox = document.getElementById(`hero-media-video-${slideIndex}`);
    if (!artBox || !vidBox) return;

    const videoYtId = slide.videoYtId || slide.youtubeId || '';
    const previewStart = slide.previewStart || 24;

    if (play) {
      // 1. Close any other slide preview if active
      if (activeVideoSlideIndex !== null && activeVideoSlideIndex !== slideIndex) {
        window.toggleSlidePreview(activeVideoSlideIndex, false);
      }

      // 2. Pause hero carousel auto-advance while previewing
      window.pauseHeroAutoPlay();
      activeVideoSlideIndex = slideIndex;
      window.__previewMutedMap[slideIndex] = true; // start muted for safe autoplay

      // 3. Hide Artwork Box and Reveal clean looping Preview Box
      artBox.style.display = 'none';
      vidBox.classList.add('active-video');
      vidBox.innerHTML = `
        <div class="hero-video-preview-inner">
          <iframe
            id="hero-preview-iframe-${slideIndex}"
            src="https://www.youtube-nocookie.com/embed/${videoYtId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoYtId}&start=${previewStart}&modestbranding=1&rel=0&playsinline=1&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1"
            class="hero-preview-iframe"
            tabindex="-1"
            loading="lazy"
            allow="autoplay; encrypted-media">
          </iframe>
          <div class="hero-preview-glass-overlay">
            <div class="preview-top-bar">
              <div class="preview-badge-pill">
                <span class="preview-pulse-dot"></span>
                <i class="fa-solid fa-film"></i> PREVIEW
              </div>
              <div class="preview-actions-group">
                <button class="btn-preview-tool" id="btn-preview-audio-${slideIndex}" onclick="window.togglePreviewMute(${slideIndex}, event)" title="Toggle Sound">
                  <i class="fa-solid fa-volume-xmark" id="preview-mute-icon-${slideIndex}"></i>
                </button>
                <button class="btn-preview-tool close-btn" onclick="window.toggleSlidePreview(${slideIndex}, false, event)" title="Return to Album Artwork">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
            <div class="preview-bottom-bar">
              <span class="preview-caption-tag">${escapeHtml(slide.title)} • Video Preview</span>
              <button class="btn-preview-tool" onclick="window.playHeroSlideTrack(${slideIndex})" title="Play Full Anthem in Pulse">
                <i class="fa-solid fa-play"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // 1. Destroy iframe immediately to stop all video/audio playback
      vidBox.innerHTML = '';
      vidBox.classList.remove('active-video');

      // 2. Restore Artwork Box
      artBox.style.display = 'flex';
      activeVideoSlideIndex = null;

      // 3. Resume auto-play
      window.resumeHeroAutoPlay();
    }
  };

  // Alias for backwards compatibility
  window.toggleSlideVideo = window.toggleSlidePreview;

  // Toggle audio of the video preview (Mute / Unmute)
  window.togglePreviewMute = function(slideIndex, event) {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    const iframe = document.getElementById(`hero-preview-iframe-${slideIndex}`);
    const icon = document.getElementById(`preview-mute-icon-${slideIndex}`);
    if (!iframe) return;

    const isCurrentlyMuted = window.__previewMutedMap[slideIndex] !== false; // default true
    if (isCurrentlyMuted) {
      // Unmute preview
      try {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: '' }), '*');
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [80] }), '*');
      } catch (e) {}
      window.__previewMutedMap[slideIndex] = false;
      if (icon) {
        icon.className = 'fa-solid fa-volume-high';
        icon.style.color = '#38bdf8';
      }
      // If Pulse background audio is playing, pause it to prevent clash
      if (window.PulsePlaybar && typeof window.PulsePlaybar.pause === 'function') {
        window.PulsePlaybar.pause();
      }
    } else {
      // Mute preview
      try {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: '' }), '*');
      } catch (e) {}
      window.__previewMutedMap[slideIndex] = true;
      if (icon) {
        icon.className = 'fa-solid fa-volume-xmark';
        icon.style.color = '';
      }
    }
  };

  // Play anthem directly inside Pulse Audio Engine
  window.playHeroSlideTrack = function(slideIndex) {
    const slides = window.__heroSlides || getHeroSlides();
    const slide = slides[slideIndex];
    if (!slide) return;

    // If video was open in this slide, close it
    if (activeVideoSlideIndex === slideIndex) {
      window.toggleSlideVideo(slideIndex, false);
    }

    const artwork = slide.coverUrl || slide.artwork || './music-cover.svg';
    const videoYtId = slide.videoYtId || slide.youtubeId;

    const track = {
      id: slide.id,
      ytId: videoYtId,
      title: slide.title,
      artist: slide.artist,
      coverUrl: artwork,
      duration: slide.durationSeconds || 200,
      source: "Featured Showcase Anthem (YouTube)"
    };

    const queue = slides.map(s => ({
      id: s.id,
      ytId: s.videoYtId || s.youtubeId,
      title: s.title,
      artist: s.artist,
      coverUrl: s.coverUrl || s.artwork || './music-cover.svg',
      duration: s.durationSeconds || 200,
      source: "Featured Showcase Anthem (YouTube)"
    }));

    window.playTrackDirect(track, queue);
  };

  // Toggle favorite for slide track
  window.toggleFavoriteHeroSlide = async function(slideIndex) {
    const slides = window.__heroSlides || getHeroSlides();
    const slide = slides[slideIndex];
    if (!slide) return;

    const artwork = slide.coverUrl || slide.artwork || './music-cover.svg';
    const videoYtId = slide.videoYtId || slide.youtubeId;

    const track = {
      id: slide.id,
      ytId: videoYtId,
      title: slide.title,
      artist: slide.artist,
      coverUrl: artwork,
      duration: slide.durationSeconds || 200,
      source: "Featured Showcase Anthem (YouTube)"
    };

    const icon = document.getElementById(`hero-fav-icon-${slideIndex}`);
    const isAlreadyFav = typeof isFavorite === 'function' ? isFavorite(slide.id) : false;

    if (isAlreadyFav) {
      if (typeof removeFavorite === 'function') await removeFavorite(slide.id);
      if (icon) {
        icon.className = 'fa-regular fa-heart';
        icon.style.color = '';
      }
      if (window.showToast) window.showToast(`Removed "${slide.title}" from Favorites.`, 'info', 2500);
    } else {
      if (typeof addFavorite === 'function') await addFavorite(track);
      if (icon) {
        icon.className = 'fa-solid fa-heart';
        icon.style.color = '#f43f5e';
      }
      if (window.showToast) window.showToast(`❤️ Added "${slide.title}" to Favorites!`, 'success', 2500);
    }
  };

  // Backwards compatibility helpers
  window.favoriteFeaturedTrack = function() {
    window.toggleFavoriteHeroSlide(currentHeroSlideIndex);
  };

  window.startFeaturedRadio = function() {
    window.playHeroSlideTrack(currentHeroSlideIndex);
  };

  window.renderHomeDiscovery = function() {
    // 0. Initialize Showcase Hero Carousel
    window.initHeroCarousel();

    // Top Greeting
    window.renderPersonalizedGreeting();

    // 1. Recently Played
    window.renderRecentlyPlayedShelf();
    
    // 1.5 User Playlists
    if (window.renderUserPlaylistsShelf) {
      window.renderUserPlaylistsShelf();
    }

    // 2. Trending Now
    window.renderTrendingShelf();

    // 3. Popular Songs (Quick Picks Grid)
    const qpContainer = document.getElementById('home-quick-picks-container');
    if (qpContainer) {
      const qpList = getQuickPicks(6);
      window.__quickPicks = qpList;
      qpContainer.innerHTML = qpList.map((track, idx) => `
        <div class="quick-pick-tile hover-glow" onclick="window.playTrackDirect(window.__quickPicks[${idx}], window.__quickPicks)" style="cursor: pointer; display: flex; align-items: center; gap: 0.85rem; background: rgba(255,255,255,0.035); border: 1px solid var(--border-glass); border-radius: 12px; padding: 0.5rem; transition: all 0.25s ease;">
          <img src="${track.coverUrl || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : './music-cover.svg')}" alt="${escapeHtml(track.title)}" class="qp-thumb" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
          <div class="qp-info" style="flex: 1; overflow: hidden;">
            <div class="qp-title" style="font-size: 0.95rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</div>
            <div class="qp-artist" style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(track.artist)}">${escapeHtml(track.artist)}</div>
          </div>
          <button class="qp-play-btn btn-circle-play" style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-right: 0.5rem;" title="Play Now">
            <i class="fa-solid fa-play" style="font-size: 0.85rem;"></i>
          </button>
        </div>
      `).join('');
    }

    // 4. Popular Artists
    const artContainer = document.getElementById('home-featured-artists-container');
    if (artContainer) {
      const artists = getFeaturedArtists();
      window.__featuredArtists = artists;
      artContainer.innerHTML = artists.map((art) => `
        <div class="artist-card-item hover-glow" onclick="window.openArtistView('${art.name.replace(/'/g, "\\'")}')" style="min-width: 140px; text-align: center; cursor: pointer; flex-shrink: 0;">
          <div class="artist-avatar-wrap" style="position: relative; width: 120px; height: 120px; margin: 0 auto 0.75rem auto; border-radius: 50%; overflow: hidden; border: 2px solid var(--border-glass); box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
            <img src="${art.avatar || './music-cover.svg'}" alt="${escapeHtml(art.name)}" class="artist-avatar-img" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
            <div class="artist-play-hover" style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
              <i class="fa-solid fa-play" style="color: #fff; font-size: 1.5rem;"></i>
            </div>
          </div>
          <div class="artist-card-name" style="font-size: 0.95rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(art.name)}</div>
          <div class="artist-card-role" style="font-size: 0.75rem; color: #a5b4fc; margin-top: 2px;"><i class="fa-solid fa-circle-check" style="color: #38bdf8; font-size: 0.65rem;"></i> ${escapeHtml(art.genre.split('/')[0])}</div>
        </div>
      `).join('');
    }

    // 5. New Releases Shelf
    window.renderNewReleasesShelf();

    // 6. Recommended For You (Smart Seed)
    const recContainer = document.getElementById('home-similar-shelf-tracks');
    if (recContainer) {
      const popCat = CATALOG_CATEGORIES.find(c => c.id === 'cat-english-pop') || CATALOG_CATEGORIES[0];
      const recTracks = popCat ? popCat.tracks : [];
      window.__homeRecTracks = recTracks;
      recContainer.innerHTML = recTracks.map((track, idx) => 
        window.renderSongCard(track, idx, 'window.__homeRecTracks', { badge: 'Recommended' })
      ).join('');
    }

    // 6.5 Movie Soundtracks Shelf (Same Movie Songs)
    if (typeof window.renderMoviePlaylistsShelf === 'function') {
      window.renderMoviePlaylistsShelf();
    }

    // 6.6 Pulse Vibe & Mood Mixes Shelf (Same Vibe Songs)
    if (typeof window.renderVibePlaylistsShelf === 'function') {
      window.renderVibePlaylistsShelf();
    }

    // 6.7 Dynamic Same-Vibe Radio Shelf ("Because You Listened To...")
    if (typeof window.renderCurrentVibeShelf === 'function') {
      window.renderCurrentVibeShelf();
    }

    // 7. Curated Playlists Carousel
    const plContainer = document.getElementById('home-curated-playlists-container');
    if (plContainer) {
      const playlists = getCuratedPlaylists();
      window.__curatedPlaylists = playlists;
      plContainer.innerHTML = playlists.map((pl, idx) => `
        <div class="curated-playlist-card hover-glow" onclick="window.playCuratedPlaylist(${idx})" style="min-width: 200px; width: 200px; flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 16px; padding: 1rem; cursor: pointer; transition: all 0.25s ease;">
          <div class="curated-cover-wrap" style="position: relative; width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; margin-bottom: 0.75rem;">
            ${window.getPlaylistCoverHtml(pl, false)}
            <span class="curated-badge" style="position: absolute; top: 8px; right: 8px; font-size: 0.7rem; font-weight: 700; background: rgba(0,0,0,0.8); color: #c084fc; padding: 2px 8px; border-radius: 12px; z-index: 2;">${pl.trackCount} Tracks</span>
          </div>
          <div class="curated-meta">
            <h4 class="curated-title" style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(pl.title)}</h4>
            <p class="curated-desc" style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(pl.description)}</p>
          </div>
        </div>
      `).join('');
    }

    // 8. Dynamic Genre & Mood Shelves
    const shelvesContainer = document.getElementById('dynamic-home-shelves');
    if (shelvesContainer && CATALOG_CATEGORIES && CATALOG_CATEGORIES.length > 0) {
      window.__catalogCategories = CATALOG_CATEGORIES;
      shelvesContainer.innerHTML = CATALOG_CATEGORIES.map((cat, cIdx) => `
        <section class="music-shelf-section" id="shelf-${cat.id}" style="margin-bottom: 2.5rem;">
          <div class="shelf-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div>
              <h3 class="shelf-title" style="font-size: 1.3rem; font-weight: 800; color: #fff; margin: 0;">
                <i class="fa-solid ${cat.icon}" style="color: ${cat.color}; margin-right: 8px;"></i> ${cat.title}
              </h3>
              <p class="shelf-subtitle" style="font-size: 0.8rem; color: #b3b3b3; margin-top: 2px;">${cat.subtitle}</p>
            </div>
            <button class="btn-see-all" onclick="window.playPresetQuery('${cat.title}')" style="background: none; border: none; color: #818cf8; font-size: 0.82rem; font-weight: 700; cursor: pointer;">Explore All <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i></button>
          </div>
          <div class="shelf-carousel" style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.85rem;">
            ${cat.tracks.map((t, tIdx) => 
              window.renderSongCard(t, tIdx, `window.__catalogCategories[${cIdx}].tracks`, { badge: 'Studio Master' })
            ).join('')}
          </div>
        </section>
      `).join('');
    }

    // 9. Regional Language Hubs
    const langContainer = document.getElementById('language-shelves-container');
    if (langContainer && LANGUAGE_PLAYLISTS && LANGUAGE_PLAYLISTS.length > 0) {
      window.__langPlaylists = LANGUAGE_PLAYLISTS;
      langContainer.innerHTML = LANGUAGE_PLAYLISTS.map((lang, lIdx) => `
        <section class="music-shelf-section" id="lang-shelf-${lang.id}" style="margin-bottom: 2.5rem;">
          <div class="shelf-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div>
              <h3 class="shelf-title" style="font-size: 1.3rem; font-weight: 800; color: #fff; margin: 0;">
                <i class="fa-solid ${lang.meta.icon}" style="color: ${lang.meta.color}; margin-right: 8px;"></i> ${escapeHtml(lang.meta.title)}
              </h3>
              <p class="shelf-subtitle" style="font-size: 0.8rem; color: #b3b3b3; margin-top: 2px;">${escapeHtml(lang.meta.subtitle)}</p>
            </div>
            <button class="btn-see-all" onclick="window.playPresetQuery('${lang.meta.title}')" style="background: none; border: none; color: #818cf8; font-size: 0.82rem; font-weight: 700; cursor: pointer;">See All <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i></button>
          </div>
          <div class="shelf-carousel" style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.85rem;">
            ${lang.tracks.map((track, tIdx) => 
              window.renderSongCard(track, tIdx, `window.__langPlaylists[${lIdx}].tracks`, { badge: 'Studio Master' })
            ).join('')}
          </div>
        </section>
      `).join('');
    }
  };

  window.playCatalogTrack = function(cIdx, tIdx) {
    const category = window.__catalogCategories?.[cIdx];
    if (category && category.tracks && category.tracks[tIdx]) {
      const t = category.tracks[tIdx];
      const normalizedTrack = {
        id: t.id || (t.ytId ? `ytm-${t.ytId}` : `pulse-${Math.random()}`),
        ytId: t.ytId,
        title: t.title,
        artist: t.artist,
        coverUrl: t.cover || t.coverUrl || (t.ytId ? `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg` : './music-cover.svg'),
        duration: t.duration || 220,
        source: "Studio Master Audio (YouTube)"
      };
      const queue = category.tracks.map(item => ({
        id: item.id || (item.ytId ? `ytm-${item.ytId}` : `pulse-${Math.random()}`),
        ytId: item.ytId,
        title: item.title,
        artist: item.artist,
        coverUrl: item.cover || item.coverUrl || (item.ytId ? `https://i.ytimg.com/vi/${item.ytId}/hqdefault.jpg` : './music-cover.svg'),
        duration: item.duration || 220,
        source: "Studio Master Audio (YouTube)"
      }));
      window.playTrackDirect(normalizedTrack, queue);
    }
  };

  window.playLanguageTrack = function(lIdx, tIdx) {
    const lang = window.__langPlaylists?.[lIdx];
    if (lang && lang.tracks && lang.tracks[tIdx]) {
      const t = lang.tracks[tIdx];
      const normalizedTrack = {
        id: t.id || (t.ytId ? `ytm-${t.ytId}` : `pulse-${Math.random()}`),
        ytId: t.ytId,
        title: t.title,
        artist: t.artist,
        coverUrl: t.coverUrl || t.cover || (t.ytId ? `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg` : './music-cover.svg'),
        duration: t.duration || 220,
        source: "Studio Master Audio (YouTube)"
      };
      const queue = lang.tracks.map(item => ({
        id: item.id || (item.ytId ? `ytm-${item.ytId}` : `pulse-${Math.random()}`),
        ytId: item.ytId,
        title: item.title,
        artist: item.artist,
        coverUrl: item.coverUrl || item.cover || (item.ytId ? `https://i.ytimg.com/vi/${item.ytId}/hqdefault.jpg` : './music-cover.svg'),
        duration: item.duration || 220,
        source: "Studio Master Audio (YouTube)"
      }));
      window.playTrackDirect(normalizedTrack, queue);
    }
  };

  window.playCuratedPlaylist = function(idx) {
    const pl = window.__curatedPlaylists?.[idx];
    if (pl) {
      window.openPlaylistView(pl);
    }
  };

  // ---------------------------------------------------------------------------
  // PULSE MOVIE SOUNDTRACKS & VIBE MIXES SHELVES
  // ---------------------------------------------------------------------------

  window.renderMoviePlaylistsShelf = function() {
    const container = document.getElementById('home-movie-playlists-container');
    if (!container) return;
    const moviePlaylists = typeof getMoviePlaylists === 'function' ? getMoviePlaylists() : [];
    window.__moviePlaylists = moviePlaylists;

    container.innerHTML = moviePlaylists.map((pl, idx) => `
      <div class="pulse-playlist-card hover-glow" onclick="window.openMoviePlaylistView(${idx})" title="View album: ${escapeHtml(pl.title)}" style="cursor: pointer;">
        <div class="pulse-card-cover-wrap">
          ${window.getPlaylistCoverHtml(pl, false)}
          <span class="pulse-card-badge" style="background: rgba(0,0,0,0.78); color: #f59e0b; border-color: rgba(245, 158, 11, 0.35);">
            <i class="fa-solid fa-film" style="margin-right: 4px;"></i> ${escapeHtml(pl.badge || 'OST')}
          </span>
          <button class="pulse-card-play-btn btn-circle-play" onclick="event.stopPropagation(); window.playMoviePlaylist(${idx})" title="Play entire ${escapeHtml(pl.title)} album">
            <i class="fa-solid fa-play" style="font-size: 1rem; margin-left: 2px;"></i>
          </button>
        </div>
        <div class="pulse-card-title" title="${escapeHtml(pl.title)}">${escapeHtml(pl.title)}</div>
        <div class="pulse-card-subtitle" title="${escapeHtml(pl.description)}">${escapeHtml(pl.description)}</div>
        <div class="pulse-card-footer">
          <span style="color: #cbd5e1;"><i class="fa-solid fa-music" style="color: #f59e0b; margin-right: 4px;"></i> ${pl.tracks?.length || 0} Songs</span>
          <span style="color: #94a3b8; font-weight: 700;">${escapeHtml(pl.year || '')}</span>
        </div>
      </div>
    `).join('');
  };

  window.renderVibePlaylistsShelf = function() {
    const container = document.getElementById('home-vibe-playlists-container');
    if (!container) return;
    const vibePlaylists = typeof getVibePlaylists === 'function' ? getVibePlaylists() : [];
    window.__vibePlaylists = vibePlaylists;

    container.innerHTML = vibePlaylists.map((pl, idx) => `
      <div class="pulse-playlist-card hover-glow" onclick="window.openVibePlaylistView(${idx})" title="Explore vibe: ${escapeHtml(pl.title)}" style="cursor: pointer;">
        <div class="pulse-card-cover-wrap">
          ${window.getPlaylistCoverHtml(pl, false)}
          <span class="pulse-card-badge" style="background: rgba(0,0,0,0.78); color: ${pl.vibeColor || '#a855f7'}; border-color: ${pl.vibeColor ? pl.vibeColor + '55' : 'rgba(168,85,247,0.35)'};">
            <i class="fa-solid fa-wave-pulse" style="margin-right: 4px;"></i> ${escapeHtml(pl.vibeBadge || 'VIBE')}
          </span>
          <button class="pulse-card-play-btn btn-circle-play" style="background: linear-gradient(135deg, ${pl.vibeColor || '#6366f1'} 0%, #4f46e5 100%);" onclick="event.stopPropagation(); window.playVibePlaylist(${idx})" title="Play ${escapeHtml(pl.title)} mix">
            <i class="fa-solid fa-play" style="font-size: 1rem; margin-left: 2px;"></i>
          </button>
        </div>
        <div class="pulse-card-title" title="${escapeHtml(pl.title)}">${escapeHtml(pl.title)}</div>
        <div class="pulse-card-subtitle" title="${escapeHtml(pl.description)}">${escapeHtml(pl.description)}</div>
        <div class="pulse-card-footer">
          <span style="color: #cbd5e1;"><i class="fa-solid fa-compact-disc" style="color: ${pl.vibeColor || '#a855f7'}; margin-right: 4px;"></i> ${pl.tracks?.length || 0} Tracks</span>
          <span style="color: ${pl.vibeColor || '#a855f7'}; font-weight: 700;">Curated</span>
        </div>
      </div>
    `).join('');
  };

  window.openMoviePlaylistView = function(idx) {
    const pl = window.__moviePlaylists?.[idx];
    if (pl) {
      window.openPlaylistView(pl);
    }
  };

  window.playMoviePlaylist = function(idx) {
    const pl = window.__moviePlaylists?.[idx];
    if (pl && pl.tracks && pl.tracks.length > 0) {
      const queue = pl.tracks.map(t => ({
        id: t.id || (t.ytId ? `ytm-${t.ytId}` : `pulse-${Math.random()}`),
        ytId: t.ytId,
        title: t.title,
        artist: t.artist,
        coverUrl: t.coverUrl || t.cover || (t.ytId ? `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg` : './music-cover.svg'),
        duration: t.duration || 220,
        source: `Soundtrack: ${pl.movie || pl.title}`
      }));
      window.playTrackDirect(queue[0], queue);
      window.showToast(`Playing ${pl.title}...`, 'info');
    }
  };

  window.openVibePlaylistView = function(idx) {
    const pl = window.__vibePlaylists?.[idx];
    if (pl) {
      window.openPlaylistView(pl);
    }
  };

  window.playVibePlaylist = function(idx) {
    const pl = window.__vibePlaylists?.[idx];
    if (pl && pl.tracks && pl.tracks.length > 0) {
      const queue = pl.tracks.map(t => ({
        id: t.id || (t.ytId ? `ytm-${t.ytId}` : `pulse-${Math.random()}`),
        ytId: t.ytId,
        title: t.title,
        artist: t.artist,
        coverUrl: t.coverUrl || t.cover || (t.ytId ? `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg` : './music-cover.svg'),
        duration: t.duration || 220,
        source: `Vibe Mix: ${pl.title}`
      }));
      window.playTrackDirect(queue[0], queue);
      window.showToast(`Playing ${pl.title}...`, 'info');
    }
  };

  window.renderCurrentVibeShelf = async function(seed = null) {
    const shelfSection = document.getElementById('shelf-current-vibe');
    const tracksContainer = document.getElementById('home-current-vibe-tracks');
    const titleEl = document.getElementById('current-vibe-shelf-title');
    const subtitleEl = document.getElementById('current-vibe-shelf-subtitle');
    if (!shelfSection || !tracksContainer) return;

    let seedTrack = seed || window.pulseState?.currentTrack;
    if (!seedTrack && window.__recentlyPlayedHistory && window.__recentlyPlayedHistory.length > 0) {
      seedTrack = window.__recentlyPlayedHistory[0];
    }
    if (!seedTrack && typeof getQuickPicks === 'function') {
      const qp = getQuickPicks(1);
      if (qp.length > 0) seedTrack = qp[0];
    }
    if (!seedTrack) return;

    const detected = typeof detectTrackVibe === 'function' 
      ? detectTrackVibe(seedTrack) 
      : { vibe: 'Global Pop', badge: 'Matched Vibe', color: '#38bdf8' };

    if (titleEl) {
      titleEl.innerHTML = `${escapeHtml(detected.vibe)} <span style="font-size: 0.75rem; font-weight: 600; color: ${detected.color || '#38bdf8'}; vertical-align: middle; margin-left: 6px;">(${escapeHtml(detected.badge)})</span>`;
    }
    if (subtitleEl) {
      subtitleEl.textContent = `Because you listened to "${seedTrack.title}" — similar rhythm, mood & tempo`;
    }

    try {
      let similar = [];
      if (typeof getSimilarTracks === 'function') {
        similar = await getSimilarTracks(seedTrack, 10);
      }
      if (!similar || similar.length === 0) {
        const cat = (CATALOG_CATEGORIES || []).find(c => c.tracks && c.tracks.length > 0);
        similar = cat ? cat.tracks.slice(0, 8) : [];
      }

      window.__currentVibeTracks = similar;
      tracksContainer.innerHTML = similar.map((t, idx) => 
        window.renderSongCard(t, idx, 'window.__currentVibeTracks', { badge: detected.badge || 'Matched Vibe' })
      ).join('');

      shelfSection.style.display = 'block';
    } catch (err) {
      console.warn('Error loading dynamic vibe shelf:', err);
    }
  };

  let vibeUpdateDebounce = null;
  window.updateCurrentVibeShelf = function(track) {
    if (!track) return;
    if (vibeUpdateDebounce) clearTimeout(vibeUpdateDebounce);
    vibeUpdateDebounce = setTimeout(() => {
      window.renderCurrentVibeShelf(track);
    }, 600);
  };

  window.playCurrentVibeRadio = function() {
    if (window.__currentVibeTracks && window.__currentVibeTracks.length > 0) {
      window.playTrackDirect(window.__currentVibeTracks[0], window.__currentVibeTracks);
      window.showToast('Starting Vibe Radio...', 'info');
    }
  };

  window.filterHomeGenre = function(genreKey, btn) {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active-pill', 'pill-cyan'));
    if (btn) btn.classList.add('active-pill', 'pill-cyan');

    if (genreKey === 'all') {
      document.querySelectorAll('.music-shelf-section').forEach(s => s.style.display = 'block');
      const qpSection = document.querySelector('.quick-picks-section');
      if (qpSection) qpSection.style.display = 'block';
    } else {
      let matchedCount = 0;
      document.querySelectorAll('.music-shelf-section').forEach(s => {
        const id = (s.id || '').toLowerCase();
        if (id.includes(genreKey.toLowerCase())) {
          s.style.display = 'block';
          matchedCount++;
        } else {
          s.style.display = 'none';
        }
      });
      const qpSection = document.querySelector('.quick-picks-section');
      if (qpSection) {
        qpSection.style.display = (genreKey === 'all' || genreKey === 'trending') ? 'block' : 'none';
      }
      if (matchedCount === 0) {
        window.playPresetQuery(genreKey);
      }
    }
  };

  window.filterByGenre = function(catId) {
    window.switchView('home');
    const el = document.getElementById(`shelf-${catId}`) || document.getElementById(`lang-shelf-${catId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // ---------------------------------------------------------------------------
  // 3. IMMERSIVE ARTIST DETAILS PAGE
  // ---------------------------------------------------------------------------

  window.getPlaylistCoverHtml = function(playlist, isBanner = false) {
    if (!playlist) return '';
    let covers = [];
    
    // Check if album/playlist has 4 or more tracks -> generate 4-cover mixture collage!
    if (playlist.tracks && playlist.tracks.length >= 4) {
      covers = playlist.tracks.slice(0, 4).map(t => 
        t.coverUrl || t.cover || (t.ytId ? `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg` : '')
      ).filter(Boolean);
    } else if (playlist.coverUrl || playlist.cover) {
      covers = [playlist.coverUrl || playlist.cover];
    } else if (playlist.tracks && playlist.tracks.length > 0) {
      const t = playlist.tracks[0];
      covers = [t.coverUrl || t.cover || (t.ytId ? `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg` : '')];
    } else {
      covers = [''];
    }

    covers = covers.filter(Boolean);

    // If 4 covers available, render 2x2 album mixture collage!
    if (covers.length >= 4) {
      const opacityStyle = isBanner ? 'opacity: 0.8; filter: blur(8px); transform: scale(1.1);' : '';
      return `
        <div class="playlist-cover-collage" style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; width: 100%; height: 100%; pointer-events: none; overflow: hidden; border-radius: inherit; background: #141622; gap: 1px;">
          <img src="${covers[0]}" style="width: 100%; height: 100%; object-fit: cover; ${opacityStyle}" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
          <img src="${covers[1]}" style="width: 100%; height: 100%; object-fit: cover; ${opacityStyle}" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
          <img src="${covers[2]}" style="width: 100%; height: 100%; object-fit: cover; ${opacityStyle}" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
          <img src="${covers[3]}" style="width: 100%; height: 100%; object-fit: cover; ${opacityStyle}" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
        </div>
      `;
    } else if (covers.length > 0) {
      const opacityStyle = isBanner ? 'opacity: 0.8; filter: blur(8px); transform: scale(1.1);' : '';
      return `<img src="${covers[0]}" class="playlist-single-cover" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit; ${opacityStyle}" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">`;
    } else {
      const hue = Array.from(playlist.name || playlist.title || 'Pulse').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
      const gradient = `linear-gradient(135deg, hsl(${hue}, 80%, 30%), hsl(${(hue + 60) % 360}, 80%, 20%))`;
      const opacityStyle = isBanner ? 'opacity: 0.8; filter: blur(12px); transform: scale(1.1);' : '';
      return `
        <div style="width: 100%; height: 100%; background: ${gradient}; display: flex; align-items: center; justify-content: center; border-radius: inherit; ${opacityStyle}">
          <i class="fa-solid fa-music" style="font-size: ${isBanner ? '6rem' : '3rem'}; color: rgba(255,255,255,0.3);"></i>
        </div>
      `;
    }
  };

  window.openPlaylistView = function(playlist) {
    window.pulseState = window.pulseState || {};
    window.pulseState.currentPlaylistData = playlist;
    
    const heroName = document.getElementById('playlist-hero-name');
    const heroDesc = document.getElementById('playlist-hero-desc');
    const heroDescription = document.getElementById('playlist-hero-description');
    const heroBg = document.getElementById('playlist-hero-bg-container');
    const creatorBadge = document.getElementById('playlist-hero-creator');
    const creatorNameEl = document.getElementById('playlist-hero-creator-name');
    const saveLibBtn = document.getElementById('playlist-save-library-btn');
    const deleteBtn = document.getElementById('playlist-delete-btn') || document.querySelector('#view-playlist .btn-secondary-install[onclick*="deleteCurrentPlaylist"]');
    const shareBtn = document.getElementById('playlist-share-btn');
    
    if (heroName) heroName.textContent = playlist.name || playlist.title || 'Playlist';
    if (heroDesc) {
      const trackCount = playlist.tracks ? playlist.tracks.length : (playlist.trackCount || 0);
      heroDesc.textContent = `${trackCount} tracks`;
    }
    if (heroDescription) {
      if (playlist.description) {
        heroDescription.textContent = playlist.description;
        heroDescription.style.display = 'block';
      } else {
        heroDescription.style.display = 'none';
      }
    }
    if (heroBg) {
      heroBg.innerHTML = window.getPlaylistCoverHtml(playlist, true);
    }

    // Determine ownership and shared status
    const currentUid = getCurrentUserId();
    const isShared = Boolean(playlist.isShared || (playlist.creatorId && currentUid && playlist.creatorId !== currentUid));
    const isUserOwned = Boolean(playlist.id && String(playlist.id).startsWith('pl-') && !isShared);

    // Creator badge
    if (creatorBadge) {
      if (isShared && playlist.creatorName) {
        if (creatorNameEl) creatorNameEl.textContent = playlist.creatorName;
        creatorBadge.style.display = 'inline-flex';
      } else {
        creatorBadge.style.display = 'none';
      }
    }

    // "Save to My Library" button for shared playlists
    if (saveLibBtn) {
      saveLibBtn.style.display = isShared ? 'inline-flex' : 'none';
      saveLibBtn.disabled = false;
      saveLibBtn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Save to My Library';
    }

    // Show/hide delete button based on playlist ownership
    if (deleteBtn) {
      deleteBtn.style.display = isUserOwned ? 'inline-flex' : 'none';
    }

    // Share button
    if (shareBtn) {
      shareBtn.style.display = 'inline-flex';
    }
    
    const tracksList = document.getElementById('playlist-tracks-list');
    if (tracksList) {
      window.__currentPlaylistTracks = playlist.tracks || [];
      if (window.__currentPlaylistTracks.length === 0) {
          tracksList.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No tracks in this playlist yet.</div>`;
      } else {
          tracksList.innerHTML = window.__currentPlaylistTracks.map((track, idx) => {
            const trackId = track.id || track.ytId || (track.title + track.artist);
            const removeBtn = isUserOwned 
              ? `<button class="btn-player-icon" title="Remove from playlist" onclick="event.stopPropagation(); window.removeTrackFromCurrentPlaylist('${escapeHtml(String(trackId).replace(/'/g, "\\'"))}', ${idx})" style="color: var(--text-muted); transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='var(--text-muted)'"><i class="fa-solid fa-circle-minus"></i></button>`
              : '';
            return `
            <div class="artist-track-row hover-glow" onclick="window.playTrackDirect(window.__currentPlaylistTracks[${idx}], window.__currentPlaylistTracks)" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); cursor: pointer;">
              <span style="font-weight: 800; color: var(--text-muted); width: 20px;">${idx + 1}</span>
              <img src="${track.coverUrl || track.cover || (track.ytId ? 'https://i.ytimg.com/vi/'+track.ytId+'/hqdefault.jpg' : './music-cover.svg')}" alt="cover" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;">
              <div style="flex: 1;">
                <div style="font-size: 0.95rem; font-weight: 700; color: #fff;">${escapeHtml(track.title)}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(track.artist)}</div>
              </div>
              <button class="btn-player-icon" title="Like" onclick="event.stopPropagation(); window.toggleFavoriteTrack(window.__currentPlaylistTracks[${idx}])"><i class="fa-regular fa-heart"></i></button>
              ${removeBtn}
            </div>
          `;
          }).join('');
      }
    }
    
    window.switchView('playlist');
  };

  window.playPlaylistAll = function() {
    const pl = window.pulseState?.currentPlaylistData;
    const tracks = pl?.tracks || window.__currentPlaylistTracks;
    if (tracks && tracks.length > 0) {
      window.playTrackDirect(tracks[0], tracks);
      window.showToast(`Playing ${pl?.name || 'playlist'}...`, 'info');
    } else {
      window.showToast('Playlist is empty', 'warning');
    }
  };

  window.shufflePlayPlaylist = function() {
    const pl = window.pulseState?.currentPlaylistData;
    const tracks = [...(pl?.tracks || window.__currentPlaylistTracks || [])];
    if (tracks.length === 0) {
      window.showToast('Playlist is empty', 'warning');
      return;
    }
    // Fisher-Yates shuffle
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    window.playTrackDirect(tracks[0], tracks);
    window.showToast(`Shuffling ${pl?.name || 'playlist'}...`, 'info');
  };

  window.deleteCurrentPlaylist = async function() {
    const pl = window.pulseState?.currentPlaylistData;
    if (!pl || !pl.id) return;
    if (!confirm(`Delete playlist "${pl.name || 'this playlist'}"? This action cannot be undone.`)) return;
    try {
      await deletePlaylist(pl.id);
      window.showToast(`Playlist "${pl.name}" deleted`, 'info');
      window.switchView('library');
      window.switchLibraryTab('playlists');
    } catch (err) {
      window.showToast('Error deleting playlist', 'warning');
    }
  };

  window.removeTrackFromCurrentPlaylist = async function(trackId, idx) {
    const pl = window.pulseState?.currentPlaylistData;
    if (!pl || !pl.id || !trackId) return;
    const trackTitle = window.__currentPlaylistTracks?.[idx]?.title || 'Track';
    const removed = await removeTrackFromPlaylist(pl.id, trackId);
    if (removed) {
      window.showToast(`Removed "${trackTitle}" from playlist`, 'info', 2000);
      // Refresh the playlist view with updated data
      const updatedPlaylists = await getPlaylists();
      const updatedPl = updatedPlaylists.find(p => p.id === pl.id);
      if (updatedPl) {
        window.openPlaylistView(updatedPl);
      } else {
        // Playlist was somehow deleted
        window.switchView('library');
        window.switchLibraryTab('playlists');
      }
    } else {
      window.showToast('Could not remove track', 'warning');
    }
  };

  // ---------------------------------------------------------------------------
  // PLAYLIST SHARING & CLOUD IMPORT ENGINE
  // ---------------------------------------------------------------------------

  window.shareCurrentPlaylist = async function(playlistToShare) {
    const pl = playlistToShare || window.pulseState?.currentPlaylistData;
    if (!pl) {
      window.showToast('Please select a playlist to share', 'warning');
      return;
    }

    const modal = document.getElementById('share-playlist-modal');
    if (!modal) return;

    const headingEl = document.getElementById('share-modal-heading');
    const subheadingEl = document.getElementById('share-modal-subheading');
    const iconEl = document.getElementById('share-modal-icon');
    const titleEl = document.getElementById('share-modal-title');
    const metaEl = document.getElementById('share-modal-meta');
    const coverEl = document.getElementById('share-modal-cover');
    const inputEl = document.getElementById('share-playlist-url-input');
    const copyBtn = document.getElementById('share-modal-copy-btn');

    if (headingEl) headingEl.textContent = 'Share Playlist';
    if (subheadingEl) subheadingEl.textContent = 'Send to friends or copy shareable link';
    if (iconEl) iconEl.className = 'fa-solid fa-share-nodes';

    const name = pl.name || pl.title || 'Playlist';
    const tracks = pl.tracks || [];
    const cover = pl.coverUrl || pl.cover || (tracks[0]?.coverUrl || tracks[0]?.cover) || (tracks[0]?.ytId ? `https://i.ytimg.com/vi/${tracks[0].ytId}/hqdefault.jpg` : './music-cover.svg');

    if (titleEl) titleEl.textContent = name;
    if (metaEl) metaEl.textContent = `${tracks.length} tracks • ${pl.creatorName ? 'By ' + pl.creatorName : 'Curated by you'}`;
    if (coverEl) coverEl.src = cover;
    if (inputEl) inputEl.value = 'Creating secure share link...';
    if (copyBtn) {
      copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
    }

    modal.classList.remove('hidden');

    try {
      const shareResult = await publishSharedPlaylist(pl);
      const shareUrl = shareResult?.shareUrl || window.location.href;
      if (inputEl) inputEl.value = shareUrl;
      window.__activeShareData = {
        type: 'playlist',
        url: shareUrl,
        title: name,
        tracks: tracks.length
      };
    } catch (err) {
      console.error('Error generating share link:', err);
      if (inputEl) inputEl.value = window.location.href;
      window.showToast('Generated link using local backup', 'info');
    }
  };

  // ---------------------------------------------------------------------------
  // MUSIC TRACK SHARING ENGINE
  // ---------------------------------------------------------------------------

  window.shareTrack = function(trackToShare) {
    const track = trackToShare || window.PulsePlaybar?.getCurrentTrack() || window.pulseState?.currentTrack;
    if (!track || (!track.title && !track.id)) {
      window.showToast('Please play a song first to share its link', 'warning');
      return;
    }

    const modal = document.getElementById('share-playlist-modal');
    if (!modal) return;

    const headingEl = document.getElementById('share-modal-heading');
    const subheadingEl = document.getElementById('share-modal-subheading');
    const iconEl = document.getElementById('share-modal-icon');
    const titleEl = document.getElementById('share-modal-title');
    const metaEl = document.getElementById('share-modal-meta');
    const coverEl = document.getElementById('share-modal-cover');
    const inputEl = document.getElementById('share-playlist-url-input');
    const copyBtn = document.getElementById('share-modal-copy-btn');

    if (headingEl) headingEl.textContent = 'Share Music Link';
    if (subheadingEl) subheadingEl.textContent = 'Send this song to friends or copy music link';
    if (iconEl) iconEl.className = 'fa-solid fa-music';

    const title = track.title || 'Untitled Song';
    const artist = track.artist || 'Pulse Artist';
    const cover = track.coverUrl || track.cover || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : './music-cover.svg');

    if (titleEl) titleEl.textContent = title;
    if (metaEl) metaEl.textContent = `${artist} • Studio Quality Audio`;
    if (coverEl) coverEl.src = cover;
    if (copyBtn) copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';

    const shareUrl = generateTrackShareUrl(track);
    if (inputEl) inputEl.value = shareUrl;

    window.__activeShareData = {
      type: 'track',
      url: shareUrl,
      title: title,
      artist: artist,
      cover: cover
    };

    modal.classList.remove('hidden');
  };

  window.shareCurrentTrack = function() {
    window.shareTrack();
  };

  window.copyCurrentMusicLink = async function() {
    const track = window.PulsePlaybar?.getCurrentTrack() || window.pulseState?.currentTrack;
    if (!track) {
      window.showToast('Play a song to copy its music link', 'warning');
      return;
    }
    const shareUrl = generateTrackShareUrl(track);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const dummy = document.createElement('textarea');
        dummy.value = shareUrl;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand('copy');
        dummy.remove();
      }
      window.showToast(`Music link for "${track.title}" copied! 🎵`, 'success', 2500);
    } catch (e) {
      window.shareTrack(track);
    }
  };

  window.closeShareModal = function() {
    const modal = document.getElementById('share-playlist-modal');
    if (modal) modal.classList.add('hidden');
  };
  window.closeSharePlaylistModal = window.closeShareModal;

  window.copyActiveShareLink = async function() {
    const input = document.getElementById('share-playlist-url-input');
    const url = input?.value || window.__activeShareData?.url || window.location.href;
    const copyBtn = document.getElementById('share-modal-copy-btn');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        if (input) {
          input.select();
          document.execCommand('copy');
        }
      }
      if (copyBtn) copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(() => {
        if (copyBtn) copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
      }, 2000);
      const isTrack = window.__activeShareData?.type === 'track';
      window.showToast(isTrack ? 'Music link copied to clipboard! 🎵' : 'Playlist link copied to clipboard!', 'info', 2500);
    } catch (err) {
      if (input) {
        input.select();
        document.execCommand('copy');
        if (copyBtn) copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => {
          if (copyBtn) copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
        }, 2000);
        window.showToast('Link copied to clipboard!', 'info', 2500);
      }
    }
  };
  window.copySharePlaylistLink = window.copyActiveShareLink;

  window.triggerNativeShareActiveLink = async function() {
    const data = window.__activeShareData || {};
    const isTrack = data.type === 'track';
    const title = data.title || (isTrack ? 'Shared Song on Pulse' : 'Shared Playlist on Pulse');
    const text = isTrack 
      ? `Listen to "${title}" by ${data.artist || 'Pulse Artist'} on Pulse Music:`
      : `Listen to "${title}" (${data.tracks || 0} tracks) on Pulse Music:`;
    const url = data.url || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        window.showToast('Shared successfully!', 'info');
      } catch (err) {
        if (err.name !== 'AbortError') {
          window.copyActiveShareLink();
        }
      }
    } else {
      window.copyActiveShareLink();
    }
  };
  window.triggerNativeSharePlaylist = window.triggerNativeShareActiveLink;

  window.shareActiveLinkToWhatsApp = function() {
    const data = window.__activeShareData || {};
    const isTrack = data.type === 'track';
    const title = data.title || (isTrack ? 'Music' : 'Playlist');
    const url = data.url || window.location.href;
    const text = isTrack
      ? `Check out "${title}" by ${data.artist || 'Pulse Artist'} on Pulse Music:\n${url}`
      : `Check out this playlist "${title}" on Pulse Music:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };
  window.sharePlaylistToWhatsApp = window.shareActiveLinkToWhatsApp;

  window.shareActiveLinkToTelegram = function() {
    const data = window.__activeShareData || {};
    const isTrack = data.type === 'track';
    const title = data.title || (isTrack ? 'Music' : 'Playlist');
    const url = data.url || window.location.href;
    const text = isTrack
      ? `Listen to "${title}" by ${data.artist || 'Pulse Artist'} on Pulse Music`
      : `Check out this playlist "${title}" on Pulse Music`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };
  window.sharePlaylistToTelegram = window.shareActiveLinkToTelegram;

  window.saveSharedPlaylistToLibrary = async function() {
    const pl = window.pulseState?.currentPlaylistData;
    if (!pl) return;
    const saveBtn = document.getElementById('playlist-save-library-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Library...';
    }

    try {
      const imported = await importSharedPlaylist(pl);
      if (imported) {
        window.showToast(`"${imported.name}" saved to your Library!`, 'info', 3000);
        imported.isShared = false;
        window.openPlaylistView(imported);
        if (typeof window.renderLibraryView === 'function') {
          window.renderLibraryView();
        }
      } else {
        window.showToast('Failed to save playlist to library', 'warning');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Save to My Library';
        }
      }
    } catch (err) {
      console.error('Error saving shared playlist:', err);
      window.showToast('Error saving playlist', 'warning');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Save to My Library';
      }
    }
  };

  window.handleSharedPlaylistURL = async function() {
    try {
      if (!window.location || !window.location.href) return;
      const url = new URL(window.location.href);
      const playlistId = url.searchParams.get('sharedPlaylist') || url.searchParams.get('playlist');
      const payloadData = url.searchParams.get('data');

      if (!playlistId && !payloadData) return;

      // Clean query parameters from address bar to keep URL sleek
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      window.showToast('Loading shared playlist...', 'info', 2000);
      const playlist = await getSharedPlaylist(playlistId, payloadData);
      if (playlist) {
        window.openPlaylistView(playlist);
        window.showToast(`Loaded "${playlist.name || 'Shared Playlist'}" by ${playlist.creatorName || 'a friend'}!`, 'info', 4000);
      } else {
        window.showToast('Could not load shared playlist. Link may be expired.', 'warning', 4000);
      }
    } catch (err) {
      console.warn('Error handling shared playlist link:', err);
    }
  };

  window.handleSharedMusicURL = async function() {
    try {
      if (!window.location || !window.location.href) return;
      const url = new URL(window.location.href);
      const trackParam = url.searchParams.get('track') || url.searchParams.get('song');
      if (!trackParam) return;

      const sharedTrack = parseTrackShareUrl(window.location.href);
      if (!sharedTrack || !sharedTrack.id) return;

      // Clean query parameter from address bar to keep URL sleek
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      window.showToast(`🎶 Playing shared track: "${sharedTrack.title}" by ${sharedTrack.artist}`, 'info', 4500);

      // Play the shared track immediately
      if (typeof window.playTrackDirect === 'function') {
        window.playTrackDirect(sharedTrack, [sharedTrack]);
      } else if (window.PulsePlaybar && typeof window.PulsePlaybar.playTrack === 'function') {
        window.PulsePlaybar.playTrack(sharedTrack, [sharedTrack]);
      }
    } catch (e) {
      console.warn('Error handling shared music link:', e);
    }
  };

  window.openArtistView = function(artistQuery) {
    const artist = getArtistDetails(artistQuery);
    window.pulseState.currentArtistData = artist;

    const heroName = document.getElementById('artist-hero-name');
    const heroListeners = document.getElementById('artist-hero-listeners');
    const heroRank = document.getElementById('artist-world-rank');
    const heroCard = document.getElementById('artist-hero-card');

    if (heroName) heroName.textContent = artist.name;
    if (heroListeners) heroListeners.textContent = artist.monthlyListeners;
    if (heroRank) heroRank.textContent = artist.worldRank;
    if (heroCard) {
      heroCard.style.backgroundImage = `linear-gradient(180deg, rgba(15,17,26,0.3) 0%, #0f111a 100%), url('${artist.banner}')`;
    }

    const topTracksList = document.getElementById('artist-popular-tracks-list');
    if (topTracksList) {
      window.__artistTopTracks = artist.topTracks;
      topTracksList.innerHTML = artist.topTracks.map((track, idx) => `
        <div class="artist-track-row hover-glow" onclick="window.playTrackDirect(window.__artistTopTracks[${idx}], window.__artistTopTracks)" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); cursor: pointer;">
          <span style="font-weight: 800; color: var(--text-muted); width: 20px;">${idx + 1}</span>
          <img src="${track.coverUrl}" alt="${escapeHtml(track.title)}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;" loading="lazy">
          <div style="flex: 1;">
            <div style="font-size: 0.95rem; font-weight: 700; color: #fff;">${escapeHtml(track.title)}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(track.plays || 'Top Release')} plays</div>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60).toString().padStart(2, '0')}</span>
          <button class="btn-player-icon" title="Like Track" onclick="event.stopPropagation(); window.toggleFavoriteTrack(window.__artistTopTracks[${idx}])"><i class="fa-regular fa-heart"></i></button>
        </div>
      `).join('');
    }

    const aboutBox = document.getElementById('artist-about-container');
    if (aboutBox) {
      aboutBox.innerHTML = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 16px; padding: 1.5rem;">
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin: 0;">${escapeHtml(artist.bio)}</p>
        </div>
      `;
    }

    window.switchView('artist');
  };

  window.playArtistTopTracks = function() {
    const artist = window.pulseState.currentArtistData;
    if (artist && artist.topTracks && artist.topTracks.length > 0) {
      window.playTrackDirect(artist.topTracks[0], artist.topTracks);
      window.showToast(`Playing ${artist.name}'s Top Tracks`, 'info');
    }
  };

  window.openTicketBooking = function() {
    const artist = window.pulseState.currentArtistData;
    const name = artist ? artist.name : 'Artist';
    window.showToast(`Checking live tour dates & concert tickets for ${name}... 🎫`, 'info', 3000);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(name + ' concert tickets tour dates')}`, '_blank', 'noopener,noreferrer');
  };

  window.openArtistDonation = function() {
    const artist = window.pulseState.currentArtistData;
    const name = artist ? artist.name : 'Artist';
    window.showToast(`Opening official store & artist support for ${name}... ❤️`, 'info', 3000);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(name + ' official merch store support')}`, '_blank', 'noopener,noreferrer');
  };

  window.toggleFollowArtist = function() {
    const btn = document.getElementById('artist-follow-btn');
    if (btn) {
      const isFollowing = btn.classList.toggle('following');
      btn.innerHTML = isFollowing ? `<i class="fa-solid fa-check"></i> Following` : `<i class="fa-solid fa-user-plus"></i> Follow`;
      window.showToast(isFollowing ? `Following artist` : `Unfollowed`, 'info', 1500);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. GLOBAL UNIVERSAL SEARCH & CONTROLLERS
  // ---------------------------------------------------------------------------

  let searchDebounceTimer = null;
  let searchGeneration = 0; // Prevents stale results from overwriting newer ones
  window.playPresetQuery = async function(query) {
    if (!query) return;
    window.switchView('search-view');
    const input = document.getElementById('global-search-input');
    if (input) input.value = query;
    
    const label = document.getElementById('search-query-label');
    const count = document.getElementById('search-count');
    if (label) label.textContent = query;
    if (count) count.textContent = 'Searching worldwide & multilingual catalogs...';
    
    const gen = ++searchGeneration;
    try {
      const results = await window.musicService.searchTracks(query, 50);
      if (gen !== searchGeneration) return; // A newer search superseded this one
      if (count) count.textContent = `${results.length} songs found worldwide`;
      renderSearchResults(results);
      if (results && results.length > 0) {
        window.playTrackDirect(results[0], results);
      }
    } catch (e) {
      window.showToast("Failed to fetch stream.", 'warning');
    }
  };

  // ---------------------------------------------------------------------------
  // PULSE INTELLIGENT VOICE ASSISTANT & VOICE SEARCH ENGINE
  // ---------------------------------------------------------------------------

  function speakVoiceFeedback(text) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 0.85;
        const voices = window.speechSynthesis.getVoices();
        const bestVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')));
        if (bestVoice) utterance.voice = bestVoice;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }

  window.handleVoiceInputText = function(text) {
    if (!text || !text.trim()) return;
    const statusText = document.getElementById('voice-search-status');
    const transcriptText = document.getElementById('voice-search-transcript');
    
    if (transcriptText) transcriptText.textContent = `"${text}"`;
    if (statusText) statusText.textContent = 'Processing command...';

    setTimeout(() => {
      window.stopVoiceSearch();
      processVoiceAssistantCommand(text);
    }, 500);
  };

  function processVoiceAssistantCommand(rawTranscript) {
    const raw = (rawTranscript || '').trim();
    if (!raw) return;

    const text = raw.replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ').trim();
    const lower = text.toLowerCase();

    // 1. Playback Controls
    if (lower === 'pause' || lower === 'pause music' || lower === 'stop' || lower === 'stop music' || lower === 'hold on') {
      if (window.PulsePlaybar && window.PulsePlaybar.getIsPlaying()) {
        window.togglePlay();
        speakVoiceFeedback('Music paused');
        window.showToast('Voice Assistant: Paused', 'info');
      }
      return;
    }

    if (lower === 'resume' || lower === 'continue' || lower === 'resume music' || lower === 'play' || lower === 'start music') {
      if (window.PulsePlaybar && !window.PulsePlaybar.getIsPlaying()) {
        window.togglePlay();
        speakVoiceFeedback('Resuming playback');
        window.showToast('Voice Assistant: Resumed', 'info');
      }
      return;
    }

    if (lower === 'next' || lower === 'next song' || lower === 'skip' || lower === 'skip song' || lower === 'skip track' || lower === 'play next') {
      window.nextSong();
      speakVoiceFeedback('Skipping to next track');
      window.showToast('Voice Assistant: Next Track', 'info');
      return;
    }

    if (lower === 'previous' || lower === 'previous song' || lower === 'back' || lower === 'last song' || lower === 'play previous') {
      window.previousSong();
      speakVoiceFeedback('Playing previous track');
      window.showToast('Voice Assistant: Previous Track', 'info');
      return;
    }

    if (lower === 'mute' || lower === 'mute audio' || lower === 'silence') {
      if (window.PulsePlaybar && window.PulsePlaybar.setVolume) window.PulsePlaybar.setVolume(0);
      speakVoiceFeedback('Muted');
      window.showToast('Voice Assistant: Muted', 'info');
      return;
    }

    if (lower.includes('unmute') || lower === 'volume up' || lower === 'louder' || lower === 'increase volume' || lower === 'turn it up') {
      const audioEl = window.PulsePlaybar && window.PulsePlaybar.getAudio ? window.PulsePlaybar.getAudio() : null;
      const curVol = audioEl ? audioEl.volume : 0.5;
      if (window.PulsePlaybar && window.PulsePlaybar.setVolume) window.PulsePlaybar.setVolume(Math.min(1, curVol + 0.25));
      speakVoiceFeedback('Volume increased');
      window.showToast('Voice Assistant: Volume Up', 'info');
      return;
    }

    if (lower === 'volume down' || lower === 'softer' || lower === 'decrease volume' || lower === 'turn it down' || lower === 'lower volume') {
      const audioEl2 = window.PulsePlaybar && window.PulsePlaybar.getAudio ? window.PulsePlaybar.getAudio() : null;
      const curVol = audioEl2 ? audioEl2.volume : 0.5;
      if (window.PulsePlaybar && window.PulsePlaybar.setVolume) window.PulsePlaybar.setVolume(Math.max(0.1, curVol - 0.25));
      speakVoiceFeedback('Volume decreased');
      window.showToast('Voice Assistant: Volume Down', 'info');
      return;
    }

    if (lower.includes('show lyrics') || lower.includes('open lyrics') || lower === 'lyrics') {
      window.openLyricsDrawer();
      speakVoiceFeedback('Opening live lyrics');
      window.showToast('Voice Assistant: Live Lyrics Opened', 'info');
      return;
    }

    if (lower.includes('recommend') || lower.includes('pulse ai') || lower.includes('curate') || lower.startsWith('suggest')) {
      const aiPrompt = raw.replace(/^(pulse ai|ai assistant|recommend|curate|suggest)\s*/i, '').trim() || 'Top trending high energy tracks';
      if (window.openPulseAIModal) {
        window.openPulseAIModal();
        const input = document.getElementById('gemini-prompt-input');
        if (input) input.value = aiPrompt;
        if (window.handleAskPulseAI) window.handleAskPulseAI(aiPrompt);
      }
      speakVoiceFeedback(`Curating ${aiPrompt} with Pulse AI`);
      return;
    }

    // 2. "Play <Song/Artist>" command -> Automatically find and play the song directly!
    const playMatch = lower.match(/^(?:play|stream|listen to|put on)\s+(.+)$/i);
    if (playMatch && playMatch[1]) {
      const songQuery = playMatch[1].trim();
      if (songQuery) {
        speakVoiceFeedback(`Playing ${songQuery}`);
        window.showToast(`Voice Assistant: Playing "${songQuery}"`, 'success');
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.value = songQuery;
        window.playPresetQuery(songQuery);
        return;
      }
    }

    // 3. Direct song/artist/search query -> Play best match
    speakVoiceFeedback(`Playing ${raw}`);
    window.showToast(`Voice Assistant: "${raw}"`, 'success');
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = raw;
    window.playPresetQuery(raw);
  }

  window.stopVoiceSearch = function() {
    if (window._activeRecognition) {
      try { window._activeRecognition.stop(); } catch(e){}
      window._activeRecognition = null;
    }
    const overlay = document.getElementById('voice-search-overlay');
    if (overlay) overlay.style.display = 'none';
    const btn = document.getElementById('voice-search-btn');
    if (btn) btn.classList.remove('listening');
    const aiBtn = document.getElementById('pulse-ai-mic-btn');
    if (aiBtn) aiBtn.style.color = '#c084fc';
  };

  window.startVoiceSearch = async function(targetContext = 'general') {
    // If already active, toggle it off
    if (window._activeRecognition) {
      window.stopVoiceSearch();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      window.showToast('Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.', 'warning');
      return;
    }

    const overlay = document.getElementById('voice-search-overlay');
    const statusText = document.getElementById('voice-search-status');
    const transcriptText = document.getElementById('voice-search-transcript');
    const btn = document.getElementById('voice-search-btn');
    if (btn) btn.classList.add('listening');

    if (overlay) {
      overlay.style.display = 'flex';
      if (statusText) statusText.textContent = 'Listening...';
      if (transcriptText) transcriptText.textContent = targetContext === 'pulse-ai' ? 'Speak a prompt or vibe for Pulse AI...' : 'Say a song, artist, or command...';
    }

    // Proactively verify/prompt microphone permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (permErr) {
        console.warn('Microphone permission error:', permErr);
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          window.stopVoiceSearch();
          window.showToast('Microphone access denied. Please click the padlock or camera icon in your browser URL bar and allow microphone access.', 'warning', 6000);
          return;
        }
      }
    }

    try {
      const recognition = new SpeechRecognition();
      window._activeRecognition = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = true; // Real-time feedback
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      let finalTranscript = '';

      recognition.onstart = () => {
        if (statusText) statusText.textContent = 'Listening...';
      };

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const currentSpoken = (finalTranscript || interim).trim();
        if (transcriptText && currentSpoken) {
          transcriptText.textContent = `"${currentSpoken}"`;
        }
      };

      recognition.onspeechend = () => {
        if (statusText) statusText.textContent = 'Processing...';
      };

      recognition.onend = () => {
        const spoken = finalTranscript.trim();
        if (spoken) {
          if (statusText) statusText.textContent = 'Executing...';
          setTimeout(() => {
            window.stopVoiceSearch();
            if (targetContext === 'pulse-ai') {
              const promptInput = document.getElementById('gemini-prompt-input');
              if (promptInput) promptInput.value = spoken;
              if (window.handleAskPulseAI) window.handleAskPulseAI(spoken);
            } else {
              processVoiceAssistantCommand(spoken);
            }
          }, 350);
        } else {
          window.stopVoiceSearch();
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          if (statusText) statusText.textContent = 'Microphone Blocked';
          window.showToast('Microphone access blocked. Please allow microphone access in site settings.', 'warning', 5000);
        } else if (event.error === 'no-speech') {
          if (statusText) statusText.textContent = "Didn't catch that.";
        } else if (event.error === 'network') {
          if (statusText) statusText.textContent = 'Network offline';
          window.showToast('Speech service network error. Check your internet connection.', 'warning');
        } else {
          if (statusText) statusText.textContent = `Error: ${event.error}`;
        }
        setTimeout(() => {
          window.stopVoiceSearch();
        }, 1200);
      };

      recognition.start();
    } catch (err) {
      console.error('Voice search failed to start:', err);
      window.stopVoiceSearch();
      window.showToast('Microphone access could not be initialized.', 'warning');
    }
  };

  window.startVoiceAssistant = window.startVoiceSearch;
  window.startPulseAIVoiceInput = function() {
    window.startVoiceSearch('pulse-ai');
  };

  window.executeSearch = function(query, isTyping = false) {
    if (!query || query.trim().length === 0) return;
    window.switchView('search-view');

    const label = document.getElementById('search-query-label');
    const count = document.getElementById('search-count');
    if (label) label.textContent = query;

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
      if (count) count.textContent = 'Searching worldwide & multilingual catalogs...';
      const gen = ++searchGeneration;
      const results = await window.musicService.searchTracks(query, 50);
      if (gen !== searchGeneration) return; // Stale — a newer search is in flight
      if (count) count.textContent = `${results.length} songs found worldwide`;
      renderSearchResults(results);
    }, isTyping ? 500 : 0);
  };

  function renderSearchResults(tracks) {
    const container = document.getElementById('search-results-container');
    if (!container) return;

    if (tracks.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-compact-disc" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; color: var(--accent-primary);"></i>
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.5rem;">No audio tracks found</h3>
          <p>Try searching for a song, artist, album, or regional language name.</p>
        </div>
      `;
      return;
    }

    window.__searchResults = tracks || [];

    window.playSearchTrack = function(index) {
      if (!window.__searchResults || !window.__searchResults[index]) return;
      const track = window.__searchResults[index];
      window.playTrackDirect(track, window.__searchResults);
    };

    container.innerHTML = tracks.map((track, idx) => {
      const isTopMatch = idx === 0 && (track._relevanceScore !== undefined ? track._relevanceScore >= 140 : true);
      const badgeText = isTopMatch ? '★ Best Match' : (track.source || '320kbps Master');
      return window.renderSongCard(track, idx, 'window.__searchResults', { badge: badgeText });
    }).join('');
  }

  // ---------------------------------------------------------------------------
  // 5. USER LIBRARY (FAVORITES, PLAYLISTS, HISTORY)
  // ---------------------------------------------------------------------------

  window.switchLibraryTab = function(tabName) {
    window.pulseState.activeLibraryTab = tabName;
    document.querySelectorAll('.library-tab-btn').forEach(btn => {
      btn.classList.toggle('active-pill', btn.getAttribute('data-tab') === tabName);
      btn.classList.toggle('pill-cyan', btn.getAttribute('data-tab') === tabName);
    });
    window.renderLibraryView();
  };

  window.renderLibraryView = async function() {
    const container = document.getElementById('library-content-area');
    if (!container) return;

    const activeTab = window.pulseState.activeLibraryTab || 'favorites';

    if (activeTab === 'favorites') {
      const favorites = await getFavorites();
      if (favorites.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <i class="fa-solid fa-heart" style="font-size: 3rem; color: #ff007a; margin-bottom: 1rem; opacity: 0.6;"></i>
            <h3 style="color: #fff; margin-bottom: 0.5rem;">No Liked Songs yet</h3>
            <p>Tap the heart icon on any track to save it to your library.</p>
          </div>
        `;
        return;
      }

      window.__userFavorites = favorites;
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${favorites.map((track, idx) => `
            <div class="library-track-row hover-glow" onclick="window.playTrackDirect(window.__userFavorites[${idx}], window.__userFavorites)" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); cursor: pointer;">
              <span style="font-weight: 800; color: var(--text-muted); width: 20px;">${idx + 1}</span>
              <img src="${track.coverUrl || track.cover || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : './music-cover.svg')}" alt="cover" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;">
              <div style="flex: 1;">
                <div style="font-size: 0.95rem; font-weight: 700; color: #fff;">${escapeHtml(track.title)}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(track.artist)}</div>
              </div>
              <button class="btn-player-icon" title="Remove" onclick="event.stopPropagation(); window.removeFavoriteTrack('${track.id}')"><i class="fa-solid fa-heart" style="color: #ff007a;"></i></button>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeTab === 'playlists') {
      const playlists = await getPlaylists();
      if (playlists.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <i class="fa-solid fa-folder-plus" style="font-size: 3rem; color: #38bdf8; margin-bottom: 1rem; opacity: 0.6;"></i>
            <h3 style="color: #fff; margin-bottom: 0.5rem;">No custom playlists</h3>
            <p>Create your first playlist to organize tracks.</p>
            <button class="btn-primary-play" onclick="window.openCreatePlaylistModal()" style="margin-top: 1rem; display: inline-flex;"><i class="fa-solid fa-plus"></i> Create Playlist</button>
          </div>
        `;
        return;
      }

      window.__userPlaylists = playlists;
      container.innerHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
          <button class="btn-primary-play" onclick="window.openCreatePlaylistModal()" style="display: inline-flex; font-size: 0.85rem; padding: 0.6rem 1.2rem;"><i class="fa-solid fa-plus"></i> New Playlist</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
          ${playlists.map((pl, plIdx) => `
            <div class="playlist-card hover-glow" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 16px; padding: 1rem; cursor: pointer; position: relative;">
              <div onclick="window.playPlaylistDirect('${pl.id}')" style="cursor: pointer;">
                <div style="width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; margin-bottom: 0.75rem;">${window.getPlaylistCoverHtml(pl, false)}</div>
                <h4 style="color: #fff; font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">${escapeHtml(pl.name)}</h4>
                <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0;">${pl.tracks ? pl.tracks.length : 0} tracks</p>
              </div>
              <button class="btn-player-icon" title="Share playlist" onclick="event.stopPropagation(); window.shareCurrentPlaylist(window.__userPlaylists[${plIdx}])" style="position: absolute; top: 0.75rem; right: 3.25rem; color: #a5b4fc; background: rgba(0,0,0,0.5); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; opacity: 0.8; backdrop-filter: blur(4px);" onmouseover="this.style.color='#38bdf8';this.style.opacity='1'" onmouseout="this.style.color='#a5b4fc';this.style.opacity='0.8'"><i class="fa-solid fa-share-nodes" style="font-size: 0.75rem;"></i></button>
              <button class="btn-player-icon" title="Delete playlist" onclick="event.stopPropagation(); window.deletePlaylistFromLibrary('${pl.id}', '${escapeHtml(pl.name).replace(/'/g, "\\'")}')" style="position: absolute; top: 0.75rem; right: 0.75rem; color: var(--text-muted); background: rgba(0,0,0,0.5); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; opacity: 0.6; backdrop-filter: blur(4px);" onmouseover="this.style.color='#ef4444';this.style.opacity='1'" onmouseout="this.style.color='var(--text-muted)';this.style.opacity='0.6'"><i class="fa-solid fa-trash-can" style="font-size: 0.75rem;"></i></button>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeTab === 'history') {
      const history = await getHistory();
      if (history.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <i class="fa-solid fa-clock-rotate-left" style="font-size: 3rem; color: #a855f7; margin-bottom: 1rem; opacity: 0.6;"></i>
            <h3 style="color: #fff; margin-bottom: 0.5rem;">No listening history</h3>
            <p>Tracks you stream will automatically appear here.</p>
          </div>
        `;
        return;
      }

      window.__userHistory = history;
      container.innerHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
          <button class="btn-secondary-install" onclick="window.clearUserHistory()"><i class="fa-solid fa-trash-can"></i> Clear History</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${history.map((track, idx) => `
            <div class="library-track-row hover-glow" onclick="window.playTrackDirect(window.__userHistory[${idx}], window.__userHistory)" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); cursor: pointer;">
              <span style="font-weight: 800; color: var(--text-muted); width: 20px;">${idx + 1}</span>
              <img src="${track.coverUrl || track.cover || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : './music-cover.svg')}" alt="cover" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;">
              <div style="flex: 1;">
                <div style="font-size: 0.95rem; font-weight: 700; color: #fff;">${escapeHtml(track.title)}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(track.artist)}</div>
              </div>
              <button class="btn-player-icon" title="Like Track" onclick="event.stopPropagation(); window.toggleFavoriteTrack(window.__userHistory[${idx}])"><i class="fa-regular fa-heart"></i></button>
            </div>
          `).join('')}
        </div>
      `;
    }
  };

  window.clearUserHistory = async function() {
    if (confirm('Are you sure you want to clear your entire listening history?')) {
      await clearHistory();
      window.showToast('History cleared', 'info');
      window.renderLibraryView();
      window.renderHomeDiscovery(); // update home recent history if any
    }
  };

  window.toggleFavoriteTrack = async function(track) {
    if (!track) return;
    const isFav = await addFavorite(track);
    window.showToast(isFav ? `Added "${track.title}" to Liked Songs ❤️` : `Song already in favorites`, 'success', 2000);
  };

  window.removeFavoriteTrack = async function(id) {
    await removeFavorite(id);
    window.showToast('Removed from Liked Songs', 'info', 1500);
    window.renderLibraryView();
  };

  window.deletePlaylistFromLibrary = async function(playlistId, playlistName) {
    if (!playlistId) return;
    if (!confirm(`Delete playlist "${playlistName || 'this playlist'}"? This action cannot be undone.`)) return;
    try {
      await deletePlaylist(playlistId);
      window.showToast(`Playlist "${playlistName}" deleted`, 'info');
      window.renderLibraryView();
    } catch (err) {
      window.showToast('Error deleting playlist', 'warning');
    }
  };

  window.createNewPlaylist = window.openCreatePlaylistModal;

  window.openCreatePlaylistModal = function() {
    const uid = getCurrentUserId();
    if (!uid || uid.startsWith('guest-')) {
      window.showToast('Please continue with Google to create playlists', 'warning');
      window.signInWithGoogle();
      return;
    }
    const modal = document.getElementById('create-playlist-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeCreatePlaylistModal = function() {
    const modal = document.getElementById('create-playlist-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.handleCreatePlaylist = async function(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('new-playlist-name');
    const descInput = document.getElementById('new-playlist-desc');
    const name = nameInput ? nameInput.value : '';
    const desc = descInput ? descInput.value : '';

    if (!name.trim()) return;

    try {
      const pl = await createPlaylist(name, desc);
      window.closeCreatePlaylistModal();
      if (nameInput) nameInput.value = '';
      if (descInput) descInput.value = '';
      window.showToast(`Playlist "${pl.name}" created!`, 'success');
      window.renderLibraryView();
    } catch (err) {
      window.showToast(err.message || 'Error creating playlist', 'warning');
    }
  };

  window.playPlaylistDirect = async function(id) {
    const playlists = await getPlaylists();
    const pl = playlists.find(p => p.id === id);
    if (pl) {
      window.openPlaylistView(pl);
    } else {
      window.showToast('Playlist not found', 'warning');
    }
  };

  let trackToAddToPlaylist = null;
  window.openAddToPlaylistModal = async function(track) {
    const uid = getCurrentUserId();
    if (!uid || uid.startsWith('guest-')) {
      window.showToast('Please continue with Google to manage playlists', 'warning');
      window.signInWithGoogle();
      return;
    }
    
    trackToAddToPlaylist = track;
    const modal = document.getElementById('add-to-playlist-modal');
    const listEl = document.getElementById('user-playlists-picker-list');
    if (!modal || !listEl) return;

    const playlists = await getPlaylists();
    if (playlists.length === 0) {
      listEl.innerHTML = '<p style="padding: 1rem; color: var(--text-muted); text-align: center;">No playlists created yet. Create one first!</p>';
    } else {
      listEl.innerHTML = playlists.map(pl => `
        <div class="playlist-picker-item hover-glow" onclick="window.confirmAddTrackToPlaylist('${pl.id}')" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 10px; background: rgba(255,255,255,0.05); cursor: pointer;">
          <i class="fa-solid fa-list-check text-accent"></i>
          <span style="font-weight: 600; color: #fff;">${escapeHtml(pl.name)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">${pl.tracks ? pl.tracks.length : 0} tracks</span>
        </div>
      `).join('');
    }

    modal.classList.remove('hidden');
  };

  window.closeAddToPlaylistModal = function() {
    const modal = document.getElementById('add-to-playlist-modal');
    if (modal) modal.classList.add('hidden');
    trackToAddToPlaylist = null;
  };

  window.confirmAddTrackToPlaylist = async function(playlistId) {
    if (!trackToAddToPlaylist || !playlistId) return;
    const added = await addTrackToPlaylist(playlistId, trackToAddToPlaylist);
    window.closeAddToPlaylistModal();
    if (added) {
      window.showToast(`Added to playlist!`, 'success');
    } else {
      window.showToast(`Song already in playlist`, 'info');
    }
  };

  // ---------------------------------------------------------------------------
  // 5. UNIVERSAL MULTI-PLATFORM SHORTCUT & DOWNLOAD CONTROLLERS
  // ---------------------------------------------------------------------------
  window.detectUserPlatform = function() {
    const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
    const plat = (navigator.platform || '').toLowerCase();

    if (/ipad|iphone|ipod/.test(ua) || (plat === 'macintel' && navigator.maxTouchPoints > 1)) {
      return 'ios';
    }
    if (/android/.test(ua)) {
      return 'android';
    }
    if (/win/.test(ua) || /win/.test(plat)) {
      return 'windows';
    }
    if (/mac/.test(ua) || /mac/.test(plat)) {
      return 'mac';
    }
    if (/linux/.test(ua) || /linux/.test(plat)) {
      return 'linux';
    }
    return 'pwa';
  };

  window.openDownloadModal = function(preferredCategory) {
    const modal = document.getElementById('download-app-modal');
    if (!modal) return;

    const detected = window.detectUserPlatform();
    const badge = document.getElementById('detected-device-badge');
    
    if (badge) {
      const labels = {
        windows: '<i class="fa-brands fa-windows"></i> Detected: Windows PC',
        ios: '<i class="fa-brands fa-apple"></i> Detected: iPhone / iPad',
        android: '<i class="fa-brands fa-android"></i> Detected: Android Device',
        mac: '<i class="fa-brands fa-apple"></i> Detected: macOS System',
        linux: '<i class="fa-brands fa-linux"></i> Detected: Linux Desktop',
        pwa: '<i class="fa-solid fa-globe"></i> Detected: Web Browser'
      };
      badge.innerHTML = labels[detected] || labels.pwa;
    }

    const activeTab = preferredCategory || (detected === 'pwa' ? 'all' : detected);
    window.switchDownloadTab(activeTab);

    modal.classList.remove('hidden');
    modal.classList.add('active-modal');
  };

  window.closeDownloadModal = function() {
    const modal = document.getElementById('download-app-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('active-modal');
    }
  };

  window.switchDownloadTab = function(category) {
    document.querySelectorAll('.download-tab-btn').forEach(btn => {
      const btnCat = btn.getAttribute('data-category');
      btn.classList.toggle('active-pill', btnCat === category);
    });

    document.querySelectorAll('.download-card-tile').forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || cardCat === category || cardCat === 'pwa') {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  // Client-Side Windows .URL Shortcut Generator
  window.downloadWindowsShortcut = function() {
    try {
      const urlContent = `[InternetShortcut]\r\nURL=https://pulse-music-app-68.web.app/\r\nIconFile=https://pulse-music-app-68.web.app/icons/icon.ico\r\nIconIndex=0\r\n[{000214A0-0000-0000-C000-000000000046}]\r\nProp3=19,0\r\n`;
      const blob = new Blob([urlContent], { type: 'application/x-mswinurl;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'Pulse-Music.url';
      a.setAttribute('download', 'Pulse-Music.url');
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 2000);

      window.showToast('✓ "Pulse-Music.url" downloaded! Drag it to your desktop.', 'success', 5000);
    } catch (e) {
      window.location.href = 'https://pushkarhiremath68-cyber.github.io/Pulse/downloads/Pulse-Music.url';
    }
  };

  // Client-Side Windows .BAT Fast Launcher Generator
  window.downloadWindowsBatLauncher = function() {
    const currentUrl = window.location.href.split('#')[0];
    const batContent = `@echo off
title Pulse Music Launcher
echo Starting Pulse Music with Master Audio...
start "" "${currentUrl}"
exit
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Launch-Pulse-Music.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    window.showToast('Windows Launcher script (.bat) downloaded!', 'success', 3500);
  };

  // Client-Side macOS .webloc Shortcut Generator
  window.downloadMacShortcut = function() {
    const currentUrl = window.location.href.split('#')[0];
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>URL</key>
	<string>${currentUrl}</string>
</dict>
</plist>
`;
    const blob = new Blob([plistContent], { type: 'application/x-apple-webloc' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Pulse Music.webloc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    window.showToast('macOS Web Shortcut downloaded! Drag it to your Dock or Desktop.', 'success', 4500);
  };

  // Client-Side Linux .desktop Launcher Generator
  window.downloadLinuxDesktopShortcut = function() {
    const currentUrl = window.location.href.split('#')[0];
    const iconUrl = new URL('./icons/icon-512.png', window.location.href).href;
    const desktopContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=Pulse Music
GenericName=Lossless Music Player
Comment=High-Fidelity Global Music Streaming & Synced Lyrics
Exec=xdg-open "${currentUrl}"
Icon=${iconUrl}
Terminal=false
StartupNotify=true
Categories=AudioVideo;Audio;Player;Music;
Keywords=music;stream;audio;lossless;karaoke;lyrics;pulse;
`;
    const blob = new Blob([desktopContent], { type: 'application/x-desktop' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Pulse-Music.desktop';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    window.showToast('Linux .desktop launcher downloaded! Use chmod +x to make executable.', 'success', 4500);
  };

  // Client-Side Apple WebClip Configuration Profile (.mobileconfig) for iOS
  window.downloadIosWebClipProfile = function() {
    try {
      window.showToast('📱 Downloading iOS Configuration Profile... Tap "Allow", then go to Settings → "Profile Downloaded" to install Pulse!', 'info', 7000);
      const link = document.createElement('a');
      link.href = './downloads/Pulse-Music.mobileconfig';
      link.download = 'Pulse-Music.mobileconfig';
      link.setAttribute('download', 'Pulse-Music.mobileconfig');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
      }, 2000);
    } catch (e) {
      window.location.href = './downloads/Pulse-Music.mobileconfig';
    }
  };

  // Apple Shortcuts App Trigger
  window.openIosAppleShortcut = function() {
    const currentUrl = window.location.href.split('#')[0];
    const createUri = `shortcuts://create-shortcut?name=Pulse%20Music&url=${encodeURIComponent(currentUrl)}`;
    window.showToast('⚡ Opening Apple Shortcuts app...', 'info', 3500);
    window.location.href = createUri;
    setTimeout(() => {
      window.showIosAddHomeGuide();
    }, 1500);
  };

  // Dedicated iOS "Add to Home Screen" Visual Guide
  window.showIosAddHomeGuide = function() {
    const guide = document.getElementById('ios-install-guide-modal');
    if (guide) {
      guide.classList.remove('hidden');
      guide.classList.add('active-modal');
    } else {
      window.openDownloadModal('ios');
    }
  };

  window.closeIosAddHomeGuide = function() {
    const guide = document.getElementById('ios-install-guide-modal');
    if (guide) {
      guide.classList.add('hidden');
      guide.classList.remove('active-modal');
    }
  };

  window.handleDownloadClick = function(platformName, fileSize) {
    if (typeof window.showToast === 'function') {
      window.showToast(`Starting ${platformName} download (${fileSize || 'Instant'})... ⚡`, 'success', 3000);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. PULSE AI (AI DJ & MUSIC ASSISTANT) CONTROLLERS
  // ---------------------------------------------------------------------------
  window.openGeminiDJModal = function() {
    const modal = document.getElementById('gemini-dj-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const input = document.getElementById('gemini-prompt-input');
      if (input) input.focus();
    }
  };
  window.openPulseAIModal = window.openGeminiDJModal;

  window.closeGeminiDJModal = function() {
    const modal = document.getElementById('gemini-dj-modal');
    if (modal) modal.classList.add('hidden');
  };
  window.closePulseAIModal = window.closeGeminiDJModal;

  window.handleAskGeminiDJ = async function(presetPrompt) {
    const promptInput = document.getElementById('gemini-prompt-input');
    const prompt = presetPrompt || (promptInput ? promptInput.value : '');
    if (!prompt || !prompt.trim()) {
      window.showToast('Please enter a vibe or song for Pulse AI', 'warning');
      return;
    }
    if (promptInput && presetPrompt) promptInput.value = presetPrompt;

    const spinner = document.getElementById('gemini-loading-spinner');
    const output = document.getElementById('gemini-dj-output');
    if (spinner) spinner.classList.remove('hidden');
    if (output) output.innerHTML = '';

    try {
      const res = await askGeminiDJ(prompt);
      if (spinner) spinner.classList.add('hidden');
      if (output && res && res.tracks) {
        window.__geminiCuratedTracks = res.tracks;
        window.playGeminiTrack = function(index) {
          if (!window.__geminiCuratedTracks || !window.__geminiCuratedTracks[index]) return;
          const trk = window.__geminiCuratedTracks[index];
          const query = trk.ytQuery || `${trk.title} ${trk.artist}`;
          window.playPresetQuery(query);
          window.closeGeminiDJModal();
        };
        window.playPulseAITrack = window.playGeminiTrack;

        output.innerHTML = `
          <div style="margin-top: 1rem; border-top: 1px solid var(--border-glass); padding-top: 1rem;">
            <div style="font-size: 1.1rem; font-weight: 800; color: #c084fc; margin-bottom: 0.25rem;">${escapeHtml(res.djTitle)}</div>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">${escapeHtml(res.vibe)}</p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 280px; overflow-y: auto;">
              ${res.tracks.map((t, idx) => `
                <div class="hover-glow" onclick="window.playGeminiTrack(${idx})" style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass); cursor: pointer;">
                  <div>
                    <div style="font-size: 0.92rem; font-weight: 700; color: #fff;">${escapeHtml(t.title)}</div>
                    <div style="font-size: 0.78rem; color: #c084fc;">${escapeHtml(t.artist)}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${escapeHtml(t.reason || 'AI Match')}</div>
                  </div>
                  <button class="btn-primary-play" style="padding: 0.4rem 0.75rem; font-size: 0.75rem; border-radius: 8px;">
                    <i class="fa-solid fa-play"></i> Play
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    } catch (e) {
      if (spinner) spinner.classList.add('hidden');
      window.showToast('Pulse AI tracks ready', 'info');
    }
  };
  window.handleAskPulseAI = window.handleAskGeminiDJ;

  // ---------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY & PWA COLD-START
  // ---------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY & PWA COLD-START
  // ---------------------------------------------------------------------------
  function applyPWAUIState() {
    const isStandalone = Boolean(
      (typeof window.matchMedia === 'function' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches
      )) ||
      (typeof window.navigator !== 'undefined' && window.navigator.standalone === true) ||
      (typeof window.location !== 'undefined' && window.location.search && window.location.search.includes('source=pwa')) ||
      (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://')) ||
      Boolean(window.electronAPI && window.electronAPI.isElectron)
    );
    
    if (isStandalone) {
      document.body.classList.add('is-pwa-standalone');
      try { localStorage.setItem('pulse_app_installed', 'true'); } catch (e) {}
    }

    const isInstalled = isStandalone || (function() {
      try { return localStorage.getItem('pulse_app_installed') === 'true'; } catch (e) { return false; }
    })();

    if (isInstalled) {
      document.body.classList.add('is-pwa-installed');
      
      // 1. Hide the top header Install App button
      const headerInstallBtn = document.getElementById('header-install-btn');
      if (headerInstallBtn) headerInstallBtn.style.display = 'none';
      const headerDownloadBtn = document.getElementById('header-download-btn');
      if (headerDownloadBtn) headerDownloadBtn.style.display = 'none';

      // 2. Hide floating smart install banner
      const banner = document.getElementById('pwa-floating-banner');
      if (banner) {
        banner.classList.add('hidden');
        banner.style.display = 'none';
      }

      // 3. Hide the sidebar install button
      const sideInstallBtn = document.querySelector('.sidebar-footer button[onclick*="openDownloadModal"]');
      if (sideInstallBtn) sideInstallBtn.style.display = 'none';

      // 4. Update the 1-Click install button in the download modal if opened
      const pwaModalBtn = document.getElementById('pwa-install-btn');
      if (pwaModalBtn) {
        pwaModalBtn.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #4ade80;"></i> Installed';
        pwaModalBtn.classList.remove('btn-primary-play');
        pwaModalBtn.classList.add('btn-secondary-install');
        pwaModalBtn.style.pointerEvents = 'none';
        pwaModalBtn.style.opacity = '0.75';
      }
    }
  }

  // ---------------------------------------------------------------------------
  // LISTENING PARTIES (LIVE SYNC)
  // ---------------------------------------------------------------------------
  window.__currentSessionId = null;
  window.__isSessionHost = false;
  let sessionSyncInterval = null;

  window.toggleListeningParty = async function() {
    if (window.__currentSessionId) {
      // Leave session
      leaveSession(window.__currentSessionId);
      window.__currentSessionId = null;
      window.__isSessionHost = false;
      if (sessionSyncInterval) clearInterval(sessionSyncInterval);
      window.showToast('Left listening party', 'info');
      const btns = ['desktop-party-btn', 'mobile-party-btn'];
      btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.querySelector('i').style.color = '#a855f7';
      });
      // Remove party from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('party');
      window.history.replaceState({}, '', url);
      return;
    }

    // Create session
    try {
      const uid = getCurrentUserId();
      if (!uid || uid.startsWith('guest-')) {
        window.showToast('Please continue with Google to host a party', 'warning');
        window.signInWithGoogle();
        return;
      }
      
      const currentTrack = window.PulsePlaybar ? window.PulsePlaybar.getCurrentTrack() : null;
      const sessionId = await createSession(currentTrack);
      window.__currentSessionId = sessionId;
      window.__isSessionHost = true;
      
      const btns = ['desktop-party-btn', 'mobile-party-btn'];
      btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.querySelector('i').style.color = '#4ade80'; // Green when active
      });
      
      const partyUrl = new URL(window.location.href);
      partyUrl.searchParams.set('party', sessionId);
      window.history.replaceState({}, '', partyUrl);

      window.showToast('Listening Party Started! Invite link copied to clipboard.', 'success', 3000);
      try {
        await navigator.clipboard.writeText(partyUrl.toString());
      } catch (e) {}

      // Sync state to Firebase every second
      sessionSyncInterval = setInterval(() => {
        if (window.__isSessionHost && window.__currentSessionId && window.PulsePlaybar) {
          updateSessionState(window.__currentSessionId, {
            track: window.PulsePlaybar.getCurrentTrack(),
            isPlaying: window.PulsePlaybar.getIsPlaying(),
            currentTime: window.PulsePlaybar.getCurrentTime ? window.PulsePlaybar.getCurrentTime() : 0
          });
        }
      }, 1500);

    } catch (err) {
      console.error('[Listening Party] Error:', err);
      window.showToast('Could not start party. Please sign in.', 'warning');
    }
  };

  window.handleListeningPartyURL = function() {
    try {
      if (!window.location || !window.location.href) return;
      const url = new URL(window.location.href);
      const partyId = url.searchParams.get('party');
      if (!partyId) return;

    // Create an explicit interaction modal to bypass Autoplay restrictions
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; backdrop-filter: blur(15px);';
    overlay.innerHTML = `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); padding: 3rem; border-radius: 24px; text-align: center; max-width: 90vw; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(56, 189, 248, 0.1); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1.5rem auto;">
          <i class="fa-solid fa-tower-broadcast" style="animation: pulse 2s infinite;"></i>
        </div>
        <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; color: #fff;">Listening Party</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2.5rem; font-size: 1.1rem;">You've been invited to tune in live. Click below to join.</p>
        <button id="btn-join-party" style="background: linear-gradient(135deg, #38bdf8, #818cf8); color: #fff; border: none; padding: 1rem 3rem; border-radius: 50px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 0 20px rgba(56,189,248,0.4); display: inline-flex; align-items: center; gap: 0.75rem;">
          <i class="fa-solid fa-headphones"></i> Tune In Live
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-join-party').onclick = () => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
      
      window.showToast(`Joining listening party...`, 'info', 2000);
      
      // Join as listener
      window.__currentSessionId = partyId;
      window.__isSessionHost = false;
      
      const btns = ['desktop-party-btn', 'mobile-party-btn'];
      btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.querySelector('i').style.color = '#38bdf8'; // Blue for listeners
      });
      
      let lastTrackId = null;

      joinSession(partyId, (state) => {
        if (!state) {
          window.showToast('Listening Party has ended.', 'warning');
          window.toggleListeningParty(); // cleanup local state
          return;
        }
        
        if (!window.PulsePlaybar || window.__isSessionHost) return;

        const pState = state.state;
        if (!pState) return;

        const track = pState.track;
        if (track) {
          const trackId = track.id || track.ytId;
          // If track changed, play it
          if (trackId !== lastTrackId) {
            lastTrackId = trackId;
            if (window.PulsePlaybar.playTrack) {
              window.PulsePlaybar.playTrack(track, [track]);
            }
          }
          
          // Sync time if difference is large (> 3 seconds)
          if (pState.isPlaying && pState.currentTime > 0) {
             const timeSinceUpdate = (Date.now() - pState.timestamp) / 1000;
             const expectedTime = pState.currentTime + timeSinceUpdate;
             const localTime = window.PulsePlaybar.getCurrentTime ? window.PulsePlaybar.getCurrentTime() : 0;
             if (window.PulsePlaybar.seekTo && Math.abs(localTime - expectedTime) > 3) {
               window.PulsePlaybar.seekTo(expectedTime);
             }
          }
          
          // Sync play/pause
          const isLocallyPlaying = window.PulsePlaybar.getIsPlaying();
          if (pState.isPlaying && !isLocallyPlaying) {
            if (window.PulsePlaybar.resume) window.PulsePlaybar.resume();
          } else if (!pState.isPlaying && isLocallyPlaying) {
            if (window.PulsePlaybar.pause) window.PulsePlaybar.pause();
          }
        }
      });
    };
    } catch (err) {
      console.warn('[Listening Party URL] Error:', err);
    }
  };

  let _pulseAppInitialized = false;
  function initPulseApp() {
    // 1. Hide install UI if running inside PWA or previously installed (always runs — cheap)
    applyPWAUIState();

    // Guard: skip all expensive work if already initialized
    if (_pulseAppInitialized) return;
    _pulseAppInitialized = true;

    // Query OS/Chromium if app is already installed on this device
    if ('getInstalledRelatedApps' in navigator) {
      navigator.getInstalledRelatedApps().then(apps => {
        if (apps && apps.length > 0) {
          try { localStorage.setItem('pulse_app_installed', 'true'); } catch (e) {}
          applyPWAUIState();
        }
      }).catch(() => {});
    }

    // 2. Ensure Home view is active
    const activeView = document.querySelector('.app-view.active-view');
    if (!activeView) {
      const homeView = document.getElementById('view-home');
      if (homeView) homeView.classList.add('active-view');
    }

    // 3. Render Home Feed Discovery immediately
    if (typeof window.renderHomeDiscovery === 'function') {
      window.renderHomeDiscovery();
    }
    
    // Check for listening party in URL
    if (typeof window.handleListeningPartyURL === 'function') {
      window.handleListeningPartyURL();
    }

    // Check for shared playlist in URL
    if (typeof window.handleSharedPlaylistURL === 'function') {
      window.handleSharedPlaylistURL();
    }

    // Check for shared music track link in URL
    if (typeof window.handleSharedMusicURL === 'function') {
      window.handleSharedMusicURL();
    }

    // Initialize Dynamic Ambient Wallpaper across app
    try {
      const qp = getQuickPicks();
      if (qp && qp.length > 0 && qp[0].cover) {
        const initialCover = qp[0].cover;
        const appWallpaper = document.getElementById('app-dynamic-wallpaper');
        if (appWallpaper) {
          appWallpaper.style.backgroundImage = `url('${initialCover}')`;
          appWallpaper.classList.add('active-wallpaper');
        }
        const fsBg = document.getElementById('fs-bg-blur');
        if (fsBg && !fsBg.style.backgroundImage) {
          fsBg.style.backgroundImage = `url('${initialCover}')`;
        }
      }
    } catch (e) {}

    // 4. Initial Auth State Sync
    onAuthStateChanged(() => {});

    // 5. Realtime Library Updates
    onFavoritesChanged(() => {
      if (window.pulseState.activeLibraryTab === 'favorites') {
        window.renderLibraryView();
      }
    });

    onPlaylistsChanged(() => {
      if (window.pulseState.activeLibraryTab === 'playlists') {
        window.renderLibraryView();
      }
      if (window.renderUserPlaylistsShelf) {
        window.renderUserPlaylistsShelf();
      }
    });

    onHistoryChanged(() => {
      if (window.pulseState.activeLibraryTab === 'history') {
        window.renderLibraryView();
      }
    });

    // 6. Search Input Binding
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      const updateSearchPlaceholder = () => {
        if (window.innerWidth <= 640) {
          searchInput.placeholder = 'Search any song or artist...';
        } else if (window.innerWidth <= 1024) {
          searchInput.placeholder = 'Search songs, artists, lyrics...';
        } else {
          searchInput.placeholder = 'Search any song in any language (Kannada, Hindi, English, Punjabi, Spanish...)';
        }
      };
      updateSearchPlaceholder();
      window.addEventListener('resize', updateSearchPlaceholder);

      searchInput.addEventListener('input', (e) => {
        const clearBtn = document.getElementById('clear-search-btn');
        if (clearBtn) {
          clearBtn.classList.toggle('hidden', !e.target.value);
        }
        // Only trigger search after at least 2 characters to avoid wasted API calls
        if (e.target.value.trim().length >= 2) {
          window.executeSearch(e.target.value, true);
        }
      });
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          window.executeSearch(e.target.value, false);
        }
      });
    }
  }

  // Multi-pass initialization to guarantee song rendering across all devices & PWA launches
  initPulseApp();
  setTimeout(initPulseApp, 100);
  setTimeout(initPulseApp, 500);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPulseApp);
  }
  window.addEventListener('load', initPulseApp);

  // ---------------------------------------------------------------------------
  // PROGRESSIVE WEB APP (PWA) SUPPORT & SMART INSTALL ENGINE
  // ---------------------------------------------------------------------------
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const isInstalled = document.body.classList.contains('is-pwa-standalone') || 
                        document.body.classList.contains('is-pwa-installed') ||
                        (function() {
                          try { return localStorage.getItem('pulse_app_installed') === 'true'; } catch (err) { return false; }
                        })();

    // Do not aggressively pop up install banner on timer; keep available for user action
    window.__canInstallPWA = true;
  });

  window.dismissPWABanner = function() {
    const banner = document.getElementById('pwa-floating-banner');
    if (banner) {
      banner.classList.add('hidden');
      banner.style.display = 'none';
      sessionStorage.setItem('pulse_pwa_dismissed', 'true');
    }
  };

  window.triggerPWAInstall = async function() {
    const banner = document.getElementById('pwa-floating-banner');
    if (banner) {
      banner.classList.add('hidden');
      banner.style.display = 'none';
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          deferredPrompt = null;
          try { localStorage.setItem('pulse_app_installed', 'true'); } catch (e) {}
          applyPWAUIState();
          window.closeDownloadModal();
          window.showToast('🚀 Pulse Music installed on your device! Check your Home Screen / Taskbar.', 'success', 6000);
          return;
        }
      } catch (err) {
        console.warn('PWA prompt error:', err);
      }
    }
    
    // If native prompt is not available, download the desktop shortcut immediately + show instructions
    const plat = window.detectUserPlatform ? window.detectUserPlatform() : 'windows';
    if (plat === 'windows' || plat === 'pwa') {
      window.downloadWindowsShortcut();
      window.showToast('💡 Tip: Click the [ ⊕ Install ] icon in your Chrome address bar or double-click the downloaded shortcut!', 'info', 7000);
    } else if (plat === 'mac') {
      window.downloadMacShortcut();
    } else {
      window.showToast('To install Pulse, tap the Share/Menu button in your browser and select "Add to Home Screen" 📱', 'info', 6000);
    }
  };

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    try { localStorage.setItem('pulse_app_installed', 'true'); } catch (e) {}
    applyPWAUIState();
    window.showToast('Pulse Music installed successfully! Enjoy your ad-free music 🎧', 'success', 6000);
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('Pulse PWA Service Worker registered:', reg.scope);
          // Check for service worker updates
          reg.onupdatefound = () => {
            const installing = reg.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New content is available; refreshing...');
                }
              };
            }
          };
        })
        .catch(err => console.error('Pulse PWA Service Worker error:', err));
    });
  }

  // ---------------------------------------------------------------------------
  // AUTH GATE SCREEN & SESSION CONTROLLER
  // Allowed by default: Never block or interrupt listeners
  // ---------------------------------------------------------------------------
  function checkAuthGateState(user = null) {
    const isUnlocked = isGateUnlocked();
    const gate = document.getElementById('auth-gate-screen');
    const app = document.getElementById('app');
    if (gate) {
      gate.classList.add('gate-unlocked');
      gate.style.display = 'none';
      gate.style.opacity = '0';
      gate.style.visibility = 'hidden';
      gate.style.pointerEvents = 'none';
    }
    if (app) {
      app.classList.remove('auth-gate-locked');
    }
  }

  let isGateSignInInProgress = false;
  window.handleGateGoogleSignIn = async function() {
    if (isGateSignInInProgress) return;
    isGateSignInInProgress = true;

    const btn = document.getElementById('gate-google-signin-btn');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Signing in with Google...';
    }

    try {
      const user = await signInWithGoogle();
      if (!user) return; // If redirect was triggered or sign-in in progress
      setGateUnlocked(true);
      const gate = document.getElementById('auth-gate-screen');
      const app = document.getElementById('app');

      if (gate) {
        gate.classList.add('gate-unlocked');
        setTimeout(() => { gate.style.display = 'none'; }, 450);
      }
      if (app) app.classList.remove('auth-gate-locked');

      if (window.showToast) {
        window.showToast(`🎉 Welcome to Pulse Music, ${user.name || 'Listener'}! Cloud sync active.`, 'success', 5000);
      }

      if (window.PulseFirestore && window.PulseFirestore.getFavorites) {
        window.PulseFirestore.getFavorites();
      }
      if (window.PulseFirestore && window.PulseFirestore.getPlaylists) {
        window.PulseFirestore.getPlaylists();
      }
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Google Sign-In cancelled. Please try again.', 'info', 5000);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
      isGateSignInInProgress = false;
      checkAuthGateState();
    }
  };

  window.handleGateGuestContinue = function() {
    setGateUnlocked(true);
    const gate = document.getElementById('auth-gate-screen');
    const app = document.getElementById('app');
    if (gate) {
      gate.classList.add('gate-unlocked');
      setTimeout(() => { gate.style.display = 'none'; }, 450);
    }
    if (app) app.classList.remove('auth-gate-locked');
    if (window.showToast) {
      window.showToast('Continuing as Guest listener. Enjoy unlimited music! 🎵', 'info', 4000);
    }
  };

  // ---------------------------------------------------------------------------
  // PROFILE, PRIVACY & SETTINGS MODAL CONTROLLER
  // ---------------------------------------------------------------------------
  window.openAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      updateAuthModalContent();
    }
  };

  window.closeAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.switchProfileTab = function(tabName) {
    const tabs = ['stats', 'privacy', 'audio'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      const panel = document.getElementById(`tab-panel-${t}`);
      if (btn) {
        btn.classList.toggle('active', t === tabName);
        btn.style.borderBottom = t === tabName ? '2px solid #a855f7' : '2px solid transparent';
        btn.style.color = t === tabName ? '#fff' : 'var(--text-secondary)';
      }
      if (panel) {
        panel.classList.toggle('hidden', t !== tabName);
      }
    });
  };

  window.toggleNameEditor = function(force = null) {
    const form = document.getElementById('profile-name-edit-form');
    const input = document.getElementById('profile-name-input');
    const user = getStoredUser();
    if (!form) return;
    const isHidden = typeof force === 'boolean' ? !force : form.classList.contains('hidden');
    form.classList.toggle('hidden', !isHidden);
    if (isHidden && input) {
      input.value = user?.name || '';
      input.focus();
    }
  };

  window.saveDisplayName = async function() {
    const input = document.getElementById('profile-name-input');
    const newName = (input?.value || '').trim();
    if (!newName) {
      if (window.showToast) window.showToast('Name cannot be empty', 'warning', 2500);
      return;
    }
    try {
      const updated = await updateUserProfile({ name: newName });
      window.toggleNameEditor(false);
      updateAuthModalContent();
      renderHeaderAuthButton(updated);
      if (window.showToast) window.showToast(`Display name updated to "${newName}"`, 'success', 3000);
    } catch (e) {
      if (window.showToast) window.showToast('Failed to update name: ' + e.message, 'error', 3500);
    }
  };

  const AVATAR_PRESETS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=PulseNeon',
    'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBass',
    'https://api.dicebear.com/7.x/bottts/svg?seed=ElectroBeat',
    'https://api.dicebear.com/7.x/bottts/svg?seed=AcousticWave',
    'https://api.dicebear.com/7.x/bottts/svg?seed=SynthStar',
    'https://api.dicebear.com/7.x/bottts/svg?seed=SonicFlow'
  ];

  window.toggleAvatarPicker = function(force = null) {
    const drawer = document.getElementById('profile-avatar-picker-drawer');
    const grid = document.getElementById('avatar-presets-grid');
    if (!drawer) return;
    const isHidden = typeof force === 'boolean' ? !force : drawer.classList.contains('hidden');
    drawer.classList.toggle('hidden', !isHidden);

    if (isHidden && grid && grid.children.length === 0) {
      grid.innerHTML = AVATAR_PRESETS.map((url, idx) => `
        <button onclick="window.selectPresetAvatar('${url}')" style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(168,85,247,0.4); padding: 3px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          <img src="${url}" alt="Avatar ${idx+1}" style="width: 100%; height: 100%; border-radius: 8px; object-fit: contain;">
        </button>
      `).join('');
    }
  };

  window.selectPresetAvatar = async function(url) {
    try {
      const updated = await updateUserProfile({ avatar: url });
      window.toggleAvatarPicker(false);
      updateAuthModalContent();
      renderHeaderAuthButton(updated);
      if (window.showToast) window.showToast('Profile avatar updated!', 'success', 2500);
    } catch (e) {
      if (window.showToast) window.showToast('Failed to change avatar', 'error', 3000);
    }
  };

  window.handleCustomAvatarApply = async function() {
    const input = document.getElementById('custom-avatar-url-input');
    const url = (input?.value || '').trim();
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image'))) {
      if (window.showToast) window.showToast('Please enter a valid image URL', 'warning', 2500);
      return;
    }
    await window.selectPresetAvatar(url);
    if (input) input.value = '';
  };

  window.copyPulseUid = function() {
    const user = getStoredUser();
    const uid = user?.uid || user?.id || 'guest';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(uid).then(() => {
        if (window.showToast) window.showToast('Pulse UID copied to clipboard! 📋', 'success', 2500);
      });
    } else {
      if (window.showToast) window.showToast(`UID: ${uid}`, 'info', 3000);
    }
  };

  window.handlePrivacyToggle = async function(settingKey, isChecked) {
    try {
      await updatePrivacySettings({ [settingKey]: isChecked });
      if (window.showToast) {
        if (settingKey === 'privateSession') {
          window.showToast(isChecked ? '🔒 Private Session enabled (history disabled)' : '🔓 Private Session disabled (history active)', 'info', 3000);
        } else if (settingKey === 'cloudHistorySync') {
          window.showToast(isChecked ? '☁️ Cloud Firestore sync enabled' : 'Cloud sync disabled', 'info', 2500);
        } else if (settingKey === 'publicPlaylists') {
          window.showToast(isChecked ? '🔗 Public playlist links enabled' : 'Playlists kept private', 'info', 2500);
        }
      }
    } catch (e) {
      console.warn('Privacy toggle update notice:', e);
    }
  };

  window.handleLanguageChange = async function(val) {
    try {
      await updateUserProfile({ preferredLanguage: val });
      if (window.showToast) window.showToast(`Preferred language set to ${val}`, 'success', 2500);
    } catch (e) {}
  };

  window.handleClearCache = async function() {
    try {
      await clearUserCache();
      if (window.showToast) {
        window.showToast('🧹 Cache storage cleared successfully! Device memory freed.', 'success', 3500);
      }
    } catch (e) {
      if (window.showToast) window.showToast('Cache cleared', 'info', 2500);
    }
  };

  window.handleExportUserData = function() {
    try {
      exportUserData();
      if (window.showToast) window.showToast('📦 Music profile & playlists exported to JSON archive!', 'success', 4000);
    } catch (e) {
      if (window.showToast) window.showToast('Export failed: ' + e.message, 'error', 3000);
    }
  };

  window.handleAudioQualityChange = async function(val) {
    await updatePrivacySettings({ audioQuality: val });
    if (window.showToast) window.showToast(`Master audio quality set to ${val}`, 'success', 2500);
  };

  window.handleEqChange = async function(val) {
    await updatePrivacySettings({ eqPreset: val });
    if (window.showToast) window.showToast(`Equalizer profile set to ${val}`, 'success', 2500);
  };

  window.handleLyricsScrollToggle = async function(isChecked) {
    await updatePrivacySettings({ autoScrollLyrics: isChecked });
  };

  window.handleAutoplayToggle = async function(isChecked) {
    await updatePrivacySettings({ gaplessPlayback: isChecked });
  };

  async function updateAuthModalContent() {
    const user = getStoredUser();
    const guestBox = document.getElementById('auth-guest-view');
    const privacy = getPrivacySettings();

    const isGoogle = user && user.provider === 'google';
    const isEmail = user && user.provider === 'email';
    const isPhone = user && user.provider === 'phone';
    const isRealUser = isGoogle || isEmail || isPhone;

    if (guestBox) {
      guestBox.style.display = isRealUser ? 'none' : 'block';
    }

    const avatarEl = document.getElementById('auth-user-avatar');
    const nameEl = document.getElementById('auth-user-name');
    const emailEl = document.getElementById('auth-user-email');
    const providerBadge = document.getElementById('profile-provider-badge');
    const providerName = document.getElementById('profile-provider-name');
    const uidText = document.getElementById('profile-uid-text');

    if (avatarEl) avatarEl.src = user?.avatar || './pulse-logo.png';
    if (nameEl) nameEl.textContent = user?.name || (isRealUser ? 'Pulse Listener' : 'Guest Listener');
    if (emailEl) emailEl.textContent = user?.phoneNumber || user?.email || (isRealUser ? '' : 'guest@pulse.app');
    if (uidText) {
      const rawUid = user?.uid || user?.id || 'guest';
      uidText.textContent = rawUid.length > 12 ? rawUid.slice(0, 10) + '...' : rawUid;
    }

    if (providerBadge && providerName) {
      if (isGoogle) {
        providerName.textContent = 'Google Connected';
        providerBadge.style.color = '#38bdf8';
        providerBadge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        providerBadge.style.background = 'rgba(56, 189, 248, 0.12)';
      } else if (isPhone) {
        providerName.textContent = 'Phone Verified';
        providerBadge.style.color = '#34d399';
        providerBadge.style.borderColor = 'rgba(52, 211, 153, 0.4)';
        providerBadge.style.background = 'rgba(16, 185, 129, 0.12)';
      } else if (isEmail) {
        providerName.textContent = 'Verified Email';
        providerBadge.style.color = '#a855f7';
        providerBadge.style.borderColor = 'rgba(168, 85, 247, 0.4)';
        providerBadge.style.background = 'rgba(168, 85, 247, 0.12)';
      } else {
        providerName.textContent = 'Guest Mode';
        providerBadge.style.color = '#94a3b8';
        providerBadge.style.borderColor = 'rgba(148, 163, 184, 0.3)';
        providerBadge.style.background = 'rgba(255, 255, 255, 0.05)';
      }
    }

    // Update Live Listening Metrics
    const favCountEl = document.getElementById('profile-stat-favorites');
    const plCountEl = document.getElementById('profile-stat-playlists');
    const histCountEl = document.getElementById('profile-stat-history');
    const downCountEl = document.getElementById('profile-stat-downloads');

    if (favCountEl) {
      const favs = await getFavorites();
      favCountEl.textContent = String(favs ? favs.length : 0);
    }
    if (plCountEl) {
      const pls = await getPlaylists();
      plCountEl.textContent = String(pls ? pls.length : 0);
    }
    if (histCountEl) {
      const hist = await getHistory();
      histCountEl.textContent = String(hist ? hist.length : 0);
    }
    if (downCountEl) {
      try {
        const raw = localStorage.getItem('pulse_downloaded_tracks');
        const dl = raw ? JSON.parse(raw) : [];
        downCountEl.textContent = String(dl.length);
      } catch (e) {
        downCountEl.textContent = '0';
      }
    }

    // Update Settings Checkboxes and Selects
    const incognitoToggle = document.getElementById('privacy-incognito-toggle');
    const cloudSyncToggle = document.getElementById('privacy-cloud-sync-toggle');
    const publicPlaylistsToggle = document.getElementById('privacy-public-playlists-toggle');
    const lyricsScrollToggle = document.getElementById('profile-lyrics-scroll-toggle');
    const autoplayToggle = document.getElementById('profile-autoplay-toggle');
    const qualitySelect = document.getElementById('profile-audio-quality-select');
    const eqSelect = document.getElementById('profile-eq-select');
    const langSelect = document.getElementById('profile-language-select');

    if (incognitoToggle) incognitoToggle.checked = !!privacy.privateSession;
    if (cloudSyncToggle) cloudSyncToggle.checked = privacy.cloudHistorySync !== false;
    if (publicPlaylistsToggle) publicPlaylistsToggle.checked = privacy.publicPlaylists !== false;
    if (lyricsScrollToggle) lyricsScrollToggle.checked = privacy.autoScrollLyrics !== false;
    if (autoplayToggle) autoplayToggle.checked = privacy.gaplessPlayback !== false;
    if (qualitySelect) qualitySelect.value = privacy.audioQuality || '320kbps';
    if (eqSelect) eqSelect.value = privacy.eqPreset || 'balanced';
    if (langSelect && user?.preferredLanguage) langSelect.value = user.preferredLanguage;
  }

  function renderHeaderAuthButton(user) {
    const btn = document.getElementById('mobile-header-profile-btn');
    if (!btn) return;

    if (user && (user.provider === 'google' || user.provider === 'email')) {
      btn.innerHTML = `
        <img src="${user.avatar || './pulse-logo.png'}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
      `;
      btn.title = `Signed in as ${user.name} (${user.email}) - Click for Profile & Privacy`;
      btn.style.borderColor = 'rgba(168, 85, 247, 0.6)';
    } else {
      btn.innerHTML = `
        <i class="fa-solid fa-circle-user"></i>
      `;
      btn.title = "View Profile, Privacy & Settings";
      btn.style.borderColor = 'transparent';
    }
  }

  let isModalSignInInProgress = false;
  window.handleGoogleSignIn = async function() {
    if (isModalSignInInProgress) return;
    isModalSignInInProgress = true;

    const btn = document.getElementById('google-signin-btn');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Opening Google Sign-In...';
    }

    try {
      const user = await signInWithGoogle();
      if (!user) return; // If redirect was triggered or sign-in in progress
      setGateUnlocked(true);
      if (window.showToast) {
        window.showToast(`🎉 Signed in as ${user.name || 'Listener'}! Cloud Firestore sync active.`, 'success', 5000);
      }
      checkAuthGateState(user);
      if (window.PulseFirestore && window.PulseFirestore.getFavorites) {
        window.PulseFirestore.getFavorites();
      }
      if (window.PulseFirestore && window.PulseFirestore.getPlaylists) {
        window.PulseFirestore.getPlaylists();
      }
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Google Sign-In was interrupted. Please try again.', 'info', 5000);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
      isModalSignInInProgress = false;
      updateAuthModalContent();
    }
  };

  // ---------------------------------------------------------------------------
  // PHONE NUMBER AUTHENTICATION CONTROLLER (SMS OTP)
  // ---------------------------------------------------------------------------
  let _phoneResendCountdown = 0;
  let _phoneResendInterval = null;

  window.openPhoneAuthModal = function() {
    window.openAuthModal();
    window.togglePhoneAuthView(true);
    const input = document.getElementById('pulse-phone-input');
    if (input) setTimeout(() => input.focus(), 200);
  };

  window.togglePhoneAuthView = function(forceShow = null) {
    const panel = document.getElementById('phone-auth-panel');
    const toggleText = document.getElementById('phone-toggle-text');
    if (!panel) return;
    const isHidden = typeof forceShow === 'boolean' ? !forceShow : panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !isHidden);
    if (toggleText) {
      toggleText.textContent = isHidden ? 'Hide Phone Login' : 'Sign In with Phone Number (SMS OTP)';
    }
    if (isHidden) {
      window.backToPhoneInput();
    }
  };

  window.backToPhoneInput = function() {
    const step1 = document.getElementById('phone-input-step');
    const step2 = document.getElementById('phone-otp-step');
    if (step1) step1.classList.remove('hidden');
    if (step2) step2.classList.add('hidden');
    const input = document.getElementById('pulse-phone-input');
    if (input) input.focus();
  };

  window.handleSendPhoneOtp = async function() {
    const countryEl = document.getElementById('phone-country-code');
    const phoneInput = document.getElementById('pulse-phone-input');
    const btn = document.getElementById('btn-send-phone-otp');

    const countryCode = (countryEl?.value || '+91').trim();
    const rawNumber = (phoneInput?.value || '').trim();

    if (!rawNumber || rawNumber.length < 5) {
      if (window.showToast) window.showToast('Please enter your mobile phone number.', 'warning', 3000);
      if (phoneInput) phoneInput.focus();
      return;
    }

    let fullPhone = rawNumber;
    if (!fullPhone.startsWith('+')) {
      const cleanNum = rawNumber.replace(/^0+/, '');
      fullPhone = `${countryCode}${cleanNum}`;
    }

    const originalBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending SMS Code...';
    }

    try {
      if (window.showToast) window.showToast('Verifying security & sending SMS...', 'info', 3000);
      const res = await sendPhoneOtp(fullPhone, 'recaptcha-container');
      
      const step1 = document.getElementById('phone-input-step');
      const step2 = document.getElementById('phone-otp-step');
      const sentToDisplay = document.getElementById('phone-otp-sent-to');
      const otpInput = document.getElementById('pulse-otp-input');

      if (sentToDisplay) sentToDisplay.textContent = res.phoneNumber || fullPhone;
      if (step1) step1.classList.add('hidden');
      if (step2) step2.classList.remove('hidden');
      if (otpInput) {
        otpInput.value = '';
        setTimeout(() => otpInput.focus(), 150);
      }

      if (window.showToast) {
        window.showToast(`📩 6-digit code sent to ${res.phoneNumber}! Please enter it below.`, 'success', 5000);
      }

      startResendCountdown(60);
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Failed to send SMS code. Please try again.', 'error', 4500);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnHtml;
      }
    }
  };

  window.handleVerifyPhoneOtp = async function() {
    const otpInput = document.getElementById('pulse-otp-input');
    const btn = document.getElementById('btn-verify-phone-otp');
    const code = (otpInput?.value || '').trim();

    if (!code || code.length < 4) {
      if (window.showToast) window.showToast('Please enter the 6-digit code from SMS.', 'warning', 3000);
      if (otpInput) otpInput.focus();
      return;
    }

    const originalBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying Code...';
    }

    try {
      const user = await verifyPhoneOtp(code);
      setGateUnlocked(true);
      if (window.showToast) {
        window.showToast(`🎉 Signed in successfully! Welcome, ${user.name}!`, 'success', 5000);
      }
      checkAuthGateState(user);
      updateAuthModalContent();
      if (window.PulseFirestore && window.PulseFirestore.getFavorites) {
        window.PulseFirestore.getFavorites();
      }
      if (window.PulseFirestore && window.PulseFirestore.getPlaylists) {
        window.PulseFirestore.getPlaylists();
      }
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Invalid verification code. Please check SMS.', 'error', 4500);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnHtml;
      }
    }
  };

  window.handleResendPhoneOtp = async function() {
    if (_phoneResendCountdown > 0) {
      if (window.showToast) window.showToast(`Please wait ${_phoneResendCountdown}s before requesting a new code.`, 'info', 2500);
      return;
    }
    await window.handleSendPhoneOtp();
  };

  function startResendCountdown(seconds = 60) {
    _phoneResendCountdown = seconds;
    const timerEl = document.getElementById('phone-resend-timer');
    const resendBtn = document.getElementById('btn-resend-phone-otp');
    if (_phoneResendInterval) clearInterval(_phoneResendInterval);

    if (resendBtn) resendBtn.style.opacity = '0.5';

    _phoneResendInterval = setInterval(() => {
      _phoneResendCountdown--;
      if (timerEl) timerEl.textContent = `(${_phoneResendCountdown}s)`;
      if (_phoneResendCountdown <= 0) {
        clearInterval(_phoneResendInterval);
        if (timerEl) timerEl.textContent = '';
        if (resendBtn) resendBtn.style.opacity = '1';
      }
    }, 1000);
  }

  window.handleSignOut = async function() {
    try {
      if (window.PulsePlaybar && window.PulsePlaybar.pause) {
        window.PulsePlaybar.pause();
      }
      await signOut();
      if (window.showToast) {
        window.showToast('Signed out of Pulse Music. You are now listening in Guest mode.', 'info', 4000);
      }
      window.closeAuthModal();
      checkAuthGateState();
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  };

  // Sync auth state changes to header button, modal, and gate screen
  onAuthStateChanged((user) => {
    renderHeaderAuthButton(user);
    updateAuthModalContent();
    checkAuthGateState(user);
    if (window.renderUserPlaylistsShelf) {
      window.renderUserPlaylistsShelf();
    }
  });

  // Remove category filter pills from home screen if present
  function removeFilterPillsBar() {
    document.querySelectorAll('section.filter-pills-bar, #view-home .filter-pills-bar').forEach(el => el.remove());
  }
  removeFilterPillsBar();

  // Check gate screen initially on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      removeFilterPillsBar();
      checkAuthGateState();
    });
  } else {
    checkAuthGateState();
  }

})();





