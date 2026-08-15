"""
Pulse Music Application Comprehensive Verification Test Suite
"""
import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def test_manifest():
    path = os.path.join(ROOT, 'manifest.json')
    assert os.path.exists(path), "manifest.json must exist at root"
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert data.get('name') == 'Pulse Music', "Manifest name must be Pulse Music"
    assert data.get('display') == 'standalone', "Display must be standalone"
    print("[PASS] Manifest test passed.")

def test_sw():
    path = os.path.join(ROOT, 'sw.js')
    assert os.path.exists(path), "sw.js must exist at root"
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    assert 'pulse-music-cache' in content, "Service worker must have cache name"
    print("[PASS] Service Worker test passed.")

def test_html_and_scripts():
    html_path = os.path.join(ROOT, 'index.html')
    assert os.path.exists(html_path), "index.html must exist"
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Check script tags
    assert 'src/musicService.js' in html, "musicService.js script must be present"
    assert 'src/visualizer.js' in html, "visualizer.js script must be present"
    assert 'src/main.js' in html, "main.js script must be present"
    assert 'fs-canvas-visualizer' in html, "fs-canvas-visualizer canvas must exist"
    assert 'side-drawer' in html, "side-drawer must exist"
    assert 'lyrics-container' in html, "lyrics-container must exist"
    assert 'queue-now-playing' in html, "queue-now-playing must exist"
    assert 'queue-up-next' in html, "queue-up-next must exist"
    assert 'download-app-modal' in html, "download-app-modal must exist"
    assert 'auth-modal' in html, "auth-modal must exist"
    print("[PASS] HTML structure and element tests passed.")

def test_javascript_integrity():
    main_path = os.path.join(ROOT, 'src', 'main.js')
    with open(main_path, 'r', encoding='utf-8') as f:
        main_js = f.read()
    
    # Check critical functions
    assert 'downloadPlatformApp' in main_js, "downloadPlatformApp must be defined"
    assert 'toggleDrawer' in main_js, "toggleDrawer must be defined"
    assert 'renderLyricsDrawer' in main_js, "renderLyricsDrawer must be defined"
    assert 'updateLyricsProgress' in main_js, "updateLyricsProgress must be defined"
    assert 'openForgotPasswordModal' in main_js, "openForgotPasswordModal must be defined"
    assert 'handleQrScanLogin' in main_js, "handleQrScanLogin must be defined"
    assert 'TRACK_LYRICS_DB' in main_js, "TRACK_LYRICS_DB must be present"
    print("[PASS] JavaScript integrity test passed.")

if __name__ == '__main__':
    print("Running Pulse Music verification tests...")
    test_manifest()
    test_sw()
    test_html_and_scripts()
    test_javascript_integrity()
    print("All Pulse Music verification tests PASSED successfully!")
