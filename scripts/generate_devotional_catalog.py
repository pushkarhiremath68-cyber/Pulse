import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')
SERVER_PATH = os.path.join(ROOT, 'server.py')
INDEX_PATH = os.path.join(ROOT, 'index.html')

# =========================================================================
# 1. 100+ DEVOTIONAL SONGS DATASET
# =========================================================================
DEVOTIONAL_TRACKS = [
    # --- Hanuman & Rama ---
    ("dev-hanuman-chalisa-gulshan", "Shri Hanuman Chalisa", "Hariharan, Gulshan Kumar", "Shree Hanuman Chalisa", "9:45", "devotional", "hindi", "Shree Hanuman Chalisa Hariharan Gulshan Kumar"),
    ("dev-hanuman-chalisa-shekhar", "Hanuman Chalisa", "Shekhar Ravjiani", "Hanuman Chalisa", "11:20", "devotional", "hindi", "Hanuman Chalisa Shekhar Ravjiani"),
    ("dev-ram-aayenge", "Ram Aayenge", "Swasti Mehul", "Ram Aayenge", "4:15", "devotional", "hindi", "Ram Aayenge Swasti Mehul"),
    ("dev-mere-ghar-ram", "Mere Ghar Ram Aaye Hain", "Jubin Nautiyal", "Mere Ghar Ram Aaye Hain", "4:32", "devotional", "hindi", "Mere Ghar Ram Aaye Hain Jubin Nautiyal"),
    ("dev-shri-ram-chandra-kripalu", "Shri Ram Chandra Kripalu Bhajman", "Anup Jalota", "Bhajan Sandhya", "5:22", "devotional", "hindi", "Shri Ram Chandra Kripalu Bhajman Anup Jalota"),
    ("dev-raghupati-raghav", "Raghupati Raghav Raja Ram", "Hariharan", "Ram Ratan Dhan Payo", "4:48", "devotional", "hindi", "Raghupati Raghav Raja Ram Hariharan"),
    ("dev-payoji-maine-ram", "Payoji Maine Ram Ratan Dhan Payo", "Lata Mangeshkar", "Meera Bhajans", "5:12", "devotional", "hindi", "Payoji Maine Ram Ratan Dhan Payo Lata Mangeshkar"),
    ("dev-sankat-mochan-hanuman", "Sankat Mochan Hanuman Ashtak", "Hariharan", "Hanuman Ashtak", "6:10", "devotional", "hindi", "Sankat Mochan Hanuman Ashtak Hariharan"),
    ("dev-bajrang-baan", "Shree Bajrang Baan", "Hariharan, Lalit Sen", "Bajrang Baan", "7:45", "devotional", "hindi", "Shree Bajrang Baan Hariharan"),
    ("dev-ram-siya-ram", "Ram Siya Ram", "Sachet Tandon, Parampara Tandon", "Adipurush", "3:50", "devotional", "hindi", "Ram Siya Ram Sachet Parampara Adipurush"),
    ("dev-mangala-bhavana-amangala", "Mangal Bhavan Amangal Hari", "Ravindra Jain", "Sampoorna Ramayan", "6:30", "devotional", "hindi", "Mangal Bhavan Amangal Hari Ravindra Jain"),
    ("dev-he-ram-jagjit", "He Ram He Ram", "Jagjit Singh", "Hey Ram", "5:40", "devotional", "hindi", "He Ram He Ram Jagjit Singh"),

    # --- Shiva & Mahadev ---
    ("dev-shiv-tandav-stotram", "Shiv Tandav Stotram", "Shankar Mahadevan", "Shiv Tandav", "9:15", "devotional", "sanskrit", "Shiv Tandav Stotram Shankar Mahadevan"),
    ("dev-har-har-shambhu", "Har Har Shambhu Shiv Mahadeva", "Abhilipsa Panda, Jeetu Sharma", "Har Har Shambhu", "5:32", "devotional", "hindi", "Har Har Shambhu Shiv Mahadeva Abhilipsa Panda"),
    ("dev-namo-namo", "Namo Namo", "Amit Trivedi", "Kedarnath", "5:22", "devotional", "hindi", "Namo Namo Shankara Amit Trivedi Kedarnath"),
    ("dev-kaal-bhairav-ashtakam", "Kaal Bhairav Ashtakam", "Ramesh Bhai Ojha", "Kaal Bhairav Ashtakam", "6:45", "devotional", "sanskrit", "Kaal Bhairav Ashtakam"),
    ("dev-maha-mrityunjaya-mantra", "Maha Mrityunjaya Mantra 108 Times", "Shankar Sahney", "Maha Mrityunjaya", "18:00", "devotional", "sanskrit", "Maha Mrityunjaya Mantra 108 times"),
    ("dev-shiv-kailasho-ke-wasi", "Shiv Kailasho Ke Wasi", "Hansraj Raghuwanshi", "Shiv Kailasho Ke Wasi", "5:18", "devotional", "hindi", "Shiv Kailasho Ke Wasi Hansraj Raghuwanshi"),
    ("dev-parvati-boli-shankar-se", "Parvati Boli Shankar Se", "Hansraj Raghuwanshi", "Parvati Boli", "4:55", "devotional", "hindi", "Parvati Boli Shankar Se Hansraj Raghuwanshi"),
    ("dev-om-namah-shivaya-dhun", "Om Namah Shivaya Chanting", "Krishna Das", "Peaceful Chants", "8:30", "devotional", "sanskrit", "Om Namah Shivaya Chanting Krishna Das"),
    ("dev-lingashtakam", "Brahma Murari Surarchita Lingam (Lingashtakam)", "S.P. Balasubrahmanyam", "Lingashtakam", "5:10", "devotional", "sanskrit", "Lingashtakam SP Balasubrahmanyam"),
    ("dev-bhole-nath-hansraj", "Mera Bhola Hai Bhandari", "Hansraj Raghuwanshi, Suresh Verma", "Mera Bhola Hai Bhandari", "4:28", "devotional", "hindi", "Mera Bhola Hai Bhandari Hansraj Raghuwanshi"),
    ("dev-karpur-gauram", "Karpur Gauram Karunavataram", "Anuradha Paudwal", "Devon Ke Dev Mahadev", "4:15", "devotional", "sanskrit", "Karpur Gauram Karunavataram Devon Ke Dev Mahadev"),
    ("dev-shambhu-shankar", "Shambhu", "Akshay Kumar, Sudhir Yaduvanshi", "Shambhu", "3:40", "devotional", "hindi", "Shambhu Akshay Kumar Sudhir Yaduvanshi"),

    # --- Krishna & Radha ---
    ("dev-achyutam-keshavam", "Achyutam Keshavam Krishna Damodaram", "Madhuraa Bhattacharya", "Achyutam Keshavam", "5:20", "devotional", "hindi", "Achyutam Keshavam Krishna Damodaram Madhuraa"),
    ("dev-shri-krishna-govind", "Shri Krishna Govind Hare Murari", "Jubin Nautiyal", "Shri Krishna Govind", "5:15", "devotional", "hindi", "Shri Krishna Govind Hare Murari Jubin Nautiyal"),
    ("dev-radhe-radhe-barsane", "Radhe Radhe Barsane Wali Radhe", "Gaurav Krishna Goswami", "Barsane Wali Radhe", "7:12", "devotional", "hindi", "Radhe Radhe Barsane Wali Radhe"),
    ("dev-radha-rani-bhajan", "Radha Rani Lage", "Jaya Kishori", "Radha Rani", "5:45", "devotional", "hindi", "Radha Rani Lage Jaya Kishori"),
    ("dev-woh-kisna-hai", "Woh Kisna Hai", "Sukhwinder Singh, Ismail Darbar", "Kisna", "5:35", "devotional", "hindi", "Woh Kisna Hai Sukhwinder Singh"),
    ("dev-radhe-kishori-daya-karo", "Radhe Radhe Radhe Barsane Wali", "Chitra Vichitra", "Radhe Radhe", "6:20", "devotional", "hindi", "Radhe Radhe Radhe Barsane Wali Chitra Vichitra"),
    ("dev-choti-choti-gaiya", "Choti Choti Gaiya Chote Chote Gwal", "Poonam Didi", "Krishna Bhajan", "6:05", "devotional", "hindi", "Choti Choti Gaiya Chote Chote Gwal"),
    ("dev-govind-bolo-hari", "Govind Bolo Hari Gopal Bolo", "Jagjit Singh", "Hare Krishna", "6:50", "devotional", "hindi", "Govind Bolo Hari Gopal Bolo Jagjit Singh"),
    ("dev-yashomati-maiya-se", "Yashomati Maiya Se Bole Nandlala", "Lata Mangeshkar, Manna Dey", "Satyam Shivam Sundaram", "3:45", "devotional", "hindi", "Yashomati Maiya Se Bole Nandlala"),
    ("dev-aisi-lagi-lagan", "Aisi Lagi Lagan Meera Ho Gayi Magan", "Anup Jalota", "Meera Bhajans", "6:15", "devotional", "hindi", "Aisi Lagi Lagan Meera Ho Gayi Magan Anup Jalota"),
    ("dev-kanha-soja-zara", "Soja Zara (Kanha)", "Madhushree", "Baahubali 2", "4:56", "devotional", "hindi", "Soja Zara Baahubali 2 Madhushree"),

    # --- Devi & Durga / Mahishasura Mardini ---
    ("dev-aigiri-nandini", "Aigiri Nandini (Mahishasura Mardini Stotram)", "Brodha V", "Aigiri Nandini Fusion", "3:58", "devotional", "sanskrit", "Aigiri Nandini Brodha V"),
    ("dev-mahishasura-mardini-stotram", "Mahishasura Mardini Stotram Full", "Rajalakshmee Sanjay", "Devi Stotras", "10:15", "devotional", "sanskrit", "Mahishasura Mardini Stotram Rajalakshmee Sanjay"),
    ("dev-durga-saptashati", "Durga Saptashati - Argala Stotram", "Anuradha Paudwal", "Durga Saptashati", "6:30", "devotional", "sanskrit", "Durga Saptashati Argala Stotram Anuradha Paudwal"),
    ("dev-chalo-bulawa-aaya-hai", "Chalo Bulawa Aaya Hai Mata Ne Bulaya Hai", "Narendra Chanchal, Asha Bhosle, Mahendra Kapoor", "Avtaar", "8:35", "devotional", "hindi", "Chalo Bulawa Aaya Hai Narendra Chanchal"),
    ("dev-tune-mujhe-bulaya-shera-waliye", "Tune Mujhe Bulaya Sherawaliye", "Mohammed Rafi, Narendra Chanchal", "Aasha", "6:42", "devotional", "hindi", "Tune Mujhe Bulaya Sherawaliye Mohammed Rafi"),
    ("dev-jai-ambe-gauri", "Aarti - Jai Ambe Gauri", "Anuradha Paudwal", "Sampoorna Aarti", "6:20", "devotional", "hindi", "Jai Ambe Gauri Aarti Anuradha Paudwal"),
    ("dev-gayatri-mantra", "Gayatri Mantra 108 Times", "Anuradha Paudwal", "Sacred Chants", "22:00", "devotional", "sanskrit", "Gayatri Mantra Anuradha Paudwal 108 times"),

    # --- Ganesha & Aartis ---
    ("dev-vakratunda-mahakaya", "Vakratunda Mahakaya Suryakoti Samaprabha", "Sadhana Sargam", "Ganesh Vandana", "4:12", "devotional", "sanskrit", "Vakratunda Mahakaya Sadhana Sargam"),
    ("dev-jai-ganesh-deva", "Jai Ganesh Jai Ganesh Jai Ganesh Deva", "Anuradha Paudwal", "Ganesh Aarti", "4:45", "devotional", "hindi", "Jai Ganesh Jai Ganesh Jai Ganesh Deva Anuradha Paudwal"),
    ("dev-ganpati-bappa-morya", "Morya Re", "Shankar Mahadevan", "Don", "5:50", "devotional", "hindi", "Morya Re Shankar Mahadevan Don"),
    ("dev-om-jai-jagdish-hare", "Om Jai Jagdish Hare", "Anuradha Paudwal", "Sampoorna Aarti Sangrah", "6:15", "devotional", "hindi", "Om Jai Jagdish Hare Anuradha Paudwal"),
    ("dev-aarti-kunj-bihari-ki", "Aarti Kunj Bihari Ki", "Hariharan", "Krishna Aarti", "5:40", "devotional", "hindi", "Aarti Kunj Bihari Ki Hariharan"),
    ("dev-shree-ganesh-atharvashirsha", "Ganpati Atharvashirsha", "Suresh Wadkar", "Ganesh Atharvashirsha", "8:10", "devotional", "sanskrit", "Ganpati Atharvashirsha Suresh Wadkar"),

    # --- Kannada Dasa Keerthane & Bhakti ---
    ("dev-kn-bhagyada-lakshmi", "Bhagyada Lakshmi Baramma", "Bhimsen Joshi", "Purandara Dasa Keerthana", "5:30", "devotional", "kannada", "Bhagyada Lakshmi Baramma Bhimsen Joshi"),
    ("dev-kn-jagadodharana", "Jagadodharana Aadisidaleshoda", "M.S. Subbulakshmi", "Purandara Dasa Krithi", "4:50", "devotional", "kannada", "Jagadodharana MS Subbulakshmi"),
    ("dev-kn-krishna-nee-begane", "Krishna Nee Begane Baaro", "Vyasatirtha, Colonial Cousins", "Bhakti Taranga", "5:15", "devotional", "kannada", "Krishna Nee Begane Baaro Colonial Cousins"),
    ("dev-kn-pillangoviya-cheluva", "Pillangoviya Cheluva Krishnana", "Puttur Narasimha Nayak", "Purandara Dasa", "5:05", "devotional", "kannada", "Pillangoviya Cheluva Krishnana Puttur"),
    ("dev-kn-baro-krishnayya", "Baro Krishnayya Ninna Bhakthara Manege", "M.S. Subbulakshmi", "Kanakadasa Keerthane", "4:40", "devotional", "kannada", "Baro Krishnayya MS Subbulakshmi"),
    ("dev-kn-kande-kande-swamiya", "Kande Kande Swamiya Kande", "K.J. Yesudas", "Ayyappa Bhakti Geethegalu", "4:58", "devotional", "kannada", "Kande Kande Swamiya Kande Yesudas"),
    ("dev-kn-ee-paada-punya-paada", "Ee Paada Punya Paada", "Dr. Rajkumar", "Guru Raghavendra Stuti", "4:35", "devotional", "kannada", "Ee Paada Punya Paada Dr Rajkumar"),
    ("dev-kn-swamiye-saranam-ayyappa", "Swamiye Saranam Ayyappa", "S.P. Balasubrahmanyam", "Sabarimala Yatre", "5:20", "devotional", "kannada", "Swamiye Saranam Ayyappa SP Balasubrahmanyam"),
    ("dev-kn-narayana-ninna-namada", "Narayana Ninna Namada Smaraneya", "Bhimsen Joshi", "Purandara Dasa Keerthane", "6:10", "devotional", "kannada", "Narayana Ninna Namada Smaraneya Bhimsen Joshi"),
    ("dev-kn-gummana-kareyadire", "Gummana Kareyadire Amma", "Bhimsen Joshi", "Purandara Dasa", "5:25", "devotional", "kannada", "Gummana Kareyadire Amma Bhimsen Joshi"),
    ("dev-kn-kalinga-mardana", "Kalinga Mardana Thaye Yashoda", "Puttur Narasimha Nayak", "Krishna Bhakti", "4:50", "devotional", "kannada", "Kalinga Mardana Krishna Puttur"),
    ("dev-kn-thaye-yashoda", "Thaye Yashoda Udupi Krishna", "Puttur Narasimha Nayak", "Dasa Sahitya", "5:12", "devotional", "kannada", "Thaye Yashoda Puttur Narasimha Nayak"),
    ("dev-kn-daasanamadiko-enno", "Dasana Madiko Enna", "Bhimsen Joshi", "Purandara Dasa", "5:45", "devotional", "kannada", "Dasana Madiko Enna Bhimsen Joshi"),
    ("dev-kn-raghavendra-guru-stotra", "Raghavendra Guru Stotram", "Dr. Rajkumar", "Mantralaya Mahatme", "5:30", "devotional", "kannada", "Raghavendra Guru Stotram Dr Rajkumar"),
    ("dev-kn-tungatheera-virajita", "Tunga Teera Virajam", "P.B. Sreenivas", "Raghavendra Bhakthi", "4:42", "devotional", "kannada", "Tunga Teera Virajam PB Sreenivas"),
    ("dev-kn-nodu-nodu-kannara", "Nodu Nodu Kannara", "Dr. Rajkumar", "Devotional Hits", "4:55", "devotional", "kannada", "Nodu Nodu Kannara Dr Rajkumar"),
    ("dev-kn-jaya-janardhana-krishna", "Jaya Janardhana Krishna Radhika Pathe", "K.J. Yesudas", "Krishna Devotional", "5:10", "devotional", "kannada", "Jaya Janardhana Krishna Radhika Pathe Yesudas"),
    ("dev-kn-karuniso-ranga", "Karuniso Ranga Karuniso", "Bhimsen Joshi", "Purandara Dasa", "6:05", "devotional", "kannada", "Karuniso Ranga Karuniso Bhimsen Joshi"),

    # --- Telugu Annamayya & Bhakti Geethalu ---
    ("dev-te-brahmamokkate", "Brahmamokkate Parabrahmamokkate", "M.S. Subbulakshmi", "Annamacharya Keerthanalu", "4:50", "devotional", "telugu", "Brahmamokkate MS Subbulakshmi Annamayya"),
    ("dev-te-kondalalo-nelakonna", "Kondalalo Nelakonna Koneti Rayudu", "S.P. Balasubrahmanyam", "Annamayya", "4:35", "devotional", "telugu", "Kondalalo Nelakonna SP Balasubrahmanyam"),
    ("dev-te-nigama-nigamanta", "Nigama Nigamanta Varnita", "S.P. Balasubrahmanyam", "Annamayya", "4:20", "devotional", "telugu", "Nigama Nigamanta SPB Annamayya"),
    ("dev-te-adivo-alladivo", "Adivo Alladivo Sri Harivasamu", "S.P. Balasubrahmanyam", "Annamayya", "5:15", "devotional", "telugu", "Adivo Alladivo SP Balasubrahmanyam"),
    ("dev-te-muddugare-yashoda", "Muddugare Yashoda", "M.S. Subbulakshmi", "Annamayya Sankeerthanalu", "5:10", "devotional", "telugu", "Muddugare Yashoda MS Subbulakshmi"),
    ("dev-te-govinda-namalu", "Govinda Namalu (Srinivasa Govinda)", "S.P. Balasubrahmanyam", "Govinda Namalu", "7:30", "devotional", "telugu", "Govinda Namalu Srinivasa Govinda SPB"),
    ("dev-te-venkateswara-suprabhatam", "Sri Venkateswara Suprabhatam Full", "M.S. Subbulakshmi", "Tirupati Suprabhatam", "20:15", "devotional", "sanskrit", "Sri Venkateswara Suprabhatam MS Subbulakshmi"),
    ("dev-te-paluke-bangaramayena", "Paluke Bangaramayena Kodandapani", "M. Balamuralikrishna", "Bhakta Ramadasu", "5:45", "devotional", "telugu", "Paluke Bangaramayena Balamuralikrishna"),
    ("dev-te-telugu-hanuman-chalisa", "Hanuman Chalisa Telugu", "S.P. Balasubrahmanyam", "Hanuman Dandakam", "9:10", "devotional", "telugu", "Hanuman Chalisa Telugu SP Balasubrahmanyam"),
    ("dev-te-nagumomu-gana-leni", "Nagumomu Ganaleni", "M. Balamuralikrishna", "Thyagaraja Krithis", "6:20", "devotional", "telugu", "Nagumomu Ganaleni Balamuralikrishna"),
    ("dev-te-shiva-stuti-balasubrahmanyam", "Siva Siva Sankara Bhakthavashankara", "S.P. Balasubrahmanyam", "Shiva Bhakthi", "5:40", "devotional", "telugu", "Siva Siva Sankara SP Balasubrahmanyam"),
    ("dev-te-podagantimayya-purushottama", "Podagantimayya Purushottama", "S.P. Balasubrahmanyam", "Annamayya", "4:48", "devotional", "telugu", "Podagantimayya Purushottama SPB Annamayya"),

    # --- Punjabi Gurbani & Shabad Kirtan ---
    ("dev-pj-mool-mantar", "Mool Mantar (Ik Onkar Satnam)", "Bhai Harjinder Singh Sri Nagar Wale", "Gurbani Kirtan", "6:15", "devotional", "punjabi", "Mool Mantar Ik Onkar Bhai Harjinder Singh"),
    ("dev-pj-waheguru-simran", "Waheguru Simran Jaap", "Bhai Joginder Singh Riar", "Simran", "10:30", "devotional", "punjabi", "Waheguru Simran Bhai Joginder Singh Riar"),
    ("dev-pj-lakh-khushian", "Lakh Khushian Patshahian", "Bhai Harjinder Singh", "Shabad Gurbani", "7:20", "devotional", "punjabi", "Lakh Khushian Patshahian Bhai Harjinder Singh"),
    ("dev-pj-mittar-pyare-nu", "Mittar Pyare Nu Haal Mureedan Da", "Bhai Tarbalbir Singh", "Shabad", "6:45", "devotional", "punjabi", "Mittar Pyare Nu Bhai Tarbalbir Singh"),
    ("dev-pj-dhan-dhan-ramdas", "Dhan Dhan Ramdas Gur", "Bhai Gurpreet Singh", "Gurbani", "8:10", "devotional", "punjabi", "Dhan Dhan Ramdas Gur Gurbani"),
    ("dev-pj-satnam-waheguru", "Satnam Shri Waheguru Chanting", "Jagjit Singh", "Shabad Gurbani", "7:50", "devotional", "punjabi", "Satnam Shri Waheguru Jagjit Singh"),
    ("dev-pj-tu-mera-rakha", "Tu Mera Rakha Sabhni Thai", "Bhai Davinder Singh Sodhi", "Gurbani Shabad", "6:30", "devotional", "punjabi", "Tu Mera Rakha Bhai Davinder Singh Sodhi"),
    ("dev-pj-taati-vao-na-lagai", "Taati Vao Na Lagai", "Bhai Harjinder Singh", "Gurbani", "6:55", "devotional", "punjabi", "Taati Vao Na Lagai Bhai Harjinder Singh"),
    ("dev-pj-bisar-gayi-sab-taat", "Bisar Gayi Sabh Taat Parayi", "Bhai Satvinder Singh", "Shabad", "5:40", "devotional", "punjabi", "Bisar Gayi Sabh Taat Parayi"),

    # --- Gujarati, Marathi & Sufi / Devotional ---
    ("dev-gu-vaishnav-jan-to", "Vaishnav Jan To Tene Kahiye", "Sachin-Jigar, Sachin Sanghvi", "Mahatma Bhajans", "4:30", "devotional", "gujarati", "Vaishnav Jan To Tene Kahiye Sachin Jigar"),
    ("dev-gu-nagar-nand-ji-na-laal", "Nagar Nand Ji Na Laal", "Hemant Chauhan", "Prabhatiya", "5:45", "devotional", "gujarati", "Nagar Nand Ji Na Laal Hemant Chauhan"),
    ("dev-gu-shrinathji-sharanam-mamah", "Shrinathji Sharanam Mamah Dhun", "Hemant Chauhan", "Shrinathji Bhajans", "7:15", "devotional", "gujarati", "Shrinathji Sharanam Mamah Hemant Chauhan"),
    ("dev-mr-vitthal-vitthal", "Vitthal Vitthal Vitthala Hari Om Vitthala", "Suresh Wadkar", "Pandharpur Wari", "6:20", "devotional", "marathi", "Vitthal Vitthal Vitthala Suresh Wadkar"),
    ("dev-mr-majhe-maher-pandhari", "Majhe Maher Pandhari", "Pt. Bhimsen Joshi", "Abhang", "5:15", "devotional", "marathi", "Majhe Maher Pandhari Bhimsen Joshi"),
    ("dev-mr-roop-pahata-lochani", "Roop Pahata Lochani", "Pt. Sanjeev Abhyankar", "Sant Dnyaneshwar Abhang", "5:40", "devotional", "marathi", "Roop Pahata Lochani Sanjeev Abhyankar"),
    ("dev-mr-kanada-raja-pandharicha", "Kanada Raja Pandharicha", "Sudhir Phadke, Mahesh Kale", "Abhang", "6:05", "devotional", "marathi", "Kanada Raja Pandharicha Mahesh Kale"),
    ("dev-khwaja-mere-khwaja", "Khwaja Mere Khwaja", "A.R. Rahman", "Jodhaa Akbar", "6:56", "devotional", "hindi", "Khwaja Mere Khwaja AR Rahman Jodhaa Akbar"),
    ("dev-kun-faya-kun", "Kun Faya Kun", "A.R. Rahman, Mohit Chauhan, Javed Ali", "Rockstar", "7:50", "devotional", "hindi", "Kun Faya Kun AR Rahman Rockstar"),
    ("dev-arziyan-delhi6", "Arziyan", "Javed Ali, Kailash Kher, A.R. Rahman", "Delhi-6", "8:41", "devotional", "hindi", "Arziyan Delhi 6 Javed Ali Kailash Kher AR Rahman"),
    ("dev-bhar-do-jholi-meri", "Bhar Do Jholi Meri", "Adnan Sami", "Bajrangi Bhaijaan", "8:20", "devotional", "hindi", "Bhar Do Jholi Meri Adnan Sami Bajrangi Bhaijaan"),
    ("dev-itni-shakti-hamein-dena", "Itni Shakti Hamein Dena Data", "Pushpa Pagdhare, Sushma Shrestha", "Ankush", "4:42", "devotional", "hindi", "Itni Shakti Hamein Dena Data Ankush"),
    ("dev-sai-ram-sai-shyam", "Sai Ram Sai Shyam Sai Bhagwan", "Sadhana Sargam", "Sai Sandhya", "5:30", "devotional", "hindi", "Sai Ram Sai Shyam Sadhana Sargam"),
    ("dev-om-sai-namo-namah", "Om Sai Namo Namah 108 Times", "Suresh Wadkar", "Sai Dhun", "12:00", "devotional", "hindi", "Om Sai Namo Namah Suresh Wadkar"),
    ("dev-shree-krishna-sharanam-mamah", "Shree Krishna Sharanam Mamah Dhun", "Anuradha Paudwal", "Krishna Dhun", "6:40", "devotional", "hindi", "Shree Krishna Sharanam Mamah Anuradha Paudwal"),
]

print(f"Total Devotional Tracks prepared: {len(DEVOTIONAL_TRACKS)}")
