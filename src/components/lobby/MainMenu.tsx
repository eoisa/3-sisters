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
        <img
          src="/favicon.png"
          alt="3 Sisters Logo"
          style={{
            width: '160px',
            height: '160px',
            marginBottom: '24px',
          }}
        />
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
          textAlign: 'center',
        }}
      >
        <div>Made with cards and code</div>
        <a
          href="https://github.com/eoisa/3-sisters"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  );
}
