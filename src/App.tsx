import { useState } from 'react';
import { GameProvider, useGameContext } from './context';
import { MainMenu, LocalSetup, SinglePlayerSetup, OnlineLobby, HowToPlay } from './components/lobby';
import { LocalGame, SinglePlayerGame } from './pages';
import type { AIDifficulty } from './game';
import './styles/variables.css';
import './styles/cards.css';
import './styles/animations.css';

type Screen = 'menu' | 'singlePlayerSetup' | 'singlePlayerGame' | 'localSetup' | 'localGame' | 'onlineLobby' | 'howToPlay';

interface SinglePlayerConfig {
  playerName: string;
  aiCount: number;
  difficulty: AIDifficulty;
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [singlePlayerConfig, setSinglePlayerConfig] = useState<SinglePlayerConfig | null>(null);
  const { dispatch } = useGameContext();

  const handleStartLocalGame = (playerNames: string[]) => {
    dispatch({ type: 'START_GAME', playerNames });
    setScreen('localGame');
  };

  const handleStartSinglePlayerGame = (playerName: string, aiCount: number, difficulty: AIDifficulty) => {
    setSinglePlayerConfig({ playerName, aiCount, difficulty });
    setScreen('singlePlayerGame');
  };

  const handleMainMenu = () => {
    dispatch({ type: 'RESET_GAME' });
    setSinglePlayerConfig(null);
    setScreen('menu');
  };

  switch (screen) {
    case 'menu':
      return (
        <MainMenu
          onSinglePlayer={() => setScreen('singlePlayerSetup')}
          onLocalGame={() => setScreen('localSetup')}
          onOnlineGame={() => setScreen('onlineLobby')}
          onHowToPlay={() => setScreen('howToPlay')}
        />
      );

    case 'singlePlayerSetup':
      return (
        <SinglePlayerSetup
          onStartGame={handleStartSinglePlayerGame}
          onBack={() => setScreen('menu')}
        />
      );

    case 'singlePlayerGame':
      return singlePlayerConfig ? (
        <SinglePlayerGame
          playerName={singlePlayerConfig.playerName}
          aiCount={singlePlayerConfig.aiCount}
          difficulty={singlePlayerConfig.difficulty}
          onMainMenu={handleMainMenu}
        />
      ) : null;

    case 'localSetup':
      return (
        <LocalSetup
          onStartGame={handleStartLocalGame}
          onBack={() => setScreen('menu')}
        />
      );

    case 'localGame':
      return <LocalGame onMainMenu={handleMainMenu} />;

    case 'onlineLobby':
      return <OnlineLobby onBack={() => setScreen('menu')} />;

    case 'howToPlay':
      return <HowToPlay onBack={() => setScreen('menu')} />;

    default:
      return null;
  }
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
