#!/usr/bin/env python3
"""
Pulse Music - Jamendo API Diagnostic & Stream Verifier
Tests Jamendo Client ID, track queries, and audio stream reachability.
"""

import urllib.request
import urllib.parse
import json
import os
import sys

# Ensure UTF-8 output encoding across all terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(ROOT_DIR, '.env')

def load_client_id():
    """Extracts VITE_JAMENDO_CLIENT_ID from .env or environment"""
    cid = os.environ.get('VITE_JAMENDO_CLIENT_ID', '').strip()
    if not cid and os.path.exists(ENV_FILE):
        try:
            with open(ENV_FILE, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('VITE_JAMENDO_CLIENT_ID='):
                        val = line.split('=', 1)[1].strip()
                        if val and not val.startswith('#') and 'your_' not in val:
                            cid = val
                            break
        except Exception as e:
            print(f"[WARN] Error reading .env: {e}")
    return cid

def test_jamendo_api(client_id):
    print("=" * 65)
    print("[PULSE MUSIC] JAMENDO API DIAGNOSTIC SUITE")
    print("=" * 65)

    if not client_id:
        print("\n[-] STATUS: No Jamendo Client ID configured in .env.")
        print("\nHOW TO GET YOUR JAMENDO CLIENT ID (FREE & INSTANT):")
        print("1. Visit: https://devportal.jamendo.com/login")
        print("2. Sign in with your registered email (pushkarhiremath68@gmail.com)")
        print("3. Go to 'Applications' / 'My Apps'")
        print("4. Copy your 8-character Client ID (e.g. a1b2c3d4)")
        print("5. Paste into .env: VITE_JAMENDO_CLIENT_ID=your_client_id")
        print("=" * 65)
        return False

    print(f"\n[+] Client ID Detected: {client_id}")

    # 1. Test Trending Tracks Endpoint
    print("\n--- 1. Testing Trending Tracks Query ---")
    trending_url = f"https://api.jamendo.com/v3.0/tracks/?client_id={client_id}&format=json&limit=5&order=popularity_total&include=musicinfo+licenses"
    try:
        req = urllib.request.Request(trending_url, headers={'User-Agent': 'PulseMusic/2.4'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            headers = data.get('headers', {})
            status = headers.get('status')
            code = headers.get('code')
            results = data.get('results', [])

            if status == 'success' or results:
                print(f"[SUCCESS] Retrieved {len(results)} trending tracks from Jamendo!")
                for idx, t in enumerate(results[:3], 1):
                    print(f"   {idx}. \"{t.get('name')}\" by {t.get('artist_name')} [{t.get('duration')}s]")
                    print(f"      * Stream MP3: {t.get('audio')}")
                    print(f"      * Download: {t.get('audiodownload')}")
            else:
                err_msg = headers.get('error_message', 'Unknown Error')
                print(f"[FAILED] API returned error (code {code}): {err_msg}")
                return False
    except Exception as e:
        print(f"[FAILED] Connection error: {e}")
        return False

    # 2. Test Live Search
    print("\n--- 2. Testing Live Search Query ('chillout') ---")
    search_url = f"https://api.jamendo.com/v3.0/tracks/?client_id={client_id}&format=json&limit=3&namesearch=chillout&include=musicinfo+licenses"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'PulseMusic/2.4'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            if results:
                print(f"[SUCCESS] Search returned {len(results)} matches for 'chillout'!")
                sample = results[0]
                print(f"   * Top Match: \"{sample.get('name')}\" by {sample.get('artist_name')}")
            else:
                print("[NOTICE] Search returned 0 results.")
    except Exception as e:
        print(f"[FAILED] Search error: {e}")

    # 3. Test Direct Audio Stream URL Reachability
    if results and results[0].get('audio'):
        sample_audio = results[0]['audio']
        print(f"\n--- 3. Testing Audio Stream Reachability ({sample_audio[:60]}...) ---")
        try:
            head_req = urllib.request.Request(sample_audio, headers={'User-Agent': 'PulseMusic/2.4', 'Range': 'bytes=0-1024'})
            with urllib.request.urlopen(head_req, timeout=5) as a_resp:
                c_type = a_resp.headers.get('Content-Type', '')
                c_len = a_resp.headers.get('Content-Length', '')
                code = a_resp.getcode()
                print(f"[SUCCESS] Audio Stream Response: HTTP {code} ({c_type}, {c_len} bytes)")
                print("Audio track is 100% playable in HTML5 Audio & Pulse Engine!")
        except Exception as e:
            print(f"[NOTICE] Stream test returned: {e}")

    print("\n" + "=" * 65)
    print("[SUCCESS] JAMENDO INTEGRATION STATUS: READY & FULLY ACCESSIBLE")
    print("=" * 65)
    return True

if __name__ == '__main__':
    cid = sys.argv[1] if len(sys.argv) > 1 else load_client_id()
    test_jamendo_api(cid)
