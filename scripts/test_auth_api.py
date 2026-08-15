import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:3000"

def post_json(endpoint, payload):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            body = json.loads(resp.read().decode('utf-8'))
            return resp.status, body
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode('utf-8'))
        return e.code, body
    except Exception as e:
        return 0, {"error": str(e)}

print("==========================================================")
print("PULSE AUTHENTICATION ENGINE AUTOMATED TEST SUITE")
print("==========================================================")

import time
test_email = f"alex.test.{int(time.time())}@example.com"

tests = [
    # 1. Signup Missing Name
    ("/api/auth/signup", {"name": "", "email": "alex@example.com", "password": "Password123!"}, 400, "MISSING_NAME"),
    # 2. Signup Invalid Name (<2 chars)
    ("/api/auth/signup", {"name": "A", "email": "alex@example.com", "password": "Password123!"}, 400, "INVALID_NAME"),
    # 3. Signup Invalid Email Format
    ("/api/auth/signup", {"name": "Alex Miller", "email": "invalid-email", "password": "Password123!"}, 400, "INVALID_EMAIL_FORMAT"),
    # 4. Signup Weak Password (<8 chars)
    ("/api/auth/signup", {"name": "Alex Miller", "email": "alex@example.com", "password": "short"}, 400, "PASSWORD_TOO_SHORT"),
    # 5. Signup Password Missing Complexity
    ("/api/auth/signup", {"name": "Alex Miller", "email": "alex@example.com", "password": "passwordonly"}, 400, "WEAK_PASSWORD_COMPLEXITY"),
    # 6. Signup Password Mismatch
    ("/api/auth/signup", {"name": "Alex Miller", "email": "alex@example.com", "password": "Password123!", "confirmPassword": "DifferentPassword123!"}, 422, "PASSWORD_MISMATCH"),
    # 7. Valid Signup
    ("/api/auth/signup", {"name": "Alex Miller", "email": test_email, "password": "Password123!", "confirmPassword": "Password123!"}, 201, None),
    # 8. Duplicate Signup (Email Already Exists)
    ("/api/auth/signup", {"name": "Alex Miller Duplicate", "email": test_email, "password": "Password123!", "confirmPassword": "Password123!"}, 409, "EMAIL_ALREADY_EXISTS"),
    # 9. Login Missing Password
    ("/api/auth/login", {"email": test_email, "password": ""}, 400, "MISSING_CREDENTIALS"),
    # 10. Login User Not Found
    ("/api/auth/login", {"email": "nonexistent.user@example.com", "password": "Password123!"}, 401, "USER_NOT_FOUND"),
    # 11. Login Wrong Password
    ("/api/auth/login", {"email": test_email, "password": "WrongPassword999!"}, 401, "INVALID_PASSWORD"),
    # 12. Valid Login
    ("/api/auth/login", {"email": test_email, "password": "Password123!"}, 200, None),
    # 13. Forgot Password Invalid Email
    ("/api/auth/forgot-password", {"email": "not-an-email"}, 400, "INVALID_EMAIL"),
    # 14. Forgot Password User Not Found
    ("/api/auth/forgot-password", {"email": "nobody@example.com"}, 404, "USER_NOT_FOUND"),
    # 15. Forgot Password Existing User
    ("/api/auth/forgot-password", {"email": test_email}, 200, None),
]

passed = 0
failed = 0

for i, (endpoint, payload, expected_status, expected_code) in enumerate(tests, 1):
    status, body = post_json(endpoint, payload)
    
    is_success = (status == expected_status)
    if expected_code:
        is_success = is_success and (body.get('code') == expected_code)
    
    if is_success:
        passed += 1
        msg = body.get('message') or body.get('error')
        print(f"  [PASS] Test {i:2d}: {endpoint} -> HTTP {status} (Code: {body.get('code', 'OK')}) | Msg: '{msg}'")
    else:
        failed += 1
        print(f"  [FAIL] Test {i:2d}: {endpoint} -> Expected HTTP {expected_status} (Code: {expected_code}), Got HTTP {status} (Body: {body})")

print(f"\n==========================================================")
print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED (Total: {len(tests)})")
print("==========================================================")
