import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')
SERVER_PATH = os.path.join(ROOT, 'server.py')

NEW_SONGS = [
    # --- TELUGU BLOCKBUSTERS ---
    {
        "id": "te-naatu-naatu",
        "title": "Naatu Naatu",
        "artist": "Rahul Sipligunj, Kaala Bhairava, M.M. Keeravani",
        "album": "RRR",
        "duration": "3:35",
        "category": "trending",
        "ytId": "OsU0CGZoV8E",
        "ytSearchQuery": "Naatu Naatu RRR Telugu official song",
        "storagePath": "te-naatu-naatu.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-oo-antava",
        "title": "Oo Antava Mawa..Oo Oo Antava",
        "artist": "Indravathi Chauhan, Devi Sri Prasad",
        "album": "Pushpa: The Rise",
        "duration": "3:44",
        "category": "trending",
        "ytId": "gkea1_C_1yQ",
        "ytSearchQuery": "Oo Antava Mawa Oo Oo Antava Pushpa Telugu song",
        "storagePath": "te-oo-antava.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-srivalli",
        "title": "Srivalli",
        "artist": "Sid Sriram, Devi Sri Prasad",
        "album": "Pushpa: The Rise",
        "duration": "3:41",
        "category": "romantic",
        "ytId": "eypZt3m8sJ0",
        "ytSearchQuery": "Srivalli Telugu Sid Sriram Pushpa song",
        "storagePath": "te-srivalli.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-saami-saami",
        "title": "Saami Saami",
        "artist": "Mounika Yadav, Devi Sri Prasad",
        "album": "Pushpa: The Rise",
        "duration": "3:43",
        "category": "party",
        "ytId": "jL1vH_CclXQ",
        "ytSearchQuery": "Saami Saami Pushpa Telugu song",
        "storagePath": "te-saami-saami.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-pushpa-pushpa",
        "title": "Pushpa Pushpa",
        "artist": "Nakash Aziz, Devi Sri Prasad",
        "album": "Pushpa 2: The Rule",
        "duration": "4:15",
        "category": "trending",
        "ytId": "p6t1d12c_1Y",
        "ytSearchQuery": "Pushpa Pushpa Pushpa 2 Telugu song",
        "storagePath": "te-pushpa-pushpa.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-sooseki",
        "title": "Sooseki (The Couple Song)",
        "artist": "Shreya Ghoshal, Devi Sri Prasad",
        "album": "Pushpa 2: The Rule",
        "duration": "4:20",
        "category": "romantic",
        "ytId": "vYdI1t_QvYc",
        "ytSearchQuery": "Sooseki The Couple Song Pushpa 2 Telugu",
        "storagePath": "te-sooseki.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-chuttamalle",
        "title": "Chuttamalle",
        "artist": "Shilpa Rao, Anirudh Ravichander",
        "album": "Devara",
        "duration": "3:48",
        "category": "romantic",
        "ytId": "fGZ18t82pE8",
        "ytSearchQuery": "Chuttamalle Devara Shilpa Rao Anirudh Telugu",
        "storagePath": "te-chuttamalle.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-fear-song",
        "title": "Fear Song",
        "artist": "Anirudh Ravichander",
        "album": "Devara",
        "duration": "3:16",
        "category": "party",
        "ytId": "V14l0Vf3e80",
        "ytSearchQuery": "Fear Song Devara Anirudh Telugu",
        "storagePath": "te-fear-song.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-daavudi",
        "title": "Daavudi",
        "artist": "Nakash Aziz, Akasa, Anirudh Ravichander",
        "album": "Devara",
        "duration": "3:30",
        "category": "party",
        "ytId": "3U9j2b_mP7I",
        "ytSearchQuery": "Daavudi Devara Anirudh Telugu song",
        "storagePath": "te-daavudi.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-butta-bomma",
        "title": "Butta Bomma",
        "artist": "Armaan Malik, Thaman S",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "3:18",
        "category": "romantic",
        "ytId": "2mDCVzruYzQ",
        "ytSearchQuery": "Butta Bomma Ala Vaikunthapurramuloo Armaan Malik Telugu",
        "storagePath": "te-butta-bomma.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-samajavaragamana",
        "title": "Samajavaragamana",
        "artist": "Sid Sriram, Thaman S",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "3:42",
        "category": "romantic",
        "ytId": "ocMEv95u2z0",
        "ytSearchQuery": "Samajavaragamana Ala Vaikunthapurramuloo Sid Sriram Telugu",
        "storagePath": "te-samajavaragamana.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-ramuloo-ramulaa",
        "title": "Ramuloo Ramulaa",
        "artist": "Anurag Kulkarni, Mangli, Thaman S",
        "album": "Ala Vaikunthapurramuloo",
        "duration": "4:07",
        "category": "party",
        "ytId": "kd_7wX11f-c",
        "ytSearchQuery": "Ramuloo Ramulaa Ala Vaikunthapurramuloo Telugu",
        "storagePath": "te-ramuloo-ramulaa.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-kurchi-madathapetti",
        "title": "Kurchi Madathapetti",
        "artist": "Sri Krishna, Sahithi Chaganti, Thaman S",
        "album": "Guntur Kaaram",
        "duration": "3:35",
        "category": "party",
        "ytId": "p_VbH2tUqA4",
        "ytSearchQuery": "Kurchi Madathapetti Guntur Kaaram Telugu song",
        "storagePath": "te-kurchi-madathapetti.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-dum-masala",
        "title": "Dum Masala",
        "artist": "Sanjith Hegde, Thaman S",
        "album": "Guntur Kaaram",
        "duration": "3:26",
        "category": "trending",
        "ytId": "fXk67wHq87g",
        "ytSearchQuery": "Dum Masala Guntur Kaaram Telugu",
        "storagePath": "te-dum-masala.mp3",
        "source": "Tollywood Blockbusters"
    },
    {
        "id": "te-inkem-inkem",
        "title": "Inkem Inkem Inkem Kaavaale",
        "artist": "Sid Sriram, Gopi Sundar",
        "album": "Geetha Govindam",
        "duration": "4:27",
        "category": "romantic",
        "ytId": "1Wup73kQ10c",
        "ytSearchQuery": "Inkem Inkem Inkem Kaavaale Geetha Govindam Sid Sriram",
        "storagePath": "te-inkem-inkem.mp3",
        "source": "Tollywood Blockbusters"
    },

    # --- GUJARATI SUPERHITS & FOLK POP ---
    {
        "id": "gu-khalasi",
        "title": "Khalasi (Gotilo)",
        "artist": "Aditya Gadhvi, Achint",
        "album": "Coke Studio Bharat",
        "duration": "4:12",
        "category": "trending",
        "ytId": "q10_gJg3wYQ",
        "ytSearchQuery": "Khalasi Gotilo Aditya Gadhvi Achint Coke Studio Bharat",
        "storagePath": "gu-khalasi.mp3",
        "source": "Gujarati Superhits"
    },
    {
        "id": "gu-chogada",
        "title": "Chogada",
        "artist": "Darshan Raval, Asees Kaur",
        "album": "Loveyatri",
        "duration": "4:10",
        "category": "party",
        "ytId": "d4OuBCUSp-E",
        "ytSearchQuery": "Chogada Tara Loveyatri Darshan Raval",
        "storagePath": "gu-chogada.mp3",
        "source": "Gujarati Superhits"
    },
    {
        "id": "gu-kamariya",
        "title": "Kamariya",
        "artist": "Darshan Raval, Lijo George",
        "album": "Mitron",
        "duration": "3:08",
        "category": "party",
        "ytId": "iP_D3c6Zk-0",
        "ytSearchQuery": "Kamariya Mitron Darshan Raval Garba",
        "storagePath": "gu-kamariya.mp3",
        "source": "Gujarati Superhits"
    },
    {
        "id": "gu-dholida-gangubai",
        "title": "Dholida",
        "artist": "Jahnvi Shrimankar, Shail Hada, Sanjay Leela Bhansali",
        "album": "Gangubai Kathiawadi",
        "duration": "2:59",
        "category": "party",
        "ytId": "z18v7d5W6uM",
        "ytSearchQuery": "Dholida Gangubai Kathiawadi Jahnvi Shrimankar",
        "storagePath": "gu-dholida-gangubai.mp3",
        "source": "Gujarati Superhits"
    },
    {
        "id": "gu-char-bangadi",
        "title": "Char Char Bangadi Vadi Gadi",
        "artist": "Kinjal Dave",
        "album": "Kinjal Dave Hits",
        "duration": "4:32",
        "category": "party",
        "ytId": "W7M60N7w_Z0",
        "ytSearchQuery": "Char Char Bangadi Vadi Gadi Kinjal Dave",
        "storagePath": "gu-char-bangadi.mp3",
        "source": "Gujarati Superhits"
    },
    {
        "id": "gu-rona-ser-ma",
        "title": "Rona Ser Ma",
        "artist": "Geeta Rabari",
        "album": "Geeta Rabari Superhits",
        "duration": "4:45",
        "category": "trending",
        "ytId": "V_m5n8f2z4c",
        "ytSearchQuery": "Rona Ser Ma Geeta Rabari Gujarati song",
        "storagePath": "gu-rona-ser-ma.mp3",
        "source": "Gujarati Superhits"
    },
    {
        "id": "gu-radha-ne-shyam",
        "title": "Radha Ne Shyam Mali Jashe",
        "artist": "Sachin-Jigar, Sachin Sanghvi, Shruti Pathak",
        "album": "Navratri Special",
        "duration": "3:58",
        "category": "romantic",
        "ytId": "5h8j4c2m8q0",
        "ytSearchQuery": "Radha Ne Shyam Mali Jashe Sachin Jigar",
        "storagePath": "gu-radha-ne-shyam.mp3",
        "source": "Gujarati Superhits"
    },
    {
        "id": "gu-nagada-sang-dhol",
        "title": "Nagada Sang Dhol",
        "artist": "Shreya Ghoshal, Osman Mir",
        "album": "Goliyon Ki Raasleela Ram-Leela",
        "duration": "4:33",
        "category": "party",
        "ytId": "vK5E_7Ev_t4",
        "ytSearchQuery": "Nagada Sang Dhol Ram Leela Shreya Ghoshal",
        "storagePath": "gu-nagada-sang-dhol.mp3",
        "source": "Gujarati Superhits"
    },

    # --- MARATHI SUPERHITS ---
    {
        "id": "mr-zingaat",
        "title": "Zingaat",
        "artist": "Ajay-Atul",
        "album": "Sairat",
        "duration": "3:46",
        "category": "party",
        "ytId": "8g76Z8Y8j8Y",
        "ytSearchQuery": "Zingaat Sairat Ajay Atul Marathi song",
        "storagePath": "mr-zingaat.mp3",
        "source": "Marathi Superhits"
    },
    {
        "id": "mr-yad-lagla",
        "title": "Yad Lagla",
        "artist": "Ajay Gogavale, Ajay-Atul",
        "album": "Sairat",
        "duration": "5:14",
        "category": "romantic",
        "ytId": "Qv6j2b8m14c",
        "ytSearchQuery": "Yad Lagla Sairat Ajay Atul Marathi song",
        "storagePath": "mr-yad-lagla.mp3",
        "source": "Marathi Superhits"
    },
    {
        "id": "mr-apsara-aali",
        "title": "Apsara Aali",
        "artist": "Bela Shende, Ajay-Atul",
        "album": "Natarang",
        "duration": "4:47",
        "category": "party",
        "ytId": "p6t1d8z3y84",
        "ytSearchQuery": "Apsara Aali Natarang Bela Shende Ajay Atul",
        "storagePath": "mr-apsara-aali.mp3",
        "source": "Marathi Superhits"
    },
    {
        "id": "mr-chandra",
        "title": "Chandra",
        "artist": "Shreya Ghoshal, Ajay-Atul",
        "album": "Chandramukhi",
        "duration": "3:58",
        "category": "trending",
        "ytId": "6x0s8m7v1q0",
        "ytSearchQuery": "Chandra Chandramukhi Shreya Ghoshal Ajay Atul",
        "storagePath": "mr-chandra.mp3",
        "source": "Marathi Superhits"
    },
    {
        "id": "mr-bai-ga",
        "title": "Bai Ga",
        "artist": "Aarya Ambekar, Ajay-Atul",
        "album": "Chandramukhi",
        "duration": "4:12",
        "category": "romantic",
        "ytId": "X1b9d4v6m80",
        "ytSearchQuery": "Bai Ga Chandramukhi Aarya Ambekar Ajay Atul",
        "storagePath": "mr-bai-ga.mp3",
        "source": "Marathi Superhits"
    },
    {
        "id": "mr-shantabai",
        "title": "Shantabai",
        "artist": "Sanjay Londhe",
        "album": "Shantabai Superhits",
        "duration": "4:20",
        "category": "party",
        "ytId": "2m8v6k4j10w",
        "ytSearchQuery": "Shantabai Sanjay Londhe Marathi song",
        "storagePath": "mr-shantabai.mp3",
        "source": "Marathi Superhits"
    },
    {
        "id": "mr-tik-tik-vajate",
        "title": "Tik Tik Vajate Dokyat",
        "artist": "Sonu Nigam, Sayalie Pankaj",
        "album": "Duniyadari",
        "duration": "4:09",
        "category": "romantic",
        "ytId": "6V_Vd1m6j0c",
        "ytSearchQuery": "Tik Tik Vajate Dokyat Duniyadari Sonu Nigam",
        "storagePath": "mr-tik-tik-vajate.mp3",
        "source": "Marathi Superhits"
    },

    # --- SPANISH / LATIN GLOBAL HITS ---
    {
        "id": "es-despacito",
        "title": "Despacito",
        "artist": "Luis Fonsi ft. Daddy Yankee",
        "album": "VIDA",
        "duration": "3:48",
        "category": "trending",
        "ytId": "kJQP7kiw5Fk",
        "ytSearchQuery": "Despacito Luis Fonsi Daddy Yankee",
        "storagePath": "es-despacito.mp3",
        "source": "Spanish & Latin Hits"
    },
    {
        "id": "es-gasolina",
        "title": "Gasolina",
        "artist": "Daddy Yankee",
        "album": "Barrio Fino",
        "duration": "3:13",
        "category": "party",
        "ytId": "qGKrc3A6HHM",
        "ytSearchQuery": "Gasolina Daddy Yankee audio",
        "storagePath": "es-gasolina.mp3",
        "source": "Spanish & Latin Hits"
    },
    {
        "id": "es-danza-kuduro",
        "title": "Danza Kuduro",
        "artist": "Don Omar ft. Lucenzo",
        "album": "Meet the Orphans",
        "duration": "3:19",
        "category": "party",
        "ytId": "7zp1TbLFPp8",
        "ytSearchQuery": "Danza Kuduro Don Omar Lucenzo",
        "storagePath": "es-danza-kuduro.mp3",
        "source": "Spanish & Latin Hits"
    },
    {
        "id": "es-bailando",
        "title": "Bailando",
        "artist": "Enrique Iglesias ft. Descemer Bueno, Gente De Zona",
        "album": "Sex and Love",
        "duration": "4:03",
        "category": "party",
        "ytId": "NUsoVlDFqZg",
        "ytSearchQuery": "Bailando Enrique Iglesias Spanish",
        "storagePath": "es-bailando.mp3",
        "source": "Spanish & Latin Hits"
    },
    {
        "id": "es-calma",
        "title": "Calma (Remix)",
        "artist": "Pedro Capó, Farruko",
        "album": "Calma",
        "duration": "3:58",
        "category": "trending",
        "ytId": "1_w7o9-UBTQ",
        "ytSearchQuery": "Calma Remix Pedro Capo Farruko",
        "storagePath": "es-calma.mp3",
        "source": "Spanish & Latin Hits"
    },
    {
        "id": "es-pepas",
        "title": "Pepas",
        "artist": "Farruko",
        "album": "La 167",
        "duration": "4:47",
        "category": "party",
        "ytId": "y83x7MgzWOA",
        "ytSearchQuery": "Pepas Farruko official audio",
        "storagePath": "es-pepas.mp3",
        "source": "Spanish & Latin Hits"
    },
    {
        "id": "es-tusa",
        "title": "Tusa",
        "artist": "KAROL G, Nicki Minaj",
        "album": "KG0516",
        "duration": "3:20",
        "category": "trending",
        "ytId": "tbneQDc2H3I",
        "ytSearchQuery": "Tusa KAROL G Nicki Minaj",
        "storagePath": "es-tusa.mp3",
        "source": "Spanish & Latin Hits"
    },
    {
        "id": "es-mi-gente",
        "title": "Mi Gente",
        "artist": "J Balvin, Willy William",
        "album": "Vibras",
        "duration": "3:05",
        "category": "party",
        "ytId": "wnJ6LuUFpMo",
        "ytSearchQuery": "Mi Gente J Balvin Willy William",
        "storagePath": "es-mi-gente.mp3",
        "source": "Spanish & Latin Hits"
    },
    {
        "id": "es-chantaje",
        "title": "Chantaje",
        "artist": "Shakira ft. Maluma",
        "album": "El Dorado",
        "duration": "3:16",
        "category": "romantic",
        "ytId": "6Mgqbai3fKo",
        "ytSearchQuery": "Chantaje Shakira Maluma",
        "storagePath": "es-chantaje.mp3",
        "source": "Spanish & Latin Hits"
    },
    {
        "id": "es-waka-waka",
        "title": "Waka Waka (This Time for Africa)",
        "artist": "Shakira",
        "album": "Sale el Sol",
        "duration": "3:22",
        "category": "party",
        "ytId": "pRpeEdMmmQ0",
        "ytSearchQuery": "Waka Waka Shakira official audio",
        "storagePath": "es-waka-waka.mp3",
        "source": "Spanish & Latin Hits"
    },

    # --- FRENCH MELODIES & POP ---
    {
        "id": "fr-derniere-danse",
        "title": "Dernière Danse",
        "artist": "Indila",
        "album": "Mini World",
        "duration": "3:34",
        "category": "trending",
        "ytId": "K5KAc5CoCuk",
        "ytSearchQuery": "Derniere Danse Indila official audio",
        "storagePath": "fr-derniere-danse.mp3",
        "source": "French Melodies"
    },
    {
        "id": "fr-tourner-dans-le-vide",
        "title": "Tourner Dans Le Vide",
        "artist": "Indila",
        "album": "Mini World",
        "duration": "4:06",
        "category": "trending",
        "ytId": "vtNJMAyeP0s",
        "ytSearchQuery": "Tourner Dans Le Vide Indila audio",
        "storagePath": "fr-tourner-dans-le-vide.mp3",
        "source": "French Melodies"
    },
    {
        "id": "fr-papaoutai",
        "title": "Papaoutai",
        "artist": "Stromae",
        "album": "Racine Carrée",
        "duration": "3:52",
        "category": "party",
        "ytId": "oiKj0Z_Xnjc",
        "ytSearchQuery": "Papaoutai Stromae audio",
        "storagePath": "fr-papaoutai.mp3",
        "source": "French Melodies"
    },
    {
        "id": "fr-alors-on-danse",
        "title": "Alors On Danse",
        "artist": "Stromae",
        "album": "Cheese",
        "duration": "3:28",
        "category": "party",
        "ytId": "VHoT4N43jK8",
        "ytSearchQuery": "Alors On Danse Stromae audio",
        "storagePath": "fr-alors-on-danse.mp3",
        "source": "French Melodies"
    },
    {
        "id": "fr-ego",
        "title": "Ego",
        "artist": "Willy William",
        "album": "Une seule vie",
        "duration": "3:27",
        "category": "party",
        "ytId": "iOxzG3jjFkY",
        "ytSearchQuery": "Ego Willy William audio",
        "storagePath": "fr-ego.mp3",
        "source": "French Melodies"
    },
    {
        "id": "fr-je-te-laisserai",
        "title": "Je Te Laisserai Des Mots",
        "artist": "Patrick Watson",
        "album": "Je te laisserai des mots",
        "duration": "2:41",
        "category": "lofi",
        "ytId": "_OduPzK9P-k",
        "ytSearchQuery": "Je Te Laisserai Des Mots Patrick Watson",
        "storagePath": "fr-je-te-laisserai.mp3",
        "source": "French Melodies"
    },
    {
        "id": "fr-la-vie-en-rose",
        "title": "La Vie En Rose",
        "artist": "Édith Piaf",
        "album": "Classics",
        "duration": "3:07",
        "category": "romantic",
        "ytId": "kFzViYkZAz4",
        "ytSearchQuery": "La Vie En Rose Edith Piaf original",
        "storagePath": "fr-la-vie-en-rose.mp3",
        "source": "French Melodies"
    },

    # --- ENGLISH BILLBOARD & GLOBAL MEGA HITS ---
    {
        "id": "en-birds-of-a-feather",
        "title": "Birds of a Feather",
        "artist": "Billie Eilish",
        "album": "HIT ME HARD AND SOFT",
        "duration": "3:16",
        "category": "trending",
        "ytId": "d5gf9dXbPi0",
        "ytSearchQuery": "Birds of a Feather Billie Eilish audio",
        "storagePath": "en-birds-of-a-feather.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-die-with-a-smile",
        "title": "Die With A Smile",
        "artist": "Lady Gaga & Bruno Mars",
        "album": "Die With A Smile",
        "duration": "4:12",
        "category": "trending",
        "ytId": "kPa7bsKwL-c",
        "ytSearchQuery": "Die With A Smile Lady Gaga Bruno Mars official audio",
        "storagePath": "en-die-with-a-smile.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-not-like-us",
        "title": "Not Like Us",
        "artist": "Kendrick Lamar",
        "album": "Not Like Us",
        "duration": "4:34",
        "category": "trending",
        "ytId": "H58vbez_m4E",
        "ytSearchQuery": "Not Like Us Kendrick Lamar audio",
        "storagePath": "en-not-like-us.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-good-luck-babe",
        "title": "Good Luck, Babe!",
        "artist": "Chappell Roan",
        "album": "Good Luck, Babe!",
        "duration": "3:38",
        "category": "trending",
        "ytId": "1KISt_8c5_c",
        "ytSearchQuery": "Good Luck Babe Chappell Roan audio",
        "storagePath": "en-good-luck-babe.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-believer",
        "title": "Believer",
        "artist": "Imagine Dragons",
        "album": "Evolve",
        "duration": "3:24",
        "category": "party",
        "ytId": "7wtfhZwyrcc",
        "ytSearchQuery": "Believer Imagine Dragons audio",
        "storagePath": "en-believer.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-demons",
        "title": "Demons",
        "artist": "Imagine Dragons",
        "album": "Night Visions",
        "duration": "2:57",
        "category": "party",
        "ytId": "mWRsgZuwf_8",
        "ytSearchQuery": "Demons Imagine Dragons audio",
        "storagePath": "en-demons.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-counting-stars",
        "title": "Counting Stars",
        "artist": "OneRepublic",
        "album": "Native",
        "duration": "4:17",
        "category": "party",
        "ytId": "hT_nvWreIhg",
        "ytSearchQuery": "Counting Stars OneRepublic audio",
        "storagePath": "en-counting-stars.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-faded",
        "title": "Faded",
        "artist": "Alan Walker",
        "album": "Different World",
        "duration": "3:32",
        "category": "trending",
        "ytId": "60ItHLz5WEA",
        "ytSearchQuery": "Faded Alan Walker audio",
        "storagePath": "en-faded.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-sunflower",
        "title": "Sunflower",
        "artist": "Post Malone, Swae Lee",
        "album": "Spider-Man: Into the Spider-Verse",
        "duration": "2:38",
        "category": "trending",
        "ytId": "ApXoWvfEYVU",
        "ytSearchQuery": "Sunflower Post Malone Swae Lee audio",
        "storagePath": "en-sunflower.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-bad-guy",
        "title": "bad guy",
        "artist": "Billie Eilish",
        "album": "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
        "duration": "3:14",
        "category": "party",
        "ytId": "DyDfgMOUjCI",
        "ytSearchQuery": "bad guy Billie Eilish audio",
        "storagePath": "en-bad-guy.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-as-it-was",
        "title": "As It Was",
        "artist": "Harry Styles",
        "album": "Harry's House",
        "duration": "2:47",
        "category": "trending",
        "ytId": "H5v3k2nnd5A",
        "ytSearchQuery": "As It Was Harry Styles audio",
        "storagePath": "en-as-it-was.mp3",
        "source": "Global Megahits"
    },
    {
        "id": "en-flowers",
        "title": "Flowers",
        "artist": "Miley Cyrus",
        "album": "Endless Summer Vacation",
        "duration": "3:20",
        "category": "trending",
        "ytId": "G7KNmW9a75Y",
        "ytSearchQuery": "Flowers Miley Cyrus audio",
        "storagePath": "en-flowers.mp3",
        "source": "Global Megahits"
    },

    # --- HINDI RECENT BLOCKBUSTERS & CLASSICS ---
    {
        "id": "in-jhoome-jo-pathaan",
        "title": "Jhoome Jo Pathaan",
        "artist": "Arijit Singh, Sukriti Kakar, Vishal-Shekhar",
        "album": "Pathaan",
        "duration": "3:28",
        "category": "party",
        "ytId": "YxWlaYCA8MU",
        "ytSearchQuery": "Jhoome Jo Pathaan Shah Rukh Khan Arijit Singh",
        "storagePath": "in-jhoome-jo-pathaan.mp3",
        "source": "Bollywood Hits"
    },
    {
        "id": "in-besharam-rang",
        "title": "Besharam Rang",
        "artist": "Shilpa Rao, Caralisa Monteiro, Vishal-Shekhar",
        "album": "Pathaan",
        "duration": "4:18",
        "category": "party",
        "ytId": "huxhqphtN1Q",
        "ytSearchQuery": "Besharam Rang Pathaan Shilpa Rao",
        "storagePath": "in-besharam-rang.mp3",
        "source": "Bollywood Hits"
    },
    {
        "id": "in-not-ramaiya-vastavaiya",
        "title": "Not Ramaiya Vastavaiya",
        "artist": "Anirudh Ravichander, Vishal Dadlani",
        "album": "Jawan",
        "duration": "3:23",
        "category": "party",
        "ytId": "gn41y4e_y1M",
        "ytSearchQuery": "Not Ramaiya Vastavaiya Jawan Anirudh",
        "storagePath": "in-not-ramaiya-vastavaiya.mp3",
        "source": "Bollywood Hits"
    },
    {
        "id": "in-zinda-banda",
        "title": "Zinda Banda",
        "artist": "Anirudh Ravichander",
        "album": "Jawan",
        "duration": "4:24",
        "category": "party",
        "ytId": "6q80x_19V0w",
        "ytSearchQuery": "Zinda Banda Jawan Anirudh",
        "storagePath": "in-zinda-banda.mp3",
        "source": "Bollywood Hits"
    },
    {
        "id": "in-arjan-vailly",
        "title": "Arjan Vailly",
        "artist": "Bhupinder Babbal, Manan Bhardwaj",
        "album": "Animal",
        "duration": "3:02",
        "category": "party",
        "ytId": "m8F30C_V6w0",
        "ytSearchQuery": "Arjan Vailly Animal Bhupinder Babbal",
        "storagePath": "in-arjan-vailly.mp3",
        "source": "Bollywood Hits"
    },
    {
        "id": "in-pehle-bhi-main",
        "title": "Pehle Bhi Main",
        "artist": "Vishal Mishra, Raj Shekhar",
        "album": "Animal",
        "duration": "4:10",
        "category": "romantic",
        "ytId": "gC2e8a6v_p4",
        "ytSearchQuery": "Pehle Bhi Main Animal Vishal Mishra",
        "storagePath": "in-pehle-bhi-main.mp3",
        "source": "Bollywood Hits"
    },
    {
        "id": "in-tujhe-kitna-chahein-aur",
        "title": "Tujhe Kitna Chahne Lage",
        "artist": "Arijit Singh, Mithoon",
        "album": "Kabir Singh",
        "duration": "4:44",
        "category": "romantic",
        "ytId": "p_VbH2tUqA4",
        "ytSearchQuery": "Tujhe Kitna Chahne Lage Kabir Singh Arijit Singh",
        "storagePath": "in-tujhe-kitna-chahein-aur.mp3",
        "source": "Bollywood Hits"
    },
    {
        "id": "in-bekhayali",
        "title": "Bekhayali",
        "artist": "Sachet Tandon",
        "album": "Kabir Singh",
        "duration": "6:11",
        "category": "trending",
        "ytId": "p6t1d12c_1Y",
        "ytSearchQuery": "Bekhayali Kabir Singh Sachet Tandon",
        "storagePath": "in-bekhayali.mp3",
        "source": "Bollywood Hits"
    },
    {
        "id": "in-dheere-dheere",
        "title": "Dheere Dheere Se Meri Zindagi",
        "artist": "Yo Yo Honey Singh",
        "album": "Dheere Dheere",
        "duration": "3:32",
        "category": "romantic",
        "ytId": "nCD2hj6zJEc",
        "ytSearchQuery": "Dheere Dheere Se Meri Zindagi Yo Yo Honey Singh",
        "storagePath": "in-dheere-dheere.mp3",
        "source": "Bollywood Hits"
    },
    {
        "id": "in-blue-eyes",
        "title": "Blue Eyes",
        "artist": "Yo Yo Honey Singh",
        "album": "Blue Eyes",
        "duration": "3:40",
        "category": "party",
        "ytId": "NbyHNASFi6U",
        "ytSearchQuery": "Blue Eyes Yo Yo Honey Singh",
        "storagePath": "in-blue-eyes.mp3",
        "source": "Bollywood Hits"
    }
]

print(f"Adding {len(NEW_SONGS)} new songs (Telugu, Gujarati, Marathi, Spanish, French, English, Hindi)...")

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    code = f.read()

# Load existing catalog IDs to prevent duplicates
existing_ids = set(re.findall(r'"id":\s*"([^"]+)"', code))
print(f"Existing catalog tracks: {len(existing_ids)}")

to_add = [s for s in NEW_SONGS if s['id'] not in existing_ids]
print(f"Unique new tracks to append: {len(to_add)}")

if to_add:
    # Format each new track cleanly with its HD YouTube cover artwork
    new_track_blocks = []
    for s in to_add:
        cover_art = f"https://i.ytimg.com/vi/{s['ytId']}/hqdefault.jpg"
        block = f"""  {{
    "id": "{s['id']}",
    "title": "{s['title']}",
    "artist": "{s['artist']}",
    "album": "{s['album']}",
    "cover": "{cover_art}",
    "duration": "{s['duration']}",
    "category": "{s['category']}",
    "ytId": "{s['ytId']}",
    "ytSearchQuery": "{s['ytSearchQuery']}",
    "storagePath": "{s['storagePath']}",
    "source": "{s['source']}"
  }}"""
        new_track_blocks.append(block)

    appended_str = ",\n" + ",\n".join(new_track_blocks)
    
    # Locate end of DEMO_CATALOG
    end_marker = "].map(normalizeTrack);"
    idx = code.rfind(end_marker)
    if idx != -1:
        new_code = code[:idx].rstrip() + appended_str + "\n" + code[idx:]
        with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
            f.write(new_code)
        print(f"Successfully appended {len(to_add)} tracks into DEMO_CATALOG in musicService.js!")
    else:
        print("Error: Could not find end of DEMO_CATALOG in musicService.js")

# Also update server.py TOP_SONGS so newly added songs get pre-downloaded & cached
with open(SERVER_PATH, 'r', encoding='utf-8') as f:
    server_code = f.read()

top_tuples = []
for s in to_add:
    top_tuples.append(f'    ("{s["id"]}", "{s["title"]}", "{s["artist"].split(",")[0]}", "{s["ytId"]}"),')

top_str = "\n".join(top_tuples)
if "TOP_SONGS = [" in server_code:
    server_code = server_code.replace("TOP_SONGS = [", f"TOP_SONGS = [\n{top_str}")
    with open(SERVER_PATH, 'w', encoding='utf-8') as f:
        f.write(server_code)
    print("Updated server.py TOP_SONGS list with new tracks!")
