import urllib.request
import urllib.parse

songs_to_test = [
    ('Kesariya', 'in-kesariya', 'W1S9AbHpWFY'),
    ('Udi Udi Jaye', 'in-udi-udi-jaye', 'WQfdwsPao9E'),
    ('Tum Se Hi', 'in-tum-se-hi', 'Cb6wuzOurPc'),
    ('Apna Bana Le', 'in-apna-bana-le', 'ElZfdU54Cp8'),
    ('Shape of You', 'en-shape-of-you', 'JGwWNGJdvx8'),
    ('Baarishein', 'in-baarishein', 'PJWemSzExXs'),
    ('Husn', 'in-husn', 'gJLVTKhTnog'),
    ('Choo Lo', 'in-choo-lo', 'sFMRqxCexDk'),
    ('Blinding Lights', 'en-blinding-lights', '4NRXx6U8ABQ'),
]

print("Testing Local Range Audio Server for all 9 songs:")
for title, track_id, ytid in songs_to_test:
    q_enc = urllib.parse.quote(title)
    url = f"http://localhost:3000/api/stream?id={track_id}&ytId={ytid}&q={q_enc}"
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Range': 'bytes=0-2048'
        })
        res = urllib.request.urlopen(req, timeout=15)
        ctype = res.headers.get('Content-Type')
        crange = res.headers.get('Content-Range')
        bytes_len = len(res.read())
        print(f"[PASS {res.status}] {title} -> {ctype} | Range: {crange} | Bytes: {bytes_len}")
    except Exception as e:
        print(f"[FAIL] {title} -> {e}")
