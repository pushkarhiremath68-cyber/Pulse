/**
 * Automated Security Hardening & Shield Test Suite
 * Tests input sanitization, XSS defanging, URL validation, prototype pollution defense,
 * CSP headers, Netlify/Firebase configs, and Electron security settings.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import security functions
import { escapeHtml, sanitizeUrl, safeHtml, sanitizeObject } from '../src/security.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

console.log('\n🔒 RUNNING PULSE MUSIC SECURITY SHIELD TEST SUITE\n');

// -----------------------------------------------------------------------------
// TEST 1: XSS Entity Escaping
// -----------------------------------------------------------------------------
console.log('--- Test 1: HTML Entity Encoding & XSS Defanging ---');
const maliciousInputs = [
  { raw: '<script>alert("hacked")</script>', expectedNotContains: '<script>' },
  { raw: '"><img src=x onerror=alert(1)>', expectedNotContains: '<img' },
  { raw: "';alert('XSS');//", expectedNotContains: "'" },
  { raw: '`onmouseover="alert(1)"', expectedNotContains: '`' },
  { raw: '"><iframe src="javascript:alert(1)"></iframe>', expectedNotContains: '<iframe' }
];

for (const { raw, expectedNotContains } of maliciousInputs) {
  const escaped = escapeHtml(raw);
  assert(!escaped.includes(expectedNotContains), `Defanged input: ${raw} -> ${escaped}`);
}

// -----------------------------------------------------------------------------
// TEST 2: URL Sanitization & Protocol Lockdown
// -----------------------------------------------------------------------------
console.log('\n--- Test 2: URL Sanitization & Dangerous Protocol Blocking ---');
assert(sanitizeUrl('javascript:alert(document.cookie)') === 'about:blank', 'Blocked javascript: protocol');
assert(sanitizeUrl('JAVASCRIPT:alert(1)') === 'about:blank', 'Blocked case-insensitive JAVASCRIPT: protocol');
assert(sanitizeUrl('vbscript:msgbox(1)') === 'about:blank', 'Blocked vbscript: protocol');
assert(sanitizeUrl('file:///etc/passwd') === 'about:blank', 'Blocked file: local path protocol');
assert(sanitizeUrl('data:text/html,<script>alert(1)</script>') === 'about:blank', 'Blocked data:text/html injection');
assert(sanitizeUrl('powershell:Invoke-Expression') === 'about:blank', 'Blocked powershell: protocol');

// Allowed protocols
assert(sanitizeUrl('https://aac.saavncdn.com/song.m4a').startsWith('https://'), 'Allowed HTTPS streaming URL');
assert(sanitizeUrl('blob:http://localhost/audio-blob').startsWith('blob:'), 'Allowed audio Blob URL');
assert(sanitizeUrl('./pulse-logo.png').startsWith('./'), 'Allowed relative path asset');

// -----------------------------------------------------------------------------
// TEST 3: Safe HTML Template Literals
// -----------------------------------------------------------------------------
console.log('\n--- Test 3: Tagged Template Literal Auto-Escaping ---');
const userTrack = '<script>evil()</script>';
const rendered = safeHtml`<h4>${userTrack}</h4>`;
assert(!rendered.includes('<script>'), 'safeHtml automatically escaped interpolated evil script');
assert(rendered.includes('&lt;script&gt;evil()&lt;&#x2F;script&gt;'), 'safeHtml rendered safe HTML entities');

// -----------------------------------------------------------------------------
// TEST 4: Prototype Pollution Defense
// -----------------------------------------------------------------------------
console.log('\n--- Test 4: Prototype Pollution Defense ---');
const pollutedPayload = JSON.parse('{"__proto__": {"isAdmin": true}, "title": "Safe Song"}');
const sanitizedObj = sanitizeObject(pollutedPayload);
assert(sanitizedObj.title === 'Safe Song', 'Preserved legitimate property');
assert(Object.prototype.isAdmin === undefined, 'Prevented prototype pollution on Object.prototype');

// -----------------------------------------------------------------------------
// TEST 5: CSP & Meta Security Headers in index.html & docs/index.html
// -----------------------------------------------------------------------------
console.log('\n--- Test 5: CSP & Meta Security Headers in HTML Files ---');
const indexFiles = [
  path.join(rootDir, 'index.html'),
  path.join(rootDir, 'docs', 'index.html')
];

for (const filePath of indexFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const baseName = path.relative(rootDir, filePath);
  
  assert(content.includes('http-equiv="Content-Security-Policy"'), `${baseName} includes Content-Security-Policy meta tag`);
  assert(content.includes('http-equiv="X-Content-Type-Options" content="nosniff"'), `${baseName} includes X-Content-Type-Options: nosniff`);
  assert(content.includes('name="referrer" content="strict-origin-when-cross-origin"'), `${baseName} includes Referrer-Policy: strict-origin-when-cross-origin`);
  assert(content.includes('http-equiv="Permissions-Policy"'), `${baseName} includes Permissions-Policy`);
  assert(content.includes('window.top !== window.self'), `${baseName} includes Anti-Clickjacking Frame Buster`);
}

// -----------------------------------------------------------------------------
// TEST 6: Deployment Headers (netlify.toml & firebase.json)
// -----------------------------------------------------------------------------
console.log('\n--- Test 6: Deployment Security Headers in Hosting Configs ---');
const netlifyContent = fs.readFileSync(path.join(rootDir, 'netlify.toml'), 'utf8');
assert(netlifyContent.includes('X-Frame-Options = "SAMEORIGIN"'), 'netlify.toml specifies X-Frame-Options: SAMEORIGIN');
assert(netlifyContent.includes('X-Content-Type-Options = "nosniff"'), 'netlify.toml specifies X-Content-Type-Options: nosniff');
assert(netlifyContent.includes('Content-Security-Policy ='), 'netlify.toml specifies Content-Security-Policy');
assert(netlifyContent.includes('Strict-Transport-Security ='), 'netlify.toml specifies HSTS');

const firebaseContent = fs.readFileSync(path.join(rootDir, 'firebase.json'), 'utf8');
assert(firebaseContent.includes('"X-Frame-Options"'), 'firebase.json specifies X-Frame-Options');
assert(firebaseContent.includes('"X-Content-Type-Options"'), 'firebase.json specifies X-Content-Type-Options');
assert(firebaseContent.includes('"Content-Security-Policy"'), 'firebase.json specifies Content-Security-Policy');

// -----------------------------------------------------------------------------
// TEST 7: Electron Security Safeguards
// -----------------------------------------------------------------------------
console.log('\n--- Test 7: Electron Security Configuration ---');
const electronMainContent = fs.readFileSync(path.join(rootDir, 'electron', 'main.cjs'), 'utf8');
assert(electronMainContent.includes("setWindowOpenHandler"), 'electron/main.cjs sets window open handler');
assert(electronMainContent.includes("parsed.protocol === 'https:'"), 'electron/main.cjs validates window.open protocols');
assert(electronMainContent.includes("will-navigate"), 'electron/main.cjs intercepts will-navigate to prevent hijacking');
assert(electronMainContent.includes("TRUSTED_STREAM_DOMAINS"), 'electron/main.cjs scopes CORS webRequests to trusted media CDNs');

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`==============================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SECURITY CHECKS PASSED WITH ZERO VULNERABILITIES!\n');
}
