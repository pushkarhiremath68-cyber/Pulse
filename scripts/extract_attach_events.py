import subprocess

res = subprocess.run(["git", "show", "HEAD~10:src/main.js"], capture_output=True, text=True, errors='ignore')
content = res.stdout

start = content.find("function attachEventListeners()")
if start != -1:
    end = content.find("function initApp()", start)
    print("Found attachEventListeners in git history:")
    print(content[start:end][:2500])
    with open('scratch/extracted_attachEventListeners.js', 'w', encoding='utf-8') as f:
        f.write(content[start:end])
else:
    print("Not found with HEAD~10, checking older commits...")
    res2 = subprocess.run(["git", "log", "--all", "-n", "30", "--pretty=format:%H"], capture_output=True, text=True)
    commits = res2.stdout.split()
    for c in commits:
        r = subprocess.run(["git", "show", f"{c}:src/main.js"], capture_output=True, text=True, errors='ignore')
        s = r.stdout.find("function attachEventListeners()")
        if s != -1:
            e = r.stdout.find("function initApp()", s)
            print(f"Found in commit {c}!")
            with open('scratch/extracted_attachEventListeners.js', 'w', encoding='utf-8') as f:
                f.write(r.stdout[s:e])
            break
