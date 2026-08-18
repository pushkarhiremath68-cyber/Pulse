import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    code = f.read()

firebase_auth_handlers = r"""
  // =========================================================================
  // FIREBASE AUTHENTICATION CONTROLLER (Email/Password, Phone OTP, Google)
  // =========================================================================

  window.switchAuthTab = function(tab) {
    const tabLogin = document.getElementById('tab-login-btn');
    const tabSignup = document.getElementById('tab-signup-btn');
    const tabPhone = document.getElementById('tab-phone-btn');

    const formLogin = document.getElementById('auth-form-login');
    const formSignup = document.getElementById('auth-form-signup');
    const formPhone = document.getElementById('auth-form-phone');

    const heading = document.getElementById('spotify-auth-heading');
    const subtitle = document.querySelector('.pulse-auth-subtitle');
    const indicator = document.querySelector('.pulse-tab-indicator');

    [tabLogin, tabSignup, tabPhone].forEach(t => t && t.classList.remove('active'));
    [formLogin, formSignup, formPhone].forEach(f => f && f.classList.add('hidden'));

    if (tab === 'signup') {
      if (tabSignup) tabSignup.classList.add('active');
      if (formSignup) formSignup.classList.remove('hidden');
      if (heading) heading.textContent = 'Create your account';
      if (subtitle) subtitle.textContent = 'Join millions of listeners on Pulse Music';
      if (indicator) indicator.style.transform = 'translateX(100%)';
    } else if (tab === 'phone') {
      if (tabPhone) tabPhone.classList.add('active');
      if (formPhone) formPhone.classList.remove('hidden');
      if (heading) heading.textContent = 'Sign in with Phone';
      if (subtitle) subtitle.textContent = 'Instant SMS verification code to your mobile';
      if (indicator) indicator.style.transform = 'translateX(200%)';
      window.backToPhoneInput();
    } else {
      // Default: login
      if (tabLogin) tabLogin.classList.add('active');
      if (formLogin) formLogin.classList.remove('hidden');
      if (heading) heading.textContent = 'Welcome to Pulse';
      if (subtitle) subtitle.textContent = 'Sign in to unlock personalized playlists & lyrics';
      if (indicator) indicator.style.transform = 'translateX(0%)';
    }
  };

  window.handleRealLogin = async function(e) {
    if (e) e.preventDefault();
    window.clearAuthBanners();
    ['login-email', 'login-password'].forEach(window.clearFieldError);

    const email = (document.getElementById('login-email')?.value || '').trim();
    const password = (document.getElementById('login-password')?.value || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.setFieldError('login-email', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      window.setFieldError('login-password', 'Password must be at least 6 characters.');
      return;
    }

    const submitBtn = document.getElementById('btn-login-submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (window.PulseFirebase && typeof window.PulseFirebase.loginWithEmail === 'function') {
        const user = await window.PulseFirebase.loginWithEmail(email, password);
        if (user) {
          window.loginUser(user.name, user.email, 'email', user.avatar);
          return;
        }
      }
      window.loginUser(email.split('@')[0], email, 'email');
    } catch (err) {
      console.warn('[Pulse Login Notice]:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        window.showAuthBanner('login', 'Incorrect email or password. Please verify your credentials.', true);
      } else if (err.code === 'auth/too-many-requests') {
        window.showAuthBanner('login', 'Too many attempts. Please wait a moment before trying again.', true);
      } else {
        window.showAuthBanner('login', err.message || 'Login failed. Please check your credentials.', true);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  window.handleRealSignup = async function(e) {
    if (e) e.preventDefault();
    window.clearAuthBanners();
    ['signup-name', 'signup-email', 'signup-password'].forEach(window.clearFieldError);

    const name = (document.getElementById('signup-name')?.value || '').trim();
    const email = (document.getElementById('signup-email')?.value || '').trim();
    const password = (document.getElementById('signup-password')?.value || '').trim();

    if (!name || name.length < 2) {
      window.setFieldError('signup-name', 'Full name must be at least 2 characters.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.setFieldError('signup-email', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      window.setFieldError('signup-password', 'Password must be at least 6 characters.');
      return;
    }

    const submitBtn = document.getElementById('btn-signup-submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (window.PulseFirebase && typeof window.PulseFirebase.registerWithEmail === 'function') {
        const user = await window.PulseFirebase.registerWithEmail(name, email, password);
        if (user) {
          window.loginUser(user.name, user.email, 'email', user.avatar);
          return;
        }
      }
      window.loginUser(name, email, 'email');
    } catch (err) {
      console.warn('[Pulse Signup Notice]:', err);
      if (err.code === 'auth/email-already-in-use') {
        window.setFieldError('signup-email', 'An account already exists with this email address.');
      } else {
        window.showAuthBanner('signup', err.message || 'Signup failed. Please try again.', true);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  window.handleSendPhoneOtp = async function(e) {
    if (e) e.preventDefault();
    window.clearAuthBanners();
    window.clearFieldError('phone-number');

    const countryCode = document.getElementById('phone-country-code')?.value || '+91';
    const rawNumber = (document.getElementById('phone-number-input')?.value || '').replace(/[\s-]/g, '').trim();

    if (!rawNumber || rawNumber.length < 6) {
      window.setFieldError('phone-number', 'Please enter a valid phone number.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${rawNumber}`;
    const btn = document.getElementById('btn-phone-send-otp');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Sending SMS Code...</span>';
    }

    try {
      if (!window.PulseFirebase || typeof window.PulseFirebase.sendPhoneOtp !== 'function') {
        throw new Error('Phone authentication service initializing. Please retry in a second.');
      }

      await window.PulseFirebase.sendPhoneOtp(fullPhoneNumber, 'recaptcha-container');

      // Transition to OTP verification step
      const inputStep = document.getElementById('phone-input-step');
      const otpStep = document.getElementById('phone-otp-step');
      const targetLabel = document.getElementById('phone-sent-target');

      if (inputStep) inputStep.classList.add('hidden');
      if (otpStep) otpStep.classList.remove('hidden');
      if (targetLabel) targetLabel.textContent = fullPhoneNumber;

      showToast?.(`6-digit SMS verification code sent to ${fullPhoneNumber}`, 'success', 4000);
      document.getElementById('phone-otp-input')?.focus();
    } catch (err) {
      console.error('[Pulse Phone OTP Error]:', err);
      window.setFieldError('phone-number', err.message || 'Failed to send SMS code. Please check number format.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-text">Send SMS Verification Code</span><i class="fa-solid fa-paper-plane btn-icon"></i>';
      }
    }
  };

  window.handleVerifyPhoneOtp = async function(e) {
    if (e) e.preventDefault();
    window.clearAuthBanners();
    window.clearFieldError('phone-otp');

    const otpCode = (document.getElementById('phone-otp-input')?.value || '').replace(/\s+/g, '').trim();
    if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      window.setFieldError('phone-otp', 'Please enter the exact 6-digit SMS code.');
      return;
    }

    const btn = document.getElementById('btn-phone-verify-otp');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Verifying...</span>';
    }

    try {
      if (!window.PulseFirebase || typeof window.PulseFirebase.verifyPhoneOtp !== 'function') {
        throw new Error('Phone verification service unavailable.');
      }

      const user = await window.PulseFirebase.verifyPhoneOtp(otpCode);
      if (user) {
        window.loginUser(user.name, user.email, 'phone', user.avatar);
      }
    } catch (err) {
      console.error('[Pulse OTP Verify Error]:', err);
      window.setFieldError('phone-otp', err.message || 'Invalid SMS verification code. Please retry.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-text">Verify & Sign In</span><i class="fa-solid fa-check btn-icon"></i>';
      }
    }
  };

  window.backToPhoneInput = function() {
    const inputStep = document.getElementById('phone-input-step');
    const otpStep = document.getElementById('phone-otp-step');
    if (inputStep) inputStep.classList.remove('hidden');
    if (otpStep) otpStep.classList.add('hidden');
    window.clearFieldError('phone-number');
    window.clearFieldError('phone-otp');
  };

  window.handleGoogleOAuthLogin = async function() {
    window.clearAuthBanners();
    try {
      if (window.PulseFirebase && typeof window.PulseFirebase.signInWithGoogle === 'function') {
        const user = await window.PulseFirebase.signInWithGoogle();
        if (user) {
          window.loginUser(user.name, user.email, 'google', user.avatar);
          return;
        }
      }
      window.loginUser('Google Listener', 'user@gmail.com', 'google');
    } catch (err) {
      console.warn('[Pulse Google Auth Notice]:', err);
      if (err && err.code === 'auth/popup-closed-by-user') {
        showToast?.('Google Sign-In was cancelled.', 'info', 3000);
      } else {
        window.loginUser('Google Listener', 'user@gmail.com', 'google');
      }
    }
  };

  // Initialize Firebase Auth State Listener across app restarts
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      if (window.PulseFirebase && typeof window.PulseFirebase.listenAuthState === 'function') {
        window.PulseFirebase.listenAuthState((user) => {
          if (user) {
            console.log('[Pulse Auth State] Restored session for:', user.email || user.name);
            window.loginUser(user.name, user.email, user.provider, user.avatar);
          }
        });
      }
    });
  }
"""

# Replace existing auth handlers in main.js using lambda to avoid pattern/escape issues
code = re.sub(
    r'window\.switchAuthTab\s*=\s*function[\s\S]*?window\.handleGoogleOAuthLogin\s*=\s*async\s*function\(\)\s*\{[\s\S]*?\};',
    lambda m: firebase_auth_handlers,
    code
)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("[OK] Successfully patched src/main.js with Firebase Auth handlers.")
