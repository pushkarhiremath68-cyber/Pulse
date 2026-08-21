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
import './visualizer.js';
import './geminiService.js';

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
      e.target.src = './pulse-logo.png';
    }
  }
}, true);

import { getStoredUser, onAuthStateChanged } from './firebaseAuthService.js';
import { getFavorites, removeFavorite, addFavorite, getPlaylists, createPlaylist, deletePlaylist, addTrackToPlaylist, getHistory, clearHistory, onFavoritesChanged, onPlaylistsChanged, onHistoryChanged } from './firestoreService.js';
import { getQuickPicks, getFeaturedArtists, getArtistDetails, getCuratedPlaylists, CATALOG_CATEGORIES, LANGUAGE_PLAYLISTS } from './catalogService.js';
import { getLyrics, getActiveLineIndex } from './lyricsService.js';
import { askGeminiDJ } from './geminiService.js';

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
            ${line.text}
          </p>
        `;
      }).join('');

      if (drawerContent) {
        drawerContent.innerHTML = `
          <div class="lyrics-mode-badge" style="font-size: 0.8rem; font-weight: 700; color: #c084fc; margin-bottom: 1rem; text-align: center;">${lyricsData.isSynced ? '⚡ Real-Time Synchronized Karaoke' : '📄 Plain Lyrics'} • ${lyricsData.source}</div>
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

  /**
   * 3-Way Mode Switcher for Fullscreen Player: 'art' | 'video' | 'lyrics'
   */
  window.switchFullscreenView = function(viewMode) {
    const fsModal = document.getElementById('fullscreen-player');
    const content = document.getElementById('fs-content-container');
    const artSec = document.getElementById('fs-album-section');
    const ytSec = document.getElementById('fs-yt-section');
    const lyricsSec = document.getElementById('fs-lyrics-panel');

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
    if (ytSec) ytSec.classList.toggle('hidden-view', viewMode !== 'video');
    if (lyricsSec) lyricsSec.classList.toggle('hidden-view', viewMode !== 'lyrics');

    const toggleBtn = document.getElementById('fs-toggle-lyrics-btn');
    if (toggleBtn) {
      toggleBtn.classList.toggle('active-mode', viewMode === 'lyrics');
    }
  };

  window.toggleFullscreenLyricsView = function() {
    const content = document.getElementById('fs-content-container');
    const curView = content ? content.getAttribute('data-active-view') : 'art';
    window.switchFullscreenView(curView === 'lyrics' ? 'art' : 'lyrics');
  };

  // ---------------------------------------------------------------------------
  // 2. MAIN SCREEN CATALOGUES & DISCOVERY SHELVES
  // ---------------------------------------------------------------------------

  window.renderHomeDiscovery = function() {
    // 1. Quick Picks 6-Tile Grid
    const qpContainer = document.getElementById('home-quick-picks-container');
    if (qpContainer) {
      const qpList = getQuickPicks(6);
      window.__quickPicks = qpList;
      qpContainer.innerHTML = qpList.map((track, idx) => `
        <div class="quick-pick-tile hover-glow" onclick="window.playTrackDirect(window.__quickPicks[${idx}], window.__quickPicks)" style="cursor: pointer; display: flex; align-items: center; gap: 0.85rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass); border-radius: 12px; padding: 0.5rem; transition: all 0.25s ease;">
          <img src="${track.coverUrl || './pulse-logo.png'}" alt="${track.title}" class="qp-thumb" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='./pulse-logo.png';">
          <div class="qp-info" style="flex: 1; overflow: hidden;">
            <div class="qp-title" style="font-size: 0.95rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${track.title}">${track.title}</div>
            <div class="qp-artist" style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${track.artist}">${track.artist}</div>
          </div>
          <button class="qp-play-btn btn-circle-play" style="width: 38px; height: 38px; border-radius: 50%; background: var(--accent-primary); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-right: 0.5rem;" title="Play Now">
            <i class="fa-solid fa-play" style="font-size: 0.85rem;"></i>
          </button>
        </div>
      `).join('');
    }

    // 2. Featured Artists Carousel
    const artContainer = document.getElementById('home-featured-artists-container');
    if (artContainer) {
      const artists = getFeaturedArtists();
      window.__featuredArtists = artists;
      artContainer.innerHTML = artists.map((art) => `
        <div class="artist-card-item hover-glow" onclick="window.openArtistView('${art.name.replace(/'/g, "\\'")}')" style="min-width: 140px; text-align: center; cursor: pointer; flex-shrink: 0;">
          <div class="artist-avatar-wrap" style="position: relative; width: 120px; height: 120px; margin: 0 auto 0.75rem auto; border-radius: 50%; overflow: hidden; border: 2px solid var(--border-glass);">
            <img src="${art.avatar || './pulse-logo.png'}" alt="${art.name}" class="artist-avatar-img" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='./pulse-logo.png';">
            <div class="artist-play-hover" style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
              <i class="fa-solid fa-play" style="color: #fff; font-size: 1.5rem;"></i>
            </div>
          </div>
          <div class="artist-card-name" style="font-size: 0.95rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${art.name}</div>
          <div class="artist-card-role" style="font-size: 0.75rem; color: #c084fc; margin-top: 2px;"><i class="fa-solid fa-circle-check" style="color: #38bdf8; font-size: 0.65rem;"></i> ${art.genre.split('/')[0]}</div>
        </div>
      `).join('');
    }

    // 3. Curated Playlists Carousel
    const plContainer = document.getElementById('home-curated-playlists-container');
    if (plContainer) {
      const playlists = getCuratedPlaylists();
      window.__curatedPlaylists = playlists;
      plContainer.innerHTML = playlists.map((pl, idx) => `
        <div class="curated-playlist-card hover-glow" onclick="window.playCuratedPlaylist(${idx})" style="min-width: 200px; width: 200px; flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 16px; padding: 1rem; cursor: pointer; transition: all 0.25s ease;">
          <div class="curated-cover-wrap" style="position: relative; width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; margin-bottom: 0.75rem;">
            <img src="${pl.coverUrl || './pulse-logo.png'}" alt="${pl.title}" class="curated-cover-img" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='./pulse-logo.png';">
            <span class="curated-badge" style="position: absolute; top: 8px; right: 8px; font-size: 0.7rem; font-weight: 700; background: rgba(0,0,0,0.8); color: #c084fc; padding: 2px 8px; border-radius: 12px;">${pl.trackCount} Tracks</span>
          </div>
          <div class="curated-meta">
            <h4 class="curated-title" style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pl.title}</h4>
            <p class="curated-desc" style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${pl.description}</p>
          </div>
        </div>
      `).join('');
    }

    // 4. Dynamic Genre & Mood Shelves
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
            <button class="btn-see-all" onclick="window.playPresetQuery('${cat.title}')" style="background: none; border: none; color: #c084fc; font-size: 0.82rem; font-weight: 700; cursor: pointer;">Explore All <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i></button>
          </div>
          <div class="shelf-carousel" style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.85rem;">
            ${cat.tracks.map((t, tIdx) => `
              <div class="music-card hover-glow" onclick="window.playCatalogTrack(${cIdx}, ${tIdx})" style="min-width: 160px; width: 160px; flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); padding: 0.75rem; border-radius: 12px; cursor: pointer; transition: all 0.25s ease;">
                <div class="card-image-wrapper" style="position: relative; width: 100%; aspect-ratio: 1; border-radius: 8px; overflow: hidden; margin-bottom: 0.6rem;">
                  <img src="${t.cover || './pulse-logo.png'}" alt="${t.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='./pulse-logo.png';">
                  <div class="card-play-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
                    <button class="btn-card-play" style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-primary); border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-play"></i></button>
                  </div>
                  <span style="position: absolute; top: 6px; right: 6px; font-size: 0.65rem; font-weight: 700; background: rgba(0,0,0,0.8); color: ${cat.color}; padding: 2px 6px; border-radius: 6px;">Ad-Free</span>
                </div>
                <div class="card-meta">
                  <div style="font-size: 0.9rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${t.artist}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('');
    }

    // 5. Regional Language Hubs
    const langContainer = document.getElementById('language-shelves-container');
    if (langContainer && LANGUAGE_PLAYLISTS && LANGUAGE_PLAYLISTS.length > 0) {
      window.__langPlaylists = LANGUAGE_PLAYLISTS;
      langContainer.innerHTML = LANGUAGE_PLAYLISTS.map((lang, lIdx) => `
        <section class="music-shelf-section" id="lang-shelf-${lang.id}" style="margin-bottom: 2.5rem;">
          <div class="shelf-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div>
              <h3 class="shelf-title" style="font-size: 1.3rem; font-weight: 800; color: #fff; margin: 0;">
                <i class="fa-solid ${lang.meta.icon}" style="color: ${lang.meta.color}; margin-right: 8px;"></i> ${lang.meta.title}
              </h3>
              <p class="shelf-subtitle" style="font-size: 0.8rem; color: #b3b3b3; margin-top: 2px;">${lang.meta.subtitle}</p>
            </div>
            <button class="btn-see-all" onclick="window.playPresetQuery('${lang.meta.title}')" style="background: none; border: none; color: #c084fc; font-size: 0.82rem; font-weight: 700; cursor: pointer;">See All <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i></button>
          </div>
          <div class="shelf-carousel" style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.85rem;">
            ${lang.tracks.map((track, tIdx) => `
              <div class="music-card hover-glow" onclick="window.playLanguageTrack(${lIdx}, ${tIdx})" style="min-width: 160px; width: 160px; flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); padding: 0.75rem; border-radius: 12px; cursor: pointer; transition: all 0.25s ease;">
                <div class="card-image-wrapper" style="position: relative; width: 100%; aspect-ratio: 1; border-radius: 8px; overflow: hidden; margin-bottom: 0.6rem;">
                  <img src="${track.coverUrl || './pulse-logo.png'}" alt="${track.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='./pulse-logo.png';">
                  <div class="card-play-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
                    <button class="btn-card-play" style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-primary); border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-play"></i></button>
                  </div>
                  <span style="position: absolute; top: 6px; right: 6px; font-size: 0.65rem; font-weight: 700; background: rgba(0,0,0,0.8); color: ${lang.meta.color}; padding: 2px 6px; border-radius: 6px;">Master</span>
                </div>
                <div class="card-meta">
                  <div style="font-size: 0.9rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${track.artist}</div>
                </div>
              </div>
            `).join('')}
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
        coverUrl: t.cover || `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg`,
        duration: t.duration || 220,
        source: "Catalog Master"
      };
      const queue = category.tracks.map(item => ({
        id: item.id || (item.ytId ? `ytm-${item.ytId}` : `pulse-${Math.random()}`),
        ytId: item.ytId,
        title: item.title,
        artist: item.artist,
        coverUrl: item.cover || `https://i.ytimg.com/vi/${item.ytId}/hqdefault.jpg`,
        duration: item.duration || 220,
        source: "Catalog Master"
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
        coverUrl: t.coverUrl || `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg`,
        duration: t.duration || 220,
        source: lang.meta.title
      };
      const queue = lang.tracks.map(item => ({
        id: item.id || (item.ytId ? `ytm-${item.ytId}` : `pulse-${Math.random()}`),
        ytId: item.ytId,
        title: item.title,
        artist: item.artist,
        coverUrl: item.coverUrl || `https://i.ytimg.com/vi/${item.ytId}/hqdefault.jpg`,
        duration: item.duration || 220,
        source: lang.meta.title
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
    } else {
      document.querySelectorAll('.music-shelf-section').forEach(s => {
        const id = (s.id || '').toLowerCase();
        if (id.includes(genreKey)) {
          s.style.display = 'block';
        } else {
          s.style.display = 'none';
        }
      });
    }
  };

  window.filterByGenre = function(catId) {
    window.switchView('home');
    const el = document.getElementById(`shelf-${catId}`);
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
          <img src="${track.coverUrl}" alt="${track.title}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;" loading="lazy">
          <div style="flex: 1;">
            <div style="font-size: 0.95rem; font-weight: 700; color: #fff;">${track.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${track.plays || 'Top Release'} plays</div>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60).toString().padStart(2, '0')}</span>
          <button class="btn-player-icon" onclick="event.stopPropagation(); window.toggleFavoriteTrack(window.__artistTopTracks[${idx}])"><i class="fa-regular fa-heart"></i></button>
        </div>
      `).join('');
    }

    const aboutBox = document.getElementById('artist-about-container');
    if (aboutBox) {
      aboutBox.innerHTML = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 16px; padding: 1.5rem;">
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin: 0;">${artist.bio}</p>
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
    
    const count = document.getElementById('search-count');
    if (count) count.textContent = 'Searching YouTube & high-fidelity streams...';
    
    try {
      const results = await window.musicService.searchTracks(query, 30);
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
      const results = await window.musicService.searchTracks(query, 40);
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

    container.innerHTML = tracks.map((track, idx) => `
      <div class="track-card glass-card hover-glow" onclick="window.playSearchTrack(${idx})" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 14px; padding: 0.85rem; cursor: pointer; transition: all 0.25s ease;">
        <div class="card-cover-wrap" style="position: relative; width: 100%; aspect-ratio: 1; border-radius: 10px; overflow: hidden; margin-bottom: 0.75rem;">
          <img src="${track.coverUrl || './pulse-logo.png'}" alt="${track.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='./pulse-logo.png';">
          <div class="card-play-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
            <button class="btn-play-hover" style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent-primary); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Play Audio">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
          <span style="position: absolute; top: 6px; right: 6px; font-size: 0.65rem; font-weight: 700; background: rgba(0,0,0,0.8); color: #c084fc; padding: 2px 6px; border-radius: 6px;">${track.source || 'Global Track'}</span>
        </div>
        <div class="card-info">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0 0 0.25rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${track.title}">${track.title}</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${track.artist}" onclick="event.stopPropagation(); window.openArtistView('${track.artist.replace(/'/g, "\\'")}')">${track.artist}</p>
        </div>
        <div class="card-actions" onclick="event.stopPropagation()" style="display: flex; gap: 0.5rem; margin-top: 0.75rem; justify-content: flex-end;">
          <button class="btn-player-icon" title="Add to Favorites" onclick="window.toggleFavoriteTrack(window.__searchResults[${idx}])">
            <i class="fa-regular fa-heart"></i>
          </button>
          <button class="btn-player-icon" title="Add to Playlist" onclick="window.openAddToPlaylistModal(window.__searchResults[${idx}])">
            <i class="fa-solid fa-list-plus"></i>
          </button>
        </div>
      </div>
    `).join('');
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
              <img src="${track.coverUrl || './pulse-logo.png'}" alt="cover" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;">
              <div style="flex: 1;">
                <div style="font-size: 0.95rem; font-weight: 700; color: #fff;">${track.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${track.artist}</div>
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
              <img src="${pl.coverUrl || './pulse-logo.png'}" alt="playlist" style="width: 100%; aspect-ratio: 1; border-radius: 12px; object-fit: cover; margin-bottom: 0.75rem;">
              <h4 style="color: #fff; font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">${pl.name}</h4>
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
              <img src="${track.coverUrl || './pulse-logo.png'}" alt="cover" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;">
              <div style="flex: 1;">
                <div style="font-size: 0.95rem; font-weight: 700; color: #fff;">${track.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${track.artist}</div>
              </div>
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
          <span style="font-weight: 600; color: #fff;">${pl.name}</span>
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

  window.openDownloadModal = function() {
    const modal = document.getElementById('download-app-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('active-modal');
    }
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
      btn.classList.toggle('active-pill', btn.getAttribute('data-category') === category);
    });

    document.querySelectorAll('.download-card-tile').forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || cardCat === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
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
        output.innerHTML = `
          <div style="margin-top: 1rem; border-top: 1px solid var(--border-glass); padding-top: 1rem;">
            <div style="font-size: 1.1rem; font-weight: 800; color: #c084fc; margin-bottom: 0.25rem;">${res.djTitle}</div>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">${res.vibe}</p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 280px; overflow-y: auto;">
              ${res.tracks.map((t) => `
                <div class="hover-glow" onclick="window.playPresetQuery('${(t.ytQuery || `${t.title} ${t.artist}`).replace(/'/g, "\\'")}'); window.closeGeminiDJModal();" style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass); cursor: pointer;">
                  <div>
                    <div style="font-size: 0.92rem; font-weight: 700; color: #fff;">${t.title}</div>
                    <div style="font-size: 0.78rem; color: #c084fc;">${t.artist}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${t.reason || 'AI Match'}</div>
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
  // INITIALIZATION ON DOM READY
  // ---------------------------------------------------------------------------
  function initPulseApp() {
    // Render Home Feed Discovery immediately
    if (typeof window.renderHomeDiscovery === 'function') {
      window.renderHomeDiscovery();
    }

    // Initial Auth State Sync
    onAuthStateChanged(() => {});

    // Realtime Library Updates
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

    // Search Input Binding
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPulseApp);
  } else {
    initPulseApp();
  }

  // ---------------------------------------------------------------------------
  // PROGRESSIVE WEB APP (PWA) SUPPORT
  // ---------------------------------------------------------------------------
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.triggerPWAInstall = async function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
        window.closeDownloadModal();
        window.showToast('App installed successfully!', 'success');
      }
    } else {
      window.showToast('PWA installation is not supported or already installed', 'warning');
    }
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Pulse PWA Service Worker registered:', reg.scope))
      .catch(err => console.error('Pulse PWA Service Worker error:', err));
  }

})();
