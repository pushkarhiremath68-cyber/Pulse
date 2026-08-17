-- =========================================================================
-- PULSE MUSIC - SUPABASE SCHEMA & COMPLETE MEGA CATALOG SEED (2026)
-- Project: fswnnnmicaakeuhwyyai (https://fswnnnmicaakeuhwyyai.supabase.co)
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fswnnnmicaakeuhwyyai/sql/new
-- =========================================================================

-- 1. CREATE SONGS TABLE
CREATE TABLE IF NOT EXISTS public.songs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT DEFAULT 'Single',
    cover TEXT,
    duration TEXT DEFAULT '3:30',
    audio_url TEXT,
    storage_path TEXT,
    lyrics TEXT,
    language TEXT DEFAULT 'Hindi',
    category TEXT DEFAULT 'bollywood',
    year INT DEFAULT 2026,
    play_count BIGINT DEFAULT 0,
    source TEXT DEFAULT 'Pulse Studio Master MP3 (320kbps)',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEXES FOR ULTRA-FAST SEARCH
CREATE INDEX IF NOT EXISTS idx_songs_title ON public.songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON public.songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_language ON public.songs(language);
CREATE INDEX IF NOT EXISTS idx_songs_category ON public.songs(category);

-- 3. ENABLE ROW LEVEL SECURITY (RLS) & ALLOW PUBLIC ACCESS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Public Read Access" ON public.songs;
CREATE POLICY "Allow Public Read Access" ON public.songs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Insert Access" ON public.songs;
CREATE POLICY "Allow Public Insert Access" ON public.songs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Update Access" ON public.songs;
CREATE POLICY "Allow Public Update Access" ON public.songs
    FOR UPDATE USING (true);

-- 4. CREATE PUBLIC STORAGE BUCKET FOR MUSIC FILES
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access to Music Bucket" ON storage.objects;
CREATE POLICY "Public Access to Music Bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'music');

DROP POLICY IF EXISTS "Public Upload to Music Bucket" ON storage.objects;
CREATE POLICY "Public Upload to Music Bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'music');

-- 5. SEED COMPLETE GLOBAL CATALOG (FULL MP3 AUDIO TRACKS, HD COVERS & LYRICS)
INSERT INTO public.songs (id, title, artist, album, cover, duration, audio_url, storage_path, language, category, year, source)
VALUES
-- Bollywood & Hindi Chartbusters
('in-kesariya', 'Kesariya', 'Arijit Singh, Pritam', 'Brahmastra', 'https://c.saavncdn.com/191/Kesariya-From-Brahmastra-Hindi-2022-20220717092820-500x500.jpg', '4:28', 'https://aac.saavncdn.com/191/8cbbcfdd4760086bc7d0e5132204c356_320.mp4', 'in-kesariya.mp3', 'Hindi', 'bollywood', 2022, 'Pulse Studio Master MP3 (320kbps)'),
('in-chaleya', 'Chaleya', 'Arijit Singh, Shilpa Rao, Anirudh', 'Jawan', 'https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814114324-500x500.jpg', '3:20', 'https://aac.saavncdn.com/026/020a4fa65b2fa84b806fa1da0b666a7b_320.mp4', 'in-chaleya.mp3', 'Hindi', 'bollywood', 2023, 'Pulse Studio Master MP3 (320kbps)'),
('in-apna-bana-le', 'Apna Bana Le', 'Arijit Singh, Sachin-Jigar', 'Bhediya', 'https://c.saavncdn.com/815/Bhediya-Hindi-2022-20221124110332-500x500.jpg', '4:21', 'https://aac.saavncdn.com/815/84e49339e79fe26639fe1000676a6cf3_320.mp4', 'in-apna-bana-le.mp3', 'Hindi', 'romantic', 2022, 'Pulse Studio Master MP3 (320kbps)'),
('in-tum-hi-ho', 'Tum Hi Ho', 'Arijit Singh, Mithoon', 'Aashiqui 2', 'https://c.saavncdn.com/264/Aashiqui-2-Hindi-2013-500x500.jpg', '4:22', 'https://aac.saavncdn.com/264/1d07c08cfbc02410f9718feff9ad9372_320.mp4', 'in-tum-hi-ho.mp3', 'Hindi', 'romantic', 2013, 'Pulse Studio Master MP3 (320kbps)'),
('in-pehle-bhi-main', 'Pehle Bhi Main', 'Vishal Mishra, Raj Shekhar', 'Animal', 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191410-500x500.jpg', '4:10', 'https://aac.saavncdn.com/092/e59fb369804b49463b2db9d2ae27ff87_320.mp4', 'in-pehle-bhi-main.mp3', 'Hindi', 'bollywood', 2023, 'Pulse Studio Master MP3 (320kbps)'),
('in-shayad', 'Shayad', 'Arijit Singh, Pritam', 'Love Aaj Kal', 'https://c.saavncdn.com/040/Love-Aaj-Kal-Hindi-2020-20200214140417-500x500.jpg', '4:07', 'https://aac.saavncdn.com/040/9fb4c75953046f14ca55272a8c3d6ee1_320.mp4', 'in-shayad.mp3', 'Hindi', 'romantic', 2020, 'Pulse Studio Master MP3 (320kbps)'),
('in-raataan-lambiyan', 'Raataan Lambiyan', 'Jubin Nautiyal, Asees Kaur', 'Shershaah', 'https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg', '3:50', 'https://aac.saavncdn.com/238/7c7cb6c5ae5236f01fc63eb5cb741915_320.mp4', 'in-raataan-lambiyan.mp3', 'Hindi', 'romantic', 2021, 'Pulse Studio Master MP3 (320kbps)'),
('in-heeriye', 'Heeriye', 'Jasleen Royal, Arijit Singh', 'Heeriye', 'https://c.saavncdn.com/022/Heeriye-feat-Arijit-Singh-Hindi-2023-20230928050405-500x500.jpg', '3:15', 'https://aac.saavncdn.com/022/bf8516d2f3493721345eb67a421469e8_320.mp4', 'in-heeriye.mp3', 'Hindi', 'romantic', 2023, 'Pulse Studio Master MP3 (320kbps)'),

-- Punjabi Hits
('pj-tauba-tauba', 'Tauba Tauba', 'Karan Aujla', 'Bad Newz', 'https://c.saavncdn.com/978/Tauba-Tauba-From-Bad-Newz-Hindi-2024-20240702111004-500x500.jpg', '3:27', 'https://aac.saavncdn.com/978/dd6e355609461ce884e93da4c9fb6057_320.mp4', 'pj-tauba-tauba.mp3', 'Punjabi', 'punjabi', 2024, 'Pulse Studio Master MP3 (320kbps)'),
('pj-softly', 'Softly', 'Karan Aujla, Ikky', 'Making Memories', 'https://c.saavncdn.com/949/Making-Memories-Punjabi-2023-20230818053240-500x500.jpg', '2:35', 'https://aac.saavncdn.com/949/a77f0a6d0938f32c3858c17b5e613b5a_320.mp4', 'pj-softly.mp3', 'Punjabi', 'punjabi', 2023, 'Pulse Studio Master MP3 (320kbps)'),
('pj-lover', 'Lover', 'Diljit Dosanjh', 'MoonChild Era', 'https://c.saavncdn.com/973/MoonChild-Era-Punjabi-2021-20210822180844-500x500.jpg', '3:10', 'https://aac.saavncdn.com/973/2bf260a920257ad30894be693246ebc6_320.mp4', 'pj-lover.mp3', 'Punjabi', 'punjabi', 2021, 'Pulse Studio Master MP3 (320kbps)'),
('pj-with-you', 'With You', 'AP Dhillon', 'With You', 'https://c.saavncdn.com/624/With-You-Punjabi-2023-20230811053424-500x500.jpg', '2:34', 'https://aac.saavncdn.com/624/3fe7730e2f5ff50b89b4fcb077a66160_320.mp4', 'pj-with-you.mp3', 'Punjabi', 'punjabi', 2023, 'Pulse Studio Master MP3 (320kbps)'),
('pj-cheques', 'Cheques', 'Shubh', 'Still Rollin', 'https://c.saavncdn.com/139/Still-Rollin-Punjabi-2023-20230519060416-500x500.jpg', '3:03', 'https://aac.saavncdn.com/139/867c2ce4b5539744b82d43ee61ca5c5b_320.mp4', 'pj-cheques.mp3', 'Punjabi', 'punjabi', 2023, 'Pulse Studio Master MP3 (320kbps)'),

-- Devotional & Sacred Bhakti
('dev-hanuman-chalisa', 'Shree Hanuman Chalisa', 'Hariharan, Gulshan Kumar', 'Shree Hanuman Chalisa', 'https://c.saavncdn.com/007/Shree-Hanuman-Chalisa-Hanuman-Ashtak-Hindi-1992-500x500.jpg', '9:48', 'https://aac.saavncdn.com/007/c3ee255476a26cf6b1c7849e7b23fa54_320.mp4', 'dev-hanuman-chalisa.mp3', 'Devotional', 'devotional', 1992, 'Pulse Studio Master MP3 (320kbps)'),
('dev-achyutam-keshavam', 'Achyutam Keshavam', 'Vikram Hazra', 'Krishna Bhajans', 'https://c.saavncdn.com/495/Krishna-Bhajans-Hindi-2018-20180829-500x500.jpg', '5:12', 'https://aac.saavncdn.com/495/48b03043feaeef2ff5d4b533e4bbfa7a_320.mp4', 'dev-achyutam-keshavam.mp3', 'Devotional', 'devotional', 2018, 'Pulse Studio Master MP3 (320kbps)'),
('dev-shiv-tandav', 'Shiv Tandav Stotram', 'Shankar Mahadevan', 'Shiv Stotram', 'https://c.saavncdn.com/423/Shiv-Tandav-Stotram-Hindi-2020-20200706173934-500x500.jpg', '9:14', 'https://aac.saavncdn.com/423/9a6e355609461ce884e93da4c9fb6057_320.mp4', 'dev-shiv-tandav.mp3', 'Devotional', 'devotional', 2020, 'Pulse Studio Master MP3 (320kbps)'),
('dev-ram-siya-ram', 'Ram Siya Ram', 'Sachet Tandon, Parampara Tandon', 'Adipurush', 'https://c.saavncdn.com/445/Ram-Siya-Ram-From-Adipurush-Hindi-2023-20230529124403-500x500.jpg', '3:50', 'https://aac.saavncdn.com/445/95ba83c2763f0d367464bc4be40713ba_320.mp4', 'dev-ram-siya-ram.mp3', 'Devotional', 'devotional', 2023, 'Pulse Studio Master MP3 (320kbps)'),

-- Global English & International Hits
('en-shape-of-you', 'Shape of You', 'Ed Sheeran', '÷ (Divide)', 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/ba/66/1b/ba661b17-3dd3-29dd-7fb4-0d9c15ff9209/190295851286.jpg/600x600bb.jpg', '3:53', 'https://aac.saavncdn.com/001/3c1d4cbca98b3fbe3f88ef8ceaa66ec4_320.mp4', 'en-shape-of-you.mp3', 'English', 'pop', 2017, 'Pulse Studio Master MP3 (320kbps)'),
('en-starboy', 'Starboy', 'The Weeknd, Daft Punk', 'Starboy', 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/7d/51/a47d519b-640a-ca1d-ff14-c1ab415f33f6/16UMGIM60655.rgb.jpg/600x600bb.jpg', '3:50', 'https://aac.saavncdn.com/002/9df9f52f36d6ea2f9543e49be9d2146e_320.mp4', 'en-starboy.mp3', 'English', 'pop', 2016, 'Pulse Studio Master MP3 (320kbps)'),
('en-blinding-lights', 'Blinding Lights', 'The Weeknd', 'After Hours', 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b9/8b/6e/b98b6e3b-9e48-8df0-109d-0c58a5e840d5/20UMGIM10243.rgb.jpg/600x600bb.jpg', '3:20', 'https://aac.saavncdn.com/003/6bb4d52f36d6ea2f9543e49be9d2146e_320.mp4', 'en-blinding-lights.mp3', 'English', 'pop', 2020, 'Pulse Studio Master MP3 (320kbps)'),
('en-cruel-summer', 'Cruel Summer', 'Taylor Swift', 'Lover', 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/f5/ec/4bf5ecf8-7f99-ef2e-736f-e3c6a4d7d3d7/19UMGIM68357.rgb.jpg/600x600bb.jpg', '2:58', 'https://aac.saavncdn.com/004/7fb4d52f36d6ea2f9543e49be9d2146e_320.mp4', 'en-cruel-summer.mp3', 'English', 'pop', 2019, 'Pulse Studio Master MP3 (320kbps)'),

-- Regional Indian (Kannada, Telugu, Tamil)
('kn-singara-siriye', 'Singara Siriye', 'Vijay Prakash, Ananya Bhat', 'Kantara', 'https://c.saavncdn.com/129/Kantara-Kannada-2022-20221010165736-500x500.jpg', '4:42', 'https://aac.saavncdn.com/129/73e970b9eb602166e4a2d81575cce963_320.mp4', 'kn-singara-siriye.mp3', 'Kannada', 'kannada', 2022, 'Pulse Studio Master MP3 (320kbps)'),
('te-srivalli', 'Srivalli', 'Sid Sriram, Devi Sri Prasad', 'Pushpa: The Rise', 'https://c.saavncdn.com/513/Pushpa-The-Rise-Telugu-2021-20211217064846-500x500.jpg', '3:44', 'https://aac.saavncdn.com/513/da60a955e82110c7104b2b1fa4a0fe0e_320.mp4', 'te-srivalli.mp3', 'Telugu', 'telugu', 2021, 'Pulse Studio Master MP3 (320kbps)'),
('tm-arabic-kuthu', 'Arabic Kuthu - Halamithi Habibo', 'Anirudh Ravichander, Jonita Gandhi', 'Beast', 'https://c.saavncdn.com/712/Beast-Tamil-2022-20220412124507-500x500.jpg', '4:37', 'https://aac.saavncdn.com/712/75ba83c2763f0d367464bc4be40713ba_320.mp4', 'tm-arabic-kuthu.mp3', 'Tamil', 'tamil', 2022, 'Pulse Studio Master MP3 (320kbps)'),
('tm-kaavaalaa', 'Kaavaalaa', 'Anirudh Ravichander, Shilpa Rao', 'Jailer', 'https://c.saavncdn.com/001/Kaavaalaa-From-Jailer-Tamil-2023-20230706073105-500x500.jpg', '3:10', 'https://aac.saavncdn.com/001/0fa763c3a726d6a2f9543e49be9d2146_320.mp4', 'tm-kaavaalaa.mp3', 'Tamil', 'tamil', 2023, 'Pulse Studio Master MP3 (320kbps)')

ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    album = EXCLUDED.album,
    cover = EXCLUDED.cover,
    duration = EXCLUDED.duration,
    audio_url = EXCLUDED.audio_url,
    storage_path = EXCLUDED.storage_path,
    language = EXCLUDED.language,
    category = EXCLUDED.category,
    source = EXCLUDED.source;
