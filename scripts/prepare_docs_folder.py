import os
import shutil

def prepare_docs():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dist_dir = os.path.join(base_dir, "dist")
    docs_dir = os.path.join(base_dir, "docs")
    
    if not os.path.exists(dist_dir):
        print("dist/ not found. Run npm run build first.")
        return False
        
    if os.path.exists(docs_dir):
        shutil.rmtree(docs_dir)
        
    shutil.copytree(dist_dir, docs_dir)
    
    # Ensure logo files are in docs and dist
    for logo_name in ['pulse-logo.png', 'pulse-logo.svg', 'pulse-logo-backup.png']:
        src_logo = os.path.join(base_dir, logo_name)
        if os.path.exists(src_logo):
            shutil.copy2(src_logo, os.path.join(docs_dir, logo_name))
            shutil.copy2(src_logo, os.path.join(dist_dir, logo_name))

    # Ensure downloads folder is copied to dist and docs
    src_downloads = os.path.join(base_dir, "public", "downloads")
    if os.path.exists(src_downloads):
        shutil.copytree(src_downloads, os.path.join(docs_dir, "downloads"), dirs_exist_ok=True)
        shutil.copytree(src_downloads, os.path.join(dist_dir, "downloads"), dirs_exist_ok=True)

    # Create .nojekyll in docs/, dist/ and root so GitHub Pages serves all assets
    for target in [docs_dir, dist_dir, base_dir]:
        with open(os.path.join(target, ".nojekyll"), "w") as f:
            f.write("")

    print(f"[SUCCESS] Prepared docs/ and dist/ with .nojekyll and assets: {os.listdir(docs_dir)}")
    return True

if __name__ == '__main__':
    prepare_docs()

