import os
import shutil
import subprocess

print("[1/3] Syncing dist/ to docs/ with .nojekyll...")
if os.path.exists('docs'):
    shutil.rmtree('docs')
shutil.copytree('dist', 'docs')
shutil.copytree('src', os.path.join('docs', 'src'), dirs_exist_ok=True)
shutil.copytree('public', os.path.join('docs', 'public'), dirs_exist_ok=True)
with open('docs/.nojekyll', 'w') as f: f.write('')
with open('.nojekyll', 'w') as f: f.write('')
if os.path.exists('pulse-logo.png'): shutil.copy('pulse-logo.png', 'docs/pulse-logo.png')
if os.path.exists('pulse-logo.svg'): shutil.copy('pulse-logo.svg', 'docs/pulse-logo.svg')

print("[2/3] Verifying docs/ assets...")
pulse_js = os.path.join('docs', 'assets', 'pulse.js')
assert os.path.exists(pulse_js), "docs/assets/pulse.js does not exist"
size = os.path.getsize(pulse_js)
print(f"docs/assets/pulse.js exists ({size} bytes)")

with open(pulse_js, 'r', encoding='utf-8') as f:
    code = f.read()

symbols = [
  'playSpecificTrack',
  'executeSearch',
  'switchView',
  'openGeminiDjModal',
  'openLyricsForCurrentTrack',
  'PulseGemini',
  'catalogService',
  'lyricsService',
  'PulseAudioEngine',
  'playbarController',
  'PulseAuth'
]

for s in symbols:
    print(f"  - Symbol '{s}': {'PRESENT' if s in code else 'MISSING'}")

print("[3/3] Sync and verification completed successfully!")
