import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    main_code = f.read()
with open('src/catalogService.js', 'r', encoding='utf-8') as f:
    catalog_code = f.read()
with open('src/playbarController.js', 'r', encoding='utf-8') as f:
    playbar_code = f.read()
with open('src/lyricsService.js', 'r', encoding='utf-8') as f:
    lyrics_code = f.read()
with open('src/firebaseClient.js', 'r', encoding='utf-8') as f:
    firebase_code = f.read()

combined = main_code + '\n' + catalog_code + '\n' + playbar_code + '\n' + lyrics_code + '\n' + firebase_code

functions_to_check = [
    'backToPhoneInput', 'closeAddToPlaylistModal', 'closeArtistModal',
    'closeCreatePlaylistModal', 'closeCreditsModal', 'closeDownloadModal',
    'closeGooglePickerModal', 'closeLyricsModal', 'closeUploadAudioModal',
    'copyPrimaryChecksum', 'deleteCurrentPlaylist', 'downloadPlatformApp',
    'downloadSong', 'executeAudioUpload', 'goBackOrHome',
    'handleGoogleOAuthLogin', 'handleSendPhoneOtp', 'handleVerifyPhoneOtp',
    'lockAdminStudio', 'logout', 'openArtistProfile',
    'openCreatePlaylistModal', 'openDownloadModal', 'openForgotPasswordModal',
    'openFullscreenPlayerWithLyrics', 'openGenreGridView', 'openLoginModal',
    'openLyricsForTrack', 'openSignupModal', 'playArtistTopTracks',
    'playCurrentArtistTracks', 'playGenreTracks', 'playLyricsModalTrack',
    'playSpecificTrack', 'publishAdminTrack', 'selectCatalogCategory',
    'submitGoogleCustomAccount', 'switchAuthTab', 'switchView',
    'toggleFollowCurrentArtist', 'toggleGoogleCustomForm',
    'togglePasswordVisibility', 'unlockAdminStudio', 'handleRealLogin',
    'handleRealSignup'
]

missing = [fn for fn in functions_to_check if not re.search(rf'window\.{fn}\s*=', combined)]
print(f'MISSING FUNCTIONS ({len(missing)}):')
for m in missing:
    print(f'  - {m}')
