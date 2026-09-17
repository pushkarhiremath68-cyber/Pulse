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
  signOut,
  isGateUnlocked,
  setGateUnlocked,
  updateUserProfile,
  getPrivacySettings,
  updatePrivacySettings,
  exportUserData,
  clearUserCache
} from './firebaseAuthService.js';
import { getFavorites, removeFavorite, addFavorite, isFavorite, getPlaylists, createPlaylist, deletePlaylist, addTrackToPlaylist, getHistory, clearHistory, onFavoritesChanged, onPlaylistsChanged, onHistoryChanged } from './firestoreService.js';
import { getQuickPicks, getFeaturedArtists, getArtistDetails, getCuratedPlaylists, CATALOG_CATEGORIES, LANGUAGE_PLAYLISTS } from './catalogService.js';
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
  };

  // Playback Trigger
  window.playTrackDirect = function(track, queue = null) {
    if (!track) return;
    if (window.PulsePlaybar && typeof window.PulsePlaybar.playTrack === 'function') {
      window.PulsePlaybar.playTrack(track, queue);
      window.loadTrackLyrics(track);
    }
    const coverUrl = track.coverUrl || track.cover || (track.ytId ? `https://i.ytimg.com/vi/${track.ytId}/hqdefault.jpg` : './music-cover.svg');
    const appWallpaper = document.getElementById('app-dynamic-wallpaper');
    if (appWallpaper) {
      appWallpaper.style.backgroundImage = `url('${coverUrl}')`;
      appWallpaper.classList.add('active-wallpaper');
    }
    const heroBg = document.getElementById('hero-bg-artwork');
    if (heroBg) {
      heroBg.style.backgroundImage = `url('${coverUrl}')`;
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

    if (fsModal) {
      fsModal.classList.toggle('fs-wallpaper-mode-active', viewMode === 'wallpaper');
    }

    // Update active tab buttons
    document.querySelectorAll('.fs-mode-tab-btn').forEach(btn => {
      btn.classList.toggle('active-tab', btn.getAttribute('data-mode') === viewMode);
    });

    if (content) {
      content.setAttribute('data-active-view', viewMode);
    }

    if (artSec) artSec.classList.toggle('hidden-view', viewMode !== 'art' && viewMode !== 'wallpaper');
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
          window.showToast(`🖼️ Wallpaper downloaded! Set as your Lock Screen 📲`, 'success', 3500);
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
              window.showToast(`🖼️ HD Wallpaper saved! Perfect for Phone & Desktop 📲`, 'success', 5000);
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
      <div class="context-menu-divider"></div>
      <button class="context-menu-item" onclick="window.downloadTrackWallpaper(window.__activeContextTrack); window.closeCardContextMenu();">
        <i class="fa-solid fa-image" style="color: #38bdf8;"></i> Save HD Wallpaper
      </button>
      <button class="context-menu-item" onclick="window.openArtistView('${(track.artist || '').replace(/'/g, "\\'")}'); window.closeCardContextMenu();">
        <i class="fa-solid fa-user" style="color: #f59e0b;"></i> Artist Discography
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

  window.renderHomeDiscovery = function() {
    // Top Greeting
    window.renderPersonalizedGreeting();

    // 1. Recently Played
    window.renderRecentlyPlayedShelf();

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

    // 7. Curated Playlists Carousel
    const plContainer = document.getElementById('home-curated-playlists-container');
    if (plContainer) {
      const playlists = getCuratedPlaylists();
      window.__curatedPlaylists = playlists;
      plContainer.innerHTML = playlists.map((pl, idx) => `
        <div class="curated-playlist-card hover-glow" onclick="window.playCuratedPlaylist(${idx})" style="min-width: 200px; width: 200px; flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 16px; padding: 1rem; cursor: pointer; transition: all 0.25s ease;">
          <div class="curated-cover-wrap" style="position: relative; width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; margin-bottom: 0.75rem;">
            <img src="${pl.coverUrl || './music-cover.svg'}" alt="${escapeHtml(pl.title)}" class="curated-cover-img" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='./music-cover.svg';">
            <span class="curated-badge" style="position: absolute; top: 8px; right: 8px; font-size: 0.7rem; font-weight: 700; background: rgba(0,0,0,0.8); color: #c084fc; padding: 2px 8px; border-radius: 12px;">${pl.trackCount} Tracks</span>
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
    if (pl && pl.tracks && pl.tracks.length > 0) {
      window.playTrackDirect(pl.tracks[0], pl.tracks);
      window.showToast(`Playing "${pl.title}"`, 'info');
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
  window.playPresetQuery = async function(query) {
    if (!query) return;
    window.switchView('search-view');
    const input = document.getElementById('global-search-input');
    if (input) input.value = query;
    
    const label = document.getElementById('search-query-label');
    const count = document.getElementById('search-count');
    if (label) label.textContent = query;
    if (count) count.textContent = 'Searching worldwide & multilingual catalogs...';
    
    try {
      const results = await window.musicService.searchTracks(query, 50);
      if (count) count.textContent = `${results.length} songs found worldwide`;
      renderSearchResults(results);
      if (results && results.length > 0) {
        window.playTrackDirect(results[0], results);
      }
    } catch (e) {
      window.showToast("Failed to fetch stream.", 'warning');
    }
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
      const results = await window.musicService.searchTracks(query, 80);
      if (count) count.textContent = `${results.length} songs found worldwide`;
      renderSearchResults(results);
    }, isTyping ? 250 : 0);
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

    container.innerHTML = tracks.map((track, idx) => 
      window.renderSongCard(track, idx, 'window.__searchResults', { badge: track.source || '320kbps Master' })
    ).join('');
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

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
          ${playlists.map(pl => `
            <div class="playlist-card hover-glow" onclick="window.playPlaylistDirect('${pl.id}')" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 16px; padding: 1rem; cursor: pointer;">
              <img src="${pl.coverUrl || './music-cover.svg'}" alt="playlist" style="width: 100%; aspect-ratio: 1; border-radius: 12px; object-fit: cover; margin-bottom: 0.75rem;">
              <h4 style="color: #fff; font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">${escapeHtml(pl.name)}</h4>
              <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0;">${pl.tracks ? pl.tracks.length : 0} tracks</p>
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

  window.openCreatePlaylistModal = function() {
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
    if (pl && pl.tracks && pl.tracks.length > 0) {
      window.playTrackDirect(pl.tracks[0], pl.tracks);
      window.showToast(`Playing playlist "${pl.name}"`, 'info');
    } else {
      window.showToast('Playlist is empty', 'warning');
    }
  };

  let trackToAddToPlaylist = null;
  window.openAddToPlaylistModal = async function(track) {
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

      window.showToast('✅ "Pulse-Music.url" downloaded! Drag it to your desktop.', 'success', 5000);
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
      window.showToast('📲 Downloading iOS Configuration Profile... Tap "Allow", then go to Settings ➔ "Profile Downloaded" to install Pulse!', 'info', 7000);
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
  // 6. GEMINI AI DJ & SONG DISCOVERY CONTROLLERS
  // ---------------------------------------------------------------------------
  window.openGeminiDJModal = function() {
    const modal = document.getElementById('gemini-dj-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const input = document.getElementById('gemini-prompt-input');
      if (input) input.focus();
    }
  };

  window.closeGeminiDJModal = function() {
    const modal = document.getElementById('gemini-dj-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.handleAskGeminiDJ = async function(presetPrompt) {
    const promptInput = document.getElementById('gemini-prompt-input');
    const prompt = presetPrompt || (promptInput ? promptInput.value : '');
    if (!prompt || !prompt.trim()) {
      window.showToast('Please enter a vibe or song for Gemini AI', 'warning');
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
      window.showToast('Gemini tracks ready', 'info');
    }
  };

  // ---------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY & PWA COLD-START
  // ---------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY & PWA COLD-START
  // ---------------------------------------------------------------------------
  function applyPWAUIState() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.matchMedia('(display-mode: fullscreen)').matches ||
                         window.matchMedia('(display-mode: minimal-ui)').matches ||
                         window.navigator.standalone === true ||
                         window.location.search.includes('source=pwa') ||
                         document.referrer.includes('android-app://') ||
                         Boolean(window.electronAPI && window.electronAPI.isElectron);
    
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

  function initPulseApp() {
    // 1. Hide install UI if running inside PWA or previously installed
    applyPWAUIState();

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
    });

    onHistoryChanged(() => {
      if (window.pulseState.activeLibraryTab === 'history') {
        window.renderLibraryView();
      }
    });

    // 6. Search Input Binding
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const clearBtn = document.getElementById('clear-search-btn');
        if (clearBtn) {
          clearBtn.classList.toggle('hidden', !e.target.value);
        }
        window.executeSearch(e.target.value, true);
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

    // Show floating smart install banner ONLY if running inside browser and not installed
    if (!isInstalled && !sessionStorage.getItem('pulse_pwa_dismissed')) {
      setTimeout(() => {
        const banner = document.getElementById('pwa-floating-banner');
        if (banner && !document.body.classList.contains('is-pwa-standalone') && !document.body.classList.contains('is-pwa-installed')) {
          banner.classList.remove('hidden');
          banner.style.display = 'flex';
        }
      }, 3000);
    }
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
          window.showToast('🎉 Pulse Music installed on your device! Check your Home Screen / Taskbar.', 'success', 6000);
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
      window.showToast('💻 Tip: Click the [ 💻↓ Install ] icon in your Chrome address bar or double-click the downloaded shortcut!', 'info', 7000);
    } else if (plat === 'mac') {
      window.downloadMacShortcut();
    } else if (plat === 'android') {
      window.showToast('📱 Android: Tap Chrome 3 dots (⋮) ➔ "Install app" or "Add to Home screen"', 'info', 7000);
    } else if (plat === 'ios') {
      window.showIosAddHomeGuide();
    }
  };

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    try { localStorage.setItem('pulse_app_installed', 'true'); } catch (e) {}
    applyPWAUIState();
    window.showToast('Pulse Music installed successfully! Enjoy your ad-free music 🎵', 'success', 6000);
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
  // Prevents repeated gate screens once user is logged in or continued
  // ---------------------------------------------------------------------------
  function checkAuthGateState(user = null) {
    const activeUser = user || getStoredUser();
    const gate = document.getElementById('auth-gate-screen');
    const app = document.getElementById('app');
    if (!gate) return;

    const unlocked = isGateUnlocked() || (activeUser && (activeUser.provider === 'google' || activeUser.provider === 'email'));

    if (unlocked) {
      gate.classList.add('gate-unlocked');
      setTimeout(() => {
        if (gate.classList.contains('gate-unlocked')) {
          gate.style.display = 'none';
        }
      }, 450);
      if (app) app.classList.remove('auth-gate-locked');
    } else {
      gate.style.display = 'flex';
      gate.classList.remove('gate-unlocked');
      if (app) app.classList.add('auth-gate-locked');
    }
  }

  window.handleGateGoogleSignIn = async function() {
    const btn = document.getElementById('gate-google-signin-btn');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Signing in with Google...';
    }

    try {
      const user = await signInWithGoogle();
      setGateUnlocked(true);
      const gate = document.getElementById('auth-gate-screen');
      const app = document.getElementById('app');

      if (gate) {
        gate.classList.add('gate-unlocked');
        setTimeout(() => { gate.style.display = 'none'; }, 450);
      }
      if (app) app.classList.remove('auth-gate-locked');

      if (window.showToast) {
        window.showToast(`🎉 Welcome to Pulse Music, ${user.name}! Cloud sync active.`, 'success', 5000);
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
          window.showToast(isChecked ? '🌍 Public playlist links enabled' : 'Playlists kept private', 'info', 2500);
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
      if (window.showToast) window.showToast('📥 Music profile & playlists exported to JSON archive!', 'success', 4000);
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

  function updateAuthModalContent() {
    const user = getStoredUser();
    const guestBox = document.getElementById('auth-guest-view');
    const privacy = getPrivacySettings();

    const isGoogle = user && user.provider === 'google';
    const isEmail = user && user.provider === 'email';
    const isRealUser = isGoogle || isEmail;

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
    if (emailEl) emailEl.textContent = user?.email || (isRealUser ? '' : 'guest@pulse.app');
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

    if (favCountEl) favCountEl.textContent = String(getFavorites().length);
    if (plCountEl) plCountEl.textContent = String(getPlaylists().length);
    if (histCountEl) histCountEl.textContent = String(getHistory().length);
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
    const btn = document.getElementById('header-auth-btn');
    if (!btn) return;

    if (user && (user.provider === 'google' || user.provider === 'email')) {
      const firstName = (user.name || 'User').split(' ')[0];
      btn.innerHTML = `
        <img src="${user.avatar || './pulse-logo.png'}" alt="Profile" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; border: 1.5px solid #a855f7;">
        <span style="max-width: 90px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(firstName)}</span>
      `;
      btn.title = `Signed in as ${user.name} (${user.email}) - Click for Profile & Privacy`;
      btn.style.borderColor = 'rgba(168, 85, 247, 0.6)';
      btn.style.background = 'rgba(168, 85, 247, 0.15)';
    } else {
      btn.innerHTML = `
        <i class="fa-solid fa-user-gear" style="color: #c084fc;"></i>
        <span>Profile</span>
      `;
      btn.title = "View Profile, Privacy & Settings";
      btn.style.borderColor = 'rgba(255, 255, 255, 0.18)';
      btn.style.background = 'rgba(255, 255, 255, 0.08)';
    }
  }

  window.handleGoogleSignIn = async function() {
    const btn = document.getElementById('google-signin-btn');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Opening Google Sign-In...';
    }

    try {
      const user = await signInWithGoogle();
      setGateUnlocked(true);
      if (window.showToast) {
        window.showToast(`🎉 Signed in as ${user.name}! Cloud Firestore sync active.`, 'success', 5000);
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
        window.showToast(err.message || 'Google Sign-In cancelled or failed', 'info', 5000);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
      updateAuthModalContent();
    }
  };

  window.handleSignOut = async function() {
    try {
      if (window.PulsePlaybar && window.PulsePlaybar.pause) {
        window.PulsePlaybar.pause();
      }
      await signOut();
      setGateUnlocked(false);
      if (window.showToast) {
        window.showToast('Signed out of Pulse Music.', 'info', 5000);
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
  });

  // Check gate screen initially on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkAuthGateState());
  } else {
    checkAuthGateState();
  }

})();

