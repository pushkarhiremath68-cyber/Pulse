import os
from PIL import Image, ImageOps

def process_logo():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_path = os.path.join(base_dir, 'pulse-logo.png')
    
    img = Image.open(logo_path).convert('RGBA')
    width, height = img.size
    print(f"Original size: {width}x{height}")

    # Inspect corner pixel
    corner_pixel = img.getpixel((0, 0))
    print(f"Top-left corner color: {corner_pixel}")

    # The white/off-white background in the outer border has high brightness (R > 230, G > 230, B > 230)
    # Let's flood-fill or mask the outer background to make it transparent, OR crop to the rounded purple shape with clean antialiased alpha mask.
    
    # Let's create a new RGBA image
    datas = img.getdata()
    new_data = []
    
    for item in datas:
        # Check if pixel is near white/light grey (outer background)
        r, g, b, a = item
        # The purple icon has high blue/red and lower green, while the white border has r > 230, g > 230, b > 230
        if r > 230 and g > 230 and b > 230:
            # Fully transparent
            new_data.append((255, 255, 255, 0))
        elif r > 210 and g > 210 and b > 210 and abs(r - g) < 15 and abs(g - b) < 15:
            # Soft antialiased boundary
            alpha = max(0, 255 - int((r - 210) * 12.75))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append(item)

    img.putdata(new_data)

    # Let's find the bounding box of non-transparent pixels and crop tightly or center with 5% padding
    bbox = img.getbbox()
    print(f"Non-transparent bounding box: {bbox}")
    
    if bbox:
        cropped = img.crop(bbox)
        # Create a square master 1024x1024 with transparent background
        max_dim = max(cropped.width, cropped.height)
        square_img = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
        offset_x = (max_dim - cropped.width) // 2
        offset_y = (max_dim - cropped.height) // 2
        square_img.paste(cropped, (offset_x, offset_y), cropped)
        
        # Resize to standard 1024x1024 master
        final_img = square_img.resize((1024, 1024), Image.Resampling.LANCZOS)
    else:
        final_img = img

    # Save cleanly with transparency
    backup_path = os.path.join(base_dir, 'pulse-logo-backup.png')
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy(logo_path, backup_path)
    
    final_img.save(logo_path, 'PNG')
    print(f"[SUCCESS] Clean transparent logo saved to {logo_path}")

if __name__ == '__main__':
    process_logo()
