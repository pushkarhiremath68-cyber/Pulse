import fs from 'fs';

const css = `
/* Sidebar Followed Artist Item */
.sidebar-artist-item {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.sidebar-artist-item:hover {
  background: rgba(168, 85, 247, 0.12) !important;
  border-color: rgba(168, 85, 247, 0.3) !important;
  transform: translateX(4px);
}

.sidebar-artist-item:hover span {
  color: #fff !important;
}

/* Search Matching Artist Card */
.search-artist-card {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.search-artist-card:hover {
  background: rgba(168, 85, 247, 0.1) !important;
  border-color: rgba(168, 85, 247, 0.4) !important;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(168, 85, 247, 0.15);
}

.search-artist-follow-btn {
  transition: all 0.2s ease !important;
}

.search-artist-follow-btn:hover {
  transform: scale(1.05);
}
`;

fs.appendFileSync('src/style.css', css, 'utf8');
console.log('Appended artist CSS to src/style.css successfully!');
