import json, re

with open('scratch/all_verified_catalog.json', 'r', encoding='utf-8') as f:
    verified_data = json.load(f)

# Helper function to find verified track by matching key or title
def get_verified(name_or_key):
    k = name_or_key.lower().strip()
    if k in verified_data:
        return verified_data[k]
    for key, val in verified_data.items():
        if key in k or k in key:
            return val
    return None

print(f"Loaded {len(verified_data)} verified songs.")
