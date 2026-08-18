import json, re

with open('scratch/resolved_covers.json', 'r', encoding='utf-8') as f:
    resolved_covers = json.load(f)

# Also load scratch/all_verified_catalog.json for extra covers
with open('scratch/all_verified_catalog.json', 'r', encoding='utf-8') as f:
    verified_catalog = json.load(f)

master_covers = {}

# Map title keys to high-res covers
for k, item in verified_catalog.items():
    cov = item.get('cover')
    if cov and 'unsplash' not in cov and 'pulse-logo' not in cov:
        master_covers[k.lower().strip()] = cov

# Specific overrides for high-res official iTunes covers
overrides = {
    'believer': 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/600x600bb.jpg',
    'radioactive': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/30/2c/4b302cb6-7a14-5464-4e97-0577e9d0be49/18UMGIM82277.rgb.jpg/600x600bb.jpg',
    'demons': 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/1f/fa/09/1ffa092f-f52f-4a66-7d10-4cc5982dc747/12UMGIM46901.rgb.jpg/600x600bb.jpg',
    'bones': 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/76/77/08/767708a7-ec93-3b3d-3bac-40086e5a265c/21UM1IM29634.rgb.jpg/600x600bb.jpg',
    'see you again': 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e6/8a/68/e68a688e-129e-cb9d-938f-bc3ee37059ae/075679930910.jpg/600x600bb.jpg',
    'sunflower': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/30/2c/4b302cb6-7a14-5464-4e97-0577e9d0be49/18UMGIM82277.rgb.jpg/600x600bb.jpg',
    'skyfall': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b3/fe/cf/b3fecf76-0359-8e14-0651-4b101fc68a3f/886443673632.jpg/600x600bb.jpg',
    'shallow': 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b1/9f/ef/b19fef51-79de-a940-e8ab-9e4e07b04d96/18UMGIM53752.rgb.jpg/600x600bb.jpg',
    'lose yourself': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/08/23/fc/0823fcd9-cb44-695b-32bf-b3bf51d9f800/00606949351229.rgb.jpg/600x600bb.jpg',
    'let it go': 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/e7/ed/8a/e7ed8a2c-4835-e4dc-efec-5e81abd6c241/13DMGIM04438.rgb.jpg/600x600bb.jpg',
    'eye of the tiger': 'https://is1-ssl.mzstatic.com/image/thumb/Features115/v4/49/21/4d/49214d77-2eb5-60a1-75d3-67d30b449326/dj.szkhyuyj.jpg/600x600bb.jpg',
    'tujhe dekha toh': 'https://is1-ssl.mzstatic.com/image/thumb/Music62/v4/46/58/97/465897ed-fe10-e218-4cac-02c69ca36ad0/191773207717.jpg/600x600bb.jpg',
    'smells like teen spirit': 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/95/fd/b9/95fdb9b2-6d2b-92a6-97f2-51c1a6d77f1a/00602527874609.rgb.jpg/600x600bb.jpg',
    'chaiyya chaiyya': 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/8e/f8/85/8ef88544-a6c7-018b-0a75-dc3b6b024fa0/cover.jpg/600x600bb.jpg',
    'i want it that way': 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5f/6b/e9/5f6be919-1b9e-30ef-45b7-cc27fc428fd5/012414167224.jpg/600x600bb.jpg',
    'pehla nasha': 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/96/c9/3a/96c93aa7-1872-8297-493a-2fc72d540af0/191773221072.jpg/600x600bb.jpg',
    'wonderwall': 'https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/04/92/e0/0492e08b-cbcc-9969-9ad6-8f5a0888068c/5051961007107.jpg/600x600bb.jpg',
    'chura ke dil mera': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/68/8e/23/688e230e-bb21-815e-0c41-8b8f21ef0205/cover.jpg/600x600bb.jpg',
    'my heart will go on': 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/ab/5a/96/ab5a9681-e891-8449-53d2-7d358501f97f/mzi.zbauexhy.jpg/600x600bb.jpg',
    'starboy': 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b2/c0/1d/b2c01d38-2798-1bce-e6f3-8d0959ca51dd/23UMGIM22528.rgb.jpg/600x600bb.jpg',
    'blinding lights': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6f/bc/e6/6fbce6c4-c38c-72d8-4fd0-66cfff32f679/20UMGIM12176.rgb.jpg/600x600bb.jpg',
    'shape of you': 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg',
    'levitating': 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/600x600bb.jpg',
    'as it was': 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/600x600bb.jpg',
    'cruel summer': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/600x600bb.jpg',
    'faded': 'https://c.saavncdn.com/562/Different-World-English-2018-20181130144209-500x500.webp',
    'titanium': 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f6/b9/e2/f6b9e2df-c638-3e4b-c28d-a68b06465758/5099997943051.jpg/600x600bb.jpg',
    'closer': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/f8/38/41f8380b-9b56-d5d4-31f7-a6411c0c9aaa/886446102054.jpg/600x600bb.jpg',
    'animals': 'https://c.saavncdn.com/271/Gold-Skies-feat-Aleesia--English-2014-20190607044621-500x500.webp',
    'softly': 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d3/08/bc/d308bc6a-20e1-6532-d933-35d1b429210e/5054197755538.jpg/600x600bb.jpg',
    'wavy': 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c2/ce/a0/c2cea088-dbde-43db-346f-e536058fdcfb/5063483978438_cover.jpg/600x600bb.jpg',
    'lover': 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/600x600bb.jpg',
    'excuses': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/47/47/ac/4747ac85-1658-64ae-bc82-220a4d6213d5/859747478890_cover.jpg/600x600bb.jpg',
    'brown munde': 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/16/d6/94/16d6949f-6072-0b42-f88b-a61ffb129952/859747110851_cover.jpg/600x600bb.jpg',
    '295': 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/97/69/58/976958ae-725e-bd41-6755-f0921c697840/810063889609_cover.jpg/600x600bb.jpg',
    'born to shine': 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d2/89/ac/d289ac98-749e-3822-6b6e-b06aa4815715/859740651597_cover.jpg/600x600bb.jpg',
    'white brown black': 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0b/c2/e6/0bc2e611-ef63-b23c-fbad-1d0523463da2/22UM1IM39836.rgb.jpg/600x600bb.jpg',
    'mi amor': 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/20/50/f8/2050f8b5-0ac0-36b7-8ae5-de7849d6468c/cover.jpg/600x600bb.jpg',
    'kesariya': 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg',
    'apna bana le': 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/2e/0b/c0/2e0bc070-112f-a827-6ad8-6bc64f7caaff/840214460180.png/600x600bb.jpg',
    'tum se hi': 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3d/c7/43/3dc74387-e7f4-2342-397c-4cf2037c69a5/8902894623223_cover.jpg/600x600bb.jpg',
    'chaleya': 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/1e/ff/32/1eff3216-190d-6fd9-8f68-acbba846e6ee/8903431956026_cover.jpg/600x600bb.jpg',
    'kal ho naa ho': 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/fb/82/da/fb82dab1-d0cd-714c-000c-6450774fd5d4/888880945587.jpg/600x600bb.jpg',
    'tum hi ho': 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/600x600bb.jpg',
    'kabira': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/62/d6/74/62d67432-0670-631f-db6a-d4bac3adae4b/8902894353328_cover.jpg/600x600bb.jpg',
    'kun faya kun': 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/56/ac/41/56ac41f7-99f3-3eae-3b07-443167292c4e/8902894697408_cover.jpg/600x600bb.jpg',
    'raataan lambiyan': 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/61/65/ae/6165aee9-8bb9-0bd4-02b0-5d0f1e6257a3/886449510238.jpg/600x600bb.jpg',
    'heeriye': 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f0/8c/2a/f08c2aeb-3903-8738-d0a5-8c2e4547eed7/5054197711039.jpg/600x600bb.jpg',
    'shayad': 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4d/7c/9e/4d7c9e55-4ed7-ee60-83c8-49bc452227b3/886448257929.jpg/600x600bb.jpg'
}

master_covers.update(overrides)

# Generate JS Object for master covers lookup
entries = [f"  '{k.replace(chr(39), chr(92)+chr(39))}': '{v}'" for k, v in master_covers.items()]
covers_dict_js = "const MASTER_OFFICIAL_COVERS = {\n" + ",\n".join(entries) + "\n};\n\nfunction getOfficialCover(title, artist) {\n  const t = (title || '').toLowerCase().trim();\n  for (const [k, c] of Object.entries(MASTER_OFFICIAL_COVERS)) {\n    if (t.includes(k) || k.includes(t)) return c;\n  }\n  return null;\n}\n"

with open('scratch/master_covers.js', 'w', encoding='utf-8') as f:
    f.write(covers_dict_js)

print(f"Generated master covers with {len(master_covers)} exact artwork mappings.")
