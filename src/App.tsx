import { useState } from 'react';
import { GameProvider, useGameContext } from './context';
import { MainMenu, LocalSetup, OnlineLobby, HowToPlay } from './components/lobby';
import { LocalGame } from './pages';
import './styles/variables.css';
import './styles/cards.css';
import './styles/animations.css';

type Screen = 'menu' | 'localSetup' | 'localGame' | 'onlineLobby' | 'howToPlay';

function AppContent() {
  const [screen, setScreen] = useState<Screen>('menu');
  const { dispatch } = useGameContext();

  const handleStartLocalGame = (playerNames: string[]) => {
    dispatch({ type: 'START_GAME', playerNames });
    setScreen('localGame');
  };

  const handleMainMenu = () => {
    dispatch({ type: 'RESET_GAME' });
    setScreen('menu');
  };

  switch (screen) {
    case 'menu':
      return (
        <MainMenu
          onLocalGame={() => setScreen('localSetup')}
          onOnlineGame={() => setScreen('onlineLobby')}
          onHowToPlay={() => setScreen('howToPlay')}
        />
      );

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
