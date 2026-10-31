import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove gate-phone-signin-btn
const gatePhoneRegex = /\s*<button id="gate-phone-signin-btn"[\s\S]*?<\/button>/;
if (gatePhoneRegex.test(html)) {
  html = html.replace(gatePhoneRegex, '');
  console.log('Removed gate-phone-signin-btn');
} else {
  console.log('gate-phone-signin-btn not found');
}

// 2. Remove Phone auth section in auth modal
const phoneSectionRegex = /\s*<div class="auth-method-divider">[\s\S]*?<!-- Phone Auth Panel -->[\s\S]*?<\/div>\s*<\/div>\s*(?=\s*<!-- VIEW B: PROFILE TABS)/;
if (phoneSectionRegex.test(html)) {
  html = html.replace(phoneSectionRegex, '\n      </div>');
  console.log('Removed phoneSectionRegex');
} else {
  console.log('phoneSectionRegex not found via primary regex, trying step-by-step');
  const dividerIdx = html.indexOf('<div class="auth-method-divider">');
  const panelEndIdx = html.indexOf('<!-- VIEW B: PROFILE TABS');
  if (dividerIdx !== -1 && panelEndIdx !== -1 && dividerIdx < panelEndIdx) {
    html = html.substring(0, dividerIdx) + '</div>\n\n      ' + html.substring(panelEndIdx);
    console.log('Removed phone section via indices');
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Updated index.html!');
