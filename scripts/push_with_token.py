import os
import subprocess
import sys

def push_with_token():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    git_cmd = r"C:\Users\pushk\AppData\Local\Programs\PortableGit\cmd\git.exe"
    
    env = os.environ.copy()
    env["PATH"] = r"C:\Users\pushk\AppData\Local\Programs\PortableGit\cmd;" + env.get("PATH", "")
    
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token and len(sys.argv) > 1:
        token = sys.argv[1].strip()
        
    if not token:
        print("\n=======================================================")
        print("GitHub Personal Access Token Push Helper")
        print("=======================================================")
        print("Usage: python scripts/push_with_token.py YOUR_GITHUB_TOKEN")
        print("Or set GITHUB_TOKEN environment variable.\n")
        print("To generate a token: https://github.com/settings/tokens (select 'repo' scope)")
        print("=======================================================\n")
        
        print("Attempting push using stored Windows credentials...")
        res = subprocess.run([git_cmd, "push", "origin", "main"], cwd=base_dir, env=env)
        if res.returncode == 0:
            print("\n[SUCCESS] Pushed to GitHub successfully!")
            return True
        return False

    remote_url = f"https://{token}@github.com/pushkarhiremath68-cyber/Pulse.git"
    print("Pushing to GitHub using provided token...")
    
    res = subprocess.run([git_cmd, "push", remote_url, "main", "--force"], cwd=base_dir, env=env)
    if res.returncode == 0:
        print("\n[SUCCESS] Pushed all updates to GitHub Pages successfully!")
        return True
    else:
        print("\n[ERROR] Push failed. Please check your GitHub token.")
        return False

if __name__ == '__main__':
    push_with_token()
