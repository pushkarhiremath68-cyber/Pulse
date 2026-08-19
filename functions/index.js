/**
 * Pulse Music - Firebase Cloud Functions Backend Resolver
 * Powered by youtubei.js (Innertube) with dynamic player fetching & cipher resolution
 */

import { onRequest } from "firebase-functions/v2/https";
import { Innertube, UniversalCache } from "youtubei.js";
import cors from "cors";

const corsHandler = cors({ origin: true });

// Innertube Singleton Instance
let ytInstance = null;

async function getInnertube() {
  if (!ytInstance) {
    console.log("[Pulse Innertube] Initializing Innertube with dynamic player retrieval...");
    ytInstance = await Innertube.create({
      retrieve_player: true,
      enable_session_cache: true,
      cache: new UniversalCache(false)
    });
    console.log("[Pulse Innertube] Innertube initialized successfully.");
  }
  return ytInstance;
}

/**
 * Resolves pure audio streaming URL using Innertube with dynamic player deciphering
 * Supports IOS, Android, and Web InnerTube clients
 */
export async function resolveAudioStream(videoId) {
  const cleanId = videoId.toString().replace("ytm-", "").replace("yt-", "").trim();
  const yt = await getInnertube();

  // 1. Fetch metadata
  const info = await yt.getInfo(cleanId).catch(() => null);
  const title = info?.basic_info?.title || "Track";
  const artist = info?.basic_info?.author || "Artist";
  const duration = info?.basic_info?.duration || 0;
  const thumbnail =
    info?.basic_info?.thumbnail?.[0]?.url || `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`;

  // 2. Resolve stream URL (Multi-tier: IOS ➔ Web / Android player cipher deciphering)
  try {
    const playerResp = await yt.actions.execute("/player", {
      videoId: cleanId,
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
      let directUrl = best.url;

      if (!directUrl && best.signatureCipher && yt.session.player) {
        directUrl = await yt.session.player.decipher(undefined, best.signatureCipher);
      }

      if (directUrl && directUrl.startsWith("http")) {
        return {
          success: true,
          videoId: cleanId,
          title,
          artist,
          duration,
          thumbnail,
          streamUrl: directUrl,
          codec: best.mimeType || "audio/mp4",
          bitrate: best.bitrate ? `${Math.round(best.bitrate / 1000)}kbps` : "130kbps",
          quality: best.audioQuality || "AUDIO_QUALITY_HIGH"
        };
      }
    }
  } catch (err) {
    console.warn(`[Pulse Resolver] IOS client notice for ${cleanId}:`, err.message);
  }

  // 3. Fallback to Web format deciphering
  if (info) {
    try {
      const format = info.chooseFormat({ type: "audio", quality: "best" });
      if (format) {
        let decipheredUrl = "";
        if (typeof format.decipher === "function" && yt.session.player) {
          decipheredUrl = await format.decipher(yt.session.player);
        } else if (format.url) {
          decipheredUrl = format.url;
        }

        if (decipheredUrl && decipheredUrl.startsWith("http")) {
          return {
            success: true,
            videoId: cleanId,
            title,
            artist,
            duration,
            thumbnail,
            streamUrl: decipheredUrl,
            codec: format.mime_type || "audio/webm",
            bitrate: format.bitrate ? `${Math.round(format.bitrate / 1000)}kbps` : "160kbps",
            quality: format.audio_quality || "AUDIO_QUALITY_HIGH"
          };
        }
      }
    } catch (err) {
      console.warn(`[Pulse Resolver] Web decipher notice for ${cleanId}:`, err.message);
    }
  }

  throw new Error(`Failed to decipher audio stream URL for videoId: ${cleanId}`);
}

/**
 * HTTP Cloud Function: getAudioStream
 * Deciphers and returns best-quality pure audio stream URL by videoId
 */
export const getAudioStream = onRequest(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: "512MiB",
    maxInstances: 20
  },
  async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      const videoId = (
        req.query.videoId ||
        req.query.id ||
        req.query.v ||
        (req.body && (req.body.videoId || req.body.id)) ||
        ""
      )
        .toString()
        .trim();

      if (!videoId) {
        return res.status(400).json({
          success: false,
          error: "Missing required query parameter: videoId (e.g. ?videoId=dQw4w9WgXcQ)"
        });
      }

      try {
        const result = await resolveAudioStream(videoId);
        return res.status(200).json(result);
      } catch (err) {
        console.error(`[Pulse getAudioStream Error for ${videoId}]:`, err);
        return res.status(500).json({
          success: false,
          error: err.message || "Internal audio resolution error",
          code: "DECIPHER_ERROR"
        });
      }
    });
  }
);
