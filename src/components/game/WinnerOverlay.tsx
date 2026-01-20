import type { Player } from '../../types';
import { Button } from '../ui';

interface WinnerOverlayProps {
  winner: Player;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function WinnerOverlay({ winner, onPlayAgain, onMainMenu }: WinnerOverlayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          padding: '48px 64px',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
        className="animate-celebrate"
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}
        >
          🎉
        </div>
        <h1
          style={{
            color: 'white',
            fontSize: '36px',
            margin: '0 0 8px 0',
          }}
        >
          Winner!
        </h1>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '24px',
            margin: '0 0 32px 0',
          }}
        >
          {winner.name} wins the game!
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button variant="primary" size="large" onClick={onPlayAgain}>
            Play Again
          </Button>
          <Button variant="secondary" size="large" onClick={onMainMenu}>
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
