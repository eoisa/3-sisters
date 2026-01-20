import { useState } from 'react';
import { Button } from '../ui';
import type { AIDifficulty } from '../../game';

interface SinglePlayerSetupProps {
  onStartGame: (playerName: string, aiCount: number, difficulty: AIDifficulty) => void;
  onBack: () => void;
}

export function SinglePlayerSetup({ onStartGame, onBack }: SinglePlayerSetupProps) {
  const [playerName, setPlayerName] = useState('Player');
  const [aiCount, setAiCount] = useState(3);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

  const canStart = playerName.trim() !== '';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d0f 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
      }}
    >
      <h1 style={{ color: 'white', fontSize: '36px', margin: '0 0 32px 0' }}>
        Single Player
      </h1>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
            placeholder="Enter your name"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Number of AI Opponents: {aiCount}
          </label>
          <input
            type="range"
            min={2}
            max={7}
            value={aiCount}
            onChange={(e) => setAiCount(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
            <span>2</span>
            <span>7</span>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', display: 'block', marginBottom: '12px' }}>
            Difficulty
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: difficulty === d ? '#4caf50' : 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', marginBottom: '20px' }}>
          Total players: {aiCount + 1} (You + {aiCount} AI)
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <Button variant="secondary" size="large" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="success"
          size="large"
          onClick={() => onStartGame(playerName, aiCount, difficulty)}
          disabled={!canStart}
        >
          Start Game
        </Button>
      </div>
    </div>
  );
}
