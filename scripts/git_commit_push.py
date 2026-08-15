import os
import subprocess
import sys

def execute():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    git_cmd = r"C:\Users\pushk\AppData\Local\Programs\PortableGit\cmd\git.exe"
    
    env = os.environ.copy()
    env["PATH"] = r"C:\Users\pushk\AppData\Local\Programs\PortableGit\cmd;" + env.get("PATH", "")
    env["GIT_TERMINAL_PROMPT"] = "0"
    env["GIT_PAGER"] = "cat"

    def run(args):
        print(f"> git {' '.join(args)}", flush=True)
        res = subprocess.run([git_cmd] + args, cwd=base_dir, env=env, capture_output=True, text=True, timeout=30)
        if res.stdout:
            print(res.stdout.strip(), flush=True)
        if res.stderr:
            print(f"[stderr] {res.stderr.strip()}", flush=True)
        return res

    # Remove stale lock if present
    lock_file = os.path.join(base_dir, ".git", "index.lock")
    if os.path.exists(lock_file):
        try:
            os.remove(lock_file)
            print("[INFO] Cleaned up stale .git/index.lock", flush=True)
        except Exception as e:
            print(f"[WARN] Could not remove lock: {e}", flush=True)

    # Check git configuration
    run(["config", "user.name", "Pushkar Hiremath"])
    run(["config", "user.email", "pushkarhiremath@example.com"])
    run(["config", "core.autocrlf", "false"])

    # Branch setup
    run(["branch", "-M", "main"])

    # Add all files respecting .gitignore
    run(["add", "-A"])

    # Check staged status
    run(["status", "--short"])

    # Commit
    run(["commit", "-m", "feat: Production-grade cross-platform Pulse Music app with background audio & code-signed releases"])

    # Show log
    run(["log", "-n", "3", "--oneline"])
    run(["remote", "-v"])

if __name__ == '__main__':
    execute()
