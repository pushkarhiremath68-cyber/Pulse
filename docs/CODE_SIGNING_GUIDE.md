# Digital Code-Signing & Security Bypass Guide

This guide provides step-by-step instructions for generating and applying digital code-signing certificates to ensure your cross-platform installers for **Pulse Music** install seamlessly without triggering Windows Defender SmartScreen or macOS Gatekeeper warnings.

---

## 🪟 1. Windows Code-Signing (Bypassing SmartScreen)

Windows SmartScreen flags unsigned or unrecognized `.exe` / `.msi` installers. To establish application trust and bypass SmartScreen warnings:

### Option A: Generate a Self-Signed Authenticode Certificate (Development & Internal Testing)
Run the following PowerShell command as Administrator:

```powershell
# 1. Create a Code-Signing Certificate in the Local Certificate Store
$cert = New-SelfSignedCertificate -Type CodeSigningCert `
    -Subject "CN=Pushkar Hiremath, O=Pulse Music, C=IN" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -NotAfter (Get-Date).AddYears(5) `
    -KeyExportPolicy Exportable `
    -KeySpec Signature `
    -KeyLength 2048 `
    -HashAlgorithm SHA256

# 2. Export to a Password-Protected PFX File
$pwd = ConvertTo-SecureString -String "PulseSecret2026!" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "certs/pulse-authenticode.pfx" -Password $pwd

# 3. Trust the Certificate on the Machine (Installs to Trusted Root Certification Authorities)
Import-Certificate -FilePath "certs/pulse-authenticode.cer" -CertStoreLocation "Cert:\LocalMachine\Root"
```

### Option B: Sign the Windows Executable with Signtool
```powershell
# Sign the generated executable
& "C:\Program Files (x86)\Windows Kits\10\bin\x64\signtool.exe" sign `
    /f "certs/pulse-authenticode.pfx" `
    /p "PulseSecret2026!" `
    /tr http://timestamp.digicert.com `
    /td sha256 `
    /fd sha256 `
    "storage/downloads/Pulse-Music-Setup-2.4.0.exe"
```

### Option C: Production Extended Validation (EV) Code-Signing (Zero SmartScreen Warnings)
For commercial release without any SmartScreen warnings:
1. Obtain an **EV Code Signing Certificate** from a certified Certificate Authority (e.g. Sectigo, DigiCert, SSL.com).
2. Configure your GitHub Actions Secrets:
   - `PULSE_CODESIGN_PFX`: Base64-encoded certificate file.
   - `PULSE_CODESIGN_PASSWORD`: Certificate private key password.
3. Windows builds signed with EV certificates immediately have reputation and never trigger SmartScreen.

---

## 🍏 2. macOS Code-Signing & Notarization (Bypassing Gatekeeper)

macOS Gatekeeper blocks unsigned `.dmg` / `.app` bundles with *"App is damaged and cannot be opened"* or *"Unidentified developer"*.

### Step 1: Obtain Apple Developer ID Certificates
1. Join the [Apple Developer Program](https://developer.apple.com/programs/).
2. In Xcode or developer portal, generate:
   - **Developer ID Application:** Signs the `.app` bundle.
   - **Developer ID Installer:** Signs `.pkg` distribution packages.

### Step 2: Configure Hardened Runtime & Entitlements
Create `electron/entitlements.mac.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.device.audio-input</key>
    <true/>
</dict>
</plist>
```

### Step 3: Notarize with Apple Notary Service
```bash
# 1. Sign the DMG
codesign --deep --force --verify --verbose --sign "Developer ID Application: Pushkar Hiremath" "dist/Pulse-Music-2.4.0.dmg"

# 2. Submit to Apple Notarytool
xcrun notarytool submit "dist/Pulse-Music-2.4.0.dmg" \
    --apple-id "pushkarhiremath68@gmail.com" \
    --team-id "YOUR_APPLE_TEAM_ID" \
    --password "app-specific-apple-password" \
    --wait

# 3. Staple Notarization Ticket to the DMG
xcrun stapler staple "dist/Pulse-Music-2.4.0.dmg"
```

---

## 🤖 3. Android APK Signing (Google Play Protect)

Android requires all `.apk` bundles to be signed with a v2/v3 APK signature schema.

```bash
# 1. Generate Keystore
keytool -genkey -v -keystore certs/pulse-android.keystore \
    -alias pulse-music \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass PulseSecret2026! -keypass PulseSecret2026! \
    -dname "CN=Pushkar Hiremath, OU=Pulse, O=Pulse Music, L=Hubli, ST=Karnataka, C=IN"

# 2. Align and Sign APK using apksigner
zipalign -v -p 4 app-unsigned.apk app-aligned.apk
apksigner sign --ks certs/pulse-android.keystore \
    --ks-key-alias pulse-music \
    --ks-pass pass:PulseSecret2026! \
    --key-pass pass:PulseSecret2026! \
    --out Pulse-Music-2.4.0.apk app-aligned.apk
```
