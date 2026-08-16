import os
import json
import urllib.request

def run_suite():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    report = []
    errors = []

    report.append("=== PULSE APP SYSTEM VERIFICATION REPORT ===")

    # 1. Critical Files Check
    critical_files = [
        'index.html', 'src/main.js', 'src/musicService.js', 'src/visualizer.js',
        'src/supabaseClient.js', 'src/style.css', 'sw.js', 'manifest.json', 'pulse-logo.png',
        'downloads/Pulse-Music-v2.4.0.apk', 'downloads/Pulse-Music-Windows-Setup.exe',
        'downloads/Pulse-Music-v2.4.0.dmg', 'downloads/Pulse-Music-v2.4.0.AppImage',
        'downloads/Pulse-Music-v2.4.0.ipa',
        'docs/index.html', 'docs/downloads/Pulse-Music-v2.4.0.apk'
    ]

    report.append("\n[1] File Integrity:")
    for f in critical_files:
        fp = os.path.join(root_dir, f)
        if os.path.exists(fp) and os.path.getsize(fp) > 0:
            report.append(f"  [OK] {f} ({os.path.getsize(fp):,} bytes)")
        else:
            errors.append(f"Missing/empty: {f}")
            report.append(f"  [FAIL] {f}")

    # 2. Server Endpoints Check
    endpoints = [
        ('UI Web Root', 'http://localhost:3000/'),
        ('Android APK (/api/download/android)', 'http://localhost:3000/api/download/android'),
        ('Windows EXE (/api/download/windows)', 'http://localhost:3000/api/download/windows'),
        ('macOS DMG (/api/download/mac)', 'http://localhost:3000/api/download/mac'),
        ('Linux AppImage (/api/download/linux)', 'http://localhost:3000/api/download/linux'),
        ('iOS IPA (/api/download/ios)', 'http://localhost:3000/api/download/ios'),
        ('Static APK (/downloads/Pulse-Music-v2.4.0.apk)', 'http://localhost:3000/downloads/Pulse-Music-v2.4.0.apk'),
        ('Static EXE (/downloads/Pulse-Music-Windows-Setup.exe)', 'http://localhost:3000/downloads/Pulse-Music-Windows-Setup.exe'),
        ('Manifest JSON (/manifest.json)', 'http://localhost:3000/manifest.json'),
        ('App Logo (/pulse-logo.png)', 'http://localhost:3000/pulse-logo.png')
    ]

    report.append("\n[2] Live Server Endpoints:")
    for label, url in endpoints:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = resp.read()
                report.append(f"  [OK] {label} -> HTTP {resp.status} ({len(data):,} bytes)")
        except Exception as e:
            errors.append(f"{label} failed: {e}")
            report.append(f"  [FAIL] {label} -> {e}")

    # 3. Auth API Check
    report.append("\n[3] Auth Engine:")
    try:
        payload = json.dumps({'email': 'pushkartest@gmail.com', 'password': 'test_password_123', 'name': 'Pushkar'}).encode('utf-8')
        req = urllib.request.Request('http://localhost:3000/api/auth/google', data=payload, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            if res.get('success'):
                token = res.get('token', '')
                avatar = res.get('user', {}).get('avatar', '')
                report.append(f"  [OK] Google Auth Endpoint: Token={token[:12]}..., Avatar={avatar[:40]}...")
            else:
                errors.append(f"Auth returned error: {res}")
                report.append(f"  [FAIL] Google Auth: {res}")
    except Exception as e:
        errors.append(f"Auth exception: {e}")
        report.append(f"  [FAIL] Google Auth -> {e}")

    report_text = "\n".join(report)
    if not errors:
        report_text += "\n\n>>> ALL 17 CHECKS PASSED PERFECTLY! 0 ERRORS DETECTED. <<<"
    else:
        report_text += f"\n\n>>> DETECTED {len(errors)} ERRORS: " + ", ".join(errors) + " <<<"
    
    out_file = os.path.join(root_dir, 'scripts', 'verification_results.txt')
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(report_text)
    
    print(report_text)

if __name__ == '__main__':
    run_suite()
