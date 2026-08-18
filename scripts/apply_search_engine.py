import re

# 1. Update src/catalogService.js
with open('src/catalogService.js', 'r', encoding='utf-8') as f:
    cat = f.read()

search_fn = """
  // =========================================================================
  // MULTI-PARAMETER SEARCH ENGINE
  // =========================================================================
  async function searchCatalog(query, limit = 30) {
    if (!query || typeof query !== 'string') return [];
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const localResults = [];
    const seenIds = new Set();

    const allLocal = [
      ...STARTER_TRACKS,
      ...Object.values(categoryTracksCache).flat(),
      ...(typeof window !== 'undefined' && window.TRACKS_REGISTRY ? Object.values(window.TRACKS_REGISTRY) : [])
    ];

    for (const raw of allLocal) {
      if (!raw) continue;
      const id = String(raw.id);
      if (seenIds.has(id)) continue;

      const title = String(raw.title || raw.name || '').toLowerCase();
      const artist = String(raw.artist || raw.artist_name || '').toLowerCase();
      const album = String(raw.album || raw.album_name || '').toLowerCase();
      const category = String(raw.category || '').toLowerCase();
      const genre = String(raw.genre || '').toLowerCase();
      const lang = String(raw.language || '').toLowerCase();

      if (title.includes(q) || artist.includes(q) || album.includes(q) || category.includes(q) || genre.includes(q) || lang.includes(q)) {
        const norm = normalizeCatalogTrack(raw);
        if (norm) {
          seenIds.add(id);
          localResults.push(norm);
        }
      }
    }

    if (q.length >= 2) {
      try {
        const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=15&namesearch=${encodeURIComponent(query)}&include=musicinfo+licenses`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const json = await res.json();
          if (json.results && Array.isArray(json.results)) {
            for (const t of json.results) {
              const id = `jamendo-${t.id}`;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                localResults.push(normalizeCatalogTrack({
                  id,
                  title: t.name,
                  artist: t.artist_name,
                  album: t.album_name || 'Jamendo Single',
                  cover: t.album_image || t.image,
                  duration: parseInt(t.duration, 10) || 210,
                  streamUrl: t.audio || t.audiodownload,
                  previewUrl: t.audio,
                  category: 'search-discovery',
                  genre: (t.musicinfo && t.musicinfo.tags && t.musicinfo.tags.genres && t.musicinfo.tags.genres[0]) || 'Pop',
                  source: 'Jamendo Music (Creative Commons)',
                  playCount: 15000 + Math.floor(Math.random() * 50000)
                }));
              }
            }
          }
        }
      } catch (e) {}
    }

    return localResults.slice(0, limit);
  }
"""

if 'searchCatalog' not in cat:
    cat = cat.replace(
        'window.catalogService = PulseCatalog;',
        search_fn.strip() + '\n\n    PulseCatalog.searchCatalog = searchCatalog;\n    window.catalogService = PulseCatalog;'
    )
    with open('src/catalogService.js', 'w', encoding='utf-8') as f:
        f.write(cat)
    print("[OK] Updated src/catalogService.js with searchCatalog")

# 2. Update src/main.js with switchView and executeSearch
with open('src/main.js', 'r', encoding='utf-8') as f:
    main = f.read()

view_search = r"""
  // =========================================================================
  // APP VIEW SWITCHER & MULTI-VIEW NAVIGATION CONTROLLER
  // =========================================================================
  function switchView(viewName) {
    if (!viewName) return;
    state.activeView = viewName;
    const targetId = viewName.startsWith('view-') ? viewName : `view-${viewName}`;

    document.querySelectorAll('.app-view').forEach(v => {
      if (v.id === targetId || v.id === viewName) {
        v.classList.add('active-view');
        v.style.display = 'block';
      } else {
        v.classList.remove('active-view');
        v.style.display = 'none';
      }
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      const raw = item.dataset.view;
      if (raw === viewName || `view-${raw}` === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      const raw = item.dataset.view;
      if (raw === viewName || `view-${raw}` === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (viewName === 'home') {
      const input = document.getElementById('global-search-input');
      const clearBtn = document.getElementById('clear-search-btn');
      if (input && input.value) input.value = '';
      if (clearBtn) clearBtn.classList.add('hidden');
    }
  }
  window.switchView = switchView;

  // =========================================================================
  // ZERO-LATENCY REAL-TIME SEARCH ENGINE
  // =========================================================================
  let searchDebounceTimer = null;

  window.executeSearch = function(query, isDebounced = true) {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }

    const rawQ = query === null || query === undefined ? '' : String(query);
    const trimmed = rawQ.trim();

    const clearBtn = document.getElementById('clear-search-btn');
    if (!trimmed && !rawQ.trim()) {
      if (clearBtn) clearBtn.classList.add('hidden');
      if (state.activeView === 'search-view' || state.activeView === 'view-search-view') {
        switchView('home');
      }
      return;
    }

    if (clearBtn) clearBtn.classList.remove('hidden');

    const performSearch = async () => {
      if (state.activeView !== 'search-view' && state.activeView !== 'view-search-view') {
        switchView('search-view');
      }

      const searchLabel = document.getElementById('search-query-label');
      const searchCountEl = document.getElementById('search-count');
      const loadingEl = document.getElementById('search-loading');
      const container = document.getElementById('search-results-container');

      if (searchLabel) searchLabel.textContent = trimmed || rawQ;
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (searchCountEl) searchCountEl.textContent = 'Searching catalog...';

      try {
        let results = [];
        if (window.catalogService && typeof window.catalogService.searchCatalog === 'function') {
          results = await window.catalogService.searchCatalog(trimmed || rawQ, 35);
        } else {
          const qLower = (trimmed || rawQ).toLowerCase();
          results = Object.values(window.TRACKS_REGISTRY || {}).filter(t => 
            (t.title && t.title.toLowerCase().includes(qLower)) ||
            (t.artist && t.artist.toLowerCase().includes(qLower)) ||
            (t.album && t.album.toLowerCase().includes(qLower)) ||
            (t.category && t.category.toLowerCase().includes(qLower))
          );
        }

        if (loadingEl) loadingEl.classList.add('hidden');

        if (searchCountEl) {
          searchCountEl.textContent = `${results.length} track${results.length === 1 ? '' : 's'} found`;
        }

        if (container) {
          if (results.length > 0) {
            container.innerHTML = `
              <div class="music-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.25rem; margin-top: 1rem;">
                ${results.map(t => `
                  <div class="music-card" onclick="window.playSpecificTrack('${t.id}')">
                    <div class="card-image-wrapper">
                      <img src="${t.cover || './pulse-logo.png'}" alt="${t.title}" loading="lazy">
                      <div class="card-play-overlay">
                        <button class="btn-card-play" title="Play ${t.title}"><i class="fa-solid fa-play"></i></button>
                      </div>
                    </div>
                    <div class="card-info">
                      <span class="card-title">${t.title}</span>
                      <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('${t.artist}')">${t.artist}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `;
          } else {
            container.innerHTML = `
              <div style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
                <i class="fa-solid fa-compact-disc" style="font-size: 2.5rem; margin-bottom: 0.85rem; display: block; color: var(--accent-primary); opacity: 0.6;"></i>
                <h3 style="color: #fff; font-weight: 700; margin-bottom: 0.35rem;">No songs found for "${trimmed || rawQ}"</h3>
                <p style="font-size: 0.85rem;">Try searching for artist names like Arijit Singh, The Weeknd, Diljit, or song titles.</p>
              </div>
            `;
          }
        }
      } catch (err) {
        console.error('[Pulse Search Error]:', err);
        if (loadingEl) loadingEl.classList.add('hidden');
      }
    };

    if (isDebounced) {
      searchDebounceTimer = setTimeout(performSearch, 150);
    } else {
      performSearch();
    }
  };
"""

if 'window.executeSearch = function' not in main:
    main = main.replace(
        'function initApp()',
        view_search.strip() + '\n\n  function initApp()'
    )
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(main)
    print("[OK] Updated src/main.js with switchView and executeSearch")
