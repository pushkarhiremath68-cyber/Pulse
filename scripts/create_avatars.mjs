import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'avatars');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const avatars = [
  {
    filename: 'avatar-dj.svg',
    name: 'Cyber DJ',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <radialGradient id="bg1" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#090514"/>
    </radialGradient>
    <linearGradient id="neon1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="80" fill="url(#bg1)"/>
  <!-- Headphones Band -->
  <path d="M 40 85 C 40 45, 120 45, 120 85" fill="none" stroke="url(#neon1)" stroke-width="8" stroke-linecap="round"/>
  <!-- Headphone earcups -->
  <rect x="32" y="75" width="16" height="32" rx="8" fill="#38bdf8"/>
  <rect x="112" y="75" width="16" height="32" rx="8" fill="#c084fc"/>
  <!-- Soundwave Bars in center -->
  <rect x="62" y="76" width="6" height="24" rx="3" fill="#38bdf8"/>
  <rect x="73" y="66" width="6" height="44" rx="3" fill="#ec4899"/>
  <rect x="84" y="72" width="6" height="32" rx="3" fill="#a855f7"/>
  <rect x="95" y="80" width="6" height="16" rx="3" fill="#38bdf8"/>
</svg>`
  },
  {
    filename: 'avatar-vinyl.svg',
    name: 'Cosmic Vinyl',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#170d2b"/>
      <stop offset="100%" stop-color="#080312"/>
    </radialGradient>
    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="80" fill="url(#bg2)"/>
  <!-- Vinyl disc outer -->
  <circle cx="80" cy="80" r="62" fill="#18181b" stroke="url(#rainbow)" stroke-width="3"/>
  <circle cx="80" cy="80" r="50" fill="none" stroke="#27272a" stroke-width="1.5" stroke-dasharray="4 2"/>
  <circle cx="80" cy="80" r="38" fill="none" stroke="#3f3f46" stroke-width="1.5"/>
  <!-- Vinyl label -->
  <circle cx="80" cy="80" r="24" fill="url(#rainbow)"/>
  <circle cx="80" cy="80" r="8" fill="#09090b"/>
  <circle cx="80" cy="80" r="3" fill="#ffffff"/>
</svg>`
  },
  {
    filename: 'avatar-equalizer.svg',
    name: 'Neon Beats',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <radialGradient id="bg3" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>
    <linearGradient id="eqGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="80" fill="url(#bg3)"/>
  <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(56,189,248,0.25)" stroke-width="2"/>
  <rect x="42" y="80" width="10" height="28" rx="5" fill="url(#eqGrad)"/>
  <rect x="58" y="60" width="10" height="48" rx="5" fill="url(#eqGrad)"/>
  <rect x="75" y="44" width="10" height="64" rx="5" fill="url(#eqGrad)"/>
  <rect x="92" y="68" width="10" height="40" rx="5" fill="url(#eqGrad)"/>
  <rect x="108" y="52" width="10" height="56" rx="5" fill="url(#eqGrad)"/>
</svg>`
  },
  {
    filename: 'avatar-synthwave.svg',
    name: 'Synthwave',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <radialGradient id="bg4" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#2a0845"/>
      <stop offset="100%" stop-color="#0b0014"/>
    </radialGradient>
    <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="50%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="80" fill="url(#bg4)"/>
  <!-- Sun with stripes -->
  <circle cx="80" cy="72" r="38" fill="url(#sunGrad)"/>
  <!-- Stripes -->
  <line x1="42" y1="70" x2="118" y2="70" stroke="#0b0014" stroke-width="3"/>
  <line x1="45" y1="78" x2="115" y2="78" stroke="#0b0014" stroke-width="4"/>
  <line x1="50" y1="87" x2="110" y2="87" stroke="#0b0014" stroke-width="5"/>
  <line x1="58" y1="97" x2="102" y2="97" stroke="#0b0014" stroke-width="6"/>
  <!-- Horizon grid line -->
  <line x1="20" y1="110" x2="140" y2="110" stroke="#ec4899" stroke-width="3"/>
  <line x1="40" y1="122" x2="120" y2="122" stroke="rgba(236,72,153,0.5)" stroke-width="2"/>
</svg>`
  },
  {
    filename: 'avatar-lofi.svg',
    name: 'Lo-Fi Night',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="80" fill="url(#bg5)"/>
  <!-- Glowing Crescent Moon -->
  <path d="M 95 45 A 35 35 0 0 0 70 105 A 35 35 0 1 1 95 45 Z" fill="#fbbf24"/>
  <!-- Stars -->
  <circle cx="45" cy="55" r="3" fill="#e0e7ff"/>
  <circle cx="62" cy="38" r="2" fill="#93c5fd"/>
  <circle cx="120" cy="95" r="2.5" fill="#fef08a"/>
  <!-- Musical Eighth Note -->
  <path d="M 68 115 C 68 122 62 126 55 126 C 48 126 44 122 44 117 C 44 111 49 107 56 107 L 56 82 L 82 76 L 82 105 C 82 112 76 116 69 116" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  },
  {
    filename: 'avatar-rock.svg',
    name: 'Electric Rock',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <radialGradient id="bg6" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#450a0a"/>
      <stop offset="100%" stop-color="#090505"/>
    </radialGradient>
    <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="80" fill="url(#bg6)"/>
  <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(239,68,68,0.3)" stroke-width="2"/>
  <!-- Lightning Bolt -->
  <polygon points="88,28 52,86 78,86 66,134 110,72 84,72" fill="url(#boltGrad)"/>
</svg>`
  }
];

avatars.forEach(item => {
  const filePath = path.join(outDir, item.filename);
  fs.writeFileSync(filePath, item.svg, 'utf-8');
  console.log('Saved:', item.filename);
});

console.log('All 6 avatars generated successfully.');

