import re

# 1. Update index.html - Inject 3-tab Auth Modal with Phone SMS OTP
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make sure firebaseClient.js is loaded
if 'src/firebaseClient.js' not in html:
    html = html.replace(
        '<script type="module" src="./src/lyricsService.js?v=3.0.0-clean"></script>',
        '<script type="module" src="./src/firebaseClient.js?v=3.0.0-clean"></script>\n  <script type="module" src="./src/lyricsService.js?v=3.0.0-clean"></script>'
    )

auth_modal_new = """  <!-- PREMIUM FIREBASE AUTHENTICATION MODAL -->
  <div id="auth-modal" class="modal-overlay hidden">
    <div class="modal-content pulse-auth-modal">
      <div class="pulse-auth-glow"></div>
      
      <!-- Close button -->
      <button id="close-auth-modal-btn" class="pulse-auth-close" onclick="document.getElementById('auth-modal').classList.add('hidden')">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <!-- Header -->
      <div class="pulse-auth-header">
        <div class="pulse-auth-logo-wrapper">
          <img src="./pulse-logo.png" alt="Pulse Logo" class="pulse-auth-logo">
          <div class="pulse-auth-logo-ring"></div>
        </div>
        <h2 id="spotify-auth-heading" class="pulse-auth-title">Welcome to Pulse</h2>
        <p class="pulse-auth-subtitle">Sign in to unlock personalized playlists & synchronized lyrics</p>
      </div>

      <!-- Status Banner -->
      <div id="auth-status-banner" class="pulse-auth-banner hidden"></div>

      <!-- Social Login Section (Google Auth) -->
      <div class="pulse-auth-social">
        <button type="button" class="pulse-social-btn pulse-social-google" onclick="window.handleGoogleOAuthLogin()" id="btn-google-login">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width: 20px; height: 20px;">
          <span>Continue with Google</span>
        </button>
      </div>

      <!-- Divider -->
      <div class="pulse-auth-divider">
        <div class="pulse-divider-line"></div>
        <span>or choose an option</span>
        <div class="pulse-divider-line"></div>
      </div>

      <!-- 3-Way Tab Switcher: Login, Signup, Phone SMS -->
      <div class="pulse-auth-tabs" style="grid-template-columns: 1fr 1fr 1fr;">
        <button id="tab-login-btn" class="pulse-tab active" onclick="window.switchAuthTab('login')">
          <i class="fa-solid fa-right-to-bracket"></i> Log In
        </button>
        <button id="tab-signup-btn" class="pulse-tab" onclick="window.switchAuthTab('signup')">
          <i class="fa-solid fa-user-plus"></i> Sign Up
        </button>
        <button id="tab-phone-btn" class="pulse-tab" onclick="window.switchAuthTab('phone')">
          <i class="fa-solid fa-mobile-screen"></i> Phone OTP
        </button>
        <div class="pulse-tab-indicator"></div>
      </div>

      <!-- 1. Login Form (Email/Password) -->
      <form id="auth-form-login" class="pulse-auth-form" onsubmit="window.handleRealLogin(event); return false;" novalidate>
        <div class="pulse-input-group">
          <div class="pulse-input-wrapper" id="login-email-wrapper">
            <i class="fa-solid fa-envelope pulse-input-icon"></i>
            <input type="email" id="login-email" placeholder=" " autocomplete="email" oninput="window.clearFieldError('login-email')">
            <label for="login-email">Email address</label>
            <div class="pulse-input-highlight"></div>
          </div>
          <div class="pulse-field-error hidden" id="login-email-error"></div>
        </div>
        <div class="pulse-input-group">
          <div class="pulse-input-wrapper" id="login-password-wrapper">
            <i class="fa-solid fa-lock pulse-input-icon"></i>
            <input type="password" id="login-password" placeholder=" " autocomplete="current-password" oninput="window.clearFieldError('login-password')">
            <label for="login-password">Password</label>
            <button type="button" class="pulse-password-toggle" onclick="window.togglePasswordVisibility(this)" title="Toggle password visibility">
              <i class="fa-solid fa-eye"></i>
            </button>
            <div class="pulse-input-highlight"></div>
          </div>
          <div class="pulse-field-error hidden" id="login-password-error"></div>
        </div>
        <div class="pulse-auth-extras">
          <label class="pulse-remember-me">
            <input type="checkbox" checked id="login-remember">
            <span class="pulse-checkbox-custom"></span>
            <span>Remember me</span>
          </label>
          <a href="#" class="pulse-forgot-link" onclick="window.openForgotPasswordModal(); return false;">Forgot password?</a>
        </div>
        <button type="submit" id="btn-login-submit" class="pulse-auth-submit">
          <span class="btn-text">Sign In with Password</span>
          <i class="fa-solid fa-arrow-right btn-icon"></i>
        </button>
        <p class="pulse-auth-switch">
          Don't have an account? <a href="#" onclick="window.switchAuthTab('signup'); return false;">Create one</a>
        </p>
      </form>

      <!-- 2. Signup Form (Email/Password) -->
      <form id="auth-form-signup" class="pulse-auth-form hidden" onsubmit="window.handleRealSignup(event); return false;" novalidate>
        <div class="pulse-input-group">
          <div class="pulse-input-wrapper" id="signup-name-wrapper">
            <i class="fa-solid fa-user pulse-input-icon"></i>
            <input type="text" id="signup-name" placeholder=" " autocomplete="name" oninput="window.clearFieldError('signup-name')">
            <label for="signup-name">Full Name</label>
            <div class="pulse-input-highlight"></div>
          </div>
          <div class="pulse-field-error hidden" id="signup-name-error"></div>
        </div>
        <div class="pulse-input-group">
          <div class="pulse-input-wrapper" id="signup-email-wrapper">
            <i class="fa-solid fa-envelope pulse-input-icon"></i>
            <input type="email" id="signup-email" placeholder=" " autocomplete="email" oninput="window.clearFieldError('signup-email')">
            <label for="signup-email">Email address</label>
            <div class="pulse-input-highlight"></div>
          </div>
          <div class="pulse-field-error hidden" id="signup-email-error"></div>
        </div>
        <div class="pulse-input-group">
          <div class="pulse-input-wrapper" id="signup-password-wrapper">
            <i class="fa-solid fa-lock pulse-input-icon"></i>
            <input type="password" id="signup-password" placeholder=" " autocomplete="new-password" oninput="window.handlePasswordInput(this)">
            <label for="signup-password">Password (min. 6 chars)</label>
            <button type="button" class="pulse-password-toggle" onclick="window.togglePasswordVisibility(this)" title="Toggle password visibility">
              <i class="fa-solid fa-eye"></i>
            </button>
            <div class="pulse-input-highlight"></div>
          </div>
          <div class="pulse-password-strength" id="password-strength-bar">
            <div class="pulse-strength-fill"></div>
          </div>
          <div class="pulse-field-error hidden" id="signup-password-error"></div>
        </div>
        <button type="submit" id="btn-signup-submit" class="pulse-auth-submit">
          <span class="btn-text">Create Account</span>
          <i class="fa-solid fa-rocket btn-icon"></i>
        </button>
        <p class="pulse-auth-switch">
          Already have an account? <a href="#" onclick="window.switchAuthTab('login'); return false;">Log in</a>
        </p>
      </form>

      <!-- 3. Phone Number SMS Auth Form -->
      <form id="auth-form-phone" class="pulse-auth-form hidden" onsubmit="window.handlePhoneAuthSubmit(event); return false;" novalidate>
        <!-- STEP 1: Enter Phone Number -->
        <div id="phone-input-step">
          <div class="pulse-input-group">
            <label style="font-size: 0.82rem; color: #a1a1aa; font-weight: 600; display: block; margin-bottom: 0.4rem;">International Phone Number</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <select id="phone-country-code" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 12px; padding: 0.75rem 0.6rem; font-size: 0.9rem; outline: none; cursor: pointer;">
                <option value="+91">🇮🇳 +91 (IN)</option>
                <option value="+1">🇺🇸 +1 (US)</option>
                <option value="+44">🇬🇧 +44 (UK)</option>
                <option value="+61">🇦🇺 +61 (AU)</option>
                <option value="+81">🇯🇵 +81 (JP)</option>
                <option value="+49">🇩🇪 +49 (DE)</option>
                <option value="+33">🇫🇷 +33 (FR)</option>
                <option value="+971">🇦🇪 +971 (UAE)</option>
              </select>
              <div class="pulse-input-wrapper" id="phone-number-wrapper" style="flex: 1;">
                <i class="fa-solid fa-phone pulse-input-icon"></i>
                <input type="tel" id="phone-number-input" placeholder=" " autocomplete="tel" oninput="window.clearFieldError('phone-number')">
                <label for="phone-number-input">98765 43210</label>
                <div class="pulse-input-highlight"></div>
              </div>
            </div>
            <div class="pulse-field-error hidden" id="phone-number-error"></div>
            <small style="color: var(--text-muted); font-size: 0.75rem; display: block; margin-top: 0.45rem;">
              <i class="fa-solid fa-shield-halved text-accent"></i> We will send a secure 6-digit SMS verification code via Firebase.
            </small>
          </div>

          <!-- Invisible Recaptcha Anchor -->
          <div id="recaptcha-container" style="margin: 0.5rem 0;"></div>

          <button type="button" id="btn-phone-send-otp" class="pulse-auth-submit" onclick="window.handleSendPhoneOtp(event)">
            <span class="btn-text">Send SMS Verification Code</span>
            <i class="fa-solid fa-paper-plane btn-icon"></i>
          </button>
        </div>

        <!-- STEP 2: Enter & Verify 6-digit OTP -->
        <div id="phone-otp-step" class="hidden" style="animation: fadeIn 0.3s ease;">
          <div class="pulse-input-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <label style="font-size: 0.82rem; color: #a1a1aa; font-weight: 600;">Enter 6-Digit SMS Code</label>
              <button type="button" class="btn-link" style="font-size: 0.75rem; color: #c084fc; background: none; border: none; cursor: pointer;" onclick="window.backToPhoneInput()">Change Number</button>
            </div>
            <div class="pulse-input-wrapper" id="phone-otp-wrapper">
              <i class="fa-solid fa-key pulse-input-icon"></i>
              <input type="text" id="phone-otp-input" placeholder=" " maxlength="6" pattern="[0-9]{6}" autocomplete="one-time-code" style="letter-spacing: 0.3em; font-size: 1.2rem; font-weight: 800; text-align: center;" oninput="window.clearFieldError('phone-otp')">
              <label for="phone-otp-input">6-digit OTP code</label>
              <div class="pulse-input-highlight"></div>
            </div>
            <div class="pulse-field-error hidden" id="phone-otp-error"></div>
            <small style="color: var(--text-muted); font-size: 0.75rem; display: block; margin-top: 0.45rem;">
              Code sent to <strong id="phone-sent-target" style="color: #fff;">+91...</strong>
            </small>
          </div>

          <button type="button" id="btn-phone-verify-otp" class="pulse-auth-submit" onclick="window.handleVerifyPhoneOtp(event)">
            <span class="btn-text">Verify & Sign In</span>
            <i class="fa-solid fa-check btn-icon"></i>
          </button>
        </div>
      </form>

      <!-- Footer -->
      <div class="pulse-auth-footer">
        <p>By continuing, you agree to Pulse's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
      </div>
    </div>
  </div>"""

# Replace existing auth-modal
html = re.sub(
    r'<!-- PREMIUM GLASSMORPHIC AUTHENTICATION MODAL -->\s*<div id="auth-modal"[\s\S]*?<!-- ARTIST DETAIL & LIVE EVENTS MODAL -->',
    f'{auth_modal_new}\n\n  <!-- ARTIST DETAIL & LIVE EVENTS MODAL -->',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] Injected 3-way Firebase Auth Modal into index.html")
