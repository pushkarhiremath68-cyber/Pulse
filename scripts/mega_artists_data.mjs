import fs from 'fs';

// Helper to construct a standard verified artist entry
export function createArtist({
  id,
  name,
  listeners,
  followers,
  rank,
  banner,
  avatar,
  bio,
  instagram,
  x,
  facebook,
  youtube,
  tourName,
  tourDates,
  topTracks
}) {
  const cleanHandle = (instagram || name).toLowerCase().replace(/[^a-z0-9]/g, '');
  return {
    name,
    monthlyListeners: listeners || '24,000,000',
    followersCount: followers || '18,500,000',
    worldRank: rank || '#5 Globally',
    banner: banner || avatar,
    avatar: avatar || banner,
    bio: bio || `${name} is an internationally acclaimed recording artist whose timeless hits and soul-stirring melodies have captivated millions of music lovers across the world.`,
    socials: {
      instagram: `https://www.instagram.com/${instagram || cleanHandle}/`,
      x: `https://x.com/${x || cleanHandle}`,
      facebook: `https://www.facebook.com/${facebook || cleanHandle}/`,
      youtube: `https://www.youtube.com/@${youtube || cleanHandle}`
    },
    tourInfo: {
      tourName: tourName || `${name} Live In Concert 2026`,
      status: "Tickets Live",
      dates: tourDates || "Mumbai, Delhi, Bengaluru, London, Dubai, New York",
      ticketUrl: "https://in.bookmyshow.com/explore/events"
    },
    topTracks: topTracks.map((t, idx) => ({
      id: t.id || `ytm-${t.ytId || Math.random().toString(36).substr(2, 8)}`,
      ytId: t.ytId || '',
      title: t.title,
      artist: t.artist || name,
      album: t.album || 'Master Release',
      coverUrl: t.coverUrl || banner,
      duration: t.duration || 215,
      plays: t.plays || `${(1200000000 - (idx * 95000000)).toLocaleString()}`
    }))
  };
}

console.log('mega_artists_data.mjs helper loaded');

