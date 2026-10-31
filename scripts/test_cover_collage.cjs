async function testCollage() {
  const mod = await import('../src/catalogService.js');
  
  function getPlaylistCoverHtml(playlist, isBanner = false) {
    if (!playlist) return '';
    let covers = [];
    
    if (playlist.tracks && playlist.tracks.length >= 4) {
      covers = playlist.tracks.slice(0, 4).map(t => 
        t.coverUrl || t.cover || (t.ytId ? `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg` : '')
      ).filter(Boolean);
    } else if (playlist.coverUrl || playlist.cover) {
      covers = [playlist.coverUrl || playlist.cover];
    } else if (playlist.tracks && playlist.tracks.length > 0) {
      const t = playlist.tracks[0];
      covers = [t.coverUrl || t.cover || (t.ytId ? `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg` : '')];
    } else {
      covers = [''];
    }

    covers = covers.filter(Boolean);

    if (covers.length >= 4) {
      return `4-COLLAGE: [${covers.join(', ')}]`;
    } else if (covers.length > 0) {
      return `SINGLE-COVER: ${covers[0]}`;
    } else {
      return `GRADIENT`;
    }
  }

  console.log('--- CURATED PLAYLISTS ---');
  mod.getCuratedPlaylists().forEach(p => {
    console.log(p.title + ' -> ' + getPlaylistCoverHtml(p).slice(0, 30));
  });

  console.log('--- MOVIE PLAYLISTS ---');
  mod.getMoviePlaylists().forEach(p => {
    console.log(p.title + ' -> ' + getPlaylistCoverHtml(p).slice(0, 30));
  });

  console.log('--- VIBE PLAYLISTS ---');
  mod.getVibePlaylists().forEach(p => {
    console.log(p.title + ' -> ' + getPlaylistCoverHtml(p).slice(0, 30));
  });
}
testCollage();

