import urllib.request
import urllib.parse
import json

songs_to_test = [
    ('Kesariya', 'W1S9AbHpWFY'),
    ('Udi Udi Jaye', 'WQfdwsPao9E'),
    ('Tum Se Hi', 'Cb6wuzOurPc'),
    ('Apna Bana Le', 'ElZfdU54Cp8'),
    ('Channa Mereya', 'bzSTpdcs-EI'),
    ('Shape of You', 'JGwWNGJdvx8'),
    ('Brown Munde', 'VNs_cCtdbPc'),
    ('Tauba Tauba', 'LK7-_dgAVQE'),
    ('Dil Diyan Gallan', 'SAcpESN_Fk4'),
]

print("Verifying 302 High-Speed CDN Streaming for all sample songs:")
for title, ytid in songs_to_test:
    url = f"http://localhost:3000/api/stream?ytId={ytid}&q={urllib.parse.quote(title)}"
    try:
        # Don't follow redirect, just check the 302 Location header
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def http_error_302(self, req, fp, code, msg, headers):
                return fp
        
        opener = urllib.request.build_opener(NoRedirect)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = opener.open(req, timeout=10)
        loc = res.headers.get('Location')
        print(f"[OK 302] {title} ({ytid}) -> Location: {loc[:60]}...")
    except Exception as e:
        print(f"[FAIL] {title} ({ytid}) -> {e}")
