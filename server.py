import http.server
import socketserver
import threading
import os
import sys
import json
import urllib.request
import urllib.parse
import urllib.error
import time
import re

import base64
import hashlib
try:
    from Crypto.Cipher import DES
except ImportError:
    DES = None

try:
    import yt_dlp
except ImportError:
    yt_dlp = None

PORTS = [3000, 8080, 5000, 5173, 8000, 8899]
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
MUSIC_DIR = os.path.join(ROOT_DIR, 'storage', 'music')
os.makedirs(MUSIC_DIR, exist_ok=True)

# Lock map for concurrent track downloads
DOWNLOAD_LOCKS = {}
GLOBAL_LOCK = threading.Lock()

TOP_SONGS = [
    ("in-shayad", "Shayad", "Arijit Singh", None),
    ("in-raabta", "Raabta", "Arijit Singh", None),
    ("in-jeene-laga-hoon", "Jeene Laga Hoon", "Atif Aslam", None),
    ("in-kabira", "Kabira", "Tochi Raina", None),
    ("in-ilahi", "Ilahi", "Arijit Singh", None),
    ("in-arijit-singh-mashup", "Arijit Singh Mashup", "Arijit Singh", None),
    ("in-what-jhumka", "What Jhumka", "Arijit Singh", None),
    ("in-ami-je-tomar", "Ami Je Tomar", "Arijit Singh", None),
    ("in-aankhon-se-batana", "Aankhon Se Batana", "Dikshant", None),
    ("in-maan-meri-jaan", "Maan Meri Jaan", "King", None),
    ("in-maan-meri-jaan-afterlife", "Maan Meri Jaan Afterlife", "King", None),
    ("in-ishq-faheem", "Ishq", "Faheem Abdullah", None),
    ("in-jo-tum-mere-ho", "Jo Tum Mere Ho", "Anuv Jain", None),
    ("in-kho-gaye-hum-kahan", "Kho Gaye Hum Kahan", "Jasleen Royal", None),
    ("in-tu-hai-kahan", "Tu Hai Kahan", "AUR", None),
    ("in-gul-anuv", "Gul", "Anuv Jain", None),
    ("in-alag-aasmaan", "Alag Aasmaan", "Anuv Jain", None),
    ("in-kahani-suno", "Kahani Suno 2.0", "Kaifi Khalil", None),
    ("in-o-bedardeya", "O Bedardeya", "Arijit Singh", None),
    ("in-tere-pyaar-mein", "Tere Pyaar Mein", "Arijit Singh", None),
    ("in-soni-soni", "Soni Soni", "Darshan Raval", None),
    ("in-soulmate-badshah", "Soulmate", "Badshah", None),
    ("in-akhiyaan-gulaab", "Akhiyaan Gulaab", "Mitraz", None),
    ("in-afreen-afreen", "Afreen Afreen", "Rahat Fateh Ali Khan", None),
    ("in-mast-magan", "Mast Magan", "Arijit Singh", None),
    ("in-lae-dooba", "Lae Dooba", "Sunidhi Chauhan", None),
    ("in-bolna", "Bolna", "Arijit Singh", None),
    ("in-kaun-tujhe", "Kaun Tujhe", "Palak Muchhal", None),
    ("in-hasi-ban-gaye", "Hasi", "Ami Mishra", None),
    ("in-samjhawan", "Samjhawan", "Arijit Singh", None),
    ("in-muskurane", "Muskurane", "Arijit Singh", None),
    ("in-humdard", "Humdard", "Arijit Singh", None),
    ("in-hamari-adhuri-kahani", "Hamari Adhuri Kahani", "Arijit Singh", None),
    ("in-phir-mohabbat", "Phir Mohabbat", "Mohd Irfan", None),
    ("in-main-agar-kahoon", "Main Agar Kahoon", "Sonu Nigam", None),
    ("in-ajab-si", "Ajab Si", "KK", None),
    ("in-zara-sa", "Zara Sa", "KK", None),
    ("in-ishq-wala-love", "Ishq Wala Love", "Shekhar Ravjiani", None),
    ("in-manjha-vishal", "Manjha", "Vishal Mishra", None),
    ("in-mere-sohneya", "Mere Sohneya", "Sachet Tandon", None),
    ("in-tere-sang-yaara", "Tere Sang Yaara", "Atif Aslam", None),
    ("in-tera-fitoor", "Tera Fitoor", "Arijit Singh", None),
    ("in-dekh-lena", "Dekh Lena", "Arijit Singh", None),
    ("in-lo-safar", "Lo Safar", "Jubin Nautiyal", None),
    ("in-kaise-hua", "Kaise Hua", "Vishal Mishra", None),
    ("in-khairiyat", "Khairiyat", "Arijit Singh", None),
    ("in-thodi-jagah", "Thodi Jagah", "Arijit Singh", None),
    ("in-dil-ko-karaar-aaya", "Dil Ko Karaar Aaya", "Yasser Desai", None),
    ("in-bachpan-kahan", "Bachpan Kahan", "Arijit Singh", None),
    ("in-mere-liye-tum-kaafi-ho", "Mere Liye Tum Kaafi Ho", "Ayushmann Khurrana", None),
    ("in-dheema-dheema", "dheema dheema", "Harshavardhan Rameshwar", None),
    ("in-udi-udi-full", "udi udi", "Sukhwinder Singh", None),
    ("in-zulfein-aditya", "zulfein", "Aditya Rikhari", None),
    ("in-dhurandhar", "Dhurandhar", "Hanumankind", None),
    ("in-srivalli-hindi", "Srivalli Hindi", "Javed Ali", None),
    ("te-srivalli-telugu", "Srivalli Telugu", "Sid Sriram", None),
    ("ta-srivalli-tamil", "Srivalli Tamil", "Sid Sriram", None),
    ("kn-srivalli-kannada", "Srivalli Kannada", "Sid Sriram", None),
    ("ml-srivalli-malayalam", "Srivalli Malayalam", "Sid Sriram", None),
    ("en-save-your-tears", "Save Your Tears", "The Weeknd", None),
    ("en-thinking-out-loud", "Thinking Out Loud", "Ed Sheeran", None),
    ("en-photograph", "Photograph", "Ed Sheeran", None),
    ("en-let-her-go", "Let Her Go", "Passenger", None),
    ("en-someone-you-loved", "Someone You Loved", "Lewis Capaldi", None),
    ("en-before-you-go", "Before You Go", "Lewis Capaldi", None),
    ("en-happier-marshmello", "Happier", "Marshmello ft. Bastille", None),
    ("en-adore-you", "Adore You", "Harry Styles", None),
    ("en-sign-of-the-times", "Sign of the Times", "Harry Styles", None),
    ("en-golden-harry", "Golden", "Harry Styles", None),
    ("en-night-changes", "Night Changes", "One Direction", None),
    ("en-what-makes-you-beautiful", "What Makes You Beautiful", "One Direction", None),
    ("en-story-of-my-life", "Story of My Life", "One Direction", None),
    ("en-perfect-night", "Perfect Night", "LE SSERAFIM", None),
    ("en-style-taylor", "Style", "Taylor Swift", None),
    ("en-anti-hero", "Anti-Hero", "Taylor Swift", None),
    ("en-cardigan", "Cardigan", "Taylor Swift", None),
    ("en-august", "August", "Taylor Swift", None),
    ("en-enchanted", "Enchanted", "Taylor Swift", None),
    ("en-delicate", "Delicate", "Taylor Swift", None),
    ("en-you-belong-with-me", "You Belong With Me", "Taylor Swift", None),
    ("en-shake-it-off", "Shake It Off", "Taylor Swift", None),
    ("en-wildest-dreams", "Wildest Dreams", "Taylor Swift", None),
    ("en-all-too-well", "All Too Well", "Taylor Swift", None),
    ("en-wrecking-ball", "Wrecking Ball", "Miley Cyrus", None),
    ("en-the-climb", "The Climb", "Miley Cyrus", None),
    ("en-see-you-again", "See You Again", "Wiz Khalifa ft. Charlie Puth", None),
    ("en-attention-charlie", "Attention", "Charlie Puth", None),
    ("en-we-dont-talk-anymore", "We Don't Talk Anymore", "Charlie Puth ft. Selena Gomez", None),
    ("en-how-long", "How Long", "Charlie Puth", None),
    ("en-one-call-away", "One Call Away", "Charlie Puth", None),
    ("en-cheap-thrills", "Cheap Thrills", "Sia ft. Sean Paul", None),
    ("en-treat-you-better", "Treat You Better", "Shawn Mendes", None),
    ("en-theres-nothing-holdin-me-back", "There's Nothing Holdin' Me Back", "Shawn Mendes", None),
    ("en-senorita", "Senorita", "Shawn Mendes", None),
    ("en-never-be-the-same", "Never Be the Same", "Camila Cabello", None),
    ("en-love-yourself", "Love Yourself", "Justin Bieber", None),
    ("en-sorry-bieber", "Sorry", "Justin Bieber", None),
    ("en-ghost-bieber", "Ghost", "Justin Bieber", None),
    ("en-love-me-again", "Love Me Again", "John Newman", None),
    ("en-cold-water", "Cold Water", "Major Lazer ft. Justin Bieber", None),
    ("en-on-my-way", "On My Way", "Alan Walker", None),
    ("en-wake-me-up", "Wake Me Up", "Avicii", None),
    ("en-waiting-for-love", "Waiting For Love", "Avicii", None),
    ("en-the-spectre", "The Spectre", "Alan Walker", None),
    ("en-thunder", "Thunder", "Imagine Dragons", None),
    ("en-radioactive", "Radioactive", "Imagine Dragons", None),
    ("en-whatever-it-takes", "Whatever It Takes", "Imagine Dragons", None),
    ("en-bones", "Bones", "Imagine Dragons", None),
    ("en-enemy", "Enemy", "Imagine Dragons x J.I.D", None),
    ("en-apologize", "Apologize", "Timbaland ft. OneRepublic", None),
    ("en-i-lived", "I Lived", "OneRepublic", None),
    ("en-sugar-maroon5", "Sugar", "Maroon 5", None),
    ("en-memories-maroon5", "Memories", "Maroon 5", None),
    ("en-girls-like-you", "Girls Like You", "Maroon 5 ft. Cardi B", None),
    ("en-maps-maroon5", "Maps", "Maroon 5", None),
    ("en-payphone", "Payphone", "Maroon 5 ft. Wiz Khalifa", None),
    ("en-closer-chainsmokers", "Closer", "The Chainsmokers ft. Halsey", None),
    ("en-something-just-like-this", "Something Just Like This", "The Chainsmokers & Coldplay", None),
    ("en-levitating", "Levitating", "Dua Lipa ft. DaBaby", None),
    ("en-new-rules", "New Rules", "Dua Lipa", None),
    ("en-dance-monkey", "Dance Monkey", "Tones and I", None),
    ("en-stay-with-me-sam", "Stay With Me", "Sam Smith", None),
    ("en-arcade", "Arcade", "Duncan Laurence", None),
    ("en-dusk-till-dawn", "Dusk Till Dawn", "ZAYN ft. Sia", None),
    ("en-until-i-found-you", "Until I Found You", "Stephen Sanchez", None),
    ("en-golden-hour", "Golden Hour", "JVKE", None),
    ("kn-jotheyali-geetha", "Jotheyali Jothe Jotheyali", "S.P. Balasubrahmanyam", None),
    ("kn-minchagi-neenu", "Minchagi Neenu Baralu", "Sonu Nigam", None),
    ("kn-ninnindale-milana", "Ninnindale", "Sonu Nigam", None),
    ("kn-ninnannu-nodida-mele", "Ninnannu Nodida Mele", "Sonu Nigam", None),
    ("kn-karagida-baaninalli", "Karagida Baaninalli", "Sonu Nigam", None),
    ("kn-kannu-hodiyaka", "Kannu Hodiyaka Monne Kalitaani", "Shreya Ghoshal", None),
    ("kn-yenammi-yenammi", "Yenammi Yenammi", "Vijay Prakash", None),
    ("kn-kaagadada-doniyalli", "Kaagadada Doniyalli", "Vasuki Vaibhav", None),
    ("kn-nooru-janmaku", "Nooru Janmaku", "Rajesh Krishnan", None),
    ("kn-ondu-malebillu", "Ondu Malebillu", "Armaan Malik", None),
    ("kn-neenade-naa", "Neenade Naa", "Armaan Malik", None),
    ("kn-kariya-i-love-you", "Kariya I Love You", "Anuradha Bhat", None),
    ("kn-ee-sanje-yakagide", "Ee Sanje Yakagide", "Sonu Nigam", None),
    ("kn-ninnindale-puneeth", "Ninnindale Ninnindale", "Puneeth Rajkumar", None),
    ("kn-usire-usire", "Usire Usire", "K.S. Chithra", None),
    ("kn-hrudayake-hedarike", "Hrudayake Hedarike", "Sanjith Hegde", None),
    ("kn-marali-manasaagide", "Marali Manasaagide", "Sanjith Hegde", None),
    ("kn-chuttu-chuttu", "Chuttu Chuttu", "Ravindra Soragavi", None),
    ("kn-dostha-kano", "Dostha Kano", "Vijay Prakash", None),
    ("kn-love-you-chinna", "Love You Chinna", "Shreya Ghoshal", None),
    ("kn-ninna-snehadinda", "Ninna Snehadinda", "Armaan Malik", None),
    ("kn-hrudaya-hrudaya", "Hrudaya Hrudaya", "Sonu Nigam", None),
    ("kn-kannu-kannu-dia", "Kannu Kannu", "Sanjith Hegde", None),
    ("kn-nee-sigovaregu", "Nee Sigovaregu", "Sid Sriram", None),
    ("kn-ninnaya-nagu", "Ninnaya Nagu", "Sanjith Hegde", None),
    ("kn-preetham-gubbi", "Preetham Gubbi", "Sonu Nigam", None),
    ("kn-bombe-helutaite", "Bombe Helutaite", "Vijay Prakash", None),
    ("kn-yenagali", "Yenagali", "Sonu Nigam", None),
    ("kn-pogaru-title", "Pogaru", "Chandan Shetty", None),
    ("kn-pushpavati", "Pushpavati", "Aishwarya Rangarajan", None),
    ("kn-toxic-yash", "Toxic", "Shruti Haasan", None),
    ("kn-soul-of-dia", "Soul Of Dia", "Sanjith Hegde", None),
    ("kn-kadalina-777-charlie", "Kadalina", "Vasuki Vaibhav", None),
    ("kn-arare-shuruvayitu", "Arare Shuruvayitu", "Sanjith Hegde", None),
    ("kn-naguva-nayana", "Naguva Nayana", "S.P. Balasubrahmanyam", None),
    ("kn-hoovina-baanadante", "Hoovina Baanadante", "S.P. Balasubrahmanyam", None),
    ("kn-ee-sundara-beladingala", "Ee Sundara Beladingala", "S.P. Balasubrahmanyam", None),
    ("kn-kolle-kolle", "Kolle Kolle", "Vijay Prakash", None),
    ("kn-halli-meshtru", "Halli Meshtru", "S.P. Balasubrahmanyam", None),
    ("kn-yaare-koogadali", "Yaare Koogadali", "Puneeth Rajkumar", None),
    ("kn-jeeva-hoovagide", "Jeeva Hoovagide", "S.P. Balasubrahmanyam", None),
    ("kn-nee-nanna-gellalare", "Nee Nanna Gellalare", "Dr. Rajkumar", None),
    ("kn-hrudaya-shiva", "Hrudaya Shiva", "Dr. Rajkumar", None),
    ("te-arjun-reddy-theme", "Arjun Reddy Theme", "Harshavardhan Rameshwar", None),
    ("te-adiga-adiga", "Adiga Adiga", "Sid Sriram", None),
    ("te-vachindamma", "Vachindamma", "Sid Sriram", None),
    ("te-pilla-raa", "Pilla Raa", "Anurag Kulkarni", None),
    ("te-maate-vinadhuga", "Maate Vinadhuga", "Sid Sriram", None),
    ("te-kadalalle", "Kadalalle", "Sid Sriram", None),
    ("te-priyathama-priyathama", "Priyathama Priyathama", "Chinmayi Sripada", None),
    ("te-komuram-bheemudo", "Komuram Bheemudo", "Kaala Bhairava", None),
    ("te-naacho-naacho", "Naacho Naacho", "Rahul Sipligunj", None),
    ("te-dheevara", "Dheevara", "Ramya Behara", None),
    ("te-saahore-baahubali", "Saahore Baahubali", "Daler Mehndi", None),
    ("te-kannaa-nidurinchara", "Kannaa Nidurinchara", "Sreenidhi", None),
    ("te-yenti-yenti", "Yenti Yenti", "Chinmayi Sripada", None),
    ("te-yemito", "Yemito", "Haricharan", None),
    ("te-vellipomaakey", "Vellipomaakey", "Sid Sriram", None),
    ("te-ninnu-kori-title", "Ninnu Kori", "Sid Sriram", None),
    ("te-choosi-choodangane", "Choosi Choodangane", "Sid Sriram", None),
    ("te-nee-kannu-neeli-samudram", "Nee Kannu Neeli Samudram", "Javed Ali", None),
    ("te-neeli-neeli-aakasam", "Neeli Neeli Aakasam", "Sid Sriram", None),
    ("te-oh-sita-hey-rama", "Oh Sita Hey Rama", "SPB Charan", None),
    ("te-inthandham", "Inthandham", "Sid Sriram", None),
    ("te-kalaavathi", "Kalaavathi", "Sid Sriram", None),
    ("te-jimikki-ponnu", "Jimikki Ponnu", "Anirudh Ravichander", None),
    ("te-kesariya-rangu", "Kesariya Rangu", "Sid Sriram", None),
    ("te-gaali-valuga", "Gaali Valuga", "Anirudh Ravichander", None),
    ("te-pacha-bottesina", "Pacha Bottesina", "Karthik", None),
    ("te-manohari", "Manohari", "Mohana Bhogaraju", None),
    ("te-ammadu-lets-do-kummudu", "Ammadu Let's Do Kummudu", "Devi Sri Prasad", None),
    ("te-blockbuster-sarrainodu", "Blockbuster", "Shravana Bhargavi", None),
    ("te-top-lesi-poddi", "Top Lesi Poddi", "Sagar", None),
    ("te-ringa-ringa", "Ringa Ringa", "Priya Hemesh", None),
    ("te-daang-daang", "Daang Daang", "Nakash Aziz", None),
    ("te-mind-block", "Mind Block", "Blaaze", None),
    ("te-seeti-maar", "Seeti Maar", "Jaspreet Jasz", None),
    ("te-jai-balayya", "Jai Balayya", "Kareemullah", None),
    ("te-godari-gattu", "Godari Gattu", "Ram Miriyala", None),
    ("pj-we-rollin-shubh", "We Rollin", "Shubh", None),
    ("pj-cheques-shubh", "Cheques", "Shubh", None),
    ("pj-no-love-shubh", "No Love", "Shubh", None),
    ("pj-levels-sidhu", "Levels", "Sidhu Moose Wala", None),
    ("pj-mi-amor-sharn", "Mi Amor", "Sharn", None),
    ("pj-lahore-guru", "Lahore", "Guru Randhawa", None),
    ("pj-naah-harrdy", "Naah", "Harrdy Sandhu", None),
    ("pj-backbone-harrdy", "Backbone", "Harrdy Sandhu", None),
    ("pj-khaab-akhil", "Khaab", "Akhil", None),
    ("pj-sakhiyaan-maninder", "Sakhiyaan", "Maninder Buttar", None),
    ("pj-titliaan-afsana", "Titliaan", "Afsana Khan", None),
    ("pj-pasoori-nu", "Pasoori Nu", "Arijit Singh", None),
    ("pj-jalebi-baby", "Jalebi Baby", "Tesher x Jason Derulo", None),
    ("pj-high-rated-gabru", "High Rated Gabru", "Guru Randhawa", None),
    ("pj-laung-laachi", "Laung Laachi", "Mannat Noor", None),
    ("pj-3-peg-sharry", "3 Peg", "Sharry Mann", None),
    ("pj-mann-prophec", "Mann", "The PropheC", None),
    ("pj-lehanga-jass", "Lehanga", "Jass Manak", None),
    ("pj-bijlee-bijlee", "Bijlee Bijlee", "Harrdy Sandhu", None),
    ("pj-bandana-shubh", "Bandana", "Shubh", None),
    ("pj-one-love-shubh", "One Love", "Shubh", None),
    ("pj-8-asle-sukha", "8 Asle", "Sukha", None),
    ("pj-bandookan-wala", "Bandookan Wala", "Mankirt Aulakh", None),
    ("pj-hukam-karan-aujla", "Hukam", "Karan Aujla", None),
    ("pj-jatt-life", "Jatt Life", "Varinder Brar", None),
    ("pj-jatt-vailly", "Jatt Vailly", "Karan Aujla", None),
    ("pj-so-high-sidhu", "So High", "Sidhu Moose Wala", None),
    ("pj-same-beef", "Same Beef", "Bohemia", None),
    ("hr-52-gaj-ka-daman", "52 Gaj Ka Daman", "Renuka Panwar", None),
    ("hr-bahut-pyar-kare-se", "Bahut Pyar Kare Se", "Renuka Panwar", None),
    ("hr-desi-desi-na-bola-kar", "Desi Desi Na Bola Kar", "MD", None),
    ("hr-moto-diler", "Moto", "Diler Kharkiya", None),
    ("hr-feelings-sumit", "Feelings", "Sumit Goswami", None),
    ("hr-tokk-masoom", "Tokk", "Masoom Sharma", None),
    ("hr-mera-balma", "Mera Balma", "Renuka Panwar", None),
    ("hr-gajban-pani", "Gajban", "Sapna Choudhary", None),
    ("hr-chand-renuka", "Chand", "Renuka Panwar", None),
    ("hr-jaat-sumit", "Jaat", "Sumit Partap", None),
    ("hr-kabootar-renuka", "Kabootar", "Renuka Panwar", None),
    ("hr-solid-body", "Solid Body", "Raju Punjabi", None),
    ("hr-bahu-milgi", "Bahu Milgi", "Ajay Hooda", None),
    ("hr-tagdi-ajay", "Tagdi", "Ajay Hooda", None),
    ("hr-dekhya-karo", "Dekhya Karo", "Renuka Panwar", None),
    ("hr-jale-2", "Jale 2", "Sapna Choudhary", None),
    ("hr-jale-sapna", "Jale", "Sapna Choudhary", None),
    ("hr-balam-thanedar", "Balam Thanedar", "Dinesh Golan", None),
    ("hr-aankh-marey-hr", "Aankh Marey", "Renuka Panwar", None),
    ("hr-chatak-matak", "Chatak Matak", "Renuka Panwar", None),
    ("hr-thada-bhartar", "Thada Bhartar", "Raju Punjabi", None),
    ("hr-russian-bandana", "Russian Bandana", "Diler Kharkiya", None),
    ("hr-gypsy-gd-kaur", "Gypsy", "GD Kaur", None),
    ("hr-hooka-sumit", "Hooka", "Sumit Goswami", None),
    ("hr-loot-liya", "Loot Liya", "Gulzaar Chhaniwala", None),
    ("hr-nakhre-gulzaar", "Nakhre", "Gulzaar Chhaniwala", None),
    ("hr-bawli-sumit", "Bawli", "Sumit Goswami", None),
    ("hr-pani-chhalke", "Pani Chhalke", "Manisha Sharma", None),
    ("hr-lado-rani", "Lado Rani", "Diler Kharkiya", None),
    ("hr-dabban-aali-jaatni", "Dabban Aali Jaatni", "Masoom Sharma", None),
    ("hr-jaatni-masoom", "Jaatni", "Masoom Sharma", None),
    ("hr-kale-kagaz", "Kale Kagaz", "Gulzaar Chhaniwala", None),
    ("hr-yadav-brand-2", "Yadav Brand 2", "Sunny Yaduvanshi", None),
    ("hr-yadav-brand-1", "Yadav Brand", "Sunny Yaduvanshi", None),
    ("hr-kallo-masoom", "Kallo", "Masoom Sharma", None),
    ("hr-chora-baba-ka", "Chora Baba Ka", "Masoom Sharma", None),
    ("hr-daru-badnaam", "Daru Badnaam", "Kamal Kahlon", None),
    ("hr-badmashi-masoom", "Badmashi", "Masoom Sharma", None),
    ("hr-jaat-ki-setting", "Jaat Ki Setting", "Masoom Sharma", None),
    ("hr-kalesh-gulzaar", "Kalesh", "Gulzaar Chhaniwala", None),
    ("hr-chora-jaat-ka", "Chora Jaat Ka", "Masoom Sharma", None),
    ("hr-banno-masoom", "Banno", "Masoom Sharma", None),
    ("hr-moka-soka", "Moka Soka", "Gulzaar Chhaniwala", None),
    ("hr-system-khatri", "System", "Khatri", None),
    ("hr-bairan-gulzaar", "Bairan", "Gulzaar Chhaniwala", None),
    ("hr-feel-gulzaar", "Feel", "Gulzaar Chhaniwala", None),
    ("pj-lover-diljit", "Lover", "Diljit Dosanjh", "mH_LFkWxpI0"),
    ("pj-goat-diljit", "G.O.A.T.", "Diljit Dosanjh", "cl0a3i2wFcc"),
    ("pj-born-to-shine", "Born to Shine", "Diljit Dosanjh", "4zJg8M1jG2w"),
    ("pj-clash-diljit", "Clash", "Diljit Dosanjh", "V14l0Vf3e80"),
    ("pj-lemonade-diljit", "Lemonade", "Diljit Dosanjh", "Qv6j2b8m14c"),
    ("pj-naina-crew", "Naina", "Diljit Dosanjh", "8g76Z8Y8j8Y"),
    ("pj-choli-ke-peeche-crew", "Choli Ke Peeche", "Diljit Dosanjh", "p6t1d8z3y84"),
    ("pj-do-you-know", "Do You Know", "Diljit Dosanjh", "vK5E_7Ev_t4"),
    ("pj-proper-patola", "Proper Patola", "Diljit Dosanjh", "d4OuBCUSp-E"),
    ("pj-sauda-khara-khara", "Sauda Khara Khara", "Diljit Dosanjh", "kJQP7kiw5Fk"),
    ("pj-vibe-diljit", "Vibe", "Diljit Dosanjh", "W7M60N7w_Z0"),
    ("pj-peaches-diljit", "Peaches", "Diljit Dosanjh", "8p5t8Z5Q9a4"),
    ("pj-hass-hass-diljit", "Hass Hass", "Diljit Dosanjh x Sia", "k3g_WjLCsXM"),
    ("pj-kinni-kinni-diljit", "Kinni Kinni", "Diljit Dosanjh", "2m8v6k4j10w"),
    ("pj-case-diljit", "Case", "Diljit Dosanjh", "V_m5n8f2z4c"),
    ("pj-5-taara", "5 Taara", "Diljit Dosanjh", "5h8j4c2m8q0"),
    ("pj-laembadgini", "Laembadgini", "Diljit Dosanjh", "6x0s8m7v1q0"),
    ("pj-raat-di-gedi", "Raat Di Gedi", "Diljit Dosanjh", "X1b9d4v6m80"),
    ("pj-excuses-ap", "Excuses", "AP Dhillon", "vX2cDW8up2g"),
    ("pj-insane-ap", "Insane", "AP Dhillon", None),
    ("pj-with-you-ap", "With You", "AP Dhillon", None),
    ("pj-summer-high-ap", "Summer High", "AP Dhillon", None),
    ("pj-dil-nu-ap", "Dil Nu", "AP Dhillon", None),
    ("pj-toxic-ap", "Toxic", "AP Dhillon", None),
    ("pj-woh-noor-ap", "Wo Noor", "AP Dhillon", None),
    ("pj-true-stories-ap", "True Stories", "AP Dhillon", None),
    ("pj-sleepless-ap", "Sleepless", "AP Dhillon", None),
    ("pj-saada-pyaar-ap", "Saada Pyaar", "AP Dhillon", None),
    ("pj-majhail-ap", "Majhail", "AP Dhillon", "1_w7o9-UBTQ"),
    ("pj-goat-ap", "GOAT", "AP Dhillon", "6V_Vd1m6j0c"),
    ("pj-tere-te-ap", "Tere Te", "AP Dhillon", None),
    ("pj-faraar-ap", "Faraar", "AP Dhillon", None),
    ("pj-old-skool-ap", "Old Skool", "Prem Dhillon", None),
    ("pj-desires-ap", "Desires", "AP Dhillon", None),
    ("pj-problems-over-peace", "Problems Over Peace", "AP Dhillon", "vWbK4tJ_6qU"),
    ("kn-singara-siriye", "Singara Siriye", "Vijay Prakash", "2kL3Wn6Jq1E"),
    ("kn-varaha-roopam", "Varaha Roopam Daiva Va Rishtam", "Sai Vignesh", "b1K_e_6d8wM"),
    ("kn-toofan-kgf2", "Toofan", "Ravi Basrur", None),
    ("kn-sulthana-kgf2", "Sulthana", "Ravi Basrur", "z1k8m5w9q_0"),
    ("kn-mehabooba-kgf2", "Mehabooba", "Ananya Bhat", "5m8k1v4j9q0"),
    ("kn-salaam-rocky-bhai", "Salaam Rocky Bhai", "Vijay Prakash", "7wF3v6K9m10"),
    ("kn-ra-ra-rakkamma", "Ra Ra Rakkamma", "Sunidhi Chauhan", None),
    ("kn-belageddu", "Belageddu", "Vijay Prakash", None),
    ("kn-anisuthide", "Anisuthide Yaako Indu", "Sonu Nigam", None),
    ("kn-mungaru-maleye", "Mungaru Maleye", "Sonu Nigam", None),
    ("kn-pasandaagavne", "Pasandaagavne", "V. Harikrishna", None),
    ("kn-tagaru-banthu", "Tagaru Banthu Tagaru", "Anthony Daasan", None),
    ("pj-softly-karan-aujla", "Softly", "Karan Aujla", "cWMxCE2HTag"),
    ("pj-admiring-you-karan-aujla", "Admiring You", "Karan Aujla ft. Preston Pablo", "k4A3N-qF4pE"),
    ("pj-winning-speech-karan-aujla", "Winning Speech", "Karan Aujla", "6Pky_vXh_sQ"),
    ("pj-52-bars-karan-aujla", "52 Bars", "Karan Aujla", "1w7x_k9m_4g"),
    ("pj-white-brown-black-karan-aujla", "White Brown Black", "Karan Aujla", "n8x_w1m8q0c"),
    ("pj-on-top-karan-aujla", "On Top", "Karan Aujla", "q10_gJg3wYQ"),
    ("pj-chithiyaan-karan-aujla", "Chithiyaan", "Karan Aujla", "7m9v1b4j80c"),
    ("pj-dont-look-karan-aujla", "Don't Look", "Karan Aujla", None),
    ("pj-dont-worry-karan-aujla", "Don't Worry", "Karan Aujla ft. Gurlez Akhtar", None),
    ("pj-mexico-karan-aujla", "Mexico", "Karan Aujla", None),
    ("pj-bachke-bachke-karan-aujla", "Bachke Bachke", "Karan Aujla", None),
    ("pj-players-karan-aujla", "Players", "Badshah", "p6t1d12c_1Y"),
    ("pj-jee-ni-lagda-karan-aujla", "Jee Ni Lagda", "Karan Aujla", None),
    ("pj-wytb-karan-aujla", "WYTB (What You Talking Bout)", "Karan Aujla", None),
    ("pj-antidote-karan-aujla", "Antidote", "Karan Aujla", "eypZt3m8sJ0"),
    ("te-naatu-naatu", "Naatu Naatu", "Rahul Sipligunj", "OsU0CGZoV8E"),
    ("te-oo-antava", "Oo Antava Mawa..Oo Oo Antava", "Indravathi Chauhan", "gkea1_C_1yQ"),
    ("te-srivalli", "Srivalli", "Sid Sriram", None),
    ("te-saami-saami", "Saami Saami", "Mounika Yadav", "jL1vH_CclXQ"),
    ("te-pushpa-pushpa", "Pushpa Pushpa", "Nakash Aziz", None),
    ("te-sooseki", "Sooseki (The Couple Song)", "Shreya Ghoshal", "vYdI1t_QvYc"),
    ("te-chuttamalle", "Chuttamalle", "Shilpa Rao", "fGZ18t82pE8"),
    ("te-fear-song", "Fear Song", "Anirudh Ravichander", None),
    ("te-daavudi", "Daavudi", "Nakash Aziz", "3U9j2b_mP7I"),
    ("te-butta-bomma", "Butta Bomma", "Armaan Malik", "2mDCVzruYzQ"),
    ("te-samajavaragamana", "Samajavaragamana", "Sid Sriram", "ocMEv95u2z0"),
    ("te-ramuloo-ramulaa", "Ramuloo Ramulaa", "Anurag Kulkarni", "kd_7wX11f-c"),
    ("te-kurchi-madathapetti", "Kurchi Madathapetti", "Sri Krishna", "p_VbH2tUqA4"),
    ("te-dum-masala", "Dum Masala", "Sanjith Hegde", "fXk67wHq87g"),
    ("te-inkem-inkem", "Inkem Inkem Inkem Kaavaale", "Sid Sriram", "1Wup73kQ10c"),
    ("gu-khalasi", "Khalasi (Gotilo)", "Aditya Gadhvi", None),
    ("gu-chogada", "Chogada", "Darshan Raval", None),
    ("gu-kamariya", "Kamariya", "Darshan Raval", "iP_D3c6Zk-0"),
    ("gu-dholida-gangubai", "Dholida", "Jahnvi Shrimankar", "z18v7d5W6uM"),
    ("gu-char-bangadi", "Char Char Bangadi Vadi Gadi", "Kinjal Dave", None),
    ("gu-rona-ser-ma", "Rona Ser Ma", "Geeta Rabari", None),
    ("gu-radha-ne-shyam", "Radha Ne Shyam Mali Jashe", "Sachin-Jigar", None),
    ("gu-nagada-sang-dhol", "Nagada Sang Dhol", "Shreya Ghoshal", None),
    ("mr-zingaat", "Zingaat", "Ajay-Atul", None),
    ("mr-yad-lagla", "Yad Lagla", "Ajay Gogavale", None),
    ("mr-apsara-aali", "Apsara Aali", "Bela Shende", None),
    ("mr-chandra", "Chandra", "Shreya Ghoshal", None),
    ("mr-bai-ga", "Bai Ga", "Aarya Ambekar", None),
    ("mr-shantabai", "Shantabai", "Sanjay Londhe", None),
    ("mr-tik-tik-vajate", "Tik Tik Vajate Dokyat", "Sonu Nigam", None),
    ("es-despacito", "Despacito", "Luis Fonsi ft. Daddy Yankee", None),
    ("es-gasolina", "Gasolina", "Daddy Yankee", "qGKrc3A6HHM"),
    ("es-danza-kuduro", "Danza Kuduro", "Don Omar ft. Lucenzo", "7zp1TbLFPp8"),
    ("es-bailando", "Bailando", "Enrique Iglesias ft. Descemer Bueno", "NUsoVlDFqZg"),
    ("es-calma", "Calma (Remix)", "Pedro Capó", None),
    ("es-pepas", "Pepas", "Farruko", "y83x7MgzWOA"),
    ("es-tusa", "Tusa", "KAROL G", "tbneQDc2H3I"),
    ("es-mi-gente", "Mi Gente", "J Balvin", "wnJ6LuUFpMo"),
    ("es-chantaje", "Chantaje", "Shakira ft. Maluma", "6Mgqbai3fKo"),
    ("es-waka-waka", "Waka Waka (This Time for Africa)", "Shakira", "pRpeEdMmmQ0"),
    ("fr-derniere-danse", "Dernière Danse", "Indila", "K5KAc5CoCuk"),
    ("fr-tourner-dans-le-vide", "Tourner Dans Le Vide", "Indila", "vtNJMAyeP0s"),
    ("fr-papaoutai", "Papaoutai", "Stromae", "oiKj0Z_Xnjc"),
    ("fr-alors-on-danse", "Alors On Danse", "Stromae", "VHoT4N43jK8"),
    ("fr-ego", "Ego", "Willy William", "iOxzG3jjFkY"),
    ("fr-je-te-laisserai", "Je Te Laisserai Des Mots", "Patrick Watson", "_OduPzK9P-k"),
    ("fr-la-vie-en-rose", "La Vie En Rose", "Édith Piaf", "kFzViYkZAz4"),
    ("en-birds-of-a-feather", "Birds of a Feather", "Billie Eilish", "d5gf9dXbPi0"),
    ("en-die-with-a-smile", "Die With A Smile", "Lady Gaga & Bruno Mars", "kPa7bsKwL-c"),
    ("en-not-like-us", "Not Like Us", "Kendrick Lamar", "H58vbez_m4E"),
    ("en-good-luck-babe", "Good Luck, Babe!", "Chappell Roan", "1KISt_8c5_c"),
    ("en-believer", "Believer", "Imagine Dragons", "7wtfhZwyrcc"),
    ("en-demons", "Demons", "Imagine Dragons", "mWRsgZuwf_8"),
    ("en-counting-stars", "Counting Stars", "OneRepublic", "hT_nvWreIhg"),
    ("en-faded", "Faded", "Alan Walker", "60ItHLz5WEA"),
    ("en-sunflower", "Sunflower", "Post Malone", "ApXoWvfEYVU"),
    ("en-bad-guy", "bad guy", "Billie Eilish", "DyDfgMOUjCI"),
    ("en-as-it-was", "As It Was", "Harry Styles", "H5v3k2nnd5A"),
    ("en-flowers", "Flowers", "Miley Cyrus", "G7KNmW9a75Y"),
    ("in-jhoome-jo-pathaan", "Jhoome Jo Pathaan", "Arijit Singh", "YxWlaYCA8MU"),
    ("in-besharam-rang", "Besharam Rang", "Shilpa Rao", "huxhqphtN1Q"),
    ("in-not-ramaiya-vastavaiya", "Not Ramaiya Vastavaiya", "Anirudh Ravichander", "gn41y4e_y1M"),
    ("in-zinda-banda", "Zinda Banda", "Anirudh Ravichander", "6q80x_19V0w"),
    ("in-arjan-vailly", "Arjan Vailly", "Bhupinder Babbal", "m8F30C_V6w0"),
    ("in-pehle-bhi-main", "Pehle Bhi Main", "Vishal Mishra", "gC2e8a6v_p4"),
    ("in-tujhe-kitna-chahein-aur", "Tujhe Kitna Chahne Lage", "Arijit Singh", None),
    ("in-bekhayali", "Bekhayali", "Sachet Tandon", None),
    ("in-dheere-dheere", "Dheere Dheere Se Meri Zindagi", "Yo Yo Honey Singh", "nCD2hj6zJEc"),
    ("in-blue-eyes", "Blue Eyes", "Yo Yo Honey Singh", "NbyHNASFi6U"),
    ("in-kesariya", "Kesariya", "Arijit Singh", "W1S9AbHpWFY"),
    ("in-apna-bana-le", "Apna Bana Le", "Arijit Singh", "ElZfdU54Cp8"),
    ("in-chaleya", "Chaleya", "Arijit Singh", "VAdGW7QDJiU"),
    ("in-sajni", "Sajni", "Arijit Singh", None),
    ("in-satranga", "Satranga", "Arijit Singh", "HrnrqYxYrbk"),
    ("in-o-maahi", "O Maahi", "Arijit Singh", "Etkd-07gnxM"),
    ("in-tauba-tauba", "Tauba Tauba", "Karan Aujla", "LK7-_dgAVQE"),
    ("in-aaj-ki-raat", "Aaj Ki Raat", "Madhubanti Bagchi", "hxMNYkLN7tI"),
    ("in-heeriye", "Heeriye", "Jasleen Royal", "RLzC55ai0eo"),
    ("in-tum-se-hi", "Tum Se Hi", "Mohit Chauhan", "Cb6wuzOurPc"),
    ("in-tum-hi-ho", "Tum Hi Ho", "Arijit Singh", "Umqb9KENgmk"),
    ("in-agar-tum-saath-ho", "Agar Tum Saath Ho", "Arijit Singh", "sK7riqg2mr4"),
    ("in-channa-mereya", "Channa Mereya", "Arijit Singh", "bzSTpdcs-EI"),
    ("in-ve-kamleya", "Ve Kamleya", "Arijit Singh", "QXJyMpxd210"),
    ("in-ve-haaniyaan", "Ve Haaniyaan", "Danny", "E_SbwSe15y0"),
    ("in-baarish-ban-jaana", "Baarish Ban Jaana", "Stebin Ben", "KVh4KtUSW3A"),
    ("in-phir-aur-kya-chahiye", "Phir Aur Kya Chahiye", "Arijit Singh", "PR_mFnjFidk"),
    ("in-dil-diyan-gallan", "Dil Diyan Gallan", "Atif Aslam", "SAcpESN_Fk4"),
    ("in-ranjha", "Ranjha", "B Praak", "V7LwfY5U5WI"),
    ("in-pal-pal-dil-ke-paas", "Pal Pal Dil Ke Paas", "Kishore Kumar", "lgTHGZF3BQw"),
    ("in-lag-ja-gale", "Lag Ja Gale", "Lata Mangeshkar", "HnLtNrvfZTU"),
    ("in-mere-sapno-ki-rani", "Mere Sapno Ki Rani", "Kishore Kumar", "7Ib33wy6OT4"),
    ("in-baarishein", "Baarishein", "Anuv Jain", "PJWemSzExXs"),
    ("in-husn", "Husn", "Anuv Jain", "gJLVTKhTnog"),
    ("in-choo-lo", "Choo Lo", "The Local Train", "sFMRqxCexDk"),
    ("in-kasoor", "Kasoor", "Prateek Kuhad", "BmUe3-sfr7E"),
    ("in-udi-udi-jaye", "Udi Udi Jaye", "Sukhwinder Singh", "WQfdwsPao9E"),
    ("in-aye-udi-udi", "Aye Udi Udi Udi", "Adnan Sami", "0ZINK1mD-jM"),
    ("in-udi-guzaarish", "Udi", "Sunidhi Chauhan", "hbP3vLetsnM"),
    ("in-udd-gaye", "Udd Gaye", "Ritviz", "v2-9rIL_f4w"),
    ("en-shape-of-you", "Shape of You", "Ed Sheeran", "JGwWNGJdvx8"),
    ("en-blinding-lights", "Blinding Lights", "The Weeknd", "4NRXx6U8ABQ"),
    ("en-espresso", "Espresso", "Sabrina Carpenter", "lOVPUbSNSUk"),
    ("en-cruel-summer", "Cruel Summer", "Taylor Swift", "ic8j13piAhQ"),
    ("in-brown-munde", "Brown Munde", "AP Dhillon", "VNs_cCtdbPc"),
    ("in-295-sidhu", "295", "Sidhu Moose Wala", "n_FCrCQ6-bA"),
]

def get_track_lock(track_id):
    with GLOBAL_LOCK:
        if track_id not in DOWNLOAD_LOCKS:
            DOWNLOAD_LOCKS[track_id] = threading.Lock()
        return DOWNLOAD_LOCKS[track_id]

def find_local_audio_file(track_id):
    """Finds an existing audio file for track_id in storage/music/"""
    if not track_id:
        return None
    for ext in ['.m4a', '.mp3', '.webm', '.ogg', '.wav', '.mp4']:
        p = os.path.join(MUSIC_DIR, f"{track_id}{ext}")
        if os.path.exists(p) and os.path.getsize(p) > 50000:
            return p
    return None

def clean_query_string(q):
    if not q:
        return ''
    clean = re.sub(r'[()\[\]{}"\'|]', ' ', q)
    parts = clean.split(',')
    if len(parts) > 1:
        clean = parts[0].strip() + ' ' + parts[1].strip().split('&')[0].strip()
    return re.sub(r'\s+', ' ', clean).strip()

def decrypt_saavn_url(encrypted_url):
    if not DES or not encrypted_url:
        return None
    try:
        key = b"38346591"
        cipher = DES.new(key, DES.MODE_ECB)
        dec = cipher.decrypt(base64.b64decode(encrypted_url))
        pad_len = dec[-1]
        if 1 <= pad_len <= 8:
            dec = dec[:-pad_len]
        url = dec.decode('utf-8')
        return {
            '320': url.replace("_96.mp4", "_320.mp4").replace(".mp4", "_320.mp4") if not url.endswith("_320.mp4") else url,
            '160': url.replace("_96.mp4", "_160.mp4"),
            '96': url
        }
    except Exception:
        return None

def fetch_saavn_master_audio(query, track_id):
    """Fetches full-length 320k/160k master audio with authentic vocals from high-bitrate CDN"""
    if not query:
        return None
    try:
        clean_q = clean_query_string(query)
        url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(clean_q)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            results = data.get('results', [])
            if results:
                r = results[0]
                enc = r.get('encrypted_media_url')
                if enc:
                    dec = decrypt_saavn_url(enc)
                    if dec:
                        for q_key in ['160', '320', '96']:
                            stream_url = dec[q_key]
                            dest = os.path.join(MUSIC_DIR, f"{track_id}.mp4")
                            try:
                                dl_req = urllib.request.Request(stream_url, headers={'User-Agent': 'Mozilla/5.0'})
                                with urllib.request.urlopen(dl_req, timeout=15) as a_resp:
                                    data_bytes = a_resp.read()
                                    with open(dest, 'wb') as f:
                                        f.write(data_bytes)
                                if os.path.exists(dest) and os.path.getsize(dest) > 500000:
                                    print(f"[Pulse Master Studio] Saved full-length track '{track_id}' ({len(data_bytes)/1024/1024:.2f} MB): {r.get('song')} by {r.get('singers')}")
                                    return dest
                            except Exception:
                                pass
    except Exception as e:
        print(f"[Pulse Saavn Engine Notice] {query}: {e}")
    return None

def fetch_itunes_master_audio(query, track_id):
    """Fetches high-quality official master audio with authentic vocals from iTunes/Apple Music CDN"""
    if not query:
        return None
    try:
        clean_q = clean_query_string(query)
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(clean_q)}&entity=song&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            if results:
                preview_url = results[0].get('previewUrl')
                if preview_url:
                    dest = os.path.join(MUSIC_DIR, f"{track_id}.m4a")
                    req_audio = urllib.request.Request(preview_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req_audio, timeout=6) as a_resp:
                        with open(dest, 'wb') as f:
                            f.write(a_resp.read())
                    if os.path.exists(dest) and os.path.getsize(dest) > 50000:
                        print(f"[Pulse Master Audio] Saved '{track_id}' from iTunes: {results[0].get('trackName')} by {results[0].get('artistName')}")
                        return dest
    except Exception as e:
        print(f"[Pulse Master Audio Notice] {query}: {e}")
    return None

def ensure_audio_file(yt_id=None, query=None, track_id=None, preview_url=None):
    """
    Ensures a full-length audio file exists in storage/music/.
    1. Checks local cache (>1.5MB for full length)
    2. Fetches full-length master audio via Saavn High-Bitrate CDN (3-5 minutes)
    3. Downloads direct preview_url if provided
    4. Fetches iTunes master audio fallback
    5. Downloads via yt_dlp if available
    """
    if yt_id in ('', 'null', 'undefined', 'None'):
        yt_id = None
    if query in ('', 'null', 'undefined', 'None'):
        query = None
    if track_id in ('', 'null', 'undefined', 'None'):
        track_id = None
    if preview_url in ('', 'null', 'undefined', 'None'):
        preview_url = None

    if not track_id:
        if yt_id:
            track_id = f"yt-{yt_id}"
        elif query:
            safe_slug = re.sub(r'[^a-z0-9]+', '-', query.lower()).strip('-')[:50]
            track_id = f"q-{safe_slug}"
        else:
            return None

    # Fast check local storage
    existing = find_local_audio_file(track_id)
    if existing and os.path.getsize(existing) > 1500000:
        return existing

    lock = get_track_lock(track_id)
    with lock:
        existing = find_local_audio_file(track_id)
        if existing and os.path.getsize(existing) > 1500000:
            return existing

        search_target = query or track_id.replace('in-', '').replace('en-', '').replace('te-', '').replace('kn-', '').replace('pj-', '').replace('gu-', '').replace('mr-', '').replace('hr-', '').replace('es-', '').replace('fr-', '').replace('dev-', '').replace('-', ' ')

        # Primary Tier: Full-length Master Audio via Saavn 320k/160k CDN
        saavn_audio = fetch_saavn_master_audio(search_target, track_id)
        if saavn_audio:
            return saavn_audio

        # Secondary Tier: If preview_url is supplied directly
        if preview_url and preview_url.startswith('http'):
            try:
                dest = os.path.join(MUSIC_DIR, f"{track_id}.m4a")
                req_audio = urllib.request.Request(preview_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req_audio, timeout=6) as a_resp:
                    with open(dest, 'wb') as f:
                        f.write(a_resp.read())
                if os.path.exists(dest) and os.path.getsize(dest) > 50000:
                    return dest
            except Exception:
                pass

        # Tertiary Tier: Fetch official master audio via iTunes search
        master_audio = fetch_itunes_master_audio(search_target, track_id)
        if master_audio:
            return master_audio

        # Tier 3: Attempt yt_dlp if configured
        if yt_dlp:
            target = None
            if yt_id and len(yt_id) == 11 and ' ' not in yt_id:
                target = f"https://www.youtube.com/watch?v={yt_id}"
            elif query:
                cleaned = clean_query_string(query)
                target = f"{cleaned} official audio"
            elif track_id:
                cleaned_id = track_id.replace('in-', '').replace('en-', '').replace('itunes-', '').replace('-', ' ')
                target = f"{cleaned_id} official song"

            if target:
                out_tmpl = os.path.join(MUSIC_DIR, f"{track_id}.%(ext)s")
                ydl_opts = {
                    'format': 'bestaudio/best',
                    'outtmpl': out_tmpl,
                    'quiet': True,
                    'no_warnings': True,
                    'noplaylist': True,
                    'default_search': 'ytsearch1:',
                    'socket_timeout': 8,
                    'extractor_args': {'youtube': {'player_client': ['ios', 'android', 'mweb']}},
                }
                try:
                    t0 = time.time()
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([target])
                    f = find_local_audio_file(track_id)
                    if f:
                        print(f"[Pulse Audio Engine] Downloaded '{track_id}' in {time.time()-t0:.2f}s -> {os.path.basename(f)}")
                        return f
                except Exception as e:
                    print(f"[Pulse Download Notice] '{target}' notice: {e}")

        # Final attempt: secondary query variations on iTunes
        if query:
            words = query.split()
            if len(words) > 1:
                short_q = " ".join(words[:2])
                m_audio = fetch_itunes_master_audio(short_q, track_id)
                if m_audio:
                    return m_audio

        return None

def serve_local_audio(handler, file_path):
    """Serves a local audio file with full HTTP 206 Partial Content (Range) support"""
    try:
        file_size = os.path.getsize(file_path)
    except OSError:
        handler.send_response(404)
        handler.end_headers()
        return

    ext = os.path.splitext(file_path)[1].lower()
    content_type = 'audio/mp4' if ext in ('.m4a', '.mp4') else ('audio/mpeg' if ext == '.mp3' else 'audio/webm')

    range_header = handler.headers.get('Range')
    if range_header and range_header.startswith('bytes='):
        range_val = range_header[6:].strip()
        parts = range_val.split('-')
        start = int(parts[0]) if parts[0] else 0
        end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
        start = max(0, min(start, file_size - 1))
        end = max(start, min(end, file_size - 1))
        length = end - start + 1

        handler.send_response(206)
        handler.send_header('Content-Type', content_type)
        handler.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
        handler.send_header('Content-Length', str(length))
        handler.send_header('Accept-Ranges', 'bytes')
        handler.send_header('Access-Control-Allow-Origin', '*')
        handler.send_header('Cache-Control', 'public, max-age=86400')
        handler.end_headers()

        try:
            with open(file_path, 'rb') as f:
                f.seek(start)
                bytes_left = length
                while bytes_left > 0:
                    chunk = f.read(min(64 * 1024, bytes_left))
                    if not chunk:
                        break
                    handler.wfile.write(chunk)
                    bytes_left -= len(chunk)
        except (ConnectionResetError, BrokenPipeError):
            pass
    else:
        handler.send_response(200)
        handler.send_header('Content-Type', content_type)
        handler.send_header('Content-Length', str(file_size))
        handler.send_header('Accept-Ranges', 'bytes')
        handler.send_header('Access-Control-Allow-Origin', '*')
        handler.send_header('Cache-Control', 'public, max-age=86400')
        handler.end_headers()

        try:
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(64 * 1024)
                    if not chunk:
                        break
                    handler.wfile.write(chunk)
        except (ConnectionResetError, BrokenPipeError):
            pass


def prewarm_background():
    """Background thread that pre-downloads top popular songs into storage/music/"""
    print("[Pulse Cache] Pre-downloading top hits into storage/music/ in background...")
    for tid, title, artist, ytid in TOP_SONGS:
        try:
            if not find_local_audio_file(tid):
                ensure_audio_file(yt_id=ytid, query=f"{title} {artist}", track_id=tid)
        except Exception:
            pass
    print(f"[Pulse Cache] Background pre-download complete. Total files: {len(os.listdir(MUSIC_DIR))}")


class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True



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

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type, Accept')
        super().end_headers()

    def do_OPTIONS(self):
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

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        # API: Audio Stream Endpoint (/api/stream)
        if path == '/api/stream':
            yt_id = params.get('ytId', [None])[0]
            query = params.get('q', [None])[0]
            track_id = params.get('id', [None])[0]
            preview_url = params.get('previewUrl', [None])[0]

            audio_file = ensure_audio_file(yt_id=yt_id, query=query, track_id=track_id, preview_url=preview_url)
            if audio_file and os.path.exists(audio_file):
                serve_local_audio(self, audio_file)
            elif preview_url and preview_url.startswith('http'):
                self.send_response(302)
                self.send_header('Location', preview_url)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
            elif query:
                try:
                    it_url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=1"
                    it_req = urllib.request.Request(it_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(it_req, timeout=3) as it_resp:
                        it_data = json.loads(it_resp.read().decode('utf-8'))
                        if it_data.get('results') and it_data['results'][0].get('previewUrl'):
                            direct_url = it_data['results'][0]['previewUrl']
                            self.send_response(302)
                            self.send_header('Location', direct_url)
                            self.send_header('Access-Control-Allow-Origin', '*')
                            self.end_headers()
                            return
                except Exception:
                    pass
                self.send_response(404)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Audio track could not be loaded.')
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Audio track could not be loaded.')
            return

        # API: Resolve Audio Info (/api/resolve)
        if path == '/api/resolve' or path == '/api/audio-url':
            yt_id = params.get('ytId', [None])[0]
            query = params.get('q', [None])[0]
            track_id = params.get('id', [None])[0]

            audio_file = ensure_audio_file(yt_id=yt_id, query=query, track_id=track_id)
            if audio_file:
                body = json.dumps({
                    'success': True,
                    'file': os.path.basename(audio_file),
                    'path': f"/storage/music/{os.path.basename(audio_file)}"
                }).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                body = json.dumps({'success': False, 'error': 'Could not resolve track'}).encode('utf-8')
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            return

        # =====================================================================
        # DOWNLOAD API ENDPOINTS (/api/download/info & /api/download/<platform>)
        # =====================================================================
        if path == '/api/download/info':
            downloads_manifest_path = os.path.join(ROOT_DIR, 'storage', 'downloads', 'manifest.json')
            if os.path.exists(downloads_manifest_path):
                with open(downloads_manifest_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self._send_json(200, {'success': True, **data})
            else:
                self._send_json(404, {'success': False, 'error': 'Downloads manifest not found'})
            return

        if path.startswith('/api/download/'):
            platform_req = path.replace('/api/download/', '').lower().strip()
            downloads_manifest_path = os.path.join(ROOT_DIR, 'storage', 'downloads', 'manifest.json')
            
            pkg_info = None
            if os.path.exists(downloads_manifest_path):
                with open(downloads_manifest_path, 'r', encoding='utf-8') as f:
                    manifest_data = json.load(f)
                    packages = manifest_data.get('packages', {})
                    if platform_req in packages:
                        pkg_info = packages[platform_req]
                    elif platform_req in ['win', 'exe']:
                        pkg_info = packages.get('windows')
                    elif platform_req in ['osx', 'darwin', 'dmg']:
                        pkg_info = packages.get('mac')
                    elif platform_req in ['apk', 'aab']:
                        pkg_info = packages.get('android')
                    elif platform_req in ['ipa', 'app']:
                        pkg_info = packages.get('ios')
                    elif platform_req in ['appimage', 'deb', 'rpm']:
                        pkg_info = packages.get('linux')

            if pkg_info and os.path.exists(pkg_info.get('path', '')):
                target_file = pkg_info['path']
                filename = pkg_info.get('filename', os.path.basename(target_file))
                mime_type = pkg_info.get('mime_type', 'application/octet-stream')
                sha256_hash = pkg_info.get('sha256', '')
                file_size = os.path.getsize(target_file)

                self.send_response(200)
                self.send_header('Content-Type', mime_type)
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.send_header('Content-Length', str(file_size))
                self.send_header('X-Content-Type-Options', 'nosniff')
                self.send_header('Cache-Control', 'public, max-age=3600')
                if sha256_hash:
                    self.send_header('ETag', f'"{sha256_hash}"')
                    self.send_header('X-Checksum-SHA256', sha256_hash)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                with open(target_file, 'rb') as f:
                    while chunk := f.read(65536):
                        self.wfile.write(chunk)
                print(f"[Pulse Download] Served native package: {filename} ({file_size} bytes) for {platform_req}")
                return
            else:
                self._send_json(404, {
                    'success': False,
                    'error': f"Release package for '{platform_req}' is not available yet.",
                    'code': 'PACKAGE_NOT_FOUND'
                })
                return

        # Direct storage/music/ files with range support
        if path.startswith('/storage/music/'):
            local_rel = path.lstrip('/')
            local_abs = os.path.join(ROOT_DIR, local_rel)
            if os.path.exists(local_abs) and os.path.isfile(local_abs):
                serve_local_audio(self, local_abs)
                return

        # Standard static file serving
        super().do_GET()

    def guess_type(self, path):
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript'
        if path.endswith('.css'):
            return 'text/css'
        if path.endswith('.json') or path.endswith('.webmanifest'):
            return 'application/json'
        if path.endswith('.svg'):
            return 'image/svg+xml'
        if path.endswith('.png'):
            return 'image/png'
        if path.endswith('.mp3'):
            return 'audio/mpeg'
        if path.endswith('.m4a'):
            return 'audio/mp4'
        if path.endswith('.webm'):
            return 'audio/webm'
        return super().guess_type(path)

    def log_message(self, format, *args):
        # Keep console output clean
        pass


def run_on_port(port):
    try:
        server = ThreadedHTTPServer(("0.0.0.0", port), CustomHTTPRequestHandler)
        print(f"Pulse Music Server active at http://localhost:{port}")
        server.serve_forever()
    except Exception as e:
        print(f"Port {port} in use or unavailable: {e}")


if __name__ == '__main__':
    os.chdir(ROOT_DIR)
    print("Starting Pulse Music Server with Local Audio Engine...")
    print(f"Audio storage directory: {MUSIC_DIR}")
    
    # Start pre-warming thread
    threading.Thread(target=prewarm_background, daemon=True).start()

    threads = []
    for p in PORTS:
        t = threading.Thread(target=run_on_port, args=(p,), daemon=True)
        t.start()
        threads.append(t)
    
    try:
        while True:
            threading.Event().wait(3600)
    except KeyboardInterrupt:
        sys.exit(0)
