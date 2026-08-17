import urllib.request
import urllib.parse
import json

clean_q = "Ishq Ka Safar Aditya Rikhari"
words = [w for w in clean_q.split() if len(w) > 1]
candidate_queries = []
if len(words) >= 2:
    candidate_queries.append(' '.join(words[-2:]))
    candidate_queries.append(words[-1])
    candidate_queries.append(words[0])

print("Candidates:", candidate_queries)

for fallback_q in candidate_queries:
    f_url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(fallback_q)
    print("Trying URL:", f_url)
    req = urllib.request.Request(f_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, timeout=4) as f_resp:
        f_data = json.loads(f_resp.read().decode('utf-8', errors='ignore'))
        f_res = f_data.get('results', [])
        print(f"  Got {len(f_res)} results for '{fallback_q}'")
        if f_res:
            print("  First song:", f_res[0].get('song'))
            break
