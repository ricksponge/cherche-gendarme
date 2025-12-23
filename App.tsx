
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameObject, GameState, LevelConfig } from './types';
import { TARGET_EMOJIS, CLUTTER_EMOJIS, LEVELS, COLORS } from './constants';
import { soundManager } from './sounds';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [targetsToFind, setTargetsToFind] = useState<{type: string, emoji: string, found: boolean, id: string}[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    soundManager.setMuted(!isMuted);
  };

  const generateLevel = useCallback((levelIndex: number) => {
    const config = LEVELS[levelIndex];
    const newObjects: GameObject[] = [];
    const newTargets: {type: string, emoji: string, found: boolean, id: string}[] = [];

    const availableTargets = [...TARGET_EMOJIS].sort(() => 0.5 - Math.random());
    const selectedTargets = availableTargets.slice(0, config.targetCount);

    selectedTargets.forEach((target, index) => {
      const id = `target-${index}-${Math.random()}`;
      newObjects.push({
        id,
        type: target.type,
        emoji: target.emoji,
        x: Math.random() * 90 + 5,
        y: Math.random() * 80 + 10,
        rotation: Math.random() * 30 - 15,
        scale: 1.2 + Math.random() * 0.5,
        isTarget: true,
        found: false
      });
      newTargets.push({ ...target, found: false, id });
    });

    for (let i = 0; i < config.clutterCount; i++) {
      const emoji = CLUTTER_EMOJIS[Math.floor(Math.random() * CLUTTER_EMOJIS.length)];
      newObjects.push({
        id: `clutter-${i}`,
        type: 'clutter',
        emoji,
        x: Math.random() * 94 + 3,
        y: Math.random() * 85 + 5,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.6,
        isTarget: false,
        found: false
      });
    }

    setObjects(newObjects.sort(() => 0.5 - Math.random()));
    setTargetsToFind(newTargets);
    setTimeLeft(config.timeLimit);
    setGameState(GameState.PLAYING);
  }, []);

  const startGame = () => {
    setScore(0);
    setCurrentLevel(0);
    generateLevel(0);
  };

  const nextLevel = () => {
    soundManager.playFanfare();
    if (currentLevel + 1 < LEVELS.length) {
      setCurrentLevel(prev => prev + 1);
      generateLevel(currentLevel + 1);
    } else {
      setGameState(GameState.WON);
    }
  };

  const handleObjectClick = (obj: GameObject) => {
    if (gameState !== GameState.PLAYING) return;
    
    if (obj.isTarget && !obj.found) {
      soundManager.playSuccess();
      setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, found: true } : o));
      setTargetsToFind(prev => prev.map(t => t.id === obj.id ? { ...t, found: true } : t));
      setScore(prev => prev + 100);
      
      const remaining = targetsToFind.filter(t => !t.found && t.id !== obj.id);
      if (remaining.length === 0) {
        clearInterval(timerRef.current!);
        setTimeout(() => nextLevel(), 500);
      }
    } else if (!obj.isTarget) {
      soundManager.playError();
      setTimeLeft(prev => Math.max(0, prev - 3));
    }
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState(GameState.GAMEOVER);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100 p-6 text-center">
      <div className="mb-8 transform hover:scale-105 transition-transform">
        <span className="text-8xl">👮</span>
      </div>
      <h1 className="text-5xl font-extrabold mb-4 text-[#002395] tracking-tight">GENDARME ENQUÊTE</h1>
      <p className="text-xl text-slate-600 mb-8 max-w-md">
        Chercheur, nous avons besoin de vous ! Retrouvez les indices et les agents dissimulés dans la foule avant la fin du temps imparti.
      </p>
      <button 
        onClick={startGame}
        className="px-10 py-4 bg-[#002395] text-white rounded-full font-bold text-2xl shadow-xl hover:bg-[#001a6e] transition-all transform active:scale-95"
      >
        COMMENCER LA MISSION
      </button>
      <div className="mt-12 flex gap-4 items-center">
         <div className="flex gap-4 grayscale opacity-50">
            <span className="text-4xl">🚓</span>
            <span className="text-4xl">🚨</span>
            <span className="text-4xl">🔍</span>
         </div>
         <button 
           onClick={toggleMute}
           className="ml-8 p-3 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
           title={isMuted ? "Réactiver le son" : "Couper le son"}
         >
           {isMuted ? '🔇' : '🔊'}
         </button>
      </div>
    </div>
  );

  const renderGame = () => {
    const config = LEVELS[currentLevel];
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-[#e2e8f0]">
        {/* HUD */}
        <div className="bg-[#002395] text-white p-4 shadow-lg flex justify-between items-center z-50">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-xs uppercase font-bold opacity-75">Mission</span>
              <span className="text-lg font-bold">{config.name}</span>
            </div>
            <button 
               onClick={toggleMute}
               className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
               {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
          
          <div className="flex flex-col items-center">
             <div className={`px-4 py-1 rounded-full font-mono text-2xl font-bold ${timeLeft < 10 ? 'bg-red-500 animate-pulse' : 'bg-black/20'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
             </div>
          </div>

          <div className="text-right">
             <span className="text-xs uppercase font-bold opacity-75">Score</span>
             <div className="text-lg font-bold text-yellow-400">{score}</div>
          </div>
        </div>

        {/* Target List Bar */}
        <div className="bg-white/80 backdrop-blur-sm p-3 flex gap-4 overflow-x-auto border-b border-slate-300 z-40 items-center justify-center">
           <span className="text-sm font-bold text-slate-500 hidden md:inline">INDICES À TROUVER :</span>
           {targetsToFind.map((target) => (
             <div 
               key={target.id} 
               className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all border-2 ${target.found ? 'bg-green-100 border-green-500 opacity-30 grayscale' : 'bg-white border-slate-200 shadow-sm scale-110'}`}
             >
               <span className="text-2xl">{target.emoji}</span>
               {target.found && <span className="absolute text-green-600 font-bold">✓</span>}
             </div>
           ))}
        </div>

        {/* Scene Area */}
        <div className="relative flex-grow overflow-hidden select-none touch-none cursor-crosshair unselectable">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
          
          {objects.map((obj) => (
            <div
              key={obj.id}
              onClick={() => handleObjectClick(obj)}
              style={{
                position: 'absolute',
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transform: `translate(-50%, -50%) rotate(${obj.rotation}deg) scale(${obj.found ? 1.5 : obj.scale})`,
                fontSize: `${2.5}rem`,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                filter: obj.found ? 'drop-shadow(0 0 10px #22c55e)' : 'none',
                opacity: obj.found ? 0.8 : 1,
                pointerEvents: obj.found ? 'none' : 'auto',
                zIndex: obj.found ? 100 : Math.floor(obj.y)
              }}
              className="hover:brightness-125 active:scale-90"
            >
              {obj.emoji}
              {obj.found && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg animate-bounce">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6 text-center">
      <span className="text-8xl mb-6">⌛</span>
      <h1 className="text-5xl font-black mb-4 text-red-500">TEMPS ÉCOULÉ !</h1>
      <p className="text-xl mb-8">L'enquête a échoué. Les indices se sont volatilisés.</p>
      <div className="bg-white/10 p-6 rounded-2xl mb-8 w-full max-w-sm">
        <div className="text-slate-400 uppercase text-sm font-bold">Score Final</div>
        <div className="text-4xl font-mono text-yellow-400">{score}</div>
      </div>
      <button 
        onClick={startGame}
        className="px-8 py-3 bg-[#002395] text-white rounded-full font-bold text-xl hover:bg-[#001a6e] transition-all"
      >
        RÉESSAYER LA MISSION
      </button>
    </div>
  );

  const renderWin = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50 p-6 text-center">
      <div className="relative mb-6">
        <span className="text-9xl">🏆</span>
        <span className="absolute -top-4 -right-4 text-4xl animate-bounce">👮</span>
      </div>
      <h1 className="text-5xl font-black mb-4 text-[#002395]">FÉLICITATIONS !</h1>
      <p className="text-xl text-slate-700 mb-8 max-w-md">
        Votre sens de l'observation est digne d'un commissaire. Vous avez brillamment réussi toutes les missions !
      </p>
      <div className="bg-white p-8 rounded-3xl shadow-2xl mb-8 w-full max-w-sm border-4 border-[#002395]">
        <div className="text-slate-500 uppercase text-sm font-bold mb-2">SCORE D'ELITE</div>
        <div className="text-6xl font-black text-[#002395] mb-4">{score}</div>
        <div className="flex justify-center gap-2">
           <span className="text-2xl">⭐</span>
           <span className="text-2xl">⭐</span>
           <span className="text-2xl">⭐</span>
        </div>
      </div>
      <button 
        onClick={() => setGameState(GameState.MENU)}
        className="px-10 py-4 bg-[#002395] text-white rounded-full font-bold text-2xl shadow-xl hover:bg-[#001a6e] transition-all"
      >
        RETOUR AU QUARTIER
      </button>
    </div>
  );

  return (
    <div className="h-screen w-full select-none overflow-hidden">
      {gameState === GameState.MENU && renderMenu()}
      {gameState === GameState.PLAYING && renderGame()}
      {gameState === GameState.GAMEOVER && renderGameOver()}
      {gameState === GameState.WON && renderWin()}
    </div>
  );
};

export default App;
