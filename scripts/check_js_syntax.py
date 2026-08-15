import subprocess
import os

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    js1 = f.read()

with open('src/main.js', 'r', encoding='utf-8') as f:
    js2 = f.read()

# Check for syntax errors by compiling with python js engines if available or checking brace match
print("musicService.js length:", len(js1))
print("main.js length:", len(js2))

def check_brackets(s, name):
    stack = []
    lines = s.split('\n')
    for line_no, line in enumerate(lines, 1):
        for ch in line:
            if ch in '({[':
                stack.append((ch, line_no))
            elif ch in ')}]':
                if not stack:
                    print(f"[{name}] Extra closing bracket '{ch}' at line {line_no}")
                    return False
                top, tline = stack.pop()
                if (top == '(' and ch != ')') or (top == '{' and ch != '}') or (top == '[' and ch != ']'):
                    print(f"[{name}] Mismatched bracket '{top}' (line {tline}) with '{ch}' at line {line_no}")
                    return False
    if stack:
        print(f"[{name}] Unclosed brackets remaining: {stack[-3:]}")
        return False
    print(f"[{name}] Brackets balanced successfully!")
    return True

check_brackets(js1, "musicService.js")
check_brackets(js2, "main.js")
