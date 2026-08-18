import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

with open('scratch/extracted_attachEventListeners.js', 'r', encoding='utf-8') as f:
    attach_events_code = f.read()

# Make sure attachEventListeners is placed right before async function initApp()
if 'function attachEventListeners()' not in main_js:
    main_js = main_js.replace(
        'async function initApp()',
        attach_events_code.strip() + '\n\n  async function initApp()'
    )
    print("[OK] Inserted attachEventListeners() into src/main.js")
else:
    print("[INFO] attachEventListeners() already present in src/main.js")

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_js)

print("[OK] Saved updated src/main.js")
