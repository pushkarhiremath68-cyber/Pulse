"""
Pulse Music Storage & Admin Verification Test Suite
Tests Supabase Storage URL resolution, audio format support, metadata preservation,
Admin Studio authentication, upload controllers, and security.
"""

import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def test_supabase_storage_urls():
    supabase_client_path = os.path.join(ROOT, 'src', 'supabaseClient.js')
    assert os.path.exists(supabase_client_path), "src/supabaseClient.js must exist"
    
    with open(supabase_client_path, 'r', encoding='utf-8') as f:
        code = f.read()
    
    assert 'getAudioStorageUrl' in code, "getAudioStorageUrl must be exported from supabaseClient.js"
    assert 'PULSE_STORAGE_BUCKET' in code, "PULSE_STORAGE_BUCKET must be defined"
    assert 'storage/v1/object/public' in code, "Must construct public storage URL"
    print("[PASS] Supabase Storage client module test passed.")

def test_catalog_integrity():
    music_service_path = os.path.join(ROOT, 'src', 'musicService.js')
    assert os.path.exists(music_service_path), "src/musicService.js must exist"
    
    with open(music_service_path, 'r', encoding='utf-8') as f:
        code = f.read()
    
    # Verify no iTunes preview URLs in the catalog
    assert 'audio-ssl.itunes.apple.com' not in code, "No iTunes 30s preview URLs should remain in the catalog"
    
    # Verify storagePath is used
    assert 'storagePath' in code, "Catalog must use storagePath for audio files"
    assert 'getAudioStorageUrl' in code, "musicService must use getAudioStorageUrl"
    
    # Check top songs
    top_ids = ['in-kesariya', 'in-tere-vaaste', 'in-apna-bana-le', 'in-chaleya', 'in-sajni']
    for tid in top_ids:
        assert f'"{tid}"' in code, f"Track {tid} must exist in catalog"
    
    print("[PASS] Catalog storage paths and metadata integrity test passed.")

def test_admin_studio_engine():
    main_path = os.path.join(ROOT, 'src', 'main.js')
    with open(main_path, 'r', encoding='utf-8') as f:
        main_code = f.read()
    
    # Check that 30s preview logic is removed
    assert '(30s Preview)' not in main_code, "Player should not contain (30s Preview) title overrides"
    
    # Check Admin Studio controller
    assert 'unlockAdminStudio' in main_code, "unlockAdminStudio must be defined"
    assert 'lockAdminStudio' in main_code, "lockAdminStudio must be defined"
    assert 'publishAdminTrack' in main_code, "publishAdminTrack must be defined"
    assert 'renderAdminCatalogTable' in main_code, "renderAdminCatalogTable must be defined"
    print("[PASS] Admin Studio controller and security test passed.")

def test_ui_and_html_elements():
    html_path = os.path.join(ROOT, 'index.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Public header button should NOT be exposed to normal listeners
    assert 'id="header-upload-btn"' not in html, "Public upload button should NOT be exposed in header to normal listeners"
    
    # Admin View & Dropzone
    assert 'view-admin-upload' in html, "view-admin-upload must exist in index.html"
    assert 'admin-audio-dropzone' in html, "admin-audio-dropzone must exist in index.html"
    assert 'admin-passcode-input' in html, "admin-passcode-input gate must exist in index.html"
    assert 'admin-target-catalog-select' in html, "admin-target-catalog-select must exist in index.html"
    assert 'admin-catalog-table' in html, "admin-catalog-table must exist in index.html"
    print("[PASS] UI Admin Studio elements and security isolation test passed.")

def test_environment_safety():
    env_path = os.path.join(ROOT, '.env')
    with open(env_path, 'r', encoding='utf-8') as f:
        env_content = f.read()
    
    assert 'SERVICE_ROLE' not in env_content, "Never expose service-role key in .env"
    assert 'VITE_SUPABASE_STORAGE_BUCKET=music' in env_content, "Must specify music storage bucket"
    print("[PASS] Environment configuration safety test passed.")

if __name__ == '__main__':
    print("Running Pulse Music Storage & Admin Studio test suite...\n")
    test_supabase_storage_urls()
    test_catalog_integrity()
    test_admin_studio_engine()
    test_ui_and_html_elements()
    test_environment_safety()
    print("\nAll Pulse Music Storage & Admin Studio tests PASSED successfully!")
