import fs from 'fs';

let css = fs.readFileSync('src/style.css', 'utf8');

const oldTrackCss = `.hero-slides-track {
  position: relative;
  width: 100%;
  min-height: 280px;
}

.hero-slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2.5rem;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: scale(0.97) translateX(25px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.5s ease;
}

.hero-slide.active-slide {
  position: relative;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: scale(1) translateX(0);
}`;

const newTrackCss = `.hero-slides-track {
  position: relative;
  width: 100%;
  min-height: 280px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  align-items: center;
}

.hero-slide {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2.5rem;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateX(18px);
  transition: opacity 0.45s ease-in-out, transform 0.45s ease-out, visibility 0.45s ease;
  will-change: opacity, transform;
}

.hero-slide.active-slide {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(0);
  z-index: 2;
}`;

if (css.includes(oldTrackCss)) {
  css = css.replace(oldTrackCss, newTrackCss);
  console.log('Successfully updated hero-slides-track CSS in src/style.css');
} else {
  console.log('oldTrackCss not found with exact match, replacing via regex');
  css = css.replace(/\.hero-slides-track\s*\{[\s\S]*?\.hero-slide\.active-slide\s*\{[\s\S]*?\}/, newTrackCss);
  console.log('Replaced via regex');
}

fs.writeFileSync('src/style.css', css, 'utf8');

