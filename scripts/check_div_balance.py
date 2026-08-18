import subprocess, re

with open('index.html', 'r', encoding='utf-8') as f:
    cur_html = f.read()

res = subprocess.run(["git", "show", "539fa72:index.html"], capture_output=True, text=True, errors='ignore')
old_html = res.stdout

def count_divs(html):
    opens = len(re.findall(r'<div[\s>]', html))
    closes = len(re.findall(r'</div>', html))
    return opens, closes

cur_opens, cur_closes = count_divs(cur_html)
old_opens, old_closes = count_divs(old_html)

print(f"539fa72 index.html: <div count={old_opens}, </div count={old_closes}, diff={old_opens - old_closes}")
print(f"Current index.html: <div count={cur_opens}, </div count={cur_closes}, diff={cur_opens - cur_closes}")
