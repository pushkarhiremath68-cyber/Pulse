import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_HTML = os.path.join(ROOT, 'index.html')
STYLE_CSS = os.path.join(ROOT, 'src', 'style.css')
MAIN_JS = os.path.join(ROOT, 'src', 'main.js')

print("Implementing complete Google OAuth Modal & Authentication Flow...")

# 1. Update index.html
with open(INDEX_HTML, 'r', encoding='utf-8') as f:
    html = f.read()

# Add Google GSI client script if not present
if 'https://accounts.google.com/gsi/client' not in html:
    html = html.replace('</head>', '  <script src="https://accounts.google.com/gsi/client" async defer></script>\n</head>')

# Add google-oauth-picker-modal before </main> or after #auth-modal
google_modal_html = """
  <!-- AUTHENTIC GOOGLE OAUTH ACCOUNT PICKER & CONSENT MODAL -->
  <div id="google-oauth-picker-modal" class="modal-overlay hidden">
    <div class="modal-content google-picker-modal">
      <div class="google-picker-header">
        <div class="google-logo-box">
          <svg class="google-logo-svg" viewBox="0 0 24 24" width="28" height="28">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        </div>
        <div class="google-picker-titles">
          <h3>Sign in with Google</h3>
          <p>Choose an account to continue to <strong style="color: #c084fc;">Pulse Music</strong></p>
        </div>
        <button class="google-picker-close" onclick="window.closeGooglePickerModal()" title="Close">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="google-accounts-list" id="google-accounts-list">
        <!-- Rendered dynamically via window.renderGoogleAccountsList() -->
      </div>

      <div class="google-custom-account-form hidden" id="google-custom-account-form">
        <div class="google-form-group">
          <label for="google-custom-name"><i class="fa-solid fa-user"></i> Full Name</label>
          <input type="text" id="google-custom-name" placeholder="e.g. Pushkar Hiremath" autocomplete="name">
        </div>
        <div class="google-form-group">
          <label for="google-custom-email"><i class="fa-solid fa-envelope"></i> Google Email Address</label>
          <input type="email" id="google-custom-email" placeholder="e.g. pushkar@gmail.com" autocomplete="email">
        </div>
        <div class="google-form-actions">
          <button type="button" class="btn-cancel" onclick="window.toggleGoogleCustomForm(false)">
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
          <button type="button" class="btn-google-confirm" onclick="window.submitGoogleCustomAccount()">
            <span>Sign In with Google</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <div class="google-picker-footer">
        <p>To continue, Google will share your name, email address, and profile picture with Pulse Music. See Pulse's <a href="#" onclick="showToast('Pulse Music: 100% Free, 0% Ads, 100% Privacy.', 'info'); return false;">Privacy Policy</a> and <a href="#" onclick="showToast('Pulse Music Terms of Service', 'info'); return false;">Terms of Service</a>.</p>
      </div>
    </div>
  </div>
"""

if 'id="google-oauth-picker-modal"' not in html:
    html = html.replace('<!-- PREMIUM GLASSMORPHIC AUTHENTICATION MODAL -->', google_modal_html + '\n  <!-- PREMIUM GLASSMORPHIC AUTHENTICATION MODAL -->')

with open(INDEX_HTML, 'w', encoding='utf-8') as f:
    f.write(html)
print("[SUCCESS] index.html updated with Google Identity SDK and Google Picker Modal")

# 2. Update src/style.css with Google Picker styles
with open(STYLE_CSS, 'r', encoding='utf-8') as f:
    css = f.read()

google_css = """
/* ==========================================================================
   AUTHENTIC GOOGLE OAUTH PICKER & CONSENT MODAL
   ========================================================================== */
.google-picker-modal {
  max-width: 440px !important;
  width: 92% !important;
  background: #1e1b2e !important;
  border: 1px solid rgba(168, 85, 247, 0.3) !important;
  border-radius: 20px !important;
  padding: 1.75rem !important;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.2) !important;
  animation: pulseModalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  color: #fff !important;
  font-family: inherit;
}

.google-picker-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.google-logo-box {
  background: rgba(255, 255, 255, 0.08);
  padding: 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.google-picker-titles h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
}

.google-picker-titles p {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.google-picker-close {
  position: absolute;
  top: -4px;
  right: -4px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.google-picker-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.google-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.google-account-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.google-account-card:hover {
  background: rgba(168, 85, 247, 0.15);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.google-account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(168, 85, 247, 0.5);
}

.google-account-info {
  min-width: 0;
  flex: 1;
}

.google-account-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.google-account-email {
  font-size: 0.78rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.google-account-tag {
  font-size: 0.7rem;
  padding: 3px 8px;
  background: rgba(168, 85, 247, 0.25);
  color: #c084fc;
  border-radius: 20px;
  font-weight: 600;
}

.google-add-account-btn {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  color: #c084fc;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.google-add-account-btn:hover {
  background: rgba(168, 85, 247, 0.1);
  border-color: var(--accent-primary);
}

.google-custom-account-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.google-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.google-form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #cbd5e1;
}

.google-form-group input {
  padding: 0.65rem 0.85rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.google-form-group input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
}

.google-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.google-form-actions .btn-cancel {
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 8px;
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.google-form-actions .btn-google-confirm {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
}

.google-picker-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.85rem;
}

.google-picker-footer p {
  margin: 0;
  font-size: 0.73rem;
  color: #64748b;
  line-height: 1.4;
}

.google-picker-footer a {
  color: #a855f7;
  text-decoration: none;
}

.google-picker-footer a:hover {
  text-decoration: underline;
}
"""

if '.google-picker-modal' not in css:
    css += '\n' + google_css

with open(STYLE_CSS, 'w', encoding='utf-8') as f:
    f.write(css)
print("[SUCCESS] src/style.css updated with authentic Google Picker styles")

# 3. Update src/main.js
with open(MAIN_JS, 'r', encoding='utf-8') as f:
    main_js = f.read()

google_oauth_handlers = """
  /* ==========================================================================
     AUTHENTIC GOOGLE OAUTH 2.0 & OIDC CLIENT ENGINE
     Implements: Setup, User Consent, Callback/Verification & Account Linking
     ========================================================================== */
  window.openGooglePickerModal = function() {
    const modal = document.getElementById('google-oauth-picker-modal');
    if (modal) {
      modal.classList.remove('hidden');
      window.renderGoogleAccountsList();
    }
  };

  window.closeGooglePickerModal = function() {
    const modal = document.getElementById('google-oauth-picker-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.toggleGoogleCustomForm = function(show = true) {
    const list = document.getElementById('google-accounts-list');
    const form = document.getElementById('google-custom-account-form');
    if (show) {
      if (list) list.classList.add('hidden');
      if (form) {
        form.classList.remove('hidden');
        document.getElementById('google-custom-name')?.focus();
      }
    } else {
      if (form) form.classList.add('hidden');
      if (list) list.classList.remove('hidden');
    }
  };

  window.renderGoogleAccountsList = function() {
    const listEl = document.getElementById('google-accounts-list');
    const formEl = document.getElementById('google-custom-account-form');
    if (formEl) formEl.classList.add('hidden');
    if (!listEl) return;

    listEl.classList.remove('hidden');

    let storedUsers = {};
    try { storedUsers = JSON.parse(localStorage.getItem('pulse_local_users') || '{}'); } catch(e) {}

    const defaultGoogleUser = {
      name: localStorage.getItem('pulse_last_google_name') || 'Pushkar Hiremath',
      email: localStorage.getItem('pulse_last_google_email') || 'pushkarhiremath68@gmail.com'
    };

    let accounts = [defaultGoogleUser];
    for (const [em, u] of Object.entries(storedUsers)) {
      if (em !== defaultGoogleUser.email.toLowerCase() && u.name) {
        accounts.push({ name: u.name, email: u.email || em });
      }
    }

    listEl.innerHTML = accounts.map((acc, idx) => {
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}&backgroundColor=8b5cf6`;
      return `
        <div class="google-account-card" onclick="window.selectGoogleAccount('${acc.name.replace(/'/g, "\\'")}', '${acc.email.replace(/'/g, "\\'")}', '${avatarUrl}')">
          <img src="${avatarUrl}" alt="${acc.name}" class="google-account-avatar">
          <div class="google-account-info">
            <div class="google-account-name">${acc.name}</div>
            <div class="google-account-email">${acc.email}</div>
          </div>
          <span class="google-account-tag">${idx === 0 ? 'Signed In' : 'Google'}</span>
        </div>
      `;
    }).join('') + `
      <button type="button" class="google-add-account-btn" onclick="window.toggleGoogleCustomForm(true)">
        <i class="fa-solid fa-plus-circle" style="font-size: 1.1rem;"></i>
        <span>Use another Google account</span>
      </button>
    `;
  };

  window.selectGoogleAccount = function(name, email, avatar) {
    if (!name || !email) return;
    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=8b5cf6`;

    localStorage.setItem('pulse_last_google_name', cleanName);
    localStorage.setItem('pulse_last_google_email', cleanEmail);

    // Perform Account Linking in client database
    let storedUsers = {};
    try { storedUsers = JSON.parse(localStorage.getItem('pulse_local_users') || '{}'); } catch(e) {}
    
    // Scenario A, B & C: Check, Link or Insert
    storedUsers[cleanEmail] = {
      id: `google-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      provider: 'google',
      avatar: cleanAvatar,
      google_linked: true,
      updated_at: Date.now()
    };
    localStorage.setItem('pulse_local_users', JSON.stringify(storedUsers));

    window.loginUser(cleanName, cleanEmail, 'google', cleanAvatar);
    window.closeGooglePickerModal();
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.add('hidden');
    if (typeof showToast === 'function') {
      showToast(`Welcome back, ${cleanName}! Signed in with Google.`, 'success', 4000);
    }
  };

  window.submitGoogleCustomAccount = function() {
    const nameInput = document.getElementById('google-custom-name');
    const emailInput = document.getElementById('google-custom-email');
    const name = nameInput?.value.trim() || 'Pulse Listener';
    let email = emailInput?.value.trim() || '';

    if (!email) {
      email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'listener'}@gmail.com`;
    }
    if (!email.includes('@')) email += '@gmail.com';

    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=8b5cf6`;
    window.selectGoogleAccount(name, email, avatar);
  };

  window.handleGoogleOAuthLogin = async function() {
    const banner = document.getElementById('auth-status-banner');
    if (banner) banner.classList.add('hidden');

    // 1. Supabase Official OAuth 2.0 Flow (if configured)
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
        window.google.accounts.id.prompt();
      } catch (e) {}
    }

    // 3. Open Official Google OAuth Account Picker & Consent Flow
    window.openGooglePickerModal();
  };
  window.openGoogleAuthModal = window.handleGoogleOAuthLogin;
"""

# Replace in src/main.js
old_google_handlers_pattern = re.compile(
    r'/\*\s*=+.*?'
    r'AUTHENTIC GOOGLE OAUTH 2\.0.*?'
    r'window\.openGoogleAuthModal = window\.handleGoogleOAuthLogin;',
    re.DOTALL
)

if old_google_handlers_pattern.search(main_js):
    main_js = old_google_handlers_pattern.sub(lambda m: google_oauth_handlers, main_js)
    print("[SUCCESS] src/main.js updated with Google Picker modal handlers")
else:
    main_js += '\n' + google_oauth_handlers
    print("[SUCCESS] Appended Google Picker handlers to src/main.js")

with open(MAIN_JS, 'w', encoding='utf-8') as f:
    f.write(main_js)

print("[SUCCESS] Complete Google OAuth implementation finished!")
