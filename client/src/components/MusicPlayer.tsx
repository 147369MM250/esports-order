import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSettings } from '@client/src/contexts/AppContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@client/src/components/ui/image';

// 8 首网易云歌曲（走后端代理 /api/music/proxy?id=<songId>）
const PLAYLIST = [
  { title: '碎碎念', artist: '队长', id: '2097443876' },
  { title: '安眠药', artist: '藤竹京/DY/冰心', id: '3321486526' },
  { title: 'Studio调调', artist: 'JUAN', id: '3350470502' },
  { title: '梦的翅膀受了伤 (DJ阿智版)', artist: 'DJ阿布', id: '3399346804' },
  { title: 'Đắm Chìm (沦陷)', artist: 'Vũ Trụ Insight', id: '2695890892' },
  { title: '离开我的依赖（DJ铁柱）', artist: 'TieZ', id: '2731089330' },
  { title: '天亮以前说再见 (DJ版)', artist: 'DJ小小智', id: '3334689339' },
  { title: '零距离的思念 (DJAh版)', artist: 'DJAh', id: '2719027767' },
];

const MAX_AUTO_SKIP = PLAYLIST.length;
const STORAGE_POSITION_KEY = 'music_ball_position';

function getSongUrl(id: string): string {
  return `/api/music/proxy?id=${id}`;
}

interface BallPosition {
  x: number;
  y: number;
}

function loadPosition(): BallPosition | null {
  try {
    const raw = localStorage.getItem(STORAGE_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BallPosition;
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
    return null;
  } catch {
    return null;
  }
}

function savePosition(pos: BallPosition) {
  try {
    localStorage.setItem(STORAGE_POSITION_KEY, JSON.stringify(pos));
  } catch {
    // ignore
  }
}

export default function MusicPlayer() {
  const { settings } = useAppSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const autoSkipCountRef = useRef(0);
  const autoPlayDoneRef = useRef(false);
  const autoPlayInProgressRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [allFailed, setAllFailed] = useState(false);

  const [ballPosition, setBallPosition] = useState<BallPosition>(() => loadPosition() ?? { x: -1, y: -1 });
  const ballPositionRef = useRef(ballPosition);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; ballX: number; ballY: number } | null>(null);
  const movedRef = useRef(false);

  const currentSong = PLAYLIST[currentIndex];

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      wasPlayingRef.current = true;
      autoSkipCountRef.current = 0;
      setErrorMsg(null);
      const nextIndex = (currentIndexRef.current + 1) % PLAYLIST.length;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      wasPlayingRef.current = true;
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      autoSkipCountRef.current += 1;
      if (autoSkipCountRef.current >= MAX_AUTO_SKIP) {
        if (!autoPlayInProgressRef.current) {
          setAllFailed(true);
          setIsPlaying(false);
          wasPlayingRef.current = false;
          setErrorMsg('暂无可用音源');
        }
        return;
      }
      if (!autoPlayInProgressRef.current) {
        setErrorMsg('音源加载失败，已自动切换');
      }
      const nextIndex = (currentIndexRef.current + 1) % PLAYLIST.length;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    audio.src = getSongUrl(currentSong.id);
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    ballPositionRef.current = ballPosition;
  }, [ballPosition]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
      audioRef.current.volume = volume;
    }
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.src === getSongUrl(currentSong.id) && !audio.paused) return;

    setProgress(0);
    setDuration(0);

    audio.src = getSongUrl(currentSong.id);
    audio.load();

    if (wasPlayingRef.current) {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          setIsPlaying(false);
        });
      }
    }
   }, [currentIndex, currentSong.id]);

  useEffect(() => {
    if (!errorMsg || allFailed) return;
    const timer = window.setTimeout(() => {
      setErrorMsg(null);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [errorMsg, allFailed]);

  const attemptPlay = useCallback((startIdx: number, tried: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (tried >= PLAYLIST.length) {
      autoPlayInProgressRef.current = false;
      autoPlayDoneRef.current = true;
      setAllFailed(true);
      setErrorMsg('自动播放失败：没有可播放的音源');
      return;
    }

    const idx = ((startIdx % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    const targetUrl = getSongUrl(PLAYLIST[idx].id);
    const needReload =
      audio.src !== targetUrl ||
      audio.networkState === 3 ||
      audio.readyState === 0;
    if (needReload) {
      audio.src = targetUrl;
      audio.load();
    }

    const playPromise = audio.play();
    if (!playPromise) {
      attemptPlay(idx + 1, tried + 1);
      return;
    }

    playPromise
      .then(() => {
        autoPlayInProgressRef.current = false;
        autoPlayDoneRef.current = true;
        autoSkipCountRef.current = 0;
        wasPlayingRef.current = true;
        currentIndexRef.current = idx;
        setCurrentIndex(idx);
      })
      .catch(() => {
        attemptPlay(idx + 1, tried + 1);
      });
  }, []);

  const triggerAutoplay = useCallback(() => {
    if (autoPlayDoneRef.current || autoPlayInProgressRef.current) return;
    autoPlayInProgressRef.current = true;
    attemptPlay(currentIndexRef.current, 0);
  }, [attemptPlay]);

  // 触碰任意界面自动播放（捕获阶段监听，绕开 stopPropagation 拦截）
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (autoPlayDoneRef.current || autoPlayInProgressRef.current) return;
      triggerAutoplay();
    };

    const events: string[] = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'click'];
    for (const evt of events) {
      document.addEventListener(evt, handleFirstInteraction, {
        once: true,
        capture: true,
        passive: true,
      });
    }

    return () => {
      for (const evt of events) {
        document.removeEventListener(evt, handleFirstInteraction, { capture: true });
      }
    };
  }, [triggerAutoplay]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || allFailed) return;

    autoPlayDoneRef.current = true;

    if (audio.paused) {
      wasPlayingRef.current = true;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          setIsPlaying(false);
          wasPlayingRef.current = false;
        });
      }
    } else {
      wasPlayingRef.current = false;
      audio.pause();
    }
  }, [allFailed]);

  const handlePrev = useCallback(() => {
    if (allFailed) return;
    autoSkipCountRef.current = 0;
    setErrorMsg(null);
    wasPlayingRef.current = isPlaying;
    setCurrentIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  }, [isPlaying, allFailed]);

  const handleNext = useCallback(() => {
    if (allFailed) return;
    autoSkipCountRef.current = 0;
    setErrorMsg(null);
    wasPlayingRef.current = isPlaying;
    setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length);
  }, [isPlaying, allFailed]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const percent = parseFloat(e.target.value);
    audio.currentTime = (percent / 100) * duration;
    setProgress(percent);
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  const iconUrl = settings?.musicIconUrl;
  const spinClass = isPlaying ? 'music-cover-spin' : 'music-cover-spin music-cover-paused';

  const clampPosition = (x: number, y: number): BallPosition => {
    const ballSize = 56;
    const safeX = 12;
    const safeY = 80;
    const bottomSafe = 80;
    const maxX = (typeof window !== 'undefined' ? window.innerWidth : 375) - ballSize - safeX;
    const maxY = (typeof window !== 'undefined' ? window.innerHeight : 667) - ballSize - bottomSafe;
    return {
      x: Math.max(safeX, Math.min(maxX, x)),
      y: Math.max(safeY, Math.min(maxY, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    movedRef.current = false;
    const target = e.currentTarget as HTMLButtonElement;
    const rect = target.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ballX: rect.left,
      ballY: rect.top,
    };
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      movedRef.current = true;
    }
    if (movedRef.current) {
      const newPos = clampPosition(
        dragStartRef.current.ballX + dx,
        dragStartRef.current.ballY + dy,
      );
      setBallPosition(newPos);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (movedRef.current) {
      savePosition(ballPositionRef.current);
      try {
        (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    } else {
      setExpanded((prev) => !prev);
    }
    dragStartRef.current = null;
  };

  const ballStyle: React.CSSProperties =
    ballPosition.x >= 0 && ballPosition.y >= 0
      ? { left: ballPosition.x, top: ballPosition.y }
      : { right: 24, bottom: 24 };

  return (
    <>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-4 right-4 z-40 glass-card p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <div className={spinClass}>
                  {iconUrl ? (
                    <Image src={iconUrl} alt="" className="w-14 h-14 object-cover rounded-lg" />
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{currentSong.title}</div>
                <div className="text-sm text-slate-400 truncate">{currentSong.artist}</div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="收起播放器"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-2 text-xs text-amber-400 text-center">{errorMsg}</div>
            )}

            <div className="mb-3">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer music-progress-bar"
                style={{ ['--progress' as string]: `${progress}%` }}
                aria-label="播放进度"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{formatTime((progress / 100) * duration)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button onClick={handlePrev} className="text-white hover:text-purple-400 transition-colors" aria-label="上一首">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlay}
                disabled={allFailed}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-purple-500/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isPlaying ? '暂停' : '播放'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <button onClick={handleNext} className="text-white hover:text-purple-400 transition-colors" aria-label="下一首">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors" aria-label={muted ? '取消静音' : '静音'}>
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (val > 0 && muted) setMuted(false);
                }}
                className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                aria-label="音量"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={ballStyle}
        className={`fixed z-40 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/40 touch-none ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        aria-label={expanded ? '收起播放器' : '展开播放器'}
      >
        <div className={spinClass}>
          {iconUrl ? (
            <Image src={iconUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <Music className="w-6 h-6 text-white" />
          )}
        </div>
        {isPlaying && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        )}
      </motion.button>
    </>
  );
}
