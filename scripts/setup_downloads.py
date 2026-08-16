import os, shutil

src_dir = os.path.join('storage', 'downloads')
dest_dir = 'downloads'
os.makedirs(dest_dir, exist_ok=True)

files = os.listdir(src_dir)
print('Source files in storage/downloads:', files)

for f in files:
    src_f = os.path.join(src_dir, f)
    dest_f = os.path.join(dest_dir, f)
    if os.path.isfile(src_f):
        shutil.copy2(src_f, dest_f)

# Also create helpful aliases in both directories
aliases = {
    'Pulse-Music-Setup-2.4.0.exe': ['Pulse-Music-Windows-Setup.exe', 'Pulse-Music-2.4.0.exe', 'Pulse-Setup.exe'],
    'Pulse-Music-2.4.0.dmg': ['Pulse-Music-v2.4.0.dmg', 'Pulse-Mac.dmg'],
    'Pulse-Music-v2.4.0.apk': ['Pulse-Music-2.4.0.apk', 'Pulse-Android.apk'],
    'Pulse-Music-2.4.0.AppImage': ['Pulse-Music-v2.4.0.AppImage', 'Pulse-Linux.AppImage'],
    'Pulse-Music-v2.4.0.ipa': ['Pulse-Music-2.4.0.ipa', 'Pulse-iOS.ipa']
}

for base, alias_list in aliases.items():
    for alias in alias_list:
        b1 = os.path.join(src_dir, base)
        a1 = os.path.join(src_dir, alias)
        if os.path.exists(b1) and not os.path.exists(a1):
            shutil.copy2(b1, a1)
        b2 = os.path.join(dest_dir, base)
        a2 = os.path.join(dest_dir, alias)
        if os.path.exists(b2) and not os.path.exists(a2):
            shutil.copy2(b2, a2)

print('Downloads directory contents:', os.listdir(dest_dir))
