
import { useState, useCallback, useEffect, useMemo } from 'react';
import './GameTile.css';
import { Tile, WaveType } from '../types/game';

interface GameTileProps {
  tile: Tile;
  onClick: () => void;
  disabled: boolean;
  isGlowEnabled: boolean;
}

const GameTile = ({ tile, onClick, disabled, isGlowEnabled }: GameTileProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // WaveformSVG Component (inline)
  const WaveformSVG = ({ waveType, isAnimated, frequency, isGlowEnabled = true }: {
    waveType: WaveType;
    isAnimated: boolean;
    frequency: number;
    isGlowEnabled?: boolean;
  }) => {
    const [animationPhase, setAnimationPhase] = useState(0);

    useEffect(() => {
      if (!isAnimated) return;

      let animationId: number;
      const animate = () => {
        setAnimationPhase(prev => prev + 0.2);
        animationId = requestAnimationFrame(animate);
      };
      
      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }, [isAnimated]);

    const generatePath = useMemo(() => (type: WaveType, phase: number = 0) => {
      const points: string[] = [];
      const width = 140;
      const height = 80;
      const centerY = height / 2;
      const steps = 120;
      
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const normalizedX = (i / steps) * Math.PI * 6 + phase;
        let y = centerY;

        switch (type) {
          case 'sine':
            y = centerY + Math.sin(normalizedX) * 28;
            break;
          case 'square':
            y = centerY + (Math.sin(normalizedX) > 0 ? 28 : -28);
            break;
          case 'triangle':
            y = centerY + (2 / Math.PI) * Math.asin(Math.sin(normalizedX)) * 28;
            break;
          case 'sawtooth':
            y = centerY + ((normalizedX % (Math.PI * 2)) / (Math.PI * 2) - 0.5) * 56;
            break;
          case 'pulse':
            y = centerY + (Math.sin(normalizedX) > 0.8 ? 28 : -28);
            break;
          case 'echo':
            y = centerY + Math.sin(normalizedX) * Math.exp(-normalizedX * 0.15) * 28;
            break;
        }

        points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
      }

      return points.join(' ');
    }, []);

    const colors = useMemo(() => {
      const colorMap = {
        sine: { primary: '#06d6a0', secondary: '#059668', glow: 'rgba(6, 214, 160, 0.8)' },
        square: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.8)' },
        triangle: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.8)' },
        sawtooth: { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239, 68, 68, 0.8)' },
        pulse: { primary: '#22c55e', secondary: '#16a34a', glow: 'rgba(34, 197, 94, 0.8)' },
        echo: { primary: '#8b5cf6', secondary: '#7c3aed', glow: 'rgba(139, 92, 246, 0.8)' }
      };
      return colorMap[waveType];
    }, [waveType]);

    const currentPath = generatePath(waveType, isAnimated ? animationPhase : 0);

    return (
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 140 80" 
        className="waveform-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`gradient-${waveType}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
            <stop offset="50%" stopColor={colors.primary} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0.3" />
          </linearGradient>
          {isGlowEnabled && (
            <filter id={`glow-${waveType}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        <path
          d={currentPath}
          stroke={`url(#gradient-${waveType})`}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={isAnimated && isGlowEnabled ? `url(#glow-${waveType})` : undefined}
          className="waveform-path"
        />
        
        {isAnimated && isGlowEnabled && (
          <>
            <path
              d={currentPath}
              stroke={colors.primary}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
              className="waveform-glow-path"
            />
            <path
              d={currentPath}
              stroke={colors.secondary}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
              className="waveform-secondary-path"
            />
          </>
        )}
      </svg>
    );
  };

  const handleClick = useCallback(() => {
    if (disabled || tile.isFlipped || tile.isMatched) return;
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    onClick();
  }, [disabled, tile.isFlipped, tile.isMatched, onClick]);

  return (
    <div
      className={`
        memory-tile
        ${tile.isFlipped ? 'is-flipped' : ''}
        ${tile.isMatched ? 'is-matched' : ''}
        ${disabled ? 'is-disabled' : ''}
        ${isGlowEnabled ? 'with-glow' : ''}
        ${isAnimating ? 'is-animating' : ''}
      `}
      onClick={handleClick}
    >
      {/* Back of tile (when not flipped) */}
      <div className="tile-face tile-back">
        <div className="back-icon-wrapper">
          <div className={`back-icon ${isGlowEnabled ? 'with-glow' : ''}`}>
            <div className="back-icon-dot"></div>
          </div>
          <div className="back-icon-ring"></div>
          {isGlowEnabled && <div className="back-icon-glow"></div>}
        </div>
      </div>

      {/* Front of tile (when flipped) */}
      <div className="tile-face tile-front">
        <div className="front-content">
          <div className="waveform-wrapper">
            <WaveformSVG 
              waveType={tile.waveType} 
              isAnimated={tile.isFlipped || tile.isMatched}
              frequency={tile.frequency}
              isGlowEnabled={isGlowEnabled}
            />
          </div>
          <div className="waveform-name">
            {tile.waveType}
          </div>
        </div>
      </div>

      {/* Reduced glow effect for matched tiles */}
      {tile.isMatched && isGlowEnabled && (
        <div className="matched-glow"></div>
      )}
    </div>
  );
};

export default GameTile;
