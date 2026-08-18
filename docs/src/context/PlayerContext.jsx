import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

// =========================================================================
// 1. INITIAL STATE & REDUCER
// =========================================================================
const initialState = {
  currentTrack: null,
  isPlaying: false,
  isBuffering: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  isMuted: false,
  isShuffle: false,
  isRepeat: false, // false | 'all' | 'one'
  isFullscreen: false,
  queue: [],
  queueIndex: 0
};

function playerReducer(state, action) {
  switch (action.type) {
    case 'SET_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        currentTime: 0,
        duration: action.payload.durationSec || 0,
        isPlaying: true,
        isBuffering: true
      };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_BUFFERING':
      return { ...state, isBuffering: action.payload };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload, isMuted: action.payload === 0 };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'TOGGLE_SHUFFLE':
      return { ...state, isShuffle: !state.isShuffle };
    case 'TOGGLE_REPEAT': {
      const modes = [false, 'all', 'one'];
      const nextIdx = (modes.indexOf(state.isRepeat) + 1) % modes.length;
      return { ...state, isRepeat: modes[nextIdx] };
    }
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreen: action.payload };
    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload.queue,
        queueIndex: action.payload.startIndex || 0
      };
    case 'SET_QUEUE_INDEX':
      return { ...state, queueIndex: action.payload };
    default:
      return state;
  }
}

const PlayerContext = createContext(null);

// =========================================================================
// 2. PLAYER PROVIDER & SINGLETON AUDIO INSTANCE
// =========================================================================
export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef(null);
  const isScrubbingRef = useRef(false);

  // Initialize Singleton Audio on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      audioRef.current.crossOrigin = 'anonymous';
    }
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (!isScrubbingRef.current) {
        dispatch({ type: 'SET_TIME', payload: audio.currentTime });
      }
    };

    const onLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        dispatch({ type: 'SET_DURATION', payload: audio.duration });
        dispatch({ type: 'SET_BUFFERING', payload: false });
      }
    };

    const onWaiting = () => dispatch({ type: 'SET_BUFFERING', payload: true });
    const onPlaying = () => {
      dispatch({ type: 'SET_PLAYING', payload: true });
      dispatch({ type: 'SET_BUFFERING', payload: false });
    };
    const onPause = () => {
      if (!audio.seeking) {
        dispatch({ type: 'SET_PLAYING', payload: false });
      }
    };
    const onEnded = () => {
      if (state.isRepeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else {
        playNext();
      }
    };
    const onError = (e) => {
      if (audio.error && audio.error.code === 1) return;
      dispatch({ type: 'SET_BUFFERING', payload: false });
      dispatch({ type: 'SET_PLAYING', payload: false });
      console.warn('[Audio Playback Error]:', audio.error);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [state.isRepeat]);

  // Sync volume and mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
      audioRef.current.muted = state.isMuted;
    }
  }, [state.volume, state.isMuted]);

  // Play a specific track (Updates src only on new track)
  const playTrack = async (track, seekSeconds = 0) => {
    if (!track) return;
    const audio = audioRef.current;
    const isNew = !state.currentTrack || state.currentTrack.id !== track.id;

    dispatch({ type: 'SET_TRACK', payload: track });

    const streamUrl = track.streamUrl || track.audioUrl || track.audio || '';
    if (isNew || audio.src !== streamUrl) {
      audio.pause();
      audio.src = streamUrl;
      audio.load();
    }

    if (seekSeconds > 0) {
      audio.currentTime = seekSeconds;
    }

    try {
      await audio.play();
    } catch (err) {
      console.warn('[Playback error]:', err);
    }
  };

  // Toggle Play/Pause without resetting position or buffer
  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!state.currentTrack) return;

    if (state.isPlaying) {
      audio.pause(); // Retains currentTime & buffer
    } else {
      try {
        await audio.play(); // Direct resume at exact position
      } catch (err) {
        console.warn('[Resume error]:', err);
      }
    }
  };

  const playNext = () => {
    if (!state.queue.length) return;
    let nextIdx = (state.queueIndex + 1) % state.queue.length;
    if (state.isShuffle) {
      nextIdx = Math.floor(Math.random() * state.queue.length);
    }
    dispatch({ type: 'SET_QUEUE_INDEX', payload: nextIdx });
    playTrack(state.queue[nextIdx]);
  };

  const playPrev = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (!state.queue.length) return;
    let prevIdx = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
    if (state.isShuffle) {
      prevIdx = Math.floor(Math.random() * state.queue.length);
    }
    dispatch({ type: 'SET_QUEUE_INDEX', payload: prevIdx });
    playTrack(state.queue[prevIdx]);
  };

  const seek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      dispatch({ type: 'SET_TIME', payload: newTime });
    }
  };

  const setScrubbing = (isScrubbing) => {
    isScrubbingRef.current = isScrubbing;
  };

  const setVolume = (val) => dispatch({ type: 'SET_VOLUME', payload: val });
  const toggleMute = () => dispatch({ type: 'TOGGLE_MUTE' });
  const toggleShuffle = () => dispatch({ type: 'TOGGLE_SHUFFLE' });
  const toggleRepeat = () => dispatch({ type: 'TOGGLE_REPEAT' });
  const setFullscreen = (val) => dispatch({ type: 'SET_FULLSCREEN', payload: val });

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playTrack,
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
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
