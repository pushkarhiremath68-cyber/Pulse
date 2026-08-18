import os
import shutil
import subprocess

print("=================================================================")
print("STEP 1: PURGING UNUSED LEGACY REACT/SUPABASE COMPONENTS & CONTEXT")
print("=================================================================")

for dir_to_remove in ['src/components', 'src/context', 'src/lib', 'src/services']:
    if os.path.exists(dir_to_remove):
        shutil.rmtree(dir_to_remove)
        print(f"  - Removed directory: {dir_to_remove}")

print("\n=================================================================")
print("STEP 2: CLEANING STATIC SEED DATA FROM SRC/MUSICSERVICE.JS")
print("=================================================================")

# MusicService now dynamically searches and streams purely from Audius & Jamendo without hardcoded MP3 seeds
clean_music_service = """/**
 * Pulse Music - Pure Dynamic Audius & Jamendo Live Music Service
 * Zero static mock files or local seeds. All tracks resolved in real-time.
 */

const JAMENDO_CLIENT_ID = '23b33f2a';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const AUDIUS_APP_NAME = 'PULSE_MUSIC';

let activeAudiusNode = 'https://discoveryprovider.audius.co';

export async function getAudiusNode() {
  try {
    const res = await fetch('https://api.audius.co', { signal: AbortSignal.timeout(3000) });
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      activeAudiusNode = json.data[0].replace(/\\/+$/, '');
    }
  } catch (e) {}
  return activeAudiusNode;
}

export async function searchAudiusTracks(query, limit = 15) {
  if (!query) return [];
  try {
    const node = await getAudiusNode();
    const url = `${node}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${AUDIUS_APP_NAME}&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        return json.data.map(t => ({
          id: `audius-${t.id}`,
          title: t.title || 'Untitled',
          artist: (t.user && t.user.name) || 'Audius Artist',
          album: 'Audius Stream',
          cover: (t.artwork && (t.artwork['480x480'] || t.artwork['150x150'])) || './pulse-logo.png',
          duration: t.duration || 210,
          streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
          genre: t.genre || 'Electronic',
          source: 'Audius Decentralized'
        }));
      }
    }
  } catch (e) {
    console.warn('[MusicService Audius Search]', e);
  }
  return [];
}

export async function searchJamendoTracks(query, limit = 15) {
  if (!query) return [];
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=jsonpretty&limit=${limit}&namesearch=${encodeURIComponent(query)}&audioformat=mp32`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.results && Array.isArray(json.results)) {
        return json.results.map(t => ({
          id: `jamendo-${t.id}`,
          title: t.name || 'Untitled',
          artist: t.artist_name || 'Jamendo Artist',
          album: t.album_name || 'Jamendo Single',
          cover: t.image || t.album_image || './pulse-logo.png',
          duration: parseInt(t.duration, 10) || 210,
          streamUrl: t.audio || t.audiodownload,
          genre: (t.musicinfo && t.musicinfo.tags && t.musicinfo.tags.genres && t.musicinfo.tags.genres[0]) || 'Pop',
          source: 'Jamendo Music'
        }));
      }
    }
  } catch (e) {
    console.warn('[MusicService Jamendo Search]', e);
  }
  return [];
}

export async function searchAllLiveMusic(query, limit = 30) {
  const [audiusResults, jamendoResults] = await Promise.allSettled([
    searchAudiusTracks(query, Math.floor(limit / 2)),
    searchJamendoTracks(query, Math.ceil(limit / 2))
  ]);

  const combined = [];
  if (audiusResults.status === 'fulfilled') combined.push(...audiusResults.value);
  if (jamendoResults.status === 'fulfilled') combined.push(...jamendoResults.value);
  return combined;
}

if (typeof window !== 'undefined') {
  window.musicService = {
    getAudiusNode,
    searchAudiusTracks,
    searchJamendoTracks,
    searchAllLiveMusic
  };
}
"""

with open('src/musicService.js', 'w', encoding='utf-8') as f:
    f.write(clean_music_service)
print("[OK] Replaced src/musicService.js with pure dynamic live music resolver")

print("\n=================================================================")
print("STEP 3: COMPILING CLEAN PRODUCTION BUILD & SYNCING TO DOCS/")
print("=================================================================")

build_res = subprocess.run('npm run build', shell=True, capture_output=True, text=True)
print(build_res.stdout)
if build_res.returncode != 0:
    print("[ERROR] Build failed:", build_res.stderr)
    exit(1)

if os.path.exists('docs'):
    shutil.rmtree('docs')
shutil.copytree('dist', 'docs')
shutil.copytree('src', os.path.join('docs', 'src'), dirs_exist_ok=True)
shutil.copytree('public', os.path.join('docs', 'public'), dirs_exist_ok=True)
with open('docs/.nojekyll', 'w') as f: f.write('')
with open('.nojekyll', 'w') as f: f.write('')
if os.path.exists('pulse-logo.png'): shutil.copy('pulse-logo.png', 'docs/pulse-logo.png')
if os.path.exists('pulse-logo.svg'): shutil.copy('pulse-logo.svg', 'docs/pulse-logo.svg')

print("SUCCESS: Full cleanup of static mock song data and legacy schemas complete!")
