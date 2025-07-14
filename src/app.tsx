import { createRoot } from 'react-dom/client';
import { LegacyToaster, Toaster as Sonner, TooltipProvider } from "./components/ui";
import "./components/ui/ui.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import HomePage from "./components/HomePage";
import GameScreen from "./components/GameScreen";
import HowToPlay from "./components/HowToPlay";
import { GameStats } from "./game-utils";
import "./index.css";


const queryClient = new QueryClient();

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    highScore: 0,
    bestLevel: 0,
    gamesPlayed: 0,
    totalScore: 0,
  });

  const handleStartGame = () => setCurrentScreen('game');
  const handleGoHome = () => setCurrentScreen('home');
  const handleToggleSound = () => setIsSoundEnabled(prev => !prev);
  const handleShowHowToPlay = () => setShowHowToPlay(true);
  const handleCloseHowToPlay = () => setShowHowToPlay(false);

  const handleUpdateStats = (score: number, level: number) => {
    setGameStats(prevStats => ({
      ...prevStats,
      highScore: Math.max(prevStats.highScore, score),
      bestLevel: Math.max(prevStats.bestLevel, level),
      gamesPlayed: prevStats.gamesPlayed + 1,
      totalScore: prevStats.totalScore + score,
    }));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LegacyToaster />
        <Sonner />
        {currentScreen === 'home' && (
          <HomePage 
            onStartGame={handleStartGame}
            onShowHowToPlay={handleShowHowToPlay}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={handleToggleSound}
            gameStats={gameStats}
          />
        )}
        {currentScreen === 'game' && (
          <GameScreen 
            onUpdateStats={handleUpdateStats}
            onGoHome={handleGoHome}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={handleToggleSound}
          />
        )}
        {showHowToPlay && (
          <HowToPlay onClose={handleCloseHowToPlay} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};



createRoot(document.getElementById("root")!).render(<App />);

export default App; 
