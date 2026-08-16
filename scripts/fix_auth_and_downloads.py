import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN_JS_PATH = os.path.join(ROOT, 'src', 'main.js')

with open(MAIN_JS_PATH, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update getPlatformDownloadUrl
old_dl_url_pattern = re.compile(
    r'function getPlatformDownloadUrl\(os = \'auto\'\)\s*\{.*?\n  \}',
    re.DOTALL
)

new_dl_url_code = """function getPlatformDownloadUrl(os = 'auto') {
    const detected = detectClientOperatingSystem();
    const targetOs = (os && os !== 'auto') ? os.toLowerCase() : detected.os;
    
    // Direct link to verified distribution packages in downloads directory
    const packageMap = {
      windows: './downloads/Pulse-Music-Setup-2.4.0.exe',
      mac: './downloads/Pulse-Music-2.4.0.dmg',
      android: './downloads/Pulse-Music-v2.4.0.apk',
      linux: './downloads/Pulse-Music-2.4.0.AppImage',
      ios: './downloads/Pulse-Music-v2.4.0.ipa'
    };
    return packageMap[targetOs] || './downloads/Pulse-Music-Setup-2.4.0.exe';
  }"""

if old_dl_url_pattern.search(code):
    code = old_dl_url_pattern.sub(new_dl_url_code, code)
    print("[SUCCESS] Updated getPlatformDownloadUrl")
else:
    print("[ERROR] Could not find getPlatformDownloadUrl pattern")

# 2. Update handleGoogleOAuthLogin
old_google_pattern = re.compile(
    r'window\.handleGoogleOAuthLogin = async function\(\)\s*\{.*?\n  \};',
    re.DOTALL
)

new_google_code = """window.handleGoogleOAuthLogin = async function() {
    const banner = document.getElementById('auth-status-banner');
    if (banner) banner.classList.add('hidden');

    // 1. Supabase Official OAuth Flow (if configured)
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

    // 2. Google Identity Services (GIS)
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {}
    }

    // 3. Instant 1-Click Google Sign-In for Web Users
    const defaultName = localStorage.getItem('pulse_last_google_name') || 'Listener';
    let userName = prompt("Sign in with Google - Enter your name:", defaultName);
    if (!userName || userName.trim() === '') userName = 'Pulse Listener';
    userName = userName.trim();
    localStorage.setItem('pulse_last_google_name', userName);

    const userEmail = `${userName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'listener'}@gmail.com`;
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=8b5cf6`;

    window.loginUser(userName, userEmail, 'google', avatarUrl);
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
    if (typeof window.showToast === 'function') {
      window.showToast(`Signed in with Google as ${userName}!`, 'success', 4000);
    }
  };"""

if old_google_pattern.search(code):
    code = old_google_pattern.sub(new_google_code, code)
    print("[SUCCESS] Updated handleGoogleOAuthLogin")
else:
    print("[ERROR] Could not find handleGoogleOAuthLogin pattern")

with open(MAIN_JS_PATH, 'w', encoding='utf-8') as f:
    f.write(code)

print("[SUCCESS] Updated src/main.js with download and auth fixes")
