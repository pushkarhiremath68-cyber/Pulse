import os
import subprocess

def prepare_git_repo():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    git_exe = r"C:\Users\pushk\AppData\Local\Programs\PortableGit\cmd\git.exe"
    
    def run_git(args):
        cmd = [git_exe] + args
        res = subprocess.run(cmd, cwd=base_dir, capture_output=True, text=True, encoding='utf-8')
        print(f"$ git {' '.join(args)}")
        if res.stdout:
            print(res.stdout.strip())
        if res.stderr and res.returncode != 0:
            print("[ERROR]", res.stderr.strip())
        return res

    # 1. Initialize repository if needed
    if not os.path.exists(os.path.join(base_dir, '.git')):
        run_git(['init', '-b', 'main'])
    else:
        print("Git repository already initialized.")

    # 2. Configure default git identity if not configured
    run_git(['config', 'user.name', 'Pushkar Hiremath'])
    run_git(['config', 'user.email', 'pushkarhiremath@example.com'])
    run_git(['config', 'core.autocrlf', 'false'])
    run_git(['config', 'core.safecrlf', 'false'])

    # 3. Check status
    run_git(['status', '--short'])

    # 4. Stage all tracked and new files according to .gitignore
    run_git(['add', '.'])

    # 5. Commit
    commit_msg = "feat: Production-grade cross-platform Pulse Music app with background audio & code-signed releases"
    run_git(['commit', '-m', commit_msg])

    # 6. Show log and remote
    run_git(['log', '-n', '3', '--oneline'])
    run_git(['remote', '-v'])

if __name__ == '__main__':
    prepare_git_repo()
