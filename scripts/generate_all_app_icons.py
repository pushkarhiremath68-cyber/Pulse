import os
import json
from PIL import Image, ImageDraw

def generate_all_icons():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_path = os.path.join(base_dir, 'pulse-logo.png')
    
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} does not exist.")
        return

    src_img = Image.open(logo_path).convert('RGBA')
    print(f"Loaded master source image: {src_img.size} from {logo_path}")

    # 1. Desktop & PWA Icons
    desktop_sizes = [16, 24, 32, 48, 64, 128, 192, 256, 512, 1024]
    public_icons_dir = os.path.join(base_dir, 'public', 'icons')
    os.makedirs(public_icons_dir, exist_ok=True)

    ico_images = []
    for sz in desktop_sizes:
        resized = src_img.resize((sz, sz), Image.Resampling.LANCZOS)
        out_path = os.path.join(public_icons_dir, f'icon-{sz}.png')
        resized.save(out_path, 'PNG')
        if sz in [16, 24, 32, 48, 64, 128, 256]:
            ico_images.append(resized)
        print(f"  [Desktop] Generated {out_path}")

    # Generate multi-size .ico for Windows
    ico_path = os.path.join(public_icons_dir, 'icon.ico')
    src_img.save(
        ico_path,
        format='ICO',
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    )
    print(f"  [Windows] Generated multi-resolution ICO: {ico_path} ({os.path.getsize(ico_path)} bytes)")

    # Copy main icon to public root
    src_img.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(base_dir, 'public', 'icon.png'))

    # 2. Android Mipmaps
    android_res_dir = os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res')
    android_mipmaps = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }

    for folder, size in android_mipmaps.items():
        folder_path = os.path.join(android_res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # Standard launcher icon
        resized = src_img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(folder_path, 'ic_launcher.png'), 'PNG')

        # Round launcher icon with circular mask
        round_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        mask = Image.new('L', (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size - 1, size - 1), fill=255)
        round_img.paste(resized, (0, 0), mask)
        round_img.save(os.path.join(folder_path, 'ic_launcher_round.png'), 'PNG')

        print(f"  [Android] Generated {folder}/ic_launcher.png ({size}x{size})")

    # Android Play Store 512x512
    playstore_icon = src_img.resize((512, 512), Image.Resampling.LANCZOS)
    playstore_path = os.path.join(base_dir, 'android', 'playstore-icon-512.png')
    playstore_icon.save(playstore_path, 'PNG')
    print(f"  [Android] Generated Play Store icon: {playstore_path}")

    # 3. iOS AppIcon Set
    ios_icons_dir = os.path.join(base_dir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset')
    os.makedirs(ios_icons_dir, exist_ok=True)

    ios_specs = [
        {"size": "20x20", "idiom": "iphone", "scale": "2x", "px": 40},
        {"size": "20x20", "idiom": "iphone", "scale": "3x", "px": 60},
        {"size": "29x29", "idiom": "iphone", "scale": "2x", "px": 58},
        {"size": "29x29", "idiom": "iphone", "scale": "3x", "px": 87},
        {"size": "40x40", "idiom": "iphone", "scale": "2x", "px": 80},
        {"size": "40x40", "idiom": "iphone", "scale": "3x", "px": 120},
        {"size": "60x60", "idiom": "iphone", "scale": "2x", "px": 120},
        {"size": "60x60", "idiom": "iphone", "scale": "3x", "px": 180},
        {"size": "20x20", "idiom": "ipad", "scale": "1x", "px": 20},
        {"size": "20x20", "idiom": "ipad", "scale": "2x", "px": 40},
        {"size": "29x29", "idiom": "ipad", "scale": "1x", "px": 29},
        {"size": "29x29", "idiom": "ipad", "scale": "2x", "px": 58},
        {"size": "40x40", "idiom": "ipad", "scale": "1x", "px": 40},
        {"size": "40x40", "idiom": "ipad", "scale": "2x", "px": 80},
        {"size": "76x76", "idiom": "ipad", "scale": "1x", "px": 76},
        {"size": "76x76", "idiom": "ipad", "scale": "2x", "px": 152},
        {"size": "83.5x83.5", "idiom": "ipad", "scale": "2x", "px": 167},
        {"size": "1024x1024", "idiom": "ios-marketing", "scale": "1x", "px": 1024}
    ]

    contents_images = []
    for spec in ios_specs:
        filename = f"AppIcon-{spec['size']}@{spec['scale']}.png"
        file_path = os.path.join(ios_icons_dir, filename)
        resized = src_img.resize((spec['px'], spec['px']), Image.Resampling.LANCZOS)
        resized.save(file_path, 'PNG')
        contents_images.append({
            "size": spec["size"],
            "idiom": spec["idiom"],
            "filename": filename,
            "scale": spec["scale"]
        })
        print(f"  [iOS] Generated {filename} ({spec['px']}x{spec['px']})")

    contents_json = {
        "images": contents_images,
        "info": {
            "version": 1,
            "author": "xcode"
        }
    }
    with open(os.path.join(ios_icons_dir, 'Contents.json'), 'w', encoding='utf-8') as f:
        json.dump(contents_json, f, indent=2)

    print("\n[SUCCESS] Generated all Cross-Platform App Icon Sets successfully!")

if __name__ == '__main__':
    generate_all_icons()
