import subprocess
import os
import shutil
import tempfile

def deploy_to_gh_pages():
    print("Building latest production bundle with Vite...")
    subprocess.run("npm run build", shell=True, check=True)
    
    dist_dir = os.path.abspath("dist")
    if not os.path.exists(dist_dir):
        raise RuntimeError("dist/ directory not found after build!")

    # Ensure .nojekyll exists
    with open(os.path.join(dist_dir, ".nojekyll"), "w") as f:
        f.write("")

    print(f"Dist directory prepared with {len(os.listdir(dist_dir))} root items.")

    # Create temporary directory to clone/checkout gh-pages
    with tempfile.TemporaryDirectory() as tmp_dir:
        repo_url = subprocess.run("git config --get remote.origin.url", shell=True, capture_output=True, text=True, check=True).stdout.strip()
        print(f"Cloning gh-pages from {repo_url} to temporary workspace...")
        subprocess.run(f'git clone --branch gh-pages --single-branch "{repo_url}" "{tmp_dir}"', shell=True, check=True)

        # Clear existing files in gh-pages except .git
        for item in os.listdir(tmp_dir):
            if item == ".git":
                continue
            item_path = os.path.join(tmp_dir, item)
            if os.path.isdir(item_path):
                shutil.rmtree(item_path)
            else:
                os.remove(item_path)

        # Copy all dist files into the temporary clone
        for item in os.listdir(dist_dir):
            src_path = os.path.join(dist_dir, item)
            dest_path = os.path.join(tmp_dir, item)
            if os.path.isdir(src_path):
                shutil.copytree(src_path, dest_path)
            else:
                shutil.copy2(src_path, dest_path)

        # Stage, commit and push to origin gh-pages
        cwd = tmp_dir
        subprocess.run("git add -A", cwd=cwd, shell=True, check=True)
        
        status = subprocess.run("git status --porcelain", cwd=cwd, shell=True, capture_output=True, text=True).stdout.strip()
        if status:
            print("Changes detected on gh-pages branch. Committing...")
            subprocess.run('git commit -m "deploy: update live site with Spotify discovery, artist details, and synced karaoke lyrics"', cwd=cwd, shell=True, check=True)
            print("Pushing to origin gh-pages...")
            subprocess.run("git push --force origin gh-pages", cwd=cwd, shell=True, check=True)
            print("Successfully deployed to origin/gh-pages!")
        else:
            print("gh-pages is already up to date with latest build.")

if __name__ == '__main__':
    deploy_to_gh_pages()
