import os

files_to_update = [
    r"src\musicService.js",
    r"src\catalogService.js",
    r"server.py",
    r"supabase_schema_and_mega_seed.sql",
    r"scripts\test_complete_app_flow.js",
    r"docs\src\musicService.js",
    r"docs\src\catalogService.js"
]

for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content.replace("JGwWNGJdvx8", "_dK2tDK9grQ")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"File not found: {file_path}")
