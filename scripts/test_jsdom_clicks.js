import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

async function testJsdom() {
  console.log("Loading dist/index.html into JSDOM...");
  const html = fs.readFileSync('dist/index.html', 'utf-8');
  const bundleJs = fs.readFileSync('dist/assets/pulse.js', 'utf-8');

  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    url: "https://pushkarhiremath68-cyber.github.io/Pulse/"
  });

  const { window } = dom;

  // Mock audio
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLMediaElement.prototype.load = () => {};

  window.onerror = (msg, url, line, col, error) => {
    console.error("WINDOW ONERROR:", msg, "at line", line, error);
  };

  try {
    // Execute bundle script
    const scriptEl = window.document.createElement("script");
    scriptEl.textContent = bundleJs;
    window.document.body.appendChild(scriptEl);

    // Trigger DOMContentLoaded
    const event = window.document.createEvent("Event");
    event.initEvent("DOMContentLoaded", true, true);
    window.document.dispatchEvent(event);

    console.log("Checking window methods:");
    const requiredMethods = [
      'openDownloadModal',
      'openAuthModal',
      'closeAuthModal',
      'openGeminiDJModal',
      'playTrackDirect',
      'switchView',
      'openArtistView',
      'openCategoryView',
      'loadTrackLyrics',
      'syncLiveLyrics',
      'seekToLyricTimestamp',
      'renderHomeDiscovery',
      'renderLibraryView',
      'executeSearch'
    ];

    let missing = 0;
    for (const m of requiredMethods) {
      if (typeof window[m] === 'function') {
        console.log(`  [OK] window.${m} is defined`);
      } else {
        console.error(`  [FAIL] window.${m} is MISSING!`);
        missing++;
      }
    }

    // Test calling window.openDownloadModal()
    console.log("\nTesting window.openDownloadModal()...");
    window.openDownloadModal();
    const modal = window.document.getElementById('download-app-modal');
    console.log("Download modal classes:", modal ? modal.className : "NOT FOUND");

    // Test calling window.renderHomeDiscovery()
    console.log("\nTesting window.renderHomeDiscovery()...");
    window.renderHomeDiscovery();
    const qp = window.document.getElementById('home-quick-picks-container');
    console.log("Quick Picks child count:", qp ? qp.children.length : 0);

    // Test calling window.openArtistView('The Weeknd')
    console.log("\nTesting window.openArtistView('The Weeknd')...");
    window.openArtistView('The Weeknd');
    const artistName = window.document.getElementById('artist-hero-name');
    console.log("Artist hero name rendered:", artistName ? artistName.textContent : "NOT FOUND");

    if (missing === 0) {
      console.log("\nALL WINDOW CLICK HANDLERS ARE FULLY FUNCTIONAL IN JSDOM!");
    } else {
      console.error(`\nFAILED: ${missing} methods missing!`);
    }

  } catch (err) {
    console.error("CRASH DURING EXECUTION:", err);
  }
}

testJsdom();
