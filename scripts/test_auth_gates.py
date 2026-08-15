import urllib.request
import json
import time

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
print("TESTING GOOGLE & EMAIL CREDENTIAL MATCH VERIFICATION")
print("==========================================================")

google_test_email = f"google.user.{int(time.time())}@gmail.com"
correct_pass = "GoogleSecret123!"
wrong_pass = "WrongPass999!"

# Step 1: Sign up new Google user with matching password
status, body = post_json("/api/auth/signup", {
    "name": "Google User",
    "email": google_test_email,
    "password": correct_pass,
    "confirmPassword": correct_pass
})
assert status == 201, f"Expected 201, got {status}: {body}"
print(f"[PASS] 1. New Google user account created with email & password match: {google_test_email}")

# Step 2: Test login with incorrect password -> MUST FAIL with 401
status, body = post_json("/api/auth/login", {
    "email": google_test_email,
    "password": wrong_pass
})
assert status == 401 and body.get("code") == "INVALID_PASSWORD", f"Expected 401 INVALID_PASSWORD, got {status}: {body}"
print(f"[PASS] 2. Login with wrong password correctly rejected with HTTP 401 (INVALID_PASSWORD): {body.get('error')}")

# Step 3: Test login with matching password -> MUST SUCCEED with 200
status, body = post_json("/api/auth/login", {
    "email": google_test_email,
    "password": correct_pass
})
assert status == 200 and body.get("success") is True, f"Expected 200 OK, got {status}: {body}"
print(f"[PASS] 3. Login with matching password verified and authenticated successfully (HTTP 200): {body.get('message')}")

print("\nAll Google & Credential Verification endpoints verified with 100% success!")
