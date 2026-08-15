import os
import ctypes
from ctypes import wintypes

GENERIC_READ = 0x80000000
FILE_SHARE_READ = 0x00000001
FILE_SHARE_WRITE = 0x00000002
FILE_SHARE_DELETE = 0x00000004
OPEN_EXISTING = 3
FILE_ATTRIBUTE_NORMAL = 0x80

src = r"C:\Users\pushk\AppData\Local\Microsoft\Edge\User Data\Default\Network\Cookies"
dst = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'scratch', 'edge_cookies.db')
os.makedirs(os.path.dirname(dst), exist_ok=True)

# Copy using Win32 API with full share mode
kernel32 = ctypes.windll.kernel32
CreateFileW = kernel32.CreateFileW
CreateFileW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, wintypes.LPVOID, wintypes.DWORD, wintypes.DWORD, wintypes.HANDLE]
CreateFileW.restype = wintypes.HANDLE

ReadFile = kernel32.ReadFile
ReadFile.argtypes = [wintypes.HANDLE, wintypes.LPVOID, wintypes.DWORD, ctypes.POINTER(wintypes.DWORD), wintypes.LPVOID]
ReadFile.restype = wintypes.BOOL

CloseHandle = kernel32.CloseHandle
CloseHandle.argtypes = [wintypes.HANDLE]
CloseHandle.restype = wintypes.BOOL

h_file = CreateFileW(src, GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE, None, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, None)
if h_file == wintypes.HANDLE(-1).value or h_file == -1:
    print(f"Failed to open source file: WinError {ctypes.GetLastError()}")
else:
    print("Opened locked Edge Cookies DB with Shared Read!")
    buffer_size = 64 * 1024
    buf = ctypes.create_string_buffer(buffer_size)
    bytes_read = wintypes.DWORD(0)
    with open(dst, 'wb') as out_f:
        while True:
            success = ReadFile(h_file, buf, buffer_size, ctypes.byref(bytes_read), None)
            if not success or bytes_read.value == 0:
                break
            out_f.write(buf.raw[:bytes_read.value])
    CloseHandle(h_file)
    print(f"Successfully copied locked cookie DB to {dst}: {os.path.getsize(dst)} bytes!")
