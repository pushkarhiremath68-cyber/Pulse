import os
import subprocess
import sys

def push_repo():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    git_cmd = r"C:\Users\pushk\AppData\Local\Programs\PortableGit\cmd\git.exe"
    
    env = os.environ.copy()
    env["PATH"] = r"C:\Users\pushk\AppData\Local\Programs\PortableGit\cmd;" + env.get("PATH", "")
    env["GIT_TERMINAL_PROMPT"] = "0"
    env["GIT_PAGER"] = "cat"

    def run(args):
        print(f"> git {' '.join(args)}", flush=True)
        res = subprocess.run([git_cmd] + args, cwd=base_dir, env=env, capture_output=True, text=True)
        if res.stdout:
            print(res.stdout.strip(), flush=True)
        if res.stderr:
            print(f"[stderr] {res.stderr.strip()}", flush=True)
        return res

    # 1. Clean stale locks
    lock_file = os.path.join(base_dir, ".git", "index.lock")
    if os.path.exists(lock_file):
        try: os.remove(lock_file)
        except Exception: pass

    # Configure Git Credential Manager to use Windows stored credentials
    run(["config", "credential.helper", "wincred"])
    run(["config", "user.name", "Pushkar Hiremath"])
    run(["config", "user.email", "pushkarhiremath68@gmail.com"])

    # 2. Stage updated files
    run(["add", "-A"])
    run(["status", "--short"])

    # 3. Commit
    run(["commit", "-m", "fix: Resolve Vite asset imports and configure production build & GitHub deployment"])

    # 4. Configure remote
    remote_url = "https://github.com/pushkarhiremath68-cyber/Pulse.git"
    run(["remote", "remove", "origin"])
    run(["remote", "add", "origin", remote_url])
    run(["remote", "-v"])

    # 5. Push to GitHub
    print("\nAttempting git push to https://github.com/pushkarhiremath68-cyber/Pulse.git ...", flush=True)
    res_push = run(["push", "-u", "origin", "main", "--force"])
    
    return res_push.returncode == 0

if __name__ == '__main__':
    ok = push_repo()
    sys.exit(0 if ok else 1)
