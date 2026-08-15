import os
import shutil
import glob
import yt_dlp

edge_cookie_dirs = glob.glob(os.path.expanduser(r'~\AppData\Local\Microsoft\Edge\User Data\*\Network\Cookies')) + \
                   glob.glob(os.path.expanduser(r'~\AppData\Local\Microsoft\Edge\User Data\*\Cookies'))

print("Found Edge cookie paths:", edge_cookie_dirs)

scratch_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'scratch')
os.makedirs(scratch_dir, exist_ok=True)
temp_cookie = os.path.join(scratch_dir, 'edge_cookies.db')

for cookie_src in edge_cookie_dirs:
    try:
        shutil.copy2(cookie_src, temp_cookie)
        print(f"Copied cookie db: {cookie_src} -> {temp_cookie}")
        break
    except Exception as e:
        print(f"Could not copy {cookie_src}: {e}")
