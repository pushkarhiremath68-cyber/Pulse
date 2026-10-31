import fs from 'fs';

let content = fs.readFileSync('index.html', 'utf8');

// 1. Replace Collections in left sidebar with Followed Artists
const oldCollectionsSection = `        <div class="nav-section">
          <span class="nav-section-title">COLLECTIONS</span>
          <a href="javascript:void(0)" class="nav-item" onclick="window.filterByGenre('cat-trending')">
            <i class="fa-solid fa-fire-flame-curved" style="color: #f43f5e;"></i>
            <span>Trending Hits</span>
          </a>
          <a href="javascript:void(0)" class="nav-item" onclick="window.filterByGenre('cat-english-pop')">
            <i class="fa-solid fa-earth-americas" style="color: #38bdf8;"></i>
            <span>Global English Pop</span>
          </a>
          <a href="javascript:void(0)" class="nav-item" onclick="window.filterByGenre('cat-romance')">
            <i class="fa-solid fa-heart" style="color: #ec4899;"></i>
            <span>Romantic Melodies</span>
          </a>
          <a href="javascript:void(0)" class="nav-item" onclick="window.filterByGenre('cat-workout')">
            <i class="fa-solid fa-bolt" style="color: #eab308;"></i>
            <span>Workout EDM</span>
          </a>
          <a href="javascript:void(0)" class="nav-item" onclick="window.filterByGenre('cat-lofi')">
            <i class="fa-solid fa-moon" style="color: #a855f7;"></i>
            <span>Lo-Fi Chill & Focus</span>
          </a>
          <a href="javascript:void(0)" class="nav-item" onclick="window.filterByGenre('cat-devotional')">
            <i class="fa-solid fa-om" style="color: #f59e0b;"></i>
            <span>Devotional & Sacred</span>
          </a>
        </div>`;

const newFollowedSection = `        <div class="nav-section" id="sidebar-followed-section">
          <div style="display: flex; align-items: center; justify-content: space-between; padding-right: 0.5rem; margin-bottom: 0.6rem;">
            <span class="nav-section-title" style="margin-bottom: 0; letter-spacing: 0.8px;">FOLLOWED ARTISTS</span>
            <span id="sidebar-followed-badge" style="font-size: 0.72rem; font-weight: 800; color: #c084fc; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); padding: 1px 7px; border-radius: 9999px;">0</span>
          </div>
          <div id="sidebar-followed-list" style="display: flex; flex-direction: column; gap: 4px; max-height: 280px; overflow-y: auto; scrollbar-width: thin;">
            <!-- Populated dynamically by window.renderSidebarFollowedArtists() -->
          </div>
        </div>`;

// Normalize line endings for replacement
const normContent = content.replace(/\r\n/g, '\n');
const normOld = oldCollectionsSection.replace(/\r\n/g, '\n');

if (normContent.includes(normOld)) {
  content = normContent.replace(normOld, newFollowedSection);
  console.log('Replaced COLLECTIONS with FOLLOWED ARTISTS in left sidebar');
} else {
  console.error('Could not find old COLLECTIONS section in index.html');
  process.exit(1);
}

// 2. Add Matching Artists section above search-results-container
const searchContainerTarget = '<div id="search-results-container" class="search-results-list"';
const matchingArtistsSection = `        <!-- MATCHING ARTISTS SECTION (Appears when search matches artists) -->
        <div id="search-artists-section" style="display: none; margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h4 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-microphone-lines" style="color: #a855f7;"></i> Matching Artists
            </h4>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Click to open verified profile &amp; top 10 songs</span>
          </div>
          <div id="search-artists-container" style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.75rem; scrollbar-width: thin;"></div>
        </div>

        <div id="search-results-container" class="search-results-list"`;

if (!content.includes('id="search-artists-section"')) {
  content = content.replace(searchContainerTarget, matchingArtistsSection);
  console.log('Added search-artists-section before search-results-container');
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully updated index.html!');
