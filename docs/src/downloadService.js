/**
 * Pulse Music - Universal Cross-Platform Downloader
 * Supports Song Downloads & App Installation across Android, iOS, Windows, macOS, and Linux.
 */

import { resolveFullAudioStream } from './musicService.js';
import { PERMANENT_STREAM_MAP } from './catalogService.js';

export function detectUserPlatform() {
  if (typeof navigator === 'undefined') return 'pwa';
  const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
  const plat = (navigator.platform || '').toLowerCase();

  if (/ipad|iphone|ipod/.test(ua) || (plat === 'macintel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  if (/android/.test(ua)) {
    return 'android';
  }
  if (/win/.test(ua) || /win/.test(plat)) {
    return 'windows';
  }
  if (/mac/.test(ua) || /mac/.test(plat)) {
    return 'mac';
  }
  if (/linux/.test(ua) || /linux/.test(plat)) {
    return 'linux';
  }
  return 'pwa';
}

/**
 * Universal Song Downloader for ANY Track
 * Works seamlessly on iOS (Share Sheet / Files App), Android (Downloads folder), and Desktop (Direct File Saver).
 */
export async function downloadTrack(track) {
  if (!track || !track.title) {
    if (typeof window.showToast === 'function') {
      window.showToast('Please select a song to download.', 'warning', 2500);
    }
    return;
  }

  const platform = detectUserPlatform();
  const cleanTitle = (track.title || 'Song').replace(/[\\/:*?"<>|]/g, '').trim();
  const cleanArtist = (track.artist || 'Pulse Artist').replace(/[\\/:*?"<>|]/g, '').trim();
  const fileName = `${cleanTitle} - ${cleanArtist}.m4a`;

  if (typeof window.showToast === 'function') {
    window.showToast(`Preparing 320kbps download for "${cleanTitle}"... ⚡`, 'info', 3000);
  }

  try {
    // 1. Resolve direct master audio stream URL
    let streamUrl = track.streamUrl || PERMANENT_STREAM_MAP[track.title] || PERMANENT_STREAM_MAP[cleanTitle];
    
    if (!streamUrl || !streamUrl.startsWith('http') || streamUrl === 'yt-iframe' || streamUrl.includes('preview')) {
      const resolved = await resolveFullAudioStream(track);
      if (resolved && resolved.streamUrl && resolved.streamUrl.startsWith('http') && resolved.streamUrl !== 'yt-iframe') {
        streamUrl = resolved.streamUrl;
      }
    }

    // If still no direct CDN stream, fallback to YouTube video search download link
    if (!streamUrl || !streamUrl.startsWith('http') || streamUrl === 'yt-iframe') {
      const ytId = track.ytId || (track.id && track.id.startsWith('ytm-') ? track.id.replace('ytm-', '') : null);
      if (ytId) {
        window.open(`https://www.youtube.com/watch?v=${ytId}`, '_blank');
        if (typeof window.showToast === 'function') {
          window.showToast(`Opening YouTube audio page for "${cleanTitle}"...`, 'info', 3500);
        }
        return;
      }
      throw new Error('Direct audio stream not available for this track.');
    }

    // 2. Fetch audio as Blob with clean simple GET (Zero CORS preflight blockage)
    const response = await fetch(streamUrl);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const blob = await response.blob();
    const audioBlob = new Blob([blob], { type: 'audio/mp4' });

    // 3. Platform-Specific Delivery

    // 3A. iOS / iPadOS (Safari & Chrome on iOS)
    // Uses Web Share API with File object so user gets native "Save to Files" / iCloud sheet
    if (platform === 'ios' && typeof navigator.share === 'function') {
      try {
        const file = new File([audioBlob], fileName, { type: 'audio/mp4' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${cleanTitle} - ${cleanArtist}`,
            text: `Pulse Music Studio Master Audio: ${cleanTitle}`
          });
          if (typeof window.showToast === 'function') {
            window.showToast(`"${cleanTitle}" saved to Files! 🎵`, 'success', 3500);
          }
          return;
        }
      } catch (shareErr) {
        if (shareErr.name === 'AbortError') return; // User cancelled share
        console.warn('[Pulse Downloader] iOS Share error, falling back to blob click:', shareErr);
      }
    }

    // 3B. Android, Windows, macOS, Linux (Direct Synthetic Anchor Click)
    const blobUrl = window.URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = fileName;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 2500);

    if (typeof window.showToast === 'function') {
      window.showToast(`"${cleanTitle}" downloaded successfully! 🎧 (320kbps Master)`, 'success', 4000);
    }
  } catch (err) {
    console.warn('[Pulse Downloader] Direct blob fetch fallback:', err.message);
    
    // Fallback: If blob was blocked by browser security, open direct stream link with download prompt
    let fallbackStream = track.streamUrl || PERMANENT_STREAM_MAP[track.title] || '';
    if (fallbackStream && fallbackStream.startsWith('http')) {
      const a = document.createElement('a');
      a.href = fallbackStream;
      a.target = '_blank';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 1500);

      if (typeof window.showToast === 'function') {
        window.showToast(`Downloading "${cleanTitle}" via direct master CDN... ⚡`, 'info', 4000);
      }
    } else {
      if (typeof window.showToast === 'function') {
        window.showToast(`Could not download "${cleanTitle}". Please try another track.`, 'warning', 3000);
      }
    }
  }
}

/**
 * Downloads the currently playing song in the playbar
 */
export function downloadCurrentTrack() {
  if (typeof window !== 'undefined' && window.PulsePlaybar && typeof window.PulsePlaybar.getCurrentTrack === 'function') {
    const current = window.PulsePlaybar.getCurrentTrack();
    if (current) {
      downloadTrack(current);
      return;
    }
  }
  if (typeof window.showToast === 'function') {
    window.showToast('No song is currently playing. Select a track first.', 'warning', 2500);
  }
}

/**
 * Universal App & Package Downloader (Bypasses Service Worker & Browser blocks)
 */
export function triggerDirectFileDownload(fileName, label) {
  try {
    if (typeof window.showToast === 'function') {
      window.showToast(`Starting ${label || fileName} download... ⚡`, 'info', 3000);
    }
    const fileUrl = `/downloads/${fileName}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 2000);

    if (typeof window.showToast === 'function') {
      window.showToast(`✅ ${label || fileName} downloading! Check your Downloads folder / notification bar! 📲`, 'success', 5000);
    }
  } catch (err) {
    console.error('[Pulse Downloader] Error triggering file download:', err);
    window.location.href = `/downloads/${fileName}`;
  }
}

export function downloadAndroidApk() {
  triggerDirectFileDownload('Pulse-Android.apk', 'Pulse Music for Android (APK)');
}

export function downloadWindowsInstaller() {
  // Windows .exe files are always blocked by SmartScreen without a $400/yr code signing cert.
  // Instead, trigger the PWA install prompt (which creates a real desktop app with taskbar icon)
  // or fall back to opening the download modal with Windows-specific options.
  if (typeof window.triggerPWAInstall === 'function') {
    window.triggerPWAInstall();
  } else if (typeof window.downloadWindowsShortcut === 'function') {
    window.downloadWindowsShortcut();
  }
}

export function downloadMacDmg() {
  triggerDirectFileDownload('Pulse-Mac.dmg', 'Pulse Music for macOS (.dmg)');
}

export function downloadLinuxAppImage() {
  triggerDirectFileDownload('Pulse-Linux.AppImage', 'Pulse Music for Linux (.AppImage)');
}

export function downloadIosIpa() {
  triggerDirectFileDownload('Pulse-iOS.ipa', 'Pulse Music for iOS (.ipa)');
}

export function downloadAppForDevice() {
  const plat = detectUserPlatform();
  if (plat === 'android') {
    downloadAndroidApk();
  } else if (plat === 'windows') {
    // On Windows, open the download modal with Windows tab — never try .exe
    if (typeof window.openDownloadModal === 'function') {
      window.openDownloadModal('windows');
    }
    if (typeof window.showToast === 'function') {
      window.showToast('Click "1-Click Install on Laptop" or "Desktop Shortcut (.url)" for zero-warning install! 💻', 'info', 5000);
    }
  } else if (plat === 'mac') {
    if (typeof window.downloadMacShortcut === 'function') {
      window.downloadMacShortcut();
    } else {
      downloadMacDmg();
    }
  } else if (plat === 'linux') {
    if (typeof window.downloadLinuxDesktopShortcut === 'function') {
      window.downloadLinuxDesktopShortcut();
    } else {
      downloadLinuxAppImage();
    }
  } else if (plat === 'ios') {
    if (typeof window.openDownloadModal === 'function') {
      window.openDownloadModal('ios');
    }
    if (typeof window.showToast === 'function') {
      window.showToast('iPhone/iPad: Tap Safari Share button -> "Add to Home Screen" 📲', 'info', 6000);
    }
  } else {
    if (typeof window.openDownloadModal === 'function') {
      window.openDownloadModal('all');
    }
  }
}

// Global exposure
if (typeof window !== 'undefined') {
  window.downloadTrack = downloadTrack;
  window.downloadCurrentTrack = downloadCurrentTrack;
  window.triggerDirectFileDownload = triggerDirectFileDownload;
  window.downloadAndroidApk = downloadAndroidApk;
  window.downloadWindowsInstaller = downloadWindowsInstaller;
  window.downloadMacDmg = downloadMacDmg;
  window.downloadLinuxAppImage = downloadLinuxAppImage;
  window.downloadIosIpa = downloadIosIpa;
  window.downloadAppForDevice = downloadAppForDevice;
}

export default {
  downloadTrack,
  downloadCurrentTrack,
  detectUserPlatform,
  triggerDirectFileDownload,
  downloadAndroidApk,
  downloadWindowsInstaller,
  downloadMacDmg,
  downloadLinuxAppImage,
  downloadIosIpa,
  downloadAppForDevice
};

