import socket

for port in [3000, 8080, 5000, 5173, 8000, 8899]:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.5)
    res = s.connect_ex(('127.0.0.1', port))
    if res == 0:
        print(f"Port {port} is OPEN and LISTENING!")
    s.close()
