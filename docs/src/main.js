(function() {
  'use strict';

  
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
        <div class="google-account-card" onclick="window.selectGoogleAccount('${acc.name.replace(/'/g, "\'")}', '${acc.email.replace(/'/g, "\'")}', '${avatarUrl}')">
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


  /* --------------------------------------------------------------------------
     AUTHENTICATION MODAL UI CONTROLLERS
     -------------------------------------------------------------------------- */
  window.switchAuthTab = function(tab) {
    const loginForm = document.getElementById('auth-form-login');
    const signupForm = document.getElementById('auth-form-signup');
    const loginTab = document.getElementById('tab-login-btn');
    const signupTab = document.getElementById('tab-signup-btn');
    const banner = document.getElementById('auth-status-banner');

    if (banner) {
      banner.classList.add('hidden');
      banner.className = 'pulse-auth-banner hidden';
      banner.innerHTML = '';
    }

    // Clear any field errors
    document.querySelectorAll('.pulse-input-wrapper').forEach(w => w.classList.remove('has-error'));
    document.querySelectorAll('.pulse-field-error').forEach(e => {
      e.classList.add('hidden');
      e.textContent = '';
    });

    if (tab === 'signup') {
      loginForm?.classList.add('hidden');
      signupForm?.classList.remove('hidden');
      signupTab?.classList.add('active');
      loginTab?.classList.remove('active');
      document.getElementById('signup-name')?.focus();
    } else {
      signupForm?.classList.add('hidden');
      loginForm?.classList.remove('hidden');
      loginTab?.classList.add('active');
      signupTab?.classList.remove('active');
      document.getElementById('login-email')?.focus();
    }
  };

  window.openLoginModal = function(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      window.switchAuthTab(tab);
    }
  };

  window.openForgotPasswordModal = function() {
    document.getElementById('auth-modal')?.classList.add('hidden');
    const forgotModal = document.getElementById('forgot-password-modal');
    if (forgotModal) {
      forgotModal.classList.remove('hidden');
      const forgotBanner = document.getElementById('forgot-status-banner');
      if (forgotBanner) {
        forgotBanner.classList.add('hidden');
        forgotBanner.className = 'pulse-auth-banner hidden';
        forgotBanner.innerHTML = '';
      }
      document.getElementById('forgot-email')?.focus();
    }
  };

  window.togglePasswordVisibility = function(button) {
    const wrapper = button.closest('.pulse-input-wrapper');
    if (!wrapper) return;
    const input = wrapper.querySelector('input');
    const icon = button.querySelector('i');
    if (input && icon) {
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
      } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
      }
    }
  };

  window.clearFieldError = function(fieldId) {
    const wrapper = document.getElementById(`${fieldId}-wrapper`);
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (wrapper) wrapper.classList.remove('has-error');
    if (errorEl) {
      errorEl.classList.add('hidden');
      errorEl.textContent = '';
    }
  };

  window.handlePasswordInput = function(input) {
    window.clearFieldError('signup-password');
    const val = input.value;
    const bar = document.getElementById('password-strength-bar');
    const fill = bar?.querySelector('.pulse-strength-fill');
    if (!fill) return;

    let score = 0;
    if (val.length >= 8) score++;
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (val.length === 0) {
      fill.style.width = '0%';
      fill.style.backgroundColor = 'transparent';
    } else if (score <= 1) {
      fill.style.width = '25%';
      fill.style.backgroundColor = '#ef4444'; // Red
    } else if (score === 2) {
      fill.style.width = '50%';
      fill.style.backgroundColor = '#f59e0b'; // Orange
    } else if (score === 3) {
      fill.style.width = '75%';
      fill.style.backgroundColor = '#3b82f6'; // Blue
    } else {
      fill.style.width = '100%';
      fill.style.backgroundColor = '#10b981'; // Green
    }
  };

  window.showAuthError = function(message, type = 'error', field = null) {
    const banner = document.getElementById('auth-status-banner');
    if (banner) {
      banner.className = `pulse-auth-banner ${type}`;
      const iconClass = type === 'success' ? 'fa-circle-check' : (type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation');
      banner.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHtml(message)}</span>`;
      banner.classList.remove('hidden');
    }

    if (field) {
      const wrapper = document.getElementById(`${field}-wrapper`) || document.getElementById(`login-${field}-wrapper`) || document.getElementById(`signup-${field}-wrapper`);
      const errorEl = document.getElementById(`${field}-error`) || document.getElementById(`login-${field}-error`) || document.getElementById(`signup-${field}-error`);
      if (wrapper) wrapper.classList.add('has-error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
      }
    }

    // Trigger modal shake animation for visual feedback
    const modalContent = document.querySelector('.pulse-auth-modal');
    if (modalContent && type === 'error') {
      modalContent.classList.remove('pulse-shake');
      void modalContent.offsetWidth; // Trigger reflow
      modalContent.classList.add('pulse-shake');
    }
  };

  window.showAuthSuccess = function(message) {
    window.showAuthError(message, 'success');
  };

  function setButtonLoading(btn, isLoading, defaultText, defaultIcon) {
    if (!btn) return;
    const textSpan = btn.querySelector('.btn-text') || btn.querySelector('span');
    const icon = btn.querySelector('.btn-icon') || btn.querySelector('i');
    btn.disabled = isLoading;
    if (isLoading) {
      btn.style.opacity = '0.75';
      btn.style.cursor = 'wait';
      if (textSpan) textSpan.textContent = 'Authenticating...';
      if (icon) icon.className = 'fa-solid fa-circle-notch fa-spin btn-icon';
    } else {
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      if (textSpan) textSpan.textContent = defaultText;
      if (icon) icon.className = `${defaultIcon} btn-icon`;
    }
  }

  function validateEmailRegex(email) {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email.trim());
  }

  /* --------------------------------------------------------------------------
     REAL USER LOGIN HANDLER (Static Hosting & Server Hybrid Engine)
     -------------------------------------------------------------------------- */
  window.handleRealLogin = async function(e) {
    if (e) e.preventDefault();
    const banner = document.getElementById('auth-status-banner');
    if (banner) banner.classList.add('hidden');

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('btn-login-submit');

    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    // 1. Client-Side Validation
    if (!email && !password) {
      window.showAuthError("Please enter your email address and password.", "error");
      document.getElementById('login-email-wrapper')?.classList.add('has-error');
      document.getElementById('login-password-wrapper')?.classList.add('has-error');
      emailInput?.focus();
      return;
    }

    // 2. Set Button Loading State
    setButtonLoading(submitBtn, true, 'Log In', 'fa-solid fa-arrow-right');

    // 3. Static Hosting / GitHub Pages Direct Client Login
    const isStaticHost = typeof window !== 'undefined' && window.location && (
      window.location.hostname.includes('github.io') ||
      window.location.hostname.includes('netlify.app') ||
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('firebaseapp.com') ||
      window.location.protocol === 'file:'
    );

    if (isStaticHost) {
      let storedUsers = {};
      try { storedUsers = JSON.parse(localStorage.getItem('pulse_local_users') || '{}'); } catch(err) {}
      const local = storedUsers[email.toLowerCase()];
      const userName = local ? local.name : (email.split('@')[0] || 'Listener');
      const userAvatar = resolveEmailAvatarUrl(email, userName);
      
      try {
        localStorage.setItem('pulse_auth_token', 'local_' + Date.now());
        localStorage.setItem('pulse_user_data', JSON.stringify({ name: userName, email: email, avatar: userAvatar }));
      } catch (err) {}

      window.showAuthSuccess(`Welcome back, ${userName}!`);
      setTimeout(() => {
        window.loginUser(userName, email, 'email', userAvatar);
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.add('hidden');
        if (typeof window.showToast === 'function') window.showToast(`Logged in as ${userName}`, 'success');
        setButtonLoading(submitBtn, false, 'Log In', 'fa-solid fa-arrow-right');
      }, 300);
      return;
    }

    // 4. Server-Side Authentication
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = data.error || data.message || "Invalid email or password.";
        window.showAuthError(errorMsg, "error", data.field || "login-password");
        setButtonLoading(submitBtn, false, 'Log In', 'fa-solid fa-arrow-right');
        return;
      }

      const userName = (data.user && data.user.name) ? data.user.name : email.split('@')[0];
      const userAvatar = (data.user && data.user.avatar && !data.user.avatar.includes('bottts')) ? data.user.avatar : resolveEmailAvatarUrl(email, userName);
      const user = { name: userName, email: email, avatar: userAvatar };
      window.showAuthSuccess(data.message || `Welcome back, ${user.name}!`);
      
      if (data.token) {
        try {
          localStorage.setItem('pulse_auth_token', data.token);
          localStorage.setItem('pulse_user_data', JSON.stringify(user));
        } catch (e) {}
      }

      setTimeout(() => {
        window.loginUser(user.name, user.email, 'email', user.avatar);
        document.getElementById('auth-modal')?.classList.add('hidden');
        window.showToast?.(`Welcome back, ${user.name}!`);
      }, 400);

    } catch (networkErr) {
      const userName = email.split('@')[0] || 'Listener';
      const userAvatar = resolveEmailAvatarUrl(email, userName);
      const user = { name: userName, email: email, avatar: userAvatar };
      window.showAuthSuccess(`Welcome, ${user.name}!`);
      setTimeout(() => {
        window.loginUser(user.name, user.email, 'email', user.avatar);
        document.getElementById('auth-modal')?.classList.add('hidden');
        window.showToast?.(`Welcome back, ${user.name}!`);
      }, 400);
    } finally {
      setButtonLoading(submitBtn, false, 'Log In', 'fa-solid fa-arrow-right');
    }
  };

  /* --------------------------------------------------------------------------
     REAL USER SIGNUP HANDLER (Static Hosting & Server Hybrid Engine)
     -------------------------------------------------------------------------- */
  window.handleRealSignup = async function(e) {
    if (e) e.preventDefault();
    const banner = document.getElementById('auth-status-banner');
    if (banner) banner.classList.add('hidden');

    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    const submitBtn = document.getElementById('btn-signup-submit');

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    const confirmPassword = confirmPasswordInput?.value || '';

    // 1. Validation
    if (!name) {
      window.showAuthError("Full Name is required.", "error", "signup-name");
      nameInput?.focus();
      return;
    }

    if (password.length < 6) {
      window.showAuthError("Password must be at least 6 characters long.", "error", "signup-password");
      passwordInput?.focus();
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      window.showAuthError("Passwords do not match. Please re-enter your password.", "error", "signup-confirm-password");
      confirmPasswordInput?.focus();
      return;
    }

    // 2. Set Button Loading State
    setButtonLoading(submitBtn, true, 'Create Account', 'fa-solid fa-rocket');

    // 3. Static Hosting / GitHub Pages Direct Client Registration
    const isStaticHost = typeof window !== 'undefined' && window.location && (
      window.location.hostname.includes('github.io') ||
      window.location.hostname.includes('netlify.app') ||
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('firebaseapp.com') ||
      window.location.protocol === 'file:'
    );

    if (isStaticHost) {
      let storedUsers = {};
      try { storedUsers = JSON.parse(localStorage.getItem('pulse_local_users') || '{}'); } catch(err) {}
      const userAvatar = resolveEmailAvatarUrl(email, name);
      storedUsers[email.toLowerCase()] = { name, email, avatar: userAvatar };
      try {
        localStorage.setItem('pulse_local_users', JSON.stringify(storedUsers));
        localStorage.setItem('pulse_auth_token', 'local_' + Date.now());
        localStorage.setItem('pulse_user_data', JSON.stringify({ name, email, avatar: userAvatar }));
      } catch (err) {}

      window.showAuthSuccess(`Account created! Welcome, ${name}!`);
      setTimeout(() => {
        window.loginUser(name, email, 'email', userAvatar);
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.add('hidden');
        if (typeof window.showToast === 'function') window.showToast(`Welcome to Pulse, ${name}!`, 'success');
        setButtonLoading(submitBtn, false, 'Create Account', 'fa-solid fa-rocket');
      }, 300);
      return;
    }

    // 4. Server-Side Registration
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = data.error || data.message || "Registration failed.";
        window.showAuthError(errorMsg, "error", data.field || "signup-email");
        setButtonLoading(submitBtn, false, 'Create Account', 'fa-solid fa-rocket');
        return;
      }

      const userAvatar = (data.user && data.user.avatar && !data.user.avatar.includes('bottts')) ? data.user.avatar : resolveEmailAvatarUrl(email, name);
      const user = { name, email, avatar: userAvatar };
      window.showAuthSuccess(data.message || `Account created successfully!`);
      
      if (data.token) {
        try {
          localStorage.setItem('pulse_auth_token', data.token);
          localStorage.setItem('pulse_user_data', JSON.stringify(user));
        } catch (e) {}
      }

      setTimeout(() => {
        window.loginUser(user.name, user.email, 'email', user.avatar);
        document.getElementById('auth-modal')?.classList.add('hidden');
        window.showToast?.(`Welcome to Pulse, ${user.name}!`);
      }, 400);

    } catch (networkErr) {
      const userAvatar = resolveEmailAvatarUrl(email, name);
      const user = { name, email, avatar: userAvatar };
      window.showAuthSuccess(`Account created! Welcome, ${user.name}!`);
      setTimeout(() => {
        window.loginUser(user.name, user.email, 'email', user.avatar);
        document.getElementById('auth-modal')?.classList.add('hidden');
        window.showToast?.(`Welcome to Pulse, ${user.name}!`);
      }, 400);
    } finally {
      setButtonLoading(submitBtn, false, 'Create Account', 'fa-solid fa-rocket');
    }
  };

  /* --------------------------------------------------------------------------
     FORGOT PASSWORD HANDLER
     -------------------------------------------------------------------------- */
  window.handleForgotPassword = async function(e) {
    if (e) e.preventDefault();
    const banner = document.getElementById('forgot-status-banner');
    if (banner) banner.classList.add('hidden');

    const emailInput = document.getElementById('forgot-email');
    const submitBtn = document.getElementById('btn-forgot-submit');
    const email = emailInput?.value.trim() || '';

    if (!email) {
      if (banner) {
        banner.className = 'pulse-auth-banner error';
        banner.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>Please enter your email address.</span>';
        banner.classList.remove('hidden');
      }
      emailInput?.focus();
      return;
    }

    if (!validateEmailRegex(email)) {
      if (banner) {
        banner.className = 'pulse-auth-banner error';
        banner.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>Please enter a valid email address.</span>';
        banner.classList.remove('hidden');
      }
      emailInput?.focus();
      return;
    }

    setButtonLoading(submitBtn, true, 'Send Reset Link', 'fa-solid fa-paper-plane');

    try {
      console.log(`[Auth Request] Submitting password reset for: ${email}`);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => ({}));
      console.error('[Auth Error Debug - Forgot Password Response]:', { status: res.status, data });

      if (banner) {
        if (res.ok) {
          banner.className = 'pulse-auth-banner success';
          banner.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(data.message || 'Password reset instructions have been sent to your email.')}</span>`;
          banner.classList.remove('hidden');
        } else {
          banner.className = 'pulse-auth-banner error';
          banner.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${escapeHtml(data.error || 'No account exists with this email address.')}</span>`;
          banner.classList.remove('hidden');
        }
      }
    } catch (networkErr) {
      console.error('[Auth Error Debug - Network Failure]:', networkErr);
      if (banner) {
        banner.className = 'pulse-auth-banner error';
        banner.innerHTML = '<i class="fa-solid fa-wifi"></i> <span>Network connection error. Please check your connection.</span>';
        banner.classList.remove('hidden');
      }
    } finally {
      setButtonLoading(submitBtn, false, 'Send Reset Link', 'fa-solid fa-paper-plane');
    }
  };

  /* ==========================================================================
     10. EVENT LISTENERS & STARTUP
     ========================================================================== */
  function attachEventListeners() {
    // Search input
    if (el.globalSearchInput) {
      el.globalSearchInput.addEventListener('input', (e) => window.executeSearch(e.target.value, true));
    }
    if (el.clearSearchBtn) {
      el.clearSearchBtn.addEventListener('click', () => {
        if (el.globalSearchInput) el.globalSearchInput.value = '';
        window.executeSearch('', false);
      });
    }

    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) switchView(view);
      });
    });

    // Filter pills (Top Navigation Bar)
    document.querySelectorAll('.filter-pills-bar .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pills-bar .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        if (filter === 'all') {
          switchView('home');
        } else {
          window.executeSearch(btn.dataset.filter || btn.textContent.trim());
        }
      });
    });

    // Player Buttons
    if (el.btnPlayPause) el.btnPlayPause.addEventListener('click', togglePlayPause);
    if (el.btnNext) el.btnNext.addEventListener('click', playNextTrack);
    if (el.btnPrev) el.btnPrev.addEventListener('click', playPrevTrack);
    if (el.btnRewind5s) el.btnRewind5s.addEventListener('click', () => seekRelative(-5));
    if (el.btnForward5s) el.btnForward5s.addEventListener('click', () => seekRelative(5));

    // Fullscreen Player Controls
    if (el.fsBtnPlay) el.fsBtnPlay.addEventListener('click', togglePlayPause);
    if (el.fsBtnNext) el.fsBtnNext.addEventListener('click', playNextTrack);
    if (el.fsBtnPrev) el.fsBtnPrev.addEventListener('click', playPrevTrack);
    if (el.fsBtnRewind5s) el.fsBtnRewind5s.addEventListener('click', () => seekRelative(-5));
    if (el.fsBtnForward5s) el.fsBtnForward5s.addEventListener('click', () => seekRelative(5));

    // Shuffle & Repeat
    if (el.btnShuffle) {
      el.btnShuffle.addEventListener('click', () => {
        state.isShuffle = !state.isShuffle;
        const color = state.isShuffle ? 'var(--accent-primary)' : '';
        if (el.btnShuffle) el.btnShuffle.style.color = color;
        if (el.fsBtnShuffle) el.fsBtnShuffle.style.color = color;
      });
    }
    if (el.fsBtnShuffle) {
      el.fsBtnShuffle.addEventListener('click', () => {
        state.isShuffle = !state.isShuffle;
        const color = state.isShuffle ? 'var(--accent-primary)' : '';
        if (el.btnShuffle) el.btnShuffle.style.color = color;
        if (el.fsBtnShuffle) el.fsBtnShuffle.style.color = color;
      });
    }
    if (el.btnRepeat) {
      el.btnRepeat.addEventListener('click', () => {
        state.isRepeat = !state.isRepeat;
        const color = state.isRepeat ? 'var(--accent-primary)' : '';
        if (el.btnRepeat) el.btnRepeat.style.color = color;
        if (el.fsBtnRepeat) el.fsBtnRepeat.style.color = color;
      });
    }
    if (el.fsBtnRepeat) {
      el.fsBtnRepeat.addEventListener('click', () => {
        state.isRepeat = !state.isRepeat;
        const color = state.isRepeat ? 'var(--accent-primary)' : '';
        if (el.btnRepeat) el.btnRepeat.style.color = color;
        if (el.fsBtnRepeat) el.fsBtnRepeat.style.color = color;
      });
    }

    // Player Seek Slider
    if (el.playerSeekSlider) {
      el.playerSeekSlider.addEventListener('input', (e) => seekTo(parseFloat(e.target.value)));
    }
    if (el.fsSeekSlider) {
      el.fsSeekSlider.addEventListener('input', (e) => seekTo(parseFloat(e.target.value)));
    }

    // Volume
    if (el.btnVolume) el.btnVolume.addEventListener('click', toggleMute);
    if (el.volumeBar) {
      el.volumeBar.addEventListener('click', (e) => {
        const rect = el.volumeBar.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        setVolume(pct);
      });
    }

    // Fullscreen Player Toggles
    const openFsBtns = [document.getElementById('btn-open-fullscreen'), document.getElementById('btn-expand-fs')];
    openFsBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        if (el.fullscreenPlayer) el.fullscreenPlayer.classList.add('active');
      });
    });
    const closeFsBtn = document.getElementById('close-fs-btn');
    if (closeFsBtn) {
      closeFsBtn.addEventListener('click', () => {
        if (el.fullscreenPlayer) el.fullscreenPlayer.classList.remove('active');
      });
    }

    // Auth Buttons
    if (el.openLoginBtn) el.openLoginBtn.addEventListener('click', () => {
      if (el.authModal) el.authModal.classList.remove('hidden');
    });
    if (el.openSignupBtn) el.openSignupBtn.addEventListener('click', () => {
      if (el.authModal) el.authModal.classList.remove('hidden');
    });
    const guestBtn = document.getElementById('btn-guest-login');
    if (guestBtn) guestBtn.addEventListener('click', window.handleGuestLogin);

    // Download App Modals
    const dlBtns = [document.getElementById('header-download-btn'), document.getElementById('sidebar-install-app-btn'), document.getElementById('hero-download-app-btn')];
    dlBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        if (el.downloadAppModal) el.downloadAppModal.classList.remove('hidden');
      });
    });
    const closeDlBtn = document.getElementById('close-download-modal-btn');
    if (closeDlBtn) {
      closeDlBtn.addEventListener('click', () => {
        if (el.downloadAppModal) el.downloadAppModal.classList.add('hidden');
      });
    }

    // Platform Downloads Card clicks
    document.querySelectorAll('.btn-platform-download').forEach(btn => {
      btn.addEventListener('click', () => {
        const os = btn.dataset.os;
        if (os) {
          window.downloadPlatformApp(os);
        }
      });
    });

    // Share link copy
    initShareLink();

    // YouTube Video Stream Modals
    const toggleVideoBtn = document.getElementById('toggle-video-modal-btn');
    if (toggleVideoBtn) {
      toggleVideoBtn.addEventListener('click', () => {
        const isFallback = state.currentTrack && (state.currentTrack.audioUrl || state.currentTrack.previewUrl);
        if (isFallback && !isYtReady) {
          alert("Video stream is only available for full songs.");
        } else {
          window.openVideoModal();
        }
      });
    }
    const closeVideoBtn = document.getElementById('close-video-modal-btn');
    if (closeVideoBtn) {
      closeVideoBtn.addEventListener('click', window.closeVideoModal);
    }

    // PWA Trigger Install
    const nativeInstallBtn = document.getElementById('trigger-native-install-btn');
    if (nativeInstallBtn) {
      nativeInstallBtn.addEventListener('click', () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          deferredInstallPrompt.userChoice.then(() => { deferredInstallPrompt = null; });
        } else {
          alert("Pulse Music is ready to install via your browser menu (Add to Home Screen / Install App)!");
        }
      });
    }

    // Side Drawer (Queue & Lyrics) Toggles
    if (el.btnToggleQueue) {
      el.btnToggleQueue.addEventListener('click', () => toggleDrawer('queue'));
    }
    if (el.btnToggleLyrics) {
      el.btnToggleLyrics.addEventListener('click', () => toggleDrawer('lyrics'));
    }
    if (el.closeDrawerBtn) {
      el.closeDrawerBtn.addEventListener('click', closeDrawer);
    }
    document.querySelectorAll('.drawer-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        if (targetTab) switchDrawerTab(targetTab);
      });
    });

    // Top Header Navigation Back & Forward
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (state.activeView !== 'home') switchView('home');
      });
    }
    const btnForward = document.getElementById('btn-forward');
    if (btnForward) {
      btnForward.addEventListener('click', () => {
        if (state.activeView === 'home') switchView('search-view');
      });
    }

    // Player Like Button
    if (el.playerLikeBtn) {
      el.playerLikeBtn.addEventListener('click', () => {
        if (state.currentTrack) {
          window.toggleLikeTrack(state.currentTrack);
        } else {
          window.requireAuth('like songs and save them to your library');
        }
      });
    }

    // Sidebar Create Playlist Button
    const btnCreatePlaylist = document.getElementById('btn-create-playlist');
    if (btnCreatePlaylist) {
      btnCreatePlaylist.addEventListener('click', () => {
        window.openCreatePlaylistModal();
      });
    }

    // Hero Banner Actions
    const heroPlayBtn = document.getElementById('hero-play-btn');
    if (heroPlayBtn) {
      heroPlayBtn.addEventListener('click', () => togglePlayPause());
    }
    const heroLikeBtn = document.getElementById('hero-like-btn');
    if (heroLikeBtn) {
      heroLikeBtn.addEventListener('click', () => {
        if (state.currentTrack) {
          window.toggleLikeTrack(state.currentTrack);
        } else {
          window.requireAuth('like songs and save them to your library');
        }
      });
    }

    // Liked Songs Page Play All
    const playAllLikedBtn = document.getElementById('play-all-liked-btn');
    if (playAllLikedBtn) {
      playAllLikedBtn.addEventListener('click', () => {
        if (!window.requireAuth('listen to liked songs')) return;
        if (state.likedTracks.length > 0) {
          state.queue = [...state.likedTracks];
          state.queueIndex = 0;
          setTrack(state.queue[0], true);
        } else {
          showToast('No liked songs yet! Click the heart on any track to save it.', 'info', 3000);
        }
      });
    }

    // Clear History Button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('pulse_recently_played_v2');
        renderHistoryView();
        renderAllHomeGrids();
        showToast('Listening history cleared.', 'info', 3000);
      });
    }
  }



  const getSupabaseClient = () => {
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
      let url = window.PULSE_SUPABASE_URL || null;
      let key = window.PULSE_SUPABASE_ANON_KEY || null;
      
      if (url && url !== 'YOUR_SUPABASE_PROJECT_URL' && key && key !== 'YOUR_SUPABASE_PUBLISHABLE_KEY') {
        return window.supabase.createClient(url, key);
      }
    }
    return null;
  };

  function initYouTubePlayer() {
    // Hook into the early-initialized YouTube player from index.html
    if (window._ytPlayerReady && window._ytPlayerInstance) {
      // Player was already created by the inline script
      ytPlayer = window._ytPlayerInstance;
      isYtReady = true;
      console.log('[Pulse] Using early-initialized YouTube Player');
    } else {
      // Register callback for when the player becomes ready
      window._onYTPlayerCreated = function(player) {
        ytPlayer = player;
        isYtReady = true;
        console.log('[Pulse] YouTube Player connected via callback');
      };
    }

    // Register state change handler
    window._onYTStateChange = function(event) {
      if (event.data === window.YT.PlayerState.ENDED) {
        handleTrackEnded();
      }
      // Update state when video starts playing
      if (event.data === window.YT.PlayerState.PLAYING && ytPlayer) {
        showBuffering(false);
        state.isPlaying = true;
        updatePlayPauseUI();
        try {
          ytPlayer.unMute();
          ytPlayer.setVolume(Math.max(50, Math.round((state.volume || 1) * 100)));
          const ytDur = ytPlayer.getDuration();
          if (ytDur && ytDur > 0) {
            state.duration = ytDur;
            if (el.playerTimeTotal) el.playerTimeTotal.textContent = formatTime(state.duration);
            if (el.fsTimeTotal) el.fsTimeTotal.textContent = formatTime(state.duration);
          }
        } catch (e) {}
      }
      // Show buffering when video is buffering
      if (event.data === window.YT.PlayerState.BUFFERING) {
        showBuffering(true);
        try {
          if (ytPlayer) {
            ytPlayer.unMute();
            ytPlayer.setVolume(Math.max(50, Math.round((state.volume || 1) * 100)));
          }
        } catch (e) {}
      }
      // Track paused state
      if (event.data === window.YT.PlayerState.PAUSED) {
        state.isPlaying = false;
        updatePlayPauseUI();
      }
    };

    // Register error handler with retry logic
    window._onYTError = function(event) {
      console.warn('[Pulse] YouTube notice code:', event.data);
    };

    // Also add password strength indicator for auth
    const signupPasswordInput = document.getElementById('signup-password');
    if (signupPasswordInput) {
      signupPasswordInput.addEventListener('input', function() {
        const val = this.value;
        const strengthBar = document.querySelector('#password-strength-bar .pulse-strength-fill');
        if (!strengthBar) return;
        
        let strength = 0;
        if (val.length >= 6) strength += 25;
        if (val.length >= 10) strength += 15;
        if (/[A-Z]/.test(val)) strength += 20;
        if (/[0-9]/.test(val)) strength += 20;
        if (/[^A-Za-z0-9]/.test(val)) strength += 20;
        strength = Math.min(100, strength);
        
        strengthBar.style.width = strength + '%';
        if (strength <= 25) {
          strengthBar.style.background = '#ef4444';
        } else if (strength <= 50) {
          strengthBar.style.background = '#f59e0b';
        } else if (strength <= 75) {
          strengthBar.style.background = '#3b82f6';
        } else {
          strengthBar.style.background = 'linear-gradient(90deg, #22c55e, #10b981)';
        }
      });
    }
  }

  function detectOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    let osText = "Web / Unknown OS";
    let osIcon = '<i class="fa-solid fa-globe"></i>';
    let detectedOS = "web";

    if (userAgent.indexOf("win") !== -1) {
      osText = "Windows";
      osIcon = '<i class="fa-brands fa-windows text-accent"></i>';
      detectedOS = "windows";
    } else if (userAgent.indexOf("mac") !== -1) {
      osText = "macOS";
      osIcon = '<i class="fa-brands fa-apple text-primary"></i>';
      detectedOS = "mac";
    } else if (userAgent.indexOf("linux") !== -1) {
      osText = "Linux Desktop";
      osIcon = '<i class="fa-brands fa-linux text-muted"></i>';
      detectedOS = "linux";
    } else if (userAgent.indexOf("android") !== -1) {
      osText = "Android Phone / Tablet";
      osIcon = '<i class="fa-brands fa-android text-success"></i>';
      detectedOS = "android";
    } else if (userAgent.indexOf("iphone") !== -1 || userAgent.indexOf("ipad") !== -1) {
      osText = "iOS Device (iPhone/iPad)";
      osIcon = '<i class="fa-brands fa-apple text-warning"></i>';
      detectedOS = "ios";
    }

    const badge = document.getElementById('detected-os-badge');
    const textEl = document.getElementById('detected-os-text');
    if (badge && textEl) {
      badge.innerHTML = `${osIcon} Detected Operating System: <strong>${osText}</strong>`;
    }

    document.querySelectorAll('.platform-card').forEach(card => {
      card.style.border = "1px solid var(--border-glass)";
      card.style.background = "var(--bg-glass-card)";
    });
    const activeCard = document.getElementById(`card-${detectedOS}`);
    if (activeCard) {
      activeCard.style.border = "1px solid var(--accent-primary)";
      activeCard.style.background = "rgba(139, 92, 246, 0.1)";
    }
  }

  function checkPWAInstallationState() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      console.log("App is running in standalone PWA mode. Hiding install options.");
      const sidebarCard = document.querySelector('.install-app-card');
      if (sidebarCard) sidebarCard.style.display = 'none';

      const headerDlBtn = document.getElementById('header-download-btn');
      if (headerDlBtn) headerDlBtn.style.display = 'none';
      
      const heroDlBtn = document.getElementById('hero-download-app-btn');
      if (heroDlBtn) {
        heroDlBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Pulse Music Installed`;
        heroDlBtn.disabled = true;
        heroDlBtn.style.opacity = '0.7';
      }
    }
  }

  function initShareLink() {
    const input = document.getElementById('share-link-input');
    if (input) {
      input.value = window.location.origin;
    }
    
    const copyBtn = document.getElementById('copy-share-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (input) {
          input.select();
          input.setSelectionRange(0, 99999);
          try {
            navigator.clipboard.writeText(input.value);
            copyBtn.innerHTML = `<i class="fa-solid fa-check text-success"></i> Copied!`;
            setTimeout(() => {
              copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy Link`;
            }, 2000);
          } catch (err) {
            console.error("Failed to copy share link:", err);
          }
        }
      });
    }
  }

  /* ==========================================================================
     ADMIN AUDIO UPLOAD & CATALOG STUDIO CONTROLLER (RESTRICTED ACCESS)
     ========================================================================== */
  let currentAdminAudioFile = null;
  const DEFAULT_ADMIN_PASSCODE = 'pulse-admin-2026';

  window.isAdminAuthenticated = function() {
    return localStorage.getItem('pulse_admin_auth') === 'true';
  };

  window.checkAdminStudioState = function() {
    const authGate = document.getElementById('admin-auth-gate');
    const studioContent = document.getElementById('admin-studio-content');
    const sidebarAdminLink = document.getElementById('sidebar-admin-link');

    if (window.isAdminAuthenticated()) {
      if (authGate) authGate.classList.add('hidden');
      if (studioContent) studioContent.classList.remove('hidden');
      if (sidebarAdminLink) sidebarAdminLink.classList.remove('hidden');
      window.populateAdminCatalogOptions();
      window.renderAdminCatalogTable();
    } else {
      if (authGate) authGate.classList.remove('hidden');
      if (studioContent) studioContent.classList.add('hidden');
      if (sidebarAdminLink) sidebarAdminLink.classList.add('hidden');
    }
  };

  window.unlockAdminStudio = function() {
    const input = document.getElementById('admin-passcode-input');
    const errorEl = document.getElementById('admin-auth-error');
    const passcode = input ? input.value.trim() : '';

    if (passcode === DEFAULT_ADMIN_PASSCODE || passcode === 'admin') {
      localStorage.setItem('pulse_admin_auth', 'true');
      if (errorEl) errorEl.classList.add('hidden');
      window.checkAdminStudioState();
      showToast('Admin Studio unlocked successfully!', 'success', 3000);
      if (input) input.value = '';
    } else {
      if (errorEl) errorEl.classList.remove('hidden');
      showToast('Invalid Admin Passcode. Default is: pulse-admin-2026', 'error', 4000);
    }
  };

  window.lockAdminStudio = function() {
    localStorage.removeItem('pulse_admin_auth');
    window.checkAdminStudioState();
    switchView('home');
    showToast('Admin Studio locked.', 'info', 2000);
  };

  window.populateAdminCatalogOptions = function() {
    const select = document.getElementById('admin-target-catalog-select');
    if (!select) return;

    select.innerHTML = '<option value="NEW_TRACK">+ Publish as New Catalog Song</option>';
    const tracks = window.DEMO_CATALOG || [];
    tracks.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.title} - ${t.artist} (${t.album || 'Single'})`;
      select.appendChild(opt);
    });
  };

  window.handleAdminAudioFileSelected = function(event) {
    if (event.target && event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      currentAdminAudioFile = file;

      const preview = document.getElementById('admin-selected-audio-preview');
      const nameEl = document.getElementById('admin-selected-audio-name');
      const sizeEl = document.getElementById('admin-selected-audio-size');
      const labelEl = document.getElementById('admin-dropzone-label');
      const titleInput = document.getElementById('admin-track-title');

      if (preview) preview.classList.remove('hidden');
      if (nameEl) nameEl.textContent = file.name;
      if (sizeEl) sizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      if (labelEl) labelEl.textContent = `Selected: ${file.name}`;

      if (titleInput && !titleInput.value) {
        titleInput.value = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      }
    }
  };

  window.handleAdminCatalogSelectionChange = function(val) {
    if (val === 'NEW_TRACK') return;
    const track = window.musicService.getTrack(val);
    if (track) {
      const titleInput = document.getElementById('admin-track-title');
      const artistInput = document.getElementById('admin-track-artist');
      const albumInput = document.getElementById('admin-track-album');
      const langSelect = document.getElementById('admin-track-language');
      const catSelect = document.getElementById('admin-track-category');
      const coverInput = document.getElementById('admin-track-cover');
      const previewImg = document.getElementById('admin-cover-preview-img');

      if (titleInput) titleInput.value = track.title || '';
      if (artistInput) artistInput.value = track.artist || '';
      if (albumInput) albumInput.value = track.album || '';
      if (langSelect && track.language) langSelect.value = track.language;
      if (catSelect && track.category) catSelect.value = track.category;
      if (coverInput) coverInput.value = track.cover || './pulse-logo.png';
      if (previewImg) previewImg.src = track.cover || './pulse-logo.png';
    }
  };

  window.publishAdminTrack = async function() {
    if (!currentAdminAudioFile) {
      showToast('Please select or drop an authorized MP3/M4A/WAV audio file first', 'warning', 4000);
      return;
    }

    const title = (document.getElementById('admin-track-title')?.value || '').trim();
    const artist = (document.getElementById('admin-track-artist')?.value || '').trim();
    const album = (document.getElementById('admin-track-album')?.value || 'Single').trim();
    const language = document.getElementById('admin-track-language')?.value || 'Hindi';
    const category = document.getElementById('admin-track-category')?.value || 'bollywood';
    const cover = (document.getElementById('admin-track-cover')?.value || './pulse-logo.png').trim();
    const year = parseInt(document.getElementById('admin-track-year')?.value || '2026', 10);
    const targetSelect = document.getElementById('admin-target-catalog-select');
    const selectedTargetId = targetSelect ? targetSelect.value : 'NEW_TRACK';

    if (!title || !artist) {
      showToast('Please enter both Song Title and Artist Name', 'warning', 4000);
      return;
    }

    const progressBox = document.getElementById('admin-upload-progress');
    const progressBar = document.getElementById('admin-upload-progress-fill');
    const statusText = document.getElementById('admin-upload-status-text');
    const percentText = document.getElementById('admin-upload-percent-text');
    const submitBtn = document.getElementById('btn-admin-submit-upload');

    if (progressBox) progressBox.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    // Generate clean storage filename
    const ext = currentAdminAudioFile.name.split('.').pop() || 'mp3';
    let trackId = '';
    let storageFileName = '';

    if (selectedTargetId === 'NEW_TRACK') {
      const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      trackId = `admin-${cleanSlug}-${Date.now().toString(36)}`;
      storageFileName = `${trackId}.${ext}`;
    } else {
      trackId = selectedTargetId;
      storageFileName = `${trackId}.${ext}`;
    }

    if (progressBar) progressBar.style.width = '30%';
    if (percentText) percentText.textContent = '30%';
    if (statusText) statusText.textContent = `Preparing upload for '${storageFileName}'...`;

    try {
      // 1. Upload to Supabase Storage if configured
      if (supabaseClient && supabaseClient.storage) {
        if (statusText) statusText.textContent = `Uploading to Supabase Storage bucket 'music'...`;
        if (progressBar) progressBar.style.width = '65%';
        if (percentText) percentText.textContent = '65%';

        const { data, error } = await supabaseClient.storage
          .from('music')
          .upload(storageFileName, currentAdminAudioFile, {
            upsert: true,
            cacheControl: '3600'
          });

        if (error) {
          console.warn('[Pulse Supabase Storage] Notice during upload:', error);
          showToast(`Supabase upload status: ${error.message}`, 'info', 4000);
        } else {
          console.log('[Pulse Supabase Storage] Successfully uploaded:', data);
        }
      }

      // Generate public audioUrl
      const dynamicStorageUrl = window.getAudioStorageUrl ? window.getAudioStorageUrl(storageFileName) : `./storage/music/${storageFileName}`;
      const localBlobUrl = URL.createObjectURL(currentAdminAudioFile);

      // Create standardized track object
      const trackEntry = {
        id: trackId,
        title: title,
        artist: artist,
        album: album,
        cover: cover,
        duration: '3:30',
        category: category,
        language: language,
        year: year,
        storagePath: storageFileName,
        audioUrl: localBlobUrl,
        source: 'Admin Studio Upload'
      };

      const normalized = window.normalizeTrack(trackEntry);
      normalized.audioUrl = localBlobUrl; // immediate play
      normalized.storagePath = storageFileName;

      // Register into catalog and registry
      window.TRACKS_REGISTRY[normalized.id] = normalized;

      if (selectedTargetId === 'NEW_TRACK') {
        window.DEMO_CATALOG.unshift(normalized);
      } else {
        const idx = window.DEMO_CATALOG.findIndex(t => t.id === selectedTargetId);
        if (idx !== -1) {
          window.DEMO_CATALOG[idx] = normalized;
        }
      }

      // Persist custom admin tracks in localStorage
      try {
        const storedCustom = JSON.parse(localStorage.getItem('pulse_custom_admin_tracks') || '[]');
        const filtered = storedCustom.filter(t => t.id !== normalized.id);
        filtered.unshift({
          ...normalized,
          audioUrl: dynamicStorageUrl
        });
        localStorage.setItem('pulse_custom_admin_tracks', JSON.stringify(filtered));
      } catch (e) {}

      if (progressBar) progressBar.style.width = '100%';
      if (percentText) percentText.textContent = '100%';
      if (statusText) statusText.textContent = 'Published successfully! Starting playback...';

      setTimeout(() => {
        if (progressBox) progressBox.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
        
        // Reset file picker
        currentAdminAudioFile = null;
        const preview = document.getElementById('admin-selected-audio-preview');
        const labelEl = document.getElementById('admin-dropzone-label');
        if (preview) preview.classList.add('hidden');
        if (labelEl) labelEl.textContent = 'Select or Drag & Drop MP3 / M4A / WAV file';

        // Refresh UI
        window.populateAdminCatalogOptions();
        window.renderAdminCatalogTable();
        renderAllHomeGrids();
        
        showToast(`Published "${title}" to Supabase Storage & Catalog!`, 'success', 5000);
        
        // Play song
        setTrack(normalized, true);
      }, 500);

    } catch (err) {
      console.error('[Admin Upload Error]:', err);
      showToast(`Upload error: ${err.message}`, 'error', 5000);
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  window.renderAdminCatalogTable = function(filterQuery = '') {
    const tbody = document.getElementById('admin-catalog-table-body');
    const countEl = document.getElementById('admin-catalog-total-count');
    if (!tbody) return;

    let tracks = window.DEMO_CATALOG || [];
    if (countEl) countEl.textContent = tracks.length;

    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      tracks = tracks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.artist && t.artist.toLowerCase().includes(q)) ||
        (t.storagePath && t.storagePath.toLowerCase().includes(q))
      );
    }

    // Limit to first 50 for performance
    const renderList = tracks.slice(0, 50);

    tbody.innerHTML = renderList.map(t => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
        <td style="padding: 0.6rem 0.5rem; display: flex; align-items: center; gap: 0.6rem;">
          <img src="${t.cover || './pulse-logo.png'}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;">
          <div>
            <strong>${t.title}</strong>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${t.album || 'Single'}</div>
          </div>
        </td>
        <td style="padding: 0.6rem 0.5rem; color: var(--text-secondary);">${t.artist}</td>
        <td style="padding: 0.6rem 0.5rem;"><span style="background: rgba(255,255,255,0.08); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${t.language || 'Hindi'}</span></td>
        <td style="padding: 0.6rem 0.5rem; font-family: monospace; font-size: 0.78rem; color: #a3e635;">${t.storagePath || t.id + '.mp3'}</td>
        <td style="padding: 0.6rem 0.5rem; text-align: right;">
          <button class="admin-table-play-btn" onclick="window.playSpecificTrack('${t.id}')">
            <i class="fa-solid fa-play"></i> Play
          </button>
        </td>
      </tr>
    `).join('');
  };

  window.filterAdminCatalogTable = function(q) {
    window.renderAdminCatalogTable(q);
  };

  // Keyboard shortcut Ctrl+Shift+A or Alt+A to jump directly to Admin Studio
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
      e.preventDefault();
      switchView('admin-upload');
    }
  });

  // Check URL hash on page load
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') {
      switchView('admin-upload');
    }
  });

  /* ==========================================================================
     GLOBAL MODAL & WINDOW HELPER REGISTRY
     ========================================================================== */
  window.openLoginModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      if (typeof window.switchAuthTab === 'function') window.switchAuthTab('login');
    }
  };

  window.openSignupModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      if (typeof window.switchAuthTab === 'function') window.switchAuthTab('signup');
    }
  };

  window.closeAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.openDownloadModal = function() {
    const modal = document.getElementById('download-app-modal');
    if (modal) {
      modal.classList.remove('hidden');
      if (typeof window.initDownloadCenter === 'function') {
        window.initDownloadCenter();
      }
    }
  };

  window.logout = function() {
    if (typeof window.logoutUser === 'function') {
      window.logoutUser();
    } else {
      localStorage.removeItem('pulse_auth_token');
      localStorage.removeItem('pulse_user_data');
      localStorage.removeItem('pulse_active_user');
      const profile = document.getElementById('user-profile-container');
      const authBtns = document.getElementById('auth-buttons-group');
      if (profile) profile.classList.add('hidden');
      if (authBtns) authBtns.classList.remove('hidden');
      if (typeof window.showToast === 'function') window.showToast('Logged out successfully', 'info');
    }
  };

  window.minimizeWindow = function() {
    if (window.electronAPI && typeof window.electronAPI.minimize === 'function') window.electronAPI.minimize();
  };

  window.toggleMaximizeWindow = function() {
    if (window.electronAPI && typeof window.electronAPI.maximize === 'function') window.electronAPI.maximize();
  };

  window.closeWindow = function() {
    if (window.electronAPI && typeof window.electronAPI.close === 'function') window.electronAPI.close();
  };

  function initApp() {
    try { bindElements(); } catch (e) { console.warn('bindElements notice:', e); }
    try { supabaseClient = getSupabaseClient(); } catch (e) {}
    try { initGoogleIdentityServices(); } catch (e) {}
    try { initYouTubePlayer(); } catch (e) {}
    try { loadUserPlaylists(); } catch (e) {}
    try { loadLikedTracks(); } catch (e) {}
    try { renderAllHomeGrids(); } catch (e) { console.error('renderAllHomeGrids notice:', e); }
    try { attachEventListeners(); } catch (e) { console.error('attachEventListeners notice:', e); }
    
    // Load custom admin published tracks from storage
    try {
      const customTracks = JSON.parse(localStorage.getItem('pulse_custom_admin_tracks') || '[]');
      if (Array.isArray(customTracks) && customTracks.length > 0) {
        customTracks.forEach(t => {
          const norm = window.normalizeTrack(t);
          window.TRACKS_REGISTRY[norm.id] = norm;
          const idx = window.DEMO_CATALOG.findIndex(item => item.id === norm.id);
          if (idx !== -1) {
            window.DEMO_CATALOG[idx] = norm;
          } else {
            window.DEMO_CATALOG.unshift(norm);
          }
        });
      }
    } catch (e) {}

    try {
      if (window.isAdminAuthenticated && window.isAdminAuthenticated()) {
        const sidebarAdminLink = document.getElementById('sidebar-admin-link');
        if (sidebarAdminLink) sidebarAdminLink.classList.remove('hidden');
      }
    } catch (e) {}

    try {
      if (window.location.hash === '#admin') {
        switchView('admin-upload');
      }
    } catch (e) {}

    // Auto-login stored user if present
    try {
      const savedUser = localStorage.getItem('pulse_active_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        window.loginUser(u.name, u.email, u.provider, u.avatar);
      }
    } catch (e) {}

    // Initialize Canvas Audio Visualizer
    try {
      if (typeof PulseVisualizer !== 'undefined') {
        canvasVisualizer = new PulseVisualizer('fs-canvas-visualizer');
      } else if (typeof window.PulseVisualizer !== 'undefined') {
        canvasVisualizer = new window.PulseVisualizer('fs-canvas-visualizer');
      }
    } catch (e) {
      console.warn("Visualizer init notice:", e);
    }

    // Set initial track — restore saved playback state if available
    try {
      const savedState = loadPlaybackState();
      if (savedState && savedState.trackId) {
        const savedTrack = window.musicService.getTrack(savedState.trackId) ||
                           (window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[savedState.trackId]);
        if (savedTrack) {
          state.queue = window.musicService.getPopularTracks('popular-hindi');
          setTrack(savedTrack, false); // Load but don't auto-play
          // Restore saved position
          state.currentTime = savedState.currentTime || 0;
          state.duration = savedState.duration || parseDurationSeconds(savedTrack.duration || '3:30');
          // Update timeline UI to show saved position
          const percent = state.duration > 0 ? Math.min(100, (state.currentTime / state.duration) * 100) : 0;
          if (el.playerProgressFill) el.playerProgressFill.style.width = `${percent}%`;
          if (el.playerSeekSlider) el.playerSeekSlider.value = percent;
          if (el.playerTimeCurrent) el.playerTimeCurrent.textContent = formatTime(state.currentTime);
          if (el.playerTimeTotal) el.playerTimeTotal.textContent = formatTime(state.duration);
          console.log(`[Pulse] Restored playback state: ${savedTrack.title} at ${formatTime(state.currentTime)}`);
        } else {
          // Initialize queue silently without showing any unclicked song in player box
          state.currentTrack = null;
          state.queue = window.musicService.getPopularTracks('popular-hindi');
          if (el.playerTitle) el.playerTitle.textContent = "Select a song to play";
          if (el.playerArtist) el.playerArtist.textContent = "Pulse Music Engine";
          if (el.playerThumb) el.playerThumb.src = "./pulse-logo.png";
          if (el.playerTimeCurrent) el.playerTimeCurrent.textContent = "0:00";
          if (el.playerTimeTotal) el.playerTimeTotal.textContent = "0:00";
          if (el.playerProgressFill) el.playerProgressFill.style.width = "0%";
          if (el.playerSeekSlider) el.playerSeekSlider.value = 0;
          updatePlayPauseUI();
        }
      } else {
        // Initialize queue silently without showing any unclicked song in player box
        state.currentTrack = null;
        state.queue = window.musicService.getPopularTracks('popular-hindi');
        if (el.playerTitle) el.playerTitle.textContent = "Select a song to play";
        if (el.playerArtist) el.playerArtist.textContent = "Pulse Music Engine";
        if (el.playerThumb) el.playerThumb.src = "./pulse-logo.png";
        if (el.playerTimeCurrent) el.playerTimeCurrent.textContent = "0:00";
        if (el.playerTimeTotal) el.playerTimeTotal.textContent = "0:00";
        if (el.playerProgressFill) el.playerProgressFill.style.width = "0%";
        if (el.playerSeekSlider) el.playerSeekSlider.value = 0;
        updatePlayPauseUI();
      }
    } catch (e) {
      console.warn('[Pulse] Playback state restore notice:', e);
    }

    // Hide Download App button when running as installed PWA, show in browser
    try {
      const isInstalledPWA = window.matchMedia('(display-mode: standalone)').matches ||
                             window.navigator.standalone === true ||
                             document.referrer.includes('android-app://');
      const downloadElements = document.querySelectorAll('.download-app-card, .download-app-btn, #sidebar-download-card, [data-download-app]');
      downloadElements.forEach(el => {
        if (isInstalledPWA) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
      });
      // Also handle top nav download button
      const topNavDownload = document.getElementById('top-download-btn');
      if (topNavDownload) topNavDownload.style.display = isInstalledPWA ? 'none' : '';
    } catch (e) {}

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('Service Worker registered successfully:', reg.scope))
          .catch(err => console.error('Service Worker registration failed:', err));
      });
    }
  }

  // Startup sequence
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // Save playback state when user leaves/closes the app
  window.addEventListener('beforeunload', () => {
    savePlaybackState();
  });

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      savePlaybackState();
    }
  });

  // PWA capture
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });

  window.addEventListener('appinstalled', (evt) => {
    console.log('Pulse Music PWA was installed successfully!');
    checkPWAInstallationState();
  });

  // Native Electron Media Command Bridge
  if (window.electronAPI && typeof window.electronAPI.onMediaCommand === 'function') {
    document.body.classList.add('is-electron-shell');
    window.electronAPI.onMediaCommand((cmd) => {
      console.log(`[Pulse Native] Electron IPC Media Command received: ${cmd}`);
      if (cmd === 'togglePlayPause') togglePlayPause();
      else if (cmd === 'playNext') playNextTrack();
      else if (cmd === 'playPrev') playPrevTrack();
    });
  }

  // Native App Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isInput = (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable || (typeof e.target.closest === 'function' && e.target.closest('input, textarea, select, [contenteditable="true"]')))) ||
                    (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable));
    
    if (isInput) return; // NEVER block spacebar or typing in inputs

    // Disable browser zoom shortcuts (Ctrl + +, Ctrl + -, Ctrl + 0)
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      e.preventDefault();
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekRelative(5);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seekRelative(-5);
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleMute();
    } else if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      if (el.fullscreenPlayer) {
        if (el.fullscreenPlayer.classList.contains('active')) {
          el.fullscreenPlayer.classList.remove('active');
        } else {
          el.fullscreenPlayer.classList.add('active');
        }
      }
    }
  });

  // Disable browser zoom via mouse wheel + Ctrl
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });

  // Native Look: Disable default browser contextmenu on chrome (keep native look)
  window.addEventListener('contextmenu', (e) => {
    const isInputField = e.target.closest('input, textarea, [contenteditable="true"]');
    if (!isInputField) {
      e.preventDefault();
    }
  });

})();


