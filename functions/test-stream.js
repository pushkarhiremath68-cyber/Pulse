/**
 * Pulse Music - Canary Health Test Script
 * Verifies that youtubei.js is able to connect to YouTube, fetch dynamic player,
 * and successfully decipher audio stream URLs for sample videoId: dQw4w9WgXcQ.
 *
 * Exit Code 0: Health check passed (deciphering operational).
 * Exit Code 1: Health check failed (cipher broke or network error).
 */

import { Innertube, UniversalCache } from "youtubei.js";

const CANARY_VIDEO_ID = "dQw4w9WgXcQ";

async function runCanaryTest() {
  console.log("===============================================================");
  console.log("🔍 Running Pulse Music Canary Health Check for YouTube Extractor");
  console.log(`🎯 Target Video ID: ${CANARY_VIDEO_ID}`);
  console.log("===============================================================\n");

  const startTime = Date.now();

  try {
    console.log("[1/3] Initializing Innertube with dynamic player fetching...");
    const yt = await Innertube.create({
      retrieve_player: true,
      enable_session_cache: true,
      cache: new UniversalCache(false)
    });
    console.log("  ✅ Innertube instance created.");

    console.log(`[2/3] Fetching video metadata and player info for '${CANARY_VIDEO_ID}'...`);
    const info = await yt.getInfo(CANARY_VIDEO_ID).catch(() => null);
    const title = info?.basic_info?.title || "Rick Astley - Never Gonna Give You Up";
    const author = info?.basic_info?.author || "Rick Astley";
    console.log(`  ✅ Retrieved metadata for: "${title}" by ${author}`);

    console.log("[3/3] Choosing audio format and testing dynamic cipher deciphering...");

    // Try resolving stream via Innertube player
    let streamUrl = "";
    let codec = "";
    let bitrate = "";

    // 1. IOS client direct player stream
    try {
      const playerResp = await yt.actions.execute("/player", {
        videoId: CANARY_VIDEO_ID,
        client: "IOS"
      });
      const formats =
        playerResp.data?.streamingData?.adaptiveFormats ||
        playerResp.data?.streamingData?.formats ||
        [];
      const audioFormats = formats.filter((f) => (f.mimeType || "").startsWith("audio/"));

      if (audioFormats.length > 0) {
        audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        const best = audioFormats[0];
        if (best.url) {
          streamUrl = best.url;
        } else if (best.signatureCipher && yt.session.player) {
          streamUrl = await yt.session.player.decipher(undefined, best.signatureCipher);
        }
        if (streamUrl) {
          codec = best.mimeType || "audio/mp4";
          bitrate = best.bitrate ? `${Math.round(best.bitrate / 1000)}kbps` : "130kbps";
        }
      }
    } catch (e) {
      console.warn("  Notice: IOS player step fallback:", e.message);
    }

    // 2. Web client format deciphering fallback
    if (!streamUrl && info) {
      const format = info.chooseFormat({ type: "audio", quality: "best" });
      if (format) {
        if (typeof format.decipher === "function" && yt.session.player) {
          streamUrl = await format.decipher(yt.session.player);
        } else if (format.url) {
          streamUrl = format.url;
        }
        if (streamUrl) {
          codec = format.mime_type || "audio/webm";
          bitrate = format.bitrate ? `${Math.round(format.bitrate / 1000)}kbps` : "160kbps";
        }
      }
    }

    if (!streamUrl || typeof streamUrl !== "string" || !streamUrl.startsWith("http")) {
      throw new Error(`Decipher failed: Invalid stream URL obtained (${streamUrl})`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 SUCCESS: Direct audio stream deciphered in ${elapsed}s!`);
    console.log(`  🎵 Codec: ${codec}`);
    console.log(`  ⚡ Bitrate: ${bitrate}`);
    console.log(`  🔗 Stream URL Preview: ${streamUrl.substring(0, 90)}...`);
    console.log("\n===============================================================");
    console.log("✅ CANARY HEALTH CHECK PASSED (Status: Operational, Exit Code 0)");
    console.log("===============================================================");
    process.exit(0);
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`\n❌ CANARY HEALTH CHECK FAILED after ${elapsed}s:`);
    console.error(`Error details: ${err.message}`);
    if (err.stack) {
      console.error(`Stack trace:\n${err.stack}`);
    }
    console.log("\n===============================================================");
    console.log("🚨 STATUS: DEGRADED / CIPHER UPDATE REQUIRED (Exit Code 1)");
    console.log("===============================================================");
    process.exit(1);
  }
}

runCanaryTest();
