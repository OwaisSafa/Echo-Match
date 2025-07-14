import { useState } from 'react';
import './HomePage.css';
import { Button } from "./ui";
import { Volume2, VolumeX, Play, HelpCircle, Zap, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { GameStats } from '../game-utils';

interface HomePageProps {
  onStartGame: () => void;
  onShowHowToPlay: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  gameStats: GameStats;
}

const HomePage = ({ 
  onStartGame, 
  onShowHowToPlay, 
  isSoundEnabled, 
  onToggleSound, 
  gameStats 
}: HomePageProps) => {
  const [isStarting, setIsStarting] = useState(false);
  const [isGlowEnabled, setIsGlowEnabled] = useState(false);

  const handleStartGame = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStartGame();
    }, 600);
  };

  const toggleGlow = () => {
    setIsGlowEnabled(!isGlowEnabled);
  };

  // Wave Background Component (inline)
  const WaveBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationId: number;
      let time = 0;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        time += 0.008;
        
        // Draw multiple wave layers with neon colors
        const layers = [
          { color: 'rgba(168, 85, 247, 0.15)', offset: 0, amplitude: 60, frequency: 0.003 },
          { color: 'rgba(6, 182, 212, 0.12)', offset: Math.PI / 2, amplitude: 45, frequency: 0.004 },
          { color: 'rgba(139, 92, 246, 0.1)', offset: Math.PI, amplitude: 35, frequency: 0.005 },
          { color: 'rgba(16, 185, 129, 0.08)', offset: Math.PI * 1.5, amplitude: 25, frequency: 0.006 }
        ];
        
        layers.forEach((layer, index) => {
          ctx.beginPath();
          ctx.strokeStyle = layer.color;
          ctx.lineWidth = 3;
          ctx.shadowColor = layer.color.replace('0.', '0.3').replace('0.0', '0.5');
          ctx.shadowBlur = 15;
          
          const phase = time + layer.offset;
          
          for (let x = 0; x <= canvas.width; x += 3) {
            const y = canvas.height / 2 + 
                     Math.sin(x * layer.frequency + phase) * layer.amplitude + 
                     Math.sin(x * layer.frequency * 2 + phase * 1.3) * (layer.amplitude / 3) +
                     Math.sin(x * layer.frequency * 0.5 + phase * 0.7) * (layer.amplitude / 2);
            
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.stroke();
          ctx.shadowBlur = 0;
        });

        // Add floating orbs with glow
        const orbColors = [
          'rgba(168, 85, 247, 0.4)',
          'rgba(6, 182, 212, 0.3)',
          'rgba(16, 185, 129, 0.3)',
          'rgba(245, 158, 11, 0.3)'
        ];

        for (let i = 0; i < 15; i++) {
          const x = (time * 30 + i * 150) % (canvas.width + 200);
          const y = canvas.height / 2 + Math.sin(time + i * 0.8) * 250;
          const size = 3 + Math.sin(time + i) * 3;
          const colorIndex = i % orbColors.length;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = orbColors[colorIndex];
          ctx.shadowColor = orbColors[colorIndex];
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        
        animationId = requestAnimationFrame(animate);
      };

      resize();
      animate();
      
      window.addEventListener('resize', resize);

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationId);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />
    );
  };

  return (
    <div className={`home-container ${isStarting ? 'fade-out' : 'fade-in'}`}>
      <WaveBackground />
      
      {/* Floating orbs - reduced and conditional */}
      {isGlowEnabled && (
        <>
          <div className="floating-orb floating-orb--violet"></div>
          <div className="floating-orb floating-orb--teal" style={{ animationDelay: '1s' }}></div>
          <div className="floating-orb floating-orb--yellow" style={{ animationDelay: '2s' }}></div>
        </>
      )}
      
      <div className={`main-content ${isStarting ? 'scale-up fade-out' : 'scale-normal fade-in'}`}>
        
        {/* Title Section - Compressed */}
        <div className="title-section">
          <div className="title-wrapper">
            <h1 className={`game-title ${isGlowEnabled ? 'with-glow' : ''}`}>
              ECHO
            </h1>
            {isGlowEnabled && (
              <div className="title-glow-effect">
                ECHO
              </div>
            )}
          </div>
          <h2 className={`game-subtitle ${isGlowEnabled ? 'with-cyan-shadow' : ''}`}>
            MATCH
          </h2>
          <p className="game-tagline">
            Infinite Memory
          </p>
        </div>

        {/* Stats Card - Compact */}
        <div className={`stats-card ${isGlowEnabled ? 'with-pulse-glow' : ''}`}>
          <div className="stat-row stat-row--with-margin">
            <div className="stat-label-group">
              <Zap className="stat-icon stat-icon--zap" />
              <span className="stat-label">High Score</span>
            </div>
            <span className="stat-value stat-value--high-score">
              {gameStats.highScore.toLocaleString()}
            </span>
          </div>
          <div className="stat-row">
            <div className="stat-label-group">
              <div className="stat-icon stat-icon--level"></div>
              <span className="stat-label">Best Level</span>
            </div>
            <span className="stat-value stat-value--best-level">
              {gameStats.bestLevel}
            </span>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="action-buttons">
          <Button
            onClick={handleStartGame}
            size="lg"
            className={`primary-button ${isGlowEnabled ? 'with-glow' : ''}`}
          >
            <Play className="w-5 h-5 mr-3" />
            Start Game
          </Button>
          
          <div className="secondary-buttons">
            <Button
              onClick={onToggleSound}
              variant="outline"
              size="lg"
              className={`secondary-button sound-toggle-button ${isGlowEnabled ? 'with-glow' : ''}`}
            >
              {isSoundEnabled ? <Volume2 className="sound-icon sound-icon--on" /> : <VolumeX className="sound-icon sound-icon--off" />}
              <span className="button-text button-text--desktop">{isSoundEnabled ? 'Sound On' : 'Sound Off'}</span>
              <span className="button-text button-text--mobile">{isSoundEnabled ? 'On' : 'Off'}</span>
            </Button>

            <Button
              onClick={toggleGlow}
              variant="outline"
              size="lg"
              className={`secondary-button glow-toggle-button ${isGlowEnabled ? 'glow-on' : 'glow-off'}`}
            >
              <Sparkles className="glow-icon" />
              <span className="button-text button-text--desktop">{isGlowEnabled ? 'Glow On' : 'Glow Off'}</span>
              <span className="button-text button-text--mobile">{isGlowEnabled ? 'On' : 'Off'}</span>
            </Button>
            
            <Button
              onClick={onShowHowToPlay}
              variant="outline"
              size="lg"
              className={`secondary-button help-button ${isGlowEnabled ? 'with-glow' : ''}`}
            >
              <HelpCircle className="help-icon" />
              <span className="button-text button-text--desktop">How to Play</span>
              <span className="button-text button-text--mobile">Help</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
