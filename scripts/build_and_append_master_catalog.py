import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')
SERVER_PATH = os.path.join(ROOT, 'server.py')
INDEX_PATH = os.path.join(ROOT, 'index.html')

# Master Dictionary with detailed metadata for each missing track
SONG_METADATA_MAP = {
    # --- HINDI INDIE & BOLLYWOOD ---
    "Shayad": ("Arijit Singh, Pritam", "Love Aaj Kal", "romantic", "in-shayad"),
    "Raabta": ("Arijit Singh, Pritam", "Agent Vinod", "romantic", "in-raabta"),
    "Jeene Laga Hoon": ("Atif Aslam, Shreya Ghoshal", "Ramaiya Vastavaiya", "romantic", "in-jeene-laga-hoon"),
    "Kabira": ("Tochi Raina, Rekha Bhardwaj, Pritam", "Yeh Jawaani Hai Deewani", "romantic", "in-kabira"),
    "Ilahi": ("Arijit Singh, Pritam", "Yeh Jawaani Hai Deewani", "trending", "in-ilahi"),
    "Arijit Singh Mashup": ("Arijit Singh", "Mashup Collection", "trending", "in-arijit-singh-mashup"),
    "What Jhumka": ("Arijit Singh, Jonita Gandhi, Pritam", "Rocky Aur Rani Kii Prem Kahaani", "party", "in-what-jhumka"),
    "Ami Je Tomar": ("Arijit Singh, Shreya Ghoshal, Pritam", "Bhool Bhulaiyaa 3", "trending", "in-ami-je-tomar"),
    "Aankhon Se Batana": ("Dikshant", "Aankhon Se Batana", "romantic", "in-aankhon-se-batana"),
    "Maan Meri Jaan": ("King", "Champagne Talk", "trending", "in-maan-meri-jaan"),
    "Maan Meri Jaan Afterlife": ("King, Nick Jonas", "Maan Meri Jaan (Afterlife)", "trending", "in-maan-meri-jaan-afterlife"),
    "Ishq": ("Faheem Abdullah, Rauhan Malik", "Ishq", "romantic", "in-ishq-faheem"),
    "Jo Tum Mere Ho": ("Anuv Jain", "Jo Tum Mere Ho", "romantic", "in-jo-tum-mere-ho"),
    "Kho Gaye Hum Kahan": ("Jasleen Royal, Prateek Kuhad", "Baar Baar Dekho", "lofi", "in-kho-gaye-hum-kahan"),
    "Tu Hai Kahan": ("AUR, Raffey, Usama, Ahad", "Tu Hai Kahan", "romantic", "in-tu-hai-kahan"),
    "Gul": ("Anuv Jain", "Gul", "lofi", "in-gul-anuv"),
    "Alag Aasmaan": ("Anuv Jain", "Alag Aasmaan", "lofi", "in-alag-aasmaan"),
    "Kahani Suno 2.0": ("Kaifi Khalil", "Kahani Suno 2.0", "romantic", "in-kahani-suno"),
    "O Bedardeya": ("Arijit Singh, Pritam", "Tu Jhoothi Main Makkaar", "romantic", "in-o-bedardeya"),
    "Tere Pyaar Mein": ("Arijit Singh, Nikhita Gandhi, Pritam", "Tu Jhoothi Main Makkaar", "party", "in-tere-pyaar-mein"),
    "Soni Soni": ("Darshan Raval, Jonita Gandhi, Rochak Kohli", "Ishq Vishk Rebound", "trending", "in-soni-soni"),
    "Soulmate": ("Badshah, Arijit Singh", "Ek Tha Raja", "trending", "in-soulmate-badshah"),
    "Akhiyaan Gulaab": ("Mitraz", "Teri Baaton Mein Aisa Uljha Jiya", "romantic", "in-akhiyaan-gulaab"),
    "Afreen Afreen": ("Rahat Fateh Ali Khan, Momina Mustehsan", "Coke Studio Season 9", "romantic", "in-afreen-afreen"),
    "Mast Magan": ("Arijit Singh, Chinmayi Sripada", "2 States", "romantic", "in-mast-magan"),
    "Lae Dooba": ("Sunidhi Chauhan, Rochak Kohli", "Aiyaary", "romantic", "in-lae-dooba"),
    "Bolna": ("Arijit Singh, Asees Kaur, Tanishk Bagchi", "Kapoor & Sons", "romantic", "in-bolna"),
    "Kaun Tujhe": ("Palak Muchhal, Amaal Mallik", "M.S. Dhoni", "romantic", "in-kaun-tujhe"),
    "Hasi": ("Ami Mishra, Shreya Ghoshal", "Hamari Adhuri Kahani", "romantic", "in-hasi-ban-gaye"),
    "Samjhawan": ("Arijit Singh, Shreya Ghoshal", "Humpty Sharma Ki Dulhania", "romantic", "in-samjhawan"),
    "Main Rang Sharbaton Ka": ("Atif Aslam, Chinmayi Sripada, Pritam", "Phata Poster Nikhla Hero", "romantic", "in-main-rang-sharbaton-ka"),
    "Muskurane": ("Arijit Singh, Jeet Gannguli", "Citylights", "romantic", "in-muskurane"),
    "Humdard": ("Arijit Singh, Mithoon", "Ek Villain", "romantic", "in-humdard"),
    "Hamari Adhuri Kahani": ("Arijit Singh, Jeet Gannguli", "Hamari Adhuri Kahani", "romantic", "in-hamari-adhuri-kahani"),
    "Phir Mohabbat": ("Mohd Irfan, Arijit Singh, Saim Bhat", "Murder 2", "romantic", "in-phir-mohabbat"),
    "Tera Yaar Hoon Main": ("Arijit Singh, Rochak Kohli", "Sonu Ke Titu Ki Sweety", "romantic", "in-tera-yaar-hoon-main"),
    "Main Agar Kahoon": ("Sonu Nigam, Shreya Ghoshal, Vishal-Shekhar", "Om Shanti Om", "romantic", "in-main-agar-kahoon"),
    "Ajab Si": ("KK, Vishal-Shekhar", "Om Shanti Om", "romantic", "in-ajab-si"),
    "Aao Milo Chalo": ("Shaan, Ustad Sultan Khan, Pritam", "Jab We Met", "romantic", "in-aao-milo-chalo"),
    "Zara Sa": ("KK, Pritam", "Jannat", "romantic", "in-zara-sa"),
    "Tu Hi Hai": ("Arijit Singh, Amit Trivedi", "Dear Zindagi", "lofi", "in-tu-hi-hai"),
    "Ishq Wala Love": ("Shekhar Ravjiani, Salim Merchant, Neeti Mohan", "Student of the Year", "romantic", "in-ishq-wala-love"),
    "Manjha": ("Vishal Mishra", "Manjha", "romantic", "in-manjha-vishal"),
    "Mere Sohneya": ("Sachet Tandon, Parampara Tandon", "Kabir Singh", "romantic", "in-mere-sohneya"),
    "Tere Sang Yaara": ("Atif Aslam, Arko", "Rustom", "romantic", "in-tere-sang-yaara"),
    "Tera Fitoor": ("Arijit Singh, Himesh Reshammiya", "Genius", "romantic", "in-tera-fitoor"),
    "Dekh Lena": ("Arijit Singh, Tulsi Kumar", "Tum Bin 2", "romantic", "in-dekh-lena"),
    "Lo Safar": ("Jubin Nautiyal, Mithoon", "Baaghi 2", "romantic", "in-lo-safar"),
    "Kaise Hua": ("Vishal Mishra", "Kabir Singh", "romantic", "in-kaise-hua"),
    "Khairiyat": ("Arijit Singh, Pritam", "Chhichhore", "romantic", "in-khairiyat"),
    "Thodi Jagah": ("Arijit Singh, Tanishk Bagchi", "Marjaavaan", "romantic", "in-thodi-jagah"),
    "Dil Ko Karaar Aaya": ("Yasser Desai, Neha Kakkar, Rajat Nagpal", "Sukoon", "romantic", "in-dil-ko-karaar-aaya"),
    "Bachpan Kahan": ("Arijit Singh", "Bachpan Kahan", "lofi", "in-bachpan-kahan"),
    "Mere Liye Tum Kaafi Ho": ("Ayushmann Khurrana", "Shubh Mangal Zyada Saavdhan", "romantic", "in-mere-liye-tum-kaafi-ho"),
    "dheema dheema": ("Harshavardhan Rameshwar, Arijit Singh", "Animal / Dheema Dheema", "romantic", "in-dheema-dheema"),
    "udi udi": ("Sukhwinder Singh, Bhoomi Trivedi", "Raees", "party", "in-udi-udi-full"),
    "zulfein": ("Aditya Rikhari", "Zulfein", "romantic", "in-zulfein-aditya"),
    "Dhurandhar": ("Hanumankind, Kalmi", "Dhurandhar", "trending", "in-dhurandhar"),
    "Srivalli Hindi": ("Javed Ali, Devi Sri Prasad", "Pushpa: The Rise (Hindi)", "romantic", "in-srivalli-hindi"),
    "Srivalli Telugu": ("Sid Sriram, Devi Sri Prasad", "Pushpa: The Rise (Telugu)", "romantic", "te-srivalli-telugu"),
    "Srivalli Tamil": ("Sid Sriram, Devi Sri Prasad", "Pushpa: The Rise (Tamil)", "romantic", "ta-srivalli-tamil"),
    "Srivalli Kannada": ("Sid Sriram, Devi Sri Prasad", "Pushpa: The Rise (Kannada)", "romantic", "kn-srivalli-kannada"),
    "Srivalli Malayalam": ("Sid Sriram, Devi Sri Prasad", "Pushpa: The Rise (Malayalam)", "romantic", "ml-srivalli-malayalam"),

    # --- ENGLISH GLOBAL & POP ---
    "Save Your Tears": ("The Weeknd", "After Hours", "trending", "en-save-your-tears"),
    "Thinking Out Loud": ("Ed Sheeran", "x", "romantic", "en-thinking-out-loud"),
    "Photograph": ("Ed Sheeran", "x", "romantic", "en-photograph"),
    "Let Her Go": ("Passenger", "All the Little Lights", "lofi", "en-let-her-go"),
    "Someone You Loved": ("Lewis Capaldi", "Divinely Uninspired", "romantic", "en-someone-you-loved"),
    "Before You Go": ("Lewis Capaldi", "Divinely Uninspired", "romantic", "en-before-you-go"),
    "Happier": ("Marshmello ft. Bastille", "Happier", "party", "en-happier-marshmello"),
    "Adore You": ("Harry Styles", "Fine Line", "trending", "en-adore-you"),
    "Sign of the Times": ("Harry Styles", "Harry Styles", "trending", "en-sign-of-the-times"),
    "Golden": ("Harry Styles", "Fine Line", "trending", "en-golden-harry"),
    "Night Changes": ("One Direction", "FOUR", "romantic", "en-night-changes"),
    "What Makes You Beautiful": ("One Direction", "Up All Night", "party", "en-what-makes-you-beautiful"),
    "Story of My Life": ("One Direction", "Midnight Memories", "trending", "en-story-of-my-life"),
    "Perfect Night": ("LE SSERAFIM", "Perfect Night", "trending", "en-perfect-night"),
    "Style": ("Taylor Swift", "1989 (Taylor's Version)", "trending", "en-style-taylor"),
    "Anti-Hero": ("Taylor Swift", "Midnights", "trending", "en-anti-hero"),
    "Cardigan": ("Taylor Swift", "folklore", "lofi", "en-cardigan"),
    "August": ("Taylor Swift", "folklore", "lofi", "en-august"),
    "Enchanted": ("Taylor Swift", "Speak Now (Taylor's Version)", "romantic", "en-enchanted"),
    "Delicate": ("Taylor Swift", "reputation", "romantic", "en-delicate"),
    "You Belong With Me": ("Taylor Swift", "Fearless (Taylor's Version)", "romantic", "en-you-belong-with-me"),
    "Shake It Off": ("Taylor Swift", "1989 (Taylor's Version)", "party", "en-shake-it-off"),
    "Wildest Dreams": ("Taylor Swift", "1989 (Taylor's Version)", "romantic", "en-wildest-dreams"),
    "All Too Well": ("Taylor Swift", "Red (Taylor's Version)", "romantic", "en-all-too-well"),
    "Wrecking Ball": ("Miley Cyrus", "Bangerz", "trending", "en-wrecking-ball"),
    "The Climb": ("Miley Cyrus", "Hannah Montana", "lofi", "en-the-climb"),
    "See You Again": ("Wiz Khalifa ft. Charlie Puth", "Furious 7", "trending", "en-see-you-again"),
    "Attention": ("Charlie Puth", "Voicenotes", "party", "en-attention-charlie"),
    "We Don't Talk Anymore": ("Charlie Puth ft. Selena Gomez", "Nine Track Mind", "romantic", "en-we-dont-talk-anymore"),
    "How Long": ("Charlie Puth", "Voicenotes", "party", "en-how-long"),
    "One Call Away": ("Charlie Puth", "Nine Track Mind", "romantic", "en-one-call-away"),
    "Cheap Thrills": ("Sia ft. Sean Paul", "This Is Acting", "party", "en-cheap-thrills"),
    "Treat You Better": ("Shawn Mendes", "Illuminate", "romantic", "en-treat-you-better"),
    "There's Nothing Holdin' Me Back": ("Shawn Mendes", "Illuminate", "party", "en-theres-nothing-holdin-me-back"),
    "Senorita": ("Shawn Mendes, Camila Cabello", "Shawn Mendes", "romantic", "en-senorita"),
    "Never Be the Same": ("Camila Cabello", "Camila", "romantic", "en-never-be-the-same"),
    "Love Yourself": ("Justin Bieber", "Purpose", "lofi", "en-love-yourself"),
    "Sorry": ("Justin Bieber", "Purpose", "party", "en-sorry-bieber"),
    "Ghost": ("Justin Bieber", "Justice", "trending", "en-ghost-bieber"),
    "Love Me Again": ("John Newman", "Tribute", "party", "en-love-me-again"),
    "Cold Water": ("Major Lazer ft. Justin Bieber, MØ", "Cold Water", "party", "en-cold-water"),
    "On My Way": ("Alan Walker, Sabrina Carpenter, Farruko", "On My Way", "trending", "en-on-my-way"),
    "The Nights": ("Avicii", "The Days / The Nights", "party", "en-the-nights-avicii"),
    "Wake Me Up": ("Avicii", "True", "party", "en-wake-me-up"),
    "Waiting For Love": ("Avicii", "Stories", "party", "en-waiting-for-love"),
    "The Spectre": ("Alan Walker", "The Spectre", "party", "en-the-spectre"),
    "Thunder": ("Imagine Dragons", "Evolve", "party", "en-thunder"),
    "Radioactive": ("Imagine Dragons", "Night Visions", "party", "en-radioactive"),
    "Whatever It Takes": ("Imagine Dragons", "Evolve", "party", "en-whatever-it-takes"),
    "Bones": ("Imagine Dragons", "Mercury – Acts 1 & 2", "trending", "en-bones"),
    "Enemy": ("Imagine Dragons x J.I.D", "Arcane", "trending", "en-enemy"),
    "Apologize": ("Timbaland ft. OneRepublic", "Shock Value", "romantic", "en-apologize"),
    "I Lived": ("OneRepublic", "Native", "trending", "en-i-lived"),
    "Rude": ("MAGIC!", "Don't Kill the Magic", "party", "en-rude-magic"),
    "Sugar": ("Maroon 5", "V", "party", "en-sugar-maroon5"),
    "Memories": ("Maroon 5", "JORDI", "lofi", "en-memories-maroon5"),
    "Girls Like You": ("Maroon 5 ft. Cardi B", "Red Pill Blues", "trending", "en-girls-like-you"),
    "Maps": ("Maroon 5", "V", "party", "en-maps-maroon5"),
    "Payphone": ("Maroon 5 ft. Wiz Khalifa", "Overexposed", "trending", "en-payphone"),
    "Closer": ("The Chainsmokers ft. Halsey", "Collage", "party", "en-closer-chainsmokers"),
    "Something Just Like This": ("The Chainsmokers & Coldplay", "Memories...Do Not Open", "trending", "en-something-just-like-this"),
    "Levitating": ("Dua Lipa ft. DaBaby", "Future Nostalgia", "party", "en-levitating"),
    "New Rules": ("Dua Lipa", "Dua Lipa", "party", "en-new-rules"),
    "Dance Monkey": ("Tones and I", "The Kids Are Coming", "party", "en-dance-monkey"),
    "Stay With Me": ("Sam Smith", "In the Lonely Hour", "romantic", "en-stay-with-me-sam"),
    "Unstoppable": ("Sia", "This Is Acting", "trending", "en-unstoppable-sia"),
    "Arcade": ("Duncan Laurence", "Small Town Boy", "romantic", "en-arcade"),
    "Dusk Till Dawn": ("ZAYN ft. Sia", "Icarus Falls", "romantic", "en-dusk-till-dawn"),
    "Until I Found You": ("Stephen Sanchez", "Easy on My Eyes", "romantic", "en-until-i-found-you"),
    "Golden Hour": ("JVKE", "this is what ____ feels like", "lofi", "en-golden-hour"),

    # --- KANNADA TOP GEMS ---
    "Jotheyali Jothe Jotheyali": ("S.P. Balasubrahmanyam, S. Janaki", "Geetha", "romantic", "kn-jotheyali-geetha"),
    "Minchagi Neenu Baralu": ("Sonu Nigam", "Gaalipata", "romantic", "kn-minchagi-neenu"),
    "Ninnindale": ("Sonu Nigam", "Milana", "romantic", "kn-ninnindale-milana"),
    "Ninnannu Nodida Mele": ("Sonu Nigam, Shreya Ghoshal", "Yuvarathnaa", "romantic", "kn-ninnannu-nodida-mele"),
    "Karagida Baaninalli": ("Sonu Nigam", "Simple Agi Ondh Love Story", "romantic", "kn-karagida-baaninalli"),
    "Kannu Hodiyaka Monne Kalitaani": ("Shreya Ghoshal", "Roberrt", "party", "kn-kannu-hodiyaka"),
    "Yenammi Yenammi": ("Vijay Prakash, Palak Muchhal", "Ayogya", "romantic", "kn-yenammi-yenammi"),
    "Kaagadada Doniyalli": ("Vasuki Vaibhav", "Kirik Party", "lofi", "kn-kaagadada-doniyalli"),
    "Nooru Janmaku": ("Rajesh Krishnan", "America America", "romantic", "kn-nooru-janmaku"),
    "Ondu Malebillu": ("Armaan Malik, Shreya Ghoshal", "Chakravarthy", "romantic", "kn-ondu-malebillu"),
    "Neenade Naa": ("Armaan Malik", "Murali Meets Meera", "romantic", "kn-neenade-naa"),
    "Kariya I Love You": ("Anuradha Bhat", "Kariya", "romantic", "kn-kariya-i-love-you"),
    "Ee Sanje Yakagide": ("Sonu Nigam", "Geetha", "romantic", "kn-ee-sanje-yakagide"),
    "Ninnindale Ninnindale": ("Puneeth Rajkumar", "Ninnindale", "trending", "kn-ninnindale-puneeth"),
    "Usire Usire": ("K.S. Chithra, Rajesh Krishnan", "Huccha", "romantic", "kn-usire-usire"),
    "Hrudayake Hedarike": ("Sanjith Hegde, Sangeetha Ravindranath", "Taj Mahal", "romantic", "kn-hrudayake-hedarike"),
    "Marali Manasaagide": ("Sanjith Hegde", "Gentleman", "romantic", "kn-marali-manasaagide"),
    "Chuttu Chuttu": ("Ravindra Soragavi, Shamitha Malnad", "Raambo 2", "party", "kn-chuttu-chuttu"),
    "Dostha Kano": ("Vijay Prakash, Chandan Shetty", "Roberrt", "party", "kn-dostha-kano"),
    "Love You Chinna": ("Shreya Ghoshal", "Love Mocktail 2", "romantic", "kn-love-you-chinna"),
    "Ninna Snehadinda": ("Armaan Malik", "Mugulu Nage", "romantic", "kn-ninna-snehadinda"),
    "Hrudaya Hrudaya": ("Sonu Nigam", "Hrudaya Hrudaya", "romantic", "kn-hrudaya-hrudaya"),
    "Kannu Kannu": ("Sanjith Hegde", "Dia", "lofi", "kn-kannu-kannu-dia"),
    "Nee Sigovaregu": ("Sid Sriram", "Rider", "romantic", "kn-nee-sigovaregu"),
    "Ninnaya Nagu": ("Sanjith Hegde", "Ninnaya Nagu", "romantic", "kn-ninnaya-nagu"),
    "Preetham Gubbi": ("Sonu Nigam", "Maleyali Jotheyali", "romantic", "kn-preetham-gubbi"),
    "Bombe Helutaite": ("Vijay Prakash", "Raajakumara", "trending", "kn-bombe-helutaite"),
    "Yenagali": ("Sonu Nigam, Shreya Ghoshal", "Mussanje Maathu", "romantic", "kn-yenagali"),
    "Pogaru": ("Chandan Shetty, Vijay Prakash", "Pogaru", "party", "kn-pogaru-title"),
    "Pushpavati": ("Aishwarya Rangarajan, V. Harikrishna", "Kranti", "party", "kn-pushpavati"),
    "Toxic": ("Shruti Haasan, Jeremy Stack", "Toxic", "trending", "kn-toxic-yash"),
    "Soul Of Dia": ("Sanjith Hegde, Chinmayi Sripada", "Dia", "lofi", "kn-soul-of-dia"),
    "Kadalina": ("Vasuki Vaibhav", "777 Charlie", "lofi", "kn-kadalina-777-charlie"),
    "Arare Shuruvayitu": ("Sanjith Hegde", "Sapta Sagaradaache Ello", "romantic", "kn-arare-shuruvayitu"),
    "Naguva Nayana": ("S.P. Balasubrahmanyam, S. Janaki", "Pallavi Anupallavi", "romantic", "kn-naguva-nayana"),
    "Hoovina Baanadante": ("S.P. Balasubrahmanyam", "Premaloka", "romantic", "kn-hoovina-baanadante"),
    "Ee Sundara Beladingala": ("S.P. Balasubrahmanyam, K.S. Chithra", "Amrutha Varshini", "romantic", "kn-ee-sundara-beladingala"),
    "Kolle Kolle": ("Vijay Prakash", "Tagaru", "party", "kn-kolle-kolle"),
    "Halli Meshtru": ("S.P. Balasubrahmanyam", "Halli Meshtru", "party", "kn-halli-meshtru"),
    "Yaare Koogadali": ("Puneeth Rajkumar", "Yaare Koogadali", "party", "kn-yaare-koogadali"),
    "Jeeva Hoovagide": ("S.P. Balasubrahmanyam", "Nee Nanna Gellalare", "romantic", "kn-jeeva-hoovagide"),
    "Nee Nanna Gellalare": ("Dr. Rajkumar", "Nee Nanna Gellalare", "trending", "kn-nee-nanna-gellalare"),
    "Hrudaya Shiva": ("Dr. Rajkumar", "Shiva Sainya", "trending", "kn-hrudaya-shiva"),

    # --- TELUGU TOP BLOCKBUSTERS ---
    "Arjun Reddy Theme": ("Harshavardhan Rameshwar", "Arjun Reddy", "trending", "te-arjun-reddy-theme"),
    "Adiga Adiga": ("Sid Sriram, Gopi Sundar", "Ninnu Kori", "romantic", "te-adiga-adiga"),
    "Vachindamma": ("Sid Sriram, Gopi Sundar", "Geetha Govindam", "romantic", "te-vachindamma"),
    "Pilla Raa": ("Anurag Kulkarni, Chaitan Bharadwaj", "RX 100", "romantic", "te-pilla-raa"),
    "Maate Vinadhuga": ("Sid Sriram, Jakes Bejoy", "Taxiwaala", "romantic", "te-maate-vinadhuga"),
    "Kadalalle": ("Sid Sriram, Aishwarya Ravichandran, Justin Prabhakaran", "Dear Comrade", "romantic", "te-kadalalle"),
    "Priyathama Priyathama": ("Chinmayi Sripada, Gopi Sundar", "Majili", "romantic", "te-priyathama-priyathama"),
    "Komuram Bheemudo": ("Kaala Bhairava, M.M. Keeravani", "RRR", "trending", "te-komuram-bheemudo"),
    "Naacho Naacho": ("Rahul Sipligunj, Vishal Mishra, M.M. Keeravani", "RRR", "party", "te-naacho-naacho"),
    "Dheevara": ("Ramya Behara, Deepu, M.M. Keeravani", "Baahubali: The Beginning", "trending", "te-dheevara"),
    "Saahore Baahubali": ("Daler Mehndi, M.M. Keeravani", "Baahubali 2: The Conclusion", "trending", "te-saahore-baahubali"),
    "Kannaa Nidurinchara": ("Sreenidhi, V. Srisoumya, M.M. Keeravani", "Baahubali 2: The Conclusion", "romantic", "te-kannaa-nidurinchara"),
    "Yenti Yenti": ("Chinmayi Sripada, Gopi Sundar", "Geetha Govindam", "romantic", "te-yenti-yenti"),
    "Yemito": ("Haricharan, Shweta Mohan, Radhan", "Andala Rakshasi", "romantic", "te-yemito"),
    "Vellipomaakey": ("Sid Sriram, A.R. Rahman", "Sahasam Swasaga Sagipo", "romantic", "te-vellipomaakey"),
    "Ninnu Kori": ("Sid Sriram, Gopi Sundar", "Ninnu Kori", "romantic", "te-ninnu-kori-title"),
    "Choosi Choodangane": ("Sid Sriram, Gopi Sundar", "Chalo", "romantic", "te-choosi-choodangane"),
    "Nee Kannu Neeli Samudram": ("Javed Ali, Srikanth Chandra, Devi Sri Prasad", "Uppena", "romantic", "te-nee-kannu-neeli-samudram"),
    "Neeli Neeli Aakasam": ("Sid Sriram, Sunitha, Anup Rubens", "30 Rojullo Preminchadam Ela", "romantic", "te-neeli-neeli-aakasam"),
    "Oh Sita Hey Rama": ("SPB Charan, Ramya Behara, Vishal Chandrashekhar", "Sita Ramam", "romantic", "te-oh-sita-hey-rama"),
    "Inthandham": ("Sid Sriram, Vishal Chandrashekhar", "Sita Ramam", "romantic", "te-inthandham"),
    "Kalaavathi": ("Sid Sriram, Thaman S", "Sarkaru Vaari Paata", "romantic", "te-kalaavathi"),
    "Jimikki Ponnu": ("Anirudh Ravichander, Jonita Gandhi", "Varisu", "party", "te-jimikki-ponnu"),
    "Kesariya Rangu": ("Sid Sriram, Pritam", "Brahmastra (Telugu)", "romantic", "te-kesariya-rangu"),
    "Gaali Valuga": ("Anirudh Ravichander", "Agnyaathavaasi", "trending", "te-gaali-valuga"),
    "Pacha Bottesina": ("Karthik, Damini Bhatla, M.M. Keeravani", "Baahubali: The Beginning", "romantic", "te-pacha-bottesina"),
    "Manohari": ("Mohana Bhogaraju, L.V. Revanth, M.M. Keeravani", "Baahubali: The Beginning", "party", "te-manohari"),
    "Ammadu Let's Do Kummudu": ("Devi Sri Prasad, Ranina Reddy", "Khaidi No. 150", "party", "te-ammadu-lets-do-kummudu"),
    "Blockbuster": ("Shravana Bhargavi, Nakash Aziz, Thaman S", "Sarrainodu", "party", "te-blockbuster-sarrainodu"),
    "Top Lesi Poddi": ("Sagar, Geetha Madhuri, Devi Sri Prasad", "Iddarammayilatho", "party", "te-top-lesi-poddi"),
    "Ringa Ringa": ("Priya Hemesh, Devi Sri Prasad", "Arya 2", "party", "te-ringa-ringa"),
    "Daang Daang": ("Nakash Aziz, Lavita Lobo, Devi Sri Prasad", "Sarileru Neekevvaru", "party", "te-daang-daang"),
    "Mind Block": ("Blaaze, Ranina Reddy, Devi Sri Prasad", "Sarileru Neekevvaru", "party", "te-mind-block"),
    "Seeti Maar": ("Jaspreet Jasz, Rita, Devi Sri Prasad", "DJ: Duvvada Jagannadham", "party", "te-seeti-maar"),
    "Jai Balayya": ("Kareemullah, Thaman S", "Veera Simha Reddy", "party", "te-jai-balayya"),
    "Godari Gattu": ("Ram Miriyala", "Godari Gattu", "party", "te-godari-gattu"),

    # --- PUNJABI SUPERHITS ---
    "We Rollin": ("Shubh", "We Rollin", "party", "pj-we-rollin-shubh"),
    "Cheques": ("Shubh", "Still Rollin", "trending", "pj-cheques-shubh"),
    "No Love": ("Shubh", "No Love", "trending", "pj-no-love-shubh"),
    "Levels": ("Sidhu Moose Wala, Sunny Malton", "Levels", "party", "pj-levels-sidhu"),
    "Mi Amor": ("Sharn, 40k, The Paul", "Mi Amor", "romantic", "pj-mi-amor-sharn"),
    "Lahore": ("Guru Randhawa", "Lahore", "party", "pj-lahore-guru"),
    "Naah": ("Harrdy Sandhu, B Praak, Jaani", "Naah", "party", "pj-naah-harrdy"),
    "Backbone": ("Harrdy Sandhu, B Praak, Jaani", "Backbone", "romantic", "pj-backbone-harrdy"),
    "Khaab": ("Akhil, Bob", "Khaab", "romantic", "pj-khaab-akhil"),
    "Sakhiyaan": ("Maninder Buttar, MixSingh", "Sakhiyaan", "romantic", "pj-sakhiyaan-maninder"),
    "Titliaan": ("Afsana Khan, Harrdy Sandhu, Jaani, B Praak", "Titliaan", "romantic", "pj-titliaan-afsana"),
    "Pasoori Nu": ("Arijit Singh, Tulsi Kumar, Rochak Kohli", "Satyaprem Ki Katha", "romantic", "pj-pasoori-nu"),
    "Jalebi Baby": ("Tesher x Jason Derulo", "Jalebi Baby", "party", "pj-jalebi-baby"),
    "High Rated Gabru": ("Guru Randhawa", "High Rated Gabru", "party", "pj-high-rated-gabru"),
    "Laung Laachi": ("Mannat Noor, Gurmeet Singh", "Laung Laachi", "romantic", "pj-laung-laachi"),
    "3 Peg": ("Sharry Mann, Mista Baaz", "3 Peg", "party", "pj-3-peg-sharry"),
    "Mann": ("The PropheC", "Solace", "lofi", "pj-mann-prophec"),
    "Lehanga": ("Jass Manak, Sharry Nexus", "Lehanga", "party", "pj-lehanga-jass"),
    "Bijlee Bijlee": ("Harrdy Sandhu, B Praak, Jaani", "Bijlee Bijlee", "party", "pj-bijlee-bijlee"),
    "Bandana": ("Shubh", "Still Rollin", "trending", "pj-bandana-shubh"),
    "One Love": ("Shubh", "One Love", "romantic", "pj-one-love-shubh"),
    "8 Asle": ("Sukha, Gurlez Akhtar, Chani Nattan", "Undisputed", "party", "pj-8-asle-sukha"),
    "Bandookan Wala": ("Mankirt Aulakh", "Bandookan Wala", "party", "pj-bandookan-wala"),
    "Hukam": ("Karan Aujla", "Hukam", "party", "pj-hukam-karan-aujla"),
    "Jatt Life": ("Varinder Brar", "Jatt Life", "party", "pj-jatt-life"),
    "Jatt Vailly": ("Karan Aujla", "Jatt Vailly", "party", "pj-jatt-vailly"),
    "So High": ("Sidhu Moose Wala, BYG BYRD", "PBX 1", "party", "pj-so-high-sidhu"),
    "Same Beef": ("Bohemia, Sidhu Moose Wala, Byg Byrd", "Same Beef", "party", "pj-same-beef"),

    # --- HARYANVI TOP CHARTBUSTERS ---
    "52 Gaj Ka Daman": ("Renuka Panwar, Aman Jaji, Mukesh Jaji", "52 Gaj Ka Daman", "party", "hr-52-gaj-ka-daman"),
    "Bahut Pyar Kare Se": ("Renuka Panwar, Diler Kharkiya", "Bahut Pyar Kare Se", "romantic", "hr-bahut-pyar-kare-se"),
    "Desi Desi Na Bola Kar": ("MD, KD, Raju Punjabi", "Desi Desi Na Bola Kar", "party", "hr-desi-desi-na-bola-kar"),
    "Moto": ("Diler Kharkiya, Ajay Hooda", "Moto", "romantic", "hr-moto-diler"),
    "Feelings": ("Sumit Goswami, Khatri", "Feelings", "romantic", "hr-feelings-sumit"),
    "Tokk": ("Masoom Sharma, Manisha Sharma", "Tokk", "party", "hr-tokk-masoom"),
    "Mera Balma": ("Renuka Panwar, Diler Kharkiya", "Mera Balma Bada Sayana", "party", "hr-mera-balma"),
    "Gajban": ("Sapna Choudhary, Vishvajeet Choudhary", "Gajban Pani Ne Chali", "party", "hr-gajban-pani"),
    "Chand": ("Renuka Panwar", "Chand", "romantic", "hr-chand-renuka"),
    "Jaat": ("Sumit Partap, Kaptan Laadpur", "Jaat", "party", "hr-jaat-sumit"),
    "Kabootar": ("Renuka Panwar, Surender Romio", "Kabootar", "party", "hr-kabootar-renuka"),
    "Solid Body": ("Raju Punjabi, Sheenam Katholic", "Solid Body", "party", "hr-solid-body"),
    "Bahu Milgi": ("Ajay Hooda, Anu Kadyan", "Bahu Milgi", "party", "hr-bahu-milgi"),
    "Tagdi": ("Ajay Hooda, Gagan Haryanvi", "Tagdi", "party", "hr-tagdi-ajay"),
    "Dekhya Karo": ("Renuka Panwar", "Dekhya Karo", "romantic", "hr-dekhya-karo"),
    "Jale 2": ("Sapna Choudhary, Shiva Choudhary", "Jale 2", "party", "hr-jale-2"),
    "Jale": ("Sapna Choudhary", "Jale", "party", "hr-jale-sapna"),
    "Balam Thanedar": ("Dinesh Golan, Ruchika Jangid", "Balam Thanedar (Gypsy)", "party", "hr-balam-thanedar"),
    "Aankh Marey": ("Renuka Panwar, Amit Dhull", "Aankh Marey", "party", "hr-aankh-marey-hr"),
    "Chatak Matak": ("Renuka Panwar, Sapna Choudhary", "Chatak Matak", "party", "hr-chatak-matak"),
    "Thada Bhartar": ("Raju Punjabi, Sushila Thakar", "Thada Bhartar", "party", "hr-thada-bhartar"),
    "Russian Bandana": ("Diler Kharkiya", "Russian Bandana", "trending", "hr-russian-bandana"),
    "Gypsy": ("GD Kaur, Pranjal Dahiya", "Gypsy Balam Thanedar", "party", "hr-gypsy-gd-kaur"),
    "Hooka": ("Sumit Goswami", "Hooka", "party", "hr-hooka-sumit"),
    "Loot Liya": ("Gulzaar Chhaniwala", "Loot Liya", "party", "hr-loot-liya"),
    "Nakhre": ("Gulzaar Chhaniwala", "Nakhre", "party", "hr-nakhre-gulzaar"),
    "Bawli": ("Sumit Goswami", "Bawli", "romantic", "hr-bawli-sumit"),
    "Pani Chhalke": ("Manisha Sharma, Renuka Panwar", "Pani Chhalke", "party", "hr-pani-chhalke"),
    "Lado Rani": ("Diler Kharkiya", "Lado Rani", "romantic", "hr-lado-rani"),
    "Dabban Aali Jaatni": ("Masoom Sharma", "Dabban Aali Jaatni", "party", "hr-dabban-aali-jaatni"),
    "Jaatni": ("Masoom Sharma", "Jaatni", "party", "hr-jaatni-masoom"),
    "Kale Kagaz": ("Gulzaar Chhaniwala", "Kale Kagaz", "party", "hr-kale-kagaz"),
    "Yadav Brand 2": ("Sunny Yaduvanshi, Nikk", "Yadav Brand 2", "party", "hr-yadav-brand-2"),
    "Yadav Brand": ("Sunny Yaduvanshi", "Yadav Brand", "party", "hr-yadav-brand-1"),
    "Kallo": ("Masoom Sharma", "Kallo", "party", "hr-kallo-masoom"),
    "Chora Baba Ka": ("Masoom Sharma", "Chora Baba Ka", "party", "hr-chora-baba-ka"),
    "Daru Badnaam": ("Kamal Kahlon, Param Singh", "Daru Badnaam", "party", "hr-daru-badnaam"),
    "Badmashi": ("Masoom Sharma", "Badmashi", "party", "hr-badmashi-masoom"),
    "Jaat Ki Setting": ("Masoom Sharma", "Jaat Ki Setting", "party", "hr-jaat-ki-setting"),
    "Kalesh": ("Gulzaar Chhaniwala", "Kalesh", "party", "hr-kalesh-gulzaar"),
    "Chora Jaat Ka": ("Masoom Sharma", "Chora Jaat Ka", "party", "hr-chora-jaat-ka"),
    "Banno": ("Masoom Sharma", "Banno", "romantic", "hr-banno-masoom"),
    "Moka Soka": ("Gulzaar Chhaniwala", "Moka Soka", "party", "hr-moka-soka"),
    "System": ("Khatri, Sumit Goswami", "System", "party", "hr-system-khatri"),
    "Bairan": ("Gulzaar Chhaniwala", "Bairan", "romantic", "hr-bairan-gulzaar"),
    "Feel": ("Gulzaar Chhaniwala", "Feel", "romantic", "hr-feel-gulzaar")
}

print(f"Loaded master metadata for {len(SONG_METADATA_MAP)} potential tracks.")

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    code = f.read()

existing_ids = set(re.findall(r'"id":\s*"([^"]+)"', code))
print(f"Existing tracks in DEMO_CATALOG: {len(existing_ids)}")

to_add = []
for title, (artist, album, cat, tid) in SONG_METADATA_MAP.items():
    if tid not in existing_ids:
        to_add.append({
            "id": tid,
            "title": title,
            "artist": artist,
            "album": album,
            "category": cat,
            "duration": "3:30",
            "ytSearchQuery": f"{title} {artist.split(',')[0]} official audio song",
            "storagePath": f"{tid}.mp3",
            "source": "Pulse Worldwide Hits"
        })

print(f"Unique tracks ready to append: {len(to_add)}")

if to_add:
    new_track_blocks = []
    for s in to_add:
        block = f"""  {{
    "id": "{s['id']}",
    "title": "{s['title']}",
    "artist": "{s['artist']}",
    "album": "{s['album']}",
    "duration": "{s['duration']}",
    "category": "{s['category']}",
    "ytSearchQuery": "{s['ytSearchQuery']}",
    "storagePath": "{s['storagePath']}",
    "source": "{s['source']}"
  }}"""
        new_track_blocks.append(block)

    appended_str = ",\n" + ",\n".join(new_track_blocks)
    end_marker = "].map(normalizeTrack);"
    idx = code.rfind(end_marker)
    if idx != -1:
        new_code = code[:idx].rstrip() + appended_str + "\n" + code[idx:]
        with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
            f.write(new_code)
        print(f"SUCCESS: Appended {len(to_add)} tracks into DEMO_CATALOG in musicService.js!")
    else:
        print("Error: Could not locate end of DEMO_CATALOG")

# Also update server.py TOP_SONGS
with open(SERVER_PATH, 'r', encoding='utf-8') as f:
    server_code = f.read()

top_tuples = []
for s in to_add:
    top_tuples.append(f'    ("{s["id"]}", "{s["title"]}", "{s["artist"].split(",")[0]}", None),')

top_str = "\n".join(top_tuples)
if "TOP_SONGS = [" in server_code:
    server_code = server_code.replace("TOP_SONGS = [", f"TOP_SONGS = [\n{top_str}")
    with open(SERVER_PATH, 'w', encoding='utf-8') as f:
        f.write(server_code)
    print("Updated server.py TOP_SONGS list with all newly appended tracks!")

# Update index.html with Haryanvi & Global exploration tags
with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html_code = f.read()

if 'Haryanvi Top Hits' not in html_code:
    pills_target = '<button class="pill-btn" onclick="window.executeSearch(\'Diljit Dosanjh Lover GOAT\')">👑 Diljit Dosanjh Hits</button>'
    pills_replacement = '<button class="pill-btn" onclick="window.executeSearch(\'Haryanvi Top Hits 52 Gaj Ka Daman Gypsy\')">🚜 Haryanvi Hits</button>\n            ' + pills_target
    html_code = html_code.replace(pills_target, pills_replacement)

    genre_target = '<div class="genre-card g-punjabi" onclick="window.executeSearch(\'Punjabi Top Chart Hits\')"><span>Punjabi Explosions</span></div>'
    genre_replacement = '<div class="genre-card g-haryanvi" onclick="window.executeSearch(\'Haryanvi Hits 52 Gaj Ka Daman Moto Gypsy\')"><span>Haryanvi / Desi</span></div>\n            ' + genre_target
    html_code = html_code.replace(genre_target, genre_replacement)

    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        f.write(html_code)
    print("Updated index.html with Haryanvi exploration tags!")
