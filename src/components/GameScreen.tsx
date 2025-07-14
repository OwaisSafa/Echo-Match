import { useState, useEffect, useCallback } from 'react';
import './GameScreen.css';
import { Button } from "@/components/ui";
import { Home, Volume2, VolumeX, Pause, Play, Trophy, Zap, Sparkles } from 'lucide-react';
import GameTile from './GameTile';
import AudioSystem from '../utils/AudioSystem';
import { GameData, Tile, WaveType } from '../types/game';
import { toast } from 'sonner';

interface GameScreenProps {
  onGoHome: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onUpdateStats: (score: number, level: number) => void;
}

const WAVE_TYPES: WaveType[] = ['sine', 'square', 'triangle', 'sawtooth', 'pulse', 'echo'];
const BASE_FREQUENCIES = [220, 261.63, 329.63, 392, 440, 523.25];

const GameScreen = ({ onGoHome, isSoundEnabled, onToggleSound, onUpdateStats }: GameScreenProps) => {
  const [gameData, setGameData] = useState<GameData>(() => initializeGame(1));
  const [isPaused, setIsPaused] = useState(false);
  const [isGlowEnabled, setIsGlowEnabled] = useState(true);
  const [audioSystem] = useState(() => new AudioSystem());

  function initializeGame(level: number): GameData {
    const pairCount = 2 + level;
    const tiles: Tile[] = [];
    
    for (let i = 0; i < pairCount; i++) {
      const waveType = WAVE_TYPES[i % WAVE_TYPES.length];
      const frequency = BASE_FREQUENCIES[i % BASE_FREQUENCIES.length] + (Math.floor(i / WAVE_TYPES.length) * 100);
      
      tiles.push(
        {
          id: i * 2,
          waveType,
          frequency,
          isFlipped: false,
          isMatched: false,
        },
        {
          id: i * 2 + 1,
          waveType,
          frequency,
          isFlipped: false,
          isMatched: false,
        }
      );
    }

    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    return {
      level,
      score: 0,
      combo: 0,
      tiles,
      flippedTiles: [],
      matchedPairs: 0,
      totalPairs: pairCount,
    };
  }

  const handleTileClick = useCallback((tileId: number) => {
    if (isPaused) return;
    
    setGameData(prev => {
      const tile = prev.tiles.find(t => t.id === tileId);
      if (!tile || tile.isFlipped || tile.isMatched || prev.flippedTiles.length >= 2) {
        return prev;
      }

      const newTiles = prev.tiles.map(t => 
        t.id === tileId ? { ...t, isFlipped: true } : t
      );
      const newFlippedTiles = [...prev.flippedTiles, tileId];

      if (isSoundEnabled) {
        audioSystem.playWaveSound(tile.waveType, tile.frequency, 0.5);
      }

      if (newFlippedTiles.length === 2) {
        const [firstId, secondId] = newFlippedTiles;
        const firstTile = newTiles.find(t => t.id === firstId);
        const secondTile = newTiles.find(t => t.id === secondId);

        if (firstTile && secondTile && firstTile.waveType === secondTile.waveType) {
          const matchedTiles = newTiles.map(t => 
            t.id === firstId || t.id === secondId ? { ...t, isMatched: true } : t
          );
          
          const newCombo = prev.combo + 1;
          const scoreIncrease = 100 * newCombo;
          const newScore = prev.score + scoreIncrease;
          const newMatchedPairs = prev.matchedPairs + 1;

          if (isSoundEnabled) {
            audioSystem.playSuccessSound();
          }

          toast.success(`Match! +${scoreIncrease} points`, { duration: 1000 });

          if (newMatchedPairs === prev.totalPairs) {
            setTimeout(() => {
              const nextLevel = prev.level + 1;
              const levelBonus = prev.level * 500;
              const finalScore = newScore + levelBonus;
              
              toast.success(`Level ${prev.level} Complete! +${levelBonus} bonus`, { duration: 2000 });
              onUpdateStats(finalScore, nextLevel);
              
              setTimeout(() => {
                setGameData(initializeGame(nextLevel));
              }, 1500);
            }, 1000);
          }

          return {
            ...prev,
            tiles: matchedTiles,
            flippedTiles: [],
            combo: newCombo,
            score: newScore,
            matchedPairs: newMatchedPairs,
          };
        } else {
          if (isSoundEnabled) {
            audioSystem.playErrorSound();
          }
          
          setTimeout(() => {
            setGameData(current => ({
              ...current,
              tiles: current.tiles.map(t => 
                t.id === firstId || t.id === secondId ? { ...t, isFlipped: false } : t
              ),
              flippedTiles: [],
              combo: 0,
            }));
          }, 1500);

          return {
            ...prev,
            tiles: newTiles,
            flippedTiles: newFlippedTiles,
            combo: 0,
          };
        }
      }

      return {
        ...prev,
        tiles: newTiles,
        flippedTiles: newFlippedTiles,
      };
    });
  }, [isPaused, isSoundEnabled, audioSystem, onUpdateStats]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleGlow = () => {
    setIsGlowEnabled(!isGlowEnabled);
  };

  const restartGame = () => {
    setGameData(initializeGame(1));
    setIsPaused(false);
  };

  return (
    <div className="game-screen">
      {/* Enhanced Responsive Header */}
      <div className="game-header">
        <Button
          onClick={onGoHome}
          variant="outline"
          size="sm"
          className="header-button header-button--home"
        >
          <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="header-button-text">Home</span>
        </Button>

        <div className="game-stats">
          <div className="stat-badge stat-badge--level">
            <div className="stat-content">
              <div className="stat-indicator stat-indicator--level"></div>
              <span className="stat-label">Lv {gameData.level}</span>
            </div>
          </div>
          <div className="stat-badge stat-badge--score">
            <div className="stat-content">
              <Trophy className="stat-icon stat-icon--trophy" />
              <span className="stat-value">{gameData.score.toLocaleString()}</span>
            </div>
          </div>
          <div className="stat-badge stat-badge--combo">
            <div className="stat-content">
              <Zap className="stat-icon stat-icon--combo" />
              <span className="stat-value">×{gameData.combo}</span>
            </div>
          </div>
        </div>

        <div className="header-controls">
          <Button
            onClick={onToggleSound}
            variant="outline"
            size="sm"
            className="header-button header-button--sound"
          >
            {isSoundEnabled ? <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />}
          </Button>
          <Button
            onClick={toggleGlow}
            variant="outline"
            size="sm"
            className={`header-button header-button--glow ${isGlowEnabled ? 'glow-active' : 'glow-inactive'}`}
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            onClick={togglePause}
            variant="outline"
            size="sm"
            className="header-button header-button--pause"
          >
            {isPaused ? <Play className="w-3 h-3 sm:w-4 sm:h-4" /> : <Pause className="w-3 h-3 sm:w-4 sm:h-4" />}
          </Button>
        </div>
      </div>

      {/* Game Grid */}
      <div className="game-board">
        <div className="game-board-wrapper">
          <div 
            className="game-grid"
            style={{ 
              gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(gameData.tiles.length))}, 1fr)`,
              gridTemplateRows: `repeat(${Math.ceil(gameData.tiles.length / Math.ceil(Math.sqrt(gameData.tiles.length)))}, 1fr)`,
            }}
          >
            {gameData.tiles.map((tile) => (
              <GameTile
                key={tile.id}
                tile={tile}
                onClick={() => handleTileClick(tile.id)}
                disabled={isPaused}
                isGlowEnabled={isGlowEnabled}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Pause Overlay */}
      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-modal">
            <h2 className="pause-title">
              Game Paused
            </h2>
            <div className="pause-actions">
              <Button
                onClick={togglePause}
                size="lg"
                className="pause-button pause-button--resume"
              >
                Resume Game
              </Button>
              <Button
                onClick={restartGame}
                variant="outline"
                size="lg"
                className="pause-button pause-button--restart"
              >
                Restart Level
              </Button>
              <Button
                onClick={onGoHome}
                variant="outline"
                size="lg"
                className="pause-button pause-button--exit"
              >
                Exit to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
