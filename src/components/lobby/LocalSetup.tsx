import { useState } from 'react';
import { Button } from '../ui';
import { MIN_PLAYERS, MAX_PLAYERS } from '../../constants';

interface LocalSetupProps {
  onStartGame: (playerNames: string[]) => void;
  onBack: () => void;
}

export function LocalSetup({ onStartGame, onBack }: LocalSetupProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3']);

  const addPlayer = () => {
    if (playerNames.length < MAX_PLAYERS) {
      setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > MIN_PLAYERS) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const canStart = playerNames.length >= MIN_PLAYERS && playerNames.every((name) => name.trim() !== '');

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
      <h1
        style={{
          color: 'white',
          fontSize: '36px',
          margin: '0 0 32px 0',
        }}
      >
        Local Game Setup
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
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          {playerNames.length} players ({MIN_PLAYERS}-{MAX_PLAYERS} allowed)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {playerNames.map((name, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => updatePlayerName(index, e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                }}
                placeholder={`Player ${index + 1}`}
              />
              {playerNames.length > MIN_PLAYERS && (
                <button
                  onClick={() => removePlayer(index)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#f44336',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                  }}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {playerNames.length < MAX_PLAYERS && (
          <Button
            variant="secondary"
            onClick={addPlayer}
            style={{ width: '100%', marginTop: '16px' }}
          >
            + Add Player
          </Button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '32px',
        }}
      >
        <Button variant="secondary" size="large" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="success"
          size="large"
          onClick={() => onStartGame(playerNames)}
          disabled={!canStart}
        >
          Start Game
        </Button>
      </div>
    </div>
  );
}
