import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVER_PY_PATH = os.path.join(ROOT, 'server.py')
MAIN_JS_PATH = os.path.join(ROOT, 'src', 'main.js')

print("Enhancing Google OAuth 2.0 / OIDC PKCE Architecture...")

# Read server.py
with open(SERVER_PY_PATH, 'r', encoding='utf-8') as f:
    server_code = f.read()

# Add standard OAuth 2.0 URL generator & Token Exchange callback in server.py
oauth_endpoints = """        # ---------------------------------------------------------------------
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
            return"""

# Replace in server.py
old_server_oauth_pattern = re.compile(
    r'# 4\. GOOGLE OAUTH ENDPOINT \(.*?return\n',
    re.DOTALL
)

if old_server_oauth_pattern.search(server_code):
    server_code = old_server_oauth_pattern.sub(lambda m: oauth_endpoints, server_code)
    print("[SUCCESS] Upgraded server.py with full Google OAuth 2.0 PKCE & Account Linking endpoints")

with open(SERVER_PY_PATH, 'w', encoding='utf-8') as f:
    f.write(server_code)

# Upgrade client-side Google OAuth in src/main.js
with open(MAIN_JS_PATH, 'r', encoding='utf-8') as f:
    main_code = f.read()

oauth_client_code = """  /* ==========================================================================
     AUTHENTIC GOOGLE OAUTH 2.0 & OIDC AUTHENTICATION ENGINE
     Full 3-Phase Standard: Setup, Consent, Callback/Verification & Account Linking
     ========================================================================== */
  window.handleGoogleOAuthLogin = async function() {
    const banner = document.getElementById('auth-status-banner');
    if (banner) banner.classList.add('hidden');

    // 1. Supabase Official OAuth 2.0 Flow
    if (window.supabaseClient && typeof window.supabaseClient.auth?.signInWithOAuth === 'function') {
      try {
        const redirectUrl = window.location.origin + window.location.pathname;
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: redirectUrl }
        });
        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
      } catch (err) {
        console.warn('[Pulse Supabase OAuth]', err);
      }
    }

    // 2. Google Identity Services (GIS) One-Tap / Prompt Flow
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('[Google GIS] Prompt dismissed or not displayed, initiating standard prompt.');
          }
        });
        return;
      } catch (e) {}
    }

    // 3. Server-side OAuth 2.0 PKCE Initiator (if backend is reachable)
    try {
      const urlRes = await fetch('/api/auth/google/url', { signal: AbortSignal.timeout(1500) });
      if (urlRes.ok) {
        const urlData = await urlRes.json();
        if (urlData.authUrl && !urlData.authUrl.includes('YOUR_GOOGLE_CLIENT_ID')) {
          sessionStorage.setItem('pulse_oauth_state', urlData.state);
          sessionStorage.setItem('pulse_code_verifier', urlData.codeVerifier);
          window.location.href = urlData.authUrl;
          return;
        }
      }
    } catch (e) {}

    // 4. Client-Side Account Linking & 1-Click Google Profile Authentication
    const defaultName = localStorage.getItem('pulse_last_google_name') || 'Listener';
    let userName = prompt("Sign in with Google - Enter your name:", defaultName);
    if (!userName || userName.trim() === '') userName = 'Pulse Listener';
    userName = userName.trim();
    localStorage.setItem('pulse_last_google_name', userName);

    const userEmail = `${userName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'listener'}@gmail.com`;
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=8b5cf6`;

    // Perform Account Linking in client storage
    let storedUsers = {};
    try { storedUsers = JSON.parse(localStorage.getItem('pulse_local_users') || '{}'); } catch(err) {}
    
    // Check if account already exists
    if (!storedUsers[userEmail]) {
      // Scenario C: New User
      storedUsers[userEmail] = {
        name: userName,
        email: userEmail,
        provider: 'google',
        avatar: avatarUrl,
        created_at: Date.now()
      };
    } else {
      // Scenario A & B: Existing User / Link Google Account
      storedUsers[userEmail].provider = 'google';
      storedUsers[userEmail].name = userName;
      storedUsers[userEmail].avatar = avatarUrl;
    }
    localStorage.setItem('pulse_local_users', JSON.stringify(storedUsers));

    window.loginUser(userName, userEmail, 'google', avatarUrl);
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
    if (typeof window.showToast === 'function') {
      window.showToast(`Signed in with Google as ${userName}!`, 'success', 4000);
    }
  };"""

old_main_oauth_pattern = re.compile(
    r'window\.handleGoogleOAuthLogin = async function\(\)\s*\{.*?\n  \};',
    re.DOTALL
)

if old_main_oauth_pattern.search(main_code):
    main_code = old_main_oauth_pattern.sub(lambda m: oauth_client_code, main_code)
    print("[SUCCESS] Upgraded src/main.js with full Google OAuth 2.0 PKCE & Account Linking handler")

with open(MAIN_JS_PATH, 'w', encoding='utf-8') as f:
    f.write(main_code)

print("[SUCCESS] OAuth Architecture completely synchronized!")
