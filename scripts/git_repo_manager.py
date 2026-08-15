import os
import time
from dulwich import porcelain
from dulwich.repo import Repo

def init_and_commit():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"Target repository path: {base_dir}")

    # Check or init repo
    git_dir = os.path.join(base_dir, '.git')
    if not os.path.exists(git_dir):
        print("Initializing new Git repository with Dulwich...")
        repo = porcelain.init(base_dir)
    else:
        print("Opening existing Git repository...")
        repo = Repo(base_dir)

    # Read .gitignore patterns
    ignore_patterns = set(['.git', '__pycache__', 'node_modules', '.DS_Store', 'dist', 'build', '.vscode', '.idea'])
    
    # Collect all files to stage
    tracked_files = []
    for root, dirs, files in os.walk(base_dir):
        # Filter out ignored directories
        dirs[:] = [d for d in dirs if d not in ignore_patterns and not d.startswith('.system_generated')]
        for file in files:
            if file.endswith('.pyc') or file == '.DS_Store' or file.endswith('.log'):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, base_dir).replace('\\', '/')
            tracked_files.append(rel_path)

    print(f"Staging {len(tracked_files)} repository files...")
    # Add files to git index
    porcelain.add(base_dir, tracked_files)

    # Commit staged files
    commit_msg = b"feat: Production-grade cross-platform Pulse Music app with background audio & code-signed releases"
    author = b"Pushkar Hiremath <pushkarhiremath@example.com>"
    
    try:
        commit_id = porcelain.commit(base_dir, message=commit_msg, author=author, committer=author)
        print(f"[SUCCESS] Created Git commit: {commit_id.decode('utf-8') if isinstance(commit_id, bytes) else commit_id}")
    except Exception as e:
        print(f"Commit note: {e}")

    # Set default branch to main
    try:
        porcelain.branch_create(base_dir, b"main")
        print("Branch 'main' created/verified.")
    except Exception as e:
        pass

    # Check status
    st = porcelain.status(base_dir)
    print(f"Staged: {len(st.staged.get('add', []))}, Unstaged: {len(st.unstaged)}, Untracked: {len(st.untracked)}")

    # Show latest commit info
    log_entries = porcelain.log(base_dir, max_entries=2)
    for entry in log_entries:
        c = entry.commit
        print(f"Commit: {c.id.decode('utf-8')[:8]} | Message: {c.message.decode('utf-8').strip()} | Author: {c.author.decode('utf-8')}")

if __name__ == '__main__':
    init_and_commit()
