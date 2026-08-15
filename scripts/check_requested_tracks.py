import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')
SERVER_PATH = os.path.join(ROOT, 'server.py')

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    ms_content = f.read()

# Parse existing catalog
existing_titles = set()
for m in re.finditer(r'"title":\s*"([^"]+)"', ms_content):
    existing_titles.add(m.group(1).lower().strip())

for m in re.finditer(r'"id":\s*"([^"]+)"', ms_content):
    existing_titles.add(m.group(1).lower().strip())

print(f"Total existing unique track entries: {len(existing_titles)}")

# Full master list from user prompt
REQUESTED_TRACKS_RAW = """
Tum Hi Ho
Channa Mereya
Kesariya
Apna Bana Le
Tera Ban Jaunga
Agar Tum Saath Ho
Tujhe Kitna Chahne Lage
Shayad
Hawayein
Raabta
Jeene Laga Hoon
Kabira
Ilahi
Phir Se Ud Chala
Kun Faya Kun
Arijit Singh Mashup
Ve Kamleya
Satranga
O Maahi
Heeriye
Chaleya
What Jhumka
Tere Vaaste
Phir Aur Kya Chahiye
Sajni
Aaj Ki Raat
Ami Je Tomar
Aankhon Se Batana
Maan Meri Jaan
Maan Meri Jaan Afterlife
Husn
Ishq
Jo Tum Mere Ho
Kho Gaye Hum Kahan
Tu Hai Kahan
Baarishein
Gul
Kasoor
Alag Aasmaan
Choo Lo
Iktara
Kahani Suno 2.0
O Bedardeya
Tere Pyaar Mein
Pehle Bhi Main
Ve Haaniyaan
Sajni Re
Tum Se
Soni Soni
Soulmate
Tauba Tauba
Aaj Ki Raat
Naina
Akhiyaan Gulaab
Pehle Bhi Main
Zaalima
Afreen Afreen
Daryaa
Mast Magan
Lae Dooba
Bolna
Humsafar
Dil Diyan Gallan
Kaun Tujhe
Hasi
Samjhawan
Main Rang Sharbaton Ka
Muskurane
Humdard
Hamari Adhuri Kahani
Phir Mohabbat
Tera Yaar Hoon Main
Main Agar Kahoon
Ajab Si
Tum Se Hi
Aao Milo Chalo
Zara Sa
Tu Hi Hai
Ishq Wala Love
Manjha
Ranjha
Mere Sohneya
Tere Sang Yaara
Tera Fitoor
Dekh Lena
Lo Safar
Kaise Hua
Bekhayali
Khairiyat
Thodi Jagah
Pal Pal Dil Ke Paas
Dil Ko Karaar Aaya
Bachpan Kahan
Mere Liye Tum Kaafi Ho
Blinding Lights
Save Your Tears
Starboy
Die With A Smile
Perfect
Shape of You
Thinking Out Loud
Photograph
Let Her Go
Someone You Loved
Before You Go
Lovely
Happier
Stay
As It Was
Watermelon Sugar
Adore You
Sign of the Times
Golden
Night Changes
What Makes You Beautiful
Story of My Life
Perfect Night
Cruel Summer
Blank Space
Style
Anti-Hero
Love Story
Cardigan
August
Enchanted
Delicate
You Belong With Me
Shake It Off
Wildest Dreams
All Too Well
Flowers
Wrecking Ball
The Climb
See You Again
Attention
We Don't Talk Anymore
How Long
One Call Away
Cheap Thrills
Treat You Better
There's Nothing Holdin' Me Back
Senorita
Havana
Never Be the Same
Love Yourself
Sorry
Peaches
Ghost
Love Me Again
Cold Water
Let Me Love You
Faded
Alone
On My Way
The Nights
Wake Me Up
Waiting For Love
The Spectre
Animals
Believer
Thunder
Demons
Radioactive
Whatever It Takes
Bones
Enemy
Counting Stars
Apologize
I Lived
Rude
Sugar
Memories
Girls Like You
Maps
Payphone
Animals
Closer
Something Just Like This
Don't Start Now
Levitating
New Rules
One Kiss
Dance Monkey
Attention
Stay With Me
Unstoppable
Lovely
Arcade
Dusk Till Dawn
Attention
Until I Found You
Golden Hour
Belageddu
Anisuthide Yaako Indu
Jotheyali Jothe Jotheyali
Minchagi Neenu Baralu
Ninnindale
Ninnannu Nodida Mele
Karagida Baaninalli
Kannu Hodiyaka Monne Kalitaani
Yenammi Yenammi
Singara Siriye
Kaagadada Doniyalli
Nooru Janmaku
Ondu Malebillu
Neenade Naa
Mungaru Maleye
Kariya I Love You
Ee Sanje Yakagide
Ninnindale Ninnindale
Usire Usire
Hrudayake Hedarike
Marali Manasaagide
Chuttu Chuttu
Dostha Kano
Love You Chinna
Ninna Snehadinda
Hrudaya Hrudaya
Kannu Kannu
Nee Sigovaregu
Ninnaya Nagu
Preetham Gubbi
Bombe Helutaite
Yenagali
Pogaru
Dheera Dheera
Ra Ra Rakkamma
Pushpavati
Toxic
Soul Of Dia
Kadalina
Arare Shuruvayitu
Naguva Nayana
Hoovina Baanadante
Ee Sundara Beladingala
Kolle Kolle
Halli Meshtru
Yaare Koogadali
Jeeva Hoovagide
Nee Nanna Gellalare
Hrudaya Shiva
Samajavaragamana
Inkem Inkem Inkem Kaavaale
Butta Bomma
Srivalli
Oo Antava Oo Oo Antava
Ramuloo Ramulaa
Arjun Reddy Theme
Adiga Adiga
Vachindamma
Pilla Raa
Maate Vinadhuga
Kadalalle
Priyathama Priyathama
Naatu Naatu
Dosti
Komuram Bheemudo
Naacho Naacho
Dheevara
Saahore Baahubali
Kannaa Nidurinchara
Yenti Yenti
Yemito
Vellipomaakey
Ninnu Kori
Choosi Choodangane
Nee Kannu Neeli Samudram
Neeli Neeli Aakasam
Oh Sita Hey Rama
Inthandham
Kalaavathi
Jimikki Ponnu
Mehabooba
Kesariya Rangu
Gaali Valuga
Pacha Bottesina
Manohari
Ammadu Let's Do Kummudu
Blockbuster
Top Lesi Poddi
Ringa Ringa
Daang Daang
Mind Block
Seeti Maar
Jai Balayya
Kurchi Madathapetti
Chuttamalle
Fear Song
Godari Gattu
Lover
Excuses
295
Insane
Brown Munde
We Rollin
Hass Hass
Softly
Winning Speech
Cheques
Born To Shine
No Love
Levels
Mi Amor
Lahore
Naah
Backbone
Khaab
Sakhiyaan
Titliaan
Pasoori
Pasoori Nu
Heeriye
Jalebi Baby
Do You Know
High Rated Gabru
Proper Patola
Laung Laachi
3 Peg
Mann
Lehanga
Bijlee Bijlee
Vibe
Summer High
With You
Bandana
Admirin You
One Love
8 Asle
Bandookan Wala
On Top
Hukam
Jatt Life
Case
Jatt Vailly
Mexico
So High
Same Beef
Clash
52 Gaj Ka Daman
Bahut Pyar Kare Se
Desi Desi Na Bola Kar
Moto
Feelings
Tokk
Mera Balma
Gajban
Chand
Jaat
Kabootar
Solid Body
Bahu Milgi
Tagdi
Dekhya Karo
Jale 2
Jale
Balam Thanedar
Aankh Marey
Chatak Matak
Thada Bhartar
Russian Bandana
Gypsy
Hooka
Loot Liya
Nakhre
Bawli
Pani Chhalke
Lado Rani
Dabban Aali Jaatni
Jaatni
Kale Kagaz
Yadav Brand 2
Yadav Brand
Kallo
Chora Baba Ka
Desi Desi
Daru Badnaam
Badmashi
Jaat Ki Setting
Kalesh
Chora Jaat Ka
Banno
Moka Soka
System
Bairan
Feel
dheema dheema
udi udi
zulfein
Dhurandhar
Srivalli Hindi
Srivalli Telugu
Srivalli Tamil
Srivalli Kannada
Srivalli Malayalam
"""

lines = [line.strip() for line in REQUESTED_TRACKS_RAW.strip().split('\n') if line.strip()]
print(f"Total prompt requested track names: {len(lines)}")

# Normalize and detect missing
missing = []
present = []
seen = set()

for t in lines:
    t_clean = t.lower()
    if t_clean in seen:
        continue
    seen.add(t_clean)
    
    # Check if present in existing
    found = False
    for ext in existing_titles:
        if t_clean == ext or (len(t_clean) > 4 and (t_clean in ext or ext in t_clean)):
            found = True
            break
    if found:
        present.append(t)
    else:
        missing.append(t)

print(f"\nPresent in catalog: {len(present)}")
print(f"Missing from catalog to add: {len(missing)}")
print("Sample missing:", missing[:30])
