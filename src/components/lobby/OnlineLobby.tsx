import { useState } from 'react';
import { Button } from '../ui';
import { useOnlineGame } from '../../hooks';
import { OnlineGameBoard } from '../game/OnlineGameBoard';

interface OnlineLobbyProps {
  onBack: () => void;
}

export function OnlineLobby({ onBack }: OnlineLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'waiting' | 'playing'>('menu');

  const {
    connectionState,
    roomCode,
    playerId,
    players,
    gameState,
    isHost,
    error,
    isMyTurn,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    playCards,
    pickupPyre,
    flipFaceDown,
  } = useOnlineGame();

  const handleCreateRoom = () => {
    createRoom(playerName);
    setMode('waiting');
  };

  const handleJoinRoom = () => {
    joinRoom(roomCodeInput, playerName);
    setMode('waiting');
  };

  const handleBack = () => {
    if (mode === 'waiting' || mode === 'playing') {
      leaveRoom();
    }
    setMode('menu');
  };

  const handleMainMenu = () => {
    leaveRoom();
    onBack();
  };

  // If game has started, show game board
  if (gameState && gameState.phase !== 'setup') {
    return (
      <OnlineGameBoard
        gameState={gameState}
        isMyTurn={isMyTurn}
        onPlayCards={playCards}
        onPickupPyre={pickupPyre}
        onFlipFaceDown={flipFaceDown}
        onMainMenu={handleMainMenu}
      />
    );
  }

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
        Online Game
      </h1>

      {error && (
        <div
          style={{
            background: '#f44336',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {mode === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
              }}
            />
            <Button
              variant="primary"
              size="large"
              onClick={handleCreateRoom}
              disabled={!playerName.trim()}
            >
              Create Room
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={() => setMode('join')}
              disabled={!playerName.trim()}
            >
              Join Room
            </Button>
          </div>
        )}

        {mode === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ color: 'white', marginBottom: '8px' }}>
              Enter room code to join:
            </div>
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="Room code"
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '20px',
                textAlign: 'center',
                letterSpacing: '4px',
              }}
              maxLength={6}
            />
            <Button
              variant="success"
              size="large"
              onClick={handleJoinRoom}
              disabled={roomCodeInput.length < 4}
            >
              Join Game
            </Button>
            <Button variant="secondary" onClick={() => setMode('menu')}>
              Back
            </Button>
          </div>
        )}

        {mode === 'waiting' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Room Code
              </div>
              <div
                style={{
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  letterSpacing: '4px',
                }}
              >
                {roomCode || 'Connecting...'}
              </div>
            </div>

            <div style={{ color: 'white', marginBottom: '8px' }}>
              Players ({players.length + (isHost ? 1 : 0)}/8):
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isHost && (
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: 'white',
                  }}
                >
                  {playerName} (Host)
                </div>
              )}
              {players.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    color: 'white',
                  }}
                >
                  {p.name}
                  {p.id === playerId && ' (You)'}
                </div>
              ))}
            </div>

            {isHost && (
              <Button
                variant="success"
                size="large"
                onClick={startGame}
                disabled={players.length < 2}
              >
                Start Game ({players.length + 1} players)
              </Button>
            )}

            {!isHost && (
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                Waiting for host to start the game...
              </div>
            )}

            <Button variant="secondary" onClick={handleBack}>
              Leave Room
            </Button>
          </div>
        )}
      </div>

      {mode !== 'waiting' && (
        <div style={{ marginTop: '32px' }}>
          <Button variant="secondary" size="large" onClick={onBack}>
            Main Menu
          </Button>
        </div>
      )}

      {connectionState === 'connecting' && (
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: '16px' }}>
          Connecting to server...
        </div>
      )}
    </div>
  );
}
