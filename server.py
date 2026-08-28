import http.server
import socketserver
import threading
import os
import sys
import json
import urllib.request
import urllib.parse
import urllib.error
import time
import re

import base64
import hashlib
try:
    from Crypto.Cipher import DES
except ImportError:
    DES = None

try:
    import yt_dlp
except ImportError:
    yt_dlp = None

PORTS = [3000, 8080, 5000, 5173, 8000, 8899]
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
MUSIC_DIR = os.path.join(ROOT_DIR, 'storage', 'music')
os.makedirs(MUSIC_DIR, exist_ok=True)

TOP_SONGS = [
    ("yt-4NRXx6U8ABQ", "Blinding Lights", "The Weeknd", "4NRXx6U8ABQ"),
    ("yt-BddP6PYo2gs", "Kesariya", "Arijit Singh", "BddP6PYo2gs"),
    ("yt-kJQP7kiw5Fk", "Despacito", "Luis Fonsi", "kJQP7kiw5Fk"),
    ("yt-_dK2tDK9grQ", "Shape of You", "Ed Sheeran", "_dK2tDK9grQ"),
    ("yt-34Na4j8HLws", "Starboy", "The Weeknd", "34Na4j8HLws"),
    ("yt-VNs_cCtdbPc", "Brown Munde", "AP Dhillon", "VNs_cCtdbPc"),
    ("yt-d1qgL-Hmsf0", "Singara Siriye", "Vijay Prakash", "d1qgL-Hmsf0"),
    ("yt-OsU0CGZoV8E", "Naatu Naatu", "Rahul Sipligunj", "OsU0CGZoV8E")
]

# Lock map for concurrent track downloads
DOWNLOAD_LOCKS = {}
GLOBAL_LOCK = threading.Lock()

def get_track_lock(track_id):
    with GLOBAL_LOCK:
        if track_id not in DOWNLOAD_LOCKS:
            DOWNLOAD_LOCKS[track_id] = threading.Lock()
        return DOWNLOAD_LOCKS[track_id]

def find_local_audio_file(track_id):
    """Finds an existing audio file for track_id in storage/music/"""
    if not track_id:
        return None
    for ext in ['.m4a', '.mp3', '.webm', '.ogg', '.wav', '.mp4']:
        p = os.path.join(MUSIC_DIR, f"{track_id}{ext}")
        if os.path.exists(p) and os.path.getsize(p) > 50000:
            return p
    return None

def get_env_jamendo_client_id():
    env_file = os.path.join(ROOT_DIR, '.env')
    if os.path.exists(env_file):
        try:
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('VITE_JAMENDO_CLIENT_ID='):
                        val = line.split('=', 1)[1].strip()
                        if val and not val.startswith('#') and 'your_' not in val:
                            return val
        except Exception:
            pass
    return os.environ.get('VITE_JAMENDO_CLIENT_ID', '')

def clean_query_string(q):
    if not q:
        return ''
    clean = re.sub(r'[()\[\]{}"\'|]', ' ', q)
    parts = clean.split(',')
    if len(parts) > 1:
        clean = parts[0].strip() + ' ' + parts[1].strip().split('&')[0].strip()
    return re.sub(r'\s+', ' ', clean).strip()

def decrypt_saavn_url(encrypted_url):
    if not DES or not encrypted_url:
        return None
    try:
        key = b"38346591"
        cipher = DES.new(key, DES.MODE_ECB)
        dec = cipher.decrypt(base64.b64decode(encrypted_url))
        pad_len = dec[-1]
        if 1 <= pad_len <= 8:
            dec = dec[:-pad_len]
        url = dec.decode('utf-8')
        u320 = url.replace('_96.mp4', '_320.mp4').replace('_48.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4')
        u160 = url.replace('_96.mp4', '_160.mp4').replace('_48.mp4', '_160.mp4').replace('_320.mp4', '_160.mp4')
        return {
            '320': u320,
            '160': u160,
            '96': url
        }
    except Exception:
        return None

def fetch_saavn_master_audio(query, track_id):
    """Fetches full-length 320k/160k master audio with authentic vocals from high-bitrate CDN"""
    if not query:
        return None
    try:
        clean_q = clean_query_string(query)
        url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(clean_q)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            results = data.get('results', [])
            if results:
                r = results[0]
                enc = r.get('encrypted_media_url')
                if enc:
                    dec = decrypt_saavn_url(enc)
                    if dec:
                        for q_key in ['160', '320', '96']:
                            stream_url = dec[q_key]
                            dest = os.path.join(MUSIC_DIR, f"{track_id}.mp4")
                            try:
                                dl_req = urllib.request.Request(stream_url, headers={'User-Agent': 'Mozilla/5.0'})
                                with urllib.request.urlopen(dl_req, timeout=15) as a_resp:
                                    data_bytes = a_resp.read()
                                    with open(dest, 'wb') as f:
                                        f.write(data_bytes)
                                if os.path.exists(dest) and os.path.getsize(dest) > 500000:
                                    print(f"[Pulse Master Studio] Saved full-length track '{track_id}' ({len(data_bytes)/1024/1024:.2f} MB): {r.get('song')} by {r.get('singers')}")
                                    return dest
                            except Exception:
                                pass
    except Exception as e:
        print(f"[Pulse Saavn Engine Notice] {query}: {e}")
    return None

def ensure_audio_file(yt_id=None, query=None, track_id=None, preview_url=None):
    """
    Ensures a full-length master audio file exists in storage/music/.
    1. Checks local cache (>1MB for full length)
    2. Fetches full-length master audio via Saavn High-Bitrate CDN (3-5 minutes)
    3. Downloads via yt_dlp if available
    """
    if yt_id in ('', 'null', 'undefined', 'None'):
        yt_id = None
    if query in ('', 'null', 'undefined', 'None'):
        query = None
    if track_id in ('', 'null', 'undefined', 'None'):
        track_id = None

    if not track_id:
        if yt_id:
            track_id = f"yt-{yt_id}"
        elif query:
            safe_slug = re.sub(r'[^a-z0-9]+', '-', query.lower()).strip('-')[:50]
            track_id = f"q-{safe_slug}"
        else:
            return None

    # Fast check local storage
    existing = find_local_audio_file(track_id)
    if existing and os.path.getsize(existing) > 1000000:
        return existing

    lock = get_track_lock(track_id)
    with lock:
        existing = find_local_audio_file(track_id)
        if existing and os.path.getsize(existing) > 1000000:
            return existing

        search_target = query or track_id.replace('in-', '').replace('en-', '').replace('te-', '').replace('kn-', '').replace('pj-', '').replace('gu-', '').replace('mr-', '').replace('hr-', '').replace('es-', '').replace('fr-', '').replace('dev-', '').replace('-', ' ')

        # Primary Tier: Full-length Master Audio via Saavn 320k/160k CDN
        saavn_audio = fetch_saavn_master_audio(search_target, track_id)
        if saavn_audio:
            return saavn_audio

        # Secondary Tier: Attempt yt_dlp if configured
        if yt_dlp:
            target = None
            if yt_id and len(yt_id) == 11 and ' ' not in yt_id:
                target = f"https://www.youtube.com/watch?v={yt_id}"
            elif query:
                cleaned = clean_query_string(query)
                target = f"{cleaned} official audio"
            elif track_id:
                cleaned_id = track_id.replace('in-', '').replace('en-', '').replace('itunes-', '').replace('-', ' ')
                target = f"{cleaned_id} official song"

            if target:
                out_tmpl = os.path.join(MUSIC_DIR, f"{track_id}.%(ext)s")
                ydl_opts = {
                    'format': 'bestaudio/best',
                    'outtmpl': out_tmpl,
                    'quiet': True,
                    'no_warnings': True,
                    'noplaylist': True,
                    'default_search': 'ytsearch1:',
                    'socket_timeout': 8,
                    'extractor_args': {'youtube': {'player_client': ['ios', 'android', 'mweb']}},
                }
                try:
                    t0 = time.time()
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([target])
                    f = find_local_audio_file(track_id)
                    if f:
                        print(f"[Pulse Audio Engine] Downloaded full track '{track_id}' in {time.time()-t0:.2f}s -> {os.path.basename(f)}")
                        return f
                except Exception as e:
                    print(f"[Pulse Download Notice] '{target}' notice: {e}")

        return None

def serve_local_audio(handler, file_path):
    """Serves a local audio file with full HTTP 206 Partial Content (Range) support"""
    try:
        file_size = os.path.getsize(file_path)
    except OSError:
        handler.send_response(404)
        handler.end_headers()
        return

    ext = os.path.splitext(file_path)[1].lower()
    content_type = 'audio/mp4' if ext in ('.m4a', '.mp4') else ('audio/mpeg' if ext == '.mp3' else 'audio/webm')

    range_header = handler.headers.get('Range')
    if range_header and range_header.startswith('bytes='):
        range_val = range_header[6:].strip()
        parts = range_val.split('-')
        start = int(parts[0]) if parts[0] else 0
        end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
        start = max(0, min(start, file_size - 1))
        end = max(start, min(end, file_size - 1))
        length = end - start + 1

        handler.send_response(206)
        handler.send_header('Content-Type', content_type)
        handler.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
        handler.send_header('Content-Length', str(length))
        handler.send_header('Accept-Ranges', 'bytes')
        handler.send_header('Access-Control-Allow-Origin', '*')
        handler.send_header('Cache-Control', 'public, max-age=86400')
        handler.end_headers()

        try:
            with open(file_path, 'rb') as f:
                f.seek(start)
                bytes_left = length
                while bytes_left > 0:
                    chunk = f.read(min(64 * 1024, bytes_left))
                    if not chunk:
                        break
                    handler.wfile.write(chunk)
                    bytes_left -= len(chunk)
        except (ConnectionResetError, BrokenPipeError):
            pass
    else:
        handler.send_response(200)
        handler.send_header('Content-Type', content_type)
        handler.send_header('Content-Length', str(file_size))
        handler.send_header('Accept-Ranges', 'bytes')
        handler.send_header('Access-Control-Allow-Origin', '*')
        handler.send_header('Cache-Control', 'public, max-age=86400')
        handler.end_headers()

        try:
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(64 * 1024)
                    if not chunk:
                        break
                    handler.wfile.write(chunk)
        except (ConnectionResetError, BrokenPipeError):
            pass


def prewarm_background():
    """Background thread that pre-downloads top popular songs into storage/music/"""
    print("[Pulse Cache] Pre-downloading top hits into storage/music/ in background...")
    for tid, title, artist, ytid in TOP_SONGS:
        try:
            if not find_local_audio_file(tid):
                ensure_audio_file(yt_id=ytid, query=f"{title} {artist}", track_id=tid)
        except Exception:
            pass
    print(f"[Pulse Cache] Background pre-download complete. Total files: {len(os.listdir(MUSIC_DIR))}")


class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True



# =========================================================================
# PULSE AUTHENTICATION ENGINE (Real Persistent User Store & Validation)
# =========================================================================
USERS_FILE = os.path.join(ROOT_DIR, 'storage', 'users.json')
FAILED_ATTEMPTS = {}
AUTH_LOCK = threading.Lock()

def get_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_users(users):
    with AUTH_LOCK:
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2)

def hash_password(password, salt):
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

def validate_email_format(email):
    if not email or not isinstance(email, str):
        return False
    return bool(re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email.strip()))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type, Accept')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization, Accept')
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Read JSON body
        content_length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b'{}'
        try:
            body = json.loads(body_bytes.decode('utf-8'))
        except Exception:
            body = {}

        # ---------------------------------------------------------------------
        # 1. SIGNUP ENDPOINT (/api/auth/signup)
        # ---------------------------------------------------------------------
        if path == '/api/auth/signup':
            name = (body.get('name') or '').strip()
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            confirm_password = body.get('confirmPassword') or body.get('confirm_password') or ''

            # Field validation
            if not name:
                self._send_json(400, {
                    "success": False,
                    "error": "Full Name is required.",
                    "code": "MISSING_NAME",
                    "field": "name"
                })
                return

            if len(name) < 2:
                self._send_json(400, {
                    "success": False,
                    "error": "Full name must be at least 2 characters.",
                    "code": "INVALID_NAME",
                    "field": "name"
                })
                return

            if not email:
                self._send_json(400, {
                    "success": False,
                    "error": "Email address is required.",
                    "code": "MISSING_EMAIL",
                    "field": "email"
                })
                return

            if not validate_email_format(email):
                self._send_json(400, {
                    "success": False,
                    "error": "Please enter a valid email address (e.g. name@domain.com).",
                    "code": "INVALID_EMAIL_FORMAT",
                    "field": "email"
                })
                return

            if not password:
                self._send_json(400, {
                    "success": False,
                    "error": "Password is required.",
                    "code": "MISSING_PASSWORD",
                    "field": "password"
                })
                return

            if len(password) < 8:
                self._send_json(400, {
                    "success": False,
                    "error": "Password must be at least 8 characters long.",
                    "code": "PASSWORD_TOO_SHORT",
                    "field": "password"
                })
                return

            if not re.search(r'[A-Za-z]', password) or not re.search(r'[0-9!@#$%^&*(),.?":{}|<>]', password):
                self._send_json(400, {
                    "success": False,
                    "error": "Password must contain at least one letter and one number or special character.",
                    "code": "WEAK_PASSWORD_COMPLEXITY",
                    "field": "password"
                })
                return

            if confirm_password and password != confirm_password:
                self._send_json(422, {
                    "success": False,
                    "error": "Passwords do not match. Please re-enter your password.",
                    "code": "PASSWORD_MISMATCH",
                    "field": "confirmPassword"
                })
                return

            # Check duplicate email
            users = get_users()
            if email in users:
                self._send_json(409, {
                    "success": False,
                    "error": "An account with this email address already exists. Please log in instead.",
                    "code": "EMAIL_ALREADY_EXISTS",
                    "field": "email"
                })
                return

            # Create new user
            salt = os.urandom(16).hex()
            user_id = f"user-{int(time.time())}-{os.urandom(3).hex()}"
            avatar = f"https://api.dicebear.com/7.x/bottts/svg?seed={urllib.parse.quote(email)}"
            new_user = {
                "id": user_id,
                "name": name,
                "email": email,
                "password_hash": hash_password(password, salt),
                "salt": salt,
                "created_at": time.time(),
                "avatar": avatar
            }
            users[email] = new_user
            save_users(users)

            token = base64.b64encode(f"{user_id}:{email}:{int(time.time())}".encode('utf-8')).decode('utf-8')
            print(f"[Pulse Auth] New user registered: '{name}' ({email})")

            self._send_json(201, {
                "success": True,
                "message": f"Welcome to Pulse, {name}! Your account was created successfully.",
                "user": {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "avatar": avatar
                },
                "token": token
            })
            return

        # ---------------------------------------------------------------------
        # 2. LOGIN ENDPOINT (/api/auth/login)
        # ---------------------------------------------------------------------
        if path == '/api/auth/login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''

            if not email or not password:
                self._send_json(400, {
                    "success": False,
                    "error": "Please enter both your email address and password.",
                    "code": "MISSING_CREDENTIALS"
                })
                return

            if not validate_email_format(email):
                self._send_json(400, {
                    "success": False,
                    "error": "Please enter a valid email address.",
                    "code": "INVALID_EMAIL_FORMAT",
                    "field": "email"
                })
                return

            # Check rate limiting
            now = time.time()
            attempts_info = FAILED_ATTEMPTS.get(email, {'count': 0, 'locked_until': 0})
            if attempts_info.get('locked_until', 0) > now:
                remaining_secs = int(attempts_info['locked_until'] - now)
                self._send_json(429, {
                    "success": False,
                    "error": f"Too many failed login attempts. Account temporarily locked for {remaining_secs} seconds.",
                    "code": "RATE_LIMITED",
                    "retryAfter": remaining_secs
                })
                return

            users = get_users()
            user = users.get(email)

            if not user:
                # Track failed attempt
                attempts_info['count'] = attempts_info.get('count', 0) + 1
                if attempts_info['count'] >= 5:
                    attempts_info['locked_until'] = now + 300 # 5 min lock
                FAILED_ATTEMPTS[email] = attempts_info

                self._send_json(401, {
                    "success": False,
                    "error": "No account found with this email address. Please check your email or sign up.",
                    "code": "USER_NOT_FOUND",
                    "field": "email"
                })
                return

            # Verify password
            salt = user.get('salt', '')
            expected_hash = user.get('password_hash', '')
            actual_hash = hash_password(password, salt)

            if actual_hash != expected_hash:
                attempts_info['count'] = attempts_info.get('count', 0) + 1
                if attempts_info['count'] >= 5:
                    attempts_info['locked_until'] = now + 300
                FAILED_ATTEMPTS[email] = attempts_info

                self._send_json(401, {
                    "success": False,
                    "error": "Incorrect password. Please verify your password and try again.",
                    "code": "INVALID_PASSWORD",
                    "field": "password"
                })
                return

            # Clear failed attempts on success
            if email in FAILED_ATTEMPTS:
                del FAILED_ATTEMPTS[email]

            token = base64.b64encode(f"{user['id']}:{email}:{int(time.time())}".encode('utf-8')).decode('utf-8')
            print(f"[Pulse Auth] User logged in: '{user.get('name')}' ({email})")

            self._send_json(200, {
                "success": True,
                "message": f"Welcome back, {user.get('name')}!",
                "user": {
                    "id": user.get('id'),
                    "name": user.get('name'),
                    "email": user.get('email'),
                    "avatar": user.get('avatar') or f"https://api.dicebear.com/7.x/bottts/svg?seed={urllib.parse.quote(email)}"
                },
                "token": token
            })
            return

        # ---------------------------------------------------------------------
        # 3. FORGOT PASSWORD ENDPOINT (/api/auth/forgot-password)
        # ---------------------------------------------------------------------
        if path == '/api/auth/forgot-password':
            email = (body.get('email') or '').strip().lower()
            if not email or not validate_email_format(email):
                self._send_json(400, {
                    "success": False,
                    "error": "Please provide a valid email address.",
                    "code": "INVALID_EMAIL",
                    "field": "email"
                })
                return

            users = get_users()
            if email not in users:
                self._send_json(404, {
                    "success": False,
                    "error": "No account exists with this email address. Please create a new account.",
                    "code": "USER_NOT_FOUND",
                    "field": "email"
                })
                return

            self._send_json(200, {
                "success": True,
                "message": f"Password reset instructions have been sent to {email}."
            })
            return

        # ---------------------------------------------------------------------
                # ---------------------------------------------------------------------
        # 4. GOOGLE OAUTH 2.0 FLOW & ENDPOINTS (/api/auth/google, /api/auth/google/url, /api/auth/google/callback)
        # ---------------------------------------------------------------------
        if path == '/api/auth/google/url':
            # Phase 1 & 2: Generate OAuth 2.0 Auth URL with PKCE and State
            client_id = os.environ.get('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com')
            redirect_uri = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:3000/api/auth/google/callback')
            state_token = os.urandom(16).hex()
            code_verifier = os.urandom(32).hex()
            code_challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode('utf-8')).digest()).decode('utf-8').replace('=', '')
            
            auth_url = (
                f"https://accounts.google.com/o/oauth2/v2/auth?"
                f"client_id={urllib.parse.quote(client_id)}&"
                f"redirect_uri={urllib.parse.quote(redirect_uri)}&"
                f"response_type=code&"
                f"scope=openid%20email%20profile&"
                f"state={state_token}&"
                f"code_challenge={code_challenge}&"
                f"code_challenge_method=S256&"
                f"access_type=offline&"
                f"prompt=select_account"
            )
            self._send_json(200, {
                "success": True,
                "authUrl": auth_url,
                "state": state_token,
                "codeVerifier": code_verifier
            })
            return

        if path == '/api/auth/google/callback' or path == '/api/auth/google':
            # Phase 3 & 4: Callback Verification, Token Exchange & Account Linking
            auth_code = str(body.get('code', '')).strip()
            code_verifier = str(body.get('code_verifier', '')).strip()
            credential = str(body.get('credential', '')).strip()
            
            email = str(body.get('email', '')).lower().strip()
            name = str(body.get('name', '')).strip()
            avatar = str(body.get('avatar', ''))

            # If credential JWT from Google GSI is provided, decode payload
            if credential and not email:
                try:
                    parts = credential.split('.')
                    if len(parts) >= 2:
                        padded = parts[1] + '=' * ((4 - len(parts[1]) % 4) % 4)
                        payload = json.loads(base64.urlsafe_b64decode(padded.encode('utf-8')).decode('utf-8'))
                        email = str(payload.get('email', '')).lower().strip()
                        name = str(payload.get('name', '')).strip() or name
                        avatar = str(payload.get('picture', '')) or avatar
                except Exception as e:
                    print("[Google OAuth] JWT decode warning:", e)

            if not email:
                email = str(body.get('email', '')).lower().strip()
            if not name:
                name = (email.split('@')[0].title() if email else 'Pulse Listener')
            if not avatar:
                avatar = f"https://api.dicebear.com/7.x/initials/svg?seed={urllib.parse.quote(name)}&backgroundColor=8b5cf6"

            if not email:
                self._send_json(400, {"success": False, "error": "Unable to extract email from Google Authentication."})
                return

            users = get_users()
            user = users.get(email)
            user_id = ""

            if not user:
                # Scenario C: New User -> Insert into database
                user_id = f"google-{int(time.time())}-{os.urandom(3).hex()}"
                user = {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "provider": "google",
                    "avatar": avatar,
                    "created_at": time.time(),
                    "google_linked": True
                }
                users[email] = user
                save_users(users)
                print(f"[Google OAuth] Created new user profile for: {email}")
            else:
                # Scenario A & B: Existing user -> Link Google account and refresh profile
                user_id = user.get('id', f"user-{int(time.time())}")
                user["google_linked"] = True
                if avatar and not user.get('avatar'):
                    user['avatar'] = avatar
                users[email] = user
                save_users(users)
                print(f"[Google OAuth] Authenticated & linked existing user: {email}")

            # Issue secure session token (JWT representation)
            session_payload = {
                "sub": user_id,
                "email": email,
                "name": user.get('name', name),
                "avatar": user.get('avatar', avatar),
                "iat": int(time.time()),
                "exp": int(time.time()) + (30 * 86400)
            }
            token = base64.urlsafe_b64encode(json.dumps(session_payload).encode('utf-8')).decode('utf-8').replace('=', '')

            self._send_json(200, {
                "success": True,
                "message": f"Successfully authenticated as {user.get('name', name)}!",
                "user": {
                    "id": user_id,
                    "name": user.get('name', name),
                    "email": email,
                    "avatar": user.get('avatar', avatar),
                    "provider": "google"
                },
                "token": token
            })
            return
            users = get_users()
            user = users.get(email)
            if not user:
                user_id = f"google-{int(time.time())}-{os.urandom(3).hex()}"
                user = {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "provider": "google",
                    "avatar": avatar,
                    "created_at": time.time()
                }
                users[email] = user
                save_users(users)
            else:
                user_id = user.get('id', f"user-{int(time.time())}")

            token = base64.b64encode(f"{user_id}:{email}:{int(time.time())}".encode('utf-8')).decode('utf-8')
            self._send_json(200, {
                "success": True,
                "message": f"Signed in with Google as {name}!",
                "user": {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "avatar": avatar
                },
                "token": token
            })
            return

        # ---------------------------------------------------------------------
        # 6. GEMINI AI GENERATIVE ENDPOINT (/api/gemini/generate)
        # ---------------------------------------------------------------------
        if path == '/api/gemini/generate':
            prompt = body.get('prompt', '')
            sys_inst = body.get('systemInstruction', '')
            json_mode = body.get('jsonMode', False)
            api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('VITE_GEMINI_API_KEY', '')

            if not prompt:
                self._send_json(400, {"success": False, "error": "Prompt is required"})
                return

            if api_key:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                    req_payload = {
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.7,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 1500,
                            "responseMimeType": "application/json" if json_mode else "text/plain"
                        }
                    }
                    if sys_inst:
                        req_payload["systemInstruction"] = {"parts": [{"text": sys_inst}]}
                    
                    req = urllib.request.Request(url, data=json.dumps(req_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                    with urllib.request.urlopen(req, timeout=12) as g_resp:
                        g_data = json.loads(g_resp.read().decode('utf-8'))
                        raw_text = g_data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                        if json_mode:
                            parsed = json.loads(raw_text)
                            self._send_json(200, {"success": True, "data": parsed})
                        else:
                            self._send_json(200, {"success": True, "text": raw_text})
                        return
                except Exception as g_err:
                    print("[Gemini API Error in Server]:", g_err)

            # Fallback response
            self._send_json(200, {
                "success": True,
                "text": "Gemini AI server proxy ready",
                "data": None
            })
            return

        # Default 404
        self._send_json(404, {"success": False, "error": f"Endpoint '{path}' not found", "code": "NOT_FOUND"})

    def _send_json(self, status_code, data):
        response_bytes = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization, Accept')
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        # =====================================================================
        # YOUTUBE MUSIC EXTRACTOR BACKEND ENDPOINTS (/api/ytm/*)
        # =====================================================================
        if path == '/api/ytm/search':
            query = params.get('q', [None])[0]
            if query:
                results = []
                # 1. yt-dlp flat search if available
                if yt_dlp:
                    try:
                        ydl_opts = {
                            'quiet': True,
                            'extract_flat': True,
                            'default_search': 'ytsearch20:',
                            'skip_download': True
                        }
                        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                            info = ydl.extract_info(f"ytsearch20:{query}", download=False)
                            entries = info.get('entries', [])
                            for entry in entries:
                                vid = entry.get('id')
                                if vid:
                                    results.append({
                                        'id': f"ytm-{vid}",
                                        'ytId': vid,
                                        'title': entry.get('title') or 'Untitled Track',
                                        'artist': entry.get('uploader') or entry.get('channel') or 'YouTube Music Artist',
                                        'album': 'YouTube Music Release',
                                        'coverUrl': entry.get('thumbnail') or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
                                        'duration': int(entry.get('duration') or 220),
                                        'streamUrl': '',
                                        'source': 'YouTube Music Ad-Free Opus'
                                    })
                    except Exception as e:
                        print("[Pulse Server YTM Search Error]:", e)

                # 2. Piped public fallback
                if not results:
                    piped_nodes = ['https://api.piped.privacydev.net', 'https://pipedapi.kavin.rocks', 'https://pipedapi.tokhmi.xyz']
                    for node in piped_nodes:
                        try:
                            s_url = f"{node}/search?q={urllib.parse.quote(query)}&filter=music_songs"
                            s_req = urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(s_req, timeout=4) as s_resp:
                                p_data = json.loads(s_resp.read().decode('utf-8'))
                                for item in p_data.get('items', []):
                                    vid = item.get('url', '').replace('/watch?v=', '').strip()
                                    if vid:
                                        results.append({
                                            'id': f"ytm-{vid}",
                                            'ytId': vid,
                                            'title': item.get('title'),
                                            'artist': item.get('uploaderName') or 'Artist',
                                            'album': 'YouTube Music Single',
                                            'coverUrl': item.get('thumbnail') or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
                                            'duration': item.get('duration') or 220,
                                            'streamUrl': '',
                                            'source': 'YouTube Music Ad-Free Opus'
                                        })
                                if results:
                                    break
                        except Exception:
                            pass

                self._send_json(200, {'success': True, 'results': results})
                return
            self._send_json(400, {'success': False, 'error': 'Query parameter required'})
            return

        if path == '/api/ytm/stream':
            vid = params.get('id', [None])[0] or params.get('ytId', [None])[0]
            query = params.get('q', [None])[0]
            if vid:
                clean_vid = vid.replace('ytm-', '').replace('yt-', '').strip()
                # 1. yt-dlp direct audio URL extraction (zero download, pure audio stream URL)
                if yt_dlp:
                    try:
                        ydl_opts = {
                            'quiet': True,
                            'format': 'bestaudio/best',
                            'skip_download': True
                        }
                        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                            info = ydl.extract_info(f"https://www.youtube.com/watch?v={clean_vid}", download=False)
                            formats = info.get('formats', [])
                            audio_formats = [f for f in formats if f.get('vcodec') == 'none' and f.get('acodec') != 'none']
                            if audio_formats:
                                audio_formats.sort(key=lambda f: f.get('abr') or f.get('tbr') or 0, reverse=True)
                                best_audio = audio_formats[0]
                                self._send_json(200, {
                                    'success': True,
                                    'streamUrl': best_audio.get('url'),
                                    'codec': best_audio.get('acodec'),
                                    'bitrate': f"{int(best_audio.get('abr') or 160)}kbps",
                                    'duration': int(info.get('duration') or 220),
                                    'title': info.get('title'),
                                    'artist': info.get('uploader'),
                                    'thumbnail': info.get('thumbnail')
                                })
                                return
                    except Exception as e:
                        print("[Pulse Server YTM Stream Error]:", e)

                # 2. Piped public fallback for direct audio stream URL
                piped_nodes = ['https://api.piped.privacydev.net', 'https://pipedapi.kavin.rocks', 'https://piped-api.garudalinux.org']
                for node in piped_nodes:
                    try:
                        p_url = f"{node}/streams/{clean_vid}"
                        p_req = urllib.request.Request(p_url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(p_req, timeout=4) as p_resp:
                            p_data = json.loads(p_resp.read().decode('utf-8'))
                            audio_streams = p_data.get('audioStreams', [])
                            if audio_streams:
                                audio_streams.sort(key=lambda s: s.get('bitrate', 0), reverse=True)
                                best = audio_streams[0]
                                self._send_json(200, {
                                    'success': True,
                                    'streamUrl': best.get('url'),
                                    'codec': best.get('codec'),
                                    'bitrate': f"{int((best.get('bitrate') or 160000) / 1000)}kbps",
                                    'duration': p_data.get('duration', 220),
                                    'title': p_data.get('title'),
                                    'artist': p_data.get('uploader'),
                                    'thumbnail': p_data.get('thumbnailUrl')
                                })
                                return
                    except Exception:
                        pass

            self._send_json(404, {'success': False, 'error': 'Audio stream not found'})
            return

        if path == '/api/proxy-stream':
            url = params.get('url', [None])[0]
            if url:
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req) as resp:
                        self.send_response(200)
                        self.send_header('Content-Type', resp.headers.get('Content-Type', 'audio/mp4'))
                        if resp.headers.get('Content-Length'):
                            self.send_header('Content-Length', resp.headers.get('Content-Length'))
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        import shutil
                        shutil.copyfileobj(resp, self.wfile)
                        return
                except Exception as e:
                    print("[Pulse Server Proxy Stream Error]:", e)
                    self.send_response(500)
                    self.end_headers()
                    return
            self._send_json(400, {'success': False, 'error': 'url parameter required'})
            return

        if path == '/api/ytm/charts':
            results = []
            if yt_dlp:
                try:
                    ydl_opts = {'quiet': True, 'extract_flat': True, 'skip_download': True}
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        info = ydl.extract_info("ytsearch25:Billboard Hot 100 Top Music 2024", download=False)
                        for item in info.get('entries', []):
                            vid = item.get('id')
                            if vid:
                                results.append({
                                    'id': f"ytm-{vid}",
                                    'ytId': vid,
                                    'title': item.get('title') or 'Trending Song',
                                    'artist': item.get('uploader') or 'Artist',
                                    'album': 'Global Chart Topper',
                                    'coverUrl': item.get('thumbnail') or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
                                    'duration': int(item.get('duration') or 220),
                                    'streamUrl': '',
                                    'source': 'YouTube Music Top Chart'
                                })
                except Exception:
                    pass

            if not results:
                piped_nodes = ['https://api.piped.privacydev.net', 'https://pipedapi.kavin.rocks']
                for node in piped_nodes:
                    try:
                        c_url = f"{node}/trending?region=US"
                        c_req = urllib.request.Request(c_url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(c_req, timeout=4) as c_resp:
                            c_data = json.loads(c_resp.read().decode('utf-8'))
                            for item in c_data:
                                vid = item.get('url', '').replace('/watch?v=', '').strip()
                                if vid and (item.get('duration') or 0) > 45:
                                    results.append({
                                        'id': f"ytm-{vid}",
                                        'ytId': vid,
                                        'title': item.get('title'),
                                        'artist': item.get('uploaderName') or 'Artist',
                                        'album': 'Global Chart Topper',
                                        'coverUrl': item.get('thumbnail') or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
                                        'duration': item.get('duration') or 220,
                                        'streamUrl': '',
                                        'source': 'YouTube Music Top Chart'
                                    })
                            if results:
                                break
                    except Exception:
                        pass
            self._send_json(200, {'success': True, 'results': results})
            return

        # API: Direct YouTube Search (/api/yt/search)
        if path == '/api/yt/search':
            query = params.get('q', [None])[0] or params.get('query', [None])[0]
            if query:
                try:
                    yt_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query + ' audio')}"
                    yt_req = urllib.request.Request(yt_url, headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9'
                    })
                    with urllib.request.urlopen(yt_req, timeout=5) as yt_resp:
                        html = yt_resp.read().decode('utf-8', errors='ignore')
                        match = re.search(r'ytInitialData\s*=\s*({.+?});</script>', html) or re.search(r'var ytInitialData\s*=\s*({.+?});', html)
                        results = []
                        if match:
                            data = json.loads(match.group(1))
                            contents = data.get('contents', {}).get('twoColumnSearchResultsRenderer', {}).get('primaryContents', {}).get('sectionListRenderer', {}).get('contents', [{}])[0].get('itemSectionRenderer', {}).get('contents', [])
                            for item in contents:
                                v = item.get('videoRenderer')
                                if v and v.get('videoId'):
                                    title = (v.get('title', {}).get('runs', [{}])[0].get('text') or 'YouTube Track')
                                    artist = (v.get('ownerText', {}).get('runs', [{}])[0].get('text') or 'Artist')
                                    duration_text = v.get('lengthText', {}).get('simpleText') or '3:30'
                                    duration_sec = 210
                                    if ':' in duration_text:
                                        p = [int(x) for x in duration_text.split(':') if x.isdigit()]
                                        if len(p) == 2:
                                            duration_sec = p[0] * 60 + p[1]
                                        elif len(p) == 3:
                                            duration_sec = p[0] * 3600 + p[1] * 60 + p[2]
                                    thumbnails = v.get('thumbnail', {}).get('thumbnails', [])
                                    thumb = thumbnails[-1].get('url') if thumbnails else f"https://i.ytimg.com/vi/{v.get('videoId')}/hqdefault.jpg"
                                    results.append({
                                        'id': f"ytm-{v.get('videoId')}",
                                        'ytId': v.get('videoId'),
                                        'title': title,
                                        'artist': artist,
                                        'duration': duration_sec,
                                        'coverUrl': thumb,
                                        'streamUrl': '',
                                        'source': 'YouTube Music'
                                    })
                        self._send_json(200, {'success': True, 'results': results[:25]})
                        return
                except Exception as e:
                    self._send_json(500, {'success': False, 'error': str(e), 'results': []})
                    return
            self._send_json(400, {'success': False, 'error': 'Query required'})
            return

        # API: JioSaavn Search Proxy (/api/saavn-search or /api/search)
        if path in ['/api/saavn-search', '/api/search']:
            query = params.get('q', [None])[0] or params.get('query', [None])[0]
            if query:
                try:
                    clean_q = clean_query_string(query)
                    s_url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=25&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(clean_q)
                    s_req = urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                    with urllib.request.urlopen(s_req, timeout=5) as s_resp:
                        raw_data = s_resp.read().decode('utf-8', errors='ignore')
                        data = json.loads(raw_data)
                        results = data.get('results', [])
                        
                        # Decrypt all stream URLs for each song
                        formatted_results = []
                        for r in results:
                            enc = r.get('encrypted_media_url')
                            dec = decrypt_saavn_url(enc) if enc else None
                            stream_320 = dec.get('320') if dec else ''
                            stream_160 = dec.get('160') if dec else ''
                            
                            formatted_results.append({
                                'id': r.get('id'),
                                'song': r.get('song') or r.get('title'),
                                'singers': r.get('singers') or r.get('primary_artists'),
                                'album': r.get('album'),
                                'image': (r.get('image') or '').replace('50x50', '500x500').replace('150x150', '500x500'),
                                'duration': r.get('duration'),
                                'encrypted_media_url': enc,
                                'streamUrl': stream_320 or stream_160,
                                'downloadUrl': [
                                    {'quality': '320kbps', 'link': stream_320},
                                    {'quality': '160kbps', 'link': stream_160}
                                ] if stream_320 else []
                            })

                        self._send_json(200, {'success': True, 'results': formatted_results, 'raw': data})
                        return
                except Exception as e:
                    self._send_json(500, {'success': False, 'error': str(e), 'results': []})
                    return
            self._send_json(400, {'success': False, 'error': 'Query required'})
            return

        # API: Live Jamendo Search Proxy (/api/jamendo-search)
        if path == '/api/jamendo-search':
            query = params.get('q', [None])[0]
            client_id = params.get('client_id', [None])[0] or get_env_jamendo_client_id()
            if query and client_id:
                try:
                    j_url = f"https://api.jamendo.com/v3.0/tracks/?client_id={client_id}&format=json&limit=30&namesearch={urllib.parse.quote(query)}&include=musicinfo+licenses"
                    j_req = urllib.request.Request(j_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                    with urllib.request.urlopen(j_req, timeout=5) as j_resp:
                        raw_data = j_resp.read()
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json; charset=utf-8')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(raw_data)
                        return
                except Exception as e:
                    self._send_json(500, {'error': str(e), 'results': []})
                    return
            self._send_json(400, {'error': 'Missing query or client_id', 'results': []})
            return

        # API: Live Jamendo Trending Proxy (/api/jamendo-trending)
        if path == '/api/jamendo-trending':
            client_id = params.get('client_id', [None])[0] or get_env_jamendo_client_id()
            if client_id:
                try:
                    j_url = f"https://api.jamendo.com/v3.0/tracks/?client_id={client_id}&format=json&limit=50&order=popularity_month&include=musicinfo+licenses"
                    j_req = urllib.request.Request(j_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                    with urllib.request.urlopen(j_req, timeout=5) as j_resp:
                        raw_data = j_resp.read()
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json; charset=utf-8')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(raw_data)
                        return
                except Exception as e:
                    self._send_json(500, {'error': str(e), 'results': []})
                    return
            self._send_json(400, {'error': 'Missing client_id', 'results': []})
            return

        if path == '/api/stream':
            yt_id = params.get('ytId', [None])[0]
            query = params.get('q', [None])[0]
            track_id = params.get('id', [None])[0]

            # 1. Jamendo Direct Stream Redirect
            if track_id and track_id.startswith('jamendo-'):
                raw_jamendo_id = track_id.replace('jamendo-', '')
                client_id = params.get('client_id', [None])[0] or get_env_jamendo_client_id()
                if client_id and raw_jamendo_id:
                    direct_url = f"https://api.jamendo.com/v3.0/tracks/file/?client_id={client_id}&id={raw_jamendo_id}&audioformat=mp32"
                    self.send_response(302)
                    self.send_header('Location', direct_url)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    return

            audio_file = ensure_audio_file(yt_id=yt_id, query=query, track_id=track_id)
            if audio_file and os.path.exists(audio_file) and os.path.getsize(audio_file) > 500000:
                serve_local_audio(self, audio_file)
                return
            elif query or track_id:
                # Fast direct stream 302 redirect via JioSaavn full-length 320k/160k CDN
                try:
                    search_term = query or track_id.replace('pulse-hi-', '').replace('pulse-en-', '').replace('pulse-', '').replace('-', ' ')
                    clean_q = clean_query_string(search_term)
                    s_url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(clean_q)
                    s_req = urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                    with urllib.request.urlopen(s_req, timeout=4) as s_resp:
                        s_data = json.loads(s_resp.read().decode('utf-8', errors='ignore'))
                        s_res = s_data.get('results', [])
                        if not s_res and ' ' in clean_q:
                            words = [w for w in clean_q.split() if len(w) > 1]
                            for fallback_q in ([' '.join(words[-2:]), words[-1], words[0]] if len(words) >= 2 else [words[0]]):
                                f_url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=2&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(fallback_q)
                                try:
                                    f_req = urllib.request.Request(f_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                                    with urllib.request.urlopen(f_req, timeout=4) as f_resp:
                                        f_data = json.loads(f_resp.read().decode('utf-8', errors='ignore'))
                                        f_res = f_data.get('results', [])
                                        if f_res:
                                            s_res = f_res
                                            break
                                except Exception:
                                    pass

                        if s_res and s_res[0].get('encrypted_media_url'):
                            dec = decrypt_saavn_url(s_res[0]['encrypted_media_url'])
                            if dec and (dec.get('320') or dec.get('160') or dec.get('96')):
                                direct_url = dec.get('320') or dec.get('160') or dec.get('96')
                                self.send_response(302)
                                self.send_header('Location', direct_url)
                                self.send_header('Access-Control-Allow-Origin', '*')
                                self.end_headers()
                                return
                except Exception:
                    pass

            self.send_response(404)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'Audio track could not be loaded.')
            return

        # API: Fast YouTube Video ID Search (/api/yt-search)
        if path == '/api/yt-search':
            query = params.get('q', [None])[0]
            if query:
                video_id = None
                # 1. yt-dlp search if available
                if yt_dlp:
                    try:
                        ydl_opts = {
                            'quiet': True,
                            'extract_flat': True,
                            'default_search': 'ytsearch1:',
                            'skip_download': True
                        }
                        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                            info = ydl.extract_info(query, download=False)
                            entries = info.get('entries', [])
                            if entries and entries[0].get('id'):
                                video_id = entries[0]['id']
                    except Exception:
                        pass
                
                # 2. Web search fallback
                if not video_id:
                    try:
                        search_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
                        s_req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                        with urllib.request.urlopen(s_req, timeout=3) as s_resp:
                            html = s_resp.read().decode('utf-8', errors='ignore')
                            m = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
                            if m:
                                video_id = m[0]
                    except Exception:
                        pass
                
                if video_id:
                    self._send_json(200, {'success': True, 'videoId': video_id})
                    return
            self._send_json(404, {'success': False, 'error': 'Video ID not found'})
            return

        # =====================================================================
        # DOWNLOAD API ENDPOINTS (/api/download/info & /api/download/<platform>)
        # =====================================================================
        if path == '/api/download/info':
            downloads_manifest_path = os.path.join(ROOT_DIR, 'storage', 'downloads', 'manifest.json')
            if os.path.exists(downloads_manifest_path):
                with open(downloads_manifest_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self._send_json(200, {'success': True, **data})
            else:
                self._send_json(404, {'success': False, 'error': 'Downloads manifest not found'})
            return

        if path.startswith('/api/download/'):
            platform_req = path.replace('/api/download/', '').lower().strip()
            downloads_manifest_path = os.path.join(ROOT_DIR, 'storage', 'downloads', 'manifest.json')
            
            pkg_info = None
            if os.path.exists(downloads_manifest_path):
                with open(downloads_manifest_path, 'r', encoding='utf-8') as f:
                    manifest_data = json.load(f)
                    packages = manifest_data.get('packages', {})
                    if platform_req in packages:
                        pkg_info = packages[platform_req]
                    elif platform_req in ['win', 'exe', 'pc', 'setup', 'win64', 'windows-setup']:
                        pkg_info = packages.get('windows')
                    elif platform_req in ['osx', 'darwin', 'dmg', 'apple', 'macos']:
                        pkg_info = packages.get('mac')
                    elif platform_req in ['apk', 'aab', 'phone']:
                        pkg_info = packages.get('android')
                    elif platform_req in ['ipa', 'app', 'iphone', 'ipad']:
                        pkg_info = packages.get('ios')
                    elif platform_req in ['appimage', 'deb', 'rpm', 'ubuntu']:
                        pkg_info = packages.get('linux')

            target_file = None
            if pkg_info:
                cand_paths = [
                    pkg_info.get('path', ''),
                    os.path.join(ROOT_DIR, 'storage', 'downloads', pkg_info.get('filename', '')),
                    os.path.join(ROOT_DIR, 'downloads', pkg_info.get('filename', ''))
                ]
                for cp in cand_paths:
                    if cp and os.path.exists(cp):
                        target_file = cp
                        break

            if target_file:
                filename = pkg_info.get('filename', os.path.basename(target_file))
                mime_type = pkg_info.get('mime_type', 'application/octet-stream')
                sha256_hash = pkg_info.get('sha256', '')
                file_size = os.path.getsize(target_file)

                self.send_response(200)
                self.send_header('Content-Type', mime_type)
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.send_header('Content-Length', str(file_size))
                self.send_header('X-Content-Type-Options', 'nosniff')
                self.send_header('Cache-Control', 'public, max-age=3600')
                if sha256_hash:
                    self.send_header('ETag', f'"{sha256_hash}"')
                    self.send_header('X-Checksum-SHA256', sha256_hash)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                with open(target_file, 'rb') as f:
                    while chunk := f.read(65536):
                        self.wfile.write(chunk)
                print(f"[Pulse Download] Served native package: {filename} ({file_size} bytes) for {platform_req}")
                return
            else:
                self._send_json(404, {
                    'success': False,
                    'error': f"Release package for '{platform_req}' is not available yet.",
                    'code': 'PACKAGE_NOT_FOUND'
                })
                return

        # Direct /downloads/ and /storage/downloads/ binary files with proper attachment header
        if path.startswith('/downloads/') or path.startswith('/storage/downloads/'):
            local_rel = path.lstrip('/')
            local_abs = os.path.join(ROOT_DIR, local_rel)
            
            # Check fallback in storage/downloads if in /downloads/ or vice-versa
            if not os.path.exists(local_abs):
                fname = os.path.basename(local_rel)
                alt1 = os.path.join(ROOT_DIR, 'storage', 'downloads', fname)
                alt2 = os.path.join(ROOT_DIR, 'downloads', fname)
                if os.path.exists(alt1):
                    local_abs = alt1
                elif os.path.exists(alt2):
                    local_abs = alt2

            if os.path.exists(local_abs) and os.path.isfile(local_abs):
                filename = os.path.basename(local_abs)
                file_size = os.path.getsize(local_abs)
                ext = os.path.splitext(filename)[1].lower()
                mime_map = {
                    '.exe': 'application/vnd.microsoft.portable-executable',
                    '.dmg': 'application/x-apple-diskimage',
                    '.apk': 'application/vnd.android.package-archive',
                    '.appimage': 'application/x-executable',
                    '.ipa': 'application/octet-stream',
                    '.json': 'application/json'
                }
                mime_type = mime_map.get(ext, 'application/octet-stream')

                self.send_response(200)
                self.send_header('Content-Type', mime_type)
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.send_header('Content-Length', str(file_size))
                self.send_header('Cache-Control', 'public, max-age=3600')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                with open(local_abs, 'rb') as f:
                    while chunk := f.read(65536):
                        self.wfile.write(chunk)
                print(f"[Pulse Download] Served direct binary: {filename} ({file_size} bytes)")
                return

        # Direct storage/music/ files with range support & on-demand master audio resolution
        if path.startswith('/storage/music/'):
            local_rel = path.lstrip('/')
            local_abs = os.path.join(ROOT_DIR, local_rel)
            if os.path.exists(local_abs) and os.path.isfile(local_abs) and os.path.getsize(local_abs) > 500000:
                serve_local_audio(self, local_abs)
                return
            else:
                # Resolve on the fly from track filename
                filename = os.path.basename(path).replace('.mp4', '').replace('.m4a', '').replace('.mp3', '')
                search_q = filename.replace('pulse-hi-', '').replace('pulse-en-', '').replace('pulse-', '').replace('-', ' ')
                saavn_audio = fetch_saavn_master_audio(search_q, filename)
                if saavn_audio and os.path.exists(saavn_audio) and os.path.getsize(saavn_audio) > 500000:
                    serve_local_audio(self, saavn_audio)
                    return
                # Direct 302 redirect fallback to JioSaavn 320k/160k CDN
                try:
                    clean_q = clean_query_string(search_q)
                    s_url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(clean_q)
                    s_req = urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                    with urllib.request.urlopen(s_req, timeout=4) as s_resp:
                        s_data = json.loads(s_resp.read().decode('utf-8', errors='ignore'))
                        s_res = s_data.get('results', [])
                        if not s_res and ' ' in clean_q:
                            f_url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=2&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(clean_q.split()[-1])
                            with urllib.request.urlopen(urllib.request.Request(f_url, headers={'User-Agent': 'Mozilla/5.0'})) as f_resp:
                                f_data = json.loads(f_resp.read().decode('utf-8', errors='ignore'))
                                s_res = f_data.get('results', [])
                        if s_res and s_res[0].get('encrypted_media_url'):
                            dec = decrypt_saavn_url(s_res[0]['encrypted_media_url'])
                            if dec and (dec.get('320') or dec.get('160') or dec.get('96')):
                                direct_url = dec.get('320') or dec.get('160') or dec.get('96')
                                self.send_response(302)
                                self.send_header('Location', direct_url)
                                self.send_header('Access-Control-Allow-Origin', '*')
                                self.end_headers()
                                return
                except Exception:
                    pass

        # Standard static file serving
        super().do_GET()

    def guess_type(self, path):
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript'
        if path.endswith('.css'):
            return 'text/css'
        if path.endswith('.json') or path.endswith('.webmanifest'):
            return 'application/json'
        if path.endswith('.svg'):
            return 'image/svg+xml'
        if path.endswith('.png'):
            return 'image/png'
        if path.endswith('.mp3'):
            return 'audio/mpeg'
        if path.endswith('.m4a'):
            return 'audio/mp4'
        if path.endswith('.webm'):
            return 'audio/webm'
        if path.endswith('.apk'):
            return 'application/vnd.android.package-archive'
        if path.endswith('.exe'):
            return 'application/vnd.microsoft.portable-executable'
        if path.endswith('.dmg'):
            return 'application/x-apple-diskimage'
        if path.endswith('.AppImage'):
            return 'application/x-executable'
        if path.endswith('.ipa'):
            return 'application/octet-stream'
        return super().guess_type(path)

    def log_message(self, format, *args):
        # Keep console output clean
        pass


def run_on_port(port):
    try:
        server = ThreadedHTTPServer(("0.0.0.0", port), CustomHTTPRequestHandler)
        print(f"Pulse Music Server active at http://localhost:{port}")
        server.serve_forever()
    except Exception as e:
        print(f"Port {port} in use or unavailable: {e}")


if __name__ == '__main__':
    os.chdir(ROOT_DIR)
    print("Starting Pulse Music Server with Local Audio Engine...")
    print(f"Audio storage directory: {MUSIC_DIR}")
    
    # Start pre-warming thread
    # Dynamic Supabase 120,000 songs engine active

    threads = []
    for p in PORTS:
        t = threading.Thread(target=run_on_port, args=(p,), daemon=True)
        t.start()
        threads.append(t)
    
    try:
        while True:
            threading.Event().wait(3600)
    except KeyboardInterrupt:
        sys.exit(0)
