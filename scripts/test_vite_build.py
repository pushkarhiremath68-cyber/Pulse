import os
import subprocess
import sys

def test_vite_build():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    node_dir = r"C:\Users\pushk\AppData\Local\Programs\NodeJS"
    git_dir = r"C:\Users\pushk\AppData\Local\Programs\PortableGit\cmd"
    
    env = os.environ.copy()
    env["PATH"] = f"{node_dir};{git_dir};" + env.get("PATH", "")
    
    npm_cmd = os.path.join(node_dir, "npm.cmd")
    npx_cmd = os.path.join(node_dir, "npx.cmd")

    print("==========================================================")
    print("TESTING VITE PROJECT BUILD")
    print("==========================================================")
    
    # 1. Install dependencies
    print("\n1. Running npm install (clean)...", flush=True)
    res_install = subprocess.run([npm_cmd, "install", "--ignore-scripts"], cwd=base_dir, env=env, capture_output=True, text=True)
    if res_install.stdout:
        print(res_install.stdout.strip()[:500])
    if res_install.returncode != 0:
        print("[Install Warning/Error]:", res_install.stderr.strip())

    # 2. Run Vite build
    print("\n2. Running npm run build (vite build)...", flush=True)
    res_build = subprocess.run([npm_cmd, "run", "build"], cwd=base_dir, env=env, capture_output=True, text=True)
    print(res_build.stdout.strip())
    if res_build.stderr:
        print("[Build stderr]:", res_build.stderr.strip())

    if res_build.returncode == 0:
        print("\n[SUCCESS] Vite production build succeeded cleanly!")
        dist_dir = os.path.join(base_dir, "dist")
        if os.path.exists(dist_dir):
            files = os.listdir(dist_dir)
            print(f"Generated dist/ contents: {files}")
        return True
    else:
        print(f"\n[FAIL] Vite build exited with code {res_build.returncode}")
        return False

if __name__ == '__main__':
    ok = test_vite_build()
    sys.exit(0 if ok else 1)
