import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem < 10 ? '0' : ''}${rem}`;
}

export default function BottomPlaybar() {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    isFullscreen,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    setScrubbing,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setFullscreen
  } = usePlayer();

  const [dragProgress, setDragProgress] = useState(null);

  if (!currentTrack) return null;

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayPercent = dragProgress !== null ? dragProgress : currentPercent;
  const displayTime = dragProgress !== null ? (dragProgress / 100) * duration : currentTime;

  // Scrubber Drag Handlers (Prevents Audio Stutter & UI Jitter)
  const handleSeekStart = () => {
    setScrubbing(true);
  };

  const handleSeekChange = (e) => {
    setDragProgress(parseFloat(e.target.value));
  };

  const handleSeekEnd = (e) => {
    const val = parseFloat(e.target.value);
    setScrubbing(false);
    setDragProgress(null);
    if (duration > 0) {
      seek((val / 100) * duration);
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MINI BOTTOM PLAYBAR                                                    */}
      {/* ========================================================================= */}
      <footer className="bottom-player-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        {/* Thin top playback progress line at very top edge */}
        <div
          className="mini-top-progress-bar"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              width: `${displayPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6)',
              transition: dragProgress !== null ? 'none' : 'width 0.15s linear'
            }}
          />
        </div>

        {/* LEFT: Cover & Track Info (Click to Expand Fullscreen) */}
        <div className="player-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setFullscreen(true)}>
          <div className="player-thumb-wrapper" style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src={currentTrack.cover || './pulse-logo.png'} alt={currentTrack.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="player-track-info" style={{ overflow: 'hidden' }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.title || 'Untitled Track'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.artist || 'Pulse Artist'}
            </p>
          </div>
        </div>

        {/* CENTER: Main Controls & Scrubber Timeline */}
        <div className="player-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <div className="player-buttons" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <button className={`btn-player-control ${isShuffle ? 'active' : ''}`} onClick={toggleShuffle} title="Shuffle">
              <i className="fa-solid fa-shuffle" style={{ color: isShuffle ? '#a855f7' : '' }} />
            </button>
            <button className="btn-player-control" onClick={() => seek(Math.max(0, currentTime - 5))} title="Rewind 5s">
              <i className="fa-solid fa-rotate-left" />
            </button>
            <button className="btn-player-control" onClick={playPrev} title="Previous">
              <i className="fa-solid fa-backward-step" />
            </button>
            <button className="btn-player-main" onClick={togglePlayPause} title="Play/Pause" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isBuffering ? (
                <i className="fa-solid fa-circle-notch fa-spin" />
              ) : isPlaying ? (
                <i className="fa-solid fa-pause" />
              ) : (
                <i className="fa-solid fa-play" />
              )}
            </button>
            <button className="btn-player-control" onClick={playNext} title="Next">
              <i className="fa-solid fa-forward-step" />
            </button>
            <button className="btn-player-control" onClick={() => seek(Math.min(duration, currentTime + 5))} title="Forward 5s">
              <i className="fa-solid fa-rotate-right" />
            </button>
            <button className={`btn-player-control ${isRepeat ? 'active' : ''}`} onClick={toggleRepeat} title="Repeat">
              <i className="fa-solid fa-repeat" style={{ color: isRepeat ? (isRepeat === 'one' ? '#4ade80' : '#a855f7') : '' }} />
            </button>
          </div>

          {/* Scrubber Timeline */}
          <div className="timeline-container" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', fontSize: '0.75rem', color: '#888' }}>
            <span>{formatTime(displayTime)}</span>
            <div className="progress-bar-wrapper" style={{ flex: 1, position: 'relative', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px' }}>
              <div className="progress-bar-fill" style={{ width: `${displayPercent}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', borderRadius: '999px' }} />
              <input
                type="range"
                className="timeline-range-input"
                min="0"
                max="100"
                step="0.1"
                value={displayPercent}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onChange={handleSeekChange}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', margin: 0 }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT: Volume & Expand Fullscreen */}
        <div className="player-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
          <div className="volume-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '110px' }}>
            <button className="btn-player-icon" onClick={toggleMute} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
              <i className={isMuted || volume === 0 ? 'fa-solid fa-volume-xmark' : volume < 0.5 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high'} />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: '70px', accentColor: '#a855f7', cursor: 'pointer' }}
            />
          </div>
          <button className="btn-player-icon" onClick={() => setFullscreen(true)} title="Expand Fullscreen" style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
            <i className="fa-solid fa-expand" />
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN EXPAND PLAYER OVERLAY                                       */}
      {/* ========================================================================= */}
      {isFullscreen && (
        <div className="fullscreen-player active" style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#0b0d14', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
          <div
            className="fs-bg-blur"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${currentTrack.cover || './pulse-logo.png'}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(80px) brightness(0.25)',
              zIndex: -1
            }}
          />

          {/* Header */}
          <div className="fs-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-circle-nav" onClick={() => setFullscreen(false)} title="Minimize" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer' }}>
              <i className="fa-solid fa-chevron-down" />
            </button>
            <div className="fs-title-branding" style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', color: '#a855f7' }}>PLAYING FROM PULSE</span>
              <small style={{ display: 'block', fontSize: '0.7rem', color: '#aaa' }}>High-Fidelity Studio Master</small>
            </div>
            <div style={{ width: '40px' }} />
          </div>

          {/* Body */}
          <div className="fs-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <div className="fs-album-art-wrapper" style={{ width: '280px', height: '280px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(168,85,247,0.4)', border: '4px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
              <img
                src={currentTrack.cover || './pulse-logo.png'}
                alt={currentTrack.title}
                className="spin-disc"
                style={{ width: '100%', height: '100%', objectFit: 'cover', animationPlayState: isPlaying ? 'running' : 'paused' }}
              />
            </div>

            <div className="fs-track-meta" style={{ textAlign: 'center', marginBottom: '1.5rem', width: '100%' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentTrack.title}
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>{currentTrack.artist}</p>
            </div>

            {/* Interactive Fullscreen Scrubber */}
            <div className="fs-progress-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', marginBottom: '2rem', color: '#aaa', fontSize: '0.85rem' }}>
              <span>{formatTime(displayTime)}</span>
              <div className="progress-bar-wrapper" style={{ flex: 1, position: 'relative', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px' }}>
                <div style={{ width: `${displayPercent}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', borderRadius: '999px' }} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={displayPercent}
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', margin: 0 }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Fullscreen Controls */}
            <div className="fs-controls-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
              <button className={`btn-player-sub ${isShuffle ? 'active' : ''}`} onClick={toggleShuffle} style={{ background: 'none', border: 'none', color: isShuffle ? '#a855f7' : '#aaa', fontSize: '1.4rem', cursor: 'pointer' }}>
                <i className="fa-solid fa-shuffle" />
              </button>
              <button className="btn-player-sub" onClick={playPrev} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                <i className="fa-solid fa-backward-step" />
              </button>
              <button className="btn-player-primary" onClick={togglePlayPause} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', border: 'none', color: '#fff', fontSize: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 30px rgba(168,85,247,0.5)' }}>
                {isBuffering ? (
                  <i className="fa-solid fa-circle-notch fa-spin" />
                ) : isPlaying ? (
                  <i className="fa-solid fa-pause" />
                ) : (
                  <i className="fa-solid fa-play" style={{ marginLeft: '4px' }} />
                )}
              </button>
              <button className="btn-player-sub" onClick={playNext} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                <i className="fa-solid fa-forward-step" />
              </button>
              <button className={`btn-player-sub ${isRepeat ? 'active' : ''}`} onClick={toggleRepeat} style={{ background: 'none', border: 'none', color: isRepeat ? '#a855f7' : '#aaa', fontSize: '1.4rem', cursor: 'pointer' }}>
                <i className="fa-solid fa-repeat" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
