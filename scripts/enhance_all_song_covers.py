import re
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace generateTrackCover with Studio-Grade Dynamic HD Artwork Engine
NEW_GENERATE_COVER = """  /**
   * Generates a studio-grade, crystal-clear 500x500 SVG album artwork
   * tailored to the song's title, artist, genre, and language theme.
   */
  function generateTrackCover(title = 'Track', artist = 'Pulse Artist', category = 'pop') {
    const rawTitle = String(title || 'Track').trim();
    const rawArtist = String(artist || 'Pulse Artist').trim();
    const lowerTitle = rawTitle.toLowerCase();
    const lowerArtist = rawArtist.toLowerCase();
    const lowerCat = String(category || '').toLowerCase();

    // Determine theme & palette
    let col1 = '#8B5CF6';
    let col2 = '#EC4899';
    let badgeText = 'PULSE HD';

    if (lowerTitle.includes('kantara') || lowerTitle.includes('singara') || lowerTitle.includes('varaha') || lowerTitle.includes('kgf') || lowerTitle.includes('belageddu') || lowerTitle.includes('mungaru') || lowerTitle.includes('kannada') || lowerCat === 'kannada') {
      col1 = '#E11D48'; col2 = '#F59E0B'; badgeText = 'KANNADA HITS';
    } else if (lowerTitle.includes('pushpa') || lowerTitle.includes('naatu') || lowerTitle.includes('devara') || lowerTitle.includes('butta') || lowerTitle.includes('srivalli') || lowerTitle.includes('telugu') || lowerArtist.includes('sid sriram')) {
      col1 = '#F97316'; col2 = '#DC2626'; badgeText = 'TOLLYWOOD';
    } else if (lowerTitle.includes('52 gaj') || lowerTitle.includes('moto') || lowerTitle.includes('gypsy') || lowerTitle.includes('yadav') || lowerTitle.includes('haryanvi') || lowerArtist.includes('renuka panwar') || lowerArtist.includes('gulzaar')) {
      col1 = '#10B981'; col2 = '#F59E0B'; badgeText = 'HARYANVI DESI';
    } else if (lowerTitle.includes('khalasi') || lowerTitle.includes('chogada') || lowerTitle.includes('garba') || lowerTitle.includes('gujarati') || lowerArtist.includes('aditya gadhvi') || lowerArtist.includes('darshan raval')) {
      col1 = '#EAB308'; col2 = '#EA580C'; badgeText = 'GUJARATI HITS';
    } else if (lowerTitle.includes('zingaat') || lowerTitle.includes('apsara') || lowerTitle.includes('chandra') || lowerTitle.includes('marathi') || lowerArtist.includes('ajay-atul')) {
      col1 = '#EA580C'; col2 = '#C026D3'; badgeText = 'MARATHI HITS';
    } else if (lowerArtist.includes('karan aujla') || lowerArtist.includes('diljit') || lowerArtist.includes('ap dhillon') || lowerArtist.includes('shubh') || lowerArtist.includes('moose wala') || lowerCat === 'punjabi') {
      col1 = '#FF007F'; col2 = '#7928CA'; badgeText = 'PUNJABI HITS';
    } else if (lowerTitle.includes('despacito') || lowerTitle.includes('gasolina') || lowerTitle.includes('danza') || lowerTitle.includes('spanish') || lowerArtist.includes('daddy yankee')) {
      col1 = '#EC4899'; col2 = '#8B5CF6'; badgeText = 'LATIN / SPANISH';
    } else if (lowerTitle.includes('derni') || lowerTitle.includes('tourner') || lowerTitle.includes('french') || lowerArtist.includes('indila') || lowerArtist.includes('stromae')) {
      col1 = '#3B82F6'; col2 = '#8B5CF6'; badgeText = 'FRENCH HITS';
    } else if (lowerArtist.includes('arijit') || lowerArtist.includes('atif') || lowerArtist.includes('shreya') || lowerArtist.includes('sonu nigam') || lowerArtist.includes('kk') || lowerCat === 'romantic' || lowerCat === 'bollywood') {
      col1 = '#F43F5E'; col2 = '#8B5CF6'; badgeText = 'BOLLYWOOD HITS';
    } else if (lowerArtist.includes('taylor swift') || lowerArtist.includes('ed sheeran') || lowerArtist.includes('the weeknd') || lowerArtist.includes('billie eilish') || lowerArtist.includes('bieber') || lowerCat === 'pop') {
      col1 = '#06B6D4'; col2 = '#6366F1'; badgeText = 'GLOBAL HITS';
    } else if (lowerCat === 'lofi') {
      col1 = '#6366F1'; col2 = '#06B6D4'; badgeText = 'LO-FI CHILL';
    }

    // Deterministic hash for gradient angle and accent rings
    let hash = 0;
    const str = rawTitle + ' ' + rawArtist;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const safeHash = Math.abs(hash);

    const safeTitle = rawTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 24);
    const safeArtist = rawArtist.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 26);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <linearGradient id="bg_${safeHash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${col1}" />
          <stop offset="100%" stop-color="${col2}" />
        </linearGradient>
        <radialGradient id="glow_${safeHash}" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.8" />
        </radialGradient>
        <linearGradient id="glass_${safeHash}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(15,23,42,0.4)" />
          <stop offset="100%" stop-color="rgba(15,23,42,0.92)" />
        </linearGradient>
        <filter id="shadow_${safeHash}" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.5)" />
        </filter>
      </defs>

      <!-- Background Gradient Canvas -->
      <rect width="500" height="500" rx="32" fill="url(#bg_${safeHash})" />

      <!-- Ambient Glow Overlay -->
      <circle cx="250" cy="185" r="160" fill="url(#glow_${safeHash})" />

      <!-- Vinyl Groove Rings with High-DPI Aesthetics -->
      <circle cx="250" cy="185" r="135" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
      <circle cx="250" cy="185" r="105" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
      <circle cx="250" cy="185" r="75" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" />
      <circle cx="250" cy="185" r="45" fill="rgba(0,0,0,0.7)" stroke="rgba(255,255,255,0.45)" stroke-width="3" filter="url(#shadow_${safeHash})" />

      <!-- Center Icon / Equalizer Wave -->
      <path d="M236 170 L260 162 L260 192 A11 11 0 1 1 249 181 L249 173 L238 176 L238 198 A11 11 0 1 1 227 187 L227 170 Z" fill="#ffffff" />

      <!-- Dynamic Equalizer Visualizer Bars -->
      <g opacity="0.85" transform="translate(140, 290)">
        <rect x="0" y="8" width="6" height="24" rx="3" fill="#ffffff" />
        <rect x="14" y="2" width="6" height="30" rx="3" fill="#ffffff" />
        <rect x="28" y="14" width="6" height="18" rx="3" fill="#ffffff" />
        <rect x="42" y="0" width="6" height="32" rx="3" fill="#ffffff" />
        <rect x="56" y="10" width="6" height="22" rx="3" fill="#ffffff" />
        <rect x="70" y="4" width="6" height="28" rx="3" fill="#ffffff" />
        <rect x="84" y="16" width="6" height="16" rx="3" fill="#ffffff" />
        <rect x="98" y="6" width="6" height="26" rx="3" fill="#ffffff" />
        <rect x="112" y="0" width="6" height="32" rx="3" fill="#ffffff" />
        <rect x="126" y="12" width="6" height="20" rx="3" fill="#ffffff" />
        <rect x="140" y="4" width="6" height="28" rx="3" fill="#ffffff" />
        <rect x="154" y="14" width="6" height="18" rx="3" fill="#ffffff" />
        <rect x="168" y="2" width="6" height="30" rx="3" fill="#ffffff" />
        <rect x="182" y="10" width="6" height="22" rx="3" fill="#ffffff" />
        <rect x="196" y="6" width="6" height="26" rx="3" fill="#ffffff" />
        <rect x="210" y="16" width="6" height="16" rx="3" fill="#ffffff" />
      </g>

      <!-- Glassmorphic Footer Info Card -->
      <rect y="330" width="500" height="170" fill="url(#glass_${safeHash})" />
      <line x1="0" y1="330" x2="500" y2="330" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />

      <!-- Genre / Language Badge -->
      <rect x="25" y="348" width="130" height="22" rx="11" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <text x="90" y="363" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="10.5" fill="#ffffff" text-anchor="middle" letter-spacing="1.2">${badgeText}</text>

      <!-- Song Title Typography -->
      <text x="25" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="27" fill="#ffffff" letter-spacing="0.2">${safeTitle}</text>

      <!-- Artist Typography -->
      <text x="25" y="455" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="17" fill="rgba(255,255,255,0.85)">${safeArtist}</text>

      <!-- High-Quality Audio Stamp -->
      <g transform="translate(415, 420)">
        <rect x="0" y="0" width="60" height="24" rx="12" fill="rgba(255,255,255,0.25)" />
        <text x="30" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="1">LOSSLESS</text>
      </g>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }"""

# Find generateTrackCover definition and replace it
gen_pattern = r'/\*\*[\s\S]*?function generateTrackCover[\s\S]*?return `data:image/svg\+xml;utf8,[\s\S]*?;\s*}'
match = re.search(gen_pattern, code)
if match:
    code = code[:match.start()] + NEW_GENERATE_COVER + code[match.end():]
    with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Successfully upgraded generateTrackCover in musicService.js!")
else:
    print("Could not match generateTrackCover pattern")
