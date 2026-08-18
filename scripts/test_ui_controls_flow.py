#!/usr/bin/env python3
"""
Test UI Controls & Playback Flow integrity check for Pulse Music.
Verifies that seekTo, seekRelative, playNextTrack, playPrevTrack, and track-switching logic are intact.
"""

import os
import re
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check_file_contains(filepath, patterns, label):
    print(f"\nChecking {label}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    all_passed = True
    for p in patterns:
        if isinstance(p, tuple):
            pattern, desc = p
        else:
            pattern, desc = p, p
        if re.search(pattern, content):
            print(f"  [OK] Found: {desc}")
        else:
            print(f"  [FAIL] Missing: {desc}")
            all_passed = False
    return all_passed

def main():
    main_js = os.path.join(ROOT, 'src', 'main.js')
    playbar_js = os.path.join(ROOT, 'src', 'playbarController.js')
    style_css = os.path.join(ROOT, 'src', 'style.css')
    index_html = os.path.join(ROOT, 'index.html')

    passed = True

    # 1. Main.js Checks
    main_patterns = [
        (r'window\.playSpecificTrack\s*=\s*async\s*function', 'window.playSpecificTrack export'),
        (r'stopAllAudio\(\);', 'stopAllAudio on track change & navigation'),
        (r'function\s+seekTo\(percent\)', 'seekTo(percent) implementation'),
        (r'function\s+seekRelative\(seconds\)', 'seekRelative(seconds) implementation'),
        (r'function\s+playNextTrack\(\)', 'playNextTrack() implementation'),
        (r'function\s+playPrevTrack\(\)', 'playPrevTrack() implementation'),
        (r'onSeekStart', 'Scrubber onSeekStart handler'),
        (r'onSeekMove', 'Scrubber onSeekMove handler'),
        (r'onSeekEnd', 'Scrubber onSeekEnd handler'),
        (r'handleWrapperClick', 'Timeline bar wrapper click-to-seek handler')
    ]
    if not check_file_contains(main_js, main_patterns, "src/main.js"):
        passed = False

    # 2. Style.css Checks
    style_patterns = [
        (r'\.timeline-range-input\s*\{', '.timeline-range-input CSS rules'),
        (r'\.progress-bar-wrapper', '.progress-bar-wrapper styling'),
        (r'\.progress-handle', '.progress-handle thumb styling')
    ]
    if not check_file_contains(style_css, style_patterns, "src/style.css"):
        passed = False

    # 3. PlaybarController.js Checks
    playbar_patterns = [
        (r'window\.PulsePlaybar\s*=\s*PulsePlaybar', 'window.PulsePlaybar global export'),
        (r'fallback-audio-player', 'Unified fallback-audio-player singleton reference'),
        (r'window\.playNextTrack', 'Delegation to window.playNextTrack'),
        (r'window\.playPrevTrack', 'Delegation to window.playPrevTrack'),
        (r'window\.seekRelative', 'Delegation to window.seekRelative')
    ]
    if not check_file_contains(playbar_js, playbar_patterns, "src/playbarController.js"):
        passed = False

    print("\n" + "=" * 60)
    if passed:
        print("✨ ALL UI & PLAYBACK CONTROLS VERIFIED SUCCESSFULLY")
    else:
        print("❌ SOME CHECKS FAILED")
    print("=" * 60)
    return 0 if passed else 1

if __name__ == '__main__':
    sys.exit(main())
