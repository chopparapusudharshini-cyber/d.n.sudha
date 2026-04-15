import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

// --- CONSTANTS ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 120;

const TRACKS = [
  { id: 'TRK-01', title: 'NEURAL_NET_LULLABY.WAV', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'TRK-02', title: 'SYNAPTIC_OVERLOAD.MP3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'TRK-03', title: 'GHOST_IN_THE_MACHINE.FLAC', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Audio State
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- GAME LOGIC ---
  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake((prev) => {
      const head = prev[0];
      const newHead = { x: head.x + direction.x, y: head.y + direction.y };

      // Check collision with walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prev;
      }

      // Check collision with self
      if (prev.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prev;
      }

      const newSnake = [newHead, ...prev];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!gameStarted && e.key === ' ') {
        setGameStarted(true);
        return;
      }

      if (gameOver && e.key === ' ') {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, gameStarted]);

  // --- AUDIO LOGIC ---
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying]);

  return (
    <div className="h-screen w-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden grid grid-rows-[80px_1fr_60px] grid-cols-[280px_1fr_280px] font-sans">
      {/* Header */}
      <header className="col-span-3 border-b border-[var(--border)] flex items-center justify-between px-10 bg-gradient-to-r from-[var(--bg)] via-[#111] to-[var(--bg)]">
        <div className="text-2xl font-black tracking-[4px] text-[var(--accent-cyan)] uppercase drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
          SynthSnake
        </div>
        <div className="flex gap-10 font-mono">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[var(--text-dim)] uppercase">Current Score</span>
            <span className="text-2xl text-[var(--accent-lime)]">{score.toString().padStart(5, '0')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[var(--text-dim)] uppercase">High Score</span>
            <span className="text-2xl text-[var(--accent-lime)]">08,550</span>
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="p-[30px] border-r border-[var(--border)] flex flex-col gap-[30px]">
        <div>
          <h3 className="text-[11px] uppercase tracking-[2px] text-[var(--text-dim)] mb-[15px] border-b border-[var(--border)] pb-[5px]">Audio Driver</h3>
          <div className="bg-[var(--panel)] border border-[var(--border)] p-5 rounded">
            <div className="w-full aspect-square bg-gradient-to-tr from-[#222] to-[#333] mb-[15px] relative overflow-hidden border border-[var(--border)]">
              <div className="absolute bottom-0 w-full h-[40px] flex items-end gap-[2px] px-[5px]">
                {[40, 70, 50, 90, 60, 30, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-[var(--accent-cyan)]" style={{ height: isPlaying ? `${h}%` : '10%', transition: 'height 0.2s ease-in-out' }} />
                ))}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-[18px] mb-1 truncate">{TRACKS[currentTrack].title.replace(/\.[^/.]+$/, "")}</h2>
              <p className="text-[12px] text-[var(--text-dim)]">Neural Audio Lab</p>
            </div>
            <div className="flex justify-center items-center gap-5 mt-5">
              <button onClick={prevTrack} className="bg-transparent border border-[var(--accent-cyan)] text-[var(--accent-cyan)] rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-[var(--accent-cyan)]/10">
                <SkipBack size={16} />
              </button>
              <button onClick={togglePlay} className="bg-[var(--accent-cyan)] text-[var(--bg)] border border-[var(--accent-cyan)] rounded-full w-[50px] h-[50px] flex items-center justify-center cursor-pointer hover:bg-[var(--accent-cyan)]/80">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={nextTrack} className="bg-transparent border border-[var(--accent-cyan)] text-[var(--accent-cyan)] rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-[var(--accent-cyan)]/10">
                <SkipForward size={16} />
              </button>
            </div>
            <div className="flex justify-center mt-4">
              <button onClick={() => setIsMuted(!isMuted)} className="text-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]/80">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-[11px] uppercase tracking-[2px] text-[var(--text-dim)] mb-[15px] border-b border-[var(--border)] pb-[5px]">Session Info</h3>
          <p className="text-[12px] leading-[1.6] text-[var(--text-dim)]">
            Status: Synchronized<br/>
            Difficulty: Elite<br/>
            Latency: 4ms
          </p>
        </div>
      </aside>

      {/* Main Game Area */}
      <main className="flex items-center justify-center bg-[radial-gradient(circle,#111_0%,#050505_100%)] relative">
        <div 
          className="w-[440px] h-[440px] bg-black border-2 border-[var(--border)] relative grid"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {/* Snake */}
          {snake.map((segment, i) => (
            <div 
              key={i}
              className="bg-[var(--accent-lime)] border border-black shadow-[0_0_5px_var(--accent-lime)]"
              style={{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }}
            />
          ))}
          {/* Food */}
          <div 
            className="bg-[var(--accent-pink)] rounded-full shadow-[0_0_10px_var(--accent-pink)]"
            style={{ gridColumn: food.x + 1, gridRow: food.y + 1 }}
          />

          {/* Overlays */}
          {(!gameStarted || gameOver) && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm z-10">
              <Terminal className="w-12 h-12 text-[var(--accent-cyan)] mb-4 animate-pulse" />
              <h2 className="text-2xl text-[var(--text)] mb-2 font-sans tracking-widest">
                {gameOver ? 'CRITICAL_FAILURE' : 'SYSTEM_READY'}
              </h2>
              <p className="text-sm text-[var(--text-dim)] mb-6 font-mono">
                {gameOver ? `FINAL_SCORE: ${score}` : 'INITIALIZE_SEQUENCE'}
              </p>
              <button 
                onClick={() => {
                  if (gameOver) {
                    setSnake(INITIAL_SNAKE);
                    setDirection(INITIAL_DIRECTION);
                    setScore(0);
                    setGameOver(false);
                  }
                  setGameStarted(true);
                }}
                className="px-6 py-2 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)] hover:text-black transition-colors uppercase tracking-widest text-sm font-mono"
              >
                [ PRESS_SPACE_TO_EXECUTE ]
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="p-[30px] border-l border-[var(--border)] flex flex-col">
        <h3 className="text-[11px] uppercase tracking-[2px] text-[var(--text-dim)] mb-[15px] border-b border-[var(--border)] pb-[5px]">Playlist</h3>
        <div className="flex flex-col gap-2">
          {TRACKS.map((track, idx) => (
            <div 
              key={track.id}
              onClick={() => {
                setCurrentTrack(idx);
                setIsPlaying(true);
              }}
              className={`flex items-center gap-3 p-2.5 rounded cursor-pointer border ${currentTrack === idx ? 'bg-[var(--accent-cyan)]/5 border-[var(--accent-cyan)]/20' : 'border-transparent hover:bg-[#222]/50'}`}
            >
              <span className="font-mono text-[var(--text-dim)] w-5 text-sm">{(idx + 1).toString().padStart(2, '0')}</span>
              <div>
                <h4 className="text-sm mb-0.5 text-[var(--text)] truncate w-32">{track.title.replace(/\.[^/.]+$/, "")}</h4>
                <p className="text-[11px] text-[var(--text-dim)]">AI Audio</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="text-[11px] uppercase tracking-[2px] text-[var(--text-dim)] mb-[15px] border-b border-[var(--border)] pb-[5px]">Leaderboard</h3>
          <div className="font-mono text-[13px] flex flex-col gap-2">
            <div className="flex justify-between text-[var(--accent-cyan)]">
              <span>01. PLAYER_X</span>
              <span>12,400</span>
            </div>
            <div className="flex justify-between text-[var(--text-dim)]">
              <span>02. NEON_SOUL</span>
              <span>10,120</span>
            </div>
            <div className="flex justify-between text-[var(--text-dim)]">
              <span>03. VOID_WALK</span>
              <span>09,880</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Footer */}
      <footer className="col-span-3 border-t border-[var(--border)] flex items-center justify-between px-10 text-xs text-[var(--text-dim)]">
        <div>v1.0.4 - SYSTEM ACTIVE</div>
        <div className="flex gap-5">
          <span>[W][A][S][D] Move</span>
          <span>[SPACE] Pause/Start</span>
          <span>[M] Mute</span>
        </div>
        <div>&copy; 2024 NEURAL INTERFACE</div>
      </footer>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={TRACKS[currentTrack].url}
        muted={isMuted}
        onEnded={nextTrack}
      />
    </div>
  );
}
