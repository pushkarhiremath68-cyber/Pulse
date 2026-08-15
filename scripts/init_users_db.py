import os
import json
import re
import hashlib
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_FILE = os.path.join(ROOT, 'storage', 'users.json')
os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)

# Test User Auth Logic
def get_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_users(users):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2)

def hash_password(password, salt):
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

# Seed default demo/admin user if not present
users = get_users()
if "demo@pulsemusic.app" not in users:
    salt = os.urandom(16).hex()
    users["demo@pulsemusic.app"] = {
        "id": "user-demo-1",
        "name": "Demo Listener",
        "email": "demo@pulsemusic.app",
        "password_hash": hash_password("Password123!", salt),
        "salt": salt,
        "created_at": time.time(),
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=demo@pulsemusic.app"
    }
    save_users(users)
    print("Seeded demo user demo@pulsemusic.app")
