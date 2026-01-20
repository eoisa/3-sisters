import { Button } from '../ui';

interface MainMenuProps {
  onSinglePlayer: () => void;
  onLocalGame: () => void;
  onOnlineGame: () => void;
  onHowToPlay: () => void;
}

export function MainMenu({ onSinglePlayer, onLocalGame, onOnlineGame, onHowToPlay }: MainMenuProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d0f 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}
      >
        <h1
          style={{
            color: 'white',
            fontSize: '64px',
            margin: '0 0 16px 0',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          3 Sisters
        </h1>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '18px',
            margin: 0,
          }}
        >
          A classic card game for 3-8 players
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '300px',
        }}
      >
        <Button variant="primary" size="large" onClick={onSinglePlayer}>
          Single Player
        </Button>
        <Button variant="secondary" size="large" onClick={onLocalGame}>
          Local Game
        </Button>
        <Button variant="secondary" size="large" onClick={onOnlineGame}>
          Online Game
        </Button>
        <Button variant="secondary" size="large" onClick={onHowToPlay}>
          How to Play
        </Button>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '14px',
        }}
      >
        Made with cards and code
      </div>
    </div>
  );
}
