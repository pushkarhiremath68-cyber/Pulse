import os
import subprocess

def generate_authenticode_certificate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    certs_dir = os.path.join(base_dir, 'certs')
    os.makedirs(certs_dir, exist_ok=True)

    pfx_path = os.path.join(certs_dir, 'pulse-authenticode.pfx')
    cer_path = os.path.join(certs_dir, 'pulse-authenticode.cer')
    
    ps_script = f"""
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=Pulse Music by Pushkar Hiremath, O=Pulse Music Organization, C=IN" -KeyLength 4096 -KeyAlgorithm RSA -HashAlgorithm SHA256 -CertStoreLocation "Cert:\\CurrentUser\\My" -NotAfter (Get-Date).AddYears(5)
    $pwd = ConvertTo-SecureString -String "PulseMusic2026!" -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath "{pfx_path}" -Password $pwd
    Export-Certificate -Cert $cert -FilePath "{cer_path}"
    Write-Host "Authenticode certificate generated successfully at {pfx_path}"
    """

    try:
        res = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, check=True)
        print(res.stdout)
        print(f"[SUCCESS] Code signing PFX: {pfx_path}")
        print(f"[SUCCESS] Public CER: {cer_path}")
    except Exception as e:
        print(f"[WARNING] PowerShell certificate generation error: {e}")

    # Generate metadata info
    meta_path = os.path.join(certs_dir, 'codesign-metadata.json')
    import json
    meta = {
        "publisher": "Pulse Music (Pushkar Hiremath)",
        "organization": "Pulse Music Streaming Network",
        "algorithm": "RSA-4096 / SHA-256 Authenticode",
        "certificate_file": "certs/pulse-authenticode.pfx",
        "public_key": "certs/pulse-authenticode.cer",
        "validity_years": 5,
        "password_env": "PULSE_CODESIGN_PASSWORD"
    }
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2)
    print(f"[SUCCESS] Code signing metadata saved: {meta_path}")

if __name__ == '__main__':
    generate_authenticode_certificate()
