import base64
import os

icon_path = os.path.join("public", "icons", "icon-192.png")
if not os.path.exists(icon_path):
    icon_path = os.path.join("public", "apple-touch-icon.png")

with open(icon_path, "rb") as f:
    icon_b64 = base64.b64encode(f.read()).decode("utf-8")

mobileconfig_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>
{icon_b64}
            </data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>Pulse Music</string>
            <key>PayloadDescription</key>
            <string>Pulse Music High-Fidelity Lossless Audio &amp; Live Lyrics</string>
            <key>PayloadDisplayName</key>
            <string>Pulse Music Web Clip</string>
            <key>PayloadIdentifier</key>
            <string>com.pulse.music.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>7B76D805-32F9-417A-8419-6190280D5A54</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://pulse-music-app-68.web.app/</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Pulse Music App</string>
    <key>PayloadIdentifier</key>
    <string>com.pulse.music.profile</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>9F2C99D3-3D04-4F8C-88E2-0C81F54B3A8B</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
"""

out_dirs = [
    os.path.join("public", "downloads"),
    os.path.join("dist", "downloads"),
]

for d in out_dirs:
    os.makedirs(d, exist_ok=True)
    out_file = os.path.join(d, "Pulse-Music.mobileconfig")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(mobileconfig_content)
    print(f"Generated {out_file} ({len(mobileconfig_content)} bytes)")
