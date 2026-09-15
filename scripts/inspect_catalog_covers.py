import re

text = open("src/catalogService.js", encoding="utf-8").read()
matches = re.findall(r'coverUrl:\s*["\']([^"\']+)["\']', text)
print(f"Total coverUrls: {len(matches)}")
pulse_logos = [m for m in matches if "pulse-logo" in m]
print(f"Pulse logo fallbacks: {len(pulse_logos)}")
if pulse_logos:
    print("Found pulse logos:", pulse_logos)
