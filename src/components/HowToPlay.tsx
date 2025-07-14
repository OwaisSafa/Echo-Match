import { Button } from "@/components/ui";
import { X, Play, Target, Zap, Sparkles } from 'lucide-react';
import './HowToPlay.css';

interface HowToPlayProps {
  onClose: () => void;
}

const HowToPlay = ({ onClose }: HowToPlayProps) => {
  return (
    <div className="how-to-play-overlay" onClick={onClose}>
      <div className="how-to-play-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">How to Play</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="close-button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="modal-content">
          <div className="rule-section">
            <div className="rule-icon">
              <Play className="w-5 h-5" />
            </div>
            <div className="rule-text">
              <h3>Match the Tiles</h3>
              <p>Find and click on matching pairs of tiles to clear them from the board.</p>
            </div>
          </div>
          
          <div className="rule-section">
            <div className="rule-icon">
              <Target className="w-5 h-5" />
            </div>
            <div className="rule-text">
              <h3>Complete the Level</h3>
              <p>Clear all tiles to advance to the next level with more tiles and complexity.</p>
            </div>
          </div>
          
          <div className="rule-section">
            <div className="rule-icon">
              <Zap className="w-5 h-5" />
            </div>
            <div className="rule-text">
              <h3>Score Points</h3>
              <p>Earn points for each match. Faster matches and combos give bonus points!</p>
            </div>
          </div>
          
          <div className="rule-section">
            <div className="rule-icon">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="rule-text">
              <h3>Special Features</h3>
              <p>Toggle sound effects and visual glow effects to enhance your gaming experience.</p>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button onClick={onClose} className="start-button">
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay; 