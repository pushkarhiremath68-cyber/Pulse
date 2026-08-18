import subprocess, re

res = subprocess.run(["git", "show", "c394c35:src/main.js"], capture_output=True, text=True, errors='ignore')
matches = re.findall(r'window\.executeSearch[\s\S]*?\n\s*\};', res.stdout)
if matches:
    print("Found executeSearch implementation:")
    print(matches[0][:800])
else:
    print("executeSearch regex not matched")
