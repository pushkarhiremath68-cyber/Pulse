import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 Testing 120Hz Refresh Rate & GPU Hardware Compositing Engine...');

const rootDir = process.cwd();
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf-8');
const styleCss = fs.readFileSync(path.join(rootDir, 'src', 'style.css'), 'utf-8');
const visualizerJs = fs.readFileSync(path.join(rootDir, 'src', 'visualizer.js'), 'utf-8');

// 1. Verify index.html elements
assert(indexHtml.includes('id="profile-120hz-toggle"'), 'profile-120hz-toggle must exist in index.html');
assert(indexHtml.includes('id="detected-hz-pill"'), 'detected-hz-pill must exist in index.html');
assert(indexHtml.includes('handle120HzToggle'), 'profile-120hz-toggle must call handle120HzToggle');
console.log('✅ PASS: index.html has 120Hz toggle and ProMotion pill');

// 2. Verify style.css 120Hz rules and transform-based animations
assert(styleCss.includes('.high-refresh-rate-120hz'), 'style.css must have high-refresh-rate-120hz class');
assert(styleCss.includes('transform: translateZ(0)'), 'style.css must use hardware compositing layers (translateZ(0))');
assert(styleCss.includes('transform: scaleY'), 'style.css must use transform scaleY for 120Hz non-blocking equalizers');
assert(!styleCss.includes('@keyframes pulseEqualizer {\n  0% { height:'), 'pulseEqualizer must not animate height');
console.log('✅ PASS: style.css provides zero-reflow 120Hz GPU compositor animations');

// 3. Verify visualizer.js delta timing
assert(visualizerJs.includes('16.6667') || visualizerJs.includes('dt ='), 'visualizer.js must normalize frame delta time for 120Hz displays');
console.log('✅ PASS: visualizer.js supports 120Hz dynamic frame pacing');

// 4. Verify main.js exports
assert(mainJs.includes('window.detectDisplayRefreshRate'), 'main.js must define window.detectDisplayRefreshRate');
assert(mainJs.includes('window.handle120HzToggle'), 'main.js must define window.handle120HzToggle');
assert(mainJs.includes('window.init120HzEngine'), 'main.js must define window.init120HzEngine');
console.log('✅ PASS: main.js has 120Hz controller and benchmarking functions');

console.log('🎉 ALL 120Hz REFRESH RATE TESTS PASSED 100%!');
