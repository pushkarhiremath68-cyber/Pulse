import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Find all function calls inside initApp
init_start = code.find('async function initApp()')
init_end = code.find('// Startup sequence', init_start)
init_body = code[init_start:init_end]

calls = re.findall(r'([a-zA-Z0-9_$]+)\s*\(', init_body)
print("Function calls inside initApp:")
for c in sorted(set(calls)):
    if c in ['function', 'if', 'for', 'catch', 'while', 'switch', 'async', 'parseInt', 'min', 'max', 'minMax', 'forEach']: continue
    exists = f"function {c}" in code or f"const {c}" in code or f"let {c}" in code or f"var {c}" in code or f"window.{c}" in code
    status = "EXISTS" if exists else "MISSING"
    print(f"  {c:30} -> {status}")
