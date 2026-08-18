import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Full HTML template for all 10 catalog categories
full_catalog_rows_html = """        <!-- DYNAMIC MULTI-CATEGORY CATALOG CONTAINER (HORIZONTAL ROWS WITH SEE ALL) -->
        <div id="catalog-categories-container">
          
          <!-- ROW 1: RECOMMENDED / FOR YOU -->
          <section class="category-horizontal-row" id="category-row-recommended">
            <div class="category-row-header">
              <div class="category-row-title">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(232,121,249,0.15); border: 1px solid rgba(232,121,249,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #e879f9;">
                  <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div>
                  <h3>Songs You Will Love</h3>
                  <p>Curated picks tailored to your musical taste & mood</p>
                </div>
              </div>
              <button class="see-all-link" onclick="window.openGenreGridView('recommended')">
                <span>See All</span> <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
              </button>
            </div>
            <div class="category-row-scroll-wrap">
              <div class="music-card" onclick="window.playSpecificTrack('rec-1')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b2/c0/1d/b2c01d38-2798-1bce-e6f3-8d0959ca51dd/23UMGIM22528.rgb.jpg/600x600bb.jpg" alt="Starboy" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Starboy"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Starboy</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('The Weeknd')">The Weeknd, Daft Punk</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('rec-2')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg" alt="Kesariya" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Kesariya"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Kesariya</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Arijit Singh')">Arijit Singh, Pritam</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('rec-3')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/600x600bb.jpg" alt="Lover" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Lover"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Lover</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Diljit Dosanjh')">Diljit Dosanjh</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('rec-4')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/600x600bb.jpg" alt="Cruel Summer" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Cruel Summer"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Cruel Summer</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Taylor Swift')">Taylor Swift</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('rec-6')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/600x600bb.jpg" alt="Believer" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Believer"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Believer</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Imagine Dragons')">Imagine Dragons</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ROW 2: TOP 90S GOLDEN HITS -->
          <section class="category-horizontal-row" id="category-row-nineties">
            <div class="category-row-header">
              <div class="category-row-title">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #f59e0b;">
                  <i class="fa-solid fa-record-vinyl"></i>
                </div>
                <div>
                  <h3>Top 90s Golden Hits & Nostalgia</h3>
                  <p>Timeless 90s Bollywood classics & iconic international anthems</p>
                </div>
              </div>
              <button class="see-all-link" onclick="window.openGenreGridView('nineties')">
                <span>See All</span> <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
              </button>
            </div>
            <div class="category-row-scroll-wrap">
              <div class="music-card" onclick="window.playSpecificTrack('90s-1')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music62/v4/46/58/97/465897ed-fe10-e218-4cac-02c69ca36ad0/191773207717.jpg/600x600bb.jpg" alt="Tujhe Dekha Toh" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Tujhe Dekha Toh"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Tujhe Dekha Toh</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Kumar Sanu')">Kumar Sanu, Lata Mangeshkar</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('90s-2')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/95/fd/b9/95fdb9b2-6d2b-92a6-97f2-51c1a6d77f1a/00602527874609.rgb.jpg/600x600bb.jpg" alt="Smells Like Teen Spirit" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Smells Like Teen Spirit"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Smells Like Teen Spirit</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Nirvana')">Nirvana</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('90s-3')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/8e/f8/85/8ef88544-a6c7-018b-0a75-dc3b6b024fa0/cover.jpg/600x600bb.jpg" alt="Chaiyya Chaiyya" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Chaiyya Chaiyya"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Chaiyya Chaiyya</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Sukhwinder Singh')">Sukhwinder Singh, A.R. Rahman</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('90s-4')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5f/6b/e9/5f6be919-1b9e-30ef-45b7-cc27fc428fd5/012414167224.jpg/600x600bb.jpg" alt="I Want It That Way" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play I Want It That Way"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">I Want It That Way</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Backstreet Boys')">Backstreet Boys</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('90s-5')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/96/c9/3a/96c93aa7-1872-8297-493a-2fc72d540af0/191773221072.jpg/600x600bb.jpg" alt="Pehla Nasha" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Pehla Nasha"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Pehla Nasha</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Udit Narayan')">Udit Narayan, Sadhana Sargam</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('90s-6')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/04/92/e0/0492e08b-cbcc-9969-9ad6-8f5a0888068c/5051961007107.jpg/600x600bb.jpg" alt="Wonderwall" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Wonderwall"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Wonderwall</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Oasis')">Oasis</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ROW 3: TOP HOLLYWOOD BLOCKBUSTER HITS -->
          <section class="category-horizontal-row" id="category-row-hollywood">
            <div class="category-row-header">
              <div class="category-row-title">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #38bdf8;">
                  <i class="fa-solid fa-clapperboard"></i>
                </div>
                <div>
                  <h3>Top Hollywood Blockbuster Hits</h3>
                  <p>Legendary movie soundtracks, Billboard #1s & global pop anthems</p>
                </div>
              </div>
              <button class="see-all-link" onclick="window.openGenreGridView('hollywood')">
                <span>See All</span> <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
              </button>
            </div>
            <div class="category-row-scroll-wrap">
              <div class="music-card" onclick="window.playSpecificTrack('hwd-1')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e6/8a/68/e68a688e-129e-cb9d-938f-bc3ee37059ae/075679930910.jpg/600x600bb.jpg" alt="See You Again" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play See You Again"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">See You Again</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Wiz Khalifa')">Wiz Khalifa, Charlie Puth</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('hwd-2')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/30/2c/4b302cb6-7a14-5464-4e97-0577e9d0be49/18UMGIM82277.rgb.jpg/600x600bb.jpg" alt="Sunflower" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Sunflower"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Sunflower</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Post Malone')">Post Malone, Swae Lee</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('hwd-3')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b3/fe/cf/b3fecf76-0359-8e14-0651-4b101fc68a3f/886443673632.jpg/600x600bb.jpg" alt="Skyfall" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Skyfall"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Skyfall</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Adele')">Adele</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('hwd-4')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b1/9f/ef/b19fef51-79de-a940-e8ab-9e4e07b04d96/18UMGIM53752.rgb.jpg/600x600bb.jpg" alt="Shallow" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Shallow"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Shallow</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Lady Gaga')">Lady Gaga, Bradley Cooper</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('hwd-5')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/08/23/fc/0823fcd9-cb44-695b-32bf-b3bf51d9f800/00606949351229.rgb.jpg/600x600bb.jpg" alt="Lose Yourself" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Lose Yourself"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Lose Yourself</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Eminem')">Eminem</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('hwd-6')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/e7/ed/8a/e7ed8a2c-4835-e4dc-efec-5e81abd6c241/13DMGIM04438.rgb.jpg/600x600bb.jpg" alt="Let It Go" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Let It Go"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Let It Go</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Idina Menzel')">Idina Menzel</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ROW 4: BOLLYWOOD EVERGREEN HITS -->
          <section class="category-horizontal-row" id="category-row-bollywood_evergreen">
            <div class="category-row-header">
              <div class="category-row-title">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(236,72,153,0.15); border: 1px solid rgba(236,72,153,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #ec4899;">
                  <i class="fa-solid fa-compact-disc"></i>
                </div>
                <div>
                  <h3>Bollywood Evergreen & Modern Hits</h3>
                  <p>Soulful melodies, romantic chartbusters & cinematic blockbusters</p>
                </div>
              </div>
              <button class="see-all-link" onclick="window.openGenreGridView('bollywood_evergreen')">
                <span>See All</span> <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
              </button>
            </div>
            <div class="category-row-scroll-wrap">
              <div class="music-card" onclick="window.playSpecificTrack('bolly-1')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg" alt="Kesariya" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Kesariya"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Kesariya</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Arijit Singh')">Arijit Singh, Pritam</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('bolly-2')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/2e/0b/c0/2e0bc070-112f-a827-6ad8-6bc64f7caaff/840214460180.png/600x600bb.jpg" alt="Apna Bana Le" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Apna Bana Le"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Apna Bana Le</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Arijit Singh')">Arijit Singh, Sachin-Jigar</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('bolly-3')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3d/c7/43/3dc74387-e7f4-2342-397c-4cf2037c69a5/8902894623223_cover.jpg/600x600bb.jpg" alt="Tum Se Hi" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Tum Se Hi"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Tum Se Hi</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Mohit Chauhan')">Mohit Chauhan, Pritam</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('bolly-4')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/1e/ff/32/1eff3216-190d-6fd9-8f68-acbba846e6ee/8903431956026_cover.jpg/600x600bb.jpg" alt="Chaleya" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Chaleya"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Chaleya</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Arijit Singh')">Arijit Singh, Anirudh</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('bolly-5')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/fb/82/da/fb82dab1-d0cd-714c-000c-6450774fd5d4/888880945587.jpg/600x600bb.jpg" alt="Kal Ho Naa Ho" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Kal Ho Naa Ho"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Kal Ho Naa Ho</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Sonu Nigam')">Sonu Nigam</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('bolly-6')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/600x600bb.jpg" alt="Tum Hi Ho" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Tum Hi Ho"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Tum Hi Ho</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Arijit Singh')">Arijit Singh, Mithoon</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ROW 5: PUNJABI CHARTBUSTERS -->
          <section class="category-horizontal-row" id="category-row-punjabi_chartbusters">
            <div class="category-row-header">
              <div class="category-row-title">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(234,179,8,0.15); border: 1px solid rgba(234,179,8,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #eab308;">
                  <i class="fa-solid fa-guitar"></i>
                </div>
                <div>
                  <h3>Punjabi Chartbusters & Desi Swag</h3>
                  <p>High-voltage Punjabi bangers, hip-hop & modern folk</p>
                </div>
              </div>
              <button class="see-all-link" onclick="window.openGenreGridView('punjabi_chartbusters')">
                <span>See All</span> <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
              </button>
            </div>
            <div class="category-row-scroll-wrap">
              <div class="music-card" onclick="window.playSpecificTrack('punj-1')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f0/8c/2a/f08c2aeb-3903-8738-d0a5-8c2e4547eed7/5054197711039.jpg/600x600bb.jpg" alt="Heeriye" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Heeriye"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Heeriye</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Jasleen Royal')">Jasleen Royal, Arijit Singh</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('punj-2')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d3/08/bc/d308bc6a-20e1-6532-d933-35d1b429210e/5054197755538.jpg/600x600bb.jpg" alt="Softly" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Softly"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Softly</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Karan Aujla')">Karan Aujla, Ikky</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('punj-3')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c2/ce/a0/c2cea088-dbde-43db-346f-e536058fdcfb/5063483978438_cover.jpg/600x600bb.jpg" alt="Wavy" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Wavy"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Wavy</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Karan Aujla')">Karan Aujla</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('punj-4')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/47/47/ac/4747ac85-1658-64ae-bc82-220a4d6213d5/859747478890_cover.jpg/600x600bb.jpg" alt="Excuses" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Excuses"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Excuses</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('AP Dhillon')">AP Dhillon, Gurinder Gill</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('punj-5')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/16/d6/94/16d6949f-6072-0b42-f88b-a61ffb129952/859747110851_cover.jpg/600x600bb.jpg" alt="Brown Munde" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Brown Munde"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Brown Munde</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('AP Dhillon')">AP Dhillon, Gurinder Gill</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('punj-6')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/97/69/58/976958ae-725e-bd41-6755-f0921c697840/810063889609_cover.jpg/600x600bb.jpg" alt="295" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play 295"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">295</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Sidhu Moose Wala')">Sidhu Moose Wala</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ROW 6: TRENDING WORLDWIDE -->
          <section class="category-horizontal-row" id="category-row-trending">
            <div class="category-row-header">
              <div class="category-row-title">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #f97316;">
                  <i class="fa-solid fa-fire"></i>
                </div>
                <div>
                  <h3>Trending Worldwide</h3>
                  <p>Top global chartbusters and viral discoveries</p>
                </div>
              </div>
              <button class="see-all-link" onclick="window.openGenreGridView('trending')">
                <span>See All</span> <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
              </button>
            </div>
            <div class="category-row-scroll-wrap">
              <div class="music-card" onclick="window.playSpecificTrack('trend-1')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6f/bc/e6/6fbce6c4-c38c-72d8-4fd0-66cfff32f679/20UMGIM12176.rgb.jpg/600x600bb.jpg" alt="Blinding Lights" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Blinding Lights"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Blinding Lights</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('The Weeknd')">The Weeknd</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('trend-2')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg" alt="Shape of You" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Shape of You"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Shape of You</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Ed Sheeran')">Ed Sheeran</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('trend-3')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b9/a2/21/b9a22143-6c7b-7bcf-4f9e-64d88e0b6d21/886449987979.jpg/600x600bb.jpg" alt="As It Was" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play As It Was"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">As It Was</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Harry Styles')">Harry Styles</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('trend-4')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/d9/b4/05/d9b405f6-c567-27b4-18ae-8b277c08b0aa/886449439249.jpg/600x600bb.jpg" alt="Stay" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Stay"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Stay</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('The Kid LAROI')">The Kid LAROI, Justin Bieber</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ROW 7: ENGLISH & INTERNATIONAL POP -->
          <section class="category-horizontal-row" id="category-row-pop">
            <div class="category-row-header">
              <div class="category-row-title">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #3b82f6;">
                  <i class="fa-solid fa-earth-americas"></i>
                </div>
                <div>
                  <h3>English & International Pop</h3>
                  <p>Billboard hits, catchy hooks & chart-topping pop anthems</p>
                </div>
              </div>
              <button class="see-all-link" onclick="window.openGenreGridView('pop')">
                <span>See All</span> <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
              </button>
            </div>
            <div class="category-row-scroll-wrap">
              <div class="music-card" onclick="window.playSpecificTrack('pop-1')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/aa/63/cc/aa63cc8d-6e84-e435-0810-74567cf17b9b/19UMGIM53909.rgb.jpg/600x600bb.jpg" alt="Cruel Summer" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Cruel Summer"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Cruel Summer</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Taylor Swift')">Taylor Swift</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('pop-2')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/97/81/b1/9781b16e-a342-a89e-26f5-08f30743b593/190295328900.jpg/600x600bb.jpg" alt="Watermelon Sugar" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Watermelon Sugar"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Watermelon Sugar</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Harry Styles')">Harry Styles</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('pop-3')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/80/7e/66/807e66ef-c7db-0ca3-e29f-f77366395b28/00602577903823.rgb.jpg/600x600bb.jpg" alt="Someone You Loved" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Someone You Loved"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Someone You Loved</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Lewis Capaldi')">Lewis Capaldi</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('pop-4')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/aa/5b/4b/aa5b4b1a-e88a-d9df-c5e3-caae314c46f3/190295851286.jpg/600x600bb.jpg" alt="Perfect" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Perfect"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Perfect</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Ed Sheeran')">Ed Sheeran</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ROW 8: EDM & ELECTRONIC -->
          <section class="category-horizontal-row" id="category-row-electronic">
            <div class="category-row-header">
              <div class="category-row-title">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #a855f7;">
                  <i class="fa-solid fa-bolt-lightning"></i>
                </div>
                <div>
                  <h3>EDM & Electronic Heat</h3>
                  <p>High-energy club bangers, house, synthwave & dance</p>
                </div>
              </div>
              <button class="see-all-link" onclick="window.openGenreGridView('electronic')">
                <span>See All</span> <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
              </button>
            </div>
            <div class="category-row-scroll-wrap">
              <div class="music-card" onclick="window.playSpecificTrack('edm-1')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4b/b1/74/4bb17482-ebc6-be7f-775a-73d88198f121/886445592818.jpg/600x600bb.jpg" alt="Faded" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Faded"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Faded</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Alan Walker')">Alan Walker</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('edm-3')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/f8/38/41f8380b-9b56-d5d4-31f7-a6411c0c9aaa/886446102054.jpg/600x600bb.jpg" alt="Closer" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Closer"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Closer</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('The Chainsmokers')">The Chainsmokers, Halsey</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('edm-2')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b2/c0/1d/b2c01d38-2798-1bce-e6f3-8d0959ca51dd/23UMGIM22528.rgb.jpg/600x600bb.jpg" alt="Starboy" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Starboy"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Starboy</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('The Weeknd')">The Weeknd, Daft Punk</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ROW 9: ROCK & ALTERNATIVE -->
          <section class="category-horizontal-row" id="category-row-rock">
            <div class="category-row-header">
              <div class="category-row-title">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #ef4444;">
                  <i class="fa-solid fa-guitar"></i>
                </div>
                <div>
                  <h3>Rock & Alternative Anthems</h3>
                  <p>Stadium rock, alternative riffs & legendary guitar power</p>
                </div>
              </div>
              <button class="see-all-link" onclick="window.openGenreGridView('rock')">
                <span>See All</span> <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
              </button>
            </div>
            <div class="category-row-scroll-wrap">
              <div class="music-card" onclick="window.playSpecificTrack('rock-1')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/600x600bb.jpg" alt="Believer" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Believer"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Believer</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Imagine Dragons')">Imagine Dragons</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('rock-2')">
                <div class="card-image-wrapper">
                  <img src="https://c.saavncdn.com/210/Night-Visions-2013-500x500.jpg" alt="Radioactive" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Radioactive"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Radioactive</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Imagine Dragons')">Imagine Dragons</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('rock-3')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/1f/fa/09/1ffa092f-f52f-4a66-7d10-4cc5982dc747/12UMGIM46901.rgb.jpg/600x600bb.jpg" alt="Demons" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Demons"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Demons</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Imagine Dragons')">Imagine Dragons</span>
                </div>
              </div>
              <div class="music-card" onclick="window.playSpecificTrack('rock-4')">
                <div class="card-image-wrapper">
                  <img src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/76/77/08/767708a7-ec93-3b3d-3bac-40086e5a265c/21UM1IM29634.rgb.jpg/600x600bb.jpg" alt="Bones" loading="lazy">
                  <div class="card-play-overlay">
                    <button class="btn-card-play" title="Play Bones"><i class="fa-solid fa-play"></i></button>
                  </div>
                </div>
                <div class="card-info">
                  <span class="card-title">Bones</span>
                  <span class="card-artist artist-clickable-link" onclick="event.stopPropagation(); window.openArtistProfile('Imagine Dragons')">Imagine Dragons</span>
                </div>
              </div>
            </div>
          </section>

        </div>
"""

html = re.sub(
    r'<!-- DYNAMIC MULTI-CATEGORY CATALOG CONTAINER[\s\S]*?</div>\s*</div>\s*<!-- VIEW 2: SEARCH',
    full_catalog_rows_html.strip() + '\n      </div>\n\n      <!-- VIEW 2: SEARCH',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("[OK] Populated all catalog category rows on the main home page in index.html")
