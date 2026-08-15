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
    
    # Create .nojekyll in docs/ so GitHub Pages serves assets without ignoring _ folders
    with open(os.path.join(docs_dir, ".nojekyll"), "w") as f:
        f.write("")
        
    # Also create .nojekyll in root
    with open(os.path.join(base_dir, ".nojekyll"), "w") as f:
        f.write("")

    print(f"[SUCCESS] Copied dist/ to docs/ with .nojekyll: {os.listdir(docs_dir)}")
    return True

if __name__ == '__main__':
    prepare_docs()
