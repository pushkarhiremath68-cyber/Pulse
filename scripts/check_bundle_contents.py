import re

with open('docs/assets/index-CgwdezE_.js', 'r', encoding='utf-8') as f:
    js = f.read()

print("File size:", len(js), "bytes")
for check in ['playSpecificTrack', 'initApp', 'bindElements', 'openLoginModal', 'switchView', 'setTrack']:
    found = check in js
    print(f"  {check:25}: {'FOUND' if found else 'NOT FOUND'}")
