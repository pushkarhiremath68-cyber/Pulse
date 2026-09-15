/**
 * Pulse Music - Cyber Security, Sanitization & Defense Shield
 * Provides enterprise-grade input sanitization, HTML entity encoding,
 * URL protocol verification, prototype pollution defense, and clickjacking protection.
 */

const HTML_ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

const DANGEROUS_PROTOCOLS = new Set([
  'javascript:',
  'vbscript:',
  'data:text/html',
  'file:',
  'shell:',
  'powershell:',
  'cmd:',
  'ms-msdt:'
]);

/**
 * Encodes special characters in a string to safe HTML entities to prevent DOM XSS.
 * @param {*} unsafe
 * @returns {string} Safe HTML string
 */
export function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  const str = String(unsafe);
  return str.replace(/[&<>"'`=\/]/g, (s) => HTML_ENTITY_MAP[s] || s);
}

/**
 * Validates a URL against dangerous protocols.
 * Returns the URL if safe, or a fallback safe URL if dangerous.
 * @param {string} url
 * @param {string} fallback
 * @returns {string}
 */
export function sanitizeUrl(url, fallback = 'about:blank') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim().toLowerCase();
  
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(protocol)) {
      console.warn('[Pulse Security Shield] Blocked dangerous protocol:', protocol);
      return fallback;
    }
  }

  // Allow relative URLs, http, https, audio/image blob:, and safe data:image/ URIs
  if (
    url.startsWith('/') ||
    url.startsWith('./') ||
    url.startsWith('../') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:image/') ||
    url.startsWith('data:audio/')
  ) {
    return url;
  }

  // Block any unknown protocol
  if (url.includes(':') && !url.startsWith('http')) {
    console.warn('[Pulse Security Shield] Blocked unverified custom protocol in URL:', url);
    return fallback;
  }

  return url;
}

/**
 * Tagged template literal that auto-escapes all dynamic interpolated variables.
 * Usage: safeHtml`<div>${userInput}</div>`
 */
export function safeHtml(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const val = values[i];
      if (val && typeof val === 'object' && val.__htmlSafe) {
        result += val.content;
      } else {
        result += escapeHtml(val);
      }
    }
  }
  return result;
}

/**
 * Marks trusted pre-sanitized markup as safe so `safeHtml` won't double-escape it.
 */
export function markSafeHtml(htmlContent) {
  return {
    __htmlSafe: true,
    content: String(htmlContent)
  };
}

/**
 * Recursively deep-sanitizes objects to protect against prototype pollution.
 * Strips '__proto__', 'constructor', and 'prototype' properties.
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = Object.create(null);
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      console.warn('[Pulse Security Shield] Blocked prototype pollution attempt on key:', key);
      continue;
    }
    clean[key] = sanitizeObject(obj[key]);
  }
  return clean;
}

/**
 * Defends against iframe framing and clickjacking when outside trusted embeds.
 */
export function preventClickjacking() {
  if (typeof window === 'undefined') return;
  try {
    if (window.top !== window.self) {
      // Check if embedded in an allowed context
      const isYouTubeEmbed = window.location.ancestorOrigins &&
        Array.from(window.location.ancestorOrigins).some(origin => origin.includes('youtube.com'));

      if (!isYouTubeEmbed && !window.location.protocol.startsWith('capacitor')) {
        console.warn('[Pulse Security Shield] Clickjacking framing detected. Breaking out to top window.');
        window.top.location = window.self.location;
      }
    }
  } catch (e) {
    // Cross-origin framing blocked access to top.location; force breakout
    try {
      window.top.location = window.location.href;
    } catch (_) {}
  }
}

// Auto-run frame protection
if (typeof window !== 'undefined') {
  preventClickjacking();
}
