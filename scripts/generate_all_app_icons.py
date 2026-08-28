#!/usr/bin/env python3
"""
Pulse Music - Master Icon Generator
Generates all icon assets for Web, PWA, iOS, Android, macOS, and Windows from pulse-logo.png.
"""

import os
import sys
from pathlib import Path
from PIL import Image

ROOT_DIR = Path(__file__).resolve().parent.parent
SOURCE_PNG = ROOT_DIR / "public" / "pulse-logo.png"

if not SOURCE_PNG.exists():
    SOURCE_PNG = ROOT_DIR / "pulse-logo.png"

if not SOURCE_PNG.exists():
    print(f"Error: Source image not found at {SOURCE_PNG}")
    sys.exit(1)

print(f"Loading master source icon from: {SOURCE_PNG}")
with open(SOURCE_PNG, "rb") as f:
    orig_img = Image.open(f)
    img = orig_img.convert("RGBA").copy()

# 1. Generate Web & PWA Icons
web_sizes = [16, 24, 32, 48, 64, 128, 180, 192, 256, 384, 512, 1024]
out_dirs = [
    ROOT_DIR / "public" / "icons",
    ROOT_DIR / "icons"
]

for out_dir in out_dirs:
    out_dir.mkdir(parents=True, exist_ok=True)
    for size in web_sizes:
        resized = img.resize((size, size), Image.Resampling.BILINEAR)
        out_file = out_dir / f"icon-{size}.png"
        resized.save(out_file, "PNG")
        print(f"  Generated: {out_file.relative_to(ROOT_DIR)}")

# Also save apple-touch-icon and general icon.png in public and root
for out_dir in [ROOT_DIR / "public", ROOT_DIR]:
    img.resize((180, 180), Image.Resampling.BILINEAR).save(out_dir / "apple-touch-icon.png", "PNG")
    img.resize((192, 192), Image.Resampling.BILINEAR).save(out_dir / "icon-192.png", "PNG")
    img.resize((512, 512), Image.Resampling.BILINEAR).save(out_dir / "icon-512.png", "PNG")
    img.resize((512, 512), Image.Resampling.BILINEAR).save(out_dir / "icon.png", "PNG")

# 2. Generate Multi-Resolution Windows ICO
ico_layers = [img.resize((s, s), Image.Resampling.BILINEAR) for s in [16, 24, 32, 48, 64, 128, 256]]
for ico_path in [
    ROOT_DIR / "public" / "favicon.ico",
    ROOT_DIR / "public" / "icons" / "icon.ico",
    ROOT_DIR / "icons" / "icon.ico",
    ROOT_DIR / "favicon.ico"
]:
    ico_layers[0].save(
        ico_path,
        format="ICO",
        append_images=ico_layers[1:]
    )
    print(f"  Generated Windows ICO: {ico_path.relative_to(ROOT_DIR)}")

# 3. Generate Android Mipmaps
android_res = ROOT_DIR / "android" / "app" / "src" / "main" / "res"
if android_res.exists():
    mipmap_configs = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    for folder, sz in mipmap_configs.items():
        folder_path = android_res / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        res_img = img.resize((sz, sz), Image.Resampling.BILINEAR)
        res_img.save(folder_path / "ic_launcher.png", "PNG")
        res_img.save(folder_path / "ic_launcher_round.png", "PNG")
        res_img.save(folder_path / "ic_launcher_foreground.png", "PNG")
        print(f"  Generated Android mipmap ({folder}): {sz}x{sz}")

# 4. Generate iOS AppIcon Set
ios_appiconset = ROOT_DIR / "ios" / "App" / "App" / "Assets.xcassets" / "AppIcon.appiconset"
if ios_appiconset.exists():
    ios_sizes = [
        ("AppIcon-20@2x.png", 40),
        ("AppIcon-20@3x.png", 60),
        ("AppIcon-29@2x.png", 58),
        ("AppIcon-29@3x.png", 87),
        ("AppIcon-40@2x.png", 80),
        ("AppIcon-40@3x.png", 120),
        ("AppIcon-60@2x.png", 120),
        ("AppIcon-60@3x.png", 180),
        ("AppIcon-512@2x.png", 1024),
        ("AppIcon-1024.png", 1024)
    ]
    for filename, sz in ios_sizes:
        res_img = img.resize((sz, sz), Image.Resampling.BILINEAR)
        res_img.save(ios_appiconset / filename, "PNG")
        print(f"  Generated iOS AppIcon: {filename} ({sz}x{sz})")

print("\n[SUCCESS] All platform icons successfully generated with official Pulse logo!")
