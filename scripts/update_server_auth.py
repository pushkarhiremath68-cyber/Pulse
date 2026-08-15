import os
import re

SERVER_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'server.py')

with open(SERVER_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add hashlib import if not present
if 'import hashlib' not in content:
    content = content.replace('import base64', 'import base64\nimport hashlib')

# 2. Add auth storage logic before CustomHTTPRequestHandler
auth_helpers = '''
# =========================================================================
# PULSE AUTHENTICATION ENGINE (Real Persistent User Store & Validation)
# =========================================================================
USERS_FILE = os.path.join(ROOT_DIR, 'storage', 'users.json')
FAILED_ATTEMPTS = {}
AUTH_LOCK = threading.Lock()

def get_users():
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_users(users):
    with AUTH_LOCK:
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2)

def hash_password(password, salt):
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

def validate_email_format(email):
    if not email or not isinstance(email, str):
        return False
    return bool(re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email.strip()))
'''

if 'PULSE AUTHENTICATION ENGINE' not in content:
    content = content.replace('class CustomHTTPRequestHandler', auth_helpers + '\nclass CustomHTTPRequestHandler')

# 3. Add do_POST method and update do_OPTIONS to CustomHTTPRequestHandler
post_handler = '''    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization, Accept')
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Read JSON body
        content_length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b'{}'
        try:
            body = json.loads(body_bytes.decode('utf-8'))
        except Exception:
            body = {}

        # ---------------------------------------------------------------------
        # 1. SIGNUP ENDPOINT (/api/auth/signup)
        # ---------------------------------------------------------------------
        if path == '/api/auth/signup':
            name = (body.get('name') or '').strip()
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            confirm_password = body.get('confirmPassword') or body.get('confirm_password') or ''

            # Field validation
            if not name:
                self._send_json(400, {
                    "success": False,
                    "error": "Full Name is required.",
                    "code": "MISSING_NAME",
                    "field": "name"
                })
                return

            if len(name) < 2:
                self._send_json(400, {
                    "success": False,
                    "error": "Full name must be at least 2 characters.",
                    "code": "INVALID_NAME",
                    "field": "name"
                })
                return

            if not email:
                self._send_json(400, {
                    "success": False,
                    "error": "Email address is required.",
                    "code": "MISSING_EMAIL",
                    "field": "email"
                })
                return

            if not validate_email_format(email):
                self._send_json(400, {
                    "success": False,
                    "error": "Please enter a valid email address (e.g. name@domain.com).",
                    "code": "INVALID_EMAIL_FORMAT",
                    "field": "email"
                })
                return

            if not password:
                self._send_json(400, {
                    "success": False,
                    "error": "Password is required.",
                    "code": "MISSING_PASSWORD",
                    "field": "password"
                })
                return

            if len(password) < 8:
                self._send_json(400, {
                    "success": False,
                    "error": "Password must be at least 8 characters long.",
                    "code": "PASSWORD_TOO_SHORT",
                    "field": "password"
                })
                return

            if not re.search(r'[A-Za-z]', password) or not re.search(r'[0-9!@#$%^&*(),.?":{}|<>]', password):
                self._send_json(400, {
                    "success": False,
                    "error": "Password must contain at least one letter and one number or special character.",
                    "code": "WEAK_PASSWORD_COMPLEXITY",
                    "field": "password"
                })
                return

            if confirm_password and password != confirm_password:
                self._send_json(422, {
                    "success": False,
                    "error": "Passwords do not match. Please re-enter your password.",
                    "code": "PASSWORD_MISMATCH",
                    "field": "confirmPassword"
                })
                return

            # Check duplicate email
            users = get_users()
            if email in users:
                self._send_json(409, {
                    "success": False,
                    "error": "An account with this email address already exists. Please log in instead.",
                    "code": "EMAIL_ALREADY_EXISTS",
                    "field": "email"
                })
                return

            # Create new user
            salt = os.urandom(16).hex()
            user_id = f"user-{int(time.time())}-{os.urandom(3).hex()}"
            avatar = f"https://api.dicebear.com/7.x/bottts/svg?seed={urllib.parse.quote(email)}"
            new_user = {
                "id": user_id,
                "name": name,
                "email": email,
                "password_hash": hash_password(password, salt),
                "salt": salt,
                "created_at": time.time(),
                "avatar": avatar
            }
            users[email] = new_user
            save_users(users)

            token = base64.b64encode(f"{user_id}:{email}:{int(time.time())}".encode('utf-8')).decode('utf-8')
            print(f"[Pulse Auth] New user registered: '{name}' ({email})")

            self._send_json(201, {
                "success": True,
                "message": f"Welcome to Pulse, {name}! Your account was created successfully.",
                "user": {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "avatar": avatar
                },
                "token": token
            })
            return

        # ---------------------------------------------------------------------
        # 2. LOGIN ENDPOINT (/api/auth/login)
        # ---------------------------------------------------------------------
        if path == '/api/auth/login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''

            if not email or not password:
                self._send_json(400, {
                    "success": False,
                    "error": "Please enter both your email address and password.",
                    "code": "MISSING_CREDENTIALS"
                })
                return

            if not validate_email_format(email):
                self._send_json(400, {
                    "success": False,
                    "error": "Please enter a valid email address.",
                    "code": "INVALID_EMAIL_FORMAT",
                    "field": "email"
                })
                return

            # Check rate limiting
            now = time.time()
            attempts_info = FAILED_ATTEMPTS.get(email, {'count': 0, 'locked_until': 0})
            if attempts_info.get('locked_until', 0) > now:
                remaining_secs = int(attempts_info['locked_until'] - now)
                self._send_json(429, {
                    "success": False,
                    "error": f"Too many failed login attempts. Account temporarily locked for {remaining_secs} seconds.",
                    "code": "RATE_LIMITED",
                    "retryAfter": remaining_secs
                })
                return

            users = get_users()
            user = users.get(email)

            if not user:
                # Track failed attempt
                attempts_info['count'] = attempts_info.get('count', 0) + 1
                if attempts_info['count'] >= 5:
                    attempts_info['locked_until'] = now + 300 # 5 min lock
                FAILED_ATTEMPTS[email] = attempts_info

                self._send_json(401, {
                    "success": False,
                    "error": "No account found with this email address. Please check your email or sign up.",
                    "code": "USER_NOT_FOUND",
                    "field": "email"
                })
                return

            # Verify password
            salt = user.get('salt', '')
            expected_hash = user.get('password_hash', '')
            actual_hash = hash_password(password, salt)

            if actual_hash != expected_hash:
                attempts_info['count'] = attempts_info.get('count', 0) + 1
                if attempts_info['count'] >= 5:
                    attempts_info['locked_until'] = now + 300
                FAILED_ATTEMPTS[email] = attempts_info

                self._send_json(401, {
                    "success": False,
                    "error": "Incorrect password. Please verify your password and try again.",
                    "code": "INVALID_PASSWORD",
                    "field": "password"
                })
                return

            # Clear failed attempts on success
            if email in FAILED_ATTEMPTS:
                del FAILED_ATTEMPTS[email]

            token = base64.b64encode(f"{user['id']}:{email}:{int(time.time())}".encode('utf-8')).decode('utf-8')
            print(f"[Pulse Auth] User logged in: '{user.get('name')}' ({email})")

            self._send_json(200, {
                "success": True,
                "message": f"Welcome back, {user.get('name')}!",
                "user": {
                    "id": user.get('id'),
                    "name": user.get('name'),
                    "email": user.get('email'),
                    "avatar": user.get('avatar') or f"https://api.dicebear.com/7.x/bottts/svg?seed={urllib.parse.quote(email)}"
                },
                "token": token
            })
            return

        # ---------------------------------------------------------------------
        # 3. FORGOT PASSWORD ENDPOINT (/api/auth/forgot-password)
        # ---------------------------------------------------------------------
        if path == '/api/auth/forgot-password':
            email = (body.get('email') or '').strip().lower()
            if not email or not validate_email_format(email):
                self._send_json(400, {
                    "success": False,
                    "error": "Please provide a valid email address.",
                    "code": "INVALID_EMAIL",
                    "field": "email"
                })
                return

            users = get_users()
            if email not in users:
                self._send_json(404, {
                    "success": False,
                    "error": "No account exists with this email address. Please create a new account.",
                    "code": "USER_NOT_FOUND",
                    "field": "email"
                })
                return

            self._send_json(200, {
                "success": True,
                "message": f"Password reset instructions have been sent to {email}."
            })
            return

        # ---------------------------------------------------------------------
        # 4. LOGOUT ENDPOINT (/api/auth/logout)
        # ---------------------------------------------------------------------
        if path == '/api/auth/logout':
            self._send_json(200, {
                "success": True,
                "message": "Logged out successfully."
            })
            return

        # Default 404
        self._send_json(404, {"success": False, "error": f"Endpoint '{path}' not found", "code": "NOT_FOUND"})

    def _send_json(self, status_code, data):
        response_bytes = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization, Accept')
        self.end_headers()
        self.wfile.write(response_bytes)
'''

# Replace do_OPTIONS in CustomHTTPRequestHandler with the new methods
content = re.sub(r'    def do_OPTIONS\(self\):.*?self\.end_headers\(\)', post_handler.strip(), content, flags=re.DOTALL)

with open(SERVER_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully updated {SERVER_PATH} with complete Authentication Engine!")
